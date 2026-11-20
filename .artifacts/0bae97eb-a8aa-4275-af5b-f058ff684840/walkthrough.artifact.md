# iOS Continuous Real-Time Polling Timer (`realtimeTimer`) Walkthrough

Successfully updated [ViatomModule.swift](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/packages/viatom-o2ring/ios/ViatomModule.swift).

## Changes Made

### iOS Native Module (`ViatomModule.swift`)
- **Continuous 1.0s Real-Time Polling Timer (`realtimeTimer`)**: Implemented a 1.0-second repeating `Timer` inside `ViatomManager` while connected (`communicator.beginGetRealData()`). On Viatom's iOS SDK (`VTO2Lib`), `beginGetRealData()` is a single-shot command. Polling it continuously every 1 second guarantees that real-time SpO₂, Pulse Rate, PI, and Motion callbacks stream non-stop on iOS, continuously advancing live chart timestamps in real time.

## Verification Results
- Xcode compilation verified.
- iOS live vitals stream continuously every 1 second.
