import React, { useEffect, useState } from "react";
import { StyleSheet, Text, View, TextInput, TouchableOpacity, Alert } from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../../../theme/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as O2Ring from "@ios-app/viatom-o2ring";

export const BP_CALIBRATION_KEY = "settings:bp_calibration";

export default function BpCalibrationScreen() {
  const { colors: C, fonts: F } = useTheme();
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

    const payload = { sbp: sbpNum, dbp: dbpNum };
    await AsyncStorage.setItem(BP_CALIBRATION_KEY, JSON.stringify(payload));
    try {
      // @ts-ignore
      if (O2Ring.setBpCalibration) {
        await O2Ring.setBpCalibration(Math.round(sbpNum), Math.round(dbpNum));
      }
    } catch {}

    Alert.alert("Success", "Baseline blood pressure calibration saved successfully.");
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: C.bg }]}>
      <View style={{ padding: 20 }}>
        <Text style={[styles.title, { color: C.text }]}>Blood Pressure Calibration</Text>
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
          <Text style={[F.buttonText, { color: C.white }]}>Save Calibration</Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  title: { fontSize: 20, fontWeight: "800", marginBottom: 8 },
  subtitle: { fontSize: 13, marginBottom: 20, lineHeight: 18 },
  card: { borderRadius: 16, borderWidth: StyleSheet.hairlineWidth, padding: 16, marginBottom: 16 },
  inputGroup: { marginBottom: 16 },
  label: { fontSize: 14, fontWeight: "700", marginBottom: 8 },
  input: { borderWidth: StyleSheet.hairlineWidth, borderRadius: 12, padding: 12, fontSize: 16, fontWeight: "600" },
  button: { marginTop: 8, height: 48, borderRadius: 12, alignItems: "center", justifyContent: "center" },
});
