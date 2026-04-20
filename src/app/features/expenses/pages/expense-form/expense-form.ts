import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ArrowLeft, LucideAngularModule, Trash2 } from 'lucide-angular';
import { Card } from '../../../../shared/ui/card/card';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { CATEGORIES } from '../../../categories/models/category';
import { CATEGORY_OPTIONS } from '../../../categories/ui/category-meta';

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

  protected readonly categories = CATEGORY_OPTIONS;


  protected onDeleteConfirmed(): void {
    // Renzo
  }
}
