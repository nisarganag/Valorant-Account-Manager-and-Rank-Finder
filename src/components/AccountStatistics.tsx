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
  display: flex; align-items: center; gap: 16px; margin-bottom: 24px;
`;

const StatsTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: 16px; margin: 0; font-weight: 600;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: 16px; margin-bottom: 24px;
`;

const StatCard = styled.div`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: 8px; padding: 16px; text-align: center;
  &:hover { border-color: ${props => props.theme.colors.primary}; transform: translateY(-2px); }
`;

const StatValue = styled.div`
  font-size: 20px; font-weight: 700; color: ${props => props.theme.colors.primary}; margin-bottom: 4px;
`;

const StatLabel = styled.div`
  font-size: 12px; color: ${props => props.theme.colors.text.secondary}; text-transform: uppercase; letter-spacing: 0.5px;
`;

const RankDistributionContainer = styled.div` margin-top: 24px; `;
const RankDistributionTitle = styled.h4` color: ${props => props.theme.colors.text.primary}; margin-bottom: 16px; font-size: 14px; `;
const RankDistributionGrid = styled.div` display: grid; grid-template-columns: repeat(auto-fill, minmax(120px, 1fr)); gap: 8px; `;
const RankItem = styled.div`
  display: flex; flex-direction: column; align-items: center;
  padding: 8px; background: ${props => props.theme.colors.background};
  border-radius: 8px; border: 1px solid ${props => props.theme.colors.border};
  &:hover { border-color: ${props => props.theme.colors.primary}; }
`;
const RankName = styled.span` font-size: 12px; color: ${props => props.theme.colors.text.secondary}; margin-top: 4px; text-align: center; `;
const RankCount = styled.span` font-size: 16px; font-weight: 600; color: ${props => props.theme.colors.text.primary}; `;

interface RankInfo {
  rank: string;
  color: string;
}

interface AccountStatisticsProps {
  accounts: Account[];
  isVisible: boolean;
  onClose: () => void;
  ranks?: { [key: number]: RankInfo };
}

export const AccountStatistics: React.FC<AccountStatisticsProps> = ({
  accounts, isVisible, onClose, ranks = {}
}) => {
  if (!isVisible) return null;

  const totalAccounts = accounts.length;
  const accountsWithSkins = accounts.filter(acc => acc.hasSkins).length;
  const regions = [...new Set(accounts.map(acc => acc.region))];
  const totalRegions = regions.length;
  const accountsLent = accounts.filter(a => a.lentTo).length;
  const totalTags = new Set(accounts.flatMap(a => a.tags || [])).size;

  const rankDistribution = accounts.reduce((acc, account, i) => {
    const rank = ranks[i]?.rank || account.currentRank || 'Unranked';
    acc[rank] = (acc[rank] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  const sortedRanks = Object.entries(rankDistribution).sort(([, a], [, b]) => b - a);

  // Region distribution
  const regionDistribution = regions.reduce((acc, region) => {
    acc[region] = accounts.filter(a => a.region === region).length;
    return acc;
  }, {} as Record<string, number>);

  return (
    <StatsContainer>
      <StatsHeader>
        <span style={{ fontSize: '24px' }}>📊</span>
        <StatsTitle>Account Statistics</StatsTitle>
        <button onClick={onClose} style={{ marginLeft: 'auto', background: 'none', border: 'none', fontSize: '24px', cursor: 'pointer', color: 'inherit' }}>
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
          <StatLabel>With Skins</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{totalRegions}</StatValue>
          <StatLabel>Regions Used</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{((accountsWithSkins / totalAccounts) * 100 || 0).toFixed(1)}%</StatValue>
          <StatLabel>Skin Coverage</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{accountsLent}</StatValue>
          <StatLabel>Lent Out</StatLabel>
        </StatCard>
        <StatCard>
          <StatValue>{totalTags}</StatValue>
          <StatLabel>Tags Used</StatLabel>
        </StatCard>
      </StatsGrid>

      {/* Region distribution */}
      {Object.keys(regionDistribution).length > 0 && (
        <>
          <RankDistributionTitle>🌍 Region Distribution</RankDistributionTitle>
          <RankDistributionGrid>
            {Object.entries(regionDistribution).map(([region, count]) => (
              <RankItem key={region}>
                <RankCount>{count}</RankCount>
                <RankName>{region.toUpperCase()}</RankName>
              </RankItem>
            ))}
          </RankDistributionGrid>
        </>
      )}

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
