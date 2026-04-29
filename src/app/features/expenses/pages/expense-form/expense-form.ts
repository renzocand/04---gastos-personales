// Angular
import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, OnInit } from '@angular/core';
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
import { expensesFeature, ExpensesState } from '../../store/expenses.feature';
import { CURRENCY_OPTIONS } from '../../ui/currency-meta';
import { Card } from '../../../../shared/ui/card/card';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { format } from 'date-fns';
import { selectExpenseById, selectExpensesGroupedByDay } from '../../store/expenses.selectors';
import { toSignal } from '@angular/core/rxjs-interop';



export type ExpenseFormMode = 'create' | 'edit';

@Component({
  selector: 'app-expense-form',
  imports: [Card, RouterLink, LucideAngularModule, ConfirmDialog, ReactiveFormsModule],
  templateUrl: './expense-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ExpenseForm {
  mode = input<ExpenseFormMode>('create');
  id = input<string>();


  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly location = inject(Location);
  private readonly store:Store<ExpensesState> = inject(Store);


  protected readonly today = format(new Date(), 'yyyy-MM-dd')
  protected readonly ArrowLeftIcon = ArrowLeft;
  protected readonly TrashIcon = Trash2;
  protected readonly currencies = CURRENCY_OPTIONS;
  protected readonly categories = CATEGORY_OPTIONS;


  protected readonly isEdit = computed(() => this.mode() === 'edit');
  protected readonly pageTitle = computed(() =>
    this.isEdit() ? 'Editar gasto' : 'Nuevo gasto',
  );
  protected readonly submitLabel = computed(() =>
    this.isEdit() ? 'Actualizar' : 'Guardar gasto',
  );


  private readonly expenses = this.store.selectSignal(expensesFeature.selectExpenses);
  private readonly currentExpense = computed(()=>{
      const id = this.id();
      if (!id) return undefined;
      return this.expenses().find(e => e.id === id);
  })

  protected readonly form = this.fb.group({
    currency: this.fb.control<'PEN' | 'USD'>('PEN'),
    amount: [0, [Validators.required, Validators.min(0.1)]],
    description:['', [Validators.required, Validators.maxLength(80)]],
    category:this.fb.control<CategoryId | null>(null, Validators.required),
    date:[this.today, Validators.required]
  })

  private readonly syncForm = effect(()=>{
    const expense = this.currentExpense();
    console.log(expense);
    if(!expense) return;

    this.form.patchValue({
      currency:expense.currency,
      amount:expense.amount,
      description:expense.description,
      category:expense.categoryId,
      date:expense.date,
    })
  })


  private buildChanges(): Partial<Omit<Expense, 'id'>> {
    const controls = this.form.controls;
    const changes: Partial<Omit<Expense, 'id'>> = {};

    if (controls.currency.dirty) changes.currency = controls.currency.value;
    if (controls.amount.dirty) changes.amount = controls.amount.value;
    if (controls.description.dirty) changes.description = controls.description.value;
    if (controls.category.dirty) changes.categoryId = controls.category.value!;
    if (controls.date.dirty) changes.date = controls.date.value;

    return changes;
  }


  protected onSubmit() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { currency, amount, description, category, date } = this.form.getRawValue();



    const editingId = this.id();
    if (editingId) {
      const changes = this.buildChanges();
      this.store.dispatch(ExpensesActions.update({ id: editingId, changes }));
      this.form.markAsPristine();
    } else {
      const payload: Omit<Expense, 'id'> = {
        currency,
        amount,
        description,
        categoryId: category!,
        date
      }
      this.store.dispatch(ExpensesActions.add({ payload }));
    }

  }


  protected onDeleteConfirmed(): void {
    const editingId = this.id();
    if(!editingId) return ;

    this.store.dispatch(ExpensesActions.delete({id:editingId}))
  }

}
