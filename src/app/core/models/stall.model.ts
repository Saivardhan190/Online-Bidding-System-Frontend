export interface Stall {
  stallId: number;
  stallNo: number;
  stallName: string;
  description: string;
  location: string;
  category: string;
  image: string | null;
  basePrice: number;
  originalPrice?: number;
  maxBidders?: number;
  currentHighestBid: number;
  totalBids: number;
  status: StallStatus;
  biddingStart: string | null;
  biddingEnd: string | null;
  createdAt: string;
  winner?: {
    studentId: number;
    studentName: string;
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