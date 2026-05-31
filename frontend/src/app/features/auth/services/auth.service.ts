import { HttpClient } from '@angular/common/http';
import { inject, Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest } from '../models/auth';
import { environment } from '../../../../environments/environment';

const API_URL = `${environment.apiUrl}/auth`;

const TOKEN_KEY = 'gastos.token';
const USER_KEY = 'gastos.user';

/**
 * Lee el usuario guardado en localStorage (o null). Se exporta como función
 * suelta para poder inicializar el estado de NgRx sin instanciar el servicio.
 */
export function readStoredUser(): AuthUser | null {
  const raw = localStorage.getItem(USER_KEY);
  if (!raw) return null;
  try {
    return JSON.parse(raw) as AuthUser;
  } catch {
    return null;
  }
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);

  login(payload: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/login`, payload);
  }

  register(payload: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${API_URL}/register`, payload);
  }

  // --- Sesión (token + datos básicos) en localStorage ---

  getToken(): string | null {
    return localStorage.getItem(TOKEN_KEY);
  }

  /** Persiste el token y los datos del usuario tras login/registro. */
  storeSession(res: AuthResponse): void {
    localStorage.setItem(TOKEN_KEY, res.token);
    const user: AuthUser = { dni: res.dni, firstName: res.firstName, lastName: res.lastName };
    localStorage.setItem(USER_KEY, JSON.stringify(user));
  }

  clearSession(): void {
    localStorage.removeItem(TOKEN_KEY);
    localStorage.removeItem(USER_KEY);
  }
}
