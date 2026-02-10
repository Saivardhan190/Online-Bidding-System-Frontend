import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';

export const bidderGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || ! userStr) {
    router.navigate(['/login'], { queryParams: { returnUrl: state. url } });
    return false;
  }

  try {
    const user = JSON.parse(userStr);
    
    if (user.role === 'BIDDER' || user.role === 'ADMIN') {
      return true;
    } else {
      // Not a bidder, redirect to application page
      router.navigate(['/bidder-application/status']);
      return false;
    }
  } catch {
    router.navigate(['/login']);
    return false;
  }
};