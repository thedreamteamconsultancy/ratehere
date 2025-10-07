# Admin Panel Guide

## Overview

The Admin Panel provides a comprehensive control center for managing the RateHereNow platform. This Task 7 implementation includes a complete admin interface with sidebar navigation, real-time data synchronization, and system logging capabilities.

### Key Features

- **Dashboard Overview**: Statistics on users, profiles, ratings, and reviews
- **User Management**: Ban/unban and activate/deactivate user accounts
- **Rating Management**: Delete spam or inappropriate ratings
- **Profile Verification**: Verify authentic profiles and delete fake ones
- **System Logs**: Track all admin actions for accountability

---

## Architecture

### Component Structure

```
AdminLayout (Wrapper)
├── AdminSidebar (Navigation)
└── Page Content (Dashboard, Users, Ratings, Profiles, Logs)
```

### Files

- **`src/lib/systemLogs.ts`**: System logging utility (98 lines)
- **`src/components/AdminSidebar.tsx`**: Navigation sidebar (133 lines)
- **`src/components/AdminLayout.tsx`**: Layout wrapper (19 lines)
- **`src/pages/AdminDashboard.tsx`**: Dashboard overview (265 lines)
- **`src/pages/ManageUsers.tsx`**: User management (447 lines)
- **`src/pages/ManageRatings.tsx`**: Rating management (328 lines)
- **`src/pages/ManageProfiles.tsx`**: Profile management (368 lines)
- **`src/pages/SystemLogs.tsx`**: System logs viewer (300+ lines)

### Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin` | AdminDashboard | Dashboard overview with stats |
| `/admin/users` | ManageUsers | User ban/deactivate management |
| `/admin/ratings` | ManageRatings | Delete spam ratings |
| `/admin/profiles` | ManageProfiles | Profile verification and deletion |
| `/admin/logs` | SystemLogs | View all admin action logs |

All routes are protected with `ProtectedRoute requireAdmin` wrapper.

---

## 1. Dashboard Overview

**Route**: `/admin`

### Statistics Displayed

1. **Total Users**: Count of registered users (from `users` collection or unique profile creators)
2. **Total Profiles**: Count of all business profiles created
3. **Total Ratings**: Count of all ratings submitted
4. **Total Reviews**: Count of all written reviews
5. **Average Rating**: Average rating across all profiles
6. **System Status**: Shows "Operational" (green) or error states

### Quick Actions

Four card links to:
- Manage Users (`/admin/users`)
- Manage Ratings (`/admin/ratings`)
- Verify Profiles (`/admin/profiles`)
- View System Logs (`/admin/logs`)

### Data Fetching

```typescript
// Profiles
const profilesSnapshot = await getDocs(collection(db, 'profiles'));
const totalProfiles = profilesSnapshot.size;

// Ratings
const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
const totalRatings = ratingsSnapshot.size;

// Reviews
const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
const totalReviews = reviewsSnapshot.size;

// Users (with fallback)
const usersSnapshot = await getDocs(collection(db, 'users'));
const totalUsers = usersSnapshot.size || uniqueCreatorCount;
```

### Use Cases

- **Morning Check**: Admins start their day by viewing dashboard stats
- **Monitoring**: Quick overview of platform growth (Total Users, Total Profiles)
- **Quality Check**: Monitor Average Rating to detect rating issues
- **Navigation**: Use Quick Actions to jump to management pages

---

## 2. Manage Users

**Route**: `/admin/users`

### Features

#### View Users
- Table display with columns: Email, Display Name, Status, Created At, Actions
- Search functionality (filters by email or display name)
- Stats cards: Total Users, Active Users, Banned Users

#### Ban User
1. Click "Ban" button next to user
2. Alert dialog opens with reason input field
3. Enter ban reason (e.g., "Spam accounts", "Violation of terms")
4. Confirm action
5. User status updated to "Banned" (red badge)
6. Action logged to systemLogs

#### Unban User
1. Click "Unban" button next to banned user
2. Confirmation dialog appears
3. Confirm action
4. User status reverted to "Active" (green badge)
5. Action logged to systemLogs

#### Deactivate User
1. Click "Deactivate" button next to active user
2. Confirmation dialog appears
3. Confirm action
4. User status updated to "Deactivated" (gray badge)
5. User cannot log in until reactivated
6. Action logged to systemLogs

