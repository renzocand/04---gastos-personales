import { createFeature, createReducer, on } from "@ngrx/store"
import { ExchangeRateActions } from "./exchange-rate.actions"


export interface ExchangeRateState  {
  rate:null | number,
  loading:boolean,
  error: string | null
}

const initialState:ExchangeRateState = {
  rate:null,
  loading:false,
  error:null
}

export const exchangeRateFeature = createFeature({
  name: 'exchangeRate',
  reducer: createReducer(
    initialState,
    on( ExchangeRateActions.load , state=> ({...state, loading:true, error:null}) ),
    on(ExchangeRateActions.loadSuccess, (state,{rate})=>({ ...state,rate,loading:false,error:null }) ),
    on(ExchangeRateActions.loadFailure, (state,{error})=> ({...state,loading:false,error}) )
  )
})
