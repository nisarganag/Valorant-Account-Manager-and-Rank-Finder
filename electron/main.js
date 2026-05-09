import { app, BrowserWindow, ipcMain, dialog, Tray, Menu, nativeImage } from 'electron';
import pkg from 'electron-updater';
const { autoUpdater } = pkg;
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

autoUpdater.checkForUpdatesAndNotify();
autoUpdater.autoDownload = false;

let mainWindow;
let tray;

autoUpdater.on('checking-for-update', () => {
    console.log('Checking for update...');
    sendStatusToWindow('Checking for updates...');
});

autoUpdater.on('update-available', (info) => {
    console.log('Update available:', info);
    sendStatusToWindow('Update available!');
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Available',
        message: `A new version (${info.version}) is available. Would you like to download it now?`,
        detail: 'The update will be downloaded in the background and you will be notified when it\'s ready to install.',
        buttons: ['Download Now', 'Later'],
        defaultId: 0
    }).then((result) => {
        if (result.response === 0) {
            autoUpdater.downloadUpdate();
            sendStatusToWindow('Downloading update...');
        }
    });
});

autoUpdater.on('update-not-available', (info) => {
    console.log('Update not available:', info);
    sendStatusToWindow('App is up to date.');
});

autoUpdater.on('error', (err) => {
    console.error('Auto-updater error:', err);
    sendStatusToWindow('Error in auto-updater: ' + err);
});

autoUpdater.on('download-progress', (progressObj) => {
    let log_message = "Download speed: " + progressObj.bytesPerSecond;
    log_message = log_message + ' - Downloaded ' + progressObj.percent + '%';
    log_message = log_message + ' (' + progressObj.transferred + "/" + progressObj.total + ')';
    console.log(log_message);
    sendStatusToWindow(`Downloading: ${Math.round(progressObj.percent)}%`);
});

autoUpdater.on('update-downloaded', (info) => {
    console.log('Update downloaded:', info);
    sendStatusToWindow('Update downloaded');
    dialog.showMessageBox(mainWindow, {
        type: 'info',
        title: 'Update Ready',
        message: 'Update downloaded successfully. The application will restart to apply the update.',
        detail: 'Click "Restart Now" to install the update, or "Later" to install it the next time you restart the app.',
        buttons: ['Restart Now', 'Later'],
        defaultId: 0
    }).then((result) => {
        if (result.response === 0) {
            autoUpdater.quitAndInstall();
        }
    });
});

function sendStatusToWindow(text) {
    if (mainWindow) {
        mainWindow.webContents.send('update-status', text);
    }
}

function createTray() {
    const iconPath = isDev
        ? path.join(__dirname, '../public/icons/Valorant_Account_Manager.png')
        : path.join(process.resourcesPath, 'app.asar/dist/icons/Valorant_Account_Manager.png');

    try {
        const icon = nativeImage.createFromPath(iconPath);
        tray = new Tray(icon.resize({ width: 16, height: 16 }));

        const contextMenu = Menu.buildFromTemplate([
            { label: 'Show App', click: () => { mainWindow?.show(); mainWindow?.focus(); } },
            { type: 'separator' },
            { label: 'Quit', click: () => { app.isQuitting = true; app.quit(); } }
        ]);

        tray.setToolTip('Valorant Account Manager');
        tray.setContextMenu(contextMenu);
        tray.on('double-click', () => { mainWindow?.show(); mainWindow?.focus(); });
    } catch (e) {
        console.error('Failed to create tray:', e);
    }
}

function createWindow() {
    const iconPath = isDev
        ? path.join(__dirname, '../public/icons/Valorant_Account_Manager.png')
        : path.join(process.resourcesPath, 'app.asar/dist/icons/Valorant_Account_Manager.png');

    mainWindow = new BrowserWindow({
        width: 1556,
        height: 982,
        webPreferences: {
            nodeIntegration: false,
            contextIsolation: true,
            enableRemoteModule: false,
            preload: path.join(__dirname, 'preload.js')
        },
        icon: iconPath,
        titleBarStyle: 'default',
        show: false
    });

    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
        mainWindow.loadFile(indexPath).catch(err => {
            console.error('Failed to load file:', err);
        });
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
        if (!isDev) {
            setTimeout(() => {
                autoUpdater.checkForUpdatesAndNotify();
            }, 3000);
        }
    });

    // Minimize to tray instead of closing
    mainWindow.on('close', (event) => {
        if (!app.isQuitting && tray) {
            event.preventDefault();
            mainWindow.hide();
        }
    });

    return mainWindow;
}

app.whenReady().then(() => {
    createTray();
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        } else {
            mainWindow?.show();
        }
    });
});

