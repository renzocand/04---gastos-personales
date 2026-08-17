import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import {
  Bus,
  CreditCard,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home,
  Package,
  ShoppingBag,
  Sparkles,
  Tag,
  Utensils,
  UtensilsCrossed,
  Zap,
} from 'lucide-angular';
import { CdnIcon } from '../../../shared/ui/cdn-icon/cdn-icon';
import { SYSTEM_COLOR_PALETTE } from '../models/category';

type LucideIcon = typeof Package;

/**
 * Mapa de iconos bundled para componentes que aún usan iconFor().
 * Para nuevos componentes, usar CdnIcon directamente.
 */
const CATEGORY_ICONS: Record<string, LucideIcon> = {
  UtensilsCrossed,
  Utensils,
  Bus,
  Home,
  Zap,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Sparkles,
  Package,
  CreditCard,
  Tag,
};

/**
 * Resuelve el nombre de icono a un componente Lucide.
 * @deprecated Usar CdnIcon para iconos dinámicos
 */
export function iconFor(name?: string): LucideIcon {
  return (name && CATEGORY_ICONS[name]) || Package;
}

/**
 * Componente que muestra el icono de una categoría cargado desde CDN.
 */
@Component({
  selector: 'app-category-icon',
  standalone: true,
  imports: [CdnIcon],
  template: `<app-cdn-icon [name]="iconName() || 'Package'" class="size-full" />`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryIconDisplay {
  iconName = input<string | undefined>();
}

/**
 * Clases Tailwind para colores de categoría.
 * @deprecated Usar getColorHex() para colores dinámicos de BD
 */
const CATEGORY_COLORS: Record<string, string> = {
  food: 'bg-violet-100 text-violet-700',
  transport: 'bg-indigo-100 text-indigo-700',
  housing: 'bg-emerald-100 text-emerald-700',
  services: 'bg-sky-100 text-sky-700',
  health: 'bg-rose-100 text-rose-700',
  education: 'bg-blue-100 text-blue-700',
  leisure: 'bg-amber-100 text-amber-700',
  shopping: 'bg-fuchsia-100 text-fuchsia-700',
  home: 'bg-teal-100 text-teal-700',
  other: 'bg-slate-100 text-slate-700',
};

/**
 * Obtiene clases Tailwind para el color de una categoría (legacy).
 * @deprecated Usar getColorHex() para colores dinámicos de BD
 */
export function colorFor(id: string): string {
  return CATEGORY_COLORS[id] ?? 'bg-slate-100 text-slate-700';
}

/** Color gris por defecto para categorías sin color configurado */
const DEFAULT_COLOR = '#94a3b8'; // slate-400

/**
 * Obtiene el color hex de una categoría.
 * Si no tiene color asignado, retorna gris para indicar que falta configurar.
 */
export function getColorHex(color: string | undefined | null): string {
  return color || DEFAULT_COLOR;
}

// Re-export para uso en otros módulos
export { CdnIcon };
