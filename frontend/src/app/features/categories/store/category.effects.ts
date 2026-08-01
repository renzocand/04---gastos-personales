import { inject, Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mapResponse } from '@ngrx/operators';
import { switchMap, tap } from 'rxjs';
import { CategoryService } from '../services/category.service';
import { CategoriesActions } from './category.actions';

@Injectable()
export class CategoryEffects {
  private actions$ = inject(Actions);
  private service = inject(CategoryService);
  private router = inject(Router);

  load$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoriesActions.load),
      switchMap(() =>
        this.service.getAll().pipe(
          mapResponse({
            next: (categories) => CategoriesActions.loadSuccess({ categories }),
            error: (err: Error) => CategoriesActions.loadFailure({ error: err.message }),
          }),
        ),
      ),
    ),
  );

  create$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoriesActions.create),
      switchMap(({ request }) =>
        this.service.create(request).pipe(
          mapResponse({
            next: (category) => CategoriesActions.createSuccess({ category }),
            error: (err: Error) => CategoriesActions.createFailure({ error: err.message }),
          }),
        ),
      ),
    ),
  );

  createSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CategoriesActions.createSuccess),
        tap(() => this.router.navigate(['/categories'])),
      ),
    { dispatch: false },
  );

  update$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoriesActions.update),
      switchMap(({ id, request }) =>
        this.service.update(id, request).pipe(
          mapResponse({
            next: (category) => CategoriesActions.updateSuccess({ category }),
            error: (err: Error) => CategoriesActions.updateFailure({ error: err.message }),
          }),
        ),
      ),
    ),
  );

  updateSuccess$ = createEffect(
    () =>
      this.actions$.pipe(
        ofType(CategoriesActions.updateSuccess),
        tap(() => this.router.navigate(['/categories'])),
      ),
    { dispatch: false },
  );

  delete$ = createEffect(() =>
    this.actions$.pipe(
      ofType(CategoriesActions.delete),
      switchMap(({ id }) =>
        this.service.delete(id).pipe(
          mapResponse({
            next: () => CategoriesActions.deleteSuccess({ id }),
            error: (err: Error) => CategoriesActions.deleteFailure({ error: err.message }),
          }),
        ),
      ),
    ),
  );
}
