param(
    [string] $Profile = "h2"
)

# Run CareerMatrix API (uses bundled Maven from tools/ if mvn is not on PATH)
$ErrorActionPreference = "Stop"
$here = Split-Path -Parent $MyInvocation.MyCommand.Path
Set-Location $here

$mvnArgs = @("spring-boot:run")
if ($Profile) {
    $mvnArgs += "-Dspring-boot.run.profiles=$Profile"
}

$mvn = Get-Command mvn -ErrorAction SilentlyContinue
if ($mvn) {
    & mvn @mvnArgs
    exit $LASTEXITCODE
}

$bundled = Join-Path $here "tools\apache-maven-3.9.6\bin\mvn.cmd"
if (Test-Path $bundled) {
    & $bundled @mvnArgs
    exit $LASTEXITCODE
}

Write-Host "Maven not found. Install Maven or extract apache-maven to backend/tools/apache-maven-3.9.6" -ForegroundColor Red
exit 1
