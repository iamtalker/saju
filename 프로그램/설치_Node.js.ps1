$ErrorActionPreference = 'Stop'
$ProgressPreference = 'SilentlyContinue'
[Net.ServicePointManager]::SecurityProtocol = [Net.SecurityProtocolType]::Tls12

$architecture = switch ($env:PROCESSOR_ARCHITECTURE) {
  'ARM64' { 'arm64'; break }
  'x86' { 'x86'; break }
  default { 'x64' }
}
$installerAsset = "win-$architecture-msi"
$releases = Invoke-RestMethod -Uri 'https://nodejs.org/dist/index.json'
$release = $releases | Where-Object { $_.lts -and $_.files -contains $installerAsset } | Select-Object -First 1
if (-not $release) { throw "Node.js LTS Windows installer not found for $architecture." }

$version = $release.version
$installerName = "node-$version-$architecture.msi"
$installerPath = Join-Path $env:TEMP $installerName
$installerUrl = "https://nodejs.org/dist/$version/$installerName"
Write-Host "Downloading official Node.js LTS installer $version..."
Invoke-WebRequest -Uri $installerUrl -OutFile $installerPath -UseBasicParsing

Write-Host 'Installing Node.js LTS. Windows may ask for installation approval.'
$arguments = "/i `"$installerPath`" /qn /norestart"
$process = Start-Process -FilePath 'msiexec.exe' -ArgumentList $arguments -Verb RunAs -Wait -PassThru
if ($process.ExitCode -notin @(0, 3010)) { throw "Node.js installer exited with code $($process.ExitCode)." }
Remove-Item -LiteralPath $installerPath -Force -ErrorAction SilentlyContinue
Write-Host 'Node.js LTS installation complete.'
