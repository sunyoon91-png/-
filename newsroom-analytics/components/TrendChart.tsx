"use client";

import { useState } from "react";
import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import { TrendPoint } from "@/lib/types";
import { formatDate, formatNumber, formatPercentage } from "@/lib/format";

const SELECTABLE_METRICS: { key: keyof TrendPoint; label: string; color: string }[] = [
  { key: "pageViews", label: "조회수", color: "#005BAC" },
  { key: "searchVisits", label: "검색 유입", color: "#16815D" },
  { key: "searchImpressions", label: "검색 노출", color: "#C87818" },
  { key: "searchCtr", label: "검색 클릭률", color: "#173A5E" },
];

function isPercentMetric(key: keyof TrendPoint) {
  return key === "searchCtr";
}

function formatMetricValue(key: keyof TrendPoint, value: number) {
  return isPercentMetric(key) ? formatPercentage(value) : formatNumber(value);
}

interface TooltipPayloadItem {
  dataKey: keyof TrendPoint;
  value: number;
  color: string;
  name: string;
}

function ChartTooltip({
  active,
  payload,
  label,
}: {
  active?: boolean;
  payload?: TooltipPayloadItem[];
  label?: string;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-lg border border-border bg-surface px-3 py-2 text-sm shadow-md">
      <p className="font-medium text-ink">{formatDate(label ?? "")}</p>
      {payload.map((item) => (
        <p key={item.dataKey} style={{ color: item.color }} className="mt-0.5">
          {item.name}: {formatMetricValue(item.dataKey, item.value)}
        </p>
      ))}
    </div>
  );
}

export default function TrendChart({ trends }: { trends: TrendPoint[] }) {
  const [selectedMetrics, setSelectedMetrics] = useState<(keyof TrendPoint)[]>([
    "pageViews",
    "searchVisits",
  ]);

  function toggleMetric(key: keyof TrendPoint) {
    setSelectedMetrics((prev) => {
      if (prev.includes(key)) {
        return prev.filter((k) => k !== key);
      }
      if (prev.length >= 2) {
        return [prev[1], key];
      }
      return [...prev, key];
    });
  }

  const activeMetrics = SELECTABLE_METRICS.filter((m) => selectedMetrics.includes(m.key));

  return (
    <section aria-label="성과 추이" className="rounded-card border border-border bg-surface p-4 shadow-sm sm:p-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <h2 className="text-base font-bold text-ink">기간별 성과 추이</h2>
        <div role="group" aria-label="추이 지표 선택" className="flex flex-wrap gap-2">
          {SELECTABLE_METRICS.map((metric) => {
            const isSelected = selectedMetrics.includes(metric.key);
            return (
              <button
                key={metric.key}
                type="button"
                aria-pressed={isSelected}
                onClick={() => toggleMetric(metric.key)}
                className={`rounded-full border px-3 py-1 text-sm font-medium transition-colors ${
                  isSelected
                    ? "border-transparent text-white"
                    : "border-border text-muted hover:text-ink"
                }`}
                style={isSelected ? { backgroundColor: metric.color } : undefined}
              >
                {metric.label}
              </button>
            );
          })}
        </div>
      </div>

      <div className="mt-4 h-72 w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={trends} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#DDE6ED" />
            <XAxis
              dataKey="date"
              tickFormatter={(v: string) => formatDate(v).slice(5)}
              tick={{ fontSize: 12, fill: "#6B7C8D" }}
              minTickGap={24}
            />
            <YAxis tick={{ fontSize: 12, fill: "#6B7C8D" }} width={48} />
            <Tooltip content={<ChartTooltip />} />
            {activeMetrics.map((metric) => (
              <Line
                key={metric.key}
                type="monotone"
                dataKey={metric.key}
                name={metric.label}
                stroke={metric.color}
                strokeWidth={2}
                dot={false}
              />
            ))}
          </LineChart>
        </ResponsiveContainer>
      </div>

      <details className="mt-3">
        <summary className="cursor-pointer text-sm font-medium text-muted hover:text-ink">
          표로 보기
        </summary>
        <div className="mt-2 max-h-64 overflow-auto rounded-lg border border-border">
          <table className="w-full text-left text-sm">
            <thead className="sticky top-0 bg-background">
              <tr>
                <th scope="col" className="px-3 py-2 font-medium text-muted">날짜</th>
                {activeMetrics.map((m) => (
                  <th key={m.key} scope="col" className="px-3 py-2 text-right font-medium text-muted">
                    {m.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {trends.map((point) => (
                <tr key={point.date} className="border-t border-border">
                  <td className="px-3 py-1.5">{formatDate(point.date)}</td>
                  {activeMetrics.map((m) => (
                    <td key={m.key} className="px-3 py-1.5 text-right">
                      {formatMetricValue(m.key, point[m.key] as number)}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </details>
    </section>
  );
}
