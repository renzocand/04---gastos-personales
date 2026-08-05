import { createSelector } from "@ngrx/store";
import { expensesFeature } from "../../expenses/store/expenses.feature";
import { exchangeRateFeature } from "../../exchange-rate/store/exchange-rate.feature";
import { categoryFeature } from "../../categories/store/category.feature";
import { Expense } from "../../expenses/models/expense";
import { parseISO, isThisMonth, format, getDaysInMonth, getDate, subMonths, isSameMonth } from "date-fns";


function toPen(expense:Expense, rate:number):number{
  return expense.currency === 'USD'? expense.amount*rate : expense.amount;
}

export type BreakdownRow = {
  id: string;
  label: string;
  icon?: string;
  totalPEN: number;
  percent: number;
  colorIndex: number;
};


export const selectCategoryBreakdown = createSelector(
  expensesFeature.selectExpenses,
  exchangeRateFeature.selectRate,
  categoryFeature.selectCategories,
  (expenses, rate, categories) => {

    if (rate === null) return [];

    const totalsByCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
      const key = expense.categoryId;
      acc[key] = (acc[key] ?? 0) + toPen(expense, rate)
      return acc;
    }, {})

    const totalGlobal = Object.values(totalsByCategory).reduce((acc,k)=> acc + k ,0)

    return categories.map<BreakdownRow>((cat, index) => ({
        id: cat.id,
        label: cat.name,
        icon: cat.icon,
        totalPEN: totalsByCategory[cat.id]??0,
        percent: totalGlobal>0?  (totalsByCategory[cat.id]??0) /totalGlobal*100 :0,
        colorIndex: index,
    }))

  }
)

export const selectRecentExpenses = createSelector(
  expensesFeature.selectExpenses,
  (expenses) => [...expenses].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5)
)

// ─────────────────────────────────────────────────────────────
// Selectores para métricas y gráficos del dashboard
// ─────────────────────────────────────────────────────────────

/** Gastos del mes actual filtrados */
const selectThisMonthExpenses = createSelector(
  expensesFeature.selectExpenses,
  (expenses) => expenses.filter(e => isThisMonth(parseISO(e.date)))
);

/** Gastos del mes anterior */
const selectLastMonthExpenses = createSelector(
  expensesFeature.selectExpenses,
  (expenses) => {
    const lastMonth = subMonths(new Date(), 1);
    return expenses.filter(e => isSameMonth(parseISO(e.date), lastMonth));
  }
);

/** Total del mes actual en PEN */
export const selectThisMonthTotalPEN = createSelector(
  selectThisMonthExpenses,
  exchangeRateFeature.selectRate,
  (expenses, rate) => {
    if (rate === null) return 0;
    return expenses.reduce((sum, e) => sum + toPen(e, rate), 0);
  }
);

/** Total del mes anterior en PEN */
export const selectLastMonthTotalPEN = createSelector(
  selectLastMonthExpenses,
  exchangeRateFeature.selectRate,
  (expenses, rate) => {
    if (rate === null) return 0;
    return expenses.reduce((sum, e) => sum + toPen(e, rate), 0);
  }
);

/** Comparación con mes anterior (% de cambio) */
export const selectMonthOverMonthChange = createSelector(
  selectThisMonthTotalPEN,
  selectLastMonthTotalPEN,
  (thisMonth, lastMonth) => {
    if (lastMonth === 0) return thisMonth > 0 ? 100 : 0;
    return ((thisMonth - lastMonth) / lastMonth) * 100;
  }
);

/** Promedio diario de gasto (solo días transcurridos del mes) */
export const selectDailyAverage = createSelector(
  selectThisMonthTotalPEN,
  (total) => {
    const today = new Date();
    const dayOfMonth = getDate(today);
    return dayOfMonth > 0 ? total / dayOfMonth : 0;
  }
);

/** Proyección a fin de mes basada en promedio diario */
export const selectMonthProjection = createSelector(
  selectDailyAverage,
  (dailyAvg) => {
    const daysInMonth = getDaysInMonth(new Date());
    return dailyAvg * daysInMonth;
  }
);

/** Gasto más grande del mes */
export const selectTopExpense = createSelector(
  selectThisMonthExpenses,
  exchangeRateFeature.selectRate,
  (expenses, rate) => {
    if (rate === null || expenses.length === 0) return null;
    return expenses.reduce((top, e) => {
      const amount = toPen(e, rate);
      const topAmount = top ? toPen(top, rate) : 0;
      return amount > topAmount ? e : top;
    }, null as Expense | null);
  }
);

/** Datos para gráfico de tendencia diaria (gastos por día del mes) */
export type DailySpending = { day: number; label: string; amount: number };

export const selectDailySpendingTrend = createSelector(
  selectThisMonthExpenses,
  exchangeRateFeature.selectRate,
  (expenses, rate) => {
    if (rate === null) return [];

    const today = new Date();
    const daysInMonth = getDaysInMonth(today);
    const currentDay = getDate(today);

    // Inicializar todos los días del mes hasta hoy
    const dailyTotals: Record<number, number> = {};
    for (let d = 1; d <= currentDay; d++) {
      dailyTotals[d] = 0;
    }

    // Sumar gastos por día
    for (const e of expenses) {
      const day = getDate(parseISO(e.date));
      if (day <= currentDay) {
        dailyTotals[day] = (dailyTotals[day] ?? 0) + toPen(e, rate);
      }
    }

    // Convertir a array para el gráfico
    return Object.entries(dailyTotals).map(([day, amount]) => ({
      day: parseInt(day),
      label: day.toString(),
      amount,
    }));
  }
);

/** Datos para gráfico de dona (categorías con color) */
export type CategoryChartData = {
  labels: string[];
  data: number[];
  colors: string[];
};

// Array de colores para categorías (se cicla si hay más categorías que colores)
// Misma paleta que las barras de progreso y los iconos
const CATEGORY_COLOR_PALETTE = [
  '#8b5cf6', // violet
  '#6366f1', // indigo
  '#10b981', // emerald
  '#f59e0b', // amber
  '#f43f5e', // rose
];

export const selectCategoryChartData = createSelector(
  selectCategoryBreakdown,
  (breakdown) => {
    const filtered = breakdown.filter(r => r.totalPEN > 0);
    return {
      labels: filtered.map(r => r.label),
      data: filtered.map(r => r.totalPEN),
      colors: filtered.map(r => CATEGORY_COLOR_PALETTE[r.colorIndex % CATEGORY_COLOR_PALETTE.length]),
    };
  }
);
