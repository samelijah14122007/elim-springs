# Script to package ELIM SPRINGS for ChatGPT & Hackathon Verification
$ErrorActionPreference = 'Stop'
$projectRoot = 'C:\Users\Sam Elijah\OneDrive\Documents\elim-springs'
$zipPath = Join-Path $projectRoot 'elim-springs-chatgpt-verification.zip'

if (Test-Path $zipPath) {
    Remove-Item -Force $zipPath
}

$tempDir = Join-Path $env:TEMP ('elim_zip_' + [guid]::NewGuid().ToString())
New-Item -ItemType Directory -Path $tempDir | Out-Null

$itemsToCopy = @(
    'src',
    'python-backend',
    'supabase',
    'public',
    'scripts',
    'package.json',
    'package-lock.json',
    'tsconfig.json',
    'tsconfig.app.json',
    'tsconfig.node.json',
    'vite.config.ts',
    'index.html',
    'README.md',
    'CHATGPT_VERIFICATION.md',
    '.env.example',
    '.oxlintrc.json',
    '.gitignore'
)

foreach ($item in $itemsToCopy) {
    $srcPath = Join-Path $projectRoot $item
    if (Test-Path $srcPath) {
        Copy-Item -Path $srcPath -Destination (Join-Path $tempDir $item) -Recurse -Force
    }
}

# Clean any pycache or temporary zip script from temp folder
Get-ChildItem -Path $tempDir -Recurse -Directory -Filter '__pycache__' | Remove-Item -Recurse -Force
if (Test-Path (Join-Path $tempDir 'scripts\makeZip.ps1')) {
    Remove-Item -Force (Join-Path $tempDir 'scripts\makeZip.ps1')
}

# Compress into zip
Add-Type -AssemblyName System.IO.Compression.FileSystem
[System.IO.Compression.ZipFile]::CreateFromDirectory($tempDir, $zipPath, [System.IO.Compression.CompressionLevel]::Optimal, $false)

# Clean up temp directory
Remove-Item -Recurse -Force $tempDir

# Output details
$zipItem = Get-Item $zipPath
$sizeMB = [math]::Round($zipItem.Length / 1MB, 2)
Write-Host "SUCCESS: Created $zipPath ($sizeMB MB)"
