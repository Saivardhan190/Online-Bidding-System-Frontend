import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { environment } from '../../../../environments/environment';

interface BiddingResult {
  resultId: number;
  stallId: number;
  stallName: string;
  stallNo: number;
  winnerId: number;
  winnerName:  string;
  winnerEmail: string;
  winningBid: number;
  closedAt: string;
  paymentStatus?:  'PENDING' | 'PAID' | 'CANCELLED';
}

@Component({
  selector: 'app-bidding-results',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './bidding-results.html',
  styleUrls: ['./bidding-results.scss']
})
export class BiddingResults implements OnInit {
  results: BiddingResult[] = [];
  filteredResults: BiddingResult[] = [];
  isLoading = true;
  searchQuery = '';

  stats = {
    total: 0,
    totalRevenue: 0,
    avgBid: 0
  };

  constructor(private http: HttpClient) {}

  ngOnInit(): void {
    this.loadResults();
  }

  loadResults(): void {
    this. isLoading = true;
    
    this.http.get<BiddingResult[]>(`${environment.apiUrl}/results/winners`).subscribe({
      next: (results) => {
        this.results = results;
        this. calculateStats();
        this.filterResults();
        this.isLoading = false;
      },
      error:  (error) => {
        console.error('Error loading results:', error);
        this.results = [];
        this.isLoading = false;
      }
    });
  }

  calculateStats(): void {
    this.stats.total = this.results. length;
    this.stats.totalRevenue = this.results.reduce((sum, r) => sum + (r.winningBid || 0), 0);
    this.stats.avgBid = this. stats.total > 0 ?  this.stats.totalRevenue / this. stats.total : 0;
  }

  filterResults(): void {
    if (! this.searchQuery. trim()) {
      this.filteredResults = this.results;
      return;
    }

    const query = this.searchQuery.toLowerCase();
    this.filteredResults = this.results. filter(r =>
      r.stallName?. toLowerCase().includes(query) ||
      r.winnerName?.toLowerCase().includes(query) ||
      r.winnerEmail?.toLowerCase().includes(query)
    );
  }

  onSearchChange(): void {
    this.filterResults();
  }

  formatDate(dateStr: string): string {
    if (!dateStr) return 'N/A';
    return new Date(dateStr).toLocaleString('en-IN', {
      day: '2-digit',
      month:  'short',
      year:  'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }
}