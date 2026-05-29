import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CircleAlert, LucideAngularModule } from 'lucide-angular';

@Component({
  selector: 'ui-error-state',
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center px-6 py-10 text-center">
      <div
        class="flex size-12 items-center justify-center rounded-full bg-rose-50 text-rose-600"
        aria-hidden="true"
      >
        <lucide-angular [img]="AlertIcon" class="size-6"></lucide-angular>
      </div>
      <p class="mt-4 text-sm font-semibold text-slate-900">{{ title() }}</p>
      @if (message()) {
        <p class="mt-1 max-w-sm text-sm text-slate-500">{{ message() }}</p>
      }
      @if (showRetry()) {
        <button
          type="button"
          (click)="retry.emit()"
          class="mt-5 inline-flex items-center rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-violet-500 focus-visible:ring-offset-2"
        >
          Reintentar
        </button>
      }
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ErrorState {
  title = input('Algo salió mal');
  message = input<string>();
  showRetry = input(true);
  retry = output<void>();

  protected readonly AlertIcon = CircleAlert;
}
