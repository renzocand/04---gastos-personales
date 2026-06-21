import { defineConfig, devices } from '@playwright/test';

/**
 * Configuración de Playwright para las pruebas E2E de aceptación (PA-01..PA-25).
 *
 * Dos formas de correrlas:
 *  - Dev: sin `E2E_BASE_URL`. Apunta a http://localhost:4200 y `webServer` arranca
 *    (o reúsa) `ng serve`. El backend + la BD deben estar arriba aparte.
 *  - Stack dockerizado: `E2E_BASE_URL=http://localhost` (docker compose sirve el
 *    frontend con nginx en el puerto 80). Aquí Playwright NO gestiona el server,
 *    solo consume la URL ya levantada.
 *
 * Multi-navegador para RNF-06 (Chrome/Edge = Chromium, Firefox, Safari = WebKit).
 */
const BASE_URL = process.env.E2E_BASE_URL ?? 'http://localhost:4200';
// Sin E2E_BASE_URL gestionamos el dev server local; con la URL puesta (docker /
// túnel) asumimos que el stack ya está corriendo.
const MANAGE_DEV_SERVER = !process.env.E2E_BASE_URL;

export default defineConfig({
  testDir: './e2e/tests',
  // Las pruebas comparten el estado del backend (gastos, usuarios), por eso se
  // ejecutan en serie para que sean deterministas.
  fullyParallel: false,
  workers: 1,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 1 : 0,
  reporter: [['html', { open: 'never' }], ['list']],
  use: {
    baseURL: BASE_URL,
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
    { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],
  webServer: MANAGE_DEV_SERVER
    ? {
        command: 'npm start',
        url: BASE_URL,
        reuseExistingServer: true,
        timeout: 120_000,
      }
    : undefined,
});
