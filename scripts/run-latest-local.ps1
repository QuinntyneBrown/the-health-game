param(
    [string]$ConnectionString = "Server=.\SQLEXPRESS;Database=HealthGame;Trusted_Connection=True;TrustServerCertificate=True",
    [string]$BackendHost = "localhost",
    [int]$BackendPort = 5224,
    [string]$FrontendHost = "localhost",
    [int]$FrontendPort = 4200,
    [string]$SeedUsername = "quinn",
    [string]$SeedPassword = "Password1!",
    [switch]$NoLaunch
)

$ErrorActionPreference = "Stop"

function Test-ListenerConflictsHost {
    param(
        [string]$LocalAddress,
        [string]$HostName
    )

    $hostLower = $HostName.ToLowerInvariant()
    if ($hostLower -eq "localhost") {
        return $true
    }

    if ($hostLower -eq "127.0.0.1") {
        return $LocalAddress -in @("127.0.0.1", "0.0.0.0")
    }

    if ($hostLower -eq "::1") {
        return $LocalAddress -in @("::1", "::")
    }

    return $LocalAddress -in @($HostName, "0.0.0.0", "::")
}

function Get-PortListeners {
    param(
        [int]$Port,
        [string]$HostName
    )

    Get-NetTCPConnection -LocalPort $Port -State Listen -ErrorAction SilentlyContinue |
        Where-Object { Test-ListenerConflictsHost -LocalAddress $_.LocalAddress -HostName $HostName } |
        Select-Object -ExpandProperty OwningProcess -Unique |
        Where-Object { $_ -and $_ -ne 0 } |
        ForEach-Object {
            $process = Get-CimInstance Win32_Process -Filter "ProcessId=$_" -ErrorAction SilentlyContinue
            [pscustomobject]@{
                ProcessId = $_
                LocalAddress = (
                    Get-NetTCPConnection -LocalPort $Port -State Listen -OwningProcess $_ -ErrorAction SilentlyContinue |
                        Where-Object { Test-ListenerConflictsHost -LocalAddress $_.LocalAddress -HostName $HostName } |
                        Select-Object -ExpandProperty LocalAddress -Unique
                ) -join ","
                CommandLine = $process.CommandLine
            }
        }
}

function Assert-PortAvailable {
    param(
        [int]$Port,
        [string]$HostName,
        [string]$Name
    )

    $listeners = @(Get-PortListeners -Port $Port -HostName $HostName)
    if ($listeners.Count -eq 0) {
        return
    }

    $details = $listeners |
        ForEach-Object { "PID $($_.ProcessId) [$($_.LocalAddress)]: $($_.CommandLine)" }
    throw "$Name port $Port on $HostName is already in use. Stop the process using it or pass a different port. $($details -join ' | ')"
}

function Test-CommandLineContainsAll {
    param(
        [string]$CommandLine,
        [string[]]$Fragments
    )

    if ([string]::IsNullOrWhiteSpace($CommandLine)) {
        return $false
    }

    $normalizedCommandLine = $CommandLine.ToLowerInvariant()
    foreach ($fragment in $Fragments) {
        if ([string]::IsNullOrWhiteSpace($fragment)) {
            continue
        }

        if (!$normalizedCommandLine.Contains($fragment.ToLowerInvariant())) {
            return $false
        }
    }

    return $true
}

function Stop-OwnedPortListeners {
    param(
        [int]$Port,
        [string]$HostName,
        [string]$Name,
        [string[]]$CommandLineFragments
    )

    $listeners = @(Get-PortListeners -Port $Port -HostName $HostName)
    foreach ($listener in $listeners) {
        if (!(Test-CommandLineContainsAll -CommandLine $listener.CommandLine -Fragments $CommandLineFragments)) {
            continue
        }

        Write-Host "Stopping existing $Name process on $HostName`:$Port with PID $($listener.ProcessId)."
        Stop-Process -Id $listener.ProcessId -Force -ErrorAction Stop

        $deadline = (Get-Date).AddSeconds(15)
        while ((Get-Date) -lt $deadline) {
            $stillRunning = Get-Process -Id $listener.ProcessId -ErrorAction SilentlyContinue
            if (!$stillRunning) {
                break
            }

            Start-Sleep -Milliseconds 250
        }
    }
}

