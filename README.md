# RateHere - Rate Anything, Discover Everything

A modern, full-featured rating platform built with React, TypeScript, and Firebase.

## Project Info

**Developer**: Govardhan Rajulapati  
**Company**: Dream Team Services  
**Repository**: https://github.com/thedreamteamconsultancy/ratehere

---

## ✨ Features

### 🎯 Core Features
- ✅ **Profile Creation** - Create and manage profiles for any entity
- ✅ **Star Rating System** - 5-star rating with averages
- ✅ **User Authentication** - Google OAuth integration
- ✅ **Leaderboard** - Top-rated profiles with sector filtering
- ✅ **Social Links** - Connect multiple social platforms
- ✅ **Responsive Design** - Mobile-first, works on all devices

### � Reviews & Engagement
- ✅ **Write Reviews** - 250-character reviews with validation
- ✅ **Display Reviews** - Show recent 3 reviews with user info
- ✅ **View All Reviews Modal** - Scrollable list of all reviews
- ✅ **User Avatars** - Display review author photos
- ✅ **Timestamps** - "2 hours ago" format

### 📱 Sharing Features
- ✅ **QR Code Generation** - Scannable codes for profiles
- ✅ **QR Code Download** - Save as PNG
- ✅ **Native Share API** - Use device share dialog
- ✅ **Social Media Sharing** - WhatsApp, Facebook, Twitter, LinkedIn
- ✅ **Email Sharing** - Share via email
- ✅ **Copy Link** - Quick clipboard copy

### 🛡️ Verification System
- ✅ **Verified Badges** - Blue checkmark for verified profiles
- ✅ **Admin Verification Controls** - Verify/unverify profiles
- ✅ **Verification Tabs** - Filter by verified status
- ✅ **Badge Display** - Visible on all profile views
- ✅ **Tooltip Information** - Hover for verification details

### 🔐 Admin Dashboard
- ✅ **Secure Authentication** - Email/password + role-based access
- ✅ **Platform Statistics** - Profiles, ratings, users, averages
- ✅ **Profile Management** - View, verify, and delete profiles
- ✅ **Tab Organization** - All / Unverified / Verified / Recent
- ✅ **Real-time Updates** - Instant UI feedback
- ✅ **Protected Routes** - Admin-only access control

### 🛠️ Admin Panel (Task 7)
- ✅ **Dashboard Overview** - Total Users, Profiles, Ratings, Reviews stats
- ✅ **User Management** - Ban/unban users with reason tracking
- ✅ **User Deactivation** - Temporarily disable accounts
- ✅ **Rating Management** - Delete spam ratings with auto stats update
- ✅ **Profile Verification** - Verify authentic profiles, delete fakes
- ✅ **Cascade Deletion** - Profile delete removes ratings and reviews
- ✅ **System Logs** - Complete audit trail of all admin actions
- ✅ **Sidebar Navigation** - 5 admin pages with responsive mobile menu
- ✅ **Real-time Sync** - Instant updates across management pages

### 📊 Analytics Dashboard
- ✅ **Profile View Tracking** - Count every profile page visit
- ✅ **Social Link Click Tracking** - Platform-specific click analytics
- ✅ **Rating Trend Analysis** - 12-week historical rating charts
- ✅ **Leaderboard Position** - Real-time ranking calculation
- ✅ **Interactive Charts** - Line and bar charts with recharts
- ✅ **Detailed Breakdowns** - Per-platform click performance
- ✅ **Owner-Only Access** - Private analytics for profile owners

### 🌗 Theme System
- ✅ **Dark/Light Mode** - Toggle between themes
- ✅ **System Preference** - Auto-detect OS theme
- ✅ **Smooth Transitions** - 200ms color transitions
- ✅ **Persistent Storage** - Remember user preference
- ✅ **Complete Coverage** - All components theme-aware

### 👤 Username System
- ✅ **Unique Usernames** - Custom usernames for profile URLs
- ✅ **Friendly URLs** - `/profile/username` instead of document IDs
- ✅ **Real-time Validation** - Check availability as you type
- ✅ **Auto-suggestion** - Generate username from name
- ✅ **Case-insensitive** - Prevent duplicate variations
- ✅ **Reserved Words** - Protect system usernames
- ✅ **Backward Compatible** - Old URLs still work

---

## 📚 Documentation

