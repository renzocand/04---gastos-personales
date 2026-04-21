// Angular
import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';

// Terceros
import { Store } from '@ngrx/store';
import { ArrowLeft, LucideAngularModule, Trash2 } from 'lucide-angular';

// Internos (alfabético por path)
import { CATEGORY_OPTIONS } from '../../../categories/ui/category-meta';
import { CategoryId } from '../../../categories/models/category';
import { Expense } from '../../models/expense';
import { ExpensesActions } from '../../store/expenses.actions';
import { ExpensesState } from '../../store/expenses.feature';
import { CURRENCY_OPTIONS } from '../../ui/currency-meta';
import { Card } from '../../../../shared/ui/card/card';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { format } from 'date-fns';



export type ExpenseFormMode = 'create' | 'edit';

@Component({
  selector: 'app-expense-form',
  imports: [Card, RouterLink, LucideAngularModule, ConfirmDialog, ReactiveFormsModule],
  templateUrl: './expense-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseForm {
  mode = input<ExpenseFormMode>('create');

  private readonly fb = inject(NonNullableFormBuilder);
  private readonly store:Store<ExpensesState> = inject(Store);

  protected readonly location = inject(Location);

  protected readonly today = format(new Date(), 'yyyy-MM-dd')

  protected readonly ArrowLeftIcon = ArrowLeft;
  protected readonly TrashIcon = Trash2;

  protected readonly isEdit = computed(() => this.mode() === 'edit');
  protected readonly pageTitle = computed(() =>
    this.isEdit() ? 'Editar gasto' : 'Nuevo gasto',
  );
  protected readonly submitLabel = computed(() =>
    this.isEdit() ? 'Actualizar' : 'Guardar gasto',
  );

  protected readonly currencies = CURRENCY_OPTIONS;
  protected readonly categories = CATEGORY_OPTIONS;



  protected readonly form = this.fb.group({
    currency: this.fb.control<'PEN' | 'USD'>('PEN'),
    amount: [0, [Validators.required, Validators.min(0.1)]],
    description:['', [Validators.required, Validators.maxLength(80)]],
    category:this.fb.control<CategoryId | null>(null, Validators.required),
    date:[this.today, Validators.required]
  })


  protected onSubmit(){
    if(this.form.invalid){
      this.form.markAllAsTouched();
      return;
    }

    const {currency,amount,description,category,date} = this.form.getRawValue();

    const payload:Omit<Expense,'id'> = {
        currency,
        amount,
        description,
        categoryId: category!,
        date
    }

    console.log(payload);

    this.store.dispatch(ExpensesActions.add({payload}));

  }


  protected onDeleteConfirmed(): void {
    // Renzo
  }

}
