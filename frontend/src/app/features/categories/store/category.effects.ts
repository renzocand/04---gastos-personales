import { inject, Injectable } from '@angular/core';
import { Actions, createEffect, ofType } from '@ngrx/effects';
import { mapResponse } from '@ngrx/operators';
import { switchMap } from 'rxjs';
import { CategoryService } from '../services/category.service';
import { CategoriesActions } from './category.actions';

@Injectable()
export class CategoryEffects {
  private actions$ = inject(Actions);
  private service = inject(CategoryService);

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
}
