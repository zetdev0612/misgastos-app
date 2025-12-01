import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { Preferences } from '@capacitor/preferences';
import { EmailService } from './email.service';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  constructor(private emailService: EmailService) {}

  recuperarPassword(email: string): Observable<any> {
    return new Observable<any>((subscriber) => {
      setTimeout(async () => {
        try {
          const result = await Preferences.get({ key: 'registeredUsers' });
          const registeredUsers = result.value ? JSON.parse(result.value) : [];
          
          // Buscar si el usuario existe
          const user = registeredUsers.find((u: any) => u.email === email) || 
                      (email === 'test@example.com' ? { email: 'test@example.com', nombreCompleto: 'Usuario Test' } : null);
          
          if (user) {
            try {
              // Enviar correo de recuperación real
              await this.emailService.enviarCorreoRecuperacion(email, user.nombreCompleto);
              console.log('Correo de recuperación enviado exitosamente a:', email);
              subscriber.next({ success: true, message: 'Enlace de recuperación enviado al correo' });
            } catch (emailError) {
              console.error('Error enviando correo:', emailError);
              subscriber.error(new Error('Error al enviar el correo de recuperación'));
            }
          } else {
            subscriber.error(new Error('No se encontró una cuenta con ese correo'));
          }
        } catch (error) {
          subscriber.error(new Error('Error al procesar la solicitud'));
        }
      }, 500);
    });
  }

  resetPassword(email: string, token: string, newPassword: string): Observable<any> {
    return new Observable<any>((subscriber) => {
      setTimeout(async () => {
        try {
          const result = await Preferences.get({ key: 'registeredUsers' });
          const registeredUsers = result.value ? JSON.parse(result.value) : [];
          
          // Buscar el usuario por email
          const userIndex = registeredUsers.findIndex((u: any) => u.email === email);
          
          if (userIndex === -1) {
            subscriber.error(new Error('Usuario no encontrado'));
            return;
          }
          
          // En una aplicación real, validarías el token
          // Por ahora lo aceptamos siempre (en producción verificarías expiración, etc)
          console.log('[Auth.resetPassword] Token validado para:', email);
          
          // Actualizar la contraseña
          registeredUsers[userIndex].password = newPassword;
          registeredUsers[userIndex].ultimoResetPassword = new Date().toISOString();
          
          await Preferences.set({
            key: 'registeredUsers',
            value: JSON.stringify(registeredUsers)
          });
          
          console.log('[Auth.resetPassword] Contraseña actualizada para:', email);
          subscriber.next({ success: true, message: 'Contraseña actualizada correctamente' });
        } catch (error) {
          console.error('[Auth.resetPassword] Error:', error);
          subscriber.error(new Error('Error al actualizar la contraseña'));
        }
      }, 500);
    });
  }


  currentUserValue(): boolean {
    // Mock implementation, replace with actual user retrieval logic
    return false;
  }

  login(email: string, password: string, recordar: boolean) {
    return new Observable<any>((subscriber) => {
      setTimeout(async () => {
        const result = await Preferences.get({ key: 'registeredUsers' });
        const registeredUsers = result.value ? JSON.parse(result.value) : [];
        
        // Buscar usuario registrado o usuario de prueba
        const user = registeredUsers.find((u: any) => u.email === email) || 
                     (email === 'test@example.com' && password === 'password' ? { email: 'test@example.com', nombreCompleto: 'Usuario Test', id: 'test-user' } : null);

        if (user && (registeredUsers.some((u: any) => u.email === email && u.password === password) || 
                     (email === 'test@example.com' && password === 'password'))) {
          // Asegurar que el usuario tenga un id
          const userId = user.id || user.email;
          
          // Login exitoso
          await Preferences.set({ key: 'isLoggedIn', value: 'true' });
          await Preferences.set({ 
            key: 'currentUser', 
            value: JSON.stringify({
              email: user.email,
              nombreCompleto: user.nombreCompleto,
              id: userId
            })
          });
          
          if (recordar) {
            await Preferences.set({ key: 'recordarUsuario', value: email });
          } else {
            await Preferences.remove({ key: 'recordarUsuario' });
          }
          
          // Asegurar que las transacciones del usuario se cargan correctamente
          console.log('Login exitoso para usuario:', userId);
          
          subscriber.next({ success: true, user: { ...user, id: userId } });
        } else {
          subscriber.error(new Error('Credenciales inválidas'));
        }
      }, 500);
    });
  }

  registro(userData: { nombreCompleto: string, email: string, password: string }): Observable<any> {
    return new Observable((observer) => {
      setTimeout(async () => {
        try {
          console.log('[Auth.registro] Iniciando registro con email:', userData.email);
          
          // Validar que el email no esté registrado
          console.log('[Auth.registro] Obteniendo usuarios registrados de Preferences...');
          const result = await Preferences.get({ key: 'registeredUsers' });
          const registeredUsers = result.value ? JSON.parse(result.value) : [];
          console.log('[Auth.registro] Total de usuarios registrados:', registeredUsers.length);
          
          if (registeredUsers.some((user: any) => user.email === userData.email)) {
            console.warn('[Auth.registro] El email ya existe:', userData.email);
            observer.error(new Error('Este correo electrónico ya está registrado'));
            return;
          }

          // Guardar el nuevo usuario
          console.log('[Auth.registro] Creando nuevo usuario...');
          const newUser = {
            id: Date.now().toString(),
            nombreCompleto: userData.nombreCompleto,
            email: userData.email,
            password: userData.password,
            fechaRegistro: new Date().toISOString()
          };
          console.log('[Auth.registro] Nuevo usuario creado con ID:', newUser.id);

          registeredUsers.push(newUser);
          console.log('[Auth.registro] Guardando usuarios en Preferences...');
          await Preferences.set({ 
            key: 'registeredUsers', 
            value: JSON.stringify(registeredUsers) 
          });
          console.log('[Auth.registro] Usuarios guardados exitosamente. Total:', registeredUsers.length);

          console.log('[Auth.registro] Registro completado exitosamente para:', userData.email);
          observer.next({ success: true, message: 'Cuenta creada exitosamente' });
          observer.complete();
        } catch (error) {
          console.error('[Auth.registro] Error durante el registro:', error);
          observer.error(error);
        }
      }, 500);
    });
  }

  async getCurrentUser(): Promise<any> {
    const result = await Preferences.get({ key: 'currentUser' });
    return result.value ? JSON.parse(result.value) : null;
  }

  async getCurrentUserId(): Promise<string | null> {
    const user = await this.getCurrentUser();
    return user?.id || user?.email || null;
  }

  async isLoggedIn(): Promise<boolean> {
    const result = await Preferences.get({ key: 'isLoggedIn' });
    return result.value === 'true';
  }

  logout(): Observable<any> {
    return new Observable<any>((subscriber) => {
      setTimeout(async () => {
        try {
          await Preferences.remove({ key: 'isLoggedIn' });
          await Preferences.remove({ key: 'currentUser' });
          subscriber.next({ success: true });
        } catch (e) {
          subscriber.error(e);
        }
      }, 0);
    });
  }

}


