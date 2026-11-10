# Sleep Easy App - Comprehensive Mathematical, Technical & Clinical Parameter Specification

This document provides a formal, publication-grade mathematical, technical, and clinical breakdown for the seven primary physiological metrics processed and analyzed by the **Sleep Easy App**:

1. **Photoplethysmogram (PPG)**
2. **Peripheral Oxygen Saturation ($\text{SpO}_2$)**
3. **Pulse Rate (PR)**
4. **Perfusion Index (PI)**
5. **Blood Pressure (BP: SBP & DBP)**
6. **Respiratory Rate (RR / RIV)**
7. **Motion (Accelerometer / Artifact Index)**

---

## 1. Photoplethysmogram (PPG)

### 1.1 Technical & Physical Mechanism
The Photoplethysmogram (PPG) is an optically obtained volumetric measurement of an organ or tissue bed. The O2Ring emits two distinct wavelengths of light through the vascular tissue of the finger:
- **Red Light**: $\lambda_{\text{red}} \approx 660\text{ nm}$
- **Infrared (IR) Light**: $\lambda_{\text{ir}} \approx 940\text{ nm}$

As arterial blood pulsates with each cardiac cycle, the volume of blood in the microvascular bed expands and contracts, modulating light attenuation. Photodetectors capture the transmitted light intensity, yielding continuous optical waveforms.

### 1.2 Mathematical Formulation
The optical attenuation is governed by the **Beer-Lambert Law**:
$$I(\lambda) = I_0(\lambda) \cdot \exp\left(-\left[\varepsilon_{\text{HbO}_2}(\lambda) \cdot C_{\text{HbO}_2} + \varepsilon_{\text{Hb}}(\lambda) \cdot C_{\text{Hb}}\right] \cdot d(t)\right)$$

Where:
- $I_0(\lambda)$: Incident light intensity.
- $\varepsilon_{\text{HbO}_2}, \varepsilon_{\text{Hb}}$: Extinction coefficients of oxygenated and deoxygenated hemoglobin.
- $C_{\text{HbO}_2}, C_{\text{Hb}}$: Concentrations of oxygenated and deoxygenated hemoglobin.
- $d(t)$: Pulsatile path length of the arterial vascular bed.

Each PPG signal is decomposed into two components:
$$S(t) = S_{\text{DC}} + S_{\text{AC}}(t)$$
- **$S_{\text{DC}}$ (Static Component)**: Low-frequency absorption by non-pulsatile tissue, venous blood, and bone.
- **$S_{\text{AC}}(t)$ (Pulsatile Component)**: Cardiac-synchronous volumetric fluctuations.

### 1.3 Clinical Significance
PPG serves as the raw physiological substrate. Waveform morphology reflects arterial compliance, peripheral vascular resistance, cardiac ejection dynamics, and autonomic nervous system tone.

---

## 2. Peripheral Oxygen Saturation ($\text{SpO}_2$)

### 2.1 Technical & Physical Mechanism
$\text{SpO}_2$ quantifies the percentage of oxygenated hemoglobin relative to total hemoglobin in arterial blood. Oxygenated hemoglobin ($\text{HbO}_2$) absorbs more infrared light ($940\text{ nm}$), whereas deoxygenated hemoglobin ($\text{Hb}$) absorbs more red light ($660\text{ nm}$).

### 2.2 Mathematical Formulation
The ratio of ratios ($R$) is computed by normalizing the pulsatile ($\text{AC}$) component by the non-pulsatile ($\text{DC}$) component for both wavelengths:
$$R = \frac{\left(\frac{\text{AC}_{\text{red}}}{\text{DC}_{\text{red}}}\right)}{\left(\frac{\text{AC}_{\text{ir}}}{\text{DC}_{\text{ir}}}\right)}$$

$\text{SpO}_2$ is then derived via empirical calibration curves:
$$\text{SpO}_2(\%) = 110 - 25 \cdot R \quad \text{or} \quad \text{SpO}_2 = \frac{a \cdot R + b}{c \cdot R + d}$$

### 2.3 Clinical Significance
- **Normal Range**: $95\% - 100\%$
- **Mild Hypoxia**: $90\% - 94\%$
- **Severe Hypoxia**: $< 90\%$
- **Oxygen Desaturation Index (ODI)**: Measures the frequency of $\ge 3\%$ or $\ge 4\%$ drops per hour. Recurrent nocturnal desaturations are the hallmark of **Obstructive Sleep Apnea (OSA)** and hypopnea events, increasing risks for nocturnal hypertension, arrhythmias, and cardiovascular mortality.

