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
 * Estimates Respiratory Rate (breaths per minute) from HR max and min.
 */
export function calculateRespiratoryRate(pulseRates: number[]): number {
  if (pulseRates.length === 0) return 0;
  const hrMax = Math.max(...pulseRates);
  const hrMin = Math.min(...pulseRates);
  return Math.max(10, hrMax - hrMin); // fallback baseline bounds
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