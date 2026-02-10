import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-admin-navbar',
  standalone:  true,
  imports: [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './admin-navbar.html',
  styleUrls:  ['./admin-navbar.scss']
})
export class AdminNavbar {
  showDropdown = signal(false);
  showMobileMenu = signal(false);

  navLinks = [
    { path: '/admin', label: 'Dashboard', icon: '🏠', exact: true },
    { path: '/admin/stalls', label: 'Stalls', icon: '🏪', exact: false },
    { path: '/admin/applications', label: 'Applications', icon: '📋', exact: false },
    { path:  '/admin/users', label: 'Users', icon: '👥', exact: false },
    { path:  '/admin/results', label: 'Results', icon: '🏆', exact: false }
  ];

  constructor(
    private authService:  AuthService,
    private router: Router
  ) {}

  getUser(): any {
    const userStr = localStorage.getItem('user');
    if (userStr) {
      try {
        return JSON.parse(userStr);
      } catch {
        return null;
      }
    }
    return null;
  }

  getUserName(): string {
    const user = this. getUser();
    if (! user?. studentName) return 'Admin';
    const parts = user.studentName.split(' ');
    return parts[0] || 'Admin';
  }

  getUserInitial(): string {
    const user = this. getUser();
    if (!user?.studentName) return 'A';
    return user.studentName. charAt(0).toUpperCase();
  }

  getProfilePicture(): string | null {
    const user = this.getUser();
    return user?.profilePicture || null;
  }

  toggleDropdown(): void {
    this.showDropdown.update(v => !v);
  }

  closeDropdown(): void {
    this.showDropdown.set(false);
  }

  toggleMobileMenu(): void {
    this.showMobileMenu.update(v => !v);
  }

  closeMobileMenu(): void {
    this. showMobileMenu. set(false);
  }

  logout(): void {
    this.closeDropdown();
    this.closeMobileMenu();
    this.authService.logout();
  }
}