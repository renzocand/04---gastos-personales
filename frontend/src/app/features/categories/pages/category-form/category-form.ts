import { Location } from '@angular/common';
import { ChangeDetectionStrategy, Component, computed, effect, inject, input, signal } from '@angular/core';
import { NonNullableFormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Store } from '@ngrx/store';
import { ArrowLeft, LucideAngularModule, RefreshCw, Trash2 } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../../../shared/ui/card/card';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { CdnIcon } from '../../../../shared/ui/cdn-icon/cdn-icon';
import { IconPicker } from '../../../../shared/ui/icon-picker/icon-picker';
import { categoryFeature } from '../../store/category.feature';
import { CategoriesActions } from '../../store/category.actions';
import { CategoryRequest, SYSTEM_COLOR_PALETTE, generateRandomColor } from '../../models/category';

export type CategoryFormMode = 'create' | 'edit';

@Component({
  selector: 'app-category-form',
  imports: [
    Card,
    LucideAngularModule,
    ConfirmDialog,
    ReactiveFormsModule,
    TranslocoModule,
    CdnIcon,
    IconPicker,
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
  protected readonly RefreshIcon = RefreshCw;
  protected readonly systemColors = SYSTEM_COLOR_PALETTE;

  protected readonly isEdit = computed(() => this.mode() === 'edit');
  protected showIconPicker = signal(false);

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
    color: [this.getDefaultColor()],
    description: ['', [Validators.maxLength(500)]],
  });

  /** Obtiene el siguiente color de la paleta o genera uno aleatorio */
  private getDefaultColor(): string {
    const usedColors = new Set(this.categories().map((c) => c.color).filter(Boolean));
    // Buscar el primer color de la paleta que no esté usado
    for (const color of SYSTEM_COLOR_PALETTE) {
      if (!usedColors.has(color)) {
        return color;
      }
    }
    // Si todos están usados, generar aleatorio
    return generateRandomColor();
  }

  private readonly syncForm = effect(() => {
    const category = this.currentCategory();
    if (!category) return;

    this.form.patchValue({
      name: category.name,
      icon: category.icon || 'Package',
      color: category.color || this.getDefaultColor(),
      description: category.description || '',
    });
  });

  protected onIconSelected(iconName: string): void {
    this.form.controls.icon.setValue(iconName);
    this.showIconPicker.set(false);
  }

  protected onColorSelected(color: string): void {
    this.form.controls.color.setValue(color);
  }

  protected generateNewColor(): void {
    this.form.controls.color.setValue(generateRandomColor());
  }

  protected onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    const { name, icon, color, description } = this.form.getRawValue();
    const request: CategoryRequest = {
      name,
      icon,
      color,
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
