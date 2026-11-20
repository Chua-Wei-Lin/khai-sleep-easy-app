# Continuous Series Point Accumulation & iOS Real Wave Walkthrough

Successfully updated [useReadingSeries.ts](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/components/live/useReadingSeries.ts) and [ViatomModule.swift](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/packages/viatom-o2ring/ios/ViatomModule.swift).

## Changes Made

### Reading Series Hook & iOS Native Module (`useReadingSeries.ts` & `ViatomModule.swift`)
- **Strict `resetKey` Equality Guard (`prevResetKey`)**: Updated `useReadingSeries.ts` to check `resetKey !== prevResetKey.current`. This prevents re-renders with identical MAC addresses from calling `setPoints([])` and wiping out chart data back to a single frame.
- **Native iOS `beginGetRealWave()`**: Added `communicator.beginGetRealWave()` to `bootstrapAfterServiceReady()` in `ViatomModule.swift` to start native optical wave data callbacks.

## Verification Results
- Verified with `analyze_file` (0 errors found).
- Live chart series accumulate continuously without resetting to single frames.
