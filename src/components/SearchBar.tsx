import React from 'react';
import styled from 'styled-components';

const SearchContainer = styled.div`
  margin-bottom: ${props => props.theme.sizes.spacing.md};
`;

const SearchInput = styled.input`
  width: 100%;
  padding: ${props => props.theme.sizes.spacing.sm} ${props => props.theme.sizes.spacing.md};
  background-color: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  font-family: ${props => props.theme.fonts.primary};
  transition: border-color 0.3s, box-shadow 0.3s;

  &::placeholder {
    color: ${props => props.theme.colors.text.secondary};
  }

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
    box-shadow: 0 0 0 2px ${props => props.theme.colors.primary}40;
  }
`;

interface SearchBarProps {
  searchTerm: string;
  onSearchTermChange: (term: string) => void;
}

export const SearchBar: React.FC<SearchBarProps> = ({ searchTerm, onSearchTermChange }) => {
  return (
    <SearchContainer>
      <SearchInput
        type="text"
        placeholder="Search by account name or username..."
        value={searchTerm}
        onChange={(e) => onSearchTermChange(e.target.value)}
      />
    </SearchContainer>
  );
};
