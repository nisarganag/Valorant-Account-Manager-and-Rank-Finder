import React, { useState, useEffect, useMemo } from 'react';
import styled, { useTheme, keyframes } from 'styled-components';
import { RankService } from '../services/rankService';
import type { Account } from '../types';

interface AccountTableProps {
  accounts: Account[];
  onDelete: (index: number) => void;
  onEdit: (account: Account, index: number) => void;
  onToggleSkins: (index: number) => void;
  sortConfig: { key: keyof Account | 'rank'; direction: 'ascending' | 'descending' } | null;
  requestSort: (key: keyof Account | 'rank') => void;
}

interface RankInfo {
  rank: string;
  icon: string;
  color: string;
}

const rankOrder = [
  'Unranked', 'Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 
  'Diamond', 'Ascendant', 'Immortal', 'Radiant'
];

const getRankValue = (rank: string) => {
  const rankName = rank.split(' ')[0];
  const value = rankOrder.indexOf(rankName);
  return value === -1 ? -1 : value; // Return -1 for failed/unknown ranks
};

const TableContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  margin: ${props => props.theme.sizes.spacing.md} 0;
  overflow-x: auto;
  box-shadow: ${props => props.theme.effects.cardShadow};
  transition: ${props => props.theme.effects.transition};
`;

const Table = styled.table`
  width: 100%;
  border-collapse: collapse;
  font-family: ${props => props.theme.fonts.primary};
`;

const TableHeader = styled.th`
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  padding: ${props => props.theme.sizes.spacing.md};
  text-align: center;
  transition: ${props => props.theme.effects.transition};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  font-weight: 600;
  border-bottom: 2px solid ${props => props.theme.colors.border};
  cursor: pointer;
  white-space: nowrap;
  vertical-align: middle;
  box-sizing: border-box;
  
  &:hover {
    background: ${props => props.theme.colors.background}E0;
  }
`;

const TableRow = styled.tr`
  &:nth-child(even) {
    background: ${props => props.theme.colors.background}20;
  }
  
  &:hover {
    background: ${props => props.theme.colors.primary}15;
  }
`;

const TableCell = styled.td`
  padding: ${props => props.theme.sizes.spacing.md};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  white-space: nowrap;
  vertical-align: middle;
  box-sizing: border-box;
  text-align: center;
`;

const RankCell = styled(TableCell)<{ $rankColor?: string }>`
  color: ${props => props.$rankColor || props.theme.colors.text.primary};
  font-weight: 600;
  vertical-align: middle;
`;

const RankContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.sizes.spacing.sm};
`;

const RankHeaderContent = styled.div`
  display: inline-flex;
  align-items: center;
  gap: 10px;
`;

const RankIcon = styled.img`
  width: 24px;
  height: 24px;
  object-fit: contain;
`;

const SkinsCell = styled(TableCell)`
  cursor: pointer;
  user-select: none;
`;

const ActionButtonContainer = styled.div`
  display: flex;
  flex-wrap: nowrap;
  gap: ${props => props.theme.sizes.spacing.sm};
`;

const Button = styled.button<{ variant?: 'primary' | 'danger' | 'secondary' }>`
  background-color: ${props => {
    if (props.variant === 'danger') return props.theme.colors.error;
    if (props.variant === 'primary') return props.theme.colors.primary;
    return 'transparent';
  }};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => {
    if (props.variant === 'danger') return props.theme.colors.error;
    if (props.variant === 'primary') return props.theme.colors.primary;
    return props.theme.colors.border;
  }};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.xs} ${props => props.theme.sizes.spacing.sm};
  font-size: ${props => props.theme.sizes.fontSize.small};
  font-family: ${props => props.theme.fonts.primary};
  cursor: pointer;
  transition: all 0.2s ease-in-out;
  white-space: nowrap;

  &:hover:not(:disabled) {
    opacity: 0.8;
  }

  &:disabled {
    background-color: transparent;
    border-color: ${props => props.theme.colors.border};
    cursor: not-allowed;
    opacity: 0.6;
  }
`;

const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const Spinner = styled.div`
  width: 24px;
  height: 24px;
  border: 3px solid ${props => props.theme.colors.primary}50;
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

const PasswordCell = styled(TableCell)`
  vertical-align: middle;
`;

const PasswordContent = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.sizes.spacing.md};
`;

const PasswordText = styled.span`
  font-family: ${props => props.theme.fonts.mono};
  letter-spacing: 0.05em;
  user-select: none;
  min-width: 120px;
  transition: opacity 0.2s ease-in-out;
  
  &:hover {
    opacity: 0.7;
  }
`;

