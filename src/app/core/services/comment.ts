import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface Comment {
  commentId: number;
  stallId: number;
  userId: number;
  userName: string;
  userProfilePicture?: string;
  commentText: string;
  createdAt:  string;
}

export interface CommentRequest {
  stallId: number;
  commentText: string;
}

@Injectable({
  providedIn: 'root'
})
export class CommentService {
  private apiUrl = `${environment.apiUrl}/comments`;

  constructor(private http: HttpClient) {}

  getCommentsByStall(stallId: number): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/stall/${stallId}`);
  }

  addComment(request: CommentRequest): Observable<Comment> {
    return this. http.post<Comment>(this.apiUrl, request);
  }

  deleteComment(commentId:  number): Observable<any> {
    return this.http.delete<any>(`${this.apiUrl}/${commentId}`);
  }

  getMyComments(): Observable<Comment[]> {
    return this.http.get<Comment[]>(`${this.apiUrl}/my-comments`);
  }
}