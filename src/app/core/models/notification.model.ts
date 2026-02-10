export interface Notification {
  id: number;
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: number; // stallId, bidId, etc.
  relatedEntityType?: 'STALL' | 'BID' | 'APPLICATION' | 'SYSTEM';
  timestamp: string;
  isRead: boolean;
  createdAt: string;
}

export type NotificationType = 
  | 'BID_PLACED'
  | 'BID_OUTBID'
  | 'AUCTION_STARTED'
  | 'AUCTION_ENDING'
  | 'AUCTION_ENDED'
  | 'AUCTION_WON'
  | 'AUCTION_LOST'
  | 'APPLICATION_APPROVED'
  | 'APPLICATION_REJECTED'
  | 'SYSTEM_ANNOUNCEMENT';

export interface CreateNotificationRequest {
  userId: number;
  type: NotificationType;
  title: string;
  message: string;
  relatedEntityId?: number;
  relatedEntityType?: string;
}

export interface NotificationPreferences {
  emailNotifications: boolean;
  bidActivityAlerts: boolean;
  applicationStatusUpdates: boolean;
  winnerAnnouncements: boolean;
}
