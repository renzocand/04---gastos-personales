import { Routes } from '@angular/router';
import { expensesFeature } from './features/expenses/store/expenses.feature';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { ExpensesEffects } from './features/expenses/store/expenses.effects';
import { exchangeRateFeature } from './features/exchange-rate/store/exchange-rate.feature';
import { ExchangeRateEffects } from './features/exchange-rate/store/exchange-rate.effects';

export const routes: Routes = [
  {
    path: '',
    providers:[
      provideState(expensesFeature),
      provideState(exchangeRateFeature),
      provideEffects(ExpensesEffects,ExchangeRateEffects)
    ],
    loadComponent: () =>
      import('./core/layout/app-shell/app-shell').then((m) => m.AppShell),
    children: [
      { path: '', pathMatch: 'full', redirectTo: 'dashboard' },
      {
        path: 'dashboard',
        loadComponent: () =>
          import(
            './features/dashboard/pages/dashboard-page/dashboard-page'
          ).then((m) => m.DashboardPage),
      },
      {
        path: 'expenses',
        loadComponent: () =>
          import(
            './features/expenses/pages/expenses-list/expenses-list'
          ).then((m) => m.ExpensesList),
      },
      {
        path: 'expenses/new',
        data: { mode: 'create' },
        loadComponent: () =>
          import(
            './features/expenses/pages/expense-form/expense-form'
          ).then((m) => m.ExpenseForm),
      },
      {
        path: 'expenses/:id/edit',
        data: { mode: 'edit' },
        loadComponent: () =>
          import(
            './features/expenses/pages/expense-form/expense-form'
          ).then((m) => m.ExpenseForm),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./core/layout/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
