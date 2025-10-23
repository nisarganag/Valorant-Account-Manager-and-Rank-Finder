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

const InputContainer = styled.div`
  display: flex;
  flex-direction: column;
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

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.background};
  }

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary}80;
  }
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

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    background: ${props => props.theme.colors.background};
  }

  option {
    background: ${props => props.theme.colors.background};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.sizes.spacing.sm};
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

  &:hover {
    background-color: ${props => props.variant === 'primary' ? props.theme.colors.error : props.theme.colors.border}40;
    transform: translateY(-2px);
  }
`;

const REGIONS = ['br', 'ap', 'eu', 'kr', 'latam', 'na'];

export const AccountForm: React.FC<AccountFormProps> = ({ onSubmit, initialData }) => {
  const [riotIdWithTag, setRiotIdWithTag] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [region, setRegion] = useState<Account['region']>('ap');

  useEffect(() => {
    if (initialData) {
      setRiotIdWithTag(`${initialData.riotId}#${initialData.hashtag}`);
      setUsername(initialData.username);
      setPassword(initialData.password);
      setRegion(initialData.region);
    } else {
      // Reset form for adding new account
      setRiotIdWithTag('');
      setUsername('');
      setPassword('');
      setRegion('ap');
    }
  }, [initialData]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Check if either Riot ID OR (Username AND Password) is provided
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
    });

    // Clear form after submission if it's not an edit
    if (!initialData) {
      setRiotIdWithTag('');
      setUsername('');
      setPassword('');
      setRegion('ap');
    }
  };

  return (
    <FormContainer>
      <FormTitle>{initialData ? 'Edit Account' : 'Add New Account'}</FormTitle>
      <form onSubmit={handleSubmit}>
        <FormGrid>
          <InputContainer>
            <Label htmlFor="riotId">Riot ID#Tag</Label>
            <Input
              id="riotId"
              type="text"
              value={riotIdWithTag}
              onChange={(e) => setRiotIdWithTag(e.target.value)}
              placeholder="RiotID#TAG"
              required
            />
          </InputContainer>
          <InputContainer>
            <Label htmlFor="username">Login Username</Label>
            <Input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Username for login"
            />
          </InputContainer>
          <InputContainer>
            <Label htmlFor="password">Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Account Password"
            />
          </InputContainer>
          <InputContainer>
            <Label htmlFor="region">Region</Label>
            <Select
              id="region"
              value={region}
              onChange={(e) => setRegion(e.target.value as Account['region'])}
            >
              {REGIONS.map((r) => (
                <option key={r} value={r}>
                  {r.toUpperCase()}
                </option>
              ))}
            </Select>
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