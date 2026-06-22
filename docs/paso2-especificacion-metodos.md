# Paso 2 — Especificación de métodos (parámetros, retorno y assert)

Proyecto: **gastos-personales** · Backend Spring Boot
Fecha: 2026-06-21

> Continuación del Paso 1. Aquí cada método del sistema se especifica con el
> detalle que pide el profesor: **qué parámetros recibe, qué debe retornar, el
> valor esperado y el `assert` con que se comprobará**. Esto es el insumo directo
> del **Paso 3** (ejecutar las pruebas y poner en "Resultados" lo esperado vs.
> lo que arroja el sistema).
>
> Diagramas asociados (actualizados a nivel de método):
> `docs/component-diagram.puml` y `docs/package-diagram.puml`.

## Cómo leer cada ficha

Por cada método se indica:

- **Parámetros** — tipo y un ejemplo concreto de entrada.
- **Precondición** — estado del sistema/mocks antes de ejecutar.
- **Retorno esperado** — qué debe devolver (o qué excepción debe lanzar).
- **Assert** — la afirmación que se escribe en la prueba.
- **ID de prueba** — referencia a la nomenclatura del repo (`tcNN_paNN`) cuando ya existe.

Nomenclatura: **U** = prueba unitaria · **I** = prueba de integración.

---

## 1. AuthService (paquete `service`) — U

### 1.1 `register(req: RegisterRequest) : AuthResponse`

| Aspecto | Detalle |
|---|---|
| Parámetros | `RegisterRequest{ dni:"12345678", password:"secret123", firstName:"Ana", lastName:"Pérez", email:null, secondLastName:null }` |
| Precondición | `userRepository.existsByDni("12345678")` → `false`; `jwtService.generateToken(...)` → `"jwt-token"` |
| Retorno esperado | `AuthResponse` con `token="jwt-token"`, `type="Bearer"`, `dni="12345678"`, `firstName="Ana"`, `lastName="Pérez"` |
| Efecto esperado | Se invoca `userRepository.save(...)` una vez con la contraseña **encriptada** (no en texto plano) |
| Assert | `assertEquals("jwt-token", res.token()); assertEquals("Bearer", res.type()); verify(userRepository).save(any(User.class));` |
| ID de prueba | `tc13_pa20_register_ok` |

### 1.2 `register` — DNI duplicado

| Aspecto | Detalle |
|---|---|
| Parámetros | `RegisterRequest` con `dni` ya existente |
| Precondición | `userRepository.existsByDni(dni)` → `true` |
| Retorno esperado | Lanza **`ConflictException`** y **no** llama a `save` |
| Assert | `assertThrows(ConflictException.class, () -> service.register(req)); verify(userRepository, never()).save(any());` |
| ID de prueba | `tc13_pa21_register_duplicateDni` |

### 1.3 `login(req: LoginRequest) : AuthResponse`

| Aspecto | Detalle |
|---|---|
| Parámetros | `LoginRequest{ dni:"12345678", password:"secret123" }` |
| Precondición | `authenticationManager.authenticate(...)` no lanza; `userRepository.findByDni(dni)` → `Optional.of(user)` |
| Retorno esperado | `AuthResponse` con token válido y datos del usuario |
| Assert | `assertNotNull(res.token()); assertEquals("12345678", res.dni());` |
| ID de prueba | `tc14_pa22_login_ok` |

### 1.4 `login` — credenciales inválidas

| Aspecto | Detalle |
|---|---|
| Precondición | `authenticationManager.authenticate(...)` lanza `BadCredentialsException` |
| Retorno esperado | Propaga la excepción; **no** genera token |
| Assert | `assertThrows(BadCredentialsException.class, () -> service.login(req)); verify(jwtService, never()).generateToken(any());` |
| ID de prueba | `tc14_pa23_login_badCredentials` |

### 1.5 `me(dni: String) : UserResponse`

