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

/** Datos para gráfico de tendencia diaria apilado por categoría */
export type StackedTrendDataset = {
  label: string;
  data: number[];
  backgroundColor: string;
};

export type StackedTrendData = {
  labels: string[];
  datasets: StackedTrendDataset[];
};

export const selectDailySpendingByCategory = createSelector(
  selectThisMonthExpenses,
  exchangeRateFeature.selectRate,
  categoryFeature.selectCategories,
  (expenses, rate, categories) => {
    if (rate === null) return { labels: [], datasets: [] };

    const today = new Date();
    const currentDay = getDate(today);

    // Crear labels para los días
    const labels = Array.from({ length: currentDay }, (_, i) => (i + 1).toString());

    // Calcular totales por categoría para determinar las top 5
    const totalsByCategory: Record<string, number> = {};
    for (const e of expenses) {
      totalsByCategory[e.categoryId] = (totalsByCategory[e.categoryId] ?? 0) + toPen(e, rate);
    }

    // Ordenar categorías por gasto total y tomar las top 5
    const sortedCategories = categories
      .filter(cat => (totalsByCategory[cat.id] ?? 0) > 0)
      .sort((a, b) => (totalsByCategory[b.id] ?? 0) - (totalsByCategory[a.id] ?? 0));

    const topCategories = sortedCategories.slice(0, MAX_CATEGORIES);
    const topCategoryIds = new Set(topCategories.map(c => c.id));
    const hasOthers = sortedCategories.length > MAX_CATEGORIES;

    // Inicializar datos por día para cada categoría
    const dailyByCategory: Record<string, number[]> = {};
    for (const cat of topCategories) {
      dailyByCategory[cat.id] = Array(currentDay).fill(0);
    }
    if (hasOthers) {
      dailyByCategory['__others__'] = Array(currentDay).fill(0);
    }

    // Distribuir gastos por día y categoría
    for (const e of expenses) {
      const day = getDate(parseISO(e.date));
      if (day <= currentDay) {
        const dayIndex = day - 1;
        const amount = toPen(e, rate);

        if (topCategoryIds.has(e.categoryId)) {
          dailyByCategory[e.categoryId][dayIndex] += amount;
        } else if (hasOthers) {
          dailyByCategory['__others__'][dayIndex] += amount;
        }
      }
    }

    // Construir datasets para Chart.js
    const datasets: StackedTrendDataset[] = topCategories.map((cat, index) => ({
      label: cat.name,
      data: dailyByCategory[cat.id],
      backgroundColor: DONUT_COLOR_PALETTE[index],
    }));

    if (hasOthers) {
      datasets.push({
        label: 'Otros',
        data: dailyByCategory['__others__'],
        backgroundColor: DONUT_COLOR_PALETTE[MAX_CATEGORIES],
      });
    }

    return { labels, datasets };
  }
);

/** Datos para gráfico de dona (categorías con color) */
export type CategoryChartData = {
  labels: string[];
  data: number[];
  colors: string[];
};

// Paleta de 6 colores para el gráfico de dona (máximo 5 categorías + "Otros")
// Colores con buen contraste entre sí
const DONUT_COLOR_PALETTE = [
  '#8b5cf6', // violet (categoría más alta)
  '#10b981', // emerald
  '#f59e0b', // amber
  '#3b82f6', // blue
  '#f43f5e', // rose
  '#64748b', // slate (para "Otros")
];

const MAX_CATEGORIES = 5;

export const selectCategoryChartData = createSelector(
  selectCategoryBreakdown,
  (breakdown) => {
    // Filtrar categorías con gastos y ordenar de mayor a menor
    const filtered = breakdown
      .filter(r => r.totalPEN > 0)
      .sort((a, b) => b.totalPEN - a.totalPEN);

    // Si hay 5 o menos categorías, mostrar todas
    if (filtered.length <= MAX_CATEGORIES) {
      return {
        labels: filtered.map(r => r.label),
        data: filtered.map(r => r.totalPEN),
        colors: filtered.map((_, i) => DONUT_COLOR_PALETTE[i]),
      };
    }

    // Tomar las 5 principales y agrupar el resto en "Otros"
    const top5 = filtered.slice(0, MAX_CATEGORIES);
    const rest = filtered.slice(MAX_CATEGORIES);
    const otherTotal = rest.reduce((sum, r) => sum + r.totalPEN, 0);

    return {
      labels: [...top5.map(r => r.label), 'Otros'],
      data: [...top5.map(r => r.totalPEN), otherTotal],
      colors: DONUT_COLOR_PALETTE.slice(0, MAX_CATEGORIES + 1),
    };
  }
);
