import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class ExchangeRateService {

  private http = inject(HttpClient);

  // El tipo de cambio ahora lo sirve nuestro backend (que lo cachea), no la
  // API pública directamente desde el navegador.
  getRate(): Observable<number> {
    return this.http.get<{ rate: number }>(`${environment.apiUrl}/exchange-rate`).pipe(
      map(resp => resp.rate)
    );
  }
}
