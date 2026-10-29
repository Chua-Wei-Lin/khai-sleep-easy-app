import React, { useMemo, useState } from "react";
import { LayoutChangeEvent, StyleSheet, Text, View } from "react-native";
import Svg, { Circle, Line, Path, Text as SvgText } from "react-native-svg";
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
  extraHeaderLabel?: string;
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
  extraHeaderLabel,
}: Props) {
  const { colors: C } = useTheme();
  const [width, setWidth] = useState(0);

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(Math.round(e.nativeEvent.layout.width));

  const min = 40;
  const max = 200;
  const ticks = [200, 160, 120, 80, 40];

  const rawSbp = sbpPoints ?? [];
  const rawDbp = dbpPoints ?? [];

  // Synchronize ending timestamps so DBP never trails past SBP when signal stops
  const maxSbpT = rawSbp.length > 0 ? rawSbp[rawSbp.length - 1].t : 0;
  const maxDbpT = rawDbp.length > 0 ? rawDbp[rawDbp.length - 1].t : 0;
  const minLastT = maxSbpT > 0 && maxDbpT > 0 ? Math.min(maxSbpT, maxDbpT) : Math.max(maxSbpT, maxDbpT);

  const safeSbp = useMemo(() => (minLastT > 0 ? rawSbp.filter((p) => p.t <= minLastT) : rawSbp), [rawSbp, minLastT]);
  const safeDbp = useMemo(() => (minLastT > 0 ? rawDbp.filter((p) => p.t <= minLastT) : rawDbp), [rawDbp, minLastT]);

  // Common time boundaries for 100% synchronized X-axis positioning
  const commonT0 = useMemo(() => {
    const minSbp = safeSbp.length > 0 ? safeSbp[0].t : Infinity;
    const minDbp = safeDbp.length > 0 ? safeDbp[0].t : Infinity;
    const m = Math.min(minSbp, minDbp);
    return m === Infinity ? 0 : m;
  }, [safeSbp, safeDbp]);

  const commonTN = useMemo(() => {
    const maxSbp = safeSbp.length > 0 ? safeSbp[safeSbp.length - 1].t : 0;
    const maxDbp = safeDbp.length > 0 ? safeDbp[safeDbp.length - 1].t : 0;
    return Math.max(maxSbp, maxDbp);
  }, [safeSbp, safeDbp]);

  const commonSpan = useMemo(() => {
    const windowMs = 2 * 60 * 1000;
    return Math.max(commonTN - commonT0, windowMs);
  }, [commonT0, commonTN]);

  const buildPath = (points: SeriesPoint[]) => {
    const safePts = points ?? [];
    if (!width || safePts.length === 0 || commonSpan <= 0) return { path: "", lastPointCoord: null };
    const maxPts = Math.max(20, Math.floor(width / 2));
    const step = Math.max(1, Math.ceil(safePts.length / maxPts));
    let d = "";
    let lastX = 0;
    let lastY = 0;

    for (let i = 0; i < safePts.length; i += step) {
      const end = Math.min(safePts.length, i + step);
      let sum = 0;
      for (let k = i; k < end; k++) sum += safePts[k].v;
      const v = Math.min(max, Math.max(min, sum / (end - i)));
      const t = safePts[Math.floor((i + end - 1) / 2)].t;
      const x = ((t - commonT0) / commonSpan) * width;
      const y = ((max - v) / (max - min)) * height;
      if (d === "") {
        d += `M${x.toFixed(1)} ${y.toFixed(1)}`;
      } else {
        d += ` L${x.toFixed(1)} ${y.toFixed(1)}`;
      }
      lastX = x;
      lastY = y;
    }
    return { path: d, lastPointCoord: { x: lastX, y: lastY } };
  };

  const sbpResult = useMemo(() => buildPath(safeSbp), [safeSbp, width, height, commonT0, commonSpan]);
  const dbpResult = useMemo(() => buildPath(safeDbp), [safeDbp, width, height, commonT0, commonSpan]);

  return (
    <View style={[styles.card, { backgroundColor: C.bg2, borderColor: C.border }]}>
      <View style={styles.headRow}>
        <Text style={[styles.title, { color: C.text }]} numberOfLines={1} adjustsFontSizeToFit minimumFontScale={0.75}>
          {title}
        </Text>
        <View style={styles.legendRow}>
          {extraHeaderLabel && <Text style={[styles.legendText, { color: "#5BD68A", marginRight: 4 }]} numberOfLines={1}>{extraHeaderLabel}</Text>}
          <Text style={[styles.legendText, { color: "#E74C3C" }]} numberOfLines={1}>S:{currentSbp}</Text>
          <Text style={[styles.legendText, { color: "#3498DB" }]} numberOfLines={1}> D:{currentDbp}</Text>
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
            {sbpResult.path !== "" && (
              <Path
                d={sbpResult.path}
                fill="none"
                stroke="#E74C3C"
                strokeWidth={2.2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {dbpResult.path !== "" && (
              <Path
                d={dbpResult.path}
                fill="none"
                stroke="#3498DB"
                strokeWidth={2.2}
                strokeLinejoin="round"
                strokeLinecap="round"
              />
            )}
            {sbpResult.lastPointCoord && (
              <Circle
                cx={sbpResult.lastPointCoord.x}
                cy={sbpResult.lastPointCoord.y}
                r={3.5}
                fill="#E74C3C"
                stroke="#ffffff"
                strokeWidth={1}
              />
            )}
            {dbpResult.lastPointCoord && (
              <Circle
                cx={dbpResult.lastPointCoord.x}
                cy={dbpResult.lastPointCoord.y}
                r={3.5}
                fill="#3498DB"
                stroke="#ffffff"
                strokeWidth={1}
              />
            )}
          </Svg>
        )}
      </View>

      <View style={styles.timeRow}>
        <Text style={[styles.time, { color: C.sub }]}>{commonT0 ? clock(commonT0) : ""}</Text>
        <Text style={[styles.time, { color: C.sub }]}>{commonTN ? clock(commonTN) : ""}</Text>
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
    gap: 4,
  },
  title: {
    fontSize: 11,
    fontWeight: "700",
    flexShrink: 1,
  },
  legendRow: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 0,
  },
  legendText: {
    fontSize: 10,
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
