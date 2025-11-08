import React, { useState, useRef } from 'react';
import styled, { keyframes } from 'styled-components';
import type { Account } from '../types';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(-10px); }
  to { opacity: 1; transform: translateY(0); }
`;

const UploadContainer = styled.div`
  background: ${props => props.theme.colors.surface};
  border: 2px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.lg};
  margin: ${props => props.theme.sizes.spacing.md} 0;
  animation: ${fadeIn} 0.3s ease-out;
  transition: ${props => props.theme.effects.transition};
`;

const UploadHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.sizes.spacing.md};
  margin-bottom: ${props => props.theme.sizes.spacing.xl};
`;

const UploadTitle = styled.h3`
  color: ${props => props.theme.colors.text.primary};
  font-size: ${props => props.theme.sizes.fontSize.large};
  margin: 0;
  font-weight: 600;
`;

const UploadIcon = styled.div`
  font-size: ${props => props.theme.sizes.fontSize.xlarge};
`;

const DropZone = styled.div<{ isDragOver: boolean; hasError: boolean }>`
  border: 2px dashed ${props => 
    props.hasError ? props.theme.colors.error :
    props.isDragOver ? props.theme.colors.primary : 
    props.theme.colors.border
  };
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.xl};
  text-align: center;
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  background: ${props => props.isDragOver ? `${props.theme.colors.primary}10` : 'transparent'};
  
  &:hover {
    border-color: ${props => props.theme.colors.primary};
    background: ${props => `${props.theme.colors.primary}08`};
  }
`;

const DropZoneText = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  margin-bottom: ${props => props.theme.sizes.spacing.sm};
`;

const DropZoneSubtext = styled.div`
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.sizes.fontSize.small};
  opacity: 0.7;
`;

const HiddenInput = styled.input`
  display: none;
`;

const ProcessingContainer = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: ${props => props.theme.sizes.spacing.md};
  padding: ${props => props.theme.sizes.spacing.lg};
  color: ${props => props.theme.colors.text.secondary};
`;

const Spinner = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const LoadingSpinner = styled.div`
  width: 20px;
  height: 20px;
  border: 2px solid ${props => props.theme.colors.border};
  border-top: 2px solid ${props => props.theme.colors.primary};
  border-radius: 50%;
  animation: ${Spinner} 1s linear infinite;
`;

const ErrorMessage = styled.div`
  background: ${props => props.theme.colors.error}20;
  border: 1px solid ${props => props.theme.colors.error};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.md};
  margin-top: ${props => props.theme.sizes.spacing.md};
  color: ${props => props.theme.colors.error};
  font-size: ${props => props.theme.sizes.fontSize.medium};
`;

const SuccessMessage = styled.div`
  background: ${props => props.theme.colors.success}20;
  border: 1px solid ${props => props.theme.colors.success};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.md};
  margin-top: ${props => props.theme.sizes.spacing.md};
  color: ${props => props.theme.colors.success};
  font-size: ${props => props.theme.sizes.fontSize.medium};
`;

const FileInfo = styled.div`
  background: ${props => props.theme.colors.background};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.md};
  margin-top: ${props => props.theme.sizes.spacing.md};
  color: ${props => props.theme.colors.text.secondary};
  font-size: ${props => props.theme.sizes.fontSize.small};
`;

const ButtonContainer = styled.div`
  display: flex;
  gap: ${props => props.theme.sizes.spacing.md};
  margin-top: ${props => props.theme.sizes.spacing.md};
`;

const ProcessButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.md} ${props => props.theme.sizes.spacing.lg};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  font-weight: 600;
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  
  &:hover {
    opacity: 0.9;
    transform: translateY(-1px);
  }
  
  &:disabled {
    background: ${props => props.theme.colors.disabled};
    cursor: not-allowed;
    transform: none;
  }
