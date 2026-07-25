import { ChangeDetectionStrategy, Component, computed, inject } from '@angular/core';
import { NetworkService } from '../../../core/offline/network.service';
import { SyncQueueService, SyncStatus } from '../../../core/offline/sync-queue.service';
import { LucideAngularModule, Cloud, CloudOff, RefreshCw, AlertCircle, Check } from 'lucide-angular';

const STATUS_CONFIG: Record<SyncStatus | 'online', { icon: typeof Cloud; class: string; label: string }> = {
  idle: { icon: Check, class: 'text-emerald-600', label: 'Sincronizado' },
  syncing: { icon: RefreshCw, class: 'text-violet-600 animate-spin', label: 'Sincronizando...' },
  error: { icon: AlertCircle, class: 'text-rose-600', label: 'Error de sync' },
  offline: { icon: CloudOff, class: 'text-amber-600', label: 'Sin conexión' },
  online: { icon: Cloud, class: 'text-emerald-600', label: 'Conectado' },
};

@Component({
  selector: 'ui-sync-indicator',
  imports: [LucideAngularModule],
  template: `
    <button
      type="button"
      class="relative flex items-center gap-1.5 rounded-lg px-2 py-1.5 text-sm transition-colors hover:bg-slate-100"
      [class]="config().class"
      [title]="config().label"
      (click)="onRetry()"
    >
      <lucide-angular [img]="config().icon" class="size-4" />

      @if (pendingCount() > 0) {
        <span class="absolute -right-1 -top-1 flex size-4 items-center justify-center rounded-full bg-amber-500 text-[10px] font-bold text-white">
          {{ pendingCount() > 9 ? '9+' : pendingCount() }}
        </span>
      }

      <span class="hidden sm:inline">{{ config().label }}</span>
    </button>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: { class: 'contents' },
})
export class SyncIndicator {
  private readonly network = inject(NetworkService);
  private readonly syncQueue = inject(SyncQueueService);

  protected readonly CloudIcon = Cloud;
  protected readonly CloudOffIcon = CloudOff;
  protected readonly RefreshCwIcon = RefreshCw;
  protected readonly AlertCircleIcon = AlertCircle;
  protected readonly CheckIcon = Check;

  protected readonly pendingCount = this.syncQueue.pendingCount;
  protected readonly status = this.syncQueue.status;
  protected readonly isOffline = this.network.isOffline;

  protected readonly config = computed(() => {
    if (this.isOffline()) {
      return STATUS_CONFIG.offline;
    }
    return STATUS_CONFIG[this.status()];
  });

  protected onRetry(): void {
    if (this.status() === 'error') {
      this.syncQueue.retryFailed();
    } else if (this.pendingCount() > 0 && this.network.isOnline()) {
      this.syncQueue.processQueue();
    }
  }
}
