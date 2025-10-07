# 🧪 Testing Guide - New Features

## Overview
Comprehensive testing checklist for all 5 new features implemented in RateHere platform.

---

## 🖼️ Task 1: Banner Display Testing

### Test Cases:

#### TC1.1: Profile with Banner
**Steps**:
1. Navigate to a profile that has `bannerUrl` in Firestore
2. Observe hero section

**Expected**:
- ✅ Banner image displays as background
- ✅ Banner covers full width (h-48 height)
- ✅ Logo displays on top of banner
- ✅ Gradient overlay subtle

**Pass Criteria**:
- Banner loads within 2 seconds
- No layout shift
- Logo remains centered

---

#### TC1.2: Profile without Banner
**Steps**:
1. Navigate to a profile without `bannerUrl`
2. Observe hero section

**Expected**:
- ✅ Gradient background displays
- ✅ Logo displays normally
- ✅ No error in console

**Pass Criteria**:
- Fallback works seamlessly
- Visual consistency maintained

---

#### TC1.3: Banner Responsiveness
**Steps**:
1. Open profile with banner
2. Resize browser: Mobile (375px) → Tablet (768px) → Desktop (1280px)

**Expected**:
- ✅ Banner scales correctly
- ✅ Logo position maintained
- ✅ No overflow or clipping

**Pass Criteria**:
- Works on all screen sizes
- No horizontal scroll

---

## ⭐ Task 2: Rating with Comments Testing

### Test Cases:

#### TC2.1: Anonymous User Behavior
**Steps**:
1. Log out of account
2. Navigate to any profile
3. Try to rate

**Expected**:
- ✅ Can view profile and ratings
- ✅ Stars are not interactive
- ✅ Message: "Sign in to rate this profile"
- ✅ No rating/comment submission possible

**Pass Criteria**:
- No errors when not logged in
- Clear messaging

---

