import { Injectable, inject, signal, computed, effect } from '@angular/core';
import { IndexedDbService, SyncQueueItem } from '../storage/indexed-db.service';
import { NetworkService } from './network.service';
import { Store } from '@ngrx/store';
import { ExpensesService } from '../../features/expenses/services/expenses.service';
import { ExpensesActions } from '../../features/expenses/store/expenses.actions';
import { firstValueFrom } from 'rxjs';

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'offline';

@Injectable({ providedIn: 'root' })
export class SyncQueueService {
  private readonly db = inject(IndexedDbService);
  private readonly network = inject(NetworkService);
  private readonly store = inject(Store);
  private readonly expensesService = inject(ExpensesService);

  private readonly _pendingCount = signal(0);
  private readonly _status = signal<SyncStatus>('idle');
  private readonly _lastError = signal<string | null>(null);

  readonly pendingCount = this._pendingCount.asReadonly();
  readonly status = this._status.asReadonly();
  readonly lastError = this._lastError.asReadonly();

  readonly hasPending = computed(() => this._pendingCount() > 0);

  constructor() {
    // Sincronizar cuando vuelve la conexión
    effect(() => {
      if (this.network.isOnline() && this._pendingCount() > 0) {
        this.processQueue();
      }
    });

    // Cargar cuenta inicial
    this.refreshPendingCount();
  }

  async refreshPendingCount(): Promise<void> {
    const count = await this.db.getQueueCount();
    this._pendingCount.set(count);
    this._status.set(this.network.isOffline() ? 'offline' : count > 0 ? 'idle' : 'idle');
  }

  async enqueue(actionType: string, payload: unknown, tempId?: string): Promise<SyncQueueItem> {
    const item = await this.db.addToQueue({ actionType, payload, tempId });
    await this.refreshPendingCount();
    return item;
  }

  async processQueue(): Promise<void> {
    if (!this.network.isOnline()) {
      this._status.set('offline');
      return;
    }

    const pending = await this.db.getPendingQueue();
    if (pending.length === 0) {
      this._status.set('idle');
      return;
    }

    this._status.set('syncing');

    for (const item of pending) {
      try {
        await this.db.updateQueueItem(item.id, { status: 'processing' });
        await this.processItem(item);
        await this.db.removeFromQueue(item.id);
      } catch (error) {
        const newRetries = item.retries + 1;
        if (newRetries >= 3) {
          await this.db.updateQueueItem(item.id, { status: 'failed', retries: newRetries });
          this._lastError.set(`Error sincronizando: ${(error as Error).message}`);
          this._status.set('error');
        } else {
          await this.db.updateQueueItem(item.id, { status: 'pending', retries: newRetries });
        }
      }
    }

    await this.refreshPendingCount();
    if (this._pendingCount() === 0 && this._status() !== 'error') {
      this._status.set('idle');
    }
  }

  private async processItem(item: SyncQueueItem): Promise<void> {
    switch (item.actionType) {
      case 'expenses/add': {
        const payload = item.payload as { amount: number; description: string; categoryId: string; currency: 'PEN' | 'USD'; date: string };
        const expense = await firstValueFrom(this.expensesService.create(payload));
        // Reemplazar el item temporal con el real
        if (item.tempId) {
          this.store.dispatch(ExpensesActions.syncAddSuccess({ expense, tempId: item.tempId }));
        }
        break;
      }

      case 'expenses/update': {
        const { id, changes } = item.payload as { id: string; changes: Record<string, unknown> };
        const expense = await firstValueFrom(this.expensesService.update(id, changes));
        this.store.dispatch(ExpensesActions.syncUpdateSuccess({ expense }));
        break;
      }

      case 'expenses/delete': {
        const { id } = item.payload as { id: string };
        await firstValueFrom(this.expensesService.delete(id));
        // Ya fue eliminado optimísticamente
        break;
      }
    }
  }

  async retryFailed(): Promise<void> {
    const all = await this.db.getAllQueueItems();
    const failed = all.filter(item => item.status === 'failed');

    for (const item of failed) {
      await this.db.updateQueueItem(item.id, { status: 'pending', retries: 0 });
    }

    this._lastError.set(null);
    await this.refreshPendingCount();
    this.processQueue();
  }

  async clearFailed(): Promise<void> {
    const all = await this.db.getAllQueueItems();
    const failed = all.filter(item => item.status === 'failed');

    for (const item of failed) {
      await this.db.removeFromQueue(item.id);
    }

    this._lastError.set(null);
    this._status.set('idle');
    await this.refreshPendingCount();
  }
}
