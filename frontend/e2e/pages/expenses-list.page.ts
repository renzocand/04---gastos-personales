import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Lista de gastos con filtros (/expenses). HU-02 (consultar) · HU-03 (filtrar). */
export class ExpensesListPage extends BasePage {
  readonly dateFrom: Locator = this.page.locator('#date-from');
  readonly dateTo: Locator = this.page.locator('#date-to');
  readonly noResults: Locator = this.page.getByTestId('expenses-no-results');

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

  /** PA-05 / PA-06: filtra por rango de fechas (dispara recarga con debounce). */
  async filterByDateRange(from: string, to: string): Promise<void> {
    await this.dateFrom.fill(from);
    await this.dateTo.fill(to);
  }
}
