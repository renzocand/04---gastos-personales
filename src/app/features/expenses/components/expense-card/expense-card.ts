import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  Bus,
  Gamepad2,
  LucideAngularModule,
  Package,
  UtensilsCrossed,
} from 'lucide-angular';

export type ExpenseCategory = 'Comida' | 'Transporte' | 'Ocio' | 'Otro';

const CATEGORY_META: Record<
  ExpenseCategory,
  { icon: typeof UtensilsCrossed; iconClass: string }
> = {
  Comida: { icon: UtensilsCrossed, iconClass: 'bg-violet-100 text-violet-700' },
  Transporte: { icon: Bus, iconClass: 'bg-indigo-100 text-indigo-700' },
  Ocio: { icon: Gamepad2, iconClass: 'bg-amber-100 text-amber-700' },
  Otro: { icon: Package, iconClass: 'bg-rose-100 text-rose-700' },
};

@Component({
  selector: 'app-expense-card',
  imports: [LucideAngularModule],
  templateUrl: './expense-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCard {
  description = input.required<string>();
  category = input.required<ExpenseCategory>();
  amount = input.required<string>();
  date = input.required<string>();

  protected readonly meta = computed(() => CATEGORY_META[this.category()]);
}
