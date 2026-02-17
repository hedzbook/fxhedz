# File: autopush.ps1
# Auto-stage, commit, and push any changes in the repo

$path = Split-Path -Parent $MyInvocation.MyCommand.Definition
Set-Location $path

# Watch for any file changes in the repo
$watcher = New-Object System.IO.FileSystemWatcher
$watcher.Path = $path
$watcher.IncludeSubdirectories = $true
$watcher.EnableRaisingEvents = $true
$watcher.Filter = "*.*"

# Event action
$action = {
    Start-Sleep -Milliseconds 500  # debounce quick repeated changes
    $status = git status --porcelain
    if ($status) {
        # Prepare commit message
        $files = git status --porcelain | ForEach-Object { ($_ -split ' ')[-1] } | Out-String
        $msg = "Auto-commit: $($files.Trim())"

        git add .
        git commit -m "$msg" 2>$null

        # Push to origin
        git push origin main 2>$null
        Write-Host "$(Get-Date -Format 'HH:mm:ss') - Auto-pushed: $($files.Trim())"
    }
}

# Register events
Register-ObjectEvent $watcher Created -Action $action
Register-ObjectEvent $watcher Changed -Action $action
Register-ObjectEvent $watcher Deleted -Action $action
Register-ObjectEvent $watcher Renamed -Action $action

Write-Host "Watching for changes in $path. Press Ctrl+C to exit."
while ($true) { Start-Sleep 1 }