#### Activate User
1. Click "Activate" button next to deactivated user
2. Confirmation dialog appears
3. Confirm action
4. User status reverted to "Active" (green badge)
5. User can log in again
6. Action logged to systemLogs

### Database Operations

#### Users Collection Structure

```typescript
{
  uid: string, // Firebase Auth UID
  email: string,
  displayName: string,
  photoURL?: string,
  createdAt: Timestamp,
  status: 'active' | 'banned' | 'deactivated',
  bannedAt?: Timestamp,
  bannedBy?: string, // Admin UID
  bannedReason?: string
}
```

#### Ban User Update

```typescript
await updateDoc(doc(db, 'users', userId), {
  status: 'banned',
  bannedAt: serverTimestamp(),
  bannedBy: adminUid,
  bannedReason: reason
});

await logAdminAction(
  LOG_ACTIONS.USER_BANNED,
  'user',
  adminUid,
  adminEmail,
  userId,
  userEmail,
  `Reason: ${reason}`
);
```

#### Unban User Update

```typescript
await updateDoc(doc(db, 'users', userId), {
  status: 'active',
  bannedAt: deleteField(),
  bannedBy: deleteField(),
  bannedReason: deleteField()
});

await logAdminAction(
  LOG_ACTIONS.USER_UNBANNED,
  'user',
  adminUid,
  adminEmail,
  userId,
  userEmail
);
```

### Status Meanings

- **Active** (Green badge): Normal user, can log in and use platform
- **Banned** (Red badge): User violated terms, cannot log in, can view ban reason
- **Deactivated** (Gray badge): Temporarily disabled, admin can reactivate

### Use Cases

- **Spam Prevention**: Ban users creating fake profiles or spam ratings
- **Temporary Suspension**: Deactivate users pending investigation
- **Account Recovery**: Unban users after appeal or mistake
- **User Support**: Check user status when handling support tickets

### Important Notes

⚠️ **Banning a user does NOT delete their data** (profiles, ratings, reviews). To completely remove a user, you must:
1. Ban the user
2. Navigate to Manage Profiles
3. Delete all their profiles (which cascade deletes ratings and reviews)

---

## 3. Manage Ratings

**Route**: `/admin/ratings`

### Features

#### View Ratings
- Table display with columns: Profile Name, User Email, Rating (stars), Date, Actions
- Search functionality (filters by profile name, user email, or profile ID)
- Stats cards: Total Ratings, Average Rating
- Star display (5-star visual with yellow filled stars)

#### Delete Rating
1. Click "Delete" button next to rating
2. Confirmation dialog appears with warning: **"This action will permanently delete this rating and update the profile's rating statistics. This cannot be undone."**
3. Confirm action
4. Rating document deleted from `ratings` collection
5. Parent profile statistics automatically recalculated:
   - `ratingCount` decreased by 1
   - `totalRatingValue` decreased by deleted rating value
   - `rating` (average) recalculated
6. Action logged to systemLogs with rating value
7. Toast notification: "Rating deleted successfully"

### Database Operations

#### Ratings Collection Structure

```typescript
{
  id: string, // Auto-generated
  profileId: string, // Reference to profile
  userId: string, // User who rated
  ratingValue: number, // 1-5 stars
  createdAt: Timestamp
}
```

#### Delete Rating Flow

```typescript
// 1. Get current profile stats
const profileDoc = await getDoc(doc(db, 'profiles', profileId));
const currentRatingCount = profileDoc.data().ratingCount || 0;
const currentTotalValue = profileDoc.data().totalRatingValue || 0;

// 2. Calculate new stats
const newRatingCount = Math.max(0, currentRatingCount - 1);
const newTotalValue = Math.max(0, currentTotalValue - deletedRatingValue);
const newRating = newRatingCount > 0 ? newTotalValue / newRatingCount : 0;

// 3. Update profile
await updateDoc(doc(db, 'profiles', profileId), {
  ratingCount: newRatingCount,
  totalRatingValue: newTotalValue,
  rating: newRating
});

// 4. Delete rating
await deleteDoc(doc(db, 'ratings', ratingId));

// 5. Log action
await logAdminAction(
  LOG_ACTIONS.RATING_DELETED,
  'rating',
  adminUid,
  adminEmail,
  ratingId,
  profileName,
  `Rating: ${ratingValue} stars`
);
```

### Star Display Logic

