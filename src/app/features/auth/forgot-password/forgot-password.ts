import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-forgot-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl:  './forgot-password.html',
  styleUrls:  ['./forgot-password.scss']
})
export class ForgotPassword {
  forgotForm: FormGroup;
  isLoading = false;
  errorMessage = '';
  successMessage = '';

  constructor(
    private fb: FormBuilder,
    private authService:  AuthService,
    private router: Router,
    private toastr: ToastrService
  ) {
    this.forgotForm = this.fb. group({
      studentEmail: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm. invalid) {
      this.toastr.warning('Please enter a valid email address', 'Invalid Email');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this.forgotForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.successMessage = 'OTP sent successfully!';
          this.toastr.success('OTP sent to your email. Redirecting to reset password...', 'Email Sent', { timeOut: 2000 });
          setTimeout(() => {
            this.router.navigate(['/reset-password'], {
              queryParams: { email: this.forgotForm.get('studentEmail')?.value }
            });
          }, 1500);
        } else {
          this.errorMessage = response.message || 'Failed to send OTP';
          this.toastr.error(this.errorMessage, 'Request Failed');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMsg = error.error?.message || 'Email not found. Please check and try again.';
        this.errorMessage = errorMsg;
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }
}