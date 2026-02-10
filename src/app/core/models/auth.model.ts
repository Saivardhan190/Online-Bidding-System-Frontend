import { User } from './user.model';

export interface LoginRequest {
  studentEmail: string;
  password: string;
}

export interface SignUpRequest {
  studentName: string;
  studentEmail: string;
  password: string;
  collageId: string;
  phone: string;
  department: string;
  year: number;
  gender: string;
  address?:  string;
}

export interface ForgotPasswordRequest {
  studentEmail: string;
}

export interface ResetPasswordRequest {
  studentEmail: string;
  otp: string;
  newPassword: string;
  confirmPassword: string;
}

export interface AuthResponse {
  success: boolean;
  message:  string;
  token?:  string;
  user?: User;
}