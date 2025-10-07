# 🏗️ Architecture & Feature Map

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     RateHere Platform                        │
│                                                              │
│  ┌────────────┐  ┌────────────┐  ┌────────────┐           │
│  │   Public   │  │   Auth     │  │   Admin    │           │
│  │   Access   │  │   Users    │  │   Panel    │           │
│  └────────────┘  └────────────┘  └────────────┘           │
└─────────────────────────────────────────────────────────────┘
         │                │                │
         ▼                ▼                ▼
┌─────────────────────────────────────────────────────────────┐
│                    Feature Layer                             │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │  Search  │  │  Rating  │  │  Reply   │  │ Gamify   │  │
│  │  System  │  │  System  │  │  System  │  │  System  │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
         │                │                │                │
         └────────────────┴────────────────┴────────────────┘
                          │
                          ▼
┌─────────────────────────────────────────────────────────────┐
│                   Data Layer (Firestore)                     │
│                                                              │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌──────────┐  │
│  │ profiles │  │ ratings  │  │ reviews  │  │  review  │  │
│  │          │  │          │  │          │  │  Replies │  │
│  └──────────┘  └──────────┘  └──────────┘  └──────────┘  │
└─────────────────────────────────────────────────────────────┘
```

---

## Feature Flow Diagrams

### 🔍 Search Feature

```
┌──────────────┐
│  User Types  │
│  in Search   │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│  ProfileSearch       │
│  Component           │
│  - Debounce input    │
│  - Clear button      │
└──────┬───────────────┘
       │
       ├──────► Homepage Search
       │        ├─ Fetch profiles
       │        ├─ Filter locally
       │        └─ Show results (max 6)
       │
       └──────► Leaderboard Search
                ├─ Filter existing data
                ├─ Apply with sector filter
                └─ Real-time results
```

### ⭐ Rating Flow

```
Anonymous User              Logged In User
      │                            │
      ▼                            ▼
┌──────────┐              ┌──────────────┐
│   View   │              │ Click Stars  │
│ Profile  │              │   (1-5)      │
└──────────┘              └──────┬───────┘
      │                          │
      │                          ▼
      │                  ┌──────────────────┐
      │                  │ Comment Field    │
      │                  │ Appears          │
      │                  │ (Optional)       │
      │                  └──────┬───────────┘
      │                         │
      │                         ▼
      │                  ┌──────────────────┐
      │                  │ Submit Button    │
      │                  │ - With comment   │
      │                  │ - Without comment│
      │                  └──────┬───────────┘
      │                         │
      │                         ▼
      │                  ┌──────────────────┐
      │                  │ Save to DB       │
      │                  │ - ratings col    │
      │                  │ - reviews col    │
      │                  └──────────────────┘
      │
      ▼
  Can only view
```

### 💬 Reply System

```
┌──────────────┐
│   Review     │
│   Display    │
└──────┬───────┘
       │
       ▼
┌──────────────────────┐
│   Reply Button       │
│   Clicked            │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   ReplyInput         │
│   Component          │
│   - Max 200 chars    │
│   - Cancel option    │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Post Reply         │
│   - Save to          │
│     reviewReplies    │
│   - Link to reviewId │
└──────┬───────────────┘
       │
       ▼
┌──────────────────────┐
│   Fetch Replies      │
│   - Load for review  │
│   - Display nested   │
│   - Show/Hide toggle │
└────────────────────── ┘
```

### 🏆 Gamification System

```
┌──────────────────────┐
│   Leaderboard Page   │
└──────┬───────────────┘
       │
       ├──────► All Time Tab
       │        ├─ Order by rating
       │        ├─ Show all profiles
       │        └─ Trophy top 3
       │
       ├──────► Monthly Tab
       │        ├─ Get ratings (30 days)
       │        ├─ Count per profile
       │        ├─ Sort by count
       │        └─ Trophy top 3
       │
       └──────► Weekly Tab
                ├─ Get ratings (7 days)
                ├─ Count per profile
                ├─ Sort by count
                └─ Trophy top 3

Trophy System:
  Rank 1 → 👑 Gold Crown
  Rank 2 → 🥈 Silver Trophy
  Rank 3 → 🥉 Bronze Medal
  Rank 4+ → #N Badge
