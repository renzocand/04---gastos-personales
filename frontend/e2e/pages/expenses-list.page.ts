import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Lista de gastos con filtros (/expenses). HU-02 (consultar) · HU-03 (filtrar). */
export class ExpensesListPage extends BasePage {
  readonly dateFrom: Locator = this.page.locator('#date-from');
  readonly dateTo: Locator = this.page.locator('#date-to');
  readonly noResults: Locator = this.page.getByTestId('expenses-no-results');
  // Al filtrar a vacío, la lista cae en el estado "sin gastos" (ui-empty-state).
  readonly emptyState: Locator = this.page.locator('ui-empty-state');

  async open(): Promise<void> {
    await this.goto('/expenses');
  }

  /** Enlace del gasto identificado por su descripción (texto que ingresa el usuario). */
  item(description: string): Locator {
    return this.page.getByRole('link').filter({ hasText: description });
  }

  async openItem(description: string): Promise<void> {
    await this.item(description).click();
  }

  /**
   * PA-06: filtra "hasta" una fecha y espera la recarga del backend. Un solo
   * filtro (un solo change) evita estados intermedios; el blur fuerza el evento
   * change también en WebKit/Firefox.
   */
  async filterByDateTo(to: string): Promise<void> {
    const reloaded = this.page.waitForResponse(
      (r) => r.url().includes('/api/expenses') && r.request().method() === 'GET',
    );
    await this.dateTo.fill(to);
    await this.dateTo.blur();
    await reloaded;
  }
}
