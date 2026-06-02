import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { concatLatestFrom } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { TranslocoService } from '@jsverse/transloco';
import { isThisMonth, parseISO } from 'date-fns';
import { tap } from 'rxjs';
import { ExpensesActions } from '../../expenses/store/expenses.actions';
import { exchangeRateFeature } from '../../exchange-rate/store/exchange-rate.feature';
import { selectMonthSpendingPEN } from '../../dashboard/store/budget.selectors';
import { tierFor, toPen } from '../../dashboard/store/budget';
import { settingsFeature } from './settings.feature';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { ToastVariant } from '../../../shared/ui/toast/toast';

/** Clave i18n y estilo del toast por escalón de alerta (1=50%, 2=80%, 3=100%). */
const ALERTS: Record<number, { key: string; variant: ToastVariant }> = {
  1: { key: 'alerts.tier1', variant: 'info' },
  2: { key: 'alerts.tier2', variant: 'error' },
  3: { key: 'alerts.tier3', variant: 'error' },
};

/**
 * Tras registrar un gasto, avisa con un toast si ese gasto hizo CRUZAR hacia un
 * nuevo escalón (50/80/100%) del ingreso del mes. Solo el cruce dispara el aviso,
 * así no se repite en cada gasto una vez superado el umbral.
 */
@Injectable()
export class AlertsEffects {
  private actions$ = inject(Actions);
  private store = inject(Store);
  private toast = inject(ToastService);
  private transloco = inject(TranslocoService);

  notifyThreshold$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ExpensesActions.addSuccess),
        concatLatestFrom(() => [
          this.store.select(settingsFeature.selectSettings),
          this.store.select(exchangeRateFeature.selectRate),
          this.store.select(selectMonthSpendingPEN),
        ]),
        tap(([{ expense }, settings, rate, spentPEN]) => {
          const income = settings.monthlyIncome;
          if (!settings.alertsEnabled || income == null || income <= 0) return;
          // Solo cuentan los gastos del mes en curso.
          if (!isThisMonth(parseISO(expense.date))) return;

          const addedPEN = toPen(expense, rate ?? 0);
          const prevTier = tierFor(((spentPEN - addedPEN) / income) * 100);
          const nowTier = tierFor((spentPEN / income) * 100);
          if (nowTier <= prevTier) return; // no cruzó hacia un nivel mayor

          const alert = ALERTS[nowTier];
          if (alert) this.toast.show(this.transloco.translate(alert.key), alert.variant);
        }),
      ),
    { dispatch: false },
  );
}
