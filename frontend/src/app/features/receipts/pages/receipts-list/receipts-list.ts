import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { LucideAngularModule, FileText } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { Store } from '@ngrx/store';
import { toSignal } from '@angular/core/rxjs-interop';
import { Card } from '../../../../shared/ui/card/card';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { ErrorState } from '../../../../shared/ui/error-state/error-state';
import { Skeleton } from '../../../../shared/ui/skeleton/skeleton';
import { ReceiptCard } from '../../components/receipt-card/receipt-card';
import { receiptsFeature, ReceiptsState } from '../../store/receipts.feature';
import { ReceiptsActions } from '../../store/receipts.actions';
import { selectHasReceipts } from '../../store/receipts.selectors';

@Component({
  selector: 'app-receipts-list',
  imports: [
    Card,
    ReceiptCard,
    EmptyState,
    ErrorState,
    Skeleton,
    RouterLink,
    LucideAngularModule,
    TranslocoModule,
  ],
  templateUrl: './receipts-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptsList implements OnInit {
  private store: Store<ReceiptsState> = inject(Store);

  protected readonly ReceiptIcon = FileText;

  protected readonly receipts = toSignal(
    this.store.select(receiptsFeature.selectReceipts),
    { requireSync: true }
  );
  protected readonly loading = toSignal(
    this.store.select(receiptsFeature.selectLoading),
    { requireSync: true }
  );
  protected readonly error = toSignal(
    this.store.select(receiptsFeature.selectError),
    { requireSync: true }
  );
  protected readonly hasReceipts = toSignal(
    this.store.select(selectHasReceipts),
    { requireSync: true }
  );

  ngOnInit(): void {
    this.store.dispatch(ReceiptsActions.load());
  }
}
