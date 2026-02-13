import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Bid, BidRequest, BidResponse, BidHistoryItem } from '../models/bid.model';

@Injectable({
  providedIn: 'root'
})
export class BidService {
  private apiUrl = `${environment.apiUrl}/bids`;

  constructor(private http: HttpClient) {}

  /**
   * Place a bid
   */
  placeBid(request: BidRequest): Observable<BidResponse> {
    console.log('📡 Placing bid:', request);
    return this.http.post<BidResponse>(`${this.apiUrl}/place`, request).pipe(
      catchError(error => {
        console.error('❌ Error placing bid:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get bid history for a stall - returns Bid[] for consistency
   */
  getBidHistory(stallId: number): Observable<Bid[]> {
    console.log('📡 Getting bid history for stall:', stallId);
    return this.http.get<any[]>(`${this.apiUrl}/stall/${stallId}/history`).pipe(
      map((items: any[]) => this.mapToBids(items)),
      catchError(error => {
        console.error('❌ Error getting bid history:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get bid history as BidHistoryItem (if needed for specific UI components)
   */
  getBidHistoryItems(stallId: number): Observable<BidHistoryItem[]> {
    console.log('📡 Getting bid history items for stall:', stallId);
    return this.http.get<BidHistoryItem[]>(`${this.apiUrl}/stall/${stallId}/history`).pipe(
      catchError(error => {
        console.error('❌ Error getting bid history items:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all bids for a stall
   */
  getStallBids(stallId: number): Observable<Bid[]> {
    console.log('📡 Getting all bids for stall:', stallId);
    return this.http.get<any[]>(`${this.apiUrl}/stall/${stallId}`).pipe(
      map((items: any[]) => this.mapToBids(items)),
      catchError(error => {
        console.error('❌ Error getting stall bids:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * ✅ FIXED: Get my bids - Uses /my-bids endpoint (authenticated via JWT)
   * The userId parameter is kept for backward compatibility but is NOT used
   * The backend uses @AuthenticationPrincipal from the JWT token
   */
  getMyBids(userId?: number): Observable<Bid[]> {
    console.log('📡 Calling GET /api/bids/my-bids (authenticated endpoint)');
    console.log('ℹ️ Using JWT token for authentication - userId parameter ignored');
    
    return this.http.get<any[]>(`${this.apiUrl}/my-bids`).pipe(
      map((items: any[]) => {
        console.log('✅ Received', items?.length || 0, 'bids from API');
        console.log('📦 Raw bid data:', items);
        return this.mapToBids(items);
      }),
      catchError(error => {
        console.error('❌ Error getting my bids:', error);
        console.error('❌ Error details:', {
          status: error.status,
          message: error.error?.message,
          url: error.url
        });
        return throwError(() => error);
      })
    );
  }

  /**
   * Get highest bid for a stall
   */
  getHighestBid(stallId: number): Observable<BidResponse> {
    console.log('📡 Getting highest bid for stall:', stallId);
    return this.http.get<BidResponse>(`${this.apiUrl}/stall/${stallId}/highest`).pipe(
      catchError(error => {
        console.error('❌ Error getting highest bid:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get total bids count for a stall
   */
  getTotalBids(stallId: number): Observable<{ count: number }> {
    console.log('📡 Getting total bids count for stall:', stallId);
    return this.http.get<{ count: number }>(`${this.apiUrl}/stall/${stallId}/count`).pipe(
      catchError(error => {
        console.error('❌ Error getting total bids:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get winning bids for a user
   * Note: This endpoint might not exist on backend yet
   */
  getWinningBids(userId: number): Observable<Bid[]> {
    console.log('📡 Getting winning bids for user:', userId);
    return this.http.get<any[]>(`${this.apiUrl}/user/${userId}/won`).pipe(
      map((items: any[]) => this.mapToBids(items)),
      catchError(error => {
        console.error('❌ Error getting winning bids:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get all bids (Admin only)
   */
  getAllBids(): Observable<Bid[]> {
    console.log('📡 Getting all bids (Admin)');
    return this.http.get<any[]>(`${this.apiUrl}/all`).pipe(
      map((items: any[]) => this.mapToBids(items)),
      catchError(error => {
        console.error('❌ Error getting all bids:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get bidders for a stall
   */
  getBiddersForStall(stallId: number): Observable<any[]> {
    console.log('📡 Getting bidders for stall:', stallId);
    return this.http.get<any[]>(`${this.apiUrl}/stall/${stallId}/bidders`).pipe(
      catchError(error => {
        console.error('❌ Error getting bidders:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Declare winner for a stall (Admin only)
   */
  declareWinner(stallId: number): Observable<BidResponse> {
    console.log('📡 Declaring winner for stall:', stallId);
    return this.http.post<BidResponse>(`${this.apiUrl}/stall/${stallId}/declare-winner`, {}).pipe(
      catchError(error => {
        console.error('❌ Error declaring winner:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get viewer count for a stall
   */
  getViewerCount(stallId: number): Observable<{ viewerCount: number }> {
    console.log('📡 Getting viewer count for stall:', stallId);
    return this.http.get<{ viewerCount: number }>(`${this.apiUrl}/stall/${stallId}/viewers`).pipe(
      catchError(error => {
        console.error('❌ Error getting viewer count:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Helper method to map API response to Bid model
   * Handles various response formats from different endpoints
   */
  private mapToBids(items: any[]): Bid[] {
    if (!items) {
      console.warn('⚠️ Bid items is null or undefined');
      return [];
    }

    if (!Array.isArray(items)) {
      console.error('❌ Bid items is not an array:', items);
      return [];
    }

    if (items.length === 0) {
      console.log('ℹ️ No bids to map');
      return [];
    }

    console.log('🔄 Mapping', items.length, 'bid items');

    const mappedBids = items
      .map((item, index) => {
        if (!item) {
          console.warn('⚠️ Skipping null/undefined bid item at index', index);
          return null;
        }

        try {
          // Map to Bid interface
          const bid: Bid = {
            bidId: item.bidId || item.id,
            stallId: item.stallId,
            bidderId: item.bidderId || item.bidder?.studentId,
            bidderName: item.bidderName || item.bidder?.studentName || 'Anonymous',
            biddedPrice: item.biddedPrice || item.amount || 0,
            bidTime: item.bidTime || item.timestamp || item.createdAt || new Date().toISOString(),
            stallName: item.stallName || item.stall?.stallName,
            Location: item.stallLocation || item.stall?.location,
            stallImage: item.stallImage || item.stall?.image,
            status: item.status?.toUpperCase() || 'ACTIVE',
            isHighestBid: item.isHighestBid || false
          };

          // Validate essential fields
          if (!bid.bidId || !bid.stallId || bid.biddedPrice === null || bid.biddedPrice === undefined) {
            console.warn('⚠️ Skipping invalid bid at index', index, '- missing required fields:', bid);
            return null;
          }

          return bid;
        } catch (error) {
          console.error('❌ Error mapping bid at index', index, ':', error);
          return null;
        }
      })
      .filter((bid): bid is Bid => bid !== null); // Filter out null values with type guard

    console.log('✅ Successfully mapped', mappedBids.length, 'valid bids');

    if (mappedBids.length !== items.length) {
      console.warn('⚠️ Filtered out', items.length - mappedBids.length, 'invalid bids');
    }

    return mappedBids;
  }
}

