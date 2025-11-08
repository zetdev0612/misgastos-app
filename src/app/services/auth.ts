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
      // Example mock login logic
      if (email === 'test@example.com' && password === 'password') {
        // Simular un pequeño retraso para dar tiempo a la inicialización
        setTimeout(() => {
          // Guardar el estado de la sesión
          localStorage.setItem('isLoggedIn', 'true');
          if (recordar) {
            localStorage.setItem('recordarUsuario', email);
          } else {
            localStorage.removeItem('recordarUsuario');
          }
          subscriber.next({ success: true });
        }, 500);
      } else {
        subscriber.error(new Error('Credenciales inválidas'));
      }
    });
  }

  registro(userData: { nombreCompleto: string, email: string, password: string }): Observable<any> {
    return new Observable((observer) => {
      // Add your registration API call here
    });
  }

  logout(): Observable<any> {
    return of({ success: true });
  }

}

