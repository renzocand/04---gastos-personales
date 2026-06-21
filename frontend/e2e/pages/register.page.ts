import { Locator } from '@playwright/test';
import { NewUser } from '../support/users';
import { BasePage } from './base.page';

/** Página de registro (/register). HU-13 · PA-20 / PA-21. */
export class RegisterPage extends BasePage {
  readonly dni: Locator = this.page.locator('#dni');
  readonly firstName: Locator = this.page.locator('#firstName');
  readonly lastName: Locator = this.page.locator('#lastName');
  readonly secondLastName: Locator = this.page.locator('#secondLastName');
  readonly email: Locator = this.page.locator('#email');
  readonly password: Locator = this.page.locator('#password');
  readonly submit: Locator = this.page.locator('button[type="submit"]');
  readonly error: Locator = this.page.getByTestId('form-error');

  async open(): Promise<void> {
    await this.goto('/register');
  }

  /** Completa y envía el formulario de registro. */
  async register(user: NewUser): Promise<void> {
    await this.dni.fill(user.dni);
    await this.firstName.fill(user.firstName);
    await this.lastName.fill(user.lastName);
    await this.password.fill(user.password);
    await this.submit.click();
  }
}
