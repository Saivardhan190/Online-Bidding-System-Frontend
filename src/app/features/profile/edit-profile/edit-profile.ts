import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { UserService } from '../../../core/services/user';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-edit-profile',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  templateUrl: './edit-profile.html',
  styleUrls: ['./edit-profile.scss']
})
export class EditProfile implements OnInit {
  profileForm: FormGroup;
  passwordForm: FormGroup;
  user: User | null = null;
  isLoading = false;
  isPasswordLoading = false;
  successMessage = '';
  errorMessage = '';
  passwordError = '';
  passwordSuccess = '';
  activeTab = 'profile';

  departments = [
    { value: 'CSE', label: 'Computer Science & Engineering' },
    { value: 'CSM', label: 'Computer Science & AI/ML' },
    { value: 'ECE', label: 'Electronics & Communication' },
    { value: 'EEE', label:  'Electrical & Electronics' },
    { value: 'MECH', label: 'Mechanical Engineering' },
    { value: 'CIVIL', label: 'Civil Engineering' },
    { value: 'IT', label: 'Information Technology' },
    { value: 'MBA', label: 'MBA' },
    { value: 'OTHER', label: 'Other' }
  ];

  constructor(
    private fb:  FormBuilder,
    private authService: AuthService,
    private userService: UserService,
    private router: Router
  ) {
    this.profileForm = this.fb.group({
      studentName: ['', [Validators.required, Validators.minLength(3)]],
      phone: ['', [Validators.required, Validators.pattern('^[6-9]\\d{9}$')]],
      department: ['', Validators.required],
      year: ['', Validators.required],
      gender: ['', Validators.required],
      address: ['']
    });

    this.passwordForm = this.fb.group({
      currentPassword: ['', [Validators.required]],
      newPassword: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  ngOnInit(): void {
    this.user = this.authService.getUser();
    if (this.user) {
      this. profileForm.patchValue({
        studentName: this.user.studentName,
        phone: this. user.phone,
        department: this. user.department,
        year: this. user.year?. toString(),
        gender: this.user. gender,
        address: this.user.address || ''
      });
    }
  }

  setActiveTab(tab:  string): void {
    this.activeTab = tab;
    this.clearMessages();
  }

  clearMessages(): void {
    this. successMessage = '';
    this.errorMessage = '';
    this.passwordError = '';
    this. passwordSuccess = '';
  }

  onProfileSubmit(): void {
    if (this.profileForm.invalid || ! this.user) return;

    this. isLoading = true;
    this. errorMessage = '';
    this.successMessage = '';

    const profileData = {
      ... this.profileForm. value,
      year: parseInt(this.profileForm.value.year)
    };

    // ✅ Use updateProfile without userId (uses token)
    this.userService.updateProfile(profileData).subscribe({
      next: (updatedUser:  User) => {
        this.isLoading = false;
        this.successMessage = 'Profile updated successfully!';
        this.authService. updateUserLocally(updatedUser);
        this.user = updatedUser;
        setTimeout(() => this.successMessage = '', 3000);
      },
      error: (error:  any) => {
        this.isLoading = false;
        this.errorMessage = error.error?. message || 'Failed to update profile';
      }
    });
  }

  onPasswordSubmit(): void {
    if (this.passwordForm. invalid || !this.user) return;

    const newPassword = this.passwordForm.get('newPassword')?.value;
    const confirmPassword = this. passwordForm.get('confirmPassword')?.value;

    if (newPassword !== confirmPassword) {
      this.passwordError = 'Passwords do not match';
      return;
    }

    this. isPasswordLoading = true;
    this.passwordError = '';
    this.passwordSuccess = '';

    const currentPassword = this.passwordForm.get('currentPassword')?.value;

    // ✅ Use changePassword with proper object
    this.userService.changePassword({
      currentPassword:  currentPassword,
      newPassword: newPassword
    }).subscribe({
      next: () => {
        this.isPasswordLoading = false;
        this.passwordSuccess = 'Password changed successfully!';
        this.passwordForm.reset();
        setTimeout(() => this.passwordSuccess = '', 3000);
      },
      error: (error: any) => {
        this.isPasswordLoading = false;
        this. passwordError = error. error?.message || error.error || 'Failed to change password';
      }
    });
  }
}