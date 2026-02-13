import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login implements OnInit {
  loginForm: FormGroup;
  isLoading = false;
  isGoogleLoading = false;
  errorMessage = '';
  successMessage = '';  // Add this
  showPassword = false;
  sessionExpired = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute
  ) {
    this.loginForm = this.fb.group({
      studentEmail: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(8)]]
    });
  }

  ngOnInit(): void {
    // Check if already logged in
    if (this.authService.isLoggedIn()) {
      this.router.navigate(['/dashboard']);
      return;
    }

    // Check for session expiration
    this.route.queryParams.subscribe(params => {
      if (params['expired'] === 'true') {
        this.sessionExpired = true;
      }
      // Check for verification success message
      if (params['verified'] === 'true') {
        this.successMessage = '✅ Email verified successfully! You can now login.';
        setTimeout(() => this.successMessage = '', 5000);
      }
    });
  }

  /**
   * ✅ Submit Login Form
   */
  onSubmit(): void {
    if (this.loginForm.invalid) {
      this.errorMessage = 'Please enter valid email and password';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const credentials = {
      studentEmail: this.loginForm.value.studentEmail,
      password: this.loginForm.value.password
    };

    console.log('📤 Attempting login for:', credentials.studentEmail);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        console.log('✅ Login successful');
        this.isLoading = false;
        this.router.navigate(['/dashboard']);
      },
      error: (error) => {
        console.error('❌ Login error:', error);
        this.isLoading = false;

        // ✅ Handle unverified email
        if (error.status === 403 && error.error?.code === 'EMAIL_NOT_VERIFIED') {
          this.errorMessage = error.error.message;

          // Auto-redirect to OTP verification after 2 seconds
          setTimeout(() => {
            console.log('🔄 Redirecting to OTP verification');
            this.router.navigate(['/verify-otp'], {
              queryParams: { email: credentials.studentEmail }
            });
          }, 2000);
        }
        // ✅ Handle OAuth user trying to use password
        else if (error.error?.message?.includes('Google login')) {
          this.errorMessage = error.error.message;
        }
        // ✅ Handle invalid credentials
        else if (error.status === 400) {
          this.errorMessage = error.error?.message || 'Invalid email or password';
        }
        // ✅ Handle other errors
        else {
          this.errorMessage = 'An unexpected error occurred. Please try again.';
        }
      }
    });
  }

  /**
   * ✅ Login with Google
   */
  loginWithGoogle(): void {
    this.isGoogleLoading = true;
    this.authService.loginWithGoogle();
  }

  /**
   * ✅ Toggle Password Visibility
   */
  togglePasswordVisibility(): void {
    this.showPassword = !this.showPassword;
  }

  /**
   * ✅ Navigate to Forgot Password
   */
  goToForgotPassword(): void {
    this.router.navigate(['/forgot-password']);
  }
}