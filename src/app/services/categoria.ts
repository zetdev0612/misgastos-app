import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class CategoriaService {

  constructor() {}

  getCategoriaById(id: string): string {
    // Lógica simulada para obtener el nombre de la categoría por su ID
    const categoriasMock: { [key: string]: string } = {
      '1': 'Alimentos',
      '2': 'Transporte',
      '3': 'Entretenimiento',
    };
    return categoriasMock[id] || 'Categoría Desconocida';
  }

  getCategorias(): { id: string; nombre: string; tipo: 'ingreso' | 'gasto' }[] {
    return [
      { id: '1', nombre: 'Alimentos', tipo: 'gasto' },
      { id: '2', nombre: 'Transporte', tipo: 'gasto' },
      { id: '3', nombre: 'Entretenimiento', tipo: 'gasto' },
      { id: '4', nombre: 'Salario', tipo: 'ingreso' },
      { id: '5', nombre: 'Ventas', tipo: 'ingreso' },
    ];
  }

  
}
