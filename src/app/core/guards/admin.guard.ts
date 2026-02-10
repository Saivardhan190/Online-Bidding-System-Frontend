import { inject } from '@angular/core';
import { Router, CanActivateFn } from '@angular/router';
import { AuthService } from '../services/auth';

export const adminGuard: CanActivateFn = (route, state) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const token = localStorage.getItem('token');
  const userStr = localStorage.getItem('user');

  if (!token || ! userStr) {
    console.log('Admin Guard: No token or user, redirecting to login');
    router.navigate(['/login'], { queryParams: { returnUrl: state. url } });
    return false;
  }

  try {
    const user = JSON.parse(userStr);
    console.log('Admin Guard:  Checking user role:', user. role);
    
    if (user. role === 'ADMIN') {
      console.log('Admin Guard: Access granted');
      return true;
    } else {
      console.log('Admin Guard: Not an admin, redirecting to dashboard');
      router.navigate(['/dashboard']);
      return false;
    }
  } catch (error) {
    console. error('Admin Guard:  Error parsing user', error);
    router.navigate(['/login']);
    return false;
  }
};