import { expect, test } from '@playwright/test';
import { DashboardPage } from '../pages/dashboard.page';
import { ExpenseFormPage } from '../pages/expense-form.page';
import { RegisterPage } from '../pages/register.page';
import { SettingsPage } from '../pages/settings.page';
import { newUser } from '../support/users';

/**
 * Pruebas de aceptación del dashboard: HU-09 (distribución), HU-10 (recientes),
 * HU-11 (nivel de presupuesto consumido). PA-15, PA-16, PA-17, PA-18.
 */
test.describe('Dashboard / presupuesto', () => {
  test('PA-17 / PA-18: porcentaje y nivel del presupuesto consumido', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();
    await register.register(newUser());

    // Ingreso 1000 + gasto de 900 PEN → 90% → nivel "warning".
    const settings = new SettingsPage(page);
    await settings.open();
    await settings.setIncome(1000);
    await settings.saveSettings();

    await new ExpenseFormPage(page).create({ amount: 900, description: 'Gasto grande' });

    const dashboard = new DashboardPage(page);
    await dashboard.open();
    await expect(dashboard.budgetStatus).toBeVisible(); // PA-11: se visualiza
    await expect(dashboard.budgetStatus).toHaveAttribute('data-level', 'warning'); // PA-18
    await expect(dashboard.budgetStatus).toContainText('90%'); // PA-17
  });

  test('PA-15 / PA-16: distribución por categorías y gastos recientes', async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();
    await register.register(newUser());

    await new ExpenseFormPage(page).create({ amount: 120, description: 'Gasto reciente' });

    const dashboard = new DashboardPage(page);
    await dashboard.open();
    await expect(dashboard.recentExpenses).toContainText('Gasto reciente'); // PA-16
    await expect(dashboard.categoryBreakdown).toBeVisible(); // PA-15
  });
});
