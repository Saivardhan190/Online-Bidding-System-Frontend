import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User, UpdateProfileRequest } from '../models/user.model';

export interface UserResponse {
  success: boolean;
  message:  string;
  user?: User;
}

@Injectable({
  providedIn:  'root'
})
export class UserService {
  private apiUrl = `${environment.apiUrl}`;

  constructor(private http: HttpClient) {}

  // Get all users (Admin)
  getAllUsers(): Observable<User[]> {
    return this.http.get<User[]>(`${this.apiUrl}/admin/users`);
  }

  // Get user by ID
  getUserById(userId: number): Observable<User> {
    return this.http.get<User>(`${this.apiUrl}/users/${userId}`);
  }

  // Update user (Admin)
  updateUser(userId: number, userData:  Partial<User>): Observable<User> {
    return this. http.put<UserResponse>(`${this.apiUrl}/admin/users/${userId}`, userData).pipe(
      map(response => {
        if (response. user) {
          return response.user;
        }
        throw new Error('User not returned from server');
      })
    );
  }

  // Update user role (Admin) - returns text
  updateUserRole(userId: number, role:  string): Observable<string> {
    return this.http.patch(
      `${this.apiUrl}/admin/users/${userId}/role`,
      { role },
      { responseType: 'text' }
    );
  }

  // Toggle user active status (Admin) - returns text
  toggleUserStatus(userId: number): Observable<string> {
    return this. http.patch(
      `${this.apiUrl}/admin/users/${userId}/toggle-status`,
      {},
      { responseType: 'text' }
    );
  }

  // Activate user (Admin) - returns text
  activateUser(userId: number): Observable<string> {
    return this.http.patch(
      `${this.apiUrl}/admin/users/${userId}/activate`,
      {},
      { responseType: 'text' }
    );
  }

  // Deactivate user (Admin) - returns text
  deactivateUser(userId: number): Observable<string> {
    return this.http.patch(
      `${this.apiUrl}/admin/users/${userId}/deactivate`,
      {},
      { responseType: 'text' }
    );
  }

  // Delete user (Admin)
  deleteUser(userId: number): Observable<UserResponse> {
    return this.http.delete<UserResponse>(`${this.apiUrl}/admin/users/${userId}`);
  }

  // Get current user profile
  getProfile(): Observable<User> {
    return this. http.get<User>(`${this.apiUrl}/users/profile`);
  }

  // ✅ Update current user profile (no userId needed - uses token)
  updateProfile(userData: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/profile`, userData);
  }

  // ✅ Update profile with userId (for admin or specific user)
  updateUserProfile(userId: number, userData: UpdateProfileRequest): Observable<User> {
    return this.http.put<User>(`${this.apiUrl}/users/${userId}/profile`, userData);
  }

  // Update profile picture
  updateProfilePicture(imageData: string): Observable<UserResponse> {
    return this.http.patch<UserResponse>(
      `${this.apiUrl}/users/profile/picture`,
      { profilePicture: imageData }
    );
  }

  // ✅ Change password (no userId needed - uses token)
  changePassword(data: { currentPassword: string; newPassword: string }): Observable<string> {
    return this.http.post(
      `${this.apiUrl}/users/change-password`,
      data,
      { responseType: 'text' }
    );
  }
}