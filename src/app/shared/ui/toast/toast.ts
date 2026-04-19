import { ChangeDetectionStrategy, Component, computed, input, output } from '@angular/core';
import {
  CircleAlert,
  CircleCheck,
  Info,
  LucideAngularModule,
  X,
} from 'lucide-angular';

export type ToastVariant = 'success' | 'error' | 'info';

type VariantStyle = {
  icon: typeof CircleCheck;
  iconClass: string;
  ringClass: string;
};

const VARIANT: Record<ToastVariant, VariantStyle> = {
  success: {
    icon: CircleCheck,
    iconClass: 'text-emerald-600',
    ringClass: 'ring-emerald-600/20',
  },
  error: {
    icon: CircleAlert,
    iconClass: 'text-rose-600',
    ringClass: 'ring-rose-600/20',
  },
  info: {
    icon: Info,
    iconClass: 'text-violet-600',
    ringClass: 'ring-violet-600/20',
  },
};

@Component({
  selector: 'ui-toast',
  imports: [LucideAngularModule],
  template: `
    <div
      role="status"
      aria-live="polite"
      class="flex w-full items-start gap-3 rounded-lg bg-white px-4 py-3 shadow-lg ring-1"
      [class]="ringClass()"
    >
      <lucide-angular
        [img]="variantIcon()"
        class="size-5 flex-none"
        [class]="iconClass()"
      ></lucide-angular>
      <p class="min-w-0 flex-1 text-sm font-medium text-slate-900">
        {{ message() }}
      </p>
      @if (dismissible()) {
        <button
          type="button"
          (click)="dismissed.emit()"
          aria-label="Cerrar notificación"
          class="flex-none rounded-md p-0.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500"
        >
          <lucide-angular [img]="CloseIcon" class="size-4"></lucide-angular>
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Toast {
  message = input.required<string>();
  variant = input<ToastVariant>('info');
  dismissible = input(true);
  dismissed = output<void>();

  protected readonly CloseIcon = X;
  protected readonly variantIcon = computed(() => VARIANT[this.variant()].icon);
  protected readonly iconClass = computed(() => VARIANT[this.variant()].iconClass);
  protected readonly ringClass = computed(() => VARIANT[this.variant()].ringClass);
}
