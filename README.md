# Valorant Account Manager & Rank Finder

A secure, cross-platform desktop application for managing multiple Valorant accounts with real-time rank tracking. Built with Electron, React, TypeScript, and styled-components.

![Valorant Account Manager](public/icons/Valorant_Account_Manager.png)

## 🌍 Cross-Platform Support

**Available for all major operating systems:**

| Platform | File Types | Architectures | Status |
|----------|------------|---------------|--------|
| 🪟 **Windows** | `.exe` installer | x64 | ✅ Ready |
| 🍎 **macOS** | `.dmg`, `.zip` | Intel + Apple Silicon (M1/M2) | ✅ Ready |  
| 🐧 **Linux** | `.AppImage`, `.deb`, `.rpm` | x64 | ✅ Ready |

## ✨ Features

- 🔐 **Secure Account Management**: Store multiple Valorant accounts with encrypted credentials
- 🔒 **Master Password Protection**: All data is encrypted with AES-256 encryption
- 🎮 **Real-time Rank Tracking**: Automatically fetch and display current competitive ranks
- 🖼️ **Rank Icons**: Beautiful rank badge display for all competitive tiers
- 🔄 **Professional Auto-Update System**: Automatic updates with professional UI and animations
- 📱 **Smart Share System**: Share account details with mobile-like interface and platform integration
- 🔍 **Search & Filter**: Quickly find accounts with smart search functionality
- 📊 **Sort by Rank**: Organize accounts by rank, name, or region
- 🎨 **Modern UI**: Sleek, aesthetic design with smooth animations and professional styling
- ✅ **Skins Tracking**: Mark accounts that have skins
- 🌍 **Multi-Region Support**: BR, AP, EU, KR, LATAM, NA
- 🎯 **Cross-Platform Compatibility**: Native installers for Windows, macOS, and Linux

## 🚀 Installation

### Option 1: Download Pre-built Executable (Recommended)

**Download the latest release for your platform:**

#### 🪟 Windows
- **[Valorant Account Manager Setup.exe](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/releases/latest)** 
  - Full installer with shortcuts and auto-updater
  - Supports Windows 10/11 (x64)

#### 🍎 macOS  
- **[Valorant Account Manager.dmg](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/releases/latest)**
  - Universal binary (Intel + Apple Silicon)
  - Drag-and-drop installation
- **[Valorant Account Manager.zip](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/releases/latest)**
  - Portable app bundle version

#### 🐧 Linux
- **[Valorant Account Manager.AppImage](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/releases/latest)**
  - Universal Linux binary (recommended)
  - No installation required - just download and run
  - Works on any Linux distribution
- **[valorant-account-manager.deb](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/releases/latest)**
  - For Debian/Ubuntu systems: `sudo dpkg -i valorant-account-manager*.deb`
- **[valorant-account-manager.rpm](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/releases/latest)**
  - For RedHat/Fedora systems: `sudo rpm -i valorant-account-manager*.rpm`

### Platform-Specific Notes

#### 🪟 Windows Installation
1. Download the `.exe` installer
2. Run as administrator if needed
3. Follow the installation wizard
4. Desktop and start menu shortcuts are created automatically

#### 🍎 macOS Installation  
1. Download the `.dmg` file
2. Open the disk image
3. Drag the app to Applications folder
4. Right-click and "Open" first time (security requirement)

#### 🐧 Linux Installation
**AppImage (Recommended):**
```bash
# Make executable and run
chmod +x Valorant-Account-Manager*.AppImage
./Valorant-Account-Manager*.AppImage
```

**Debian/Ubuntu:**
```bash
sudo dpkg -i valorant-account-manager*.deb
# If missing dependencies:
sudo apt-get install -f
```

**RedHat/Fedora:**
```bash
sudo rpm -i valorant-account-manager*.rpm
# Or with DNF:
sudo dnf install valorant-account-manager*.rpm
```

> **✨ Auto-Updates**: All versions include automatic update capabilities to keep you current with the latest features and security improvements.

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

5. **Build for your platform**
   ```bash
   # Build for current platform only
   npm run build-electron
   
   # Or build for specific platforms:
   npm run build:win    # Windows
   npm run build:mac    # macOS (requires macOS)
   npm run build:linux  # Linux (requires Linux)
   npm run build:all    # All platforms (limited)
   ```

6. **Find your built application**
   
   After building, you'll find platform-specific files in the `dist-electron` folder:
   
   **Windows:**
   - `Valorant Account Manager Setup 1.2.x.exe` (installer)
   - `win-unpacked/Valorant Account Manager.exe` (portable)
   
   **macOS:**
   - `Valorant Account Manager-1.2.x.dmg` (disk image)
   - `Valorant Account Manager-1.2.x-mac.zip` (app bundle)
   
   **Linux:**
   - `Valorant Account Manager-1.2.x.AppImage` (portable)
   - `valorant-account-manager_1.2.x_amd64.deb` (Debian package)
   - `valorant-account-manager-1.2.x.x86_64.rpm` (RPM package)

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

## 🔄 Professional Auto-Update System

The application includes a sophisticated auto-update system with professional UI design that keeps you current with the latest features and security improvements.

