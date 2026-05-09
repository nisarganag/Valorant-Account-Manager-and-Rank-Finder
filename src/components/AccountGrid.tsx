import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';
import type { Account } from '../types';

interface AccountGridProps {
  accounts: Account[];
  onDelete: (index: number) => void;
  onEdit: (account: Account, index: number) => void;
  onToggleSkins: (index: number) => void;
  ranks: { [key: number]: RankInfo };
  loadingRanks: Set<number>;
  onRefreshRank: (index: number, account: Account) => Promise<void>;
  currentlyFetchingIndex: number | null;
  isFetchingAll: boolean;
  onStopFetching: () => void;
  selectedAccounts: Set<number>;
  onToggleSelect: (index: number) => void;
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

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const GridContainer = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(320px, 1fr));
  gap: ${props => props.theme.sizes.spacing.lg};
  padding: ${props => props.theme.sizes.spacing.md};
`;

const AccountCard = styled.div<{ $selected?: boolean; $highlighted?: boolean }>`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.$selected ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.lg};
  transition: ${props => props.theme.effects.transition};
  animation: ${fadeIn} 0.3s ease-out;
  box-shadow: ${props => props.theme.effects.cardShadow};
  ${props => props.$highlighted ? `background: ${props.theme.colors.primary}15 !important;` : ''}
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div` display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 12px; `;
const AccountInfo = styled.div` flex: 1; `;
const RiotId = styled.h3` color: ${props => props.theme.colors.text.primary}; margin: 0 0 4px 0; font-size: 16px; font-weight: 600; `;
const Region = styled.span` color: ${props => props.theme.colors.text.secondary}; font-size: 12px; text-transform: uppercase; letter-spacing: 0.5px; `;
const CardActions = styled.div` display: flex; gap: 4px; `;
const ActionButton = styled.button`
  background: none; border: none; cursor: pointer; font-size: 16px; padding: 4px;
  border-radius: 4px;
  &:hover { background: ${props => props.theme.colors.border}40; }
`;
const CardContent = styled.div` display: flex; flex-direction: column; gap: 12px; `;
const InfoRow = styled.div` display: flex; justify-content: space-between; align-items: center; padding: 6px; background: ${props => props.theme.colors.background}40; border-radius: 8px; `;
const InfoLabel = styled.span` color: ${props => props.theme.colors.text.secondary}; font-size: 12px; font-weight: 500; `;
const InfoValue = styled.span` color: ${props => props.theme.colors.text.primary}; font-size: 14px; cursor: pointer; &:hover { opacity: 0.8; } `;
const RankDisplay = styled.div<{ $rankColor?: string }>`
  display: flex; align-items: center; gap: 6px; padding: 6px;
  background: ${props => props.theme.colors.background}60; border-radius: 8px;
  border: 1px solid ${props => props.theme.colors.border};
`;
const RankIcon = styled.img` width: 24px; height: 24px; `;
const RankText = styled.span<{ $rankColor?: string }>` color: ${props => props.$rankColor || props.theme.colors.text.primary}; font-weight: 600; font-size: 14px; `;
const SkinsIndicator = styled.div<{ hasSkins: boolean }>`
  display: flex; align-items: center; justify-content: center;
  width: 24px; height: 24px; border-radius: 50%;
  background: ${props => props.hasSkins ? props.theme.colors.success + '20' : props.theme.colors.error + '20'};
  border: 1px solid ${props => props.hasSkins ? props.theme.colors.success : props.theme.colors.error};
  font-size: 12px; cursor: pointer;
  &:hover { transform: scale(1.1); }
`;
const NotesText = styled.div`
  color: ${props => props.theme.colors.text.primary}; font-size: 12px; line-height: 1.4;
  padding: 6px; background: ${props => props.theme.colors.background}40; border-radius: 8px;
  border-left: 3px solid ${props => props.theme.colors.primary}; font-style: italic;
`;

const rotate = keyframes` from { transform: rotate(0deg); } to { transform: rotate(360deg); } `;
const Spinner = styled.div`
  width: 20px; height: 20px;
  border: 2px solid ${props => props.theme.colors.primary}50;
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

const PasswordContainer = styled.div` display: flex; align-items: center; gap: 4px; `;
const EyeIcon = styled.span` cursor: pointer; font-size: 1.2em; &:hover { transform: scale(1.2); color: ${props => props.theme.colors.primary}; } `;

const Checkbox = styled.input.attrs({ type: 'checkbox' })`
  width: 18px; height: 18px; cursor: pointer; accent-color: ${props => props.theme.colors.primary}; margin-right: 8px;
`;

const TagBadge = styled.span`
  padding: 1px 6px; border-radius: 8px;
  background: ${props => props.theme.colors.primary}15;
  color: ${props => props.theme.colors.primary}; font-size: 10px;
  margin: 0 1px;
