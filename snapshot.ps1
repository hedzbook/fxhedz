$ErrorActionPreference = "Stop"

# Always use script location (fxhedz root)
$root = $PSScriptRoot

$webRoot = Join-Path $root "fxhedz-web"
$androidRoot = Join-Path $root "fxhedz-android"

$webOutput = Join-Path $root "fxhedz-web-snapshot.txt"
$androidOutput = Join-Path $root "fxhedz-android-snapshot.txt"

# ==================================================
# WEB SNAPSHOT
# ==================================================

"" | Out-File $webOutput -Encoding utf8

Write-Host "Generating WEB structured snapshot..."

Add-Content $webOutput "=================================================="
Add-Content $webOutput "WEB PROJECT STRUCTURE"
Add-Content $webOutput "==================================================`r`n"

Get-ChildItem -Path $webRoot -Recurse -File |
Where-Object {
    $_.FullName -notmatch "\\.git\\" -and
    $_.FullName -notmatch "\\node_modules\\" -and
    $_.FullName -notmatch "\\.next\\" -and
    $_.FullName -notmatch "\\dist\\" -and
    $_.FullName -notmatch "\\build\\" -and
    $_.FullName -notmatch "\\_zip_stage\\" -and
    $_.FullName -notmatch "\\z\.backup\\" -and
    $_.Name -notin @(
        "z-commit-push.bat",
        "zipper.bat",
        "zz.snapshot.bat",
        "snapshot-all.ps1",
        "fxhedz-web-snapshot.txt",
        "README.md",
        "autopush.ps1"
    )
} |
Sort-Object FullName |
ForEach-Object {
    $relative = $_.FullName.Substring($webRoot.Length + 1)
    Add-Content $webOutput $relative
}

Add-Content $webOutput "`r`n=================================================="
Add-Content $webOutput "FULL WEB SOURCE CODE"
Add-Content $webOutput "==================================================`r`n"

$folders = @("app", "components", "lib")

foreach ($folder in $folders) {

    $path = Join-Path $webRoot $folder

    if (Test-Path $path) {

        Get-ChildItem -Path $path -Recurse -File |
        Where-Object {
            $_.Extension -in ".ts", ".tsx" -and
            $_.FullName -notmatch "\\z\.backup\\"
        } |
        Sort-Object FullName |
        ForEach-Object {

            $relativePath = $_.FullName.Substring($webRoot.Length + 1)

            Add-Content $webOutput "`r`n// $relativePath"
            Add-Content $webOutput "// --------------------------------------------------`r`n"

            Get-Content -LiteralPath $_.FullName |
            Add-Content $webOutput

            Add-Content $webOutput "`r`n"
        }
    }
}

$rootFiles = @(
    "package.json",
    "next.config.ts",
    "tsconfig.json",
    "tailwind.config.ts"
)

foreach ($file in $rootFiles) {

    $filePath = Join-Path $webRoot $file

    if (Test-Path $filePath) {

        Add-Content $webOutput "`r`n// $file"
        Add-Content $webOutput "// --------------------------------------------------`r`n"

        Get-Content -LiteralPath $filePath |
        Add-Content $webOutput

        Add-Content $webOutput "`r`n"
    }
}

Write-Host "Structured snapshot created: fxhedz-web-snapshot.txt"

# ==================================================
# ANDROID SNAPSHOT
# ==================================================

Write-Host "Generating ANDROID structured snapshot..."

"" | Out-File $androidOutput -Encoding utf8

Add-Content $androidOutput "=================================================="
Add-Content $androidOutput "ANDROID PROJECT STRUCTURE"
Add-Content $androidOutput "==================================================`r`n"

$appPath = Join-Path $androidRoot "app"

if (Test-Path $appPath) {
    Get-ChildItem -Path $appPath -Recurse -File |
    Sort-Object FullName |
    ForEach-Object {
        $relative = $_.FullName.Substring($androidRoot.Length + 1)
        Add-Content $androidOutput $relative
    }
}

$androidRootFiles = @(
    "app.json",
    "package.json",
    "tsconfig.json"
)

foreach ($file in $androidRootFiles) {
    $filePath = Join-Path $androidRoot $file
    if (Test-Path $filePath) {
        Add-Content $androidOutput $file
    }
}

Add-Content $androidOutput "`r`n=================================================="
Add-Content $androidOutput "FULL ANDROID SOURCE CODE"
Add-Content $androidOutput "==================================================`r`n"

if (Test-Path $appPath) {

    Get-ChildItem -Path $appPath -Recurse -File |
    Sort-Object FullName |
    ForEach-Object {

        $relativePath = $_.FullName.Substring($androidRoot.Length + 1)

        Add-Content $androidOutput "`r`n// $relativePath"
        Add-Content $androidOutput "// --------------------------------------------------`r`n"

        Get-Content -LiteralPath $_.FullName |
        Add-Content $androidOutput

        Add-Content $androidOutput "`r`n"
    }
}

foreach ($file in $androidRootFiles) {

    $filePath = Join-Path $androidRoot $file

    if (Test-Path $filePath) {

        Add-Content $androidOutput "`r`n// $file"
        Add-Content $androidOutput "// --------------------------------------------------`r`n"

        Get-Content -LiteralPath $filePath |
        Add-Content $androidOutput

        Add-Content $androidOutput "`r`n"
    }
}

Write-Host "Structured snapshot created: fxhedz-android-snapshot.txt"