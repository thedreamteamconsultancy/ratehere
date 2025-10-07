# Admin Panel Quick Reference

## Routes

| Route | Component | Purpose |
|-------|-----------|---------|
| `/admin` | AdminDashboard | Overview stats and quick actions |
| `/admin/users` | ManageUsers | Ban/unban, activate/deactivate users |
| `/admin/ratings` | ManageRatings | Delete spam ratings |
| `/admin/profiles` | ManageProfiles | Verify profiles, delete fakes |
| `/admin/logs` | SystemLogs | View all admin action logs |

---

## Admin Files

### Core Components
- `src/components/AdminSidebar.tsx` - Navigation sidebar (133 lines)
- `src/components/AdminLayout.tsx` - Layout wrapper (19 lines)

### Pages
- `src/pages/AdminDashboard.tsx` - Dashboard overview (265 lines)
- `src/pages/ManageUsers.tsx` - User management (447 lines)
- `src/pages/ManageRatings.tsx` - Rating management (328 lines)
- `src/pages/ManageProfiles.tsx` - Profile management (368 lines)
- `src/pages/SystemLogs.tsx` - System logs viewer (300+ lines)

### Utilities
- `src/lib/systemLogs.ts` - Logging utility (98 lines)

---

## Action Types (LOG_ACTIONS)

### Profile Actions
- `PROFILE_VERIFIED` - Admin verified a profile
- `PROFILE_UNVERIFIED` - Admin removed verification
- `PROFILE_DELETED` - Admin deleted profile (cascade)

### User Actions
- `USER_BANNED` - Admin banned user
- `USER_UNBANNED` - Admin unbanned user
- `USER_DEACTIVATED` - Admin deactivated user
- `USER_ACTIVATED` - Admin reactivated user

### Rating Actions
- `RATING_DELETED` - Admin deleted rating
- `RATING_FLAGGED` - Admin flagged rating

### Review Actions
- `REVIEW_DELETED` - Admin deleted review
- `REVIEW_FLAGGED` - Admin flagged review

### System Actions
- `ADMIN_LOGIN` - Admin logged in
- `ADMIN_LOGOUT` - Admin logged out
- `SETTINGS_CHANGED` - Admin changed settings

---

## User Status Values

- **`active`** (Green badge) - Normal user, can log in
- **`banned`** (Red badge) - User violated terms, cannot log in
- **`deactivated`** (Gray badge) - Temporarily disabled by admin

---

## Database Collections

### systemLogs
```typescript
{
  id: string,
  action: string, // From LOG_ACTIONS
  targetType: 'profile' | 'user' | 'rating' | 'review' | 'system',
  targetId: string,
  targetName: string,
  adminId: string,
  adminEmail: string,
  details?: string,
  timestamp: Timestamp,
  metadata?: object
}
```

### users
```typescript
{
  uid: string,
  email: string,
  displayName: string,
  photoURL?: string,
  createdAt: Timestamp,
  status: 'active' | 'banned' | 'deactivated',
  bannedAt?: Timestamp,
  bannedBy?: string,
  bannedReason?: string
}
```

### profiles (additional admin fields)
```typescript
{
  // ... existing fields
  verified: boolean,
  verifiedBy?: string, // Admin UID
}
```

---

## Common Tasks

### Add Admin User
1. Open Firebase Console → Firestore Database
2. Create collection `admins`
3. Add document: `ID = user's Firebase Auth UID`
4. Fields:
   ```
   uid: <user_uid>
   email: <user_email>
   role: "admin"
   ```

### Ban User
1. Go to `/admin/users`
2. Search for user
3. Click "Ban" → Enter reason → Confirm
4. User status → "Banned" (red badge)
5. Check `/admin/logs` for confirmation

### Delete Spam Rating
1. Go to `/admin/ratings`
2. Search for rating
3. Click "Delete" → Confirm
4. Profile stats auto-update
5. Check `/admin/logs` for confirmation

### Verify Profile
1. Go to `/admin/profiles`
2. Search for profile
3. Click "Verify" button
4. Verified badge appears
5. Check `/admin/logs` for confirmation

### Review Admin Actions
1. Go to `/admin/logs`
2. Search by action type, admin email, or target name
3. Review timestamp and details
4. Export logs for compliance (manual screenshot for now)

---

## Code Snippets

### Log Custom Admin Action
```typescript
import { logAdminAction, LOG_ACTIONS } from '@/lib/systemLogs';

await logAdminAction(
  LOG_ACTIONS.PROFILE_VERIFIED, // Action type
  'profile', // Target type
  currentUser.uid, // Admin UID
  currentUser.email || 'admin', // Admin email
  profileId, // Target ID
  profileName, // Target name (display)
  'Optional details' // Additional context
);
```

### Check if User is Admin (AuthContext)
```typescript
const { user, isAdmin } = useAuth();

if (!isAdmin) {
  navigate('/');
  return;
}
```

### Fetch System Logs
```typescript
import { fetchSystemLogs } from '@/lib/systemLogs';

const logs = await fetchSystemLogs(200); // Fetch last 200 logs
```

### Update User Status
```typescript
import { doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';

// Ban user
await updateDoc(doc(db, 'users', userId), {
  status: 'banned',
  bannedAt: serverTimestamp(),
  bannedBy: adminUid,
  bannedReason: reason
});

// Unban user
await updateDoc(doc(db, 'users', userId), {
  status: 'active',
  bannedAt: deleteField(),
  bannedBy: deleteField(),
  bannedReason: deleteField()
});
```

