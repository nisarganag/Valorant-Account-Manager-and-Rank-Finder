import { app, BrowserWindow, ipcMain, dialog } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import axios from 'axios';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const isDev = process.env.NODE_ENV === 'development';

function createWindow() {
    // Set icon path based on environment
    const iconPath = isDev 
        ? path.join(__dirname, '../public/icons/Valorant_Account_Manager.png')
        : path.join(process.resourcesPath, 'app.asar/dist/icons/Valorant_Account_Manager.png');
    
    const mainWindow = new BrowserWindow({
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

    // Load the React app
    if (isDev) {
        mainWindow.loadURL('http://localhost:5173');
        mainWindow.webContents.openDevTools();
    } else {
        // In production, the app structure is: app.asar/electron/main.js and app.asar/dist/index.html
        const indexPath = path.join(app.getAppPath(), 'dist', 'index.html');
        mainWindow.loadFile(indexPath).catch(err => {
            console.error('Failed to load file:', err);
        });
    }

    mainWindow.once('ready-to-show', () => {
        mainWindow.show();
    });

    // Handle window closed
    mainWindow.on('closed', () => {
        app.quit();
    });

    return mainWindow;
}

// This method will be called when Electron has finished initialization
app.whenReady().then(() => {
    createWindow();

    app.on('activate', () => {
        if (BrowserWindow.getAllWindows().length === 0) {
            createWindow();
        }
    });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
        app.quit();
    }
});

// IPC handlers for secure file operations
ipcMain.handle('save-accounts', async (event, encryptedData) => {
    try {
        const accountsPath = path.join(os.homedir(), 'accounts.json');
        await fs.promises.writeFile(accountsPath, encryptedData, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-accounts', async () => {
    try {
        const accountsPath = path.join(os.homedir(), 'accounts.json');
        const data = await fs.promises.readFile(accountsPath, 'utf8');
        return { success: true, data };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { success: true, data: null };
        }
        return { success: false, error: error.message };
    }
});

ipcMain.handle('save-master-key', async (event, encryptedHash) => {
    try {
        const masterKeyPath = path.join(os.homedir(), 'valorant-master.key');
        await fs.promises.writeFile(masterKeyPath, encryptedHash, 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-master-key', async () => {
    try {
        const masterKeyPath = path.join(os.homedir(), 'valorant-master.key');
        const data = await fs.promises.readFile(masterKeyPath, 'utf8');
        return { success: true, data };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { success: true, data: null };
        }
        return { success: false, error: error.message };
    }
});

// Handle app updates and security
app.on('web-contents-created', (event, contents) => {
    contents.on('new-window', (event, navigationUrl) => {
        event.preventDefault();
    });
});

// IPC handler to fetch rank from external API
ipcMain.handle('fetch-rank', async (event, riotId, hashtag, region) => {
    try {
        const url = `https://vaccie.pythonanywhere.com/mmr/${riotId}/${hashtag}/${region}`;
        console.log('Fetching rank from Electron:', url);
        const response = await axios.get(url, {
            headers: {
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/108.0.0.0 Safari/537.36'
            },
            timeout: 30000
        });
        return { success: true, data: response.data };
    } catch (error) {
        console.error('Failed to fetch rank:', error.message);
        return { success: false, error: error.message };
    }
});