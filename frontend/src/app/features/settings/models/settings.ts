/** Escala tipográfica de la interfaz (accesibilidad). */
export type FontScale = 'normal' | 'large' | 'xlarge';

/** Configuración del usuario (refleja SettingsResponse del backend). */
export interface UserSettings {
  monthlyIncome: number | null;
  alertsEnabled: boolean;
  // Accesibilidad (ODS 10 · meta 10.2).
  highContrast: boolean;
  fontScale: FontScale;
  reduceMotion: boolean;
}
