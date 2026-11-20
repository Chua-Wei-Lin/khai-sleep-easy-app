export type SeriesPoint = { t: number; v: number };

class LiveDataStore {
  private buffers: Record<string, SeriesPoint[]> = {};
  private listeners: Record<string, Set<(points: SeriesPoint[]) => void>> = {};

  public addPoint(
    key: string,
    value: number | null | undefined,
    updatedAt: number | null | undefined,
    isValid: (v: number) => boolean,
    windowMs: number = 30 * 60 * 1000
  ) {
    if (updatedAt == null || value == null || !isValid(value)) return;
    if (!this.buffers[key]) {
      this.buffers[key] = [];
    }
    const buf = this.buffers[key];
    const last = buf[buf.length - 1];
    const tToUse = last && updatedAt <= last.t ? last.t + 250 : updatedAt;
    const cutoff = tToUse - windowMs;
    const next = buf.filter((p) => p.t >= cutoff);
    next.push({ t: tToUse, v: value });
    this.buffers[key] = next;
    this.notify(key);
  }

  public getPoints(key: string): SeriesPoint[] {
    return this.buffers[key] ?? [];
  }

  public subscribe(key: string, callback: (points: SeriesPoint[]) => void) {
    if (!this.listeners[key]) {
      this.listeners[key] = new Set();
    }
    this.listeners[key].add(callback);
    return () => {
      this.listeners[key]?.delete(callback);
    };
  }

  private notify(key: string) {
    const pts = this.buffers[key] ?? [];
    this.listeners[key]?.forEach((cb) => cb(pts));
  }
}

export const liveDataStore = new LiveDataStore();
