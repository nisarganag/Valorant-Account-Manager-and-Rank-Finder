import { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/useTheme';
import { MasterPasswordDialog } from './components/MasterPasswordDialog';
import { AccountForm } from './components/AccountForm';
import { AccountTable } from './components/AccountTable';
import { AccountGrid } from './components/AccountGrid';
import { AccountStatistics } from './components/AccountStatistics';
import { SearchBar } from './components/SearchBar';
import { ThemeToggle } from './components/ThemeToggle';
import { ViewToggle } from './components/ViewToggle';
import { FileUpload } from './components/FileUpload';
import { UpdateManager } from './components';
import { BulkActionBar } from './components/BulkActionBar';
import { KeyboardShortcutsHelp } from './components/KeyboardShortcutsHelp';
import { RankHistoryPanel } from './components/RankHistoryPanel';
import { TagManager } from './components/TagManager';
import { EncryptionService } from './utils/encryption';
import { RankService } from './services/rankService';
import type { Account, RankInfo, RankHistoryEntry, AppSettings } from './types';
import './App.css';

const GlobalStyle = createGlobalStyle`
  body {
    background-color: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
    transition: background-color 0.3s cubic-bezier(0.4, 0, 0.2, 1),
                color 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  }

  :root {
    --scrollbar-track: ${props => props.theme.colors.surface};
    --scrollbar-thumb: ${props => props.theme.colors.border};
    --scrollbar-thumb-hover: ${props => props.theme.colors.text.secondary};
  }

  ::-webkit-scrollbar-track { background: var(--scrollbar-track); }
  ::-webkit-scrollbar-thumb { background: var(--scrollbar-thumb); }
  ::-webkit-scrollbar-thumb:hover { background: var(--scrollbar-thumb-hover); }
`;

const AppContainer = styled.div`
  min-height: 100vh;
  width: 100%;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.primary};
  transition: ${props => props.theme.effects.transition};
  display: flex;
  flex-direction: column;
`;

const Container = styled.div`
  padding: ${(props) => props.theme.sizes.spacing.lg};
  display: flex;
  flex-direction: column;
  flex: 1;
  overflow: hidden;
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto;
`;

const Header = styled.header`
  background: ${props => props.theme.colors.secondary};
  border-bottom: 2px solid ${props => props.theme.colors.border};
  padding: ${props => props.theme.sizes.spacing.lg};
  display: flex;
  justify-content: space-between;
  align-items: center;
  transition: ${props => props.theme.effects.transition};
`;

const Title = styled.h1`
  color: ${props => props.theme.colors.text.accent};
  font-size: ${props => props.theme.sizes.fontSize.xxlarge};
  margin: 0;
  font-weight: 700;
  transition: ${props => props.theme.effects.transition};
`;

const Subtitle = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  margin: ${props => props.theme.sizes.spacing.sm} 0 0 0;
  transition: ${props => props.theme.effects.transition};
`;

const LoadingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  min-height: 200px;
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.sizes.fontSize.large};
`;

const ErrorContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.error};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.lg};
  margin: ${props => props.theme.sizes.spacing.md};
  color: ${props => props.theme.colors.error};
  text-align: center;
`;

const HeaderContent = styled.div` text-align: center; flex-grow: 1; `;
const HeaderControls = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.sizes.spacing.md};
`;

const UpdateButton = styled.button`
  background: ${props => `linear-gradient(135deg, ${props.theme.colors.primary}15, ${props.theme.colors.secondary}10)`};
  color: ${props => props.theme.colors.text.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.xs};
  cursor: pointer;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  position: relative;
  overflow: hidden;
  animation: subtlePulse 3s ease-in-out infinite;

  &:hover {
    background: ${props => `linear-gradient(135deg, ${props.theme.colors.primary}25, ${props.theme.colors.secondary}20)`};
    color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    animation: none;
  }

  @keyframes subtlePulse {
    0%, 100% { box-shadow: 0 0 0 0 ${props => props.theme.colors.primary}20; }
    50% { box-shadow: 0 0 0 4px ${props => props.theme.colors.primary}10; }
  }
`;

const UpdateIcon = styled.div`
  position: relative; z-index: 1; width: 18px; height: 18px;
  display: flex; align-items: center; justify-content: center;
  svg { width: 100%; height: 100%; fill: currentColor; }
`;

const ImportButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white; border: none;
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.sm} ${props => props.theme.sizes.spacing.md};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  font-weight: 600; cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  display: flex; align-items: center;
  gap: ${props => props.theme.sizes.spacing.sm};
  &:hover { opacity: 0.9; transform: translateY(-1px); }
  &:active { transform: translateY(0); }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.sizes.spacing.md};
  gap: ${props => props.theme.sizes.spacing.md};
  flex-wrap: wrap;
`;

const SearchBarContainer = styled.div` width: 300px; `;

const Footer = styled.footer`
  text-align: center;
  padding: ${props => props.theme.sizes.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  border-top: 1px solid ${props => props.theme.colors.border}40;
  margin-top: auto;
`;

const FooterText = styled.p` margin: 0; opacity: 0.7; `;

const GithubLink = styled.a`
  color: ${props => props.theme.colors.primary};
  font-weight: 600; text-decoration: none; cursor: pointer;
  &:hover { text-decoration: underline; opacity: 0.8; }
`;

const Badge = styled.span`
  background: ${props => props.theme.colors.primary};
  color: white;
  border-radius: 10px;
  padding: 2px 8px;
  font-size: 11px;
  font-weight: 600;
  margin-left: 4px;
`;

const SettingsBar = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  background: ${props => props.theme.colors.surface};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  margin-bottom: ${props => props.theme.sizes.spacing.md};
  flex-wrap: wrap;
`;

const SettingInput = styled.input`
  padding: 4px 8px;
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 4px;
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-size: 12px;
  width: 200px;
  &:focus { outline: none; border-color: ${props => props.theme.colors.primary}; }
`;

const SettingLabel = styled.label`
  font-size: 11px;
  color: ${props => props.theme.colors.text.secondary};
  display: flex;
  align-items: center;
  gap: 4px;
`;

const DEFAULT_SETTINGS: AppSettings = {
  theme: 'dark',
  autoRefresh: false,
  refreshInterval: 30,
  viewLayout: 'list',
  compactView: false,
  showStatistics: false,
  sortKey: '',
  sortDirection: 'ascending',
  apiKey: '',
};

const SHORTCUTS = [
  { keys: 'Ctrl+F', desc: 'Focus search' },
  { keys: 'Ctrl+N', desc: 'New account' },
  { keys: 'Ctrl+R', desc: 'Refresh all ranks' },
  { keys: 'Ctrl+Shift+I', desc: 'Import accounts' },
  { keys: 'Ctrl+Shift+S', desc: 'Toggle statistics' },
  { keys: 'Ctrl+Shift+E', desc: 'Export accounts' },
  { keys: 'Ctrl+Shift+G', desc: 'Toggle grid/list view' },
  { keys: 'Ctrl+Shift+C', desc: 'Toggle compact mode' },
  { keys: 'Escape', desc: 'Close modals / deselect' },
  { keys: '?', desc: 'Show shortcuts' },
];

function AppContent() {
  const { theme } = useTheme();
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [showPasswordDialog, setShowPasswordDialog] = useState(true);
  const [masterPassword, setMasterPassword] = useState('');
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortConfig, setSortConfig] = useState<{ key: keyof Account | 'rank'; direction: 'ascending' | 'descending' } | null>(null);
  const [editingAccount, setEditingAccount] = useState<Account | null>(null);
  const [editingAccountIndex, setEditingAccountIndex] = useState<number | null>(null);
  const [showFileUpload, setShowFileUpload] = useState(false);
  const [viewLayout, setViewLayout] = useState<'list' | 'grid'>('list');
  const [showStatistics, setShowStatistics] = useState(false);
  const [ranks, setRanks] = useState<{ [key: number]: RankInfo }>({});
  const [loadingRanks, setLoadingRanks] = useState<Set<number>>(new Set());
  const [currentlyFetchingIndex, setCurrentlyFetchingIndex] = useState<number | null>(null);
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const shouldStopFetchingRef = useRef(false);

  // New state
  const [settings, setSettings] = useState<AppSettings>(DEFAULT_SETTINGS);
  const [apiKey, setApiKey] = useState('');
  const [showApiKeyInput, setShowApiKeyInput] = useState(false);
  const [selectedAccounts, setSelectedAccounts] = useState<Set<number>>(new Set());
  const [selectedTag, setSelectedTag] = useState<string>('');
  const [allTags, setAllTags] = useState<string[]>([]);
  const [compactView, setCompactView] = useState(false);
  const [showShortcuts, setShowShortcuts] = useState(false);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState(false);
  const autoRefreshRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const [rankHistories, setRankHistories] = useState<{ [accountId: string]: { history: RankHistoryEntry[]; peakRank: string; peakRR: number; peakIcon: string } }>({});
  const [showRankHistory, setShowRankHistory] = useState<string | null>(null);
  const [showTagManager, setShowTagManager] = useState(false);
  const [lendingFilter, setLendingFilter] = useState<'all' | 'lent' | 'available'>('all');

  // Collect all unique tags
  useEffect(() => {
    const tags = new Set<string>();
    accounts.forEach((a) => a.tags?.forEach((t) => tags.add(t)));
    setAllTags(Array.from(tags).sort());
  }, [accounts]);

  // Load settings on auth
  useEffect(() => {
    if (!isAuthenticated || !masterPassword) return;
    loadSettings();
    loadApiKey();
    loadRankHistories();
  }, [isAuthenticated, masterPassword]);

  const loadSettings = async () => {
    try {
      if (window.electronAPI?.loadSettings) {
        const result = await window.electronAPI.loadSettings();
        if (result.success && result.data) {
          const decrypted = EncryptionService.decrypt(result.data);
          const parsed = JSON.parse(decrypted);
          setSettings({ ...DEFAULT_SETTINGS, ...parsed });
          setViewLayout(parsed.viewLayout || 'list');
          setCompactView(parsed.compactView || false);
          if (parsed.sortKey) {
            setSortConfig({ key: parsed.sortKey, direction: parsed.sortDirection || 'ascending' });
          }
        }
      }
    } catch { /* ignore */ }
  };

  const saveSettings = async (updated: Partial<AppSettings>) => {
    const newSettings = { ...settings, ...updated };
    setSettings(newSettings);
    try {
      if (window.electronAPI?.saveSettings) {
        const encrypted = EncryptionService.encrypt(JSON.stringify(newSettings));
        await window.electronAPI.saveSettings(encrypted);
      }
    } catch { /* ignore */ }
  };

  const loadApiKey = async () => {
    try {
      if (window.electronAPI?.loadApiKey) {
        const result = await window.electronAPI.loadApiKey();
        if (result.success && result.data) {
          const decrypted = EncryptionService.decrypt(result.data);
          setApiKey(decrypted);
        }
      }
    } catch { /* ignore */ }
  };

  const saveApiKey = async (key: string) => {
    setApiKey(key);
    try {
      if (window.electronAPI?.saveApiKey) {
        const encrypted = EncryptionService.encrypt(key);
        await window.electronAPI.saveApiKey(encrypted);
      }
    } catch { /* ignore */ }
  };

  const loadRankHistories = async () => {
    try {
      if (window.electronAPI?.loadRankHistory) {
        const result = await window.electronAPI.loadRankHistory();
        if (result.success && result.data) {
          const decrypted = EncryptionService.decrypt(result.data);
          setRankHistories(JSON.parse(decrypted));
        }
      }
    } catch { /* ignore */ }
  };


  const loadAccounts = useCallback(async () => {
    if (!masterPassword) return;
    setIsLoading(true);
    setError('');
    try {
      const result = await window.electronAPI.loadAccounts();
      if (result.success && result.data) {
        const decryptedData = EncryptionService.decrypt(result.data);
        const accountsData = JSON.parse(decryptedData);
        const mappedAccounts = Array.isArray(accountsData)
          ? accountsData.map((acc: Account & { accountName?: string }) => ({
              ...acc,
              riotId: acc.accountName || acc.riotId,
              accountName: undefined,
              tags: acc.tags || [],
            }))
          : [];
        setAccounts(mappedAccounts);
      } else {
        setAccounts([]);
      }
    } catch (err) {
      console.error('Error loading accounts:', err);
      setError('Failed to load accounts. Please check your password.');
      setAccounts([]);
    } finally {
      setIsLoading(false);
    }
  }, [masterPassword]);

  useEffect(() => {
    if (isAuthenticated && masterPassword) {
      loadAccounts();
    }
  }, [isAuthenticated, masterPassword, loadAccounts]);

  const fetchRankForAccount = useCallback(async (index: number, account: Account) => {
    if (loadingRanks.has(index)) return;
    setLoadingRanks((prev) => new Set(prev).add(index));
    try {
      const rankData = await RankService.fetchRank(account, apiKey || undefined);
      setRanks((prev) => ({ ...prev, [index]: rankData }));

      // Update rank history
      if (rankData.rank && rankData.rank !== 'Unranked' && rankData.rank !== 'Error' && rankData.rank !== 'Account Private') {
        const entry: RankHistoryEntry = {
          date: new Date().toISOString(),
          rank: rankData.rank,
          rr: rankData.rr,
          icon: rankData.icon,
          color: rankData.color,
        };
        setRankHistories((prev) => {
          const existing = prev[account.id] || { history: [], peakRank: '', peakRR: 0, peakIcon: '' };
          const newHistory = [...existing.history, entry].slice(-50); // Keep last 50
          const peakRR = Math.max(existing.peakRR, rankData.rr);
          const peakRank = peakRR > existing.peakRR ? rankData.rank : existing.peakRank;
          const peakIcon = peakRR > existing.peakRR ? rankData.icon : existing.peakIcon;
          const updated = { ...prev, [account.id]: { history: newHistory, peakRank, peakRR, peakIcon } };
          // Persist asynchronously
          if (window.electronAPI?.saveRankHistory) {
            const encrypted = EncryptionService.encrypt(JSON.stringify(updated));
            window.electronAPI.saveRankHistory(encrypted);
          }
          return updated;
        });
      }
    } catch {
      setRanks((prev) => ({ ...prev, [index]: { rank: 'Error', rr: 0, icon: '', color: '#FF0000' } }));
    } finally {
      setLoadingRanks((prev) => {
        const newSet = new Set(prev);
        newSet.delete(index);
        return newSet;
      });
    }
  }, [loadingRanks, apiKey]);

  // Auto-fetch all ranks when accounts are loaded
  useEffect(() => {
    const autoFetchAllRanks = async () => {
      if (accounts.length === 0) return;
      shouldStopFetchingRef.current = false;
      setIsFetchingAll(true);
      for (let i = 0; i < accounts.length; i++) {
        if (shouldStopFetchingRef.current) break;
        const account = accounts[i];
        if (account.riotId && account.hashtag) {
          setCurrentlyFetchingIndex(i);
          await fetchRankForAccount(i, account);
          await new Promise((r) => setTimeout(r, 500));
        }
      }
      setIsFetchingAll(false);
      setCurrentlyFetchingIndex(null);
    };
    autoFetchAllRanks();
  }, [accounts.length]);

  const handleStopFetching = useCallback(() => {
    shouldStopFetchingRef.current = true;
    setIsFetchingAll(false);
    setCurrentlyFetchingIndex(null);
  }, []);

  const handleRefreshAllRanks = useCallback(async () => {
    shouldStopFetchingRef.current = false;
    setIsFetchingAll(true);
    for (let i = 0; i < accounts.length; i++) {
      if (shouldStopFetchingRef.current) break;
      const account = accounts[i];
      if (account.riotId && account.hashtag) {
        setCurrentlyFetchingIndex(i);
        await fetchRankForAccount(i, account);
        await new Promise((r) => setTimeout(r, 500));
      }
    }
    setIsFetchingAll(false);
    setCurrentlyFetchingIndex(null);
  }, [accounts, fetchRankForAccount]);

  // Auto-refresh
  useEffect(() => {
    if (autoRefreshRef.current) {
      clearInterval(autoRefreshRef.current);
      autoRefreshRef.current = null;
    }
    if (autoRefreshEnabled && isAuthenticated) {
      const interval = (settings.refreshInterval || 30) * 60 * 1000;
      autoRefreshRef.current = setInterval(() => {
        handleRefreshAllRanks();
      }, interval);
    }
    return () => {
      if (autoRefreshRef.current) clearInterval(autoRefreshRef.current);
    };
  }, [autoRefreshEnabled, settings.refreshInterval, isAuthenticated]);

  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const ctrl = e.ctrlKey || e.metaKey;

      if (e.key === '?' && !ctrl) {
        e.preventDefault();
        setShowShortcuts((p) => !p);
        return;
      }
      if (e.key === 'Escape') {
        setSelectedAccounts(new Set());
        setShowFileUpload(false);
        setShowStatistics(false);
        setShowShortcuts(false);
        setShowRankHistory(null);
        setShowTagManager(false);
        setEditingAccount(null);
        setEditingAccountIndex(null);
        return;
      }
      if (ctrl && e.key === 'f') { e.preventDefault(); document.querySelector<HTMLInputElement>('input[placeholder*="Search"]')?.focus(); }
      if (ctrl && e.key === 'n' && isAuthenticated) { e.preventDefault(); setEditingAccount(null); setEditingAccountIndex(null); }
      if (ctrl && e.key === 'r') { e.preventDefault(); handleRefreshAllRanks(); }
      if (ctrl && e.shiftKey && e.key === 'I') { e.preventDefault(); setShowFileUpload((p) => !p); }
      if (ctrl && e.shiftKey && e.key === 'S') { e.preventDefault(); setShowStatistics((p) => !p); }
      if (ctrl && e.shiftKey && e.key === 'G') { e.preventDefault(); handleViewChange(viewLayout === 'list' ? 'grid' : 'list'); }
      if (ctrl && e.shiftKey && e.key === 'C') { e.preventDefault(); handleToggleCompact(); }
      if (ctrl && e.shiftKey && e.key === 'E') { e.preventDefault(); handleExport(); }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isAuthenticated, viewLayout, accounts, ranks]);

  const filteredAccounts = useMemo(() => {
    let result = accounts;

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      result = result.filter(
        (a) => a.riotId.toLowerCase().includes(term) || a.username.toLowerCase().includes(term)
      );
    }

    if (selectedTag) {
      result = result.filter((a) => a.tags?.includes(selectedTag));
    }

    if (lendingFilter === 'lent') {
      result = result.filter((a) => a.lentTo);
    } else if (lendingFilter === 'available') {
      result = result.filter((a) => !a.lentTo);
    }

    return result;
  }, [accounts, searchTerm, selectedTag, lendingFilter]);

  const sortedAccounts = useMemo(() => {
    const sortable = [...filteredAccounts];
    if (sortConfig && sortConfig.key !== 'rank') {
      sortable.sort((a, b) => {
        const key = sortConfig.key as keyof Account;
        const aVal = a[key];
        const bVal = b[key];
        if (aVal === undefined && bVal === undefined) return 0;
        if (aVal === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (bVal === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal < bVal) return sortConfig.direction === 'ascending' ? -1 : 1;
        if (aVal > bVal) return sortConfig.direction === 'ascending' ? 1 : -1;
        return 0;
      });
    }
    return sortable;
  }, [filteredAccounts, sortConfig]);

  const requestSort = (key: keyof Account | 'rank') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
    saveSettings({ sortKey: key as string, sortDirection: direction });
  };

  const saveAccounts = async (accountsToSave: Account[]) => {
    if (!masterPassword) return;
    try {
      const accountsForStorage = accountsToSave.map((acc) => ({
        ...acc,
        accountName: acc.riotId,
        riotId: undefined,
      }));
      const dataToEncrypt = JSON.stringify(accountsForStorage);
      const encryptedData = EncryptionService.encrypt(dataToEncrypt);
      const result = await window.electronAPI.saveAccounts(encryptedData);
      if (result.success) {
        setAccounts(accountsToSave);
      } else {
        setError(`Failed to save accounts: ${result.error || 'Unknown error'}`);
      }
    } catch (err) {
      console.error('Error saving accounts:', err);
      setError('Failed to save accounts.');
    }
  };

  const handlePasswordVerified = async (password: string) => {
    setMasterPassword(password);

    // Load salt FIRST before deriving the key
    if (window.electronAPI?.loadEncryptionSalt) {
      const saltResult = await window.electronAPI.loadEncryptionSalt();
      if (saltResult.success && saltResult.data) {
        EncryptionService.setSalt(saltResult.data);
      }
    }

    // Now derive the key (uses existing salt or generates new one)
    EncryptionService.setPassword(password);

    // Save salt if new
    const salt = EncryptionService.getSalt();
    if (salt && window.electronAPI?.saveEncryptionSalt) {
      await window.electronAPI.saveEncryptionSalt(salt);
    }

    setIsAuthenticated(true);
    setShowPasswordDialog(false);
  };

  const handlePasswordDialogCancel = () => {
    setShowPasswordDialog(false);
  };

  const handleEditAccount = (account: Account, index: number) => {
    setEditingAccount(account);
    setEditingAccountIndex(index);
  };

  const handleDeleteAccount = (index: number) => {
    const updatedAccounts = accounts.filter((_, i) => i !== index);
    saveAccounts(updatedAccounts);
    setSelectedAccounts((prev) => {
      const next = new Set(prev);
      next.delete(index);
      return next;
    });
  };

  const handleToggleSkins = (index: number) => {
    const updatedAccounts = accounts.map((acc, i) =>
      i === index ? { ...acc, hasSkins: !acc.hasSkins } : acc
    );
    saveAccounts(updatedAccounts);
  };

  const handleAccountsImported = (importedAccounts: Account[]) => {
    const updatedAccounts = [...accounts];
    importedAccounts.forEach((importedAccount) => {
      const existingIndex = updatedAccounts.findIndex(
        (existing) =>
          existing.username.toLowerCase() === importedAccount.username.toLowerCase() ||
          existing.riotId.toLowerCase() === importedAccount.riotId.toLowerCase()
      );
      if (existingIndex >= 0) {
        updatedAccounts[existingIndex] = { ...importedAccount, id: updatedAccounts[existingIndex].id };
      } else {
        updatedAccounts.push(importedAccount);
      }
    });
    saveAccounts(updatedAccounts);
    setShowFileUpload(false);
  };

  const handleFormSubmit = (account: Account) => {
    if (editingAccountIndex !== null) {
      const updatedAccounts = accounts.map((acc, index) =>
        index === editingAccountIndex ? account : acc
      );
      saveAccounts(updatedAccounts);
    } else {
      saveAccounts([...accounts, account]);
    }
    setEditingAccount(null);
    setEditingAccountIndex(null);
  };

  const handleCheckForUpdates = async () => {
    if (!window.electronAPI) return;
    try { await window.electronAPI.checkForUpdates(); } catch { /* ignore */ }
  };

  // Bulk actions
  const handleBulkDelete = () => {
    const indices = Array.from(selectedAccounts).sort((a, b) => b - a);
    let updated = [...accounts];
    indices.forEach((i) => { updated = updated.filter((_, idx) => idx !== i); });
    saveAccounts(updated);
    setSelectedAccounts(new Set());
  };

  const handleBulkTag = (tag: string) => {
    const updatedAccounts = accounts.map((acc, i) =>
      selectedAccounts.has(i) ? { ...acc, tags: [...(acc.tags || []), tag].filter((v, idx, arr) => arr.indexOf(v) === idx) } : acc
    );
    saveAccounts(updatedAccounts);
    setSelectedAccounts(new Set());
  };

  const handleBulkRefresh = async () => {
    const indices = Array.from(selectedAccounts);
    for (const i of indices) {
      if (accounts[i]?.riotId && accounts[i]?.hashtag) {
        await fetchRankForAccount(i, accounts[i]);
        await new Promise((r) => setTimeout(r, 300));
      }
    }
  };

  const handleSelectAll = () => {
    if (selectedAccounts.size === accounts.length) {
      setSelectedAccounts(new Set());
    } else {
      setSelectedAccounts(new Set(accounts.map((_, i) => i)));
    }
  };

  const handleViewChange = (view: 'list' | 'grid') => {
    setViewLayout(view);
    saveSettings({ viewLayout: view });
  };

  const handleToggleCompact = () => {
    setCompactView((c) => {
      saveSettings({ compactView: !c });
      return !c;
    });
  };

  const handleExport = () => {
    const data = accounts.map((a) => ({
      'Riot ID': `${a.riotId}#${a.hashtag}`,
      Username: a.username,
      Password: a.password,
      Region: a.region.toUpperCase(),
      Skins: a.hasSkins ? 'Yes' : 'No',
      Tags: (a.tags || []).join(', '),
      'Lent To': a.lentTo || '',
      'Lent Since': a.lentSince || '',
      Notes: a.notes || '',
    }));
    const csv =
      Object.keys(data[0]).join(',') +
      '\n' +
      data.map((row) => Object.values(row).map((v) => `"${v}"`).join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `valorant-accounts-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleUpdateTags = (accountId: string, tags: string[]) => {
    const updatedAccounts = accounts.map((a) => (a.id === accountId ? { ...a, tags } : a));
    saveAccounts(updatedAccounts);
  };

  const handleUpdateLending = (accountId: string, lentTo: string) => {
    const updatedAccounts = accounts.map((a) =>
      a.id === accountId ? { ...a, lentTo: lentTo || undefined, lentSince: lentTo ? new Date().toISOString() : undefined } : a
    );
    saveAccounts(updatedAccounts);
  };

  const selectedRankHistory = showRankHistory ? rankHistories[showRankHistory] : null;

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Container>
          <Header>
            <div />
            <HeaderContent>
              <Title>Valorant Account Manager</Title>
              <Subtitle>Secure account management and rank tracking</Subtitle>
            </HeaderContent>
            <HeaderControls>
              <UpdateButton onClick={handleCheckForUpdates} title="Check for updates">
                <UpdateIcon className="update-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6.25L16 2.25L20 6.25L16 10.25L12 6.25V10.5C16.14 10.5 19.5 13.86 19.5 18H21C21 13.03 16.97 9 12 9V2Z" fill="currentColor" opacity="0.9"/>
                    <path d="M12 22V17.75L8 21.75L4 17.75L8 13.75L12 17.75V13.5C7.86 13.5 4.5 10.14 4.5 6H3C3 10.97 7.03 15 12 15V22Z" fill="currentColor" opacity="0.7"/>
                    <circle cx="12" cy="12" r="1.5" fill="currentColor"/>
                  </svg>
                </UpdateIcon>
              </UpdateButton>
              <ThemeToggle />
            </HeaderControls>
          </Header>

          {showPasswordDialog && (
            <MasterPasswordDialog
              isOpen={showPasswordDialog}
              onAuthenticated={handlePasswordVerified}
              onClose={handlePasswordDialogCancel}
            />
          )}

          {isAuthenticated && !showPasswordDialog && (
            <MainContent>
              {error && <ErrorContainer>{error}</ErrorContainer>}

              {/* API Key bar */}
              <SettingsBar>
                <SettingLabel>
                  API Key:
                  {!showApiKeyInput && !apiKey && (
                    <Badge style={{ cursor: 'pointer' }} onClick={() => setShowApiKeyInput(true)}>Not Set</Badge>
                  )}
                  {!showApiKeyInput && apiKey && (
                    <Badge style={{ background: '#00D26A', cursor: 'pointer' }} onClick={() => setShowApiKeyInput(true)}>Set ✓</Badge>
                  )}
                </SettingLabel>
                {showApiKeyInput && (
                  <>
                    <SettingInput
                      type="password"
                      placeholder="HenrikDev API Key"
                      value={apiKey}
                      onChange={(e) => { setApiKey(e.target.value); }}
                      onBlur={() => { saveApiKey(apiKey); setShowApiKeyInput(false); }}
                      onKeyDown={(e) => { if (e.key === 'Enter') { saveApiKey(apiKey); setShowApiKeyInput(false); } }}
                      autoFocus
                    />
                    <ImportButton
                      as="a"
                      href="https://api.henrikdev.xyz/dashboard"
                      target="_blank"
                      rel="noopener noreferrer"
                      style={{ fontSize: '11px', padding: '4px 8px', textDecoration: 'none' }}
                    >
                      Get Key
                    </ImportButton>
                  </>
                )}
                <SettingLabel style={{ marginLeft: '8px' }}>
                  <input type="checkbox" checked={autoRefreshEnabled} onChange={(e) => setAutoRefreshEnabled(e.target.checked)} />
                  Auto-refresh ({settings.refreshInterval}min)
                </SettingLabel>
                <ImportButton onClick={handleExport} style={{ fontSize: '11px', padding: '4px 8px', background: '#6c757d', marginLeft: 'auto' }}>
                  Export CSV
                </ImportButton>
                <ImportButton onClick={() => setShowShortcuts(true)} style={{ fontSize: '11px', padding: '4px 8px', background: 'transparent', border: '1px solid #666' }}>
                  ? Shortcuts
                </ImportButton>
              </SettingsBar>

              {selectedAccounts.size > 0 && (
                <BulkActionBar
                  count={selectedAccounts.size}
                  onDelete={handleBulkDelete}
                  onTag={handleBulkTag}
                  onRefresh={handleBulkRefresh}
                  onClear={() => setSelectedAccounts(new Set())}
                  existingTags={allTags}
                />
              )}

              <AccountForm onSubmit={handleFormSubmit} initialData={editingAccount} />

              <ControlsContainer>
                <SearchBarContainer>
                  <SearchBar searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
                </SearchBarContainer>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <ViewToggle currentView={viewLayout} onViewChange={handleViewChange} />
                  <ImportButton onClick={() => setShowFileUpload(!showFileUpload)}>📁 Import</ImportButton>
                  <ImportButton onClick={() => setShowStatistics(!showStatistics)}>📊 Stats</ImportButton>
                  <ImportButton onClick={handleToggleCompact} style={{ background: compactView ? '#00D26A' : 'transparent', border: '1px solid #666' }}>
                    {compactView ? '📋 Compact ✓' : '📋 Compact'}
                  </ImportButton>
                </div>
              </ControlsContainer>

              {/* Tag and lending filters */}
              <SettingsBar>
                <SettingLabel>Filter by tag:</SettingLabel>
                <select
                  value={selectedTag}
                  onChange={(e) => setSelectedTag(e.target.value)}
                  style={{
                    padding: '4px 8px', border: '1px solid #666', borderRadius: '4px',
                    background: theme.colors.background, color: theme.colors.text.primary, fontSize: '12px',
                  }}
                >
                  <option value="">All tags</option>
                  {allTags.map((t) => <option key={t} value={t}>{t}</option>)}
                </select>
                <SettingLabel>Lending:</SettingLabel>
                <select
                  value={lendingFilter}
                  onChange={(e) => setLendingFilter(e.target.value as 'all' | 'lent' | 'available')}
                  style={{
                    padding: '4px 8px', border: '1px solid #666', borderRadius: '4px',
                    background: theme.colors.background, color: theme.colors.text.primary, fontSize: '12px',
                  }}
                >
                  <option value="all">All</option>
                  <option value="lent">Lent out</option>
                  <option value="available">Available</option>
                </select>
                <ImportButton onClick={() => setShowTagManager(true)} style={{ fontSize: '11px', padding: '4px 8px', background: 'transparent', border: '1px solid #666', marginLeft: 'auto' }}>
                  🏷 Manage Tags
                </ImportButton>
              </SettingsBar>

              {showFileUpload && (
                <FileUpload isVisible={showFileUpload} onAccountsImported={handleAccountsImported} onClose={() => setShowFileUpload(false)} />
              )}

              {showStatistics && (
                <AccountStatistics accounts={accounts} isVisible={showStatistics} onClose={() => setShowStatistics(false)} ranks={ranks} />
              )}

              {showTagManager && (
                <TagManager
                  accounts={accounts}
                  allTags={allTags}
                  onUpdateTags={handleUpdateTags}
                  onClose={() => setShowTagManager(false)}
                />
              )}

              {showRankHistory && selectedRankHistory && (
                <RankHistoryPanel
                  accountId={showRankHistory}
                  history={selectedRankHistory.history}
                  peakRank={selectedRankHistory.peakRank}
                  peakRR={selectedRankHistory.peakRR}
                  peakIcon={selectedRankHistory.peakIcon}
                  onClose={() => setShowRankHistory(null)}
                />
              )}

              {isLoading ? (
                <LoadingContainer>Loading accounts...</LoadingContainer>
              ) : viewLayout === 'grid' ? (
                <AccountGrid
                  accounts={sortedAccounts}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                  onToggleSkins={handleToggleSkins}
                  ranks={ranks}
                  loadingRanks={loadingRanks}
                  onRefreshRank={fetchRankForAccount}
                  currentlyFetchingIndex={currentlyFetchingIndex}
                  isFetchingAll={isFetchingAll}
                  onStopFetching={handleStopFetching}
                  selectedAccounts={selectedAccounts}
                  onToggleSelect={(index) => {
                    setSelectedAccounts((prev) => {
                      const next = new Set(prev);
                      next.has(index) ? next.delete(index) : next.add(index);
                      return next;
                    });
                  }}
                  compactView={compactView}
                  rankHistories={rankHistories}
                  onShowRankHistory={(id) => setShowRankHistory(id)}
                  onUpdateLending={handleUpdateLending}
                />
              ) : (
                <AccountTable
                  accounts={sortedAccounts}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                  onToggleSkins={handleToggleSkins}
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                  ranks={ranks}
                  loadingRanks={loadingRanks}
                  onRefreshRank={fetchRankForAccount}
                  onRefreshAll={handleRefreshAllRanks}
                  currentlyFetchingIndex={currentlyFetchingIndex}
                  isFetchingAll={isFetchingAll}
                  onStopFetching={handleStopFetching}
                  selectedAccounts={selectedAccounts}
                  onToggleSelect={(index) => {
                    setSelectedAccounts((prev) => {
                      const next = new Set(prev);
                      next.has(index) ? next.delete(index) : next.add(index);
                      return next;
                    });
                  }}
                  onSelectAll={handleSelectAll}
                  allSelected={selectedAccounts.size === accounts.length && accounts.length > 0}
                  compactView={compactView}
                  rankHistories={rankHistories}
                  onShowRankHistory={(id) => setShowRankHistory(id)}
                  onUpdateLending={handleUpdateLending}
                />
              )}

              {showShortcuts && (
                <KeyboardShortcutsHelp shortcuts={SHORTCUTS} onClose={() => setShowShortcuts(false)} />
              )}
            </MainContent>
          )}

          <Footer>
            <FooterText>
              Made with ❤️ by{' '}
              <GithubLink href="https://github.com/nisarganag" target="_blank" rel="noopener noreferrer">
                Nisarga
              </GithubLink>
            </FooterText>
          </Footer>
        </Container>
      </AppContainer>
      <UpdateManager />
    </ThemeProvider>
  );
}

function App() {
  return (
    <CustomThemeProvider>
      <AppContent />
    </CustomThemeProvider>
  );
}

export default App;
