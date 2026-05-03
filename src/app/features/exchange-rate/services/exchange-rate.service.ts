import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';

type ExchangeRateResponse = {
  result: 'success' | 'error';
  rates: Record<string, number>;
};

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  private http = inject(HttpClient);


  getRate():Observable<number>{
    return this.http.get<ExchangeRateResponse>('https://open.er-api.com/v6/latest/USD').pipe(
      map(resp=>resp.rates['PEN'])
    )
  }



}
