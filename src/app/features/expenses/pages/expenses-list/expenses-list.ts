import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  Bus,
  Gamepad2,
  LucideAngularModule,
  Package,
  Receipt,
  SlidersHorizontal,
  UtensilsCrossed,
} from 'lucide-angular';
import { Card } from '../../../../shared/ui/card/card';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { ErrorState } from '../../../../shared/ui/error-state/error-state';
import { Skeleton } from '../../../../shared/ui/skeleton/skeleton';
import { ExpenseCard } from '../../components/expense-card/expense-card';

type CategoryFilter = {
  id: 'all' | 'comida' | 'transporte' | 'ocio' | 'otro';
  label: string;
  icon?: typeof UtensilsCrossed;
  default?: boolean;
};

type CurrencyFilter = {
  id: 'all' | 'PEN' | 'USD';
  label: string;
  default?: boolean;
};

type ExpenseItem = {
  id: string;
  description: string;
  category: 'Comida' | 'Transporte' | 'Ocio' | 'Otro';
  amount: string;
  date: string;
};

type ExpenseGroup = {
  label: string;
  count: number;
  items: ExpenseItem[];
};

@Component({
  selector: 'app-expenses-list',
  imports: [
    Card,
    ExpenseCard,
    EmptyState,
    ErrorState,
    Skeleton,
    RouterLink,
    LucideAngularModule,
  ],
  templateUrl: './expenses-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpensesList {
  protected readonly FilterIcon = SlidersHorizontal;
  protected readonly ReceiptIcon = Receipt;

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly hasExpenses = signal(true);

  protected readonly categoryFilters: CategoryFilter[] = [
    { id: 'all', label: 'Todas', default: true },
    { id: 'comida', label: 'Comida', icon: UtensilsCrossed },
    { id: 'transporte', label: 'Transporte', icon: Bus },
    { id: 'ocio', label: 'Ocio', icon: Gamepad2 },
    { id: 'otro', label: 'Otro', icon: Package },
  ];

  protected readonly currencyFilters: CurrencyFilter[] = [
    { id: 'all', label: 'Todas', default: true },
    { id: 'PEN', label: 'S/ Soles' },
    { id: 'USD', label: 'US$ Dólares' },
  ];

  protected readonly groups: ExpenseGroup[] = [
    {
      label: 'Hoy',
      count: 2,
      items: [
        { id: '1', description: 'Wong San Isidro', category: 'Comida', amount: 'S/ 158,40', date: '14:20' },
        { id: '2', description: 'Uber a Miraflores', category: 'Transporte', amount: 'S/ 22,00', date: '09:10' },
      ],
    },
    {
      label: 'Ayer',
      count: 2,
      items: [
        { id: '3', description: 'Netflix', category: 'Ocio', amount: 'US$ 15,99', date: '21:00' },
        { id: '4', description: 'Menú del día', category: 'Comida', amount: 'S/ 18,00', date: '13:00' },
      ],
    },
    {
      label: 'Martes, 15 abr',
      count: 3,
      items: [
        { id: '5', description: 'Spotify', category: 'Ocio', amount: 'US$ 10,99', date: '09:00' },
        { id: '6', description: 'Taxi aeropuerto', category: 'Transporte', amount: 'S/ 65,00', date: '19:30' },
        { id: '7', description: 'Farmacia Inkafarma', category: 'Otro', amount: 'S/ 42,50', date: '12:15' },
      ],
    },
    {
      label: 'Lunes, 14 abr',
      count: 2,
      items: [
        { id: '8', description: 'Almuerzo en el trabajo', category: 'Comida', amount: 'S/ 35,00', date: '13:30' },
        { id: '9', description: 'Cineplanet', category: 'Ocio', amount: 'S/ 28,00', date: '20:00' },
      ],
    },
  ];
}
