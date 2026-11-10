# BP & RR Calculation Algorithms & Advanced Refinement Methods

This document provides a rigorous mathematical and technical specification detailing **how Blood Pressure (BP) and Respiratory Rate (RR) are calculated**, followed by the **advanced algorithmic refinement methods** used to ensure clinical stability, noise rejection, and physiological accuracy.

---

## Part 1: Core Calculation Algorithms

### 1.1 Blood Pressure (BP: SBP & DBP) Calculation Algorithm
- **Underlying Principle**: Blood Pressure estimation relies on pulse wave morphology analysis and Pulse Wave Velocity (PWV) derived from continuous infrared and red PPG optical waveforms processed via the native `megabp` C++ library (`ViatomModule.kt`).
- **Baseline Calibration Anchoring**:
  Users input baseline cuff measurements ($\text{SBP}_{\text{calib}}, \text{DBP}_{\text{calib}}$). The algorithm maps relative optical pulse wave transit times and morphological attenuation features against this anchor to compute continuous arterial pressure.
- **Windkessel Decay & Pulsatile Modeling**:
  Systolic Blood Pressure ($\text{SBP}$) is estimated from peak pulse amplitude and systolic upstroke steepness. Diastolic Blood Pressure ($\text{DBP}$) is modeled using Windkessel exponential diastolic decay time constants ($\tau = R \cdot C$) across the arterial tree (`HaemodynamicCalculations.ts`).

### 1.2 Respiratory Rate (RR) Calculation Algorithm
- **Underlying Principle**: Respiratory Rate ($\text{breaths/min}$) is computed by isolating **Respiratory-Induced Variations (RIV)** embedded within the continuous PPG envelope (`HaemodynamicCalculations.ts`).
- **Multi-Modal Feature Extraction**:
  1. *Amplitude Modulation (AM)*: Intrathoracic pressure changes during respiration modulate stroke volume, producing a low-frequency envelope on PPG AC peaks.
  2. *Baseline Wander (BW)*: Respiration modulates central venous return, creating a baseline DC oscillation ($0.1\text{ Hz} - 0.5\text{ Hz}$).
  3. *Frequency Modulation (FM)*: Heart rate accelerates during inspiration and decelerates during expiration (Respiratory Sinus Arrhythmia).
- **Spectral Fusion & Zero-Crossing**: The extracted respiration signal is processed via bandpass filtering and zero-crossing frequency estimation to determine breathing frequency ($f_r$):
  $$\text{RR} = 60 \cdot f_r \quad (\text{breaths/min})$$

---

## Part 2: Advanced Refinement & Stabilization Methods

To counteract optical noise, motion artifacts, and physiological transients, several advanced algorithmic safeguards are enforced:

### 2.1 Signal Quality Index (SQI) Gating
- **Mechanism**: Evaluates the signal-to-noise ratio (SNR), Perfusion Index ($\text{PI}$), and morphological consistency of incoming PPG beats.
- **Refinement**: Frames where $\text{SQI} < 0.6$ or $\text{PI} < 0.4\%$ are instantly rejected. This prevents motion artifacts or weak peripheral pulses from generating erratic BP or RR spikes.

### 2.2 Implied Ratio Multiplier Clamping
- **Mechanism**: Prevents optical drift creep and step-down calibration drops during long-term monitoring.
- **Refinement**: Implied calibration ratio multipliers are strictly clamped:
  $$0.85 \le \text{Ratio} \le 1.15$$
  Any calculated ratio exceeding these bounds is clamped to the nearest threshold, keeping estimated blood pressure anchored within realistic physiological limits.

### 2.3 Tachycardia & Heart Rate Compensation Guards
- **Mechanism**: Autonomic arousal or nocturnal tachycardia can distort pulse wave morphology.
- **Refinement**: When Pulse Rate exceeds $90\text{ bpm}$ ($\text{PR} > 90$), a damping compensation factor is applied in the native processing module (`ViatomModule.kt`) to prevent false blood pressure overestimations during sympathetic surges.

### 2.4 Exponential Moving Average (EMA) Smoothing
- **Mechanism**: Eliminates beat-to-beat jitter in real-time displays.
- **Refinement**: Calculated SBP and DBP values are smoothed using an Exponential Moving Average filter:
  $$\text{BP}_{\text{smooth}}(t) = \alpha \cdot \text{BP}_{\text{raw}}(t) + (1 - \alpha) \cdot \text{BP}_{\text{smooth}}(t-1) \quad (\alpha = 0.08)$$

### 2.5 Single-Initialization Optical Stabilization Guards
- **Mechanism**: Prevents recurring 60-second stabilization loops when reconnecting or retrying streams.
- **Refinement**: A strict single-initialization flag (`isBpInitialized`) ensures the 3-second stabilization window runs *only* once upon initial manual connection (`connectToDevice`), keeping real-time streams uninterrupted.
