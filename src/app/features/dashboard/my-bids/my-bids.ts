import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { BidService } from '../../../core/services/bid';
import { Bid } from '../../../core/models/bid.model';

@Component({
  selector: 'app-my-bids',
  standalone:  true,
  imports: [CommonModule, RouterLink],
  templateUrl: './my-bids.html',
  styleUrls: ['./my-bids.scss']
})
export class MyBids implements OnInit {
  allBids: Bid[] = [];
  filteredBids:  Bid[] = [];
  isLoading = true;
  activeTab = 'all';
  error = '';

  tabs = [
    { id: 'all', label: 'All Bids', icon: '📋' },
    { id: 'active', label:  'Active', icon: '🔴' },
    { id: 'won', label: 'Won', icon:  '🏆' },
    { id: 'lost', label: 'Lost', icon: '😔' }
  ];

  stats = {
    total: 0,
    active: 0,
    won:  0,
    lost: 0
  };

  constructor(
    private authService: AuthService,
    private bidService: BidService
  ) {}

  ngOnInit(): void {
    this. loadBids();
  }

  loadBids(): void {
    const user = this.authService.getUser();
    if (!user) {
      this. isLoading = false;
      return;
    }

    this.isLoading = true;
    this.error = '';

    this.bidService.getMyBids(user.studentId).subscribe({
      next:  (bids) => {
        this. allBids = bids;
        this.calculateStats();
        this.filterBids();
        this.isLoading = false;
      },
      error:  (error) => {
        console.error('Error loading bids:', error);
        this.allBids = [];
        this.stats = { total: 0, active: 0, won: 0, lost: 0 };
        this.filterBids();
        this.isLoading = false;
        this.error = 'Failed to load bids.  Please try again.';
      }
    });
  }

  calculateStats(): void {
    this.stats. total = this.allBids.length;
    this.stats.active = this. allBids.filter(b => b. status === 'ACTIVE').length;
    this.stats. won = this.allBids.filter(b => b.status === 'WON').length;
    this.stats. lost = this.allBids.filter(b => b.status === 'LOST').length;
  }

  setActiveTab(tabId: string): void {
    this. activeTab = tabId;
    this.filterBids();
  }

  filterBids(): void {
    switch (this.activeTab) {
      case 'active':
        this. filteredBids = this.allBids.filter(b => b.status === 'ACTIVE');
        break;
      case 'won':
        this. filteredBids = this.allBids.filter(b => b.status === 'WON');
        break;
      case 'lost':
        this. filteredBids = this.allBids.filter(b => b.status === 'LOST');
        break;
      default:
        this. filteredBids = this.allBids;
    }
  }

  // ✅ Helper method for stall name
  getBidStallName(bid: Bid): string {
    return bid.stallName || `Stall #${bid.stallId}`;
  }

  getStatusBadge(bid: Bid): { class: string; label: string; icon: string } {
    switch (bid.status) {
      case 'ACTIVE': 
        return { class: 'bg-green-100 text-green-800', label: 'Active', icon:  '🔴' };
      case 'WON':
        return { class: 'bg-yellow-100 text-yellow-800', label: 'Won', icon:  '🏆' };
      case 'LOST': 
        return { class:  'bg-gray-100 text-gray-800', label: 'Lost', icon: '😔' };
      default:
        return { class: 'bg-blue-100 text-blue-800', label: 'Pending', icon: '⏳' };
    }
  }

  formatDate(dateStr:  string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }
}