export interface Transaccion {
  id?: string;
  descripcion: string;
  monto: number;
  tipo: 'ingreso' | 'gasto';
  categoriaId: string;
  categoriaNombre?: string;
  fecha: Date;
  usuarioId?: string;
}