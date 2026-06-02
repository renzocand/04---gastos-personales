import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { Category } from '../models/category';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/categories`;

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);

  getAll(): Observable<Category[]> {
    return this.http.get<Category[]>(API_URL);
  }
}
