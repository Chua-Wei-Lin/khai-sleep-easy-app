import Constants from "expo-constants";

const variant = Constants.expoConfig?.extra?.appVariant || "patient";

export const isDistributorApp = variant === "distributor";
export const isPatientApp = !isDistributorApp;

// Feature Flags
// Patient version: No BP and No RR (focused on SpO2, PR, Motion, and raw PPG collection)
// Distributor / Staff version: Full features enabled (including BP and RR)
export const showBpFeature = isDistributorApp;
export const showRrFeature = isDistributorApp;
