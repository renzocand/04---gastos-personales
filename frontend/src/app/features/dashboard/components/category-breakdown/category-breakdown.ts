import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../../../shared/ui/card/card';
import {
  ProgressBar,
  ProgressColor,
} from '../../../../shared/ui/progress-bar/progress-bar';
import { colorFor, iconFor } from '../../../categories/ui/category-display';
import { AppCurrencyPipe } from '../../../../shared/pipes/app-currency';
import { BreakdownRow } from '../../store/dashboard.selectors';

// Color de la barra por id de categoría (paleta reusada; cae a 'violet').
const BAR_COLORS: Record<string, ProgressColor> = {
  food: 'violet',
  transport: 'indigo',
  housing: 'emerald',
  services: 'indigo',
  health: 'rose',
  education: 'indigo',
  leisure: 'amber',
  shopping: 'violet',
  other: 'rose',
};

@Component({
  selector: 'app-category-breakdown',
  imports: [Card, ProgressBar, LucideAngularModule, AppCurrencyPipe, DecimalPipe, TranslocoModule],
  templateUrl: './category-breakdown.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryBreakdown {
  rows = input.required<BreakdownRow[]>();

  protected readonly displayRows = computed(() =>
    this.rows().map((row) => ({
      ...row,
      icon: iconFor(row.icon),
      iconClass: colorFor(row.id),
      barColor: BAR_COLORS[row.id] ?? 'violet',
    })),
  );
}
