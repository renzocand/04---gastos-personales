# Checklist de pruebas automatizadas

Suite de pruebas que respalda las tablas del informe: **casos de prueba (TC-01..15)**,
**pruebas de aceptación (PA-01..25)** y **requisitos no funcionales (RNF)**. Cada
prueba está nombrada con su ID para trazabilidad directa con el paper.

## Resumen

| Capa | Archivos | Pruebas | Estado |
|------|---------:|--------:|:------:|
| Backend unitarias (JUnit 5 + Mockito + AssertJ) | 5 | 26 | ✅ |
| Frontend unitarias (Vitest + jsdom, Angular) | 8 (+1 shell) | 44 | ✅ |
| **Total unitarias** | **14** | **70** | ✅ |
| E2E aceptación (Playwright POM · 3 navegadores) | 4 specs + 6 page objects | 16 escenarios (×3 = 48) | ✅ |

## Cómo ejecutar

```bash
# Backend
mvn -f backend/pom.xml test

# Frontend (una sola corrida)
npm --prefix frontend test -- --watch=false
```

---

## Backend — `backend/src/test/java/com/gastos/`

### `service/ExpenseServiceTest` — gastos (CRUD + filtros + multi-tenancy)
- [x] **TC-01 / PA-01** — `create` persiste el gasto con usuario y categoría resueltos
- [x] **TC-01** — `create` con categoría inexistente lanza `NotFoundException`
- [x] **TC-02 / PA-04** — `findAll` devuelve la lista del usuario
- [x] **TC-03 / PA-05** — `findAll` delega los filtros (categoría/moneda/fechas) al repositorio
- [x] **TC-03 / PA-06** — `findAll` sin coincidencias devuelve lista vacía
- [x] **TC-04 / PA-07** — `update` aplica solo los campos no-null (los null no sobreescriben)
- [x] **TC-04** — `update` de un gasto ajeno lanza `NotFoundException` (aislamiento entre usuarios)
- [x] **TC-05 / PA-09** — `delete` de gasto propio lo elimina
- [x] **TC-05** — `delete` de gasto ajeno lanza `NotFoundException`

### `service/SettingsServiceTest` — configuración financiera
- [x] **TC-06 / PA-11** — `get` devuelve el ingreso y las alertas guardadas
- [x] **TC-06** — `get` sin configuración previa devuelve los valores por defecto
- [x] **TC-07 / PA-12** — `update` crea la configuración y guarda el ingreso si no existía
- [x] **TC-07** — `update` con usuario inexistente lanza `NotFoundException`
- [x] **TC-08 / PA-14** — `update` cambia el estado de alertas; `fontScale` null cae a `"normal"`

### `service/AuthServiceTest` — registro e inicio de sesión
- [x] **TC-13 / PA-20** — `register` codifica la contraseña, normaliza opcionales y devuelve token
- [x] **TC-13 / PA-21** — `register` con DNI existente lanza `ConflictException` y no guarda
- [x] **TC-14 / PA-22** — `login` con credenciales válidas devuelve token
- [x] **TC-14 / PA-23** — `login` con credenciales inválidas propaga `BadCredentialsException`

### `security/JwtServiceTest` — emisión/validación de JWT
- [x] `generateToken` → `extractDni` recupera el mismo DNI (round-trip)
- [x] `isTokenValid` es true para el DNI correcto y false para otro
- [x] Un token expirado es rechazado al validarse
- [x] Un token manipulado (firma inválida) lanza `JwtException`

### `dto/DtoValidationTest` — validación de datos de entrada (Bean Validation)
- [x] **PA-02** — `ExpenseRequest` con campos vacíos viola los 5 obligatorios
- [x] **PA-03** — `ExpenseRequest` con monto 0 viola el mínimo; con monto válido no
- [x] **PA-08** — `ExpenseUpdateRequest` inválido (monto<0.1, descripción>80) viola; todo null es válido
- [x] **PA-13** — `SettingsUpdateRequest` con ingreso negativo y `fontScale` inválido viola; válido no

---

## Frontend — `frontend/src/app/`

### `features/dashboard/store/budget.spec.ts` — lógica de presupuesto
- [x] **TC-11 / PA-17** — `toPen` convierte USD (×tasa) y deja PEN sin convertir
- [x] **TC-11 / PA-18** — `tierFor` respeta los bordes 50 / 80 / 100 (7 casos)
- [x] **TC-11 / PA-18** — `levelFor` mapea a `ok / info / warning / danger` (5 casos)

### `features/dashboard/store/budget.selectors.spec.ts` — estado del presupuesto
- [x] **TC-02** — `selectMonthSpendingPEN` suma solo gastos del mes en curso y convierte USD→PEN
- [x] **TC-02** — sin tipo de cambio (null) trata los USD como 0
- [x] **TC-11 / PA-17** — `selectBudgetStatus` sin ingreso → income null, percent 0, level ok
- [x] **TC-11 / PA-17** — ingreso 0 se trata como sin configurar (level ok)
- [x] **TC-11 / PA-17, PA-18** — calcula percent, remaining y level (80% → warning)
- [x] **PA-18** — gasto ≥100% del ingreso → level danger

### `features/dashboard/store/dashboard.selectors.spec.ts` — distribución y recientes
- [x] **TC-09 / PA-15** — sin tipo de cambio devuelve lista vacía
- [x] **TC-09 / PA-15** — agrupa por categoría y calcula el porcentaje
- [x] **TC-09 / PA-15** — categoría sin gastos → 0 sin dividir por cero
- [x] **TC-10 / PA-16** — `selectRecentExpenses` ordena por fecha descendente y corta a 5

