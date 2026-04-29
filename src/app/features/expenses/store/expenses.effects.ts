import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, concatMap, map, merge, mergeMap, of, switchMap, tap } from 'rxjs';
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

  add$ = createEffect(() => this.actions$.pipe(
    ofType(ExpensesActions.add),
    mergeMap(({ payload }) => this.service.create(payload).pipe(
      map(expense => ExpensesActions.addSuccess({ expense })),
      catchError(err => of(ExpensesActions.addFailure({ error: err.message })))
    ))
  ))

  navigateAfterAdd$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(ExpensesActions.addSuccess),
      tap(() => this.router.navigate(['/expenses'])),
    ),
  { dispatch: false }   // ← importante: este effect no dispatchea nada
);


update$ = createEffect(()=>this.actions$.pipe(
  ofType(ExpensesActions.update),
  mergeMap(({id,changes})=> this.service.update(id,changes).pipe(
    map(expense=> ExpensesActions.updateSuccess({expense})),
    catchError((err)=>of(ExpensesActions.updateFailure({error:err.message})))
  ))
))

navigateAfterUpdate$ = createEffect(()=>this.actions$.pipe(
  ofType(ExpensesActions.updateSuccess),
  tap(()=>this.router.navigate(['/expenses']))
),{dispatch:false})


delete$ = createEffect(()=>this.actions$.pipe(
  ofType(ExpensesActions.delete),
  mergeMap(({id})=>this.service.delete(id).pipe(
    map(id=>ExpensesActions.deleteSuccess({id})),
    catchError((err)=>of(ExpensesActions.deleteFailure({error:err.message})))
  ))
))


navigateAfterDelete$ = createEffect(()=>this.actions$.pipe(
  ofType(ExpensesActions.deleteSuccess),
  tap(()=>this.router.navigate(['/expenses']))
),{dispatch:false})









}

