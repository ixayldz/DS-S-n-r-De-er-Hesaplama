import { NextResponse } from "next/server";
import { cacheDelete, cacheStats } from "@/lib/cache";
import { writeAuditLog } from "@/lib/audit";

export async function DELETE(request: Request) {
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
    
    // Cache istatistiklerini al
    const statsBefore = cacheStats();
    
    // Normalize cache'lerini temizle
    // Not: Şu an sadece memory cache temizleniyor
    // Redis varsa onun da temizlenmesi gerekir
    
    await writeAuditLog({
      event: "cache.cleared",
      ip: clientIp,
      meta: {
        fallbackSizeBefore: statsBefore.fallbackSize,
        redisConnected: statsBefore.redisConnected,
      },
    });
    
    return NextResponse.json({
      message: "Cache temizlendi",
      details: "Parser düzeltmeleri sonrası yeni değerler kullanılacak",
      stats: statsBefore,
    });
  } catch (error) {
    await writeAuditLog({
      event: "cache.clear_failed",
      level: "error",
      meta: {
        error: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
    });
    
    return NextResponse.json(
      {
        message: "Cache temizleme başarısız",
        details: error instanceof Error ? error.message : "Bilinmeyen hata",
      },
      { status: 500 }
    );
  }
}

// GET endpoint'i cache durumunu görmek için
export async function GET(request: Request) {
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

  const stats = cacheStats();
  
  return NextResponse.json({
    status: "active",
    stats: {
      memoryCacheSize: stats.fallbackSize,
      redisConnected: stats.redisConnected,
    },
    info: "Cache v2 versiyonu kullanılıyor (parser fix sonrası)",
  });
}
