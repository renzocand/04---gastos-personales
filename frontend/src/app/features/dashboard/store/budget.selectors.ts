import { createSelector } from '@ngrx/store';
import { isThisMonth, parseISO } from 'date-fns';
import { expensesFeature } from '../../expenses/store/expenses.feature';
import { exchangeRateFeature } from '../../exchange-rate/store/exchange-rate.feature';
import { settingsFeature } from '../../settings/store/settings.feature';
import { BudgetStatus, levelFor, toPen } from './budget';

/** Gasto del mes en curso, normalizado a PEN. */
export const selectMonthSpendingPEN = createSelector(
  expensesFeature.selectExpenses,
  exchangeRateFeature.selectRate,
  (expenses, rate) => {
    const r = rate ?? 0; // sin tipo de cambio aún, los USD se suman al cargar la tasa
    return expenses
      .filter((e) => isThisMonth(parseISO(e.date)))
      .reduce((sum, e) => sum + toPen(e, r), 0);
  },
);

/** Estado del presupuesto: ingreso vs. gasto del mes, % y nivel de alerta. */
export const selectBudgetStatus = createSelector(
  settingsFeature.selectSettings,
  selectMonthSpendingPEN,
  (settings, spentPEN): BudgetStatus => {
    const income = settings.monthlyIncome;
    if (income == null || income <= 0) {
      return { income: null, spentPEN, remaining: 0, percent: 0, level: 'ok' };
    }
    const percent = (spentPEN / income) * 100;
    return {
      income,
      spentPEN,
      remaining: income - spentPEN,
      percent,
      level: levelFor(percent),
    };
  },
);
