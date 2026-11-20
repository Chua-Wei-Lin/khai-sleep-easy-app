# Defensive Back Navigation (`canGoBack`) Walkthrough

Successfully updated [BpCalibration.tsx](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/app/BpCalibration.tsx).

## Changes Made

### BP Calibration Screen (`BpCalibration.tsx`)
- **Defensive Back Handler (`router.canGoBack() ? router.back() : handleExit()`)**: Updated `handleBack` to check if the navigation stack can pop back natively. If a history layer exists, it pops cleanly; otherwise, it safely falls back to `handleExit()`. This prevents the back button from getting stuck after a single use.

## Verification Results
- Verified with `analyze_file` (0 errors found).
- Back navigation operates smoothly across multiple uses.
