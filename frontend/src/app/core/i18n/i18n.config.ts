// Configuración central de idiomas. Agregar un idioma N = sumar su código acá,
// su etiqueta en LANG_LABELS y crear public/i18n/<code>.json. Nada más.
export const AVAILABLE_LANGS = ['es', 'en', 'qu'] as const;

export type AppLang = (typeof AVAILABLE_LANGS)[number];

/** Idioma por defecto y de respaldo (fallback) cuando falta una clave. */
export const DEFAULT_LANG: AppLang = 'es';

/** Clave de localStorage donde persistimos la elección del usuario. */
export const LANG_STORAGE_KEY = 'gp.lang';

/** Etiqueta legible de cada idioma, en su propia lengua (autónimo). */
export const LANG_LABELS: Record<AppLang, string> = {
  es: 'Español',
  en: 'English',
  qu: 'Runa Simi',
};

function isAppLang(value: string | null): value is AppLang {
  return value != null && (AVAILABLE_LANGS as readonly string[]).includes(value);
}

/** Lee el idioma guardado; si no hay o es inválido, cae al idioma por defecto. */
export function readStoredLang(): AppLang {
  return isAppLang(localStorage.getItem(LANG_STORAGE_KEY))
    ? (localStorage.getItem(LANG_STORAGE_KEY) as AppLang)
    : DEFAULT_LANG;
}
