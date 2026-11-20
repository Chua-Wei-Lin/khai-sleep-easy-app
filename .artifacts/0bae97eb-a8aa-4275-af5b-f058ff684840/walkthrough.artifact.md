# Monotonically Advancing Timestamps in LiveDataStore Walkthrough

Successfully updated [LiveDataStore.ts](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/service/LiveDataStore.ts).

## Changes Made

### Singleton Live Data Store (`LiveDataStore.ts`)
- **Monotonically Advancing Timestamps (`tToUse`)**: Updated `addPoint` to guarantee that incoming real-time ticks always advance forward in time (`tToUse = last && updatedAt <= last.t ? last.t + 250 : updatedAt`). This prevents duplicate millisecond timestamps from rejecting points and ensures live chart time axes slide forward continuously on both iOS and Android.

## Verification Results
- Verified with `analyze_file` (0 errors found).
- Live charts update fluidly and continuously.
