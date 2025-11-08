import { useState, useEffect, useMemo, useCallback } from 'react';
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
import { EncryptionService } from './utils/encryption';
import type { Account } from './types';
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

  ::-webkit-scrollbar-track {
    background: var(--scrollbar-track);
  }

  ::-webkit-scrollbar-thumb {
    background: var(--scrollbar-thumb);
  }

  ::-webkit-scrollbar-thumb:hover {
    background: var(--scrollbar-thumb-hover);
  }
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
  overflow: hidden; /* Prevent scrolling on the main container */
`;

const MainContent = styled.div`
  display: flex;
  flex-direction: column;
  flex-grow: 1;
  overflow-y: auto; /* Allow scrolling on this container */
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
  transition: ${props => props.theme.effects.transition};
`;

const ErrorContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.error};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.lg};
  margin: ${props => props.theme.sizes.spacing.md};
  color: ${props => props.theme.colors.error};
  text-align: center;
  transition: ${props => props.theme.effects.transition};
`;

const HeaderContent = styled.div`
  text-align: center;
  flex-grow: 1;
`;

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

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: ${props => `linear-gradient(135deg, ${props.theme.colors.primary}20, ${props.theme.colors.secondary}15)`};
    opacity: 0;
    transition: opacity 0.3s ease;
  }

  &:hover {
    background: ${props => `linear-gradient(135deg, ${props.theme.colors.primary}25, ${props.theme.colors.secondary}20)`};
    color: ${props => props.theme.colors.primary};
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px) scale(1.05);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.15);
    animation: none; /* Stop the pulse animation on hover */

    &::before {
      opacity: 1;
    }

    .update-icon {
      animation: rotateUpdate 0.8s ease-in-out infinite;
    }
  }

  &:active {
    transform: translateY(-1px);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  @keyframes rotateUpdate {
    0% { 
      transform: rotate(0deg) scale(1);
    }
    25% { 
      transform: rotate(90deg) scale(1.1);
    }
    50% { 
      transform: rotate(180deg) scale(1);
    }
    75% { 
      transform: rotate(270deg) scale(1.1);
    }
    100% { 
      transform: rotate(360deg) scale(1);
    }
  }

  @keyframes subtlePulse {
    0%, 100% { 
      box-shadow: 0 0 0 0 ${props => props.theme.colors.primary}20;
    }
    50% { 
      box-shadow: 0 0 0 4px ${props => props.theme.colors.primary}10;
    }
  }
`;

const UpdateIcon = styled.div`
  position: relative;
  z-index: 1;
  width: 18px;
  height: 18px;
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 100%;
    height: 100%;
    fill: currentColor;
    transition: transform 0.3s ease;
  }
`;

const ImportButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.sm} ${props => props.theme.sizes.spacing.md};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.sizes.spacing.sm};
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:active {
    transform: translateY(0);
  }
`;

const ControlsContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${(props) => props.theme.sizes.spacing.md};
  gap: ${props => props.theme.sizes.spacing.md};
`;

const SearchBarContainer = styled.div`
  width: 300px; /* Or any other width */
