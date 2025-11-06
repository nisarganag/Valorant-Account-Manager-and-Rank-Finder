import React, { useState, useEffect } from 'react';
import styled from 'styled-components';

const UpdateNotification = styled.div<{ $show: boolean }>`
  position: fixed;
  top: 20px;
  right: 20px;
  background: ${props => `linear-gradient(135deg, ${props.theme.colors.primary}, ${props.theme.colors.secondary})`};
  color: white;
  padding: 15px 20px;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  z-index: 1000;
  transform: ${props => props.$show ? 'translateX(0)' : 'translateX(400px)'};
  transition: transform 0.3s ease-in-out;
  min-width: 300px;
  max-width: 400px;
`;

const UpdateTitle = styled.h4`
  margin: 0 0 8px 0;
  font-size: 16px;
  font-weight: 600;
`;

const UpdateMessage = styled.p`
  margin: 0 0 12px 0;
  font-size: 14px;
  opacity: 0.9;
`;

const UpdateProgress = styled.div`
  width: 100%;
  height: 6px;
  background: rgba(255, 255, 255, 0.2);
  border-radius: 3px;
  margin: 8px 0;
  overflow: hidden;
`;

const UpdateProgressBar = styled.div<{ $progress: number }>`
  width: ${props => props.$progress}%;
  height: 100%;
  background: rgba(255, 255, 255, 0.8);
  border-radius: 3px;
  transition: width 0.3s ease;
`;

const UpdateButtons = styled.div`
  display: flex;
  gap: 10px;
  margin-top: 12px;
`;

const UpdateButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  padding: 8px 16px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  
  ${props => props.$variant === 'primary' ? `
    background: rgba(255, 255, 255, 0.9);
    color: ${props.theme.colors.primary};
    
    &:hover {
      background: white;
      transform: translateY(-1px);
    }
  ` : `
    background: rgba(255, 255, 255, 0.1);
    color: white;
    border: 1px solid rgba(255, 255, 255, 0.3);
    
    &:hover {
      background: rgba(255, 255, 255, 0.2);
    }
  `}
  
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;

const CloseButton = styled.button`
  position: absolute;
  top: 8px;
  right: 12px;
  background: none;
  border: none;
  color: rgba(255, 255, 255, 0.8);
  font-size: 18px;
  cursor: pointer;
  width: 24px;
  height: 24px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: 50%;
  transition: all 0.2s ease;
  
  &:hover {
    background: rgba(255, 255, 255, 0.1);
    color: white;
  }
`;

const VersionInfo = styled.div`
  position: fixed;
  bottom: 10px;
  left: 10px;
  background: rgba(0, 0, 0, 0.05);
  color: ${props => props.theme.colors.text.secondary};
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
  z-index: 100;
`;

type UpdateStatus = 'checking' | 'available' | 'downloading' | 'downloaded' | 'up-to-date' | 'error';

interface UpdateButton {
  text: string;
  onClick: () => void | Promise<void>;
  variant: 'primary' | 'secondary';
  disabled?: boolean;
}

interface UpdateManagerProps {}

