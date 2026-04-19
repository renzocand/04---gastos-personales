import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-card',
  template: `<ng-content />`,
  host: {
    class: 'block rounded-2xl border border-slate-200 bg-white shadow-sm',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Card {}
