import { Injectable, inject } from '@angular/core';
import { Router, CanActivateFn, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Auth } from '../services/auth';

export const authGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(Auth);
  const router = inject(Router);

  try {
    const isLoggedIn = await authService.isLoggedIn();
    console.log('[authGuard] isLoggedIn:', isLoggedIn, 'Intentando acceder a:', state.url);
    
    if (isLoggedIn) {
      return true;
    } else {
      console.log('[authGuard] No autenticado, redirigiendo a /login');
      router.navigate(['/login']);
      return false;
    }
  } catch (error) {
    console.error('[authGuard] Error verificando autenticación:', error);
    router.navigate(['/login']);
    return false;
  }
};

export const loginGuard: CanActivateFn = async (
  route: ActivatedRouteSnapshot,
  state: RouterStateSnapshot
) => {
  const authService = inject(Auth);
  const router = inject(Router);

  try {
    const isLoggedIn = await authService.isLoggedIn();
    console.log('[loginGuard] isLoggedIn:', isLoggedIn, 'Intentando acceder a:', state.url);
    
    if (!isLoggedIn) {
      return true;
    } else {
      console.log('[loginGuard] Ya autenticado, redirigiendo a /home');
      router.navigate(['/home']);
      return false;
    }
  } catch (error) {
    console.error('[loginGuard] Error verificando autenticación:', error);
    return true;
  }
};
