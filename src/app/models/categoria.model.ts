export interface Categoria {
  id?: string;
  nombre: string;
  icono?: string;
  color?: string;
  tipo?: 'ingreso' | 'gasto' | 'ambos';
}