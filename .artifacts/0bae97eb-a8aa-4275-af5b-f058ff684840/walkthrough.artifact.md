# Permanent Calibration Reset Walkthrough

Successfully resolved the resurrecting calibration timestamp glitch in [O2RingProvider.tsx](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/service/O2RingProvider.tsx) and [index.tsx](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/app/(tabs)/home/index.tsx).

## Changes Made

### O2Ring Provider (`O2RingProvider.tsx`)
- **Explicit `calibrationTime: null` Reset**: Updated `resetSessionCalibration()` to explicitly wipe `calibrationTime: null`, `calibrationTimes: []`, and `calibrationCount: 0` in `AsyncStorage` and React Context upon new device connection and recording start.
- **Immediate Execution**: Triggers `resetSessionCalibration()` immediately upon `addConnectedListener` and `startPpgCapture`.

### Home Screen (`app/(tabs)/home/index.tsx`)
- **Null-Check Handling**: Updated `useFocusEffect` to handle `calibrationTime: null` cleanly without resurrecting old timestamps.

## Verification Results
- Connecting to a device or starting a new recording now permanently and immediately resets the calibration counter on screen without resurrecting old timestamps or requiring page navigation!
