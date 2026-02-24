$ErrorActionPreference = "Stop"

# Always use script location as root (never Get-Location)
$root = $PSScriptRoot

$timestamp = Get-Date -Format "yyyy-MM-dd_HH-mm-ss"
$backupFolder = Join-Path $root "__backup__fxhedz"
$zipName = "fxhedz_backup_$timestamp.zip"
$zipPath = Join-Path $backupFolder $zipName

Write-Host "Creating optimized backup..."

# Ensure backup folder exists
if (!(Test-Path $backupFolder)) {
    New-Item -ItemType Directory -Path $backupFolder | Out-Null
}

# ==========================
# ZIP DIRECTLY (NO TEMP FOLDER)
# ==========================

tar -a -c -f $zipPath `
    -C $root `
    fxhedz-android `
    fxhedz-web

Write-Host "Backup created: $zipPath"

# =====================================================
# SNAPSHOT GENERATION
# =====================================================

Write-Host "Generating structured snapshots..."

$webRoot = Join-Path $root "fxhedz-web"
$androidRoot = Join-Path $root "fxhedz-android"

$webOutput = Join-Path $root "fxhedz-web-snapshot.txt"
$androidOutput = Join-Path $root "fxhedz-android-snapshot.txt"

# -------------------------
# WEB SNAPSHOT
# -------------------------

"" | Out-File $webOutput -Encoding utf8

Get-ChildItem $webRoot -Recurse -File |
Where-Object {
    $_.FullName -notmatch "\\node_modules\\|\\.git\\|\\.next\\|\\dist\\|\\build\\"
} |
Sort-Object FullName |
ForEach-Object {
    $_.FullName.Substring($webRoot.Length + 1)
} |
Add-Content $webOutput

# -------------------------
# ANDROID SNAPSHOT
# -------------------------

"" | Out-File $androidOutput -Encoding utf8

$appPath = Join-Path $androidRoot "app"

if (Test-Path $appPath) {
    Get-ChildItem $appPath -Recurse -File |
    Sort-Object FullName |
    ForEach-Object {
        $_.FullName.Substring($androidRoot.Length + 1)
    } |
    Add-Content $androidOutput
}

Write-Host "Snapshots created successfully."
Write-Host "Done."