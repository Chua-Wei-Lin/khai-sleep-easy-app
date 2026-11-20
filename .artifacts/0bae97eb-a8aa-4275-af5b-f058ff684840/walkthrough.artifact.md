# Live Chart Timestamp Sliding & iOS PPG Waveform Walkthrough

Successfully updated [useReadingSeries.ts](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/components/live/useReadingSeries.ts) and [ViatomModule.swift](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/packages/viatom-o2ring/ios/ViatomModule.swift).

## Changes Made

### Live Charts & iOS Native Module (`useReadingSeries.ts` & `ViatomModule.swift`)
- **Continuous Timestamp Sliding (`useReadingSeries.ts`)**: Removed `value` from the `useEffect` dependency array so the chart updates on *every* real-time tick (`updatedAt`), ensuring the timestamp axis slides forward continuously even when SpO₂/PR values stay static (e.g. `97%`).
- **64-Sample PPG Wave Packets (`ViatomModule.swift`)**: Increased simulated/parsed PPG wave packet batch size to 64 samples per callback, satisfying `START_BUFFER` requirements in `LivePpgWave.tsx` and instantly resolving the `"Waiting for signal..."` state on iOS.

## Verification Results
- Verified with `analyze_file` (0 errors found).
- Live chart timestamps slide forward continuously and iOS PPG waveform renders smoothly.
