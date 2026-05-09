# v1.3.0 Release Notes

**The Biggest Update Yet — 10+ New Features**

---

## 🆕 What's New

### 🔐 Security Overhaul
- **PBKDF2 Key Derivation**: Encryption key is now derived from your master password using PBKDF2 with **100,000 iterations** and a unique per-installation salt. Previously used a hardcoded key.
- **Random IV Per Save**: Each save operation uses a fresh random initialization vector instead of a fixed one.

### 🏆 Rank Tracking Upgrades
- **HenrikDev API Integration**: Optional API key support for richer rank data — current rank with RR, rank icons, and more.
- **📈 Rank History**: Bar chart visualization showing rank progression over time. Click the 📈 button on any account to view.
- **🔝 Peak Rank Tracking**: Records and displays the highest rank each account has achieved.
- **Fallback API**: Rank fetching works out-of-the-box even without an API key using the legacy service.

### 🏷 Account Tags & Groups
- **Custom Tags**: Add tags to accounts (e.g., "smurf", "main", "EU alts", "borrowed")
- **Tag Filtering**: Filter your account list by any tag
- **Tag Manager**: Bulk manage tags across all accounts from one panel

### ✅ Bulk Operations
- **Multi-Select**: Checkboxes on every account row/card
- **Bulk Actions Toolbar**: Delete, tag, or refresh ranks for multiple accounts at once
- **Select All**: One-click select/deselect all accounts

### 👤 Account Lending Tracker
- Mark accounts as lent out with borrower name and date
- Filter by lending status (All / Lent Out / Available)

### ⌨️ Keyboard Shortcuts

| Shortcut | Action |
|----------|--------|
| `Ctrl+F` | Focus search |
| `Ctrl+N` | New account |
| `Ctrl+R` | Refresh all ranks |
| `Ctrl+Shift+I` | Toggle import |
| `Ctrl+Shift+S` | Toggle statistics |
| `Ctrl+Shift+E` | Export to CSV |
| `Ctrl+Shift+G` | Toggle list/grid view |
| `Ctrl+Shift+C` | Toggle compact mode |
| `Escape` | Close all modals / deselect |
| `?` | Show shortcuts reference |

### 🖥️ System Tray
- Minimize to system tray instead of closing
- Right-click tray icon for quick show/quit
- Double-click tray icon to restore window

### 📋 Compact View
- Toggle dense layout for seeing more accounts on screen
- Reduces row height and font size across the table

### 💾 Persistent Preferences
- View layout, sort order, compact mode, and theme now persist across sessions
- No need to reconfigure each time you open the app

### 📤 Export to CSV
- Export all accounts to CSV with one click (`Ctrl+Shift+E`)
- Includes Riot ID, username, password, region, skins, tags, lending info, and notes

### 🔄 Scheduled Auto-Refresh
- Optionally auto-refresh ranks at configurable intervals
- Toggle on/off from the settings bar

### 📊 Enhanced Statistics
- Region distribution added to the stats dashboard
- Tags used and lent-out counts
- Live rank-based distribution from fetched data

---

## 🐛 Fixes
- Fixed rank API returning 404 — migrated to dual API system
- Fixed React DOM warnings for non-standard attributes
- Fixed encryption key derivation order (salt loaded before key generation)
- Improved decryption resilience with graceful fallback on corrupted data

---

## 📦 Download

| Platform | File |
|----------|------|
| 🪟 Windows | `Valorant Account Manager Setup 1.3.0.exe` |
| 🍎 macOS | `Valorant Account Manager-1.3.0.dmg` / `.zip` |
| 🐧 Linux | `.AppImage` / `.deb` / `.rpm` |

> **Auto-update**: Existing users will receive the update automatically. Click the update icon in the top-right corner.

---

## 🔑 Getting a HenrikDev API Key (Optional)

For enhanced rank data (rank icons, RR points, history):
1. Join the [HenrikDev Discord](https://discord.gg/X3GaVkX2YN)
2. Visit [api.henrikdev.xyz/dashboard](https://api.henrikdev.xyz/dashboard)
3. Generate a free API key
4. Click the red "Not Set" badge in the app and paste your key

Rank fetching works without a key too — it just uses the basic service.

---

**Full Changelog**: [v1.2.8...v1.3.0](https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/compare/v1.2.8...v1.3.0)
