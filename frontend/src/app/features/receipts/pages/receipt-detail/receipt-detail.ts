import { Location } from '@angular/common';
import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  input,
  OnInit,
  OnDestroy,
  signal,
} from '@angular/core';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import {
  ArrowLeft,
  LucideAngularModule,
  Trash2,
  MessageCircle,
  Globe,
  Pencil,
  Check,
  X,
} from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { toSignal } from '@angular/core/rxjs-interop';
import { Card } from '../../../../shared/ui/card/card';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { Skeleton } from '../../../../shared/ui/skeleton/skeleton';
import { ErrorState } from '../../../../shared/ui/error-state/error-state';
import { receiptsFeature, ReceiptsState } from '../../store/receipts.feature';
import { ReceiptsActions } from '../../store/receipts.actions';
import { selectCategoryEntities } from '../../../categories/store/category.selectors';
import { iconFor, colorFor } from '../../../categories/ui/category-display';

@Component({
  selector: 'app-receipt-detail',
  imports: [
    Card,
    RouterLink,
    LucideAngularModule,
    ConfirmDialog,
    TranslocoModule,
    Skeleton,
    ErrorState,
    FormsModule,
  ],
  templateUrl: './receipt-detail.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ReceiptDetail implements OnInit, OnDestroy {
  id = input.required<string>();

  protected readonly location = inject(Location);
  private readonly store: Store<ReceiptsState> = inject(Store);

  protected readonly ArrowLeftIcon = ArrowLeft;
  protected readonly TrashIcon = Trash2;
  protected readonly TelegramIcon = MessageCircle;
  protected readonly WebIcon = Globe;
  protected readonly PencilIcon = Pencil;
  protected readonly CheckIcon = Check;
  protected readonly XIcon = X;

  // Edit state
  protected isEditing = signal(false);
  protected editDate = signal('');
  protected editVendor = signal('');

  protected readonly receipt = toSignal(
    this.store.select(receiptsFeature.selectSelectedReceipt)
  );
  protected readonly loading = toSignal(
    this.store.select(receiptsFeature.selectLoadingDetail),
    { requireSync: true }
  );
  protected readonly error = toSignal(
    this.store.select(receiptsFeature.selectError)
  );

  private readonly categoryEntities = this.store.selectSignal(
    selectCategoryEntities
  );

  protected readonly formattedDate = computed(() => {
    const r = this.receipt();
    if (!r) return '';
    const d = new Date(r.date);
    return new Intl.DateTimeFormat('es-PE', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(d);
  });

  protected readonly formattedTotal = computed(() => {
    const r = this.receipt();
    if (!r) return '';
    // Derive currency from first item, default to PEN
    const currency = r.items?.[0]?.currency ?? 'PEN';
    const symbol = currency === 'PEN' ? 'S/' : 'US$';
    const n = new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(r.total);
    return `${symbol} ${n}`;
  });

  protected readonly sourceIcon = computed(() =>
    this.receipt()?.source === 'TELEGRAM' ? this.TelegramIcon : this.WebIcon
  );

  protected readonly iconFor = iconFor;
  protected readonly colorFor = colorFor;

  protected getCategoryName(categoryId: string): string {
    return this.categoryEntities()[categoryId]?.name ?? categoryId;
  }

  protected formatAmount(amount: number, currency: 'PEN' | 'USD'): string {
    const symbol = currency === 'PEN' ? 'S/' : 'US$';
    const n = new Intl.NumberFormat('es-PE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(amount);
    return `${symbol} ${n}`;
  }

  ngOnInit(): void {
    this.store.dispatch(ReceiptsActions.loadDetail({ id: this.id() }));
  }

  ngOnDestroy(): void {
    this.store.dispatch(ReceiptsActions.clearSelected());
  }

  protected onDeleteConfirmed(): void {
    this.store.dispatch(ReceiptsActions.delete({ id: this.id() }));
  }

  protected startEditing(): void {
    const r = this.receipt();
    if (r) {
      this.editDate.set(r.date);
      this.editVendor.set(r.vendor);
      this.isEditing.set(true);
    }
  }

  protected cancelEditing(): void {
    this.isEditing.set(false);
  }

  protected saveEditing(): void {
    this.store.dispatch(
      ReceiptsActions.update({
        id: this.id(),
        data: {
          date: this.editDate(),
          vendor: this.editVendor() || undefined,
        },
      })
    );
    this.isEditing.set(false);
  }
}
