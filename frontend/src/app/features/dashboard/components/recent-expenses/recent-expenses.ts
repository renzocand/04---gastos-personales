import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../../../shared/ui/card/card';
import { ExpenseCard } from '../../../expenses/components/expense-card/expense-card';
import { Expense } from '../../../expenses/models/expense';

@Component({
  selector: 'app-recent-expenses',
  imports: [Card, ExpenseCard, RouterLink, TranslocoModule],
  templateUrl: './recent-expenses.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentExpenses {
  items = input.required<Expense[]>();
}
