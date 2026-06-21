import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export interface NewExpense {
  amount: number;
  description: string;
  currency?: 'PEN' | 'USD';
  date?: string; // yyyy-MM-dd; por defecto el form usa hoy
}

/**
 * Formulario de gasto, creación (/expenses/new) y edición (/expenses/:id/edit).
 * HU-01 (registrar) · HU-04 (editar) · HU-05 (eliminar, con diálogo de confirmación).
 */
export class ExpenseFormPage extends BasePage {
  readonly amount: Locator = this.page.locator('#amount');
  readonly description: Locator = this.page.locator('#description');
  readonly date: Locator = this.page.locator('#date');
  readonly submit: Locator = this.page.locator('button[type="submit"]');

  readonly deleteButton: Locator = this.page.getByTestId('expense-delete');
  readonly confirmDialog: Locator = this.page.getByTestId('confirm-dialog');
  readonly confirmAccept: Locator = this.page.getByTestId('confirm-accept');
  readonly confirmCancel: Locator = this.page.getByTestId('confirm-cancel');

  async openNew(): Promise<void> {
    await this.goto('/expenses/new');
  }

  async fillForm(data: NewExpense): Promise<void> {
    if (data.currency) {
      await this.page
        .locator(`label:has(input[formControlName="currency"][value="${data.currency}"])`)
        .click();
    }
    await this.amount.fill(String(data.amount));
    await this.description.fill(data.description);
    // Cualquier categoría sirve para estas pruebas: se elige la primera disponible.
    await this.page.locator('label:has(input[formControlName="category"])').first().click();
    if (data.date) {
      await this.date.fill(data.date);
    }
  }

  /** Crea un gasto desde cero (abre el form, lo completa y lo guarda). */
  async create(data: NewExpense): Promise<void> {
    await this.openNew();
    await this.fillForm(data);
    await this.submit.click();
  }

  /** PA-09: abre el diálogo de borrado y CONFIRMA. */
  async deleteExpense(): Promise<void> {
    await this.deleteButton.click();
    await this.confirmAccept.click();
  }

  /** PA-10: abre el diálogo de borrado y CANCELA (no debe eliminar). */
  async openDeleteThenCancel(): Promise<void> {
    await this.deleteButton.click();
    await this.confirmCancel.click();
  }
}
