const { contextBridge, ipcRenderer } = require('electron');

// Expose protected methods that allow the renderer process to use
// the ipcRenderer without exposing the entire object
contextBridge.exposeInMainWorld('electronAPI', {
    saveAccounts: (encryptedData) => ipcRenderer.invoke('save-accounts', encryptedData),
    loadAccounts: () => ipcRenderer.invoke('load-accounts'),
    saveMasterKey: (encryptedHash) => ipcRenderer.invoke('save-master-key', encryptedHash),
    loadMasterKey: () => ipcRenderer.invoke('load-master-key'),
    fetchRank: (riotId, hashtag, region) => ipcRenderer.invoke('fetch-rank', riotId, hashtag, region),
    saveThemePreference: (theme) => ipcRenderer.invoke('save-theme-preference', theme),
    loadThemePreference: () => ipcRenderer.invoke('load-theme-preference'),
    processExecutableFile: (base64Data, fileName) => ipcRenderer.invoke('process-executable-file', base64Data, fileName)
});

// Expose versions
contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
});