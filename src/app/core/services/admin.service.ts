import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { AdminStats, DashboardOverview, RecentActivity } from '../models/admin-stats.model';

@Injectable({
  providedIn: 'root'
})
export class AdminService {
  private apiUrl = `${environment.apiUrl}/admin`;

  constructor(private http: HttpClient) {}

  // Get admin statistics
  getStats(): Observable<AdminStats> {
    return this.http.get<AdminStats>(`${this.apiUrl}/stats`);
  }

  // Get dashboard overview (stats + recent activity)
  getDashboardOverview(): Observable<DashboardOverview> {
    return this.http.get<DashboardOverview>(`${this.apiUrl}/dashboard`);
  }

  // Get recent activities
  getRecentActivities(limit: number = 10): Observable<RecentActivity[]> {
    return this.http.get<RecentActivity[]>(`${this.apiUrl}/activities`, {
      params: { limit: limit.toString() }
    });
  }

  // System health check
  getSystemHealth(): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/health`);
  }

  // Get analytics data
  getAnalytics(period: 'day' | 'week' | 'month' | 'year'): Observable<any> {
    return this.http.get<any>(`${this.apiUrl}/analytics`, {
      params: { period }
    });
  }

  // Backup database (Admin only)
  backupDatabase(): Observable<Blob> {
    return this.http.get(`${this.apiUrl}/backup`, {
      responseType: 'blob'
    });
  }

  // Get system logs (Admin only)
  getSystemLogs(limit: number = 100): Observable<any[]> {
    return this.http.get<any[]>(`${this.apiUrl}/logs`, {
      params: { limit: limit.toString() }
    });
  }

  // Send system notification to all users
  sendSystemNotification(title: string, message: string): Observable<void> {
    return this.http.post<void>(`${this.apiUrl}/notifications/broadcast`, {
      title,
      message
    });
  }
}
