import { NextResponse } from "next/server";
import {
  GEMINI_MODEL,
  NORMALIZATION_PROMPT_HEADER,
} from "@/lib/constants";
import { fallbackParseOffers } from "@/lib/parse";
import { rateLimit } from "@/lib/rate-limit";
import { writeAuditLog } from "@/lib/audit";
import type { NormalizationResponse, NormalizedOffer } from "@/lib/types";
import { normalizationRequestSchema } from "@/lib/validation";
// Cache devre dışı bırakıldı - her hesaplama fresh yapılacak

interface GeminiResult {
  offers: NormalizedOffer[];
  durationMs: number;
  usedFallback: boolean;
}

function sanitizeJsonPayload(text: string) {
  return text.replace(/```json/gi, "").replace(/```/g, "").trim();
}

function parseAiOutput(text: string, rawInput: string): NormalizedOffer[] {
  const sanitized = sanitizeJsonPayload(text);
  
  // "Geçersiz teklif" satırlarını filtrele
  const filteredInput = rawInput
    .split(/\r?\n/)
    .filter(line => !line.toLocaleLowerCase('tr-TR').includes('geçersiz'))
    .join('\n');
    
  const fallbackOffers = fallbackParseOffers(filteredInput);

  try {
    const json = JSON.parse(sanitized) as {
      offers?: Array<{
        raw?: string;
        value?: number | string | null;
        confidence?: number;
        warnings?: string[];
      }>;
    };

    if (!Array.isArray(json.offers)) {
      throw new Error("Geçersiz JSON yapısı");
    }

    const rawLines = rawInput.split(/\r?\n/).filter(Boolean);

    return json.offers.map((offer, index) => {
      const fallback = fallbackOffers[index];

      const warnings = Array.isArray(offer.warnings)
        ? offer.warnings.filter((warning) => typeof warning === "string" && warning.trim().length > 0)
        : fallback?.warnings;

      return {
        id: fallback?.id ?? crypto.randomUUID(),
        raw: offer.raw ?? fallback?.raw ?? rawLines[index] ?? "",
        value: fallback?.value ?? null,
        source: fallback?.source ?? "manual",
        confidence: fallback?.confidence ?? (fallback?.value !== null ? 85 : 0),
        warnings: warnings?.length ? warnings : undefined,
      } satisfies NormalizedOffer;
    });
  } catch (error) {
    console.warn("AI JSON parse failed, fallback parser devrede", error);
    return fallbackParseOffers(rawInput);
  }
}

async function callGemini(
  rawInput: string,
  expectedCount: number | undefined,
): Promise<GeminiResult> {
  const startedAt = Date.now();
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      offers: fallbackParseOffers(rawInput),
      durationMs: Date.now() - startedAt,
      usedFallback: true,
    };
  }

  // "Geçersiz teklif" içeren satırları filtrele
  const filteredInput = rawInput
    .split(/\r?\n/)
    .filter(line => !line.toLocaleLowerCase('tr-TR').includes('geçersiz'))
    .join('\n');

  const prompt = `${NORMALIZATION_PROMPT_HEADER}

Beklenen teklif adedi: ${expectedCount ?? "bilinmiyor"}

Veri:
${filteredInput}`;

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 25_000);

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        signal: controller.signal,
        body: JSON.stringify({
          contents: [
            {
              role: "user",
              parts: [{ text: prompt }],
            },
          ],
          generationConfig: {
            responseMimeType: "application/json",
            temperature: 0.1,  // Düşük temperature = daha tutarlı sonuçlar
            topK: 1,           // En olası seçeneği seç
            topP: 0.1,         // Dar olasılık aralığı
          },
        }),
      },
    );

    if (!response.ok) {
      throw new Error(`Gemini API hatası: ${response.status}`);
    }

    const data = (await response.json()) as {
      candidates?: Array<{
        content?: { parts?: Array<{ text?: string }> };
      }>;
    };

    const text = data.candidates?.[0]?.content?.parts
      ?.map((part) => part.text)
      .filter(Boolean)
      .join("\n");

    if (!text) {
      throw new Error("Gemini yanıtı boş döndü");
    }

    return {
      offers: parseAiOutput(text, rawInput),
      durationMs: Date.now() - startedAt,
      usedFallback: false,
    };
  } catch (error) {
    console.error("Gemini normalizasyon hatası", error);
    return {
      offers: fallbackParseOffers(rawInput),
      durationMs: Date.now() - startedAt,
      usedFallback: true,
    };
  } finally {
    clearTimeout(timeout);
  }
}

