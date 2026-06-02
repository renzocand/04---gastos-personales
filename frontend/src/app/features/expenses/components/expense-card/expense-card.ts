import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Store } from '@ngrx/store';
import { Expense } from '../../models/expense';
import { Category } from '../../../categories/models/category';
import { selectCategoryEntities } from '../../../categories/store/category.selectors';
import { colorFor, iconFor } from '../../../categories/ui/category-display';

@Component({
  selector: 'app-expense-card',
  imports: [LucideAngularModule],
  templateUrl: './expense-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseCard {
  expense = input.required<Expense>();

  private readonly store = inject(Store);
  private readonly entities = this.store.selectSignal(selectCategoryEntities);

  protected readonly category = computed<Category | undefined>(
    () => this.entities()[this.expense().categoryId],
  );
  protected readonly meta = computed(() => ({
    icon: iconFor(this.category()?.icon),
    iconClass: colorFor(this.expense().categoryId),
  }));
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
