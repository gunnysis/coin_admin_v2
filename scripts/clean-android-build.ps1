# Android Build Cleanup Script
# This script cleans corrupted build caches and prepares for a fresh build

Write-Host "=== Android Build Cleanup Script ===" -ForegroundColor Cyan

# #region agent log
$logData = @{
    location = "clean-android-build.ps1:8"
    message = "Script started"
    data = @{
        timestamp = Get-Date -Format "yyyy-MM-dd HH:mm:ss"
    }
    timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    sessionId = "debug-session"
    runId = "run1"
    hypothesisId = "A"
}
try {
    Invoke-WebRequest -Uri "http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435" -Method POST -Headers @{"Content-Type"="application/json"} -Body ($logData | ConvertTo-Json -Compress) -ErrorAction SilentlyContinue | Out-Null
} catch {}
# #endregion

$projectRoot = $PSScriptRoot + "\.."
$androidDir = Join-Path $projectRoot "android"
$nodeModulesDir = Join-Path $projectRoot "node_modules"

Write-Host "`n1. Cleaning Android build directories..." -ForegroundColor Yellow

# Clean Android build directories
$buildDirs = @(
    (Join-Path $androidDir "app\build"),
    (Join-Path $androidDir "app\.cxx"),
    (Join-Path $androidDir "build"),
    (Join-Path $androidDir ".gradle")
)

foreach ($dir in $buildDirs) {
    if (Test-Path $dir) {
        Write-Host "  Removing: $dir" -ForegroundColor Gray
        Remove-Item -Path $dir -Recurse -Force -ErrorAction SilentlyContinue
    }
}

# #region agent log
$logData = @{
    location = "clean-android-build.ps1:42"
    message = "Android build dirs cleaned"
    data = @{
        cleanedDirs = $buildDirs.Count
        dirsRemoved = ($buildDirs | Where-Object { -not (Test-Path $_) }).Count
    }
    timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    sessionId = "debug-session"
    runId = "run1"
    hypothesisId = "B"
}
try {
    Invoke-WebRequest -Uri "http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435" -Method POST -Headers @{"Content-Type"="application/json"} -Body ($logData | ConvertTo-Json -Compress) -ErrorAction SilentlyContinue | Out-Null
} catch {}
# #endregion

Write-Host "`n2. Cleaning CMake build caches (.cxx directories)..." -ForegroundColor Yellow

# Clean app-level .cxx directory (critical for JSON parsing errors)
$appCxxDir = Join-Path $androidDir "app\.cxx"
if (Test-Path $appCxxDir) {
    Write-Host "  Removing app .cxx directory (contains corrupted JSON files)..." -ForegroundColor Red
    Remove-Item -Path $appCxxDir -Recurse -Force -ErrorAction SilentlyContinue
}

# Clean CMake build caches in node_modules
$cxxDirs = Get-ChildItem -Path $nodeModulesDir -Directory -Filter ".cxx" -Recurse -ErrorAction SilentlyContinue

$cxxCount = 0
foreach ($cxxDir in $cxxDirs) {
    $parentModule = $cxxDir.Parent.Name
    Write-Host "  Removing: $($cxxDir.FullName) (module: $parentModule)" -ForegroundColor Gray
    Remove-Item -Path $cxxDir.FullName -Recurse -Force -ErrorAction SilentlyContinue
    $cxxCount++
}

# #region agent log
$logData = @{
    location = "clean-android-build.ps1:55"
    message = "CMake caches cleaned"
    data = @{
        cxxDirsFound = $cxxDirs.Count
        cxxDirsRemoved = $cxxCount
    }
    timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    sessionId = "debug-session"
    runId = "run1"
    hypothesisId = "C"
}
try {
    Invoke-WebRequest -Uri "http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435" -Method POST -Headers @{"Content-Type"="application/json"} -Body ($logData | ConvertTo-Json -Compress) -ErrorAction SilentlyContinue | Out-Null
} catch {}
# #endregion

Write-Host "`n3. Checking for specific problematic modules..." -ForegroundColor Yellow

# Check specific modules mentioned in errors
$problemModules = @(
    "react-native-worklets",
    "expo-modules-core",
    "react-native-screens"
)

