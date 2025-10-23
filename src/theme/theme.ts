export const theme = {
  colors: {
    primary: '#FF4655', // Valorant red
    secondary: '#0F1419', // Dark background
    background: '#1E2328', // Slightly lighter background
    surface: '#2B2F36', // Card/container background
    text: {
      primary: '#FFFFFF',
      secondary: '#B0B0B0',
      accent: '#FF4655'
    },
    border: '#3C3C41',
    success: '#00D26A',
    warning: '#FFB800',
    error: '#FF4655',
    disabled: '#6C6C6C'
  },
  fonts: {
    primary: '"Segoe UI", Tahoma, Geneva, Verdana, sans-serif',
    mono: '"Courier New", monospace'
  },
  sizes: {
    fontSize: {
      small: '12px',
      medium: '14px',
      large: '16px',
      xlarge: '18px',
      xxlarge: '20px'
    },
    spacing: {
      xs: '4px',
      sm: '8px',
      md: '16px',
      lg: '24px',
      xl: '32px'
    },
    borderRadius: '8px'
  },
  effects: {
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.4)',
    cardShadow: '0 2px 8px rgba(0, 0, 0, 0.3)',
    transition: 'all 0.2s ease-in-out'
  }
};

export type Theme = typeof theme;