---

## 3. Pulse Rate (PR)

### 3.1 Technical & Physical Mechanism
Pulse Rate measures the frequency of cardiac ventricular contractions per minute, derived from the fundamental cardiac periodicity of the PPG AC waveform.

### 3.2 Mathematical Formulation
The inter-beat interval ($T_{\text{IBI}}$ in seconds) is determined by locating adjacent systolic peak timestamps ($t_k, t_{k+1}$):
$$T_{\text{IBI}, k} = t_{k+1} - t_k$$

Pulse Rate ($\text{bpm}$) is calculated as:
$$\text{PR} = \frac{60}{\bar{T}_{\text{IBI}}}$$

### 3.3 Clinical Significance
- **Resting Range**: $50 - 100\text{ bpm}$
- **Tachycardia**: $> 100\text{ bpm}$ (often triggered by autonomic sympathetic arousal following apnea termination).
- **Bradycardia**: $< 50\text{ bpm}$ (common during deep NREM sleep, but abrupt drops can indicate sinus pauses or vagal surges).

---

## 4. Perfusion Index (PI)

### 4.1 Technical & Physical Mechanism
Perfusion Index (PI) is the ratio of the pulsatile blood flow ($\text{AC}$) to the non-pulsatile static blood volume ($\text{DC}$) at the sensor site. It measures peripheral blood perfusion strength.

### 4.2 Mathematical Formulation
$$\text{PI}(\%) = \left( \frac{\text{AC}_{\text{ir}}}{\text{DC}_{\text{ir}}} \right) \times 100\%$$

### 4.3 Clinical Significance
- **Normal Range**: $0.2\% - 20.0\%$
- **Low Perfusion ($\text{PI} < 0.4\%$)**: Indicates vasoconstriction, peripheral hypothermia, shock, or poor sensor contact.
- **Diagnostic Role**: High PI ensures reliable $\text{SpO}_2$ and blood pressure calculations. Signal quality gating ($\text{SQI} \ge 0.6$) relies on PI validation.

---

## 5. Blood Pressure (BP: SBP & DBP)

### 5.1 Technical & Physical Mechanism
Real-time arterial blood pressure (Systolic Blood Pressure $\text{SBP}$ and Diastolic Blood Pressure $\text{DBP}$) is estimated natively via continuous PPG morphology and Pulse Wave Velocity (PWV) principles using the bundled `megabp` C++ library.

### 5.2 Mathematical Formulation
- **Calibration Anchoring**:
  Initial baseline calibration values ($\text{SBP}_{\text{calib}}, \text{DBP}_{\text{calib}}$) anchor the optical transfer function.
- **Implied Ratio Multiplier Clamping**:
  To prevent optical drift creep:
  $$0.85 \le \text{Ratio} \le 1.15$$
- **EMA Smoothing**:
  $$\text{SBP}_{\text{smooth}}(t) = \alpha \cdot \text{SBP}_{\text{raw}}(t) + (1 - \alpha) \cdot \text{SBP}_{\text{smooth}}(t-1) \quad (\alpha = 0.08)$$

