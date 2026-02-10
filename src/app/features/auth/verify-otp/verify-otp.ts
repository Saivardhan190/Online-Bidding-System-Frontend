import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute, RouterLink } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-verify-otp',
  standalone:  true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './verify-otp.html',
  styleUrls: ['./verify-otp.scss']
})
export class VerifyOtp implements OnInit, OnDestroy {
  email = '';
  otpDigits:  string[] = ['', '', '', '', '', ''];
  isLoading = false;
  isResending = false;
  errorMessage = '';
  successMessage = '';
  countdown = 60;
  private countdownInterval: any;

  constructor(
    private authService:  AuthService,
    private router: Router,
    private route:  ActivatedRoute,
    private toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this. email = this.route. snapshot.queryParams['email'] || '';
    if (! this.email) {
      this.router.navigate(['/login']);
    }
    this.startCountdown();
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  get otp(): string {
    return this.otpDigits.join('');
  }

  onOtpInput(event: Event, index: number): void {
    const input = event.target as HTMLInputElement;
    const value = input.value;

    // Only allow numbers
    if (value && !/^\d$/.test(value)) {
      this. otpDigits[index] = '';
      return;
    }

    if (value && index < 5) {
      const nextInput = document.getElementById(`otp-${index + 1}`) as HTMLInputElement;
      nextInput?. focus();
    }
  }

  onKeyDown(event: KeyboardEvent, index: number): void {
    if (event.key === 'Backspace' && ! this.otpDigits[index] && index > 0) {
      const prevInput = document. getElementById(`otp-${index - 1}`) as HTMLInputElement;
      prevInput?.focus();
    }
  }

  onPaste(event: ClipboardEvent): void {
    event.preventDefault();
    const pastedData = event.clipboardData?.getData('text') || '';
    const digits = pastedData. replace(/\D/g, '').slice(0, 6).split('');

    digits.forEach((digit, i) => {
      this.otpDigits[i] = digit;
    });
  }

  verifyOtp(): void {
    if (this.otp.length !== 6) {
      this.toastr.warning('Please enter a valid 6-digit OTP', 'Invalid OTP');
      return;
    }

    this. isLoading = true;
    this. errorMessage = '';

    this.authService.verifyOtp(this.email, this.otp).subscribe({
      next: (response) => {
        this. isLoading = false;
        if (response.success) {
          this.toastr.success('OTP verified successfully! Redirecting...', 'Success');
          this. router.navigate(['/dashboard']);
        } else {
          this. errorMessage = response. message || 'Invalid OTP';
          this.toastr.error(this.errorMessage, 'Verification Failed');
        }
      },
      error:  (error) => {
        this.isLoading = false;
        const errorMsg = error.error?.message || 'Invalid OTP.  Please try again.';
        this.errorMessage = errorMsg;
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }

  resendOtp(): void {
    this. isResending = true;
    this. errorMessage = '';

    this.authService.resendOtp(this.email).subscribe({
      next: (response) => {
        this. isResending = false;
        if (response.success) {
          this.successMessage = 'OTP sent successfully!';
          this.toastr.success('OTP sent to your email!', 'OTP Resent');
          this.countdown = 60;
          this.startCountdown();
          setTimeout(() => this.successMessage = '', 3000);
        }
      },
      error: (error) => {
        this.isResending = false;
        const errorMsg = error.error?.message || 'Failed to resend OTP';
        this.errorMessage = errorMsg;
        this.toastr.error(errorMsg, 'Error');
      }
    });
  }

  private startCountdown(): void {
    if (this.countdownInterval) {
      clearInterval(this. countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }
}