import { TestBed } from '@angular/core/testing';
import { provideMockActions } from '@ngrx/effects/testing';
import { MockStore, provideMockStore } from '@ngrx/store/testing';
import { TranslocoService } from '@jsverse/transloco';
import { Subject } from 'rxjs';
import { selectMonthSpendingPEN } from '../../dashboard/store/budget.selectors';
import { exchangeRateFeature } from '../../exchange-rate/store/exchange-rate.feature';
import { Expense } from '../../expenses/models/expense';
import { ExpensesActions } from '../../expenses/store/expenses.actions';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { UserSettings } from '../models/settings';
import { AlertsEffects } from './alerts.effects';
import { settingsFeature } from './settings.feature';

/**
 * TC-08 / PA-14: tras registrar un gasto, avisa solo cuando ese gasto CRUZA
 * hacia un nuevo escalón (50/80/100%). Así no se repite el aviso en cada gasto.
 */
describe('TC-08 / PA-14: AlertsEffects', () => {
  let actions$: Subject<unknown>;
  let effects: AlertsEffects;
  let store: MockStore;
  let toast: { show: ReturnType<typeof vi.fn> };

  function settings(monthlyIncome: number | null, alertsEnabled = true): UserSettings {
    return { monthlyIncome, alertsEnabled, highContrast: false, fontScale: 'normal', reduceMotion: false };
  }

  function thisMonth(): string {
    const now = new Date();
    return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}-15`;
  }

  function expense(amount: number, date: string): Expense {
    return { id: 'e', amount, currency: 'PEN', description: 'x', categoryId: 'food', date };
  }

  /** Estado tras agregar el gasto: ingreso, tasa y gasto acumulado del mes. */
  function arrange(income: number | null, rate: number | null, spentPEN: number, alertsEnabled = true) {
    store.overrideSelector(settingsFeature.selectSettings, settings(income, alertsEnabled));
    store.overrideSelector(exchangeRateFeature.selectRate, rate);
    store.overrideSelector(selectMonthSpendingPEN, spentPEN);
    store.refreshState();
  }

  beforeEach(() => {
    actions$ = new Subject();
    toast = { show: vi.fn() };
    TestBed.configureTestingModule({
      providers: [
        AlertsEffects,
        provideMockActions(() => actions$),
        provideMockStore(),
        { provide: ToastService, useValue: toast },
        { provide: TranslocoService, useValue: { translate: (key: string) => key } },
      ],
    });
    store = TestBed.inject(MockStore);
    effects = TestBed.inject(AlertsEffects);
  });

  it('avisa al cruzar hacia un escalón mayor (75% → 85%)', () => {
    arrange(1000, 1, 850); // gasto de 100 lleva de 750 (tier1) a 850 (tier2)
    effects.notifyThreshold$.subscribe();

    actions$.next(ExpensesActions.addSuccess({ expense: expense(100, thisMonth()) }));

    expect(toast.show).toHaveBeenCalledWith('alerts.tier2', 'error');
  });

  it('no avisa si no hubo cruce de escalón (84% → 85%, mismo tier)', () => {
    arrange(1000, 1, 850);
    effects.notifyThreshold$.subscribe();

    actions$.next(ExpensesActions.addSuccess({ expense: expense(10, thisMonth()) }));

    expect(toast.show).not.toHaveBeenCalled();
  });

  it('no avisa si las alertas están desactivadas', () => {
    arrange(1000, 1, 850, false);
    effects.notifyThreshold$.subscribe();

    actions$.next(ExpensesActions.addSuccess({ expense: expense(100, thisMonth()) }));

    expect(toast.show).not.toHaveBeenCalled();
  });

  it('no avisa para gastos fuera del mes en curso', () => {
    arrange(1000, 1, 850);
    effects.notifyThreshold$.subscribe();

    actions$.next(ExpensesActions.addSuccess({ expense: expense(100, '2000-01-01') }));

    expect(toast.show).not.toHaveBeenCalled();
  });
});
