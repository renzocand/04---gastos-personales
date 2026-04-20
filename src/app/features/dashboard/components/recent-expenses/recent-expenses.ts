import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from '../../../../shared/ui/card/card';
import { ExpenseCard } from '../../../expenses/components/expense-card/expense-card';
import { Expense } from '../../../expenses/models/expense';

@Component({
  selector: 'app-recent-expenses',
  imports: [Card, ExpenseCard, RouterLink],
  templateUrl: './recent-expenses.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentExpenses {
  protected readonly items: Expense[] = [
    { id: 'e1', description: 'Wong San Isidro', amount: 158.40, currency: 'PEN', categoryId: 'food',      date: '2026-04-19' },
    { id: 'e2', description: 'Uber a Miraflores', amount: 22.00, currency: 'PEN', categoryId: 'transport', date: '2026-04-19' },
    { id: 'e3', description: 'Netflix', amount: 15.99, currency: 'USD', categoryId: 'leisure',   date: '2026-04-18' },
    { id: 'e4', description: 'Menú del día', amount: 18.00, currency: 'PEN', categoryId: 'food',      date: '2026-04-18' },
    { id: 'e5', description: 'Spotify', amount: 10.99, currency: 'USD', categoryId: 'leisure',   date: '2026-04-17' },
  ];
}
