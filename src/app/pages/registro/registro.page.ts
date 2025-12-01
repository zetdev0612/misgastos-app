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
  isSubmitting = false;

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
    console.log('[RegistroPage.ngOnInit] Inicializando componente...');
    this.registroForm = this.formBuilder.group({
      nombreCompleto: ['', [Validators.required, Validators.minLength(3)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmarPassword: ['', [Validators.required]],
      aceptaTerminos: [false, [Validators.requiredTrue]]
    }, {
      validators: this.passwordMatchValidator.bind(this)
    });
    console.log('[RegistroPage.ngOnInit] Formulario creado');
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
    console.log('[RegistroPage.passwordMatchValidator] Validando passwords...');
    const password = form.get('password');
    const confirmar = form.get('confirmarPassword');
    
    console.log('[RegistroPage.passwordMatchValidator] password valor:', password?.value);
    console.log('[RegistroPage.passwordMatchValidator] confirmar valor:', confirmar?.value);
    
    if (password && confirmar && password.value !== confirmar.value) {
      console.warn('[RegistroPage.passwordMatchValidator] Las passwords no coinciden');
      confirmar.setErrors({ passwordMismatch: true });
      return { passwordMismatch: true };
    }
    
    console.log('[RegistroPage.passwordMatchValidator] Validación exitosa');
    return null;
  }

  async onSubmit() {
    console.log('[RegistroPage.onSubmit] Iniciando validación del formulario...');
    console.log('[RegistroPage.onSubmit] Formulario válido:', this.registroForm.valid);
    
    if (this.registroForm.valid) {
      console.log('[RegistroPage.onSubmit] Formulario es válido');
      
      // Usar flag isSubmitting en lugar de LoadingController que tiene problemas
      this.isSubmitting = true;
      this.cdr.detectChanges();
      console.log('[RegistroPage.onSubmit] Flag isSubmitting activado');

      try {
        const formValue = this.registroForm.value;
        console.log('[RegistroPage.onSubmit] Valor completo del formulario:', JSON.stringify(formValue));
        
        const { nombreCompleto, email, password } = formValue;
        console.log('[RegistroPage.onSubmit] Datos extraídos del formulario:');
        console.log('  - nombreCompleto:', nombreCompleto);
        console.log('  - email:', email);
        console.log('  - password: ***');

        if (!nombreCompleto || !email || !password) {
          console.error('[RegistroPage.onSubmit] Falta algún dato requerido');
          this.isSubmitting = false;
          this.cdr.detectChanges();
          throw new Error('Faltan datos requeridos');
        }

        console.log('[RegistroPage.onSubmit] Llamando a authService.registro()...');
        
        this.authService.registro({ nombreCompleto, email, password }).subscribe({
          next: async (result) => {
            console.log('[RegistroPage.onSubmit] Registro exitoso:', result);
            this.isSubmitting = false;
            this.cdr.detectChanges();
            console.log('[RegistroPage.onSubmit] Flag isSubmitting desactivado');
            
            const alert = await this.alertController.create({
              header: '¡Éxito!',
              message: 'Cuenta creada exitosamente. Ahora puedes iniciar sesión.',
              buttons: [{
                text: 'OK',
                handler: () => {
                  console.log('[RegistroPage.onSubmit] Usuario confirmó. Navegando a /login...');
                  this.router.navigate(['/login']);
                }
              }]
            });
            console.log('[RegistroPage.onSubmit] Mostrando alerta de éxito');
            await alert.present();
          },
          error: async (error: any) => {
            console.error('[RegistroPage.onSubmit] Error en registro:', error);
            console.error('[RegistroPage.onSubmit] Error message:', error.message);
            this.isSubmitting = false;
            this.cdr.detectChanges();
            console.log('[RegistroPage.onSubmit] Flag isSubmitting desactivado después de error');
            
            const alert = await this.alertController.create({
              header: 'Error',
              message: error.message || 'No se pudo crear la cuenta',
              buttons: ['OK']
            });
            console.log('[RegistroPage.onSubmit] Mostrando alerta de error');
            await alert.present();
          }
        });
      } catch (error: any) {
        console.error('[RegistroPage.onSubmit] Error durante el proceso:', error);
        console.error('[RegistroPage.onSubmit] Stack:', error.stack);
        this.isSubmitting = false;
        this.cdr.detectChanges();
        
        const alert = await this.alertController.create({
          header: 'Error',
          message: error.message || 'Ocurrió un error inesperado',
          buttons: ['OK']
        });
        console.log('[RegistroPage.onSubmit] Mostrando alerta de error del catch');
        await alert.present();
      }
    } else {
      console.warn('[RegistroPage.onSubmit] Formulario inválido');
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