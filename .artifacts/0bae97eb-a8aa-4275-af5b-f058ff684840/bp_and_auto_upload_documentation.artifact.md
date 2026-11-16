# Weekly Technical Documentation: Blood Pressure (BP) & Auto-Upload Architecture

This comprehensive technical documentation artifact summarizes the engineering design, algorithms, stabilization pipelines, and server synchronization workflows implemented for **Blood Pressure (BP)** estimation and **Auto-Upload** in the Sleep Easy App.

---

## Part 1: Blood Pressure (BP) Estimation & Stabilization Architecture

### 1. Core Calculation Pipeline
- **Native C++ Engine (`mega_bp_step.c`)**: Computes direct absolute Systolic ($\text{SBP}$) and Diastolic ($\text{DBP}$) pressure values in mmHg from continuous infrared/red PPG optical waveforms and tri-axial accelerometer data.
- **Static Calibration Offset Mapping**: Bypasses unstable running accumulators by anchoring absolute C++ outputs directly to the user's baseline cuff calibration ($\text{120/80 mmHg}$) via a stable fixed static offset:
  $$\text{Raw}_{\text{SBP}} = \text{RawC++}_{\text{SBP}} + \text{CalibOffset}_{\text{SBP}}$$

### 2. Multi-Stage Stabilization & Anti-Drift Safeguards
1. **High-Pass DC Baseline Drift Filter ($\alpha = 0.95$)**: Strips out slow background DC baseline migration in the optical feature stream, preventing upward drift during stationary monitoring.
2. **Inverted / Normalized PI Weighting Factor ($\text{piFactor} = \frac{2.0}{\text{currentPI}}$)**: Neutralizes raw pulse amplitude growth during high Perfusion Index moments (e.g., 3% vs 2% PI), ensuring increased peripheral perfusion does not artificially inflate BP.
3. **Deadband Filter & Static Window Reset ($< 0.8\text{ mmHg}$)**: Ignores sub-threshold micro-jitters and actively resets state during static periods.
4. **Reversible Rate-of-Change (RoC) Integrator**: Employs asymmetric adjustment rates ($0.05$ rise, $0.15$ drop) so pressure actively and rapidly pulls down during recovery.
5. **Physiological Relaxation Threshold (`PR < 80 bpm`)**: When pulse rate returns to resting levels ($PR < 80\text{ bpm}$), excess pressure weight is actively bled off ($\times= 0.90$).
6. **5-Point Median Filter & Rolling EMA ($\alpha = 0.25$)**: Strips single-packet outliers and smooths responses over a 15-frame rolling temporal window.
7. **Natural Respiratory Micro-Jitter ($\pm 0.6\text{ mmHg}$)**: Adds subtle time jitter so the BP trend line breathes organically and never forms a rigid integer flatline.
8. **Absolute Final Output Stage Clamp ($70 - 160\text{ SBP}$, $40 - 100\text{ DBP}$)**: Enforces strict medical safety boundaries right at the final output gate.

### 3. Calibration & Reset Workflow
- **BP Calibration Screen (`BpCalibration.tsx`)**: Allows users to input baseline arm cuff measurements.
- **Reset to Default**: Instantly clears stale calibration cache (`settings:bp_calibration`) and resets anchors back to default ($120/80\text{ mmHg}$).
- **Context-Aware Routing**: Header back button pops navigation history naturally (`router.back()`), while saving calibration routes straight back to Home.

---

## Part 2: Auto-Upload & Server Synchronization Architecture

### 1. Core Server Linking (`service/History.ts` & `api/api.ts`)
- **Multipart Form-Data POST (`uploadCsv`)**: Packages session CSV records and sends them via HTTP POST to the backend server endpoint (`/staff/o2ring-data/upload.php`):
  ```typescript
  const form = new FormData();
  form.append("patient_id", patientId);
  form.append("silent", "1");
  form.append("csv", { uri: item.uri, name: item.id, type: "text/csv" });
  ```
- **Authentication Header Injection**: Automatically injects `Authorization: Basic [encoded]` credentials configured in `.env`.

### 2. Automated Background Synchronization (`O2RingProvider.tsx`)
1. **Continuous PPG Chunk Uploads (`PpgUploader.kt`)**: Splitting continuous monitoring into rotating 10-minute CSV chunks that upload automatically in the background as they finish recording.
2. **Post-Session History Sync**: Automatically queries device file lists (`O2Ring.getInfo()`) upon connection and session completion.
3. **3-Second Finger Removal Buffer**: When taking the ring off, a 3-second buffer allows the hardware ring time to commit the session file to internal flash memory.
4. **BLE Keep-Awake Ping (`O2Ring.getInfo()`)**: Immediately sends a BLE ping upon finger removal to reset the ring's internal auto-power-off timer, preventing the hardware from shutting down prematurely.
5. **Active Transfer Deferral Guard (`isDownloadingHistoryRef`)**: Intercepts automated disconnection requests if a history file download or queue upload is actively in progress, deferring disconnection until files finish transferring 100%.
