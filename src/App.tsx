import { useState, useEffect, useMemo, useCallback } from 'react';
import styled, { ThemeProvider, createGlobalStyle } from 'styled-components';
import { ThemeProvider as CustomThemeProvider } from './contexts/ThemeContext';
import { useTheme } from './contexts/useTheme';
import { MasterPasswordDialog } from './components/MasterPasswordDialog';
import { AccountForm } from './components/AccountForm';
import { AccountTable } from './components/AccountTable';
import { SearchBar } from './components/SearchBar';
import { ThemeToggle } from './components/ThemeToggle';
import { FileUpload } from './components/FileUpload';
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
        if (a[key] < b[key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[key] > b[key]) {
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
                <ImportButton onClick={() => setShowFileUpload(!showFileUpload)}>
                  📁 Import Accounts
                </ImportButton>
              </ControlsContainer>

              {showFileUpload && (
                <FileUpload
                  isVisible={showFileUpload}
                  onAccountsImported={handleAccountsImported}
                  onClose={() => setShowFileUpload(false)}
                />
              )}

              {isLoading ? (
                <LoadingContainer>
                  Loading accounts...
                </LoadingContainer>
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
