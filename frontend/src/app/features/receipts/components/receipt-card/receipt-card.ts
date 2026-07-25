import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { LucideAngularModule, MessageCircle, Globe } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { Receipt } from '../../models/receipt';

@Component({
  selector: 'app-receipt-card',
  imports: [LucideAngularModule, TranslocoModule],
  templateUrl: './receipt-card.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptCard {
  receipt = input.required<Receipt>();

  protected readonly TelegramIcon = MessageCircle;
  protected readonly WebIcon = Globe;

  protected readonly sourceIcon = computed(() =>
    this.receipt().source === 'TELEGRAM' ? this.TelegramIcon : this.WebIcon
  );

  protected readonly formattedTotal = computed(() => {
    const r = this.receipt();
    const symbol = r.currency === 'PEN' ? 'S/' : 'US$';
    const n = new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(r.total);
    return `${symbol} ${n}`;
  });

  protected readonly formattedDate = computed(() => {
    const d = new Date(this.receipt().date);
    return new Intl.DateTimeFormat('es-PE', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(d);
  });
}
