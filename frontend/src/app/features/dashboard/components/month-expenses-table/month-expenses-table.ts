import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  output,
  signal,
} from '@angular/core';
import { RouterLink } from '@angular/router';
import { ScrollingModule } from '@angular/cdk/scrolling';
import { Store } from '@ngrx/store';
import { ArrowUpDown, X, LucideAngularModule } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../../../shared/ui/card/card';
import { CdnIcon } from '../../../../shared/ui/cdn-icon/cdn-icon';
import { AppCurrencyPipe } from '../../../../shared/pipes/app-currency';
import { Expense } from '../../../expenses/models/expense';
import { categoryFeature } from '../../../categories/store/category.feature';
import { getColorHex } from '../../../categories/ui/category-display';
import { parseISO, getDate } from 'date-fns';

export type SortField = 'date' | 'amount';
export type SortDirection = 'asc' | 'desc';

@Component({
  selector: 'app-month-expenses-table',
  standalone: true,
  imports: [
    Card,
    RouterLink,
    ScrollingModule,
    LucideAngularModule,
    TranslocoModule,
    CdnIcon,
    AppCurrencyPipe,
  ],
  template: `
    <ui-card class="flex h-full flex-col overflow-hidden">
      <!-- Header -->
      <div class="flex items-center justify-between border-b border-slate-100 p-4 sm:p-5">
        <div>
          <h2 class="text-sm font-semibold uppercase tracking-wide text-slate-500">
            Gastos del mes
          </h2>
          <p class="mt-0.5 text-xs text-slate-400">
            @if (selectedCategoryId()) {
              Filtrado por: {{ selectedCategoryName() }}
            } @else {
              {{ filteredExpenses().length }} gastos
            }
          </p>
        </div>
        @if (selectedCategoryId()) {
          <button
            type="button"
            (click)="onClearFilter()"
            class="inline-flex items-center gap-1 rounded-lg bg-slate-100 px-2 py-1 text-xs font-medium text-slate-600 transition hover:bg-slate-200"
          >
            <lucide-angular [img]="XIcon" class="size-3" />
            Limpiar filtro
          </button>
        }
      </div>

      <!-- Sort controls -->
      <div class="flex gap-2 border-b border-slate-100 px-4 py-2 sm:px-5">
        <button
          type="button"
          (click)="toggleSort('date')"
          class="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition"
          [class.bg-violet-100]="sortField() === 'date'"
          [class.text-violet-700]="sortField() === 'date'"
          [class.text-slate-500]="sortField() !== 'date'"
          [class.hover:bg-slate-100]="sortField() !== 'date'"
        >
          <lucide-angular [img]="SortIcon" class="size-3" />
          Fecha
          @if (sortField() === 'date') {
            <span>{{ sortDirection() === 'desc' ? '↓' : '↑' }}</span>
          }
        </button>
        <button
          type="button"
          (click)="toggleSort('amount')"
          class="inline-flex items-center gap-1 rounded px-2 py-1 text-xs font-medium transition"
          [class.bg-violet-100]="sortField() === 'amount'"
          [class.text-violet-700]="sortField() === 'amount'"
          [class.text-slate-500]="sortField() !== 'amount'"
          [class.hover:bg-slate-100]="sortField() !== 'amount'"
        >
          <lucide-angular [img]="SortIcon" class="size-3" />
          Monto
          @if (sortField() === 'amount') {
            <span>{{ sortDirection() === 'desc' ? '↓' : '↑' }}</span>
          }
        </button>
      </div>

      <!-- Virtual scroll list -->
      <cdk-virtual-scroll-viewport
        itemSize="64"
        class="flex-1"
        style="height: 400px;"
      >
        <a
          *cdkVirtualFor="let expense of sortedExpenses(); trackBy: trackById"
          [routerLink]="['/expenses', expense.id, 'edit']"
          class="flex items-center gap-3 border-b border-slate-50 px-4 py-3 transition hover:bg-slate-50 sm:px-5"
        >
          <!-- Category icon -->
          <div
            class="flex size-9 shrink-0 items-center justify-center rounded-lg"
            [style.background-color]="getCategoryColor(expense.categoryId) + '20'"
            [style.color]="getCategoryColor(expense.categoryId)"
          >
            <app-cdn-icon [name]="getCategoryIcon(expense.categoryId)" class="size-5" />
          </div>

          <!-- Description & Category -->
          <div class="min-w-0 flex-1">
            <p class="truncate text-sm font-medium text-slate-900">
              {{ expense.description || 'Sin descripción' }}
            </p>
            <p class="text-xs text-slate-500">
              {{ getCategoryName(expense.categoryId) }}
            </p>
          </div>

          <!-- Amount -->
          <div class="text-right">
            <p class="text-sm font-semibold text-slate-900">
              {{ expense.amount | appCurrency:expense.currency }}
            </p>
            <p class="text-xs text-slate-400">
              Día {{ getDay(expense.date) }}
            </p>
          </div>
        </a>
      </cdk-virtual-scroll-viewport>

      @if (sortedExpenses().length === 0) {
        <div class="px-5 py-12 text-center text-sm text-slate-500">
          No hay gastos en esta categoría
        </div>
      }
    </ui-card>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MonthExpensesTable {
  /** Todos los gastos del mes */
  expenses = input.required<Expense[]>();
  /** ID de categoría seleccionada (desde el donut) */
  selectedCategoryId = input<string | null>(null);
  /** Evento para limpiar el filtro */
  clearFilter = output<void>();

  protected onClearFilter(): void {
    this.clearFilter.emit();
  }

  private readonly store = inject(Store);
  private readonly categories = this.store.selectSignal(categoryFeature.selectCategories);

  protected readonly SortIcon = ArrowUpDown;
  protected readonly XIcon = X;

  protected sortField = signal<SortField>('date');
  protected sortDirection = signal<SortDirection>('desc');

  /** Nombre de la categoría seleccionada */
  protected selectedCategoryName = computed(() => {
    const catId = this.selectedCategoryId();
    if (!catId) return '';
    const cat = this.categories().find(c => c.id === catId);
    return cat?.name || '';
  });

  /** Gastos filtrados por categoría */
  protected filteredExpenses = computed(() => {
    const catId = this.selectedCategoryId();
    const expenses = this.expenses();
    if (!catId) return expenses;
    return expenses.filter(e => e.categoryId === catId);
  });

  /** Gastos ordenados */
  protected sortedExpenses = computed(() => {
    const expenses = [...this.filteredExpenses()];
    const field = this.sortField();
    const direction = this.sortDirection();

    expenses.sort((a, b) => {
      let comparison = 0;
      if (field === 'date') {
        comparison = a.date.localeCompare(b.date);
      } else {
        comparison = a.amount - b.amount;
      }
      return direction === 'desc' ? -comparison : comparison;
    });

    return expenses;
  });

  protected toggleSort(field: SortField): void {
    if (this.sortField() === field) {
      this.sortDirection.set(this.sortDirection() === 'desc' ? 'asc' : 'desc');
    } else {
      this.sortField.set(field);
      this.sortDirection.set('desc');
    }
  }

  protected getCategoryName(categoryId: string): string {
    const cat = this.categories().find(c => c.id === categoryId);
    return cat?.name || 'Sin categoría';
  }

  protected getCategoryIcon(categoryId: string): string {
    const cat = this.categories().find(c => c.id === categoryId);
    return cat?.icon || 'Package';
  }

  protected getCategoryColor(categoryId: string): string {
    const cat = this.categories().find(c => c.id === categoryId);
    return getColorHex(cat?.color);
  }

  protected getDay(dateStr: string): number {
    return getDate(parseISO(dateStr));
  }

  protected trackById(_: number, expense: Expense): string {
    return expense.id;
  }
}