const EyeIcon = styled.span`
  cursor: pointer;
  font-size: 1.2em;
  display: inline-block;
  user-select: none;
  transition: all 0.2s ease-in-out;
  
  &:hover {
    transform: scale(1.2);
    color: ${props => props.theme.colors.primary};
  }
`;

export const AccountTable: React.FC<AccountTableProps> = ({ accounts, onEdit, onDelete, onToggleSkins, sortConfig, requestSort }) => {
  const theme = useTheme();
  const [ranks, setRanks] = useState<{ [key: number]: RankInfo }>({});
  const [loadingRanks, setLoadingRanks] = useState<{ [key: number]: boolean }>({});
  const [isFetchingAll, setIsFetchingAll] = useState(false);
  const [currentlyFetchingIndex, setCurrentlyFetchingIndex] = useState<number | null>(null);
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({});

  const handleShareAccount = (account: Account, index: number) => {
    const rankInfo = ranks[index];
    const accountDetails = `🎮 Valorant Account Details 🎮

📋 Riot ID: ${account.riotId}#${account.hashtag}
👤 Username: ${account.username || 'Not provided'}
🌍 Region: ${account.region.toUpperCase()}
🏆 Rank: ${rankInfo?.rank || 'Unknown'}
✨ Has Skins: ${account.hasSkins ? 'Yes' : 'No'}
📅 Last Updated: ${account.lastRefreshed ? new Date(account.lastRefreshed).toLocaleDateString() : 'Never'}

--
Shared via Valorant Account Manager`;

    if (navigator.share) {
      // Use Web Share API if available (mobile devices)
      navigator.share({
        title: `Valorant Account: ${account.riotId}#${account.hashtag}`,
        text: accountDetails,
      }).catch(err => console.log('Error sharing:', err));
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(accountDetails).then(() => {
        alert('Account details copied to clipboard! You can now paste it in WhatsApp, Discord, or any other app.');
      }).catch(() => {
        // If clipboard fails, show a modal with the text
        const textArea = document.createElement('textarea');
        textArea.value = accountDetails;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        alert('Account details copied to clipboard! You can now paste it in WhatsApp, Discord, or any other app.');
      });
    }
  };

  const sortedAccounts = useMemo(() => {
    const sortableItems = [...accounts];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        const indexA = accounts.indexOf(a);
        const indexB = accounts.indexOf(b);

        if (sortConfig.key === 'rank') {
          const rankA = ranks[indexA]?.rank || 'Unranked';
          const rankB = ranks[indexB]?.rank || 'Unranked';
          const valueA = getRankValue(rankA);
          const valueB = getRankValue(rankB);
          if (valueA < valueB) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (valueA > valueB) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        } else {
          const key = sortConfig.key as keyof Account;
          if (key === 'hasSkins') {
            const valA = a.hasSkins ? 1 : 0;
            const valB = b.hasSkins ? 1 : 0;
            if (valA < valB) return sortConfig.direction === 'ascending' ? -1 : 1;
            if (valA > valB) return sortConfig.direction === 'ascending' ? 1 : -1;
            return 0;
          }
          if (a[key] < b[key]) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (a[key] > b[key]) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }
      });
    }
    return sortableItems;
  }, [accounts, ranks, sortConfig]);

  const handleFetchRank = async (index: number, account: Account) => {
    setLoadingRanks(prev => ({ ...prev, [index]: true }));
    try {
      const rankInfo = await RankService.fetchRank(account);
      setRanks(prevRanks => ({ ...prevRanks, [index]: rankInfo }));
    } catch (error) {
      console.error(`Failed to fetch rank for ${account.username}:`, error);
      setRanks(prevRanks => ({
        ...prevRanks,
        [index]: { rank: 'Account Private', icon: '', color: theme.colors.error },
      }));
    } finally {
      setLoadingRanks(prev => ({ ...prev, [index]: false }));
    }
  };

  const handleFetchAllRanks = async () => {
    setIsFetchingAll(true);
    const accountsToFetch = [...accounts];
    const concurrencyLimit = 1;

    for (let i = 0; i < accountsToFetch.length; i += concurrencyLimit) {
      const chunk = accountsToFetch.slice(i, i + concurrencyLimit);
      const promises = chunk.map(async (account) => {
        const globalIndex = accounts.indexOf(account);
        if (globalIndex !== -1) {
          setCurrentlyFetchingIndex(globalIndex); // Indicate current fetch
          try {
            const rankInfo = await RankService.fetchRank(account);
            return { index: globalIndex, rankInfo };
          } catch (error) {
            console.error(`Failed to fetch rank for ${account.username}:`, error);
            const errorInfo = { rank: 'Account Private', icon: '', color: theme.colors.error };
            return { index: globalIndex, rankInfo: errorInfo };
          }
        }
        return null;
      });

      const results = await Promise.all(promises);
      const newRanks: { [key: number]: RankInfo } = {};
      results.forEach(result => {
        if (result) {
          newRanks[result.index] = result.rankInfo;
        }
      });
      setRanks(prevRanks => ({ ...prevRanks, ...newRanks }));
    }
    setIsFetchingAll(false);
    setCurrentlyFetchingIndex(null); // Clear indicator when done
  };

  useEffect(() => {
    if (accounts.length > 0) {
      handleFetchAllRanks();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [accounts]);

  const togglePasswordVisibility = (index: number) => {
    setVisiblePasswords(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(err => {
      console.error('Failed to copy text: ', err);
    });
  };

  return (
    <TableContainer>
      <Table>
        <thead>
          <tr>
            <TableHeader onClick={() => requestSort('riotId')} style={{ width: '15%' }}>Riot ID</TableHeader>
            <TableHeader onClick={() => requestSort('username')} style={{ width: '12%' }}>Username</TableHeader>
            <TableHeader style={{ width: '12%' }}>Password</TableHeader>
            <TableHeader onClick={() => requestSort('hasSkins')} style={{ width: '8%', textAlign: 'center' }}>Skins</TableHeader>
            <TableHeader onClick={() => requestSort('rank')} style={{ width: '35%' }}>
              <RankHeaderContent>
                <span>Rank</span>
                <Button onClick={(e) => { e.stopPropagation(); handleFetchAllRanks(); }} disabled={isFetchingAll}>
                  {isFetchingAll ? <Spinner /> : 'Refresh All'}
                </Button>
              </RankHeaderContent>
            </TableHeader>
            <TableHeader style={{ width: '18%' }}>Actions</TableHeader>
          </tr>
        </thead>
        <tbody>
          {sortedAccounts.map((account) => {
            const globalIndex = accounts.indexOf(account);
            const rankInfo = ranks[globalIndex];
            const isLoading = loadingRanks[globalIndex];
            const isPasswordVisible = visiblePasswords[globalIndex];
            const isCurrentlyFetching = currentlyFetchingIndex === globalIndex;

            return (
              <TableRow key={account.id} style={{ background: isCurrentlyFetching ? theme.colors.primary + '30' : undefined }}>
                <TableCell 
                  onClick={() => copyToClipboard(`${account.riotId}#${account.hashtag}`)}
                  style={{ cursor: 'pointer' }}
                  title="Click to copy"
                >
                  {account.riotId}#{account.hashtag}
                </TableCell>
                <TableCell
                  onClick={() => copyToClipboard(account.username)}
                  style={{ cursor: 'pointer' }}
                  title="Click to copy"
                >
                  {account.username}
                </TableCell>
                <PasswordCell>
                  <PasswordContent>
                    <PasswordText 
                      onClick={() => copyToClipboard(account.password)}
                      style={{ cursor: 'pointer' }}
                      title="Click to copy"
                    >
                      {isPasswordVisible ? account.password : '••••••••'}
                    </PasswordText>
                    <EyeIcon title="Toggle visibility" onClick={() => togglePasswordVisibility(globalIndex)}>
                      👁
                    </EyeIcon>
                  </PasswordContent>
                </PasswordCell>
                <SkinsCell 
                  onClick={() => onToggleSkins(globalIndex)}
                  style={{ cursor: 'pointer' }}
                  title="Click to toggle"
                >
                  {account.hasSkins ? '✔️' : '❌'}
                </SkinsCell>
                <RankCell $rankColor={rankInfo?.color}>
                  <RankContent>
                    {isLoading ? (
                      <Spinner />
                    ) : rankInfo ? (
                      <>
                        {rankInfo.icon && rankInfo.icon !== '/icons/' && rankInfo.icon !== './icons/' && <RankIcon src={rankInfo.icon} alt={rankInfo.rank} />}
                        {rankInfo.rank}
                      </>
                    ) : (
                      'N/A'
                    )}
                  </RankContent>
                </RankCell>
                <TableCell>
                  <ActionButtonContainer>
                    <Button onClick={() => onEdit(account, globalIndex)}>Edit</Button>
                    <Button onClick={() => onDelete(globalIndex)} variant="danger">Delete</Button>
                    <Button onClick={() => handleFetchRank(globalIndex, account)} disabled={isLoading}>
                      {isLoading ? <Spinner /> : 'Refresh'}
                    </Button>
                    <Button onClick={() => handleShareAccount(account, globalIndex)} variant="secondary">Share</Button>
                  </ActionButtonContainer>
                </TableCell>
              </TableRow>
            );
          })}
        </tbody>
      </Table>
    </TableContainer>
  );
};