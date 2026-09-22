import React, { useEffect, useMemo, useState } from "react";
import SettingsList from "../../../components/SettingsList";
import type { Card } from "../../../types/settings";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTranslation } from "react-i18next";
import AsyncStorage from "@react-native-async-storage/async-storage";
import i18n from "../../../locales/i18n";

export default function Language() {
  const { t } = useTranslation();

  const STORAGE_KEY = "settings:language";

  const [language, setLanguageState] = useState<string>(i18n.language || "en");

  // Save preference to AsyncStorage whenever it changes
  useEffect(() => {
    if (language) {
      AsyncStorage.setItem(STORAGE_KEY, language);
      i18n.changeLanguage(language);
    }
  }, [language]);

  const cards: Card[] = useMemo(
    () => [
      {
        id: "language",
        sectionLabel: t("language"),
        rows: [
          {
            id: "en",
            type: "radio-button",
            title: "English",
            onPress: () => setLanguageState("en"),
          },
          {
            id: "zh",
            type: "radio-button",
            title: "中文",
            onPress: () => setLanguageState("zh"),
          },
        ],
      },
    ],
    [t]
  );

  return (
    <SafeAreaView edges={["left", "right"]} style={{ flex: 1 }}>
      <SettingsList
        cards={cards}
        ctaFlag={{ enabled: false }}
        selectedLanguage={language}
      />
    </SafeAreaView>
  );
}
