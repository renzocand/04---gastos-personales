import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { Store } from '@ngrx/store';
import { TranslocoModule } from '@jsverse/transloco';
import {
  LucideAngularModule,
  TrendingUp,
  TrendingDown,
  Calculator,
  Target,
  Trophy,
} from 'lucide-angular';
import { Card } from '../../../../shared/ui/card/card';
import {
  selectDailyAverage,
  selectMonthProjection,
  selectMonthOverMonthChange,
  selectTopExpense,
} from '../../store/dashboard.selectors';
import { exchangeRateFeature } from '../../../exchange-rate/store/exchange-rate.feature';

@Component({
  selector: 'app-quick-metrics',
  imports: [Card, LucideAngularModule, TranslocoModule, DecimalPipe],
  template: `
    <div class="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <!-- Promedio diario -->
      <ui-card>
        <div class="p-4">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-lg bg-blue-100 text-blue-600">
              <lucide-angular [img]="CalculatorIcon" class="size-5"></lucide-angular>
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-slate-500">{{ 'dashboard.metrics.dailyAvg' | transloco }}</p>
              <p class="text-lg font-bold text-slate-900">S/ {{ dailyAverage() | number:'1.2-2' }}</p>
            </div>
          </div>
        </div>
      </ui-card>

      <!-- Proyección mensual -->
      <ui-card>
        <div class="p-4">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-lg bg-violet-100 text-violet-600">
              <lucide-angular [img]="TargetIcon" class="size-5"></lucide-angular>
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-slate-500">{{ 'dashboard.metrics.projection' | transloco }}</p>
              <p class="text-lg font-bold text-slate-900">S/ {{ monthProjection() | number:'1.2-2' }}</p>
            </div>
          </div>
        </div>
      </ui-card>

      <!-- Comparación mes anterior -->
      <ui-card>
        <div class="p-4">
          <div class="flex items-center gap-3">
            <span
              class="flex size-10 items-center justify-center rounded-lg"
              [class]="monthChange() >= 0 ? 'bg-rose-100 text-rose-600' : 'bg-emerald-100 text-emerald-600'"
            >
              <lucide-angular [img]="monthChange() >= 0 ? TrendingUpIcon : TrendingDownIcon" class="size-5"></lucide-angular>
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-slate-500">{{ 'dashboard.metrics.vsLastMonth' | transloco }}</p>
              <p
                class="text-lg font-bold"
                [class]="monthChange() >= 0 ? 'text-rose-600' : 'text-emerald-600'"
              >
                {{ monthChange() >= 0 ? '+' : '' }}{{ monthChange() | number:'1.1-1' }}%
              </p>
            </div>
          </div>
        </div>
      </ui-card>

      <!-- Gasto más grande -->
      <ui-card>
        <div class="p-4">
          <div class="flex items-center gap-3">
            <span class="flex size-10 items-center justify-center rounded-lg bg-amber-100 text-amber-600">
              <lucide-angular [img]="TrophyIcon" class="size-5"></lucide-angular>
            </span>
            <div class="min-w-0 flex-1">
              <p class="text-xs text-slate-500">{{ 'dashboard.metrics.topExpense' | transloco }}</p>
              @if (topExpense(); as top) {
                <p class="truncate text-lg font-bold text-slate-900">
                  {{ topExpenseSymbol() }} {{ topExpenseAmount() | number:'1.2-2' }}
                </p>
                <p class="truncate text-xs text-slate-400">{{ top.description }}</p>
              } @else {
                <p class="text-sm text-slate-400">-</p>
              }
            </div>
          </div>
        </div>
      </ui-card>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class QuickMetrics {
  private readonly store = inject(Store);

  protected readonly CalculatorIcon = Calculator;
  protected readonly TargetIcon = Target;
  protected readonly TrendingUpIcon = TrendingUp;
  protected readonly TrendingDownIcon = TrendingDown;
  protected readonly TrophyIcon = Trophy;

  protected readonly dailyAverage = this.store.selectSignal(selectDailyAverage);
  protected readonly monthProjection = this.store.selectSignal(selectMonthProjection);
  protected readonly monthChange = this.store.selectSignal(selectMonthOverMonthChange);
  protected readonly topExpense = this.store.selectSignal(selectTopExpense);

  private readonly rate = this.store.selectSignal(exchangeRateFeature.selectRate);

  protected readonly topExpenseAmount = computed(() => {
    const top = this.topExpense();
    const rate = this.rate();
    if (!top || rate === null) return 0;
    return top.currency === 'USD' ? top.amount * rate : top.amount;
  });

  protected readonly topExpenseSymbol = computed(() => {
    const top = this.topExpense();
    return top?.currency === 'USD' ? 'US$' : 'S/';
  });
}
