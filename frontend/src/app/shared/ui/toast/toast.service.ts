import { Injectable, signal } from '@angular/core';
import { ToastMessage } from './toast-container';
import { ToastVariant } from './toast';

const AUTO_DISMISS_MS = 5000;

/**
 * Servicio liviano (basado en signals) para mostrar toasts desde cualquier
 * parte de la app. El AppShell renderiza `toasts()` en el <ui-toast-container>.
 * Cada toast se descarta solo tras unos segundos, o manualmente vía dismiss().
 */
@Injectable({ providedIn: 'root' })
export class ToastService {
  private seq = 0;
  readonly toasts = signal<ToastMessage[]>([]);

  show(message: string, variant: ToastVariant = 'info'): void {
    const id = `toast-${this.seq++}`;
    this.toasts.update((list) => [...list, { id, message, variant }]);
    setTimeout(() => this.dismiss(id), AUTO_DISMISS_MS);
  }

  dismiss(id: string): void {
    this.toasts.update((list) => list.filter((t) => t.id !== id));
  }
}
