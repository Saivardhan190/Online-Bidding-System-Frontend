import { Component, signal, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterLink, RouterLinkActive, NavigationEnd } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { Subscription, filter } from 'rxjs';

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports:  [CommonModule, RouterLink, RouterLinkActive],
  templateUrl: './navbar.html',
  styleUrls: ['./navbar.scss']
})
export class Navbar implements OnInit, OnDestroy {
  showDropdown = signal(false);
  showMobileMenu = signal(false);
  isAuthenticated = signal(false);
  currentUser = signal<any>(null);

  private routerSubscription?:  Subscription;

  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit(): void {
    // Check auth state on init
    this. checkAuthState();

    // Re-check auth state on every navigation
    this. routerSubscription = this.router.events
      .pipe(filter(event => event instanceof NavigationEnd))
      .subscribe(() => {
        this.checkAuthState();
        this.closeDropdown();
        this.closeMobileMenu();
      });
  }

  ngOnDestroy(): void {
    this.routerSubscription?.unsubscribe();
  }

  private checkAuthState(): void {
    const token = localStorage. getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.isAuthenticated. set(true);
        this.currentUser.set(user);
      } catch {
        this.isAuthenticated.set(false);
        this.currentUser.set(null);
      }
    } else {
      this.isAuthenticated.set(false);
      this.currentUser.set(null);
    }
  }

  // Auth checks
  isLoggedIn(): boolean {
    return this.isAuthenticated();
  }

  getUser(): any {
    return this.currentUser();
  }

  isBidder(): boolean {
    const user = this.getUser();
    return user?.role === 'BIDDER' || user?.role === 'ADMIN';
  }

  isAdmin(): boolean {
    const user = this.getUser();
    return user?. role === 'ADMIN';
  }

  // User info helpers
  getUserName(): string {
    const user = this.getUser();
    if (!user?.studentName) return 'User';
    const parts = user.studentName.split(' ');
    return parts[0] || 'User';
  }

  getFullName(): string {
    const user = this.getUser();
    return user?.studentName || 'User';
  }

  getUserEmail(): string {
    const user = this. getUser();
    return user?.studentEmail || '';
  }

  getUserInitial(): string {
    const user = this.getUser();
    if (!user?.studentName) return 'U';
    return user.studentName.charAt(0).toUpperCase();
  }

  getProfilePicture(): string | null {
    const user = this.getUser();
    return user?.profilePicture || null;
  }

  getUserRole(): string {
    const user = this. getUser();
    return user?.role || 'USER';
  }

  getRoleBadge(): { class: string; label: string; icon:  string } {
    const role = this.getUserRole();
    switch (role) {
      case 'ADMIN':
        return { class: 'bg-purple-100 text-purple-800', label: 'Admin', icon: '👑' };
      case 'BIDDER':
        return { class: 'bg-green-100 text-green-800', label: 'Bidder', icon: '🎯' };
      default:
        return { class: 'bg-blue-100 text-blue-800', label: 'User', icon: '👤' };
    }
  }

  // Navigation helpers
  goToHome(): void {
    this.closeMobileMenu();
    this.closeDropdown();
    this.router.navigate(['/home']);
  }

  goToAdmin(): void {
    this.closeMobileMenu();
    this.closeDropdown();
    this.router.navigate(['/admin']);
  }

  // UI state management
  toggleDropdown(): void {
    this.showDropdown.update(v => !v);
    if (this.showDropdown()) {
      this. showMobileMenu.set(false);
    }
  }

  closeDropdown(): void {
    this.showDropdown. set(false);
  }

  toggleMobileMenu(): void {
    this. showMobileMenu. update(v => ! v);
    if (this.showMobileMenu()) {
      this.showDropdown.set(false);
    }
  }

  closeMobileMenu(): void {
    this.showMobileMenu.set(false);
  }

  closeAll(): void {
    this.closeDropdown();
    this.closeMobileMenu();
  }

  // Auth actions
  logout(): void {
    this.closeAll();
    this.authService.logout();
  }
}