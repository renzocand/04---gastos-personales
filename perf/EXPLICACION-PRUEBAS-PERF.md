# Cómo se hicieron las pruebas de rendimiento (performance)

Documento explicativo para sustentar/exponer las pruebas no funcionales del proyecto
**Gastos Personales**. Resume *qué herramienta se usó*, *qué patrón/modelo se siguió*,
*cómo está armado cada plan* y *cómo se leen los resultados*.

---

## 1. En una frase

Se midió el **rendimiento de la API REST** (no la UI) con **Apache JMeter**, usando
**un mismo plan de prueba parametrizado** que se reutiliza en **tres modelos de carga**
distintos —**Carga, Estrés y Resistencia**— para demostrar el requisito no funcional
**RNF-01: tiempo de respuesta ≤ 1 segundo**.

---

## 2. Herramienta

| Punto | Detalle |
|-------|---------|
| Herramienta | **Apache JMeter 5.6.3** (Java) |
| Qué se prueba | La **API REST** del backend (Spring Boot) en `http://localhost:8080` |
| Modo de ejecución | **No-GUI** (`-n`), que es el modo correcto para medir (la GUI sesga la latencia) |
| Salida | **Dashboard HTML** (`-e -o carpeta`) con gráficos y percentiles |
| Archivos del plan | `.jmx` (formato XML de JMeter) |

Los planes están en la carpeta `perf/`:

```
perf/
├── gastos-rnf01.jmx     ← Prueba de CARGA (la principal, sustenta RNF-01)
├── gastos-estres.jmx    ← Prueba de ESTRÉS (punto de quiebre / capacidad)
├── gastos-soak.jmx      ← Prueba de RESISTENCIA (estabilidad en el tiempo)
├── README.md            ← Comandos exactos para correrlas
├── carga.jtl            ← Resultados crudos de una corrida (CSV de JMeter)
└── rep-carga/           ← Dashboard HTML generado (index.html, gráficos, statistics.json)
```

---

## 3. El "patrón / modelo" que se usó

Hay **dos ideas de "modelo"** combinadas. Es importante no confundirlas:

### 3.1. Modelo de carga (*Workload Model*) — los 3 tipos de prueba

En ingeniería de rendimiento, una sola prueba no alcanza: se aplican **distintos
perfiles de carga** según lo que se quiera demostrar. Aquí se usaron los tres clásicos:

| Plan | Tipo de prueba | Perfil de carga | Qué demuestra |
|------|----------------|-----------------|---------------|
| `gastos-rnf01.jmx` | **Carga** (Load) | N usuarios fijos, repiten un nº de iteraciones | Que con la carga esperada la latencia se mantiene ≤ 1 s y sin errores |
| `gastos-estres.jmx` | **Estrés** (Stress) | Rampa **creciente** de usuarios hasta saturar | El **punto de quiebre**: hasta cuántos usuarios aguanta antes de cruzar 1 s |
| `gastos-soak.jmx` | **Resistencia** (Soak) | Carga moderada **sostenida en el tiempo** + think-time | Que **no se degrada** ni hay fuga de memoria a lo largo del tiempo |

> Esta es la respuesta a "¿usaron un patrón?": **sí, el modelo de carga Load / Stress /
> Soak.** Es el patrón estándar de pruebas de rendimiento.

### 3.2. Patrón de plan parametrizado (*template* reutilizable)

Los tres `.jmx` **comparten el mismo esqueleto**. No se copió/pegó lógica distinta:
es **el mismo flujo de negocio** y solo cambian los **parámetros de carga**. Esto se
logra con la función `__P()` de JMeter, que lee propiedades desde la línea de comandos
(`-J`):

```
${__P(USERS,10)}     →  nº de usuarios; si no se pasa -JUSERS, usa 10 por defecto
${__P(RAMP,5)}       →  segundos para arrancar todos los hilos
${__P(LOOPS,20)}     →  iteraciones por usuario (solo en Carga)
${__P(DURATION,600)} →  duración en segundos (Estrés y Soak)
${__P(MAX_MS,1000)}  →  umbral del RNF-01 (1000 ms)
${__P(BASE_URL,...)} →  URL del backend
```

Ventaja: **un mismo plan sirve para muchos escenarios** sin editar el XML. Para subir
la carga solo se cambia el comando:

