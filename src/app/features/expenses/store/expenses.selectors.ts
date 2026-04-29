import { createSelector } from "@ngrx/store";
import { expensesFeature } from "./expenses.feature";
import { Expense } from "../models/expense";
import { isToday, isYesterday, format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';

function labelForDate(isoDate: string): string {
  const d = parseISO(isoDate);
  if (isToday(d)) return 'Hoy';
  if (isYesterday(d)) return 'Ayer';
  return format(d, "EEEE d 'de' MMM", { locale: es });
  // "martes 15 de abr" — podés ajustar el formato
}


export type ExpenseDayGroup = {
  label: string;      // "Hoy", "Ayer", "Martes 15 abr"
  count: number;      // cantidad de gastos ese día
  items: Expense[];   // ← los expenses REALES del store (con categoryId, amount: number)
};

export const selectExpensesGroupedByDay = createSelector(
  expensesFeature.selectExpenses,
  (expenses)=>{

    const grouped: Record<string, Expense[]> = {};

    for(const item of expenses){
      const key = item.date;
      if(!grouped[key]){
          grouped[key] = [];
      }
      grouped[key].push(item)
    }

      // luego transformás el Record en un array de ExpenseDayGroup
    const groups: ExpenseDayGroup[] = Object.entries(grouped)
      .sort((a, b) => b[0].localeCompare(a[0]))
      .map(([key, value]) => ({
        label: labelForDate(key),
        count: value.length,
        items: value
      }))

      return groups;

  }
)

export const selectHasExpenses = createSelector(expensesFeature.selectExpenses, expenses=>expenses.length>0?true:false);


export const selectExpenseById = (id:string)=> createSelector(
  expensesFeature.selectExpenses,
  (expenses) => expenses.find(t=>t.id === id) ?? undefined
)

