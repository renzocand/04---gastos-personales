import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  CircleAlert,
  CircleCheck,
  Info,
  LucideAngularModule,
  TriangleAlert,
  Wallet,
} from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../../../shared/ui/card/card';
import { ProgressBar, ProgressColor } from '../../../../shared/ui/progress-bar/progress-bar';
import { AppCurrencyPipe } from '../../../../shared/pipes/app-currency';
import { BudgetStatus } from '../../store/budget';

@Component({
  selector: 'app-budget-card',
  imports: [Card, RouterLink, LucideAngularModule, ProgressBar, AppCurrencyPipe, TranslocoModule],
  templateUrl: './budget-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class BudgetCard {
  status = input.required<BudgetStatus>();

  protected readonly WalletIcon = Wallet;

  /** El usuario configuró un ingreso (> 0). */
  protected readonly hasIncome = computed(() => this.status().income != null);

  protected readonly percentRounded = computed(() => Math.round(this.status().percent));

  protected readonly barColor = computed<ProgressColor>(() => {
    switch (this.status().level) {
      case 'danger':
      case 'warning':
        return 'rose';
      case 'info':
        return 'amber';
      default:
        return 'emerald';
    }
  });

  /**
   * Icono por nivel: el estado del presupuesto NO se comunica solo por color
   * (a11y · ODS 10), también por icono y texto para daltonismo/baja visión.
   */
  protected readonly levelIcon = computed(() => {
    switch (this.status().level) {
      case 'danger':
        return CircleAlert;
      case 'warning':
        return TriangleAlert;
      case 'info':
        return Info;
      default:
        return CircleCheck;
    }
  });
}
