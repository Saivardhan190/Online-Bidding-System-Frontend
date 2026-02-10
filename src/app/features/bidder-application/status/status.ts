import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../../core/services/auth';
import { BidderApplicationService } from '../../../core/services/bidder-application';

@Component({
  selector:  'app-status',
  standalone:  true,
  imports: [CommonModule, RouterLink],
  templateUrl: './status.html',
  styleUrls: ['./status.scss']
})
export class Status implements OnInit {
  status: string = 'NOT_APPLIED';
  isLoading = true;
  errorMessage = '';

  constructor(
    private authService:  AuthService,
    private applicationService: BidderApplicationService
  ) {}

  ngOnInit(): void {
    this.checkStatus();
  }

  checkStatus(): void {
    const user = this.authService.getUser();
    if (! user) {
      this.isLoading = false;
      return;
    }

    // Check user role first
    if (user.role === 'BIDDER') {
      this.status = 'APPROVED';
      this. isLoading = false;
      return;
    }

    // Check application status
    this. applicationService.getStatusByEmail(user.studentEmail).subscribe({
      next: (response) => {
        this.status = response.status || 'NOT_APPLIED';
        this.isLoading = false;
      },
      error: () => {
        // Mock status for testing
        this.status = 'PENDING';
        this. isLoading = false;
      }
    });
  }

  getStatusConfig(): { icon: string; title: string; message: string; bgColor: string; iconBg: string } {
    switch (this.status) {
      case 'PENDING':
        return {
          icon: '⏳',
          title: 'Application Under Review',
          message: 'Your bidder application is being reviewed by our admin team.  You will receive an email notification once a decision is made.  This usually takes 24-48 hours.',
          bgColor:  'bg-yellow-50',
          iconBg: 'bg-yellow-100'
        };
      case 'APPROVED':
        return {
          icon:  '🎉',
          title: 'Application Approved!',
          message: 'Congratulations! Your bidder application has been approved. You can now participate in live stall auctions and place bids.',
          bgColor: 'bg-green-50',
          iconBg: 'bg-green-100'
        };
      case 'REJECTED':
        return {
          icon: '😔',
          title:  'Application Rejected',
          message:  'Unfortunately, your bidder application was not approved. If you believe this was a mistake, please contact our support team.',
          bgColor: 'bg-red-50',
          iconBg: 'bg-red-100'
        };
      default:
        return {
          icon:  '📝',
          title:  'No Application Found',
          message:  'You haven\'t submitted a bidder application yet.  Apply now to start participating in stall auctions!',
          bgColor:  'bg-gray-50',
          iconBg: 'bg-gray-100'
        };
    }
  }
}