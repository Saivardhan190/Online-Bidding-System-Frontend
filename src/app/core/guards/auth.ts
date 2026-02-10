import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const authGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (token && userStr) {
    try {
      JSON.parse(userStr);
      return true;
    } catch {
      // Invalid user data
      localStorage.removeItem('token');
      localStorage. removeItem('user');
    }
  }

  router.navigate(['/login'], { queryParams: { returnUrl: state. url } });
  return false;
};