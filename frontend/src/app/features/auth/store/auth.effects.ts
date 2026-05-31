import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { Router } from '@angular/router';
import { HttpErrorResponse } from '@angular/common/http';
import { catchError, exhaustMap, map, of, tap } from 'rxjs';
import { AuthService } from '../services/auth.service';
import { AuthActions } from './auth.actions';

@Injectable()
export class AuthEffects {
  private actions$ = inject(Actions);
  private service = inject(AuthService);
  private router = inject(Router);

  login$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.login),
      exhaustMap(({ payload }) =>
        this.service.login(payload).pipe(
          map((response) => AuthActions.loginSuccess({ response })),
          catchError((err) => of(AuthActions.loginFailure({ error: toMessage(err) }))),
        ),
      ),
    ),
  );

  register$ = createEffect(() =>
    this.actions$.pipe(
      ofType(AuthActions.register),
      exhaustMap(({ payload }) =>
        this.service.register(payload).pipe(
          map((response) => AuthActions.registerSuccess({ response })),
          catchError((err) => of(AuthActions.registerFailure({ error: toMessage(err) }))),
        ),
      ),
    ),
  );

  // Persistimos el token + usuario en localStorage tras un acceso exitoso.
  persistSession$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        tap(({ response }) => this.service.storeSession(response)),
      ),
    { dispatch: false },
  );

  navigateHome$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.loginSuccess, AuthActions.registerSuccess),
        tap(() => this.router.navigate(['/dashboard'])),
      ),
    { dispatch: false },
  );

  logout$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(AuthActions.logout),
        tap(() => {
          this.service.clearSession();
          this.router.navigate(['/login']);
        }),
      ),
    { dispatch: false },
  );
}

/** Extrae el mensaje del cuerpo de error del backend ({ message }) o uno genérico. */
function toMessage(err: unknown): string {
  if (err instanceof HttpErrorResponse) {
    if (err.status === 0) return 'No se pudo conectar con el servidor.';
    const body = err.error as { message?: string } | null;
    if (body?.message) return body.message;
  }
  return 'Ocurrió un error inesperado. Intentá de nuevo.';
}