```powershell
# 50 usuarios en lugar de 10, sin tocar el .jmx
jmeter -n -t gastos-rnf01.jmx -Jusers=50 -Jramp=10 -Jloops=20 -JMAX_MS=1000 -l carga.jtl -e -o rep-carga
```

### 3.3. Patrón de correlación (extraer y reusar el token JWT)

Como la API está protegida con **JWT**, cada prueba primero hace **login**, **extrae el
token** de la respuesta y lo **reinyecta** en las siguientes peticiones. Es el patrón
clásico de *correlation* en pruebas de API:

```
POST /api/auth/login  ──►  respuesta JSON { "token": "..." }
        │
        ▼  (JSON Extractor: $.token  →  variable TOKEN)
GET /api/categories     con header  Authorization: Bearer ${TOKEN}
GET /api/expenses        "        "
GET /api/settings        "        "
GET /api/exchange-rate   "        "
```

> Nota: esto **no** es el "Page Object Model". El POM es el patrón de las **pruebas E2E**
> (Playwright, carpeta `frontend/e2e/`). Las de rendimiento usan el **modelo de carga +
> plan parametrizado** descrito arriba. Conviene no mezclarlos al exponer.

---

## 4. Cómo está estructurado cada plan (árbol de JMeter)

Todo plan de JMeter es un **árbol jerárquico**. El de Carga (`gastos-rnf01.jmx`) se ve así:

```
Test Plan  "Gastos - RNF-01 Tiempo de respuesta"
│   └─ Variables: BASE_URL, DNI, PASSWORD, TOKEN
│
└─ Thread Group  "Usuarios concurrentes"          ← simula los usuarios
   │   ├─ nº de hilos (usuarios) = ${__P(USERS,10)}
   │   ├─ ramp-up               = ${__P(RAMP,5)} s
   │   └─ loops por hilo        = ${__P(LOOPS,20)}
   │
   ├─ HTTP Header Manager        ← Content-Type JSON + Authorization Bearer ${TOKEN}
   │
   ├─ POST /api/auth/login       ← login
   │     └─ JSON Extractor       ← saca $.token  →  variable TOKEN
   │
   ├─ GET /api/categories        ┐
   ├─ GET /api/expenses          │  endpoints de LECTURA que se miden
   ├─ GET /api/settings          │
   ├─ GET /api/exchange-rate     ┘
   │
   ├─ Response Assertion  "HTTP 2xx"        ← falla si el código no es 2xx  → cuenta error
   └─ Duration Assertion  "≤ MAX_MS"        ← falla si tarda más de 1000 ms → RNF-01
```

**Las dos *assertions* (validaciones) son el corazón de la prueba:**

- **Duration Assertion** (`MAX_MS`, 1000 ms por defecto): marca como fallo cualquier
  muestra que tarde **más de 1 segundo**. Es la que sustenta directamente el **RNF-01**.
- **Response Assertion** (HTTP 2xx): marca como error cualquier respuesta que **no sea
  2xx**. Garantiza que se está midiendo respuestas *válidas*, no errores rápidos.

### Diferencias entre los tres planes

Solo cambian el **Thread Group** y un elemento de tiempo; el resto (login + 4 GET +
2 assertions) es idéntico:

| | Carga (`rnf01`) | Estrés (`estres`) | Resistencia (`soak`) |
|---|---|---|---|
| Loop Controller | nº fijo de loops (20) | infinito (corta por tiempo) | infinito (corta por tiempo) |
| Scheduler (por tiempo) | No | **Sí**, `DURATION` (260 s) | **Sí**, `DURATION` (600 s) |
| Usuarios por defecto | 10 | **200** (rampa larga) | 20 |
| Ramp-up por defecto | 5 s | **200 s** (sube de a poco) | 30 s |
| Think-time (pausa) | No | No | **Sí**, `UniformRandomTimer` 0.3–1 s |

- El **estrés** usa una **rampa larga** (200 usuarios en 200 s) para ir subiendo la
  concurrencia poco a poco y ver **dónde se rompe**.
- El **soak** agrega un **think-time** (pausa aleatoria de 0.3–1 s) entre iteraciones
  para **simular uso humano realista** y se sostiene 10 min para detectar degradación
  progresiva o fuga de memoria (relevante por la caché en memoria del exchange-rate).

