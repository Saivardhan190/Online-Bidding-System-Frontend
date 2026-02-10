import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
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
    private router: Router
  ) {
    this.forgotForm = this.fb. group({
      studentEmail: ['', [Validators.required, Validators.email]]
    });
  }

  onSubmit(): void {
    if (this.forgotForm. invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    this.authService.forgotPassword(this. forgotForm.value).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this. successMessage = 'OTP sent successfully!';
          setTimeout(() => {
            this.router.navigate(['/reset-password'], {
              queryParams:  { email: this.forgotForm. get('studentEmail')?.value }
            });
          }, 1500);
        } else {
          this. errorMessage = response. message || 'Failed to send OTP';
        }
      },
      error:  (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Email not found. Please check and try again.';
      }
    });
  }
}