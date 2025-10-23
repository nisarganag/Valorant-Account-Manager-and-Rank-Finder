import React from 'react';
import styled from 'styled-components';
import { useTheme } from '../contexts/useTheme';

const ToggleContainer = styled.div`
  display: flex;
  align-items: center;
  gap: ${props => props.theme.sizes.spacing.sm};
`;

const ToggleSwitch = styled.button<{ isOn: boolean }>`
  width: 50px;
  height: 24px;
  border-radius: 12px;
  border: none;
  background: ${props => props.isOn ? props.theme.colors.primary : props.theme.colors.disabled};
  position: relative;
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  
  &:hover {
    opacity: 0.8;
  }
  
  &:focus {
    outline: 2px solid ${props => props.theme.colors.primary}40;
    outline-offset: 2px;
  }
`;

const ToggleHandle = styled.div<{ isOn: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  background: white;
  position: absolute;
  top: 2px;
  left: ${props => props.isOn ? '28px' : '2px'};
  transition: ${props => props.theme.effects.transition};
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
`;

const IconContainer = styled.div`
  font-size: ${props => props.theme.sizes.fontSize.large};
  display: flex;
  align-items: center;
`;

interface ThemeToggleProps {
  showLabel?: boolean;
}

export const ThemeToggle: React.FC<ThemeToggleProps> = ({ 
  showLabel = true
}) => {
  const { themeMode, toggleTheme } = useTheme();
  const isDark = themeMode === 'dark';

  return (
    <ToggleContainer>
      {showLabel && (
        <>
          <IconContainer>
            ☀️
          </IconContainer>
          <ToggleSwitch 
            isOn={isDark} 
            onClick={toggleTheme}
            aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
            title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          >
            <ToggleHandle isOn={isDark} />
          </ToggleSwitch>
          <IconContainer>
            🌙
          </IconContainer>
        </>
      )}
      {!showLabel && (
        <ToggleSwitch 
          isOn={isDark} 
          onClick={toggleTheme}
          aria-label={`Switch to ${isDark ? 'light' : 'dark'} mode`}
          title={`Switch to ${isDark ? 'light' : 'dark'} mode`}
        >
          <ToggleHandle isOn={isDark} />
        </ToggleSwitch>
      )}
    </ToggleContainer>
  );
};