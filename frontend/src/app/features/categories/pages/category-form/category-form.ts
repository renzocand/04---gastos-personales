import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { ArrowLeft, LucideAngularModule, Trash2 } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../../../shared/ui/card/card';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { categoryFeature } from '../../store/category.feature';
import { CategoriesActions } from '../../store/category.actions';
import { CategoryRequest } from '../../models/category';
import { CategoryIconDisplay, iconFor } from '../../ui/category-display';

export type CategoryFormMode = 'create' | 'edit';

// Iconos disponibles para categorías
const AVAILABLE_ICONS = [
  { id: 'UtensilsCrossed', name: 'Cubiertos' },
  { id: 'Utensils', name: 'Restaurante' },
  { id: 'Home', name: 'Casa' },
  { id: 'Bus', name: 'Transporte' },
  { id: 'CreditCard', name: 'Tarjeta' },
  { id: 'Sparkles', name: 'Limpieza' },
  { id: 'ShoppingBag', name: 'Compras' },
  { id: 'HeartPulse', name: 'Salud' },
  { id: 'GraduationCap', name: 'Educacion' },
  { id: 'Gamepad2', name: 'Ocio' },
  { id: 'Zap', name: 'Servicios' },
  { id: 'Package', name: 'Otros' },
];

@Component({
  selector: 'app-category-form',
  imports: [
    Card,
    RouterLink,
    LucideAngularModule,
    ConfirmDialog,
    ReactiveFormsModule,
    TranslocoModule,
    CategoryIconDisplay,
  ],
  templateUrl: './category-form.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoryForm {
  mode = input<CategoryFormMode>('create');
  id = input<string>();

  private readonly fb = inject(NonNullableFormBuilder);
  protected readonly location = inject(Location);
  private readonly store = inject(Store);

  protected readonly ArrowLeftIcon = ArrowLeft;
  protected readonly TrashIcon = Trash2;
  protected readonly availableIcons = AVAILABLE_ICONS;
  protected readonly iconFor = iconFor;

  protected readonly isEdit = computed(() => this.mode() === 'edit');

  private readonly categories = this.store.selectSignal(categoryFeature.selectCategories);
  protected readonly saving = this.store.selectSignal(categoryFeature.selectSaving);
  protected readonly error = this.store.selectSignal(categoryFeature.selectError);

  private readonly currentCategory = computed(() => {
    const id = this.id();
    if (!id) return undefined;
    return this.categories().find((c) => c.id === id);
  });

  protected readonly form = this.fb.group({
    name: ['', [Validators.required, Validators.maxLength(50)]],
    icon: ['Package'],
    description: ['', [Validators.maxLength(500)]],
  });

  private readonly syncForm = effect(() => {
    const category = this.currentCategory();
    if (!category) return;

    this.form.patchValue({
      name: category.name,
      icon: category.icon || 'Package',
      description: category.description || '',
    });
  });

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, icon, description } = this.form.getRawValue();
    const request: CategoryRequest = {
      name,
      icon,
      description: description || undefined,
    };

    const editingId = this.id();
    if (editingId) {
      this.store.dispatch(CategoriesActions.update({ id: editingId, request }));
    } else {
      this.store.dispatch(CategoriesActions.create({ request }));
    }
  }

  protected onDeleteConfirmed(): void {
    const editingId = this.id();
    if (!editingId) return;
    this.store.dispatch(CategoriesActions.delete({ id: editingId }));
  }
}
