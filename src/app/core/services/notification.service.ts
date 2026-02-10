import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { environment } from '../../../environments/environment';
import { Notification, NotificationPreferences } from '../models/notification.model';

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private apiUrl = `${environment.apiUrl}/notifications`;
  private notificationSubject = new Subject<Notification>();

  constructor(private http: HttpClient) {}

  // Get all notifications for current user
  getNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(this.apiUrl);
  }

  // Get unread notifications count
  getUnreadCount(): Observable<{ count: number }> {
    return this.http.get<{ count: number }>(`${this.apiUrl}/unread/count`);
  }

  // Get unread notifications
  getUnreadNotifications(): Observable<Notification[]> {
    return this.http.get<Notification[]>(`${this.apiUrl}/unread`);
  }

  // Mark notification as read
  markAsRead(notificationId: number): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/${notificationId}/read`, {});
  }

  // Mark all notifications as read
  markAllAsRead(): Observable<void> {
    return this.http.put<void>(`${this.apiUrl}/read-all`, {});
  }

  // Delete notification
  deleteNotification(notificationId: number): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${notificationId}`);
  }

  // Delete all notifications
  deleteAll(): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/all`);
  }

  // Get notification preferences
  getPreferences(): Observable<NotificationPreferences> {
    return this.http.get<NotificationPreferences>(`${this.apiUrl}/preferences`);
  }

  // Update notification preferences
  updatePreferences(preferences: NotificationPreferences): Observable<NotificationPreferences> {
    return this.http.put<NotificationPreferences>(`${this.apiUrl}/preferences`, preferences);
  }

  // Observable for real-time notifications
  getNotificationUpdates(): Observable<Notification> {
    return this.notificationSubject.asObservable();
  }

  // Emit new notification (called from WebSocket)
  emitNotification(notification: Notification): void {
    this.notificationSubject.next(notification);
  }
}
