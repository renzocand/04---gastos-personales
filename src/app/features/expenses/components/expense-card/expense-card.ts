import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {
  Bus,
  Gamepad2,
  LucideAngularModule,
  Package,
  UtensilsCrossed,
} from 'lucide-angular';
import { Expense } from '../../models/expense';
import { CATEGORIES, CategoryId } from '../../../categories/models/category';

const CATEGORY_META: Record<CategoryId, { icon: typeof UtensilsCrossed; iconClass: string }> = {
  food:      { icon: UtensilsCrossed, iconClass: 'bg-violet-100 text-violet-700' },
  transport: { icon: Bus,             iconClass: 'bg-indigo-100 text-indigo-700' },
  leisure:   { icon: Gamepad2,        iconClass: 'bg-amber-100 text-amber-700' },
  other:     { icon: Package,         iconClass: 'bg-rose-100 text-rose-700' },
};

@Component({
  selector: 'app-expense-card',
  imports: [LucideAngularModule],
  templateUrl: './expense-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCard {
  expense = input.required<Expense>();

  protected readonly category = computed(() => CATEGORIES[this.expense().categoryId]);
  protected readonly meta = computed(() => CATEGORY_META[this.expense().categoryId]);
  protected readonly formattedAmount = computed(() => {
    const e = this.expense();
    const symbol = e.currency === 'PEN' ? 'S/' : 'US$';
    const n = new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(e.amount);
    return `${symbol} ${n}`;
  });
}
