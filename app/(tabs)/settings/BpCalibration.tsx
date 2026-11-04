import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../theme/ThemeProvider";
import { useRouter } from "expo-router";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as O2Ring from "@ios-app/viatom-o2ring";
import { useO2Ring } from "../../../service/O2RingProvider";

export const BP_CALIBRATION_KEY = "settings:bp_calibration";

export default function BpCalibrationScreen() {
  const { colors: C, fonts: F } = useTheme();
  const router = useRouter();
  const { addCalibrationTimestamp } = useO2Ring();
  const [sbp, setSbp] = useState("120.0");
  const [dbp, setDbp] = useState("80.0");

  useEffect(() => {
    AsyncStorage.getItem(BP_CALIBRATION_KEY).then((stored) => {
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          if (parsed.sbp != null) setSbp(String(parsed.sbp));
          if (parsed.dbp != null) setDbp(String(parsed.dbp));
        } catch {}
      }
    });
  }, []);

  const handleSave = async () => {
    const sbpNum = parseFloat(sbp);
    const dbpNum = parseFloat(dbp);
    if (isNaN(sbpNum) || isNaN(dbpNum) || sbpNum <= dbpNum || sbpNum > 220 || dbpNum < 30) {
      Alert.alert("Invalid Values", "Please enter valid baseline blood pressure values (SBP must be greater than DBP).");
      return;
    }

    const now = Date.now();
    let historyTimes: number[] = [];
    try {
      const stored = await AsyncStorage.getItem(BP_CALIBRATION_KEY);
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed.calibrationTimes)) {
          historyTimes = parsed.calibrationTimes;
        } else if (parsed.calibrationTime != null) {
          historyTimes = [parsed.calibrationTime];
        }
      }
    } catch {}

    historyTimes.push(now);
    addCalibrationTimestamp?.(now);

    const payload = {
      sbp: sbpNum,
      dbp: dbpNum,
      calibrationTime: now,
      calibrationTimes: historyTimes,
      calibrationCount: historyTimes.length,
    };
    await AsyncStorage.setItem(BP_CALIBRATION_KEY, JSON.stringify(payload));
    try {
      // @ts-ignore
      if (O2Ring.setBpCalibration) {
        await O2Ring.setBpCalibration(Math.round(sbpNum), Math.round(dbpNum));
      }
    } catch {}

    router.replace("/(tabs)/home");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]} edges={["bottom", "left", "right"]}>
      <View style={{ padding: 12, paddingTop: 4 }}>
        <Text style={[styles.subtitle, { color: C.text, opacity: 0.85 }]}>
          Enter baseline blood pressure values measured from a standard arm cuff for personal calibration.
        </Text>

        <View style={[styles.card, { backgroundColor: C.bg2, borderColor: C.border }]}>
          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: C.text }]}>Baseline Systolic (SBP, mmHg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
              keyboardType="decimal-pad"
              value={sbp}
              onChangeText={setSbp}
              placeholder="120.0"
              placeholderTextColor={C.sub}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={[styles.label, { color: C.text }]}>Baseline Diastolic (DBP, mmHg)</Text>
            <TextInput
              style={[styles.input, { backgroundColor: C.bg, color: C.text, borderColor: C.border }]}
              keyboardType="decimal-pad"
              value={dbp}
              onChangeText={setDbp}
              placeholder="80.0"
              placeholderTextColor={C.sub}
            />
          </View>
        </View>

        <TouchableOpacity
          onPress={handleSave}
          style={[styles.button, { backgroundColor: C.tint }]}
          activeOpacity={0.85}>
          <Text style={[F.buttonText, { color: C.white, fontSize: 13 }]}>Save Calibration</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  subtitle: { fontSize: 11, marginBottom: 12, lineHeight: 15 },
  card: { borderRadius: 12, borderWidth: StyleSheet.hairlineWidth, padding: 12, marginBottom: 12 },
  inputGroup: { marginBottom: 10 },
  label: { fontSize: 11, fontWeight: "700", marginBottom: 4 },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 8, padding: 8, fontSize: 13, fontWeight: "600" },
  button: { marginTop: 4, height: 40, borderRadius: 8, alignItems: "center", justifyContent: "center" },
});
