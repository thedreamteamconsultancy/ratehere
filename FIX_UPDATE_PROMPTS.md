# 🔧 Fix: Continuous Update Prompts

## Issue
The app keeps asking "New version available! Click OK to update." repeatedly in development mode.

## Root Cause
1. Service worker was enabled in development mode
2. Vite PWA plugin was regenerating service worker on every change
3. Update check was running every 60 seconds
4. No flag to prevent multiple prompts

## Solution Applied ✅

### 1. Disabled Service Worker in Development
**File**: `src/hooks/use-service-worker.ts`

- Added check for `import.meta.env.DEV`
- Service worker only registers in production now
- Added `updatePromptShown` flag to prevent multiple prompts

### 2. Disabled PWA Plugin in Development
**File**: `vite.config.ts`

Changed:
```typescript
devOptions: {
  enabled: false, // Was: true
  type: 'module'
}
```

### 3. Improved Update Logic
- Update check now runs every **1 hour** (was 1 minute)
- Prompt only shows **once**
- If user declines, waits **5 minutes** before asking again
- Update check skipped if prompt already shown

## How to Fix Right Now

### Method 1: Quick Fix (Browser Console)
1. Open browser console (F12)
2. Copy and paste this code:
```javascript
navigator.serviceWorker.getRegistrations().then(regs => 
  regs.forEach(reg => reg.unregister())
);
caches.keys().then(keys => 
  keys.forEach(key => caches.delete(key))
);
localStorage.clear();
location.reload();
```
3. Press Enter
4. Page will reload without service worker

### Method 2: Using Clear Script
1. Open browser console (F12)
2. Copy contents of `clear-sw.js`
3. Paste in console and run
4. Refresh page

### Method 3: Manual DevTools
1. Open DevTools (F12)
2. Go to **Application** tab
3. Click **Service Workers** in left sidebar
4. Click **Unregister** for each service worker
5. Click **Clear storage** in left sidebar
6. Click **Clear site data** button
7. Refresh page

### Method 4: Restart Dev Server
1. Stop current dev server (Ctrl+C)
2. Run: `npm run dev`
3. Open browser
4. Should work without prompts now

## Current Behavior

### Development Mode (localhost)
- ✅ Service worker **disabled**
- ✅ No update prompts
- ✅ Normal hot reload
- ✅ Fast development

### Production Mode (after build)
- ✅ Service worker **enabled**
- ✅ Update prompts **only once**
- ✅ If declined, wait 5 minutes
- ✅ Check for updates every hour

## Testing

### Test Development Mode
```bash
npm run dev
# No service worker prompts should appear
```

### Test Production Mode
```bash
npm run build
npm run preview
# Service worker enabled, proper update detection
```

## Prevention

To avoid this in future:
1. ✅ Service worker disabled in dev (already done)
2. ✅ PWA plugin disabled in dev (already done)
3. ✅ Update flag prevents multiple prompts (already done)
4. ✅ Longer update check interval (already done)

## Verification

Run this in console to check service worker status:
```javascript
navigator.serviceWorker.getRegistrations().then(regs => {
  console.log('Active Service Workers:', regs.length);
  if (regs.length === 0) {
    console.log('✅ No service workers (expected in dev)');
  } else {
    console.log('⚠️ Service worker found:', regs);
  }
});
```

## If Issue Persists

1. Clear browser cache completely
2. Use incognito/private window
3. Try different browser
4. Check console for errors
5. Restart computer (cache may be stuck)

## Technical Details

### Before Fix
```typescript
// Update check every 60 seconds
setInterval(() => registration.update(), 60000);

// PWA plugin always enabled
devOptions: { enabled: true }

// No flag to prevent multiple prompts
// Service worker running in dev mode
```

### After Fix
```typescript
// Update check every 1 hour
setInterval(() => registration.update(), 60 * 60 * 1000);

// PWA plugin disabled in dev
devOptions: { enabled: false }

// Flag prevents multiple prompts
let updatePromptShown = false;

// Service worker disabled in dev
if (import.meta.env.DEV) return;
```

## Summary

✅ **Issue Fixed**
- Service worker disabled in development
- PWA plugin disabled in development  
- Update prompts controlled
- Better user experience

**Status**: Resolved ✅

**Next Steps**:
1. Clear service workers (see Method 1 above)
2. Restart dev server
3. Continue development without interruptions

---

**Note**: Service worker will still work perfectly in production after `npm run build`. This fix only affects development mode.
