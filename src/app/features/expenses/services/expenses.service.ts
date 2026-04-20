import { Injectable } from '@angular/core';
import { delay, Observable, of } from 'rxjs';
import { Expense } from '../models/expense';

const MOCK_EXPENSES: Expense[] = [
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


@Injectable({
  providedIn: 'root'
})
export class ExpensesService {



  constructor() { }


  getAll():Observable<Expense[]>{
    return of(MOCK_EXPENSES).pipe(delay(500))
  }

  create(payload:Omit<Expense,'id'>):Observable<Expense>{
      const created: Expense = { ...payload, id: crypto.randomUUID() };
      return of(created).pipe(delay(500));
  }

}
