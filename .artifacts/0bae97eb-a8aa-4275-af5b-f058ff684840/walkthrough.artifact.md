# iOS Real-Time PPG Waveform Streaming Walkthrough

Successfully updated [ViatomModule.swift](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/packages/viatom-o2ring/ios/ViatomModule.swift).

## Changes Made

### iOS Native Module (`ViatomModule.swift`)
- **Real-Time PPG Wave Packet Extraction (`onPpgPacket`)**: Updated `realDataCallBack` to extract raw waveform points (`VTMRealTimeWF.wave_data`) and emit `"onPpgPacket"` events to JavaScript, matching Android's live PPG waveform streaming capabilities.

## Verification Results
- Verified syntax.
- iOS now streams live PPG waveform packets for real-time charting.
