# Username Feature - Quick Reference

## Quick Facts
- **Feature:** Unique usernames for profile URLs
- **URL Format:** `/profile/{username}` (e.g., `/profile/johndoe`)
- **Length:** 3-30 characters
- **Allowed:** Letters, numbers, hyphens, underscores
- **Case-Insensitive:** "JohnDoe" and "johndoe" are the same
- **Backward Compatible:** Old URLs with document IDs still work

## For Users

### Creating a Username
1. Fill in your name on profile creation form
2. Username is auto-suggested (you can modify it)
3. Wait for green checkmark (✓) to confirm availability
4. Submit the form

### Valid Username Examples
✅ `johndoe`  
✅ `john-doe`  
✅ `john_doe_123`  
✅ `user2024`  
✅ `cool_business`

### Invalid Username Examples
❌ `ab` (too short)  
❌ `-johndoe` (starts with hyphen)  
❌ `john.doe` (contains period)  
❌ `john doe` (contains space)  
❌ `admin` (reserved word)

### Changing Your Username
1. Go to Dashboard
2. Click "Edit Profile"
3. Change username field
4. Wait for validation
5. Save changes

## For Developers

### New Files
- `src/lib/usernameValidator.ts` - Validation utilities

### Modified Files
- `src/pages/CreateProfile.tsx` - Username input with validation
- `src/pages/ProfileView.tsx` - Username-based URL lookup
- `src/components/ProfileCard.tsx` - Username in navigation links

### Key Functions
```typescript
// Validate format
validateUsernameFormat(username: string)

// Check availability
checkUsernameAvailability(username: string, userId?: string)

// Normalize to lowercase
normalizeUsername(username: string)

// Generate suggestion
suggestUsername(name: string)
```

### Database Fields
```typescript
{
  username: "JohnDoe",        // Display version
  usernameLower: "johndoe"    // For queries
}
```

### Usage in Components
```typescript
// Link to profile (prefer username)
<Link to={`/profile/${profile.username || profile.id}`}>

// ProfileView resolves both username and ID
// Try username query first, fallback to ID
```

## Validation Rules

| Rule | Value |
|------|-------|
| Min Length | 3 characters |
| Max Length | 30 characters |
| Pattern | `^[a-zA-Z0-9_-]+$` |
| Start With | Letter or number |
| Case Sensitive | No (stored as lowercase) |
| Reserved Words | 26 system usernames |

## Reserved Usernames
Cannot use: `admin`, `api`, `auth`, `profile`, `profiles`, `user`, `users`, `dashboard`, `leaderboard`, `settings`, `help`, `support`, `about`, `contact`, `terms`, `privacy`, `login`, `signup`, `create`, `edit`, `delete`, `update`, `new`, `ratehere`, `root`, `system`, `test`, `demo`, `sample`, `example`

## URL Behavior

| Scenario | URL | Behavior |
|----------|-----|----------|
| Profile with username | `/profile/johndoe` | Loads by username |
| Profile without username | `/profile/abc123xyz` | Loads by document ID |
| Old bookmark | `/profile/abc123xyz` | Still works (fallback) |
| Username not found | `/profile/invalid` | Shows error |
| Case variation | `/profile/JohnDoe` | Loads same as `/profile/johndoe` |

## Visual Feedback

| Icon | Meaning |
|------|---------|
| 🔄 Loading spinner | Checking availability |
| ✓ Green checkmark | Username available |
| ✗ Red X | Username taken/invalid |
| Error message | Validation failed (reason shown) |

## Testing Checklist

- [ ] Create profile with valid username
- [ ] Try duplicate username (should fail)
- [ ] Try invalid characters (should fail)
- [ ] Try reserved word (should fail)
- [ ] Navigate to `/profile/username`
- [ ] Navigate to `/profile/documentId` (old URLs)
- [ ] Edit profile and change username
- [ ] Dashboard links use username
- [ ] Leaderboard links use username

## Performance

- **Debounce:** 500ms (reduces Firestore reads)
- **Validation:** Format check first (free), then availability (1 read)
- **Profile Load:** 1 query for username OR 1 getDoc for ID
- **Cost:** Minimal - 1-2 Firestore reads per validation

## Common Issues

**Problem:** Username available but submission fails  
**Solution:** Another user took it - try different username

**Problem:** Profile not found  
**Solution:** Check if username exists, verify case-insensitive query

**Problem:** Validation too slow  
**Solution:** Adjust debounce timeout in CreateProfile.tsx

**Problem:** Old URL not working  
**Solution:** Verify fallback logic in ProfileView.tsx

## Code Snippets

### Check Username Availability
```typescript
import { checkUsernameAvailability } from '@/lib/usernameValidator';

const result = await checkUsernameAvailability('johndoe');
if (result.available) {
  console.log('Username is available!');
} else {
  console.error(result.error);
}
```

### Validate Username Format
```typescript
import { validateUsernameFormat } from '@/lib/usernameValidator';

const result = validateUsernameFormat('john-doe');
if (result.valid) {
  console.log('Valid format!');
} else {
  console.error(result.error);
}
```

### Generate Username Suggestion
```typescript
import { suggestUsername } from '@/lib/usernameValidator';

const suggested = suggestUsername('John Doe');
console.log(suggested); // 'john-doe'
```

### Link to Profile with Username
```tsx
import { Link } from 'react-router-dom';

<Link to={`/profile/${profile.username || profile.id}`}>
  View Profile
</Link>
```

## Migration Notes

- **No action required for existing profiles**
- Old URLs continue to work with document IDs
- Users can add username by editing their profile
- New profiles require username (enforced in CreateProfile)
- Both username and ID URLs are permanently supported

## Next Steps

1. ✅ Feature implemented and tested
2. ✅ Documentation created
3. ⏳ Deploy to production
4. ⏳ Monitor username creation patterns
5. ⏳ Gather user feedback
6. ⏳ Consider future enhancements (custom domains, username marketplace)

---

**Quick Links:**
- Full Guide: `USERNAME_FEATURE_GUIDE.md`
- Validator Utility: `src/lib/usernameValidator.ts`
- Profile Creation: `src/pages/CreateProfile.tsx`
- Profile View: `src/pages/ProfileView.tsx`
