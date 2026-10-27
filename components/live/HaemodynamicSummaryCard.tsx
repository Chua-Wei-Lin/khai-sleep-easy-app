import React, { useMemo } from "react";
import { View, Text, StyleSheet } from "react-native";
import { useTheme } from "../../theme/ThemeProvider";
import {
  calculateRespiratoryRate,
} from "../../service/HaemodynamicCalculations";
import type { SeriesPoint } from "./useReadingSeries";

type Props = {
  prPoints: SeriesPoint[];
  currentSpo2: number | null;
  currentPr: number | null;
  currentSbp: number | null;
  currentDbp: number | null;
  currentPi?: number | null;
};

export default function HaemodynamicSummaryCard({
  prPoints,
  currentSpo2,
  currentPr,
  currentSbp,
  currentDbp,
  currentPi,
}: Props) {
  const { colors: C } = useTheme();

  const metrics = useMemo(() => {
    const pulseRates = prPoints.map((p) => p.v);
    const rr = pulseRates.length > 5 ? calculateRespiratoryRate(pulseRates) : 0;

    return {
      rr: Math.round(rr),
    };
  }, [prPoints]);

  return (
    <View style={[styles.card, { backgroundColor: C.bg2, borderColor: C.border }]}>
      <Text style={[styles.headerTitle, { color: C.text }]}>Summary</Text>

      {/* Row: Respiratory Rate (Estimated) and Perfusion Index (PI) */}
      <View style={styles.smallRow}>
        <View style={[styles.smallBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.smallLabel, { color: C.sub }]}>Respiratory Rate (Estimated)</Text>
          <Text style={[styles.smallValue, { color: C.tint }]}>
            {metrics.rr > 0 ? metrics.rr : "--"} <Text style={styles.smallUnit}>bpm</Text>
          </Text>
        </View>

        <View style={[styles.smallBox, { backgroundColor: C.card, borderColor: C.border }]}>
          <Text style={[styles.smallLabel, { color: C.sub }]}>Perfusion Index (PI)</Text>
          <Text style={[styles.smallValue, { color: C.tint }]}>
            {currentPi != null ? currentPi.toFixed(1) : "--"} <Text style={styles.smallUnit}>%</Text>
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
    padding: 6,
    alignItems: "center",
  },
  smallLabel: {
    fontSize: 9,
    fontWeight: "500",
    marginBottom: 2,
    textAlign: "center",
  },
  smallValue: {
    fontSize: 14,
    fontWeight: "700",
  },
  smallUnit: {
    fontSize: 10,
    fontWeight: "600",
  },
});