function Wait-TcpPort {
    param(
        [string]$HostName,
        [int]$Port,
        [string]$Name,
        [int]$TimeoutSeconds = 120
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        $client = [System.Net.Sockets.TcpClient]::new()
        try {
            $connection = $client.BeginConnect($HostName, $Port, $null, $null)
            if ($connection.AsyncWaitHandle.WaitOne(1000, $false)) {
                $client.EndConnect($connection)
                return
            }
        }
        catch {
        }
        finally {
            $client.Dispose()
        }

        if ((Get-Date) -ge $deadline) {
            break
        }

        Start-Sleep -Seconds 1
    }

    throw "$Name did not start listening on $HostName`:$Port within $TimeoutSeconds seconds."
}

function Wait-ProcessExit {
    param(
        [System.Diagnostics.Process]$Process,
        [string]$Name,
        [int]$Seconds = 5
    )

    if ($Process.WaitForExit($Seconds * 1000)) {
        if ($Process.ExitCode -ne 0) {
            throw "$Name process exited with code $($Process.ExitCode)."
        }
        else {
            return
        }
    }
}

function Wait-HttpEndpoint {
    param(
        [string]$Url,
        [string]$Name,
        [string]$OutLog,
        [string]$ErrLog,
        [int]$TimeoutSeconds = 180
    )

    $deadline = (Get-Date).AddSeconds($TimeoutSeconds)
    while ((Get-Date) -lt $deadline) {
        try {
            $response = Invoke-WebRequest -Uri $Url -UseBasicParsing -TimeoutSec 3
            if ($response.StatusCode -ge 200 -and $response.StatusCode -lt 500) {
                return
            }
        }
        catch {
            Start-Sleep -Seconds 2
        }
    }

    $outTail = if (Test-Path -LiteralPath $OutLog) { Get-Content -LiteralPath $OutLog -Tail 40 | Out-String } else { "" }
    $errTail = if (Test-Path -LiteralPath $ErrLog) { Get-Content -LiteralPath $ErrLog -Tail 40 | Out-String } else { "" }
    throw "$Name did not respond at $Url within $TimeoutSeconds seconds.`nstdout:`n$outTail`nstderr:`n$errTail"
}

$repoRoot = Resolve-Path (Join-Path $PSScriptRoot "..")
$backendRoot = Join-Path $repoRoot "backend"
$frontendRoot = Join-Path $repoRoot "frontend"
$backendDll = Join-Path $backendRoot "src\HealthGame.Api\bin\Release\net10.0\HealthGame.Api.dll"
$repoLocalDotnet = Join-Path $env:USERPROFILE ".dotnet10\dotnet.exe"
$dotnet = if ($env:DOTNET_EXE) {
    $env:DOTNET_EXE
} elseif (Test-Path -LiteralPath $repoLocalDotnet) {
    $repoLocalDotnet
} else {
    "dotnet"
}
$dotnetCommand = Get-Command $dotnet
$dotnetHome = Split-Path $dotnetCommand.Source -Parent
$env:DOTNET_ROOT = $dotnetHome
$env:PATH = "$dotnetHome;$env:PATH"
$packageOutput = Join-Path $backendRoot "artifacts\tools"

if (!$NoLaunch) {
    Stop-OwnedPortListeners `
        -Port $BackendPort `
        -HostName $BackendHost `
        -Name "Backend" `
        -CommandLineFragments @($backendDll)
    Stop-OwnedPortListeners `
        -Port $FrontendPort `
        -HostName $FrontendHost `
        -Name "Frontend" `
        -CommandLineFragments @($frontendRoot, "ng.js", "serve", "the-health-game")
    Assert-PortAvailable -Port $BackendPort -HostName $BackendHost -Name "Backend"
    Assert-PortAvailable -Port $FrontendPort -HostName $FrontendHost -Name "Frontend"
}

