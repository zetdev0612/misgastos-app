import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Auth } from '../../services/auth';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-recuperar-password',
  templateUrl: './recuperar-password.page.html',
  styleUrls: ['./recuperar-password.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class RecuperarPasswordPage implements OnInit {
  recuperarForm!: FormGroup;

  constructor(
    private formBuilder: FormBuilder,
    private authService: Auth,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    this.recuperarForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
    });
  }

  async onSubmit() {
    if (this.recuperarForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Enviando enlace...',
        duration: 5000
      });
      await loading.present();

      const { email } = this.recuperarForm.value;

      this.authService.recuperarPassword(email).subscribe({
        next: async () => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: '¡Enviado!',
            message: 'Hemos enviado un enlace de recuperación a tu correo electrónico.',
            buttons: [{
              text: 'OK',
              handler: () => {
                this.router.navigate(['/login']);
              }
            }]
          });
          await alert.present();
        },
        error: async (error: any) => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Error',
            message: error.message || 'No se encontró una cuenta con ese correo',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    }
  }

  volverAlLogin() {
    this.router.navigate(['/login']);
  }
}