app.on('before-quit', () => {
    app.isQuitting = true;
});

app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// ---- IPC Handlers ----

function getFilePath(filename) {
    return path.join(os.homedir(), filename);
}

ipcMain.handle('save-accounts', async (event, encryptedData) => {
    try {
        await fs.promises.writeFile(getFilePath('accounts.json'), encryptedData, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-accounts', async () => {
    try {
        const data = await fs.promises.readFile(getFilePath('accounts.json'), 'utf8');
        return { success: true, data };
    } catch (error) {
        if (error.code === 'ENOENT') return { success: true, data: null };
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-master-key', async (event, encryptedHash) => {
    try {
        await fs.promises.writeFile(getFilePath('valorant-master.key'), encryptedHash, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-master-key', async () => {
    try {
        const data = await fs.promises.readFile(getFilePath('valorant-master.key'), 'utf8');
        return { success: true, data };
    } catch (error) {
        if (error.code === 'ENOENT') return { success: true, data: null };
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-settings', async (event, encryptedData) => {
    try {
        await fs.promises.writeFile(getFilePath('valorant-settings.json'), encryptedData, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-settings', async () => {
    try {
        const data = await fs.promises.readFile(getFilePath('valorant-settings.json'), 'utf8');
        return { success: true, data };
    } catch (error) {
        if (error.code === 'ENOENT') return { success: true, data: null };
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-rank-history', async (event, encryptedData) => {
    try {
        await fs.promises.writeFile(getFilePath('valorant-rank-history.json'), encryptedData, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-rank-history', async () => {
    try {
        const data = await fs.promises.readFile(getFilePath('valorant-rank-history.json'), 'utf8');
        return { success: true, data };
    } catch (error) {
        if (error.code === 'ENOENT') return { success: true, data: null };
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-api-key', async (event, encryptedData) => {
    try {
        await fs.promises.writeFile(getFilePath('valorant-apikey.json'), encryptedData, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-api-key', async () => {
    try {
        const data = await fs.promises.readFile(getFilePath('valorant-apikey.json'), 'utf8');
        return { success: true, data };
    } catch (error) {
        if (error.code === 'ENOENT') return { success: true, data: null };
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-encryption-salt', async (event, salt) => {
    try {
        await fs.promises.writeFile(getFilePath('valorant-salt.key'), salt, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-encryption-salt', async () => {
    try {
        const data = await fs.promises.readFile(getFilePath('valorant-salt.key'), 'utf8');
        return { success: true, data };
    } catch (error) {
        if (error.code === 'ENOENT') return { success: true, data: null };
        return { success: false, error: error.message };
    }
});

// Rank fetching - HenrikDev if API key provided, else legacy API
ipcMain.handle('fetch-rank', async (event, region, riotId, hashtag, apiKey) => {
    try {
        if (apiKey) {
            const url = `https://api.henrikdev.xyz/valorant/v2/mmr/${region}/${riotId}/${hashtag}`;
            const response = await fetch(url, {
                headers: { 'User-Agent': 'ValorantAccountManager/1.0', 'Authorization': apiKey },
            });
            if (!response.ok) {
                return { success: false, error: `HTTP ${response.status}` };
            }
            const data = await response.json();
            return { success: true, data };
        }

        // Legacy fallback
        const url = `https://vaccie.pythonanywhere.com/mmr/${riotId}/${hashtag}/${region}`;
        const response = await fetch(url, {
            headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' },
        });
        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }
        const data = await response.text();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('fetch-rank-history', async (event, region, riotId, hashtag, apiKey) => {
    try {
        const url = `https://api.henrikdev.xyz/valorant/v1/mmr-history/${region}/${riotId}/${hashtag}`;
        const headers = { 'User-Agent': 'ValorantAccountManager/1.0' };
        if (apiKey) headers['Authorization'] = apiKey;

        const response = await fetch(url, { headers });
        if (!response.ok) {
            return { success: false, error: `HTTP ${response.status}` };
        }
        const data = await response.json();
        return { success: true, data };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
    });
});

// Auto-updater IPC
ipcMain.handle('check-for-updates', async () => {
    try {
        if (isDev) return { success: false, error: 'Updates not available in development mode' };
        const result = await autoUpdater.checkForUpdates();
        return { success: true, data: result };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('download-update', async () => {
    try {
        if (isDev) return { success: false, error: 'Updates not available in development mode' };
        await autoUpdater.downloadUpdate();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('install-update', async () => {
    try {
        if (isDev) return { success: false, error: 'Updates not available in development mode' };
        autoUpdater.quitAndInstall();
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('get-app-version', async () => {
    return { success: true, version: app.getVersion() };
});
