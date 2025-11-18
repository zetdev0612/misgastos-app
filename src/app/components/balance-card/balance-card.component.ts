import { Component, Input, Output, EventEmitter } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';

export interface BalanceData {
  totalIngresos: number;
  totalGastos: number;
  balance: number;
}

@Component({
  selector: 'app-balance-card',
  standalone: true,
  imports: [CommonModule, IonicModule, FormsModule],
  templateUrl: './balance-card.component.html',
  styleUrls: ['./balance-card.component.scss']
})
export class BalanceCardComponent {
  @Input() balance!: BalanceData;
  @Input() periodo: string = 'mes';
  @Output() periodChanged = new EventEmitter<string>();

  formatearMonto(monto: number): string {
    return new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency: 'MXN'
    }).format(monto);
  }

  onCambiarPeriodo(event: any): void {
    this.periodChanged.emit(event);
  }
}
