import React, { useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Line } from "react-native-svg";
import { useTheme } from "../../theme/ThemeProvider";
import type { SeriesPoint } from "./useReadingSeries";

type Props = {
  title: string;
  currentLabel: string;
  points: SeriesPoint[];
  height?: number;
};

const pad2 = (n: number) => String(n).padStart(2, "0");
const clock = (t: number) => {
  const d = new Date(t);
  return `${pad2(d.getHours())}:${pad2(d.getMinutes())}:${pad2(d.getSeconds())}`;
};

export default function LiveMotionBarChart({
  title,
  currentLabel,
  points,
  height = 38,
}: Props) {
  const { colors: C } = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(Math.round(e.nativeEvent.layout.width));

  const max = 100;
  const t0 = points.length > 0 ? points[0].t : 0;
  const tN = points.length > 0 ? points[points.length - 1].t : 0;
  const span = Math.max(tN - t0, 30000);

  return (
    <View style={[styles.card, { backgroundColor: C.bg2, borderColor: C.border }]}>
      <View style={styles.headRow}>
        <Text style={[styles.title, { color: C.text }]}>{title}</Text>
        <Text style={[styles.currentInline, { color: "#F5A25D" }]}>
          {currentLabel}
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
            {/* Grid baseline */}
            <Line
              x1={0}
              x2={width}
              y1={height}
              y2={height}
              stroke={C.border}
              strokeWidth={1}
            />
            {/* Vertical Bars */}
            {points.map((p, idx) => {
              const x = ((p.t - t0) / span) * width;
              const v = Math.min(max, Math.max(0, p.v));
              if (v <= 0) return null;
              const barHeight = (v / max) * height;
              const y = height - barHeight;
              return (
                <Line
                  key={idx}
                  x1={x}
                  x2={x}
                  y1={height}
                  y2={Math.max(0, y)}
                  stroke="#F5A25D"
                  strokeWidth={1.8}
                />
              );
            })}
          </Svg>
        )}
      </View>

      <View style={styles.timeRow}>
        <Text style={[styles.time, { color: C.sub }]}>{points.length > 0 ? clock(t0) : ""}</Text>
        <Text style={[styles.time, { color: C.sub }]}>{points.length > 0 ? clock(tN) : ""}</Text>
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
  timeRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 2,
  },
  time: {
    fontSize: 9,
  },
});
