import React, { useMemo, useCallback } from "react";
import {
  ActivityIndicator,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useRouter, useFocusEffect } from "expo-router";
import { useTranslation } from "react-i18next";
import { useTheme } from "../../../theme/ThemeProvider";
import { DeviceItem, useO2Ring } from "../../../service/O2RingProvider";

const isWatchDevice = (name?: string) => {
  const n = (name || "").toLowerCase();
  if (n.includes("kidso2") || n.includes("o2ring")) return false;
  return /watch|band|wrist|o2w|checkme|o2m|^o2\s+\d+/i.test(n);
};

const getDeviceImage = (name?: string, model?: number) => {
  const n = (name || "").toLowerCase();
  if (n.includes("kidso2")) {
    return require("../../../assets/images/KidsO2Ring.png");
  }
  if (isWatchDevice(name) || (model != null && model !== 4 && model !== 2)) {
    return require("../../../assets/images/O2 Watch.png");
  }
  return require("../../../assets/images/O2RingBGR.png");
};

const getDisplayName = (name?: string, model?: number) => {
  const base = name || "Device";
  const n = base.toLowerCase();
  const parts = base.trim().split(/\s+/);
  const suffix = parts.length > 1 ? parts[parts.length - 1] : "";

  if (n.startsWith("o2m") || n.includes("o2m")) {
    return suffix && /^\d+$/.test(suffix) ? `O2WProMax ${suffix}` : "O2WProMax";
  }
  if (/^o2\s+\d+/i.test(base) || (n.startsWith("o2 ") && !n.includes("ring"))) {
    return suffix && /^\d+$/.test(suffix) ? `O2Watch ${suffix}` : "O2Watch";
  }
  if (n.includes("kidso2")) {
    return suffix && /^\d+$/.test(suffix) ? `KidsO2 ${suffix}` : "KidsO2";
  }
  if (n.includes("o2ring") || n.includes("o2_ring")) {
    return suffix && /^\d+$/.test(suffix) ? `O2Ring ${suffix}` : "O2Ring";
  }
  if (/watch|band|wrist|o2w|checkme/i.test(n)) {
    return suffix && /^\d+$/.test(suffix) ? `O2Watch ${suffix}` : "O2Watch";
  }
  return base;
};

type DeviceRowProps = {
  item: DeviceItem;
  onPress: (item: DeviceItem) => void;
  disabled?: boolean;
  connecting?: boolean;
};

function DeviceRow({ item, onPress, disabled, connecting }: DeviceRowProps) {
  const { colors: C, fonts: F } = useTheme();

  return (
    <TouchableOpacity
      onPress={() => onPress(item)}
      style={[
        disabled ? styles.deviceRowDisabled : null,
        connecting ? styles.deviceRowConnecting : null,
        {
          backgroundColor: C.sub2,
          flexDirection: "row",
          alignItems: "center",
          padding: 12,
          borderRadius: 12,
          marginBottom: 8,
        },
      ]}
      activeOpacity={0.8}
      disabled={disabled}>
      <View style={{ backgroundColor: "#ffffff", borderRadius: 8, padding: 4, marginRight: 10 }}>
        <Image
          source={getDeviceImage(item.name, item.model)}
          style={{ width: 36, height: 36 }}
          resizeMode="contain"
        />
      </View>
      <View style={{ flex: 1 }}>
        <Text style={[F.text, { color: C.white }]}>{getDisplayName(item.name, item.model)}</Text>
      </View>
      {connecting ? (
        <ActivityIndicator color={C.white} />
      ) : (
        <MaterialCommunityIcons
          name="chevron-right"
          color={C.white}
          size={24}
        />
      )}
    </TouchableOpacity>
  );
}

export default function ScanDeviceScreen() {
  const { colors: C, fonts: F } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const {
    devices,
    knownDevices,
    isScanning,
    connecting,
    startScan,
    stopScan,
    connectToDevice,
  } = useO2Ring();

  // Ensure scanning starts whenever this screen is focused (and stops on blur)
  useFocusEffect(
    useCallback(() => {
      startScan();
      return () => {
        stopScan();
      };
    }, [startScan, stopScan])
  );

  const liveScanned = devices;
  const savedDevices = useMemo(
    () => knownDevices.filter((k) => !devices.some((d) => d.mac === k.mac)),
    [devices, knownDevices]
  );

  const hasAnyDevices = liveScanned.length > 0 || savedDevices.length > 0;

  async function handleConnect(item: DeviceItem) {
    const ok = await connectToDevice(item);
    if (ok) {
      router.back();
    }
  }

  async function handleScanToggle() {
    if (isScanning) {
      await stopScan();
    } else {
      await startScan();
    }
  }

  return (
    <SafeAreaView
      style={[styles.container, { backgroundColor: C.bg, padding: 16 }]}>
      <ScrollView contentContainerStyle={{ paddingBottom: 24 }}>
        <View style={styles.header}>
          <MaterialCommunityIcons
            name="radar"
            size={56}
            color={C.tint}
          />

          {/* Scan Button */}
          <TouchableOpacity
            onPress={handleScanToggle}
            style={{
              backgroundColor: isScanning ? C.danger : C.tint,
              flexDirection: "row",
              marginTop: 8,
              paddingHorizontal: 18,
              height: 44,
              borderRadius: 12,
              alignItems: "center",
              justifyContent: "center",
            }}
            activeOpacity={0.85}>
            <Text style={[F.buttonText]}>
              {isScanning ? t("stop") : t("scan")}
            </Text>
            {isScanning && (
              <ActivityIndicator color={"#ffffff"} style={{ marginLeft: 10 }} />
            )}
          </TouchableOpacity>
        </View>

        {!hasAnyDevices ? (
          <View
            style={{
              alignItems: "center",
              justifyContent: "center",
              marginTop: 30,
            }}>
            <Text style={{ color: C.sub, fontSize: 14 }}>{t("noDevices")}</Text>
          </View>
        ) : (
          <View style={{ marginTop: 8 }}>
            {/* Section 1: Live Scanned Devices */}
            <View style={{ marginBottom: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "700", color: C.sub, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                Scanned Devices ({liveScanned.length})
              </Text>
              {liveScanned.length === 0 ? (
                <Text style={{ color: C.sub, fontSize: 12, fontStyle: "italic", marginBottom: 8 }}>
                  {isScanning ? "Scanning for nearby devices..." : "No live devices found in the air"}
                </Text>
              ) : (
                liveScanned.map((item) => (
                  <DeviceRow
                    key={item.mac}
                    item={item}
                    onPress={handleConnect}
                    disabled={connecting}
                    connecting={connecting}
                  />
                ))
              )}
            </View>

            {/* Section 2: Saved / Paired Devices */}
            {savedDevices.length > 0 && (
              <View style={{ marginTop: 8 }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: C.sub, marginBottom: 8, textTransform: "uppercase", letterSpacing: 0.5 }}>
                  Saved Devices ({savedDevices.length})
                </Text>
                {savedDevices.map((item) => (
                  <DeviceRow
                    key={item.mac}
                    item={item}
                    onPress={handleConnect}
                    disabled={connecting}
                    connecting={connecting}
                  />
                ))}
              </View>
            )}
          </View>
        )}
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },

  header: {
    marginBottom: 12,
    justifyContent: "center",
    alignItems: "center",
  },

  deviceRowDisabled: {
    opacity: 0.65,
  },

  deviceRowConnecting: {
    backgroundColor: "#1e272e",
  },
});