```

---

## Component Hierarchy

```
App
│
├─ Navigation
│
├─ Index (Homepage)
│  ├─ ProfileSearch ← NEW
│  ├─ Search Results Section ← NEW
│  └─ Top Profiles Section
│
├─ Leaderboard
│  ├─ ProfileSearch ← NEW
│  ├─ Period Tabs ← NEW
│  │  ├─ All Time
│  │  ├─ Monthly
│  │  └─ Weekly
│  └─ ProfileCard Grid
│     └─ TrophyBadge ← NEW (per card)
│
├─ ProfileView
│  ├─ Banner Display ← NEW
│  │  └─ Profile Logo (on top)
│  ├─ Rating Section ← UPDATED
│  │  ├─ StarRating
│  │  └─ ReviewInput ← UPDATED
│  └─ ReviewsList ← UPDATED
│     ├─ Review Card
│     │  ├─ Reply Button ← NEW
│     │  ├─ ReplyInput ← NEW
│     │  └─ Replies Display ← NEW
│     └─ ... (multiple reviews)
│
└─ Dashboard (Unchanged)
```

---

## Data Flow

### Rating & Review Flow

```
User Action              Frontend                Firestore
    │                       │                        │
    ▼                       │                        │
[Click Star]────────►  handleRating()               │
                           │                         │
                           ├──► Save to ratings ────►│
                           │         collection      │
                           │                         │
                           ├──► Update profile ─────►│
                           │         rating/count    │
                           │                         │
                           └──► Update local ────────┘
                                state
                                   │
                                   ▼
                           [Show Comment Field]
                                   │
                                   ▼
                           [User adds comment]
                                   │
                                   ▼
                           handleReviewSubmit()
                                   │
                                   ├──► Save to reviews ────►
                                   │         collection
                                   │
                                   └──► Refresh list ────────
```

### Reply System Flow

```
User Action              Frontend                Firestore
    │                       │                        │
    ▼                       │                        │
[Click Reply]───────►  toggleReplyInput()           │
                           │                         │
                           ▼                         │
                    [Show ReplyInput]                │
                           │                         │
                           ▼                         │
                    [User writes reply]              │
                           │                         │
                           ▼                         │
                    [Click Post]                     │
                           │                         │
                           ├──► Add to reviewReplies►│
                           │                         │
                           ├──► Fetch updated ◄──────┤
                           │         replies         │
                           │                         │
                           └──► Show in thread ──────┘
```

### Leaderboard Calculation Flow

```
Page Load              Frontend                Firestore
    │                       │                        │
    ▼                       │                        │
[Visit Leaderboard]─►  fetchProfiles()              │
                           │                         │
                           ├──► Get all profiles ◄───┤
                           │                         │
                           ├──► Get recent ratings◄──┤
                           │    (7 days for weekly)  │
                           │    (30 days for monthly)│
                           │                         │
                           ├──► Count ratings        │
                           │    per profile          │
                           │                         │
                           ├──► Sort by count        │
                           │                         │
                           └──► Display with ────────┘
                                trophies
```

---

## State Management

### ProfileView State

```
┌─────────────────────────┐
│   ProfileView State     │
├─────────────────────────┤
│ profile              │ Profile data
│ userRating           │ Current user's rating
│ hasRated             │ Bool - rated or not
│ hasReviewed          │ Bool - reviewed or not
│ showAllReviews       │ Bool - modal state
│ reviewsRefreshTrigger│ Counter for refresh
└─────────────────────────┘
```

### ReviewsList State

```
┌─────────────────────────┐
│   ReviewsList State     │
├─────────────────────────┤
│ reviews              │ Array of reviews
│ replies              │ Map<reviewId, Reply[]>
│ showRepliesFor       │ Set<reviewId> (expanded)
│ showReplyInputFor    │ string | null (active)
│ loading              │ Bool - fetch state
│ totalReviews         │ Number - count
└─────────────────────────┘
```

### Leaderboard State

```
┌─────────────────────────┐
│   Leaderboard State     │
├─────────────────────────┤
│ profiles             │ All profiles
│ weeklyProfiles       │ Weekly leaders
│ monthlyProfiles      │ Monthly leaders
│ filteredProfiles     │ After filters
│ selectedSector       │ Sector filter
│ searchTerm           │ Search query
│ selectedPeriod       │ Tab selection
│ sectors              │ Unique sectors
│ loading              │ Bool - fetch state
└─────────────────────────┘
```

---

## Database Schema

### Collections Overview

```
Firestore
│
├─ profiles/
│  ├─ {profileId}
│  │  ├─ name: string
│  │  ├─ username: string
│  │  ├─ sector: string
│  │  ├─ logoUrl: string
│  │  ├─ bannerUrl: string ← NEW
│  │  ├─ rating: number
│  │  ├─ ratingCount: number
│  │  └─ ... other fields
│
├─ ratings/
│  ├─ {ratingId}
│  │  ├─ profileId: string
│  │  ├─ userId: string
│  │  ├─ ratingValue: number
│  │  └─ createdAt: Timestamp ← Used for leaderboards
│
├─ reviews/
│  ├─ {reviewId}
│  │  ├─ profileId: string
│  │  ├─ userId: string
│  │  ├─ ratingValue: number
│  │  ├─ reviewText: string
│  │  ├─ userName: string
│  │  ├─ userPhoto: string
│  │  └─ timestamp: Timestamp
│
└─ reviewReplies/ ← NEW COLLECTION
   ├─ {replyId}
   │  ├─ reviewId: string ← FK to reviews
   │  ├─ userId: string
   │  ├─ userName: string
   │  ├─ userPhoto: string
   │  ├─ replyText: string
   │  └─ timestamp: Timestamp
