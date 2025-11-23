import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
import { Auth } from '../../services/auth';
import { IonicModule } from '@ionic/angular';
import { ReactiveFormsModule, FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-login',
  templateUrl: './login.page.html',
  styleUrls: ['./login.page.scss'],
  standalone: true,
  imports: [IonicModule, ReactiveFormsModule, FormsModule, CommonModule],
})
export class LoginPage implements OnInit, AfterViewInit {
  loginForm!: FormGroup;
  showPassword = false;
  isLoading = false;

  constructor(
    private formBuilder: FormBuilder,
    private authService: Auth,
    private router: Router,
    private alertController: AlertController,
    private loadingController: LoadingController,
    private platform: Platform,
    private cdr: ChangeDetectorRef
  ) {
    console.log('LoginPage constructor initialized');
  }

  ngOnInit() {
    console.log('LoginPage ngOnInit');
    // Limpiar estado previo de navegación
    document.body.classList.remove('page-loaded');
    
    // Verificar si ya está autenticado
    if (this.authService.currentUserValue()) {
      console.log('Usuario ya autenticado, navegando a /home');
      this.router.navigate(['/home']);
      return;
    }

    const recordarEmail = localStorage.getItem('recordarUsuario');
    
    this.loginForm = this.formBuilder.group({
      email: [recordarEmail || '', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      recordar: [!!recordarEmail]
    });

    console.log('Formulario inicializado');
  }

  ngAfterViewInit() {
    console.log('LoginPage ngAfterViewInit');
    // Asegurar que los estilos se apliquen correctamente después de cargar la vista
    setTimeout(() => {
      try {
        document.body.classList.add('page-loaded');
        this.cdr.detectChanges();
        console.log('Change detection triggered');
      } catch (e) {
        console.error('Error en ngAfterViewInit:', e);
      }
    }, 80);
  }

  async onSubmit() {
    console.log('onSubmit clicked - formulario válido:', this.loginForm.valid);

    if (!this.loginForm.valid) {
      console.warn('Formulario inválido');
      const alert = await this.alertController.create({
        header: 'Formulario inválido',
        message: 'Por favor completa todos los campos correctamente',
        buttons: ['OK']
      });
      await alert.present();
      return;
    }

    this.isLoading = true;
    this.cdr.markForCheck();

    const { email, password, recordar } = this.loginForm.value;
    console.log('Intentando login con:', email);

    this.authService.login(email, password, recordar).subscribe({
      next: async () => {
        console.log('Login exitoso');
        this.isLoading = false;
        this.cdr.markForCheck();
        
        try {
          // Limpiamos cualquier estado anterior
          window.location.hash = '';
          
          // Esperamos un momento para asegurar que el estado se limpie
          await new Promise(resolve => setTimeout(resolve, 100));
          
          // Intentamos la navegación normal primero
          const navigationResult = await this.router.navigate(['/home'], {
            replaceUrl: true,
          });
          
          console.log('Navegación result:', navigationResult);
          
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
        console.error('Error en login:', error);
        this.isLoading = false;
        this.cdr.markForCheck();
        const alert = await this.alertController.create({
          header: 'Error',
          message: error.message || 'Usuario o contraseña incorrectos',
          buttons: ['OK']
        });
        await alert.present();
      }
    });
  }

  togglePassword() {
    console.log('togglePassword - antes:', this.showPassword);
    this.showPassword = !this.showPassword;
    console.log('togglePassword - después:', this.showPassword);
    this.cdr.detectChanges();
  }

  irARegistro() {
    console.log('irARegistro');
    // Intentar navegación normal con fallback
    (async () => {
      try {
        // Pequeño delay para permitir que otras operaciones pendientes terminen
        await new Promise(res => setTimeout(res, 50));

        // Limpiar estado anterior
        window.location.hash = '';
        await new Promise(res => setTimeout(res, 50));

        // Intentar navegación con replaceUrl
        const result = await this.router.navigate(['/registro'], { replaceUrl: true });

        console.log('Navegación a /registro result:', result);

        // Si la navegación falla o no se aplica correctamente, usar fallback
        if (!result) {
          console.log('Navegación a /registro fallida, usando fallback');
          window.location.href = '/registro';
        }
      } catch (err) {
        console.error('Error al navegar a registro:', err);
        window.location.href = '/registro';
      }
    })();
  }

  irARecuperar() {
    console.log('irARecuperar');
    this.router.navigate(['/recuperar-password']);
  }
}
