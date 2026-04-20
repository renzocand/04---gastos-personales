export type CategoryId  = 'food' | 'transport' | 'leisure' | 'other';

export interface Category {
  id: CategoryId,
  name: string,
  icon?:string
}

export const CATEGORIES: Record<CategoryId, Category> = {
  food:{name:'Comida', id:'food'},
  transport:{name:'Transporte', id:'transport'},
  leisure:{name:'Ocio', id:'leisure'},
  other:{name:'Otro', id:'other'},
}