### Complete Guides:
- **[ADMIN_IMPLEMENTATION.md](./ADMIN_IMPLEMENTATION.md)** - Admin system technical docs
- **[ADMIN_QUICK_GUIDE.md](./ADMIN_QUICK_GUIDE.md)** - Quick admin reference
- **[ADMIN_PANEL_GUIDE.md](./ADMIN_PANEL_GUIDE.md)** - Task 7 admin panel comprehensive guide
- **[ADMIN_PANEL_QUICK_REFERENCE.md](./ADMIN_PANEL_QUICK_REFERENCE.md)** - Admin panel quick reference
- **[REVIEWS_IMPLEMENTATION.md](./REVIEWS_IMPLEMENTATION.md)** - Reviews & share system
- **[VERIFICATION_IMPLEMENTATION.md](./VERIFICATION_IMPLEMENTATION.md)** - Verification badge system
- **[VERIFICATION_SUMMARY.md](./VERIFICATION_SUMMARY.md)** - Quick verification guide
- **[ANALYTICS_IMPLEMENTATION.md](./ANALYTICS_IMPLEMENTATION.md)** - Analytics system technical docs
- **[ANALYTICS_QUICK_REFERENCE.md](./ANALYTICS_QUICK_REFERENCE.md)** - Analytics user guide
- **[TASK_5_6_COMPLETION_SUMMARY.md](./TASK_5_6_COMPLETION_SUMMARY.md)** - Social share & theme system
- **[USERNAME_FEATURE_GUIDE.md](./USERNAME_FEATURE_GUIDE.md)** - Username system technical guide
- **[USERNAME_QUICK_REFERENCE.md](./USERNAME_QUICK_REFERENCE.md)** - Username quick reference
- **[USERNAME_IMPLEMENTATION_SUMMARY.md](./USERNAME_IMPLEMENTATION_SUMMARY.md)** - Username feature summary

### Admin Credentials:
See `ADMIN_QUICK_GUIDE.md` for admin access information.

### Admin Panel Access:
See `ADMIN_PANEL_GUIDE.md` for complete admin panel documentation including user management, rating deletion, profile verification, and system logs.

## How can I edit this code?

There are several ways of editing your application.

**Use your preferred IDE**

You can clone this repo and push changes using your favorite IDE.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## 🛠️ Technology Stack

### Frontend:
- **React 18.3.1** - UI framework
- **TypeScript** - Type safety
- **Vite 5.4.20** - Build tool
- **Tailwind CSS** - Styling
- **shadcn/ui** - Component library
- **Lucide React** - Icons

### Backend:
- **Firebase Authentication** - User auth (Google OAuth + Email/Password)
- **Cloud Firestore** - Database
- **Firebase Storage** - File storage

### Key Libraries:
- **qrcode.react** - QR code generation
- **date-fns** - Date formatting
- **sonner** - Toast notifications
- **React Router v6** - Routing

### Development:
- **ESLint** - Code linting
- **PostCSS** - CSS processing
- **SWC** - Fast compilation

## How can I deploy this project?

You can deploy this project using various platforms like:

- Vercel
- Netlify
- GitHub Pages
- Any hosting service that supports React applications

Follow the deployment instructions for your chosen platform.

---

## 🎯 Project Structure

```
rate-here-now/
├── src/
│   ├── components/
│   │   ├── Navigation.tsx          # Main navigation bar
│   │   ├── ProfileCard.tsx         # Profile display card
│   │   ├── StarRating.tsx          # Rating component
│   │   ├── VerifiedBadge.tsx       # Verification badge
│   │   ├── ReviewInput.tsx         # Review writing form
│   │   ├── ReviewsList.tsx         # Recent reviews display
│   │   ├── AllReviewsModal.tsx     # All reviews modal
│   │   ├── ShareButtons.tsx        # QR & share features
│   │   └── ui/                     # shadcn/ui components
│   ├── pages/
│   │   ├── Index.tsx               # Landing page
│   │   ├── Auth.tsx                # User authentication
│   │   ├── CreateProfile.tsx       # Profile creation/edit
│   │   ├── Dashboard.tsx           # User dashboard
│   │   ├── ProfileView.tsx         # Public profile view
│   │   ├── Leaderboard.tsx         # Top profiles
│   │   ├── AdminLogin.tsx          # Admin login
│   │   └── AdminDashboard.tsx      # Admin panel
│   ├── contexts/
│   │   └── AuthContext.tsx         # Auth state management
│   ├── lib/
│   │   ├── firebase.ts             # Firebase config
│   │   └── utils.ts                # Utility functions
│   └── App.tsx                     # Main app component
├── public/
│   └── robots.txt
└── Documentation files (*.md)
```

---

## 🗄️ Database Schema

### Firestore Collections:

