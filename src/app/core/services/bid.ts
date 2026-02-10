import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { Bid, BidRequest, BidResponse, BidHistoryItem } from '../models/bid.model';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private apiUrl = `${environment.apiUrl}/bids`;

  constructor(private http: HttpClient) {}

  // Place a bid
  placeBid(request: BidRequest): Observable<BidResponse> {
    return this.http.post<BidResponse>(`${this.apiUrl}/place`, request);
  }

  // Get bid history for a stall - returns Bid[] for consistency
  getBidHistory(stallId: number): Observable<Bid[]> {
    return this.http.get<any[]>(`${this.apiUrl}/stall/${stallId}/history`).pipe(
      map((items: any[]) => this.mapToBids(items))
    );
  }

  // Get bid history as BidHistoryItem (if needed)
  getBidHistoryItems(stallId: number): Observable<BidHistoryItem[]> {
    return this.http.get<BidHistoryItem[]>(`${this.apiUrl}/stall/${stallId}/history`);
  }

  // Get all bids for a stall
  getStallBids(stallId: number): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${this.apiUrl}/stall/${stallId}`);
  }

  // Get my bids
  getMyBids(userId: number): Observable<Bid[]> {
    return this. http.get<Bid[]>(`${this.apiUrl}/user/${userId}`);
  }

  // Get highest bid for a stall
  getHighestBid(stallId: number): Observable<{ amount: number; bidderName: string }> {
    return this.http.get<{ amount: number; bidderName: string }>(
      `${this.apiUrl}/stall/${stallId}/highest`
    );
  }

  // Get total bids count for a stall
  getTotalBids(stallId: number): Observable<{ count: number }> {
    return this. http.get<{ count: number }>(`${this.apiUrl}/stall/${stallId}/count`);
  }

  // Get winning bids for a user
  getWinningBids(userId:  number): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${this.apiUrl}/user/${userId}/won`);
  }

  // Get all bids (Admin)
  getAllBids(): Observable<Bid[]> {
    return this.http.get<Bid[]>(`${this.apiUrl}/all`);
  }

  // Declare winner for a stall (Admin)
  declareWinner(stallId: number): Observable<any> {
    return this.http.post(`${this.apiUrl}/stall/${stallId}/declare-winner`, {});
  }

  // Helper:  Map any bid format to Bid[]
  private mapToBids(items:  any[]): Bid[] {
    if (!items || ! Array.isArray(items)) return [];
    
    return items.map((item, index) => ({
      bidId: item.bidId || item.id || index,
      stallId: item.stallId || 0,
      stallName: item.stallName || '',
      bidderId: item.bidderId || item.userId || 0,
      bidderName: item. bidderName || item.userName || 'Anonymous',
      biddedPrice: item. biddedPrice || item.amount || 0,
      bidTime: item.bidTime || item.time || new Date().toISOString(),
      status: item.status || 'ACTIVE',
      rank: item. rank || index + 1
    }));
  }
}