const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('electronAPI', {
    saveAccounts: (encryptedData) => ipcRenderer.invoke('save-accounts', encryptedData),
    loadAccounts: () => ipcRenderer.invoke('load-accounts'),
    saveMasterKey: (encryptedHash) => ipcRenderer.invoke('save-master-key', encryptedHash),
    loadMasterKey: () => ipcRenderer.invoke('load-master-key'),
    fetchRank: (riotId, hashtag, region, apiKey) => ipcRenderer.invoke('fetch-rank', riotId, hashtag, region, apiKey),
    fetchRankHistory: (riotId, hashtag, region, apiKey) => ipcRenderer.invoke('fetch-rank-history', riotId, hashtag, region, apiKey),
    saveSettings: (encryptedData) => ipcRenderer.invoke('save-settings', encryptedData),
    loadSettings: () => ipcRenderer.invoke('load-settings'),
    saveRankHistory: (encryptedData) => ipcRenderer.invoke('save-rank-history', encryptedData),
    loadRankHistory: () => ipcRenderer.invoke('load-rank-history'),
    saveApiKey: (encryptedData) => ipcRenderer.invoke('save-api-key', encryptedData),
    loadApiKey: () => ipcRenderer.invoke('load-api-key'),
    saveEncryptionSalt: (salt) => ipcRenderer.invoke('save-encryption-salt', salt),
    loadEncryptionSalt: () => ipcRenderer.invoke('load-encryption-salt'),

    checkForUpdates: () => ipcRenderer.invoke('check-for-updates'),
    downloadUpdate: () => ipcRenderer.invoke('download-update'),
    installUpdate: () => ipcRenderer.invoke('install-update'),
    getAppVersion: () => ipcRenderer.invoke('get-app-version'),
    onUpdateStatus: (callback) => ipcRenderer.on('update-status', callback),
    removeUpdateStatusListener: (callback) => ipcRenderer.removeListener('update-status', callback),
});

contextBridge.exposeInMainWorld('versions', {
    node: () => process.versions.node,
    chrome: () => process.versions.chrome,
    electron: () => process.versions.electron,
});
