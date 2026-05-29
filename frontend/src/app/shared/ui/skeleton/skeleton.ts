import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'ui-skeleton',
  template: '',
  host: {
    class: 'block animate-pulse rounded-md bg-slate-200',
    'aria-hidden': 'true',
  },
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Skeleton {}
