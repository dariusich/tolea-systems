const { app, BrowserWindow } = require("electron");
const path = require("node:path");
const { spawn } = require("node:child_process");

let backendProcess = null;
const backendPort = process.env.TRADEJOURNAL_PORT || "8000";
const backendUrl = `http://127.0.0.1:${backendPort}`;

function projectRoot() {
  return app.isPackaged ? process.resourcesPath : path.resolve(__dirname, "..");
}

function backendExecutable() {
  if (!app.isPackaged) return null;
  return path.join(process.resourcesPath, "backend", "tradejournal-backend.exe");
}

function spawnBackend() {
  const root = projectRoot();
  const dbPath = app.isPackaged
    ? path.join(app.getPath("userData"), "trades.sqlite")
    : path.join(root, "db", "trades.sqlite");
  const env = {
    ...process.env,
    TRADEJOURNAL_HOST: "127.0.0.1",
    TRADEJOURNAL_PORT: backendPort,
    TRADEJOURNAL_DB_PATH: dbPath,
    TRADEJOURNAL_ENABLE_LOCAL_COLLECTOR: process.env.TRADEJOURNAL_ENABLE_LOCAL_COLLECTOR || "1"
  };

  const exe = backendExecutable();
  if (exe) {
    backendProcess = spawn(exe, [], { cwd: root, env, windowsHide: true });
  } else {
    const launcher = process.env.PYTHON || "python";
    backendProcess = spawn(launcher, ["-m", "backend.main"], { cwd: root, env, windowsHide: true });
  }

  backendProcess.stdout?.on("data", (data) => console.log(`[backend] ${data}`));
  backendProcess.stderr?.on("data", (data) => console.error(`[backend] ${data}`));
  backendProcess.on("exit", (code) => {
    if (code !== null && code !== 0) console.error(`Backend exited with code ${code}`);
  });
}

async function waitForBackend(timeoutMs = 25000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(`${backendUrl}/health`);
      if (response.ok) return;
    } catch {
      // Retry until the backend is ready.
    }
    await new Promise((resolve) => setTimeout(resolve, 500));
  }
  throw new Error("Backend did not start in time.");
}

async function ensureBackend() {
  try {
    await waitForBackend(1000);
  } catch {
    spawnBackend();
    await waitForBackend();
  }
}

async function createWindow() {
  await ensureBackend();

  const win = new BrowserWindow({
    width: 1440,
    height: 950,
    minWidth: 1100,
    minHeight: 720,
    backgroundColor: "#f6f2ea",
    title: "TradeJournal Pro",
    webPreferences: {
      contextIsolation: true,
      nodeIntegration: false
    }
  });

  if (!app.isPackaged) {
    await win.loadURL(process.env.ELECTRON_RENDERER_URL || "http://127.0.0.1:5173");
  } else {
    await win.loadFile(path.join(process.resourcesPath, "frontend", "dist", "index.html"));
  }
}

app.whenReady().then(createWindow);

app.on("window-all-closed", () => {
  if (process.platform !== "darwin") app.quit();
});

app.on("before-quit", () => {
  if (backendProcess && !backendProcess.killed) {
    backendProcess.kill();
  }
});
