import { ChangeDetectionStrategy, Component, inject, OnInit, Signal, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Bus,
  Gamepad2,
  LucideAngularModule,
  Package,
  Receipt,
  SlidersHorizontal,
  UtensilsCrossed,
} from 'lucide-angular';
import { Card } from '../../../../shared/ui/card/card';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { ErrorState } from '../../../../shared/ui/error-state/error-state';
import { Skeleton } from '../../../../shared/ui/skeleton/skeleton';
import { ExpenseCard } from '../../components/expense-card/expense-card';
import { Store } from '@ngrx/store';
import { expensesFeature, ExpensesState } from '../../store/expenses.feature';
import { ExpensesActions } from '../../store/expenses.actions';
import { toSignal } from '@angular/core/rxjs-interop';
import { ExpenseDayGroup, selectExpensesGroupedByDay } from '../../store/expenses.selectors';

type CategoryFilter = {
  id: 'all' | 'comida' | 'transporte' | 'ocio' | 'otro';
  label: string;
  icon?: typeof UtensilsCrossed;
  default?: boolean;
};

type CurrencyFilter = {
  id: 'all' | 'PEN' | 'USD';
  label: string;
  default?: boolean;
};

type ExpenseItem = {
  id: string;
  description: string;
  category: 'Comida' | 'Transporte' | 'Ocio' | 'Otro';
  amount: string;
  date: string;
};

type ExpenseGroup = {
  label: string;
  count: number;
  items: ExpenseItem[];
};

@Component({
  selector: 'app-expenses-list',
  imports: [
    Card,
    ExpenseCard,
    EmptyState,
    ErrorState,
    Skeleton,
    RouterLink,
    LucideAngularModule,
  ],
  templateUrl: './expenses-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesList implements OnInit{


  private store:Store<ExpensesState> = inject(Store);

  protected readonly FilterIcon = SlidersHorizontal;
  protected readonly ReceiptIcon = Receipt;

  protected readonly expenses = toSignal(this.store.select(expensesFeature.selectExpenses), {requireSync:true})
  protected readonly loading = toSignal(this.store.select(expensesFeature.selectLoading), {requireSync:true});
  protected readonly error = toSignal(this.store.select(expensesFeature.selectError), {requireSync:true});
  protected readonly hasExpenses = signal(true);


  protected readonly categoryFilters: CategoryFilter[] = [
    { id: 'all', label: 'Todas', default: true },
    { id: 'comida', label: 'Comida', icon: UtensilsCrossed },
    { id: 'transporte', label: 'Transporte', icon: Bus },
    { id: 'ocio', label: 'Ocio', icon: Gamepad2 },
    { id: 'otro', label: 'Otro', icon: Package },
  ];

  protected readonly currencyFilters: CurrencyFilter[] = [
    { id: 'all', label: 'Todas', default: true },
    { id: 'PEN', label: 'S/ Soles' },
    { id: 'USD', label: 'US$ Dólares' },
  ];

  protected readonly groups = toSignal(this.store.select(selectExpensesGroupedByDay), {requireSync:true})
// ExpenseDayGroup[]
  ngOnInit(): void {
    this.store.dispatch(ExpensesActions.load())
  }
}
