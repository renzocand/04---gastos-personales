# Paso 1 — Inventario de métodos y funcionalidades

Proyecto: **gastos-personales** (monorepo: backend Spring Boot + frontend Angular)
Fecha: 2026-06-21

> Este documento corresponde al **Paso 1** del trabajo: mapear todos los paquetes,
> componentes y métodos del sistema. Es el insumo para el Paso 2 (diagrama con
> parámetros y retornos), el Paso 3 (pruebas unitarias con `assert`) y el Paso 4
> (pruebas de integración).

---

## 0. ¿Angular cumple el criterio "por método" del profesor?

Esta es la duda clave, así que la respondo antes del inventario.

El esquema del profesor —**paquete → componente → método → prueba unitaria con
assert → prueba de integración**— es un modelo clásico de backend orientado a
objetos por capas. El **backend en Java encaja de forma perfecta**: los paquetes
existen literalmente (`controller`, `service`, `repository`…), los componentes son
clases, y cada método tiene parámetros y un tipo de retorno explícitos que puedes
afirmar con un `assert`.

En **Angular el criterio "por método" se cumple solo en parte**, y conviene saber dónde:

| Tipo de elemento Angular | ¿Cumple "método con parámetros/retorno y assert"? | Por qué |
|---|---|---|
| **Services** (`auth.service.ts`, `expenses.service.ts`…) | **Sí, plenamente** | Son métodos con entrada y salida claras (ej. `login(payload): Observable<...>`). Se prueban con assert igual que en Java. |
| **Funciones puras** (`budget.ts`: `toPen`, `tierFor`, `levelFor`) y **selectors** | **Sí, plenamente** | Entrada → salida determinista. Son el caso ideal de prueba unitaria. |
| **Reducers** del store (NgRx) | **Sí** | Función pura `(estado, acción) → nuevo estado`. Assert directo. |
| **Components** (`login.ts`, `expenses-list.ts`…) | **Parcialmente / no bien** | Sus "métodos" son manejadores de eventos (`onSubmit`, `onCategoryChange`) y hooks de ciclo de vida (`ngOnInit`). Su valor real está en el renderizado y la interacción con el template, no en un retorno. Se prueban mejor como **prueba de componente/integración**, no como prueba unitaria pura. |

**Conclusión / recomendación (criterio del profesor):** el **frontend que es solo
visual NO requiere pruebas**. Solo se prueba un método del frontend si contiene
**lógica importante** (cálculos, transformaciones, reglas de negocio) —y aun así,
**lo ideal es que esa lógica viva en el backend**.

Aplicado a este proyecto:

- **Backend Java → núcleo de las pruebas.** Satisface los 4 pasos de punta a punta.
- **Frontend, sí probar (poca cosa):** la lógica de negocio real que hoy vive en el
  cliente: `budget.ts` (`toPen`, `tierFor`, `levelFor`), los `selectors` que
  calculan/agrupan, y el `auth-guard`/`auth-interceptor`. *Observación:* el cálculo
  de presupuesto (`budget.ts`) es justamente el caso de "lógica importante en el
  frontend" — lo ideal sería tenerlo también en el backend.
- **Frontend, NO probar:** los **componentes visuales** (`login.ts`, `register.ts`,
  `dashboard-page.ts`, cards, etc.). Sus métodos son manejadores de eventos y
  renderizado; no aportan lógica que ameriten un assert.
- **Services del frontend:** la mayoría son simples envoltorios HTTP (llaman al
  backend y devuelven el `Observable`). No tienen lógica propia, así que **no es
  prioritario probarlos**; lo que importa ya se prueba en el backend.

> Nota útil: el repo ya trae pruebas con la nomenclatura del profesor
> (`tc01_pa01_create_ok`, etc.) en `backend/src/test` y 9 `.spec.ts` en el
> frontend. Eso confirma este enfoque y nos da una base para los pasos 3 y 4.

---

## 1. Backend (Spring Boot / Java) — `com.gastos`

Leyenda de la columna **Prueba**: **U** = prueba unitaria (Paso 3) ·
**I** = prueba de integración (Paso 4) · **—** = infraestructura, normalmente no se
prueba de forma aislada.

### 1.1 Paquete `controller` (capa de entrada HTTP / REST)

