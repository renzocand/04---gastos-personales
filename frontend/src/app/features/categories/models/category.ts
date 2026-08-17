// Las categorías vienen de la BD (GET /api/categories). El id es un código
// estable (UUID); ya no es un union literal, por eso CategoryId es solo string.
export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  icon?: string; // nombre del icono lucide (resuelto a componente en el front)
  color?: string; // color hex para gráficos (ej: "#8b5cf6")
  description?: string; // contexto para que la IA entienda cuándo usar esta categoría
  sortOrder?: number;
  active?: boolean; // false indica soft-deleted
}

export interface CategoryRequest {
  name: string;
  icon?: string;
  color?: string;
  description?: string;
  sortOrder?: number;
}

/** Paleta de colores del sistema para categorías */
export const SYSTEM_COLOR_PALETTE: readonly string[] = [
  '#8b5cf6', // violet
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#f43f5e', // rose
];

/** Genera un color hex aleatorio con buen contraste */
export function generateRandomColor(): string {
  // Colores HSL con saturación y luminosidad controlada para buen contraste
  const hue = Math.floor(Math.random() * 360);
  const saturation = 60 + Math.floor(Math.random() * 20); // 60-80%
  const lightness = 45 + Math.floor(Math.random() * 15); // 45-60%
  return hslToHex(hue, saturation, lightness);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color).toString(16).padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}
