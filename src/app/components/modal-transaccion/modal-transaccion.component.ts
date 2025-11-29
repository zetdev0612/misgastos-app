import { Component } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ModalController } from '@ionic/angular';
import { CategoriaService } from '../../services/categoria';
import { Transaccion } from '../../models/transaccion.model';
import { Categoria } from '../../models/categoria.model';
// Importes standalone de Ionic (remplaza IonicModule)
import {
  IonHeader,
  IonToolbar,
  IonTitle,
  IonButtons,
  IonButton,
  IonIcon,
  IonContent,
  IonItem,
  IonLabel,
  IonInput,
  IonText,
  IonSelect,
  IonSelectOption
} from '@ionic/angular/standalone';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';

@Component({
  selector: 'app-modal-transaccion',
  templateUrl: './modal-transaccion.component.html',
  styleUrls: ['./modal-transaccion.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    FormsModule,
    IonHeader,
    IonToolbar,
    IonTitle,
    IonButtons,
    IonButton,
    IonIcon,
    IonContent,
    IonItem,
    IonLabel,
    IonInput,
    IonText,
    IonSelect,
    IonSelectOption
  ],
})
export class ModalTransaccionComponent {
  transaccion?: Transaccion;
  
  transaccionForm!: FormGroup;
  categorias: Categoria[] = [];
  categoriasFiltradas: Categoria[] = [];
  esEdicion = false;
  maxDate = new Date().toISOString();

  constructor(
    private formBuilder: FormBuilder,
    private modalController: ModalController,
    private categoriaService: CategoriaService
  ) {}

  ngOnInit() {
    this.esEdicion = !!this.transaccion;
    this.categorias = this.categoriaService.getCategorias();
    
    const fechaActual = this.transaccion?.fecha 
      ? new Date(this.transaccion.fecha).toISOString() 
      : new Date().toISOString();

    this.transaccionForm = this.formBuilder.group({
      descripcion: [this.transaccion?.descripcion || '', [Validators.required, Validators.minLength(3)]],
      monto: [this.transaccion?.monto || '', [Validators.required, Validators.min(1)]],
      tipo: [this.transaccion?.tipo || 'gasto', Validators.required],
      categoriaId: [this.transaccion?.categoriaId || '', Validators.required],
      fecha: [fechaActual, Validators.required]
    });

    // Filtrar categorías según el tipo
    this.onTipoChange({ detail: { value: this.transaccionForm.value.tipo } });

    // Escuchar cambios en el tipo
    this.transaccionForm.get('tipo')?.valueChanges.subscribe(tipo => {
      this.filtrarCategorias(tipo);
    });
  }

  //recibe un evento ionInput y formatea el monto con separador de miles y máximo 2 decimales
  formatearMonto(event: any) {
    const input = event.target as HTMLInputElement;
    let valor = input.value;

    // Eliminar caracteres no numéricos excepto el punto decimal
    valor = valor.replace(/[^0-9.]/g, '');

    // Asegurar que solo haya un punto decimal
    const partes = valor.split('.');
    if (partes.length > 2) {
      valor = partes[0] + '.' + partes.slice(1).join('');
    }

    // Limitar a 2 decimales
    if (partes.length === 2) {
      valor = partes[0] + '.' + partes[1].substring(0, 2);
    }

    // Actualizar el valor del input y del formulario
    input.value = valor;
    this.transaccionForm.patchValue({ monto: parseFloat(valor) || 0 });
  }

  onTipoChange(event: any) {
    const tipo = event.detail.value;
    this.filtrarCategorias(tipo);
    
    // Resetear categoría si no es válida para el nuevo tipo
    const categoriaActual = this.transaccionForm.get('categoriaId')?.value;
    if (categoriaActual) {
      const categoriaValida = this.categoriasFiltradas.find(c => c.id === categoriaActual);
      if (!categoriaValida) {
        this.transaccionForm.patchValue({ categoriaId: '' });
      }
    }
  }

  filtrarCategorias(tipo: 'ingreso' | 'gasto') {
    this.categoriasFiltradas = this.categorias.filter(c => 
      c.tipo === tipo || c.tipo === 'ambos'
    );
  }

  guardar() {
    if (this.transaccionForm.valid) {
      const transaccion: Transaccion = {
        ...this.transaccionForm.value,
        fecha: new Date(this.transaccionForm.value.fecha)
      };

      this.modalController.dismiss({
        transaccion
      });
    }
  }

  cancelar() {
    this.modalController.dismiss();
  }

  getIconoCategoria(categoria: Categoria): string {
    return categoria.icono || 'pricetag';
  }
}