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

type LucideIcon = typeof Package;

/**
 * Mapa nombre-de-icono (tal como lo guarda la BD en category.icon) → componente
 * lucide. Si la BD trae un icono que no está acá, se cae a `Package`.
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

export function iconFor(name?: string): LucideIcon {
  return (name && CATEGORY_ICONS[name]) || Package;
}

/**
 * Componente que muestra el icono de una categoría dado su nombre.
 */
@Component({
  selector: 'app-category-icon',
  standalone: true,
  imports: [LucideAngularModule],
  template: `<lucide-angular [img]="icon()" class="size-full"></lucide-angular>`,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryIconDisplay {
  iconName = input<string | undefined>();
  icon = computed(() => iconFor(this.iconName()));
}

/**
 * Color (clases Tailwind) por id de categoría. Es detalle de presentación, por
 * eso vive en el front. Ids desconocidos caen a un gris neutro.
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

export function colorFor(id: string): string {
  return CATEGORY_COLORS[id] ?? 'bg-slate-100 text-slate-700';
}
