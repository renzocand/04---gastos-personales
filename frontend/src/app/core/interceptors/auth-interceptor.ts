import { HttpErrorResponse, HttpInterceptorFn } from '@angular/common/http';
import { inject } from '@angular/core';
import { Store } from '@ngrx/store';
import { TranslocoService } from '@jsverse/transloco';
import { catchError, throwError } from 'rxjs';
import { AuthService } from '../../features/auth/services/auth.service';
import { AuthActions } from '../../features/auth/store/auth.actions';
import { environment } from '../../../environments/environment';

const API_BASE = environment.apiUrl;

/**
 * Adjunta `Authorization: Bearer <token>` a las peticiones a nuestra API y,
 * ante un 401 (token ausente/expirado), cierra la sesión y redirige al login.
 * Los endpoints públicos /api/auth/** se dejan pasar sin tocar.
 *
 * Además adjunta `Accept-Language: <idioma activo>` a TODA petición a la API
 * (incluido /api/auth/**) para que el backend devuelva validaciones y errores
 * en el idioma del usuario.
 */
export const authInterceptor: HttpInterceptorFn = (req, next) => {
  const auth = inject(AuthService);
  const store = inject(Store);
  const transloco = inject(TranslocoService);

  const isApi = req.url.startsWith(API_BASE);
  const isAuthEndpoint = req.url.startsWith(`${API_BASE}/auth/`);
  const token = auth.getToken();

  const headers: Record<string, string> = {};
  if (isApi) headers['Accept-Language'] = transloco.getActiveLang();
  if (isApi && !isAuthEndpoint && token) headers['Authorization'] = `Bearer ${token}`;

  const authReq = Object.keys(headers).length ? req.clone({ setHeaders: headers }) : req;

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
