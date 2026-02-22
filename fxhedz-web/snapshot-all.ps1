$root = Get-Location
$outputFile = Join-Path $root "fxhedz-web-snapshot.txt"

# Reset file
"" | Out-File $outputFile -Encoding utf8

Write-Host "Generating structured snapshot..."

# ==================================================
# PART 1 — PROJECT STRUCTURE (TREE)
# ==================================================

Add-Content $outputFile "=================================================="
Add-Content $outputFile "WEB PROJECT STRUCTURE"
Add-Content $outputFile "==================================================`r`n"

Get-ChildItem -Recurse -File |
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
    $relative = $_.FullName.Substring($root.Path.Length + 1)
    Add-Content $outputFile $relative
}

Add-Content $outputFile "`r`n=================================================="
Add-Content $outputFile "FULL WEB SOURCE CODE"
Add-Content $outputFile "==================================================`r`n"

# ==================================================
# PART 2 — FULL CODE (SELECTED FILE TYPES)
# ==================================================

$folders = @("app", "components", "lib")

foreach ($folder in $folders) {

    $path = Join-Path $root $folder

    if (Test-Path $path) {

        Get-ChildItem -Path $path -Recurse -File |
        Where-Object {
            $_.Extension -in ".ts", ".tsx" -and
            $_.FullName -notmatch "\\z\.backup\\"
        } |
        Sort-Object FullName |
        ForEach-Object {

            $relativePath = $_.FullName.Substring($root.Path.Length + 1)

            Add-Content $outputFile "`r`n// $relativePath"
            Add-Content $outputFile "// --------------------------------------------------`r`n"

            Get-Content -LiteralPath $_.FullName |
            Add-Content $outputFile

            Add-Content $outputFile "`r`n"
        }
    }
}

# ==================================================
# PART 3 — ROOT CONFIG FILES
# ==================================================

$rootFiles = @(
    "package.json",
    "next.config.ts",
    "tsconfig.json",
    "tailwind.config.ts"
)

foreach ($file in $rootFiles) {

    $filePath = Join-Path $root $file

    if (Test-Path $filePath) {

        Add-Content $outputFile "`r`n// $file"
        Add-Content $outputFile "// --------------------------------------------------`r`n"

        Get-Content -LiteralPath $filePath |
        Add-Content $outputFile

        Add-Content $outputFile "`r`n"
    }
}

Write-Host "Structured snapshot created: fxhedz-web-snapshot.txt"

# ==================================================
# ANDROID SNAPSHOT (CLEAN MINIMAL VERSION)
# ==================================================

Write-Host "Generating ANDROID structured snapshot..."

$parentRoot = Split-Path $root -Parent
$androidRoot = Join-Path $parentRoot "fxhedz-android"

if (!(Test-Path $androidRoot)) {
    Write-Host "fxhedz-android folder not found. Skipping Android snapshot."
    return
}

$androidOutput = Join-Path $root "fxhedz-android-snapshot.txt"

# Reset file
"" | Out-File $androidOutput -Encoding utf8

Add-Content $androidOutput "=================================================="
Add-Content $androidOutput "ANDROID PROJECT STRUCTURE"
Add-Content $androidOutput "==================================================`r`n"

# ==================================================
# PART 1 — CLEAN ANDROID STRUCTURE
# ==================================================

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

# ==================================================
# PART 2 — FULL APP SOURCE
# ==================================================

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

# ==================================================
# PART 3 — ANDROID ROOT CONFIG FILES
# ==================================================

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