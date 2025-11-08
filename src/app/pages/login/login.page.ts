import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController } from '@ionic/angular';
import { Auth } from '../../services/auth';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, CommonModule],
})
export class LoginPage implements OnInit {
  loginForm!: FormGroup;
  showPassword = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: Auth,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) {}

  ngOnInit() {
    // Verificar si ya está autenticado
    if (this.authService.currentUserValue()) {
      this.router.navigate(['/home']);
    }

    const recordarEmail = localStorage.getItem('recordarUsuario');
    
    this.loginForm = this.formBuilder.group({
      email: [recordarEmail || '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      recordar: [!!recordarEmail]
    });
  }

  async onSubmit() {
    if (this.loginForm.valid) {
      const loading = await this.loadingController.create({
        message: 'Iniciando sesión...',
        duration: 5000
      });
      await loading.present();

      const { email, password, recordar } = this.loginForm.value;

      this.authService.login(email, password, recordar).subscribe({
        next: async () => {
          await loading.dismiss();
          
          try {
            // Limpiamos cualquier estado anterior
            window.location.hash = '';
            
            // Esperamos un momento para asegurar que el estado se limpie
            await new Promise(resolve => setTimeout(resolve, 100));
            
            // Intentamos la navegación normal primero
            const navigationResult = await this.router.navigate(['/home'], {
              replaceUrl: true,
            });
            
            if (!navigationResult) {
              console.log('Navegación fallida, usando fallback');
              window.location.href = '/home';
            }
          } catch (err) {
            console.error('Error en la navegación:', err);
            window.location.href = '/home';
          }
        },
        error: async (error) => {
          await loading.dismiss();
          const alert = await this.alertController.create({
            header: 'Error',
            message: error.message || 'Usuario o contraseña incorrectos',
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

  togglePassword() {
    this.showPassword = !this.showPassword;
  }

  irARegistro() {
    this.router.navigate(['/registro']);
  }

  irARecuperar() {
    this.router.navigate(['/recuperar-password']);
  }
}
