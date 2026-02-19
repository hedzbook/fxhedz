$root = Get-Location
$outputFile = Join-Path $root "PROJECT_SNAPSHOT.txt"

# Reset file
"" | Out-File $outputFile -Encoding utf8

Write-Host "Generating structured snapshot..."

# ==================================================
# PART 1 — PROJECT STRUCTURE (TREE)
# ==================================================

Add-Content $outputFile "=================================================="
Add-Content $outputFile "PROJECT STRUCTURE"
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
        "PROJECT_SNAPSHOT.txt",
        "README.md",
        "autopush.ps1"
    )
} |
Sort-Object FullName |
ForEach-Object {
    $relative = $_.FullName.Replace("$root\", "")
    Add-Content $outputFile $relative
}

Add-Content $outputFile "`r`n=================================================="
Add-Content $outputFile "FULL SOURCE CODE"
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

            $relativePath = $_.FullName.Replace("$root\", "")

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

Write-Host "Structured snapshot created: PROJECT_SNAPSHOT.txt"
