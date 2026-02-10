import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { BidderApplicationService } from '../../../core/services/bidder-application';
import { User } from '../../../core/models/user.model';

@Component({
  selector:  'app-apply',
  standalone:  true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './apply.html',
  styleUrls:  ['./apply.scss']
})
export class Apply implements OnInit {
  applicationForm: FormGroup;
  user: User | null = null;
  currentStep = 1;
  isLoading = false;
  errorMessage = '';
  hasAlreadyApplied = false;
  applicationStatus = '';

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
    private router: Router
  ) {
    this.applicationForm = this.fb.group({
      collageId: ['', Validators.required],
      studentName: ['', Validators.required],
      studentEmail: ['', [Validators.required, Validators.email]],
      phoneNumber: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      preferredStallCategory:  ['', Validators. required],
      reason: ['', [Validators.required, Validators.minLength(50)]],
      termsAccepted:  [false, Validators.requiredTrue]
    });
  }

  ngOnInit(): void {
    this.user = this.authService. getUser();
    
    if (this. user) {
      // Pre-fill form with user data
      this.applicationForm.patchValue({
        collageId: this.user. collageId || '',
        studentName: this.user. studentName || '',
        studentEmail: this.user. studentEmail || '',
        phoneNumber: this.user.phone || ''
      });

      // Check if already applied
      this. checkApplicationStatus();
    }

    // Redirect if already a bidder
    if (this.user?. role === 'BIDDER') {
      this.router. navigate(['/dashboard']);
    }
  }

  checkApplicationStatus(): void {
    if (! this.user?. studentEmail) return;

    this.applicationService. hasAlreadyApplied(this.user.studentEmail).subscribe({
      next:  (response) => {
        this.hasAlreadyApplied = response. hasApplied;
        this.applicationStatus = response.status || '';
      },
      error: () => {
        // If API fails, allow application
        this.hasAlreadyApplied = false;
      }
    });
  }

  nextStep(): void {
    if (this. currentStep === 1) {
      const fields = ['collageId', 'studentName', 'studentEmail', 'phoneNumber'];
      let valid = true;
      
      fields.forEach(field => {
        const control = this.applicationForm.get(field);
        control?.markAsTouched();
        if (control?.invalid) valid = false;
      });

      if (valid) {
        this.currentStep = 2;
      }
    }
  }

  prevStep(): void {
    this.currentStep = 1;
  }

  onSubmit(): void {
    if (this.applicationForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formData = {
      reason: this.applicationForm.get('reason')?.value,
      preferredStallCategory:  this.applicationForm. get('preferredStallCategory')?.value,
      collageId: this. applicationForm.get('collageId')?.value,
      studentName: this.applicationForm.get('studentName')?.value,
      studentEmail: this.applicationForm.get('studentEmail')?.value,
      phoneNumber: parseInt(this.applicationForm.get('phoneNumber')?.value || '0'),
      termsAccepted: this. applicationForm.get('termsAccepted')?.value
    };

    this. applicationService.applyAsBidder(formData).subscribe({
      next: () => {
        this.isLoading = false;
        this.router.navigate(['/bidder-application/status']);
      },
      error: (error: any) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to submit application.  Please try again.';
      }
    });
  }
}