/** Block-char meter: █ filled, ░ empty */
export function meter(pct: number, width = 10): { fill: string; track: string } {
  const filled = Math.round(Math.min(Math.max(pct, 0), 100) / (100 / width));
  return {
    fill: "█".repeat(filled),
    track: "░".repeat(width - filled),
  };
}

const SPARK_BLOCKS = "▁▂▃▄▅▆▇█";

/** ASCII sparkline from daily counts */
export function sparkline(values: number[]): { ch: string; dim: boolean }[] {
  if (!values.length) return [];
  const min = Math.min(...values);
  const max = Math.max(...values);
  const range = max - min || 1;
  return values.map((v, i) => {
    const idx = Math.round(((v - min) / range) * (SPARK_BLOCKS.length - 1));
    const isLast = i === values.length - 1;
    const isRecent = i >= values.length - 3;
    return {
      ch: SPARK_BLOCKS[idx] ?? "▁",
      dim: !isLast && !isRecent,
    };
  });
}

export function typeBar(count: number, max: number, width = 16): { fill: string; track: string } {
  const filled = Math.round((count / Math.max(max, 1)) * width);
  return {
    fill: "█".repeat(filled),
    track: "░".repeat(width - filled),
  };
}
