import { useEffect, useState } from "react";
import { liveDataStore, SeriesPoint } from "../../service/LiveDataStore";

export type { SeriesPoint };

export function useReadingSeries(
  value: number | null | undefined,
  updatedAt: number | null | undefined,
  isValid: (v: number) => boolean,
  resetKey: unknown,
  metricName: string = "series",
  windowMs: number = 30 * 60 * 1000
): SeriesPoint[] {
  const storeKey = `${String(resetKey ?? "default")}-${metricName}`;

  useEffect(() => {
    liveDataStore.addPoint(storeKey, value, updatedAt, isValid, windowMs);
  }, [storeKey, value, updatedAt, isValid, windowMs]);

  const [points, setPoints] = useState<SeriesPoint[]>(() =>
    liveDataStore.getPoints(storeKey)
  );

  useEffect(() => {
    setPoints([...liveDataStore.getPoints(storeKey)]);
    const unsubscribe = liveDataStore.subscribe(storeKey, (updated) => {
      setPoints([...updated]);
    });
    return unsubscribe;
  }, [storeKey]);

  return points;
}
