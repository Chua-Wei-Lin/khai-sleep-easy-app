# Sleep Easy App - Technical Architecture & Algorithm Documentation

This document provides a comprehensive, publication-grade technical specification for the blood pressure calculation algorithms, respiratory rate extraction pipeline, Bluetooth lifecycle and disconnect safeguards, and PDF report generation system implemented in the **Sleep Easy App**.

---

## 1. Blood Pressure Calculation & Signal Processing Algorithm

### 1.1 Native C++ Integration & Binding
- **Core Library**: `megabp` C++ native library integrated via JNI (`MegaBpNative`) and managed inside the custom Android Kotlin module ([`ViatomModule.kt`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/packages/viatom-o2ring/android/src/main/java/expo/modules/viatom/ViatomModule.kt)).
- **Calibration Anchoring**: Calibration parameters ($\text{SBP}_{\text{calib}}, \text{DBP}_{\text{calib}}$) are stored in `AsyncStorage` (`settings:bp_calibration`) and applied strictly once upon initial manual connection (`O2Ring.setBpCalibration`).

### 1.2 Implied Ratio Multiplier Clamping & Drift Protection
To eliminate optical drift creep and step-down calibration drops during extended monitoring sessions:
- **Ratio Clamping**: Implied ratio multipliers are constrained within a tight safety range:
  $$0.85 \le \text{Ratio} \le 1.15$$
- **Tachycardia Guard**: BP calculations are gated when Heart Rate exceeds 90 bpm ($\text{PR} > 90$), preventing transient exercise or arousal tachycardia from skewing resting arterial blood pressure estimates.
- **SQI Gating**: Low Signal Quality Index ($\text{SQI} < 0.6$) frames are filtered out prior to C++ processing.

