import { DOCUMENT } from '@angular/common';
import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { HttpErrorResponse } from '@angular/common/http';
import { mapResponse } from '@ngrx/operators';
import { switchMap, tap } from 'rxjs';
import { SettingsService } from '../services/settings.service';
import { SettingsActions } from './settings.actions';
import { ToastService } from '../../../shared/ui/toast/toast.service';
import { UserSettings } from '../models/settings';

@Injectable()
export class SettingsEffects {
  private actions$ = inject(Actions);
  private service = inject(SettingsService);
  private toast = inject(ToastService);
  private document = inject(DOCUMENT);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.load),
      switchMap(() =>
        this.service.get().pipe(
          mapResponse({
            next: (settings) => SettingsActions.loadSuccess({ settings }),
            error: (err: HttpErrorResponse) =>
              SettingsActions.loadFailure({ error: toMessage(err) }),
          }),
        ),
      ),
    ),
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(SettingsActions.update),
      switchMap(({ payload }) =>
        this.service.update(payload).pipe(
          mapResponse({
            next: (settings) => SettingsActions.updateSuccess({ settings }),
            error: (err: HttpErrorResponse) =>
              SettingsActions.updateFailure({ error: toMessage(err) }),
          }),
        ),
      ),
    ),
  );

  notifyUpdate$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SettingsActions.updateSuccess),
        tap(() => this.toast.show('Configuración guardada', 'success')),
      ),
    { dispatch: false },
  );

  /**
   * Refleja las preferencias de accesibilidad en el elemento <html> mediante
   * atributos data-*; styles.css reacciona a ellos (escala de fuente, alto
   * contraste, reducción de movimiento). Corre al cargar y al guardar.
   */
  applyA11y$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(SettingsActions.loadSuccess, SettingsActions.updateSuccess),
        tap(({ settings }) => this.applyA11y(settings)),
      ),
    { dispatch: false },
  );

  private applyA11y(settings: UserSettings): void {
    const root = this.document.documentElement;
    root.setAttribute('data-font', settings.fontScale);
    if (settings.highContrast) {
      root.setAttribute('data-contrast', 'high');
    } else {
      root.removeAttribute('data-contrast');
    }
    if (settings.reduceMotion) {
      root.setAttribute('data-reduce-motion', 'true');
    } else {
      root.removeAttribute('data-reduce-motion');
    }
  }
}

function toMessage(err: HttpErrorResponse): string {
  if (err.status === 0) return 'No se pudo conectar con el servidor.';
  const body = err.error as { message?: string } | null;
  return body?.message ?? 'No se pudo cargar la configuración.';
}
