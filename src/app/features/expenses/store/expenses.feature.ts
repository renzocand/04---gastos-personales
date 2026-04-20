import { createFeature, createReducer, on } from "@ngrx/store";
import { ExpensesActions } from "./expenses.actions";
import { Expense } from "../models/expense";

interface ExpensesState { expenses: Expense[]; loading: boolean; error: string | null }

const initialState:ExpensesState  = { expenses: [], loading: false, error: null };


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
   on(ExpensesActions.deleteFailure, (state,{error})=> ({...state,loading:false, error}))



















  )
})
