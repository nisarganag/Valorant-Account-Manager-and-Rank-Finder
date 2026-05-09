import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import type { Account } from '../types';

interface AccountFormProps {
  onSubmit: (account: Account) => void;
  initialData?: Account | null;
}

const FormContainer = styled.div`
  background: transparent;
  border: 1px solid ${props => props.theme.colors.border}40;
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.md};
  backdrop-filter: blur(10px);
  width: 100%;
  margin: 0 0 ${props => props.theme.sizes.spacing.md} 0;
`;

const FormTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.large};
  margin: 0 0 ${props => props.theme.sizes.spacing.md} 0;
  font-weight: 600;
`;

const FormGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
  gap: ${props => props.theme.sizes.spacing.md};
  flex: 1;
`;

const InputContainer = styled.div<{ wide?: boolean }>`
  display: flex;
  flex-direction: column;
  ${props => props.wide ? 'grid-column: 1 / -1;' : ''}
`;

const Label = styled.label`
  color: ${props => props.theme.colors.text.secondary};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  margin-bottom: ${props => props.theme.sizes.spacing.xs};
  font-weight: 500;
`;

const Input = styled.input`
  padding: ${props => props.theme.sizes.spacing.sm} ${props => props.theme.sizes.spacing.md};
  border: 1px solid ${props => props.theme.colors.border}60;
  border-radius: ${props => props.theme.sizes.borderRadius};
  background: ${props => props.theme.colors.background}80;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  transition: ${props => props.theme.effects.transition};
  &:focus { outline: none; border-color: ${props => props.theme.colors.primary}; background: ${props => props.theme.colors.background}; }
  &::placeholder { color: ${props => props.theme.colors.text.secondary}80; }
`;

const Select = styled.select`
  padding: ${props => props.theme.sizes.spacing.sm} ${props => props.theme.sizes.spacing.md};
  border: 1px solid ${props => props.theme.colors.border}60;
  border-radius: ${props => props.theme.sizes.borderRadius};
  background: ${props => props.theme.colors.background}80;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  &:focus { outline: none; border-color: ${props => props.theme.colors.primary}; background: ${props => props.theme.colors.background}; }
  option { background: ${props => props.theme.colors.background}; color: ${props => props.theme.colors.text.primary}; }
`;

const TextArea = styled.textarea`
  padding: ${props => props.theme.sizes.spacing.sm} ${props => props.theme.sizes.spacing.md};
  border: 1px solid ${props => props.theme.colors.border}60;
  border-radius: ${props => props.theme.sizes.borderRadius};
  background: ${props => props.theme.colors.background}80;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  resize: vertical; min-height: 60px; max-height: 120px;
  transition: ${props => props.theme.effects.transition};
  &:focus { outline: none; border-color: ${props => props.theme.colors.primary}; background: ${props => props.theme.colors.background}; }
  &::placeholder { color: ${props => props.theme.colors.text.secondary}80; }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.sizes.spacing.sm};
  margin-top: ${props => props.theme.sizes.spacing.sm};
`;

const Button = styled.button<{ variant?: 'primary' | 'secondary' }>`
  padding: ${props => props.theme.sizes.spacing.sm} ${props => props.theme.sizes.spacing.lg};
  border: none;
  border-radius: ${props => props.theme.sizes.borderRadius};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  min-width: 120px;
  background-color: ${props => props.variant === 'primary' ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => props.variant === 'primary' ? props.theme.colors.primary : props.theme.colors.border};
  &:hover { background-color: ${props => props.variant === 'primary' ? props.theme.colors.error : props.theme.colors.border}40; transform: translateY(-2px); }
`;

const TagInput = styled.input`
  padding: ${props => props.theme.sizes.spacing.sm} ${props => props.theme.sizes.spacing.md};
  border: 1px solid ${props => props.theme.colors.border}60;
  border-radius: ${props => props.theme.sizes.borderRadius};
  background: ${props => props.theme.colors.background}80;
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  transition: ${props => props.theme.effects.transition};
  &:focus { outline: none; border-color: ${props => props.theme.colors.primary}; background: ${props => props.theme.colors.background}; }
  &::placeholder { color: ${props => props.theme.colors.text.secondary}80; }
`;

const TagsContainer = styled.div`
  display: flex;
  flex-wrap: wrap;
  gap: 4px;
  margin-top: 4px;
`;

const TagChip = styled.span`
  display: flex;
  align-items: center;
  gap: 2px;
  padding: 2px 8px;
  background: ${props => props.theme.colors.primary}15;
  color: ${props => props.theme.colors.primary};
  border-radius: 12px;
  font-size: 11px;
  font-weight: 500;
`;

const RemoveTagBtn = styled.span`
  cursor: pointer;
  margin-left: 2px;
  font-weight: 700;
  &:hover { color: ${props => props.theme.colors.error}; }
`;

