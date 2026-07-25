import { createSelector } from '@ngrx/store';
import { receiptsFeature } from './receipts.feature';

export const selectHasReceipts = createSelector(
  receiptsFeature.selectReceipts,
  (receipts) => receipts.length > 0
);

export const selectReceiptById = (id: string) =>
  createSelector(receiptsFeature.selectReceipts, (receipts) =>
    receipts.find((r) => r.id === id)
  );
