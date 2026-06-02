import {
  Bus,
  Gamepad2,
  GraduationCap,
  HeartPulse,
  Home,
  Package,
  ShoppingBag,
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
  Bus,
  Home,
  Zap,
  HeartPulse,
  GraduationCap,
  Gamepad2,
  ShoppingBag,
  Package,
};

export function iconFor(name?: string): LucideIcon {
  return (name && CATEGORY_ICONS[name]) || Package;
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
  other: 'bg-slate-100 text-slate-700',
};

export function colorFor(id: string): string {
  return CATEGORY_COLORS[id] ?? 'bg-slate-100 text-slate-700';
}
