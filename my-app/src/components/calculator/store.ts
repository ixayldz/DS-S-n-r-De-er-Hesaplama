"use client";

import { create } from "zustand";
import type { CalculationResult, NormalizedOffer } from "@/lib/types";

interface CalculatorState {
  approxCost?: number;
  nCoefficient?: number;
  rawInput: string;
  offers: NormalizedOffer[];
  result?: CalculationResult;
  setParameters: (params: { approxCost: number; nCoefficient: number }) => void;
  setRawInput: (input: string) => void;
  setOffers: (offers: NormalizedOffer[]) => void;
  updateOfferValue: (id: string, value: number) => void;
  setResult: (result: CalculationResult | undefined) => void;
  reset: () => void;
}

const initialState: Pick<CalculatorState, "approxCost" | "nCoefficient" | "rawInput" | "offers" | "result"> = {
  approxCost: undefined,
  nCoefficient: undefined,
  rawInput: "",
  offers: [],
  result: undefined,
};

// Persist kaldırıldı - sayfa yenilendiğinde her şey sıfırlanacak
export const useCalculatorStore = create<CalculatorState>()((set) => ({
  ...initialState,
  setParameters({ approxCost, nCoefficient }) {
    set({ approxCost, nCoefficient, result: undefined });
  },
  setRawInput(rawInput) {
    set({ rawInput });
  },
  setOffers(offers) {
    set({ offers, result: undefined });
  },
  updateOfferValue(id, value) {
    set((state) => ({
      offers: state.offers.map((offer) =>
        offer.id === id
          ? {
              ...offer,
              value,
              status: undefined,
            }
          : offer,
      ),
      result: undefined,
    }));
  },
  setResult(result) {
    set({ result });
  },
  reset() {
    set({ ...initialState });
  },
}));
