import { Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap, catchError, throwError } from 'rxjs';
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

  // ✅ Signals for reactive state management
  private currentUserSignal = signal<User | null>(null);
  private isLoadingSignal = signal<boolean>(false);

  // ✅ Computed signals
  public currentUser = computed(() => this.currentUserSignal());
  public isLoggedIn = computed(() => !!this.currentUserSignal() && !!this.getToken());
  public isLoading = computed(() => this.isLoadingSignal());
  public userRole = computed(() => this.currentUserSignal()?.role || null);
  public isBidder = computed(() => this.userRole() === 'BIDDER' || this.userRole() === 'ADMIN');
  public isAdmin = computed(() => this.userRole() === 'ADMIN');

  constructor(private http: HttpClient, private router: Router) {
    this.loadUserFromStorage();
  }

  /**
   * ✅ Load user from localStorage on app init
   */
  private loadUserFromStorage(): void {
    const token = localStorage.getItem('token');
    const userStr = localStorage.getItem('user');

    if (token && userStr) {
      try {
        const user = JSON.parse(userStr);
        this.currentUserSignal.set(user);
        console.log('✅ User loaded from storage:', user.studentEmail, '| Role:', user.role);
      } catch (error) {
        console.error('❌ Error parsing user from storage:', error);
        this.clearSession();
      }
    }
  }

  /**
   * ✅ Set session (token + user)
   */
  private setSession(token: string, user: User): void {
    localStorage.setItem('token', token);
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSignal.set(user);
    console.log('✅ Session set for:', user.studentEmail, '| Role:', user.role);
  }

  /**
   * ✅ Clear session
   */
  private clearSession(): void {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    localStorage.removeItem('oauth_redirect');
    this.currentUserSignal.set(null);
    console.log('🗑️ Session cleared');
  }

  // ========================================
  // GOOGLE OAUTH
  // ========================================

  /**
   * ✅ Login with Google - Redirect to OAuth
   */
  loginWithGoogle(): void {
    localStorage.setItem('oauth_redirect', window.location.pathname);
    console.log('🔐 Redirecting to Google OAuth');
    window.location.href = this.googleOAuthUrl;
  }

  /**
   * ✅ Handle OAuth callback
   */
  handleOAuthCallback(token: string, userJson: string): boolean {
    try {
      const user = JSON.parse(decodeURIComponent(userJson));
      this.setSession(token, user);

      const redirectUrl = localStorage.getItem('oauth_redirect') || '/dashboard';
      localStorage.removeItem('oauth_redirect');

      // Redirect based on role
      if (user.role === 'ADMIN') {
        this.router.navigate(['/admin']);
      } else {
        this.router.navigate([redirectUrl]);
      }
      return true;
    } catch (error) {
      console.error('❌ OAuth callback error:', error);
      this.router.navigate(['/login'], {
        queryParams: { error: 'OAuth authentication failed' }
      });
      return false;
    }
  }

  // ========================================
  // EMAIL/PASSWORD AUTHENTICATION
  // ========================================

  /**
   * ✅ Login with email and password
   */
  login(request: LoginRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    console.log('📤 Login request for:', request.studentEmail);

    return this.http.post<AuthResponse>(`${this.apiUrl}/login`, request).pipe(
      tap({
        next: (response) => {
          this.isLoadingSignal.set(false);
          console.log('✅ Login response:', response);

          if (response.success && response.token && response.user) {
            this.setSession(response.token, response.user);
          }
        },
        error: (error) => {
          this.isLoadingSignal.set(false);
          console.error('❌ Login error:', error);
        }
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Signup with email and password
   */
  signUp(request: SignUpRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    console.log('📤 Signup request for:', request.studentEmail);

    return this.http.post<AuthResponse>(`${this.apiUrl}/signup`, request).pipe(
      tap({
        next: (response) => {
          this.isLoadingSignal.set(false);
          console.log('✅ Signup response:', response);

          // Log if existing unverified user
          if (response.isExistingUnverified) {
            console.log('ℹ️ Existing unverified user - OTP resent');
          }
        },
        error: (error) => {
          this.isLoadingSignal.set(false);
          console.error('❌ Signup error:', error);
        }
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Logout
   */
  logout(): void {
    this.clearSession();
    this.router.navigate(['/login']);
  }

  // ========================================
  // OTP VERIFICATION
  // ========================================

  /**
   * ✅ Verify OTP
   */
  verifyOtp(email: string, otp: string): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    console.log('📤 Verifying OTP for:', email);

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/verify-otp?email=${encodeURIComponent(email)}&otp=${otp}`,
      {}
    ).pipe(
      tap({
        next: (response) => {
          this.isLoadingSignal.set(false);
          console.log('✅ OTP verification response:', response);

          if (response.success && response.token && response.user) {
            this.setSession(response.token, response.user);
          }
        },
        error: (error) => {
          this.isLoadingSignal.set(false);
          console.error('❌ OTP verification error:', error);
        }
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Resend OTP
   */
  resendOtp(email: string): Observable<AuthResponse> {
    console.log('📤 Resending OTP to:', email);

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/resend-otp?email=${encodeURIComponent(email)}`,
      {}
    ).pipe(
      tap(response => console.log('✅ OTP resent:', response)),
      catchError(error => {
        console.error('❌ Resend OTP error:', error);
        return throwError(() => error);
      })
    );
  }

  // ========================================
  // PASSWORD RESET
  // ========================================

  /**
   * ✅ Forgot password - Send reset OTP
   */
  forgotPassword(request: ForgotPasswordRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    console.log('📤 Forgot password request for:', request.studentEmail);

    return this.http.post<AuthResponse>(`${this.apiUrl}/forgot-password`, request).pipe(
      tap({
        next: (response) => {
          this.isLoadingSignal.set(false);
          console.log('✅ Reset OTP sent:', response);
        },
        error: (error) => {
          this.isLoadingSignal.set(false);
          console.error('❌ Forgot password error:', error);
        }
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Verify reset OTP
   */
  verifyResetOtp(email: string, otp: string): Observable<AuthResponse> {
    console.log('📤 Verifying reset OTP for:', email);

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/verify-reset-otp?email=${encodeURIComponent(email)}&otp=${otp}`,
      {}
    ).pipe(
      tap(response => console.log('✅ Reset OTP verified:', response)),
      catchError(error => {
        console.error('❌ Verify reset OTP error:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Reset password
   */
  resetPassword(request: ResetPasswordRequest): Observable<AuthResponse> {
    this.isLoadingSignal.set(true);
    console.log('📤 Resetting password for:', request.studentEmail);

    return this.http.post<AuthResponse>(`${this.apiUrl}/reset-password`, request).pipe(
      tap({
        next: (response) => {
          this.isLoadingSignal.set(false);
          console.log('✅ Password reset successful:', response);
        },
        error: (error) => {
          this.isLoadingSignal.set(false);
          console.error('❌ Reset password error:', error);
        }
      }),
      catchError(error => {
        this.isLoadingSignal.set(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Resend reset OTP
   */
  resendResetOtp(email: string): Observable<AuthResponse> {
    console.log('📤 Resending reset OTP to:', email);

    return this.http.post<AuthResponse>(
      `${this.apiUrl}/resend-reset-otp?email=${encodeURIComponent(email)}`,
      {}
    ).pipe(
      tap(response => console.log('✅ Reset OTP resent:', response)),
      catchError(error => {
        console.error('❌ Resend reset OTP error:', error);
        return throwError(() => error);
      })
    );
  }

  // ========================================
  // USER MANAGEMENT
  // ========================================

  /**
   * ✅ Get current user from API
   */
  getCurrentUserFromApi(): Observable<User> {
    console.log('📤 Fetching current user from API');

    return this.http.get<User>(`${this.apiUrl}/me`).pipe(
      tap((user) => {
        console.log('✅ Current user fetched:', user);
        this.currentUserSignal.set(user);
        localStorage.setItem('user', JSON.stringify(user));
      }),
      catchError(error => {
        console.error('❌ Error fetching current user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Update user locally
   */
  updateUserLocally(user: User): void {
    localStorage.setItem('user', JSON.stringify(user));
    this.currentUserSignal.set(user);
    console.log('✅ User updated locally:', user.studentEmail);
  }

  /**
   * ✅ Refresh user role
   */
  refreshUserRole(): void {
    console.log('🔄 Refreshing user role');
    this.getCurrentUserFromApi().subscribe();
  }

  /**
   * ✅ Get token
   */
  getToken(): string | null {
    return localStorage.getItem('token');
  }

  /**
   * ✅ Get user
   */
  getUser(): User | null {
    return this.currentUserSignal();
  }

  /**
   * ✅ Check if current user is admin
   */
  checkIsAdmin(): boolean {
    const user = this.getUser();
    return user?.role === 'ADMIN';
  }

  /**
   * ✅ Check if current user is bidder
   */
  checkIsBidder(): boolean {
    const user = this.getUser();
    return user?.role === 'BIDDER' || user?.role === 'ADMIN';
  }
}