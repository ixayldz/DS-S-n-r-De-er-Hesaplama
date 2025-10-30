export interface NormalizedOffer {
  id: string;
  raw: string;
  value: number | null;
  confidence?: number;
  source: "ai" | "manual" | "cache";
  warnings?: string[];
  error?: string;
  status?: OfferStatus;
}

export type OfferStatus = "pending" | "in-range" | "out-of-range" | "excluded";

export interface CalculationInputs {
  approxCost: number;
  offers: NormalizedOffer[];
  nCoefficient: number;
}

export interface CalculationStep {
  label: string;
  value: number;
  description: string;
}

export interface OfferWithAnalysis extends NormalizedOffer {
  distanceFromMean?: number;
  withinStdDev?: boolean;
}

export interface CalculationResult {
  summary: {
    sd: number;
    filteredCount: number;
    offerCount: number;
    approxCost: number;
    coefficientC: number;
    coefficientK: number;
    tort1: number;
    tort2: number;
    sigma: number;
    nCoefficient: number;
    edgeCases: string[];
  };
  offers: OfferWithAnalysis[];
  steps: CalculationStep[];
  diagnostics: {
    dataQualityScore: number;
    warnings: string[];
  };
}

export interface NormalizationResponse {
  offers: NormalizedOffer[];
  rawCount: number;
  detectedCount: number;
  confidence: number;
  notes?: string;
  cached?: boolean;
  durationMs?: number;
}

export interface ApiErrorShape {
  message: string;
  details?: string;
}
