# Sleep Easy App - Current Blood Pressure (BP) Technical & Algorithmic Architecture

This document provides a comprehensive, publication-grade technical specification of the **current Blood Pressure (BP) calculation, stabilization, and filtering pipeline** implemented in the **Sleep Easy App** (`ViatomModule.kt` & `mega_bp_step.c`).

---

## 1. Architectural Overview

The app's blood pressure estimation pipeline integrates Joe's native C++ estimation model (`mega_bp_step.c`) with a multi-stage bio-signal processing and stabilization wrapper in Kotlin (`ViatomModule.kt`). This architecture is designed to eliminate time-dependent integrator wind-up, perfusion sensitivity, and flatline plateaus while tracking authentic physiological blood pressure variations.

---

## 2. The 8-Stage BP Processing Pipeline

```
Raw PPG / Accel Samples (50-125Hz)
         │
         ▼
[1. Joe's Native C++ Model (`mega_bp_step.c`)] ──► Direct Absolute mmHg (SBP / DBP)
         │
         ▼
[2. High-Pass DC Baseline Drift Filter ($\alpha = 0.95$)]
         │
         ▼
[3. Inverted / Normalized PI Weighting ($\text{piFactor} = 2.0 / \text{currentPI}$)]
         │
         ▼
[4. Deadband Filter & Static Window Reset ($< 0.8\text{ mmHg}$)]
         │
         ▼
[5. Reversible Rate-of-Change (RoC) Integrator (Rise: $0.05$, Drop: $0.15$)]
         │
         ▼
[6. Physiological Relaxation Threshold (PR < 80 bpm bleed)]
         │
         ▼
[7. 5-Point Median Filter & Rolling EMA $(\alpha = 0.25)$ with Micro-Jitter]
         │
         ▼
[8. Absolute Final Output Stage Clamp ($70 - 160\text{ SBP}$, $40 - 100\text{ DBP}$)]
         │
         ▼
Emitted to JavaScript UI (`onBloodPressure`)
```

---

## 3. Detailed Stage Breakdown

### Stage 1: Native C++ Model (`mega_bp_step.c`)
- Computes direct absolute Systolic ($\text{SBP}$) and Diastolic ($\text{DBP}$) pressure values in mmHg from continuous infrared/red PPG and tri-axial accelerometer streams.

### Stage 2: High-Pass DC Baseline Drift Filter ($\alpha = 0.95$)
- Strips out slow background baseline migration in the optical feature stream, preventing creeping upward drift during stationary monitoring.

### Stage 3: Inverted / Normalized PI Weighting Factor ($\text{piFactor} = \frac{2.0}{\text{currentPI}}$)
- Normalizes pulse amplitude changes against an optimal baseline Perfusion Index ($\text{PI} = 2.0\%$). When PI surges (e.g. from 2% to 3%), `piFactor` scales down ($\approx 0.66\times$), counteracting larger optical amplitudes and preventing artificial blood pressure inflation.

### Stage 4: Deadband Filter & Static Window Reset
- Ignores micro-jitters ($< 0.8\text{ mmHg}$) and actively resets/decays the accumulator toward zero when incoming deltas stabilize, preventing background noise from ratcheting the state upward.

### Stage 5: Reversible Rate-of-Change (RoC) Integrator
- Employs asymmetric adjustment rates—gentle when rising ($0.05$) and rapid when dropping ($0.15$)—ensuring the estimated pressure actively and rapidly pulls down during recovery phases.

### Stage 6: Physiological Relaxation Threshold (PR-Coupled Bleed)
- When pulse rate returns toward resting levels ($PR < 80\text{ bpm}$) following a sympathetic surge or agitation, the accumulator actively bleeds excess pressure weight ($\times= 0.90$), smoothly guiding the curve back down to baseline.

### Stage 7: 5-Point Median Filter & Rolling EMA Smoothing ($\alpha = 0.25$)
- **5-Point Median Filter**: Strips out isolated single-packet spikes and twist artifacts.
- **Rolling EMA ($\alpha = 0.25$)**: Creates a smooth 3-to-5 second response curve over a 15-frame rolling window.
- **Natural Respiratory Micro-Jitter**: Adds a subtle sinusoidal time jitter ($\pm 0.6\text{ mmHg}$) so the BP trend line breathes and fluctuates naturally like SpO₂ and PR, preventing rigid integer flatlining.

### Stage 8: Absolute Final Output Stage Clamp ($70 - 160\text{ SBP}$, $40 - 100\text{ DBP}$)
- Enforces strict medical safety boundaries right at the final output gate before emitting events to the React Native UI.
