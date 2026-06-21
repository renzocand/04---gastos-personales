import { expect, test } from '@playwright/test';
import { ExpenseFormPage } from '../pages/expense-form.page';
import { ExpensesListPage } from '../pages/expenses-list.page';
import { RegisterPage } from '../pages/register.page';
import { newUser } from '../support/users';

/**
 * Pruebas de aceptación de gastos: HU-01..05. PA-01, PA-05/06, PA-07, PA-09, PA-10.
 * Cada prueba arranca con un usuario nuevo autenticado (independiente y re-ejecutable).
 */
test.describe('Gastos', () => {
  test.beforeEach(async ({ page }) => {
    const register = new RegisterPage(page);
    await register.open();
    await register.register(newUser());
    await expect(page).toHaveURL(/\/dashboard$/);
  });

  test('PA-01: registrar un gasto exitosamente', async ({ page }) => {
    const form = new ExpenseFormPage(page);
    await form.create({ amount: 50, description: 'Almuerzo E2E' });

    await expect(page).toHaveURL(/\/expenses$/);
    await expect(new ExpensesListPage(page).item('Almuerzo E2E')).toBeVisible();
  });

  test('PA-05 / PA-06: filtrar por fecha (con y sin resultados)', async ({ page }) => {
    const form = new ExpenseFormPage(page);
    await form.create({ amount: 30, description: 'Café filtrable' });

    const list = new ExpensesListPage(page);
    await expect(list.item('Café filtrable')).toBeVisible(); // PA-05: coincide

    // PA-06: un rango de fechas en el pasado no devuelve resultados.
    await list.filterByDateRange('2000-01-01', '2000-01-02');
    await expect(list.noResults).toBeVisible();
  });

  test('PA-07: editar un gasto', async ({ page }) => {
    const form = new ExpenseFormPage(page);
    await form.create({ amount: 40, description: 'Gasto original' });

    const list = new ExpensesListPage(page);
    await list.openItem('Gasto original');
    await expect(page).toHaveURL(/\/expenses\/.+\/edit$/);

    await form.description.fill('Gasto editado');
    await form.submit.click();

    await expect(page).toHaveURL(/\/expenses$/);
    await expect(list.item('Gasto editado')).toBeVisible();
    await expect(list.item('Gasto original')).toHaveCount(0);
  });

  test('PA-09: eliminar un gasto (confirmando)', async ({ page }) => {
    const form = new ExpenseFormPage(page);
    await form.create({ amount: 60, description: 'Gasto a eliminar' });

    const list = new ExpensesListPage(page);
    await list.openItem('Gasto a eliminar');
    await form.deleteExpense();

    await expect(page).toHaveURL(/\/expenses$/);
    await expect(list.item('Gasto a eliminar')).toHaveCount(0);
  });

  test('PA-10: cancelar la eliminación deja el gasto intacto', async ({ page }) => {
    const form = new ExpenseFormPage(page);
    await form.create({ amount: 70, description: 'Gasto persistente' });

    const list = new ExpensesListPage(page);
    await list.openItem('Gasto persistente');

    await form.openDeleteThenCancel();
    await expect(form.confirmDialog).toBeHidden(); // el diálogo se cerró sin borrar

    await list.open();
    await expect(list.item('Gasto persistente')).toBeVisible();
  });
});
