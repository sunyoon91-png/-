export function formatNumber(value: number): string {
  return new Intl.NumberFormat("ko-KR").format(Math.round(value));
}

export function formatPercentage(value: number, digits = 1): string {
  return `${value.toFixed(digits)}%`;
}

export function formatRank(value: number): string {
  return `${value.toFixed(1)}위`;
}

export function formatDuration(seconds: number): string {
  const m = Math.floor(seconds / 60);
  const s = Math.round(seconds % 60);
  if (m === 0) return `${s}초`;
  return `${m}분 ${s}초`;
}

export function formatDate(dateStr: string): string {
  const d = new Date(dateStr);
  if (Number.isNaN(d.getTime())) return dateStr;
  return new Intl.DateTimeFormat("ko-KR", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(d);
}

export function formatChange(
  value: number,
  lowerIsBetter = false
): { direction: "up" | "down" | "flat"; isPositive: boolean; text: string } {
  const direction = value > 0 ? "up" : value < 0 ? "down" : "flat";
  const isPositive = direction === "flat" ? true : lowerIsBetter ? value < 0 : value > 0;
  const sign = value > 0 ? "+" : "";
  return {
    direction,
    isPositive,
    text: `${sign}${value.toFixed(1)}`,
  };
}
