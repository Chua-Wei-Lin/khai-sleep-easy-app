# Sleep Easy App - Comprehensive Live Reading Technical & Clinical Guide

This document provides a complete guide for clinicians and users to interpret every parameter, trend chart, and status indicator displayed on the **Sleep Easy App Live Reading Screen** ([`app/(tabs)/home/index.tsx`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/app/(tabs)/home/index.tsx)).

---

## 1. Live Reading Screen Layout Overview

The Live Reading screen is the real-time clinical dashboard of the Sleep Easy App. It provides continuous telemetry updated at up to **125 Hz**:

```
+-----------------------------------------------------------------------+
| [O2Ring 0401]  Battery: 95%   Patient ID: 220738497   Status: ONLINE  |
+-----------------------------------------------------------------------+
|  SpO2: 98%   |  PR: 62 bpm   |  BP: 118/78 mmHg   |  RR: 16 br/min   |
|  PI: 3.2%    |  Motion: 0    |  Status: Stabilized                   |
+-----------------------------------------------------------------------+
|  [ Live PPG Optical Waveform (50 - 125 Hz) ]                           |
|  [ Live Oxygen Level Trend (% - Green Line) ]                         |
|  [ Live Pulse Rate Trend (bpm - Green Line) ]                         |
|  [ Live Blood Pressure Trend (SBP Red / DBP Blue - Calib Markers C#1) ]|
|  [ Live Respiratory Rate Trend (br/min - Teal Line) ]                 |
|  [ Live Motion Bar Chart (Orange Bars) ]                              |
+-----------------------------------------------------------------------+
```

---

## 2. Real-Time Parameter Breakdown & Interpretation

### 2.1 Live Peripheral Oxygen Saturation ($\text{SpO}_2$)
- **Display**: Numerical percentage ($98\%$) and real-time continuous green trend line.
- **Update Frequency**: Every second.
- **Normal Range**: $95\% - 100\%$
- **Real-Time Clinical Interpretation**:
  * **Normal Baseline**: $95\% - 99\%$ indicates healthy pulmonary oxygenation.
  * **Desaturation Alert ($< 90\%$)**: Triggers visual indicators. Drops $\ge 3\%$ or $\ge 4\%$ from recent baseline register towards the **Oxygen Desaturation Index (ODI)**.
  * **Apneic Pattern**: Sudden downward dips in the green trend line lasting $10 - 40\text{ seconds}$ reflect airway collapses during **Obstructive Sleep Apnea (OSA)**.

---

### 2.2 Live Pulse Rate (PR)
- **Display**: Beats per minute ($62\text{ bpm}$) and continuous green trend line.
- **Update Frequency**: Every second.
- **Normal Sleep Range**: $50 - 90\text{ bpm}$
- **Real-Time Clinical Interpretation**:
  * **Post-Apneic Surge ($> 100\text{ bpm}$)**: Following an $\text{SpO}_2$ desaturation dip, an abrupt spike in Pulse Rate indicates autonomic sympathetic arousal and sudden cardiac workload increase.
  * **Vagal Bradycardia ($< 50\text{ bpm}$)**: Slow pulse rate during deep NREM sleep.

---

