const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    saveAccounts: (encryptedData) => ipcRenderer.invoke('save-accounts', encryptedData),
    loadAccounts: () => ipcRenderer.invoke('load-accounts'),
    saveMasterKey: (encryptedHash) => ipcRenderer.invoke('save-master-key', encryptedHash),
    loadMasterKey: () => ipcRenderer.invoke('load-master-key'),
    fetchRank: (riotId, hashtag, region) => ipcRenderer.invoke('fetch-rank', riotId, hashtag, region),
    
    // Auto-updater APIs
    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    
    // Listen for update status messages
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback),
    removeUpdateStatusListener: (callback) => ipcRenderer.removeListener('update-status', callback),
});

// Expose versions
contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
});