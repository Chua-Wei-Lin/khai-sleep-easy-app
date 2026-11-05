import { Asset } from "expo-asset";
import * as Print from "expo-print";
import * as Sharing from "expo-sharing";
import { Paths, File as ExpoFile } from "expo-file-system";

type ReportData = {
  id: string;
  patientId: string;
  patientName?: string;
  patientAge?: string;
  patientSex?: string;
  startTime?: string;
  endTime?: string;
  duration?: string;
  notes?: string;
  rows?: { t: number; spo2: number; pr: number; motion?: number }[];
};

const LOGO_BASE64 = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAQAAAAEACAYAAABccqhmAAAl50lEQVR4Xu2dB3hVVdaGHRuj..."

function formatDurationFromSec(seconds: number): string {
  if (!seconds || seconds <= 0) return "--";
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(Math.floor(seconds % 60)).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

async function getLogoFileUri(): Promise<string> {
  try {
    const logoFile = new ExpoFile(Paths.document, "sleepeasylogo_v3.png");
    if (logoFile.exists === true) {
      await logoFile.delete();
    }
    const cleanB64 = LOGO_BASE64.replace(/^data:image\/png;base64,/, "");
    await logoFile.write(cleanB64, { encoding: "base64" });
    return logoFile.uri;
  } catch {
    return LOGO_BASE64;
  }
}

/**
 * Generates a single-page professional PDF report matching the exact ViHealth O2Ring layout,
 * featuring Sleep Easy logo, summary stat tables, O2 score, threshold distributions,
 * and compact vibrant SVG trend graphs for Oxygen Level (green), Pulse Rate (green), and Motion (orange).
 */
export async function generateAndReturnPdfUri(data: ReportData): Promise<string> {
  const { id, patientId, patientName, patientAge, patientSex, startTime, endTime, duration, notes, rows } = data;

  const logoUri = await getLogoFileUri();

  const validRows = rows ?? [];
  const spo2Vals = validRows.map(r => r.spo2).filter(v => !isNaN(v));
  const prVals = validRows.map(r => r.pr).filter(v => !isNaN(v));
  const motionVals = validRows.map(r => r.motion ?? 0);

  const maxSpo2 = spo2Vals.length ? Math.max(...spo2Vals) : 0;
  const minSpo2 = spo2Vals.length ? Math.min(...spo2Vals) : 0;
  const avgSpo2 = spo2Vals.length ? Math.round(spo2Vals.reduce((a, b) => a + b, 0) / spo2Vals.length) : 0;

  const maxPr = prVals.length ? Math.max(...prVals) : 0;
  const minPr = prVals.length ? Math.min(...prVals) : 0;
  const avgPr = prVals.length ? Math.round(prVals.reduce((a, b) => a + b, 0) / prVals.length) : 0;

  const maxMotion = Math.max(1, ...motionVals);

  const totalPoints = validRows.length || 1;
  const totalDurationSec = validRows.length > 1 ? Math.floor((validRows[validRows.length - 1].t - validRows[0].t) / 1000) : 0;

  const calcDur = (count: number) => {
    if (count <= 0) return "--";
    const sec = Math.round((count / totalPoints) * totalDurationSec);
    return formatDurationFromSec(sec);
  };

  // SpO2 brackets
  const countGe95 = spo2Vals.filter(v => v >= 95).length;
  const count90_94 = spo2Vals.filter(v => v >= 90 && v < 95).length;
  const count80_89 = spo2Vals.filter(v => v >= 80 && v < 90).length;
  const count70_79 = spo2Vals.filter(v => v >= 70 && v < 80).length;
  const countLt70 = spo2Vals.filter(v => v < 70).length;
  const countLt90 = count80_89 + count70_79 + countLt70;

  const pctGe95 = ((countGe95 / totalPoints) * 100).toFixed(2);
  const pct90_94 = ((count90_94 / totalPoints) * 100).toFixed(2);
  const pct80_89 = ((count80_89 / totalPoints) * 100).toFixed(2);
  const pct70_79 = ((count70_79 / totalPoints) * 100).toFixed(2);
  const pctLt70 = ((countLt70 / totalPoints) * 100).toFixed(2);
  const pctLt90 = ((countLt90 / totalPoints) * 100).toFixed(2);

  // PR brackets
  const countGt120 = prVals.filter(v => v > 120).length;
  const count50_120 = prVals.filter(v => v >= 50 && v <= 120).length;
  const countLt50 = prVals.filter(v => v < 50).length;

  const pctGt120 = ((countGt120 / totalPoints) * 100).toFixed(2);
  const pct50_120 = ((count50_120 / totalPoints) * 100).toFixed(2);
  const pctLt50 = ((countLt50 / totalPoints) * 100).toFixed(2);

  const o2Score = Math.max(0, Math.min(10, 10 - (countLt90 / totalPoints) * 15)).toFixed(1);

  // Compact dimensions so full report fits on 1 page
  const chartWidth = 700;
  const spo2ChartHeight = 75;
  const prChartHeight = 75;
  const motionChartHeight = 45;

  const spo2Points = validRows.map((r, i) => {
    const x = (i / Math.max(1, validRows.length - 1)) * chartWidth;
    const y = spo2ChartHeight - ((r.spo2 - 70) / 30) * spo2ChartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const prPoints = validRows.map((r, i) => {
    const x = (i / Math.max(1, validRows.length - 1)) * chartWidth;
    const y = prChartHeight - ((r.pr - 25) / 225) * prChartHeight;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const motionBars = validRows.map((r, i) => {
    const x = (i / Math.max(1, validRows.length - 1)) * chartWidth;
    const h = ((r.motion ?? 0) / maxMotion) * motionChartHeight;
    const y = motionChartHeight - h;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="1.5" height="${h.toFixed(1)}" fill="#f97316" />`;
  }).join("");

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Sleep Easy O2Ring Report - ${id}</title>
        <style>
          @page { size: A4 portrait; margin: 6mm; }
          body { font-family: Helvetica, Arial, sans-serif; padding: 6px; color: #222; background: #FFF; font-size: 9px; }
          .header-brand { display: flex; justify-content: space-between; align-items: center; border-bottom: 2px solid #22c55e; padding-bottom: 4px; margin-bottom: 6px; }
          .brand-title { font-size: 14px; font-weight: 800; color: #16a34a; letter-spacing: 0.5px; }
          .logo-img { height: 32px; width: 90px; object-fit: contain; }
          .top-box { border: 1.2px solid #333; display: grid; grid-template-columns: 2fr 1fr; margin-bottom: 6px; }
          .patient-info { padding: 4px 8px; border-right: 1.2px solid #333; display: flex; justify-content: space-between; align-items: center; font-weight: bold; font-size: 10px; }
          .summary-table { width: 100%; border-collapse: collapse; }
          .summary-table th, .summary-table td { border: 1px solid #333; padding: 2px 4px; text-align: center; font-size: 9px; }
          .summary-table th { background: #22c55e; color: #FFF; }
          .summary-table td.label { background: #dcfce7; font-weight: bold; text-align: left; color: #14532d; }

          .grid-2 { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-bottom: 6px; }
          .panel { border: 1.2px solid #333; padding: 4px; }
          .panel-title { font-weight: bold; margin-bottom: 3px; font-size: 9px; border-bottom: 1px solid #ccc; padding-bottom: 2px; }

          .data-table { width: 100%; border-collapse: collapse; margin-top: 2px; }
          .data-table th, .data-table td { border: 1px solid #333; padding: 2px 4px; text-align: center; font-size: 8.5px; }
          .data-table th { background: #dcfce7; color: #14532d; }

          .chart-section { border: 1.2px solid #333; padding: 4px; margin-bottom: 6px; }
          .chart-title { font-weight: bold; font-size: 9px; margin-bottom: 2px; color: #15803d; }
          .motion-title { color: #ea580c; }
          svg { width: 100%; background: #FAFAFA; border: 1px solid #ccc; }
        </style>
      </head>
      <body>
                        <div class="header-brand">
          <div class="brand-title">SLEEP EASY - O2RING DIAGNOSTIC REPORT</div>
          <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; width: 36px; height: 36px; vertical-align: middle;">
            <!-- Blue Crescent Arc -->
            <path d="M 4 28 C 12 12, 26 12, 33 28 C 26 18, 13 18, 4 28 Z" fill="#2EA7E0" />
            <!-- Black Sleeping Profile Outline -->
            <path d="M 8 7 C 18 4, 27 5, 29 9 C 27 12, 28 15, 31 17 C 32 19, 31 20, 29 19 C 26 17, 25 14, 23 12 C 18 9, 14 8, 8 7 Z" fill="#000000" />
          </svg>
        </div>
          <svg width="36" height="36" viewBox="0 0 36 36" xmlns="http://www.w3.org/2000/svg" style="display: inline-block; width: 36px; height: 36px; vertical-align: middle;">
            <!-- Blue Crescent Arc -->
            <path d="M 4 28 C 12 12, 26 12, 33 28 C 26 18, 13 18, 4 28 Z" fill="#2EA7E0" />
            <!-- Black Sleeping Profile Outline -->
            <path d="M 8 7 C 18 4, 27 5, 29 9 C 27 12, 28 15, 31 17 C 32 19, 31 20, 29 19 C 26 17, 25 14, 23 12 C 18 9, 14 8, 8 7 Z" fill="#000000" />
          </svg>
        </div>

        <!-- Meta Time & Notes -->
        <div class="top-box" style="margin-bottom: 6px;">
          <div style="padding: 4px 8px; font-size: 9.5px;">
            <div style="display: flex; justify-content: space-between; margin-bottom: 2px;">
              <span><strong>Start Time:</strong> ${startTime || "N/A"}</span>
              <span><strong>End Time:</strong> ${endTime || "N/A"}</span>
              <span><strong>Duration:</strong> ${duration || "N/A"}</span>
            </div>
            <div style="margin-top: 3px; border-top: 1px dashed #ccc; padding-top: 2px;">
              <strong>Note:</strong> ${notes || "No notes added."}
            </div>
          </div>
        </div>

        <!-- Thresholds & Distribution -->
        <div class="grid-2">
          <div class="panel">
            <div class="panel-title">Threshold Analysis</div>
            <table class="data-table">
              <tr>
                <th>Oxygen Level Threshold: 90</th>
                <th>Duration</th>
                <th>% Total</th>
              </tr>
              <tr>
                <td style="text-align: left;">&gt;=95</td>
                <td>${calcDur(countGe95)}</td>
                <td>${pctGe95}%</td>
              </tr>
              <tr>
                <td style="text-align: left;">90-94</td>
                <td>${calcDur(count90_94)}</td>
                <td>${pct90_94}%</td>
              </tr>
              <tr>
                <td style="text-align: left;">&lt;90</td>
                <td>${calcDur(countLt90)}</td>
                <td>${pctLt90}%</td>
              </tr>
            </table>
            <br>
            <table class="data-table">
              <tr>
                <th>Pulse Rate Threshold</th>
                <th>Duration</th>
                <th>% Total</th>
              </tr>
              <tr>
                <td style="text-align: left;">&gt;120</td>
                <td>${calcDur(countGt120)}</td>
                <td>${pctGt120}%</td>
              </tr>
              <tr>
                <td style="text-align: left;">50-120</td>
                <td>${calcDur(count50_120)}</td>
                <td>${pct50_120}%</td>
              </tr>
              <tr>
                <td style="text-align: left;">&lt;50</td>
                <td>${calcDur(countLt50)}</td>
                <td>${pctLt50}%</td>
              </tr>
            </table>
          </div>

          <div class="panel">
            <div class="panel-title">Oxygen Level Distribution Breakdown</div>
            <table class="data-table">
              <tr>
                <th>Oxygen Level</th>
                <th>Duration</th>
                <th>% Total</th>
              </tr>
              <tr>
                <td style="text-align: left;">95-100</td>
                <td>${calcDur(countGe95)}</td>
                <td>${pctGe95}%</td>
              </tr>
              <tr>
                <td style="text-align: left;">90-94</td>
                <td>${calcDur(count90_94)}</td>
                <td>${pct90_94}%</td>
              </tr>
              <tr>
                <td style="text-align: left;">80-89</td>
                <td>${calcDur(count80_89)}</td>
                <td>${pct80_89}%</td>
              </tr>
              <tr>
                <td style="text-align: left;">70-79</td>
                <td>${calcDur(count70_79)}</td>
                <td>${pct70_79}%</td>
              </tr>
              <tr>
                <td style="text-align: left;">&lt;70</td>
                <td>${calcDur(countLt70)}</td>
                <td>${pctLt70}%</td>
              </tr>
            </table>
          </div>
        </div>

        <!-- Charts Section -->
        <div class="chart-section">
          <div class="chart-title">Oxygen Level (%)</div>
          <svg viewBox="0 0 ${chartWidth} ${spo2ChartHeight}" style="height: ${spo2ChartHeight}px;">
            <line x1="0" y1="0" x2="${chartWidth}" y2="0" stroke="#ddd" stroke-dasharray="3" />
            <line x1="0" y1="20" x2="${chartWidth}" y2="20" stroke="#ddd" stroke-dasharray="3" />
            <line x1="0" y1="40" x2="${chartWidth}" y2="40" stroke="#ddd" stroke-dasharray="3" />
            <line x1="0" y1="60" x2="${chartWidth}" y2="60" stroke="#ddd" stroke-dasharray="3" />
            <polyline fill="none" stroke="#22c55e" stroke-width="1.8" points="${spo2Points}" />
          </svg>
        </div>

        <div class="chart-section">
          <div class="chart-title">Pulse Rate (/min)</div>
          <svg viewBox="0 0 ${chartWidth} ${prChartHeight}" style="height: ${prChartHeight}px;">
            <line x1="0" y1="0" x2="${chartWidth}" y2="0" stroke="#ddd" stroke-dasharray="3" />
            <line x1="0" y1="35" x2="${chartWidth}" y2="35" stroke="#ddd" stroke-dasharray="3" />
            <line x1="0" y1="70" x2="${chartWidth}" y2="70" stroke="#ddd" stroke-dasharray="3" />
            <polyline fill="none" stroke="#16a34a" stroke-width="1.8" points="${prPoints}" />
          </svg>
        </div>

        <div class="chart-section">
          <div class="chart-title motion-title">Motion</div>
          <svg viewBox="0 0 ${chartWidth} ${motionChartHeight}" style="height: ${motionChartHeight}px;">
            <line x1="0" y1="0" x2="${chartWidth}" y2="0" stroke="#ddd" stroke-dasharray="3" />
            <line x1="0" y1="${motionChartHeight}" x2="${chartWidth}" y2="${motionChartHeight}" stroke="#333" />
            ${motionBars}
          </svg>
        </div>
      </body>
    </html>
  `;

  const tempPrintResult = await Print.printToFileAsync({ html: htmlContent });
  const baseName = id.replace(/\.csv$/i, "");
  const pdfFileName = `${baseName}.pdf`;

  const destFile = new ExpoFile(Paths.document, pdfFileName);
  if (destFile.exists === true) {
    await destFile.delete();
  }

  const tempFile = new ExpoFile(tempPrintResult.uri);
  await tempFile.copy(destFile);

  return destFile.uri;
}

export async function generateAndShareReport(data: ReportData) {
  const uri = await generateAndReturnPdfUri(data);
  if (await Sharing.isAvailableAsync()) {
    await Sharing.shareAsync(uri, {
      mimeType: "application/pdf",
      dialogTitle: `Sleep Easy O2Ring Report - ${data.id}`,
      UTI: "com.adobe.pdf",
    });
  }
}
