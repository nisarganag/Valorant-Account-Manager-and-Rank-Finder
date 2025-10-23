# Valorant Account Manager

A secure desktop application for managing Valorant accounts and tracking ranks, built with React, TypeScript, and Electron.

## Features

- 🔐 **Secure Master Password Protection** - All account data is encrypted with AES-128-CBC
- 👤 **Account Management** - Store account credentials securely with email and password
- 🏆 **Rank Tracking** - Fetch current competitive ranks from Valorant API
- 🌍 **Multi-Region Support** - Support for all Valorant regions (NA, EU, AP, etc.)
- 🎨 **Modern UI** - Clean, dark-themed interface optimized for gaming
- 📱 **Desktop App** - Native desktop experience with Electron

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Desktop**: Electron 38
- **Styling**: styled-components with custom theme
- **Build Tool**: Vite with experimental rolldown
- **Encryption**: crypto-js (AES encryption)
- **HTTP Client**: axios

## Development

### Prerequisites

- Node.js 18+ 
- npm or yarn

### Installation

```bash
# Clone the repository
git clone <your-repo-url>
cd valo-react-app

# Install dependencies
npm install

# Run in development mode
npm run dev

# Build for production
npm run build

# Create desktop executable
npm run electron:build
```

### Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run electron:dev` - Run Electron in development
- `npm run electron:build` - Build desktop executable

## Security

- All account data is encrypted using AES-128-CBC encryption
- Master password is hashed with SHA-256
- No data is stored in plain text
- Secure IPC communication between main and renderer processes

## API Integration

The app integrates with `https://vaccie.pythonanywhere.com/mmr` API to fetch current competitive ranks. The API supports:

- Player lookup by name and tag
- Multi-region support
- Real-time rank data

## File Structure

```
src/
├── components/          # React components
│   ├── AccountForm.tsx     # Account creation form
│   ├── AccountTable.tsx    # Account list and rank display
│   └── MasterPasswordDialog.tsx # Authentication dialog
├── services/           # API services
│   └── rankService.ts     # Valorant rank API integration
├── types/              # TypeScript definitions
│   ├── index.ts           # Core interfaces
│   ├── electron.d.ts      # Electron API types
│   └── styled.d.ts        # styled-components theme types
├── theme/              # UI theme configuration
│   └── theme.ts           # Color scheme and styling
├── utils/              # Utility functions
│   └── encryption.ts      # AES encryption service
└── App.tsx             # Main application component
```

## License

This project is licensed under the MIT License.