| Componente | Método | Parámetros | Retorno | Funcionalidad | Prueba |
|---|---|---|---|---|---|
| AuthController | `register` | `RegisterRequest` (validado) | `AuthResponse` | Registra un usuario nuevo | I |
| AuthController | `login` | `LoginRequest` (validado) | `AuthResponse` | Autentica y devuelve token | I |
| AuthController | `me` | `Authentication` | `UserResponse` | Datos del usuario autenticado | I |
| CategoryController | `list` | — | `List<CategoryResponse>` | Lista de categorías | I |
| ExchangeRateController | `get` | — | `ExchangeRateResponse` | Tipo de cambio USD→PEN actual | I |
| ExpenseController | `list` | `Authentication`, filtros (categoría, moneda, fechas) | `List<ExpenseResponse>` | Lista gastos del usuario con filtros | I |
| ExpenseController | `create` | `Authentication`, `ExpenseRequest` | `ExpenseResponse` | Crea un gasto | I |
| ExpenseController | `update` | `Authentication`, `id`, `ExpenseUpdateRequest` | `ExpenseResponse` | Actualiza un gasto | I |
| ExpenseController | `delete` | `Authentication`, `id` | `void` | Elimina un gasto | I |
| SettingsController | `get` | `Authentication` | `SettingsResponse` | Lee configuración del usuario | I |
| SettingsController | `update` | `Authentication`, `SettingsUpdateRequest` | `SettingsResponse` | Actualiza configuración | I |

### 1.2 Paquete `service` (lógica de negocio) — núcleo de las pruebas unitarias

| Componente | Método | Parámetros | Retorno | Funcionalidad | Prueba |
|---|---|---|---|---|---|
| AuthService | `register` | `RegisterRequest req` | `AuthResponse` | Valida DNI único, encripta clave, crea usuario, genera token | U |
| AuthService | `login` | `LoginRequest req` | `AuthResponse` | Verifica credenciales y genera token | U |
| AuthService | `me` | `String dni` | `UserResponse` | Recupera el usuario por DNI | U |
| CategoryService | `findAll` | — | `List<CategoryResponse>` | Devuelve todas las categorías | U |
| ExchangeRateService | `getUsdToPen` | — | `BigDecimal` | Obtiene/cachea tipo de cambio desde API externa | U |
| ExpenseService | `findAll` | `dni`, `categoryId`, `currency`, fechas | `List<ExpenseResponse>` | Lista gastos del usuario con filtros opcionales | U |
| ExpenseService | `create` | `dni`, `ExpenseRequest req` | `ExpenseResponse` | Crea gasto validando categoría | U |
| ExpenseService | `update` | `dni`, `id`, `ExpenseUpdateRequest req` | `ExpenseResponse` | Actualiza solo campos no nulos; 404 si es de otro usuario | U |
| ExpenseService | `delete` | `dni`, `id` | `void` | Elimina; 404 si es de otro usuario | U |
| SettingsService | `get` | `String dni` | `SettingsResponse` | Lee config (devuelve defaults si no existe) | U |
| SettingsService | `update` | `dni`, `SettingsUpdateRequest req` | `SettingsResponse` | Crea/actualiza ingreso, alertas, escala de fuente | U |

### 1.3 Paquete `repository` (acceso a datos — Spring Data JPA)

Heredan CRUD de `JpaRepository` (`save`, `findById`, `findAll`, `deleteById`, …).
Aquí se listan solo los **métodos custom** propios del sistema.

| Componente | Método | Parámetros | Retorno | Funcionalidad | Prueba |
|---|---|---|---|---|---|
| ExpenseRepository | `findFiltered` | `dni`, `categoryId`, `currency`, fechas | `List<Expense>` | Consulta de gastos con filtros opcionales | I |
| ExpenseRepository | `findByIdAndUser_Dni` | `id`, `dni` | `Optional<Expense>` | Gasto por id solo si pertenece al usuario | I |
| UserRepository | `findByDni` | `String dni` | `Optional<User>` | Buscar usuario por DNI | I |
| UserRepository | `existsByDni` | `String dni` | `boolean` | Verifica existencia de DNI | I |
| UserSettingsRepository | `findByUser_Dni` | `String dni` | `Optional<UserSettings>` | Config por DNI de usuario | I |
| CategoryRepository | (solo CRUD heredado) | — | — | Persistencia de categorías | I |

### 1.4 Paquete `security`

