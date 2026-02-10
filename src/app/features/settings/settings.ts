import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { UserService } from '../../core/services/user';
import { User } from '../../core/models/user.model';

@Component({
  selector: 'app-settings',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './settings.html',
  styleUrls: ['./settings.scss']
})
export class Settings implements OnInit {
  activeTab = 'account';
  user: User | null = null;
  isLoading = false;
  successMessage = '';
  errorMessage = '';

  // Forms
  accountForm: FormGroup;
  passwordForm: FormGroup;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private userService: UserService
  ) {
    this.accountForm = this.fb.group({
      studentName: ['', Validators.required],
      department: [''],
      year: [''],
      phone: [''],
      address: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', Validators.required],
      newPassword: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user) {
      this.accountForm.patchValue({
        studentName: this.user.studentName,
        department: this.user.department || '',
        year: this.user.year || '',
        phone: this.user.phone || '',
        address: this.user.address || ''
      });
    }
  }

  setActiveTab(tab: string): void {
    this.activeTab = tab;
    this.successMessage = '';
    this.errorMessage = '';
  }

  updateAccount(): void {
    if (this.accountForm.invalid) return;

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const updatedData = {
      ...this.accountForm.value
    };

    this.userService.updateProfile(updatedData).subscribe({
      next: (user) => {
        this.isLoading = false;
        this.successMessage = 'Account updated successfully!';
        this.user = user;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to update account';
      }
    });
  }

  changePassword(): void {
    if (this.passwordForm.invalid) return;

    const { newPassword, confirmPassword } = this.passwordForm.value;
    
    if (newPassword !== confirmPassword) {
      this.errorMessage = 'Passwords do not match';
      return;
    }

    this.isLoading = true;
    this.errorMessage = '';
    this.successMessage = '';

    const passwordData = {
      currentPassword: this.passwordForm.value.currentPassword,
      newPassword: this.passwordForm.value.newPassword
    };

    this.userService.changePassword(passwordData).subscribe({
      next: () => {
        this.isLoading = false;
        this.successMessage = 'Password changed successfully!';
        this.passwordForm.reset();
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error) => {
        this.isLoading = false;
        this.errorMessage = error.error?.message || 'Failed to change password';
      }
    });
  }

  getPasswordStrength(): string {
    const password = this.passwordForm.get('newPassword')?.value || '';
    if (password.length === 0) return '';
    if (password.length < 6) return 'Weak';
    if (password.length < 10) return 'Medium';
    return 'Strong';
  }

  getPasswordStrengthClass(): string {
    const strength = this.getPasswordStrength();
    if (strength === 'Weak') return 'text-red-600';
    if (strength === 'Medium') return 'text-yellow-600';
    if (strength === 'Strong') return 'text-green-600';
    return '';
  }
}
