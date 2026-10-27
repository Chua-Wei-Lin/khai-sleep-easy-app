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
import LiveMotionBarChart from "../../../components/live/LiveMotionBarChart";
import { useReadingSeries } from "../../../components/live/useReadingSeries";
import HaemodynamicSummaryCard from "../../../components/live/HaemodynamicSummaryCard";

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
  const [isGridFormat, setIsGridFormat] = useState(true);
  const menuScanWasActiveRef = useRef(false);

  const [visibleCharts, setVisibleCharts] = useState({
    spo2: true,
    pr: true,
    bp: true,
    rr: true,
    motion: true,
    ppg: true,
  });

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("settings:visible_charts").then((stored) => {
        if (stored) {
          try {
            setVisibleCharts((prev) => ({ ...prev, ...JSON.parse(stored) }));
          } catch {}
        }
      });
    }, [])
  );

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
  const isValidMotion = (v: number) => v >= 0 && v <= 100;
  const motionSeries = useReadingSeries(motion, realtimeUpdatedAt, isValidMotion, connectedDevice?.mac);
  const displayMotion = motion == null ? "--" : `${motion}`;
  const rrValue = pr != null && pr > 0 ? Math.max(10, Math.min(30, Math.round(pr / 4))) : null;
  const isValidRr = (v: number) => v >= 5 && v <= 60;
  const rrSeries = useReadingSeries(rrValue, realtimeUpdatedAt, isValidRr, connectedDevice?.mac);
  const displayRr = rrValue == null ? "--" : `${rrValue}`;
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
                    <View style={{ flex: 1, flexDirection: "row", alignItems: "center" }}>
                      <View style={{ backgroundColor: "#ffffff", borderRadius: 8, padding: 4, marginRight: 10 }}>
                        <Image
                          source={getDeviceImage(device.name, device.model)}
                          style={{ width: 36, height: 36 }}
                          resizeMode="contain"
                        />
                      </View>
                      <View style={{justifyContent: "center"}}>
                        <Text
                          style={[
                            styles.knownMenuItemTitle,
                            { color: C.text },
                          ]}>
                          {getDisplayName(device.name, device.model)}
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
        <ScrollView contentContainerStyle={{ paddingBottom: 8, maxWidth: 680, width: "100%", alignSelf: "center" }}>
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
                  <View style={{ backgroundColor: "#ffffff", borderRadius: 12, padding: 6 }}>
                    <Image
                      source={getDeviceImage(connectedDevice?.name, connectedDevice?.model)}
                      resizeMode="contain"
                      style={{
                        width: 48,
                        height: 48,
                      }}
                    />
                  </View>
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
                    {getDisplayName(connectedDevice?.name, connectedDevice?.model)}
                  </Text>
                  <Text style={[F.buttonText, { color: C.text }]}>
                    {t("connected")}
                  </Text>
                </View>
              </View>

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

          {/* Sub-header row: Format Button on left, PI on right (100% level with each other) */}
          <View style={{ paddingHorizontal: 10, marginBottom: 8, flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
            <TouchableOpacity
              onPress={() => setIsGridFormat((prev) => !prev)}
              style={[
                styles.batteryChip,
                { borderColor: C.border, backgroundColor: C.bg2, paddingHorizontal: 10, paddingVertical: 5 },
              ]}
              activeOpacity={0.8}>
              <MaterialCommunityIcons
                name={isGridFormat ? "view-agenda" : "view-grid"}
                size={18}
                color={C.tint}
              />
              <Text style={{ fontSize: 12, fontWeight: "600", color: C.text, marginLeft: 6 }}>
                {isGridFormat ? "Grid View" : "Stacked View"}
              </Text>
            </TouchableOpacity>

            <View
              style={[
                styles.batteryChip,
                { borderColor: C.border, backgroundColor: C.bg2, paddingHorizontal: 12, paddingVertical: 5 },
              ]}>
              <Text style={{ fontSize: 12, fontWeight: "700", color: GREEN }}>
                PI: {pi != null ? pi.toFixed(1) : "0.0"}%
              </Text>
            </View>
          </View>

          {/* Live Display */}
          <View style={{ paddingHorizontal: 10 }}>
            {!isGridFormat ? (
              // Format 1: Stacked (Compact to fit on one screen)
              <>
                {visibleCharts.spo2 && (
                  <LiveTrendChart
                    title="Oxygen Level"
                    unit="%"
                    currentLabel={displaySpo2}
                    avgLabel={t("avg")}
                    points={spo2Series}
                    min={70}
                    max={100}
                    ticks={[100, 90, 80, 70]}
                    bands={SPO2_BANDS}
                    accent={C.tint}
                    height={38}
                  />
                )}

                {visibleCharts.pr && (
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
                    height={38}
                  />
                )}

                {visibleCharts.bp && (
                  <LiveBpTrendChart
                    title="Blood Pressure"
                    unit="mmHg"
                    currentSbp={displaySbp}
                    currentDbp={displayDbp}
                    sbpPoints={sbpSeries}
                    dbpPoints={dbpSeries}
                    height={38}
                  />
                )}

                {visibleCharts.rr && (
                  <LiveTrendChart
                    title="Respiratory Rate"
                    unit="bpm"
                    currentLabel={displayRr}
                    avgLabel={t("avg")}
                    points={rrSeries}
                    min={5}
                    max={40}
                    ticks={[40, 20, 5]}
                    bands={[{ value: 40, color: C.tint }, { value: 5, color: C.tint }]}
                    accent={C.tint}
                    height={38}
                  />
                )}

                {visibleCharts.motion && (
                  <LiveMotionBarChart
                    title="Motion"
                    currentLabel={displayMotion}
                    points={motionSeries}
                    height={38}
                  />
                )}

                {visibleCharts.ppg && (
                  <LivePpgWave
                    active={isRealtimeReady}
                    title="PPG"
                    waitingText={t("waitingForSignal")}
                    height={38}
                  />
                )}
              </>
            ) : (
              // Format 2: 2-Column Grid (Bigger charts)
              <>
                {(visibleCharts.spo2 || visibleCharts.bp) && (
                  <View style={styles.gridRow}>
                    {visibleCharts.spo2 && (
                      <View style={styles.gridCol}>
                        <LiveTrendChart
                          title="Oxygen Level"
                          unit="%"
                          currentLabel={displaySpo2}
                          avgLabel={t("avg")}
                          points={spo2Series}
                          min={70}
                          max={100}
                          ticks={[100, 90, 80, 70]}
                          bands={SPO2_BANDS}
                          accent={C.tint}
                          height={48}
                        />
                      </View>
                    )}
                    {visibleCharts.bp && (
                      <View style={styles.gridCol}>
                        <LiveBpTrendChart
                          title="Blood Pressure"
                          unit="mmHg"
                          currentSbp={displaySbp}
                          currentDbp={displayDbp}
                          sbpPoints={sbpSeries}
                          dbpPoints={dbpSeries}
                          height={48}
                        />
                      </View>
                    )}
                  </View>
                )}

                {(visibleCharts.pr || visibleCharts.rr) && (
                  <View style={styles.gridRow}>
                    {visibleCharts.pr && (
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
                          height={48}
                        />
                      </View>
                    )}
                    {visibleCharts.rr && (
                      <View style={styles.gridCol}>
                        <LiveTrendChart
                          title="Respiratory Rate"
                          unit="bpm"
                          currentLabel={displayRr}
                          avgLabel={t("avg")}
                          points={rrSeries}
                          min={5}
                          max={40}
                          ticks={[40, 20, 5]}
                          bands={[{ value: 40, color: C.tint }, { value: 5, color: C.tint }]}
                          accent={C.tint}
                          height={48}
                        />
                      </View>
                    )}
                  </View>
                )}

                {(visibleCharts.motion || visibleCharts.ppg) && (
                  <View style={styles.gridRow}>
                    {visibleCharts.motion && (
                      <View style={styles.gridCol}>
                        <LiveMotionBarChart
                          title="Motion"
                          currentLabel={displayMotion}
                          points={motionSeries}
                          height={48}
                        />
                      </View>
                    )}
                    {visibleCharts.ppg && (
                      <View style={styles.gridCol}>
                        <LivePpgWave
                          active={isRealtimeReady}
                          title="PPG"
                          waitingText={t("waitingForSignal")}
                          height={48}
                        />
                      </View>
                    )}
                  </View>
                )}
              </>
            )}

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
            v{Constants.expoConfig?.version ?? "1.2.5"}
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
