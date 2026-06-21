import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

/** Página de inicio de sesión (/login). HU-14 · PA-22 / PA-23. */
export class LoginPage extends BasePage {
  readonly dni: Locator = this.page.locator('#dni');
  readonly password: Locator = this.page.locator('#password');
  readonly submit: Locator = this.page.locator('button[type="submit"]');
  readonly error: Locator = this.page.getByTestId('form-error');

  async open(): Promise<void> {
    await this.goto('/login');
  }

  async login(dni: string, password: string): Promise<void> {
    await this.dni.fill(dni);
    await this.password.fill(password);
    await this.submit.click();
  }
}