foreach ($module in $problemModules) {
    $modulePath = Join-Path $nodeModulesDir $module
    if (Test-Path $modulePath) {
        $androidPath = Join-Path $modulePath "android"
        if (Test-Path $androidPath) {
            $cxxPath = Join-Path $androidPath ".cxx"
            if (Test-Path $cxxPath) {
                Write-Host "  Found .cxx in $module - removing..." -ForegroundColor Red
                Remove-Item -Path $cxxPath -Recurse -Force -ErrorAction SilentlyContinue
            }
            
            # Check for build directories
            $buildPath = Join-Path $androidPath "build"
            if (Test-Path $buildPath) {
                Write-Host "  Found build dir in $module - removing..." -ForegroundColor Red
                Remove-Item -Path $buildPath -Recurse -Force -ErrorAction SilentlyContinue
            }
        }
    }
}

# #region agent log
$logData = @{
    location = "clean-android-build.ps1:85"
    message = "Problem modules checked"
    data = @{
        modulesChecked = $problemModules.Count
    }
    timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    sessionId = "debug-session"
    runId = "run1"
    hypothesisId = "D"
}
try {
    Invoke-WebRequest -Uri "http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435" -Method POST -Headers @{"Content-Type"="application/json"} -Body ($logData | ConvertTo-Json -Compress) -ErrorAction SilentlyContinue | Out-Null
} catch {}
# #endregion

Write-Host "`n4. Cleaning Gradle cache..." -ForegroundColor Yellow

# Clean Gradle cache
$gradleUserHome = $env:USERPROFILE + "\.gradle"
$gradleCache = Join-Path $gradleUserHome "caches"

if (Test-Path $gradleCache) {
    Write-Host "  Cleaning Gradle caches (this may take a while)..." -ForegroundColor Gray
    # Clean only build cache, not all caches
    $buildCache = Join-Path $gradleCache "build-cache-*"
    Get-ChildItem -Path $buildCache -ErrorAction SilentlyContinue | Remove-Item -Recurse -Force -ErrorAction SilentlyContinue
}

# #region agent log
$logData = @{
    location = "clean-android-build.ps1:103"
    message = "Gradle cache cleaned"
    data = @{
        gradleCachePath = $gradleCache
    }
    timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    sessionId = "debug-session"
    runId = "run1"
    hypothesisId = "E"
}
try {
    Invoke-WebRequest -Uri "http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435" -Method POST -Headers @{"Content-Type"="application/json"} -Body ($logData | ConvertTo-Json -Compress) -ErrorAction SilentlyContinue | Out-Null
} catch {}
# #endregion

Write-Host "`n5. Cleaning corrupted Android SDK package.xml files..." -ForegroundColor Yellow

# Clean corrupted package.xml files in Android SDK
$sdkPath = $env:LOCALAPPDATA + "\Android\Sdk"
$systemImagesPath = Join-Path $sdkPath "system-images"
$emulatorPath = Join-Path $sdkPath "emulator"

$corruptedPackages = 0
$inconsistentDirs = 0
$removedInconsistentDirs = 0

# Function to check and remove corrupted package.xml
function Test-AndRemoveCorruptedPackageXml {
    param([string]$FilePath)
    
    try {
        $content = Get-Content -Path $FilePath -Raw -ErrorAction Stop
        if ($null -eq $content -or $content.Trim().Length -eq 0 -or -not $content.Trim().StartsWith("<?xml")) {
            Write-Host "  Found corrupted package.xml: $FilePath" -ForegroundColor Red
            Remove-Item -Path $FilePath -Force -ErrorAction SilentlyContinue
            return $true
        }
    } catch {
        # If we can't read it, it's likely corrupted
        Write-Host "  Found unreadable package.xml: $FilePath" -ForegroundColor Red
        Remove-Item -Path $FilePath -Force -ErrorAction SilentlyContinue
        return $true
    }
    return $false
}