### `features/settings/store/alerts.effects.spec.ts` — alertas por umbral
- [x] **TC-08 / PA-14** — avisa al cruzar hacia un escalón mayor (75% → 85%)
- [x] **TC-08 / PA-14** — no avisa si no hubo cruce de escalón (84% → 85%)
- [x] **TC-08 / PA-14** — no avisa si las alertas están desactivadas
- [x] **TC-08 / PA-14** — no avisa para gastos fuera del mes en curso

### `shared/pipes/app-currency.spec.ts` — formato de moneda (apoya PA-04 / PA-11)
- [x] null / undefined / NaN → cadena vacía
- [x] PEN usa el símbolo `S/` con 2 decimales
- [x] USD usa el símbolo `US$` con 2 decimales
- [x] formatea montos con el símbolo al inicio

### `core/i18n/language.service.spec.ts` — cambio de idioma
- [x] **TC-12 / PA-19** — `use(lang)` actualiza Transloco, localStorage, el signal y `<html lang>`
- [x] **TC-12 / PA-19** — al arrancar lee el idioma guardado y lo sincroniza
- [x] **TC-12 / PA-19** — idioma guardado inválido cae al idioma por defecto (es)

### `features/auth/services/auth.service.spec.ts` — sesión
- [x] **TC-15 / PA-24** — `storeSession` guarda token y usuario; `getToken` lo recupera
- [x] **TC-15 / PA-24** — `clearSession` finaliza la sesión (token y usuario fuera)
- [x] **TC-15 / PA-24** — `readStoredUser` tolera un JSON corrupto y devuelve null

### `core/guards/auth-guard.spec.ts` — rutas protegidas
- [x] **PA-25** — `authGuard` sin token redirige a `/login`
- [x] **PA-25** — `authGuard` con token permite el acceso
- [x] **PA-25** — `guestGuard` con token redirige al dashboard
- [x] **PA-25** — `guestGuard` sin token permite ver el login

### `app.spec.ts` — shell de la aplicación
- [x] El componente raíz se crea correctamente
- [x] Renderiza el `<router-outlet>` del shell

---

## E2E de aceptación (Playwright + Page Object Model)

Pruebas end-to-end en **navegador real** (Chromium, Firefox y WebKit → **RNF-06**),
con patrón Page Object Model en `frontend/e2e/`. Validan las PA recorriendo la app
integrada (Angular + backend + MySQL).

- **Resultado**: **48/48 verde** (16 escenarios × Chromium/Firefox/WebKit) corridos
  contra el stack dockerizado (`docker compose up -d --build`, app en `http://localhost`).
- **Requisitos**: stack levantado y `npx playwright install` (descarga navegadores).
- **Correr contra docker**: `cd frontend && E2E_BASE_URL=http://localhost npm run e2e`.
  Contra el dev server (`ng serve`, :4200): `npm run e2e` (arranca/reúsa el server solo).
  Detalle en `frontend/e2e/README.md`.
- Se agregaron atributos `data-testid` a la app para selección estable: diálogo de
  confirmación (`confirm-dialog/-cancel/-accept`), badge de presupuesto
  (`budget-status` + `data-level`), errores de formulario (`form-error`, `income-error`),
  logout, selector de idioma (`lang-select`), botón borrar (`expense-delete`) y "sin resultados".

| Spec (`frontend/e2e/tests/`) | Escenarios (PA) |
|------|------------|
| `auth.spec.ts` | PA-20 registro · PA-21 DNI duplicado · PA-22 login válido · PA-23 login inválido · PA-24 logout · PA-25 ruta protegida |
| `expenses.spec.ts` | PA-01 registrar · PA-05 filtrar (resultados) · PA-06 sin resultados · PA-07 editar · PA-09 eliminar · **PA-10 cancelar eliminación** |
| `settings.spec.ts` | PA-12 actualizar ingreso · PA-13 ingreso inválido · PA-19 cambiar idioma |
| `dashboard.spec.ts` | PA-11 presupuesto visible · PA-15 distribución · PA-16 recientes · PA-17 % consumido · PA-18 nivel |

> **PA-10** ("cancelación de eliminación"), que no se cubría con unitarias, **sí
> queda cubierta aquí** (es un flujo de UI). Cada escenario crea un usuario nuevo
> (DNI único) para ser independiente y re-ejecutable.

---

## Cobertura de las tablas del informe

- **TC-01..TC-15**: todos respaldados por pruebas automatizadas.
- **PA-01..PA-25**: respaldados, excepto **PA-10** ("cancelación de eliminación"),
  que es interacción de UI pura (cancelar un diálogo de confirmación) → se verifica
  de forma manual / prueba de componente, no unitaria.
- **RNF-02 (100% de pruebas exitosas)**: sustentado — ambas suites pasan completas.
- **RNF-01 (tiempo de respuesta)**, **RNF-05 (modularidad)**, **RNF-06 (compatibilidad
  de navegadores)**: se validan por otros medios (medición de latencia, arquitectura
  documentada, pruebas manuales/E2E). Si **RNF-03/04** se interpretan como cobertura,
  se pueden reportar con JaCoCo (backend) y `ng test --coverage` (frontend).
