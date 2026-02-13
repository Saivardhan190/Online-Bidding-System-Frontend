export interface Stall {
  stallId: number;
  stallNo: number;
  stallName: string;
  description: string;
  location: string;
  category: string;
  image: string | null;
  basePrice: number;
  originalPrice: number;
  currentHighestBid: number;
  totalBids: number;
  maxBidders: number;
  status: 'AVAILABLE' | 'ACTIVE' | 'CLOSED';
  biddingStart: string | null;
  biddingEnd: string | null;
  createdAt: string;
  winner?: {  // ✅ Add winner info
    studentId: number;
    studentName: string;
    studentEmail: string;
  };
}

export type StallStatus = 'AVAILABLE' | 'BOOKED' | 'ACTIVE' | 'CLOSED';

export interface CreateStallRequest {
  stallNo: number;
  stallName: string;
  description: string;
  location:  string;
  category: string;
  image?: string;
  basePrice: number;
  maxBidders?:  number;
  biddingStart:  string;
  biddingEnd: string;
}