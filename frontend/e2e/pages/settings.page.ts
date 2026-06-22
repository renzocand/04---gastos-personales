import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Configuración del usuario (/settings). HU-06/07/08 (ingreso, alertas). */
export class SettingsPage extends BasePage {
  readonly monthlyIncome: Locator = this.page.locator('#monthlyIncome');
  readonly alertsEnabled: Locator = this.page.locator('input[formControlName="alertsEnabled"]');
  readonly save: Locator = this.page.locator('button[type="submit"]');
  readonly incomeError: Locator = this.page.getByTestId('income-error');

  async open(): Promise<void> {
    // Esperamos la carga de settings del backend: el form se sincroniza por efecto
    // cuando llega la respuesta, así no sobreescribe lo que tecleamos después.
    const loaded = this.page.waitForResponse(
      (r) => r.url().includes('/api/settings') && r.request().method() === 'GET',
    );
    await this.goto('/settings');
    await loaded;
  }

  async setIncome(value: number): Promise<void> {
    await this.monthlyIncome.fill(String(value));
  }

  /** Hace clic en Guardar (sin esperar). Útil cuando el form es inválido (no hay PUT). */
  async saveSettings(): Promise<void> {
    await this.save.click();
  }

  /** Guarda y espera la confirmación del backend (PUT). Para formularios válidos. */
  async saveAndWait(): Promise<void> {
    const saved = this.page.waitForResponse(
      (r) => r.url().includes('/api/settings') && r.request().method() === 'PUT',
    );
    await this.save.click();
    await saved;
  }
}
