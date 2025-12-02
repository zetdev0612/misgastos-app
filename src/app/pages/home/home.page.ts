import { Component, OnInit, OnDestroy, ChangeDetectorRef, AfterViewInit } from '@angular/core';
import { Router } from '@angular/router';
import { AlertController, ModalController, ToastController, Platform } from '@ionic/angular';
import { Subscription } from 'rxjs';
import { mergeMap } from 'rxjs/operators';
import { from } from 'rxjs';
import { Auth } from '../../services/auth';
import { TransaccionService } from '../../services/transaccion';
import { CategoriaService } from '../../services/categoria';
import { Transaccion } from '../../models/transaccion.model';
import { Balance } from '../../models/balance.model';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  IonContent,
  IonHeader,
  IonSearchbar,
  IonSegment,
  IonSegmentButton,
  IonFab,
  IonFabButton,
  IonIcon,
  IonLabel,
  IonCard,
  IonCardContent,
  IonBadge
} from '@ionic/angular/standalone';
import { IonButton, IonButtons, IonTitle, IonToolbar } from '@ionic/angular/standalone';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [
    CommonModule,
    FormsModule,
    IonContent,
    IonHeader,
    IonTitle,
    IonToolbar,
    IonSegment,
    IonSegmentButton,
    IonButtons,
    IonButton,
    IonSearchbar,
    IonFab,
    IonFabButton,
    IonIcon,
    IonCard,
    IonLabel,
    IonCardContent,
    IonBadge
  ],
})
export class HomePage implements OnInit, OnDestroy, AfterViewInit {
  transacciones: Transaccion[] = [];
  transaccionesFiltradas: Transaccion[] = [];
  balance: Balance = { totalIngresos: 0, totalGastos: 0, balance: 0 };
  busqueda: string = '';
  periodo: 'dia' | 'semana' | 'mes' | 'todo' = 'todo';

  private subscriptions: Subscription[] = [];
  private viewInitialized = false;

  constructor(
    private transaccionService: TransaccionService,
    private categoriaService: CategoriaService,
    private authService: Auth,
    private modalController: ModalController,
    private alertController: AlertController,
    private toastController: ToastController,
    private router: Router,
    private platform: Platform,
    private cdr: ChangeDetectorRef
  ) {
    console.log('HomePage: Constructor iniciado');
  }

  ngOnInit() {
    console.log('HomePage: ngOnInit iniciado');

    // Registrar cuando la plataforma se reanuda
    const resumeSub = this.platform.resume.subscribe(() => {
      console.log('App resumed');
      this.cargarTransacciones();
    });

    // Cargar transacciones una sola vez al iniciar
    this.cargarTransacciones();

    this.subscriptions.push(resumeSub);
  }

  ngAfterViewInit() {
    console.log('HomePage: ngAfterViewInit');
    this.viewInitialized = true;

    // Asegurar que los estilos se apliquen después de la vista
    setTimeout(() => {
      document.body.classList.add('page-loaded');
      this.cdr.detectChanges();
    }, 100);
  }

  ngOnDestroy() {
    this.subscriptions.forEach((sub) => sub.unsubscribe());
  }

  cargarTransacciones() {
    this.transaccionService.getTransacciones().then((transacciones) => {
      this.transacciones = transacciones;
      this.aplicarFiltros();
      this.actualizarBalance();
    });
  }

