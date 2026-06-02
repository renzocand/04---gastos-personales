import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Category } from '../models/category';

export const CategoriesActions = createActionGroup({
  source: 'Categories',
  events: {
    'Load': emptyProps(),
    'Load Success': props<{ categories: Category[] }>(),
    'Load Failure': props<{ error: string }>(),
  },
});
