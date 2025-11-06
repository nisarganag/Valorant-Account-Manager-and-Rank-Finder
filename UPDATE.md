# 🔄 Auto-Update System

## How It Works

The Valorant Account Manager includes a sophisticated auto-update system that automatically checks for new versions and helps you stay up to date.

## Update Flow

### 1. **Automatic Check on Startup**
- When you open the app, it automatically checks for updates in the background (after 3 seconds)
- Only works in production builds, not during development

### 2. **Manual Check**
- Click the 🔄 button in the top-right corner to manually check for updates
- Shows current version in bottom-left corner

### 3. **Update Available**
- If an update is found, you'll see a notification popup
- Choose "Download Now" or "Later"

### 4. **Download Progress**
- Progress bar shows download status
- You can continue using the app while downloading

### 5. **Install Update**
- When download completes, choose "Restart Now" or "Later"
- App will restart and install the new version automatically

## For Developers

### Publishing a New Release

1. **Update version in package.json**
   ```json
   {
     "version": "1.1.0"
   }
   ```

2. **Create a Git tag**
   ```bash
   git tag v1.1.0
   git push origin v1.1.0
   ```

3. **GitHub Actions will automatically:**
   - Build the app for Windows
   - Create a GitHub release
   - Upload the installer and update files
   - Generate update manifest (latest.yml)

### Manual Publishing

```bash
# Build and publish to GitHub releases
npm run publish
```

### Testing Updates

1. **Create a test release:**
   - Build the app: `npm run build-electron`
   - Create a GitHub release manually
   - Upload the generated `.exe` file

2. **Test the update process:**
   - Install the older version
   - Run the app and it should detect the new version

## Update Files

- **latest.yml**: Contains update manifest information
- **Installer.exe**: The new version installer
- **Installer.exe.blockmap**: Binary diff information for faster updates

## Troubleshooting

### Update Check Fails
- Check internet connection
- Verify GitHub repository is public
- Check if GitHub API rate limits are reached

### Download Fails
- Retry the download
- Check available disk space
- Verify firewall/antivirus isn't blocking the download

### Installation Fails
- Close all instances of the app
- Run as administrator if needed
- Check if antivirus is blocking the installer

## Security

- All updates are verified using digital signatures
- Downloads come directly from GitHub releases
- No third-party update servers are used

## Configuration

The auto-updater is configured in:
- **package.json**: Publisher settings and GitHub repository
- **electron/main.js**: Auto-updater logic and event handlers
- **src/components/UpdateManager.tsx**: UI components and user interaction
