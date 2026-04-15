function Test-PortInUse {
  param([int]$port)
  $tcp = New-Object System.Net.Sockets.TcpClient
  try {
    $tcp.Connect('127.0.0.1', $port)
    return $true
  } catch {
    return $false
  } finally {
    if ($tcp.Connected) { $tcp.Close() }
  }
}

function Get-FreePort {
  param(
    [int]$startPort = 5000,
    [int]$maxTry    = 20
  )
  for ($p = $startPort; $p -lt $startPort + $maxTry; $p++) {
    if (-not (Test-PortInUse -port $p)) { return $p }
  }
  throw "No free ports found from $startPort to $($startPort + $maxTry - 1)"
}

$repoRoot = Split-Path -Parent $MyInvocation.MyCommand.Path
$envFile = Join-Path $repoRoot "backend\.env"
if (-not (Test-Path $envFile)) {
  Write-Error "Missing $envFile"
  exit 1
}

Get-Content $envFile | ForEach-Object {
  if (-not [string]::IsNullOrWhiteSpace($_) -and $_ -notmatch '^[\s#]') {
    $parts = $_ -split '=', 2
    if ($parts.Length -eq 2) { Set-Item -Path "Env:$($parts[0])" -Value $parts[1].Trim() }
  }
}

$mysqlHost = $env:MYSQLHOST
if (-not $mysqlHost) { $mysqlHost = $env:DB_HOST }
if (-not $mysqlHost) { $mysqlHost = "localhost" }
$mysqlPort = $env:MYSQLPORT
if (-not $mysqlPort) { $mysqlPort = $env:DB_PORT }
if (-not $mysqlPort) { $mysqlPort = "3306" }
$mysqlUser = $env:MYSQLUSER
if (-not $mysqlUser) { $mysqlUser = $env:DB_USER }
if (-not $mysqlUser) { $mysqlUser = "root" }
$mysqlPass = $env:MYSQLPASSWORD
if (-not $mysqlPass) { $mysqlPass = $env:DB_PASSWORD }
if (-not $mysqlPass) { $mysqlPass = "" }
$dbName = $env:MYSQL_DATABASE
if (-not $dbName) { $dbName = $env:DB_NAME }
if (-not $dbName) { $dbName = "post_office_8" }
$portEnv = $env:PORT
if (-not $portEnv) { $basePort = 5000 } else { $basePort = [int]$portEnv }

if ($mysqlHost -in @('localhost', '127.0.0.1')) {
  Write-Host "1) Starting MySQL service..."
  Try {
    Start-Service -Name MySQL -ErrorAction Stop
  } Catch {
    Try { Start-Service -Name MySQL80 -ErrorAction Stop } Catch { Write-Warning "MySQL service not found or already running." }
  }
} else {
  Write-Host "1) Skipping local MySQL service start for remote host: $mysqlHost"
}

Write-Host "2) Creating database if not exists: $dbName"
if ($mysqlPass) {
  & mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPass -e "CREATE DATABASE IF NOT EXISTS $dbName;"
} else {
  & mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser -e "CREATE DATABASE IF NOT EXISTS $dbName;"
}
if ($LASTEXITCODE -ne 0) { Write-Error "Unable to create DB (exit code $LASTEXITCODE)"; exit 2 }

$schemaPath = Join-Path $repoRoot "backend\sql\Schema.sql"
if (Test-Path $schemaPath) {
  Write-Host "3) Importing schema from $schemaPath"
  if ($mysqlPass) {
    Get-Content $schemaPath | & mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPass $dbName
  } else {
    Get-Content $schemaPath | & mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser $dbName
  }
  if ($LASTEXITCODE -ne 0) { Write-Error "Schema import failed"; exit 3 }
} else {
  Write-Host "3) No schema file found at $schemaPath; skipping schema import. Ensure tables exist by other means."
}

$seedPath = Join-Path $repoRoot "backend\sql\Seed_Data.sql"
if (-not (Test-Path $seedPath)) {
  Write-Error "Seed data file not found at $seedPath"
  exit 4
}

Write-Host "4) Importing seed data from $seedPath"
if ($mysqlPass) {
  Get-Content $seedPath | & mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser -p$mysqlPass $dbName
} else {
  Get-Content $seedPath | & mysql -h $mysqlHost -P $mysqlPort -u $mysqlUser $dbName
}
if ($LASTEXITCODE -ne 0) { Write-Error "Seed data import failed"; exit 5 }

$freePort = Get-FreePort -startPort $basePort -maxTry 20
if ($freePort -ne $basePort) {
  Write-Warning "Base port $basePort is in use. Using $freePort instead."
}
$env:PORT = $freePort

Write-Host "5) Starting backend on port $freePort"
Push-Location (Join-Path $repoRoot "backend")
if (-not (Test-Path "node_modules")) { npm install }
npm run dev -- --port $freePort
Pop-Location
