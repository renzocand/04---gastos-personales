import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap, tap } from 'rxjs';
import { ReceiptsService } from '../services/receipts.service';
import { ReceiptsActions } from './receipts.actions';
import { Router } from '@angular/router';

@Injectable()
export class ReceiptsEffects {
  private actions$ = inject(Actions);
  private service = inject(ReceiptsService);
  private router = inject(Router);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReceiptsActions.load),
      switchMap(() =>
        this.service.getAll().pipe(
          map((receipts) => ReceiptsActions.loadSuccess({ receipts })),
          catchError((err: Error) =>
            of(ReceiptsActions.loadFailure({ error: err.message }))
          )
        )
      )
    )
  );

  loadDetail$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReceiptsActions.loadDetail),
      switchMap(({ id }) =>
        this.service.getById(id).pipe(
          map((receipt) => ReceiptsActions.loadDetailSuccess({ receipt })),
          catchError((err: Error) =>
            of(ReceiptsActions.loadDetailFailure({ error: err.message }))
          )
        )
      )
    )
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReceiptsActions.update),
      switchMap(({ id, data }) =>
        this.service.update(id, data).pipe(
          map((receipt) => ReceiptsActions.updateSuccess({ receipt })),
          catchError((err: Error) =>
            of(ReceiptsActions.updateFailure({ error: err.message }))
          )
        )
      )
    )
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ReceiptsActions.delete),
      switchMap(({ id }) =>
        this.service.delete(id).pipe(
          map((deletedId) => ReceiptsActions.deleteSuccess({ id: deletedId })),
          catchError((err: Error) =>
            of(ReceiptsActions.deleteFailure({ error: err.message }))
          )
        )
      )
    )
  );

  navigateAfterDelete$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(ReceiptsActions.deleteSuccess),
        tap(() => this.router.navigate(['/receipts']))
      ),
    { dispatch: false }
  );
}
