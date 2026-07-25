
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
      'Add': props<{payload:Omit<Expense, 'id'>}>(),
      'Add Success': props<{expense:Expense}>(),
      'Add Failure': props<{error:string}>(),
      // Offline: guardado localmente con ID temporal
      'Add Offline': props<{expense:Expense, tempId:string}>(),
      // Sync: reemplaza el temporal por el real del backend
      'Sync Add Success': props<{expense:Expense, tempId:string}>(),

      // Update
      'Update': props<{id:string, changes: Partial<Omit<Expense,'id'>> }>(),
      'Update Success': props<{expense:Expense}>(),
      'Update Failure': props<{error:string}>(),
      // Offline: actualización optimista
      'Update Offline': props<{id:string, changes: Partial<Omit<Expense,'id'>>}>(),
      'Sync Update Success': props<{expense:Expense}>(),

      //Delete
      'Delete': props<{id:string}>(),
      'Delete Success': props<{ id: string }>(),
      'Delete Failure': props<{error:string}>(),
      // Offline: eliminación optimista
      'Delete Offline': props<{id:string}>(),

      'Category Filter Changed': props<{categoryId:string | null}>(),
      'Currency Filter Changed': props<{currency:'PEN' | 'USD' | null}>(),
      'Date From Changed': props<{dateFrom:string | null}>(),
      'Date To Changed': props<{dateTo:string | null}>(),
      'Filters Cleared': emptyProps()
    }
})
