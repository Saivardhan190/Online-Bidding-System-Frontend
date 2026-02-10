export interface User {
  studentId: number;
  studentName: string;
  studentEmail: string;
  collageId: string;
  phone: string;
  department: string;
  year: number;
  gender: string;
  address?: string;
  role: 'USER' | 'BIDDER' | 'ADMIN';
  profilePicture?: string;
  emailVerified:  boolean;
  active: boolean;
  isActive?: boolean;
  authProvider?: 'LOCAL' | 'GOOGLE';
  createdAt?:  string;
  updatedAt?: string;
  lastLogin?:  string;
}

export interface UpdateProfileRequest {
  studentName?: string;
  phone?: string;
  address?: string;
  department?: string;
  year?:  number;
  gender?: string;
}

export interface ChangePasswordRequest {
  currentPassword: string;
  newPassword:  string;
}