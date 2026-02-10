import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';

interface Notification {
  id: number;
  type: 'bid' | 'application' | 'winner' | 'system';
  title: string;
  message: string;
  timestamp: string;
  isRead: boolean;
  icon: string;
}

@Component({
  selector: 'app-notifications',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './notifications.html',
  styleUrls: ['./notifications.scss']
})
export class Notifications implements OnInit {
  notifications: Notification[] = [];
  filteredNotifications: Notification[] = [];
  activeFilter = 'all';
  isLoading = false;

  ngOnInit(): void {
    this.loadNotifications();
  }

  loadNotifications(): void {
    this.isLoading = true;
    
    // Mock data - replace with actual API call
    setTimeout(() => {
      this.notifications = [
        {
          id: 1,
          type: 'bid',
          title: 'New Bid on Tech Hub',
          message: 'Someone placed a bid of ₹5000 on Tech Hub stall',
          timestamp: new Date(Date.now() - 1000 * 60 * 5).toISOString(),
          isRead: false,
          icon: '💰'
        },
        {
          id: 2,
          type: 'winner',
          title: 'You won an auction!',
          message: 'Congratulations! You won the bid for Food Corner with ₹3500',
          timestamp: new Date(Date.now() - 1000 * 60 * 60).toISOString(),
          isRead: false,
          icon: '🎉'
        },
        {
          id: 3,
          type: 'application',
          title: 'Bidder Application Approved',
          message: 'Your bidder application has been approved. You can now participate in auctions.',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 24).toISOString(),
          isRead: true,
          icon: '✅'
        },
        {
          id: 4,
          type: 'bid',
          title: 'You were outbid',
          message: 'Someone placed a higher bid on Electronics Store',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 48).toISOString(),
          isRead: true,
          icon: '⚠️'
        },
        {
          id: 5,
          type: 'system',
          title: 'New stalls available',
          message: '5 new stalls are now available for bidding',
          timestamp: new Date(Date.now() - 1000 * 60 * 60 * 72).toISOString(),
          isRead: true,
          icon: '📢'
        }
      ];
      
      this.filterNotifications();
      this.isLoading = false;
    }, 500);
  }

  setFilter(filter: string): void {
    this.activeFilter = filter;
    this.filterNotifications();
  }

  filterNotifications(): void {
    if (this.activeFilter === 'all') {
      this.filteredNotifications = this.notifications;
    } else if (this.activeFilter === 'unread') {
      this.filteredNotifications = this.notifications.filter(n => !n.isRead);
    } else {
      this.filteredNotifications = this.notifications.filter(n => n.type === this.activeFilter);
    }
  }

  markAsRead(notification: Notification): void {
    notification.isRead = true;
    // Call API to mark as read
  }

  markAllAsRead(): void {
    this.notifications.forEach(n => n.isRead = true);
    this.filterNotifications();
    // Call API to mark all as read
  }

  clearAll(): void {
    if (confirm('Are you sure you want to clear all notifications?')) {
      this.notifications = [];
      this.filterNotifications();
      // Call API to clear notifications
    }
  }

  formatTimestamp(timestamp: string): string {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);
    
    if (minutes < 1) return 'Just now';
    if (minutes < 60) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    if (hours < 24) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (days < 7) return `${days} day${days > 1 ? 's' : ''} ago`;
    
    return date.toLocaleDateString();
  }

  getUnreadCount(): number {
    return this.notifications.filter(n => !n.isRead).length;
  }

  getTypeClass(type: string): string {
    switch (type) {
      case 'bid': return 'bg-blue-100 text-blue-800';
      case 'winner': return 'bg-green-100 text-green-800';
      case 'application': return 'bg-purple-100 text-purple-800';
      case 'system': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }
}
