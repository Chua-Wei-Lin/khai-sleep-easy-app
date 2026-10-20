import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { useTheme } from "../../theme/ThemeProvider";
import type { SeriesPoint } from "./useReadingSeries";

type Props = {
  title: string;
  unit: string;
  currentSbp: string;
  currentDbp: string;
  sbpPoints: SeriesPoint[];
  dbpPoints: SeriesPoint[];
  height?: number;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const clock = (t: number) => {
  const d = new Date(t);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

export default function LiveBpTrendChart({
  title,
  unit,
  currentSbp,
  currentDbp,
  sbpPoints,
  dbpPoints,
  height = 28,
}: Props) {
  const { colors: C } = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(Math.round(e.nativeEvent.layout.width));

  const min = 40;
  const max = 180;
  const ticks = [160, 120, 80, 40];

  const buildPath = (points: SeriesPoint[]) => {
    if (!width || points.length === 0) return { path: "", t0: 0, tN: 0 };
    const first = points[0].t;
    const last = points[points.length - 1].t;
    const span = Math.max(last - first, 30000);
    const maxPts = Math.max(20, Math.floor(width / 2));
    const step = Math.max(1, Math.ceil(points.length / maxPts));
    const gapMs = Math.max(5000, step * 2000);
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
  };

  const sbpResult = useMemo(() => buildPath(sbpPoints), [sbpPoints, width, height]);
  const dbpResult = useMemo(() => buildPath(dbpPoints), [dbpPoints, width, height]);

  const t0 = sbpPoints.length > 0 ? sbpPoints[0].t : dbpPoints.length > 0 ? dbpPoints[0].t : 0;
  const tN = sbpPoints.length > 0 ? sbpPoints[sbpPoints.length - 1].t : dbpPoints.length > 0 ? dbpPoints[dbpPoints.length - 1].t : 0;

  return (
    <View style={[styles.card, { backgroundColor: C.bg2, borderColor: C.border }]}>
      <View style={styles.headRow}>
        <Text style={[styles.title, { color: C.text }]}>{title}</Text>
        <View style={styles.legendRow}>
          <Text style={[styles.legendText, { color: C.tint }]}>S:{currentSbp}</Text>
          <Text style={[styles.legendText, { color: "#F5B031" }]}> D:{currentDbp}</Text>
        </View>
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
            {sbpResult.path !== "" && (
              <Path
                d={sbpResult.path}
                fill="none"
                stroke={C.tint}
                strokeWidth={2.2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {dbpResult.path !== "" && (
              <Path
                d={dbpResult.path}
                fill="none"
                stroke="#F5B031"
                strokeWidth={2.2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
          </Svg>
        )}
      </View>

      <View style={styles.timeRow}>
        <Text style={[styles.time, { color: C.sub }]}>{t0 ? clock(t0) : ""}</Text>
        <Text style={[styles.time, { color: C.sub }]}>{tN ? clock(tN) : ""}</Text>
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
    alignItems: "center",
    marginBottom: 2,
  },
  title: {
    fontSize: 13,
    fontWeight: "600",
  },
  legendRow: {
    flexDirection: "row",
  },
  legendText: {
    fontSize: 11,
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
