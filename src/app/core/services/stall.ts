import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Stall } from '../models/stall.model';

export interface CreateStallRequest {
  stallNo: number;
  stallName: string;
  description: string;
  location: string;
  category: string;
  basePrice: number;
  originalPrice: number;      // ✅ Required
  maxBidders?:  number;
  biddingStartTime:  string;
  biddingEndTime:  string;
  image?: string;
}

@Injectable({
  providedIn: 'root'
})
export class StallService {
  private apiUrl = `${environment.apiUrl}/stalls`;

  constructor(private http: HttpClient) {}

  getAllStalls(): Observable<Stall[]> {
    return this.http.get<Stall[]>(this.apiUrl);
  }

  getActiveAuctions(): Observable<Stall[]> {
    return this.http.get<Stall[]>(`${this.apiUrl}/active`);
  }

  getAvailableStalls(): Observable<Stall[]> {
    return this.http.get<Stall[]>(`${this.apiUrl}/available`);
  }

  getClosedStalls(): Observable<Stall[]> {
    return this. http.get<Stall[]>(`${this.apiUrl}/closed`);
  }

  getStallById(stallId: number): Observable<Stall> {
    return this. http.get<Stall>(`${this.apiUrl}/${stallId}`);
  }

  getStallByNumber(stallNo: number): Observable<Stall> {
    return this. http.get<Stall>(`${this.apiUrl}/number/${stallNo}`);
  }

  getStallsByStatus(status: string): Observable<Stall[]> {
    return this.http.get<Stall[]>(`${this.apiUrl}/status/${status}`);
  }

  getStallCounts(): Observable<{ [key: string]: number }> {
    return this.http.get<{ [key: string]: number }>(`${this.apiUrl}/counts`);
  }

  // ✅ Create stall with all required fields
  createStall(stallData: CreateStallRequest): Observable<Stall> {
    const formattedData = {
      ...stallData,
      biddingStartTime: this.formatDateForBackend(stallData. biddingStartTime),
      biddingEndTime: this.formatDateForBackend(stallData. biddingEndTime)
    };

    console.log('Creating stall with data:', formattedData);
    return this.http.post<Stall>(this.apiUrl, formattedData);
  }

  updateStall(stallId: number, stallData:  Partial<Stall>): Observable<Stall> {
    return this.http.put<Stall>(`${this.apiUrl}/${stallId}`, stallData);
  }

  deleteStall(stallId: number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${stallId}`);
  }

  startAuction(stallId: number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${stallId}/start-bidding`, {});
  }

  endAuction(stallId:  number): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/${stallId}/stop-bidding`, {});
  }

  updateStallStatus(stallId: number, status: string): Observable<any> {
    if (status === 'ACTIVE') {
      return this.startAuction(stallId);
    } else if (status === 'CLOSED') {
      return this.endAuction(stallId);
    }
    return this.http.put<any>(`${this.apiUrl}/${stallId}`, { status });
  }

  private formatDateForBackend(dateString: string): string {
    if (!dateString) return '';
    if (dateString.includes('T') && dateString.endsWith('Z')) {
      return dateString;
    }
    try {
      const date = new Date(dateString);
      return date.toISOString();
    } catch {
      return dateString;
    }
  }
}