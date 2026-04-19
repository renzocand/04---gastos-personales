import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Card } from '../../../../shared/ui/card/card';
import { ExpenseCard } from '../../../expenses/components/expense-card/expense-card';

type ExpensePreview = {
  id: string;
  description: string;
  category: 'Comida' | 'Transporte' | 'Ocio' | 'Otro';
  amount: string;
  date: string;
};

@Component({
  selector: 'app-recent-expenses',
  imports: [Card, ExpenseCard, RouterLink],
  templateUrl: './recent-expenses.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RecentExpenses {
  protected readonly items: ExpensePreview[] = [
    { id: '1', description: 'Wong San Isidro', category: 'Comida', amount: 'S/ 158,40', date: 'Hoy, 14:20' },
    { id: '2', description: 'Uber a Miraflores', category: 'Transporte', amount: 'S/ 22,00', date: 'Hoy, 09:10' },
    { id: '3', description: 'Netflix', category: 'Ocio', amount: 'US$ 15,99', date: 'Ayer, 21:00' },
    { id: '4', description: 'Menú del día', category: 'Comida', amount: 'S/ 18,00', date: 'Ayer, 13:00' },
    { id: '5', description: 'Spotify', category: 'Ocio', amount: 'US$ 10,99', date: '15 abr, 09:00' },
  ];
}
