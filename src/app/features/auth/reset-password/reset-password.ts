import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-reset-password',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, FormsModule, RouterLink],
  templateUrl:   './reset-password.html',
  styleUrls: ['./reset-password.scss']
})
export class ResetPassword implements OnInit, OnDestroy {
  email = '';
  currentStep = 1;
  otpDigits:  string[] = ['', '', '', '', '', ''];
  resetForm:   FormGroup;
  isLoading = false;
  errorMessage = '';
  showPassword = false;
  countdown = 60;
  private countdownInterval: any;
  private readonly REDIRECT_DELAY_MS = 2000;

  constructor(
    private fb:  FormBuilder,
    private authService: AuthService,
    private router:   Router,
    private route: ActivatedRoute,
    private toastr: ToastrService
  ) {
    this. resetForm = this. fb.group({
      newPassword:   ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.email = this.route. snapshot.queryParams['email'] || '';
    if (! this.email) {
      this.router.navigate(['/forgot-password']);
    }
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  get otp(): string {
    return this.otpDigits. join('');
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    if (value && !/^\d$/.test(value)) {
      this. otpDigits[index] = '';
      return;
    }

    if (value && index < 5) {
      const nextInput = document.getElementById(`reset-otp-${index + 1}`) as HTMLInputElement;
      nextInput?. focus();
    }
  }

  onKeyDown(event:   KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && ! this.otpDigits[index] && index > 0) {
      const prevInput = document.getElementById(`reset-otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  }

  verifyOtp(): void {
    if (this.otp.length !== 6) {
      this.toastr.warning('Please enter a valid 6-digit OTP', 'Invalid OTP');
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';

    this.authService.verifyResetOtp(this.email, this.otp).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.toastr.success('OTP verified! Proceed to reset your password.', 'OTP Valid');
          this. currentStep = 2;
        } else {
          this.errorMessage = response.message || 'Invalid OTP';
          this.toastr.error(this.errorMessage, 'Verification Failed');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMsg = error.error?.message || 'Invalid OTP.  Please try again.';
        this.errorMessage = errorMsg;
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }

  resetPassword(): void {
    if (this. resetForm.invalid) {
      this.toastr.warning('Please fill in all password fields correctly', 'Form Invalid');
      return;
    }

    if (this.resetForm.get('newPassword')?.value !== this.resetForm.  get('confirmPassword')?.value) {
      this.errorMessage = 'Passwords do not match';
      this.toastr.error(this.errorMessage, 'Password Mismatch');
      return;
    }

    this. isLoading = true;
    this. errorMessage = '';

    const request = {
      studentEmail: this.email,
      otp: this.otp,
      newPassword:   this.resetForm.get('newPassword')?.value,
      confirmPassword: this.resetForm.get('confirmPassword')?.value
    };

    this.authService.resetPassword(request).subscribe({
      next: (response) => {
        this.isLoading = false;
        if (response.success) {
          this.toastr.success('Password reset successfully! Redirecting to login...', 'Success');
          this. currentStep = 3;
          setTimeout(() => {
            this.router.navigate(['/login']);
          }, this.REDIRECT_DELAY_MS);
        } else {
          this.errorMessage = response.message || 'Failed to reset password';
          this.toastr.error(this.errorMessage, 'Reset Failed');
        }
      },
      error: (error) => {
        this.isLoading = false;
        const errorMsg = error.error?. message || 'Failed to reset password.   Please try again.';
        this.errorMessage = errorMsg;
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }

  resendOtp(): void {
    this.isLoading = true;
    this.errorMessage = '';

    this.authService. resendResetOtp(this.email).subscribe({
      next: () => {
        this.isLoading = false;
        this.toastr.success('OTP has been resent to your email!', 'OTP Resent');
        this.toastr.info('Please check your email for the new OTP', 'Info');
        this.countdown = 60;
        this.startCountdown();
      },
      error: (error) => {
        this.isLoading = false;
        const errorMsg = error.error?. message || 'Failed to resend OTP';
        this.errorMessage = errorMsg;
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }

  private startCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this.  countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }
}