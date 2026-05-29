import { createSelector } from "@ngrx/store";
import { expensesFeature } from "../../expenses/store/expenses.feature";
import { exchangeRateFeature } from "../../exchange-rate/store/exchange-rate.feature";
import { Expense } from "../../expenses/models/expense";
import { CATEGORIES, CategoryId } from "../../categories/models/category";


function toPen(expense:Expense, rate:number):number{
  return expense.currency === 'USD'? expense.amount*rate : expense.amount;
}

export type BreakdownRow = {
  id: CategoryId;
  label: string;
  totalPEN: number;
  percent: number;
};


export const selectCategoryBreakdown = createSelector(
  expensesFeature.selectExpenses,
  exchangeRateFeature.selectRate,
  (expenses, rate) => {

    if (rate === null) return [];

    const totalsByCategory = expenses.reduce<Record<string, number>>((acc, expense) => {
      const key = expense.categoryId;
      acc[key] = (acc[key] ?? 0) + toPen(expense, rate)
      return acc;
    }, {})

    const totalGlobal = Object.values(totalsByCategory).reduce((acc,k)=> acc + k ,0)

    return Object.values(CATEGORIES).map<BreakdownRow>(cat=> ({
        id: cat.id,
        label: cat.name,
        totalPEN: totalsByCategory[cat.id]??0,
        percent: totalGlobal>0?  (totalsByCategory[cat.id]??0) /totalGlobal*100 :0
    }))

  }
)

export const selectRecentExpenses = createSelector(
  expensesFeature.selectExpenses,
  (expenses) => [...expenses].sort((a,b)=>b.date.localeCompare(a.date)).slice(0,5)
)
