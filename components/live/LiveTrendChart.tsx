import React, { useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, {
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
} from "react-native-svg";
import { useTheme } from "../../theme/ThemeProvider";
import type { SeriesPoint } from "./useReadingSeries";

/** value -> colour; the line is coloured by height, like the ViHealth report */
export type Band = { value: number; color: string };

type Props = {
  title: string;
  unit: string;
  currentLabel: string; // current reading, or "--"
  avgLabel: string; // e.g. "Avg."
  points: SeriesPoint[];
  min: number;
  max: number;
  ticks: number[]; // grid lines, e.g. [100, 90, 80, 70]
  bands: Band[];
  accent: string; // colour of the average
  height?: number;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const clock = (t: number) => {
  const d = new Date(t);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

export default function LiveTrendChart({
  title,
  unit,
  currentLabel,
  avgLabel,
  points,
  min,
  max,
  ticks,
  bands,
  accent,
  height = 28,
}: Props) {
  const { colors: C } = useTheme();
  const [width, setWidth] = useState(0);
  const gradId = useRef(`g${Math.random().toString(36).slice(2, 8)}`).current;

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(Math.round(e.nativeEvent.layout.width));

  const { path, t0, tN } = useMemo(() => {
    if (!width || points.length === 0) return { path: "", t0: 0, tN: 0 };
    const first = points[0].t;
    const last = points[points.length - 1].t;
    const span = Math.max(last - first, 30000); // the line grows from the left edge
    const maxPts = Math.max(20, Math.floor(width / 2)); // at most one point per 2 px
    const step = Math.max(1, Math.ceil(points.length / maxPts));
    const gapMs = Math.max(5000, step * 2000); // a longer pause breaks the line
    let d = "";
    let prevT = -Infinity;

    for (let i = 0; i < points.length; i += step) {
      const end = Math.min(points.length, i + step);
      let sum = 0;
      for (let k = i; k < end; k++) sum += points[k].v;
      const v = Math.min(max, Math.max(min, sum / (end - i)));
      const t = points[Math.floor((i + end - 1) / 2)].t;
      const x = ((t - first) / span) * width;
      const y = ((max - v) / (max - min)) * height;
      if (d === "") {
        d += `M${x.toFixed(1)} ${y.toFixed(1)}`;
      } else if (t - prevT > gapMs) {
        d += ` M${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      prevT = t;
    }
    return { path: d, t0: first, tN: last };
  }, [points, width, min, max, height]);

  const stops = useMemo(
    () =>
      bands
        .map((b) => ({
          offset: Math.min(1, Math.max(0, (max - b.value) / (max - min))),
          color: b.color,
        }))
        .sort((a, b) => a.offset - b.offset),
    [bands, min, max]
  );

  return (
    <View
      style={[styles.card, { backgroundColor: C.bg2, borderColor: C.border }]}
      accessible
      accessibilityLabel={`${title}: ${currentLabel} ${unit}`}>
      <View style={styles.headRow}>
        <Text style={[styles.title, { color: C.text }]}>{title}</Text>
        <Text style={[styles.currentInline, { color: C.tint }]}>
          {currentLabel} <Text style={styles.unitInline}>{unit}</Text>
        </Text>
      </View>

      <View
        onLayout={onLayout}
        style={{
          height,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: C.border,
          overflow: "hidden",
        }}>
        {width > 0 && (
          <Svg width={width} height={height}>
            <Defs>
              <LinearGradient
                id={gradId}
                x1="0"
                y1="0"
                x2="0"
                y2={height}
                gradientUnits="userSpaceOnUse">
                {stops.map((s, i) => (
                  <Stop key={i} offset={s.offset} stopColor={s.color} />
                ))}
              </LinearGradient>
            </Defs>
            {ticks.map((tick) => {
              const y = ((max - tick) / (max - min)) * height;
              return (
                <Line
                  key={tick}
                  x1={0}
                  x2={width}
                  y1={y}
                  y2={y}
                  stroke={C.border}
                  strokeWidth={1}
                />
              );
            })}
            {path !== "" && (
              <Path
                d={path}
                fill="none"
                stroke={`url(#${gradId})`}
                strokeWidth={2.2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
          </Svg>
        )}
      </View>

      <View style={styles.timeRow}>
        <Text style={[styles.time, { color: C.sub }]}>
          {points.length > 0 ? clock(t0) : ""}
        </Text>
        <Text style={[styles.time, { color: C.sub }]}>
          {points.length > 0 ? clock(tN) : ""}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 8,
    marginBottom: 6,
  },
  headRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "700",
  },
  currentInline: {
    fontSize: 15,
    fontWeight: "700",
  },
  unitInline: {
    fontSize: 12,
    fontWeight: "600",
  },
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  time: {
    fontSize: 9,
  },
});
