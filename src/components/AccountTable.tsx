import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import type { Account } from '../types';

interface AccountTableProps {
  accounts: Account[];
  onDelete: (index: number) => void;
  onEdit: (account: Account, index: number) => void;
  onToggleSkins: (index: number) => void;
  sortConfig: { key: keyof Account | 'rank'; direction: 'ascending' | 'descending' } | null;
  requestSort: (key: keyof Account | 'rank') => void;
  ranks: { [key: number]: RankInfo };
  loadingRanks: Set<number>;
  onRefreshRank: (index: number, account: Account) => Promise<void>;
  onRefreshAll: () => Promise<void>;
  currentlyFetchingIndex: number | null;
  isFetchingAll: boolean;
  onStopFetching: () => void;
  selectedAccounts: Set<number>;
  onToggleSelect: (index: number) => void;
  onSelectAll: () => void;
  allSelected: boolean;
  compactView: boolean;
  rankHistories: { [accountId: string]: { history: any[]; peakRank: string; peakRR: number; peakIcon: string } };
  onShowRankHistory: (accountId: string) => void;
  onUpdateLending: (accountId: string, lentTo: string) => void;
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
  return value === -1 ? -1 : value;
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

const Table = styled.table<{ $compact?: boolean }>`
  width: 100%;
  border-collapse: collapse;
  font-family: ${props => props.theme.fonts.primary};
  td, th { ${props => props.$compact ? 'padding: 4px 6px; font-size: 12px;' : ''} }
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
  &:hover { background: ${props => props.theme.colors.background}E0; }
`;

const TableRow = styled.tr<{ $highlighted?: boolean }>`
  &:nth-child(even) { background: ${props => props.theme.colors.background}20; }
  &:hover { background: ${props => props.theme.colors.primary}15; }
  ${props => props.$highlighted ? `background: ${props.theme.colors.primary}20 !important;` : ''}
`;

const TableCell = styled.td<{ $compact?: boolean }>`
  padding: ${props => props.theme.sizes.spacing.md};
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  border-bottom: 1px solid ${props => props.theme.colors.border};
  white-space: nowrap;
  vertical-align: middle;
  box-sizing: border-box;
  text-align: center;
  ${props => props.$compact ? 'padding: 4px 6px; font-size: 12px;' : ''}
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
  justify-content: center;
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
  justify-content: center;
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
  &:hover:not(:disabled) { opacity: 0.8; }
  &:disabled { background-color: transparent; border-color: ${props => props.theme.colors.border}; cursor: not-allowed; opacity: 0.6; }
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 24px; height: 24px;
  border: 3px solid ${props => props.theme.colors.primary}50;
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

const PasswordCell = styled(TableCell)` vertical-align: middle; `;
const PasswordContent = styled.div` display: flex; align-items: center; gap: 8px; justify-content: center; `;
const PasswordText = styled.span`
  font-family: ${props => props.theme.fonts.mono};
  letter-spacing: 0.05em; user-select: none;
  min-width: 80px;
  &:hover { opacity: 0.7; }
`;

const EyeIcon = styled.span`
  cursor: pointer; font-size: 1.2em;
  &:hover { transform: scale(1.2); color: ${props => props.theme.colors.primary}; }
`;

const ShareIcon = styled.span`
  cursor: pointer; font-size: 1.2em;
  &:hover { transform: scale(1.2); color: ${props => props.theme.colors.primary}; }
`;

const CheckCell = styled(TableCell)` width: 40px; padding: 8px; `;
const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 16px; height: 16px; cursor: pointer; accent-color: ${props => props.theme.colors.primary};
`;

const TagBadge = styled.span`
  padding: 1px 6px;
  border-radius: 8px;
  background: ${props => props.theme.colors.primary}15;
  color: ${props => props.theme.colors.primary};
  font-size: 10px;
  margin: 0 1px;
`;

const LentBadge = styled.span`
  padding: 2px 8px;
  border-radius: 8px;
  background: ${props => props.theme.colors.warning}20;
  color: ${props => props.theme.colors.warning};
  font-size: 10px;
`;

const HistoryBtn = styled.button`
  background: none; border: 1px solid ${p => p.theme.colors.border};
  border-radius: 4px; cursor: pointer; font-size: 12px; padding: 2px 6px;
  color: ${p => p.theme.colors.text.secondary};
  &:hover { border-color: ${p => p.theme.colors.primary}; color: ${p => p.theme.colors.primary}; }
`;

const LendingInput = styled.input`
  width: 90px;
  padding: 2px 6px;
  border: 1px solid ${p => p.theme.colors.border};
  border-radius: 4px;
  background: transparent;
  color: ${p => p.theme.colors.text.primary};
  font-size: 11px;
  &:focus { outline: none; border-color: ${p => p.theme.colors.primary}; }
  &::placeholder { color: ${p => p.theme.colors.text.secondary}; }
`;

// Share modal components (same as before)
const ShareModal = styled.div<{ $isOpen: boolean }>`
  position: fixed; top: 0; left: 0; width: 100%; height: 100%;
  background: rgba(0, 0, 0, 0.7);
  display: ${props => props.$isOpen ? 'flex' : 'none'};
  justify-content: center; align-items: center; z-index: 1000;
`;
const ShareModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.lg};
  max-width: 400px; width: 90%; position: relative;
