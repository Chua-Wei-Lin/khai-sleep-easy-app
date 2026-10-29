import React, { useMemo, useRef, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Defs,
  Line,
  LinearGradient,
  Path,
  Stop,
  Text as SvgText,
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
  extraLabel?: string;
  windowMs?: number; // custom rolling window duration (default 2 mins)
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
  extraLabel,
  windowMs = 2 * 60 * 1000,
}: Props) {
  const { colors: C } = useTheme();
  const [width, setWidth] = useState(0);
  const gradId = useRef(`g${Math.random().toString(36).slice(2, 8)}`).current;
  const fillGradId = useRef(`fg${Math.random().toString(36).slice(2, 8)}`).current;

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(Math.round(e.nativeEvent.layout.width));

  const safePoints = points ?? [];

  const { path, areaPath, t0, tN, lastPointCoord } = useMemo(() => {
    if (!width || safePoints.length === 0) return { path: "", areaPath: "", t0: 0, tN: 0, lastPointCoord: null };
    const first = safePoints[0].t;
    const last = safePoints[safePoints.length - 1].t;
    const span = Math.max(last - first, windowMs); // progress over specified windowMs

    let dLine = "";
    let dArea = "";
    let subStartX = 0;
    let prevX = 0;
    let prevY = 0;
    let inSub = false;

    if (safePoints.length === 1) {
      const v = Math.min(max, Math.max(min, safePoints[0].v));
      const y = ((max - v) / (max - min)) * height;
      dLine = `M0 ${y.toFixed(1)} L${width.toFixed(1)} ${y.toFixed(1)}`;
      dArea = `M0 ${y.toFixed(1)} L${width.toFixed(1)} ${y.toFixed(1)} L${width.toFixed(1)} ${height} L0 ${height} Z`;
      return { path: dLine, areaPath: dArea, t0: first, tN: last, lastPointCoord: { x: width, y } };
    }

    for (let i = 0; i < safePoints.length; i++) {
      const p = safePoints[i];
      const v = Math.min(max, Math.max(min, p.v));
      const x = ((p.t - first) / span) * width;
      const y = ((max - v) / (max - min)) * height;

      if (!inSub) {
        dLine += `M${x.toFixed(1)} ${y.toFixed(1)}`;
        dArea += `M${x.toFixed(1)} ${y.toFixed(1)}`;
        subStartX = x;
        inSub = true;
      } else {
        dLine += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
        dArea += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }

      prevX = x;
      prevY = y;
    }

    if (inSub) {
      dArea += ` L${prevX.toFixed(1)} ${height} L${subStartX.toFixed(1)} ${height} Z`;
    }

    return { path: dLine, areaPath: dArea, t0: first, tN: last, lastPointCoord: inSub ? { x: prevX, y: prevY } : null };
  }, [safePoints, width, min, max, height, windowMs]);

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
        <Text style={[styles.title, { color: C.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.8}>
          {title}
        </Text>
        <View style={{ flexDirection: "row", alignItems: "baseline", gap: 4, flexShrink: 0 }}>
          {extraLabel && <Text style={{ fontSize: 11, fontWeight: "700", color: "#5BD68A" }} numberOfLines={1}>{extraLabel}</Text>}
          <Text style={[styles.currentInline, { color: C.tint }]} numberOfLines={1}>
            {currentLabel} <Text style={styles.unitInline}>{unit}</Text>
          </Text>
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
              <LinearGradient
                id={fillGradId}
                x1="0"
                y1="0"
                x2="0"
                y2={height}
                gradientUnits="userSpaceOnUse">
                <Stop offset="0" stopColor={accent} stopOpacity={0.45} />
                <Stop offset="1" stopColor={accent} stopOpacity={0.05} />
              </LinearGradient>
            </Defs>
            {ticks.map((tick) => {
              const y = ((max - tick) / (max - min)) * height;
              return (
                <React.Fragment key={tick}>
                  <Line
                    x1={0}
                    x2={width}
                    y1={y}
                    y2={y}
                    stroke={C.border}
                    strokeWidth={1}
                  />
                  <SvgText
                    x={4}
                    y={y <= 10 ? 9 : y >= height - 4 ? height - 2 : y + 3}
                    fill={C.sub}
                    fontSize={9}
                    fontWeight="500">
                    {tick}
                  </SvgText>
                </React.Fragment>
              );
            })}
            {areaPath !== "" && (
              <Path
                d={areaPath}
                fill={`url(#${fillGradId})`}
              />
            )}
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
            {lastPointCoord && (
              <Circle
                cx={lastPointCoord.x}
                cy={lastPointCoord.y}
                r={3.5}
                fill={accent}
                stroke="#ffffff"
                strokeWidth={1}
              />
            )}
          </Svg>
        )}
      </View>

      <View style={styles.timeRow}>
        <Text style={[styles.time, { color: C.sub }]}>
          {safePoints.length > 0 ? clock(t0) : ""}
        </Text>
        <Text style={[styles.time, { color: C.sub }]}>
          {safePoints.length > 0 ? clock(tN) : ""}
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
    gap: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
  },
  currentInline: {
    fontSize: 13,
    fontWeight: "700",
    flexShrink: 0,
  },
  unitInline: {
    fontSize: 10,
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
