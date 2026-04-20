import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, map, of, switchMap } from 'rxjs';
import { ExpensesService } from '../services/expenses.service';
import { ExpensesActions } from './expenses.actions';

@Injectable()
export class ExpensesEffects {
  private actions$ = inject(Actions);
  private service = inject(ExpensesService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExpensesActions.load),
      switchMap(() =>
        this.service.getAll().pipe(
          map(expenses => ExpensesActions.loadSuccess({ expenses })),
          catchError(err => of(ExpensesActions.loadFailure({ error: err.message }))),
        ),
      ),
    ),
  );




}

