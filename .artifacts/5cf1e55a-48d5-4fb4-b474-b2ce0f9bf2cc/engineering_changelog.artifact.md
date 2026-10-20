# Engineering Changelog & Technical Design Record

This document outlines all technical changes, architectural additions, and algorithm integrations added to the **Sleep Easy App** during this development cycle, along with the reasoning (`what` and `why`).

---

## 1. 10-Minute Segmented PPG Caching & Background Uploading
* **What Was Added**:
  - Configured native `startPpgCapture` in `ViatomModule.kt` to record continuous PPG data in 600-second (10-minute) chunks.
  - Added an event-driven listener (`onPpgChunkReady`) in `O2RingProvider.tsx` that triggers immediately when a chunk file is finalized on disk.
  - Implemented local file caching inside patient `o2data` directories and automated background chunk uploading via `uploadCsv`.
* **Why**:
  - **Reliability & Offline Support**: Slicing data into 10-minute files ensures that if the app is closed or network connection drops, previously recorded segments are safely cached locally and uploaded once reconnected without losing hours of recording.
  - **Event-Driven Stability**: Listening to `onPpgChunkReady` avoids guesswork timers, ensuring chunks are uploaded only when fully written and closed on disk.

---

## 2. Real-Time Native Blood Pressure (SBP/DBP) Calculation
* **What Was Added**:
  - Integrated the bundled native C++ `megabp` library (`MegaBpNative`) directly into the `ViatomModule.kt` real-time waveform observer (`EventOxyRtData`).
  - Passed incoming live PPG samples (`wFs`) through `megaBp.stepNative(sample)` in real-time.
  - Created a bridge listener (`addBloodPressureListener`) and exposed live `sbp` and `dbp` state in `O2RingProvider`.
* **Why**:
  - **Android APK Advantage**: As requested, leveraging the local Android native C++ library allows direct calculation of Systolic and Diastolic Blood Pressure from optical pulse waves without needing cloud roundtrips or iOS App Store restrictions.

---

## 3. Clinical HRV & Haemodynamic Calculations (`HaemodynamicCalculations.ts`)
* **What Was Added**:
  - Implemented exact mathematical formulas from the project's proof document:
    - **SDNN & RMSSD**: Time-domain Heart Rate Variability calculations from interbeat intervals ($RR = 60000 / HR$).
    - **pNN50**: Percentage of successive intervals differing by $>50\,\text{ms}$.
    - **Mean Arterial Pressure (MAP)**: $\text{MAP} = \text{DBP} + \frac{1}{3}(\text{SBP} - \text{DBP})$.
    - **Respiratory Rate (RR)**: Derived from heart rate range ($\text{HR}_{\max} - \text{HR}_{\min}$).
    - **Sleep Stage Classification Matrix**: Heuristic rule-based mapping for Wake, Light (N1/N2), Deep (N3), and REM based on delta PR, RMSSD, and SpO2.
* **Why**:
  - **Clinical Telemetry Expansion**: Fulfills the requirement to display advanced vitals beyond simple oxygen saturation by calculating core autonomic nervous system and cardiovascular metrics on device.

---

## 4. UI Dashboard Restructuring & Scrolling Layout
* **What Was Added**:
  - Created a dual-line Blood Pressure trend chart (`LiveBpTrendChart.tsx`) plotting both SBP and DBP simultaneously.
  - Restructured the Home screen layout ([app/(tabs)/home/index.tsx](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/app/(tabs)/home/index.tsx)):
    1. **Primary Screen View**: Only the most critical vitals (Oxygen Level, Blood Pressure, and Pulse Rate graphs) fit on the primary screen view.
    2. **Secondary Section (Scroll Down)**: Haemodynamic Vitals Summary card and Live PPG Signal waveform are placed below, requiring a simple scroll down to view.
* **Why**:
  - **Executive & Clinical Usability**: Prioritizes the three most critical primary vitals (SpO2, BP, PR) above the fold on the main screen, while keeping secondary diagnostic summaries and raw waveform traces accessible via scrolling.
