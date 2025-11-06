export interface ElectronAPI {
  saveAccounts: (encryptedData: string) => Promise<{ success: boolean; error?: string }>;
  loadAccounts: () => Promise<{ success: boolean; data?: string | null; error?: string }>;
  saveMasterKey: (encryptedHash: string) => Promise<{ success: boolean; error?: string }>;
  loadMasterKey: () => Promise<{ success: boolean; data?: string | null; error?: string }>;
  fetchRank: (region: string, username: string, tag: string) => Promise<{ success: boolean; data?: { current_rank?: string } | string; error?: string }>;
  saveThemePreference: (theme: 'dark' | 'light') => Promise<{ success: boolean; error?: string }>;
  loadThemePreference: () => Promise<{ success: boolean; data?: string | null; error?: string }>;
  processExecutableFile: (base64Data: string, fileName?: string) => Promise<{ 
    success: boolean; 
    accounts?: Array<{
      riotId: string;
      hashtag: string;
      username: string;
      password: string;
      region: string;
      hasSkins: boolean;
      currentRank: string;
    }>; 
    error?: string;
    message?: string;
  }>;
  
  // Auto-updater methods
  checkForUpdates: () => Promise<{ success: boolean; data?: any; error?: string }>;
  downloadUpdate: () => Promise<{ success: boolean; error?: string }>;
  installUpdate: () => Promise<{ success: boolean; error?: string }>;
  getAppVersion: () => Promise<{ success: boolean; version?: string; error?: string }>;
  onUpdateStatus: (callback: (event: any, status: string) => void) => void;
  removeUpdateStatusListener: (callback: (event: any, status: string) => void) => void;
}

export interface Versions {
  node: () => string;
  chrome: () => string;
  electron: () => string;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
    versions: Versions;
  }
}