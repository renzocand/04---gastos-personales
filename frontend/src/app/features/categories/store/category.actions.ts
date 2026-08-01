import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Category, CategoryRequest } from '../models/category';

export const CategoriesActions = createActionGroup({
  source: 'Categories',
  events: {
    // Load
    'Load': emptyProps(),
    'Load Success': props<{ categories: Category[] }>(),
    'Load Failure': props<{ error: string }>(),

    // Create
    'Create': props<{ request: CategoryRequest }>(),
    'Create Success': props<{ category: Category }>(),
    'Create Failure': props<{ error: string }>(),

    // Update
    'Update': props<{ id: string; request: CategoryRequest }>(),
    'Update Success': props<{ category: Category }>(),
    'Update Failure': props<{ error: string }>(),

    // Delete
    'Delete': props<{ id: string }>(),
    'Delete Success': props<{ id: string }>(),
    'Delete Failure': props<{ error: string }>(),

    // Clear error
    'Clear Error': emptyProps(),
  },
});
