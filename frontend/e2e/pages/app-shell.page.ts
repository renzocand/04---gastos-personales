import { Locator } from '@playwright/test';
import { BasePage } from './base.page';

export type AppLang = 'es' | 'en' | 'qu';

/**
 * Cabecera/navegación común a las páginas autenticadas (AppShell): logout y
 * selector de idioma. HU-12 (idioma) · HU-15 (cierre de sesión).
 */
export class AppShell extends BasePage {
  readonly logoutButton: Locator = this.page.getByTestId('logout');
  // El selector de idioma aparece en el shell y en /settings; el primero es el del shell.
  readonly langSelect: Locator = this.page.getByTestId('lang-select').first();

  async logout(): Promise<void> {
    await this.logoutButton.click();
  }

  /** PA-19: cambia el idioma activo de la interfaz. */
  async selectLanguage(code: AppLang): Promise<void> {
    await this.langSelect.selectOption(code);
  }
}
