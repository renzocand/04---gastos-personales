import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { AuthActions } from '../../features/auth/store/auth.actions';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiUrl;

/**
 * Adjunta `Authorization: Bearer <token>` a las peticiones a nuestra API y,
 * ante un 401 (token ausente/expirado), cierra la sesión y redirige al login.
 * Los endpoints públicos /api/auth/** se dejan pasar sin tocar.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const store = inject(Store);

  const isApi = req.url.startsWith(API_BASE);
  const isAuthEndpoint = req.url.startsWith(`${API_BASE}/auth/`);
  const token = auth.getToken();

  const authReq =
    isApi && !isAuthEndpoint && token
      ? req.clone({ setHeaders: { Authorization: `Bearer ${token}` } })
      : req;

  return next(authReq).pipe(
    catchError((err: HttpErrorResponse) => {
      // Sesión inválida en un endpoint protegido → forzamos logout.
      if (err.status === 401 && isApi && !isAuthEndpoint) {
        store.dispatch(AuthActions.logout());
      }
      return throwError(() => err);
    }),
  );
};
