# O2Ring Data Collection & Bluetooth Scanning Architecture

This document provides a comprehensive technical specification detailing **how SpO₂ ($\text{O}_2$), Pulse Rate ($\text{PR}$), and Motion data are collected** on the physical hardware device, and **how devices are discovered, filtered, and displayed** within the app's Scan screen ([`Scan.tsx`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/app/(tabs)/home/Scan.tsx)).

---

## Part 1: Physical Data Collection on the O2Ring Device

### 1.1 Oxygen ($\text{SpO}_2$) & Pulse Rate ($\text{PR}$) Collection
- **Optical Sensors**: The ring utilizes two solid-state light-emitting diodes (LEDs) emitting red ($\lambda \approx 660\text{ nm}$) and infrared ($\lambda \approx 940\text{ nm}$) light through the microvascular bed of the finger, paired with a high-sensitivity photodiode.
- **AC/DC Photoplethysmography (PPG)**:
  - **$\text{SpO}_2$**: Derived from the ratio of ratios ($R$) of red-to-infrared pulsatile ($\text{AC}$) and static ($\text{DC}$) optical absorption, mapping hemoglobin oxygen saturation via the Beer-Lambert law.
  - **$\text{PR}$**: Extracted from the cardiac-synchronous AC waveform periodicity (inter-beat intervals $T_{\text{IBI}}$).
- **Firmware Processing**: Internal MCU samples optical channels at high frequencies, applies noise filtering, and packages telemetry into Bluetooth Low Energy (BLE) real-time characteristic notifications.

### 1.2 Motion Collection
- **Inertial Sensors**: An integrated tri-axial low-power MEMS accelerometer measures linear acceleration along the $X, Y$, and $Z$ axes.
- **Actigraphy & Artifact Index**: Calculates composite acceleration magnitude $A(t) = \sqrt{A_x^2 + A_y^2 + A_z^2}$. High-pass filtered variations quantify physical movement (motion spikes), enabling the distinction between restful sleep and wakefulness, as well as artifact discrimination for SpO₂ and PR readings.

### 1.3 BLE Transmission & Buffering
- **Real-Time Telemetry**: Transmitted over BLE characteristics via native Android/iOS modules (`ViatomModule.kt` / `VTO2Lib`).
- **Overnight Memory**: Logged locally on the ring's flash memory in binary chunks, downloaded as structured CSV session files upon connection.

---

## Part 2: Bluetooth Discovery & Display in the Scan Screen (`Scan.tsx`)

### 2.1 BLE Scanning & Advertisement Parsing
- **Scan Initialization**: When navigating to the Scan screen, `useFocusEffect` triggers `startScan()`, invoking native BLE scanning filters targeting Viatom / O2Ring service UUIDs and device name prefixes (`O2Ring`, `O2Watch`, `KidsO2`, `O2M`).
- **Discovery Listener**: `O2Ring.addDeviceFoundListener((dev)` intercepts BLE advertisement packets in real time, extracting:
  - MAC Address (`dev.mac`)
  - Local Name (`dev.name`)
  - Device Model ID (`dev.model`: e.g. `4` for O2Ring, `25` for O2Watch/O2M)
  - Received Signal Strength Indicator ($\text{RSSI}$)

### 2.2 Device State Partitioning
Scanned devices are separated into two distinct UI categories:
1. **Live Scanned Devices (`devices`)**: Newly discovered BLE devices currently broadcasting advertisements in the air.
2. **Saved / Paired Devices (`savedDevices`)**: Known devices previously paired and stored in `AsyncStorage` (`knownDevices`), filtered to exclude those currently present in live scan results.

### 2.3 Model Recognition & Display Formatting
- **Display Name Normalization (`getDisplayName`)**: Parses raw local names and model IDs to render clean, user-friendly labels:
  - Model `4` or name containing `"o2ring"` $\to$ **`O2Ring`**
  - Model `25` or name containing `"o2m"` $\to$ **`O2WProMax`**
  - Names containing `"watch"`, `"band"`, or `"wrist"` $\to$ **`O2Watch`**
- **Thumbnail Asset Mapping (`getDeviceImage`)**: Dynamically loads the correct hardware asset image (`KidsO2Ring.png`, `O2 Watch.png`, or `O2RingBGR.png`) based on model ID and name matching.

### 2.4 Connection Orchestration & Safety Guards
- **Interaction Gating**: Tapping a device row triggers `handleConnect()`, invoking `connectToDevice(item)` while disabling other rows (`disabled={connecting}`).
- **Timeout & Reachability Protection**: Wrapped in a 12-second timeout guard and 3-second `getInfo()` phantom connection reachability verification, ensuring offline or powered-off devices fail gracefully with clean alerts instead of hanging.