```typescript
// Display 5 stars, fill based on rating value
{Array.from({ length: 5 }).map((_, i) => (
  <Star
    key={i}
    className={`w-4 h-4 ${
      i < rating.ratingValue ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'
    }`}
  />
))}
```

### Use Cases

- **Spam Detection**: Delete fake ratings from bot accounts
- **Review Manipulation**: Remove coordinated rating attacks (multiple 1-star or 5-star ratings from suspicious accounts)
- **Data Integrity**: Clean up ratings for deleted or banned users
- **Dispute Resolution**: Handle user reports of incorrect ratings

### Important Notes

⚠️ **Critical**: Deleting a rating is **permanent** and cannot be undone. Always verify:
- The rating is actually spam/fake
- The user who left the rating is not legitimate
- The profile stats will be correctly recalculated

✅ **Profile stats are automatically updated** when you delete a rating. No manual calculation needed.

---

## 4. Verify Profiles

**Route**: `/admin/profiles`

### Features

#### View Profiles
- Table display with columns: Logo (thumbnail), Name, Sector, Rating, Verified, Actions
- Tabs: All, Unverified, Verified, Recent (20 most recent)
- Search functionality (filters by profile name or sector)
- Stats cards: Total Profiles, Verified Profiles, Unverified Profiles, Average Rating

#### Verify Profile
1. Navigate to profile in table
2. Click "Verify" button (green badge shows "Verified")
3. Profile `verified` field set to `true`
4. Profile `verifiedBy` field set to admin UID
5. Action logged to systemLogs
6. Verified badge appears on profile card in public views

#### Unverify Profile
1. Click "Unverify" button on verified profile
2. Profile `verified` field set to `false`
3. Profile `verifiedBy` field cleared
4. Action logged to systemLogs

#### Delete Profile
1. Click "Delete" button (red destructive button)
2. Confirmation dialog appears with warning: **"This will permanently delete the profile and all its ratings and reviews. This action cannot be undone."**
3. Confirm action
4. **Cascade deletion sequence**:
   - Delete all ratings where `profileId` matches (ratings collection)
   - Delete all reviews where `profileId` matches (reviews collection)
   - Delete profile document
5. Action logged to systemLogs
6. Toast notification: "Profile deleted successfully"

### Database Operations

#### Profiles Collection Structure

```typescript
{
  id: string,
  name: string,
  sector: string,
  logoUrl: string,
  rating: number, // Average rating (0-5)
  ratingCount: number,
  totalRatingValue: number,
  verified: boolean,
  verifiedBy?: string, // Admin UID who verified
  createdAt: Timestamp,
  // ... other fields
}
```

#### Verify Profile Update

```typescript
await updateDoc(doc(db, 'profiles', profileId), {
  verified: true,
  verifiedBy: adminUid
});

await logAdminAction(
  LOG_ACTIONS.PROFILE_VERIFIED,
  'profile',
  adminUid,
  adminEmail,
  profileId,
  profileName
);
```

#### Delete Profile Cascade

```typescript
// 1. Delete all ratings
const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
const ratingsToDelete = ratingsSnapshot.docs.filter(
  doc => doc.data().profileId === profileId
);
await Promise.all(ratingsToDelete.map(doc => deleteDoc(doc.ref)));

// 2. Delete all reviews
const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
const reviewsToDelete = reviewsSnapshot.docs.filter(
  doc => doc.data().profileId === profileId
);
await Promise.all(reviewsToDelete.map(doc => deleteDoc(doc.ref)));

// 3. Delete profile
await deleteDoc(doc(db, 'profiles', profileId));

// 4. Log action
await logAdminAction(
  LOG_ACTIONS.PROFILE_DELETED,
  'profile',
  adminUid,
  adminEmail,
  profileId,
  profileName,
  `Deleted with ${ratingsToDelete.length} ratings and ${reviewsToDelete.length} reviews`
);
```

### Tab Filtering

- **All**: Shows all profiles (no filter)
- **Unverified**: `profiles.filter(p => !p.verified)`
- **Verified**: `profiles.filter(p => p.verified)`
- **Recent**: First 20 profiles (ordered by `createdAt` desc)

### Verification Badge Display

Public ProfileCard components check `verified` field:
```tsx
{profile.verified && (
  <Badge className="bg-green-500">
    <CheckCircle className="w-3 h-3 mr-1" />
    Verified
  </Badge>
)}
```

### Use Cases

