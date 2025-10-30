import type { NormalizedOffer } from "./types";

const turkishNumberMap: Record<string, number> = {
  sıfır: 0,
  bir: 1,
  iki: 2,
  üç: 3,
  dört: 4,
  bes: 5,
  beş: 5,
  altı: 6,
  yedi: 7,
  sekiz: 8,
  dokuz: 9,
  on: 10,
  yirmi: 20,
  otuz: 30,
  kırk: 40,
  kirk: 40,
  elli: 50,
  altmış: 60,
  altmis: 60,
  yetmiş: 70,
  yetmis: 70,
  seksen: 80,
  doksan: 90,
  yüz: 100,
  yuz: 100,
  bin: 1000,
  milyon: 1_000_000,
  milyar: 1_000_000_000,
};

function normaliseToken(token: string) {
  return token
    .normalize("NFD")
    .replace(/ı/g, "i")
    .replace(/ş/g, "s")
    .replace(/ğ/g, "g")
    .replace(/ü/g, "u")
    .replace(/ö/g, "o")
    .replace(/ç/g, "c")
    .replace(/[^a-z]/g, "");
}

function parseTurkishWords(input: string): number | null {
  const cleaned = input
    .toLowerCase()
    .replace(/[,\.]/g, " ")
    .replace(/tl|turk lirasi|lira|try|tlye|tl\'dir|liradir/gi, " ")
    .replace(/ ve /g, " ")
    .split(/\s+/)
    .map(normaliseToken)
    .filter(Boolean);

  if (!cleaned.length) {
    return null;
  }

  let total = 0;
  let current = 0;
  let hasKnownToken = false;

  for (const token of cleaned) {
    if (!(token in turkishNumberMap)) {
      continue;
    }
    hasKnownToken = true;
    const value = turkishNumberMap[token];
    if (value === 1_000_000_000 || value === 1_000_000 || value === 1000) {
      current = (current || 1) * value;
      total += current;
      current = 0;
    } else if (value === 100) {
      current = (current || 1) * value;
    } else {
      current += value;
    }
  }

  if (!hasKnownToken) {
    return null;
  }

  return total + current;
}

function createId() {
  if (typeof crypto !== "undefined" && "randomUUID" in crypto && typeof crypto.randomUUID === "function") {
    return crypto.randomUUID();
  }
  return `offer-${Date.now().toString(16)}-${Math.random().toString(16).slice(2, 10)}`;
}

const currencyWords = [
  "tl",
  "try",
  "türk lirası",
  "lira",
  "₺",
  "tl'dir",
  "tldir",
];

function cleanCurrencyTokens(input: string) {
  return currencyWords.reduce(
    (acc, token) => acc.replace(new RegExp(token, "gi"), ""),
    input,
  );
}

function normaliseNumericToken(token: string): number | null {
  const trimmed = cleanCurrencyTokens(token)
    .replace(/[^0-9,.-]/g, "")
    .replace(/\s+/g, "")
    .replace(/^-/, "-");

  if (!trimmed || trimmed === "-" || trimmed === "." || trimmed === ",") {
    return null;
  }

  const lastDot = trimmed.lastIndexOf(".");
  const lastComma = trimmed.lastIndexOf(",");
  const dotCount = (trimmed.match(/\./g) ?? []).length;
  const commaCount = (trimmed.match(/,/g) ?? []).length;

  let normalized = trimmed;

  if (dotCount > 0 && commaCount > 0) {
    const decimalSeparator = lastComma > lastDot ? "," : ".";
    const thousandSeparator = decimalSeparator === "," ? "." : ",";
    normalized = normalized
      .split("")
      .filter((char) => {
        if (char === thousandSeparator) {
          return false;
        }
        if (char === decimalSeparator) {
          return true;
        }
        return true;
      })
      .join("")
      .replace(decimalSeparator, ".");
  } else if (commaCount > 0) {
    if (commaCount > 1) {
      const parts = normalized.split(",");
      const decimals = parts.pop();
      normalized = parts.join("").concat(".", decimals ?? "");
    } else {
      normalized = normalized.replace(",", ".");
    }
  } else if (dotCount > 0) {
    if (dotCount > 1) {
      normalized = normalized.replace(/\./g, "");
    } else {
      const [integerPart, decimalPart = ""] = normalized.split(".");
      const looksLikeThousandSeparator = decimalPart.length === 3;

      if (looksLikeThousandSeparator) {
        normalized = integerPart.concat(decimalPart);
      }
    }
  }

  const parsed = Number.parseFloat(normalized);
  if (Number.isFinite(parsed)) {
    return parsed;
  }

  return null;
}

export function fallbackParseOffers(rawInput: string): NormalizedOffer[] {
  const lines = rawInput
    .split(/[\r\n;]+/)
    .map((line) => line.trim())
    .filter(Boolean)
    // "Geçersiz teklif" satırlarını ele
    .filter((line) => {
      const lowerLine = line.toLocaleLowerCase('tr-TR');
      return !lowerLine.includes('geçersiz');
    });

  if (!lines.length) {
    return [];
  }

  return lines.map((line) => {
    // Improved regex to capture monetary amounts with thousands separators
    // Matches patterns like: 38.700, 44.000,50, 1.234.567,89, etc.
    const numericTokens = line.match(/\d{1,3}(?:[.,]\d{3})*(?:[.,]\d{1,2})?/g) ?? [];

    let bestValue: number | null = null;
    for (const token of numericTokens) {
      const parsed = normaliseNumericToken(token);
      if (parsed === null) {
        continue;
      }

      // Prefer larger values as they're more likely to be the actual offer amount
      if (bestValue === null || parsed > bestValue) {
        bestValue = parsed;
      }
    }

    let value = bestValue;

    if (value === null) {
      value = parseTurkishWords(line);
    }

    const warnings: string[] = [];
    if (value === null) {
      warnings.push("Sayısal değer tespit edilemedi");
    }

    let confidence = 0;
    if (value !== null) {
      const fromNumericToken = numericTokens.some((token) => Number.isFinite(Number.parseFloat(token.replace(/[\s₺]/g, ""))));
      confidence = warnings.length ? 55 : fromNumericToken ? 82 : 70;
    }

    return {
      id: createId(),
      raw: line,
      value,
      source: "manual",
      confidence,
      warnings: warnings.length ? warnings : undefined,
    } satisfies NormalizedOffer;
  });
}
