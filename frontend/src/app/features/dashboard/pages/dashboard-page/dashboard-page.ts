import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { Receipt } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { format, Locale } from 'date-fns';
import { enUS, es } from 'date-fns/locale';
import { LanguageService } from '../../../../core/i18n/language.service';
import { Card } from '../../../../shared/ui/card/card';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { ErrorState } from '../../../../shared/ui/error-state/error-state';
import { Skeleton } from '../../../../shared/ui/skeleton/skeleton';
import { TotalCard } from '../../components/total-card/total-card';
import { BudgetCard } from '../../components/budget-card/budget-card';
import { BudgetTip } from '../../components/budget-tip/budget-tip';
import { SpendingTrendChart } from '../../components/spending-trend-chart/spending-trend-chart';
import { CategoryDonutChart } from '../../components/category-donut-chart/category-donut-chart';
import { MonthExpensesTable } from '../../components/month-expenses-table/month-expenses-table';
import { QuickMetrics } from '../../components/quick-metrics/quick-metrics';
import { AppCurrencyPipe } from '../../../../shared/pipes/app-currency';
import { Store } from '@ngrx/store';
import { selectExpensesSummary, selectHasExpenses } from '../../../expenses/store/expenses.selectors';
import { selectThisMonthExpenses } from '../../store/dashboard.selectors';
import { selectBudgetStatus } from '../../store/budget.selectors';
import { expensesFeature } from '../../../expenses/store/expenses.feature';
import { exchangeRateFeature } from '../../../exchange-rate/store/exchange-rate.feature';
import { ExpensesActions } from '../../../expenses/store/expenses.actions';
import { ExchangeRateActions } from '../../../exchange-rate/store/exchange-rate.actions';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    TotalCard,
    BudgetCard,
    BudgetTip,
    SpendingTrendChart,
    CategoryDonutChart,
    MonthExpensesTable,
    QuickMetrics,
    Card,
    EmptyState,
    ErrorState,
    Skeleton,
    RouterLink,
    AppCurrencyPipe,
    TranslocoModule,
  ],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  private store = inject(Store);
  private readonly lang = inject(LanguageService);

  protected readonly ReceiptIcon = Receipt;

  // Locale de date-fns por idioma activo (quechua cae a español).
  private readonly DATE_LOCALES: Record<string, Locale> = { es, en: enUS, qu: es };

  // Mes en curso capitalizado, ej. "Mayo 2026" / "May 2026". Reacciona al idioma.
  protected readonly monthLabel = computed(() => {
    const locale = this.DATE_LOCALES[this.lang.current()] ?? es;
    const raw = format(new Date(), 'LLLL yyyy', { locale });
    return raw.charAt(0).toUpperCase() + raw.slice(1);
  });

  protected readonly summary = this.store.selectSignal(selectExpensesSummary);
  protected readonly hasExpenses = this.store.selectSignal(selectHasExpenses);
  protected readonly budgetStatus = this.store.selectSignal(selectBudgetStatus);
  protected readonly monthExpenses = this.store.selectSignal(selectThisMonthExpenses);

  private readonly expensesLoading = this.store.selectSignal(expensesFeature.selectLoading);
  private readonly exchangeRateLoading = this.store.selectSignal(exchangeRateFeature.selectLoading);
  protected readonly loading = computed(() => this.expensesLoading() || this.exchangeRateLoading());

  private readonly expensesError = this.store.selectSignal(expensesFeature.selectError);
  private readonly exchangeRateError = this.store.selectSignal(exchangeRateFeature.selectError);
  protected readonly error = computed(() => this.expensesError() ?? this.exchangeRateError());

  /** Categoría seleccionada en el donut chart */
  protected selectedCategoryId = signal<string | null>(null);

  ngOnInit(): void {
    this.store.dispatch(ExpensesActions.filtersCleared());
    this.store.dispatch(ExpensesActions.load());
    this.store.dispatch(ExchangeRateActions.load());
  }

  protected onCategoryClick(categoryId: string | null): void {
    this.selectedCategoryId.set(categoryId);
  }

  protected clearCategoryFilter(): void {
    this.selectedCategoryId.set(null);
  }
}
