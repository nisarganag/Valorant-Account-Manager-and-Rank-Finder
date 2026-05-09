import React, { useState, useMemo } from 'react';
import styled, { keyframes } from 'styled-components';
import type { Account } from '../types';

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
  max-height: 400px;
  overflow-y: auto;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 16px;
`;

const Title = styled.h3` color: ${(p) => p.theme.colors.text.primary}; margin: 0; `;
const CloseBtn = styled.button`
  background: none; border: none; font-size: 24px; cursor: pointer;
  color: ${(p) => p.theme.colors.text.secondary};
  &:hover { color: ${(p) => p.theme.colors.primary}; }
`;

const TagList = styled.div` display: flex; flex-wrap: wrap; gap: 6px; margin-bottom: 16px; `;

const Tag = styled.span<{ active: boolean }>`
  padding: 4px 12px;
  border-radius: 12px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  background: ${(p) => (p.active ? p.theme.colors.primary + '20' : 'transparent')};
  color: ${(p) => (p.active ? p.theme.colors.primary : p.theme.colors.text.secondary)};
  border-color: ${(p) => (p.active ? p.theme.colors.primary : p.theme.colors.border)};
  &:hover { border-color: ${(p) => p.theme.colors.primary}; }
`;

const NewTagInput = styled.input`
  padding: 4px 8px;
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 4px;
  background: ${(p) => p.theme.colors.background};
  color: ${(p) => p.theme.colors.text.primary};
  font-size: 12px;
  width: 120px;
  &:focus { outline: none; border-color: ${(p) => p.theme.colors.primary}; }
`;

const AccountRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 6px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.border}20;
`;

const AccountName = styled.span`
  color: ${(p) => p.theme.colors.text.primary};
  font-size: 13px;
  font-weight: 500;
`;

const AccountTags = styled.div`
  display: flex;
  gap: 4px;
  flex-wrap: wrap;
`;

const MiniTag = styled.span`
  padding: 1px 8px;
  border-radius: 8px;
  background: ${(p) => p.theme.colors.primary}15;
  color: ${(p) => p.theme.colors.primary};
  font-size: 10px;
  cursor: pointer;
  &:hover { background: ${(p) => p.theme.colors.error}30; }
`;

const SectionTitle = styled.h4`
  color: ${(p) => p.theme.colors.text.secondary};
  font-size: 12px;
  text-transform: uppercase;
  margin: 16px 0 8px;
`;

interface Props {
  accounts: Account[];
  allTags: string[];
  onUpdateTags: (accountId: string, tags: string[]) => void;
  onClose: () => void;
}

export const TagManager: React.FC<Props> = ({ accounts, allTags, onUpdateTags, onClose }) => {
  const [selectedGlobalTag, setSelectedGlobalTag] = useState<string>('');
  const [newTag, setNewTag] = useState('');

  const filteredAccounts = useMemo(() => {
    if (!selectedGlobalTag) return accounts;
    return accounts.filter((a) => a.tags?.includes(selectedGlobalTag));
  }, [accounts, selectedGlobalTag]);

  const handleAddTag = (accountId: string, tag: string) => {
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return;
    const tags = [...(acc.tags || []), tag].filter((v, i, arr) => arr.indexOf(v) === i);
    onUpdateTags(accountId, tags);
  };

  const handleRemoveTag = (accountId: string, tag: string) => {
    const acc = accounts.find((a) => a.id === accountId);
    if (!acc) return;
    onUpdateTags(accountId, (acc.tags || []).filter((t) => t !== tag));
  };

  const handleCreateTag = () => {
    if (newTag.trim()) {
      setSelectedGlobalTag(newTag.trim());
      setNewTag('');
    }
  };

  return (
    <Container>
      <Header>
        <Title>🏷 Tag Manager</Title>
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
      </Header>

      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '12px' }}>
        <span style={{ fontSize: '12px', color: '#888' }}>Filter by tag:</span>
        <TagList>
          <Tag active={!selectedGlobalTag} onClick={() => setSelectedGlobalTag('')}>All</Tag>
          {allTags.map((t) => (
            <Tag key={t} active={selectedGlobalTag === t} onClick={() => setSelectedGlobalTag(t)}>
              {t}
            </Tag>
          ))}
        </TagList>
        <NewTagInput
          placeholder="New tag..."
          value={newTag}
          onChange={(e) => setNewTag(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') handleCreateTag(); }}
          style={{ width: '100px' }}
        />
      </div>

      <SectionTitle>Accounts ({filteredAccounts.length})</SectionTitle>
      {filteredAccounts.map((acc) => (
        <AccountRow key={acc.id}>
          <AccountName>{acc.riotId}#{acc.hashtag}</AccountName>
          <AccountTags>
            {(acc.tags || []).map((t) => (
              <MiniTag key={t} onClick={() => handleRemoveTag(acc.id, t)} title="Click to remove">
                {t} ×
              </MiniTag>
            ))}
            {allTags.filter((t) => !(acc.tags || []).includes(t)).length > 0 && (
              <select
                value=""
                onChange={(e) => { if (e.target.value) handleAddTag(acc.id, e.target.value); }}
                style={{
                  fontSize: '10px', padding: '1px 4px', border: '1px solid #666', borderRadius: '4px',
                  background: 'transparent', color: '#888',
                }}
              >
                <option value="">+</option>
                {allTags.filter((t) => !(acc.tags || []).includes(t)).map((t) => (
                  <option key={t} value={t}>{t}</option>
                ))}
              </select>
            )}
          </AccountTags>
        </AccountRow>
      ))}
    </Container>
  );
};
