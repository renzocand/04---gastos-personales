
import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Expense } from '../models/expense';


export const ExpensesActions = createActionGroup({
    source: 'Expenses',
    events: {
      // Load
      'Load': emptyProps(),
      'Load Success': props<{expenses:Expense[]}>(),
      'Load Failure': props<{error:string}>(),

      // Add
      'Add': props<{expense:Omit<Expense, 'id'>}>(),
      'Add Success': props<{expense:Expense}>(),
      'Add Failure': props<{error:string}>(),

      // Update
      'Update': props<{id:string, changes: Partial<Omit<Expense,'id'>> }>(),
      'Update Success': props<{expense:Expense}>(),
      'Update Failure': props<{error:string}>(),

      //Delete
      'Delete': props<{id:string}>(),
      'Delete Success': props<{ id: string }>(),
      'Delete Failure': props<{error:string}>()
    }
})
