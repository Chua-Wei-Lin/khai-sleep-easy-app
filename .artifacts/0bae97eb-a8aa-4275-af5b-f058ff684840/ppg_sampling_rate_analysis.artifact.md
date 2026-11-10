# Photoplethysmogram (PPG) Collection & Sampling Rate Impact Analysis

This document provides a comprehensive technical specification detailing **how Photoplethysmogram (PPG) raw infrared and red optical data are collected** on the O2Ring hardware, **how they are rendered and processed** in the app, and **how varying the sampling rate (`ppg_sampling_hz`: 50 Hz, 100 Hz, 125 Hz)** mathematically and clinically impacts signal fidelity, haemodynamic calculations, and system throughput.

---

## 1. PPG Data Collection & Real-Time Pipeline

### 1.1 Optical Acquisition on Hardware
- **Dual-Wavelength Transmittance**: The O2Ring continuously emits modulated red ($660\text{ nm}$) and infrared ($940\text{ nm}$) light through the capillary bed. Photodiodes sample the transmitted optical intensity at discrete time intervals corresponding to the configured sampling frequency ($f_s$).
- **Raw Data Packets**: Each sample frame captures raw infrared intensity ($IR$), red intensity ($RED$), and motion data ($M$), streamed over BLE real-time notification characteristics.

### 1.2 Ring Buffer & Live Rendering (`LivePpgWave.tsx`)
- **Rolling Visualization**: The app maintains a real-time rolling buffer (`ppgBufferRef`) of optical samples.
- **Canvas Rendering**: Rendered via `@shopify/react-native-skia` or `victory-native` at $60\text{ fps}$, visualizing the pulsatile AC waveform synchronised with ventricular ejection.

---

## 2. Impact of Changing the Sampling Rate (`ppg_sampling_hz`)

The O2Ring supports multiple configurable sampling rates (typically **50 Hz**, **100 Hz**, and **125 Hz**). Changing $f_s$ fundamentally affects temporal resolution, digital filtering, haemodynamic extraction, and data storage throughput:

### 2.1 Temporal Resolution & Nyquist Sampling
- **$50\text{ Hz}$ ($T_s = 20\text{ ms}$ per sample)**:
  - *Effect*: Captures fundamental cardiac cycles and basic pulse rates accurately. However, rapid morphological features such as the dicrotic notch (aortic valve closure) and steepest systolic upslopes are temporally quantized into fewer sample points.
- **$100\text{ Hz}$ ($T_s = 10\text{ ms}$) & $125\text{ Hz}$ ($T_s = 8\text{ ms}$ - Highest Fidelity)**:
  - *Effect*: Provides ultra-high temporal resolution. Essential for precise pulse wave transit time (PWTT) calculation, derivative analysis ($\frac{dPPG}{dt}$), and advanced cardiovascular haemodynamic modeling.

### 2.2 Digital Filter Adaptation & Window Scaling
- **Sample vs. Time Windows**: Algorithms processing PPG (such as Butterworth bandpass filters, moving average smoothing, and derivative peak detectors) operate on sample counts rather than absolute time.
- *Mathematical Implication*: A moving average window of $N = 10$ samples represents:
  - At $50\text{ Hz}$: $\frac{10}{50} = 200\text{ ms}$ time window.
  - At $125\text{ Hz}$: $\frac{10}{125} = 80\text{ ms}$ time window.
  - *Mitigation*: The app's processing pipeline dynamically scales filter tap coefficients and window sizes based on the active `ppg_sampling_hz` to maintain invariant temporal filter cutoff frequencies ($f_c$).

### 2.3 Haemodynamic Calculations & Respiratory Rate (RIV)
- **Pulse Peak Detection**: Higher sampling rates ($125\text{ Hz}$) eliminate timing jitter in systolic peak detection ($\Delta t = \pm 4\text{ ms}$ at $125\text{ Hz}$ vs. $\pm 20\text{ ms}$ at $50\text{ Hz}$). This drastically improves the precision of Heart Rate Variability (HRV) and Respiratory-Induced Variations (RIV).
- **Amplitude & Frequency Modulation**: Extracting subtle respiratory modulation envelopes (AM, BW, FM) requires high-fidelity signal-to-noise ratios. Higher sampling rates preserve high-frequency optical harmonics, yielding cleaner spectral peaks for Respiratory Rate ($\text{RR}$) extraction.

### 2.4 Data Throughput, Storage & 10-Minute Caching
- **Bandwidth & Memory**:
  - At $50\text{ Hz}$: $\sim 50\text{ samples/sec} \times \text{channels}$.
  - At $125\text{ Hz}$: $\sim 125\text{ samples/sec} \times \text{channels}$ ($2.5\times$ data volume increase).
- **Segmented Caching (`PpgUploader.kt`)**: To prevent memory overflow and handle high throughput at $125\text{ Hz}$, raw PPG is written into 10-minute local CSV cache files (`/files/ppg/...`) and uploaded asynchronously in the background (`uploadCsv`), ensuring zero data loss and smooth UI performance.
