import { Platform } from "react-native";
import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeProvider";

export default function SettingsStack() {
  const { colors: C, fonts: F } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack
      screenOptions={{
        headerShown: true,
        headerBackTitle: "Back",
        headerStyle: { backgroundColor: C.bg },
        headerTitleStyle: [{ color: C.text, ...F.title, fontSize: 20 }],
        headerTintColor: C.text,
        contentStyle: { backgroundColor: C.bg },
        gestureEnabled: true,
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="index" options={{ headerShown: false, title: t("settings") }} />
      <Stack.Screen
        name="Profile"
        options={{
          title: t("patientProfile"),
        }}
      />
      <Stack.Screen
        name="Language"
        options={{
          title: t("language"),
        }}
      />
      <Stack.Screen
        name="Notification"
        options={{
          title: t("notification"),
        }}
      />
      <Stack.Screen
        name="PpgHz"
        options={{
          title: "PPG Sampling Rate",
        }}
      />
      <Stack.Screen
        name="ChartVisibility"
        options={{
          title: "Customize Dashboard Charts",
        }}
      />
    </Stack>
  );
}
