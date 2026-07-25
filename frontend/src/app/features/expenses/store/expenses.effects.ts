import { Injectable, inject } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { catchError, debounceTime, map, mergeMap, of, switchMap, tap } from 'rxjs';
import { ExpensesService } from '../services/expenses.service';
import { ExpensesActions } from './expenses.actions';
import { Router } from '@angular/router';
import { concatLatestFrom, mapResponse } from '@ngrx/operators';
import { Store } from '@ngrx/store';
import { selectFilters } from './expenses.selectors';
import { NetworkService } from '../../../core/offline/network.service';
import { SyncQueueService } from '../../../core/offline/sync-queue.service';
import { Expense } from '../models/expense';


@Injectable()
export class ExpensesEffects {
  private actions$ = inject(Actions);
  private service = inject(ExpensesService);
  private router = inject(Router);
  private store = inject(Store);
  private network = inject(NetworkService);
  private syncQueue = inject(SyncQueueService);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(ExpensesActions.load),
      concatLatestFrom(()=>this.store.select(selectFilters)),
      switchMap(([_,filters]) =>
        this.service.getAll(filters).pipe(
          mapResponse({
            next: (expenses) => ExpensesActions.loadSuccess({expenses}),
            error:(err:Error) => ExpensesActions.loadFailure({error:err.message})
          })
        ),
      ),
    ),
  );

  add$ = createEffect(() => this.actions$.pipe(
    ofType(ExpensesActions.add),
    mergeMap(({ payload }) => {
      // Si está offline, guardar localmente
      if (!this.network.isOnline()) {
        const tempId = `temp-${Date.now()}`;
        const tempExpense: Expense = { ...payload, id: tempId };
        this.syncQueue.enqueue('expenses/add', payload, tempId);
        return of(ExpensesActions.addOffline({ expense: tempExpense, tempId }));
      }

      // Online: enviar al backend normalmente
      return this.service.create(payload).pipe(
        map(expense => ExpensesActions.addSuccess({ expense })),
        catchError(err => {
          // Si falla por red, encolar
          if (err.status === 0 || err.status === 504) {
            const tempId = `temp-${Date.now()}`;
            const tempExpense: Expense = { ...payload, id: tempId };
            this.syncQueue.enqueue('expenses/add', payload, tempId);
            return of(ExpensesActions.addOffline({ expense: tempExpense, tempId }));
          }
          return of(ExpensesActions.addFailure({ error: err.message }));
        })
      );
    })
  ))

  navigateAfterAdd$ = createEffect(
  () =>
    this.actions$.pipe(
      ofType(ExpensesActions.addSuccess, ExpensesActions.addOffline),
      tap(() => this.router.navigate(['/expenses'])),
    ),
  { dispatch: false }
);


update$ = createEffect(() => this.actions$.pipe(
  ofType(ExpensesActions.update),
  mergeMap(({ id, changes }) => {
    // Si está offline, actualizar localmente
    if (!this.network.isOnline()) {
      this.syncQueue.enqueue('expenses/update', { id, changes });
      return of(ExpensesActions.updateOffline({ id, changes }));
    }

    // Online: enviar al backend
    return this.service.update(id, changes).pipe(
      map(expense => ExpensesActions.updateSuccess({ expense })),
      catchError(err => {
        if (err.status === 0 || err.status === 504) {
          this.syncQueue.enqueue('expenses/update', { id, changes });
          return of(ExpensesActions.updateOffline({ id, changes }));
        }
        return of(ExpensesActions.updateFailure({ error: err.message }));
      })
    );
  })
))

navigateAfterUpdate$ = createEffect(() => this.actions$.pipe(
  ofType(ExpensesActions.updateSuccess, ExpensesActions.updateOffline),
  tap(() => this.router.navigate(['/expenses']))
), { dispatch: false })


delete$ = createEffect(() => this.actions$.pipe(
  ofType(ExpensesActions.delete),
  mergeMap(({ id }) => {
    // Si está offline, eliminar localmente
    if (!this.network.isOnline()) {
      // Solo encolar si no es un item temporal (que nunca llegó al backend)
      if (!id.startsWith('temp-')) {
        this.syncQueue.enqueue('expenses/delete', { id });
      }
      return of(ExpensesActions.deleteOffline({ id }));
    }

    // Online: enviar al backend
    return this.service.delete(id).pipe(
      map(deletedId => ExpensesActions.deleteSuccess({ id: deletedId })),
      catchError(err => {
        if (err.status === 0 || err.status === 504) {
          if (!id.startsWith('temp-')) {
            this.syncQueue.enqueue('expenses/delete', { id });
          }
          return of(ExpensesActions.deleteOffline({ id }));
        }
        return of(ExpensesActions.deleteFailure({ error: err.message }));
      })
    );
  })
))


navigateAfterDelete$ = createEffect(() => this.actions$.pipe(
  ofType(ExpensesActions.deleteSuccess, ExpensesActions.deleteOffline),
  tap(() => this.router.navigate(['/expenses']))
), { dispatch: false })


triggerLoadOnFiltersChange$ = createEffect(()=>this.actions$.pipe(
  ofType(
    ExpensesActions.categoryFilterChanged,
    ExpensesActions.currencyFilterChanged,
    ExpensesActions.dateFromChanged,
    ExpensesActions.dateToChanged,
    ExpensesActions.filtersCleared
  ),
  debounceTime(300),
  map(()=>ExpensesActions.load())
))






}