---

## 5. Cómo se ejecutan (comandos reales)

Requisitos previos: backend levantado en `localhost:8080` y **un usuario registrado**
en la BD (ver `perf/README.md`, sección de registro con `curl`).

```powershell
# 1) CARGA — la principal (sustenta RNF-01)
jmeter -n -t gastos-rnf01.jmx -Jusers=50 -Jramp=10 -Jloops=20 -JMAX_MS=1000 -l carga.jtl -e -o rep-carga

# 2) ESTRÉS — punto de quiebre
jmeter -n -t gastos-estres.jmx -Jusers=200 -Jramp=200 -Jduration=260 -JMAX_MS=1000 -l estres.jtl -e -o rep-estres

# 3) RESISTENCIA — estabilidad
jmeter -n -t gastos-soak.jmx -Jusers=20 -Jduration=600 -JMAX_MS=1000 -l soak.jtl -e -o rep-soak
```

- `-n` = sin GUI (obligatorio para medir bien).
- `-l archivo.jtl` = guarda los resultados crudos (CSV).
- `-e -o carpeta` = genera el **dashboard HTML** (la carpeta debe estar vacía o no existir).

---

## 6. Cómo se leen / interpretan los resultados

Se abre `rep-<algo>/index.html` en el navegador. Lo que se mira según el tipo:

| Prueba | Gráfico / métrica clave | Criterio de éxito |
|--------|-------------------------|-------------------|
| **Carga** | **Percentil 95 (P95)** de *Response Times* | P95 ≤ 1000 ms y **0% de error** → cumple RNF-01 |
| **Estrés** | *Active Threads Over Time* vs *Response Times Over Time* | El nº de hilos donde la latencia cruza 1 s (o sube el % Error) = límite de capacidad |
| **Resistencia** | *Response Times Over Time* | La curva debe quedar **plana** (sin subida progresiva) |

> Se reporta el **P95** y no el promedio porque es más exigente y defendible: dice que
> "el 95% de las peticiones respondió en ≤ X ms".

---

## 7. Trazabilidad con los requisitos (para el paper/informe)

| RNF | Qué dice | Cómo se evidencia |
|-----|----------|-------------------|
| **RNF-01** | Tiempo de respuesta de la API ≤ 1 s | **JMeter** (estos planes) → P95 ≤ 1000 ms |
| **RNF-02** | 100% de pruebas exitosas | **NO** es JMeter: lo respaldan `mvn test` (backend) + **Vitest** (frontend). El `% Error` del dashboard es solo evidencia complementaria de que la API responde OK |

---

## 8. ⚠️ Nota honesta sobre el reporte guardado (`rep-carga/`)

El reporte que está versionado (`perf/rep-carga/statistics.json`) muestra **100% de
error** en todas las transacciones, con tiempos muy rápidos (4–85 ms). Eso es el síntoma
típico de una corrida hecha **sin el usuario de prueba registrado**: el login devolvió
un código **no-2xx** y la *Response Assertion* marcó todo como error (aunque la latencia
fuera buena).

**Antes de usar ese dashboard como evidencia, hay que regenerarlo:**

1. Levantar el backend.
2. Registrar el usuario de prueba (`curl` de registro del README).
3. Volver a correr el comando de Carga (sección 5) sobre una carpeta `rep-carga` vacía.

Con el usuario válido, el `% Error` debe bajar a **0%** y el P95 quedar muy por debajo de
1000 ms, que es lo que sustenta el RNF-01.

---

### Resumen para exponer en 30 segundos

> "Las pruebas de rendimiento se hicieron con **Apache JMeter** sobre la **API REST**.
> Seguí el **modelo de carga estándar**: una prueba de **carga**, una de **estrés** y una
> de **resistencia**. Usé **un solo plan parametrizado** (con propiedades `-J`) que se
> reutiliza en los tres escenarios cambiando solo nº de usuarios, duración y umbral. Cada
> petición valida dos cosas: que responda en **≤ 1 s** (RNF-01) y que el código sea
> **2xx**. El resultado se mide por el **percentil 95** en el dashboard HTML que genera
> JMeter."
