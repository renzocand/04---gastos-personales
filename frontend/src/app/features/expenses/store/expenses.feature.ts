import { createFeature, createReducer, on } from "@ngrx/store";
import { ExpensesActions } from "./expenses.actions";
import { Expense } from "../models/expense";
import { ExpenseFilters } from "../models/expense-filters";

export interface ExpensesState {
  expenses: Expense[];
  loading: boolean;
  error: string | null;
  filters: ExpenseFilters;
  pendingIds: string[];  // IDs de items pendientes de sincronización
}

const initialState: ExpensesState = {
  expenses: [],
  loading: false,
  error: null,
  filters: { categoryId: null, currency: null, dateFrom: null, dateTo: null },
  pendingIds: [],
};


export const expensesFeature = createFeature({
  name: 'expenses',
  reducer: createReducer(
    initialState,
    on(ExpensesActions.load, state=>({...state,loading:true,error:null})),
    on(ExpensesActions.loadSuccess, (state, {expenses})=>({...state,expenses,loading:false, error:null})),
    on(ExpensesActions.loadFailure, (state, {error})=>  ({...state, loading:false, error})  ),

    on(ExpensesActions.add, (state) => ({...state, loading:true, error:null}) ),
    on(ExpensesActions.addSuccess, (state, {expense})=>({...state,expenses:[expense,...state.expenses],loading:false,error:null})),
    on(ExpensesActions.addFailure, (state, {error})=> ({...state, loading:false, error}) ),

    on(ExpensesActions.update, state=>({...state ,loading:true, error:null})),
    on(ExpensesActions.updateSuccess, (state, { expense }) => ({
      ...state,
      expenses: state.expenses.map(e => e.id === expense.id ? expense : e),
      loading: false,
      error: null,
    })),
    on(ExpensesActions.updateFailure, (state,{error})=> ({...state, error,loading:false}) ),


   on(ExpensesActions.delete, state=>({...state,loading:true,error:null})),
   on(ExpensesActions.deleteSuccess, (state, {id})=> ({...state, expenses: state.expenses.filter(t=>t.id!==id)  ,loading:false, error:null }) ),
   on(ExpensesActions.deleteFailure, (state,{error})=> ({...state,loading:false, error})),


   on(ExpensesActions.categoryFilterChanged, (state, {categoryId})=> ({...state, filters:{...state.filters, categoryId} })),
   on(ExpensesActions.currencyFilterChanged, (state,{currency})=> ({...state, filters:{...state.filters,currency} }) )  ,
   on(ExpensesActions.dateFromChanged, (state,{dateFrom}) =>  ({...state, filters:{...state.filters,dateFrom} }) ),
   on(ExpensesActions.dateToChanged, (state,{dateTo}) =>  ({...state, filters:{...state.filters,dateTo} }) ),

  on(ExpensesActions.filtersCleared, state=> ({...state, filters:initialState.filters })),

    // Offline actions
    on(ExpensesActions.addOffline, (state, { expense, tempId }) => ({
      ...state,
      expenses: [expense, ...state.expenses],
      pendingIds: [...state.pendingIds, tempId],
      loading: false,
      error: null,
    })),
    on(ExpensesActions.syncAddSuccess, (state, { expense, tempId }) => ({
      ...state,
      expenses: state.expenses.map(e => e.id === tempId ? expense : e),
      pendingIds: state.pendingIds.filter(id => id !== tempId),
    })),

    on(ExpensesActions.updateOffline, (state, { id, changes }) => ({
      ...state,
      expenses: state.expenses.map(e => e.id === id ? { ...e, ...changes } : e),
      pendingIds: state.pendingIds.includes(id) ? state.pendingIds : [...state.pendingIds, id],
      loading: false,
      error: null,
    })),
    on(ExpensesActions.syncUpdateSuccess, (state, { expense }) => ({
      ...state,
      expenses: state.expenses.map(e => e.id === expense.id ? expense : e),
      pendingIds: state.pendingIds.filter(id => id !== expense.id),
    })),

    on(ExpensesActions.deleteOffline, (state, { id }) => ({
      ...state,
      expenses: state.expenses.filter(e => e.id !== id),
      pendingIds: state.pendingIds.filter(pId => pId !== id),
      loading: false,
      error: null,
    }))










  )
})
