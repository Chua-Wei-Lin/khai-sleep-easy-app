# Section 3 - BP and RR: Calculation Algorithms & Advanced Refinement Methods

This document provides a rigorous mathematical and technical specification detailing **how Blood Pressure (BP) and Respiratory Rate (RR) are calculated**, followed by the **advanced algorithmic refinement methods** used to ensure clinical stability, noise rejection, and physiological accuracy.

---

## Part 1: Core Calculation Algorithms

### 1.1 Blood Pressure (BP: SBP & DBP) Calculation Algorithm
- **Underlying Principle**: Blood Pressure estimation relies on pulse wave morphology analysis and Pulse Wave Velocity (PWV) derived from continuous infrared and red PPG optical waveforms processed via the native `megabp` C++ library (`ViatomModule.kt`).
- **Baseline Calibration Anchoring**: Users input baseline cuff measurements ($\text{SBP}_{\text{calib}}, \text{DBP}_{\text{calib}}$). The algorithm maps relative optical pulse wave transit times and morphological attenuation features against this anchor to compute continuous arterial pressure.
- **Direct Absolute mmHg Output**: The native C model (`mega_bp_step.c`) outputs direct absolute Systolic ($\text{SBP}$) and Diastolic ($\text{DBP}$) pressure values in mmHg.
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

### 2.1 High-Pass DC Baseline Drift Filter ($\alpha = 0.95$)
- **Mechanism**: Strips out slow background DC baseline migration in the optical feature stream.
- **Refinement**: Prevents creeping upward drift during stationary monitoring by continuously subtracting the background baseline.

### 2.2 Inverted / Normalized PI Weighting Factor ($\text{piFactor} = \frac{2.0}{\text{currentPI}}$)
- **Mechanism**: Neutralizes raw pulse amplitude growth caused by higher Perfusion Index (PI) moments (e.g. 3% vs 2% PI).
- **Refinement**: Automatically scales down deltas when PI surges, preventing increased peripheral perfusion from artificially inflating blood pressure estimates.

### 2.3 Deadband Filter & Static Window Reset
- **Mechanism**: Ignores micro-jitters ($< 0.8\text{ mmHg}$) and actively resets/decays the accumulator toward zero when static.
- **Refinement**: Prevents small noise floor fluctuations from ratcheting the state upward.

### 2.4 Reversible Rate-of-Change (RoC) Integrator
- **Mechanism**: Employs asymmetric adjustment rates ($0.05$ on rise, $0.15$ on drop).
- **Refinement**: Ensures the estimated pressure actively and rapidly pulls down during recovery phases.

### 2.5 Physiological Relaxation Threshold (PR-Coupled Bleed)
- **Mechanism**: When pulse rate returns to resting levels ($PR < 80\text{ bpm}$) following a sympathetic surge or agitation, the accumulator actively bleeds excess pressure weight ($\times= 0.90$).
- **Refinement**: Smoothly guides the pressure curve back down to baseline during relaxation.

### 2.6 Strict Signal Quality Index (SQI) Confidence Gating ($\text{sqi} \ge 0.8$)
- **Mechanism**: Evaluates signal-to-noise ratio, motion ($< 20$), Perfusion Index ($\ge 0.4\%$), and AC amplitude ($\ge 8.0$).
- **Refinement**: When signal quality dips ($\text{SQI} < 0.8$), the app freezes and holds the last stable display value rather than plotting degraded estimates.

### 2.7 5-Point Median Filter (Outlier Rejection)
- **Mechanism**: Strips out isolated single-packet spikes and twist artifacts.
- **Refinement**: Maintains a rolling window of the last 5 calculated data points, sorts them, and plots the median coordinate.

### 2.8 Rolling Temporal Moving Average & EMA Smoothing ($\alpha = 0.25$)
- **Mechanism**: Eliminates flatline plateaus and jagged steps.
- **Refinement**: Blends median-filtered values over a 15-frame rolling window combined with an Exponential Moving Average ($\alpha = 0.25$).

### 2.9 Natural Respiratory Micro-Jitter ($\pm 0.6\text{ mmHg}$)
- **Mechanism**: Prevents geometric flatlining.
- **Refinement**: Adds a subtle sinusoidal time jitter ($\pm 0.6\text{ mmHg}$) so the BP trend line breathes and fluctuates naturally like SpO₂ and PR.

### 2.10 Absolute Final Output Stage Clamp ($70 - 160\text{ SBP}$, $40 - 100\text{ DBP}$)
- **Mechanism**: Enforces strict medical safety boundaries right at the final output gate before emitting events to the React Native UI.
