import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { TranslocoModule } from '@jsverse/transloco';
import { LanguageService } from '../../../core/i18n/language.service';
import { AppLang } from '../../../core/i18n/i18n.config';

/** Selector de idioma reutilizable: cambia el idioma activo de toda la app. */
@Component({
  selector: 'ui-language-selector',
  imports: [TranslocoModule],
  templateUrl: './language-selector.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class LanguageSelector {
  protected readonly lang = inject(LanguageService);

  protected onChange(value: string): void {
    this.lang.use(value as AppLang);
  }
}
