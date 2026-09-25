import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../theme/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { useLocalSearchParams } from "expo-router";
import React, { useEffect, useMemo, useState } from "react";
import {
  View,
  StyleSheet,
  ActivityIndicator,
  Dimensions,
  Text,
  Alert,
  TextInput,
  ScrollView,
} from "react-native";
import { CartesianChart, Line } from "victory-native";
import { File as ExpoFile } from "expo-file-system";
import { useTranslation } from "react-i18next";
import { getO2dataDir } from "../../../service/History";
import { useFont } from "@shopify/react-native-skia";

type Row = { t: number; spo2: number; pr: number }; // ms timestamp, SpO2, Pulse
type PpgRow = { index: number; ppg: number }; // Sample Index, Raw PPG Value

const { height } = Dimensions.get("window");

/**
 * Parse Date Time into epoch ms number
 */
function parseNonISOTime(timeStr: string): number | null {
  {
    const m = timeStr.match(
      /^(\d{4})-(\d{2})-(\d{2})\s+(\d{2}):(\d{2}):(\d{2})$/
    );
    if (m) {
      const [, yyyyStr, monStr, ddStr, hhStr, mmStr, ssStr] = m;
      const yyyy = Number(yyyyStr);
      const mon = Number(monStr) - 1;
      const dd = Number(ddStr);
      const hh = Number(hhStr);
      const min = Number(mmStr);
      const ss = Number(ssStr);
      const ms = new Date(yyyy, mon, dd, hh, min, ss).getTime();
      if (!Number.isNaN(ms)) return ms;
    }
  }

  {
    const iso = Date.parse(timeStr);
    if (!Number.isNaN(iso)) return iso;
  }

  {
    const months: Record<string, number> = {
      Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
      Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
    };

    const m = timeStr.match(
      /^(\d{2}):(\d{2}):(\d{2})\s+([A-Za-z]{3})\s+(\d{1,2})\s+(\d{4})$/
    );
    if (m) {
      const [, HH, MM, SS, mon, ddStr, yyyyStr] = m;
      const monthIndex = months[mon];
      if (monthIndex == null) return null;

      const yyyy = Number(yyyyStr);
      const dd = Number(ddStr);
      const hh = Number(HH);
      const min = Number(MM);
      const ss = Number(SS);

      const ms = new Date(yyyy, monthIndex, dd, hh, min, ss).getTime();
      if (!Number.isNaN(ms)) return ms;
    }
  }

  {
    const m = timeStr.match(
      /^(\d{2}):(\d{2}):(\d{2})\s+(\d{2})\/(\d{2})\/(\d{4})$/
    );
    if (m) {
      const [, HH, MM, SS, ddStr, mon, yyyyStr] = m;
      const dd = Number(ddStr);
      const monthIndex = Number(mon);
      const yyyy = Number(yyyyStr);
      const hh = Number(HH);
      const min = Number(MM);

      const ms = new Date(yyyy, monthIndex, dd, hh, min, 0).getTime();
      if (!Number.isNaN(ms)) return ms;
    }
  }

  return null;
}

/**
 * Parse standard SpO2 / PR CSV text into rows
 */
function parseCsvToRows(csvText: string): Row[] {
  const lines = csvText.replace(/\r\n?/g, "\n").split("\n").filter(Boolean);
  if (lines.length <= 1) return [];

  const header = lines[0].split(",").map((h) => h.trim());
  const idxTime = header.findIndex((h) => /^time$/i.test(h));
  const idxSpO2 = header.findIndex((h) => /^oxygen level$/i.test(h));
  const idxPR = header.findIndex((h) => /^pulse rate$/i.test(h));
  if (idxTime === -1 || idxSpO2 === -1 || idxPR === -1) return [];

  const out: Row[] = [];
  for (let i = 1; i < lines.length; i++) {
    const cols = lines[i].split(",");
    if (cols.length <= Math.max(idxTime, idxSpO2, idxPR)) continue;

    const timeStr = (cols[idxTime] ?? "").trim();
    const spo2Str = (cols[idxSpO2] ?? "").trim();
    const prStr = (cols[idxPR] ?? "").trim();

    const toNum = (s: string) => Number((s.match(/[\d.]+/) ?? [""])[0]);

    const t = parseNonISOTime(timeStr);
    const spo2 = toNum(spo2Str);
    const pr = toNum(prStr);

    if (t != null && !Number.isNaN(spo2) && !Number.isNaN(pr)) {
      out.push({ t, spo2, pr });
    }
  }
  return out;
}

