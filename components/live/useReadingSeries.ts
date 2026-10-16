import { useEffect, useRef, useState } from "react";

export type SeriesPoint = { t: number; v: number };

/**
 * Keeps a rolling list of valid readings. A point is added every time `updatedAt` changes.
 * Invalid readings (no finger, out of range) are skipped, which leaves a gap in the chart.
 * Pass a stable `isValid` function (define it outside the component).
 */
export function useReadingSeries(
  value: number | null | undefined,
  updatedAt: number | null | undefined,
  isValid: (v: number) => boolean,
  resetKey: unknown,
  windowMs: number = 30 * 60 * 1000
): SeriesPoint[] {
  const [points, setPoints] = useState<SeriesPoint[]>([]);
  const lastStamp = useRef<number | null>(null);

  // a new connection starts a new chart
  useEffect(() => {
    setPoints([]);
    lastStamp.current = null;
  }, [resetKey]);

  useEffect(() => {
    if (updatedAt == null || updatedAt === lastStamp.current) return;
    lastStamp.current = updatedAt;
    if (value == null || !isValid(value)) return;

    setPoints((prev) => {
      const cutoff = updatedAt - windowMs;
      const next =
        prev.length > 0 && prev[0].t < cutoff
          ? prev.filter((p) => p.t >= cutoff)
          : prev.slice();
      next.push({ t: updatedAt, v: value });
      return next;
    });
  }, [value, updatedAt, isValid, windowMs]);

  return points;
}
