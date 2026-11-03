# Multiple Calibration Timestamps & Counter Walkthrough

Successfully implemented support for **Multiple Calibration Timestamps** and a **Calibration Counter Badge** across [BpCalibration.tsx](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/app/(tabs)/settings/BpCalibration.tsx), [index.tsx](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/app/(tabs)/home/index.tsx), and [LiveBpTrendChart.tsx](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/components/live/LiveBpTrendChart.tsx).

## Changes Made

### Calibration Settings (`BpCalibration.tsx`)
- Appends each calibration timestamp into a `calibrationTimes` array in `AsyncStorage` (`settings:bp_calibration`), preserving all calibration events in the current session.

### Home Screen & Live BP Chart (`index.tsx` & `LiveBpTrendChart.tsx`)
- **Multiple Vertical Lines**: Renders an orange dashed vertical line for **every** calibration event that falls within the current chart time window.
- **Calibration Counter Badge**: Displays a clean `Calib #2` (or `Calib #N`) badge in the blood pressure card header so the user can see at a glance how many times calibration has been performed.

## Verification Results
- Calibrating multiple times preserves all timestamps and displays vertical dashed lines for each calibration event alongside a `Calib #N` counter badge!
