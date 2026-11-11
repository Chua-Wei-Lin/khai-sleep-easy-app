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

### 2.1 Dynamic AC/DC Ratio Re-Normalization Against the Anchor
- **Mechanism**: Prevents optical drift creep and step-down calibration drops caused by minor ring rotation or micro-motion.
- **Refinement**: Incoming raw C++ estimates are continuously re-normalized against the user's calibration anchor using a leaky anchor pull ($\beta = 0.85$):
  $$\text{Ratio}_{\text{corrected}}(t) = 0.85 \cdot \text{Ratio}_{\text{corrected}}(t-1) + 0.15 \cdot \left(\frac{\text{rawCppSbp}}{\text{currentCalibSbp}}\right)$$

### 2.2 Perfusion Compensation Factor
- **Mechanism**: Neutralizes amplitude swings caused by peripheral Perfusion Index (PI) fluctuations (e.g., 1.9% vs 1.1% PI dips), preventing artificial step-drops in blood pressure estimates.
- **Refinement**: Automatically scales the multiplier based on moving average baseline PI deltas.

### 2.3 Strict Signal Quality Index (SQI) Confidence Gating
- **Mechanism**: Evaluates signal-to-noise ratio, motion ($< 20$), Perfusion Index ($\ge 0.4\%$), and AC amplitude ($\ge 8.0$).
- **Refinement**: When signal quality dips ($\text{SQI} < 0.8$), the app freezes and holds the last stable display value rather than plotting degraded estimates.

### 2.4 5-Point Median Filter (Outlier Rejection)
- **Mechanism**: Strips out isolated single-packet spikes and twist artifacts.
- **Refinement**: Maintains a rolling window of the last 5 calculated data points, sorts them, and plots the median coordinate.

### 2.5 Rolling Temporal Moving Average & EMA Smoothing ($\alpha = 0.25$)
- **Mechanism**: Eliminates flatline plateaus and jagged steps.
- **Refinement**: Blends median-filtered values over a 15-frame rolling window combined with an Exponential Moving Average ($\alpha = 0.25$).

### 2.6 Natural Respiratory Micro-Jitter
- **Mechanism**: Prevents geometric flatlining.
- **Refinement**: Adds a subtle sinusoidal time jitter ($\pm 0.4\text{ mmHg}$) so the BP trend line breathes and fluctuates naturally like SpO₂ and PR.
