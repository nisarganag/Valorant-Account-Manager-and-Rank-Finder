export interface ElectronAPI {
  saveAccounts: (encryptedData: string) => Promise<{ success: boolean; error?: string }>;
  loadAccounts: () => Promise<{ success: boolean; data?: string | null; error?: string }>;
  saveMasterKey: (encryptedHash: string) => Promise<{ success: boolean; error?: string }>;
  loadMasterKey: () => Promise<{ success: boolean; data?: string | null; error?: string }>;
  fetchRank: (region: string, username: string, tag: string) => Promise<{ success: boolean; data?: any; error?: string }>;
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