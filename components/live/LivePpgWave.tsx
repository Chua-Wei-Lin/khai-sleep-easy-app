import React, { useCallback, useEffect, useRef, useState } from "react";
import {
  AppState,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Line, Path } from "react-native-svg";
import { useFocusEffect } from "expo-router";
import * as O2Ring from "@ios-app/viatom-o2ring";
import { useTheme } from "../../theme/ThemeProvider";
import AsyncStorage from "@react-native-async-storage/async-storage";

const FS = 125; // standard recording frequency (125 Hz)
const WINDOW_SAMPLES = FS * 4; // 4 seconds on screen
const START_BUFFER = FS; // 1 second buffer
const MAX_QUEUE = FS * 3;
const TICK_MS = 50; // 20 redraws per second

const RANGE_MIN = 30;
const RANGE_MAX = 190;
const FLIP = true;

type GridProps = { width: number; height: number; color: string };

// Static layer: clean reference grid lines
const PpgGrid = React.memo(function PpgGrid({ width, height, color }: GridProps) {
  const pad = 6;
  return (
    <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
      {[0, 0.5, 1].map((f) => (
        <Line
          key={f}
          x1={0}
          x2={width}
          y1={pad + f * (height - pad * 2)}
          y2={pad + f * (height - pad * 2)}
          stroke={color}
          strokeWidth={1}
        />
      ))}
    </Svg>
  );
});

type WaveProps = {
  run: boolean;
  width: number;
  height: number;
  color: string;
  textColor: string;
  waitingText: string;
  ppgHz: number;
};

// Moving layer: only this component re-renders while the wave scrolls.
const WaveLayer = React.memo(function WaveLayer({
  run,
  width,
  height,
  color,
  textColor,
  waitingText,
  ppgHz,
}: WaveProps) {
  const [d, setD] = useState("");
  const [waiting, setWaiting] = useState(true);

  // Keep latest ppgHz in a ref so useEffect does NOT need to re-subscribe to native BLE stream when ppgHz changes
  const ppgHzRef = useRef(ppgHz);
  useEffect(() => {
    ppgHzRef.current = ppgHz;
  }, [ppgHz]);

  useEffect(() => {
    if (!run) return;

    const queue: number[] = [];
    const buf: number[] = [];
    let playing = false;
    let carry = 0;
    let last = Date.now();
    let lastData = 0;
    const pad = 6;
    const h = height - pad * 2;
    const span = RANGE_MAX - RANGE_MIN;

    try {
      O2Ring.setLiveWave(true);
    } catch {}

    let sub: { remove: () => void } | null = null;
    try {
      sub = O2Ring.addPpgPacketListener((e) => {
        for (let i = 0; i < e.samples.length; i++) queue.push(e.samples[i]);
        lastData = Date.now();
        if (queue.length > MAX_QUEUE) queue.splice(0, queue.length - FS * 2);
      });
    } catch {}

    const tick = () => {
      const hz = ppgHzRef.current;
      const decim = hz === 50 ? 5 : hz === 75 ? 4 : hz === 100 ? 3 : 2;
      const stepX = width / (WINDOW_SAMPLES - 1);

      const now = Date.now();
      let n = 0;
      if (!playing) {
        carry = 0;
        if (queue.length >= START_BUFFER) playing = true;
      } else {
        carry += (now - last) * (FS / 1000);
        n = Math.floor(carry);
        carry -= n;
      }
      last = now;

      if (playing && n > 0) {
        if (queue.length === 0) {
          playing = false;
        } else {
          const take = Math.min(n, queue.length);
          for (let i = 0; i < take; i++) buf.push(queue[i]);
          queue.splice(0, take);
          if (buf.length > WINDOW_SAMPLES) buf.splice(0, buf.length - WINDOW_SAMPLES);
        }
      }

      setWaiting(now - lastData > 3000);

      if (buf.length === 0) return;

      if (buf.length === 1) {
        const v = Math.min(RANGE_MAX, Math.max(RANGE_MIN, buf[0]));
        const f = (v - RANGE_MIN) / span;
        const y = pad + (FLIP ? f : 1 - f) * h;
        setD(`M0 ${y.toFixed(1)} L${width.toFixed(1)} ${y.toFixed(1)}`);
        return;
      }

      // Left-to-right sweep progression using current ppgHzRef decimation
      const parts: string[] = [];
      for (let i = 0; i < buf.length; i += decim) {
        const v = Math.min(RANGE_MAX, Math.max(RANGE_MIN, buf[i]));
        const f = (v - RANGE_MIN) / span;
        const y = pad + (FLIP ? f : 1 - f) * h;
        const x = (i / (WINDOW_SAMPLES - 1)) * width;
        parts.push((i === 0 ? "M" : "L") + x.toFixed(1) + " " + y.toFixed(1));
      }
      setD(parts.join(" "));
    };

    const timer = setInterval(tick, TICK_MS);
    return () => {
      clearInterval(timer);
      try {
        sub?.remove();
      } catch {}
      setD("");
      setWaiting(true);
    };
  }, [run, width, height]);

  return (
    <>
      {d !== "" && (
        <Svg width={width} height={height} style={StyleSheet.absoluteFill}>
          <Path
            d={d}
            fill="none"
            stroke={color}
            strokeWidth={2.2}
            strokeLinejoin="round"
            strokeLinecap="round"
          />
        </Svg>
      )}
      {waiting && (
        <Text style={[styles.waiting, { color: textColor, top: height / 2 - 10 }]}>
          {waitingText}
        </Text>
      )}
    </>
  );
});

