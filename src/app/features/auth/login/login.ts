import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink, ActivatedRoute } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './login.html',
  styleUrls: ['./login.scss']
})
export class Login {
  loginForm: FormGroup;
  isLoading = false;
  isGoogleLoading = false;
  showPassword = false;
  errorMessage = '';
  sessionExpired = false;
  returnUrl = '/dashboard';

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this.loginForm = this.fb.group({
      studentEmail: ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(6)]]
    });

    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/dashboard';
    this.sessionExpired = this.route.snapshot.queryParams['expired'] === 'true';
    
    if (this.sessionExpired) {
      this.toastr.warning('Your session has expired. Please login again.', 'Session Expired');
    }
    
    // Check for OAuth errors
    const oauthError = this.route.snapshot.queryParams['error'];
    if (oauthError) {
      this.errorMessage = oauthError;
      this.toastr.error(oauthError, 'OAuth Error');
    }
  }

  onSubmit(): void {
    if (this.loginForm.invalid) {
      Object.keys(this.loginForm.controls).forEach(key => {
        this.loginForm.get(key)?.markAsTouched();
      });
      this.toastr.warning('Please fill in all required fields correctly', 'Validation Error');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    const credentials = {
      studentEmail: this.loginForm.get('studentEmail')?.value.trim().toLowerCase(),
      password: this.loginForm.get('password')?.value
    };

    console.log('Attempting login with:', credentials.studentEmail);

    this.authService.login(credentials).subscribe({
      next: (response) => {
        this.isLoading = false;
        console.log('Login response:', response);
        
        if (response.success && response.user) {
          console.log('User role:', response.user.role);
          this.toastr.success(`Welcome back, ${response.user.studentName}!`, 'Login Successful');
          
          // ✅ Redirect based on role with a slight delay to show the toast
          const userRole = response.user.role;
          setTimeout(() => {
            if (userRole === 'ADMIN') {
              console.log('Redirecting to admin dashboard');
              this.router.navigate(['/admin']);
            } else {
              console.log('Redirecting to user dashboard');
              this.router.navigate([this.returnUrl]);
            }
          }, 500);
        } else {
          if (response.message?.includes('not verified')) {
            this.toastr.info('Please verify your email to continue', 'Email Verification Required');
            setTimeout(() => {
              this.router.navigate(['/verify-otp'], {
                queryParams: { email: credentials.studentEmail }
              });
            }, 500);
          } else {
            this.errorMessage = response.message || 'Login failed';
            this.toastr.error(this.errorMessage, 'Login Failed');
          }
        }
      },
      error: (error) => {
        this.isLoading = false;
        console.error('Login error:', error);
        
        if (error.error?.errors) {
          const errors = error.error.errors;
          const errorMessages = Object.keys(errors).map(key => `${key}: ${errors[key]}`);
          this.errorMessage = errorMessages.join(', ');
        } else if (error.error?.message) {
          this.errorMessage = error.error.message;
        } else if (error.status === 401) {
          this.errorMessage = 'Invalid email or password';
        } else if (error.status === 400) {
          this.errorMessage = 'Please check your input and try again';
        } else {
          this.errorMessage = 'Login failed. Please try again.';
        }
        this.toastr.error(this.errorMessage, 'Login Failed');
      }
    });
  }

  loginWithGoogle(): void {
    this.isGoogleLoading = true;
    this.errorMessage = '';
    this.authService.loginWithGoogle();
  }
}