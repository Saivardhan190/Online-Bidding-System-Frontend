export interface AdminStats {
  // User Statistics
  totalUsers: number;
  activeUsers: number;
  newUsersToday: number;
  newUsersThisWeek: number;
  newUsersThisMonth: number;
  
  // Bidder Statistics
  totalBidders: number;
  approvedBidders: number;
  pendingApplications: number;
  rejectedApplications: number;
  
  // Stall Statistics
  totalStalls: number;
  availableStalls: number;
  activeAuctions: number;
  closedAuctions: number;
  soldStalls: number;
  
  // Bid Statistics
  totalBids: number;
  bidsToday: number;
  bidsThisWeek: number;
  bidsThisMonth: number;
  averageBidsPerStall: number;
  
  // Revenue Statistics
  totalRevenue: number;
  revenueToday: number;
  revenueThisWeek: number;
  revenueThisMonth: number;
  averageWinningBid: number;
  highestBid: number;
  lowestBid: number;
  
  // Activity Statistics
  activeAuctionsNow: number;
  endingToday: number;
  endingThisWeek: number;
  startingToday: number;
  startingThisWeek: number;
}

export interface RecentActivity {
  type: 'BID' | 'APPLICATION' | 'STALL_CREATED' | 'AUCTION_STARTED' | 'AUCTION_ENDED' | 'USER_REGISTERED';
  description: string;
  timestamp: string;
  userId?: number;
  userName?: string;
  stallId?: number;
  stallName?: string;
  amount?: number;
}

export interface DashboardOverview {
  stats: AdminStats;
  recentActivities: RecentActivity[];
  topBidders: TopBidder[];
  topStalls: TopStall[];
  upcomingAuctions: UpcomingAuction[];
}

export interface TopBidder {
  userId: number;
  userName: string;
  totalBids: number;
  totalAmount: number;
  auctionsWon: number;
}

export interface TopStall {
  stallId: number;
  stallName: string;
  category: string;
  totalBids: number;
  currentHighestBid: number;
  basePrice: number;
}

export interface UpcomingAuction {
  stallId: number;
  stallName: string;
  category: string;
  basePrice: number;
  startTime: string;
  endTime: string;
}
