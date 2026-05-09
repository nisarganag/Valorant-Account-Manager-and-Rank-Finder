import React, { useState } from 'react';
import styled, { keyframes } from 'styled-components';

const slideDown = keyframes`
  from { opacity: 0; transform: translateY(-8px); }
  to { opacity: 1; transform: translateY(0); }
`;

const Bar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 10px 16px;
  background: ${(props) => props.theme.colors.primary}15;
  border: 1px solid ${(props) => props.theme.colors.primary}40;
  border-radius: ${(props) => props.theme.sizes.borderRadius};
  margin-bottom: ${(props) => props.theme.sizes.spacing.md};
  animation: ${slideDown} 0.2s ease-out;
  flex-wrap: wrap;
`;

const Count = styled.span`
  font-weight: 700;
  color: ${(props) => props.theme.colors.primary};
  font-size: 14px;
`;

const Btn = styled.button<{ variant?: 'danger' | 'primary' | 'secondary' }>`
  padding: 6px 14px;
  border-radius: 6px;
  border: 1px solid;
  font-size: 12px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;
  background: ${(props) =>
    props.variant === 'danger'
      ? props.theme.colors.error
      : props.variant === 'primary'
        ? props.theme.colors.primary
        : 'transparent'};
  color: ${(props) => (props.variant === 'secondary' ? props.theme.colors.text.secondary : 'white')};
  border-color: ${(props) =>
    props.variant === 'danger'
      ? props.theme.colors.error
      : props.variant === 'primary'
        ? props.theme.colors.primary
        : props.theme.colors.border};
  &:hover { opacity: 0.85; transform: translateY(-1px); }
`;

const TagInput = styled.input`
  padding: 4px 8px;
  border: 1px solid ${(props) => props.theme.colors.border};
  border-radius: 4px;
  background: ${(props) => props.theme.colors.background};
  color: ${(props) => props.theme.colors.text.primary};
  font-size: 12px;
  width: 120px;
  &:focus { outline: none; border-color: ${(props) => props.theme.colors.primary}; }
`;

const TagSuggest = styled.span`
  font-size: 11px;
  color: ${(props) => props.theme.colors.primary};
  cursor: pointer;
  &:hover { text-decoration: underline; }
`;

interface Props {
  count: number;
  onDelete: () => void;
  onTag: (tag: string) => void;
  onRefresh: () => void;
  onClear: () => void;
  existingTags: string[];
}

export const BulkActionBar: React.FC<Props> = ({ count, onDelete, onTag, onRefresh, onClear, existingTags }) => {
  const [tagInput, setTagInput] = useState('');

  return (
    <Bar>
      <Count>{count} selected</Count>
      <Btn onClick={onRefresh} variant="primary">🔄 Refresh Ranks</Btn>
      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
        <TagInput
          placeholder="Add tag..."
          value={tagInput}
          onChange={(e) => setTagInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && tagInput.trim()) {
              onTag(tagInput.trim());
              setTagInput('');
            }
          }}
        />
        <Btn onClick={() => { if (tagInput.trim()) { onTag(tagInput.trim()); setTagInput(''); } }} variant="secondary">
          Tag
        </Btn>
      </div>
      {existingTags.length > 0 && (
        <div style={{ display: 'flex', gap: '4px', flexWrap: 'wrap' }}>
          {existingTags.map((t) => (
            <TagSuggest key={t} onClick={() => onTag(t)}>+{t}</TagSuggest>
          ))}
        </div>
      )}
      <Btn onClick={onDelete} variant="danger">🗑 Delete</Btn>
      <Btn onClick={onClear} variant="secondary">✕ Clear</Btn>
    </Bar>
  );
};
