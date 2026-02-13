export interface User {
  studentId: number;
  studentName: string;
  studentEmail: string;
  collageId?: string;
  department?: string;
  year?: number;
  gender?: string;
  phone?: string;
  address?: string;
  role: 'USER' | 'BIDDER' | 'ADMIN';
  profilePicture?: string;
  emailVerified?: boolean;
  isActive?: boolean;
}

export interface UpdateProfileRequest {
  studentName?: string;
  phone?: string;
  department?: string;
  year?: number;
  gender?: string;
  address?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword: string;
}