#### `profiles`
```javascript
{
  id: string,
  name: string,
  sector: string,
  description: string,
  logoUrl: string,
  socialLinks: array,
  caption: string,
  rating: number,
  ratingCount: number,
  createdBy: string,
  createdAt: timestamp,
  verified: boolean,           // Verification status
  verifiedBy: string          // Admin UID
}
```

#### `ratings`
```javascript
{
  profileId: string,
  userId: string,
  ratingValue: number,         // 1-5
  createdAt: timestamp
}
```

#### `reviews`
```javascript
{
  profileId: string,
  userId: string,
  ratingValue: number,
  reviewText: string,          // Max 250 chars
  timestamp: timestamp,
  userName: string,
  userPhoto: string
}
```

#### `admins`
```javascript
{
  uid: string,
  email: string,
  role: "admin",
  createdAt: timestamp
}
```

---

## 🚀 Quick Start

### Prerequisites:
- Node.js 18+ and npm
- Firebase project with Authentication, Firestore, and Storage enabled
- Google OAuth credentials configured

### Setup Firebase:
1. Create a Firebase project at https://console.firebase.google.com
2. Enable Authentication (Google + Email/Password)
3. Create Firestore database
4. Enable Storage
5. Copy your Firebase config to `src/lib/firebase.ts`

### Environment Setup:
```bash
# Clone the repository
git clone https://github.com/thedreamteamconsultancy/ratehere.git

# Navigate to project
cd ratehere

# Install dependencies
npm install

# Start development server
npm run dev
```

### Admin Setup:
1. Run the app and create your first admin account
2. See `ADMIN_QUICK_GUIDE.md` for detailed instructions
3. Admin credentials available in documentation

---

## 📦 Available Scripts

```bash
# Development server
npm run dev

# Production build
npm run build

# Preview production build
npm run preview

# Lint code
npm run lint
```

---

## 🔒 Security Features

- ✅ Protected admin routes
- ✅ Role-based access control
- ✅ Firebase security rules
- ✅ Input validation
- ✅ XSS protection
- ✅ Secure authentication
- ✅ One review per user per profile
- ✅ Character limits on reviews

---

## 📱 Responsive Design

Fully responsive and mobile-optimized:
- ✅ Mobile-first design approach
- ✅ Touch-friendly interfaces
- ✅ Adaptive layouts
- ✅ Optimized images
- ✅ Fast loading times
- ✅ Progressive enhancement

---

## 🎨 UI/UX Features

- **Dark Mode Support** - Automatic theme switching
- **Smooth Animations** - CSS transitions and transforms
- **Loading States** - Skeleton screens and spinners
- **Toast Notifications** - User feedback for all actions
- **Empty States** - Friendly messages when no data
- **Error Handling** - Graceful error displays
- **Accessible** - ARIA labels and semantic HTML

---

## 🌟 Key Highlights

### For Users:
- Easy profile creation
- Simple rating system
- Write detailed reviews
- Share profiles anywhere
- QR codes for quick access
- See verified profiles
- View leaderboards

### For Admins:
- Comprehensive dashboard
- Verify profiles
- Manage all content
- View platform statistics
- Real-time updates
- Easy profile deletion
- Tab-based organization

### For Developers:
- Clean TypeScript codebase
- Component-based architecture
- Firebase integration
- shadcn/ui components
- Tailwind CSS utilities
- Comprehensive documentation
- Easy to extend

---

## 📊 Features by Release

### Version 1.0.0 - Initial Release
- Profile creation and management
- Star rating system
- User authentication
- Leaderboard
- Social links integration

### Version 2.0.0 - Reviews & Sharing
- Reviews system (250 char limit)
- QR code generation
- Social media sharing
- Native share API
- View all reviews modal

### Version 3.0.0 - Verification System
- Verified badges
- Admin verification controls
- Verification tabs
- Enhanced admin dashboard
- Badge display across platform

---

## 🤝 Contributing

This project is maintained by Dream Team Services. For contributions or inquiries, please contact:

**Email**: thedreamteamservices@gmail.com  
**Developer**: Govardhan Rajulapati  
**Company**: Dream Team Services

---

## 📄 License

This project is proprietary software developed by Dream Team Services.

---

## 🙏 Acknowledgments

Built with:
- React ecosystem
- Firebase platform
- shadcn/ui components
- Tailwind CSS framework
- Lucide icons
- Open source community

---

## 📞 Support

For support, please refer to the documentation files:
- Technical issues: Check implementation guides
- Admin access: See `ADMIN_QUICK_GUIDE.md`
- Feature documentation: See respective `.md` files

---

**Made with ❤️ by Govardhan Rajulapati @ Dream Team Services**
