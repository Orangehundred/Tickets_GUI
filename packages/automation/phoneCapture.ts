import { BrowserWindow, screen, ipcMain } from "electron";
import * as fs from "fs";
import * as path from "path";
import screenshot from "screenshot-desktop";
import { createWorker } from "tesseract.js";
import sharp from "sharp"; // npm install sharp - used to crop the screenshot

import { fileURLToPath } from "node:url";
import { dirname } from "node:path";
const __dirname = dirname(fileURLToPath(import.meta.url));

// Walk up from phoneCapture.ts to the repo root
const CONFIG_PATH = path.join(__dirname, "../../phoneRegionConfig.json");

type RegionConfig = {
  displayLeft: number;
  displayTop: number;
  x: number;
  y: number;
  width: number;
  height: number;
};

function loadConfig(): RegionConfig | null {
  if (!fs.existsSync(CONFIG_PATH)) return null;
  try {
    return JSON.parse(fs.readFileSync(CONFIG_PATH, "utf-8"));
  } catch {
    return null;
  }
}

function saveConfig(config: RegionConfig) {
  fs.writeFileSync(CONFIG_PATH, JSON.stringify(config, null, 2));
}

export function deleteConfig() {
  if (fs.existsSync(CONFIG_PATH)) fs.unlinkSync(CONFIG_PATH);
}

// ---------- STEP 1: Let user drag-select a region on a chosen display ----------
// Opens a transparent fullscreen overlay window on every display.
// User drags a box; once released, we capture the coordinates relative
// to that display and save them, tagged with which display it was on.
export async function promptUserToSelectRegion(): Promise<RegionConfig> {
  const displays = screen.getAllDisplays();

  return new Promise((resolve) => {
    const overlays: BrowserWindow[] = [];

    displays.forEach((display, index) => {
      const overlay = new BrowserWindow({
        x: display.bounds.x,
        y: display.bounds.y,
        width: display.bounds.width,
        height: display.bounds.height,
        frame: false,
        transparent: true,
        alwaysOnTop: true,
        skipTaskbar: true,
        webPreferences: {
          nodeIntegration: true,
          contextIsolation: false,
        },
      });

      overlay.loadFile(path.join(__dirname, "selectionOverlay.html"));
      overlay.webContents.once("did-finish-load", () => {
        overlay.webContents.send("display-info", { 
          index, 
          displayLeft: display.bounds.x, 
          displayTop: display.bounds.y 
        });
      });

      overlays.push(overlay);
    });

    ipcMain.once("region-selected", (_event, payload) => {
      const { displayLeft, displayTop, x, y, width, height } = payload;

      const config: RegionConfig = {
        displayLeft,
        displayTop,
        x,
        y,
        width,
        height,
      };

      saveConfig(config);
      overlays.forEach((w) => w.close());
      resolve(config);
    });
  });
}

// ---------- STEP 2: Capture the saved region and OCR it ----------
export async function extractPhoneNumber(): Promise<string> {
  let config = loadConfig();

  if (!config) {
    config = await promptUserToSelectRegion();
  }

  const displaysAvailable = await screenshot.listDisplays();

  // Match Electron's display bounds to screenshot-desktop's left/top
  const target = displaysAvailable.find(
    (d: any) => Math.abs(d.left - config!.displayLeft) < 50 && Math.abs(d.top - config!.displayTop) < 50
  );

  if (!target) {
    throw new Error("Saved display not found. Try deleting the config and re-selecting the region.");
  }

  const imgBuffer = await screenshot({ screen: target.id, format: "png" });

  const croppedBuffer = await sharp(imgBuffer)
    .extract({
      left: config.x,
      top: config.y,
      width: config.width,
      height: config.height,
    })
    .resize({ width: config.width * 3 })
    .grayscale()
    .normalise()           // Auto-stretches contrast across full range
    .linear(2.0, -50)      // Multiplies brightness by 2.0, subtracts 50 (darkens background)
    .threshold(100)        // Lower threshold since we already boosted contrast
    .toBuffer();

  const worker = await createWorker("eng");
  const { data } = await worker.recognize(croppedBuffer);
  await worker.terminate();

  const digitsOnly = data.text.replace(/[^0-9]/g, "");
  return digitsOnly.slice(0, 10);
}

// ---------- IPC handlers to expose to renderer ----------
export function registerPhoneCaptureHandlers() {
  ipcMain.handle("extract-phone-number", async () => {
    try {
      return await extractPhoneNumber();
    } catch (err) {
      console.error("Phone extraction failed:", err);
      throw err;
    }
  });

  ipcMain.handle("reset-phone-region", async () => {
    deleteConfig();
    return true;
  });
}

export function getConfigStatus(): { exists: boolean; displayLeft?: number; displayTop?: number } {
  const config = loadConfig();
  if (!config) return { exists: false };
  return { exists: true, displayLeft: config.displayLeft, displayTop: config.displayTop };
}

ipcMain.handle("get-phone-config-status", async () => {
  return getConfigStatus();
});