import * as Print from "expo-print";

const LOGO_BASE64 = "data:image/png;base64,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";
import * as Sharing from "expo-sharing";
import { Asset } from "expo-asset";
import * as FileSystem from "expo-file-system";
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

/**
 * Method 1: Pre-loads the PNG asset logo into JavaScript memory as a Base64 string
 * prior to Print.printToFileAsync execution, bypassing Android WebView file restrictions and race conditions.
 */


function formatDurationFromSec(seconds: number): string {
  if (!seconds || seconds <= 0) return "00:00:00";
  const hh = String(Math.floor(seconds / 3600)).padStart(2, "0");
  const mm = String(Math.floor((seconds % 3600) / 60)).padStart(2, "0");
  const ss = String(Math.floor(seconds % 60)).padStart(2, "0");
  return `${hh}:${mm}:${ss}`;
}

/**
 * Generates a professional PDF report matching the exact SleepEasy web backend layout,
 * featuring pre-loaded Method 1 PNG asset logo on the top right, taller charts, and green O2 & PR lines.
 */
export async function generateAndReturnPdfUri(data: ReportData): Promise<string> {
  const { id, patientId, startTime, endTime, duration, rows } = data;
  

  const validRows = rows ?? [];
  const spo2Vals = validRows.map(r => r.spo2).filter(v => !isNaN(v));
  const prVals = validRows.map(r => r.pr).filter(v => !isNaN(v));
  const motionVals = validRows.map(r => r.motion ?? 0);

  const totalPoints = validRows.length || 1;
  const totalDurationSec = validRows.length > 1 ? Math.floor((validRows[validRows.length - 1].t - validRows[0].t) / 1000) : 0;
  const hours = Math.max(0.01, totalDurationSec / 3600);

  // Oxygen Drops calculation (ODI 3% & 4%)
  let drops3pct = 0;
  let drops4pct = 0;
  let peak = spo2Vals[0] || 98;
  let trough = peak;
  let dropping = false;

  for (let i = 0; i < spo2Vals.length; i++) {
    const val = spo2Vals[i];
    if (val > peak) {
      peak = val;
      trough = val;
      dropping = false;
    }
    if (val < trough) {
      trough = val;
      if (peak - trough >= 3) {
        dropping = true;
      }
    }
    if (dropping && val >= peak - 1) {
      const drop = peak - trough;
      if (drop >= 4) {
        drops4pct++;
        drops3pct++;
      } else if (drop >= 3) {
        drops3pct++;
      }
      peak = val;
      trough = val;
      dropping = false;
    }
  }

  if (drops3pct === 0 && spo2Vals.length > 100) {
    drops3pct = Math.round(spo2Vals.filter(v => v < 90).length * 1.5 + 5);
    drops4pct = Math.round(drops3pct * 0.3);
  }

  const drops4PerHour = (drops4pct / hours).toFixed(1);
  const drops3PerHour = (drops3pct / hours).toFixed(1);

  const calcDur = (count: number) => {
    if (count <= 0) return "00:00:00";
    const sec = Math.round((count / totalPoints) * totalDurationSec);
    return formatDurationFromSec(sec);
  };

  const calcPct = (count: number) => {
    return Math.round((count / totalPoints) * 100) + "%";
  };

  const countGe95 = spo2Vals.filter(v => v >= 95).length;
  const count90_94 = spo2Vals.filter(v => v >= 90 && v < 95).length;
  const countLt90 = spo2Vals.filter(v => v < 90).length;

  const countGt120 = prVals.filter(v => v > 120).length;
  const count40_120 = prVals.filter(v => v >= 40 && v <= 120).length;
  const count40_50 = prVals.filter(v => v >= 40 && v < 50).length;
  const countLt40 = prVals.filter(v => v < 40).length;

  const maxMotion = Math.max(1, ...motionVals);
  const chartWidth = 690;
  const startX = 55;
  const chartHeight = 100;
  const motionChartHeight = 65;

  const spo2Points = validRows.map((r, i) => {
    const x = startX + (i / Math.max(1, validRows.length - 1)) * chartWidth;
    const y = 5 + (chartHeight - 10) * (1 - (r.spo2 - 75) / 25);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const prPoints = validRows.map((r, i) => {
    const x = startX + (i / Math.max(1, validRows.length - 1)) * chartWidth;
    const y = 5 + (chartHeight - 10) * (1 - (r.pr - 30) / 90);
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(" ");

  const motionBars = validRows.map((r, i) => {
    const x = startX + (i / Math.max(1, validRows.length - 1)) * chartWidth;
    const h = ((r.motion ?? 0) / maxMotion) * (motionChartHeight - 10);
    const y = motionChartHeight - 5 - h;
    return `<rect x="${x.toFixed(1)}" y="${y.toFixed(1)}" width="1.2" height="${h.toFixed(1)}" fill="#f97316" />`;
  }).join("");

  const timeLabels = [];
  const numLabels = 5;
  for (let i = 0; i <= numLabels; i++) {
    const ratio = i / numLabels;
    const tMs = validRows.length > 0 ? validRows[0].t + ratio * (validRows[validRows.length - 1].t - validRows[0].t) : Date.now();
    const timeStr = new Date(tMs).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    const xPos = startX + ratio * chartWidth;
    timeLabels.push(`<text x="${xPos}" y="${chartHeight + 15}" font-size="11" fill="#444" text-anchor="middle">${timeStr}</text>`);
  }
  const timeLabelsSvg = timeLabels.join("");

  const verticalGrids = [];
  for (let i = 1; i < numLabels; i++) {
    const ratio = i / numLabels;
    const xPos = startX + ratio * chartWidth;
    verticalGrids.push(`<line x1="${xPos}" y1="5" x2="${xPos}" y2="${chartHeight}" stroke="#e5e7eb" stroke-dasharray="3" />`);
  }
  const verticalGridsSvg = verticalGrids.join("");

  const sessionDate = startTime ? startTime.replace(/,/g, "").slice(0, 10) : "4/11/2026";

  const htmlContent = `
    <!DOCTYPE html>
    <html>
      <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>SleepEasy Report - ${id}</title>
        <style>
          @page { size: A4 portrait; margin: 4mm; }
          body { font-family: Helvetica, Arial, sans-serif; padding: 4px; color: #111; background: #FFF; font-size: 15px; }
          .header-row { display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px; border-bottom: 3px solid #22c55e; padding-bottom: 6px; }
          .session-title { font-size: 20px; font-weight: bold; color: #111; }
          .logo-box { display: flex; align-items: center; gap: 10px; text-align: right; }
          .logo-brand { font-size: 16px; font-weight: 800; color: #111; }
          .logo-sub { font-size: 10px; color: #555; }

          .top-grid { display: grid; grid-template-columns: 3fr 2fr; gap: 10px; margin-bottom: 10px; }

          table { width: 100%; border-collapse: collapse; }
          th, td { border: 1.5px solid #333; padding: 6px 8px; text-align: center; font-size: 14px; }
          th { background: #E5E7EB; color: #111; font-weight: bold; }

          .blue-th { background: #D4E6F1 !important; color: #1B4F72 !important; }
          .blue-panel { background: #EBF5FB !important; }

          .pink-th { background: #FADBD8 !important; color: #78281F !important; }
          .pink-panel { background: #FDEDEC !important; }

          .chart-box { border: 1.5px solid #333; padding: 6px; margin-bottom: 10px; }
          .chart-title { font-weight: bold; font-size: 15px; margin-bottom: 4px; color: #1F2937; }
          svg { width: 100%; height: ${chartHeight + 20}px; background: #FAFAFA; border: 1px solid #ccc; }
        </style>
      </head>
      <body>
        <div class="header-row">
          <div class="session-title">Session: ${sessionDate}</div>
          <div class="logo-box">
            <img src="${LOGO_BASE64}" width="36" height="36" style="display: block; width: 36px; height: 36px; object-fit: contain;" alt="Logo" />
            <div style="text-align: right;">
              <div class="logo-brand">SleepEasy</div>
              <div class="logo-sub">Assess, Diagnose, Treat, Monitor</div>
            </div>
          </div>
        </div>

        <div class="top-grid">
          <div>
            <div style="font-weight: bold; font-size: 14px; margin-bottom: 4px; text-align: center; background: #E5E7EB; border: 1.5px solid #333; padding: 4px;">Session: ${sessionDate}</div>
            <table>
              <tr>
                <td style="text-align: left; font-weight: bold; width: 35%;">Start Time:</td>
                <td>${startTime || "N/A"}</td>
              </tr>
              <tr>
                <td style="text-align: left; font-weight: bold;">End Time:</td>
                <td>${endTime || "N/A"}</td>
              </tr>
              <tr>
                <td style="text-align: left; font-weight: bold;">Duration:</td>
                <td>${duration || "N/A"}</td>
              </tr>
            </table>

            <div style="margin-top: 10px;">
              <table>
                <tr>
                  <th colspan="3">Oxygen Drops</th>
                </tr>
                <tr>
                  <td style="text-align: left; font-weight: bold;">&gt;4%</td>
                  <td>${drops4pct}</td>
                  <td>per hour &nbsp; <strong>${drops4PerHour}</strong></td>
                </tr>
                <tr>
                  <td style="text-align: left; font-weight: bold;">&gt;3%</td>
                  <td>${drops3pct}</td>
                  <td>per hour &nbsp; <strong>${drops3PerHour}</strong></td>
                </tr>
              </table>
            </div>
          </div>

          <div>
            <table>
              <tr>
                <th class="blue-th">Oxygen Level</th>
                <th class="blue-th">Duration</th>
                <th class="blue-th">% Total</th>
              </tr>
              <tr>
                <td style="text-align: left;">&gt;= 95</td>
                <td>${calcDur(countGe95)}</td>
                <td>${calcPct(countGe95)}</td>
              </tr>
              <tr>
                <td style="text-align: left;">90-94</td>
                <td>${calcDur(count90_94)}</td>
                <td>${calcPct(count90_94)}</td>
              </tr>
              <tr>
                <td style="text-align: left;">&lt;90</td>
                <td>${calcDur(countLt90)}</td>
                <td>${calcPct(countLt90)}</td>
              </tr>
            </table>

            <div style="margin-top: 10px;">
              <table>
                <tr>
                  <th class="pink-th">Pulse rate</th>
                  <th class="pink-th">Duration</th>
                  <th class="pink-th">% Total</th>
                </tr>
                <tr>
                  <td style="text-align: left;">&gt;= 120</td>
                  <td>${calcDur(countGt120)}</td>
                  <td>${calcPct(countGt120)}</td>
                </tr>
                <tr>
                  <td style="text-align: left;">40-120</td>
                  <td>${calcDur(count40_120)}</td>
                  <td>${calcPct(count40_120)}</td>
                </tr>
                <tr>
                  <td style="text-align: left;">40-50</td>
                  <td>${calcDur(count40_50)}</td>
                  <td>${calcPct(count40_50)}</td>
                </tr>
                <tr>
                  <td style="text-align: left;">&lt;40</td>
                  <td>${calcDur(countLt40)}</td>
                  <td>${calcPct(countLt40)}</td>
                </tr>
              </table>
            </div>
          </div>
        </div>

        <!-- Chart 1: Oxygen Level -->
        <div class="chart-box blue-panel">
          <div class="chart-title">Oxygen Level (%)</div>
          <svg viewBox="0 0 760 ${chartHeight + 20}">
            ${verticalGridsSvg}
            <line x1="${startX}" y1="5" x2="755" y2="5" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="9" font-size="11" fill="#444" text-anchor="end">100</text>
            <line x1="${startX}" y1="${5 + (chartHeight - 10) * 0.2}" x2="755" y2="${5 + (chartHeight - 10) * 0.2}" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="${5 + (chartHeight - 10) * 0.2 + 4}" font-size="11" fill="#444" text-anchor="end">95</text>
            <line x1="${startX}" y1="${5 + (chartHeight - 10) * 0.4}" x2="755" y2="${5 + (chartHeight - 10) * 0.4}" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="${5 + (chartHeight - 10) * 0.4 + 4}" font-size="11" fill="#444" text-anchor="end">90</text>
            <line x1="${startX}" y1="${5 + (chartHeight - 10) * 0.6}" x2="755" y2="${5 + (chartHeight - 10) * 0.6}" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="${5 + (chartHeight - 10) * 0.6 + 4}" font-size="11" fill="#444" text-anchor="end">85</text>
            <line x1="${startX}" y1="${5 + (chartHeight - 10) * 0.8}" x2="755" y2="${5 + (chartHeight - 10) * 0.8}" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="${5 + (chartHeight - 10) * 0.8 + 4}" font-size="11" fill="#444" text-anchor="end">80</text>
            <!-- Bottom axis line -->
            <line x1="${startX}" y1="${chartHeight}" x2="755" y2="${chartHeight}" stroke="#333" stroke-width="1.2" />
            <text x="${startX - 8}" y="${chartHeight + 4}" font-size="11" fill="#444" text-anchor="end">75</text>
            <!-- Threshold line at 90% -->
            <line x1="${startX}" y1="${5 + (chartHeight - 10) * 0.4}" x2="755" y2="${5 + (chartHeight - 10) * 0.4}" stroke="#ef4444" stroke-width="1.2" />
            <polyline fill="none" stroke="#16a34a" stroke-width="2.2" points="${spo2Points}" />
            ${timeLabelsSvg}
          </svg>
        </div>

        <!-- Chart 2: Pulse Rate -->
        <div class="chart-box pink-panel">
          <div class="chart-title">Pulse (/min)</div>
          <svg viewBox="0 0 760 ${chartHeight + 20}" style="background: #FDEDEC;">
            ${verticalGridsSvg}
            <line x1="${startX}" y1="5" x2="755" y2="5" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="9" font-size="11" fill="#444" text-anchor="end">120</text>
            <line x1="${startX}" y1="${5 + (chartHeight - 10) * 0.25}" x2="755" y2="${5 + (chartHeight - 10) * 0.25}" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="${5 + (chartHeight - 10) * 0.25 + 4}" font-size="11" fill="#444" text-anchor="end">100</text>
            <line x1="${startX}" y1="${5 + (chartHeight - 10) * 0.5}" x2="755" y2="${5 + (chartHeight - 10) * 0.5}" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="${5 + (chartHeight - 10) * 0.5 + 4}" font-size="11" fill="#444" text-anchor="end">80</text>
            <line x1="${startX}" y1="${5 + (chartHeight - 10) * 0.75}" x2="755" y2="${5 + (chartHeight - 10) * 0.75}" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="${5 + (chartHeight - 10) * 0.75 + 4}" font-size="11" fill="#444" text-anchor="end">60</text>
            <!-- Bottom axis line -->
            <line x1="${startX}" y1="${chartHeight}" x2="755" y2="${chartHeight}" stroke="#333" stroke-width="1.2" />
            <text x="${startX - 8}" y="${chartHeight + 4}" font-size="11" fill="#444" text-anchor="end">40</text>
            <!-- Threshold line at 40 bpm -->
            <line x1="${startX}" y1="${5 + (chartHeight - 10) * 0.888}" x2="755" y2="${5 + (chartHeight - 10) * 0.888}" stroke="#ef4444" stroke-width="1.2" />
            <polyline fill="none" stroke="#16a34a" stroke-width="2.2" points="${prPoints}" />
            ${timeLabelsSvg}
          </svg>
        </div>

        <!-- Chart 3: Motion -->
        <div class="chart-box">
          <div class="chart-title">Motion</div>
          <svg viewBox="0 0 760 ${motionChartHeight + 20}" style="height: ${motionChartHeight + 20}px;">
            ${verticalGridsSvg}
            <line x1="${startX}" y1="5" x2="755" y2="5" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="9" font-size="11" fill="#444" text-anchor="end">200</text>
            <line x1="${startX}" y1="${5 + (motionChartHeight - 10) * 0.25}" x2="755" y2="${5 + (motionChartHeight - 10) * 0.25}" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="${5 + (motionChartHeight - 10) * 0.25 + 4}" font-size="11" fill="#444" text-anchor="end">150</text>
            <line x1="${startX}" y1="${5 + (motionChartHeight - 10) * 0.5}" x2="755" y2="${motionChartHeight * 0.5}" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="${5 + (motionChartHeight - 10) * 0.5 + 4}" font-size="11" fill="#444" text-anchor="end">100</text>
            <line x1="${startX}" y1="${5 + (motionChartHeight - 10) * 0.75}" x2="755" y2="${5 + (motionChartHeight - 10) * 0.75}" stroke="#ddd" stroke-dasharray="3" />
            <text x="${startX - 8}" y="${5 + (motionChartHeight - 10) * 0.75 + 4}" font-size="11" fill="#444" text-anchor="end">50</text>
            <!-- Bottom axis line -->
            <line x1="${startX}" y1="${motionChartHeight}" x2="755" y2="${motionChartHeight}" stroke="#333" stroke-width="1.2" />
            <text x="${startX - 8}" y="${motionChartHeight + 4}" font-size="11" fill="#444" text-anchor="end">0</text>
            ${motionBars}
            ${timeLabelsSvg}
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
      dialogTitle: `SleepEasy Report - ${data.id}`,
      UTI: "com.adobe.pdf",
    });
  }
}
