# Blood Pressure Calibration Stabilization & Smoothing Plan

Implement smoothing and stabilization mechanisms in `ViatomModule.kt` to eliminate abrupt calibration cliffs and erratic drift when updating blood pressure calibration.

## User Review Required

> [!IMPORTANT]
> We will add Exponential Moving Average (EMA) smoothing to incoming SBP and DBP readings in `ViatomModule.kt` so that calibration changes (e.g. 120/80 down to 100/60) transition smoothly over a 2-3 second window rather than dropping vertically like a cliff.

## Proposed Changes

### [ViatomModule.kt](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/packages/viatom-o2ring/android/src/main/java/expo/modules/viatom/ViatomModule.kt)

- Add rolling EMA smoothing variables for `smoothedSbp` and `smoothedDbp` (alpha = 0.3).
- Ensure `bpStabilizationCounter = 375` (3 seconds) properly suppresses volatile initial samples on startup and upon `setBpCalibration`.
- Smooth out transitions during calibration updates.

## Verification Plan

### Manual Verification
- Deploy app to Android device.
- Connect O2Ring, start live monitoring.
- Change calibration settings (e.g. from 120/80 to 100/60) and observe a smooth transition rather than a sharp vertical drop.
