import { describe, expect, it } from "vitest";
import { fallbackParseOffers } from "./parse";

describe("fallbackParseOffers", () => {
  it("should correctly parse offers with thousands separator (dot)", () => {
    const testInput = `Teklif 1 Geçerli teklif 38.700 TL
Teklif 2 Geçerli teklif 44.000 TL
Teklif 3 Geçerli teklif 48.000 TL
Teklif 4 Geçerli teklif 49.500 TL
Teklif 5 Geçerli teklif 55.000 TL
Teklif 6 Geçerli teklif 62.000 TL
Teklif 7 Geçerli teklif 68.200 TL
Teklif 8 Geçerli teklif 69.000 TL
Teklif 9 Geçerli teklif 72.200 TL
Teklif 10 Geçerli teklif 82.000 TL
Teklif 11 Geçerli teklif 112.800 TL
Teklif 12 Geçerli teklif 123.300 TL`;

    const expectedValues = [
      38700, 44000, 48000, 49500, 55000, 62000, 
      68200, 69000, 72200, 82000, 112800, 123300
    ];

    const offers = fallbackParseOffers(testInput);
    
    expect(offers.length).toBe(12);
    
    offers.forEach((offer, index) => {
      expect(offer.value).toBe(expectedValues[index]);
      expect(offer.confidence).toBeGreaterThan(0);
    });
  });

  it("should handle mixed formats correctly", () => {
    const testInput = `1) ABC İnşaat: 45.250.000,50 TL
2) XYZ Taahhüt - 47.830.000 TL
3) 1.234.567,89
Teklif tutarımız: kırk sekiz milyon beş yüz bin TL`;

    const offers = fallbackParseOffers(testInput);
    
    expect(offers.length).toBe(4);
    expect(offers[0].value).toBe(45250000.50);
    expect(offers[1].value).toBe(47830000);
    expect(offers[2].value).toBe(1234567.89);
    expect(offers[3].value).toBe(48500000); // Parsed from Turkish words
  });

  it("should prefer larger values when multiple numbers present", () => {
    const testInput = `Teklif 1 Geçerli teklif 38.700 TL`;
    
    const offers = fallbackParseOffers(testInput);
    
    expect(offers.length).toBe(1);
    expect(offers[0].value).toBe(38700); // Should select 38.700, not 1
  });

  it("should handle decimal places correctly", () => {
    const testInput = `38.700,50 TL
44.000,25 TL
1.234.567,89 TL`;

    const offers = fallbackParseOffers(testInput);
    
    expect(offers[0].value).toBe(38700.50);
    expect(offers[1].value).toBe(44000.25);
    expect(offers[2].value).toBe(1234567.89);
  });
});