  aplicarFiltros() {
    let resultado = [...this.transacciones];

    // Filtro por búsqueda
    if (this.busqueda) {
      const busquedaLower = this.busqueda.toLowerCase();
      resultado = resultado.filter(
        (t) =>
          t.descripcion.toLowerCase().includes(busquedaLower) ||
          t.categoriaNombre?.toLowerCase().includes(busquedaLower)
      );
    }

    // Filtro por periodo
    if (this.periodo !== 'todo') {
      let fechaInicio: Date;

      switch (this.periodo) {
        case 'dia':
          fechaInicio = new Date();
          fechaInicio.setHours(0, 0, 0, 0);
          break;
        case 'semana':
          fechaInicio = new Date();
          fechaInicio.setDate(fechaInicio.getDate() - 7);
          fechaInicio.setHours(0, 0, 0, 0);
          break;
        case 'mes':
          fechaInicio = new Date();
          fechaInicio.setMonth(fechaInicio.getMonth() - 1);
          fechaInicio.setHours(0, 0, 0, 0);
          break;
      }

      resultado = resultado.filter((t) => new Date(t.fecha) >= fechaInicio);
    }

    this.transaccionesFiltradas = resultado;
  }

  async actualizarBalance() {
    // Calcular balance basado en las transacciones filtradas locales
    // Esto es más rápido que llamar al servicio y no depende de Preferences
    const totalIngresos = this.transaccionesFiltradas
      .filter((t: Transaccion) => t.tipo === 'ingreso')
      .reduce((s: number, t: Transaccion) => s + (t.monto || 0), 0);

    const totalGastos = this.transaccionesFiltradas
      .filter((t: Transaccion) => t.tipo === 'gasto')
      .reduce((s: number, t: Transaccion) => s + (t.monto || 0), 0);

    this.balance = {
      totalIngresos,
      totalGastos,
      balance: totalIngresos - totalGastos,
    };
  }

  onBuscar(event: any) {
    this.busqueda = event.target.value || '';
    this.aplicarFiltros();
  }

  onCambiarPeriodo(event: any) {
    this.periodo = event.detail.value;
    this.aplicarFiltros();
    this.actualizarBalance();
  }

  async abrirModalNuevaTransaccion() {
    const { ModalTransaccionComponent } = await import(
      '../../components/modal-transaccion/modal-transaccion.component'
    );
    const modal = await this.modalController.create({
      component: ModalTransaccionComponent,
      cssClass: 'modal-transaccion',
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.transaccion) {
      // Generar ID UNA SOLA VEZ aquí
      const idNuevo = data.transaccion.id || Date.now().toString();
      const nuevaTransaccion = {
        ...data.transaccion,
        id: idNuevo
      };
      
      // Agregar a la lista local
      this.transacciones = [nuevaTransaccion, ...this.transacciones];
      this.aplicarFiltros();
      await this.actualizarBalance();
      this.cdr.detectChanges();
      
      // Guardar en background con el MISMO ID
      this.transaccionService.agregarTransaccion(nuevaTransaccion).subscribe({
        next: () => {
          this.mostrarToast('Transacción agregada exitosamente');
        },
        error: (error) => {
          this.mostrarError('Error al agregar transacción');
          // Recargar si hay error
          this.cargarTransacciones();
        },
      });
    }
  }

  async editarTransaccion(transaccion: Transaccion) {
    const { ModalTransaccionComponent } = await import(
      '../../components/modal-transaccion/modal-transaccion.component'
    );
    const modal = await this.modalController.create({
      component: ModalTransaccionComponent,
      componentProps: { transaccion },
      cssClass: 'modal-transaccion',
    });

    await modal.present();

    const { data } = await modal.onWillDismiss();
    if (data?.transaccion && transaccion.id) {
      // Asegurar que el ID se preserve en los datos a enviar
      const datosActualizados = {
        ...data.transaccion,
        id: transaccion.id
      };

      // Actualizar en la lista local inmediatamente
      const idx = this.transacciones.findIndex(t => t.id === transaccion.id);
      if (idx !== -1) {
        this.transacciones[idx] = { ...this.transacciones[idx], ...datosActualizados };
        this.aplicarFiltros();
        await this.actualizarBalance();
        this.cdr.detectChanges();
      }
      
      // Guardar en background
      this.transaccionService
        .editarTransaccion(transaccion.id, datosActualizados)
        .subscribe({
          next: () => {
            this.mostrarToast('Transacción actualizada exitosamente');
          },
          error: (err) => {
            console.error('Error al actualizar transacción:', err);
            this.mostrarError('Error al actualizar: ' + (err?.message || 'Error desconocido'));
            // Recargar si hay error
            this.cargarTransacciones();
          },
        });
    }
  }

  async eliminarTransaccion(transaccion: Transaccion) {
    const alert = await this.alertController.create({
      header: 'Confirmar eliminación',
      message: `¿Estás seguro de eliminar "${transaccion.descripcion}"?`,
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Eliminar',
          role: 'destructive',
          handler: async () => {
            if (transaccion.id) {
              // Eliminar de la lista local inmediatamente
              this.transacciones = this.transacciones.filter(t => t.id !== transaccion.id);
              this.aplicarFiltros();
              await this.actualizarBalance();
              this.cdr.detectChanges();
              
              // Guardar en background
              this.transaccionService
                .eliminarTransaccion(transaccion.id)
                .subscribe({
                  next: () => {
                    this.mostrarToast('Transacción eliminada');
                  },
                  error: () => {
                    this.mostrarError('Error al eliminar transacción');
                    // Recargar si hay error
                    this.cargarTransacciones();
                  },
                });
            }
          },
        },
      ],
    });

