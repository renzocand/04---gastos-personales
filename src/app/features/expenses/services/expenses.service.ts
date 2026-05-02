import { Injectable } from '@angular/core';
import { delay, Observable, of, throwError } from 'rxjs';
import { Expense } from '../models/expense';
import { ExpenseFilters } from '../models/expense-filters';

const INITIAL_EXPENSES: Expense[] = [
  {
    id: 'e1',
    description: 'Wong San Isidro',
    amount: 158.40,
    currency: 'PEN',
    categoryId: 'food',
    date: '2026-04-19',
  },
  {
    id: 'e2',
    description: 'Uber a Miraflores',
    amount: 22.00,
    currency: 'PEN',
    categoryId: 'transport',
    date: '2026-04-19',
  },
  {
    id: 'e3',
    description: 'Netflix',
    amount: 15.99,
    currency: 'USD',
    categoryId: 'leisure',
    date: '2026-04-18',
  },
  {
    id: 'e4',
    description: 'Menú del día',
    amount: 18.00,
    currency: 'PEN',
    categoryId: 'food',
    date: '2026-04-18',
  },
  {
    id: 'e5',
    description: 'Spotify',
    amount: 10.99,
    currency: 'USD',
    categoryId: 'leisure',
    date: '2026-04-17',
  },
  {
    id: 'e6',
    description: 'Taxi aeropuerto',
    amount: 65.00,
    currency: 'PEN',
    categoryId: 'transport',
    date: '2026-04-15',
  },
  {
    id: 'e7',
    description: 'Farmacia Inkafarma',
    amount: 42.50,
    currency: 'PEN',
    categoryId: 'other',
    date: '2026-04-15',
  },
  {
    id: 'e8',
    description: 'Cineplanet',
    amount: 28.00,
    currency: 'PEN',
    categoryId: 'leisure',
    date: '2026-04-14',
  },
];

function applyFilters(expenses: Expense[], filters?: ExpenseFilters):Expense[]{

  if(!filters) return expenses;

   return expenses.filter(expense=>{

      const okCategory = filters.categoryId === null || expense.categoryId === filters.categoryId;
      const okCurrency = filters.currency === null || expense.currency === filters.currency;
      const okDateFrom = filters.dateFrom === null || expense.date >= filters.dateFrom;
      const okDateTo = filters.dateTo === null || expense.date <= filters.dateTo;

    return okCategory && okCurrency && okDateFrom && okDateTo
    })
}

const STORAGE_KEY = 'gastos-personales:expenses';

@Injectable({
  providedIn: 'root'
})
export class ExpensesService {

  private expenses: Expense[] = this.hydrate();

  private hydrate(): Expense[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return [...INITIAL_EXPENSES];
      const parsed = JSON.parse(raw) as Expense[];
      return Array.isArray(parsed) ? parsed : [...INITIAL_EXPENSES];
    } catch {
      return [...INITIAL_EXPENSES];
    }
  }

  private persist(): void {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(this.expenses));
  }

  getAll(filters?:ExpenseFilters): Observable<Expense[]> {
    const expensesFiltered = applyFilters(this.expenses,filters)
    return of(expensesFiltered).pipe(delay(500));
  }

  create(payload: Omit<Expense, 'id'>): Observable<Expense> {
    const created: Expense = { ...payload, id: crypto.randomUUID() };
    this.expenses = [created, ...this.expenses];
    this.persist();
    return of(created).pipe(delay(500));
  }

  update(id: string, changes: Partial<Omit<Expense, 'id'>>): Observable<Expense> {
    const current = this.expenses.find(e => e.id === id);
    if (!current) {
      return throwError(() => new Error(`Expense ${id} no encontrado`));
    }
    const updated: Expense = { ...current, ...changes };
    this.expenses = this.expenses.map(e => e.id === id ? updated : e);
    this.persist();
    return of(updated).pipe(delay(500));
  }

  delete(id: string): Observable<string> {
    const exists = this.expenses.some(e => e.id === id);
    if (!exists) {
      return throwError(() => new Error(`Expense ${id} no encontrado`));
    }
    this.expenses = this.expenses.filter(e => e.id !== id);
    this.persist();
    return of(id).pipe(delay(500));
  }



}