```

---

## Responsive Breakpoints

```
Mobile            Tablet            Desktop
< 768px           768-1024px        > 1024px
│                 │                 │
├─ 1 column       ├─ 2 columns      ├─ 3 columns
├─ Full-width     ├─ Medium width   ├─ Fixed width
├─ Stacked        ├─ Side-by-side   ├─ Optimal space
└─ Simplified     └─ Balanced       └─ Full features

Search:
Mobile:           Tablet:           Desktop:
100% width        ~400px            ~500px max

Cards:
Mobile:           Tablet:           Desktop:
1 per row         2 per row         3 per row
Full width        ~48% width        ~32% width

Navigation:
Mobile:           Tablet:           Desktop:
Hamburger menu    Horizontal        Horizontal
Collapsed         Expanded          Expanded
```

---

## Icon Legend

```
🔍 Search         - ProfileSearch component
⭐ Rating         - Star rating system
💬 Reply          - Reply/comment features
🏆 Trophy         - Gamification elements
👑 Crown          - 1st place trophy
🥈 Trophy Icon    - 2nd place trophy
🥉 Medal          - 3rd place trophy
🖼️ Banner         - Profile banner image
📅 Calendar       - Monthly leaderboard
📈 Trending       - Weekly leaderboard
⬆️ Chevron Up     - Collapse replies
⬇️ Chevron Down   - Expand replies
✅ Checkmark      - Completed feature
❌ X Mark         - Not allowed
```

---

## Performance Metrics

```
Component Load Times (Estimated):
┌──────────────────────┬──────────┐
│ Homepage             │  < 1s    │
│ Leaderboard          │  1-2s    │
│ ProfileView          │  < 1s    │
│ Search Results       │  < 500ms │
│ Reply Fetch          │  < 300ms │
│ Weekly Leaderboard   │  2-3s    │
│ Monthly Leaderboard  │  2-3s    │
└──────────────────────┴──────────┘

Bundle Size:
┌──────────────────────┬──────────┐
│ Total                │ 1.45 MB  │
│ JavaScript           │ 1.44 MB  │
│ CSS                  │ 72 KB    │
│ Gzipped              │ ~394 KB  │
└──────────────────────┴──────────┘

Firestore Reads (Per Page Load):
┌──────────────────────┬──────────┐
│ Homepage             │ 3-6      │
│ Leaderboard (All)    │ N        │
│ Leaderboard (Week)   │ N + R    │
│ Leaderboard (Month)  │ N + R    │
│ ProfileView          │ 5-8      │
│ Reply Fetch          │ 1-10     │
└──────────────────────┴──────────┘
N = Number of profiles
R = Number of recent ratings
```

---

## Quick Navigation Map

```
File Location Map:
src/
  ├─ components/
  │  ├─ ProfileSearch.tsx ────► Search feature
  │  ├─ ReplyInput.tsx ───────► Reply system
  │  ├─ TrophyBadge.tsx ──────► Gamification
  │  ├─ ReviewsList.tsx ──────► Updated with replies
  │  └─ ReviewInput.tsx ──────► Optional comments
  │
  ├─ pages/
  │  ├─ Index.tsx ────────────► Homepage + search
  │  ├─ Leaderboard.tsx ──────► Gamification hub
  │  └─ ProfileView.tsx ──────► Banner + rating
  │
  └─ docs/
     ├─ NEW_FEATURES_IMPLEMENTATION.md
     ├─ QUICK_REFERENCE.md
     ├─ COMPLETE_IMPLEMENTATION_REPORT.md
     └─ ARCHITECTURE.md (this file)
```

---

**Last Updated**: January 7, 2025  
**Version**: 2.0.0  
**Status**: ✅ Complete