| Aspecto | Detalle |
|---|---|
| Parámetros | `dni = "12345678"` |
| Precondición | `userRepository.findByDni(dni)` → `Optional.of(user)` |
| Retorno esperado | `UserResponse` con dni, nombres, email y role del usuario |
| Caso de error | Si `findByDni` → `Optional.empty()` ⇒ lanza `NotFoundException` |
| Assert | `assertEquals("12345678", res.dni()); assertThrows(NotFoundException.class, ...)` (caso vacío) |

---

## 2. ExpenseService (paquete `service`) — U

### 2.1 `create(dni, req: ExpenseRequest) : ExpenseResponse`

| Aspecto | Detalle |
|---|---|
| Parámetros | `dni="12345678"`, `ExpenseRequest{ amount=50.00, currency=PEN, description:"Almuerzo", categoryId:"cat-1", date=2026-06-21 }` |
| Precondición | `userRepository.findByDni` → user; `categoryRepository.findById("cat-1")` → category; `expenseRepository.save` → gasto con `id="exp-1"` |
| Retorno esperado | `ExpenseResponse` con `amount=50.00`, `currency=PEN`, `categoryId="cat-1"` |
| Assert | `assertEquals(new BigDecimal("50.00"), res.amount()); assertEquals(Currency.PEN, res.currency()); verify(expenseRepository).save(any());` |
| ID de prueba | `tc01_pa01_create_ok` |

### 2.2 `create` — categoría inexistente

| Aspecto | Detalle |
|---|---|
| Precondición | `categoryRepository.findById(...)` → `Optional.empty()` |
| Retorno esperado | Lanza `NotFoundException`; **no** guarda |
| Assert | `assertThrows(NotFoundException.class, () -> service.create(dni, req)); verify(expenseRepository, never()).save(any());` |
| ID de prueba | `tc01_create_categoryNotFound` |

### 2.3 `findAll(dni, categoryId, currency, dateFrom, dateTo) : List<ExpenseResponse>`

| Aspecto | Detalle |
|---|---|
| Parámetros | `dni="12345678"`, resto `null` (sin filtros) |
| Precondición | `expenseRepository.findFiltered(...)` → lista de 2 gastos |
| Retorno esperado | Lista de tamaño 2 mapeada a `ExpenseResponse` |
| Assert | `assertEquals(2, res.size());` |
| ID de prueba | `tc02_pa04_findAll_list` |
| Variantes | con filtros (`tc03_pa05_findAll_withFilters`), lista vacía (`tc03_pa06_findAll_empty` → `assertTrue(res.isEmpty())`) |

### 2.4 `update(dni, id, req: ExpenseUpdateRequest) : ExpenseResponse`

| Aspecto | Detalle |
|---|---|
| Parámetros | `dni`, `id="exp-1"`, `ExpenseUpdateRequest{ amount=99.00, currency=null, description=null, date=null, categoryId=null }` |
| Precondición | `expenseRepository.findByIdAndUser_Dni("exp-1", dni)` → gasto existente con amount=50 |
| Retorno esperado | Solo `amount` cambia a `99.00`; los campos nulos **no** se modifican |
| Assert | `assertEquals(new BigDecimal("99.00"), res.amount()); assertEquals(descripcionOriginal, res.description());` |
| ID de prueba | `tc04_pa07_update_onlyNonNullFields` |

### 2.5 `update` — gasto de otro usuario

| Aspecto | Detalle |
|---|---|
| Precondición | `findByIdAndUser_Dni(...)` → `Optional.empty()` |
| Retorno esperado | Lanza `NotFoundException` (se traduce a 404) |
| Assert | `assertThrows(NotFoundException.class, () -> service.update(dni, id, req));` |
| ID de prueba | `tc04_update_foreignExpense_notFound` |

### 2.6 `delete(dni, id) : void`