| Componente | Método | Parámetros | Retorno | Funcionalidad | Prueba |
|---|---|---|---|---|---|
| JwtService | `generateToken` | `String dni` | `String` | Genera un JWT | U |
| JwtService | `extractDni` | `String token` | `String` | Extrae el DNI del token | U |
| JwtService | `isTokenValid` | `token`, `dni` | `boolean` | Valida firma/expiración/coincidencia | U |
| CustomUserDetailsService | `loadUserByUsername` | `String dni` | `UserDetails` | Carga usuario para Spring Security | U |
| JwtAuthenticationFilter | `doFilterInternal` | request, response, chain | `void` | Filtra cada request validando el token | I |
| JsonAuthenticationEntryPoint | `commence` | request, response, exception | `void` | Respuesta 401 en JSON | I |

### 1.5 Paquete `mapper`

| Componente | Método | Parámetros | Retorno | Funcionalidad | Prueba |
|---|---|---|---|---|---|
| ExpenseMapper | `toResponse` | `Expense e` | `ExpenseResponse` | Entidad gasto → DTO | U |
| ExpenseMapper | `toEntity` | `ExpenseRequest`, `Category`, `User` | `Expense` | DTO → entidad gasto | U |
| ExpenseMapper | `toResponse` | `Category c` | `CategoryResponse` | Entidad categoría → DTO | U |

### 1.6 Paquetes `config`, `model`, `dto`, `exception`, `i18n` (soporte)

- **`config`** (`I18nConfig`, `SecurityConfig`): beans de infraestructura
  (filtro de seguridad, codificador de claves, CORS, i18n). Se validan en
  integración, no por método. **Prueba: I / —**
- **`model`** (`User`, `Expense`, `Category`, `UserSettings`, `Currency`):
  entidades JPA; básicamente getters/setters. No requieren prueba unitaria propia. **Prueba: —**
- **`dto`** (`ExpenseRequest`, `SettingsUpdateRequest`, …): objetos de
  transferencia con anotaciones de validación. **Sus reglas de validación sí se
  prueban** (ya existe `DtoValidationTest`). **Prueba: U**
- **`exception`** (`GlobalExceptionHandler`, `NotFoundException`,
  `ConflictException`): manejo centralizado de errores. **Prueba: I**
- **`i18n`** (`Messages`): mensajes traducibles (es/en/qu). **Prueba: —**

---

## 2. Frontend (Angular) — `frontend/src/app`

> **Criterio del profesor aplicado:** solo se prueba el frontend cuando hay
> **lógica importante**. Lo visual no se prueba. Por eso aquí distinguimos lo que
> realmente vale la pena (sección 2.2) de lo que no (sección 2.3). La leyenda de
> **Prueba** añade **N** = no requiere prueba.

### 2.1 Services — en su mayoría envoltorios HTTP (prueba opcional / baja prioridad)

Estos services solo llaman al backend y devuelven el `Observable`; no tienen
lógica propia, así que su valor ya queda cubierto por las pruebas del backend.
Se prueban solo si se quiere verificar el armado de la request.

| Componente | Método | Parámetros | Retorno | Funcionalidad | Prueba |
|---|---|---|---|---|---|
| AuthService | `login` | `LoginRequest` | `Observable<AuthResponse>` | Llama al login del backend | U |
| AuthService | `register` | `RegisterRequest` | `Observable<AuthResponse>` | Llama al registro | U |
| AuthService | `getToken` | — | `string \| null` | Devuelve el token guardado | U |
| AuthService | `storeSession` | `AuthResponse` | `void` | Guarda la sesión | U |
| AuthService | `clearSession` | — | `void` | Cierra sesión | U |
| CategoryService | `getAll` | — | `Observable<Category[]>` | Lista categorías | U |
| ExchangeRateService | `getRate` | — | `Observable<number>` | Tipo de cambio | U |
| ExpenseService | `getAll` | `ExpenseFilters?` | `Observable<Expense[]>` | Lista gastos con filtros | U |
| ExpenseService | `create` | `Omit<Expense,'id'>` | `Observable<Expense>` | Crea gasto | U |
| ExpenseService | `update` | `id`, `Partial<...>` | `Observable<Expense>` | Actualiza gasto | U |
| ExpenseService | `delete` | `id` | `Observable<string>` | Elimina gasto | U |
| SettingsService | `get` | — | `Observable<UserSettings>` | Lee config | U |
| SettingsService | `update` | `UserSettings` | `Observable<UserSettings>` | Actualiza config | U |
| LanguageService | `use` | `AppLang` | `void` | Cambia idioma | U |
| ToastService | `show` | `message`, `variant` | `void` | Muestra notificación | U |
| ToastService | `dismiss` | `id` | `void` | Oculta notificación | U |

### 2.2 Funciones puras y store (caso ideal de prueba unitaria → Paso 3)

