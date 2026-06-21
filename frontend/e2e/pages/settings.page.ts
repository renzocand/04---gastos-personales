import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Configuración del usuario (/settings). HU-06/07/08 (ingreso, alertas). */
export class SettingsPage extends BasePage {
  readonly monthlyIncome: Locator = this.page.locator('#monthlyIncome');
  readonly alertsEnabled: Locator = this.page.locator('input[formControlName="alertsEnabled"]');
  readonly save: Locator = this.page.locator('button[type="submit"]');
  readonly incomeError: Locator = this.page.getByTestId('income-error');

  async open(): Promise<void> {
    await this.goto('/settings');
  }

  async setIncome(value: number): Promise<void> {
    await this.monthlyIncome.fill(String(value));
  }

  async saveSettings(): Promise<void> {
    await this.save.click();
  }
}
