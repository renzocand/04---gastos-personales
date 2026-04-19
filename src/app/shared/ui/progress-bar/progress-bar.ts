import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export type ProgressColor = 'violet' | 'indigo' | 'emerald' | 'amber' | 'rose';

const BAR_CLASS: Record<ProgressColor, string> = {
  violet: 'bg-violet-500',
  indigo: 'bg-indigo-500',
  emerald: 'bg-emerald-500',
  amber: 'bg-amber-500',
  rose: 'bg-rose-500',
};

@Component({
  selector: 'ui-progress-bar',
  template: `
    <div
      class="h-2 w-full overflow-hidden rounded-full bg-slate-100"
      role="progressbar"
      [attr.aria-valuenow]="clamped()"
      aria-valuemin="0"
      aria-valuemax="100"
    >
      <div
        class="h-full rounded-full transition-[width] duration-500"
        [class]="barClass()"
        [style.width.%]="clamped()"
      ></div>
    </div>
  `,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ProgressBar {
  percent = input.required<number>();
  color = input<ProgressColor>('violet');

  protected readonly clamped = computed(() =>
    Math.max(0, Math.min(100, this.percent())),
  );
  protected readonly barClass = computed(() => BAR_CLASS[this.color()]);
}
