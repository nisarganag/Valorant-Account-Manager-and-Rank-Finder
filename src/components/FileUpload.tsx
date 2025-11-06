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
  gap: ${props => props.theme.sizes.spacing.md};
  margin-bottom: ${props => props.theme.sizes.spacing.md};
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
  const fileInputRef = useRef<HTMLInputElement>(null);

  const resetState = () => {
    setSelectedFile(null);
    setError('');
    setSuccess('');
    setIsProcessing(false);
  };

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
            hasSkins?: boolean;
            currentRank?: string;
            tag?: string;
          }, index: number) => ({
            id: `imported-${Date.now()}-${index}`,
            riotId: acc.riotId || acc.username || `Account ${index + 1}`,
            hashtag: acc.hashtag || acc.tag || '0000',
            username: acc.username || '',
            password: acc.password || '',
            region: (acc.region || 'na') as Account['region'],
            hasSkins: acc.hasSkins || false,
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
            Supported formats: .json, .csv files containing account data
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
    </UploadContainer>
  );
};