type Props = {
  active: boolean;
  title: string;
  waitingText: string;
  height?: number;
};

export default function LivePpgWave({
  active,
  title,
  waitingText,
  height = 150,
}: Props) {
  const { colors: C } = useTheme();
  const [width, setWidth] = useState(0);
  const [ppgHz, setPpgHz] = useState<number>(125);

  useFocusEffect(
    useCallback(() => {
      AsyncStorage.getItem("ppg_sampling_hz").then((val) => {
        if (val === "100 Hz") setPpgHz(100);
        else if (val === "75 Hz") setPpgHz(75);
        else if (val === "50 Hz") setPpgHz(50);
        else setPpgHz(125); // Default to 125 Hz
      });
    }, [])
  );

  // only stream while this screen is in front and the app is in the foreground
  const [focused, setFocused] = useState(false);
  useFocusEffect(
    useCallback(() => {
      setFocused(true);
      return () => setFocused(false);
    }, [])
  );
  const [appActive, setAppActive] = useState(AppState.currentState === "active");
  useEffect(() => {
    const sub = AppState.addEventListener("change", (s) =>
      setAppActive(s === "active")
    );
    return () => sub.remove();
  }, []);

  const run = active && focused && appActive && width > 0;

  const onLayout = (e: LayoutChangeEvent) =>
    setWidth(Math.round(e.nativeEvent.layout.width));

  return (
    <View
      style={[styles.card, { backgroundColor: C.bg2, borderColor: C.border }]}
      accessible
      accessibilityLabel={title}>
      <View style={styles.headRow}>
        <Text style={[styles.title, { color: C.text }]}>{title}</Text>
        <Text style={[styles.hz, { color: C.sub }]}>{ppgHz} Hz</Text>
      </View>

      <View
        onLayout={onLayout}
        style={{
          height,
          borderWidth: StyleSheet.hairlineWidth,
          borderColor: C.border,
          overflow: "hidden",
        }}>
        {width > 0 && (
          <>
            <PpgGrid width={width} height={height} color={C.border} />
            <WaveLayer
              run={run}
              width={width}
              height={height}
              color={C.tint}
              textColor={C.sub}
              waitingText={waitingText}
              ppgHz={ppgHz}
            />
          </>
        )}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    borderRadius: 12,
    borderWidth: StyleSheet.hairlineWidth,
    padding: 8,
    marginBottom: 6,
  },
  headRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
    marginBottom: 4,
  },
  title: { fontSize: 13, fontWeight: "700" },
  hz: { fontSize: 10 },
  waiting: { position: "absolute", alignSelf: "center", fontSize: 12 },
});
