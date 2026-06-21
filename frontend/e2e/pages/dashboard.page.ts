import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/**
 * Dashboard (/dashboard). HU-06 (config visible) · HU-09 (distribución) ·
 * HU-10 (recientes) · HU-11 (nivel de presupuesto consumido).
 */
export class DashboardPage extends BasePage {
  // Badge de estado del presupuesto: expone el nivel vía data-level y el % como texto.
  readonly budgetStatus: Locator = this.page.getByTestId('budget-status');
  readonly categoryBreakdown: Locator = this.page.locator('app-category-breakdown');
  readonly recentExpenses: Locator = this.page.locator('app-recent-expenses');

  async open(): Promise<void> {
    await this.goto('/dashboard');
  }

  /** Nivel del presupuesto: 'ok' | 'info' | 'warning' | 'danger'. */
  budgetLevel(): Promise<string | null> {
    return this.budgetStatus.getAttribute('data-level');
  }
}
