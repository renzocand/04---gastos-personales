import { isDevMode, Provider, EnvironmentProviders } from '@angular/core';
import { provideTransloco } from '@jsverse/transloco';
import { AVAILABLE_LANGS, DEFAULT_LANG } from './i18n.config';
import { TranslocoHttpLoader } from './transloco-loader';

/**
 * Providers de Transloco para el bootstrap. Cambio de idioma en caliente
 * (`reRenderOnLangChange`) y respaldo al idioma por defecto cuando falta una clave
 * (ej. textos de quechua aún sin traducir → muestran español, nunca la clave cruda).
 */
export function provideAppTransloco(): (Provider | EnvironmentProviders)[] {
  return [
    provideTransloco({
      config: {
        availableLangs: [...AVAILABLE_LANGS],
        defaultLang: DEFAULT_LANG,
        fallbackLang: DEFAULT_LANG,
        reRenderOnLangChange: true,
        missingHandler: { useFallbackTranslation: true },
        prodMode: !isDevMode(),
      },
      loader: TranslocoHttpLoader,
    }),
  ];
}
