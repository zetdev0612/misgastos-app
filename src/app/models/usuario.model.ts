export interface Usuario {
  id?: string;
  nombreCompleto: string;
  email: string;
  password?: string;
  fechaCreacion?: Date;
}