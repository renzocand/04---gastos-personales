import { createFeature, createReducer, on } from '@ngrx/store';
import { CategoriesActions } from './category.actions';
import { Category } from '../models/category';

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  error: null,
};

export const categoryFeature = createFeature({
  name: 'categories',
  reducer: createReducer(
    initialState,
    on(CategoriesActions.load, (state) => ({ ...state, loading: true, error: null })),
    on(CategoriesActions.loadSuccess, (state, { categories }) => ({
      ...state,
      categories,
      loading: false,
      error: null,
    })),
    on(CategoriesActions.loadFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),
  ),
});
