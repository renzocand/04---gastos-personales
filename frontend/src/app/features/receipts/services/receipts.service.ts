import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Receipt, ReceiptWithItems } from '../models/receipt';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/receipts`;

@Injectable({
  providedIn: 'root',
})
export class ReceiptsService {
  private http = inject(HttpClient);

  getAll(): Observable<Receipt[]> {
    return this.http.get<Receipt[]>(API_URL);
  }

  getById(id: string): Observable<ReceiptWithItems> {
    return this.http.get<ReceiptWithItems>(`${API_URL}/${id}`);
  }

  update(id: string, data: { date: string; vendor?: string }): Observable<ReceiptWithItems> {
    return this.http.put<ReceiptWithItems>(`${API_URL}/${id}`, data);
  }

  delete(id: string): Observable<string> {
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(map(() => id));
  }
}
