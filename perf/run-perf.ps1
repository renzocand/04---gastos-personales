#requires -Version 7
<#
  run-perf.ps1 - Corre las pruebas no funcionales de JMeter (carga, estres, soak)
  contra el stack dockerizado en http://localhost (nginx -> backend).

  Las pruebas se corren SECUENCIALMENTE a proposito: correrlas en paralelo
  contaminaria las latencias entre si y los numeros no servirian para el informe.

  Uso:
    ./run-perf.ps1                                  # las 3 con valores por defecto
    ./run-perf.ps1 -Only carga                      # solo una (carga | estres | soak)
    ./run-perf.ps1 -SoakDuration 600                # soak de 10 min (para el informe)
    ./run-perf.ps1 -BaseUrl http://localhost:8080   # si expusiste el backend directo
#>
param(
  [string]$BaseUrl = 'http://localhost',
  [string]$Dni = '12345678',
  [string]$Password = 'secret123',
  [ValidateSet('todas', 'carga', 'estres', 'soak')]
  [string]$Only = 'todas',
  [int]$SoakDuration = 120
)

$ErrorActionPreference = 'Stop'
Set-Location -Path $PSScriptRoot

# 1. JMeter disponible?
if (-not (Get-Command jmeter -ErrorAction SilentlyContinue)) {
  throw "JMeter no esta en el PATH. Instala con: winget install Apache.JMeter (y reabre la terminal)."
}

# 2. La API responde? Un 401 ya significa que esta arriba.
Write-Host "==> Verificando API en $BaseUrl/api ..." -ForegroundColor Cyan
try {
  $r = Invoke-WebRequest -Uri "$BaseUrl/api/categories" -SkipHttpErrorCheck -TimeoutSec 5
  Write-Host "    API responde (HTTP $($r.StatusCode))." -ForegroundColor Green
}
catch {
  throw "La API no responde en $BaseUrl. Levanta el stack desde la raiz: docker compose up -d --build (y espera ~40s a que el backend arranque)."
}

# 3. Registrar el usuario de prueba (idempotente: 409 = ya existe).
Write-Host "==> Registrando usuario de prueba $Dni ..." -ForegroundColor Cyan
$body = @{ dni = $Dni; password = $Password; firstName = 'Test'; lastName = 'Carga' } | ConvertTo-Json
$reg = Invoke-WebRequest -Uri "$BaseUrl/api/auth/register" -Method Post -ContentType 'application/json' -Body $body -SkipHttpErrorCheck
switch ($reg.StatusCode) {
  201 { Write-Host "    Usuario creado." -ForegroundColor Green }
  409 { Write-Host "    Usuario ya existia (ok)." -ForegroundColor Yellow }
  default { Write-Host "    Respuesta inesperada al registrar: HTTP $($reg.StatusCode)" -ForegroundColor Yellow }
}

# 4. Definicion de las 3 pruebas.
$tests = @(
  @{ name = 'carga'; plan = 'gastos-rnf01.jmx'; args = @('-Jusers=50', '-Jramp=10', '-Jloops=20') }
  @{ name = 'estres'; plan = 'gastos-estres.jmx'; args = @('-Jusers=200', '-Jramp=200', '-Jduration=260') }
  @{ name = 'soak'; plan = 'gastos-soak.jmx'; args = @('-Jusers=20', "-Jduration=$SoakDuration") }
)
if ($Only -ne 'todas') { $tests = $tests | Where-Object { $_.name -eq $Only } }

# 5. Correr secuencialmente.
foreach ($t in $tests) {
  $jtl = "$($t.name).jtl"
  $rep = "rep-$($t.name)"
  Write-Host "`n==> Prueba '$($t.name)' ($($t.plan)) ..." -ForegroundColor Cyan
  if (Test-Path $jtl) { Remove-Item $jtl -Force }
  if (Test-Path $rep) { Remove-Item $rep -Recurse -Force }

  jmeter -n -t $t.plan "-JBASE_URL=$BaseUrl" $t.args -l $jtl -e -o $rep

  if ($LASTEXITCODE -ne 0) {
    Write-Host "    JMeter devolvio codigo $LASTEXITCODE" -ForegroundColor Red
  }
  else {
    Write-Host "    OK -> reporte en $rep/index.html" -ForegroundColor Green
  }
  Start-Sleep -Seconds 5   # dejar respirar al servidor entre pruebas
}

Write-Host "`nListo. Abre los dashboards, p.ej.: start rep-carga/index.html" -ForegroundColor Green
