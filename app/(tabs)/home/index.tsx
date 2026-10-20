import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import {
  Platform,
  Pressable,
  StatusBar,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Image,
  Alert,
  ScrollView,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import * as NavigationBar from "expo-navigation-bar";
import { useFocusEffect, useRouter } from "expo-router";
import { useTheme } from "../../../theme/ThemeProvider";
import { useTranslation } from "react-i18next";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { DeviceItem, useO2Ring } from "../../../service/O2RingProvider";
import Constants from "expo-constants";
import LivePpgWave from "../../../components/live/LivePpgWave";
import LiveTrendChart, { Band } from "../../../components/live/LiveTrendChart";
import LiveBpTrendChart from "../../../components/live/LiveBpTrendChart";
import { useReadingSeries } from "../../../components/live/useReadingSeries";
import HaemodynamicSummaryCard from "../../../components/live/HaemodynamicSummaryCard";

const getDeviceImage = (name?: string) => {
  if (name && /watch/i.test(name)) {
    return require("../../../assets/images/O2 Watch.png");
  }
  return require("../../../assets/images/O2RingBGR.png");
};

// same validity rules as the big numbers: anything else shows "--" and leaves a gap in the chart
const isValidSpo2 = (v: number) => v >= 20 && v <= 100;
const isValidPr = (v: number) => v >= 20 && v <= 250;
const isValidBpVal = (v: number) => v >= 30 && v <= 250;

// line colour by value (cosmetic only; agree the thresholds with the clinical lead)
const GREEN = "#5BD68A";
const YELLOW = "#E3D45C";
const ORANGE = "#F5A25D";
const AMBER = "#F5B031";
const SPO2_BANDS: Band[] = [
  { value: 100, color: GREEN },
  { value: 94, color: GREEN },
  { value: 90, color: YELLOW },
  { value: 86, color: ORANGE },
  { value: 70, color: ORANGE },
];
const PR_BANDS: Band[] = [
  { value: 250, color: ORANGE },
  { value: 130, color: ORANGE },
  { value: 110, color: GREEN },
  { value: 50, color: GREEN },
  { value: 40, color: ORANGE },
  { value: 25, color: ORANGE },
];

export default function Home() {
  const { colors: C, isDark, fonts: F } = useTheme();
  const { t } = useTranslation();
  const router = useRouter();
  const {
    connectedDevice,
    knownDevices,
    spo2,
    pr,
    sbp,
    dbp,
    pi,
    motion,
    realtimeUpdatedAt,
    battery,
    batteryState,
    disconnect,
    refreshRealtime,
    isRealtimeReady,
    startScan,
    stopScan,
    connectToDevice,
    forgetDevice,
    offlineDevice,
    clearOfflineDevice,
    connecting,
    devices,
    isScanning,
  } = useO2Ring();

  const [knownDeviceMenuVisible, setKnownDeviceMenuVisible] = useState(false);
  const [isGridFormat, setIsGridFormat] = useState(false);
  const menuScanWasActiveRef = useRef(false);

  // Keep latest refreshRealtime without forcing the focus effect to re-run on every reading
  const refreshRealtimeRef = useRef(refreshRealtime);
  useEffect(() => {
    refreshRealtimeRef.current = refreshRealtime;
  }, [refreshRealtime]);

  useEffect(() => {
    if (!connectedDevice) {
      setKnownDeviceMenuVisible(false);
    }
  }, [connectedDevice]);

  useEffect(() => {
    if (connectedDevice) {
      clearOfflineDevice();
    }
  }, [clearOfflineDevice, connectedDevice]);

  const offlineAlertedRef = useRef<string | null>(null);
  useEffect(() => {
    if (!offlineDevice) {
      offlineAlertedRef.current = null;
      return;
    }
    if (connectedDevice) return;
    if (offlineAlertedRef.current === offlineDevice.mac) return;

    offlineAlertedRef.current = offlineDevice.mac;
    Alert.alert(
      t("deviceOfflineTitle"),
      t("deviceOfflineMessage", { name: offlineDevice.name }),
      [{ text: "OK", onPress: clearOfflineDevice }],
      { cancelable: true }
    );
  }, [clearOfflineDevice, connectedDevice, offlineDevice, t]);

  useEffect(() => {
    StatusBar.setBarStyle(isDark ? "light-content" : "dark-content", true);

    if (Platform.OS === "android") {
      StatusBar.setBackgroundColor(C.bg2, true);
      NavigationBar.setBackgroundColorAsync(C.bg2);
      NavigationBar.setButtonStyleAsync(isDark ? "light" : "dark");
    }
  }, [C.bg2, isDark]);

  const handleDisconnect = async () => {
    await disconnect();
  };

  const handleKnownDeviceSelect = useCallback(
    async (device: DeviceItem) => {
      setKnownDeviceMenuVisible(false);
      if (connectedDevice?.mac === device.mac) return;
      await connectToDevice(device);
    },
    [connectToDevice, connectedDevice]
  );

  const handleScan = () => {
    clearOfflineDevice();
    router.push("/(tabs)/home/Scan");
  };

  // When opening the known devices menu, run a scan so we can flag online/offline status.
  useEffect(() => {
    if (!knownDeviceMenuVisible) return;

    menuScanWasActiveRef.current = isScanning;
    startScan().catch(() => null);

    return () => {
      if (!menuScanWasActiveRef.current) {
        stopScan();
      }
    };
  }, [knownDeviceMenuVisible, isScanning, startScan, stopScan]);

  const knownAvailableMacs = useMemo(
    () => new Set(devices.map((d) => d.mac)),
    [devices]
  );

  /**
   * Display values from O2 Ring live with fallback
   */
  useFocusEffect(
    useCallback(() => {
      // Start or stop scanning based on connection state; avoid depending on isScanning to prevent setState loops
      if (!connectedDevice) {
        startScan();
      } else {
        stopScan();
      }

      if (!connectedDevice || !isRealtimeReady) {
        return () => {
          stopScan();
        };
      }

      // call once immediately when screen is focused
      refreshRealtimeRef.current();

      // then keep calling every 1 second
      const intervalId = setInterval(() => {
        refreshRealtimeRef.current();
      }, 1000);

      // clean up when leaving the screen or losing focus
      return () => {
        clearInterval(intervalId);
        stopScan();
      };
    }, [connectedDevice, isRealtimeReady, startScan, stopScan])
  );

  const displaySpo2 =
    spo2 == null || spo2 < 20 || spo2 > 100 ? "--" : `${spo2}`;

  const displayPr = pr == null || pr < 20 || pr > 250 ? "--" : `${pr}`;

  const displaySbp = sbp == null || sbp < 30 || sbp > 250 ? "--" : `${sbp}`;
  const displayDbp = dbp == null || dbp < 20 || dbp > 200 ? "--" : `${dbp}`;

  // rolling history for the charts; a new connection starts a new chart
  const spo2Series = useReadingSeries(spo2, realtimeUpdatedAt, isValidSpo2, connectedDevice?.mac);
  const prSeries = useReadingSeries(pr, realtimeUpdatedAt, isValidPr, connectedDevice?.mac);
  const sbpSeries = useReadingSeries(sbp, realtimeUpdatedAt, isValidBpVal, connectedDevice?.mac);
  const dbpSeries = useReadingSeries(dbp, realtimeUpdatedAt, isValidBpVal, connectedDevice?.mac);
  const batterySegments = useMemo(() => {
    if (battery == null || battery < 0 || battery > 100) {
      return null;
    }
    const clamped = Math.max(0, Math.min(100, battery));
    return Math.max(1, Math.min(5, Math.ceil(clamped / 20))); // 1-5 blocks for an approximate fill
  }, [battery]);
  const batteryIconName = useMemo(() => {
    switch (batteryState) {
      case 1:
        return "battery-charging";
      case 2:
        return "battery-check";
      default:
        return "battery";
    }
  }, [batteryState]);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: C.bg }} edges={["top", "left", "right"]}>
      {knownDeviceMenuVisible && (
        <SafeAreaView
          style={styles.knownMenuContainer}
          pointerEvents="box-none">
          <Pressable
            style={styles.knownMenuBackdrop}
            onPress={() => setKnownDeviceMenuVisible(false)}
          />
          <View
            style={[
              styles.knownMenuCard,
              {
                backgroundColor: C.bg2,
                borderColor: C.border,
                shadowColor: C.shadow,
              },
            ]}>
            <View style={styles.knownMenuHeader}>
              <View style={styles.knownMenuTitleContainer}>
                <Text style={[styles.knownMenuTitle, { color: C.text }]}>
                  {t("chooseDevice")}
                </Text>
              </View>
              <TouchableOpacity
                style={styles.knownMenuClose}
                onPress={() => setKnownDeviceMenuVisible(false)}
                hitSlop={8}>
                <MaterialCommunityIcons name="close" size={20} color={C.sub} />
              </TouchableOpacity>
            </View>

            {knownDevices.length === 0 ? (
              <Text style={{ color: C.sub }}>{t("noKnownDevices")}</Text>
            ) : (
              <>
                <View style={styles.knownLegendContainer}>
                  <View style={styles.knownLegendItem}>
                    <MaterialCommunityIcons
                      name="check-circle"
                      size={18}
                      color={C.tint}
                    />
                    <Text style={[styles.knownLegendText, { color: C.text }]}>
                      {t("connected")}
                    </Text>
                  </View>
                  <View style={styles.knownLegendItem}>
                    <MaterialCommunityIcons
                      name="bluetooth-connect"
                      size={18}
                      color={C.tint}
                    />
                    <Text style={[styles.knownLegendText, { color: C.text }]}>
                      {t("notConnected")}
                    </Text>
                  </View>
                  <View style={styles.knownLegendItem}>
                    <MaterialCommunityIcons
                      name="bluetooth-off"
                      size={18}
                      color={C.danger}
                    />
                    <Text style={[styles.knownLegendText, { color: C.text }]}>
                      {t("offline")}
                    </Text>
                  </View>
                </View>

                {knownDevices.map((device) => (
                  <TouchableOpacity
                    key={device.mac}
                    style={[
                      styles.knownMenuItem,
                      { borderColor: C.border },
                      connecting ? styles.knownMenuItemDisabled : null,
                    ]}
                    activeOpacity={0.8}
                    disabled={connecting}
                    onPress={() => handleKnownDeviceSelect(device)}
                    onLongPress={() => {
                      Alert.alert(
                        t("confirmDeleteTitle"),
                        t("deleteKnownDeviceMessage"),
                        [
                          {
                            text: t("cancel"),
                            style: "cancel",
                          },
                          {
                            text: t("delete"),
                            style: "destructive",
                            onPress: () => {
                              (async () => {
                                if (connectedDevice?.mac === device.mac) {
                                  await disconnect();
                                }
                                forgetDevice(device);
                              })();
                              setKnownDeviceMenuVisible(false);
                            },
                          },
                        ]
                      );
                    }}>
                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <Image
                        source={getDeviceImage(device.name)}
                        style={{ width: 40, height: 40, marginRight: 8 }}
                        resizeMode="contain"
                      />
                      <View style={{justifyContent: "center"}}>
                        <Text
                          style={[
                            styles.knownMenuItemTitle,
                            { color: C.text },
                          ]}>
                          {device.name}
                        </Text>
                      </View>
                    </View>
                    {connectedDevice?.mac === device.mac ? (
                      <MaterialCommunityIcons
                        name="check-circle"
                        size={22}
                        color={C.tint}
                      />
                    ) : knownAvailableMacs.has(device.mac) ? (
                      <MaterialCommunityIcons
                        name="bluetooth-connect"
                        size={22}
                        color={C.tint}
                      />
                    ) : (
                      <MaterialCommunityIcons
                        name="bluetooth-off"
                        size={22}
                        color={C.danger}
                      />
                    )}
                  </TouchableOpacity>
                ))}
              </>
            )}
          </View>
        </SafeAreaView>
      )}

      {connectedDevice ? (
        // Connected view
        <ScrollView contentContainerStyle={{ paddingBottom: 8 }}>
          <View style={styles.titleContainer}>
            <View style={styles.titleRow}>
              <View style={styles.titleLeft}>
                <Pressable
                  style={{
                    borderRadius: 16,
                    borderWidth: StyleSheet.hairlineWidth,
                    padding: 8,
                    alignItems: "center",
                    justifyContent: "center",
                    position: "relative",
                  }}
                  onPress={() =>
                    setKnownDeviceMenuVisible(!knownDeviceMenuVisible)
                  }>
                  <Image
                    source={getDeviceImage(connectedDevice?.name)}
                    resizeMode="contain"
                    style={{
                      width: 56,
                      height: 56,
                      marginRight: 0,
                    }}
                  />
                  <View style={[styles.badge, { backgroundColor: C.tint }]}>
                    <MaterialCommunityIcons
                      name="swap-horizontal"
                      size={16}
                      color={C.white}
                    />
                  </View>
                </Pressable>
                <View style={{ marginLeft: 12, flex: 1, flexShrink: 1 }}>
                  <Text style={[F.buttonText, { color: C.text }]}>
                    {connectedDevice.name}
                  </Text>
                  <Text style={[F.buttonText, { color: C.text }]}>
                    {t("connected")}
                  </Text>
                </View>
              </View>

              <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                <TouchableOpacity
                  onPress={() => setIsGridFormat((prev) => !prev)}
                  style={[
                    styles.batteryChip,
                    { borderColor: C.border, backgroundColor: C.bg2, paddingHorizontal: 8 },
                  ]}
                  activeOpacity={0.8}>
                  <MaterialCommunityIcons
                    name={isGridFormat ? "view-agenda" : "view-grid"}
                    size={22}
                    color={C.tint}
                  />
                </TouchableOpacity>

                <View
                  style={[
                    styles.batteryChip,
                    { borderColor: C.border, backgroundColor: C.bg2 },
                  ]}>
                  <MaterialCommunityIcons
                    name={batteryIconName}
                    size={22}
                    color={C.text}
                  />
                  {batterySegments == null ? (
                    <Text style={[styles.batteryText, { color: C.tint }]}>
                      --
                    </Text>
                  ) : (
                    <View style={styles.batteryBlocks}>
                      {Array.from({ length: 5 }).map((_, idx) => (
                        <View
                          key={idx}
                          style={[
                            styles.batteryBlock,
                            {
                              marginLeft: idx === 0 ? 0 : 3,
                              backgroundColor:
                                idx < batterySegments ? C.tint : "transparent",
                              borderColor: C.border,
                              opacity: idx < batterySegments ? 1 : 0.35,
                            },
                          ]}
                        />
                      ))}
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Live Display */}
          <View style={{ paddingHorizontal: 10 }}>
            {!isGridFormat ? (
              // Format 1: Stacked (Compact to fit on one screen)
              <>
                <LiveTrendChart
                  title="Oxygen"
                  unit="%"
                  currentLabel={displaySpo2}
                  avgLabel={t("avg")}
                  points={spo2Series}
                  min={70}
                  max={100}
                  ticks={[100, 90, 80, 70]}
                  bands={SPO2_BANDS}
                  accent={C.tint}
                  height={40}
                />

                <LiveTrendChart
                  title="Pulse Rate"
                  unit="bpm"
                  currentLabel={displayPr}
                  avgLabel={t("avg")}
                  points={prSeries}
                  min={25}
                  max={250}
                  ticks={[250, 125, 25]}
                  bands={PR_BANDS}
                  accent={AMBER}
                  height={40}
                />

                <LiveBpTrendChart
                  title="Blood Pressure"
                  unit="mmHg"
                  currentSbp={displaySbp}
                  currentDbp={displayDbp}
                  sbpPoints={sbpSeries}
                  dbpPoints={dbpSeries}
                  height={40}
                />

                <LivePpgWave
                  active={isRealtimeReady}
                  title="PPG"
                  waitingText={t("waitingForSignal")}
                  height={40}
                />
              </>
            ) : (
              // Format 2: 2-Column Grid (Bigger charts)
              <>
                <View style={styles.gridRow}>
                  <View style={styles.gridCol}>
                    <LiveTrendChart
                      title="Oxygen"
                      unit="%"
                      currentLabel={displaySpo2}
                      avgLabel={t("avg")}
                      points={spo2Series}
                      min={70}
                      max={100}
                      ticks={[100, 90, 80, 70]}
                      bands={SPO2_BANDS}
                      accent={C.tint}
                      height={55}
                    />
                  </View>
                  <View style={styles.gridCol}>
                    <LiveBpTrendChart
                      title="Blood Pressure"
                      unit="mmHg"
                      currentSbp={displaySbp}
                      currentDbp={displayDbp}
                      sbpPoints={sbpSeries}
                      dbpPoints={dbpSeries}
                      height={55}
                    />
                  </View>
                </View>

                <View style={styles.gridRow}>
                  <View style={styles.gridCol}>
                    <LiveTrendChart
                      title="Pulse Rate"
                      unit="bpm"
                      currentLabel={displayPr}
                      avgLabel={t("avg")}
                      points={prSeries}
                      min={25}
                      max={250}
                      ticks={[250, 125, 25]}
                      bands={PR_BANDS}
                      accent={AMBER}
                      height={55}
                    />
                  </View>
                  <View style={styles.gridCol}>
                    <LivePpgWave
                      active={isRealtimeReady}
                      title="PPG"
                      waitingText={t("waitingForSignal")}
                      height={55}
                    />
                  </View>
                </View>
              </>
            )}

            <HaemodynamicSummaryCard
              prPoints={prSeries}
              currentSpo2={spo2}
              currentPr={pr}
              currentSbp={sbp}
              currentDbp={dbp}
              currentPi={pi}
              currentMotion={motion}
            />

            <TouchableOpacity
              onPress={handleDisconnect}
              style={[styles.button, { backgroundColor: C.danger, paddingVertical: 10, marginTop: 4 }]}
              activeOpacity={0.85}>
              <Text style={[F.buttonText]}>{t("disconnect")}</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      ) : (
        // Not connected view
        <View style={styles.centerTop}>
          <MaterialCommunityIcons
            name="bluetooth-off"
            size={80}
            color={C.text}
          />
          <Text style={[styles.bigText, { color: C.text }]}>
            {t("notConnected")}
          </Text>

          <TouchableOpacity
            onPress={handleScan}
            style={[styles.button, { backgroundColor: C.tint, marginTop: 24 }]}
            activeOpacity={0.85}>
            <Text style={[F.buttonText]}>{t("connectDevice")}</Text>
          </TouchableOpacity>
          <Text style={{ color: C.sub, fontSize: 12, marginTop: 8 }}>
            v{Constants.expoConfig?.version ?? "1.2.2"}
          </Text>
        </View>
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  titleContainer: { paddingHorizontal: 20, paddingTop: 10, paddingBottom: 6 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    flexShrink: 1,
  },

  badge: {
    position: "absolute",
    top: 5,
    right: 5,
    borderRadius: 10,
    padding: 4,
  },

  centerTop: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  title: {
    fontSize: 20,
    fontWeight: "700",
    marginBottom: 4,
  },
  bigText: {
    fontSize: 24,
    fontWeight: "800",
    marginTop: 12,
  },
  button: {
    marginTop: 16,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderRadius: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  gridRow: {
    flexDirection: "row",
    gap: 6,
    marginBottom: 4,
  },
  gridCol: {
    flex: 1,
  },
  batteryChip: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
  },
  batteryText: {
    fontSize: 16,
    fontWeight: "700",
    marginLeft: 8,
  },
  batteryBlocks: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: 8,
  },
  batteryBlock: {
    width: 8,
    height: 12,
    borderRadius: 2,
    borderWidth: StyleSheet.hairlineWidth,
  },
  card: {
    padding: 16,
    borderRadius: 12,
    marginBottom: 16,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  value: {
    fontSize: 32,
    fontWeight: "800",
  },

  knownMenuContainer: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    zIndex: 10,
    justifyContent: "flex-start",
    paddingHorizontal: 16,
    paddingTop: 16,
  },
  knownMenuBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.2)",
  },
  knownMenuCard: {
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 14,
    padding: 12,
    width: "100%",
    maxHeight: 320,
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
  },
  knownMenuHeader: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    marginBottom: 8,
  },
  knownMenuTitle: {
    fontSize: 16,
    fontWeight: "800",
    textAlign: "center",
  },
  knownMenuTitleContainer: {
    flex: 1,
    alignItems: "center",
  },
  knownMenuClose: {
    marginLeft: 12,
  },
  knownMenuItem: {
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderRadius: 10,
    borderWidth: StyleSheet.hairlineWidth,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 6,
  },
  knownMenuItemTitle: {
    fontSize: 15,
    fontWeight: "700",
  },
  knownMenuItemDisabled: {
    opacity: 0.6,
  },
  knownLegendContainer: {
    flexDirection: "row",
    alignItems: "center",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 6,
  },
  knownLegendItem: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  knownLegendText: {
    fontSize: 12,
    fontWeight: "600",
  },
});