`;
const ShareModalHeader = styled.div` display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px; `;
const CloseButton = styled.button`
  background: none; border: none; color: ${props => props.theme.colors.text.secondary};
  font-size: 24px; cursor: pointer; padding: 0;
  &:hover { color: ${props => props.theme.colors.primary}; }
`;
const ShareOptionsGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fit, minmax(100px, 1fr)); gap: 16px; margin-bottom: 16px; `;
const ShareOption = styled.button`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: 16px; cursor: pointer;
  display: flex; flex-direction: column; align-items: center; gap: 4px;
  &:hover { background: ${props => props.theme.colors.border}40; transform: translateY(-2px); }
`;
const ShareOptionIcon = styled.div` font-size: 24px; color: ${props => props.theme.colors.primary}; `;
const ShareOptionLabel = styled.span` color: ${props => props.theme.colors.text.primary}; font-size: 12px; font-weight: 500; `;

export const AccountTable: React.FC<AccountTableProps> = ({
  accounts, onEdit, onDelete, onToggleSkins, sortConfig, requestSort,
  ranks, loadingRanks, onRefreshRank, onRefreshAll, currentlyFetchingIndex,
  isFetchingAll, onStopFetching, selectedAccounts, onToggleSelect, onSelectAll, allSelected,
  compactView, rankHistories, onShowRankHistory, onUpdateLending,
}) => {
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({});
  const [shareModalOpen, setShareModalOpen] = useState(false);
  const [accountToShare, setAccountToShare] = useState<{ account: Account; index: number } | null>(null);

  const openShareModal = (account: Account, index: number) => {
    setAccountToShare({ account, index });
    setShareModalOpen(true);
  };

  const closeShareModal = () => {
    setShareModalOpen(false);
    setAccountToShare(null);
  };

  const getAccountDetails = (account: Account, index: number) => {
    const rankInfo = ranks[index];
    return `🎮 Valorant Account Details 🎮\n\n📋 Riot ID: ${account.riotId}#${account.hashtag}\n👤 Username: ${account.username || 'Not provided'}\n🌍 Region: ${account.region.toUpperCase()}\n🏆 Rank: ${rankInfo?.rank || 'Unknown'}\n✨ Has Skins: ${account.hasSkins ? 'Yes' : 'No'}${account.lentTo ? `\n👤 Lent to: ${account.lentTo}` : ''}\n📅 Last Updated: ${account.lastRefreshed ? new Date(account.lastRefreshed).toLocaleDateString() : 'Never'}\n\n--\nShared via Valorant Account Manager`;
  };

  const shareToApp = (app: string) => {
    if (!accountToShare) return;
    const text = getAccountDetails(accountToShare.account, accountToShare.index);
    const encodedText = encodeURIComponent(text);
    const shareUrls: Record<string, string> = {
      whatsapp: `https://api.whatsapp.com/send?text=${encodedText}`,
      telegram: `https://t.me/share/url?text=${encodedText}`,
      twitter: `https://twitter.com/intent/tweet?text=${encodedText}`,
      discord: `https://discord.com/channels/@me`,
      facebook: `https://www.facebook.com/sharer/sharer.php?u=${encodedText}`,
      email: `mailto:?subject=Valorant Account Details&body=${encodedText}`,
    };
    if (shareUrls[app]) {
      window.open(shareUrls[app], '_blank');
      closeShareModal();
    }
  };

  const copyAccountDetailsToClipboard = () => {
    if (!accountToShare) return;
    const text = getAccountDetails(accountToShare.account, accountToShare.index);
    navigator.clipboard.writeText(text).then(() => {
      alert('Account details copied to clipboard!');
      closeShareModal();
    }).catch(() => {
      const textArea = document.createElement('textarea');
      textArea.value = text;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      alert('Account details copied to clipboard!');
      closeShareModal();
    });
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
          const aValue = a[key];
          const bValue = b[key];
          if (aValue === undefined && bValue === undefined) return 0;
          if (aValue === undefined) return sortConfig.direction === 'ascending' ? 1 : -1;
          if (bValue === undefined) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aValue < bValue) return sortConfig.direction === 'ascending' ? -1 : 1;
          if (aValue > bValue) return sortConfig.direction === 'ascending' ? 1 : -1;
          return 0;
        }
      });
    }
    return sortableItems;
  }, [accounts, ranks, sortConfig]);

  const togglePasswordVisibility = (index: number) => {
    setVisiblePasswords(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  const cellProps = compactView ? { $compact: true } : {};

  return (
    <>
      <TableContainer>
        <Table $compact={compactView}>
          <thead>
            <tr>
              <TableHeader onClick={onSelectAll} style={{ width: '30px', cursor: 'pointer' }}>
                <Checkbox checked={allSelected} readOnly />
              </TableHeader>
              <TableHeader onClick={() => requestSort('riotId')} style={{ width: compactView ? '10%' : '12%' }}>Riot ID</TableHeader>
              <TableHeader onClick={() => requestSort('username')} style={{ width: '10%' }}>Username</TableHeader>
              <TableHeader style={{ width: '10%' }}>Password</TableHeader>
              <TableHeader onClick={() => requestSort('hasSkins')} style={{ width: '6%' }}>Skins</TableHeader>
              <TableHeader onClick={() => requestSort('rank')} style={{ width: '22%' }}>
                <RankHeaderContent>
                  <span>Rank</span>
                  {isFetchingAll ? (
                    <Button onClick={(e) => { e.stopPropagation(); onStopFetching(); }} variant="danger">Stop</Button>
                  ) : (
                    <Button onClick={(e) => { e.stopPropagation(); onRefreshAll(); }}>Refresh All</Button>
                  )}
                </RankHeaderContent>
              </TableHeader>
              <TableHeader>Tags</TableHeader>
              <TableHeader style={{ width: '8%' }}>Lent To</TableHeader>
              <TableHeader style={{ width: compactView ? '8%' : '12%' }}>Notes</TableHeader>
              <TableHeader style={{ width: '16%' }}>Actions</TableHeader>
            </tr>
          </thead>
          <tbody>
            {sortedAccounts.map((account) => {
              const globalIndex = accounts.indexOf(account);
              const rankInfo = ranks[globalIndex];
              const isLoading = loadingRanks.has(globalIndex);
              const isPasswordVisible = visiblePasswords[globalIndex];
              const isCurrentlyFetching = currentlyFetchingIndex === globalIndex;
              const isSelected = selectedAccounts.has(globalIndex);
              const history = rankHistories[account.id];

              return (
                <TableRow key={account.id} $highlighted={isCurrentlyFetching || isSelected}>
                  <CheckCell {...cellProps}>
                    <Checkbox checked={isSelected} onChange={() => onToggleSelect(globalIndex)} />
                  </CheckCell>
                  <TableCell
                    {...cellProps}
                    onClick={() => copyToClipboard(`${account.riotId}#${account.hashtag}`)}
                    style={{ cursor: 'pointer' }}
                    title="Click to copy"
                  >
                    {account.riotId}#{account.hashtag}
                  </TableCell>
                  <TableCell
                    {...cellProps}
                    onClick={() => copyToClipboard(account.username)}
                    style={{ cursor: 'pointer' }}
                    title="Click to copy"
                  >
                    {account.username}
                  </TableCell>
                  <PasswordCell {...cellProps}>
                    <PasswordContent>
                      <PasswordText onClick={() => copyToClipboard(account.password)} style={{ cursor: 'pointer' }} title="Click to copy">
                        {isPasswordVisible ? account.password : '••••••••'}
                      </PasswordText>
                      <EyeIcon title="Toggle visibility" onClick={() => togglePasswordVisibility(globalIndex)}>👁</EyeIcon>
                    </PasswordContent>
                  </PasswordCell>
                  <SkinsCell {...cellProps} onClick={() => onToggleSkins(globalIndex)} style={{ cursor: 'pointer' }} title="Click to toggle">
                    {account.hasSkins ? '✔️' : '❌'}
                  </SkinsCell>
                  <RankCell {...cellProps} $rankColor={rankInfo?.color}>
                    <RankContent>
                      {isLoading ? <Spinner /> : rankInfo ? (
                        <>
                          {rankInfo.icon && <RankIcon src={rankInfo.icon} alt={rankInfo.rank} />}
                          {rankInfo.rank}
                          {/* peak rank hidden */}
                        </>
                      ) : 'N/A'}
                    </RankContent>
                  </RankCell>
                  <TableCell {...cellProps}>
                    {(account.tags || []).map((t) => <TagBadge key={t}>{t}</TagBadge>)}
                  </TableCell>
                  <TableCell {...cellProps}>
                    {account.lentTo ? (
                      <LentBadge title={`Since ${account.lentSince ? new Date(account.lentSince).toLocaleDateString() : '?'}`}>
                        {account.lentTo}
                      </LentBadge>
                    ) : (
                      <LendingInput
                        placeholder="Name..."
                        onBlur={(e) => { if (e.target.value.trim()) onUpdateLending(account.id, e.target.value.trim()); }}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' && (e.target as HTMLInputElement).value.trim()) {
                            onUpdateLending(account.id, (e.target as HTMLInputElement).value.trim());
                            (e.target as HTMLInputElement).value = '';
                          }
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell {...cellProps} style={{ maxWidth: '100px', overflow: 'hidden', textOverflow: 'ellipsis' }} title={account.notes}>
                    {account.notes || '-'}
                  </TableCell>
                  <TableCell {...cellProps}>
                    <ActionButtonContainer>
                      <Button onClick={() => onEdit(account, globalIndex)}>Edit</Button>
                      <Button onClick={() => onDelete(globalIndex)} variant="danger">Delete</Button>
                      <Button onClick={() => onRefreshRank(globalIndex, account)} disabled={isLoading}>
                        {isLoading ? <Spinner /> : 'Refresh'}
                      </Button>
                      {history && history.history.length > 0 && (
                        <HistoryBtn onClick={() => onShowRankHistory(account.id)} title="Rank history">📈</HistoryBtn>
                      )}
                      <ShareIcon onClick={() => openShareModal(account, globalIndex)} title="Share">↗</ShareIcon>
                    </ActionButtonContainer>
                  </TableCell>
                </TableRow>
              );
            })}
          </tbody>
        </Table>
      </TableContainer>

      {shareModalOpen && accountToShare && (
        <ShareModal $isOpen={shareModalOpen} onClick={closeShareModal}>
          <ShareModalContent onClick={(e) => e.stopPropagation()}>
            <ShareModalHeader>
              <h3>Share Account Details</h3>
              <CloseButton onClick={closeShareModal}>✕</CloseButton>
            </ShareModalHeader>
            <p>Share {accountToShare.account.riotId}#{accountToShare.account.hashtag} details via:</p>
            <ShareOptionsGrid>
              {[
                { id: 'whatsapp', label: 'WhatsApp', icon: '📱' },
                { id: 'telegram', label: 'Telegram', icon: '✈️' },
                { id: 'discord', label: 'Discord', icon: '💬' },
                { id: 'twitter', label: 'Twitter', icon: '🐦' },
                { id: 'email', label: 'Email', icon: '📧' },
                { id: 'clipboard', label: 'Copy', icon: '📋', onClick: copyAccountDetailsToClipboard },
              ].map((opt) => (
                <ShareOption key={opt.id} onClick={() => opt.onClick ? opt.onClick() : shareToApp(opt.id)}>
                  <ShareOptionIcon>{opt.icon}</ShareOptionIcon>
                  <ShareOptionLabel>{opt.label}</ShareOptionLabel>
                </ShareOption>
              ))}
            </ShareOptionsGrid>
          </ShareModalContent>
        </ShareModal>
      )}
    </>
  );
};
