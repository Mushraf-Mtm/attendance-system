const { app, BrowserWindow, session, safeStorage, shell } = require('electron');
const path = require('path');
const crypto = require('crypto');
const fs = require('fs');

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (require('electron-squirrel-startup')) {
  app.quit();
}

const FRONTEND_URL = 'https://attendance-system-rho-five.vercel.app';
const BACKEND_URL = 'https://attendance-system-tnbm.onrender.com';
const APP_VERSION = app.getVersion();

// Identity files
const IDENTITY_FILE = 'device_identity.enc';

let desktopIdentity = null;

// Ensure single instance
const gotTheLock = app.requestSingleInstanceLock();
if (!gotTheLock) {
  app.quit();
}

// Security: Create or Load Ed25519 Identity
function getOrCreateDesktopIdentity() {
  const userDataPath = app.getPath('userData');
  const identityFilePath = path.join(userDataPath, IDENTITY_FILE);

  if (fs.existsSync(identityFilePath)) {
    try {
      desktopIdentity = readDesktopIdentity(identityFilePath);
      if (desktopIdentity && desktopIdentity.publicKey && desktopIdentity.privateKey) {
        return desktopIdentity;
      }
    } catch (e) {
      console.error('Failed to read identity, generating new one...');
    }
  }

  // Generate new identity if not exists or failed to read
  desktopIdentity = createDesktopIdentity();
  saveDesktopIdentity(desktopFilePath = identityFilePath, desktopIdentity);
  return desktopIdentity;
}

function createDesktopIdentity() {
  const { publicKey, privateKey } = crypto.generateKeyPairSync('ed25519', {
    publicKeyEncoding: { type: 'spki', format: 'pem' },
    privateKeyEncoding: { type: 'pkcs8', format: 'pem' }
  });

  const publicKeyHash = crypto.createHash('sha256').update(publicKey).digest('hex');

  return { publicKey, privateKey, publicKeyHash };
}

function saveDesktopIdentity(filePath, identity) {
  if (safeStorage.isEncryptionAvailable()) {
    const dataStr = JSON.stringify(identity);
    const encrypted = safeStorage.encryptString(dataStr);
    fs.writeFileSync(filePath, encrypted);
  } else {
    // Fallback if safeStorage is not available (rare on Windows, but good practice)
    fs.writeFileSync(filePath, Buffer.from(JSON.stringify(identity), 'utf8').toString('base64'));
  }
}

function readDesktopIdentity(filePath) {
  const data = fs.readFileSync(filePath);
  if (safeStorage.isEncryptionAvailable()) {
    try {
      const decrypted = safeStorage.decryptString(data);
      return JSON.parse(decrypted);
    } catch (e) {
      // Might be base64 fallback from previous run
      return JSON.parse(Buffer.from(data.toString(), 'base64').toString('utf8'));
    }
  } else {
    return JSON.parse(Buffer.from(data.toString(), 'base64').toString('utf8'));
  }
}

function signRequest(method, url, timestamp) {
  // Extract path and query from full URL
  let urlPath = url;
  try {
    const parsedUrl = new URL(url);
    urlPath = parsedUrl.pathname + parsedUrl.search;
  } catch (e) {
    // fallback
  }

  const payload = `${timestamp}\n${method.toUpperCase()}\n${urlPath}\n${desktopIdentity.publicKeyHash}`;
  const sign = crypto.createSign('sha256');
  sign.update(payload);
  sign.end();
  return sign.sign(desktopIdentity.privateKey, 'base64');
}

function setupBackendHeaderInjection() {
  const filter = {
    urls: [BACKEND_URL + '/*']
  };

  session.defaultSession.webRequest.onBeforeSendHeaders(filter, (details, callback) => {
    const timestamp = new Date().toISOString();
    
    // Only sign requests going to backend API
    const method = details.method;
    const url = details.url;
    const signature = signRequest(method, url, timestamp);

    const base64PublicKey = Buffer.from(desktopIdentity.publicKey).toString('base64');
    const hostname = require('os').hostname();
    const platform = require('os').platform();

    details.requestHeaders['X-Desktop-App'] = 'true';
    details.requestHeaders['X-Device-Source'] = 'electron-desktop';
    details.requestHeaders['X-Desktop-Public-Key'] = base64PublicKey;
    details.requestHeaders['X-Desktop-Public-Key-Hash'] = desktopIdentity.publicKeyHash;
    details.requestHeaders['X-Desktop-Signature'] = signature;
    details.requestHeaders['X-Desktop-Timestamp'] = timestamp;
    details.requestHeaders['X-Desktop-Hostname'] = hostname;
    details.requestHeaders['X-Desktop-Platform'] = platform;
    details.requestHeaders['X-Electron-App-Version'] = APP_VERSION;

    callback({ requestHeaders: details.requestHeaders });
  });
}

const createWindow = () => {
  const mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    title: "Attendance Desktop App",
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      nodeIntegration: false,
      contextIsolation: true,
      webSecurity: true
    },
  });

  // Secure navigation restrictions
  mainWindow.webContents.on('will-navigate', (event, url) => {
    const parsedUrl = new URL(url);
    if (parsedUrl.origin !== FRONTEND_URL && parsedUrl.origin !== BACKEND_URL) {
      event.preventDefault();
      console.log(`Blocked navigation to ${url}`);
    }
  });

  // External link handling
  mainWindow.webContents.setWindowOpenHandler(({ url }) => {
    shell.openExternal(url);
    return { action: 'deny' };
  });

  // Production DevTools disable
  if (app.isPackaged) {
    mainWindow.webContents.on('devtools-opened', () => {
      mainWindow.webContents.closeDevTools();
    });
  }

  // Disable menu bar
  mainWindow.setMenuBarVisibility(false);

  // Load the React frontend
  mainWindow.loadURL(FRONTEND_URL);
};

app.whenReady().then(() => {
  // Ensure safeStorage is ready
  getOrCreateDesktopIdentity();
  
  // Setup interceptor
  setupBackendHeaderInjection();

  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Second instance check
app.on('second-instance', () => {
  const mainWindow = BrowserWindow.getAllWindows()[0];
  if (mainWindow) {
    if (mainWindow.isMinimized()) mainWindow.restore();
    mainWindow.focus();
  }
});
