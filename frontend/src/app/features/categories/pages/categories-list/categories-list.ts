import { ChangeDetectionStrategy, Component, inject, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Store } from '@ngrx/store';
import { LucideAngularModule, Plus, Pencil, Trash2, Tag } from 'lucide-angular';
import { TranslocoModule } from '@jsverse/transloco';
import { Card } from '../../../../shared/ui/card/card';
import { EmptyState } from '../../../../shared/ui/empty-state/empty-state';
import { ErrorState } from '../../../../shared/ui/error-state/error-state';
import { Skeleton } from '../../../../shared/ui/skeleton/skeleton';
import { ConfirmDialog } from '../../../../shared/ui/confirm-dialog/confirm-dialog';
import { categoryFeature } from '../../store/category.feature';
import { CategoriesActions } from '../../store/category.actions';
import { CategoryIconDisplay } from '../../ui/category-display';

@Component({
  selector: 'app-categories-list',
  imports: [
    Card,
    EmptyState,
    ErrorState,
    Skeleton,
    ConfirmDialog,
    RouterLink,
    LucideAngularModule,
    TranslocoModule,
    CategoryIconDisplay,
  ],
  templateUrl: './categories-list.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class CategoriesList implements OnInit {
  private readonly store = inject(Store);

  protected readonly PlusIcon = Plus;
  protected readonly PencilIcon = Pencil;
  protected readonly TrashIcon = Trash2;
  protected readonly TagIcon = Tag;

  protected readonly categories = this.store.selectSignal(categoryFeature.selectCategories);
  protected readonly loading = this.store.selectSignal(categoryFeature.selectLoading);
  protected readonly saving = this.store.selectSignal(categoryFeature.selectSaving);
  protected readonly error = this.store.selectSignal(categoryFeature.selectError);

  ngOnInit(): void {
    this.store.dispatch(CategoriesActions.load());
  }

  protected onDeleteConfirmed(id: string): void {
    this.store.dispatch(CategoriesActions.delete({ id }));
  }
}
