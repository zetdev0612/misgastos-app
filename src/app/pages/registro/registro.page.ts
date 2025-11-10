import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Auth } from '../../services/auth';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-registro',
  templateUrl: './registro.page.html',
  styleUrls: ['./registro.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class RegistroPage implements OnInit, AfterViewInit {
  registroForm!: FormGroup;
  showPassword = false;
  showConfirmPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: Auth,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private platform: Platform,
    private cdr: ChangeDetectorRef
  ) {}

  ngOnInit() {
    this.registroForm = this.formBuilder.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator
    });
  }

  ngAfterViewInit() {
    // Asegurar que los estilos se apliquen correctamente después de cargar la vista
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

  async onSubmit() {
    if (this.registroForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Creando cuenta...',
        duration: 5000
      });
      await loading.present();

      const { nombreCompleto, email, password } = this.registroForm.value;

      this.authService.registro({ nombreCompleto, email, password }).subscribe({
        next: async () => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: '¡Éxito!',
            message: 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.',
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
            message: error.message || 'No se pudo crear la cuenta',
            buttons: ['OK']
          });
          await alert.present();
        }
      });
    } else {
      const alert = await this.alertController.create({
        header: 'Formulario inválido',
        message: 'Por favor completa todos los campos correctamente',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  togglePassword(field: 'password' | 'confirm') {
    if (field === 'password') {
      this.showPassword = !this.showPassword;
    } else {
      this.showConfirmPassword = !this.showConfirmPassword;
    }
  }

  volverAlLogin() {
    // Navegación robusta de vuelta al login
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