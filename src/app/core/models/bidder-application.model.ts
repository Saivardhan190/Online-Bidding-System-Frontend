export interface BidderApplicationRequest {
  reason:  string;
  experience?:  string;
  preferredStallCategory?: string;
  collageId?:  string;
  studentName?: string;
  studentEmail?: string;
  phoneNumber?: number;
  otp?: string;
  termsAccepted?:  boolean;
}

export interface BidderApplicationResponse {
  applicationId: number;
  userId: number;
  userName?:  string;
  userEmail?: string;
  userCollageId?: string;
  userDepartment?: string;
  userYear?:  number;
  userPhone?: string;
  userProfilePicture?: string;
  reason: string;
  experience?: string;
  preferredStallCategory?: string;
  status: 'PENDING' | 'APPROVED' | 'REJECTED';
  appliedAt:  string;
  reviewedAt?: string;
  adminRemarks?: string;
  // Nested user object (if backend returns it this way)
  user?: {
    studentId:  number;
    studentName: string;
    studentEmail: string;
    collageId: string;
    department: string;
    year: number;
    phone: string;
    profilePicture?: string;
  };
}

export interface ApplicationStatusResponse {
  hasApplied: boolean;
  status?:  string;
  applicationId?: number;
}