import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  recuperarPassword(email: string): Observable<any> {
    if (email === 'test@example.com') {
      return of({ success: true });
    } else {
      return throwError(() => new Error('No se encontró una cuenta con ese correo'));
    }
  }


  currentUserValue(): boolean {
    // Mock implementation, replace with actual user retrieval logic
    return false;
  }

  login(email: string, password: string, recordar: boolean) {
    return new Observable<any>((subscriber) => {
      setTimeout(() => {
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        // Buscar usuario registrado o usuario de prueba
        const user = registeredUsers.find((u: any) => u.email === email) || 
                     (email === 'test@example.com' && password === 'password' ? { email: 'test@example.com', nombreCompleto: 'Usuario Test', id: 'test-user' } : null);

        if (user && (registeredUsers.some((u: any) => u.email === email && u.password === password) || 
                     (email === 'test@example.com' && password === 'password'))) {
          // Asegurar que el usuario tenga un id
          const userId = user.id || user.email;
          
          // Login exitoso
          localStorage.setItem('isLoggedIn', 'true');
          localStorage.setItem('currentUser', JSON.stringify({
            email: user.email,
            nombreCompleto: user.nombreCompleto,
            id: userId
          }));
          
          if (recordar) {
            localStorage.setItem('recordarUsuario', email);
          } else {
            localStorage.removeItem('recordarUsuario');
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
      setTimeout(() => {
        // Validar que el email no esté registrado
        const registeredUsers = JSON.parse(localStorage.getItem('registeredUsers') || '[]');
        
        if (registeredUsers.some((user: any) => user.email === userData.email)) {
          observer.error(new Error('Este correo electrónico ya está registrado'));
          return;
        }

        // Guardar el nuevo usuario
        const newUser = {
          id: Date.now().toString(),
          nombreCompleto: userData.nombreCompleto,
          email: userData.email,
          password: userData.password,
          fechaRegistro: new Date().toISOString()
        };

        registeredUsers.push(newUser);
        localStorage.setItem('registeredUsers', JSON.stringify(registeredUsers));

        observer.next({ success: true, message: 'Cuenta creada exitosamente' });
        observer.complete();
      }, 500);
    });
  }

  getCurrentUser(): any {
    const user = localStorage.getItem('currentUser');
    return user ? JSON.parse(user) : null;
  }

  getCurrentUserId(): string | null {
    const user = this.getCurrentUser();
    return user?.id || user?.email || null;
  }

  isLoggedIn(): boolean {
    return localStorage.getItem('isLoggedIn') === 'true';
  }

  logout(): Observable<any> {
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    return of({ success: true });
  }

}


