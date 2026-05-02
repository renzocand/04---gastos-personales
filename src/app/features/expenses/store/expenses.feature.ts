import { createFeature, createReducer, on } from "@ngrx/store";
import { ExpensesActions } from "./expenses.actions";
import { Expense } from "../models/expense";
import { ExpenseFilters } from "../models/expense-filters";

export interface ExpensesState { expenses: Expense[]; loading: boolean; error: string | null, filters:ExpenseFilters }

const initialState:ExpensesState  = { expenses: [], loading: false, error: null, filters:{categoryId:null,currency:null,dateFrom:null,dateTo:null} };


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

  on(ExpensesActions.filtersCleared, state=> ({...state, filters:initialState.filters }))














  )
})
