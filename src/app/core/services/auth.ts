import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';
import {
  AuthResponse,
  LoginRequest,
  SignUpRequest,
  ForgotPasswordRequest,
  ResetPasswordRequest
} from '../models/auth.model';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private apiUrl = `${environment.apiUrl}/auth`;
  private googleOAuthUrl = environment.googleOAuthUrl;

  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);

  public currentUser = computed(() => this.currentUserSignal());
  public isLoggedIn = computed(() => !!this.currentUserSignal() && !!this.getToken());
  public isLoading = computed(() => this.isLoadingSignal());
  public userRole = computed(() => this.currentUserSignal()?.role || null);
  public isBidder = computed(() => this.userRole() === 'BIDDER' || this.userRole() === 'ADMIN');
  public isAdmin = computed(() => this.userRole() === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');
    
    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
        console.log('User loaded from storage:', user.role);
      } catch {
        this.clearSession();
      }
    }
  }

  private setSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSignal.set(user);
    console.log('Session set for user:', user.studentEmail, 'Role:', user.role);
  }

  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('oauth_redirect');
    this.currentUserSignal.set(null);
  }

  // Google OAuth
  loginWithGoogle(): void {
    localStorage.setItem('oauth_redirect', window.location.pathname);
    window.location.href = this.googleOAuthUrl;
  }

  handleOAuthCallback(token: string, userJson: string): boolean {
    try {
      const user = JSON.parse(decodeURIComponent(userJson));
      this.setSession(token, user);
      
      const redirectUrl = localStorage.getItem('oauth_redirect') || '/dashboard';
      localStorage.removeItem('oauth_redirect');
      
      // Redirect based on user role
      if (user.role === 'ADMIN') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate([redirectUrl]);
      }
      return true;
    } catch (error) {
      console.error('OAuth callback error:', error);
      this.router.navigate(['/login'], { 
        queryParams: { error: 'OAuth authentication failed' } 
      });
      return false;
    }
  }

  // Email/Password Login
  login(request: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap({
        next: (response) => {
          this.isLoadingSignal.set(false);
          if (response.success && response.token && response.user) {
            this.setSession(response.token, response.user);
            console.log('Login successful. Role:', response.user.role);
          }
        },
        error: () => this.isLoadingSignal.set(false)
      })
    );
  }

  signUp(request: SignUpRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, request).pipe(
      tap({
        next: () => this.isLoadingSignal.set(false),
        error: () => this.isLoadingSignal.set(false)
      })
    );
  }

  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  verifyOtp(email: string, otp: string): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/verify-otp?email=${encodeURIComponent(email)}&otp=${otp}`,
      {}
    ).pipe(
      tap({
        next: (response) => {
          this.isLoadingSignal.set(false);
          if (response.success && response.token && response.user) {
            this.setSession(response.token, response.user);
          }
        },
        error: () => this.isLoadingSignal.set(false)
      })
    );
  }

  resendOtp(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/resend-otp?email=${encodeURIComponent(email)}`,
      {}
    );
  }

  forgotPassword(request: ForgotPasswordRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, request).pipe(
      tap({
        next: () => this.isLoadingSignal.set(false),
        error: () => this.isLoadingSignal.set(false)
      })
    );
  }

  verifyResetOtp(email: string, otp: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/verify-reset-otp? email=${encodeURIComponent(email)}&otp=${otp}`,
      {}
    );
  }

  resetPassword(request: ResetPasswordRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password`, request).pipe(
      tap({
        next: () => this.isLoadingSignal.set(false),
        error: () => this.isLoadingSignal.set(false)
      })
    );
  }

  resendResetOtp(email: string): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(
      `${this.apiUrl}/resend-reset-otp? email=${encodeURIComponent(email)}`,
      {}
    );
  }

  getCurrentUserFromApi(): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        this.currentUserSignal.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      })
    );
  }

  updateUserLocally(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSignal.set(user);
  }

  refreshUserRole(): void {
    this.getCurrentUserFromApi().subscribe();
  }

  getToken(): string | null {
    return localStorage.getItem('token');
  }

  getUser(): User | null {
    return this.currentUserSignal();
  }

  // ✅ Check if current user is admin
  checkIsAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  }

  // ✅ Check if current user is bidder
  checkIsBidder(): boolean {
    const user = this.getUser();
    return user?.role === 'BIDDER' || user?.role === 'ADMIN';
  }
}