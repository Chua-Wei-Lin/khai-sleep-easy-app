# Weekly Engineering Documentation: Live Reading Continuation & Bluetooth Connection

## Overview
This document summarizes the technical architecture and engineering enhancements implemented for the Sleep Easy React Native application, focusing on **Live Reading Continuation** and **Bluetooth BLE Connection** stability.

---

## 1. Bluetooth Connection & Stability Architecture

### A. Device Discovery & Caching (`ViatomModule.kt`)
* **Persistent Device Cache**: Retained Lepu SDK `Bluetooth` discovery objects in `foundDevices` across scan cycles. Once a device is discovered once during an app session, it remains cached for instant reconnection without requiring a fresh scan.
* **Scan/Connect Collision Prevention**: Enforced a native `stopScan()` call immediately prior to initiating any GATT connection (`BleServiceHelper.connect(...)`) to release the Android Bluetooth radio controller and prevent GATT error `133`.

### B. State Synchronization & Race Condition Guard (`connectionSeq`)
* **Asynchronous Disconnect Protection**: Implemented a monotonic sequence token (`connectionSeq`) in native Kotlin. Any pending or lagging `disconnect` actions are automatically ignored if a new `connect` sequence has already been initiated, preventing state corruption (`NO_DEVICE_CONNECTED`).
* **Post-Sync Real-Time Resumption**: Configured the history download queue (`processReadQueue` in `O2RingProvider.tsx`) to explicitly trigger `startRealtimeStream()` and `O2Ring.setLiveWave(true)` the exact moment history syncing completes.
* **Native Wave Polling Timer (`waveTask`)**: Created `ensureWaveTaskRunning()` in native Kotlin to drive the 1-second continuous `oxyGetRtWave` polling loop upon connection and resume, ensuring raw PPG packets feed both the C++ Blood Pressure algorithm (`megaBp.stepNative`) and live charts.

### C. User-Initiated Manual Control
* **Auto-Reconnect Disabled**: Removed startup and discovery auto-reconnect logic to give clinicians and patients strict, predictable manual control over device pairing and connection states.

---

## 2. Live Reading Continuation & Visualization

### A. Dashboard Layout & Hierarchy
* **Format 2 (2-Column Grid) Default**: Configured the 2-column side-by-side grid layout as the default view on app startup for maximum screen efficiency.
* **Component Order (Top to Bottom)**:
  1. **Summary Card**: Respiratory Rate (Estimated) & Perfusion Index (PI).
  2. **Oxygen Level** (`LiveTrendChart`)
  3. **Pulse Rate** (`LiveTrendChart`)
  4. **Blood Pressure** (`LiveBpTrendChart`)
  5. **Motion** (`LiveMotionBarChart`)
  6. **PPG Waveform** (`LivePpgWave`)
  7. **Disconnect Button**

### B. Advanced Chart Styling & Visuals
* **Color-Coded Blood Pressure**: SBP is rendered in **Red (`#E74C3C`)** and DBP is rendered in **Blue (`#3498DB`)** with clear, compact legend headers (`S:xxx D:xxx`).
* **Vertical "Curtain" Shadow Fill (`areaPath`)**: Added a vertical gradient fill hanging straight down from the trend lines to the baseline. Segment cutoffs drop vertically during signal interruptions or gaps.
* **Fixed 2-Minute Sliding Window**: Calibrated trend charts to a fixed 2-minute rolling time window (`windowMs = 2 * 60 * 1000`) starting from the left edge (`x = 0`) and progressing smoothly to the right.
* **Permanent Live Indicator Dots**: Pinned indicator circles (`<Circle>`) permanently to the tip of active recording lines.

### C. Configurable PPG Sampling Rate
* **Dual-Layer Architecture**: Background chunk recording (`startPpgCapture`) and CSV uploads continue recording at standard **125 Hz** for clinical integrity.
* **Visual Pacing**: Added a Settings screen for PPG Sampling Rate (`125 Hz`, `100 Hz`, `75 Hz`, `50 Hz`) that dynamically adjusts visual rendering decimation on the fly without breaking or restarting the underlying data stream.