### 5.3 Blood Pressure Stabilization Process
When connecting to the O2Ring, the native blood pressure engine executes a multi-stage optical stabilization protocol:
1. **Initial Optical Acquisition Window (3-Second Window)**:
   When streaming starts, raw PPG infrared/red frames enter the native C++ `megabp` engine. The native module initializes a 3-second buffer window ([`isBpInitialized = false`](file:///C:/Users/Wei Lin/Documents/GitHub/khai-sleep-easy-app/packages/viatom-o2ring/android/src/main/java/expo/modules/viatom/ViatomModule.kt#L120)).
2. **Signal Quality Index ($\text{SQI}$) & Noise Gating**:
   During the initial 3 seconds, frame-by-frame $\text{SQI}$ is evaluated. If finger movement or motion artifact reduces $\text{SQI} < 0.6$, the stabilization timer holds or resets until a continuous 3-second noise-free pulse wave train is acquired.
3. **Single-Initialization Guard**:
   Once the 3-second window completes successfully, $\text{isBpInitialized}$ becomes `true`, and the native module emits a `bpStabilized` event. The UI updates from `"Stabilizing..."` to rendering live SBP/DBP numbers ($120/80\text{ mmHg}$). The single-initialization flag ensures that subsequent mid-session packet drops or stream retries **never re-trigger the stabilization phase**.
4. **Manual Connection Reset**:
   The stabilization flag $\text{isBpInitialized}$ is reset to `false` strictly when the user initiates a new manual connection (`connectToDevice`) or recalibrates baseline BP, guaranteeing fresh optical baseline anchoring for each monitoring session.

### 5.4 Clinical Significance
- **Normal SBP / DBP**: $< 120 / 80\text{ mmHg}$
- **Hypertension Stage 1/2**: $\ge 130 / 80\text{ mmHg}$
- **Sleep Impact**: Non-dipping nocturnal blood pressure (failure of BP to drop $10-20\%$ during sleep) is strongly associated with obstructive sleep apnea, endothelial dysfunction, and elevated stroke risk.

---

## 6. Respiratory Rate (RR / RIV)

### 6.1 Technical & Physical Mechanism
Respiratory Rate ($\text{breaths per minute}$) is extracted without chest belts using **Respiratory-Induced Variations (RIV)** in the PPG signal.

### 6.2 Mathematical Formulation
RIV fuses three distinct respiration-induced physiological phenomena:
1. **Amplitude Modulation (AM)**: Inhalation increases intrathoracic pressure, reducing stroke volume and PPG AC pulse amplitude.
2. **Baseline Wander (BW / Respiratory-Induced Baseline Variation)**: Respiration modulates venous return, causing a low-frequency oscillation ($0.1 - 0.5\text{ Hz}$) in the PPG DC baseline.
3. **Frequency Modulation (FM / Respiratory Sinus Arrhythmia)**: Heart rate accelerates during inhalation and decelerates during exhalation.

Respiratory frequency ($f_r$) is extracted via spectral density fusion and zero-crossing analysis:
$$\text{RR} = 60 \cdot f_r \quad (\text{breaths/min})$$

### 6.3 Clinical Significance
- **Normal Range**: $12 - 20\text{ breaths/min}$
- **Tachypnea**: $> 20\text{ breaths/min}$ (indicates respiratory distress, autonomic arousal, or fever).
- **Bradypnea / Apnea**: $< 10\text{ breaths/min}$ or zero-flow pauses during obstructive/central sleep apnea events.

---

## 7. Motion (Accelerometer / Artifact Index)

### 7.1 Technical & Physical Mechanism
Motion is captured via an integrated 3-axis MEMS accelerometer inside the O2Ring, quantifying physical movement of the hand/body during sleep.

### 7.2 Mathematical Formulation
The composite acceleration magnitude $A(t)$ is computed from tri-axial channels ($A_x, A_y, A_z$):
$$A(t) = \sqrt{A_x(t)^2 + A_y(t)^2 + A_z(t)^2}$$

Motion Index ($\text{MI}$) is computed as the high-pass filtered variation over a 1-second epoch:
$$\text{MI} = \frac{1}{N}\sum_{k=1}^N \left| A(t_k) - g \right|$$

### 7.3 Clinical Significance
- **Actigraphy & Sleep Staging**: Distinguishes wakefulness (high motion) from NREM/REM sleep states (quiescence).
- **Artifact Discrimination**: Enables clinicians to determine whether drops in $\text{SpO}_2$ or spikes in Heart Rate are true physiological events or transient motion artifacts.

---

## Summary Matrix

| Metric | Symbol | Unit | Normal Sleep Range | Key Clinical Insight |
| :--- | :--- | :--- | :--- | :--- |
| **PPG** | Waveform | Relative | Pulsatile AC/DC | Vascular compliance & optical absorption substrate |
| **$\text{SpO}_2$** | Oxygen Saturation | $\%$ | $95\% - 100\%$ | Hypoxia & Obstructive Sleep Apnea (ODI) |
| **PR** | Pulse Rate | $\text{bpm}$ | $50 - 100\text{ bpm}$ | Autonomic sympathetic arousal post-apnea |
| **PI** | Perfusion Index | $\%$ | $0.2\% - 20.0\%$ | Peripheral vascular perfusion & SQI gating |
| **BP** | Blood Pressure | $\text{mmHg}$ | $< 120 / 80$ | Nocturnal non-dipping & cardiovascular risk |
| **RR** | Respiratory Rate | $\text{breaths/min}$ | $12 - 20$ | Respiratory-Induced Variations (AM/BW/FM) |
| **Motion** | Actigraphy Index | Index | $0 - 10$ (Resting) | Sleep-wake actigraphy & motion artifact gating |
