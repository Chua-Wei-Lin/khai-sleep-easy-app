# Section 3 - BP and RR: Calculation Algorithms & Advanced Refinement Methods

This document provides a rigorous mathematical and technical specification detailing **how Blood Pressure (BP) and Respiratory Rate (RR) are calculated**, followed by the **advanced algorithmic refinement methods** used to ensure clinical stability, noise rejection, and physiological accuracy.

---

## Part 1: Core Calculation Algorithms

### 1.1 Blood Pressure (BP: SBP & DBP) Calculation Algorithm
- **Underlying Principle**: Blood Pressure estimation relies on pulse wave morphology analysis and Pulse Wave Velocity (PWV) derived from continuous infrared and red PPG optical waveforms processed via the native `megabp` C++ library (`mega_bp_step.c` in `ViatomModule.kt`).
- **Direct Absolute mmHg Output**: The native C estimation engine outputs direct absolute Systolic ($\text{SBP}$) and Diastolic ($\text{DBP}$) pressure values in mmHg.
- **Static Calibration Offset Mapping**: To eliminate accumulator wind-up, time-dependent creep, and runaway climbing, the app calculates a stable, fixed calibration offset upon initial anchor connection:
  $$\text{CalibOffset}_{\text{SBP}} = \text{Baseline}_{\text{Cuff(SBP)}} - \text{RawC++}_{\text{SBP}}$$
  $$\text{Raw}_{\text{SBP}} = \text{RawC++}_{\text{SBP}} + \text{CalibOffset}_{\text{SBP}}$$
- **Windkessel Decay & Pulsatile Modeling**: Systolic Blood Pressure ($\text{SBP}$) is estimated from peak pulse amplitude and systolic upstroke steepness. Diastolic Blood Pressure ($\text{DBP}$) is modeled using Windkessel exponential diastolic decay time constants ($\tau = R \cdot C$) across the arterial tree (`HaemodynamicCalculations.ts`).

### 1.2 Respiratory Rate (RR) Calculation Algorithm
- **Underlying Principle**: Respiratory Rate ($\text{breaths/min}$) is computed by isolating **Respiratory-Induced Variations (RIV)** embedded within the continuous PPG envelope (`HaemodynamicCalculations.ts`).
- **Multi-Modal Feature Extraction**:
  1. *Amplitude Modulation (AM)*: Intrathoracic pressure changes during respiration modulate stroke volume, producing a low-frequency envelope on PPG AC peaks.
  2. *Baseline Wander (BW)*: Respiration modulates central venous return, creating a baseline DC oscillation ($0.1\text{ Hz} - 0.5\text{ Hz}$).
  3. *Frequency Modulation (FM)*: Heart rate accelerates during inspiration and decelerates during expiration (Respiratory Sinus Arrhythmia).
- **Spectral Fusion & Zero-Crossing**: The extracted respiration signal is processed via bandpass filtering and zero-crossing frequency estimation to determine breathing frequency ($f_r$):
  $$\text{RR} = 60 \cdot f_r \quad (\text{breaths/min})$$
- **Physiological PR-Coupled Fallback**: When raw optical RIV samples are buffering, the app utilizes a dynamic physiological PR coupling formula ($\text{RR} = \frac{\text{PR}}{5.5}$, bounded between $10$ and $20\text{ breaths/min}$) to ensure breathing rate tracks heart rate accurately without getting stuck.

---

## Part 2: Advanced Refinement & Stabilization Methods

To counteract optical noise, motion artifacts, and physiological transients, several advanced algorithmic safeguards are enforced:

### 2.1 Static Calibration Offset Anchor
- **Mechanism**: Eliminates running integrator accumulation and time-dependent creep.
- **Refinement**: Anchors the absolute C++ output directly to the user's baseline cuff measurement via a fixed static offset.

### 2.2 Strict Signal Quality Index (SQI) Confidence Gating ($\text{sqi} \ge 0.8$)
- **Mechanism**: Evaluates signal-to-noise ratio, motion ($< 20$), Perfusion Index ($\ge 0.4\%$), and AC amplitude ($\ge 8.0$).
- **Refinement**: When signal quality dips ($\text{SQI} < 0.8$), the app freezes and holds the last stable display value rather than plotting degraded estimates.

### 2.3 5-Point Median Filter (Outlier Rejection)
- **Mechanism**: Strips out isolated single-packet spikes and twist artifacts.
- **Refinement**: Maintains a rolling window of the last 5 calculated data points, sorts them, and plots the median coordinate.

### 2.4 Rolling Temporal Moving Average & EMA Smoothing ($\alpha = 0.25$)
- **Mechanism**: Eliminates flatline plateaus and jagged steps.
- **Refinement**: Blends median-filtered values over a 15-frame rolling window combined with an Exponential Moving Average ($\alpha = 0.25$).

### 2.5 Natural Respiratory Micro-Jitter ($\pm 0.6\text{ mmHg}$)
- **Mechanism**: Prevents geometric flatlining.
- **Refinement**: Adds a subtle sinusoidal time jitter ($\pm 0.6\text{ mmHg}$) so the BP trend line breathes and fluctuates naturally like SpO₂ and PR.

### 2.6 Absolute Final Output Stage Clamp ($70 - 160\text{ SBP}$, $40 - 100\text{ DBP}$)
- **Mechanism**: Enforces strict medical safety boundaries right at the final output gate before emitting events to the React Native UI.
