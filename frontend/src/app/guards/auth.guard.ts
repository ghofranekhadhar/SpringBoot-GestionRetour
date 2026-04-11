import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  if (authService.currentUser) {
    const requiredRole = route.data['role'];

    if (requiredRole && authService.currentUser.role !== requiredRole) {
      // QUALITE peut accéder aux routes de validation (retours, non-conformités, historique)
      const isQualite = authService.currentUser.role === 'QUALITE';
      const isEmploye = authService.currentUser.role === 'EMPLOYE';
      const url = state.url;
      const qualiteAllowed = url.includes('/admin/returns') ||
                             url.includes('/admin/non-conformites') ||
                             url.includes('/admin/historique') ||
                             url.includes('/admin/dashboard');
      
      if ((isQualite && qualiteAllowed) || (isEmploye && url.includes('/admin/non-conformites'))) {
        return true;
      }
      router.navigate(['/']);
      return false;
    }

    return true;
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state.url } });
  return false;
};
