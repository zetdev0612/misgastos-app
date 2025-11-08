import { Injectable } from '@angular/core';
import { Transaccion } from '../models/transaccion.model';
import { Balance } from '../models/balance.model';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class TransaccionService {
  private _transacciones = new BehaviorSubject<Transaccion[]>([]);
  transacciones = this._transacciones.asObservable();

  constructor() {
    // Cargar transacciones desde localStorage si existen
    const saved = localStorage.getItem('transacciones');
    if (saved) {
      try {
        const parsed = JSON.parse(saved) as Transaccion[];
        // Restaurar fechas como objetos Date
        const restored = parsed.map(t => ({ ...t, fecha: new Date(t.fecha) }));
        this._transacciones.next(restored);
      } catch (e) {
        console.warn('No se pudieron cargar las transacciones guardadas:', e);
      }
    }
  }

  private persist() {
    try {
      localStorage.setItem('transacciones', JSON.stringify(this._transacciones.getValue()));
    } catch (e) {
      console.warn('Error guardando transacciones en localStorage', e);
    }
  }

  getTransacciones(): Transaccion[] {
    return this._transacciones.getValue();
  }

  agregarTransaccion(transaccion: Transaccion): Observable<Transaccion> {
    const id = transaccion.id ?? Date.now().toString();
    const nueva: Transaccion = { ...transaccion, id };
    const actuales = [nueva, ...this.getTransacciones()];
    this._transacciones.next(actuales);
    this.persist();
    return of(nueva);
  }

  editarTransaccion(id: string, data: Partial<Transaccion>): Observable<Transaccion> {
    const actuales = [...this.getTransacciones()];
    const idx = actuales.findIndex(t => t.id === id);
    if (idx === -1) {
      return throwError(() => new Error('Transacción no encontrada'));
    }

    const actualizado: Transaccion = { ...actuales[idx], ...data } as Transaccion;
    // Asegurar que la fecha sea Date
    if (actualizado.fecha) {
      actualizado.fecha = new Date(actualizado.fecha as any);
    }

    actuales[idx] = actualizado;
    this._transacciones.next(actuales);
    this.persist();
    return of(actualizado);
  }

  eliminarTransaccion(id: string): Observable<void> {
    const actuales = this.getTransacciones().filter(t => t.id !== id);
    this._transacciones.next(actuales);
    this.persist();
    return of(void 0);
  }

  getBalance(period?: 'dia' | 'semana' | 'mes'): Balance {
    let trans = this.getTransacciones();

    if (period) {
      const ahora = new Date();
      let fechaInicio: Date;
      switch (period) {
        case 'dia':
          fechaInicio = new Date(ahora.setHours(0, 0, 0, 0));
          break;
        case 'semana':
          fechaInicio = new Date();
          fechaInicio.setDate(ahora.getDate() - 7);
          fechaInicio.setHours(0, 0, 0, 0);
          break;
        case 'mes':
          fechaInicio = new Date();
          fechaInicio.setMonth(ahora.getMonth() - 1);
          fechaInicio.setHours(0, 0, 0, 0);
          break;
        default:
          fechaInicio = new Date(0);
      }

      trans = trans.filter(t => new Date(t.fecha) >= fechaInicio);
    }

    const totalIngresos = trans
      .filter(t => t.tipo === 'ingreso')
      .reduce((s, t) => s + (t.monto || 0), 0);

    const totalGastos = trans
      .filter(t => t.tipo === 'gasto')
      .reduce((s, t) => s + (t.monto || 0), 0);

    return {
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
    };
  }
}

