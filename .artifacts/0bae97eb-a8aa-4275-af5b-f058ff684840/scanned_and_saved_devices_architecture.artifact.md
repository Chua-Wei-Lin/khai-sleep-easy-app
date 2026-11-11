# Sleep Easy App - Scanned & Saved Devices Architecture Specification

This document provides a thorough, publication-grade technical breakdown of how **Scanned Devices** and **Saved Devices** are discovered, synchronized, persisted, and displayed within the **Scan Screen** ([`Scan.tsx`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/app/(tabs)/home/Scan.tsx)) and service provider ([`O2RingProvider.tsx`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/service/O2RingProvider.tsx)).

---

## 1. Overview of Device Categories

The Scan screen partitions discovered hardware into two distinct UI sections to provide an intuitive user experience:
1. **Scanned Devices**: Live Bluetooth Low Energy (BLE) peripheral devices currently broadcasting advertising packets within radio range.
2. **Saved Devices**: Previously paired or connected devices stored persistently in local `AsyncStorage` (`knownDevices`), allowing users to quick-reconnect even when a device is currently sleeping or out of immediate broadcast range.

---

## 2. Key Code Architecture & Implementation

### 2.1 BLE Discovery & State Management (`O2RingProvider.tsx`)
When scanning starts (`startScan()`), the native Bluetooth module begins broadcasting scan requests. Discovered devices are captured via event listeners and stored in React state:

```typescript
// O2RingProvider.tsx - Device Discovery State
const [devices, setDevices] = useState<DeviceItem[]>([]);
const [knownDevices, setKnownDevices] = useState<DeviceItem[]>([]);

// Native Device Found Listener
useEffect(() => {
  const sub = O2Ring.addDeviceFoundListener((dev: DeviceItem) => {
    setDevices((prev) => {
      // Prevent duplicates by checking MAC address
      const exists = prev.some((d) => d.mac === dev.mac);
      if (exists) {
        return prev.map((d) => (d.mac === dev.mac ? { ...d, ...dev } : d));
      }
      return [...prev, dev];
    });
  });
  return () => sub.remove();
}, []);
```

### 2.2 Persistence of Saved Devices (`AsyncStorage`)
When a user successfully connects to a device (`connectToDevice`), that device is automatically saved to the persistent `knownDevices` registry:

```typescript
// O2RingProvider.tsx - Persisting Known Devices
const saveKnownDevice = async (device: DeviceItem) => {
  try {
    const existing = [...knownDevices];
    const index = existing.findIndex((d) => d.mac === device.mac);
    if (index !== -1) {
      existing[index] = device;
    } else {
      existing.push(device);
    }
    setKnownDevices(existing);
    await AsyncStorage.setItem("settings:knownDevices", JSON.stringify(existing));
  } catch (e) {
    console.warn("Failed to save known device:", e);
  }
};
```

### 2.3 Partitioning & Deduplication in the UI (`Scan.tsx`)
To prevent a device from appearing twice (both in "Scanned Devices" and "Saved Devices"), `Scan.tsx` applies a strict deduplication filter:

```typescript
// Scan.tsx - Partitioning Live vs Saved Devices
const liveScanned = devices;

// Filter out any saved device that is already visible in the live scan list
const savedDevices = useMemo(
  () => knownDevices.filter((k) => !devices.some((d) => d.mac === k.mac)),
  [devices, knownDevices]
);

const hasAnyDevices = liveScanned.length > 0 || savedDevices.length > 0;
```

### 2.4 Model Recognition & Asset Mapping
Both scanned and saved rows utilize helper functions to normalize device names and assign correct hardware thumbnails:

```typescript
// Scan.tsx - Model Identification & Display Normalization
const getDisplayName = (name?: string, model?: number) => {
  const base = name || "Device";
  const n = base.toLowerCase();
  const suffix = base.trim().split(/\s+/).pop() || "";

  if (n.includes("o2ring") || n.includes("o2_ring")) {
    return suffix && /^\d+$/.test(suffix) ? `O2Ring ${suffix}` : "O2Ring";
  }
  if (/^o2\s+\d+/i.test(base) || n.includes("watch")) {
    return suffix && /^\d+$/.test(suffix) ? `O2Watch ${suffix}` : "O2Watch";
  }
  return base;
};

const getDeviceImage = (name?: string, model?: number) => {
  const n = (name || "").toLowerCase();
  if (n.includes("kidso2")) return require("../../../assets/images/KidsO2Ring.png");
  if (isWatchDevice(name)) return require("../../../assets/images/O2 Watch.png");
  return require("../../../assets/images/O2RingBGR.png");
};
```

---

## 3. Summary of Scanning Lifecycle

1. **Focus Trigger**: Navigating to `Scan.tsx` triggers `useFocusEffect`, automatically initiating `startScan()`.
2. **Live Capture**: `addDeviceFoundListener` aggregates BLE advertisements in real time into `devices`.
3. **Smart Filtering**: `savedDevices` displays paired devices not currently broadcasting live, preventing duplicate UI entries.
4. **Blur Cleanup**: Leaving `Scan.tsx` triggers `stopScan()`, preserving battery and releasing BLE radio resources.
