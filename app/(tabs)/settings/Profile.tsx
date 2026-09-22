import React, { useMemo, useState, useCallback } from "react";
import SettingsList from "../../../components/SettingsList";
import type { Card } from "../../../types/settings";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  Alert,
  ActivityIndicator,
  Platform,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { useFocusEffect } from "expo-router";
import { useTheme } from "../../../theme/ThemeProvider";
import api from "../../../api/api";
import NetInfo from "@react-native-community/netinfo";
import DateTimePicker from "@react-native-community/datetimepicker";

export default function Profile() {
  const { t } = useTranslation();
  const { colors: C, fonts: F } = useTheme();

  const [loading, setLoading] = useState(true);
  const [showDobPicker, setShowDobPicker] = useState(false);

  const [formValues, setFormValues] = useState<{ [key: string]: string }>({});

  const mapPatient = useCallback((p: any) => {
    return {
      patientName: p?.name ?? "",
      dob: p?.birthdate ?? "",
      contact: p?.telephone_number ?? "",
      email: p?.email ?? "",
    };
  }, []);

  /**
   * Load stored profile data when screen is focused
   */
  useFocusEffect(
    useCallback(() => {
      let isActive = true; // avoid setState after unmount

      // Helper to map API patient object to form values
      // Load patient information from AsyncStorage cache
      const loadFromCache = async () => {
        const [storedID, patientData] = await Promise.all([
          AsyncStorage.getItem("patientID"),
          AsyncStorage.getItem("patientData"),
        ]);

        const id = storedID?.trim();

        // Set ID field
        if (isActive && id) {
          setFormValues((prev) => ({ ...prev, "patient-id": id }));
        }

        // Set patient data from cache if available
        if (isActive && patientData) {
          try {
            const cached = JSON.parse(patientData);
            setFormValues((prev) => ({ ...prev, ...mapPatient(cached) }));
          } catch (e) {
            console.error("Error@Profile.tsx/loadFromCache:", e);
          }
        }
        return id;
      };

      const fetchFromServer = async (id: string) => {
        if (!id) return;

        const ETAG = await AsyncStorage.getItem("patientETag");

        const res = await api.get(
          `sleep_easy_app/get_patient_details_with_id.php`,
          {
            params: { patient_id: Number(id) },
            headers: ETAG ? { "If-None-Match": ETAG } : undefined,
            validateStatus: (status) =>
              (status >= 200 && status < 300) || status === 304,
          }
        );

        if (res.status === 200) {
          const body = res.data;

          if (body.status !== 200) {
            console.warn("API ERROR@Profile.tsx: ", body.msg);
            await AsyncStorage.removeItem("patientData");
            return;
          }

          const p = body.patient;

          await AsyncStorage.setItem("patientData", JSON.stringify(p));
          const etag = res.headers?.etag;
          if (etag) await AsyncStorage.setItem("patientETag", etag);

          if (isActive && p) {
            setFormValues((prev) => ({ ...prev, ...mapPatient(p) }));
          }
        }
      };

      (async () => {
        setLoading(true);
        try {
          const id = await loadFromCache();
          const netState = await NetInfo.fetch();

          if (!id) return;

          if (netState.isConnected) {
            await fetchFromServer(id);
          }
        } catch (error) {
          console.error("Error@Profile.tsx/useFocusEffect:", error);
          Alert.alert("Error", "Could not load profile. Please try again.");
        } finally {
          if (isActive) setLoading(false);
        }
      })();

      return () => {
        isActive = false;
      };
    }, [mapPatient])
  );

  /**
   * Handler for form field changes
   * @param id Forms value to be changed
   * @param value Updated values
   */
  const onChangeField = (id: string, value: string) => {
    setFormValues((prev) => ({ ...prev, [id]: value }));
  };

  const parseDob = (value?: string) => {
    if (!value) return new Date();
    const parts = value.split("-");
    if (parts.length === 3) {
      const [y, m, d] = parts.map(Number);
      if (y && m && d) return new Date(y, m - 1, d);
    }
    const fallback = new Date(value);
    return Number.isNaN(fallback.getTime()) ? new Date() : fallback;
  };

  const formatDob = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    return `${yyyy}-${mm}-${dd}`;
  };

  const onDobChange = (_event: unknown, date?: Date) => {
    if (Platform.OS === "android") setShowDobPicker(false);
    if (date) onChangeField("dob", formatDob(date));
  };

  /**
   * Handler to save profile information
   */
  const onSaveProfile = async () => {
    try {
      const id = (formValues["patient-id"] ?? "").trim();
      if (!id) {
        Alert.alert(t("error"), "Missing patient ID.");
        return;
      }

      const payload = new FormData();
      payload.append("patient_id", id);
      payload.append("name", formValues.patientName ?? "");
      payload.append("birthdate", formValues.dob ?? "");
      payload.append("telephone_number", formValues.contact ?? "");
      payload.append("email", formValues.email ?? "");

      const res = await api.post(
        `sleep_easy_app/update_patient_details_with_id.php`,
        payload,
        { headers: { "Content-Type": "multipart/form-data" } }
      );

      const ok = res?.data?.status === 200;
      const patient = res?.data?.patient;

      if (patient) {
        await AsyncStorage.setItem("patientData", JSON.stringify(patient));
        setFormValues((prev) => ({ ...prev, ...mapPatient(patient) }));
      }

      if (!ok) {
        throw new Error(res?.data?.msg || "Save failed");
      }

      await AsyncStorage.setItem("patientID", id);
      Alert.alert(t("profileSaved"), t("profileSavedMessage"));
    } catch (error) {
      console.error("Error@Profile.tsx/onSaveProfile:", error);
      Alert.alert(t("error"), "Could not save profile. Please try again.");
    }
  };

  // Layout cards for SettingsList
  const cards: Card[] = useMemo(
    () => [
      {
        id: "profile",
        sectionLabel: t("userInformation"),
        rows: [
          // { id: "patient-id", type: "text-input", title: "ID *" },
          {
            id: "patientName",
            type: "text-input",
            title: t("name") + " *",
            icon: "person-circle-outline",
          },
          {
            id: "dob",
            type: "date",
            title: t("dateOfBirth") + " *",
            icon: "calendar-outline",
            onPress: () => setShowDobPicker(true),
          },
        ],
      },
      {
        id: "contacts",
        sectionLabel: t("contacts"),
        rows: [
          {
            id: "contact",
            type: "text-input",
            title: t("contactNumber") + " *",
            icon: "call",
          },
          {
            id: "email",
            type: "text-input",
            title: t("email") + " *",
            icon: "mail",
            textInputProps: {
              keyboardType: "email-address",
              autoCapitalize: "none",
              autoCorrect: false,
              textContentType: "emailAddress",
            },
          },
        ],
      },
      /*{
        id: "emergency-contact",
        sectionLabel: t("emergencyContact"),
        rows: [
          {
            id: "emergency-name",
            type: "text-input",
            title: t("emergencyContactName"),
          },
          {
            id: "emergency-relation",
            type: "text-input",
            title: t("relationship"),
          },
          {
            id: "emergency-contact",
            type: "text-input",
            title: t("emergencyContactNumber"),
          },
        ],
      },*/
    ],
    [t]
  );

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

  return (
    <SafeAreaView edges={["left", "right"]} style={{ flex: 1 }}>
      <SettingsList
        cards={cards}
        ctaFlag={{ enabled: true, label: t("save"), onPress: onSaveProfile }}
        formValues={formValues}
        onChangeField={onChangeField}
      />
      {showDobPicker && (
        <View style={styles.dobPickerContainer}>
          <DateTimePicker
            value={parseDob(formValues.dob)}
            mode="date"
            display="spinner"
            maximumDate={new Date()}
            onChange={onDobChange}
          />
          {Platform.OS === "ios" && (
            <TouchableOpacity
              style={styles.dobDoneButton}
              onPress={() => setShowDobPicker(false)}>
              <Text style={[F.buttonText, { fontSize: 14, color: C.tint }]}>
                Done
              </Text>
            </TouchableOpacity>
          )}
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  dobPickerContainer: {
    paddingHorizontal: 16,
    paddingBottom: 16,
    backgroundColor: "transparent",
  },
  dobDoneButton: {
    alignSelf: "flex-end",
    paddingTop: 8,
  },
});
