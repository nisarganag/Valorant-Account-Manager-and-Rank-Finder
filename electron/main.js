import { app, BrowserWindow, ipcMain } from 'electron';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import os from 'os';
import axios from 'axios';
import XLSX from 'xlsx';
import mammoth from 'mammoth';

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
app.on('web-contents-created', (_event, contents) => {
    contents.on('new-window', (event, _navigationUrl) => {
        event.preventDefault();
    });
});

// IPC handler to fetch rank from external API
ipcMain.handle('fetch-rank', async (event, riotId, hashtag, region) => {
    try {
        // Remove spaces from riot ID for URL construction
        const cleanRiotId = riotId.replace(/\s+/g, '');
        const url = `https://vaccie.pythonanywhere.com/mmr/${cleanRiotId}/${hashtag}/${region}`;
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

// IPC handler for theme preferences
ipcMain.handle('save-theme-preference', async (event, theme) => {
    try {
        const themePath = path.join(os.homedir(), 'valorant-theme.json');
        await fs.promises.writeFile(themePath, JSON.stringify({ theme }), 'utf8');
        return { success: true };
    } catch (error) {
        return { success: false, error: error.message };
    }
});

ipcMain.handle('load-theme-preference', async () => {
    try {
        const themePath = path.join(os.homedir(), 'valorant-theme.json');
        const data = await fs.promises.readFile(themePath, 'utf8');
        const themeData = JSON.parse(data);
        return { success: true, data: themeData.theme };
    } catch (error) {
        if (error.code === 'ENOENT') {
            return { success: true, data: null };
        }
        return { success: false, error: error.message };
    }
});

// IPC handler for processing files with account data
ipcMain.handle('process-executable-file', async (event, base64Data, fileName = '') => {
    try {
        // Convert base64 back to buffer
        const fileBuffer = Buffer.from(base64Data, 'base64');
        
        // Determine file type from extension
        const fileExtension = fileName.toLowerCase().substring(fileName.lastIndexOf('.'));
        
        let fileContent = '';
        let accounts = [];
        
        // Handle different file types
        switch (fileExtension) {
            case '.json':
                try {
                    fileContent = fileBuffer.toString('utf8');
                    const jsonData = JSON.parse(fileContent);
                    accounts = parseJsonAccounts(jsonData);
                } catch {
                    return { success: false, error: 'Invalid JSON format' };
                }
                break;
                
            case '.csv':
                try {
                    fileContent = fileBuffer.toString('utf8');
                    accounts = parseCsvAccounts(fileContent);
                } catch {
                    return { success: false, error: 'Invalid CSV format' };
                }
                break;
                
            case '.txt':
                fileContent = fileBuffer.toString('utf8');
                accounts = parseTextAccounts(fileContent);
                break;
                
            case '.xml':
                try {
                    fileContent = fileBuffer.toString('utf8');
                    accounts = parseXmlAccounts(fileContent);
                } catch {
                    return { success: false, error: 'Invalid XML format' };
                }
                break;
                
            case '.xlsx':
            case '.xls':
                try {
                    accounts = await parseExcelAccounts(fileBuffer);
                } catch (error) {
                    return { success: false, error: 'Invalid Excel format: ' + error.message };
                }
                break;
                
            case '.docx':
            case '.doc':
                try {
                    accounts = await parseWordAccounts(fileBuffer);
                } catch (error) {
                    return { success: false, error: 'Invalid Word format: ' + error.message };
                }
                break;
                
            case '.exe':
            default:
                // Basic text extraction for executables and unknown formats
                fileContent = fileBuffer.toString('utf8', 0, Math.min(fileBuffer.length, 1024 * 1024));
                accounts = parseTextAccounts(fileContent);
                break;
        }
        
        // Remove duplicates based on riotId
        const uniqueAccounts = accounts.filter((account, index, self) => 
            index === self.findIndex(acc => acc.riotId === account.riotId)
        );
        
        if (uniqueAccounts.length === 0) {
            return { 
                success: false, 
                error: `No account data found in the ${fileExtension} file. Please ensure the file contains valid account information.` 
            };
        }
        
        return { 
            success: true, 
            accounts: uniqueAccounts,
            message: `Found ${uniqueAccounts.length} accounts in ${fileExtension} file` 
        };
        
    } catch (error) {
        console.error('Error processing file:', error);
        return { 
            success: false, 
            error: `Failed to process file: ${error.message}` 
        };
    }
});

// Helper function to parse JSON accounts
function parseJsonAccounts(jsonData) {
    const accounts = [];
    
    // Handle array of accounts
    if (Array.isArray(jsonData)) {
        jsonData.forEach(item => {
            const account = extractAccountFromObject(item);
            if (account) accounts.push(account);
        });
    }
    // Handle single account object
    else if (typeof jsonData === 'object' && jsonData !== null) {
        // Check if it's a wrapper object with accounts array
        if (jsonData.accounts && Array.isArray(jsonData.accounts)) {
            jsonData.accounts.forEach(item => {
                const account = extractAccountFromObject(item);
                if (account) accounts.push(account);
            });
        } else {
            const account = extractAccountFromObject(jsonData);
            if (account) accounts.push(account);
        }
    }
    
    return accounts;
}

// Helper function to parse CSV accounts
function parseCsvAccounts(csvContent) {
    const accounts = [];
    const lines = csvContent.split('\n').filter(line => line.trim());
    
    if (lines.length < 2) return accounts; // Need at least header and one data row
    
    const headers = lines[0].split(',').map(h => h.trim().toLowerCase());
    
    for (let i = 1; i < lines.length; i++) {
        const values = lines[i].split(',').map(v => v.trim());
        const accountData = {};
        
        headers.forEach((header, index) => {
            if (values[index]) {
                accountData[header] = values[index];
            }
        });
        
        const account = extractAccountFromObject(accountData);
        if (account) accounts.push(account);
    }
    
    return accounts;
}

// Helper function to parse text accounts (for .txt and .exe files)
function parseTextAccounts(textContent) {
    const accounts = [];
    
    // Pattern 1: Look for Riot ID patterns (username#tag)
    const riotIdPattern = /([a-zA-Z0-9_-]+)#([a-zA-Z0-9]+)/g;
    let riotIdMatch;
    while ((riotIdMatch = riotIdPattern.exec(textContent)) !== null) {
        accounts.push({
            riotId: riotIdMatch[1],
            hashtag: riotIdMatch[2],
            username: riotIdMatch[1],
            password: '',
            region: 'na',
            hasSkins: false,
            currentRank: 'Unranked'
        });
    }
    
    // Pattern 2: Look for email patterns
    const emailPattern = /([a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
    let emailMatch;
    while ((emailMatch = emailPattern.exec(textContent)) !== null) {
        const email = emailMatch[1];
        const username = email.split('@')[0];
        
        if (!accounts.some(acc => acc.username === username)) {
            accounts.push({
                riotId: username,
                hashtag: '0000',
                username: email,
                password: '',
                region: 'na',
                hasSkins: false,
                currentRank: 'Unranked'
            });
        }
    }
    
    return accounts;
}

// Helper function to parse XML accounts
function parseXmlAccounts(xmlContent) {
    const accounts = [];
    
    // Simple XML parsing for common patterns
    const accountPattern = /<account[^>]*>([\s\S]*?)<\/account>/gi;
    const userPattern = /<user[^>]*>([\s\S]*?)<\/user>/gi;
    
    let match;
    
    // Try to find account elements
    while ((match = accountPattern.exec(xmlContent)) !== null) {
        const accountXml = match[1];
        const account = extractAccountFromXml(accountXml);
        if (account) accounts.push(account);
    }
    
    // Try to find user elements if no accounts found
    if (accounts.length === 0) {
        while ((match = userPattern.exec(xmlContent)) !== null) {
            const userXml = match[1];
            const account = extractAccountFromXml(userXml);
            if (account) accounts.push(account);
        }
    }
    
    return accounts;
}

// Helper function to extract account from XML content
function extractAccountFromXml(xmlContent) {
    const getValue = (tag) => {
        const regex = new RegExp(`<${tag}[^>]*>([^<]*)</${tag}>`, 'i');
        const match = xmlContent.match(regex);
        return match ? match[1].trim() : '';
    };
    
    const riotId = getValue('riotid') || getValue('username') || getValue('name');
    const hashtag = getValue('hashtag') || getValue('tag') || '0000';
    
    if (riotId) {
        return {
            riotId,
            hashtag,
            username: getValue('username') || getValue('email') || riotId,
            password: '', // Don't extract passwords for security
            region: getValue('region') || 'na',
            hasSkins: getValue('hasskins') === 'true' || getValue('skins') === 'true',
            currentRank: getValue('rank') || getValue('currentrank') || 'Unranked'
        };
    }
    
    return null;
}

// Helper function to extract account from object
function extractAccountFromObject(obj) {
    if (!obj || typeof obj !== 'object') return null;
    
    // Normalize property names to lowercase for easier matching
    const normalized = {};
    Object.keys(obj).forEach(key => {
        normalized[key.toLowerCase()] = obj[key];
    });
    
    let riotId = normalized.riotid || normalized.username || normalized.name || normalized.email?.split('@')[0];
    let hashtag = normalized.hashtag || normalized.tag || '0000';
    
    // Check if riotId contains # (combined format like "PlayerName#1234")
    if (riotId && riotId.includes('#')) {
        const parts = riotId.split('#');
        riotId = parts[0].trim();
        hashtag = parts[1] ? parts[1].trim() : '0000';
    }
    
    // Ensure hashtag is not empty
    if (!hashtag || hashtag === '') {
        hashtag = '0000';
    }
    
    if (riotId) {
        // Check for Y/N format in skins fields
        let hasSkins = false;
        const skinsValue = normalized.hasskins || normalized.skins;
        if (skinsValue) {
            const skinsStr = String(skinsValue).toUpperCase();
            hasSkins = skinsStr === 'Y' || skinsStr === 'YES' || skinsStr === 'TRUE' || skinsValue === true;
        }
        
        return {
            riotId,
            hashtag,
            username: normalized.username || normalized.email || riotId,
            password: '', // Don't extract passwords for security
            region: normalized.region || 'ap',
            hasSkins: hasSkins,
            currentRank: normalized.rank || normalized.currentrank || 'Unranked'
        };
    }
    
    return null;
}

// Parse Excel files (.xlsx, .xls)
async function parseExcelAccounts(fileBuffer) {
    try {
        console.log('Parsing Excel file...');
        const workbook = XLSX.read(fileBuffer, { type: 'buffer' });
        const accounts = [];
        
        // Process all worksheets
        workbook.SheetNames.forEach(sheetName => {
            const worksheet = workbook.Sheets[sheetName];
            const jsonData = XLSX.utils.sheet_to_json(worksheet, { header: 1 });
            
            if (jsonData.length < 2) return; // Need at least header and one data row
            
            const headers = jsonData[0].map(h => String(h).toLowerCase());
            const usernameCol = headers.findIndex(h => h.includes('username') || h.includes('user'));
            const riotIdCol = headers.findIndex(h => h.includes('gameid') || h.includes('riotid') || h.includes('riot id') || h.includes('game id'));
            const hashtagCol = headers.findIndex(h => h.includes('hashtag') || h.includes('tag') || h.includes('#'));
            const passwordCol = headers.findIndex(h => h.includes('password') || h.includes('pass') || h.includes('pwd'));
            const regionCol = headers.findIndex(h => h.includes('region') || h.includes('server'));
            const rankCol = headers.findIndex(h => h.includes('rank') || h.includes('tier'));
            const skinsCol = headers.findIndex(h => h.includes('skin') || h.includes('cosmetic'));
            
            // Process data rows
            for (let i = 1; i < jsonData.length; i++) {
                const row = jsonData[i];
                if (!row || row.length === 0) continue;
                
                // Get username and riot ID from separate columns
                const username = usernameCol >= 0 ? String(row[usernameCol] || '').trim() : '';
                let riotId = riotIdCol >= 0 ? String(row[riotIdCol] || '').trim() : '';
                let hashtag = '0000';
                
                // If riot ID is not found in separate column, check if it's combined with username
                if (!riotId && username) {
                    if (username.includes('#')) {
                        // Parse combined format like "PlayerName#1234"
                        const parts = username.split('#');
                        riotId = parts[0].trim();
                        hashtag = parts[1] ? parts[1].trim() : '0000';
                    } else {
                        // Use username as riot ID if no separate riot ID column
                        riotId = username;
                    }
                } else if (riotId) {
                    // If riot ID is in separate column, check if it contains hashtag
                    if (riotId.includes('#')) {
                        const parts = riotId.split('#');
                        riotId = parts[0].trim();
                        hashtag = parts[1] ? parts[1].trim() : '0000';
                    }
                }
                
                // If hashtag is in a separate column, use that (overrides any parsed hashtag)
                if (hashtagCol >= 0) {
                    hashtag = String(row[hashtagCol] || '0000').replace('#', '').trim();
                }
                
                // Skip if no riot ID found
                if (!riotId) continue;
                
                // Ensure hashtag is not empty
                if (!hashtag || hashtag === '') {
                    hashtag = '0000';
                }
                
                const account = {
                    riotId: riotId,
                    hashtag: hashtag,
                    username: username || riotId, // Use username if available, otherwise fall back to riotId
                    password: passwordCol >= 0 ? String(row[passwordCol] || '').trim() : '', // Extract password if available
                    region: regionCol >= 0 ? String(row[regionCol] || 'ap').toLowerCase() : 'ap', // Default to 'ap' region
                    hasSkins: skinsCol >= 0 ? String(row[skinsCol] || 'N').toUpperCase() === 'Y' : false, // Handle Y/N format
                    currentRank: rankCol >= 0 ? String(row[rankCol] || 'Unranked') : 'Unranked'
                };
                
                accounts.push(account);
            }
        });
        
        console.log(`Excel parsing complete. Found ${accounts.length} accounts:`, accounts);
        return accounts;
    } catch (error) {
        throw new Error('Failed to parse Excel file: ' + error.message);
    }
}

// Parse Word documents (.docx, .doc)
async function parseWordAccounts(fileBuffer) {
    try {
        // Extract text from Word document
        const result = await mammoth.extractRawText({ buffer: fileBuffer });
        const text = result.value;
        
        if (!text || text.trim().length === 0) {
            throw new Error('No text content found in Word document');
        }
        
        const accounts = [];
        const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
        
        // Try to parse as structured data (table-like format)
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            
            // Skip headers or empty lines
            if (line.toLowerCase().includes('username') || 
                line.toLowerCase().includes('account') || 
                line.toLowerCase().includes('riotid') ||
                line.length < 3) {
                continue;
            }
            
            // Try different delimiters: tab, comma, pipe, space
            const delimiters = ['\t', ',', '|', ' '];
            let parts = [];
            
            for (const delimiter of delimiters) {
                const testParts = line.split(delimiter).map(p => p.trim()).filter(p => p.length > 0);
                if (testParts.length >= 2) {
                    parts = testParts;
                    break;
                }
            }
            
            // If no clear delimiter, try to extract username patterns
            if (parts.length < 2) {
                // Look for email-like patterns or username#tag patterns
                const emailPattern = /([a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,})/g;
                const usernameTagPattern = /([a-zA-Z0-9._-]+)#([a-zA-Z0-9]{3,5})/g;
                
                let match;
                if ((match = usernameTagPattern.exec(line)) !== null) {
                    const account = {
                        riotId: match[1],
                        hashtag: match[2],
                        username: match[1],
                        password: '',
                        region: 'na',
                        hasSkins: false,
                        currentRank: 'Unranked'
                    };
                    accounts.push(account);
                    continue;
                } else if ((match = emailPattern.exec(line)) !== null) {
                    const username = match[1].split('@')[0];
                    const account = {
                        riotId: username,
                        hashtag: '0000',
                        username: match[1],
                        password: '',
                        region: 'na',
                        hasSkins: false,
                        currentRank: 'Unranked'
                    };
                    accounts.push(account);
                    continue;
                }
            }
            
            // Parse structured data
            if (parts.length >= 1) {
                let riotId = parts[0];
                let hashtag = '0000';
                
                // Check if the first part contains # (combined format like "PlayerName#1234")
                if (parts[0].includes('#')) {
                    const combinedParts = parts[0].split('#');
                    riotId = combinedParts[0].trim();
                    hashtag = combinedParts[1] ? combinedParts[1].trim() : '0000';
                } else if (parts.length >= 2) {
                    // Separate columns for username and hashtag
                    hashtag = parts[1].replace('#', '').trim() || '0000';
                }
                
                const account = {
                    riotId: riotId,
                    hashtag: hashtag,
                    username: riotId,
                    password: '',
                    region: parts.length >= 3 ? parts[2].toLowerCase() : 'na',
                    hasSkins: parts.length >= 4 ? (parts[3].toLowerCase().includes('true') || parts[3].toLowerCase().includes('yes')) : false,
                    currentRank: parts.length >= 5 ? parts[4] : 'Unranked'
                };
                
                accounts.push(account);
            }
        }
        
        return accounts;
    } catch (error) {
        throw new Error('Failed to parse Word document: ' + error.message);
    }
}