### Delete Rating with Stats Update
```typescript
// Get profile stats
const profileDoc = await getDoc(doc(db, 'profiles', profileId));
const currentRatingCount = profileDoc.data().ratingCount || 0;
const currentTotalValue = profileDoc.data().totalRatingValue || 0;

// Calculate new stats
const newRatingCount = Math.max(0, currentRatingCount - 1);
const newTotalValue = Math.max(0, currentTotalValue - deletedRatingValue);
const newRating = newRatingCount > 0 ? newTotalValue / newRatingCount : 0;

// Update profile
await updateDoc(doc(db, 'profiles', profileId), {
  ratingCount: newRatingCount,
  totalRatingValue: newTotalValue,
  rating: newRating
});

// Delete rating
await deleteDoc(doc(db, 'ratings', ratingId));
```

### Cascade Delete Profile
```typescript
// 1. Delete ratings
const ratingsSnapshot = await getDocs(collection(db, 'ratings'));
const ratingsToDelete = ratingsSnapshot.docs.filter(
  doc => doc.data().profileId === profileId
);
await Promise.all(ratingsToDelete.map(doc => deleteDoc(doc.ref)));

// 2. Delete reviews
const reviewsSnapshot = await getDocs(collection(db, 'reviews'));
const reviewsToDelete = reviewsSnapshot.docs.filter(
  doc => doc.data().profileId === profileId
);
await Promise.all(reviewsToDelete.map(doc => deleteDoc(doc.ref)));

// 3. Delete profile
await deleteDoc(doc(db, 'profiles', profileId));
```

---

## Testing Checklist

### Navigation
- [ ] Dashboard loads
- [ ] Users page loads
- [ ] Ratings page loads
- [ ] Profiles page loads
- [ ] Logs page loads
- [ ] Active nav item highlights
- [ ] Mobile menu works
- [ ] Sign out works

### User Management
- [ ] List loads
- [ ] Search works
- [ ] Ban user
- [ ] Unban user
- [ ] Deactivate user
- [ ] Activate user
- [ ] Actions logged

### Rating Management
- [ ] List loads
- [ ] Search works
- [ ] Delete rating
- [ ] Profile stats update
- [ ] Action logged

### Profile Management
- [ ] List loads
- [ ] Tabs filter correctly
- [ ] Search works
- [ ] Verify profile
- [ ] Unverify profile
- [ ] Delete profile
- [ ] Cascade delete works
- [ ] Actions logged

### System Logs
- [ ] Logs load
- [ ] Search works
- [ ] Badges color-code correctly
- [ ] Stats update
- [ ] New actions appear

### Build
- [ ] `npm run build` succeeds
- [ ] No TypeScript errors
- [ ] Bundle size < 1.5 MB

---

## Quick Troubleshooting

| Issue | Solution |
|-------|----------|
| "Access denied" error | Add user to `admins` collection in Firebase Console |
| No users found | Check `profiles` collection has `createdBy` field |
| Rating delete doesn't update stats | Check profile document for correct ratingCount/totalRatingValue |
| Profile delete doesn't cascade | Check Firestore rules allow admin to delete ratings/reviews |
| Logs not recording | Check browser console, verify systemLogs collection exists |
| Mobile sidebar stuck open | Add onClick handler to close menu on navigation |

---

## Firestore Rules Quick Reference

```javascript
// System Logs - Admin only
match /systemLogs/{logId} {
  allow read, write: if isAdmin();
}

// Users - Admin write, user read own
match /users/{userId} {
  allow read: if request.auth.uid == userId;
  allow write: if isAdmin();
}

// Profiles - Public read, creator/admin write
match /profiles/{profileId} {
  allow read: if true;
  allow create: if request.auth != null;
  allow update, delete: if isAdmin() || 
    request.auth.uid == resource.data.createdBy;
}

// Ratings - Public read, user write own, admin delete
match /ratings/{ratingId} {
  allow read: if true;
  allow create, update: if request.auth.uid == request.resource.data.userId;
  allow delete: if isAdmin() || request.auth.uid == resource.data.userId;
}
```

---

## Statistics Formulas

### Average Rating
```
totalRating = profiles.reduce((sum, p) => sum + p.rating, 0)
averageRating = totalRating / profiles.length
```

### After Rating Deletion
```
newRatingCount = currentRatingCount - 1
newTotalValue = currentTotalValue - deletedRatingValue
newRating = newRatingCount > 0 ? newTotalValue / newRatingCount : 0
```

### User Counts
```
totalUsers = users.length
activeUsers = users.filter(u => u.status === 'active').length
bannedUsers = users.filter(u => u.status === 'banned').length
```

---

## Key Features

✅ **Dashboard Overview** - 6 stat cards, quick actions  
✅ **User Management** - Ban/unban, deactivate/activate with reasons  
✅ **Rating Management** - Delete spam with auto stats update  
✅ **Profile Verification** - Verify authentic profiles, delete fakes with cascade  
✅ **System Logs** - Complete audit trail with search and filtering  
✅ **Sidebar Navigation** - Responsive with mobile menu  
✅ **System Logging** - All actions logged automatically  

---

## Command Reference

```bash
# Build project
npm run build

# Run dev server
npm run dev

# Type check
npm run type-check

# Lint
npm run lint
```

---

**Version**: 1.0.0  
**Status**: Production Ready ✅  
**Last Updated**: January 2025  
**Full Documentation**: See `ADMIN_PANEL_GUIDE.md`
