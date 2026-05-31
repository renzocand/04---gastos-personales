import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../../features/auth/services/auth.service';

/** Protege las rutas privadas: sin token, redirige al login. */
export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.getToken() ? true : router.createUrlTree(['/login']);
};

/** Evita que un usuario ya autenticado vea login/registro. */
export const guestGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  return auth.getToken() ? router.createUrlTree(['/dashboard']) : true;
};
