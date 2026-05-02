export type ExpenseFilters = {
  categoryId: string | null;
  currency: 'PEN' | 'USD' | null;
  dateFrom: string | null;     // ISO yyyy-mm-dd
  dateTo: string | null;
};
