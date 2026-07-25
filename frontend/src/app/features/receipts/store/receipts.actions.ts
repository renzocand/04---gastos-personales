import { createActionGroup, emptyProps, props } from '@ngrx/store';
import { Receipt, ReceiptWithItems } from '../models/receipt';

export const ReceiptsActions = createActionGroup({
  source: 'Receipts',
  events: {
    // Load list
    'Load': emptyProps(),
    'Load Success': props<{ receipts: Receipt[] }>(),
    'Load Failure': props<{ error: string }>(),

    // Load detail
    'Load Detail': props<{ id: string }>(),
    'Load Detail Success': props<{ receipt: ReceiptWithItems }>(),
    'Load Detail Failure': props<{ error: string }>(),

    // Delete
    'Delete': props<{ id: string }>(),
    'Delete Success': props<{ id: string }>(),
    'Delete Failure': props<{ error: string }>(),

    // Clear selected
    'Clear Selected': emptyProps(),
  },
});