const REGIONS = ['br', 'ap', 'eu', 'kr', 'latam', 'na'];

export const AccountForm: React.FC<AccountFormProps> = ({ onSubmit, initialData }) => {
  const [riotIdWithTag, setRiotIdWithTag] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState<Account['region']>('ap');
  const [notes, setNotes] = useState('');
  const [tags, setTags] = useState<string[]>([]);
  const [tagInput, setTagInput] = useState('');
  const [lentTo, setLentTo] = useState('');

  useEffect(() => {
    if (initialData) {
      setRiotIdWithTag(`${initialData.riotId}#${initialData.hashtag}`);
      setUsername(initialData.username);
      setPassword(initialData.password);
      setRegion(initialData.region);
      setNotes(initialData.notes || '');
      setTags(initialData.tags || []);
      setLentTo(initialData.lentTo || '');
    } else {
      setRiotIdWithTag('');
      setUsername('');
      setPassword('');
      setRegion('ap');
      setNotes('');
      setTags([]);
      setLentTo('');
    }
  }, [initialData]);

  const handleAddTag = () => {
    const tag = tagInput.trim();
    if (tag && !tags.includes(tag)) {
      setTags([...tags, tag]);
    }
    setTagInput('');
  };

  const handleRemoveTag = (tag: string) => {
    setTags(tags.filter((t) => t !== tag));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const hasRiotId = !!riotIdWithTag;
    const hasCredentials = !!username && !!password;

    if (!hasRiotId && !hasCredentials) {
      alert('Please fill in either Riot ID#Tag OR both Username and Password.');
      return;
    }

    const [riotId, hashtag] = riotIdWithTag.split('#');

    onSubmit({
      id: initialData ? initialData.id : Date.now().toString(),
      riotId,
      hashtag: hashtag || '000',
      username,
      password,
      region,
      passwordVisible: initialData ? initialData.passwordVisible : false,
      hasSkins: initialData ? initialData.hasSkins : false,
      currentRank: initialData ? initialData.currentRank : 'Unranked',
      lastRefreshed: initialData ? initialData.lastRefreshed : new Date().toISOString(),
      notes: notes.trim() || undefined,
      tags: tags.length > 0 ? tags : undefined,
      lentTo: lentTo.trim() || undefined,
      lentSince: lentTo.trim() ? (initialData?.lentSince || new Date().toISOString()) : undefined,
    });

    if (!initialData) {
      setRiotIdWithTag('');
      setUsername('');
      setPassword('');
      setRegion('ap');
      setNotes('');
      setTags([]);
      setLentTo('');
    }
  };

  return (
    <FormContainer>
      <FormTitle>{initialData ? 'Edit Account' : 'Add New Account'}</FormTitle>
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <InputContainer>
            <Label htmlFor="riotId">Riot ID#Tag</Label>
            <Input id="riotId" type="text" value={riotIdWithTag} onChange={(e) => setRiotIdWithTag(e.target.value)} placeholder="RiotID#TAG" required />
          </InputContainer>
          <InputContainer>
            <Label htmlFor="username">Login Username</Label>
            <Input id="username" type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder="Username for login" />
          </InputContainer>
          <InputContainer>
            <Label htmlFor="password">Password</Label>
            <Input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Account Password" />
          </InputContainer>
          <InputContainer>
            <Label htmlFor="region">Region</Label>
            <Select id="region" value={region} onChange={(e) => setRegion(e.target.value as Account['region'])}>
              {REGIONS.map((r) => <option key={r} value={r}>{r.toUpperCase()}</option>)}
            </Select>
          </InputContainer>
          <InputContainer>
            <Label>Tags</Label>
            <div style={{ display: 'flex', gap: '4px' }}>
              <TagInput
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTag(); } }}
                placeholder="Add tag..."
              />
              <Button type="button" variant="secondary" onClick={handleAddTag} style={{ minWidth: 'auto', padding: '4px 10px' }}>+</Button>
            </div>
            {tags.length > 0 && (
              <TagsContainer>
                {tags.map((t) => (
                  <TagChip key={t}>{t}<RemoveTagBtn onClick={() => handleRemoveTag(t)}>×</RemoveTagBtn></TagChip>
                ))}
              </TagsContainer>
            )}
          </InputContainer>
          <InputContainer>
            <Label htmlFor="lentTo">Lent To</Label>
            <Input id="lentTo" type="text" value={lentTo} onChange={(e) => setLentTo(e.target.value)} placeholder="Who borrowed this?" />
          </InputContainer>
          <InputContainer wide>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <TextArea id="notes" value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Personal notes about this account (e.g., smurf, main, practice account...)" />
          </InputContainer>
        </FormGrid>
        <ButtonContainer>
          <Button type="submit" variant="primary">
            {initialData ? 'Save Changes' : 'Add Account'}
          </Button>
        </ButtonContainer>
      </form>
    </FormContainer>
  );
};
