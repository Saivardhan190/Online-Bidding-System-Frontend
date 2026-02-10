
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { AuthService } from '../../core/services/auth';
import { User } from '../../core/models/user.model';

@Component({
  selector:  'app-profile',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './profile.html',
  styleUrls: ['./profile.scss']
})
export class Profile implements OnInit {
  user:  User | null = null;

  constructor(private authService: AuthService) {}

  ngOnInit(): void {
    this.user = this.authService.getUser();
  }

  getRoleBadgeClass(): string {
    switch (this.user?. role) {
      case 'ADMIN':  return 'bg-purple-100 text-purple-800';
      case 'BIDDER': return 'bg-green-100 text-green-800';
      default: return 'bg-blue-100 text-blue-800';
    }
  }

  getRoleIcon(): string {
    switch (this.user?.role) {
      case 'ADMIN': return '👑';
      case 'BIDDER': return '🎯';
      default: return '👤';
    }
  }
}