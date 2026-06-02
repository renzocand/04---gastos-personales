import { inject, Injectable, signal } from '@angular/core';
import { TranslocoService } from '@jsverse/transloco';
import {
  AppLang,
  AVAILABLE_LANGS,
  LANG_LABELS,
  LANG_STORAGE_KEY,
  readStoredLang,
} from './i18n.config';

/**
 * Único punto que cambia el idioma activo: actualiza Transloco, persiste la
 * elección en localStorage y expone el idioma actual como signal para la UI.
 */
@Injectable({ providedIn: 'root' })
export class LanguageService {
  private readonly transloco = inject(TranslocoService);

  readonly available = AVAILABLE_LANGS;
  readonly labels = LANG_LABELS;
  readonly current = signal<AppLang>(readStoredLang());

  use(lang: AppLang): void {
    this.transloco.setActiveLang(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    this.current.set(lang);
  }
}
