import React, { useMemo, useCallback } from "react";
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Platform,
} from "react-native";
import { router } from "expo-router";
import { useTheme } from "../theme/ThemeProvider";
import SettingsCard from "./SettingsCard";
import SettingsRow from "./SettingsRow";
import type { Card, ListItem } from "../types/settings";
import { useTranslation } from "react-i18next";

export default function SettingsList({
  cards,
  titleFlag,
  ctaFlag,
  selectedLanguage,
  formValues,
  switchValues,
  onChangeField,
  onToggleSwitch,
}: {
  cards: Card[];
  titleFlag?: boolean;
  ctaFlag?: {
    enabled: boolean;
    label?: string;
    onPress?: () => void;
    disabled?: boolean;
  };
  selectedLanguage?: string;
  formValues?: { [key: string]: string };
  switchValues?: Record<string, boolean>;
  onChangeField?: (id: string, value: string) => void;
  onToggleSwitch?: (id: string, value: boolean) => void;
}) {
  // Reference theme values
  const { colors: C, fonts: F, isDark, setMode } = useTheme();
  const { t } = useTranslation();

  // Handler for route navigation
  const onPressRow = useCallback((route?: string) => {
    if (!route) return;
    router.push(route);
  }, []);

  // Prepare layout for Settings Page flat list
  const listData: ListItem[] = useMemo(() => {
    const items: ListItem[] = [];

    if (titleFlag) {
      items.push({ kind: "title" });
      items.push({ kind: "spacer", id: "after-title-gap" });
    } else {
      items.push({ kind: "spacer", id: "top-gap" });
    }

    cards.forEach((c) => {
      if (c.sectionLabel) {
        items.push({
          kind: "section",
          id: c.id + "-sec",
          label: c.sectionLabel,
        });
      }
      items.push({ kind: "card", id: c.id, card: c });
      items.push({ kind: "spacer", id: c.id + "-gap" });
    });

    if (ctaFlag.enabled) items.push({ kind: "cta" });
    return items;
  }, [cards]);

  // Render each item in the flat list
  const renderItem = ({ item }: { item: ListItem }) => {
    if (item.kind === "title") {
      return (
        <View style={styles.titleContainer}>
          <Text style={{ color: C.text, ...F.title }}>{t("settings")}</Text>
        </View>
      );
    }

    if (item.kind === "section") {
      return (
        <View style={{ paddingHorizontal: 20, marginTop: 4, marginBottom: 8 }}>
          <Text style={{ color: C.sub, ...F.sectionLabel }}>{item.label}</Text>
        </View>
      );
    }

    if (item.kind === "card") {
      const card = item.card;
      return (
        <SettingsCard shadowColor={C.shadow}>
          {card.rows.map((row, idx) => {
            const isLast = idx === card.rows.length - 1;
            const isDarkRow = row.id === "dark";
            const isLanguageRow =
              row.type === "radio-button" && selectedLanguage;
            const isSelected = isLanguageRow
              ? selectedLanguage === row.id
              : undefined;
            const isForm = row.type === "text-input";
            const isDate = row.type === "date";
            return (
              <View key={row.id}>
                <SettingsRow
                  type={row.type}
                  title={row.title}
                  icon={row.icon}
                  switchValue={isDarkRow ? isDark : isSelected}
                  onToggleSwitch={
                    row.type === "switch"
                      ? (next) => onToggleSwitch?.(row.id, next)
                      : undefined
                  }
                  onPress={
                    isDarkRow
                      ? undefined
                      : row.onPress || (() => onPressRow(row.route))
                  }
                  textValue={
                    isForm || isDate ? formValues?.[row.id] ?? "" : undefined
                  }
                  onChangeText={
                    isForm ? (t) => onChangeField?.(row.id, t) : undefined
                  }
                  textInputProps={
                    isForm || isDate ? row.textInputProps : undefined
                  }
                />
                {!isLast && (
                  <View
                    style={{
                      height: StyleSheet.hairlineWidth,
                      marginLeft: 14 + 26,
                      marginRight: 14,
                      backgroundColor: C.border,
                    }}
                  />
                )}
              </View>
            );
          })}
        </SettingsCard>
      );
    }

    if (item.kind === "cta") {
      return (
        <View style={styles.ctaContainer}>
          <TouchableOpacity
            activeOpacity={0.85}
            onPress={ctaFlag.disabled ? undefined : ctaFlag.onPress}
            disabled={ctaFlag.disabled}
            style={[
              styles.cta,
              { backgroundColor: C.tint },
              ctaFlag.disabled ? { opacity: 0.5 } : null,
              Platform.select({ android: { elevation: 1.5 } }),
            ]}>
            <Text style={F.buttonText}>{ctaFlag.label}</Text>
          </TouchableOpacity>
        </View>
      );
    }

    if (item.kind === "spacer") {
      return <View style={{ height: 12 }} />;
    }

    return <View style={{ height: 8 }} />;
  };

  return (
    <View style={[styles.safe, { backgroundColor: C.bg }]}>
      <FlatList
        data={listData}
        keyExtractor={(_, i) => String(i)}
        renderItem={renderItem}
        contentContainerStyle={{ paddingBottom: 12 }}
        keyboardShouldPersistTaps="handled"
        removeClippedSubviews
        initialNumToRender={12}
        windowSize={7}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  safe: { flex: 1 },
  titleContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  ctaContainer: { paddingHorizontal: 20, paddingTop: 8, paddingBottom: 24 },
  cta: {
    height: 52,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
});
