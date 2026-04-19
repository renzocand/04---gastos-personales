import { ChangeDetectionStrategy, Component, signal } from '@angular/core';
import { Receipt } from 'lucide-angular';
import { RouterLink } from '@angular/router';
import { Card } from '../../../../shared/ui/card/card';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { ErrorState } from '../../../../shared/ui/error-state/error-state';
import { Skeleton } from '../../../../shared/ui/skeleton/skeleton';
import { CategoryBreakdown } from '../../components/category-breakdown/category-breakdown';
import { RecentExpenses } from '../../components/recent-expenses/recent-expenses';
import { TotalCard } from '../../components/total-card/total-card';

@Component({
  selector: 'app-dashboard-page',
  imports: [
    TotalCard,
    CategoryBreakdown,
    RecentExpenses,
    Card,
    EmptyState,
    ErrorState,
    Skeleton,
    RouterLink,
  ],
  templateUrl: './dashboard-page.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class DashboardPage {
  protected readonly ReceiptIcon = Receipt;

  protected readonly loading = signal(false);
  protected readonly error = signal<string | null>(null);
  protected readonly hasExpenses = signal(true);
}
