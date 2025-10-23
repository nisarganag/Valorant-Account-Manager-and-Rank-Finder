import React, { useState, useEffect } from 'react';
import styled from 'styled-components';
import { EncryptionService } from '../utils/encryption';

interface MasterPasswordDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onAuthenticated: (password: string) => void;
}

export const MasterPasswordDialog: React.FC<MasterPasswordDialogProps> = ({
  isOpen,
  onClose,
  onAuthenticated,
}) => {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isNewPassword, setIsNewPassword] = useState(false);

  useEffect(() => {
    if (isOpen) {
      checkIfMasterPasswordExists();
    }
  }, [isOpen]);

  const checkIfMasterPasswordExists = async () => {
    try {
      if (window.electronAPI) {
        const result = await window.electronAPI.loadMasterKey();
        setIsNewPassword(!result.success || !result.data);
      } else {
        // Browser fallback - check localStorage
        const storedHash = localStorage.getItem('masterPasswordHash');
        setIsNewPassword(!storedHash);
      }
    } catch (error) {
      console.error('Error checking master password:', error);
      setIsNewPassword(true);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password.trim()) {
      setError('Please enter a password');
      return;
    }

    if (isNewPassword) {
      if (password !== confirmPassword) {
        setError('Passwords do not match');
        return;
      }
    }

    setIsLoading(true);
    setError('');

    try {
      if (isNewPassword) {
        await createMasterPassword(password);
      } else {
        await verifyMasterPassword(password);
      }
      onAuthenticated(password);
      setPassword('');
      setConfirmPassword('');
      setError('');
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Authentication failed');
    } finally {
      setIsLoading(false);
    }
  };

  const createMasterPassword = async (password: string) => {
    const hashedPassword = EncryptionService.hashPassword(password);
    
    if (window.electronAPI) {
      const result = await window.electronAPI.saveMasterKey(hashedPassword);
      if (!result.success) {
        throw new Error(result.error || 'Failed to save master password');
      }
    } else {
      // Browser fallback
      localStorage.setItem('masterPasswordHash', hashedPassword);
    }
  };

  const verifyMasterPassword = async (password: string) => {
    const hashedPassword = EncryptionService.hashPassword(password);
    
    if (window.electronAPI) {
      const result = await window.electronAPI.loadMasterKey();
      if (!result.success || result.data !== hashedPassword) {
        throw new Error('Invalid password');
      }
    } else {
      // Browser fallback
      const storedHash = localStorage.getItem('masterPasswordHash');
      if (storedHash !== hashedPassword) {
        throw new Error('Invalid password');
      }
    }
  };

  const handleOverlayClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      onClose();
    }
  };

  if (!isOpen) return null;

  return (
    <Overlay onClick={handleOverlayClick}>
      <DialogContainer onClick={(e) => e.stopPropagation()}>
        <DialogTitle>
          {isNewPassword ? 'Create Master Password' : 'Enter Master Password'}
        </DialogTitle>
        
        <DialogDescription>
          {isNewPassword 
            ? 'Create a master password to secure your account data. This password will be required to access the application.'
            : 'Enter your master password to access your saved accounts.'
          }
        </DialogDescription>

        {error && <ErrorMessage>{error}</ErrorMessage>}

        <form onSubmit={handleSubmit}>
          <InputContainer>
            <Input
              type="password"
              placeholder="Master Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
            />
          </InputContainer>

          {isNewPassword && (
            <InputContainer>
              <Input
                type="password"
                placeholder="Confirm Password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                required
                disabled={isLoading}
              />
            </InputContainer>
          )}

          <ButtonContainer>
            <Button 
              type="button" 
              variant="secondary"
              onClick={onClose}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              variant="primary"
              disabled={isLoading}
            >
              {isLoading && <LoadingSpinner />}
              {isNewPassword ? 'Create Password' : 'Login'}
            </Button>
          </ButtonContainer>
        </form>
      </DialogContainer>
    </Overlay>
  );
};

// Styled Components
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.8);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  backdrop-filter: blur(4px);
`;

const DialogContainer = styled.div`
  background: ${props => props.theme.colors.background};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.xl};
  max-width: 400px;
  width: 90%;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
`;

const DialogTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.xlarge};
  margin: 0 0 ${props => props.theme.sizes.spacing.md} 0;
  text-align: center;
  font-weight: 700;
`;

const DialogDescription = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  margin: 0 0 ${props => props.theme.sizes.spacing.lg} 0;
  text-align: center;
  line-height: 1.5;
`;

const InputContainer = styled.div`
  margin-bottom: ${props => props.theme.sizes.spacing.md};
`;

const Input = styled.input`
  width: 100%;
  padding: ${props => props.theme.sizes.spacing.md};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  background: ${props => props.theme.colors.background};
  color: ${props => props.theme.colors.text.primary};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.large};
  transition: ${props => props.theme.effects.transition};
  box-sizing: border-box;

  &:focus {
    outline: none;
    border-color: ${props => props.theme.colors.primary};
  }

  &:invalid {
    border-color: ${props => props.theme.colors.error};
  }
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.sizes.spacing.md};
  justify-content: flex-end;
`;

const Button = styled.button<{ variant: 'primary' | 'secondary' }>`
  padding: ${props => props.theme.sizes.spacing.md} ${props => props.theme.sizes.spacing.xl};
  border: none;
  border-radius: ${props => props.theme.sizes.borderRadius};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  min-width: 80px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.sizes.spacing.sm};

  ${props => props.variant === 'primary' ? `
    background: ${props.theme.colors.primary};
    color: white;
    
    &:hover:not(:disabled) {
      background: ${props.theme.colors.error};
      transform: translateY(-1px);
    }
  ` : `
    background: transparent;
    color: ${props.theme.colors.text.secondary};
    border: 2px solid ${props.theme.colors.border};
    
    &:hover:not(:disabled) {
      background: ${props.theme.colors.border};
      color: ${props.theme.colors.text.primary};
    }
  `}

  &:disabled {
    background: ${props => props.theme.colors.disabled};
    color: ${props => props.theme.colors.text.secondary};
    cursor: not-allowed;
    transform: none;
  }
`;

const ErrorMessage = styled.div`
  color: ${props => props.theme.colors.error};
  font-family: ${props => props.theme.fonts.primary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  margin-top: ${props => props.theme.sizes.spacing.sm};
  text-align: center;
  padding: ${props => props.theme.sizes.spacing.sm};
  border: 1px solid ${props => props.theme.colors.error};
  border-radius: ${props => props.theme.sizes.borderRadius};
  background: rgba(220, 20, 60, 0.1);
`;

const LoadingSpinner = styled.div`
  width: 16px;
  height: 16px;
  border: 2px solid transparent;
  border-top: 2px solid currentColor;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;