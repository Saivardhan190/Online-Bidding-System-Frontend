import { User } from './user.model';

// ========================================
// AUTHENTICATION RESPONSE
// ========================================

/**
 * ✅ Complete AuthResponse interface with all possible fields
 */
export interface AuthResponse {
  success: boolean;
  message: string;
  token?: string;
  user?: User; // ✅ Use User type instead of any
  email?: string;
  requiresVerification?: boolean;
  isExistingUnverified?: boolean;
  code?: string; // Error codes like 'EMAIL_NOT_VERIFIED'
}

// ========================================
// LOGIN & SIGNUP
// ========================================

/**
 * Login Request
 */
export interface LoginRequest {
  studentEmail: string;
  password: string;
}

/**
 * Signup Request
 */
export interface SignUpRequest {
  studentName: string;
  studentEmail: string;
  password: string;
  collageId: string;
  phone: string;
  department: string;
  year: number;
  gender: string;
  address?: string;
}

// ========================================
// PASSWORD MANAGEMENT
// ========================================

/**
 * Forgot Password Request
 */
export interface ForgotPasswordRequest {
  studentEmail: string;
}

/**
 * Reset Password Request
 */
export interface ResetPasswordRequest {
  studentEmail: string;
  otp: string;
  newPassword: string;
  confirmPassword?: string; // ✅ Optional - used for frontend validation
}

/**
 * Change Password Request (for authenticated users)
 */
export interface ChangePasswordRequest {
  currentPassword?: string; // Optional for OAuth users setting password first time
  newPassword: string;
}

// ========================================
// OTP VERIFICATION
// ========================================

/**
 * OTP Verification Request
 */
export interface OtpVerificationRequest {
  studentEmail: string;
  otp: string;
}

/**
 * OTP Response
 */
export interface OtpResponse {
  success: boolean;
  message: string;
}

// ========================================
// HELPER TYPES
// ========================================

/**
 * OAuth Provider
 */
export type AuthProvider = 'LOCAL' | 'GOOGLE';

/**
 * User Role
 */
export type UserRole = 'USER' | 'BIDDER' | 'ADMIN';

/**
 * Login Type
 */
export type LoginType = 'EMAIL' | 'GOOGLE';