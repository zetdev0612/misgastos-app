import { Injectable } from '@angular/core';
import emailjs from '@emailjs/browser';
import { emailConfig } from '../config/email.config';

@Injectable({
  providedIn: 'root',
})
export class EmailService {
  private readonly SERVICE_ID = emailConfig.SERVICE_ID;
  private readonly TEMPLATE_ID = emailConfig.TEMPLATE_ID;
  private readonly PUBLIC_KEY = emailConfig.PUBLIC_KEY;

  constructor() {
    this.initEmailJS();
  }

  private initEmailJS() {
    try {
      emailjs.init(this.PUBLIC_KEY);
      console.log('[EmailService] EmailJS inicializado correctamente');
    } catch (error) {
      console.error('[EmailService] Error inicializando EmailJS:', error);
    }
  }

  async enviarCorreoRecuperacion(email: string, nombreUsuario: string = 'Usuario'): Promise<boolean> {
    try {
      // Token de recuperación simple (en producción sería más seguro)
      const tokenRecuperacion = this.generarToken();
      const enlaceRecuperacion = `${window.location.origin}/reset-password?token=${tokenRecuperacion}&email=${encodeURIComponent(email)}`;

      const templateParams = {
        email: email,
        link: enlaceRecuperacion,
      };

      console.log('[EmailService] Enviando correo de recuperación a:', email);
      
      const response = await emailjs.send(
        this.SERVICE_ID,
        this.TEMPLATE_ID,
        templateParams
      );

      console.log('[EmailService] Correo enviado exitosamente:', response);
      return true;
    } catch (error) {
      console.error('[EmailService] Error enviando correo:', error);
      throw new Error('Error al enviar el correo de recuperación');
    }
  }

  private generarToken(): string {
    return Math.random().toString(36).substring(2, 15) + 
           Math.random().toString(36).substring(2, 15);
  }
}
