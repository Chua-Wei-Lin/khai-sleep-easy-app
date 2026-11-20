import { TouchableOpacity } from "react-native";
import { Stack, router } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeProvider";
import { Ionicons } from "@expo/vector-icons";

export default function HomeStack() {
  const { t } = useTranslation();
  const { colors: C, fonts: F } = useTheme();

  return (
    <Stack
      screenOptions={{
        headerBackTitle: "",
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
          headerLeft: ({ tintColor }) => (
            <TouchableOpacity
              onPress={() => {
                if (router.canGoBack()) {
                  router.back();
                } else {
                  router.replace("/(tabs)/home");
                }
              }}
              style={{ marginRight: 12, padding: 4 }}
              activeOpacity={0.7}>
              <Ionicons name="arrow-back" size={24} color={tintColor} />
            </TouchableOpacity>
          ),
        }}
      />
    </Stack>
  );
}
