import React, { useEffect, useMemo, useState } from "react";
import SettingsList from "../../../components/SettingsList";
import type { Card } from "../../../types/settings";
import { SafeAreaView } from "react-native-safe-area-context";
import AsyncStorage from "@react-native-async-storage/async-storage";

export type VisibleCharts = {
  spo2: boolean;
  pr: boolean;
  bp: boolean;
  rr: boolean;
  motion: boolean;
  ppg: boolean;
};

export const DEFAULT_VISIBLE_CHARTS: VisibleCharts = {
  spo2: true,
  pr: true,
  bp: true,
  rr: true,
  motion: true,
  ppg: true,
};

export const CHART_VISIBILITY_KEY = "settings:visible_charts";

export default function ChartVisibilityScreen() {
  const [charts, setCharts] = useState<VisibleCharts>(DEFAULT_VISIBLE_CHARTS);

  useEffect(() => {
    AsyncStorage.getItem(CHART_VISIBILITY_KEY).then((stored) => {
      if (stored) {
        try {
          setCharts({ ...DEFAULT_VISIBLE_CHARTS, ...JSON.parse(stored) });
        } catch {}
      }
    });
  }, []);

  const toggleChart = async (id: keyof VisibleCharts, value: boolean) => {
    const next = { ...charts, [id]: value };
    setCharts(next);
    await AsyncStorage.setItem(CHART_VISIBILITY_KEY, JSON.stringify(next));
  };

  const cards: Card[] = useMemo(
    () => [
      {
        id: "visible-charts-section",
        sectionLabel: "Dashboard Charts Visibility",
        rows: [
          {
            id: "spo2",
            type: "switch",
            title: "Oxygen Level Chart",
            icon: "water-outline",
            switchValue: charts.spo2,
          },
          {
            id: "pr",
            type: "switch",
            title: "Pulse Rate Chart",
            icon: "heart-outline",
            switchValue: charts.pr,
          },
          {
            id: "bp",
            type: "switch",
            title: "Blood Pressure Chart",
            icon: "fitness-outline",
            switchValue: charts.bp,
          },
          {
            id: "rr",
            type: "switch",
            title: "Respiratory Rate Chart",
            icon: "pulse-outline",
            switchValue: charts.rr,
          },
          {
            id: "motion",
            type: "switch",
            title: "Motion Chart",
            icon: "walk-outline",
            switchValue: charts.motion,
          },
          {
            id: "ppg",
            type: "switch",
            title: "PPG Waveform Chart",
            icon: "stats-chart-outline",
            switchValue: charts.ppg,
          },
        ],
      },
    ],
    [charts]
  );

  return (
    <SafeAreaView edges={["left", "right"]} style={{ flex: 1 }}>
      <SettingsList
        cards={cards}
        ctaFlag={{ enabled: false }}
        switchValues={charts as any}
        onToggleSwitch={(id, next) => toggleChart(id as keyof VisibleCharts, next)}
      />
    </SafeAreaView>
  );
}
