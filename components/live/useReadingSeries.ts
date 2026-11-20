import { useEffect, useRef, useState } from "react";

export type SeriesPoint = { t: number; v: number };

export function useReadingSeries(
  value: number | null | undefined,
  updatedAt: number | null | undefined,
  isValid: (v: number) => boolean,
  resetKey: unknown,
  windowMs: number = 30 * 60 * 1000
): SeriesPoint[] {
  const [points, setPoints] = useState<SeriesPoint[]>([]);
  const lastStamp = useRef<number | null>(null);
  const prevResetKey = useRef<unknown>(null);

  useEffect(() => {
    if (resetKey != null && resetKey !== prevResetKey.current) {
      prevResetKey.current = resetKey;
      setPoints([]);
      lastStamp.current = null;
    }
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
