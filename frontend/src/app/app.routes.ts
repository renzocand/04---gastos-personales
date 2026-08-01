import { Routes } from '@angular/router';
import { expensesFeature } from './features/expenses/store/expenses.feature';
import { provideState } from '@ngrx/store';
import { provideEffects } from '@ngrx/effects';
import { ExpensesEffects } from './features/expenses/store/expenses.effects';
import { exchangeRateFeature } from './features/exchange-rate/store/exchange-rate.feature';
import { ExchangeRateEffects } from './features/exchange-rate/store/exchange-rate.effects';
import { categoryFeature } from './features/categories/store/category.feature';
import { CategoryEffects } from './features/categories/store/category.effects';
import { receiptsFeature } from './features/receipts/store/receipts.feature';
import { ReceiptsEffects } from './features/receipts/store/receipts.effects';
import { authGuard, guestGuard } from './core/guards/auth-guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/login/login').then((m) => m.LoginPage),
  },
  {
    path: 'register',
    canActivate: [guestGuard],
    loadComponent: () =>
      import('./features/auth/pages/register/register').then((m) => m.RegisterPage),
  },
  {
    path: '',
    canActivate: [authGuard],
    providers:[
      provideState(expensesFeature),
      provideState(exchangeRateFeature),
      provideState(categoryFeature),
      provideState(receiptsFeature),
      provideEffects(ExpensesEffects,ExchangeRateEffects,CategoryEffects,ReceiptsEffects)
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
        path: 'receipts',
        loadComponent: () =>
          import(
            './features/receipts/pages/receipts-list/receipts-list'
          ).then((m) => m.ReceiptsList),
      },
      {
        path: 'receipts/:id',
        loadComponent: () =>
          import(
            './features/receipts/pages/receipt-detail/receipt-detail'
          ).then((m) => m.ReceiptDetail),
      },
      {
        path: 'categories',
        loadComponent: () =>
          import(
            './features/categories/pages/categories-list/categories-list'
          ).then((m) => m.CategoriesList),
      },
      {
        path: 'categories/new',
        data: { mode: 'create' },
        loadComponent: () =>
          import(
            './features/categories/pages/category-form/category-form'
          ).then((m) => m.CategoryForm),
      },
      {
        path: 'categories/:id/edit',
        data: { mode: 'edit' },
        loadComponent: () =>
          import(
            './features/categories/pages/category-form/category-form'
          ).then((m) => m.CategoryForm),
      },
      {
        path: 'settings',
        loadComponent: () =>
          import(
            './features/settings/pages/settings-page/settings-page'
          ).then((m) => m.SettingsPage),
      },
      {
        path: '**',
        loadComponent: () =>
          import('./core/layout/not-found/not-found').then((m) => m.NotFound),
      },
    ],
  },
];
