import { HttpClient, HttpParams } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { map, Observable } from 'rxjs';
import { Expense } from '../models/expense';
import { ExpenseFilters } from '../models/expense-filters';

const API_URL = 'http://localhost:8080/api/expenses';

@Injectable({
  providedIn: 'root',
})
export class ExpensesService {
  private http = inject(HttpClient);

  getAll(filters?: ExpenseFilters): Observable<Expense[]> {
    let params = new HttpParams();
    if (filters?.categoryId) params = params.set('categoryId', filters.categoryId);
    if (filters?.currency) params = params.set('currency', filters.currency);
    if (filters?.dateFrom) params = params.set('dateFrom', filters.dateFrom);
    if (filters?.dateTo) params = params.set('dateTo', filters.dateTo);
    return this.http.get<Expense[]>(API_URL, { params });
  }

  create(payload: Omit<Expense, 'id'>): Observable<Expense> {
    return this.http.post<Expense>(API_URL, payload);
  }

  update(id: string, changes: Partial<Omit<Expense, 'id'>>): Observable<Expense> {
    return this.http.patch<Expense>(`${API_URL}/${id}`, changes);
  }

  delete(id: string): Observable<string> {
    // El backend responde 204 sin cuerpo; devolvemos el id para conservar la firma.
    return this.http.delete<void>(`${API_URL}/${id}`).pipe(map(() => id));
  }
}
