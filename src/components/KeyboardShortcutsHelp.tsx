import React from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.6);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 2000;
`;

const Modal = styled.div`
  background: ${(p) => p.theme.colors.surface};
  border: 2px solid ${(p) => p.theme.colors.border};
  border-radius: ${(p) => p.theme.sizes.borderRadius};
  padding: ${(p) => p.theme.sizes.spacing.xl};
  max-width: 500px;
  width: 90%;
  animation: ${fadeIn} 0.2s ease-out;
`;

const Title = styled.h2`
  color: ${(p) => p.theme.colors.text.primary};
  margin: 0 0 16px;
  display: flex;
  justify-content: space-between;
  align-items: center;
`;

const CloseBtn = styled.button`
  background: none; border: none; color: ${(p) => p.theme.colors.text.secondary};
  font-size: 24px; cursor: pointer;
  &:hover { color: ${(p) => p.theme.colors.primary}; }
`;

const Row = styled.div`
  display: flex;
  justify-content: space-between;
  padding: 8px 0;
  border-bottom: 1px solid ${(p) => p.theme.colors.border}40;
`;

const KeyCombo = styled.kbd`
  background: ${(p) => p.theme.colors.background};
  border: 1px solid ${(p) => p.theme.colors.border};
  border-radius: 4px;
  padding: 2px 8px;
  font-family: monospace;
  font-size: 13px;
  color: ${(p) => p.theme.colors.primary};
`;

const Desc = styled.span`
  color: ${(p) => p.theme.colors.text.secondary};
  font-size: 13px;
`;

interface Props {
  shortcuts: { keys: string; desc: string }[];
  onClose: () => void;
}

export const KeyboardShortcutsHelp: React.FC<Props> = ({ shortcuts, onClose }) => (
  <Overlay onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
    <Modal>
      <Title>
        Keyboard Shortcuts
        <CloseBtn onClick={onClose}>&times;</CloseBtn>
      </Title>
      {shortcuts.map((s) => (
        <Row key={s.keys}>
          <KeyCombo>{s.keys}</KeyCombo>
          <Desc>{s.desc}</Desc>
        </Row>
      ))}
    </Modal>
  </Overlay>
);
