// Las categorías vienen de la BD (GET /api/categories). El id es un código
// estable (UUID); ya no es un union literal, por eso CategoryId es solo string.
export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  icon?: string; // nombre del icono lucide (resuelto a componente en el front)
  description?: string; // contexto para que la IA entienda cuándo usar esta categoría
  sortOrder?: number;
  active?: boolean; // false indica soft-deleted
}

export interface CategoryRequest {
  name: string;
  icon?: string;
  description?: string;
  sortOrder?: number;
}
