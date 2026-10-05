import { useEffect } from 'react';
import Viatom from './Viatom'; // Import Expo module wrapper

export * from "./Viatom";

export const startPpgCapture = (seconds: number): Promise<string> =>
  (Viatom as any).startPpgCapture(seconds);

export const stopPpgCapture = (): Promise<boolean> =>
  (Viatom as any).stopPpgCapture();

export function useO2RingBpStream() {
  useEffect(() => {
    // 1. Initialize native C memory buffers
    Viatom.initBpAlgorithm?.();

    // 2. Listen for streamed PPG & BP outputs
    const subscription = Viatom.addListener('onWaveformReceived', (event: {
      wFs: number[];
      sbp: number[];
      dbp: number[];
      ts: number;
    }) => {
      const { wFs, sbp, dbp, ts } = event;

      // Latest estimated Blood Pressure
      const currentSbp = sbp?.[sbp.length - 1] ?? 0;
      const currentDbp = dbp?.[dbp.length - 1] ?? 0;

      console.log(`[${ts}] PPG batch size: ${wFs?.length} | SBP: ${currentSbp} mmHg, DBP: ${currentDbp} mmHg`);
    });

    return () => {
      // Clean up native C memory on unmount
      subscription.remove();
      Viatom.stopBpAlgorithm?.();
    };
  }, []);
}