| Aspecto | Detalle |
|---|---|
| Precondición | `findByIdAndUser_Dni(...)` → gasto propio |
| Retorno esperado | Llama `expenseRepository.delete(expense)` una vez |
| Assert | `verify(expenseRepository).delete(expense);` |
| ID de prueba | `tc05_pa09_delete_own` |
| Variante | gasto ajeno ⇒ `NotFoundException`, no borra (`tc05_delete_foreign_notFound`): `verify(expenseRepository, never()).delete(any());` |

---

## 3. SettingsService (paquete `service`) — U

### 3.1 `get(dni) : SettingsResponse` — usuario con config

| Aspecto | Detalle |
|---|---|
| Parámetros | `dni="12345678"` |
| Precondición | `settingsRepository.findByUser_Dni(dni)` → settings con `monthlyIncome=3000` |
| Retorno esperado | `SettingsResponse` con `monthlyIncome=3000` |
| Assert | `assertEquals(new BigDecimal("3000"), res.monthlyIncome());` |
| ID de prueba | `tc06_pa11_get_existing` |

### 3.2 `get` — usuario sin config (defaults)

| Aspecto | Detalle |
|---|---|
| Precondición | `findByUser_Dni(dni)` → `Optional.empty()` |
| Retorno esperado | Defaults: `monthlyIncome=null, alertsEnabled=true, highContrast=false, fontScale="normal", reduceMotion=false` |
| Assert | `assertNull(res.monthlyIncome()); assertTrue(res.alertsEnabled()); assertEquals("normal", res.fontScale());` |
| ID de prueba | `tc06_get_defaults` |

### 3.3 `update(dni, req) : SettingsResponse`

| Aspecto | Detalle |
|---|---|
| Parámetros | `dni`, `SettingsUpdateRequest{ monthlyIncome=2500, alertsEnabled=true, highContrast=false, fontScale="large", reduceMotion=false }` |
| Precondición | crea fila si no existe (`userRepository.findByDni` → user); `settingsRepository.save(...)` devuelve lo guardado |
| Retorno esperado | `SettingsResponse` con `monthlyIncome=2500`, `fontScale="large"` |
| Assert | `assertEquals(new BigDecimal("2500"), res.monthlyIncome()); verify(settingsRepository).save(any());` |
| ID de prueba | `tc07_pa12_update_createsAndSavesIncome` |
| Variantes | usuario inexistente ⇒ `NotFoundException` (`tc07_update_userNotFound`); `fontScale=null` ⇒ fallback `"normal"` (`tc08_pa14_update_alertsAndFontScaleFallback`): `assertEquals("normal", res.fontScale());` |

---

## 4. JwtService (paquete `security`) — U

### 4.1 `generateToken(dni) : String` + `extractDni(token) : String` (round-trip)

| Aspecto | Detalle |
|---|---|
| Parámetros | `dni="12345678"` |
| Retorno esperado | `extractDni(generateToken("12345678"))` == `"12345678"` |
| Assert | `assertEquals("12345678", jwt.extractDni(jwt.generateToken("12345678")));` |
| ID de prueba | `roundTrip` |

### 4.2 `isTokenValid(token, dni) : boolean`

| Caso | Precondición | Retorno esperado | Assert | ID |
|---|---|---|---|---|
| Válido | token recién emitido para el dni | `true` | `assertTrue(jwt.isTokenValid(token, dni));` | `validForMatchingDni` |
| Expirado | token con expiración en el pasado | lanza/`false` (rechazado) | `assertThrows(...)` o `assertFalse(...)` | `expiredTokenRejected` |
| Manipulado | token con firma alterada | rechazado | `assertThrows(JwtException.class, ...)` | `tamperedTokenRejected` |

---

## 5. ExpenseMapper (paquete `mapper`) — U

### 5.1 `toResponse(e: Expense) : ExpenseResponse`

