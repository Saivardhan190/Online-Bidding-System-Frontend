import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, tap, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, UpdateProfileRequest } from '../models/user.model';

export interface UserResponse {
  success: boolean;
  message: string;
  user?: User;
}

@Injectable({
  providedIn: 'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // ================================
  // ADMIN ENDPOINTS
  // ================================

  /**
   * Get all users (Admin only)
   */
  getAllUsers(): Observable<User[]> {
    console.log('📡 Getting all users (Admin)');
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`).pipe(
      tap(users => console.log('✅ Fetched', users.length, 'users')),
      catchError(error => {
        console.error('❌ Error fetching users:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get user by ID
   */
  getUserById(userId: number): Observable<User> {
    console.log('📡 Getting user by ID:', userId);
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`).pipe(
      tap(user => console.log('✅ Fetched user:', user)),
      catchError(error => {
        console.error('❌ Error fetching user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user (Admin only)
   */
  updateUser(userId: number, userData: Partial<User>): Observable<User> {
    console.log('📡 Updating user:', userId, userData);
    return this.http.put<UserResponse>(`${this.apiUrl}/admin/users/${userId}`, userData).pipe(
      map(response => {
        if (response.user) {
          console.log('✅ User updated:', response.user);
          return response.user;
        }
        throw new Error('User not returned from server');
      }),
      catchError(error => {
        console.error('❌ Error updating user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update user role (Admin only)
   */
  updateUserRole(userId: number, role: string): Observable<string> {
    console.log('📡 Updating user role:', userId, role);
    return this.http.patch(
      `${this.apiUrl}/admin/users/${userId}/role`,
      { role },
      { responseType: 'text' }
    ).pipe(
      tap(response => console.log('✅ Role updated:', response)),
      catchError(error => {
        console.error('❌ Error updating role:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Toggle user active status (Admin only)
   */
  toggleUserStatus(userId: number): Observable<string> {
    console.log('📡 Toggling user status:', userId);
    return this.http.patch(
      `${this.apiUrl}/admin/users/${userId}/toggle-status`,
      {},
      { responseType: 'text' }
    ).pipe(
      tap(response => console.log('✅ Status toggled:', response)),
      catchError(error => {
        console.error('❌ Error toggling status:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Activate user (Admin only)
   */
  activateUser(userId: number): Observable<string> {
    console.log('📡 Activating user:', userId);
    return this.http.patch(
      `${this.apiUrl}/admin/users/${userId}/activate`,
      {},
      { responseType: 'text' }
    ).pipe(
      tap(response => console.log('✅ User activated:', response)),
      catchError(error => {
        console.error('❌ Error activating user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Deactivate user (Admin only)
   */
  deactivateUser(userId: number): Observable<string> {
    console.log('📡 Deactivating user:', userId);
    return this.http.patch(
      `${this.apiUrl}/admin/users/${userId}/deactivate`,
      {},
      { responseType: 'text' }
    ).pipe(
      tap(response => console.log('✅ User deactivated:', response)),
      catchError(error => {
        console.error('❌ Error deactivating user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Delete user (Admin only)
   */
  deleteUser(userId: number): Observable<UserResponse> {
    console.log('📡 Deleting user:', userId);
    return this.http.delete<UserResponse>(`${this.apiUrl}/admin/users/${userId}`).pipe(
      tap(response => console.log('✅ User deleted:', response)),
      catchError(error => {
        console.error('❌ Error deleting user:', error);
        return throwError(() => error);
      })
    );
  }

  // ================================
  // PROFILE ENDPOINTS (Current User)
  // ================================

  /**
   * Get current user profile
   * Uses JWT token to identify user
   */
  getProfile(): Observable<User> {
    console.log('📡 Getting current user profile');
    return this.http.get<User>(`${this.apiUrl}/profile`).pipe(
      tap(user => console.log('✅ Profile fetched:', user)),
      catchError(error => {
        console.error('❌ Error fetching profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Update current user profile
   * Uses JWT token to identify user - NO userId needed
   * Uses /api/profile/update endpoint from ProfileController
   */
  updateProfile(userData: UpdateProfileRequest | any): Observable<User> {
    console.log('📡 Updating profile with data:', userData);
    return this.http.put<User>(`${this.apiUrl}/profile/update`, userData).pipe(
      tap(user => console.log('✅ Profile updated successfully:', user)),
      catchError(error => {
        console.error('❌ Error updating profile:', error);
        console.error('❌ Error details:', {
          status: error.status,
          message: error.error?.message || error.message,
          url: error.url
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Update specific user profile (Admin only)
   */
  updateUserProfile(userId: number, userData: UpdateProfileRequest): Observable<User> {
    console.log('📡 Updating user profile:', userId, userData);
    return this.http.put<User>(`${this.apiUrl}/users/${userId}/profile`, userData).pipe(
      tap(user => console.log('✅ User profile updated:', user)),
      catchError(error => {
        console.error('❌ Error updating user profile:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Update profile picture
   */
  updateProfilePicture(imageData: string): Observable<UserResponse> {
    console.log('📡 Updating profile picture');
    return this.http.patch<UserResponse>(
      `${this.apiUrl}/users/profile/picture`,
      { profilePicture: imageData }
    ).pipe(
      tap(response => console.log('✅ Profile picture updated:', response)),
      catchError(error => {
        console.error('❌ Error updating profile picture:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ Change password
   * Uses JWT token to identify user - NO userId needed
   * Uses /api/profile/change-password endpoint from ProfileController
   */
  changePassword(data: { currentPassword: string; newPassword: string }): Observable<any> {
    console.log('📡 Changing password');
    return this.http.put(`${this.apiUrl}/profile/change-password`, data).pipe(
      tap(response => console.log('✅ Password changed successfully:', response)),
      catchError(error => {
        console.error('❌ Error changing password:', error);
        console.error('❌ Error details:', {
          status: error.status,
          message: error.error?.message || error.message
        });
        return throwError(() => error);
      })
    );
  }

  // ================================
  // HELPER METHODS
  // ================================

  /**
   * Check if profile is complete
   */
  isProfileComplete(user: User): boolean {
    return !!(
      user.studentName &&
      user.phone &&
      user.department &&
      user.year &&
      user.gender
    );
  }

  /**
   * Check if user is OAuth user (Google login)
   */
  isOAuthUser(user: User): boolean {
    return !!user.profilePicture && !user.collageId;
  }
}