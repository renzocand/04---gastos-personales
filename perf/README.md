# Pruebas no funcionales con JMeter

Set de pruebas de rendimiento de la API REST. Todas hacen login (obtienen un JWT),
extraen el `token` y miden los endpoints de lectura (`/api/categories`,
`/api/expenses`, `/api/settings`, `/api/exchange-rate`). Cada muestra valida:

- **Duration Assertion** (`MAX_MS`, default 1000 ms) → falla si tarda más de 1 s.
- **Response Assertion** (HTTP 2xx) → cuenta como error cualquier respuesta no-2xx.

| Plan | Tipo | Qué demuestra | RNF que sustenta |
|------|------|---------------|------------------|
| `gastos-rnf01.jmx` | **Carga** | Con la carga esperada, la latencia sigue ≤ 1 s y sin errores | **RNF-01** (≤ 1 s) + error 0% |
| `gastos-estres.jmx` | **Estrés** | Punto de quiebre: hasta cuántos usuarios aguanta antes de pasar de 1 s | RNF de **capacidad** |
| `gastos-soak.jmx` | **Resistencia** | Estabilidad sostenida en el tiempo (sin degradación ni fuga de memoria) | RNF de **estabilidad** |

> Estas pruebas miden **latencia/rendimiento (RNF-01)**. **RNF-02 ("100% de pruebas
> exitosas")** NO es JMeter: lo respaldan `mvn -f backend/pom.xml test` + Vitest. El
> `% Error` del reporte solo es evidencia complementaria de que la API responde OK.

## Requisitos

1. **JMeter 5.6+** (Java 8+). `winget install Apache.JMeter` o
   <https://jmeter.apache.org/download_jmeter.cgi>. Ejecutable: `bin/jmeter.bat`.
2. **Backend levantado** en `http://localhost:8080` (`cd backend && mvn spring-boot:run`).
3. **Un usuario real** en la BD (ya no hay seeder), regístralo una vez:

```powershell
curl -X POST http://localhost:8080/api/auth/register `
  -H "Content-Type: application/json" `
  -d '{"dni":"12345678","password":"secret123","firstName":"Test","lastName":"Carga"}'
```

## 1. Carga — RNF-01 (la principal)

```powershell
jmeter -n -t gastos-rnf01.jmx -Jusers=50 -Jramp=10 -Jloops=20 -JMAX_MS=1000 `
  -l carga.jtl -e -o rep-carga
```

Métrica para la tabla del paper: del dashboard (`rep-carga/index.html`), usa el
**percentil 95 (P95)** de *Response Times* (más defendible que el promedio).

## 2. Estrés — capacidad (punto de quiebre)

Un solo plan que **sube la concurrencia sola** vía ramp-up largo. Por defecto rampa
hasta 200 usuarios en 200 s. Lee en el dashboard **"Active Threads Over Time"** vs
**"Response Times Over Time"**: donde la latencia cruza 1 s (o sube el `% Error`),
ese número de hilos es tu límite.

```powershell
jmeter -n -t gastos-estres.jmx -Jusers=200 -Jramp=200 -Jduration=260 -JMAX_MS=1000 `
  -l estres.jtl -e -o rep-estres
```

Si 200 aguanta sin problemas, sube `-Jusers`/`-Jramp` (ej. 400/400) hasta que falle.
Reportas: *"el sistema mantiene ≤ 1 s hasta ~N usuarios concurrentes"*.

## 3. Resistencia — estabilidad (soak)

Carga moderada sostenida **por tiempo**, con think-time (pausas 0.3–1 s) para simular
uso realista. Por defecto 20 usuarios durante 600 s (10 min). En el dashboard,
*Response Times Over Time* debe quedar **plano** (sin subida progresiva).

```powershell
jmeter -n -t gastos-soak.jmx -Jusers=20 -Jduration=600 -JMAX_MS=1000 `
  -l soak.jtl -e -o rep-soak
```

Para una demo rápida usa `-Jduration=120` (2 min); para el informe, 600–1800 s.

## Parámetros comunes (`-J`)

| Param | Aplica a | Default | Qué es |
|-------|----------|---------|--------|
| `BASE_URL` | todos | `http://localhost:8080` | URL del backend |
| `DNI` / `PASSWORD` | todos | `12345678` / `secret123` | usuario de prueba |
| `USERS` | todos | 10 / 200 / 20 | hilos (usuarios concurrentes) |
| `RAMP` | todos | seg para arrancar los hilos |
| `LOOPS` | solo carga | 20 | iteraciones por hilo |
| `DURATION` | estrés / soak | 260 / 600 | duración en segundos |
| `MAX_MS` | todos | 1000 | umbral del RNF-01 |

## Notas

- `-n` = sin GUI (obligatorio para medir; la GUI sesga la latencia).
- `-e -o <carpeta>` genera el **dashboard HTML**; la carpeta debe estar vacía o no existir.
- Para diseñar/depurar un plan: `jmeter -t gastos-rnf01.jmx` (GUI) y agrega un
  *Summary Report* o *View Results Tree*.
