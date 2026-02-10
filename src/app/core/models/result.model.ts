export interface BiddingResult {
  resultId: number;
  stallId: number;
  stallName: string;
  stallNo: number;
  stallCategory?: string;
  stallLocation?: string;
  winnerId: number;
  winnerName: string;
  winnerEmail: string;
  winnerPhone?: string;
  winningBid: number;
  basePrice: number;
  totalBids: number;
  biddingStarted: string;
  biddingEnded: string;
  closedAt: string;
  declaredAt?: string;
  paymentStatus?: PaymentStatus;
  deliveryStatus?: DeliveryStatus;
  notes?: string;
  createdAt: string;
}

export type PaymentStatus = 'PENDING' | 'PAID' | 'CANCELLED' | 'REFUNDED';
export type DeliveryStatus = 'PENDING' | 'PROCESSING' | 'DELIVERED' | 'CANCELLED';

export interface ResultSummary {
  totalAuctions: number;
  totalRevenue: number;
  averageWinningBid: number;
  highestBid: number;
  lowestBid: number;
  totalParticipants: number;
}

export interface StallResult {
  stallId: number;
  stallName: string;
  winner?: {
    userId: number;
    name: string;
    email: string;
  };
  winningBid?: number;
  totalBids: number;
  bids: BidHistoryForResult[];
}

export interface BidHistoryForResult {
  bidId: number;
  bidderId: number;
  bidderName: string;
  amount: number;
  timestamp: string;
  rank: number;
}
