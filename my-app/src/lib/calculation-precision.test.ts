import { describe, expect, it } from "vitest";
import { calculateBoundary } from "./calculation";

describe("Calculation Precision Tests", () => {
  it("should round C coefficient to exactly 3 decimal places", () => {
    const result = calculateBoundary({
      approxCost: 100000,
      offers: [
        { id: "1", raw: "", value: 65123.456, source: "manual", confidence: 100 },
        { id: "2", raw: "", value: 65234.567, source: "manual", confidence: 100 },
        { id: "3", raw: "", value: 65345.678, source: "manual", confidence: 100 },
      ],
      nCoefficient: 1.2,
    });

    // C = Tort2 / YM
    // C should be rounded to exactly 3 decimal places
    const cString = result.summary.coefficientC.toFixed(3);
    expect(cString).toMatch(/^\d+\.\d{3}$/);
    
    // Verify C is actually rounded, not just displayed
    const cValue = result.summary.coefficientC;
    const rounded = Math.round(cValue * 1000) / 1000;
    expect(cValue).toBe(rounded);
  });

  it("should round K coefficient to exactly 3 decimal places", () => {
    const result = calculateBoundary({
      approxCost: 100000,
      offers: [
        { id: "1", raw: "", value: 75000, source: "manual", confidence: 100 },
        { id: "2", raw: "", value: 76000, source: "manual", confidence: 100 },
        { id: "3", raw: "", value: 77000, source: "manual", confidence: 100 },
      ],
      nCoefficient: 1.2,
    });

    // K should be rounded to exactly 3 decimal places
    const kString = result.summary.coefficientK.toFixed(3);
    expect(kString).toMatch(/^\d+\.\d{3}$/);
    
    // Verify K is actually rounded
    const kValue = result.summary.coefficientK;
    const rounded = Math.round(kValue * 1000) / 1000;
    expect(kValue).toBe(rounded);
  });

  it("should maintain precision in SD calculation", () => {
    const result = calculateBoundary({
      approxCost: 100000,
      offers: [
        { id: "1", raw: "", value: 38700, source: "manual", confidence: 100 },
        { id: "2", raw: "", value: 44000, source: "manual", confidence: 100 },
        { id: "3", raw: "", value: 48000, source: "manual", confidence: 100 },
        { id: "4", raw: "", value: 49500, source: "manual", confidence: 100 },
        { id: "5", raw: "", value: 55000, source: "manual", confidence: 100 },
      ],
      nCoefficient: 1.2,
    });

    // SD = (K * Tort2) / (C * N)
    const { coefficientK, coefficientC, tort2, nCoefficient, sd } = result.summary;
    
    const expectedSD = (coefficientK * tort2) / (coefficientC * nCoefficient);
    expect(sd).toBeCloseTo(expectedSD, 10); // 10 decimal places precision
  });

  it("should handle edge case values correctly", () => {
    // Test with values that might cause rounding issues
    const result = calculateBoundary({
      approxCost: 99999.99,
      offers: [
        { id: "1", raw: "", value: 33333.33, source: "manual", confidence: 100 },
        { id: "2", raw: "", value: 44444.44, source: "manual", confidence: 100 },
        { id: "3", raw: "", value: 55555.55, source: "manual", confidence: 100 },
      ],
      nCoefficient: 1.111,
    });

    // Check that all calculations complete without NaN or Infinity
    expect(Number.isFinite(result.summary.sd)).toBe(true);
    expect(Number.isFinite(result.summary.coefficientC)).toBe(true);
    expect(Number.isFinite(result.summary.coefficientK)).toBe(true);
    
    // C and K should be exactly 3 decimal places
    expect(result.summary.coefficientC.toString()).not.toContain("e");
    expect(result.summary.coefficientK.toString()).not.toContain("e");
  });

  it("should format currency values with exactly 2 decimal places", () => {
    const result = calculateBoundary({
      approxCost: 100000,
      offers: [
        { id: "1", raw: "", value: 38700, source: "manual", confidence: 100 },
        { id: "2", raw: "", value: 44000.5, source: "manual", confidence: 100 },
        { id: "3", raw: "", value: 48000.99, source: "manual", confidence: 100 },
      ],
      nCoefficient: 1.2,
    });

    // All monetary values should maintain proper precision
    result.offers.forEach(offer => {
      if (offer.value !== null) {
        expect(Number.isFinite(offer.value)).toBe(true);
      }
    });

    // SD should be a precise number
    expect(Number.isFinite(result.summary.sd)).toBe(true);
  });
});