# Scan system-images
if (Test-Path $systemImagesPath) {
    Write-Host "  Scanning system-images for corrupted package.xml files..." -ForegroundColor Gray
    
    $packageXmlFiles = Get-ChildItem -Path $systemImagesPath -Filter "package.xml" -Recurse -ErrorAction SilentlyContinue
    
    foreach ($packageXml in $packageXmlFiles) {
        if (Test-AndRemoveCorruptedPackageXml -FilePath $packageXml.FullName) {
            $corruptedPackages++
        }
    }
    
    # Check for inconsistent directory locations (e.g., x86_64-2 instead of x86_64)
    $systemImageDirs = Get-ChildItem -Path $systemImagesPath -Directory -ErrorAction SilentlyContinue
    foreach ($dir in $systemImageDirs) {
        $subDirs = Get-ChildItem -Path $dir.FullName -Directory -ErrorAction SilentlyContinue
        foreach ($subDir in $subDirs) {
            # Check for directories with suffix like "-2", "-3" etc. (inconsistent locations)
            if ($subDir.Name -match "-\d+$") {
                Write-Host "  Found inconsistent directory location: $($subDir.FullName)" -ForegroundColor Yellow
                Write-Host "    Removing inconsistent directory..." -ForegroundColor Gray
                Remove-Item -Path $subDir.FullName -Recurse -Force -ErrorAction SilentlyContinue
                $inconsistentDirs++
                $removedInconsistentDirs++
            }
        }
    }
} else {
    Write-Host "  Android SDK system-images path not found: $systemImagesPath" -ForegroundColor Gray
}

# Scan emulator directory
if (Test-Path $emulatorPath) {
    Write-Host "  Scanning emulator directory for corrupted package.xml files..." -ForegroundColor Gray
    
    $emulatorPackageXml = Join-Path $emulatorPath "package.xml"
    if (Test-Path $emulatorPackageXml) {
        if (Test-AndRemoveCorruptedPackageXml -FilePath $emulatorPackageXml) {
            $corruptedPackages++
        }
    }
    
    # Check for inconsistent emulator directory (e.g., emulator.backup)
    $emulatorBackupPath = $emulatorPath + ".backup"
    if (Test-Path $emulatorBackupPath) {
        Write-Host "  Found inconsistent emulator directory: $emulatorBackupPath" -ForegroundColor Yellow
        Write-Host "    Removing inconsistent directory..." -ForegroundColor Gray
        Remove-Item -Path $emulatorBackupPath -Recurse -Force -ErrorAction SilentlyContinue
        $inconsistentDirs++
        $removedInconsistentDirs++
    }
} else {
    Write-Host "  Android SDK emulator path not found: $emulatorPath" -ForegroundColor Gray
}

# #region agent log
$logData = @{
    location = "clean-android-build.ps1:250"
    message = "Android SDK package.xml cleanup completed"
    data = @{
        sdkPath = $sdkPath
        corruptedPackagesRemoved = $corruptedPackages
        inconsistentDirsFound = $inconsistentDirs
        inconsistentDirsRemoved = $removedInconsistentDirs
    }
    timestamp = [DateTimeOffset]::Now.ToUnixTimeMilliseconds()
    sessionId = "debug-session"
    runId = "run1"
    hypothesisId = "G"
}
try {
    Invoke-WebRequest -Uri "http://127.0.0.1:7242/ingest/c0d30d1e-7653-4b2c-a6b3-fcec8440b435" -Method POST -Headers @{"Content-Type"="application/json"} -Body ($logData | ConvertTo-Json -Compress) -ErrorAction SilentlyContinue | Out-Null
} catch {}
# #endregion

if ($corruptedPackages -gt 0) {
    Write-Host "  Removed $corruptedPackages corrupted package.xml file(s)" -ForegroundColor Green
} else {
    Write-Host "  No corrupted package.xml files found" -ForegroundColor Gray
}

if ($removedInconsistentDirs -gt 0) {
    Write-Host "  Removed $removedInconsistentDirs inconsistent directory location(s)" -ForegroundColor Green
}

if ($inconsistentDirs -gt 0 -and $removedInconsistentDirs -eq 0) {
    Write-Host "  WARNING: Found $inconsistentDirs inconsistent directory location(s) that could not be removed" -ForegroundColor Yellow
    Write-Host "    You may need to manually remove them or reinstall via Android Studio SDK Manager" -ForegroundColor Yellow
}

Write-Host "`n=== Cleanup Complete ===" -ForegroundColor Green
Write-Host "Next steps:" -ForegroundColor Cyan
Write-Host "1. Try building again: npm run android" -ForegroundColor White
Write-Host "2. If issues persist, you may need to:" -ForegroundColor White
Write-Host "   - Reinstall node_modules: Remove node_modules and run npm install" -ForegroundColor White
Write-Host "   - Fix Android SDK: Use Android Studio SDK Manager to repair system-images" -ForegroundColor White