    await alert.present();
  }

  async cerrarSesion() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        {
          text: 'Cancelar',
          role: 'cancel',
        },
        {
          text: 'Cerrar Sesión',
          handler: async () => {
            // Limpiar estado local
            this.transacciones = [];
            this.transaccionesFiltradas = [];
            this.balance = { totalIngresos: 0, totalGastos: 0, balance: 0 };

            // Esperar a que se complete el logout
            await new Promise<void>((resolve) => {
              this.authService.logout().subscribe({
                next: () => {
                  resolve();
                },
                error: (err) => {
                  console.error('Error en logout:', err);
                  resolve();
                }
              });
            });

            // Navegación robusta con fallback
            try {
              // Limpiar estado y esperar un poco
              document.body.classList.remove('page-loaded');
              window.location.hash = '';
              await new Promise((res) => setTimeout(res, 100));

              // Intentar navegación normal
              const result = await this.router.navigate(['/login'], {
                replaceUrl: true,
              });

              // Si falla, usar fallback
              if (!result) {
                console.log('Navegación a login fallida, usando fallback');
                window.location.href = '/login';
              }
            } catch (err) {
              console.error('Error al cerrar sesión:', err);
              window.location.href = '/login';
            }
          },
        },
      ],
    });

    await alert.present();
  }

  getIconoCategoria(categoriaId: string): string {
    const categoria: any = this.categoriaService.getCategoriaById(categoriaId);
    return categoria && typeof categoria === 'object' && 'icono' in categoria
      ? categoria.icono
      : 'pricetag';
  }

  getColorCategoria(categoriaId: string): string {
    const categoria: any = this.categoriaService.getCategoriaById(categoriaId);
    return categoria && typeof categoria === 'object' && 'color' in categoria
      ? categoria.color
      : '#999999';
  }

  formatearFecha(fecha: Date): string {
    const fechaObj = new Date(fecha);
    const hoy = new Date();
    const ayer = new Date(hoy);
    ayer.setDate(ayer.getDate() - 1);

    if (fechaObj.toDateString() === hoy.toDateString()) {
      return 'Hoy';
    } else if (fechaObj.toDateString() === ayer.toDateString()) {
      return 'Ayer';
    } else {
      return fechaObj.toLocaleDateString('es-ES', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
      });
    }
  }

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-CO', {
      style: 'currency',
      currency: 'COP',
      minimumFractionDigits: 0,
    }).format(monto);
  }

  private async mostrarToast(mensaje: string) {
    const toast = await this.toastController.create({
      message: mensaje,
      duration: 2000,
      position: 'top',
      cssClass: 'toast-success',
    });
    await toast.present();
  }

  private async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['OK'],
    });
    await alert.present();
  }
}