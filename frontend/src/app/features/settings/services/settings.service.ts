import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { UserSettings } from '../models/settings';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/settings`;

@Injectable({ providedIn: 'root' })
export class SettingsService {
  private http = inject(HttpClient);

  get(): Observable<UserSettings> {
    return this.http.get<UserSettings>(API_URL);
  }

  update(payload: UserSettings): Observable<UserSettings> {
    return this.http.put<UserSettings>(API_URL, payload);
  }
}
