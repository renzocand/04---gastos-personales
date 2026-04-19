# Gastos Personales

App para trackear gastos personales en **Soles (PEN)** y **Dólares (USD)**, pensada como proyecto de aprendizaje de NgRx sobre una base más rica que un TodoMVC.

## Stack

| Capa           | Tecnología                                        |
| -------------- | ------------------------------------------------- |
| Framework      | Angular 21 (standalone, signals, control flow)    |
| State          | NgRx 21 (`@ngrx/store`, `effects`, `entity`)      |
| Estilos        | Tailwind CSS v4 (CSS-first, `@tailwindcss/postcss`) |
| Iconos         | `lucide-angular`                                  |
| Fechas         | `date-fns`                                        |
| Tests          | Vitest                                            |
| Formato        | Prettier                                          |

## Scripts

```bash
npm start         # dev server en http://localhost:4200
npm run build     # build de producción (dist/)
npm test          # vitest
```

## Arquitectura

- **Feature-based** con separación `core/` · `shared/` · `features/`.
- **Lazy loading por feature**: cada ruta provee su state con `provideState()` + `provideEffects()`.
- **Component Input Binding**: `data` / `params` / `queryParams` de la ruta se mapean automáticamente a `input()` signals del componente — sin `ActivatedRoute`.
- **Standalone components** + **OnPush** everywhere.
- **Signals-first**: `input()`, `input.required()`, `computed()`, `viewChild.required()`.
- **Container / Presentational**: `pages/` son smart (inyectan `Store`), `components/` son dumb (`input`/`output`).
- **Modelos por feature**, no "god types" globales.

## Estructura

```
src/app/
├── core/                  # singletons: layout, tokens, utils
│   ├── layout/app-shell   # shell con header + nav + toast container
│   └── layout/not-found   # 404 page
├── shared/
│   └── ui/                # componentes UI reusables <ui-*>
├── features/
│   ├── expenses/
│   │   ├── pages/         # expenses-list, expense-form (create + edit)
│   │   ├── components/    # expense-card (dumb, reusable)
│   │   ├── store/         # actions, reducer, selectors, effects, feature
│   │   ├── services/      # HTTP, mocks
│   │   └── models/        # Expense, Category, ...
│   ├── categories/        # misma estructura
│   └── dashboard/         # consume expenses + categories (sin store propio)
│       ├── pages/dashboard-page
│       └── components/    # total-card, category-breakdown, recent-expenses
├── app.config.ts          # provideRouter(withComponentInputBinding) + futuro store
├── app.routes.ts          # rutas + lazy children
└── app.ts                 # root (<router-outlet />)
```

## Rutas

| Ruta                      | Componente       | Notas                                  |
| ------------------------- | ---------------- | -------------------------------------- |
| `/`                       | —                | redirect a `/dashboard`                |
| `/dashboard`              | `DashboardPage`  | total por moneda + breakdown + últimos |
| `/expenses`               | `ExpensesList`   | lista agrupada por día + filtros       |
| `/expenses/new`           | `ExpenseForm`    | `data: { mode: 'create' }`             |
| `/expenses/:id/edit`      | `ExpenseForm`    | `data: { mode: 'edit' }`               |
| `**`                      | `NotFound`       | wildcard 404                           |

## Monedas

- **PEN (soles)** — principal. Símbolo: `S/`
- **USD (dólares)** — secundaria. Símbolo: `US$`
- **Sin conversión automática.** Cada gasto se guarda en su moneda y los totales se muestran separados. Nunca sumar montos de distintas monedas.

## Paleta

| Rol            | Token Tailwind       |
| -------------- | -------------------- |
| Primario       | `violet-600` / `700` |
| Neutros        | `slate-50` … `900`   |
| Destructivo    | `rose-600`           |
| Éxito          | `emerald-600`        |
| Info           | `violet-600`         |
| Background app | `slate-50`           |

Tipografía: default del sistema, sin fuente custom. Usar `tabular-nums` para columnas de montos.

## Catálogo de componentes UI

### Primitivas — `src/app/shared/ui/`

#### `<ui-card>`
Wrapper con borde, radius y shadow sutil. Las clases van en el host — usalo como contenedor base.

```html
<ui-card>
  <div class="p-5 sm:p-6">...contenido...</div>
</ui-card>
```

#### `<ui-skeleton>`
Placeholder animado con `animate-pulse`. El consumidor pasa tamaño por clase.

```html
<ui-skeleton class="h-4 w-24" />
<ui-skeleton class="h-10 w-10 rounded-lg" />
```

#### `<ui-progress-bar>`
Barra de progreso accesible (`role="progressbar"`, `aria-valuenow`).

| Input      | Tipo                                                       | Default   |
| ---------- | ---------------------------------------------------------- | --------- |
| `percent`  | `number` (required)                                        | —         |
| `color`    | `'violet' \| 'indigo' \| 'emerald' \| 'amber' \| 'rose'`   | `'violet'`|

```html
<ui-progress-bar [percent]="37" color="violet" />
```

#### `<ui-error-state>`
Card con ícono de alerta, mensaje y botón retry opcional.

| Input       | Tipo              | Default                |
| ----------- | ----------------- | ---------------------- |
| `title`     | `string`          | `'Algo salió mal'`     |
| `message`   | `string?`         | —                      |
| `showRetry` | `boolean`         | `true`                 |

| Output      | Payload           |
| ----------- | ----------------- |
| `retry`     | `void`            |