- **Authenticity**: Verify legitimate businesses (check business registration, social media presence)
- **Quality Control**: Unverify profiles that no longer meet standards
- **Spam Removal**: Delete fake profiles created by bots or scammers
- **Data Cleanup**: Remove duplicate or test profiles
- **Trust Building**: Verified badge increases user confidence in ratings

### Important Notes

⚠️ **Verification Criteria** (Recommended):
1. Business is registered with government authorities
2. Physical location exists (verify with Google Maps, business listings)
3. Social media presence with engagement
4. Website domain registered to business
5. Contact information verified (phone, email)

⚠️ **Delete is Permanent**: Deleting a profile cascades to **all associated data**:
- All ratings for the profile (affects user rating history)
- All reviews for the profile (user-written text)
- Profile document (name, logo, sector, stats)

✅ **Always check systemLogs** after verifying/deleting to confirm action was logged.

---

## 5. System Logs

**Route**: `/admin/logs`

### Features

#### View Logs
- Table display with columns: Type (icon), Action (badge), Target, Admin, Details, Date
- Search functionality (filters by action, target name, admin email, details)
- Stats cards: Total Actions, Profile Actions, User Actions, Rating Actions
- Real-time updates (fetch latest 200 logs)
- Color-coded badges by action severity

#### Log Entry Details

Each log entry contains:
- **Action**: Type of action (e.g., "Profile Verified", "User Banned")
- **Target Type**: Category (profile, user, rating, review, system)
- **Target Name**: Name of affected entity (profile name, user email)
- **Admin**: Email of admin who performed action
- **Details**: Additional context (e.g., ban reason, rating value)
- **Timestamp**: Date and time of action

### Action Types

#### Profile Actions (Green)
- `PROFILE_VERIFIED`: Admin verified a profile
- `PROFILE_UNVERIFIED`: Admin removed verification

#### Profile Actions (Red)
- `PROFILE_DELETED`: Admin deleted a profile (includes cascade info)

#### User Actions (Red)
- `USER_BANNED`: Admin banned a user (includes reason)
- `USER_DEACTIVATED`: Admin deactivated a user

#### User Actions (Green)
- `USER_UNBANNED`: Admin unbanned a user
- `USER_ACTIVATED`: Admin reactivated a user

#### Rating Actions (Red)
- `RATING_DELETED`: Admin deleted a rating (includes star value)

#### Review Actions (Red)
- `REVIEW_DELETED`: Admin deleted a review

### Database Operations

#### System Logs Collection Structure

```typescript
{
  id: string, // Auto-generated
  action: string, // Action type (e.g., LOG_ACTIONS.PROFILE_VERIFIED)
  targetType: 'profile' | 'user' | 'rating' | 'review' | 'system',
  targetId: string, // ID of affected entity
  targetName: string, // Display name of affected entity
  adminId: string, // UID of admin who performed action
  adminEmail: string, // Email of admin
  details?: string, // Additional context
  timestamp: Timestamp, // Server timestamp
  metadata?: object // Optional extra data
}
```

#### Fetching Logs

```typescript
// Fetch latest 200 logs, ordered by timestamp desc
export async function fetchSystemLogs(limitCount: number = 100): Promise<SystemLog[]> {
  const logsRef = collection(db, 'systemLogs');
  const q = query(logsRef, orderBy('timestamp', 'desc'), limit(limitCount));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SystemLog));
}
```

### Badge Color Coding

- **Verified** (Green): `PROFILE_VERIFIED`, `USER_UNBANNED`, `USER_ACTIVATED`
- **Deleted** (Red): `PROFILE_DELETED`, `RATING_DELETED`, `REVIEW_DELETED`
- **Banned** (Red): `USER_BANNED`
- **Deactivated** (Gray): `USER_DEACTIVATED`
- **Unverified** (Gray): `PROFILE_UNVERIFIED`

### Use Cases

- **Audit Trail**: Review all admin actions for accountability
- **Dispute Resolution**: Check when/why a user was banned or profile deleted
- **Compliance**: Export logs for legal/compliance requirements
- **Training**: Review other admins' actions to learn best practices
- **Investigation**: Search logs to find related actions (e.g., all actions by specific admin)

### Search Examples

- Search "banned" → Find all user bans
- Search "user@example.com" → Find all actions on specific user
- Search "spam" → Find ratings/reviews deleted for spam
- Search admin email → Find all actions by specific admin

