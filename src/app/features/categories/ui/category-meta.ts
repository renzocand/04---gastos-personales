import {
  Bus,
  Gamepad2,
  Package,
  UtensilsCrossed,
} from 'lucide-angular';
import { CATEGORIES, CategoryId } from '../models/category';


export const CATEGORY_META: Record<CategoryId, { icon: typeof UtensilsCrossed; iconClass: string }> = {
  food:      { icon: UtensilsCrossed, iconClass: 'bg-violet-100 text-violet-700' },
  transport: { icon: Bus,             iconClass: 'bg-indigo-100 text-indigo-700' },
  leisure:   { icon: Gamepad2,        iconClass: 'bg-amber-100 text-amber-700' },
  other:     { icon: Package,         iconClass: 'bg-rose-100 text-rose-700' },
};

export const CATEGORY_OPTIONS = Object.values(CATEGORIES).map((cat) => ({
  ...cat,
  ...CATEGORY_META[cat.id],
}));
