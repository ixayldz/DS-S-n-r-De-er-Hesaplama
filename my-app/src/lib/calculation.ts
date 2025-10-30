import type {
  CalculationInputs,
  CalculationResult,
  NormalizedOffer,
  OfferWithAnalysis,
} from "./types";

function ensureNumericOffers(offers: NormalizedOffer[]): NormalizedOffer[] {
  return offers.filter((offer) => {
    if (offer.value === null || Number.isNaN(offer.value)) {
      return false;
    }
    return offer.value > 0;
  });
}

function computeSigma(values: number[], mean: number): number {
  if (values.length <= 1) {
    return 0;
  }

  const variance =
    values.reduce((acc, value) => acc + (value - mean) ** 2, 0) /
    (values.length - 1);

  return Math.sqrt(variance);
}

function computeK(c: number): number {
  // Kanun 45.1.1'e göre K katsayısı hesaplaması
  if (c < 0.6) {
    // C < 0.60 → K = 0.60 (sabit)
    return 0.6;
  }

  if (c <= 1) {
    // 0.60 ≤ C ≤ 1.00 → K = (3.2×C - C² - 0.6) / (C + 1)
    return (3.2 * c - c * c - 0.6) / (c + 1);
  }

  // C > 1.00 → K = (C² - 0.8×C + 1.4) / (C + 1)
  return (c * c - 0.8 * c + 1.4) / (c + 1);
}

function normalizeCoefficient(value: number): number {
  if (!Number.isFinite(value)) {
    return value;
  }

  // Standart matematiksel yuvarlama: 3 ondalık basamağa yuvarla
  // 0.5 ve üzeri → yukarı, 0.5'ten küçük → aşağı
  return Math.round(value * 1000) / 1000;
}

interface CalculationContext {
  messages: string[];
  warnings: string[];
}

function annotateOffers(
  offers: NormalizedOffer[],
  mean: number,
  sigma: number,
  sd: number,
): OfferWithAnalysis[] {
  const lower = mean - sigma;
  const upper = mean + sigma;

  return offers.map((offer) => {
    if (offer.value === null) {
      return {
        ...offer,
        status: "excluded",
      } satisfies OfferWithAnalysis;
    }

    const withinStdDev = offer.value >= lower && offer.value <= upper;
    const status = offer.value < sd ? "out-of-range" : withinStdDev ? "in-range" : "pending";

    return {
      ...offer,
      distanceFromMean: Math.abs(offer.value - mean),
      withinStdDev,
      status,
    } satisfies OfferWithAnalysis;
  });
}

export function calculateBoundary({
  approxCost,
  offers,
  nCoefficient,
}: CalculationInputs): CalculationResult {
  if (!Number.isFinite(approxCost) || approxCost <= 0) {
    throw new Error("Yaklaşık maliyet pozitif olmalıdır");
  }

  if (!Number.isFinite(nCoefficient) || nCoefficient <= 0) {
    throw new Error("N katsayısı sıfırdan büyük olmalıdır");
  }

  const context: CalculationContext = {
    messages: [],
    warnings: [],
  };

  const usableOffers = ensureNumericOffers(offers);
  if (usableOffers.length < 3) {
    throw new Error("En az 3 geçerli teklif gereklidir");
  }

  // Kanun 45.1.1: Yaklaşık maliyetin %120'sinin üzerindeki ve %40'ının altındaki teklifler dikkate alınmaksızın
  const lowerLimit = approxCost * 0.40;
  const upperLimit = approxCost * 1.20;
  
  const validOffers = usableOffers.filter((offer) => {
    const value = offer.value ?? 0;
    return value >= lowerLimit && value <= upperLimit;
  });

  const excludedByLimits = usableOffers.length - validOffers.length;
  if (excludedByLimits > 0) {
    context.messages.push(
      `Yaklaşık maliyetin %40-%120 aralığı dışındaki ${excludedByLimits} teklif hesaplamaya dahil edilmedi.`
    );
  }

  if (validOffers.length === 0) {
    throw new Error("Yaklaşık maliyetin %40-%120 aralığında teklif bulunamadı");
  }

  const values = validOffers.map((offer) => offer.value ?? 0);
  const offerCount = values.length;
  const tort1 = values.reduce((acc, value) => acc + value, 0) / offerCount;
  const sigma = computeSigma(values, tort1);

  if (sigma === 0) {
    context.warnings.push(
      "Tekliflerin tamamı aynı değerde. Standart sapma 0 olduğundan tüm teklifler geçerli kabul edildi.",
    );
  }

  const lower = tort1 - sigma;
  const upper = tort1 + sigma;

  const filtered = validOffers.filter((offer) => {
    if (sigma === 0) {
      return true;
    }
    const value = offer.value ?? 0;
    return value >= lower && value <= upper;
  });

  if (!filtered.length) {
    throw new Error("Standart sapma aralığında teklif bulunamadı");
  }

  const filteredValues = filtered.map((offer) => offer.value ?? 0);
  const tort2 = filteredValues.reduce((acc, value) => acc + value, 0) / filteredValues.length;
  const rawC = tort2 / approxCost;
  const coefficientC = normalizeCoefficient(rawC);

  if (rawC < 0.5) {
    context.warnings.push(
      "C katsayısı 0.5'in altında. Yaklaşık maliyeti veya teklif verilerini yeniden kontrol edin.",
    );
  }

  // K hesaplamasında yuvarlanmış C değerini kullan
  const rawK = computeK(coefficientC);
  const coefficientK = normalizeCoefficient(rawK);

  // K katsayısı artık 1'e sabitlenmediği için bu kontrol güncellendi
  if (rawC > 1) {
    context.messages.push(
      `C > 1 olduğu için K katsayısı formüle göre ${coefficientK.toFixed(3)} olarak hesaplandı.`,
    );
  }

  const denominator = coefficientC * nCoefficient;
  const sd = denominator > 0 ? (coefficientK * tort2) / denominator : Number.NaN;

  if (!Number.isFinite(sd)) {
    throw new Error("Sınır değeri hesaplanamadı. Girdileri kontrol edin.");
  }

  const annotatedOffers = annotateOffers(validOffers, tort1, sigma, sd);
  const excludedCount = offers.length - validOffers.length;
  if (excludedCount > 0) {
    context.warnings.push(`${excludedCount} teklif sayısal olmadığı için hesaplamaya alınmadı.`);
  }

  const warnings = [...context.warnings];
  const dataQualityScore = Math.max(40, 100 - excludedCount * 10 - warnings.length * 5);

  return {
    summary: {
      sd,
      filteredCount: filtered.length,
      offerCount,
      approxCost,
      coefficientC,
      coefficientK,
      tort1,
      tort2,
      sigma,
      nCoefficient,
      edgeCases: context.messages,
    },
    offers: annotatedOffers,
    steps: [
      {
        label: "Tort1",
        value: tort1,
        description: "Tüm geçerli tekliflerin aritmetik ortalaması",
      },
      {
        label: "σ",
        value: sigma,
        description: "Standart sapma",
      },
      {
        label: "Tort2",
        value: tort2,
        description: "Standart sapma aralığında kalan tekliflerin ortalaması",
      },
      {
        label: "C",
        value: coefficientC,
        description: "Tort2'nin yaklaşık maliyete oranı",
      },
      {
        label: "K",
        value: coefficientK,
        description: "DSİ yönergesine göre hesaplanan katsayı",
      },
      {
        label: "SD",
        value: sd,
        description: "Aşırı düşük sınır değeri",
      },
    ],
    diagnostics: {
      dataQualityScore,
      warnings,
    },
  } satisfies CalculationResult;
}
