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

const AccountCard = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.lg};
  transition: ${props => props.theme.effects.transition};
  animation: ${fadeIn} 0.3s ease-out;
  box-shadow: ${props => props.theme.effects.cardShadow};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
    box-shadow: 0 8px 25px rgba(0, 0, 0, 0.15);
  }
`;

const CardHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: ${props => props.theme.sizes.spacing.md};
`;

const AccountInfo = styled.div`
  flex: 1;
`;

const RiotId = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  margin: 0 0 ${props => props.theme.sizes.spacing.xs} 0;
  font-size: ${props => props.theme.sizes.fontSize.large};
  font-weight: 600;
`;

const Region = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const CardActions = styled.div`
  display: flex;
  gap: ${props => props.theme.sizes.spacing.xs};
`;

const ActionButton = styled.button`
  background: none;
  border: none;
  cursor: pointer;
  font-size: 16px;
  padding: ${props => props.theme.sizes.spacing.xs};
  border-radius: 4px;
  transition: ${props => props.theme.effects.transition};
  
  &:hover {
    background: ${props => props.theme.colors.border}40;
  }
`;

const CardContent = styled.div`
  display: flex;
  flex-direction: column;
  gap: ${props => props.theme.sizes.spacing.md};
`;

const InfoRow = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: ${props => props.theme.sizes.spacing.sm};
  background: ${props => props.theme.colors.background}40;
  border-radius: ${props => props.theme.sizes.borderRadius};
`;

const InfoLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  font-weight: 500;
`;

const InfoValue = styled.span`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  cursor: pointer;
  
  &:hover {
    opacity: 0.8;
  }
`;

const RankDisplay = styled.div<{ $rankColor?: string }>`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.sizes.spacing.sm};
  padding: ${props => props.theme.sizes.spacing.sm};
  background: ${props => props.theme.colors.background}60;
  border-radius: ${props => props.theme.sizes.borderRadius};
  border: 1px solid ${props => props.theme.colors.border};
`;

const RankIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const RankText = styled.span<{ $rankColor?: string }>`
  color: ${props => props.$rankColor || props.theme.colors.text.primary};
  font-weight: 600;
  font-size: ${props => props.theme.sizes.fontSize.medium};
`;

const SkinsIndicator = styled.div<{ hasSkins: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border-radius: 50%;
  background: ${props => props.hasSkins ? props.theme.colors.success + '20' : props.theme.colors.error + '20'};
  border: 1px solid ${props => props.hasSkins ? props.theme.colors.success : props.theme.colors.error};
  font-size: 12px;
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  
  &:hover {
    transform: scale(1.1);
  }
`;

const NotesSection = styled.div`
  margin-top: ${props => props.theme.sizes.spacing.sm};
`;

const NotesLabel = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  font-weight: 500;
  margin-bottom: ${props => props.theme.sizes.spacing.xs};
`;

const NotesText = styled.div`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  line-height: 1.4;
  padding: ${props => props.theme.sizes.spacing.sm};
  background: ${props => props.theme.colors.background}40;
  border-radius: ${props => props.theme.sizes.borderRadius};
  border-left: 3px solid ${props => props.theme.colors.primary};
  font-style: italic;
`;

const rotate = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const Spinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.theme.colors.primary}50;
  border-top-color: ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${rotate} 1s linear infinite;
`;

const PasswordContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.sizes.spacing.xs};
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

export const AccountGrid: React.FC<AccountGridProps> = ({ 
  accounts, 
  onDelete, 
  onEdit, 
  onToggleSkins,
  ranks,
  loadingRanks}) => {
  const [visiblePasswords, setVisiblePasswords] = useState<{ [key: number]: boolean }>({});

  const togglePasswordVisibility = (index: number) => {
    setVisiblePasswords(prev => ({ ...prev, [index]: !prev[index] }));
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
  };

  return (
    <GridContainer>
      {accounts.map((account, index) => {
        const rankInfo = ranks[index];
        const isLoading = loadingRanks.has(index);
        const isPasswordVisible = visiblePasswords[index];

        return (
          <AccountCard key={account.id}>
            <CardHeader>
              <AccountInfo>
                <RiotId>{account.riotId}#{account.hashtag}</RiotId>
                <Region>{account.region}</Region>
              </AccountInfo>
              <CardActions>
                <ActionButton
                  onClick={() => onEdit(account, index)}
                  title="Edit Account"
                >
                  ✏️
                </ActionButton>
                <ActionButton
                  onClick={() => onDelete(index)}
                  title="Delete Account"
                >
                  🗑️
                </ActionButton>
              </CardActions>
            </CardHeader>

            <CardContent>
              <InfoRow>
                <InfoLabel>Username:</InfoLabel>
                <InfoValue
                  onClick={() => copyToClipboard(account.username)}
                  title="Click to copy"
                >
                  {account.username}
                </InfoValue>
              </InfoRow>

              <InfoRow>
                <InfoLabel>Password:</InfoLabel>
                <PasswordContainer>
                  <InfoValue
                    onClick={() => copyToClipboard(account.password)}
                    title="Click to copy"
                  >
                    {isPasswordVisible ? account.password : '••••••••'}
                  </InfoValue>
                  <EyeIcon title="Toggle visibility" onClick={() => togglePasswordVisibility(index)}>
                    👁
                  </EyeIcon>
                </PasswordContainer>
              </InfoRow>

              <InfoRow>
                <InfoLabel>Skins:</InfoLabel>
                <SkinsIndicator
                  hasSkins={account.hasSkins}
                  onClick={() => onToggleSkins(index)}
                  title="Click to toggle"
                >
                  {account.hasSkins ? '✔️' : '❌'}
                </SkinsIndicator>
              </InfoRow>

              <RankDisplay $rankColor={rankInfo?.color}>
                {isLoading ? (
                  <Spinner />
                ) : rankInfo ? (
                  <>
                    {rankInfo.icon && <RankIcon src={rankInfo.icon} alt={rankInfo.rank} />}
                    <RankText $rankColor={rankInfo.color}>{rankInfo.rank}</RankText>
                  </>
                ) : (
                  <RankText>Loading rank...</RankText>
                )}
              </RankDisplay>

              {account.notes && (
                <NotesSection>
                  <NotesLabel>📝 Notes:</NotesLabel>
                  <NotesText>{account.notes}</NotesText>
                </NotesSection>
              )}
            </CardContent>
          </AccountCard>
        );
      })}
    </GridContainer>
  );
};