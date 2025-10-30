import { z } from "zod";

export const calculationFormSchema = z.object({
  approxCost: z
    .string()
    .min(1, "Yaklaşık maliyet gerekli")
    .refine((val) => !Number.isNaN(Number.parseFloat(val.replace(/\s+/g, ""))), {
      message: "Geçerli bir sayı girin",
    }),
  nCoefficient: z
    .string()
    .min(1, "N katsayısı gerekli")
    .refine((val) => Number.parseFloat(val.replace(/\s+/g, "")) > 0, {
      message: "Pozitif bir değer girin",
    }),
  offersInput: z.string().min(1, "Teklif metni gerekli"),
});

export type CalculationFormValues = z.infer<typeof calculationFormSchema>;

export interface ParsedCalculationForm {
  approxCost: number;
  nCoefficient: number;
  offersInput: string;
}

export function parseCalculationForm(values: CalculationFormValues): ParsedCalculationForm {
  return {
    approxCost: Number.parseFloat(values.approxCost.replace(/\s+/g, "")),
    nCoefficient: Number.parseFloat(values.nCoefficient.replace(/\s+/g, "")),
    offersInput: values.offersInput,
  };
}

export const normalizationRequestSchema = z.object({
  rawInput: z.string().min(1, "Teklif metni gerekli"),
  expectedCount: z.number().int().positive().optional(),
});

export type NormalizationRequest = z.infer<typeof normalizationRequestSchema>;

export const editableOfferSchema = z.object({
  id: z.string(),
  raw: z.string(),
  value: z
    .string()
    .min(1, "Değer gerekli")
    .transform((val) => Number.parseFloat(val.replace(/\s+/g, "")))
    .pipe(z.number().positive("Teklif değeri 0'dan büyük olmalı")),
});

export type EditableOfferValues = z.infer<typeof editableOfferSchema>;
