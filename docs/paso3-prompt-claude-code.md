# Prompt para Claude Code — Paso 3: completar pruebas unitarias

> Pega esto en Claude Code dentro del repo `gastos-personales`.

---

## Contexto

Proyecto Spring Boot (backend Java) en `backend/`. Ya existen pruebas unitarias
en `backend/src/test/java/com/gastos/` que usan **JUnit 5 + Mockito + AssertJ** y
siguen la convención de nombres `tcNN_paNN_descripcion` (test case / paso de
prueba). Hay 26 pruebas y todas pasan.

**Objetivo:** completar la cobertura para que *cada método de negocio* tenga al
menos una prueba unitaria con `assert` (valor esperado vs. valor que arroja el
sistema). NO modifiques el código de producción, solo agrega clases de test.
Respeta el estilo existente (AssertJ `assertThat`, Mockito `@Mock`/`@InjectMocks`,
nombres `tc/pa`). Continúa la numeración con `tc15+` y `pa24+`.

Al terminar, ejecuta `mvn test` y confirma que **todas** las pruebas pasan.

---

## Pruebas que faltan

### 1. `AuthServiceTest` — agregar test de `me(dni)`

`AuthService.me(String dni)` no tiene prueba. Agrega a la clase existente:

- **tc15_pa24_me_ok**: dado `userRepository.findByDni(DNI)` → `Optional.of(user)`,
  al llamar `service.me(DNI)` debe devolver un `UserResponse` con el dni, nombre,
  apellido, email y role del usuario.
  `assertThat(res.dni()).isEqualTo(DNI);`
- **tc15_me_userNotFound**: si `findByDni` → `Optional.empty()`, debe lanzar
  `NotFoundException`.
  `assertThatThrownBy(() -> service.me(DNI)).isInstanceOf(NotFoundException.class);`

### 2. `CategoryServiceTest` (clase nueva)

Mockear `CategoryRepository` y `ExpenseMapper`.
`findAll()` hace `categoryRepository.findAll(Sort.by("sortOrder"))` y mapea con
`mapper.toResponse(category)`.

- **tc16_pa25_findAll_ok**: dado que el repo devuelve 2 categorías y el mapper las
  convierte, el resultado debe tener tamaño 2 en el orden devuelto.
  `assertThat(res).hasSize(2);`
- **tc16_findAll_empty**: si el repo devuelve lista vacía, el resultado es vacío.
  `assertThat(res).isEmpty();`
- Verifica que se usa el `Sort` por `sortOrder`:
  `verify(categoryRepository).findAll(Sort.by("sortOrder"));`

### 3. `ExpenseMapperTest` (clase nueva)

`ExpenseMapper` no tiene dependencias mockeables (es conversión pura). Instáncialo
directamente: `ExpenseMapper mapper = new ExpenseMapper();`

- **tc17_pa26_toResponse_expense**: dado un `Expense` con id, amount, currency,
  description, una `Category` con id="cat-1", date y timestamps, `toResponse(e)`
  debe devolver un `ExpenseResponse` con esos valores y `categoryId="cat-1"`
  (aplanado desde `e.getCategory().getId()`).
  `assertThat(res.categoryId()).isEqualTo("cat-1");`
- **tc17_pa27_toEntity**: dado `ExpenseRequest`, `Category` y `User`, `toEntity`
  debe devolver un `Expense` con amount/currency/description/date del request y la
  categoría y el usuario asignados.
  `assertThat(e.getCategory()).isSameAs(category); assertThat(e.getUser()).isSameAs(user);`
- **tc17_pa28_toResponse_category**: `toResponse(Category)` debe mapear id, name,
  icon y description.
  `assertThat(res.name()).isEqualTo(category.getName());`

### 4. `CustomUserDetailsServiceTest` (clase nueva)

Mockear `UserRepository` y `Messages`.
`loadUserByUsername(dni)` busca el usuario y construye un `UserDetails` con
autoridad `ROLE_ + role`.

- **tc18_pa29_loadUser_ok**: dado un user con role="USER", el `UserDetails`
  devuelto debe tener username=DNI, el password del user y la autoridad
  `ROLE_USER`.
  `assertThat(details.getUsername()).isEqualTo(DNI);`
  `assertThat(details.getAuthorities()).extracting("authority").contains("ROLE_USER");`
- **tc18_loadUser_notFound**: si `findByDni` → empty, debe lanzar
  `UsernameNotFoundException`.
  `assertThatThrownBy(...).isInstanceOf(UsernameNotFoundException.class);`

### 5. `ExchangeRateServiceTest` (clase nueva) — el más complejo

`getUsdToPen()` usa `RestClient` (inyectado vía `RestClient.Builder`) para pegarle
a una API externa, con caché (TTL 1h) y manejo de fallos. Hay que mockear la
cadena fluida de `RestClient`:
`restClient.get().uri(URL).retrieve().body(ErApiResponse.class)`.

Usa `RestClient.Builder` mock que devuelva un `RestClient` mock, y mockea la
cadena con `RETURNS_DEEP_STUBS` o stubbeando cada eslabón. Nota: `ErApiResponse`
es un record privado; puedes mockear `body(...)` para que devuelva un objeto con
`rates` conteniendo `{"PEN": 3.75}` — quizá necesites exponer el tipo o testear vía
el valor retornado. Si el record privado complica el mock, una alternativa válida
es testear el comportamiento observable:

- **tc19_pa30_getRate_ok**: primera llamada con API respondiendo `PEN=3.75` →
  devuelve `new BigDecimal("3.75")`.
  `assertThat(rate).isEqualByComparingTo("3.75");`
- **tc19_pa31_getRate_cached**: segunda llamada seguida no vuelve a pegarle a la
  API (usa caché). `verify(restClient, times(1)).get();`
- **tc19_getRate_unavailable**: si la API falla y no hay caché previa, lanza
  `ResponseStatusException` con 503.
  `assertThatThrownBy(...).isInstanceOf(ResponseStatusException.class);`

> Si mockear `RestClient` resulta demasiado frágil por el record privado, deja
> documentado en el test por qué y cubre al menos el caso de error (503 sin caché),
> que no requiere respuesta válida de la API.

---

## Entregable

1. Las clases/tests nuevos compilando y pasando.
2. Salida de `mvn test` con el total de pruebas y 0 fallos.
3. Un breve resumen (tabla) de qué método cubre cada test nuevo, para pegar en la
   sección "Resultados" del informe.
