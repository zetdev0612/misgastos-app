import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Auth } from '../../services/auth';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.page.html',
  styleUrls: ['./reset-password.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class ResetPasswordPage implements OnInit, AfterViewInit {
  resetForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;
  email: string = '';
  token: string = '';
  tokenValido = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: Auth,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private platform: Platform,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    // Obtener parámetros de la URL
    this.route.queryParams.subscribe((params) => {
      this.email = params['email'] || '';
      this.token = params['token'] || '';

      if (!this.email || !this.token) {
        this.mostrarErrorYRedirigir('Enlace inválido o expirado');
        return;
      }

      this.tokenValido = true;
      console.log('[ResetPasswordPage] Email:', this.email, 'Token:', this.token);
    });

    this.resetForm = this.formBuilder.group({
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required, Validators.minLength(6)]],
    }, { validators: this.passwordMatchValidator });
  }

  ngAfterViewInit() {
    setTimeout(() => {
      try {
        document.body.classList.add('page-loaded');
        this.cdr.detectChanges();
      } catch (e) {
        // noop
      }
    }, 80);
  }

  passwordMatchValidator(form: FormGroup) {
    const password = form.get('password');
    const confirmar = form.get('confirmarPassword');

    if (password && confirmar && password.value !== confirmar.value) {
      confirmar.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    return null;
  }

  togglePassword(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  async onSubmit() {
    if (!this.tokenValido) {
      await this.mostrarErrorYRedirigir('Enlace inválido');
      return;
    }

    if (this.resetForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Actualizando contraseña...',
      });
      await loading.present();

      const { password } = this.resetForm.value;

      this.authService.resetPassword(this.email, this.token, password).subscribe({
        next: async () => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: '¡Éxito!',
            message: 'Tu contraseña ha sido actualizada correctamente.',
            buttons: [
              {
                text: 'OK',
                handler: () => {
                  this.router.navigate(['/login']);
                },
              },
            ],
          });
          await alert.present();
        },
        error: async (error: any) => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Error',
            message: error.message || 'No se pudo actualizar la contraseña',
            buttons: ['OK'],
          });
          await alert.present();
        },
      });
    }
  }

  private async mostrarErrorYRedirigir(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: [
        {
          text: 'OK',
          handler: () => {
            this.router.navigate(['/login']);
          },
        },
      ],
    });
    await alert.present();
  }

  volverAlLogin() {
    (async () => {
      try {
        await new Promise(res => setTimeout(res, 50));
        const result = await this.router.navigate(['/login'], { replaceUrl: true });
        if (!result) {
          window.location.href = '/login';
        }
      } catch (err) {
        window.location.href = '/login';
      }
    })();
  }
}
