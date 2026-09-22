import React from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Switch,
  TextInput,
  TextInputProps,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useTheme } from "../theme/ThemeProvider";
import type { RowType } from "../types/settings";

function SettingsRow({
  type,
  title,
  icon,
  switchValue,
  textValue,
  textInputProps,
  onToggleSwitch,
  onChangeText,
  onPress,
}: {
  type: RowType;
  title: string;
  icon?: keyof typeof Ionicons.glyphMap;
  switchValue?: boolean;
  onToggleSwitch?: (next: boolean) => void;
  textValue?: string;
  textInputProps?: TextInputProps;
  onChangeText?: (t: string) => void;
  onPress?: () => void;
}) {
  const isSwitch = type === "switch";
  const isForm = type === "text-input";
  const isDate = type === "date";

  const isPressable =
    type === "link" || type === "button" || type === "radio-button" || isDate;
  const Wrapper: any = isPressable ? TouchableOpacity : View;

  const { colors: C, fonts: F } = useTheme();
  const {
    style: inputStyle,
    autoCapitalize = "none",
    onChangeText: _ignoredOnChangeText,
    value: _ignoredValue,
    ...restInputProps
  } = textInputProps ?? {};

  return (
    <Wrapper
      activeOpacity={0.7}
      onPress={onPress}
      accessibilityRole={
        isSwitch ? "switch" : isPressable ? "button" : undefined
      }
      accessibilityState={
        type === "radio-button" ? { selected: !!switchValue } : undefined
      }
      style={[
        styles.row,
        isForm && styles.formRow,
        isForm && {
          backgroundColor: C.bg,
          borderColor: C.border,
          borderBottomWidth: 0,
        },
      ]}>
      {/* Left icon (or reserved space) */}
      {icon ? (
        <Ionicons name={icon} size={20} color={C.text} style={{ width: 26 }} />
      ) : (
        <View style={{ width: 26 }} />
      )}

      {/* Middle content */}
      <View style={{ flex: 1 }}>
        {isForm ? (
          <TextInput
            value={textValue}
            onChangeText={onChangeText}
            placeholder={title}
            placeholderTextColor={C.sub}
            autoCapitalize={autoCapitalize}
            underlineColorAndroid={"transparent"}
            style={[{ color: C.text }, inputStyle]}
            {...restInputProps}
          />
        ) : isDate ? (
          <Text
            style={{
              color: textValue ? C.text : C.sub,
              ...F.text,
              fontWeight: "700",
            }}>
            {textValue || "Select date"}
          </Text>
        ) : (
          <>
            <Text style={{ color: C.text, ...F.text }}>{title}</Text>
          </>
        )}
      </View>

      {/* Right accessory */}
      {isSwitch ? (
        <Switch
          value={!!switchValue}
          onValueChange={(next) => onToggleSwitch?.(next)}
          trackColor={{ false: C.sub, true: C.sub }}
          thumbColor={switchValue ? C.tint : C.tint}
        />
      ) : type === "link" ? (
        <Ionicons
          name="chevron-forward"
          size={18}
          color={C.sub}
          style={{ marginLeft: 8 }}
        />
      ) : type === "radio-button" ? (
        <Ionicons
          name={switchValue ? "checkmark-circle" : "ellipse-outline"}
          size={20}
          color={switchValue ? C.tint : C.sub}
          style={{ marginLeft: 8 }}
        />
      ) : null}
    </Wrapper>
  );
}

export default React.memo(SettingsRow);

const styles = StyleSheet.create({
  row: {
    minHeight: 57,
    paddingHorizontal: 14,
    flexDirection: "row",
    alignItems: "center",
  },
  dateRow: {
    flex: 1,
    flexDirection: "row",
    justifyContent: "space-between",
  },
  formRow: {
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 12,
    borderWidth: 0,
  },
});