### 1.3 Stabilization Window & EMA Smoothing
- **Optical Stabilization**: A 3-second optical stabilization window ([`isBpInitialized`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/packages/viatom-o2ring/android/src/main/java/expo/modules/viatom/ViatomModule.kt#L120)) runs on initial manual connection. A single-initialization guard prevents mid-session stream retries from re-triggering stabilization loops.
- **EMA Smoothing**: Real-time Systolic (SBP) and Diastolic (DBP) estimates are smoothed using an Exponential Moving Average:
  $$\text{BP}_{\text{smoothed}}(t) = \alpha \cdot \text{BP}_{\text{raw}}(t) + (1 - \alpha) \cdot \text{BP}_{\text{smoothed}}(t-1) \quad (\alpha = 0.08)$$

---

## 2. Respiratory Rate (RR / RIV) Signal Processing Pipeline

### 2.1 Respiratory-Induced Variations (RIV) Extraction
- **Waveform Source**: Extracted directly from continuous Photoplethysmogram (PPG) infrared and red light signals ([`HaemodynamicCalculations.ts`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/service/HaemodynamicCalculations.ts)).
- **Multi-Modal Fusion**: Fuses three distinct physiological modulations:
  1. **Amplitude Modulation (AM)**: Beat-to-beat PPG peak amplitude variations caused by intrathoracic pressure shifts during inhalation and exhalation.
  2. **Baseline Wander (BW)**: Low-frequency respiratory-induced baseline variation isolated via Butterworth bandpass filtering ($0.1\text{ Hz} \le f \le 0.5\text{ Hz}$).
  3. **Frequency Modulation (FM)**: Respiratory Sinus Arrhythmia (RSA) beat-interval fluctuations.

### 2.2 Sampling Rate Synchronization
- **Dynamic Hz Sync**: Automatically adapts filter coefficients and rolling buffer windows to user-selected PPG sampling frequencies (`ppg_sampling_hz`: $50\text{ Hz}, 100\text{ Hz}, 125\text{ Hz}$).
- **Windowing**: Computed over a 30-second sliding window with spectral zero-crossing zero-phase verification.

---

## 3. Bluetooth Connection, Auto-Disconnect & Safeguard Architecture

### 3.1 Connection Lifecycle & Timeout Guard
- **12-Second Timeout Guard**: Manual connection attempts ([`O2RingProvider.tsx`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/service/O2RingProvider.tsx#L1260)) race against a 12-second timeout via `Promise.race`. If a device is powered off or out of range, the connection rejects cleanly, preventing frozen/grey loading screens.
- **Phantom Connection Interceptor**: Upon receiving native `onConnected` events, the app immediately executes an active reachability check (`O2Ring.getInfo()`) with a 3-second timeout. If `getInfo()` fails, it identifies an Android BLE GATT cached phantom connection for an offline device, issues an internal `O2Ring.disconnect()`, and halts execution before starting data streams or PPG recording.

### 3.2 Overnight Auto-Reconnect Safeguard Suppression
- **Intentional Disconnect Guard**: When manual connections fail or when user explicitly disconnects, `intentionalDisconnectRef.current = true` and `isManualConnectingRef.current = true` are flagged.
- **Reason Code Suppression**: Disconnect events with `reason: 10` (programmatic SDK disconnect) or `reason: 0` (normal user disconnect) are recognized as intentional, completely suppressing the overnight auto-reconnect safeguard and preventing infinite reconnection loops.

### 3.3 Guaranteed State Cleanup
- **Complete Teardown**: Every disconnect event unconditionally resets `connectedDeviceRef.current = null`, clears vitals (`SpO2`, `PR`, `RR`, `BP`), stops continuous capture, and clears background retry timers (`infoRetryTimer`, `readTimeout`).

---

## 4. PDF Report Generation & Server Sync Architecture

### 4.1 Web-Matching 1:1 Diagnostic Layout
- **Layout Specification**: The PDF report generator ([`PdfReportGenerator.ts`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/service/PdfReportGenerator.ts)) matches the official SleepEasy web backend layout 1:1.
- **Demographics & Metadata**: Displays Patient Name, Age (calculated from DOB), Sex, Start Time, End Time, and Duration.
- **Oxygen Desaturation Index (ODI)**: Computes $3\%$ and $4\%$ oxygen drops and per-hour desaturation rates.
- **Distribution Tables**: Renders Oxygen Level distribution (soft blue `#D4E6F1` / `#EBF5FB`) and Pulse Rate distribution (soft pink `#FADBD8` / `#FDEDEC`) with calculated durations (`HH:MM:SS`) for every threshold bracket.

### 4.2 SVG Trend Charts & Non-Clipping Axis Geometry
- **High-Resolution Vector Charts**: Renders Oxygen Level (green `#16a34a`), Pulse Rate (green `#16a34a`), and Motion (orange `#f97316`) SVG trend graphs with vertical time grid lines.
- **Y-Axis Margin Separation**: Y-axis labels sit cleanly in a dedicated left margin (`startX = 55`, `text-anchor="end"`), and bottom axis lines (`x1="${startX}" x2="755"`) match grid line widths, completely eliminating number squeezing and axis line clipping.
- **1-Page A4 Fit**: Sized with `@page { size: A4 portrait; margin: 4mm; }` to fit the complete diagnostic report onto 1 single page.

### 4.3 Asset Embedding, Filename Mapping & Dual Export UI
- **Synchronous Base64 Embedding**: Embeds the complete `assets/sleepeasylogo.png` image data (`LOGO_BASE64`) synchronously into the HTML header.
- **1:1 Filename Mapping**: Appends unique timestamped filenames (`SleepEasy_Report_${baseName}_${Date.now()}.pdf`) matching the source CSV file name.
- **Dual Export UI**: Detailed Report screen ([`DetailedReport.tsx`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/app/(tabs)/history/DetailedReport.tsx)) features two dedicated buttons:
  1. **Upload to Server**: Uploads CSV & PDF to the backend server with non-blocking offline network error handling and auto-disappearing toasts (`ToastAndroid.show`).
  2. **Export PDF & Share**: Compiles the PDF and opens native OS file sharing via `expo-sharing` (`Sharing.shareAsync`).

---

## 5. Summary of System Features & Polish

| Feature Domain | Implementation Details | Location |
| :--- | :--- | :--- |
| **BP Calculation** | Implied Ratio Clamping ($0.85x - 1.15x$), Tachycardia Guard ($PR > 90$), SQI gating, EMA smoothing ($\alpha = 0.08$), 3s optical stabilization. | [`ViatomModule.kt`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/packages/viatom-o2ring/android/src/main/java/expo/modules/viatom/ViatomModule.kt) |
| **Respiratory Rate (RIV)** | Amplitude Modulation, Baseline Wander Butterworth bandpass ($0.1 - 0.5\text{ Hz}$), frequency zero-crossing fusion, 50-125 Hz sampling rate sync. | [`HaemodynamicCalculations.ts`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/service/HaemodynamicCalculations.ts) |
| **Bluetooth Lifecycle** | 12s connection timeout, 3s `getInfo()` phantom connection interceptor, `reason: 10/0` safeguard suppression, guaranteed state cleanup. | [`O2RingProvider.tsx`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/service/O2RingProvider.tsx) |
| **PDF Generation** | 1:1 Web layout, ODI 3%/4% drops, blue/pink distribution tables, SVG trend graphs, non-clipping Y-axis, 1-page A4 fit, `expo-sharing` integration. | [`PdfReportGenerator.ts`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/service/PdfReportGenerator.ts) |
| **PPG Continuous Caching** | 10-minute segmented raw PPG local CSV caching with native background uploading (`PpgUploader.kt`). | [`PpgUploader.kt`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/packages/viatom-o2ring/android/src/main/java/expo/modules/viatom/PpgUploader.kt) |
| **UI Polish** | In-chart calibration counter labels (`#1`, `#2`), Start-End history card time labels, compact typography, Fabric UI manager crash fixes. | [`index.tsx`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/app/(tabs)/home/index.tsx), [`HistoryCard.tsx`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/components/HistoryCard.tsx) |
