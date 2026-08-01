import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category, CategoryRequest } from '../models/category';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/user-categories`;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  /** Lista categorías activas del usuario autenticado. */
  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(API_URL);
  }

  /** Lista todas las categorías incluyendo inactivas. */
  getAllIncludingInactive(): Observable<Category[]> {
    return this.http.get<Category[]>(`${API_URL}/all`);
  }

  /** Obtiene una categoría por id. */
  getById(id: string): Observable<Category> {
    return this.http.get<Category>(`${API_URL}/${id}`);
  }

  /** Crea una nueva categoría. */
  create(request: CategoryRequest): Observable<Category> {
    return this.http.post<Category>(API_URL, request);
  }

  /** Actualiza una categoría existente. */
  update(id: string, request: CategoryRequest): Observable<Category> {
    return this.http.put<Category>(`${API_URL}/${id}`, request);
  }

  /** Elimina (soft delete) una categoría. */
  delete(id: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/${id}`);
  }
}
