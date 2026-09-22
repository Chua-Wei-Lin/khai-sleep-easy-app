import { SafeAreaProvider } from "react-native-safe-area-context";
import { ShareIntentProvider } from "expo-share-intent";
import { ThemeProvider, useTheme } from "../theme/ThemeProvider";
import {
  Stack,
  router,
  usePathname,
  useRootNavigationState,
} from "expo-router";
import { Modal, View, Text, ActivityIndicator, StyleSheet } from "react-native";
import "../locales/i18n";
import { useO2Ring, O2RingProvider } from "../service/O2RingProvider";
import { useTranslation } from "react-i18next";
import { useEffect } from "react";
import { useShareIntentContext } from "expo-share-intent";

function DownloadHistoryModal() {
  const {
    isDownloadingHistory,
    downloadProgress,
    downloadTotalFiles,
    downloadCompletedFiles,
  } = useO2Ring();
  const { colors: C } = useTheme();
  const { t } = useTranslation();

  if (!isDownloadingHistory) return null;

  const progressPct = Math.min(100, Math.max(0, Math.round(downloadProgress)));
  const hasFileCounts =
    typeof downloadTotalFiles === "number" && downloadTotalFiles > 0;
  const fileCounter = hasFileCounts
    ? `${downloadCompletedFiles}/${downloadTotalFiles}`
    : null;

  return (
    <Modal
      visible={isDownloadingHistory}
      transparent
      animationType="fade"
      statusBarTranslucent
      // prevent Android back button from closing it
      onRequestClose={() => {}}>
      <View style={styles.modalBackdrop}>
        <View style={[styles.modalCard, { backgroundColor: C.bg2 }]}>
          <Text style={[styles.modalTitle, { color: C.text }]}>
            {t("o2ringDownloadingTitle")}
          </Text>
          <Text
            style={{
              color: C.sub,
              textAlign: "center",
              marginBottom: 16,
            }}>
            {t("o2ringDownloadingMessage")}
          </Text>

          {hasFileCounts ? (
            <Text
              style={{
                color: C.text,
                fontWeight: "700",
                marginBottom: 8,
              }}>
              {fileCounter}
            </Text>
          ) : null}

          <View
            style={[
              styles.progressTrack,
              { backgroundColor: C.sub2, borderColor: C.sub },
            ]}>
            <View
              style={[
                styles.progressFill,
                { backgroundColor: C.tint, width: `${progressPct}%` },
              ]}
            />
          </View>
          <Text
            style={{
              marginTop: 12,
              color: C.text,
              fontWeight: "800",
              fontSize: 16,
            }}>
            {progressPct}%
          </Text>
        </View>
      </View>
    </Modal>
  );
}

function InnerLayout() {
  const navState = useRootNavigationState();
  const pathname = usePathname();
  const { hasShareIntent, shareIntent } = useShareIntentContext();

  useEffect(() => {
    if (!navState?.key) return;
    // Redirect anywhere in the app when a share intent arrives
    if (hasShareIntent && shareIntent && pathname !== "/Share") {
      router.replace("/Share");
    }
  }, [hasShareIntent, shareIntent, pathname, navState?.key]);

  return (
    <SafeAreaProvider>
      {/* ThemeProvider wraps the whole app so useTheme() works anywhere */}
      <ThemeProvider>
        <O2RingProvider>
          <DownloadHistoryModal />
          <Stack screenOptions={{ headerShown: false }}>
            <Stack.Screen
              name="(tabs)"
              options={{ headerShown: false, animation: "fade" }}
            />
            <Stack.Screen
              name="Welcome"
              options={{
                headerShown: false,
                gestureEnabled: false,
                animation: "fade",
              }}
            />
            <Stack.Screen
              name="WelcomeBack"
              options={{
                headerShown: false,
                gestureEnabled: false,
                animation: "fade",
              }}
            />
            <Stack.Screen
              name="CreateAccount"
              options={{
                headerShown: false,
                animation: "fade",
              }}
            />
            <Stack.Screen name="Share" options={{ headerShown: false }} />
          </Stack>
        </O2RingProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
}

/**
 * Root layout wraps the entire app.
 * Everything rendered by expo-router will be nested inside this.
 */
export default function RootLayout() {
  return (
    <ShareIntentProvider>
      <InnerLayout />
    </ShareIntentProvider>
  );
}

const styles = StyleSheet.create({
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.55)",
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  modalCard: {
    width: "100%",
    borderRadius: 16,
    padding: 20,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "800",
    marginBottom: 8,
  },
  progressTrack: {
    width: "100%",
    height: 14,
    borderRadius: 10,
    overflow: "hidden",
    borderWidth: 1,
  },
  progressFill: {
    height: "100%",
    borderRadius: 10,
  },
});
