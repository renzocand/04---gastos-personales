import { DOCUMENT } from '@angular/common';
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
  private readonly document = inject(DOCUMENT);

  readonly available = AVAILABLE_LANGS;
  readonly labels = LANG_LABELS;
  readonly current = signal<AppLang>(readStoredLang());

  constructor() {
    // Alinea <html lang> con el idioma persistido al arrancar (a11y: los
    // lectores de pantalla pronuncian el contenido según este atributo).
    this.syncDocumentLang(this.current());
  }

  use(lang: AppLang): void {
    this.transloco.setActiveLang(lang);
    localStorage.setItem(LANG_STORAGE_KEY, lang);
    this.current.set(lang);
    this.syncDocumentLang(lang);
  }

  private syncDocumentLang(lang: AppLang): void {
    this.document.documentElement.lang = lang;
  }
}
