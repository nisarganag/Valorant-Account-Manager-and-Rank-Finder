export const darkTheme = {
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
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

export const lightTheme = {
  colors: {
    primary: '#FF4655', // Valorant red
    secondary: '#F8F9FA', // Light background
    background: '#FFFFFF', // White background
    surface: '#F1F3F4', // Light card/container background
    text: {
      primary: '#202124',
      secondary: '#5F6368',
      accent: '#FF4655'
    },
    border: '#DADCE0',
    success: '#137333',
    warning: '#EA8600',
    error: '#D93025',
    disabled: '#9AA0A6'
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
    boxShadow: '0 2px 8px rgba(60, 64, 67, 0.15)',
    cardShadow: '0 1px 3px rgba(60, 64, 67, 0.12)',
    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
  }
};

// Keep the original theme as darkTheme for backward compatibility
export const theme = darkTheme;

export type Theme = typeof darkTheme;