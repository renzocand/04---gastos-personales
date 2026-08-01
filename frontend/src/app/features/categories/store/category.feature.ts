import { createFeature, createReducer, on } from '@ngrx/store';
import { CategoriesActions } from './category.actions';
import { Category } from '../models/category';

export interface CategoryState {
  categories: Category[];
  loading: boolean;
  saving: boolean;
  error: string | null;
}

const initialState: CategoryState = {
  categories: [],
  loading: false,
  saving: false,
  error: null,
};

export const categoryFeature = createFeature({
  name: 'categories',
  reducer: createReducer(
    initialState,
    // Load
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

    // Create
    on(CategoriesActions.create, (state) => ({ ...state, saving: true, error: null })),
    on(CategoriesActions.createSuccess, (state, { category }) => ({
      ...state,
      categories: [...state.categories, category],
      saving: false,
      error: null,
    })),
    on(CategoriesActions.createFailure, (state, { error }) => ({
      ...state,
      saving: false,
      error,
    })),

    // Update
    on(CategoriesActions.update, (state) => ({ ...state, saving: true, error: null })),
    on(CategoriesActions.updateSuccess, (state, { category }) => ({
      ...state,
      categories: state.categories.map((c) => (c.id === category.id ? category : c)),
      saving: false,
      error: null,
    })),
    on(CategoriesActions.updateFailure, (state, { error }) => ({
      ...state,
      saving: false,
      error,
    })),

    // Delete
    on(CategoriesActions.delete, (state) => ({ ...state, saving: true, error: null })),
    on(CategoriesActions.deleteSuccess, (state, { id }) => ({
      ...state,
      categories: state.categories.filter((c) => c.id !== id),
      saving: false,
      error: null,
    })),
    on(CategoriesActions.deleteFailure, (state, { error }) => ({
      ...state,
      saving: false,
      error,
    })),

    // Clear error
    on(CategoriesActions.clearError, (state) => ({ ...state, error: null })),
  ),
});