### 2.3 Live Blood Pressure (SBP & DBP)
- **Display**: Systolic / Diastolic values in mmHg ($118/78\text{ mmHg}$) and dual trend lines (**SBP Red**, **DBP Blue**).
- **Stabilization Status**: Displays **"Stabilizing..."** during the initial $3\text{-second}$ optical stabilization window upon connection.
- **Timeline Markers**: Displays in-chart vertical calibration markers ([`C#1`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/components/live/LiveBpTrendChart.tsx#L185), `C#2`) showing exact timestamps when manual cuff calibrations were performed.
- **Real-Time Technical Protections**:
  * **Clamped Ratio ($0.85x - 1.15x$)**: Prevents step-down calibration drops.
  * **Tachycardia Guard**: BP updates are paused when $\text{PR} > 90\text{ bpm}$ to prevent transient tachycardia spikes from distorting baseline arterial pressure.
- **Real-Time Clinical Interpretation**:
  * **Nocturnal Dipping**: Healthy sleeping BP drops $10\% - 20\%$ below daytime values.
  * **Non-Dipping / Surge**: Sustained elevated SBP/DBP during sleep indicates nocturnal hypertension and increased cardiovascular risk.

---

### 2.4 Live Respiratory Rate (RR / RIV)
- **Display**: Breaths per minute ($16\text{ br/min}$) and real-time teal trend line.
- **Technical Mechanism**: Extracted via **Respiratory-Induced Variations (RIV)** combining Amplitude Modulation (AM), Baseline Wander (BW), and frequency zero-crossings.
- **Sampling Rate Sync**: Automatically syncs to user-selected PPG frequencies ($50\text{ Hz}, 100\text{ Hz}, 125\text{ Hz}$).
- **Normal Range**: $12 - 20\text{ breaths/min}$
- **Real-Time Clinical Interpretation**:
  * **Tachypnea ($> 20\text{ br/min}$)**: Indicates hyperventilation, arousal, or respiratory effort post-apnea.
  * **Bradypnea ($< 10\text{ br/min}$)**: Indicates hypoventilation or central respiratory depression.

---

### 2.5 Live Motion (Actigraphy Index)
- **Display**: Numerical motion index ($0 - 200$) and orange bar chart.
- **Update Frequency**: Real-time 3-axis MEMS accelerometer magnitude.
- **Real-Time Clinical Interpretation**:
  * **Resting State ($0 - 5$)**: Indicates quiet, restful sleep.
  * **Arousal Burst ($> 50$)**: Indicates gross body movements, restless leg movements, or nocturnal awakenings.
  * **Artifact Discriminator**: Allows clinicians to verify whether an $\text{SpO}_2$ dip or PR spike was caused by true physiological apnea vs. hand movement artifact.

---

### 2.6 Live PPG Optical Waveform
- **Display**: Real-time pulsating arterial wave ($50 - 125\text{ Hz}$).
- **Real-Time Clinical Interpretation**:
  * **Dicrotic Notch**: Visible secondary wave notch reflects healthy arterial elasticity and aortic valve closure.
  * **Damped Waveform**: Flattened pulse peaks indicate peripheral vasoconstriction, severe hypothermia, or poor finger placement.

---

### 2.7 Live Perfusion Index (PI)
- **Display**: Percentage ($3.2\%$).
- **Normal Range**: $0.2\% - 20.0\%$
- **Real-Time Technical Role**:
  * Serves as the primary Signal Quality Index ($\text{SQI} \ge 0.6$) gatekeeper. If $\text{PI} < 0.4\%$, blood pressure calculation is temporarily held to prevent signal noise.

---

## 3. How to Identify Common Clinical Signatures on the Live Screen

### 3.1 Obstructive Sleep Apnea (OSA) Signature
```
1. Live SpO2: Drops from 97% -> 88% (Green trend dips)
2. Live PR: Spikes from 60 bpm -> 108 bpm (Post-arousal surge)
3. Live Motion: Orange bar spike (Restless body movement)
4. Live RR: Pauses then accelerates to 24 br/min
```

### 3.2 Motion Artifact Signature
```
1. Live Motion: High orange spike (> 100)
2. Live PPG Wave: Irregular, noisy waveform spikes
3. Live SpO2: Remains stable or shows transient 1-second flutter
4. Diagnostic Conclusion: Non-physiological movement artifact
```

### 3.3 Nocturnal Hypertension / Non-Dipping Signature
```
1. Live BP: Remains high (e.g. 142/92 mmHg) throughout deep sleep
2. Live SpO2: Accompanied by recurrent nocturnal desaturations
3. Diagnostic Conclusion: Vascular sympathetic overdrive
```
