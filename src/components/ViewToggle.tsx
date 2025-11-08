import React from 'react';
import styled from 'styled-components';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.sizes.spacing.sm};
`;

const ToggleButton = styled.button<{ isActive: boolean }>`
  background: ${props => props.isActive ? props.theme.colors.primary : 'transparent'};
  color: ${props => props.isActive ? 'white' : props.theme.colors.text.secondary};
  border: 1px solid ${props => props.isActive ? props.theme.colors.primary : props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.xs} ${props => props.theme.sizes.spacing.sm};
  font-size: ${props => props.theme.sizes.fontSize.small};
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  display: flex;
  align-items: center;
  gap: ${props => props.theme.sizes.spacing.xs};
  
  &:hover {
    background: ${props => props.isActive ? props.theme.colors.primary : `${props.theme.colors.primary}20`};
    color: ${props => props.isActive ? 'white' : props.theme.colors.primary};
  }
`;

const ToggleLabel = styled.span`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  margin-right: ${props => props.theme.sizes.spacing.xs};
`;

interface ViewToggleProps {
  currentView: 'list' | 'grid';
  onViewChange: (view: 'list' | 'grid') => void;
}

export const ViewToggle: React.FC<ViewToggleProps> = ({ currentView, onViewChange }) => {
  return (
    <ToggleContainer>
      <ToggleLabel>View:</ToggleLabel>
      <ToggleButton
        isActive={currentView === 'list'}
        onClick={() => onViewChange('list')}
        title="List View"
      >
        📋 List
      </ToggleButton>
      <ToggleButton
        isActive={currentView === 'grid'}
        onClick={() => onViewChange('grid')}
        title="Grid View"
      >
        🔲 Grid
      </ToggleButton>
    </ToggleContainer>
  );
};