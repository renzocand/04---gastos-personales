# CLAUDE.md

Contexto para Claude Code cuando trabaje en este repo.

## Proyecto

App de gastos personales (Perú). Stack: **Angular 21 + NgRx 21 + Tailwind CSS v4**. Proyecto de aprendizaje para consolidar NgRx clásico (`createFeature`, Effects, `@ngrx/entity`, optimistic updates).

## División de responsabilidades — ESTRICTA

Este proyecto se desarrolla colaborativamente con Renzo.

### Claude modifica libremente

- Templates `.html`
- Estilos `.css` / `.scss`
- Componentes puramente visuales (smart `pages/` y dumb `components/`)
- Estructura de carpetas de UI
- Rutas (`app.routes.ts`, `app.config.ts`)
- Providers de UI (router, lucide)

### Claude NO modifica (territorio de Renzo)

- `*.reducer.ts`
- `*.actions.ts`
- `*.selectors.ts`
- `*.effects.ts`
- `*.service.ts`
- Integración del store dentro de componentes (`toSignal(store.select(...))`, `store.dispatch(...)`)
- `FormGroup` / `FormControl` / validadores
- Modelos de dominio (`Expense`, `Category`, ...) — los escribe él

Si hay que crear un componente que va a necesitar lógica después, hacer el template con datos hardcodeados + stubs (`signal(false)`, arrays mock). Renzo los reemplaza al conectar.

## Cómo guiar a Renzo

- **Paso a paso, un concepto a la vez.** No dar el stack completo de una.
- **Esperar confirmación** antes de avanzar al siguiente paso.
- Cuando pida **review de código suyo**: feedback puntual + pista del siguiente paso. Solo dar solución completa si dice "dame todo".
- Enseñar **prácticas senior con el "por qué"**, incluso si no son estrictamente necesarias.
- **No tutoriales básicos de Angular** (components, directives, etc.) — él viene de TodoMVC con NgRx.
- **Responder en español.**

## Monedas

- **PEN (soles)** — default. Símbolo: `S/`
- **USD (dólares)** — secundaria. Símbolo: `US$`
- **Sin conversión automática.** Cada gasto tiene `currency: 'PEN' | 'USD'`. Totales y agregaciones **siempre separados por moneda**.

## Convenciones técnicas

- **Standalone components** (default Angular 21, no escribir `standalone: true`).
- **`ChangeDetectionStrategy.OnPush`** en todos los componentes.
- **Signals-first**: `input()`, `input.required()`, `computed()`, `signal()`, `viewChild.required()`. No `@Input` / `@ViewChild` decorators.
- **`host: { class: '...' }`** para clases fijas al elemento host.
- **Lookup tables tipadas** (`Record<K, V>`) fuera de la clase — no switches en templates.
- **`<dialog>` nativo** para modales (no CDK, no librerías).
- **Tailwind `peer` / `<fieldset>` / `<button type="reset">`** para estados de UI sin JS.
- **Control flow moderno**: `@if` / `@for` / `@empty`. No `*ngIf` / `*ngFor`.
- **Imports ordenados** alfabéticamente dentro de cada grupo (Angular / terceros / internos).

## Estructura

```
src/app/
├── core/
│   ├── layout/app-shell/      # header + nav + toast container global
│   ├── layout/not-found/      # 404
│   ├── tokens/
│   └── utils/
├── shared/
│   ├── ui/                    # primitivas <ui-*>
│   │   ├── card/
│   │   ├── skeleton/
│   │   ├── progress-bar/
│   │   ├── empty-state/
│   │   ├── error-state/
│   │   ├── confirm-dialog/
│   │   └── toast/             # toast + toast-container
│   └── pipes/
└── features/
    ├── expenses/
    │   ├── pages/             # expenses-list, expense-form (create+edit)
    │   ├── components/        # expense-card (dumb)
    │   ├── store/             # TERRITORIO DE RENZO
    │   ├── services/          # TERRITORIO DE RENZO
    │   └── models/            # TERRITORIO DE RENZO
    ├── categories/            # misma estructura
    └── dashboard/             # consume stores de expenses + categories
        ├── pages/dashboard-page/
        └── components/        # total-card, category-breakdown, recent-expenses
```

## Naming

- **Prefix de selector**:
  - `ui-*` → componentes shared/ui (primitivas)
  - `app-*` → componentes de features
- **Archivo y clase** mismo nombre (`expense-card.ts` → `ExpenseCard`).
- **Sin sufijo `.component`** en archivos (convención Angular 21: `app-shell.ts`, no `app-shell.component.ts`).

## Paleta

| Rol         | Tailwind             |
| ----------- | -------------------- |
| Primario    | `violet-600` / `700` |
| Neutros     | `slate-50` … `900`   |
| Destructivo | `rose-600`           |
| Éxito       | `emerald-600`        |
| Fondo app   | `slate-50`           |

Iconos: `lucide-angular` v1. Importar por nombre, asignar a `protected readonly XxxIcon = Xxx` y usar `<lucide-angular [img]="XxxIcon" class="size-4">`.

## Rutas

- `/` → redirect a `/dashboard`
- `/dashboard`
- `/expenses`
- `/expenses/new` → `ExpenseForm` con `data: { mode: 'create' }`
- `/expenses/:id/edit` → `ExpenseForm` con `data: { mode: 'edit' }`
- `**` → `NotFound`

`provideRouter(routes, withComponentInputBinding())` activa el mapeo automático de `data`/`params` a `input()` del componente.

## Conexión store → UI (para cuando Renzo conecte)

En las `pages/` hay stubs con `signal(false)` / `signal(null)` / `signal(true)` para `loading` / `error` / `hasExpenses`. Al conectar:

```ts
// Renzo reemplaza los signal() por:
private store = inject(Store);
protected readonly loading = toSignal(this.store.select(selectLoading), { initialValue: false });
protected readonly error = toSignal(this.store.select(selectError), { initialValue: null });
```

Las rutas que consumen un feature state deben proveerlo:

```ts
{
  path: 'expenses',
  providers: [
    provideState(expensesFeature),
    provideEffects([ExpensesEffects]),
  ],
  loadComponent: () => import('...').then(m => m.ExpensesList),
}
```

## Comandos

```bash
npm start         # dev server (http://localhost:4200)
npm run build     # build producción
npm test          # vitest
```

## Decisiones tomadas (no reabrir salvo pedido)

- **Tailwind puro**, no Angular Material / PrimeNG.
- **NgRx clásico**, no `@ngrx/signals` (él quiere consolidar el flujo `actions → reducer → effects → selectors`).
- **Página aparte** para el form de gasto, no modal (mejor UX en mobile con forms largos).
- **Totales separados por moneda** en dashboard, no conversión automática.
- **Una sola vista para create y edit** (`ExpenseForm` con `input('mode')`).
- **`<dialog>` nativo** para confirmaciones, no librería de modales.
