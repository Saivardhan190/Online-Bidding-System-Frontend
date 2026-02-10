import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { StallService } from '../../../core/services/stall';
import { AuthService } from '../../../core/services/auth';
import { Stall } from '../../../core/models/stall.model';

@Component({
  selector: 'app-stall-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl:  './stall-detail.html',
  styleUrls: ['./stall-detail.scss']
})
export class StallDetail implements OnInit {
  stall:  Stall | null = null;
  isLoading = true;
  error = '';

  constructor(
    private route: ActivatedRoute,
    private stallService: StallService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    const stallId = this. route.snapshot.params['id'];
    if (stallId) {
      this.loadStall(+stallId);
    }
  }

  loadStall(id: number): void {
    this.isLoading = true;
    this.stallService.getStallById(id).subscribe({
      next:  (stall) => {
        this. stall = stall;
        this. isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stall:', error);
        this.isLoading = false;
        // Mock data for testing
        this.stall = {
          stallId: id,
          stallNo: 101,
          stallName: 'Premium Food Court Corner',
          description: 'This is a premium location situated at the main entrance of the college fest area.  Perfect for food stalls with high foot traffic.  The stall comes with electricity connection, water supply, and ample space for customer seating.',
          location: 'Block A - Ground Floor, Near Main Gate',
          category:  'Food',
          image: null,
          basePrice:  5000,
          currentHighestBid: 8500,
          totalBids: 15,
          status:  'ACTIVE',
          biddingStart: '2024-01-15T10:00:00',
          biddingEnd: '2024-01-15T18:00:00',
          createdAt: '2024-01-01'
        };
      }
    });
  }

  isBidder(): boolean {
    const user = this.authService.getUser();
    return user?.role === 'BIDDER' || user?. role === 'ADMIN';
  }

  getStatusBadgeClass(): string {
    switch (this.stall?.status) {
      case 'ACTIVE': return 'bg-green-100 text-green-800';
      case 'AVAILABLE':  return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  formatDate(dateStr: string | null): string {
    if (!dateStr) return 'TBD';
    return new Date(dateStr).toLocaleString('en-IN', {
      dateStyle: 'medium',
      timeStyle: 'short'
    });
  }
}