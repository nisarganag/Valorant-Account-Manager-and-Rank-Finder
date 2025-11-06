# PowerShell script to automate version bumping and tagging
param(
    [Parameter(Mandatory=$true)]
    [ValidateSet("patch", "minor", "major")]
    [string]$Type,
    
    [Parameter(Mandatory=$true)]
    [string]$Message
)

Write-Host "🚀 Starting automated release process..." -ForegroundColor Green

# Read current version from package.json
$packageJson = Get-Content "package.json" | ConvertFrom-Json
$currentVersion = $packageJson.version
Write-Host "📦 Current version: $currentVersion" -ForegroundColor Yellow

# Parse version numbers
$versionParts = $currentVersion.Split('.')
$major = [int]$versionParts[0]
$minor = [int]$versionParts[1] 
$patch = [int]$versionParts[2]

# Bump version based on type
switch ($Type) {
    "major" { 
        $major++
        $minor = 0
        $patch = 0
    }
    "minor" { 
        $minor++
        $patch = 0
    }
    "patch" { 
        $patch++
    }
}

$newVersion = "$major.$minor.$patch"
Write-Host "🆕 New version: $newVersion" -ForegroundColor Green

# Update package.json
$packageJson.version = $newVersion
$packageJson | ConvertTo-Json -Depth 100 | Set-Content "package.json"

# Git operations
Write-Host "📝 Committing version bump..." -ForegroundColor Blue
git add package.json
git commit -m "🔖 Bump version to $newVersion"
git push origin main

Write-Host "🏷️ Creating and pushing tag..." -ForegroundColor Blue
git tag -a "v$newVersion" -m "v$newVersion - $Message"
git push origin "v$newVersion"

Write-Host "✅ Release process complete!" -ForegroundColor Green
Write-Host "🌐 Check GitHub Actions: https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/actions" -ForegroundColor Cyan
Write-Host "📦 Releases will be available at: https://github.com/nisarganag/Valorant-Account-Manager-and-Rank-Finder/releases" -ForegroundColor Cyan
Write-Host ""
Write-Host "🔄 Cross-Platform builds will be created:" -ForegroundColor Yellow
Write-Host "  🪟 Windows: .exe installer" -ForegroundColor Blue
Write-Host "  🍎 macOS: .dmg and .zip files (Intel + Apple Silicon)" -ForegroundColor Blue  
Write-Host "  🐧 Linux: .AppImage, .deb, and .rpm packages" -ForegroundColor Blue