`;

const LentBadge = styled.span`
  padding: 2px 8px; border-radius: 8px;
  background: ${props => props.theme.colors.warning}20;
  color: ${props => props.theme.colors.warning};
  font-size: 10px;
`;

const BottomRow = styled.div` display: flex; justify-content: space-between; align-items: center; gap: 4px; `;
const MiniBtn = styled.button`
  background: none; border: 1px solid ${p => p.theme.colors.border}; border-radius: 4px;
  cursor: pointer; font-size: 11px; padding: 2px 6px;
  color: ${p => p.theme.colors.text.secondary};
  &:hover { border-color: ${p => p.theme.colors.primary}; color: ${p => p.theme.colors.primary}; }
`;

const LendingInput = styled.input`
  width: 80px; padding: 2px 6px; border: 1px solid ${p => p.theme.colors.border}; border-radius: 4px;
  background: transparent; color: ${p => p.theme.colors.text.primary}; font-size: 11px;
  &:focus { outline: none; border-color: ${p => p.theme.colors.primary}; }
  &::placeholder { color: ${p => p.theme.colors.text.secondary}; }
`;

export const AccountGrid: React.FC<AccountGridProps> = ({
  accounts, onDelete, onEdit, onToggleSkins, ranks, loadingRanks,
  selectedAccounts, onToggleSelect, rankHistories, onShowRankHistory, onUpdateLending,
}) => {
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({});

  return (
    <GridContainer>
      {accounts.map((account, index) => {
        const rankInfo = ranks[index];
        const isLoading = loadingRanks.has(index);
        const isPasswordVisible = visiblePasswords[index];
        const isSelected = selectedAccounts.has(index);
        const history = rankHistories[account.id];

        return (
          <AccountCard key={account.id} $selected={isSelected}>
            <CardHeader>
              <div style={{ display: 'flex', alignItems: 'flex-start' }}>
                <Checkbox checked={isSelected} onChange={() => onToggleSelect(index)} />
                <AccountInfo>
                  <RiotId>{account.riotId}#{account.hashtag}</RiotId>
                  <Region>{account.region}</Region>
                  {(account.tags || []).length > 0 && (
                    <div style={{ marginTop: 4 }}>{(account.tags || []).map((t) => <TagBadge key={t}>{t}</TagBadge>)}</div>
                  )}
                </AccountInfo>
              </div>
              <CardActions>
                <ActionButton onClick={() => onEdit(account, index)} title="Edit">✏️</ActionButton>
                <ActionButton onClick={() => onDelete(index)} title="Delete">🗑️</ActionButton>
              </CardActions>
            </CardHeader>

            <CardContent>
              <InfoRow>
                <InfoLabel>Username:</InfoLabel>
                <InfoValue onClick={() => navigator.clipboard.writeText(account.username)} title="Click to copy">
                  {account.username}
                </InfoValue>
              </InfoRow>

              <InfoRow>
                <InfoLabel>Password:</InfoLabel>
                <PasswordContainer>
                  <InfoValue onClick={() => navigator.clipboard.writeText(account.password)} title="Click to copy">
                    {isPasswordVisible ? account.password : '••••••••'}
                  </InfoValue>
                  <EyeIcon onClick={() => setVisiblePasswords(prev => ({ ...prev, [index]: !prev[index] }))}>👁</EyeIcon>
                </PasswordContainer>
              </InfoRow>

              <InfoRow>
                <InfoLabel>Skins:</InfoLabel>
                <SkinsIndicator hasSkins={account.hasSkins} onClick={() => onToggleSkins(index)} title="Click to toggle">
                  {account.hasSkins ? '✔️' : '❌'}
                </SkinsIndicator>
              </InfoRow>

              <RankDisplay $rankColor={rankInfo?.color}>
                {isLoading ? <Spinner /> : rankInfo ? (
                  <>
                    {rankInfo.icon && <RankIcon src={rankInfo.icon} alt={rankInfo.rank} />}
                    <RankText $rankColor={rankInfo.color}>{rankInfo.rank}</RankText>
                    {/* peak rank hidden */}
                  </>
                ) : <RankText>Loading rank...</RankText>}
              </RankDisplay>

              <InfoRow>
                <InfoLabel>Lent to:</InfoLabel>
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
              </InfoRow>

              {account.notes && (
                <NotesText>📝 {account.notes}</NotesText>
              )}

              <BottomRow>
                <MiniBtn onClick={() => onEdit(account, index)}>Edit</MiniBtn>
                <MiniBtn onClick={() => onDelete(index)} style={{ borderColor: '#FF4655', color: '#FF4655' }}>Delete</MiniBtn>
                {history && history.history.length > 0 && (
                  <MiniBtn onClick={() => onShowRankHistory(account.id)}>📈 History</MiniBtn>
                )}
              </BottomRow>
            </CardContent>
          </AccountCard>
        );
      })}
    </GridContainer>
  );
};
