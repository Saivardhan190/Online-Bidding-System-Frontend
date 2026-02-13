import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-countdown-timer',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="countdown-timer" [ngClass]="getTimerClass()">
      <div class="flex items-center gap-2">
        <span class="text-lg">{{ getIcon() }}</span>
        <div>
          <p class="text-xs font-medium opacity-80">{{ getLabel() }}</p>
          <p class="text-lg font-bold font-mono" [ngClass]="getTextColorClass()">
            {{ timeDisplay }}
          </p>
        </div>
      </div>
    </div>
  `,
  styles: [`
    .countdown-timer {
      @apply px-4 py-2 rounded-lg transition-all duration-300;
    }
    .timer-upcoming {
      @apply bg-blue-50 text-blue-800 border border-blue-200;
    }
    .timer-active {
      @apply bg-green-50 text-green-800 border border-green-200;
    }
    .timer-urgent {
      @apply bg-red-50 text-red-800 border border-red-200 animate-pulse;
    }
    .timer-ended {
      @apply bg-gray-100 text-gray-600;
    }
    .timer-pending {
      @apply bg-yellow-50 text-yellow-800 border border-yellow-200;
    }
  `]
})
export class CountdownTimer implements OnInit, OnDestroy {
  @Input() startDate!: string | null;
  @Input() endDate!: string | null;
  @Input() status!: string;
  
  timeDisplay = 'Loading...';
  private intervalId: any;
  private isUrgent = false;
  private hasEnded = false;
  private isPending = false; // ✅ New flag for null dates

  ngOnInit(): void {
    this.updateTimer();
    // Update every second
    this.intervalId = setInterval(() => this.updateTimer(), 1000);
  }

  ngOnDestroy(): void {
    if (this.intervalId) {
      clearInterval(this.intervalId);
    }
  }

  private updateTimer(): void {
    const now = new Date().getTime();
    
    // For AVAILABLE stalls, count down to start time
    if (this.status === 'AVAILABLE') {
      // ✅ Handle null/undefined start date
      if (!this.startDate || this.startDate === 'null') {
        this.timeDisplay = 'Not Scheduled';
        this.isPending = true;
        this.hasEnded = false;
        return;
      }
      
      const start = new Date(this.startDate).getTime();
      
      if (isNaN(start)) {
        this.timeDisplay = 'Invalid Date';
        this.isPending = true;
        return;
      }
      
      const timeLeft = start - now;
      
      if (timeLeft > 0) {
        this.timeDisplay = this.formatTime(timeLeft);
        this.isUrgent = timeLeft < 3600000; // Less than 1 hour
        this.hasEnded = false;
        this.isPending = false;
      } else {
        this.timeDisplay = 'Starting soon...';
        this.hasEnded = false;
        this.isPending = false;
      }
    }
    // For ACTIVE stalls, count down to end time
    else if (this.status === 'ACTIVE') {
      // ✅ Handle null/undefined end date
      if (!this.endDate || this.endDate === 'null') {
        this.timeDisplay = 'No End Time';
        this.isPending = true;
        this.hasEnded = false;
        return;
      }
      
      const end = new Date(this.endDate).getTime();
      
      if (isNaN(end)) {
        this.timeDisplay = 'Invalid Date';
        this.isPending = true;
        return;
      }
      
      const timeLeft = end - now;
      
      if (timeLeft > 0) {
        this.timeDisplay = this.formatTime(timeLeft);
        this.isUrgent = timeLeft < 3600000; // Less than 1 hour
        this.hasEnded = false;
        this.isPending = false;
      } else {
        this.timeDisplay = 'Ended';
        this.hasEnded = true;
        this.isPending = false;
      }
    }
    // For CLOSED stalls
    else if (this.status === 'CLOSED') {
      this.timeDisplay = 'Closed';
      this.hasEnded = true;
      this.isPending = false;
    }
    // Unknown status
    else {
      this.timeDisplay = 'TBD';
      this.isPending = true;
    }
  }

  private formatTime(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    } else if (hours > 0) {
      const remainingMinutes = minutes % 60;
      return `${hours}h ${remainingMinutes}m`;
    } else if (minutes > 0) {
      const remainingSeconds = seconds % 60;
      return `${minutes}m ${remainingSeconds}s`;
    } else {
      return `${seconds}s`;
    }
  }

  getLabel(): string {
    if (this.isPending) {
      return 'Schedule';
    }
    if (this.status === 'AVAILABLE') {
      return 'Starts in';
    } else if (this.status === 'ACTIVE') {
      return this.isUrgent ? '⚠️ Ends in' : 'Ends in';
    } else if (this.status === 'CLOSED') {
      return 'Auction';
    }
    return 'Status';
  }

  getIcon(): string {
    if (this.isPending) {
      return '📅';
    }
    if (this.status === 'AVAILABLE') {
      return '🕐';
    } else if (this.status === 'ACTIVE') {
      return this.isUrgent ? '⏰' : '🟢';
    } else if (this.status === 'CLOSED') {
      return '⚫';
    }
    return '📅';
  }

  getTimerClass(): string {
    if (this.isPending) {
      return 'timer-pending';
    }
    if (this.hasEnded) {
      return 'timer-ended';
    } else if (this.isUrgent) {
      return 'timer-urgent';
    } else if (this.status === 'ACTIVE') {
      return 'timer-active';
    } else if (this.status === 'AVAILABLE') {
      return 'timer-upcoming';
    }
    return '';
  }

  getTextColorClass(): string {
    if (this.isPending) {
      return 'text-yellow-700';
    }
    if (this.hasEnded) {
      return 'text-gray-600';
    } else if (this.isUrgent) {
      return 'text-red-700';
    } else if (this.status === 'ACTIVE') {
      return 'text-green-700';
    } else if (this.status === 'AVAILABLE') {
      return 'text-blue-700';
    }
    return 'text-gray-700';
  }
}