import { ChangeDetectionStrategy, Component, computed, inject, OnInit, Signal, signal } from '@angular/core';
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
import { ExpenseDayGroup, selectExpensesGroupedByDay, selectExpensesSummary, selectFilters, selectHasExpenses } from '../../store/expenses.selectors';
import { CATEGORY_OPTIONS } from '../../../categories/ui/category-meta';
import { AppCurrencyPipe } from '../../../../shared/pipes/app-currency';
import { Currency } from '../../models/expense';


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
    AppCurrencyPipe,
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
  // protected readonly hasExpenses = signal(true);
  protected readonly hasExpenses = toSignal(this.store.select(selectHasExpenses), {requireSync:true});

  protected readonly summary = this.store.selectSignal(selectExpensesSummary);

  protected readonly filters = this.store.selectSignal(selectFilters);

  // protected readonly hasExpenses2 = computed(()=>this.expenses().length?true:false);

  protected readonly categoryFilters = [
    { id: null, name: 'Todas', icon:null, iconClass:null },
    ...CATEGORY_OPTIONS
  ];

  // protected readonly categoryFilters = CATEGORY_OPTIONS

  protected readonly currencyFilters = [
    { id: null, label: 'Todas', default: true },
    { id: 'PEN', label: 'S/ Soles' },
    { id: 'USD', label: 'US$ Dólares' },
  ] as const;

  protected readonly groups = toSignal(this.store.select(selectExpensesGroupedByDay), {requireSync:true})
// ExpenseDayGroup[]
  ngOnInit(): void {
    this.store.dispatch(ExpensesActions.load())
  }
  protected onCategoryChange(categoryId:string | null){
    this.store.dispatch(ExpensesActions.categoryFilterChanged({categoryId}));
  }

  protected onCurrencyChange(currency:Currency | null){
    this.store.dispatch(ExpensesActions.currencyFilterChanged({currency}))
  }

  protected onDateFromChange(value: string) {
    this.store.dispatch(ExpensesActions.dateFromChanged({ dateFrom: value || null }));
  }

  protected onDateToChange(value: string) {
    this.store.dispatch(ExpensesActions.dateToChanged({ dateTo: value || null }));
  }

  protected clearFilters(){
    this.store.dispatch(ExpensesActions.filtersCleared());
  }
}
