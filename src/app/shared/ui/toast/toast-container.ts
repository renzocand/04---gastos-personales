import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { Toast, ToastVariant } from './toast';

export type ToastMessage = {
  id: string;
  message: string;
  variant?: ToastVariant;
};

@Component({
  selector: 'ui-toast-container',
  imports: [Toast],
  template: `
    <div
      class="pointer-events-none fixed inset-x-0 bottom-0 z-50 flex flex-col items-center gap-2 px-4 pb-4 sm:items-end sm:pb-6 sm:pr-6"
      aria-live="polite"
      aria-atomic="false"
    >
      @for (toast of toasts(); track toast.id) {
        <div class="pointer-events-auto w-full max-w-sm">
          <ui-toast
            [message]="toast.message"
            [variant]="toast.variant ?? 'info'"
            (dismissed)="dismiss.emit(toast.id)"
          />
        </div>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ToastContainer {
  toasts = input<ToastMessage[]>([]);
  dismiss = output<string>();
}
