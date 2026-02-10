# BidMart - Online Bidding System Frontend

A fully functional Angular-based frontend for the Online Bidding System, featuring real-time bidding, user authentication, and comprehensive admin controls.

This project was generated using [Angular CLI](https://github.com/angular/angular-cli) version 20.3.2.

## 🚀 Features

### Authentication & Authorization
- ✅ Email/Password authentication
- ✅ Google OAuth integration
- ✅ OTP email verification
- ✅ Password reset functionality
- ✅ Role-based access control (User, Bidder, Admin)
- ✅ JWT token-based authentication

### User Features
- ✅ User dashboard with statistics
- ✅ Profile management
- ✅ Bidder application system
- ✅ View available stalls
- ✅ Track personal bids
- ✅ Real-time bidding with WebSocket

### Admin Features
- ✅ Admin dashboard with analytics
- ✅ Stall management (Create, Update, Delete)
- ✅ User management
- ✅ Bidder application approval
- ✅ Bidding results viewing
- ✅ System-wide statistics

### Real-time Features
- ✅ Live bidding with WebSocket
- ✅ Real-time bid updates
- ✅ Live comments on stalls
- ✅ Automatic bid refresh

### UI/UX Enhancements
- ✅ Toast notifications for user feedback
- ✅ Loading spinners
- ✅ Responsive design with Tailwind CSS
- ✅ Form validation
- ✅ Error handling

## 🛠️ Tech Stack

- **Framework**: Angular 20.3
- **Styling**: Tailwind CSS 3.4
- **HTTP Client**: Angular HttpClient with interceptors
- **Real-time**: WebSocket (STOMP + SockJS)
- **Notifications**: ngx-toastr
- **Alerts**: SweetAlert2
- **State Management**: Angular Signals
- **Forms**: Reactive Forms

## 📋 Prerequisites

- Node.js (v18 or higher)
- npm (v9 or higher)
- Angular CLI (`npm install -g @angular/cli`)

## 🔧 Installation

1. Clone the repository:
```bash
git clone https://github.com/Saivardhan190/Online-Bidding-System-Frontend.git
cd Online-Bidding-System-Frontend
```

2. Install dependencies:
```bash
npm install
```

3. Configure environment:
   - Development: `src/environments/environment.ts`
   - Production: `src/environments/environment.prod.ts`

Update the API URLs to match your backend:
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080/api',
  wsUrl: 'http://localhost:8080/ws-bidding',
  googleOAuthUrl: 'http://localhost:8080/oauth2/authorization/google'
};
```

## 🚀 Development server

To start a local development server, run:

```bash
ng serve
```

Once the server is running, open your browser and navigate to `http://localhost:4200/`. The application will automatically reload whenever you modify any of the source files.

## 🏗️ Building

To build the project run:

```bash
ng build
```

This will compile your project and store the build artifacts in the `dist/` directory. By default, the production build optimizes your application for performance and speed.

For production build:
```bash
ng build --configuration=production
```

## 🧪 Running unit tests

To execute unit tests with the [Karma](https://karma-runner.github.io) test runner, use the following command:

```bash
ng test
```

## 📁 Project Structure

```
src/
├── app/
│   ├── core/                    # Core services, guards, interceptors
│   │   ├── guards/              # Route guards (auth, admin, bidder)
│   │   ├── interceptors/        # HTTP interceptors
│   │   ├── models/              # TypeScript interfaces/models
│   │   └── services/            # API services
│   ├── features/                # Feature modules
│   │   ├── auth/                # Authentication pages
│   │   ├── admin/               # Admin pages
│   │   ├── dashboard/           # User dashboard
│   │   ├── stalls/              # Stall management & bidding
│   │   ├── profile/             # User profile
│   │   └── bidder-application/  # Bidder application
│   ├── shared/                  # Shared components
│   └── app.routes.ts            # Application routes
├── environments/                # Environment configurations
└── styles.scss                  # Global styles
```

## 🔐 Authentication Flow

1. **Sign Up**: User registers with email and personal details
2. **Email Verification**: OTP sent to email for verification
3. **Login**: User logs in with verified credentials
4. **Authorization**: JWT token stored and sent with each request
5. **Role-based Access**: Routes protected based on user role

## 🎯 User Roles

- **Guest**: Can view home page only
- **User**: Can view stalls, apply for bidder status
- **Bidder**: Can participate in live bidding
- **Admin**: Full system access and management

## 🔄 API Integration

The frontend connects to a Spring Boot backend. Update the `environment.ts` file with your backend URL:

```typescript
apiUrl: 'http://localhost:8080/api'  // Your backend URL
```

## 🌐 Routes

### Public Routes
- `/` - Home page
- `/login` - Login page
- `/signup` - Registration page
- `/verify-otp` - Email verification
- `/forgot-password` - Password recovery
- `/reset-password` - Password reset

### Protected Routes (Authenticated Users)
- `/dashboard` - User dashboard
- `/profile` - User profile
- `/stalls` - Browse stalls
- `/my-bids` - View personal bids
- `/bidder-application/apply` - Apply for bidder status
- `/bidder-application/status` - Check application status

### Bidder Routes
- `/live-bidding/:id` - Live bidding interface

### Admin Routes
- `/admin` - Admin dashboard
- `/admin/stalls` - Manage stalls
- `/admin/applications` - Manage bidder applications
- `/admin/users` - Manage users
- `/admin/results` - View bidding results

## 🎨 Styling

This project uses Tailwind CSS for styling. The configuration is in `tailwind.config.js`.

Custom utility classes are available in `styles.scss`:
- `.btn-primary`, `.btn-secondary`, `.btn-danger`, etc.
- `.input-field`, `.input-error`
- `.card`, `.card-hover`
- `.badge`, `.badge-success`, `.badge-warning`, etc.

## 📦 Dependencies

Key dependencies:
- `@angular/core`: ^20.3.0
- `@angular/router`: ^20.3.0
- `@angular/forms`: ^20.3.0
- `ngx-toastr`: ^19.1.0
- `sweetalert2`: ^11.26.17
- `@stomp/stompjs`: ^7.2.1
- `sockjs-client`: ^1.6.1
- `tailwindcss`: ^3.4.19

## 🤝 Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License.

## 👥 Authors

- Saivardhan190

## 📧 Support

For support, email your-email@example.com or open an issue in the repository.

## Additional Resources

For more information on using the Angular CLI, including detailed command references, visit the [Angular CLI Overview and Command Reference](https://angular.dev/tools/cli) page.
