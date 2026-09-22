import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeProvider";

export default function SettingsStack() {
  const { colors: C, fonts: F } = useTheme();
  const { t } = useTranslation();

  return (
    <Stack>
      <Stack.Screen name="index" options={{ headerShown: false }} />
      <Stack.Screen
        name="Profile"
        options={{
          headerBackTitle: "Back",
          headerShown: true,
          headerStyle: { backgroundColor: C.bg },
          headerTitleStyle: [{ color: C.text, ...F.title, fontSize: 20 }],
          headerTintColor: C.text,
          title: t("patientProfile"),
        }}
      />
      <Stack.Screen
        name="Language"
        options={{
          headerBackTitle: "Back",
          headerShown: true,
          headerStyle: { backgroundColor: C.bg },
          headerTitleStyle: [{ color: C.text, ...F.title, fontSize: 20 }],
          headerTintColor: C.text,
          title: t("language"),
        }}
      />
      <Stack.Screen
        name="Notification"
        options={{
          headerBackTitle: "Back",
          headerShown: true,
          headerStyle: { backgroundColor: C.bg },
          headerTitleStyle: [{ color: C.text, ...F.title, fontSize: 20 }],
          headerTintColor: C.text,
          title: t("notification"),
        }}
      />
    </Stack>
  );
}
