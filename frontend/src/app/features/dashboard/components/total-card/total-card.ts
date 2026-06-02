import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule, TrendingDown, TrendingUp } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../../../shared/ui/card/card';

@Component({
  selector: 'app-total-card',
  imports: [Card, LucideAngularModule, TranslocoModule],
  templateUrl: './total-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TotalCard {
  total = input.required<string>();
  variation = input<number>(0);

  protected readonly isIncrease = computed(() => this.variation() > 0);
  protected readonly trendIcon = computed(() =>
    this.isIncrease() ? TrendingUp : TrendingDown,
  );
}
