import { Component, OnInit, AfterViewInit, ChangeDetectorRef } from '@angular/core';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AlertController, LoadingController, Platform } from '@ionic/angular';
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
export class RecuperarPasswordPage implements OnInit, AfterViewInit {
  recuperarForm!: FormGroup;
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
    this.recuperarForm = this.formBuilder.group({
      email: ['', [Validators.required, Validators.email]]
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

  async onSubmit() {
    console.log('[RecuperarPasswordPage.onSubmit] Formulario válido:', this.recuperarForm.valid);
    
    if (this.recuperarForm.valid) {
      console.log('[RecuperarPasswordPage.onSubmit] Iniciando envío');
      
      // Usar flag isSubmitting en lugar de LoadingController
      this.isSubmitting = true;
      this.cdr.detectChanges();
      console.log('[RecuperarPasswordPage.onSubmit] Flag isSubmitting activado');

      try {
        const { email } = this.recuperarForm.value;
        console.log('[RecuperarPasswordPage.onSubmit] Email a recuperar:', email);

        console.log('[RecuperarPasswordPage.onSubmit] Llamando a authService.recuperarPassword()...');
        
        this.authService.recuperarPassword(email).subscribe({
          next: async (result) => {
            console.log('[RecuperarPasswordPage.onSubmit] Recuperación exitosa:', result);
            this.isSubmitting = false;
            this.cdr.detectChanges();
            console.log('[RecuperarPasswordPage.onSubmit] Flag isSubmitting desactivado');
            
            const alert = await this.alertController.create({
              header: '¡Enviado!',
              message: 'Hemos enviado un enlace de recuperación a tu correo electrónico.',
              buttons: [{
                text: 'OK',
                handler: () => {
                  console.log('[RecuperarPasswordPage.onSubmit] Usuario confirmó. Navegando a /login...');
                  this.router.navigate(['/login'], { replaceUrl: true });
                }
              }]
            });
            console.log('[RecuperarPasswordPage.onSubmit] Mostrando alerta de éxito');
            await alert.present();
          },
          error: async (error: any) => {
            console.error('[RecuperarPasswordPage.onSubmit] Error en recuperación:', error);
            this.isSubmitting = false;
            this.cdr.detectChanges();
            console.log('[RecuperarPasswordPage.onSubmit] Flag isSubmitting desactivado después de error');
            
            const alert = await this.alertController.create({
              header: 'Error',
              message: error.message || 'No se encontró una cuenta con ese correo',
              buttons: ['OK']
            });
            console.log('[RecuperarPasswordPage.onSubmit] Mostrando alerta de error');
            await alert.present();
          }
        });
      } catch (error: any) {
        console.error('[RecuperarPasswordPage.onSubmit] Error durante el proceso:', error);
        this.isSubmitting = false;
        this.cdr.detectChanges();
        
        const alert = await this.alertController.create({
          header: 'Error',
          message: error.message || 'Ocurrió un error inesperado',
          buttons: ['OK']
        });
        console.log('[RecuperarPasswordPage.onSubmit] Mostrando alerta de error del catch');
        await alert.present();
      }
    } else {
      console.warn('[RecuperarPasswordPage.onSubmit] Formulario inválido');
      const alert = await this.alertController.create({
        header: 'Formulario inválido',
        message: 'Por favor ingresa un correo válido',
        buttons: ['OK']
      });
      await alert.present();
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
