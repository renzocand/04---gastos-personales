# Pruebas E2E de aceptación (Playwright + Page Object Model)

Pruebas end-to-end que validan las **pruebas de aceptación (PA)** en un navegador
real, recorriendo la app integrada (Angular + backend Spring Boot + MySQL). Usan el
patrón **Page Object Model**: los `pages/` encapsulan los selectores e interacciones,
y los `tests/` describen los escenarios sin tocar el DOM directamente.

## Estructura

```
e2e/
  pages/        Page Objects (BasePage + una clase por pantalla)
  tests/        Specs por área funcional, nombrados por PA
  support/      Utilidades (generación de usuarios únicos)
playwright.config.ts   Config: baseURL, multi-navegador (RNF-06), webServer
```

## Requisitos para correrlas

Las E2E necesitan **todo el stack levantado**:

1. **MySQL** (Docker, puerto 3307) — la base del backend.
2. **Backend** Spring Boot en `http://localhost:8080`.
3. **Frontend** en `http://localhost:4200` — Playwright lo arranca solo (`webServer`)
   o reúsa el que ya esté corriendo (`reuseExistingServer`).

Instalación de Playwright (una vez):

```bash
cd frontend
npm install              # instala @playwright/test (ya está en devDependencies)
npx playwright install   # descarga los navegadores (Chromium, Firefox, WebKit)
```

## Ejecutar

```bash
cd frontend
npm run e2e            # todos los navegadores, headless
npm run e2e:ui         # modo interactivo (UI mode)
npx playwright test --project=chromium    # un solo navegador
npx playwright test e2e/tests/auth.spec.ts # un solo archivo
npm run e2e:report     # abre el reporte HTML de la última corrida
```

Si el frontend corre en otra URL: `E2E_BASE_URL=http://localhost:4200 npm run e2e`.

## Cobertura (PA → spec)

| Spec | Pruebas de aceptación |
|------|-----------------------|
| `tests/auth.spec.ts` | PA-20, PA-21, PA-22, PA-23, PA-24, PA-25 |
| `tests/expenses.spec.ts` | PA-01, PA-05, PA-06, PA-07, PA-09, **PA-10** |
| `tests/settings.spec.ts` | PA-12, PA-13, PA-19 |
| `tests/dashboard.spec.ts` | PA-11, PA-15, PA-16, PA-17, PA-18 |

**RNF-06** (Chrome/Edge/Firefox/Safari): cubierto por los proyectos `chromium`,
`firefox` y `webkit` de `playwright.config.ts` (Edge usa el motor de Chromium).

> Las pruebas crean un usuario nuevo (DNI único) por escenario, así son
> independientes y re-ejecutables aunque el backend persista los datos.
