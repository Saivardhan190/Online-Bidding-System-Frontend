import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth';
import { adminGuard } from './core/guards/admin.guard';
import { bidderGuard } from './core/guards/bidder.guard';
import { guestGuard } from './core/guards/guest.guard';

export const routes: Routes = [
  // ✅ PUBLIC ROUTES (No guard - accessible to everyone)
  { path: '', redirectTo: 'home', pathMatch: 'full' },
  {
    path: 'home',
    loadComponent: () => import('./features/home/home').then(m => m.Home)
    // No guard - accessible to everyone (logged in or not)
  },

  // ✅ AUTH ROUTES (Only for non-logged-in users)
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login').then(m => m.Login),
    canActivate: [guestGuard]  // ✅ Redirects to dashboard if already logged in
  },
  {
    path: 'signup',
    loadComponent: () => import('./features/auth/signup/signup').then(m => m.Signup),
    canActivate: [guestGuard]  // ✅ Redirects to dashboard if already logged in
  },
  {
    path: 'verify-otp',
    loadComponent: () => import('./features/auth/verify-otp/verify-otp').then(m => m.VerifyOtp)
    // No guard - needed for email verification
  },
  {
    path: 'forgot-password',
    loadComponent: () => import('./features/auth/forgot-password/forgot-password').then(m => m.ForgotPassword),
    canActivate: [guestGuard]
  },
  {
    path: 'reset-password',
    loadComponent:  () => import('./features/auth/reset-password/reset-password').then(m => m.ResetPassword)
    // No guard - needed for password reset flow
  },

  // ✅ PROTECTED ROUTES (Requires login)
  {
    path: 'dashboard',
    loadComponent: () => import('./features/dashboard/user-dashboard/user-dashboard').then(m => m.UserDashboard),
    canActivate: [authGuard]
  },
  {
    path: 'profile',
    loadComponent: () => import('./features/profile/profile').then(m => m.Profile),
    canActivate: [authGuard]
  },
  {
    path: 'profile/edit',
    loadComponent: () => import('./features/profile/edit-profile/edit-profile').then(m => m.EditProfile),
    canActivate: [authGuard]
  },
  {
    path: 'stalls',
    loadComponent: () => import('./features/stalls/stall-list/stall-list').then(m => m.StallList),
    canActivate: [authGuard]
  },
  {
    path: 'stalls/:id',
    loadComponent: () => import('./features/stalls/stall-detail/stall-detail').then(m => m.StallDetail),
    canActivate:  [authGuard]
  },
  {
    path:  'my-bids',
    loadComponent: () => import('./features/dashboard/my-bids/my-bids').then(m => m.MyBids),
    canActivate: [authGuard]
  },

  // Bidder Application
  {
    path:  'bidder-application/apply',
    loadComponent: () => import('./features/bidder-application/apply/apply').then(m => m.Apply),
    canActivate: [authGuard]
  },
  {
    path: 'bidder-application/status',
    loadComponent:  () => import('./features/bidder-application/status/status').then(m => m.Status),
    canActivate: [authGuard]
  },

  // Live Bidding (Bidders Only)
  {
    path: 'live-bidding/:id',
    loadComponent: () => import('./features/stalls/live-bidding/live-bidding').then(m => m.LiveBidding),
    canActivate: [bidderGuard]
  },

  // Admin Routes
  {
    path: 'admin',
    loadComponent: () => import('./features/admin/admin-dashboard/admin-dashboard').then(m => m.AdminDashboard),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/applications',
    loadComponent: () => import('./features/admin/manage-applications/manage-applications').then(m => m.ManageApplications),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/stalls',
    loadComponent: () => import('./features/admin/manage-stalls/manage-stalls').then(m => m.ManageStalls),
    canActivate:  [adminGuard]
  },
  {
    path:  'admin/stalls/create',
    loadComponent: () => import('./features/admin/create-stall/create-stall').then(m => m. CreateStall),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/users',
    loadComponent: () => import('./features/admin/manage-users/manage-users').then(m => m.ManageUsers),
    canActivate: [adminGuard]
  },
  {
    path: 'admin/results',
    loadComponent: () => import('./features/admin/bidding-results/bidding-results').then(m => m. BiddingResults),
    canActivate: [adminGuard]
  },
  // Add this route
  {
    path: 'oauth/callback',
    loadComponent: () => import('./features/auth/oauth-callback/oauth-callback').then(m => m.OAuthCallback)
  },

  // Fallback - redirect unknown routes to home
  { path: '**', redirectTo: 'home' }
];