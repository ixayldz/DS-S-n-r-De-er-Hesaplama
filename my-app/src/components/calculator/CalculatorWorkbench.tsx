"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { 
  AlertCircle, 
  Calculator, 
  Loader2, 
  RefreshCw, 
  Sparkles,
  TrendingUp,
  FileText,
  AlertTriangle,
  CheckCircle,
  Info
} from "lucide-react";
import { calculateBoundary } from "@/lib/calculation";
import type { NormalizationResponse } from "@/lib/types";
import {
  calculationFormSchema,
  parseCalculationForm,
  type CalculationFormValues,
  type ParsedCalculationForm,
} from "@/lib/validation";
import { useCalculatorStore } from "./store";
import { OfferDistributionChart, OfferBoxPlotChart, OfferStatusDonutChart } from "./OfferCharts";

function formatCurrency(value: number, showCurrency: boolean = true) {
  if (showCurrency) {
    return new Intl.NumberFormat("tr-TR", {
      style: "currency",
      currency: "TRY",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
      currencyDisplay: "symbol",
    }).format(value);
  } else {
    return new Intl.NumberFormat("tr-TR", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  }
}

function formatCoefficient(value: number): string {
  return value.toFixed(3).replace('.', ',');
}

export function CalculatorWorkbench() {
  const [normalizationMeta, setNormalizationMeta] = useState<{
    durationMs?: number;
    confidence?: number;
    detectedCount?: number;
  } | undefined>();
  const [automationError, setAutomationError] = useState<string | undefined>();
  const [isProcessing, setIsProcessing] = useState(false);

  const {
    setParameters,
    approxCost,
    nCoefficient,
    rawInput,
    setRawInput,
    offers,
    setOffers,
    updateOfferValue,
    result,
    setResult,
    reset,
  } = useCalculatorStore();

  const form = useForm<CalculationFormValues>({
    resolver: zodResolver(calculationFormSchema),
    defaultValues: {
      approxCost: approxCost ? String(approxCost) : "",
      nCoefficient: nCoefficient ? String(nCoefficient) : "1.2",
      offersInput: rawInput,
    },
  });

  useEffect(() => {
    form.reset({
      approxCost: approxCost ? String(approxCost) : "",
      nCoefficient: nCoefficient ? String(nCoefficient) : "1.2",
      offersInput: rawInput,
    });
  }, [approxCost, nCoefficient, rawInput, form]);

  const handleFullReset = useCallback(() => {
    reset();
    setNormalizationMeta(undefined);
    setAutomationError(undefined);
    form.reset({
      approxCost: "",
      nCoefficient: "1.2",
      offersInput: "",
    });
  }, [reset, form]);

  const automationMutation = useMutation({
    mutationFn: async (data: ParsedCalculationForm) => {
      setIsProcessing(true);
      setAutomationError(undefined);
      
      try {
        const response = await fetch("/api/normalize", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            rawInput: data.offersInput || "",
            expectedCount: undefined,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json().catch(() => ({ 
            message: "Bilinmeyen hata",
            details: `${response.status} ${response.statusText}` 
          }));
          throw new Error(errorData.details || errorData.message || `Normalizasyon hatası: ${response.status}`);
        }

        const json = (await response.json()) as NormalizationResponse;
        return { data, json };
      } finally {
        setIsProcessing(false);
      }
    },
    onSuccess: ({ data, json }) => {
      const filtered = json.offers.filter((o) => Number.isFinite(o.value) && o.value && o.value > 0);
      
      if (filtered.length < 3) {
        setAutomationError("En az 3 geçerli teklif gereklidir");
        return;
      }

      setRawInput(data.offersInput);
      setOffers(filtered);
      setNormalizationMeta({
        durationMs: json.durationMs,
        confidence: json.confidence,
        detectedCount: filtered.length,
      });

      const params = {
        approxCost: data.approxCost,
        offers: filtered,
        nCoefficient: data.nCoefficient,
      };

      setParameters(params);

      try {
        const calculationResult = calculateBoundary(params);
        setResult(calculationResult);
      } catch (error) {
        setAutomationError(error instanceof Error ? error.message : "Hesaplama başarısız");
      }
    },
    onError: (error) => {
      setAutomationError(error instanceof Error ? error.message : "Beklenmeyen bir hata oluştu");
      setIsProcessing(false);
    },
  });

  const handleSubmit = useCallback(
    (values: CalculationFormValues) => {
      const parsed = parseCalculationForm(values);
      automationMutation.mutate(parsed);
    },
    [automationMutation],
  );

  const hasResults = Boolean(result && offers.length > 0);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="border-b bg-white/80 backdrop-blur-md sticky top-0 z-10">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-blue-600 rounded-lg">
                <Calculator className="h-6 w-6 text-white" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">DSİ Sınır Değer Hesaplama</h1>
                <p className="text-xs text-slate-600">Kanun 45.1.1 Uyumlu</p>
              </div>
            </div>
            <button
              onClick={handleFullReset}
              className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
            >
              <RefreshCw className="h-4 w-4" />
              Sıfırla
            </button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Form Section */}
        <div className="max-w-4xl mx-auto">
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            {/* Input Card */}
            <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
              <div className="flex items-center gap-2 mb-4">
                <FileText className="h-5 w-5 text-blue-600" />
                <h2 className="text-lg font-semibold text-slate-900">Veri Girişi</h2>
              </div>

              <div className="grid gap-6 md:grid-cols-2">
                {/* Yaklaşık Maliyet */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    Yaklaşık Maliyet (TL)
                  </label>
                  <input
                    type="text"
                    inputMode="decimal"
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none"
                    placeholder="100000"
                    {...form.register("approxCost")}
                  />
                  {form.formState.errors.approxCost && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {form.formState.errors.approxCost.message}
                    </p>
                  )}
                </div>

                {/* N Katsayısı */}
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-2">
                    N Katsayısı
                  </label>
                  <select
                    className="w-full px-4 py-2.5 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none bg-white"
                    {...form.register("nCoefficient")}
                  >
                    <option value="1">1.00 (B, C, D, E Grupları)</option>
                    <option value="1.2">1.20 (Diğer İşler)</option>
                  </select>
                  {form.formState.errors.nCoefficient && (
                    <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                      <AlertCircle className="h-3 w-3" />
                      {form.formState.errors.nCoefficient.message}
                    </p>
                  )}
                </div>
              </div>

              {/* Teklifler */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Teklif Listesi
                </label>
                
                {/* Warning Message */}
                <div className="mb-3 p-3 bg-amber-50 border border-amber-200 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-amber-600 mt-0.5 flex-shrink-0" />
                  <p className="text-xs text-amber-800">
                    Yalnızca geçerli teklifleri girin. "Geçersiz teklif" içeren satırlar otomatik olarak elenecektir.
                  </p>
                </div>

                <textarea
                  className="w-full px-4 py-3 rounded-lg border border-slate-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 transition-all outline-none resize-none font-mono text-sm"
                  rows={8}
                  placeholder="Örnek:
1) ABC İnşaat: 45.250.000,50 TL
2) XYZ Taahhüt - 47.830.000 TL
3) Teklif tutarımız: kırk sekiz milyon beş yüz bin TL"
                  {...form.register("offersInput")}
                />
                {form.formState.errors.offersInput && (
                  <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                    <AlertCircle className="h-3 w-3" />
                    {form.formState.errors.offersInput.message}
                  </p>
                )}
              </div>

              {/* Submit Button */}
              <div className="mt-6 flex items-center justify-between">
                <p className="text-xs text-slate-500">
                  Gemini AI ile otomatik normalizasyon
                </p>
                <button
                  type="submit"
                  disabled={automationMutation.isPending || isProcessing}
                  className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-400 text-white font-medium rounded-lg transition-colors flex items-center gap-2 disabled:cursor-not-allowed"
                >
                  {automationMutation.isPending || isProcessing ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      İşleniyor...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" />
                      Hesapla
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Error Alert */}
            {automationError && (
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
                <AlertCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
                <div className="flex-1">
                  <p className="text-sm font-medium text-red-900">Hata</p>
                  <p className="text-sm text-red-700 mt-1">{automationError}</p>
                </div>
              </div>
            )}
          </form>

          {/* Results Section */}
          {hasResults && result && (
            <div className="mt-8 space-y-6">
              {/* Main Result Card */}
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-2xl p-6 text-white">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-lg font-semibold flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    Hesaplama Sonucu
                  </h3>
                  {normalizationMeta?.confidence && (
                    <span className="px-3 py-1 bg-white/20 rounded-full text-xs font-medium">
                      %{normalizationMeta.confidence} Güven
                    </span>
                  )}
                </div>
                
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <p className="text-sm text-blue-100 mb-1">Sınır Değer</p>
                    <p className="text-2xl font-bold">{formatCurrency(result.summary.sd)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-100 mb-1">C Katsayısı</p>
                    <p className="text-2xl font-bold">{formatCoefficient(result.summary.coefficientC)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-100 mb-1">K Katsayısı</p>
                    <p className="text-2xl font-bold">{formatCoefficient(result.summary.coefficientK)}</p>
                  </div>
                  <div>
                    <p className="text-sm text-blue-100 mb-1">Tort2</p>
                    <p className="text-2xl font-bold">{formatCurrency(result.summary.tort2)}</p>
                  </div>
                </div>
              </div>

              {/* Detailed Steps */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                  <Info className="h-5 w-5 text-blue-600" />
                  Hesaplama Adımları
                </h3>
                
                <div className="space-y-3">
                  {result.steps.map((step, index) => (
                    <div key={index} className="flex items-start gap-3">
                      <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center text-sm font-semibold flex-shrink-0">
                        {index + 1}
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-slate-900">{step.label}</p>
                        <p className="text-sm text-slate-600 mt-0.5">{step.description}</p>
                        <p className="text-lg font-semibold text-slate-900 mt-1">
                          {typeof step.value === 'number' 
                            ? step.label.includes('Katsayı') 
                              ? formatCoefficient(step.value)
                              : formatCurrency(step.value)
                            : step.value}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Offers Table */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                <h3 className="text-lg font-semibold text-slate-900 mb-4">
                  Teklif Detayları ({offers.length} teklif)
                </h3>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="border-b border-slate-200">
                        <th className="text-left py-3 px-2 text-xs font-medium text-slate-600 uppercase">#</th>
                        <th className="text-left py-3 px-2 text-xs font-medium text-slate-600 uppercase">Teklif</th>
                        <th className="text-right py-3 px-2 text-xs font-medium text-slate-600 uppercase">Değer</th>
                        <th className="text-center py-3 px-2 text-xs font-medium text-slate-600 uppercase">Durum</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.offers
                        .sort((a, b) => (a.value ?? 0) - (b.value ?? 0))
                        .map((offer, index) => (
                          <tr key={offer.id} className="border-b border-slate-100 hover:bg-slate-50">
                            <td className="py-3 px-2 text-sm text-slate-600">{index + 1}</td>
                            <td className="py-3 px-2 text-sm text-slate-900 font-medium">{offer.raw}</td>
                            <td className="py-3 px-2 text-sm text-slate-900 text-right font-mono">
                              {offer.value ? formatCurrency(offer.value) : '-'}
                            </td>
                            <td className="py-3 px-2 text-center">
                              {offer.status === 'in-range' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-medium">
                                  <CheckCircle className="h-3 w-3" />
                                  Dahil
                                </span>
                              ) : offer.status === 'out-of-range' ? (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-amber-100 text-amber-700 rounded-full text-xs font-medium">
                                  <AlertTriangle className="h-3 w-3" />
                                  Aykırı
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 px-2 py-1 bg-slate-100 text-slate-600 rounded-full text-xs font-medium">
                                  <Info className="h-3 w-3" />
                                  Diğer
                                </span>
                              )}
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Charts */}
              <div className="grid gap-6 md:grid-cols-2">
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">Teklif Dağılımı</h4>
                  <OfferDistributionChart offers={result.offers} sd={result.summary.sd} tort1={result.summary.tort1} tort2={result.summary.tort2} />
                </div>
                <div className="bg-white rounded-2xl shadow-sm border border-slate-200 p-6">
                  <h4 className="text-sm font-semibold text-slate-900 mb-4">Durum Özeti</h4>
                  <OfferStatusDonutChart offers={result.offers} />
                </div>
              </div>

              {/* Performance Metrics */}
              {normalizationMeta && (
                <div className="bg-slate-50 rounded-lg p-4 flex items-center justify-between text-xs text-slate-600">
                  <div className="flex items-center gap-4">
                    <span>İşlem süresi: {normalizationMeta.durationMs}ms</span>
                    <span>•</span>
                    <span>{normalizationMeta.detectedCount} teklif tespit edildi</span>
                    <span>•</span>
                    <span>Her zaman yeni hesaplama</span>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </main>
    </div>
  );
}