### Important Notes

⚠️ **Logs are Permanent**: System logs are NOT deleted when entities are deleted. This maintains audit trail integrity.

✅ **Search is Powerful**: Searches across action, adminEmail, targetName, and details fields. Use keywords like "banned", "deleted", "verified" to find specific action types.

📊 **Stats Update**: Total action counts (Profile Actions, User Actions, Rating Actions) update automatically based on filtered logs.

---

## System Logging Utility

### File: `src/lib/systemLogs.ts`

### Log Action Function

```typescript
export async function logAdminAction(
  action: string,
  targetType: 'profile' | 'user' | 'rating' | 'review' | 'system',
  adminId: string,
  adminEmail: string,
  targetId?: string,
  targetName?: string,
  details?: string,
  metadata?: any
): Promise<void> {
  try {
    await addDoc(collection(db, 'systemLogs'), {
      action,
      targetType,
      targetId,
      targetName,
      adminId,
      adminEmail,
      details,
      metadata,
      timestamp: serverTimestamp()
    });
  } catch (error) {
    console.error('Error logging admin action:', error);
    // Non-blocking: Don't throw error to avoid disrupting admin action
  }
}
```

### Action Constants

```typescript
export const LOG_ACTIONS = {
  // Profile actions
  PROFILE_VERIFIED: 'Profile Verified',
  PROFILE_UNVERIFIED: 'Profile Unverified',
  PROFILE_DELETED: 'Profile Deleted',
  
  // User actions
  USER_BANNED: 'User Banned',
  USER_UNBANNED: 'User Unbanned',
  USER_DEACTIVATED: 'User Deactivated',
  USER_ACTIVATED: 'User Activated',
  
  // Rating actions
  RATING_DELETED: 'Rating Deleted',
  RATING_FLAGGED: 'Rating Flagged',
  
  // Review actions
  REVIEW_DELETED: 'Review Deleted',
  REVIEW_FLAGGED: 'Review Flagged',
  
  // System actions
  ADMIN_LOGIN: 'Admin Login',
  ADMIN_LOGOUT: 'Admin Logout',
  SETTINGS_CHANGED: 'Settings Changed'
};
```

### Usage Examples

#### Log Profile Verification
```typescript
await logAdminAction(
  LOG_ACTIONS.PROFILE_VERIFIED,
  'profile',
  currentUser.uid,
  currentUser.email || 'admin',
  profileId,
  profileName
);
```

#### Log User Ban with Reason
```typescript
await logAdminAction(
  LOG_ACTIONS.USER_BANNED,
  'user',
  currentUser.uid,
  currentUser.email || 'admin',
  userId,
  userEmail,
  `Reason: ${banReason}`
);
```

#### Log Rating Deletion with Value
```typescript
await logAdminAction(
  LOG_ACTIONS.RATING_DELETED,
  'rating',
  currentUser.uid,
  currentUser.email || 'admin',
  ratingId,
  profileName,
  `Rating: ${ratingValue} stars`
);
```

#### Log Profile Deletion with Cascade Info
```typescript
await logAdminAction(
  LOG_ACTIONS.PROFILE_DELETED,
  'profile',
  currentUser.uid,
  currentUser.email || 'admin',
  profileId,
  profileName,
  `Deleted with ${ratingsCount} ratings and ${reviewsCount} reviews`
);
```

### Error Handling

The logging function is **non-blocking** and will NOT throw errors. If logging fails:
- Error is logged to console
- Admin action proceeds successfully
- User is NOT notified of logging failure

This prevents logging errors from disrupting critical admin operations.

---

## Firestore Security Rules

⚠️ **CRITICAL**: Update your Firestore security rules to secure admin collections.