| Componente | Método / función | Parámetros | Retorno | Funcionalidad | Prueba |
|---|---|---|---|---|---|
| budget.ts | `toPen` | `expense`, `rate` | `number` | Convierte gasto USD→PEN | U |
| budget.ts | `tierFor` | `percent` | `number` (0–3) | Escalón de alerta por % | U |
| budget.ts | `levelFor` | `percent` | `BudgetLevel` | Nivel ok/info/warning/danger | U |
| budget.selectors.ts | `selectMonthSpendingPEN` | estado | `number` | Gasto del mes en PEN | U |
| budget.selectors.ts | `selectBudgetStatus` | estado | `BudgetStatus` | Estado del presupuesto | U |
| dashboard.selectors.ts | `selectCategoryBreakdown` | estado | desglose por categoría | Datos del dashboard | U |
| dashboard.selectors.ts | `selectRecentExpenses` | estado | gastos recientes | Datos del dashboard | U |
| expenses.selectors.ts | `selectExpensesGroupedByDay` | estado | gastos agrupados | Agrupar por día | U |
| expenses.selectors.ts | `selectExpensesSummary` | estado | resumen | Totales | U |
| expenses.selectors.ts | `selectHasExpenses` / `selectExpenseById` / `selectFilters` | estado | boolean / Expense / filtros | Selectores varios | U |
| category.selectors.ts | `selectCategoryEntities` / `selectCategoryOptions` | estado | mapa / opciones | Selectores de categoría | U |
| store (NgRx) | reducers de `*.feature.ts` | `(estado, acción)` | nuevo estado | Manejo de estado | U |
| store (NgRx) | effects de `*.effects.ts` | flujo de acciones | acciones | Efectos secundarios (HTTP) | I |

### 2.3 Components — visuales, NO requieren prueba

Estos componentes son visuales: sus métodos son manejadores de eventos
(`onSubmit`, `onCategoryChange`…) y hooks de ciclo de vida (`ngOnInit`). Según el
criterio del profesor, **no se prueban**. Se listan solo para que el inventario
quede completo.

| Componente | Método(s) | Funcionalidad | Prueba |
|---|---|---|---|
| login.ts | `onSubmit` | Envía formulario de login | N |
| register.ts | `onSubmit` | Envía formulario de registro | N |
| dashboard-page.ts | `ngOnInit` | Carga datos del dashboard | N |
| expense-form.ts | `onSubmit`, `onDeleteConfirmed`, `buildChanges`* | Crear/actualizar/eliminar gasto | N |
| expenses-list.ts | `ngOnInit`, `onCategoryChange`, `onCurrencyChange`, `onDateFromChange`, `onDateToChange`, `clearFilters` | Lista y filtros | N |
| settings-page.ts | `ngOnInit`, `onSubmit` | Carga y guarda config | N |
| budget-card / total-card / category-breakdown / recent-expenses / expense-card | (solo presentación) | Mostrar datos | N |

> *`buildChanges` (privado) sí contiene algo de lógica al armar el objeto de
> cambios; si el profesor lo considera "método importante", podría probarse de
> forma unitaria. Lo demás es visual.

### 2.4 Lógica transversal con prueba unitaria recomendada

| Componente | Funcionalidad | Prueba |
|---|---|---|
| guards/auth-guard.ts | Protege rutas según sesión | U |
| interceptors/auth-interceptor.ts | Adjunta el token a cada request | U |

---

## 3. Resumen

| Capa | Componentes | Métodos para prueba unitaria (Paso 3) | Para prueba de integración (Paso 4) |
|---|---|---|---|
| Backend `service` | 5 | 11 | — |
| Backend `security` + `mapper` | 5 | 6 | 2 |
| Backend `controller` | 5 | — | 11 |
| Backend `repository` | 4 | — | 5 (+CRUD) |
| Frontend lógica (`budget.ts`, selectors, guard, interceptor) | varios | ~10 | — |
| Frontend services (HTTP) | 7 | opcional / baja prioridad | — |
| Frontend components (visuales) | ~12 | **no se prueban** | — |

**El núcleo de las pruebas está en el backend.** En el frontend solo se prueba la
lógica real (cálculo de presupuesto, selectors, guard/interceptor); lo visual no.

**Siguiente paso sugerido (Paso 2):** tomar este inventario y, por cada método
marcado **U**, especificar en el diagrama los parámetros exactos, el valor
esperado y el valor que arroja el sistema, para luego escribir el `assert`. El
backend ya tiene tests base (`tc/pa`) que podemos extender para completar la
cobertura.
