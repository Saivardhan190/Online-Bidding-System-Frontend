import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { Subscription } from 'rxjs';
import { StallService } from '../../../core/services/stall';
import { BidService } from '../../../core/services/bid';
import { CommentService, Comment } from '../../../core/services/comment';
import { WebSocketService } from '../../../core/services/websocket';
import { AuthService } from '../../../core/services/auth';
import { Stall } from '../../../core/models/stall.model';
import { Bid } from '../../../core/models/bid.model';
import { User } from '../../../core/models/user.model';

@Component({
  selector: 'app-live-bidding',
  standalone: true,
  imports:  [CommonModule, FormsModule, RouterLink],
  templateUrl: './live-bidding.html',
  styleUrls:  ['./live-bidding.scss']
})
export class LiveBidding implements OnInit, OnDestroy {
  stall:  Stall | null = null;
  user: User | null = null;
  bidHistory: Bid[] = [];
  comments: Comment[] = [];
  isLoading = true;
  error = '';
  activeTab = 'bids'; // 'bids' or 'comments'
  
  // Bidding
  bidAmount: number = 0;
  minBidAmount: number = 0;
  isBidding = false;
  bidError = '';
  bidSuccess = '';
  
  // Comments
  newComment = '';
  isPostingComment = false;
  
  // Timer
  timeRemaining = '';
  timerInterval: any;
  isAuctionEnded = false;
  
  // WebSocket
  private wsSubscription?:  Subscription;
  private commentSubscription?: Subscription;

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private stallService: StallService,
    private bidService: BidService,
    private commentService: CommentService,
    private wsService: WebSocketService,
    private authService: AuthService
  ) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
    
    const stallId = this. route.snapshot.paramMap.get('id');
    if (stallId) {
      this.loadStall(parseInt(stallId));
      this.loadComments(parseInt(stallId));
      this.connectWebSocket(parseInt(stallId));
    }
  }

  ngOnDestroy(): void {
    if (this. timerInterval) {
      clearInterval(this.timerInterval);
    }
    if (this.wsSubscription) {
      this.wsSubscription.unsubscribe();
    }
    if (this.commentSubscription) {
      this. commentSubscription.unsubscribe();
    }
    this.wsService.disconnect();
  }

  loadStall(stallId: number): void {
    this.isLoading = true;
    
    this.stallService.getStallById(stallId).subscribe({
      next: (stall:  Stall) => {
        this. stall = stall;
        this. minBidAmount = (stall.currentHighestBid || stall.basePrice) + 100;
        this. bidAmount = this.minBidAmount;
        this. startTimer();
        this.loadBidHistory(stallId);
        this.isLoading = false;
      },
      error: (error:  any) => {
        console.error('Error loading stall:', error);
        this.error = 'Failed to load auction details';
        this.isLoading = false;
      }
    });
  }

  loadBidHistory(stallId: number): void {
    this.bidService.getBidHistory(stallId).subscribe({
      next: (bids: Bid[]) => {
        this.bidHistory = bids. slice(0, 10);
      },
      error:  (error: any) => {
        console.error('Error loading bid history:', error);
        this.bidHistory = [];
      }
    });
  }

  loadComments(stallId:  number): void {
    this.commentService.getCommentsByStall(stallId).subscribe({
      next: (comments:  Comment[]) => {
        this.comments = comments;
      },
      error:  (error: any) => {
        console.error('Error loading comments:', error);
        this.comments = [];
      }
    });
  }

  connectWebSocket(stallId: number): void {
    this.wsService. connect(stallId);
    
    this.wsSubscription = this. wsService.getBidUpdates().subscribe({
      next:  (bid: Bid) => {
        this. handleNewBid(bid);
      },
      error: (error:  any) => {
        console.error('WebSocket error:', error);
      }
    });
  }

  handleNewBid(bid: Bid): void {
    if (! this.stall) return;
    
    this. stall.currentHighestBid = bid. biddedPrice;
    this. stall.totalBids = (this.stall. totalBids || 0) + 1;
    
    this.minBidAmount = bid.biddedPrice + 100;
    if (this.bidAmount < this.minBidAmount) {
      this.bidAmount = this.minBidAmount;
    }
    
    this.bidHistory.unshift(bid);
    if (this.bidHistory.length > 10) {
      this.bidHistory.pop();
    }
  }

  placeBid(): void {
    if (!this.stall || !this.user || this.isBidding) return;
    
    if (this.bidAmount < this.minBidAmount) {
      this.bidError = `Minimum bid amount is ₹${this. minBidAmount}`;
      return;
    }
    
    this.isBidding = true;
    this.bidError = '';
    this.bidSuccess = '';

    const bidRequest = {
      stallId: this.stall.stallId,
      bidderId: this.user. studentId,
      biddedPrice: this.bidAmount
    };

    this.bidService.placeBid(bidRequest).subscribe({
      next: () => {
        this.isBidding = false;
        this. bidSuccess = 'Bid placed successfully! ';
        this. bidAmount = this.minBidAmount + 100;
        setTimeout(() => this.bidSuccess = '', 3000);
      },
      error: (error: any) => {
        this. isBidding = false;
        this.bidError = error.error?.message || 'Failed to place bid. ';
      }
    });
  }

  postComment(): void {
    if (!this. stall || !this.user || ! this.newComment. trim() || this.isPostingComment) return;

    this.isPostingComment = true;

    this.commentService.addComment({
      stallId: this.stall.stallId,
      commentText: this.newComment. trim()
    }).subscribe({
      next: (comment: Comment) => {
        this. comments.unshift(comment);
        this.newComment = '';
        this.isPostingComment = false;
      },
      error:  (error: any) => {
        console.error('Error posting comment:', error);
        this.isPostingComment = false;
      }
    });
  }

  deleteComment(commentId:  number): void {
    this.commentService.deleteComment(commentId).subscribe({
      next: () => {
        this. comments = this.comments.filter(c => c.commentId !== commentId);
      },
      error: (error: any) => {
        console.error('Error deleting comment:', error);
      }
    });
  }

  isMyComment(comment: Comment): boolean {
    return comment. userId === this.user?. studentId;
  }

  startTimer(): void {
    if (! this.stall?. biddingEnd) return;
    this.updateTimer();
    this.timerInterval = setInterval(() => this.updateTimer(), 1000);
  }

  updateTimer(): void {
    if (! this.stall?. biddingEnd) return;
    
    const endTime = new Date(this.stall. biddingEnd).getTime();
    const now = new Date().getTime();
    const diff = endTime - now;
    
    if (diff <= 0) {
      this.timeRemaining = 'Auction Ended';
      this.isAuctionEnded = true;
      clearInterval(this. timerInterval);
      return;
    }
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math. floor((diff % (1000 * 60)) / 1000);
    
    this.timeRemaining = `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
  }

  incrementBid(amount: number): void {
    this.bidAmount += amount;
  }

  formatTime(dateStr: string): string {
    if (! dateStr) return '';
    return new Date(dateStr).toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  isMyBid(bid: Bid): boolean {
    return bid.bidderId === this.user?. studentId;
  }

  getBidAmount(bid: Bid): number {
    return bid.biddedPrice || 0;
  }

  getBidderName(bid:  Bid): string {
    if (this.isMyBid(bid)) return 'You';
    return bid.bidderName || 'Bidder';
  }

  getUserInitial(name: string): string {
    return name?. charAt(0)?.toUpperCase() || 'U';
  }
}