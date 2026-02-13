import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface BiddingResult {
  resultId: number;
  stallId: number;
  stallName: string;
  winnerId: number;
  winnerName: string;
  winnerEmail: string;
  winningPrice: number;
  resultTime: string;
}

export interface ResultResponse {
  status?: string;
  message?: string;
  biddingEndsAt?: string;
  resultId?: number;
  stallId?: number;
  stallName?: string;
  winnerId?: number;
  winnerName?: string;
  winnerEmail?: string;
  winningPrice?: number;
  resultTime?: string;
}

@Injectable({
  providedIn: 'root'
})
export class ResultService {
  private apiUrl = `${environment.apiUrl}/results`;

  constructor(private http: HttpClient) {}

  // ✅ Get all winners
  getAllWinners(): Observable<BiddingResult[]> {
    return this.http.get<BiddingResult[]>(`${this.apiUrl}/winners`);
  }

  // ✅ Get result for specific stall
  getStallResult(stallId: number): Observable<ResultResponse> {
    return this.http.get<ResultResponse>(`${this.apiUrl}/stall/${stallId}`);
  }

  // ✅ Manually declare winner (Admin only)
  declareWinner(stallId: number): Observable<BiddingResult> {
    return this.http.post<BiddingResult>(`${this.apiUrl}/declare/${stallId}`, {});
  }

  // ✅ Get results by winner
  getResultsByWinner(studentId: number): Observable<BiddingResult[]> {
    return this.http.get<BiddingResult[]>(`${this.apiUrl}/winner/${studentId}`);
  }
}