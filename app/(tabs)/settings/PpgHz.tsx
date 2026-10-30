import React, { useEffect, useMemo, useState } from "react";
import SettingsList from "../../../components/SettingsList";
import type { Card } from "../../../types/settings";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as O2Ring from "@ios-app/viatom-o2ring";

export default function PpgHzScreen() {
  const { colors: C } = useTheme();
  const { t } = useTranslation();
  const STORAGE_KEY = "ppg_sampling_hz";

  const [hz, setHz] = useState<string>("125 Hz");

  useEffect(() => {
    AsyncStorage.getItem(STORAGE_KEY).then((val) => {
      if (val) setHz(val);
    });
  }, []);

  const selectHz = async (val: string) => {
    setHz(val);
    await AsyncStorage.setItem(STORAGE_KEY, val);
    const hzNum = parseInt(val, 10) || 125;
    try {
      // @ts-ignore
      if (O2Ring.setPpgSamplingRate) {
        await O2Ring.setPpgSamplingRate(hzNum);
      }
    } catch {}
  };

  const cards: Card[] = useMemo(
    () => [
      {
        id: "ppg-hz-section",
        sectionLabel: "PPG Sampling Rate",
        rows: [
          {
            id: "125 Hz",
            type: "radio-button",
            title: "125 Hz",
            onPress: () => selectHz("125 Hz"),
          },
          {
            id: "100 Hz",
            type: "radio-button",
            title: "100 Hz",
            onPress: () => selectHz("100 Hz"),
          },
          {
            id: "75 Hz",
            type: "radio-button",
            title: "75 Hz",
            onPress: () => selectHz("75 Hz"),
          },
          {
            id: "50 Hz",
            type: "radio-button",
            title: "50 Hz",
            onPress: () => selectHz("50 Hz"),
          },
        ],
      },
    ],
    []
  );

  return (
    <SafeAreaView edges={["left", "right"]} style={{ flex: 1, backgroundColor: C.bg }}>
      <SettingsList
        cards={cards}
        ctaFlag={{ enabled: false }}
        selectedLanguage={hz}
      />
    </SafeAreaView>
  );
}
