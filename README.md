# Valorant Account Manager & Rank Finder

A secure desktop application for managing multiple Valorant accounts with real-time rank tracking. Built with Electron, React, TypeScript, and styled-components.

![Valorant Account Manager](public/icons/Valorant_Account_Manager.png)

## ✨ Features

- 🔐 **Secure Account Management**: Store multiple Valorant accounts with encrypted credentials
- 🔒 **Master Password Protection**: All data is encrypted with AES-256 encryption
- 🎮 **Real-time Rank Tracking**: Automatically fetch and display current competitive ranks
- 🖼️ **Rank Icons**: Beautiful rank badge display for all competitive tiers
- 🔍 **Search & Filter**: Quickly find accounts with smart search functionality
- 📊 **Sort by Rank**: Organize accounts by rank, name, or region
- 🎨 **Modern UI**: Sleek, aesthetic design with smooth animations
- ✅ **Skins Tracking**: Mark accounts that have skins
- 🌍 **Multi-Region Support**: BR, AP, EU, KR, LATAM, NA

## 🚀 Installation

### Option 1: Download Pre-built Executable (Recommended)

**Coming Soon**: Download the latest release from the [Releases](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/releases) page.

For now, follow the "Build from Source" instructions below.

### Option 2: Build from Source

#### Prerequisites
- [Node.js](https://nodejs.org/) (v18 or higher)
- [Git](https://git-scm.com/)

#### Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder.git
   cd Valorant-Account-Manager-and-Rank-Finder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Run in development mode** (optional)
   ```bash
   npm run electron-dev
   ```

4. **Build the executable**
   ```bash
   npm run build-electron
   ```

5. **Find your built application**
   
   After building, you'll find two options in the `dist-electron` folder:
   
   - **Installer**: `Valorant Account Manager Setup 1.0.0.exe`
     - Single file installer
     - Installs to Program Files with shortcuts
     - Recommended for personal use
   
   - **Portable Version**: `dist-electron/win-unpacked/Valorant Account Manager.exe`
     - No installation required
     - Run directly from any folder
     - Perfect for USB drives or sharing

## 📖 Usage

### First Time Setup

1. **Create Master Password**: On first launch, you'll be prompted to create a master password. This password encrypts all your account data.

2. **Add Accounts**: Click "Add New Account" and fill in:
   - **Riot ID#Tag**: Your Valorant display name with tag (e.g., `PlayerName#1234`)
   - **Login Username** (optional): Your Riot account username
   - **Password** (optional): Your account password
   - **Region**: Select your game region

3. **Fetch Ranks**: Click the refresh icon to fetch ranks for all accounts

### Account Management

- **Edit Account**: Click the edit icon (✏️) on any account row
- **Delete Account**: Click the delete icon (🗑️) to remove an account
- **Toggle Skins**: Click the skins checkbox to mark accounts with skins
- **Individual Refresh**: Click the refresh icon on a specific account to update its rank
- **Bulk Refresh**: Use the "Refresh All Ranks" button to update all accounts

### Searching & Sorting

- **Search**: Use the search bar to filter accounts by Riot ID or username
- **Sort by Name**: Click the "Riot ID" column header
- **Sort by Rank**: Click the "Rank" column header
- **Sort by Region**: Click the "Region" column header

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, styled-components
- **Desktop Framework**: Electron
- **Build Tool**: Vite with Rolldown
- **Encryption**: CryptoJS (AES-256)
- **API**: Custom Valorant rank fetching service
- **Package Manager**: npm

## 📁 Project Structure

```
Valorant-Account-Manager-and-Rank-Finder/
├── electron/                 # Electron main process files
│   ├── main.js              # Main process entry point
│   └── preload.js           # Preload script for IPC
├── src/
│   ├── components/          # React components
│   │   ├── AccountForm.tsx
│   │   ├── AccountTable.tsx
│   │   ├── MasterPasswordDialog.tsx
│   │   └── SearchBar.tsx
│   ├── services/            # Business logic
│   │   └── rankService.ts   # Rank fetching API
│   ├── utils/              # Utility functions
│   │   └── encryption.ts    # Encryption/decryption
│   ├── types/              # TypeScript type definitions
│   └── theme/              # Styled-components theme
├── public/icons/            # Rank badges and app icons
└── package.json
```

## 🔒 Security

- **AES-256 Encryption**: All account credentials are encrypted using industry-standard AES-256
- **Master Password**: Never stored in plain text; only a hash is kept
- **Local Storage**: All data is stored locally on your machine
- **No Cloud Sync**: Your data never leaves your computer

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the [MIT License](LICENSE).

## 👤 Author

**Nisarga**
- GitHub: [@nisarganag](https://github.com/nisarganag)

## 🙏 Acknowledgments

- Rank icons and data from Riot Games
- Rank API service: [vaccie.pythonanywhere.com](https://vaccie.pythonanywhere.com)
- Built with ❤️ for the Valorant community

## 📞 Support

If you encounter any issues or have questions:
- Open an [issue](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/issues)
- Check existing issues for solutions

---

**Made with ❤️ by [Nisarga](https://github.com/nisarganag)**

import reactDom from 'eslint-plugin-react-dom'

export default defineConfig([
  globalIgnores(['dist']),
  {
    files: ['**/*.{ts,tsx}'],
    extends: [
      // Other configs...
      // Enable lint rules for React
      reactX.configs['recommended-typescript'],
      // Enable lint rules for React DOM
      reactDom.configs.recommended,
    ],
    languageOptions: {
      parserOptions: {
        project: ['./tsconfig.node.json', './tsconfig.app.json'],
        tsconfigRootDir: import.meta.dirname,
      },
      // other options...
    },
  },
])
```
