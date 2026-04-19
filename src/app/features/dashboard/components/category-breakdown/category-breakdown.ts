import { ChangeDetectionStrategy, Component } from '@angular/core';
import {
  Bus,
  Gamepad2,
  LucideAngularModule,
  Package,
  UtensilsCrossed,
} from 'lucide-angular';
import { Card } from '../../../../shared/ui/card/card';
import {
  ProgressBar,
  ProgressColor,
} from '../../../../shared/ui/progress-bar/progress-bar';

type BreakdownRow = {
  id: string;
  label: string;
  amount: string;
  percent: number;
  icon: typeof UtensilsCrossed;
  iconClass: string;
  barColor: ProgressColor;
};

@Component({
  selector: 'app-category-breakdown',
  imports: [Card, ProgressBar, LucideAngularModule],
  templateUrl: './category-breakdown.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryBreakdown {
  protected readonly rows: BreakdownRow[] = [
    {
      id: 'comida',
      label: 'Comida',
      amount: 'S/ 462,10',
      percent: 37,
      icon: UtensilsCrossed,
      iconClass: 'bg-violet-100 text-violet-700',
      barColor: 'violet',
    },
    {
      id: 'transporte',
      label: 'Transporte',
      amount: 'S/ 312,00',
      percent: 25,
      icon: Bus,
      iconClass: 'bg-indigo-100 text-indigo-700',
      barColor: 'indigo',
    },
    {
      id: 'ocio',
      label: 'Ocio',
      amount: 'S/ 262,20',
      percent: 21,
      icon: Gamepad2,
      iconClass: 'bg-amber-100 text-amber-700',
      barColor: 'amber',
    },
    {
      id: 'otro',
      label: 'Otro',
      amount: 'S/ 212,20',
      percent: 17,
      icon: Package,
      iconClass: 'bg-rose-100 text-rose-700',
      barColor: 'rose',
    },
  ];
}