```html
<ui-error-state
  title="No pudimos cargar los gastos"
  message="Revisá tu conexión y reintentá."
  (retry)="onRetry()"
/>
```

#### `<ui-empty-state>`
Estado vacío con ícono, título, mensaje y slot `<ng-content>` para CTA.

| Input     | Tipo                 | Default     |
| --------- | -------------------- | ----------- |
| `icon`    | `typeof Receipt`     | `Receipt`   |
| `title`   | `string` (required)  | —           |
| `message` | `string?`            | —           |

```html
<ui-empty-state
  [icon]="ReceiptIcon"
  title="Todavía no hay gastos"
  message="Empezá registrando tu primer movimiento."
>
  <a routerLink="/expenses/new" class="...">Crear primer gasto</a>
</ui-empty-state>
```

#### `<ui-confirm-dialog>`
Modal de confirmación con `<dialog>` nativo (focus trap + esc-to-close gratis).

| Input            | Tipo                     | Default         |
| ---------------- | ------------------------ | --------------- |
| `title`          | `string`                 | `'¿Estás seguro?'` |
| `message`        | `string?`                | —               |
| `confirmLabel`   | `string`                 | `'Confirmar'`   |
| `cancelLabel`    | `string`                 | `'Cancelar'`    |
| `confirmVariant` | `'default' \| 'danger'`  | `'default'`     |

| Output      | Payload           |
| ----------- | ----------------- |
| `confirmed` | `void`            |

| Método      | Descripción       |
| ----------- | ----------------- |
| `open()`    | muestra el modal  |
| `close()`   | cierra el modal   |

Uso con template reference variable:

```html
<button type="button" (click)="dialog.open()">Eliminar</button>

<ui-confirm-dialog
  #dialog
  title="Eliminar gasto"
  message="Esta acción no se puede deshacer."
  confirmLabel="Eliminar"
  confirmVariant="danger"
  (confirmed)="onDelete()"
/>
```

#### `<ui-toast>` + `<ui-toast-container>`
Notificaciones flotantes (bottom en mobile, bottom-right en desktop).

**`<ui-toast>`** (visual, se usa dentro del container)

| Input         | Tipo                              | Default  |
| ------------- | --------------------------------- | -------- |
| `message`     | `string` (required)               | —        |
| `variant`     | `'success' \| 'error' \| 'info'`  | `'info'` |
| `dismissible` | `boolean`                         | `true`   |

**`<ui-toast-container>`** (ya está en el shell)

```ts
type ToastMessage = {
  id: string;
  message: string;
  variant?: 'success' | 'error' | 'info';
};
```

```html
<ui-toast-container
  [toasts]="toasts()"
  (dismiss)="onDismiss($event)"
/>
```

### Feature components

#### `<app-expense-card>`
Card individual de un gasto (dumb, reusable en lista y dashboard).

| Input         | Tipo                                                       |
| ------------- | ---------------------------------------------------------- |
| `description` | `string` (required)                                        |
| `category`    | `'Comida' \| 'Transporte' \| 'Ocio' \| 'Otro'` (required)  |
| `amount`      | `string` (required) — ya formateado con símbolo            |
| `date`        | `string` (required)                                        |

No importa `Router`. Para navegación, envolver en `<a [routerLink]>` desde el padre.

#### `<app-total-card>`
Card de total del mes con variación porcentual (verde si bajó, rojo si subió).

| Input           | Tipo                   | Default                |
| --------------- | ---------------------- | ---------------------- |
| `total`         | `string` (required)    | —                      |
| `variation`     | `number`               | `0`                    |
| `previousLabel` | `string`               | `'vs. mes anterior'`   |

Para dos monedas, renderizar dos cards:

```html
<div class="grid gap-4 sm:grid-cols-2">
  <app-total-card total="S/ 1.248,50" [variation]="-8" />
  <app-total-card total="US$ 180,40" [variation]="12" />
</div>
```

## Patrones idiomáticos del proyecto

- **Radio-cards con `peer` de Tailwind**: inputs `<input type="radio" class="peer sr-only">` + `<span class="peer-checked:...">` para toggles visuales sin JS. Usado en filtros, selector de moneda, selector de categoría.
- **`<button type="reset">` dentro de `<form>`**: resetea filtros a valores iniciales sin JS.
- **`<fieldset>` + `<legend>`** para agrupar radios relacionados (accesibilidad).
- **`tabular-nums`** en montos y contadores para alineación de dígitos.
- **`min-h-dvh`** (dynamic viewport height) en layouts full-screen de mobile.
- **`host: { class: '...' }`** para componentes que tienen estilos fijos al elemento host (ej: `<ui-card>`).
- **Lookup tables tipadas** (`Record<K, V>`) fuera de la clase para íconos / clases / metadatos por variant.

## Roadmap

- [x] Scaffolding + Tailwind v4 + routing
- [x] Shell con navegación
- [x] Dashboard UI (total por moneda, breakdown, últimos)
- [x] Form create/edit con confirmación de borrado
- [x] Lista con filtros (categoría, moneda, rango de fechas)
- [x] Primitivas UI (skeleton, empty, error, toast, confirm)
- [ ] `expensesFeature` con `createFeature` + `@ngrx/entity`
- [ ] `categoriesFeature`
- [ ] Effects con HTTP mockeado (`of(...).pipe(delay(...))`)
- [ ] Meta-reducer de localStorage
- [ ] ToastService conectado al shell
- [ ] JSON-server + HttpClient real
- [ ] Optimistic updates en Effects
