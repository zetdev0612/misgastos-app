import { Injectable } from '@angular/core';
import { Transaccion } from '../models/transaccion.model';
import { Balance } from '../models/balance.model';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { Auth } from './auth';
import { Preferences } from '@capacitor/preferences';

@Injectable({
  providedIn: 'root',
})
export class TransaccionService {
  private _transacciones = new BehaviorSubject<Transaccion[]>([]);
  transacciones = this._transacciones.asObservable();

  constructor(private authService: Auth) {
    // Cargar transacciones desde Preferences si existen
    this.cargarTransacciones();
  }

  private async cargarTransacciones() {
    try {
      const result = await Preferences.get({ key: 'transacciones' });
      if (result.value) {
        const parsed = JSON.parse(result.value) as Transaccion[];
        // Restaurar fechas como objetos Date
        const restored = parsed.map(t => ({ ...t, fecha: new Date(t.fecha) }));
        this._transacciones.next(restored);
      }
    } catch (e) {
      console.warn('No se pudieron cargar las transacciones guardadas:', e);
    }
  }

  private async persist() {
    try {
      await Preferences.set({
        key: 'transacciones',
        value: JSON.stringify(this._transacciones.getValue())
      });
    } catch (e) {
      console.warn('Error guardando transacciones en Preferences', e);
    }
  }

  // Método para refrescar las transacciones cuando un usuario inicia sesión
  async refrescarTransacciones() {
    try {
      const result = await Preferences.get({ key: 'transacciones' });
      if (result.value) {
        const parsed = JSON.parse(result.value) as Transaccion[];
        const restored = parsed.map(t => ({ ...t, fecha: new Date(t.fecha) }));
        this._transacciones.next(restored);
        console.log('Transacciones refrescadas:', restored.length);
      }
    } catch (e) {
      console.warn('Error al refrescar transacciones:', e);
    }
  }

  async getTransacciones(): Promise<Transaccion[]> {
    // Retornar solo las transacciones del usuario actual
    const usuarioId = await this.authService.getCurrentUserId();
    const todas = this._transacciones.getValue();
    
    if (!usuarioId) {
      console.warn('No hay usuario autenticado. Retornando array vacío');
      return [];
    }
    
    // Filtrar transacciones por usuarioId, considerando que algunas transacciones antiguas
    // pueden no tener usuarioId definido (compatibilidad hacia atrás)
    const filtradas = todas.filter(t => {
      // Si la transacción tiene usuarioId, debe coincidir
      if (t.usuarioId) {
        return t.usuarioId === usuarioId;
      }
      // Las transacciones sin usuarioId se ignoran (son de otros usuarios o datos corruptos)
      return false;
    });
    
    console.log(`TransaccionService: Encontradas ${filtradas.length} transacciones para usuario ${usuarioId}`);
    return filtradas;
  }

  getTodasLasTransacciones(): Transaccion[] {
    // Método para obtener todas sin filtrar por usuario (útil para admin)
    return this._transacciones.getValue();
  }

  agregarTransaccion(transaccion: Transaccion): Observable<Transaccion> {
    return new Observable<Transaccion>((subscriber) => {
      setTimeout(async () => {
        try {
          const id = transaccion.id ?? Date.now().toString();
          const usuarioId = await this.authService.getCurrentUserId() || undefined;
          const nueva: Transaccion = { ...transaccion, id, usuarioId };
          // Usar getTodasLasTransacciones para mantener todas las transacciones globales
          const actuales = [nueva, ...this.getTodasLasTransacciones()];
          this._transacciones.next(actuales);
          await this.persist();
          subscriber.next(nueva);
        } catch (e) {
          subscriber.error(e);
        }
      }, 0);
    });
  }

  editarTransaccion(id: string, data: Partial<Transaccion>): Observable<Transaccion> {
    return new Observable<Transaccion>((subscriber) => {
      setTimeout(async () => {
        try {
          const actuales = [...this.getTodasLasTransacciones()];
          const idx = actuales.findIndex(t => t.id === id);
          if (idx === -1) {
            subscriber.error(new Error('Transacción no encontrada'));
            return;
          }

          const actualizado: Transaccion = { ...actuales[idx], ...data } as Transaccion;
          // Asegurar que la fecha sea Date
          if (actualizado.fecha) {
            actualizado.fecha = new Date(actualizado.fecha as any);
          }

          actuales[idx] = actualizado;
          this._transacciones.next(actuales);
          await this.persist();
          subscriber.next(actualizado);
        } catch (e) {
          subscriber.error(e);
        }
      }, 0);
    });
  }

  eliminarTransaccion(id: string): Observable<void> {
    return new Observable<void>((subscriber) => {
      setTimeout(async () => {
        try {
          const actuales = this.getTodasLasTransacciones().filter(t => t.id !== id);
          this._transacciones.next(actuales);
          await this.persist();
          subscriber.next();
        } catch (e) {
          subscriber.error(e);
        }
      }, 0);
    });
  }

  async getBalance(period?: 'dia' | 'semana' | 'mes'): Promise<Balance> {
    let trans = await this.getTransacciones();

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

      trans = trans.filter((t: Transaccion) => new Date(t.fecha) >= fechaInicio);
    }

    const totalIngresos = trans
      .filter((t: Transaccion) => t.tipo === 'ingreso')
      .reduce((s: number, t: Transaccion) => s + (t.monto || 0), 0);

    const totalGastos = trans
      .filter((t: Transaccion) => t.tipo === 'gasto')
      .reduce((s: number, t: Transaccion) => s + (t.monto || 0), 0);

    return {
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
    };
  }
}

