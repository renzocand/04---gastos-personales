import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import {  LucideAngularModule} from 'lucide-angular';
import { Expense } from '../../models/expense';
import { CATEGORIES } from '../../../categories/models/category';
import { CATEGORY_META } from '../../../categories/ui/category-meta';



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
