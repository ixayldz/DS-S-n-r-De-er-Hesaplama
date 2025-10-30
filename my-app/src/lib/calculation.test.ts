import { calculateBoundary } from "@/lib/calculation";
import type { NormalizedOffer } from "@/lib/types";

const sampleOffers: NormalizedOffer[] = [
  { id: "1", raw: "Firma A - 64.500.000 TL", value: 64_500_000, source: "manual" },
  { id: "2", raw: "Firma B - 66.000.000 TL", value: 66_000_000, source: "manual" },
  { id: "3", raw: "Firma C - 67.500.000 TL", value: 67_500_000, source: "manual" },
  { id: "4", raw: "Firma D - 66.000.000 TL", value: 66_000_000, source: "manual" },
];

describe("calculateBoundary", () => {
  it("matches DSİ örnek hesaplamasıyla uyumlu sonuç üretir", () => {
    const approxCost = 90_000_000;
    const nCoefficient = 1.2;

    const result = calculateBoundary({
      approxCost,
      offers: sampleOffers,
      nCoefficient,
    });
    expect(result.summary.tort2).toBeCloseTo(66_000_000, 0);
    expect(result.summary.coefficientC).toBeCloseTo(0.733, 3);
    expect(result.summary.coefficientK).toBeCloseTo(0.697, 3);
    expect(result.summary.sd).toBeCloseTo(52_298_772.17, 2);
    expect(result.summary.filteredCount).toBeGreaterThan(0);
  });
});