`;

const CancelButton = styled.button`
  background: transparent;
  color: ${props => props.theme.colors.text.secondary};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.md} ${props => props.theme.sizes.spacing.lg};
  font-size: ${props => props.theme.sizes.fontSize.medium};
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  
  &:hover {
    border-color: ${props => props.theme.colors.text.secondary};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const HelpButton = styled.button`
  background: ${props => props.theme.colors.primary};
  color: white;
  border: none;
  border-radius: 50%;
  width: 24px;
  height: 24px;
  font-size: 14px;
  font-weight: bold;
  cursor: pointer;
  transition: ${props => props.theme.effects.transition};
  display: flex;
  align-items: center;
  justify-content: center;
  
  &:hover {
    opacity: 0.8;
    transform: scale(1.1);
  }
`;

const HelpModalOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background: rgba(0, 0, 0, 0.5);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1000;
  padding: ${props => props.theme.sizes.spacing.lg};
`;

const HelpModalContent = styled.div`
  background: ${props => props.theme.colors.surface};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.xl};
  max-width: 800px;
  max-height: 90vh;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
  animation: ${fadeIn} 0.3s ease-out;
`;

const HelpModalHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: ${props => props.theme.sizes.spacing.lg};
  padding-bottom: ${props => props.theme.sizes.spacing.md};
  border-bottom: 1px solid ${props => props.theme.colors.border};
`;

const HelpModalTitle = styled.h2`
  color: ${props => props.theme.colors.text.primary};
  margin: 0;
  font-size: ${props => props.theme.sizes.fontSize.xlarge};
`;

const CloseButton = styled.button`
  background: none;
  border: none;
  font-size: 24px;
  cursor: pointer;
  color: ${props => props.theme.colors.text.secondary};
  padding: 0;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: ${props => props.theme.effects.transition};
  
  &:hover {
    background: ${props => props.theme.colors.border};
    color: ${props => props.theme.colors.text.primary};
  }
`;

const HelpSection = styled.div`
  margin-bottom: ${props => props.theme.sizes.spacing.lg};
`;

const HelpSectionTitle = styled.h3`
  color: ${props => props.theme.colors.primary};
  margin-bottom: ${props => props.theme.sizes.spacing.md};
  font-size: ${props => props.theme.sizes.fontSize.large};
`;

const CodeBlock = styled.pre`
  background: ${props => props.theme.colors.background};
  border: 1px solid ${props => props.theme.colors.border};
  border-radius: ${props => props.theme.sizes.borderRadius};
  padding: ${props => props.theme.sizes.spacing.md};
  overflow-x: auto;
  font-size: ${props => props.theme.sizes.fontSize.small};
  color: ${props => props.theme.colors.text.primary};
  margin: ${props => props.theme.sizes.spacing.sm} 0;
`;

const HelpText = styled.p`
  color: ${props => props.theme.colors.text.secondary};
  line-height: 1.6;
  margin-bottom: ${props => props.theme.sizes.spacing.md};
`;

const RequiredBadge = styled.span`
  background: ${props => props.theme.colors.error};
  color: white;
  padding: 2px 6px;
  border-radius: 3px;
  font-size: ${props => props.theme.sizes.fontSize.small};
  font-weight: bold;
  margin-left: ${props => props.theme.sizes.spacing.sm};
`;



interface FileUploadProps {
  onAccountsImported: (accounts: Account[]) => void;
  isVisible: boolean;
  onClose: () => void;
}

