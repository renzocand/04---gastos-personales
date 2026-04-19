import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { LucideAngularModule, Receipt } from 'lucide-angular';

@Component({
  selector: 'ui-empty-state',
  imports: [LucideAngularModule],
  template: `
    <div class="flex flex-col items-center justify-center px-6 py-12 text-center">
      <div
        class="flex size-14 items-center justify-center rounded-full bg-slate-100 text-slate-500"
        aria-hidden="true"
      >
        <lucide-angular [img]="icon()" class="size-7"></lucide-angular>
      </div>
      <p class="mt-4 text-base font-semibold text-slate-900">{{ title() }}</p>
      @if (message()) {
        <p class="mt-1 max-w-sm text-sm text-slate-500">{{ message() }}</p>
      }
      <div class="mt-5">
        <ng-content />
      </div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class EmptyState {
  icon = input<typeof Receipt>(Receipt);
  title = input.required<string>();
  message = input<string>();
}
