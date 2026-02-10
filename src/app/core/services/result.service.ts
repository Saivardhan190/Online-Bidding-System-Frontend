import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { BiddingResult, ResultSummary, StallResult } from '../models/result.model';

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private apiUrl = `${environment.apiUrl}/results`;

  constructor(private http: HttpClient) {}

  // Get all winners
  getAllWinners(): Observable<BiddingResult[]> {
    return this.http.get<BiddingResult[]>(`${this.apiUrl}/winners`);
  }

  // Get result for specific stall
  getStallResult(stallId: number): Observable<StallResult> {
    return this.http.get<StallResult>(`${this.apiUrl}/stall/${stallId}`);
  }

  // Get result summary
  getResultSummary(): Observable<ResultSummary> {
    return this.http.get<ResultSummary>(`${this.apiUrl}/summary`);
  }

  // Get results by date range
  getResultsByDateRange(startDate: string, endDate: string): Observable<BiddingResult[]> {
    return this.http.get<BiddingResult[]>(`${this.apiUrl}/date-range`, {
      params: { startDate, endDate }
    });
  }

  // Get results by category
  getResultsByCategory(category: string): Observable<BiddingResult[]> {
    return this.http.get<BiddingResult[]>(`${this.apiUrl}/category/${category}`);
  }

  // Export results as CSV (returns blob)
  exportResultsCSV(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/csv`, {
      responseType: 'blob'
    });
  }

  // Export results as PDF (returns blob)
  exportResultsPDF(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/export/pdf`, {
      responseType: 'blob'
    });
  }
}
