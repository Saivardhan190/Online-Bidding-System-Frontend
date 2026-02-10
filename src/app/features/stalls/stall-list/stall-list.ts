import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { StallService } from '../../../core/services/stall';
import { AuthService } from '../../../core/services/auth';
import { Stall } from '../../../core/models/stall.model';

@Component({
  selector:  'app-stall-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl:  './stall-list.html',
  styleUrls: ['./stall-list.scss']
})
export class StallList implements OnInit {
  stalls:  Stall[] = [];
  filteredStalls:  Stall[] = [];
  isLoading = true;
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  categories:  string[] = ['Food', 'Electronics', 'Clothing', 'Games', 'Services', 'Other'];

  constructor(
    private stallService: StallService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this. loadStalls();
  }

  loadStalls(): void {
    this.isLoading = true;
    this.stallService.getAllStalls().subscribe({
      next: (stalls) => {
        this.stalls = stalls;
        this.filteredStalls = stalls;
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stalls:', error);
        this.isLoading = false;
        // Mock data for testing
        this.stalls = this.getMockStalls();
        this.filteredStalls = this.stalls;
      }
    });
  }

  filterStalls(): void {
    this.filteredStalls = this.stalls. filter(stall => {
      const matchesSearch = ! this.searchQuery || 
        stall.stallName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        stall.location.toLowerCase().includes(this.searchQuery. toLowerCase());
      
      const matchesCategory = ! this.selectedCategory || stall.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || stall. status === this.selectedStatus;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.filteredStalls = this.stalls;
  }

  getStatusBadgeClass(status: string): string {
    switch (status) {
      case 'ACTIVE':  return 'bg-green-100 text-green-800';
      case 'AVAILABLE': return 'bg-blue-100 text-blue-800';
      case 'CLOSED': return 'bg-gray-100 text-gray-800';
      case 'BOOKED': return 'bg-purple-100 text-purple-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  }

  isBidder(): boolean {
    const user = this.authService.getUser();
    return user?. role === 'BIDDER' || user?.role === 'ADMIN';
  }

  canJoinBidding(stall: Stall): boolean {
    return stall.status === 'ACTIVE' && this.isBidder();
  }

  getMockStalls(): Stall[] {
    return [
      {
        stallId: 1,
        stallNo: 101,
        stallName: 'Food Court Corner',
        description: 'Premium location near the main entrance',
        location: 'Block A - Ground Floor',
        category: 'Food',
        image: null,
        basePrice: 5000,
        currentHighestBid: 7500,
        totalBids: 12,
        status: 'ACTIVE',
        biddingStart: '2024-01-15T10:00:00',
        biddingEnd: '2024-01-15T18:00:00',
        createdAt: '2024-01-01'
      },
      {
        stallId: 2,
        stallNo: 102,
        stallName: 'Electronics Hub',
        description:  'High visibility spot for tech products',
        location: 'Block B - First Floor',
        category: 'Electronics',
        image: null,
        basePrice: 8000,
        currentHighestBid: 12000,
        totalBids: 8,
        status:  'ACTIVE',
        biddingStart: '2024-01-15T10:00:00',
        biddingEnd: '2024-01-15T18:00:00',
        createdAt: '2024-01-01'
      },
      {
        stallId: 3,
        stallNo: 103,
        stallName: 'Fashion Zone',
        description:  'Perfect for clothing and accessories',
        location: 'Block A - First Floor',
        category: 'Clothing',
        image:  null,
        basePrice: 6000,
        currentHighestBid:  6000,
        totalBids: 0,
        status:  'AVAILABLE',
        biddingStart: '2024-01-20T10:00:00',
        biddingEnd: '2024-01-20T18:00:00',
        createdAt: '2024-01-01'
      }
    ];
  }
}