### ✨ Professional Update Icon

- **Beautiful SVG Design**: Custom dual-arrow refresh icon with gradient effects
- **Smooth Animations**: Rotation, scaling, and pulse effects on interaction
- **Modern Aesthetics**: Integrated with app theme and color scheme
- **Enhanced Visibility**: Subtle pulse animation for better user awareness

### How It Works

- **Automatic Checks**: The app checks for updates automatically on startup (production builds only)
- **Manual Updates**: Click the professional update icon in the top-right corner
- **Cross-Platform Updates**: Works seamlessly on Windows, macOS, and Linux
- **Smart Downloads**: Updates are downloaded in the background without interrupting your work
- **Seamless Installation**: Choose when to restart and apply updates

### Update Process

1. **Detection**: App checks GitHub releases for newer versions across all platforms
2. **Professional Notification**: Stylish popup with modern design and animations
3. **Platform-Specific Downloads**: Automatically selects correct installer format
4. **Background Installation**: Updates install automatically after restart
5. **Version Verification**: Confirms successful update completion

### Cross-Platform Features

- **Windows**: NSIS installer with automatic updates
- **macOS**: DMG/ZIP updates for both Intel and Apple Silicon
- **Linux**: AppImage/DEB/RPM updates based on your installation method

### Version Display

- Current app version is always visible in the bottom-left corner
- Update notifications show detailed version information and release notes
- Cross-platform compatibility indicators

For detailed information about the update system, see [UPDATE.md](UPDATE.md) and [AUTO_UPDATE_GUIDE.md](AUTO_UPDATE_GUIDE.md).

## 🛠️ Tech Stack

- **Frontend**: React 19, TypeScript, styled-components
- **Desktop Framework**: Electron 38+ with auto-updater
- **Build Tool**: Vite with Rolldown bundler
- **Cross-Platform Builds**: electron-builder with GitHub Actions
- **Encryption**: CryptoJS (AES-256)
- **API**: Custom Valorant rank fetching service
- **Package Manager**: npm
- **CI/CD**: GitHub Actions matrix builds (Windows, macOS, Linux)
- **Release Management**: Automated cross-platform releases
- **Code Signing**: Platform-specific signing and notarization

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
├── build/                   # Platform-specific build assets
│   ├── entitlements.mac.plist  # macOS entitlements
│   └── dmg-background.png      # macOS DMG background
├── .github/workflows/       # GitHub Actions CI/CD
│   └── release.yml         # Cross-platform build workflow
├── scripts/                # Automation scripts
│   └── release.ps1         # Automated release script
└── package.json
```

## 🚀 Automated Release System

The project features a sophisticated automated release system that builds for all platforms simultaneously.

### Release Process

```powershell
# Automated release (developers)
.\scripts\release.ps1 -Type patch -Message "Bug fixes and improvements"
.\scripts\release.ps1 -Type minor -Message "New features and enhancements"
.\scripts\release.ps1 -Type major -Message "Breaking changes and major updates"
```

### What Happens Automatically

1. **Version Management**: Automatically bumps version in package.json
2. **Git Operations**: Creates commits and tags with proper formatting
3. **Cross-Platform Builds**: GitHub Actions builds on 3 OS simultaneously
4. **Release Creation**: Automatically creates GitHub release with all files
5. **Auto-Update Distribution**: Updates become available to all users instantly

### Build Matrix

| Platform | Runner | Output Files |
|----------|--------|--------------|
| Windows | `windows-latest` | `.exe`, `.exe.blockmap`, `latest.yml` |
| macOS | `macos-latest` | `.dmg`, `.zip`, `*-mac.yml` |
| Linux | `ubuntu-latest` | `.AppImage`, `.deb`, `.rpm`, `*-linux.yml` |

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

- **Riot Games**: For Valorant rank icons and game data
- **Rank API**: [vaccie.pythonanywhere.com](https://vaccie.pythonanywhere.com) for rank fetching service
- **Electron**: Cross-platform desktop framework
- **GitHub Actions**: Automated cross-platform builds
- **Open Source Community**: For the amazing tools and libraries
- **Valorant Community**: For feedback and feature requests
- Built with ❤️ for gamers, by gamers

## 📞 Support

### Getting Help

If you encounter any issues or have questions:

- **🐛 Bug Reports**: [Open an issue](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/issues) with detailed steps to reproduce
- **💡 Feature Requests**: [Request features](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/issues) with clear use cases  
- **📖 Documentation**: Check [existing issues](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/issues) for solutions
- **🔄 Update Issues**: See [AUTO_UPDATE_GUIDE.md](AUTO_UPDATE_GUIDE.md) for update troubleshooting

### Platform-Specific Support

- **🪟 Windows**: Ensure Windows 10/11 with .NET Framework
- **🍎 macOS**: Compatible with macOS 10.15+ (Intel and Apple Silicon)  
- **🐧 Linux**: Tested on Ubuntu 20.04+, Fedora 35+, and Arch Linux

---

**🌍 Cross-Platform • 🔒 Secure • ⚡ Fast**  
**Made with ❤️ by [Nisarga](https://github.com/nisarganag) for the Valorant community**