#### TC2.2: Logged In User - Rate Only
**Steps**:
1. Log in to account
2. Navigate to profile (not yet rated)
3. Click 3 stars (don't add comment)
4. Click "Submit Rating Only"

**Expected**:
- ✅ Comment field appears after rating
- ✅ Can submit without comment
- ✅ Toast: "Rating submitted!"
- ✅ Rating saved to Firestore
- ✅ Profile rating updates

**Pass Criteria**:
- Rating appears immediately
- Can rate without comment
- Data persists in database

---

#### TC2.3: Logged In User - Rate with Comment
**Steps**:
1. Log in to account
2. Navigate to profile (not yet rated)
3. Click 4 stars
4. Type comment "Great service!"
5. Click "Submit Rating & Comment"

**Expected**:
- ✅ Comment field shows after rating
- ✅ Button text changes based on input
- ✅ Toast: "Rating and comment submitted!"
- ✅ Both rating and review saved
- ✅ Review appears in list

**Pass Criteria**:
- Both rating and comment saved
- Review appears immediately
- Data persists

---

#### TC2.4: Already Rated User
**Steps**:
1. Navigate to profile already rated
2. Observe rating section

**Expected**:
- ✅ Shows "Your Rating"
- ✅ Displays rated stars (non-interactive)
- ✅ Message: "Thank you for your feedback!"
- ✅ No rating/comment input shown

**Pass Criteria**:
- Can't rate twice
- Clear feedback shown

---

## 🔍 Task 3: Search Functionality Testing

### Test Cases:

#### TC3.1: Homepage Search - Name
**Steps**:
1. Go to homepage
2. Type profile name in search (e.g., "John")
3. Observe results

**Expected**:
- ✅ Search results section appears
- ✅ Shows matching profiles (max 6)
- ✅ "View All Profiles" button shown
- ✅ Top profiles section hidden

**Pass Criteria**:
- Results appear within 1 second
- Matching is case-insensitive
- Partial matches work

---

#### TC3.2: Homepage Search - Sector
**Steps**:
1. Type sector name (e.g., "Technology")
2. Observe results

**Expected**:
- ✅ Shows profiles in that sector
- ✅ Result count accurate
- ✅ Can click profile to view

**Pass Criteria**:
- Sector matching works
- Results clickable

---

#### TC3.3: Homepage Search - Clear
**Steps**:
1. Type search term
2. Click X button
3. Observe

**Expected**:
- ✅ Search term clears
- ✅ Results section disappears
- ✅ Top profiles section reappears

**Pass Criteria**:
- Clear button works
- UI resets properly

---

#### TC3.4: Leaderboard Search
**Steps**:
1. Go to /leaderboard
2. Type search term
3. Select sector filter
4. Observe

**Expected**:
- ✅ Results filter in real-time
- ✅ Works with sector filter
- ✅ Empty state shows if no match
- ✅ Works with all tabs (All Time/Monthly/Weekly)

**Pass Criteria**:
- Real-time filtering works
- Combines with other filters
- No console errors

---

#### TC3.5: Search - No Results
**Steps**:
1. Search for non-existent term "XYZABC123"
2. Observe

**Expected**:
- ✅ Shows "No profiles found" message
- ✅ No error thrown
- ✅ Can search again

**Pass Criteria**:
- Graceful empty state
- Can recover

---

## 💬 Task 4: Reply System Testing

### Test Cases:

#### TC4.1: Reply Button - Logged Out
**Steps**:
1. Log out
2. View review on profile
3. Observe reply button

**Expected**:
- ✅ Reply button visible
- ✅ Clicking shows "Sign in to reply"
- ✅ No input shown

**Pass Criteria**:
- Auth required
- Clear messaging

---

#### TC4.2: Post Reply
**Steps**:
1. Log in
2. Click "Reply" on review
3. Type reply (< 200 chars)
4. Click "Post Reply"

**Expected**:
- ✅ Reply input appears
- ✅ Character counter works
- ✅ Reply posts successfully
- ✅ Toast: "Reply posted!"
- ✅ Reply appears in thread
- ✅ Input clears and hides

**Pass Criteria**:
- Reply saves to Firestore
- Appears immediately
- UI updates correctly

---

#### TC4.3: Reply Character Limit
**Steps**:
1. Click "Reply"
2. Type 201 characters
3. Try to submit

**Expected**:
- ✅ Input limits to 200 chars
- ✅ Counter shows in red when < 20
- ✅ Submit button disabled if > 200

**Pass Criteria**:
- Hard limit enforced
- Visual feedback given

---

#### TC4.4: Show/Hide Replies
**Steps**:
1. Find review with replies
2. Click "Show Replies (X)"
3. Observe replies appear
4. Click "Hide Replies (X)"

**Expected**:
- ✅ Replies expand/collapse
- ✅ Button text toggles
- ✅ Icon changes (ChevronUp/Down)
- ✅ Smooth animation

**Pass Criteria**:
- Toggle works smoothly
- State maintained

---

#### TC4.5: Reply Display
**Steps**:
1. View expanded replies
2. Observe layout

**Expected**:
- ✅ Replies indented with left border
- ✅ Smaller avatars (8x8)
- ✅ Username and timestamp shown
- ✅ Reply text displayed

**Pass Criteria**:
- Visual hierarchy clear
- Readable on mobile

---

#### TC4.6: Cancel Reply
**Steps**:
1. Click "Reply"
2. Type some text
3. Click "Cancel"

**Expected**:
- ✅ Input hides
- ✅ Text discarded
- ✅ No data saved

**Pass Criteria**:
- Cancel works
- No side effects

---

## 🏆 Task 5: Gamified Leaderboards Testing

### Test Cases:

#### TC5.1: All Time Leaderboard
**Steps**:
1. Go to /leaderboard
2. Verify "All Time" tab selected by default
3. Observe

**Expected**:
- ✅ Profiles sorted by rating (desc)
- ✅ Top 3 show trophy badges
- ✅ Positions 4+ show rank numbers
- ✅ Trophy colors correct (gold/silver/bronze)

**Pass Criteria**:
- Correct sorting
- Trophies displayed
- No errors

---

#### TC5.2: Weekly Leaderboard
**Steps**:
1. Click "Weekly" tab
2. Wait for calculation
3. Observe results

**Expected**:
- ✅ Profiles with ratings in last 7 days
- ✅ Sorted by rating count (desc)
- ✅ Top 3 show trophies
- ✅ Empty if no recent ratings

**Pass Criteria**:
- Calculation correct
- Data refreshes
- Performance acceptable (< 3s)

---

#### TC5.3: Monthly Leaderboard
**Steps**:
1. Click "Monthly" tab
2. Wait for calculation
3. Observe results

**Expected**:
- ✅ Profiles with ratings in last 30 days
- ✅ Sorted by rating count
- ✅ Top 3 show trophies
- ✅ Different from weekly

**Pass Criteria**:
- Month calculation correct
- Distinct from weekly
- Performance OK

---

#### TC5.4: Trophy Badge - 1st Place
**Steps**:
1. View top profile in any leaderboard
2. Observe trophy badge

**Expected**:
- ✅ Gold crown icon (👑)
- ✅ Yellow/gold color (#EAB308)
- ✅ Positioned top-right of card
- ✅ Glow effect

**Pass Criteria**:
- Visually distinct
- Position correct

---

#### TC5.5: Trophy Badge - 2nd & 3rd
**Steps**:
1. View 2nd and 3rd profiles
2. Observe badges

**Expected**:
- ✅ 2nd: Silver trophy (🥈, gray)
- ✅ 3rd: Bronze medal (🥉, orange)
- ✅ Correct positioning
- ✅ Appropriate colors

**Pass Criteria**:
- Colors correct
- Icons appropriate

---

#### TC5.6: Rank Badge - 4th+
**Steps**:
1. View profiles ranked 4 and below
2. Observe rank badges

**Expected**:
- ✅ Shows "#4", "#5", etc.
- ✅ Positioned top-left
- ✅ Gray/muted color
- ✅ Circular badge

**Pass Criteria**:
- Numbers correct
- Position consistent

---

#### TC5.7: Tab Switching
**Steps**:
1. Switch between tabs rapidly
2. Observe behavior

**Expected**:
- ✅ Smooth transitions
- ✅ Data updates correctly
- ✅ No flash of wrong content
- ✅ No multiple fetches

**Pass Criteria**:
- Responsive switching
- No errors
- Data cached if possible

---

#### TC5.8: Leaderboard with Filters
**Steps**:
1. Select "Monthly" tab
2. Choose sector filter
3. Type search term

**Expected**:
- ✅ All filters work together
- ✅ Results respect all filters
- ✅ Trophy badges still show for filtered top 3

**Pass Criteria**:
- Combined filtering works
- Trophies update for filtered results

---

## 🔄 Integration Testing

### INT1: Full User Journey
**Steps**:
1. Anonymous: Visit homepage → Search profile → View
2. Sign in
3. Rate profile (4 stars)
4. Add comment "Excellent!"
5. View leaderboard
6. Reply to someone's review
7. Check weekly leaderboard

**Expected**:
- ✅ All features work seamlessly
- ✅ No authentication errors
- ✅ Data persists across pages
- ✅ UI updates in real-time

**Pass Criteria**:
- Complete flow works
- No errors at any step

---

### INT2: Multi-User Interaction
**Steps**:
1. User A: Rates profile (5 stars)
2. User B: Rates same profile (4 stars)
3. User C: Searches for profile
4. User A: Replies to User B's review
5. All: Check leaderboard

**Expected**:
- ✅ Profile rating updates correctly
- ✅ Search finds profile
- ✅ Reply appears for all users
- ✅ Leaderboard reflects new ratings

**Pass Criteria**:
- Real-time updates work
- No race conditions

---

## 📱 Responsive Testing

### RES1: Mobile (375px)
**Test All Features At**:
- iPhone SE width (375px)

**Expected**:
- ✅ Banner displays correctly
- ✅ Search full-width
- ✅ 1 column grid
- ✅ Replies readable
- ✅ Trophies visible
- ✅ No horizontal scroll

---

### RES2: Tablet (768px)
**Test All Features At**:
- iPad width (768px)

**Expected**:
- ✅ 2 column grid
- ✅ Search medium width
- ✅ Tabs display properly
- ✅ Reply threads indented correctly

---

### RES3: Desktop (1280px+)
**Test All Features At**:
- Desktop width (1280px)

**Expected**:
- ✅ 3 column grid
- ✅ Search fixed width
- ✅ All features accessible
- ✅ Optimal spacing

---

## 🔒 Security Testing

### SEC1: Authorization Checks
**Tests**:
- [ ] Can't rate without login
- [ ] Can't comment without login
- [ ] Can't reply without login
- [ ] Can view without login

**Expected**:
- All write operations require auth
- Read operations public

---

### SEC2: Input Validation
**Tests**:
- [ ] Review text: max 250 chars
- [ ] Reply text: max 200 chars
- [ ] Search: no injection
- [ ] Rating: 1-5 only

**Expected**:
- All limits enforced
- No malicious input accepted

---

## ⚡ Performance Testing

### PERF1: Page Load Times
**Measure**:
- Homepage: _____ ms
- Leaderboard: _____ ms
- ProfileView: _____ ms
- Search results: _____ ms

**Target**: < 2 seconds on 4G

---

### PERF2: Firestore Reads
**Monitor**:
- Homepage: _____ reads
- Leaderboard All: _____ reads
- Leaderboard Weekly: _____ reads
- Profile with replies: _____ reads

**Optimize**: If exceeds budget

---

## 🐛 Bug Report Template

```
Bug ID: BUG-XXX
Feature: [Banner/Rating/Search/Reply/Gamification]
Severity: [Critical/High/Medium/Low]

Description:
[What went wrong]

Steps to Reproduce:
1. 
2. 
3. 

Expected Behavior:
[What should happen]

Actual Behavior:
[What actually happened]

Screenshots:
[Attach if applicable]

Environment:
- Browser: [Chrome/Firefox/Safari]
- OS: [Windows/Mac/iOS/Android]
- Screen Size: [Mobile/Tablet/Desktop]
- Account Type: [Anonymous/Logged In/Admin]

Console Errors:
[Paste console output]
```

---

## ✅ Testing Checklist Summary

### Feature Completeness:
- [ ] Task 1: Banner (5 test cases)
- [ ] Task 2: Rating Flow (4 test cases)
- [ ] Task 3: Search (5 test cases)
- [ ] Task 4: Replies (6 test cases)
- [ ] Task 5: Gamification (8 test cases)

### Integration:
- [ ] Full user journey (INT1)
- [ ] Multi-user interaction (INT2)

### Responsiveness:
- [ ] Mobile (RES1)
- [ ] Tablet (RES2)
- [ ] Desktop (RES3)

### Security:
- [ ] Authorization (SEC1)
- [ ] Input validation (SEC2)

### Performance:
- [ ] Load times (PERF1)
- [ ] Firestore reads (PERF2)

---

## 📊 Test Results

| Test Area | Pass | Fail | Skip | Notes |
|-----------|------|------|------|-------|
| Banner | __/5 | __/5 | __/5 | |
| Rating Flow | __/4 | __/4 | __/4 | |
| Search | __/5 | __/5 | __/5 | |
| Replies | __/6 | __/6 | __/6 | |
| Gamification | __/8 | __/8 | __/8 | |
| Integration | __/2 | __/2 | __/2 | |
| Responsive | __/3 | __/3 | __/3 | |
| Security | __/2 | __/2 | __/2 | |
| Performance | __/2 | __/2 | __/2 | |
| **TOTAL** | __/37 | __/37 | __/37 | |

---

**Testing Status**: ⏳ In Progress  
**Last Updated**: January 7, 2025  
**Tester**: _______________  
**Sign-off**: _______________
