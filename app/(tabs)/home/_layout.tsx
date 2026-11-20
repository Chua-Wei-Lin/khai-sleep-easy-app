import { Stack } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeProvider";

export default function HomeStack() {
  const { t } = useTranslation();
  const { colors: C, fonts: F } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "Back",
        gestureEnabled: true,
        animation: "slide_from_right",
      }}>
      <Stack.Screen name="index" options={{ headerShown: false, title: t("home") }} />
      <Stack.Screen
        name="Scan"
        options={{
          headerShown: true,
          headerStyle: { backgroundColor: C.bg },
          headerTitleStyle: [{ color: C.text, ...F.title, fontSize: 20 }],
          headerTintColor: C.text,
          title: t("scan"),
        }}
      />
    </Stack>
  );
}
