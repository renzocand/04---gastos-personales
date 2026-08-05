import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../../../shared/ui/card/card';
import {
  ProgressBar,
  ProgressColor,
} from '../../../../shared/ui/progress-bar/progress-bar';
import { iconFor } from '../../../categories/ui/category-display';
import { AppCurrencyPipe } from '../../../../shared/pipes/app-currency';
import { BreakdownRow } from '../../store/dashboard.selectors';

// Paleta de colores para barras de progreso (solo los colores definidos en ProgressColor)
const BAR_COLOR_PALETTE: ProgressColor[] = [
  'violet',
  'indigo',
  'emerald',
  'amber',
  'rose',
];

// Paleta de clases CSS para iconos (misma paleta que las barras)
const ICON_COLOR_PALETTE = [
  'bg-violet-100 text-violet-700',
  'bg-indigo-100 text-indigo-700',
  'bg-emerald-100 text-emerald-700',
  'bg-amber-100 text-amber-700',
  'bg-rose-100 text-rose-700',
];

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
      iconClass: ICON_COLOR_PALETTE[row.colorIndex % ICON_COLOR_PALETTE.length],
      barColor: BAR_COLOR_PALETTE[row.colorIndex % BAR_COLOR_PALETTE.length],
    })),
  );
}
