import { createFeature, createReducer, on } from '@ngrx/store';
import { ReceiptsActions } from './receipts.actions';
import { Receipt, ReceiptWithItems } from '../models/receipt';

export interface ReceiptsState {
  receipts: Receipt[];
  selectedReceipt: ReceiptWithItems | null;
  loading: boolean;
  loadingDetail: boolean;
  error: string | null;
}

const initialState: ReceiptsState = {
  receipts: [],
  selectedReceipt: null,
  loading: false,
  loadingDetail: false,
  error: null,
};

export const receiptsFeature = createFeature({
  name: 'receipts',
  reducer: createReducer(
    initialState,
    // Load list
    on(ReceiptsActions.load, (state) => ({ ...state, loading: true, error: null })),
    on(ReceiptsActions.loadSuccess, (state, { receipts }) => ({
      ...state,
      receipts,
      loading: false,
      error: null,
    })),
    on(ReceiptsActions.loadFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    // Load detail
    on(ReceiptsActions.loadDetail, (state) => ({
      ...state,
      loadingDetail: true,
      error: null,
    })),
    on(ReceiptsActions.loadDetailSuccess, (state, { receipt }) => ({
      ...state,
      selectedReceipt: receipt,
      loadingDetail: false,
      error: null,
    })),
    on(ReceiptsActions.loadDetailFailure, (state, { error }) => ({
      ...state,
      loadingDetail: false,
      error,
    })),

    // Delete
    on(ReceiptsActions.delete, (state) => ({ ...state, loading: true, error: null })),
    on(ReceiptsActions.deleteSuccess, (state, { id }) => ({
      ...state,
      receipts: state.receipts.filter((r) => r.id !== id),
      selectedReceipt: state.selectedReceipt?.id === id ? null : state.selectedReceipt,
      loading: false,
      error: null,
    })),
    on(ReceiptsActions.deleteFailure, (state, { error }) => ({
      ...state,
      loading: false,
      error,
    })),

    // Clear selected
    on(ReceiptsActions.clearSelected, (state) => ({
      ...state,
      selectedReceipt: null,
    }))
  ),
});