export const FileUpload: React.FC<FileUploadProps> = ({ 
  onAccountsImported, 
  isVisible, 
  onClose 
}) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string>('');
  const [success, setSuccess] = useState<string>('');
  const [showHelp, setShowHelp] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setError('');
    setSuccess('');
    setIsProcessing(false);
  };

  const handleShowHelp = () => {
    setShowHelp(true);
  };

  const handleCloseHelp = () => {
    setShowHelp(false);
  };

  const jsonExampleMinimal = `[
  {
    "riotId": "PlayerName",
    "hashtag": "1234",
    "region": "na",
    "username": "player@email.com",
    "password": "your_password",
    "skins": false
  }
]`;

  const jsonExampleComplete = `[
  {
    "riotId": "ProPlayer",
    "hashtag": "GOAT",
    "region": "na",
    "username": "proplayer@riot.com",
    "password": "supersecret123",
    "skins": true
  },
  {
    "riotId": "CasualGamer",
    "hashtag": "FUN",
    "region": "eu",
    "username": "casual@gmail.com",
    "password": "password456",
    "skins": false
  }
]`;

  const csvExampleMinimal = `riotId,hashtag,region,username,password,skins
PlayerName,1234,na,player@email.com,your_password,false`;

  const csvExampleComplete = `riotId,hashtag,region,username,password,skins
ProPlayer,GOAT,na,proplayer@riot.com,supersecret123,true
CasualGamer,FUN,eu,casual@gmail.com,password456,false`;

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragOver(false);
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleFileSelection(files[0]);
    }
  };

  const handleFileSelection = (file: File) => {
    resetState();
    
    // Validate file type - accept multiple formats
    const allowedExtensions = ['.json', '.csv'];
    const fileExtension = file.name.toLowerCase().substring(file.name.lastIndexOf('.'));
    
    if (!allowedExtensions.includes(fileExtension)) {
      setError('Please select a supported file format (.json, .csv)');
      return;
    }
    
    // Validate file size (max 100MB for safety)
    if (file.size > 100 * 1024 * 1024) {
      setError('File is too large. Maximum size is 100MB');
      return;
    }
    
    setSelectedFile(file);
  };

  const handleFileInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      handleFileSelection(file);
    }
  };

  const processFile = async () => {
    if (!selectedFile) return;
    
    setIsProcessing(true);
    setError('');
    setSuccess('');
    
    try {
      // For Electron, we need to read the file as ArrayBuffer and pass the data
      if (window.electronAPI?.processExecutableFile) {
        // Read file content as ArrayBuffer
        const fileArrayBuffer = await selectedFile.arrayBuffer();
        const uint8Array = new Uint8Array(fileArrayBuffer);
        
        // Convert to base64 for transmission
        const base64Data = btoa(String.fromCharCode(...uint8Array));
        
        const result = await window.electronAPI.processExecutableFile(base64Data, selectedFile.name);
        
        if (result.success && result.accounts) {
          const importedAccounts: Account[] = result.accounts.map((acc: {
            riotId?: string;
            hashtag?: string;
            username?: string;
            password?: string;
            region?: string;
            skins?: boolean;
            hasSkins?: boolean; // Legacy support
            currentRank?: string;
            tag?: string;
          }, index: number) => ({
            id: `imported-${Date.now()}-${index}`,
            riotId: acc.riotId || acc.username || `Account ${index + 1}`,
            hashtag: acc.hashtag || acc.tag || '0000',
            username: acc.username || '',
            password: acc.password || '',
            region: (acc.region || 'na') as Account['region'],
            hasSkins: acc.skins || acc.hasSkins || false,
            currentRank: acc.currentRank || 'Unranked',
            lastRefreshed: new Date().toISOString(),
            passwordVisible: false
          }));
          
          onAccountsImported(importedAccounts);
          setSuccess(`Successfully imported ${importedAccounts.length} accounts!`);
          
          // Close after 2 seconds
          setTimeout(() => {
            onClose();
            resetState();
          }, 2000);
          
        } else {
          setError(result.error || 'Failed to process file. The file may not contain valid account data.');
        }
      } else {
        setError('File processing is only available in the desktop app.');
      }
    } catch (error) {
      console.error('Error processing file:', error);
      setError('An error occurred while processing the file.');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleCancel = () => {
    resetState();
    onClose();
  };

  if (!isVisible) return null;

  return (
    <UploadContainer>
      <UploadHeader>
        <UploadIcon>📁</UploadIcon>
        <UploadTitle>Import Accounts from File</UploadTitle>
        <HelpButton onClick={handleShowHelp} title="View format guide and examples">
          ?
        </HelpButton>
      </UploadHeader>
      
      {!selectedFile && !isProcessing && (
        <DropZone
          isDragOver={isDragOver}
          hasError={!!error}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
        >
          <DropZoneText>
            {error ? '❌ Error selecting file' : '📎 Drop your file here or click to browse'}
          </DropZoneText>
          <DropZoneSubtext>
            Supported formats: .json, .csv files containing account data<br/>
            <strong>Required fields:</strong> riotId, hashtag, region, username, password, skins | 
            Click the <strong>?</strong> button above for format examples and guide
          </DropZoneSubtext>
          <HiddenInput
            ref={fileInputRef}
            type="file"
            accept=".json,.csv"
            onChange={handleFileInputChange}
          />
        </DropZone>
      )}
      
      {selectedFile && !isProcessing && (
        <>
          <FileInfo>
            <strong>Selected File:</strong> {selectedFile.name}<br />
            <strong>Size:</strong> {(selectedFile.size / 1024 / 1024).toFixed(2)} MB<br />
            <strong>Last Modified:</strong> {new Date(selectedFile.lastModified).toLocaleString()}
          </FileInfo>
          
          <ButtonContainer>
            <ProcessButton onClick={processFile}>
              🔄 Process File
            </ProcessButton>
            <CancelButton onClick={handleCancel}>
              Cancel
            </CancelButton>
          </ButtonContainer>
        </>
      )}
      
      {isProcessing && (
        <ProcessingContainer>
          <LoadingSpinner />
          <span>Processing file and extracting account data...</span>
        </ProcessingContainer>
      )}
      
      {error && <ErrorMessage>{error}</ErrorMessage>}
      {success && <SuccessMessage>{success}</SuccessMessage>}
      
      {showHelp && (
        <HelpModalOverlay onClick={handleCloseHelp}>
          <HelpModalContent onClick={(e) => e.stopPropagation()}>
            <HelpModalHeader>
              <HelpModalTitle>Import Format Guide</HelpModalTitle>
              <CloseButton onClick={handleCloseHelp}>×</CloseButton>
            </HelpModalHeader>
            
            <HelpSection>
              <HelpSectionTitle>📋 Required Fields</HelpSectionTitle>
              <HelpText>
                • <strong>riotId</strong><RequiredBadge>Required</RequiredBadge> - Valorant username (without #tag)
              </HelpText>
              <HelpText>
                • <strong>hashtag</strong><RequiredBadge>Required</RequiredBadge> - The numbers after # in your Riot ID
              </HelpText>
              <HelpText>
                • <strong>region</strong><RequiredBadge>Required</RequiredBadge> - Server region (na, eu, ap, br, kr)
              </HelpText>
              <HelpText>
                • <strong>username</strong><RequiredBadge>Required</RequiredBadge> - Account login email/username
              </HelpText>
              <HelpText>
                • <strong>password</strong><RequiredBadge>Required</RequiredBadge> - Account password (will be encrypted)
              </HelpText>
              <HelpText>
                • <strong>skins</strong><RequiredBadge>Required</RequiredBadge> - Whether account has skins (true/false)
              </HelpText>
            </HelpSection>

            <HelpSection>
              <HelpSectionTitle>📄 JSON Format - Minimal Example</HelpSectionTitle>
              <CodeBlock>{jsonExampleMinimal}</CodeBlock>
            </HelpSection>

            <HelpSection>
              <HelpSectionTitle>📄 JSON Format - Complete Example</HelpSectionTitle>
              <CodeBlock>{jsonExampleComplete}</CodeBlock>
            </HelpSection>

            <HelpSection>
              <HelpSectionTitle>📊 CSV Format - Minimal Example</HelpSectionTitle>
              <CodeBlock>{csvExampleMinimal}</CodeBlock>
            </HelpSection>

            <HelpSection>
              <HelpSectionTitle>📊 CSV Format - Complete Example</HelpSectionTitle>
              <CodeBlock>{csvExampleComplete}</CodeBlock>
            </HelpSection>

            <HelpSection>
              <HelpSectionTitle>⚠️ Important Notes</HelpSectionTitle>
              <HelpText>
                • Passwords are automatically encrypted and stored securely
              </HelpText>
              <HelpText>
                • Riot IDs should not include the # symbol (use separate hashtag field)
              </HelpText>
              <HelpText>
                • CSV files must have headers in the first row
              </HelpText>
              <HelpText>
                • Invalid entries will be skipped with error messages
              </HelpText>
            </HelpSection>
          </HelpModalContent>
        </HelpModalOverlay>
      )}
    </UploadContainer>
  );
};