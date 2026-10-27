/**
 * Haemodynamic & HRV Calculation Utilities
 * Based on Sleep Easy Formulas Proof
 */

export type SleepStage = "Wake" | "Light (N1/N2)" | "Deep (N3)" | "REM" | "Unknown";

export type HaemodynamicMetrics = {
  sdnn: number;
  rmssd: number;
  pNN50: number;
  map: number;
  sdpr: number;
  respiratoryRate: number;
  estimatedSleepStage: SleepStage;
};

/**
 * Computes heartbeat intervals in milliseconds from pulse rate (bpm).
 * Formula: RR = 60000 / HR
 */
export function computePulseIntervalsMs(pulseRates: number[]): number[] {
  return pulseRates.map((hr) => (hr > 0 ? 60000 / hr : 0)).filter((v) => v > 0);
}

/**
 * Calculates SDNN (Standard Deviation of NN intervals) in ms.
 * SDNN = sqrt( (1 / (N - 1)) * sum((RR_i - mean(RR))^2) )
 */
export function calculateSdnn(pulseRates: number[]): number {
  const intervals = computePulseIntervalsMs(pulseRates);
  if (intervals.length < 2) return 0;

  const mean = intervals.reduce((a, b) => a + b, 0) / intervals.length;
  const squaredDiffsSum = intervals.reduce((sum, val) => sum + Math.pow(val - mean, 2), 0);

  return Math.sqrt(squaredDiffsSum / (intervals.length - 1));
}

/**
 * Calculates RMSSD (Root Mean Square of Successive Differences) in ms.
 * RMSSD = sqrt( (1 / (N - 1)) * sum((PPI_{i+1} - PPI_i)^2) )
 */
export function calculateRmssd(pulseRates: number[]): number {
  const intervals = computePulseIntervalsMs(pulseRates);
  if (intervals.length < 2) return 0;

  let squaredDiffsSum = 0;
  for (let i = 0; i < intervals.length - 1; i++) {
    const diff = intervals[i + 1] - intervals[i];
    squaredDiffsSum += Math.pow(diff, 2);
  }

  return Math.sqrt(squaredDiffsSum / (intervals.length - 1));
}

/**
 * Calculates pNN50 (%) - Percentage of successive intervals differing by > 50 ms.
 */
export function calculatePnn50(pulseRates: number[]): number {
  const intervals = computePulseIntervalsMs(pulseRates);
  if (intervals.length < 2) return 0;

  let countGreater50ms = 0;
  for (let i = 0; i < intervals.length - 1; i++) {
    const diff = Math.abs(intervals[i + 1] - intervals[i]);
    if (diff > 50) {
      countGreater50ms++;
    }
  }

  return (countGreater50ms / (intervals.length - 1)) * 100;
}

/**
 * Calculates Mean Arterial Pressure (MAP) in mmHg.
 * Formula: MAP = DBP + (1/3) * (SBP - DBP)
 */
export function calculateMap(sbp: number, dbp: number): number {
  return dbp + (1 / 3) * (sbp - dbp);
}

/**
 * Calculates Pulse Rate Variability / Standard Deviation of Pulse Rates (SDPR).
 */
export function calculateSdpr(pulseRates: number[]): number {
  if (pulseRates.length === 0) return 0;
  const mean = pulseRates.reduce((a, b) => a + b, 0) / pulseRates.length;
  const variance = pulseRates.reduce((sum, hr) => sum + Math.pow(hr - mean, 2), 0) / pulseRates.length;
  return Math.sqrt(variance);
}

/**
 * Estimates Respiratory Rate (breaths per minute) from HR.
 */
export function calculateRespiratoryRate(pulseRates: number[]): number {
  if (pulseRates.length === 0) return 14;
  const currentPr = pulseRates[pulseRates.length - 1];
  // Stable physiological estimation based on current heart rate (typically ~1 breath per 4 heartbeats)
  const estimatedRr = Math.round(currentPr / 4);
  return Math.max(10, Math.min(24, estimatedRr));
}

/**
 * Estimates Sleep Stage based on delta PR, RMSSD, and SpO2 according to the classification matrix.
 */
export function classifySleepStage(
  currentPr: number,
  baselinePr: number,
  rmssd: number,
  spo2: number
): SleepStage {
  const deltaPr = currentPr - baselinePr;

  if (deltaPr >= 8 && rmssd < 30) {
    return "Wake";
  } else if (deltaPr <= -4 && rmssd >= 40 && spo2 >= 96) {
    return "Deep (N3)";
  } else if (Math.abs(deltaPr) <= 3) {
    return "Light (N1/N2)";
  } else {
    return "REM";
  }
}

/**
 * Estimates the Systolic Blood Pressure (SBP) from a single pulse wave cycle.
 * @param dbp_prior The diastolic blood pressure from the immediately preceding heartbeat (mmHg)
 * @param area_sys The mathematical integral (area under the curve) of the systolic rising phase
 * @param aix The Augmentation Index representing the reflection notch height ratio (H_notch / H_sys)
 * @param k1 Personalized calibration constant scaling the systolic stroke volume contribution
 * @param k2 Personalized calibration constant scaling the vascular stiffness contribution
 */
export function calculate_continuous_sbp(
  dbp_prior: number,
  area_sys: number,
  aix: number,
  k1: number,
  k2: number
): number {
  const pulse_pressure = (k1 * area_sys) / (1 - k2 * aix);
  const sbp = dbp_prior + pulse_pressure;

  // Safety constraint within physiological limits
  return Math.min(Math.max(Math.round(sbp), 50), 180);
}

/**
 * Estimates the Diastolic Blood Pressure (DBP) using a Windkessel exponential decay model.
 * @param sbp_current The newly calculated systolic blood pressure for the current heartbeat (mmHg)
 * @param t_dia The real time duration of the diastolic decay phase in seconds
 * @param dynamic_rc The lumped vascular time constant (Resistance * Compliance) derived from user calibration
 */
export function calculate_continuous_dbp(
  sbp_current: number,
  t_dia: number,
  dynamic_rc: number
): number {
  // Model the exponential pressure decay during ventricular relaxation
  const decay_factor = Math.exp(-t_dia / dynamic_rc);
  const dbp = sbp_current * decay_factor;

  // Safety constraint within physiological limits
  return Math.min(Math.max(Math.round(dbp), 30), 110);
}
