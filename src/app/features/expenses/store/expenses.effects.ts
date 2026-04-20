import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, of, switchMap, tap } from 'rxjs';
import { ExpensesService } from '../services/expenses.service';
import { ExpensesActions } from './expenses.actions';
import { Router } from '@angular/router';

@Injectable()
export class ExpensesEffects {
  private actions$ = inject(Actions);
  private service = inject(ExpensesService);
  private router = inject(Router)

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

$add = createEffect(() => this.actions$.pipe(
    ofType(ExpensesActions.add),
    switchMap(({ payload }) => this.service.create(payload).pipe(
      map(expense => ExpensesActions.addSuccess({ expense })),
      catchError(err => of(ExpensesActions.addFailure({ error: err.message })))
    ))
  ))

// esqueleto — NO lo escribas ahora
navigateAfterAdd$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(ExpensesActions.addSuccess),
      tap(() => this.router.navigate(['/expenses'])),
    ),
  { dispatch: false }   // ← importante: este effect no dispatchea nada
);


















}

