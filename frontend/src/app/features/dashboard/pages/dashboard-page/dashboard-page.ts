import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Receipt } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { Card } from '../../../../shared/ui/card/card';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { ErrorState } from '../../../../shared/ui/error-state/error-state';
import { Skeleton } from '../../../../shared/ui/skeleton/skeleton';
import { CategoryBreakdown } from '../../components/category-breakdown/category-breakdown';
import { RecentExpenses } from '../../components/recent-expenses/recent-expenses';
import { TotalCard } from '../../components/total-card/total-card';
import { AppCurrencyPipe } from '../../../../shared/pipes/app-currency';
import { Store } from '@ngrx/store';
import { selectExpensesSummary, selectHasExpenses } from '../../../expenses/store/expenses.selectors';
import { selectCategoryBreakdown, selectRecentExpenses } from '../../store/dashboard.selectors';
import { expensesFeature } from '../../../expenses/store/expenses.feature';
import { exchangeRateFeature } from '../../../exchange-rate/store/exchange-rate.feature';
import { ExpensesActions } from '../../../expenses/store/expenses.actions';
import { ExchangeRateActions } from '../../../exchange-rate/store/exchange-rate.actions';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    TotalCard,
    CategoryBreakdown,
    RecentExpenses,
    Card,
    EmptyState,
    ErrorState,
    Skeleton,
    RouterLink,
    AppCurrencyPipe,
  ],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {


  private store = inject(Store);

  protected readonly ReceiptIcon = Receipt;

  protected readonly summary = this.store.selectSignal(selectExpensesSummary);
  protected readonly hasExpenses = this.store.selectSignal(selectHasExpenses);
  protected readonly categoryBreakdown = this.store.selectSignal(selectCategoryBreakdown);
  protected readonly recentExpenses = this.store.selectSignal(selectRecentExpenses);

  private readonly expensesLoading = this.store.selectSignal(expensesFeature.selectLoading);
  private readonly exchangeRateLoading = this.store.selectSignal(exchangeRateFeature.selectLoading);
  protected readonly loading = computed(()=>this.expensesLoading() ||this.exchangeRateLoading() );

  private readonly expensesError = this.store.selectSignal(expensesFeature.selectError);
  private readonly exchangeRateError = this.store.selectSignal(exchangeRateFeature.selectError);
  protected readonly error = computed(()=> this.expensesError() ?? this.exchangeRateError());


  ngOnInit(): void {
    this.store.dispatch(ExpensesActions.filtersCleared());
    this.store.dispatch(ExpensesActions.load());
    this.store.dispatch(ExchangeRateActions.load());
  }

}
