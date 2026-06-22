import { expect, test } from '@playwright/test';
import { AppShell } from '../pages/app-shell.page';
import { RegisterPage } from '../pages/register.page';
import { SettingsPage } from '../pages/settings.page';
import { newUser } from '../support/users';

/**
 * Pruebas de aceptación de configuración e idioma: HU-07 (ingreso), HU-12 (idioma).
 * PA-12, PA-13, PA-19.
 */
test.describe('Configuración e idioma', () => {
  test.beforeEach(async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();
    await register.register(newUser());
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('PA-12: actualizar el ingreso mensual y que persista', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.open();
    await settings.setIncome(3500);
    await settings.saveAndWait();

    // Recargar /settings: el valor quedó guardado en el backend.
    await page.reload();
    await expect(settings.monthlyIncome).toHaveValue('3500');
  });

  test('PA-13: un ingreso negativo muestra error de validación', async ({ page }) => {
    const settings = new SettingsPage(page);
    await settings.open();
    await settings.setIncome(-100);
    await settings.saveSettings();

    await expect(settings.incomeError).toBeVisible();
  });

  test('PA-19: cambiar el idioma de la interfaz', async ({ page }) => {
    const shell = new AppShell(page);

    await shell.selectLanguage('en');
    await expect(page.locator('html')).toHaveAttribute('lang', 'en');

    await shell.selectLanguage('qu');
    await expect(page.locator('html')).toHaveAttribute('lang', 'qu');
  });
});
