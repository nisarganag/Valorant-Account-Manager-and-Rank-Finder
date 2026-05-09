import React from 'react';
import styled, { keyframes } from 'styled-components';
import type { RankHistoryEntry } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Container = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.sizes.borderRadius};
  padding: ${(p) => p.theme.sizes.spacing.lg};
  margin: ${(p) => p.theme.sizes.spacing.md} 0;
  animation: ${fadeIn} 0.3s ease-out;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3`
  color: ${(p) => p.theme.colors.text.primary};
  margin: 0;
`;

const CloseBtn = styled.button`
  background: none; border: none; font-size: 24px; cursor: pointer;
  color: ${(p) => p.theme.colors.text.secondary};
  &:hover { color: ${(p) => p.theme.colors.primary}; }
`;

const PeakBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  background: ${(p) => p.theme.colors.background};
  border-radius: ${(p) => p.theme.sizes.borderRadius};
  margin-bottom: 16px;
`;

const PeakLabel = styled.span`
  color: ${(p) => p.theme.colors.text.secondary};
  font-size: 13px;
`;

const PeakRank = styled.span<{ color?: string }>`
  color: ${(p) => p.color || p.theme.colors.text.primary};
  font-weight: 700;
  font-size: 16px;
`;

const PeakIcon = styled.img`
  width: 24px;
  height: 24px;
`;

const ChartContainer = styled.div`
  width: 100%;
  height: 200px;
  background: ${(p) => p.theme.colors.background};
  border-radius: ${(p) => p.theme.sizes.borderRadius};
  display: flex;
  align-items: flex-end;
  padding: 16px;
  gap: 4px;
  overflow-x: auto;
`;

const Bar = styled.div<{ height: number; color: string }>`
  min-width: 14px;
  height: ${(p) => p.height}%;
  background: ${(p) => p.color};
  border-radius: 2px 2px 0 0;
  transition: height 0.3s;
  position: relative;
  cursor: pointer;
  &:hover {
    opacity: 0.8;
    &::after {
      content: attr(data-tooltip);
      position: absolute;
      bottom: 100%;
      left: 50%;
      transform: translateX(-50%);
      background: ${(p) => p.theme.colors.surface};
      color: ${(p) => p.theme.colors.text.primary};
      padding: 2px 6px;
      border-radius: 4px;
      font-size: 10px;
      white-space: nowrap;
      border: 1px solid ${(p) => p.theme.colors.border};
      z-index: 100;
      margin-bottom: 4px;
    }
  }
`;

const Timeline = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 16px 0;
  font-size: 10px;
  color: ${(p) => p.theme.colors.text.secondary};
`;

const EmptyState = styled.div`
  text-align: center;
  padding: 40px;
  color: ${(p) => p.theme.colors.text.secondary};
`;

const rankOrder = ['Iron', 'Bronze', 'Silver', 'Gold', 'Platinum', 'Diamond', 'Ascendant', 'Immortal', 'Radiant'];

function rankToNumber(rank: string): number {
  const name = rank.split(' ')[0];
  const tier = parseInt(rank.split(' ')[1] || '1');
  const base = rankOrder.indexOf(name);
  return base >= 0 ? base * 3 + tier : 0;
}

interface Props {
  accountId: string;
  history: RankHistoryEntry[];
  peakRank: string;
  peakRR: number;
  peakIcon: string;
  onClose: () => void;
}

export const RankHistoryPanel: React.FC<Props> = ({ history, peakRank, peakRR, peakIcon, onClose }) => {
  const maxRank = Math.max(...history.map((h) => rankToNumber(h.rank)), 9);

  return (
    <Container>
      <Header>
        <Title>📈 Rank History</Title>
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
      </Header>

      <PeakBadge>
        <PeakLabel>Peak Rank:</PeakLabel>
        {peakIcon && <PeakIcon src={peakIcon} alt={peakRank} />}
        <PeakRank color={history[history.length - 1]?.color}>{peakRank || 'N/A'}</PeakRank>
        {peakRR > 0 && <PeakLabel>({peakRR} RR)</PeakLabel>}
      </PeakBadge>

      {history.length > 0 ? (
        <>
          <ChartContainer>
            {history.map((entry, i) => (
              <Bar
                key={i}
                height={Math.max((rankToNumber(entry.rank) / maxRank) * 100, 5)}
                color={entry.color}
                data-tooltip={`${entry.rank} (${entry.rr} RR) - ${new Date(entry.date).toLocaleDateString()}`}
              />
            ))}
          </ChartContainer>
          <Timeline>
            <span>{history[0] ? new Date(history[0].date).toLocaleDateString() : ''}</span>
            <span>{history[history.length - 1] ? new Date(history[history.length - 1].date).toLocaleDateString() : ''}</span>
          </Timeline>
        </>
      ) : (
        <EmptyState>No rank history yet. Refresh ranks to start tracking.</EmptyState>
      )}
    </Container>
  );
};