| Aspecto | Detalle |
|---|---|
| Parámetros | `Expense` con `id="exp-1"`, `amount=50`, `currency=PEN`, `category.id="cat-1"` |
| Retorno esperado | `ExpenseResponse` con los mismos valores y `categoryId="cat-1"` (aplanado) |
| Assert | `assertEquals("exp-1", res.id()); assertEquals("cat-1", res.categoryId());` |

### 5.2 `toEntity(req, category, user) : Expense`

| Aspecto | Detalle |
|---|---|
| Parámetros | `ExpenseRequest{amount=50,currency=PEN,...}`, `category`, `user` |
| Retorno esperado | `Expense` con amount/currency/description/date del req y category/user asignados |
| Assert | `assertEquals(category, e.getCategory()); assertEquals(user, e.getUser());` |

### 5.3 `toResponse(c: Category) : CategoryResponse`

| Aspecto | Detalle |
|---|---|
| Retorno esperado | `CategoryResponse(id, name, icon, description)` con los valores de la categoría |
| Assert | `assertEquals(c.getName(), res.name());` |

---

## 6. DTOs — validación (paquete `dto`) — U

(Ya cubierto por `DtoValidationTest`.)

| Método/caso | Entrada | Esperado | Assert | ID |
|---|---|---|---|---|
| `ExpenseRequest` campos obligatorios | request con nulos | violaciones de validación | `assertFalse(violations.isEmpty());` | `pa02_expenseRequest_requiredFields` |
| `ExpenseRequest` monto mínimo | `amount` por debajo del mínimo | violación | `assertFalse(violations.isEmpty());` | `pa03_expenseRequest_amountMin` |
| `ExpenseUpdateRequest` datos inválidos | valores inválidos | violación | `assertFalse(violations.isEmpty());` | `pa08_expenseUpdateRequest_invalidData` |
| `SettingsUpdateRequest` ingreso/fontScale | valores inválidos | violación | `assertFalse(violations.isEmpty());` | `pa13_settingsUpdateRequest_invalidIncomeAndFontScale` |

---

## 7. Métodos de integración (paquete `controller` + `repository`) — I

Estos no se prueban con mocks aislados sino levantando contexto (`@SpringBootTest`
/ `@DataJpaTest` / `MockMvc`). Forman parte del **Paso 4**, pero se especifican
aquí su contrato:

| Método | Entrada | Esperado (HTTP / dato) |
|---|---|---|
| `POST /api/auth/register` | JSON RegisterRequest | 200 + AuthResponse con token; 409 si DNI repetido |
| `POST /api/auth/login` | JSON LoginRequest | 200 + token; 401 si credenciales malas |
| `GET /api/expenses` | Bearer JWT + filtros | 200 + lista del usuario; 401 sin token |
| `POST /api/expenses` | Bearer + ExpenseRequest | 201/200 + ExpenseResponse |
| `PUT /api/expenses/{id}` | Bearer + update | 200; 404 si es de otro usuario |
| `DELETE /api/expenses/{id}` | Bearer + id | 204; 404 si ajeno |
| `ExpenseRepository.findFiltered` | dni + filtros | devuelve solo gastos del dni que cumplen filtros |
| `UserRepository.existsByDni` | dni | `true/false` según exista |

---

## 8. Cobertura del Paso 2

| Componente | Métodos especificados | Pruebas U | Pruebas I |
|---|---|---|---|
| AuthService | 3 | 5 casos | — |
| ExpenseService | 4 | 9 casos | — |
| SettingsService | 2 | 5 casos | — |
| JwtService | 3 | 4 casos | — |
| ExpenseMapper | 3 | 3 casos | — |
| DTOs (validación) | — | 4 casos | — |
| Controllers / Repository | 11 | — | (Paso 4) |

**Siguiente (Paso 3):** ejecutar `mvn test`, y por cada fila copiar a la sección
"Resultados" del informe el **valor esperado** (este documento) frente al **valor
que arroja el sistema** (salida real de la prueba: PASÓ/FALLÓ).
