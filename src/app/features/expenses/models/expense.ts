import { CategoryId } from "../../categories/models/category";

export type Currency = 'PEN' | 'USD';
export interface Expense {
  id:string,
  currency: Currency,
  amount: number,
  description: string,
  categoyId: CategoryId,
  date:string
}