/**
 * Parse Raw PPG CSV text (sample_index, raw_ppg_value) with downsampling support
 */
function parsePpgCsvToRows(csvText: string): PpgRow[] {
  const lines = csvText.replace(/\r\n?/g, "\n").split("\n").filter(Boolean);
  if (lines.length <= 1) return [];

  const header = lines[0].split(",").map((h) => h.trim().toLowerCase());
  const idxIndex = header.findIndex((h) => h.includes("index") || h === "sample_index");
  const idxPpg = header.findIndex((h) => h.includes("ppg") || h.includes("raw"));

  const out: PpgRow[] = [];
  // Downsample if more than 20,000 samples to maintain smooth graph rendering
  const step = Math.max(1, Math.floor(lines.length / 20000));

  for (let i = 1; i < lines.length; i += step) {
    const cols = lines[i].split(",");
    const rawIdx = idxIndex !== -1 ? Number(cols[idxIndex]) : i - 1;
    const rawPpg = idxPpg !== -1 ? Number(cols[idxPpg]) : Number(cols[1] ?? cols[0]);

    if (!Number.isNaN(rawPpg)) {
      out.push({ index: Number.isNaN(rawIdx) ? i - 1 : rawIdx, ppg: rawPpg });
    }
  }
  return out;
}

export default function DetailedReport() {
  const { colors: C, fonts: F } = useTheme();
  const { t } = useTranslation();
  const roboto = useFont(
    require("../../../assets/fonts/Roboto-Regular.ttf"),
    12
  );
  const { id } = useLocalSearchParams<{ id: string }>();

  const [rows, setRows] = useState<Row[] | null>(null);
  const [ppgRows, setPpgRows] = useState<PpgRow[] | null>(null);
  const [notes, setNotes] = useState("");
  const [loading, setLoading] = useState(true);
  const [patientID, setPatientID] = useState<string>("");

  const isPpg = useMemo(() => id?.toLowerCase().includes("ppg") ?? false, [id]);

  useEffect(() => {
    (async () => {
      try {
        const storedId = await AsyncStorage.getItem("patientID");
        if (storedId) setPatientID(storedId);
      } catch (error) {
        console.warn("Error@DetailedReport.tsx/useEffect:", error);
      }
    })();
  }, []);

  useEffect(() => {
    let cancelled = false;

    (async () => {
      if (!id || !patientID) return;

      setLoading(true);

      try {
        const o2dataDir = getO2dataDir(patientID);
        const file = new ExpoFile(o2dataDir, id);
        const text = await file.text();

        if (!cancelled) {
          if (isPpg) {
            const data = parsePpgCsvToRows(text);
            setPpgRows(data);
          } else {
            const data = parseCsvToRows(text);
            setRows(data);
          }
        }
      } catch (error) {
        console.warn("Error@DetailedReport.tsx/useEffect:", error);
        Alert.alert(t("error"), t("failedToLoadData"));
        if (!cancelled) {
          setRows([]);
          setPpgRows([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();

    return () => {
      cancelled = true;
    };
  }, [id, patientID, isPpg]);

  const data = useMemo(() => {
    if (!rows) return [];
    return [...rows].sort((a, b) => a.t - b.t);
  }, [rows]);

  if (loading) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: C.bg,
          justifyContent: "center",
          alignItems: "center",
        }}>
        <ActivityIndicator />
      </SafeAreaView>
    );
  }

  const hasNoData = isPpg ? !ppgRows || !ppgRows.length : !data.length;

  if (hasNoData) {
    return (
      <SafeAreaView
        style={{
          flex: 1,
          backgroundColor: C.bg,
          justifyContent: "center",
          alignItems: "center",
        }}>
        <Text style={{ color: C.text, ...F.sectionLabel }}>No Data Found</Text>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView
      style={{ flex: 1, backgroundColor: C.bg, padding: 16 }}
      edges={["left", "right"]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        {!isPpg && data.length > 0 && (
          <Text style={[{ color: C.text, marginBottom: 10, ...F.sectionLabel }]}>
            {new Date(data[0]?.t).toLocaleString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
            {" - "}
            {new Date(data[data.length - 1]?.t).toLocaleString("en-GB", {
              year: "numeric",
              month: "short",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
              second: "2-digit",
            })}
          </Text>
        )}

        {isPpg ? (
          /* --- RAW PPG WAVEFORM CHART --- */
          <View style={styles.chartContainer}>
            <Text
              style={[
                { color: C.text, ...F.title, fontSize: 20, marginBottom: 5 },
              ]}>
              Raw PPG Waveform
            </Text>
            <CartesianChart
              data={ppgRows ?? []}
              xKey="index"
              yKeys={["ppg"]}
              xAxis={{
                font: roboto,
                labelColor: C.text,
                lineColor: C.text,
                formatXLabel: (v) => `${Math.round(Number(v) / 50)}s`,
                tickCount: 5,
              }}
              yAxis={[
                {
                  font: roboto,
                  labelColor: C.text,
                  lineColor: C.text,
                },
              ]}>
              {({ points }) => <Line points={points.ppg} color="red" strokeWidth={1.5} />}
            </CartesianChart>
          </View>
        ) : (
          /* --- STANDARD SPO2 & PULSE RATE CHARTS --- */
          <>
            <View style={styles.chartContainer}>
              <Text
                style={[
                  { color: C.text, ...F.title, fontSize: 20, marginBottom: 5 },
                ]}>
                {t("spo2")}
              </Text>
              <CartesianChart
                data={data}
                xKey="t"
                yKeys={["spo2"]}
                xAxis={{
                  font: roboto,
                  labelColor: C.text,
                  lineColor: C.text,
                  formatXLabel: (v) =>
                    new Date(Number(v)).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  tickCount: 5,
                }}
                yAxis={[
                  {
                    font: roboto,
                    labelColor: C.text,
                    lineColor: C.text,
                  },
                ]}
                domain={{ y: [75, 100] }}>
                {({ points }) => <Line points={points.spo2} color="green" />}
              </CartesianChart>
            </View>

            <View style={styles.chartContainer}>
              <Text
                style={[
                  { color: C.text, ...F.title, fontSize: 20, marginBottom: 5 },
                ]}>
                {t("pulseRate")}
              </Text>
              <CartesianChart
                data={data}
                xKey="t"
                yKeys={["pr"]}
                xAxis={{
                  font: roboto,
                  labelColor: C.text,
                  lineColor: C.text,
                  formatXLabel: (v) =>
                    new Date(Number(v)).toLocaleTimeString("en-GB", {
                      hour: "2-digit",
                      minute: "2-digit",
                    }),
                  tickCount: 5,
                }}
                yAxis={[
                  {
                    font: roboto,
                    labelColor: C.text,
                    lineColor: C.text,
                  },
                ]}
                domain={{ y: [30, 120] }}>
                {({ points }) => <Line points={points.pr} color={"green"} />}
              </CartesianChart>
            </View>
          </>
        )}

        {/* Notes */}
        <View style={styles.notesTitleContainer}>
          <Text style={[{ color: C.sub, ...F.sectionLabel }]}>{t("notes")}</Text>
        </View>
        <View
          style={[
            styles.notesRow,
            {
              borderColor: C.border,
              backgroundColor: C.bg,
            },
          ]}>
          <TextInput
            value={notes}
            onChangeText={setNotes}
            placeholder={t("notes")}
            placeholderTextColor={C.sub}
            autoCapitalize="none"
            underlineColorAndroid={"transparent"}
            style={{ color: C.text }}
          />
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  chartContainer: {
    width: "100%",
    height: height * 0.35,
    paddingBottom: 10,
  },
  notesTitleContainer: { paddingHorizontal: 5, marginTop: 12, marginBottom: 8 },

  notesRow: {
    minHeight: 56,
    width: "100%",
    borderWidth: StyleSheet.hairlineWidth,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
  },
});