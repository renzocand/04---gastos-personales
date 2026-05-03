import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { switchMap } from 'rxjs';
import { ExchangeRateActions } from './exchange-rate.actions';
import { ExchangeRateService } from '../services/exchange-rate.service';
import { mapResponse } from '@ngrx/operators';



@Injectable()

export class ExchangeRateEffects {

  actions$ = inject(Actions)
  service = inject(ExchangeRateService);

  load$ = createEffect(()=> this.actions$.pipe(
    ofType(ExchangeRateActions.load),
    switchMap(()=>this.service.getRate().pipe(
      mapResponse({
        next: rate=>ExchangeRateActions.loadSuccess({rate}),
        error: (err:Error) => ExchangeRateActions.loadFailure({error:err.message})
      })
    ))
  ))


}
