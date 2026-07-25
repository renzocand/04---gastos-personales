import { CategoryId } from '../../categories/models/category';
import { Currency } from '../../expenses/models/expense';

export type ReceiptSource = 'TELEGRAM' | 'WEB' | 'API';

export interface ReceiptItem {
  id: string;
  description: string;
  amount: number;
  currency: Currency;
  categoryId: CategoryId;
  date: string;
}

export interface Receipt {
  id: string;
  vendor: string;
  date: string;
  total: number;
  currency: Currency;
  itemCount: number;
  source: ReceiptSource;
}

export interface ReceiptWithItems extends Receipt {
  items: ReceiptItem[];
}