async function loadOffers(
  rawInput: string,
  expectedCount: number | undefined,
) {
  // Cache tamamen devre dışı - her zaman fresh hesaplama yapılacak
  const result = await callGemini(rawInput, expectedCount);
  return result;
}

export async function POST(request: Request) {
  try {
    // API Key kontrolü (middleware'den taşındı)
    const API_KEY = process.env.API_ACCESS_KEY;
    if (API_KEY) {
      const headerKey = request.headers.get("x-api-key") ?? request.headers.get("authorization");
      if (!headerKey || headerKey.replace(/^Bearer\s+/i, "") !== API_KEY) {
        return NextResponse.json(
          { message: "Yetkisiz erişim" },
          { status: 401, headers: { "Content-Type": "application/json" } }
        );
      }
    }

    const ipHeader = request.headers.get("x-forwarded-for") ?? request.headers.get("x-real-ip") ?? null;
    const clientIp = ipHeader?.split(",")[0]?.trim() ?? null;
    const limit = rateLimit(clientIp);
    if (!limit.allowed) {
      await writeAuditLog({
        event: "normalize.rate_limited",
        ip: clientIp,
        level: "warn",
        meta: { retryAfter: limit.retryAfter },
      });
      return NextResponse.json(
        {
          message: "İstek sınırı aşıldı",
          details: "Lütfen kısa bir süre sonra tekrar deneyin",
        },
        {
          status: 429,
          headers: limit.retryAfter ? { "Retry-After": String(limit.retryAfter) } : undefined,
        },
      );
    }

    let json;
    try {
      json = await request.json();
    } catch (error) {
      return NextResponse.json(
        {
          message: "Geçersiz JSON formatı",
          details: "İstek gövdesi JSON formatında olmalıdır",
        },
        { status: 400 },
      );
    }

    let payload;
    try {
      payload = normalizationRequestSchema.parse(json);
    } catch (error) {
      return NextResponse.json(
        {
          message: "Doğrulama hatası",
          details: error instanceof Error ? error.message : "Geçersiz istek parametreleri",
        },
        { status: 400 },
      );
    }

    const { offers, durationMs, usedFallback } = await loadOffers(payload.rawInput, payload.expectedCount);
    const detectedCount = offers.filter((offer) => offer.value !== null).length;
    const confidenceAvg = offers.length
      ? offers.reduce((acc, offer) => acc + (offer.confidence ?? 0), 0) / offers.length
      : 0;

    const response: NormalizationResponse = {
      offers,
      rawCount: offers.length,
      detectedCount,
      confidence: Number.isFinite(confidenceAvg)
        ? Math.max(0, Math.min(100, Number(confidenceAvg.toFixed(2))))
        : 0,
      notes:
        payload.expectedCount && payload.expectedCount !== offers.length
          ? `Beklenen teklif sayısı (${payload.expectedCount}) ile AI çıktısı (${offers.length}) uyuşmuyor.`
          : undefined,
      durationMs,
    };

    await writeAuditLog({
      event: "normalize.success",
      ip: clientIp,
      meta: {
        detectedCount,
        rawCount: response.rawCount,
        confidence: Number.isFinite(response.confidence) ? Number(response.confidence.toFixed(2)) : undefined,
        durationMs,
        usedFallback,
      },
    });

    const headers: Record<string, string> = {};
    if (limit.remaining !== undefined) {
      headers["X-RateLimit-Remaining"] = String(limit.remaining);
    }

    return NextResponse.json(response, { status: 200, headers });
  } catch (error) {
    if (error instanceof Error) {
      await writeAuditLog({
        event: "normalize.failure",
        level: "error",
        meta: { message: error.message },
      });
      return NextResponse.json(
        {
          message: "Normalizasyon başarısız",
          details: error.message,
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        message: "Normalizasyon başarısız",
      },
      { status: 400 },
    );
  }
}
