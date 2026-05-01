# 1-discover.ps1
# Finds adb, talks to your connected phone, and dumps everything we need
# to decide what's bloatware. Output goes to adb-discovery.txt next to this script.
#
# Usage: right-click -> Run with PowerShell
#        OR open PowerShell in this folder and run:  .\1-discover.ps1
# If you get an execution-policy error, run this once in the same window:
#   Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass

$ErrorActionPreference = 'Continue'
$out = Join-Path $PSScriptRoot 'adb-discovery.txt'

function Find-Adb {
    $cmd = Get-Command adb -ErrorAction SilentlyContinue
    if ($cmd) { return $cmd.Source }
    $candidates = @(
        "$env:LOCALAPPDATA\Android\Sdk\platform-tools\adb.exe",
        "$env:ProgramFiles\Android\platform-tools\adb.exe",
        "${env:ProgramFiles(x86)}\Android\platform-tools\adb.exe",
        "$env:USERPROFILE\platform-tools\adb.exe",
        "C:\platform-tools\adb.exe",
        "C:\adb\adb.exe",
        "$PSScriptRoot\platform-tools\adb.exe",
        "$PSScriptRoot\adb.exe"
    )
    foreach ($c in $candidates) { if (Test-Path $c) { return $c } }
    return $null
}

"=== ADB discovery  $(Get-Date -Format 'yyyy-MM-dd HH:mm:ss') ===" | Out-File $out -Encoding utf8

$adb = Find-Adb
if (-not $adb) {
    @"
ADB NOT FOUND on this PC.

Install Android SDK Platform-Tools:
  https://developer.android.com/tools/releases/platform-tools
Unzip it (e.g. to C:\platform-tools) and re-run this script.
"@ | Out-File $out -Append -Encoding utf8
    Write-Host "ADB not found. See $out" -ForegroundColor Yellow
    exit 1
}
"adb path: $adb" | Out-File $out -Append -Encoding utf8

"`n=== adb devices ===" | Out-File $out -Append -Encoding utf8
& $adb devices 2>&1 | Out-File $out -Append -Encoding utf8

# Bail out early if no device is authorized
$devLine = & $adb devices | Select-String -Pattern "`tdevice$"
if (-not $devLine) {
    @"

No authorized device detected.
- Make sure the phone is unlocked and USB cable is data-capable (not charge-only).
- On the phone, accept the 'Allow USB debugging?' prompt.
- If it says 'unauthorized', revoke USB debugging authorizations on the phone
  (Developer options) and replug.
"@ | Out-File $out -Append -Encoding utf8
    Write-Host "No authorized device. See $out" -ForegroundColor Yellow
    exit 1
}

"`n=== device props ===" | Out-File $out -Append -Encoding utf8
foreach ($p in @(
    'ro.product.manufacturer','ro.product.brand','ro.product.model',
    'ro.product.device','ro.product.name','ro.build.version.release',
    'ro.build.version.sdk','ro.build.display.id'
)) {
    $v = (& $adb shell getprop $p 2>&1) -join ''
    "$p = $v" | Out-File $out -Append -Encoding utf8
}

"`n=== current user (should be 0 for primary) ===" | Out-File $out -Append -Encoding utf8
& $adb shell am get-current-user 2>&1 | Out-File $out -Append -Encoding utf8

"`n=== system packages (pm list packages -s) ===" | Out-File $out -Append -Encoding utf8
& $adb shell pm list packages -s 2>&1 | Sort-Object | Out-File $out -Append -Encoding utf8

"`n=== third-party packages (pm list packages -3) ===" | Out-File $out -Append -Encoding utf8
& $adb shell pm list packages -3 2>&1 | Sort-Object | Out-File $out -Append -Encoding utf8

"`n=== disabled packages (pm list packages -d) ===" | Out-File $out -Append -Encoding utf8
& $adb shell pm list packages -d 2>&1 | Sort-Object | Out-File $out -Append -Encoding utf8

Write-Host ""
Write-Host "Done. Output written to:" -ForegroundColor Green
Write-Host "  $out"
Write-Host "Send that file back to Cowork chat." -ForegroundColor Green
