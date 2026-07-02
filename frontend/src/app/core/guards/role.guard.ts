import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserRole } from '../../shared/dto/user.dto';
import { AuthService } from '../../features/auth/services/auth-service';

function roleGuard(role: UserRole): CanActivateFn {
  return () => {
    const authService = inject(AuthService);
    const router = inject(Router);

    if (!authService.isAuthenticated()) {
      return router.createUrlTree(['/login']);
    }

    if (authService.hasRole(role)) {
      return true;
    }

    return router.createUrlTree([
      role === UserRole.ADMIN ? '/profissional/agenda' : '/admin/visitas',
    ]);
  };
}

export const adminGuard = roleGuard(UserRole.ADMIN);
export const professionalGuard = roleGuard(UserRole.PROFESSIONAL);
