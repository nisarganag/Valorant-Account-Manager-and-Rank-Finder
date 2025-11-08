import React from 'react';
import styled, { keyframes } from 'styled-components';
import type { Account } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const StatsContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.lg};
  margin: ${props => props.theme.sizes.spacing.md} 0;
  animation: ${fadeIn} 0.3s ease-out;
  transition: ${props => props.theme.effects.transition};
`;

const StatsHeader = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.sizes.spacing.md};
  margin-bottom: ${props => props.theme.sizes.spacing.lg};
`;

const StatsTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.sizes.fontSize.large};
  margin: 0;
  font-weight: 600;
`;

const StatsIcon = styled.div`
  font-size: ${props => props.theme.sizes.fontSize.xlarge};
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: ${props => props.theme.sizes.spacing.md};
  margin-bottom: ${props => props.theme.sizes.spacing.lg};
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.md};
  text-align: center;
  transition: ${props => props.theme.effects.transition};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    transform: translateY(-2px);
  }
`;

const StatValue = styled.div`
  font-size: ${props => props.theme.sizes.fontSize.xlarge};
  font-weight: 700;
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.sizes.spacing.xs};
`;

const StatLabel = styled.div`
  font-size: ${props => props.theme.sizes.fontSize.small};
  color: ${props => props.theme.colors.text.secondary};
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

const RankDistributionContainer = styled.div`
  margin-top: ${props => props.theme.sizes.spacing.lg};
`;

const RankDistributionTitle = styled.h4`
  color: ${props => props.theme.colors.text.primary};
  margin-bottom: ${props => props.theme.sizes.spacing.md};
  font-size: ${props => props.theme.sizes.fontSize.medium};
`;

const RankDistributionGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
  gap: ${props => props.theme.sizes.spacing.sm};
`;

const RankItem = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: ${props => props.theme.sizes.spacing.sm};
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.sizes.borderRadius};
  border: 1px solid ${props => props.theme.colors.border};
  transition: ${props => props.theme.effects.transition};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
  }
`;

const RankName = styled.span`
  font-size: ${props => props.theme.sizes.fontSize.small};
  color: ${props => props.theme.colors.text.secondary};
  margin-top: ${props => props.theme.sizes.spacing.xs};
  text-align: center;
`;

const RankCount = styled.span`
  font-size: ${props => props.theme.sizes.fontSize.medium};
  font-weight: 600;
  color: ${props => props.theme.colors.text.primary};
  margin-top: 2px;
`;

interface AccountStatisticsProps {
  accounts: Account[];
  isVisible: boolean;
  onClose: () => void;
}

export const AccountStatistics: React.FC<AccountStatisticsProps> = ({ 
  accounts, 
  isVisible, 
  onClose 
}) => {
  if (!isVisible) return null;

  // Calculate basic statistics
  const totalAccounts = accounts.length;
  const accountsWithSkins = accounts.filter(acc => acc.hasSkins).length;
  const regions = [...new Set(accounts.map(acc => acc.region))];
  const totalRegions = regions.length;
  
  // Calculate rank distribution
  const rankDistribution = accounts.reduce((acc, account) => {
    const rank = account.currentRank || 'Unranked';
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Sort ranks by count (descending)
  const sortedRanks = Object.entries(rankDistribution)
    .sort(([, a], [, b]) => b - a);

  return (
    <StatsContainer>
      <StatsHeader>
        <StatsIcon>📊</StatsIcon>
        <StatsTitle>Account Statistics</StatsTitle>
        <button
          onClick={onClose}
          style={{
            marginLeft: 'auto',
            background: 'none',
            border: 'none',
            fontSize: '24px',
            cursor: 'pointer',
            color: 'inherit'
          }}
        >
          ×
        </button>
      </StatsHeader>
      
      <StatsGrid>
        <StatCard>
          <StatValue>{totalAccounts}</StatValue>
          <StatLabel>Total Accounts</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{accountsWithSkins}</StatValue>
          <StatLabel>Accounts with Skins</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{totalRegions}</StatValue>
          <StatLabel>Regions Used</StatLabel>
        </StatCard>
        
        <StatCard>
          <StatValue>{((accountsWithSkins / totalAccounts) * 100 || 0).toFixed(1)}%</StatValue>
          <StatLabel>Skin Coverage</StatLabel>
        </StatCard>
      </StatsGrid>

      {totalAccounts > 0 && (
        <RankDistributionContainer>
          <RankDistributionTitle>🏆 Rank Distribution</RankDistributionTitle>
          <RankDistributionGrid>
            {sortedRanks.map(([rank, count]) => (
              <RankItem key={rank}>
                <RankCount>{count}</RankCount>
                <RankName>{rank}</RankName>
              </RankItem>
            ))}
          </RankDistributionGrid>
        </RankDistributionContainer>
      )}
    </StatsContainer>
  );
};