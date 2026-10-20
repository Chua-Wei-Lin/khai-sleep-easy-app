import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import {
  calculateRespiratoryRate,
  classifySleepStage,
} from "../../service/HaemodynamicCalculations";
import type { SeriesPoint } from "./useReadingSeries";

type Props = {
  prPoints: SeriesPoint[];
  currentSpo2: number | null;
  currentPr: number | null;
  currentSbp: number | null;
  currentDbp: number | null;
  currentPi?: number | null;
  currentMotion?: number | null;
};

export default function HaemodynamicSummaryCard({
  prPoints,
  currentSpo2,
  currentPr,
  currentSbp,
  currentDbp,
  currentPi,
  currentMotion,
}: Props) {
  const { colors: C } = useTheme();

  const metrics = useMemo(() => {
    const pulseRates = prPoints.map((p) => p.v);
    const rr = pulseRates.length > 5 ? calculateRespiratoryRate(pulseRates) : 0;
    const rmssdForSleep = pulseRates.length > 5 ? 45 : 40; // baseline approximation for sleep estimation

    const sleepStage = classifySleepStage(
      currentPr ?? 75,
      72, // baseline PR
      rmssdForSleep,
      currentSpo2 ?? 98
    );

    return {
      rr: Math.round(rr),
      sleepStage,
    };
  }, [prPoints, currentSpo2, currentPr]);

  return (
    <View style={[styles.card, { backgroundColor: C.bg2, borderColor: C.border }]}>
      <Text style={[styles.headerTitle, { color: C.text }]}>Summary</Text>

      {/* Row 1: Respiratory Rate (Estimated) and Sleep Stage (Estimated) */}
      <View style={styles.smallRow}>
        <View style={[styles.smallBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.smallLabel, { color: C.sub }]}>Respiratory Rate (Estimated)</Text>
          <Text style={[styles.smallValue, { color: C.tint }]}>
            {metrics.rr > 0 ? metrics.rr : "--"} <Text style={styles.smallUnit}>bpm</Text>
          </Text>
        </View>

        <View style={[styles.smallBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.smallLabel, { color: C.sub }]}>Sleep Stage (Estimated)</Text>
          <Text style={[styles.smallValue, { color: C.tint }]}>
            {metrics.sleepStage}
          </Text>
        </View>
      </View>

      {/* Row 2: Perfusion Index (PI) and Motion Index */}
      <View style={[styles.smallRow, { marginTop: 4 }]}>
        <View style={[styles.smallBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.smallLabel, { color: C.sub }]}>Perfusion Index (PI)</Text>
          <Text style={[styles.smallValue, { color: C.tint }]}>
            {currentPi != null ? currentPi.toFixed(1) : "--"} <Text style={styles.smallUnit}>%</Text>
          </Text>
        </View>

        <View style={[styles.smallBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.smallLabel, { color: C.sub }]}>Motion Index</Text>
          <Text style={[styles.smallValue, { color: C.tint }]}>
            {currentMotion != null ? currentMotion : "--"}
          </Text>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: 1,
    padding: 8,
    marginBottom: 6,
  },
  headerTitle: {
    fontSize: 13,
    fontWeight: "700",
    marginBottom: 4,
  },
  smallRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 6,
  },
  smallBox: {
    flex: 1,
    borderRadius: 8,
    borderWidth: 1,
    padding: 5,
    alignItems: "center",
  },
  smallLabel: {
    fontSize: 9,
    fontWeight: "500",
    marginBottom: 2,
    textAlign: "center",
  },
  smallValue: {
    fontSize: 13,
    fontWeight: "700",
  },
  smallUnit: {
    fontSize: 10,
    fontWeight: "600",
  },
});
