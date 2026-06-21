import { Locator, Page } from '@playwright/test';

/**
 * BasePage: clase base del Page Object Model.
 *
 * Encapsula lo común a todas las páginas (la referencia `page` y la navegación)
 * para que los tests no interactúen con el DOM directamente. Cada página concreta
 * extiende esta clase, declara sus locators y expone métodos de acción legibles.
 *
 * A diferencia de Selenium, los Locator de Playwright ya esperan automáticamente
 * a que el elemento exista/sea accionable, por eso no hace falta una espera explícita.
 */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Navega a una ruta relativa al baseURL (p.ej. '/login'). */
  async goto(path: string): Promise<void> {
    await this.page.goto(path);
  }

  /** Ruta actual (sin el origin), útil para verificar redirecciones de los guards. */
  path(): string {
    return new URL(this.page.url()).pathname;
  }

  /** Idioma activo de la interfaz, leído del atributo <html lang>. */
  activeLang(): Promise<string> {
    return this.page.locator('html').getAttribute('lang').then((l) => l ?? '');
  }

  /** Toast de la app (ui-toast usa role="status"). Sirve para afirmar avisos. */
  get toast(): Locator {
    return this.page.locator('ui-toast, [role="status"]');
  }
}
