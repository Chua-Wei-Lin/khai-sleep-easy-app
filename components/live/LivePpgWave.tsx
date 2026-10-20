import React, { useCallback, useEffect, useState } from "react";
import {
  AppState,
  LayoutChangeEvent,
  StyleSheet,
  Text,
  View,
} from "react-native";
import Svg, { Line, Path, Text as SvgText } from "react-native-svg";
import { useFocusEffect } from "expo-router";
import * as O2Ring from "@ios-app/viatom-o2ring";
import { useTheme } from "../../theme/ThemeProvider";

const FS = 125; // samples per second from the ring
const WINDOW_SAMPLES = FS * 4; // 4 seconds on screen
const START_BUFFER = FS; // wait for 1 s of samples before drawing
const MAX_QUEUE = FS * 3;
const TICK_MS = 50; // 20 redraws per second
const DECIM = 2; // draw every 2nd sample: plenty of detail at phone width, half the work

// Fixed vertical range, in the ring's own units (our recordings ran from about 50 to 170).
// Values outside the range are clamped. Widen it if a patient's signal gets cut off.
const RANGE_MIN = 30;
const RANGE_MAX = 190;

/**
 * The ring's waveform points downward (each pulse drops sharply). FLIP = true draws it
 * pulse-up and labels the axis in relative units (0 = weakest, top = strongest).
 * FLIP = false draws the ring's own numbers, as saved in the CSV.
 */
const FLIP = true;

type GridProps = { width: number; height: number; color: string; textColor: string };

// Static layer: grid lines and number range. It never changes, so it is drawn once.
const PpgGrid = React.memo(function PpgGrid({ width, height, color, textColor }: GridProps) {
  const pad = 6;
  const top = FLIP ? RANGE_MAX - RANGE_MIN : RANGE_MAX;
  const bottom = FLIP ? 0 : RANGE_MIN;
  const mid = Math.round((top + bottom) / 2);
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
      <SvgText x={4} y={pad + 12} fill={textColor} fontSize={11}>
        {top}
      </SvgText>
      <SvgText x={4} y={height / 2 - 3} fill={textColor} fontSize={11}>
        {mid}
      </SvgText>
      <SvgText x={4} y={height - pad - 3} fill={textColor} fontSize={11}>
        {bottom}
      </SvgText>
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
};

// Moving layer: only this component re-renders while the wave scrolls.
const WaveLayer = React.memo(function WaveLayer({
  run,
  width,
  height,
  color,
  textColor,
  waitingText,
}: WaveProps) {
  const [d, setD] = useState("");
  const [waiting, setWaiting] = useState(true);

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
    const stepX = width / (WINDOW_SAMPLES - 1);

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
      if (buf.length < 2) return;

      const startX = (WINDOW_SAMPLES - buf.length) * stepX; // new samples enter on the right
      const parts: string[] = [];
      for (let i = 0; i < buf.length; i += DECIM) {
        const v = Math.min(RANGE_MAX, Math.max(RANGE_MIN, buf[i]));
        const f = (v - RANGE_MIN) / span;
        const y = pad + (FLIP ? f : 1 - f) * h;
        parts.push((i === 0 ? "M" : "L") + (startX + i * stepX).toFixed(1) + " " + y.toFixed(1));
      }
      setD(parts.join(" "));
    };

    const timer = setInterval(tick, TICK_MS);
    return () => {
      clearInterval(timer);
      try {
        sub?.remove();
      } catch {}
      try {
        O2Ring.setLiveWave(false);
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
        <Text style={[styles.hz, { color: C.sub }]}>125 Hz</Text>
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
            <PpgGrid width={width} height={height} color={C.border} textColor={C.sub} />
            <WaveLayer
              run={run}
              width={width}
              height={height}
              color={C.tint}
              textColor={C.sub}
              waitingText={waitingText}
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
