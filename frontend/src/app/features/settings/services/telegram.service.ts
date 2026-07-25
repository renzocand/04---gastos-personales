import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../../environments/environment';

export interface TelegramLinkCode {
  code: string;
  expiresAt: string;
  expiresInSeconds: number;
}

export interface TelegramLink {
  id: string;
  telegramId: number;
  telegramUsername: string | null;
  telegramName: string | null;
  linkedAt: string;
}

const API_URL = `${environment.apiUrl}/telegram`;

@Injectable({ providedIn: 'root' })
export class TelegramService {
  private http = inject(HttpClient);

  generateCode(): Observable<TelegramLinkCode> {
    return this.http.get<TelegramLinkCode>(`${API_URL}/generate-code`);
  }

  getMyLinks(): Observable<TelegramLink[]> {
    return this.http.get<TelegramLink[]>(`${API_URL}/my-links`);
  }

  unlink(linkId: string): Observable<void> {
    return this.http.delete<void>(`${API_URL}/unlink/${linkId}`);
  }
}
