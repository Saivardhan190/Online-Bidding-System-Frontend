import { Injectable, ErrorHandler, inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { HttpErrorResponse } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class GlobalErrorHandler implements ErrorHandler {
  private toastr = inject(ToastrService);

  handleError(error: Error | HttpErrorResponse): void {
    if (error instanceof HttpErrorResponse) {
      // HTTP errors
      this.handleHttpError(error);
    } else {
      // Client-side or generic errors
      console.error('An error occurred:', error);
      this.toastr.error(error.message || 'An unexpected error occurred', 'Error');
    }
  }

  private handleHttpError(error: HttpErrorResponse): void {
    let message = 'An error occurred';
    
    if (error.error instanceof ErrorEvent) {
      // Client-side error
      message = error.error.message;
    } else {
      // Server-side error
      if (error.status === 0) {
        message = 'Unable to connect to the server. Please check your connection.';
      } else if (error.status === 401) {
        message = 'Authentication failed. Please login again.';
      } else if (error.status === 403) {
        message = 'You do not have permission to perform this action.';
      } else if (error.status === 404) {
        message = 'The requested resource was not found.';
      } else if (error.status === 500) {
        message = 'Server error occurred. Please try again later.';
      } else if (error.error?.message) {
        message = error.error.message;
      } else {
        message = `Error: ${error.statusText}`;
      }
    }

    console.error('HTTP Error:', error);
    this.toastr.error(message, `Error ${error.status || ''}`);
  }
}
