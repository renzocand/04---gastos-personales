import { createActionGroup, emptyProps, props } from "@ngrx/store";


export const ExchangeRateActions = createActionGroup({
  source: 'Exchange Rate',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{rate:number}>(),
    'Load Failure': props<{error:string}>()
  }
})
