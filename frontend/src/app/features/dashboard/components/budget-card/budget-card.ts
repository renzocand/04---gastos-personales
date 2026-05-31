import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, Wallet } from 'lucide-angular';
import { Card } from '../../../../shared/ui/card/card';
import { ProgressBar, ProgressColor } from '../../../../shared/ui/progress-bar/progress-bar';
import { AppCurrencyPipe } from '../../../../shared/pipes/app-currency';
import { BudgetStatus } from '../../store/budget';

@Component({
  selector: 'app-budget-card',
  imports: [Card, RouterLink, LucideAngularModule, ProgressBar, AppCurrencyPipe],
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

  protected readonly message = computed(() => {
    switch (this.status().level) {
      case 'danger':
        return 'Superaste tu ingreso de este mes.';
      case 'warning':
        return 'Vas muy cerca de tu ingreso mensual.';
      case 'info':
        return 'Llevas más de la mitad de tu ingreso.';
      default:
        return 'Vas bien con tus gastos este mes.';
    }
  });
}
