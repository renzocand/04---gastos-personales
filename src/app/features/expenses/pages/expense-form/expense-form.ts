import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import {
  ArrowLeft,
  Bus,
  Gamepad2,
  LucideAngularModule,
  Package,
  Trash2,
  UtensilsCrossed,
} from 'lucide-angular';
import { Card } from '../../../../shared/ui/card/card';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';

type CategoryOption = {
  id: 'comida' | 'transporte' | 'ocio' | 'otro';
  label: string;
  icon: typeof UtensilsCrossed;
  iconClass: string;
};

type CurrencyOption = {
  id: 'PEN' | 'USD';
  symbol: string;
  label: string;
  default?: boolean;
};

export type ExpenseFormMode = 'create' | 'edit';

@Component({
  selector: 'app-expense-form',
  imports: [Card, RouterLink, LucideAngularModule, ConfirmDialog],
  templateUrl: './expense-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseForm {
  mode = input<ExpenseFormMode>('create');

  protected readonly location = inject(Location);
  protected readonly ArrowLeftIcon = ArrowLeft;
  protected readonly TrashIcon = Trash2;

  protected readonly isEdit = computed(() => this.mode() === 'edit');
  protected readonly pageTitle = computed(() =>
    this.isEdit() ? 'Editar gasto' : 'Nuevo gasto',
  );
  protected readonly submitLabel = computed(() =>
    this.isEdit() ? 'Actualizar' : 'Guardar gasto',
  );

  protected readonly currencies: CurrencyOption[] = [
    { id: 'PEN', symbol: 'S/', label: 'Soles', default: true },
    { id: 'USD', symbol: 'US$', label: 'Dólares' },
  ];

  protected readonly categories: CategoryOption[] = [
    { id: 'comida', label: 'Comida', icon: UtensilsCrossed, iconClass: 'bg-violet-100 text-violet-700' },
    { id: 'transporte', label: 'Transporte', icon: Bus, iconClass: 'bg-indigo-100 text-indigo-700' },
    { id: 'ocio', label: 'Ocio', icon: Gamepad2, iconClass: 'bg-amber-100 text-amber-700' },
    { id: 'otro', label: 'Otro', icon: Package, iconClass: 'bg-rose-100 text-rose-700' },
  ];

  protected onDeleteConfirmed(): void {
    // Renzo
  }
}