New-Item -ItemType Directory -Force -Path $packageOutput | Out-Null
Get-ChildItem -LiteralPath $packageOutput -Filter "HealthGame.Cli.*.nupkg" -ErrorAction SilentlyContinue |
    ForEach-Object { Remove-Item -LiteralPath $_.FullName -Force }

Push-Location $backendRoot
try {
    & $dotnet build "HealthGame.Backend.sln" --configuration Release
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $dotnet pack "src\HealthGame.Cli\HealthGame.Cli.csproj" --configuration Release --output $packageOutput
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

    & $dotnet tool update --global HealthGame.Cli --add-source $packageOutput
    if ($LASTEXITCODE -ne 0) {
        & $dotnet tool install --global HealthGame.Cli --add-source $packageOutput
    }
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
}

Push-Location $frontendRoot
try {
    & npm run build
    if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }
}
finally {
    Pop-Location
}

$env:ConnectionStrings__HealthGame = $ConnectionString
$healthgameCommand = Get-Command "healthgame" -ErrorAction SilentlyContinue
$healthgame = if ($healthgameCommand) {
    $healthgameCommand.Source
} else {
    Join-Path $env:USERPROFILE ".dotnet\tools\healthgame.exe"
}
& $healthgame reset-database --username $SeedUsername --password $SeedPassword
if ($LASTEXITCODE -ne 0) { exit $LASTEXITCODE }

if ($NoLaunch) {
    Write-Host "Build, tool install, and database reset completed. NoLaunch was set, so servers were not started."
    exit 0
}

$backendArtifacts = Join-Path $backendRoot "artifacts"
$frontendArtifacts = Join-Path $frontendRoot "artifacts"
New-Item -ItemType Directory -Force -Path $backendArtifacts,$frontendArtifacts | Out-Null
$backendOut = Join-Path $backendRoot "artifacts\backend.out.log"
$backendErr = Join-Path $backendRoot "artifacts\backend.err.log"
$frontendOut = Join-Path $frontendArtifacts "frontend.out.log"
$frontendErr = Join-Path $frontendArtifacts "frontend.err.log"
Remove-Item -LiteralPath $backendOut,$backendErr,$frontendOut,$frontendErr -Force -ErrorAction SilentlyContinue

$backendEnvironment = @{
    "ASPNETCORE_ENVIRONMENT" = "Development"
    "ConnectionStrings__HealthGame" = $ConnectionString
}
foreach ($entry in $backendEnvironment.GetEnumerator()) {
    [Environment]::SetEnvironmentVariable($entry.Key, $entry.Value, "Process")
}

$backendProcess = Start-Process `
    -FilePath $dotnet `
    -ArgumentList @($backendDll, "--urls", "http://$BackendHost`:$BackendPort") `
    -WorkingDirectory $backendRoot `
    -RedirectStandardOutput $backendOut `
    -RedirectStandardError $backendErr `
    -WindowStyle Hidden `
    -PassThru

$frontendProcess = Start-Process `
    -FilePath "npm.cmd" `
    -ArgumentList @("run", "start", "--", "--host=$FrontendHost", "--port=$FrontendPort") `
    -WorkingDirectory $frontendRoot `
    -RedirectStandardOutput $frontendOut `
    -RedirectStandardError $frontendErr `
    -WindowStyle Hidden `
    -PassThru

Wait-ProcessExit -Process $backendProcess -Name "Backend"
Wait-ProcessExit -Process $frontendProcess -Name "Frontend"
Wait-TcpPort -HostName $BackendHost -Port $BackendPort -Name "Backend"
Wait-HttpEndpoint -Url "http://$FrontendHost`:$FrontendPort" -Name "Frontend" -OutLog $frontendOut -ErrLog $frontendErr

Write-Host "Backend started on http://$BackendHost`:$BackendPort with PID $($backendProcess.Id)."
Write-Host "Frontend started on http://$FrontendHost`:$FrontendPort with PID $($frontendProcess.Id)."
Write-Host "Seeded user: $SeedUsername / $SeedPassword"
