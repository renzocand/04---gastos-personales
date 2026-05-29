import { DecimalPipe } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule } from 'lucide-angular';
import { Card } from '../../../../shared/ui/card/card';
import {
  ProgressBar,
  ProgressColor,
} from '../../../../shared/ui/progress-bar/progress-bar';
import { CategoryId } from '../../../categories/models/category';
import { CATEGORY_META } from '../../../categories/ui/category-meta';
import { AppCurrencyPipe } from '../../../../shared/pipes/app-currency';
import { BreakdownRow } from '../../store/dashboard.selectors';

const BAR_COLORS: Record<CategoryId, ProgressColor> = {
  food: 'violet',
  transport: 'indigo',
  leisure: 'amber',
  other: 'rose',
};

@Component({
  selector: 'app-category-breakdown',
  imports: [Card, ProgressBar, LucideAngularModule, AppCurrencyPipe, DecimalPipe],
  templateUrl: './category-breakdown.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryBreakdown {
  rows = input.required<BreakdownRow[]>();

  protected readonly displayRows = computed(() =>
    this.rows().map((row) => ({
      ...row,
      icon: CATEGORY_META[row.id].icon,
      iconClass: CATEGORY_META[row.id].iconClass,
      barColor: BAR_COLORS[row.id],
    })),
  );
}
