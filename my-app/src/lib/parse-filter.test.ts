import { describe, it, expect } from 'vitest';
import { fallbackParseOffers } from './parse';

describe('Geçersiz teklif filtreleme', () => {
  it('should filter out lines containing "geçersiz"', () => {
    const input = `Teklif 1	Geçerli teklif	38.700 TL
Teklif 2	Geçerli teklif	44.000 TL
Teklif 3	Geçersiz teklif	45.000 TL
Teklif 4	Geçersiz teklif	55.000 TL`;

    const result = fallbackParseOffers(input);
    
    expect(result).toHaveLength(2);
    expect(result[0].value).toBe(38700);
    expect(result[1].value).toBe(44000);
  });

  it('should handle case-insensitive filtering with Turkish characters', () => {
    const testCases = [
      { input: 'Geçersiz teklif: 100.000 TL', expectedCount: 0 },
      { input: 'GEÇERSİZ teklif: 100.000 TL', expectedCount: 0 },
      { input: 'geçersiz: 100.000 TL', expectedCount: 0 },
      { input: 'Geçerli teklif: 100.000 TL', expectedCount: 1 },
    ];

    testCases.forEach(({ input, expectedCount }) => {
      const result = fallbackParseOffers(input);
      expect(result).toHaveLength(expectedCount);
    });
  });

  it('should handle ornek2.md data correctly', () => {
    const input = `Teklif 1	Geçerli teklif	38.700 TL
Teklif 2	Geçerli teklif	44.000 TL
Teklif 3	Geçerli teklif	48.000 TL
Teklif 4	Geçerli teklif	49.500 TL
Teklif 5	Geçerli teklif	55.000 TL
Teklif 6	Geçerli teklif	62.000 TL
Teklif 7	Geçerli teklif	68.200 TL
Teklif 8	Geçerli teklif	69.000 TL
Teklif 9	Geçerli teklif	72.200 TL
Teklif 10	Geçerli teklif	82.000 TL
Teklif 11	Geçerli teklif	112.800 TL
Teklif 12	Geçerli teklif	123.300 TL
Teklif 13	Geçersiz teklif	45.000 TL
Teklif 14	Geçersiz teklif	55.000 TL
Teklif 15	Geçersiz teklif	60.500 TL
Teklif 16	Geçersiz teklif	75.000 TL
Teklif 17	Geçersiz teklif	105.000 TL`;

    const result = fallbackParseOffers(input);
    
    // Should only return 12 valid offers
    expect(result).toHaveLength(12);
    
    // Check first and last valid offers
    expect(result[0].value).toBe(38700);
    expect(result[11].value).toBe(123300);
    
    // Verify all values are from valid offers
    const expectedValues = [38700, 44000, 48000, 49500, 55000, 62000, 68200, 69000, 72200, 82000, 112800, 123300];
    result.forEach((offer, index) => {
      expect(offer.value).toBe(expectedValues[index]);
    });
  });
});