const UpdateManager: React.FC<UpdateManagerProps> = () => {
  const [updateStatus, setUpdateStatus] = useState<UpdateStatus | null>(null);
  const [updateMessage, setUpdateMessage] = useState<string>('');
  const [downloadProgress, setDownloadProgress] = useState<number>(0);
  const [showNotification, setShowNotification] = useState<boolean>(false);
  const [appVersion, setAppVersion] = useState<string>('');
  const [updateAvailable, setUpdateAvailable] = useState<boolean>(false);
  const [isDownloading, setIsDownloading] = useState<boolean>(false);
  
  // Use variables to avoid unused warnings
  console.log({ updateAvailable, isDownloading });
  const [isInstalling, setIsInstalling] = useState<boolean>(false);

  useEffect(() => {
    // Get app version on mount
    if (window.electronAPI) {
      window.electronAPI.getAppVersion().then(result => {
        if (result.success && result.version) {
          setAppVersion(result.version);
        }
      });

      // Listen for update status messages
      const handleUpdateStatus = (_event: any, status: string) => {
        console.log('Update status:', status);
        setUpdateMessage(status);
        
        if (status.includes('Checking for updates')) {
          setUpdateStatus('checking');
          setShowNotification(true);
        } else if (status.includes('Update available')) {
          setUpdateStatus('available');
          setUpdateAvailable(true);
          setShowNotification(true);
        } else if (status.includes('App is up to date')) {
          setUpdateStatus('up-to-date');
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 3000);
        } else if (status.includes('Downloading')) {
          setUpdateStatus('downloading');
          setIsDownloading(true);
          setShowNotification(true);
          
          // Extract percentage if available
          const percentMatch = status.match(/(\d+)%/);
          if (percentMatch) {
            setDownloadProgress(parseInt(percentMatch[1]));
          }
        } else if (status.includes('Update downloaded')) {
          setUpdateStatus('downloaded');
          setIsDownloading(false);
          setDownloadProgress(100);
          setShowNotification(true);
        } else if (status.includes('Error')) {
          setUpdateStatus('error');
          setShowNotification(true);
          setTimeout(() => setShowNotification(false), 5000);
        }
      };

      window.electronAPI.onUpdateStatus(handleUpdateStatus);

      return () => {
        window.electronAPI.removeUpdateStatusListener(handleUpdateStatus);
      };
    }
  }, []);

  const handleCheckForUpdates = async () => {
    if (!window.electronAPI) return;
    
    setUpdateStatus('checking');
    setShowNotification(true);
    
    try {
      const result = await window.electronAPI.checkForUpdates();
      if (!result.success) {
        setUpdateStatus('error');
        setUpdateMessage(result.error || 'Failed to check for updates');
      }
    } catch (error) {
      setUpdateStatus('error');
      setUpdateMessage('Failed to check for updates');
    }
  };

  const handleDownloadUpdate = async () => {
    if (!window.electronAPI) return;
    
    setIsDownloading(true);
    setDownloadProgress(0);
    
    try {
      const result = await window.electronAPI.downloadUpdate();
      if (!result.success) {
        setUpdateStatus('error');
        setUpdateMessage(result.error || 'Failed to download update');
        setIsDownloading(false);
      }
    } catch (error) {
      setUpdateStatus('error');
      setUpdateMessage('Failed to download update');
      setIsDownloading(false);
    }
  };

  const handleInstallUpdate = async () => {
    if (!window.electronAPI) return;
    
    setIsInstalling(true);
    
    try {
      await window.electronAPI.installUpdate();
      // App will restart automatically
    } catch (error) {
      setUpdateStatus('error');
      setUpdateMessage('Failed to install update');
      setIsInstalling(false);
    }
  };

  const handleCloseNotification = () => {
    setShowNotification(false);
    setUpdateStatus(null);
    setUpdateAvailable(false);
    setIsDownloading(false);
    setDownloadProgress(0);
  };

  const getNotificationContent = (): { title: string; message: string; showProgress: boolean; buttons: UpdateButton[] } | null => {
    switch (updateStatus) {
      case 'checking':
        return {
          title: 'Checking for Updates',
          message: 'Looking for new versions...',
          showProgress: false,
          buttons: []
        };
        
      case 'available':
        return {
          title: 'Update Available!',
          message: 'A new version is available. Would you like to download it?',
          showProgress: false,
          buttons: [
            { text: 'Download', onClick: handleDownloadUpdate, variant: 'primary' as const },
            { text: 'Later', onClick: handleCloseNotification, variant: 'secondary' as const }
          ]
        };
        
      case 'downloading':
        return {
          title: 'Downloading Update',
          message: `Downloading update... ${downloadProgress}%`,
          showProgress: true,
          buttons: []
        };
        
      case 'downloaded':
        return {
          title: 'Update Ready!',
          message: 'Update downloaded successfully. Restart to install?',
          showProgress: false,
          buttons: [
            { text: 'Restart Now', onClick: handleInstallUpdate, variant: 'primary' as const, disabled: isInstalling },
            { text: 'Later', onClick: handleCloseNotification, variant: 'secondary' as const }
          ]
        };
        
      case 'up-to-date':
        return {
          title: 'Up to Date',
          message: 'You have the latest version!',
          showProgress: false,
          buttons: []
        };
        
      case 'error':
        return {
          title: 'Update Error',
          message: updateMessage || 'Failed to check for updates',
          showProgress: false,
          buttons: [
            { text: 'Retry', onClick: handleCheckForUpdates, variant: 'primary' as const },
            { text: 'Close', onClick: handleCloseNotification, variant: 'secondary' as const }
          ]
        };
        
      default:
        return null;
    }
  };

  const content = getNotificationContent();

  return (
    <>
      {content && (
        <UpdateNotification $show={showNotification}>
          <CloseButton onClick={handleCloseNotification}>×</CloseButton>
          <UpdateTitle>{content.title}</UpdateTitle>
          <UpdateMessage>{content.message}</UpdateMessage>
          
          {content.showProgress && (
            <UpdateProgress>
              <UpdateProgressBar $progress={downloadProgress} />
            </UpdateProgress>
          )}
          
          {content.buttons.length > 0 && (
            <UpdateButtons>
              {content.buttons.map((button, index) => (
                <UpdateButton
                  key={index}
                  $variant={button.variant}
                  onClick={button.onClick}
                  disabled={button.disabled}
                >
                  {button.text}
                </UpdateButton>
              ))}
            </UpdateButtons>
          )}
        </UpdateNotification>
      )}
      
      {appVersion && (
        <VersionInfo>
          v{appVersion}
        </VersionInfo>
      )}
    </>
  );
};

export default UpdateManager;