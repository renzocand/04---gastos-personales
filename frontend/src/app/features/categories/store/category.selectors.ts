import { createSelector } from '@ngrx/store';
import { categoryFeature } from './category.feature';
import { Category } from '../models/category';
import { colorFor, iconFor } from '../ui/category-display';

export const selectCategories = categoryFeature.selectCategories;

/** Mapa id → Category, para resolver el nombre de la categoría de un gasto. */
export const selectCategoryEntities = createSelector(
  selectCategories,
  (categories) =>
    categories.reduce<Record<string, Category>>((acc, cat) => {
      acc[cat.id] = cat;
      return acc;
    }, {}),
);

export interface CategoryOption {
  id: string;
  name: string;
  icon: ReturnType<typeof iconFor>;
  iconClass: string;
  description?: string;
}

/** Opciones enriquecidas con icono/color para selects y radios. */
export const selectCategoryOptions = createSelector(
  selectCategories,
  (categories): CategoryOption[] =>
    categories.map((cat) => ({
      id: cat.id,
      name: cat.name,
      icon: iconFor(cat.icon),
      iconClass: colorFor(cat.id),
      description: cat.description,
    })),
);