`;

const Footer = styled.footer`
  text-align: center;
  padding: ${props => props.theme.sizes.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  border-top: 1px solid ${props => props.theme.colors.border}40;
  margin-top: auto;
  transition: ${props => props.theme.effects.transition};
`;

const FooterText = styled.p`
  margin: 0;
  opacity: 0.7;
`;

const GithubLink = styled.a`
  color: ${props => props.theme.colors.primary};
  font-weight: 600;
  text-decoration: none;
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  
  &:hover {
    text-decoration: underline;
    opacity: 0.8;
  }
`;

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

  const loadAccounts = useCallback(async () => {
    if (!masterPassword) return;

    setIsLoading(true);
    setError('');

    try {
      const result = await window.electronAPI.loadAccounts();
      if (result.success && result.data) {
        const decryptedData = EncryptionService.decrypt(result.data);
        const accountsData = JSON.parse(decryptedData);
        // Map accountName from JSON to riotId in our app
        const mappedAccounts = Array.isArray(accountsData) 
          ? accountsData.map((acc: Account & { accountName?: string }) => {
              const riotId = acc.accountName || acc.riotId;
              console.log('Loading account:', { riotId, hashtag: acc.hashtag, username: acc.username });
              return {
                ...acc,
                riotId,
                accountName: undefined // Remove the old field
              };
            })
          : [];
        setAccounts(mappedAccounts);
      } else {
        setAccounts([]);
      }
    } catch (error) {
      console.error('Error loading accounts:', error);
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

  const filteredAccounts = useMemo(() => {
    if (!searchTerm) return accounts;
    return accounts.filter(account =>
      account.riotId.toLowerCase().includes(searchTerm.toLowerCase()) ||
      account.username.toLowerCase().includes(searchTerm.toLowerCase())
    );
  }, [accounts, searchTerm]);

  const sortedAccounts = useMemo(() => {
    const sortableAccounts = [...filteredAccounts];
    if (sortConfig !== null && sortConfig.key !== 'rank') {
      sortableAccounts.sort((a, b) => {
        const key = sortConfig.key as keyof Account;
        const aValue = a[key];
        const bValue = b[key];
        
        // Handle undefined values
        if (aValue === undefined && bValue === undefined) return 0;
        if (aValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
        if (bValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
        
        if (aValue < bValue) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (aValue > bValue) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableAccounts;
  }, [filteredAccounts, sortConfig]);

  const requestSort = (key: keyof Account | 'rank') => {
    let direction: 'ascending' | 'descending' = 'ascending';
    if (sortConfig && sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  const saveAccounts = async (accountsToSave: Account[]) => {
    if (!masterPassword) return;

    try {
      // Map riotId back to accountName for JSON storage
      const accountsForStorage = accountsToSave.map(acc => ({
        ...acc,
        accountName: acc.riotId,
        riotId: undefined // Remove riotId for backward compatibility
      }));
      const dataToEncrypt = JSON.stringify(accountsForStorage);
      const encryptedData = EncryptionService.encrypt(dataToEncrypt);
      const result = await window.electronAPI.saveAccounts(encryptedData);
      if (result.success) {
        setAccounts(accountsToSave);
      } else {
        setError(`Failed to save accounts: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error saving accounts:', error);
      setError('Failed to save accounts. Please try again.');
    }
  };

  const handlePasswordVerified = (password: string) => {
    setMasterPassword(password);
    setIsAuthenticated(true);
    setShowPasswordDialog(false);
  };

  const handlePasswordDialogCancel = () => {
    setShowPasswordDialog(false);
    // In a real app, you might want to close the window here
    // window.electron?.closeApp?.();
  };

  const handleEditAccount = (account: Account, index: number) => {
    setEditingAccount(account);
    setEditingAccountIndex(index);
  };

  const handleDeleteAccount = (index: number) => {
    const updatedAccounts = accounts.filter((_, i) => i !== index);
    saveAccounts(updatedAccounts);
  };

  const handleToggleSkins = (index: number) => {
    const updatedAccounts = accounts.map((acc, i) =>
      i === index ? { ...acc, hasSkins: !acc.hasSkins } : acc
    );
    saveAccounts(updatedAccounts);
  };

  const handleAccountsImported = (importedAccounts: Account[]) => {
    const updatedAccounts = [...accounts];
    
    // For each imported account, check if username already exists
    importedAccounts.forEach(importedAccount => {
      const existingIndex = updatedAccounts.findIndex(
        existing => existing.username.toLowerCase() === importedAccount.username.toLowerCase() ||
                   existing.riotId.toLowerCase() === importedAccount.riotId.toLowerCase()
      );
      
      if (existingIndex >= 0) {
        // Replace existing account with imported data
        updatedAccounts[existingIndex] = {
          ...importedAccount,
          id: updatedAccounts[existingIndex].id // Keep the original ID
        };
      } else {
        // Add new account if it doesn't exist
        updatedAccounts.push(importedAccount);
      }
    });
    
    saveAccounts(updatedAccounts);
    setShowFileUpload(false);
  };

  const handleFormSubmit = (account: Account) => {
    if (editingAccountIndex !== null) {
      // Update existing account
      const updatedAccounts = accounts.map((acc, index) =>
        index === editingAccountIndex ? account : acc
      );
      saveAccounts(updatedAccounts);
    } else {
      // Add new account
      const updatedAccounts = [...accounts, account];
      saveAccounts(updatedAccounts);
    }
    setEditingAccount(null);
    setEditingAccountIndex(null);
  };

  const handleCheckForUpdates = async () => {
    if (!window.electronAPI) return;
    
    try {
      await window.electronAPI.checkForUpdates();
    } catch (error) {
      console.error('Failed to check for updates:', error);
    }
  };

  return (
    <ThemeProvider theme={theme}>
      <GlobalStyle />
      <AppContainer>
        <Container>
          <Header>
            <div /> {/* Spacer for left side */}
            <HeaderContent>
              <Title>Valorant Account Manager</Title>
              <Subtitle>Secure account management and rank tracking</Subtitle>
            </HeaderContent>
            <HeaderControls>
              <UpdateButton onClick={handleCheckForUpdates} title="Check for updates">
                <UpdateIcon className="update-icon">
                  <svg viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="M12 2V6.25L16 2.25L20 6.25L16 10.25L12 6.25V10.5C16.14 10.5 19.5 13.86 19.5 18H21C21 13.03 16.97 9 12 9V2Z" 
                          fill="currentColor" 
                          opacity="0.9"/>
                    <path d="M12 22V17.75L8 21.75L4 17.75L8 13.75L12 17.75V13.5C7.86 13.5 4.5 10.14 4.5 6H3C3 10.97 7.03 15 12 15V22Z" 
                          fill="currentColor" 
                          opacity="0.7"/>
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
              {error && (
                <ErrorContainer>
                  {error}
                </ErrorContainer>
              )}

              <AccountForm
                onSubmit={handleFormSubmit}
                initialData={editingAccount}
              />

              <ControlsContainer>
                <SearchBarContainer>
                  <SearchBar searchTerm={searchTerm} onSearchTermChange={setSearchTerm} />
                </SearchBarContainer>
                <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                  <ViewToggle 
                    currentView={viewLayout}
                    onViewChange={setViewLayout}
                  />
                  <ImportButton onClick={() => setShowFileUpload(!showFileUpload)}>
                    📁 Import Accounts
                  </ImportButton>
                  <ImportButton onClick={() => setShowStatistics(!showStatistics)}>
                    📊 Statistics
                  </ImportButton>
                </div>
              </ControlsContainer>

              {showFileUpload && (
                <FileUpload
                  isVisible={showFileUpload}
                  onAccountsImported={handleAccountsImported}
                  onClose={() => setShowFileUpload(false)}
                />
              )}

              {showStatistics && (
                <AccountStatistics
                  accounts={accounts}
                  isVisible={showStatistics}
                  onClose={() => setShowStatistics(false)}
                />
              )}

              {isLoading ? (
                <LoadingContainer>
                  Loading accounts...
                </LoadingContainer>
              ) : viewLayout === 'grid' ? (
                <AccountGrid
                  accounts={sortedAccounts}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                  onToggleSkins={handleToggleSkins}
                />
              ) : (
                <AccountTable
                  accounts={sortedAccounts}
                  onEdit={handleEditAccount}
                  onDelete={handleDeleteAccount}
                  onToggleSkins={handleToggleSkins}
                  sortConfig={sortConfig}
                  requestSort={requestSort}
                />
              )}
            </MainContent>
          )}

          <Footer>
            <FooterText>
              Made with ❤️ by{' '}
              <GithubLink 
                href="https://github.com/nisarganag" 
                target="_blank" 
                rel="noopener noreferrer"
              >
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
