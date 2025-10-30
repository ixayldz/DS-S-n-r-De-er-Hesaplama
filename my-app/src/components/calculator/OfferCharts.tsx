"use client";

import type { OfferWithAnalysis } from "@/lib/types";

interface OfferDistributionChartProps {
  offers: OfferWithAnalysis[];
  sd: number;
  tort1: number;
  tort2: number;
}

const chartHeight = 160;

function quantile(sortedValues: number[], q: number) {
  if (!sortedValues.length) {
    return 0;
  }

  const pos = (sortedValues.length - 1) * q;
  const base = Math.floor(pos);
  const rest = pos - base;

  if (sortedValues[base + 1] !== undefined) {
    return sortedValues[base] + rest * (sortedValues[base + 1] - sortedValues[base]);
  }

  return sortedValues[base];
}

function formatShort(value: number) {
  if (value >= 1_000_000_000) {
    return `${(value / 1_000_000_000).toFixed(1)}B`;
  }
  if (value >= 1_000_000) {
    return `${(value / 1_000_000).toFixed(1)}M`;
  }
  if (value >= 1_000) {
    return `${(value / 1_000).toFixed(1)}K`;
  }
  return value.toFixed(0);
}

export function OfferDistributionChart({ offers, sd, tort1, tort2 }: OfferDistributionChartProps) {
  if (!offers || !offers.length) {
    return null;
  }

  const values = offers.map((offer) => offer.value ?? 0);
  const max = Math.max(...values, sd, tort1, tort2);
  const min = Math.min(...values);

  const scaleY = (value: number) => {
    if (max === min) {
      return chartHeight / 2;
    }
    return chartHeight - ((value - min) / (max - min)) * chartHeight;
  };

  const markers = [
    { value: sd, label: "SD", color: "#ef4444" },
    { value: tort1, label: "Tort1", color: "#2563eb" },
    { value: tort2, label: "Tort2", color: "#0ea5e9" },
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between text-xs text-[#475569]">
        <span>{formatShort(max)}</span>
        <span>{formatShort(min)}</span>
      </div>
      <svg viewBox={`0 0 ${offers.length * 24 + 40} ${chartHeight + 40}`} className="w-full">
        <defs>
          <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor="#1d4ed8" stopOpacity="0.9" />
            <stop offset="100%" stopColor="#1d4ed8" stopOpacity="0.4" />
          </linearGradient>
        </defs>
        <g transform="translate(20, 10)">
          {offers.map((offer, index) => {
            const value = offer.value ?? 0;
            const height = max === min ? chartHeight / 2 : ((value - min) / (max - min)) * chartHeight;
            const x = index * 24;
            const y = chartHeight - height;
            const fill = offer.status === "out-of-range" ? "#ef4444" : offer.status === "in-range" ? "url(#barGradient)" : "#94a3b8";
            return (
              <g key={offer.id}>
                <rect x={x} y={y} width={16} height={height} rx={6} fill={fill} opacity={0.9} />
                <text x={x + 8} y={chartHeight + 12} textAnchor="middle" fontSize={10} fill="#475569">
                  {index + 1}
                </text>
              </g>
            );
          })}

          {markers.map((marker) => (
            <g key={marker.label}>
              <line
                x1={-12}
                x2={offers.length * 24}
                y1={scaleY(marker.value)}
                y2={scaleY(marker.value)}
                stroke={marker.color}
                strokeDasharray="6 6"
                strokeWidth={1}
              />
              <rect
                x={offers.length * 24 + 4}
                y={scaleY(marker.value) - 9}
                width={36}
                height={18}
                rx={9}
                fill={marker.color}
                opacity={0.15}
              />
              <text
                x={offers.length * 24 + 22}
                y={scaleY(marker.value) + 4}
                textAnchor="middle"
                fontSize={10}
                fill={marker.color}
              >
                {marker.label}
              </text>
            </g>
          ))}
        </g>
      </svg>
      <div className="flex flex-wrap gap-3 text-xs text-[#475569]">
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#1d4ed8]" /> Geçerli teklif
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-rose-500" /> SD altında
        </div>
        <div className="flex items-center gap-2">
          <span className="inline-block h-2 w-2 rounded-full bg-[#94a3b8]" /> İncelenmeli
        </div>
      </div>
    </div>
  );
}

interface OfferBoxPlotChartProps {
  offers: OfferWithAnalysis[];
}

export function OfferBoxPlotChart({ offers }: OfferBoxPlotChartProps) {
  if (!offers || !offers.length) {
    return <p className="text-xs text-[#475569]">Gösterilecek veri bulunamadı.</p>;
  }

  const values = offers
    .map((offer) => offer.value)
    .filter((value): value is number => Number.isFinite(value ?? NaN));

  if (!values.length) {
    return <p className="text-xs text-[#475569]">Gösterilecek veri bulunamadı.</p>;
  }

  const sorted = [...values].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const q1 = quantile(sorted, 0.25);
  const median = quantile(sorted, 0.5);
  const q3 = quantile(sorted, 0.75);
  const iqr = q3 - q1;
  const lowerFence = q1 - 1.5 * iqr;
  const upperFence = q3 + 1.5 * iqr;

  const scaleWidth = 280;
  const scaleX = (value: number) => ((value - min) / (max - min || 1)) * scaleWidth + 10;

  const outliers = offers.filter((offer) => {
    if (offer.value === null || offer.value === undefined) {
      return false;
    }
    return offer.value < lowerFence || offer.value > upperFence;
  });

  return (
    <div className="space-y-3">
      <svg viewBox="0 0 320 120" className="w-full">
        <line x1={10} x2={scaleWidth + 10} y1={60} y2={60} stroke="#cbd5f5" strokeWidth={1} />

        <line x1={scaleX(min)} x2={scaleX(q1)} y1={60} y2={60} stroke="#1d4ed8" strokeWidth={2} />
        <line x1={scaleX(q3)} x2={scaleX(max)} y1={60} y2={60} stroke="#1d4ed8" strokeWidth={2} />

        <rect
          x={scaleX(q1)}
          y={40}
          width={scaleX(q3) - scaleX(q1)}
          height={40}
          rx={6}
          fill="#eef2ff"
          stroke="#1d4ed8"
          strokeWidth={2}
        />

        <line x1={scaleX(median)} x2={scaleX(median)} y1={40} y2={80} stroke="#2563eb" strokeWidth={2} />

        <line x1={scaleX(min)} x2={scaleX(min)} y1={52} y2={68} stroke="#1d4ed8" strokeWidth={2} />
        <line x1={scaleX(max)} x2={scaleX(max)} y1={52} y2={68} stroke="#1d4ed8" strokeWidth={2} />

        {outliers.map((offer) => (
          <circle key={offer.id} cx={scaleX(offer.value ?? 0)} cy={60} r={4} fill="#ef4444" opacity={0.8} />
        ))}

        <text x={scaleX(min)} y={96} fontSize={10} textAnchor="middle" fill="#475569">
          Min
        </text>
        <text x={scaleX(q1)} y={96} fontSize={10} textAnchor="middle" fill="#475569">
          Q1
        </text>
        <text x={scaleX(median)} y={20} fontSize={10} textAnchor="middle" fill="#475569">
          Medyan
        </text>
        <text x={scaleX(q3)} y={96} fontSize={10} textAnchor="middle" fill="#475569">
          Q3
        </text>
        <text x={scaleX(max)} y={96} fontSize={10} textAnchor="middle" fill="#475569">
          Max
        </text>
      </svg>
      {outliers.length > 0 ? (
        <p className="text-xs text-amber-700">
          {outliers.length} teklif kutu grafiğinin dışında kalarak potansiyel aykırı değer olarak işaretlendi.
        </p>
      ) : (
        <p className="text-xs text-[#475569]">Aykırı değer tespit edilmedi.</p>
      )}
    </div>
  );
}

interface OfferStatusDonutChartProps {
  offers: OfferWithAnalysis[];
}

const STATUS_COLORS: Record<Exclude<OfferWithAnalysis["status"], undefined>, string> = {
  "in-range": "#10B981",
  "out-of-range": "#EF4444",
  pending: "#6366F1",
  excluded: "#94A3B8",
};

const STATUS_LABELS: Record<Exclude<OfferWithAnalysis["status"], undefined>, string> = {
  "in-range": "Geçerli",
  "out-of-range": "Aşırı düşük",
  pending: "İncelenmeli",
  excluded: "Hariç",
};

export function OfferStatusDonutChart({ offers }: OfferStatusDonutChartProps) {
  if (!offers || !offers.length) {
    return <p className="text-xs text-[#475569]">Gösterilecek veri bulunamadı.</p>;
  }

  const distribution = offers.reduce(
    (acc, offer) => {
      const status = offer.status ?? "pending";
      acc[status] = (acc[status] ?? 0) + 1;
      return acc;
    },
    {} as Record<string, number>,
  );

  const total = offers.length || 1;
  let offset = 0;
  const segments = Object.entries(distribution).map(([status, value]) => {
    const percent = (value / total) * 100;
    const start = offset;
    const end = offset + percent;
    offset = end;
    return {
      status,
      value,
      percent,
      start,
      end,
      color: STATUS_COLORS[status as keyof typeof STATUS_COLORS] ?? "#CBD5F5",
    };
  });

  const gradient = segments
    .filter((segment) => segment.value > 0)
    .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
    .join(", ");

  return (
    <div className="flex flex-col gap-4">
      <div
        className="mx-auto h-40 w-40 rounded-full border-8 border-white shadow-inner"
        style={{ backgroundImage: `conic-gradient(${gradient || "#CBD5F5 0 100%"})` }}
      >
        <div className="relative flex h-full w-full items-center justify-center text-center text-sm font-semibold text-[#0f172a]">
          <span className="leading-tight">
            Toplam
            <br />
            {total}
          </span>
        </div>
      </div>
      <ul className="space-y-2 text-xs text-[#475569]">
        {segments.map((segment) => (
          <li key={segment.status} className="flex items-center justify-between gap-3">
            <span className="flex items-center gap-2">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: segment.color }}
              />
              {STATUS_LABELS[segment.status as keyof typeof STATUS_LABELS] ?? segment.status}
            </span>
            <span className="font-semibold text-[#0f172a]">
              {segment.value} teklif (%{segment.percent.toFixed(1)})
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}
