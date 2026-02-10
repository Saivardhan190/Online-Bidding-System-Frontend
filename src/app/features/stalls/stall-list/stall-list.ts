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
  stalls: Stall[] = [];
  filteredStalls: Stall[] = [];
  isLoading = true;
  searchQuery = '';
  selectedCategory = '';
  selectedStatus = '';
  selectedLocation = '';
  minPrice = 0;
  maxPrice = 0;
  sortBy = 'name'; // name, price-low, price-high, ending-soon, most-bids
  showFilters = false;
  
  categories: string[] = ['Food', 'Electronics', 'Clothing', 'Books', 'Accessories', 'Games', 'Services', 'Other'];
  locations: string[] = [
    'Block A - Ground Floor',
    'Block A - First Floor',
    'Block B - Ground Floor',
    'Block B - First Floor',
    'Main Entrance',
    'Cafeteria Area',
    'Library Area',
    'Sports Complex',
    'Outdoor Area'
  ];

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
        this.initializePriceRange();
        this.applyFiltersAndSort();
        this.isLoading = false;
      },
      error: (error) => {
        console.error('Error loading stalls:', error);
        this.isLoading = false;
        // Mock data for testing
        this.stalls = this.getMockStalls();
        this.initializePriceRange();
        this.applyFiltersAndSort();
      }
    });
  }

  initializePriceRange(): void {
    if (this.stalls.length === 0) return;
    const prices = this.stalls.map(s => s.basePrice);
    this.minPrice = Math.min(...prices);
    this.maxPrice = Math.max(...prices);
  }

  applyFiltersAndSort(): void {
    // First filter
    this.filteredStalls = this.stalls.filter(stall => {
      const matchesSearch = !this.searchQuery || 
        stall.stallName.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        stall.location.toLowerCase().includes(this.searchQuery.toLowerCase()) ||
        stall.description.toLowerCase().includes(this.searchQuery.toLowerCase());
      
      const matchesCategory = !this.selectedCategory || stall.category === this.selectedCategory;
      const matchesStatus = !this.selectedStatus || stall.status === this.selectedStatus;
      const matchesLocation = !this.selectedLocation || stall.location === this.selectedLocation;
      const matchesPrice = (!this.minPrice || stall.basePrice >= this.minPrice) && 
                          (!this.maxPrice || stall.basePrice <= this.maxPrice);

      return matchesSearch && matchesCategory && matchesStatus && matchesLocation && matchesPrice;
    });

    // Then sort
    this.sortStalls();
  }

  sortStalls(): void {
    switch (this.sortBy) {
      case 'price-low':
        this.filteredStalls.sort((a, b) => a.basePrice - b.basePrice);
        break;
      case 'price-high':
        this.filteredStalls.sort((a, b) => b.basePrice - a.basePrice);
        break;
      case 'ending-soon':
        this.filteredStalls.sort((a, b) => {
          if (!a.biddingEnd || !b.biddingEnd) return 0;
          return new Date(a.biddingEnd).getTime() - new Date(b.biddingEnd).getTime();
        });
        break;
      case 'most-bids':
        this.filteredStalls.sort((a, b) => (b.totalBids || 0) - (a.totalBids || 0));
        break;
      case 'name':
      default:
        this.filteredStalls.sort((a, b) => a.stallName.localeCompare(b.stallName));
        break;
    }
  }

  onFilterChange(): void {
    this.applyFiltersAndSort();
  }

  onSortChange(): void {
    this.sortStalls();
  }

  clearFilters(): void {
    this.searchQuery = '';
    this.selectedCategory = '';
    this.selectedStatus = '';
    this.selectedLocation = '';
    this.minPrice = 0;
    this.maxPrice = 0;
    this.sortBy = 'name';
    this.applyFiltersAndSort();
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