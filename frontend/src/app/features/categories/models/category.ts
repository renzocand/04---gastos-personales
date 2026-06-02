// Las categorías vienen de la BD (GET /api/categories). El id es un código
// estable; ya no es un union literal, por eso CategoryId es solo string.
export type CategoryId = string;

export interface Category {
  id: CategoryId;
  name: string;
  icon?: string; // nombre del icono lucide (resuelto a componente en el front)
  description?: string; // ayuda educativa: qué gastos van en esta categoría
}
