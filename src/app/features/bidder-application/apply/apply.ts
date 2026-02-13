import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { AuthService } from '../../../core/services/auth';
import { BidderApplicationService } from '../../../core/services/bidder-application';
import { User } from '../../../core/models/user.model';
import { environment } from '../../../../environments/environment';

@Component({
  selector: 'app-apply',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './apply.html',
  styleUrls: ['./apply.scss']
})
export class Apply implements OnInit {
  applicationForm: FormGroup;
  user: User | null = null;
  currentStep = 1;
  isLoading = false;
  errorMessage = '';
  hasAlreadyApplied = false;
  applicationStatus = '';
  
  // OTP related properties
  otpSent = false;
  otpVerified = false;
  isOtpLoading = false;
  isVerifyingOtp = false;
  otpError = '';
  otpSuccess = '';
  countdown = 0;
  private countdownInterval: any;

  // ✅ NEW: Check if email is already verified
  isEmailAlreadyVerified = false;
  skipOtpVerification = false;

  categories = [
    'Food & Beverages',
    'Electronics & Gadgets',
    'Clothing & Fashion',
    'Games & Entertainment',
    'Books & Stationery',
    'Arts & Crafts',
    'Services',
    'Other'
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private applicationService: BidderApplicationService,
    private router: Router,
    private http: HttpClient
  ) {
    this.applicationForm = this.fb.group({
      collageId: ['', Validators.required],
      studentName: ['', Validators.required],
      studentEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      preferredStallCategory: ['', Validators.required],
      reason: ['', [Validators.required, Validators.minLength(50)]],
      otp: [''], // Made optional - will add validator conditionally
      termsAccepted: [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    
    if (this.user) {
      // ✅ Check if user's email is already verified
      this.isEmailAlreadyVerified = this.user.emailVerified || false;
      
      console.log('📧 Email verification status:', {
        email: this.user.studentEmail,
        isVerified: this.isEmailAlreadyVerified
      });

      // ✅ If email is already verified, skip OTP verification
      if (this.isEmailAlreadyVerified) {
        this.skipOtpVerification = true;
        this.otpVerified = true; // Consider as verified
        console.log('✅ Email already verified - skipping OTP');
      } else {
        // Email not verified - OTP is required
        this.applicationForm.get('otp')?.setValidators([
          Validators.required,
          Validators.pattern('^[0-9]{6}$')
        ]);
        this.applicationForm.get('otp')?.updateValueAndValidity();
        console.log('⚠️ Email not verified - OTP required');
      }

      // Pre-fill form with user data
      this.applicationForm.patchValue({
        collageId: this.user.collageId || '',
        studentName: this.user.studentName || '',
        studentEmail: this.user.studentEmail || '',
        phoneNumber: this.user.phone || ''
      });

      this.checkApplicationStatus();
    } else {
      this.router.navigate(['/login']);
      return;
    }

    if (this.user?.role === 'BIDDER') {
      this.router.navigate(['/dashboard']);
    }
  }

  ngOnDestroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }

  checkApplicationStatus(): void {
    if (!this.user?.studentEmail) return;

    this.applicationService.hasAlreadyApplied(this.user.studentEmail).subscribe({
      next: (response) => {
        this.hasAlreadyApplied = response.hasApplied;
        this.applicationStatus = response.status || '';
        
        if (this.hasAlreadyApplied) {
          console.log('ℹ️ User has already applied with status:', this.applicationStatus);
        }
      },
      error: (error) => {
        console.error('❌ Error checking application status:', error);
        this.hasAlreadyApplied = false;
      }
    });
  }

  nextStep(): void {
    console.log('🔄 Attempting to move to step 2');
    
    if (this.currentStep === 1) {
      const step1Fields = ['collageId', 'studentName', 'studentEmail', 'phoneNumber'];
      
      step1Fields.forEach(field => {
        const control = this.applicationForm.get(field);
        control?.markAsTouched();
        control?.updateValueAndValidity();
      });

      const step1Valid = step1Fields.every(field => {
        const control = this.applicationForm.get(field);
        const isValid = control?.valid;
        
        if (!isValid) {
          console.error(`❌ Field ${field} is invalid:`, control?.errors);
        }
        
        return isValid;
      });

      if (step1Valid) {
        console.log('✅ Step 1 valid - moving to step 2');
        this.currentStep = 2;
        this.errorMessage = '';
      } else {
        console.error('❌ Step 1 validation failed');
        this.errorMessage = 'Please fill in all required fields correctly before continuing.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    }
  }

  prevStep(): void {
    console.log('🔄 Moving back to step 1');
    this.currentStep = 1;
    this.errorMessage = '';
    this.otpError = '';
    this.otpSuccess = '';
  }

  sendOtp(): void {
    const email = this.applicationForm.get('studentEmail')?.value;
    
    if (!email) {
      this.otpError = 'Email is required';
      return;
    }

    this.isOtpLoading = true;
    this.otpError = '';
    this.otpSuccess = '';
    this.otpVerified = false;

    console.log('📧 Sending OTP to:', email);

    this.http.get<any>(`${environment.apiUrl}/otp/send?email=${email}`).subscribe({
      next: (response) => {
        console.log('✅ OTP sent successfully:', response);
        this.isOtpLoading = false;
        this.otpSent = true;
        this.otpSuccess = '✅ OTP sent to your email. Please check your inbox.';
        this.startCountdown();
      },
      error: (error) => {
        console.error('❌ Error sending OTP:', error);
        this.isOtpLoading = false;
        this.otpError = error.error?.message || 'Failed to send OTP. Please try again.';
      }
    });
  }

  verifyOtp(): void {
    const otp = this.applicationForm.get('otp')?.value;
    const email = this.applicationForm.get('studentEmail')?.value;

    if (!otp || otp.length !== 6) {
      this.otpError = 'Please enter a valid 6-digit OTP';
      return;
    }

    this.isVerifyingOtp = true;
    this.otpError = '';
    this.otpSuccess = '';

    console.log('🔍 Verifying OTP:', otp);

    this.http.post<any>(`${environment.apiUrl}/otp/verify`, {
      studentEmail: email,
      otp: otp
    }).subscribe({
      next: (response) => {
        console.log('✅ OTP verified successfully:', response);
        this.isVerifyingOtp = false;
        
        if (response.success === 'true' || response.success === true) {
          this.otpVerified = true;
          this.otpSuccess = '✅ OTP verified successfully! You can now submit your application.';
          this.otpError = '';
        } else {
          this.otpVerified = false;
          this.otpError = response.message || 'OTP verification failed';
        }
      },
      error: (error) => {
        console.error('❌ Error verifying OTP:', error);
        this.isVerifyingOtp = false;
        this.otpVerified = false;
        this.otpError = error.error?.message || 'Invalid OTP. Please try again.';
      }
    });
  }

  resendOtp(): void {
    if (this.countdown > 0) return;

    const email = this.applicationForm.get('studentEmail')?.value;
    
    this.isOtpLoading = true;
    this.otpError = '';
    this.otpSuccess = '';
    this.otpVerified = false;
    this.applicationForm.get('otp')?.reset();

    console.log('🔄 Resending OTP to:', email);

    this.http.post<any>(`${environment.apiUrl}/otp/resend?email=${email}`, {}).subscribe({
      next: (response) => {
        console.log('✅ OTP resent successfully:', response);
        this.isOtpLoading = false;
        this.otpSuccess = '✅ New OTP sent to your email.';
        this.startCountdown();
      },
      error: (error) => {
        console.error('❌ Error resending OTP:', error);
        this.isOtpLoading = false;
        this.otpError = 'Failed to resend OTP. Please try again.';
      }
    });
  }

  startCountdown(): void {
    this.countdown = 60;
    
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    this.countdownInterval = setInterval(() => {
      this.countdown--;
      if (this.countdown <= 0) {
        clearInterval(this.countdownInterval);
      }
    }, 1000);
  }

  onSubmit(): void {
    console.log('📤 Submitting application');
    
    Object.keys(this.applicationForm.controls).forEach(key => {
      this.applicationForm.get(key)?.markAsTouched();
    });

    if (this.applicationForm.invalid) {
      console.error('❌ Form is invalid');
      this.errorMessage = 'Please fill in all required fields correctly.';
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }

    // ✅ Check OTP verification only if email was not pre-verified
    if (!this.skipOtpVerification) {
      if (!this.otpSent) {
        this.errorMessage = 'Please send OTP to your email first.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }

      if (!this.otpVerified) {
        this.errorMessage = 'Please verify your OTP before submitting the application.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
        return;
      }
    }

    this.isLoading = true;
    this.errorMessage = '';

    const formData = {
      reason: this.applicationForm.get('reason')?.value,
      preferredStallCategory: this.applicationForm.get('preferredStallCategory')?.value,
      collageId: this.applicationForm.get('collageId')?.value,
      studentName: this.applicationForm.get('studentName')?.value,
      studentEmail: this.applicationForm.get('studentEmail')?.value,
      phoneNumber: parseInt(this.applicationForm.get('phoneNumber')?.value || '0'),
      otp: this.skipOtpVerification ? '000000' : this.applicationForm.get('otp')?.value, // Use dummy OTP if email pre-verified
      termsAccepted: this.applicationForm.get('termsAccepted')?.value
    };

    console.log('📦 Submitting form data:', formData);

    this.applicationService.applyAsBidder(formData).subscribe({
      next: (response) => {
        console.log('✅ Application submitted successfully:', response);
        this.isLoading = false;
        this.router.navigate(['/bidder-application/status']);
      },
      error: (error: any) => {
        console.error('❌ Error submitting application:', error);
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to submit application. Please try again.';
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    });
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.applicationForm.get(fieldName);
    return !!(field && field.invalid && field.touched);
  }

  getFieldError(fieldName: string): string {
    const field = this.applicationForm.get(fieldName);
    if (!field || !field.errors || !field.touched) return '';

    if (field.errors['required']) return 'This field is required';
    if (field.errors['email']) return 'Please enter a valid email';
    if (field.errors['pattern']) {
      if (fieldName === 'phoneNumber') return 'Please enter a valid phone number (10 digits)';
      if (fieldName === 'otp') return 'Please enter a valid 6-digit OTP';
    }
    if (field.errors['minlength']) {
      const minLength = field.errors['minlength'].requiredLength;
      const currentLength = field.errors['minlength'].actualLength;
      return `Minimum ${minLength} characters required (current: ${currentLength})`;
    }

    return 'Invalid input';
  }

  getReasonCharCount(): number {
    return this.applicationForm.get('reason')?.value?.length || 0;
  }
}