### Recommended Rules

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    
    // Helper function to check if user is admin
    function isAdmin() {
      return request.auth != null && 
        exists(/databases/$(database)/documents/admins/$(request.auth.uid));
    }
    
    // System Logs - Admin read/write only
    match /systemLogs/{logId} {
      allow read, write: if isAdmin();
    }
    
    // Users Collection - Admin write, user read own
    match /users/{userId} {
      allow read: if request.auth != null && request.auth.uid == userId;
      allow write: if isAdmin();
    }
    
    // Profiles - Public read, creator/admin write
    match /profiles/{profileId} {
      allow read: if true; // Public read for leaderboard
      allow create: if request.auth != null;
      allow update, delete: if request.auth != null && (
        request.auth.uid == resource.data.createdBy || isAdmin()
      );
    }
    
    // Ratings - Public read, user write own, admin delete
    match /ratings/{ratingId} {
      allow read: if true;
      allow create, update: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow delete: if isAdmin() || 
        (request.auth != null && request.auth.uid == resource.data.userId);
    }
    
    // Reviews - Similar to ratings
    match /reviews/{reviewId} {
      allow read: if true;
      allow create, update: if request.auth != null && 
        request.auth.uid == request.resource.data.userId;
      allow delete: if isAdmin() || 
        (request.auth != null && request.auth.uid == resource.data.userId);
    }
    
    // Admins Collection - Admin read only (no writes via Firestore)
    match /admins/{adminId} {
      allow read: if isAdmin();
      allow write: if false; // Admins added manually via Firebase Console
    }
  }
}
```

### Security Notes

1. **Admin Collection**: Admins are added manually via Firebase Console. Never allow write access via Firestore rules.
2. **System Logs**: Only admins can read/write logs. Users should never access this collection.
3. **Users Collection**: Users can read their own document, but only admins can update status fields.
4. **Profiles**: Public read for leaderboard, but only profile creator or admin can edit/delete.
5. **Ratings/Reviews**: Public read, user can create/edit own, admin can delete any.

---

## Testing Checklist

### Navigation Testing
- [ ] Click "Dashboard" in sidebar → Dashboard loads
- [ ] Click "Users" in sidebar → ManageUsers page loads
- [ ] Click "Ratings" in sidebar → ManageRatings page loads
- [ ] Click "Profiles" in sidebar → ManageProfiles page loads
- [ ] Click "Logs" in sidebar → SystemLogs page loads
- [ ] Active navigation item highlights correctly
- [ ] Mobile menu button opens/closes sidebar
- [ ] Sign out button redirects to login

### Dashboard Testing
- [ ] Total Users stat displays correctly
- [ ] Total Profiles stat displays correctly
- [ ] Total Ratings stat displays correctly
- [ ] Total Reviews stat displays correctly
- [ ] Average Rating calculates correctly
- [ ] System Status shows "Operational" (green)
- [ ] Quick action cards link to correct pages

### User Management Testing
- [ ] User list loads with all users
- [ ] Search filters users by email/name
- [ ] Stats cards show correct counts
- [ ] Ban user with reason → Status badge shows "Banned"
- [ ] Unban user → Status badge shows "Active"
- [ ] Deactivate user → Status badge shows "Deactivated"
- [ ] Activate user → Status badge shows "Active"
- [ ] All actions logged to systemLogs

### Rating Management Testing
- [ ] Rating list loads with profile names
- [ ] Search filters by profile/user
- [ ] Stats show Total Ratings and Average
- [ ] Delete rating → Confirmation dialog appears
- [ ] After delete, profile ratingCount decreases
- [ ] After delete, profile average recalculates
- [ ] Action logged to systemLogs

### Profile Management Testing
- [ ] Profile list loads with thumbnails
- [ ] Tabs (All, Unverified, Verified, Recent) filter correctly
- [ ] Search filters by name/sector
- [ ] Stats show Total, Verified, Unverified counts
- [ ] Verify profile → Badge shows "Verified"
- [ ] Unverify profile → Badge shows "Unverified"
- [ ] Delete profile → Cascade deletes ratings and reviews
- [ ] All actions logged to systemLogs

### System Logs Testing
- [ ] Logs load in reverse chronological order
- [ ] Search filters logs correctly
- [ ] Stats cards show correct counts
- [ ] Badges color-code correctly (green, red, gray)
- [ ] Date formatting displays correctly
- [ ] Perform admin action → New log appears

### Build Testing
- [ ] Run `npm run build` → Build succeeds
- [ ] No TypeScript errors
- [ ] Bundle size acceptable (< 1.5 MB)

---

## Troubleshooting

### Issue: "Access denied. Admin privileges required."

**Cause**: User is not in `admins` collection.

**Solution**:
1. Open Firebase Console
2. Navigate to Firestore Database
3. Create collection `admins`
4. Add document with ID = user's Firebase Auth UID
5. Add fields:
   ```
   uid: <user_uid>
   email: <user_email>
   role: "admin"
   ```
6. Refresh admin page and try again

### Issue: User list shows "No users found"

**Cause**: `users` collection doesn't exist or is empty.

**Solution**:
ManageUsers has automatic fallback that creates user list from unique profile creators. If still empty:
1. Check that profiles exist in database
2. Verify profiles have `createdBy` field with user UID
3. Manually create `users` collection and add user documents

### Issue: Rating deletion doesn't update profile stats

**Cause**: Profile stats calculation failed.

**Solution**:
1. Check systemLogs for error details
2. Manually verify profile document:
   - `ratingCount` should decrease by 1
   - `totalRatingValue` should decrease by deleted rating value
   - `rating` should be `totalRatingValue / ratingCount`
3. If incorrect, manually update profile document in Firestore

### Issue: Profile deletion doesn't cascade delete ratings

**Cause**: Ratings deletion query failed.

**Solution**:
1. Check systemLogs for error details
2. Manually query `ratings` collection:
   ```typescript
   where('profileId', '==', deletedProfileId)
   ```
3. If ratings still exist, manually delete them
4. Check Firestore rules allow admin to delete ratings

### Issue: System logs not recording actions

**Cause**: `systemLogs.ts` logging function failing silently.

**Solution**:
1. Check browser console for errors
2. Verify `systemLogs` collection exists in Firestore
3. Check Firestore rules allow admin to write to `systemLogs`
4. Verify `serverTimestamp()` import from Firebase

### Issue: Mobile sidebar doesn't close after navigation

**Cause**: Missing state update in navigation click handler.

**Solution**:
Add `onClick={() => setMobileMenuOpen(false)}` to each Link component in AdminSidebar.

---

## Best Practices

### User Management
1. Always provide a clear reason when banning users
2. Deactivate first, ban only if violation is severe
3. Check user's profiles/ratings before banning to assess impact
4. Document repeated violations in ban reason

### Rating Management
1. Verify rating is actually spam before deleting (check user history)
2. Look for patterns (same user rating multiple profiles with 1 star in short time)
3. Cross-reference with user ban status (banned users' ratings may be spam)
4. Monitor profile stats after deletion to ensure correct recalculation

### Profile Verification
1. Establish clear verification criteria (see Verification Criteria above)
2. Document verification process in internal admin wiki
3. Unverify profiles that no longer meet standards (closed business, fake reviews)
4. Before deleting, export profile data for records (screenshot or JSON)

### System Logs
1. Review logs weekly to monitor admin activity
2. Search for patterns (e.g., one admin deleting many profiles)
3. Use logs for training new admins (show examples of good bans/deletes)
4. Export logs monthly for compliance/audit purposes

---

## Future Enhancements

### Planned Features
- **Bulk Actions**: Select multiple users/profiles and perform actions simultaneously
- **Advanced Filters**: Date range filters, multi-select action types
- **Export Functionality**: Export logs/users/ratings to CSV
- **Analytics Dashboard**: Charts showing admin action trends over time
- **Email Notifications**: Alert admins when suspicious activity detected
- **Role-Based Permissions**: Super admin vs. regular admin roles
- **Audit Reports**: Automated monthly admin activity reports
- **Profile Flagging**: Users can flag profiles for admin review
- **Rating Appeal**: Users can appeal rating deletions

### Requested Features
- **Undo Actions**: Ability to undo recent admin actions (requires action queue)
- **Scheduled Actions**: Schedule profile verification reviews every 6 months
- **IP Tracking**: Log IP addresses of banned users for pattern detection
- **User Messaging**: Send messages to users from admin panel (ban explanations)

---

## Support

For issues with the admin panel:
1. Check this guide's Troubleshooting section
2. Review systemLogs for error details
3. Check browser console for JavaScript errors
4. Verify Firestore security rules are correctly configured
5. Contact development team with:
   - Steps to reproduce issue
   - Screenshot of error
   - Relevant systemLog entries

---

## Changelog

### Version 1.0.0 (Current)
- Initial release of Task 7: Admin Panel Functionalities
- Dashboard Overview with 6 stat cards
- Manage Users (ban/unban, deactivate/activate)
- Manage Ratings (delete with profile stats update)
- Manage Profiles (verify/unverify, delete with cascade)
- System Logs viewer with search and filtering
- AdminLayout and AdminSidebar navigation
- System logging utility with 11 action types
- Protected routing for all admin pages

---

**Last Updated**: January 2025  
**Version**: 1.0.0  
**Status**: Production Ready ✅
