import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl:  './signup.html',
  styleUrls: ['./signup.scss']
})
export class Signup {
  signupForm: FormGroup;
  currentStep = 1;
  isLoading = false;
  isGoogleLoading = false;  // ✅ Add this
  errorMessage = '';

  departments = [
    { value: 'CSE', label: 'Computer Science & Engineering' },
    { value: 'ECE', label: 'Electronics & Communication' },
    { value: 'EEE', label:  'Electrical & Electronics' },
    { value: 'MECH', label: 'Mechanical Engineering' },
    { value:  'CIVIL', label: 'Civil Engineering' },
    { value: 'IT', label: 'Information Technology' },
    { value: 'MBA', label: 'MBA' },
    { value: 'OTHER', label: 'Other' }
  ];

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router
  ) {
    this. signupForm = this.fb.group({
      studentName: ['', [Validators.required, Validators.minLength(3)]],
      studentEmail: ['', [Validators.required, Validators.email]],
      password:  ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required],
      collageId: ['', Validators.required],
      phone: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      department: ['', Validators.required],
      year: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['']
    });
  }

  // ✅ Google Signup Method
  signupWithGoogle(): void {
    this. isGoogleLoading = true;
    this.authService. loginWithGoogle();  // Same endpoint - backend handles both
  }

  nextStep(): void {
    const step1Fields = ['studentName', 'studentEmail', 'collageId', 'phone', 'password', 'confirmPassword'];
    let valid = true;

    step1Fields.forEach(field => {
      const control = this.signupForm.get(field);
      control?.markAsTouched();
      if (control?.invalid) valid = false;
    });

    if (this.signupForm. get('password')?.value !== this.signupForm.get('confirmPassword')?.value) {
      this. errorMessage = 'Passwords do not match';
      return;
    }

    if (valid) {
      this. errorMessage = '';
      this.currentStep = 2;
    }
  }

  prevStep(): void {
    this.currentStep = 1;
  }

  onSubmit(): void {
    if (this.signupForm. invalid) return;

    this.isLoading = true;
    this.errorMessage = '';

    const formData = { ...this.signupForm.value };
    delete formData. confirmPassword;
    formData.year = parseInt(formData.year);

    this.authService.signUp(formData).subscribe({
      next:  (response) => {
        this.isLoading = false;
        if (response.success) {
          this.router. navigate(['/verify-otp'], {
            queryParams:  { email: formData.studentEmail }
          });
        } else {
          this.errorMessage = response.message || 'Registration failed';
        }
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Registration failed.  Please try again.';
      }
    });
  }
}