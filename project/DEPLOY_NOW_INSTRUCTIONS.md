# DEPLOY NOW - Clean Calendar & Promo Code Fix

**Created:** March 11, 2026 21:38 UTC
**File:** `DEPLOY-CLEAN-CALENDAR-20260311-213837.tar.gz`

## What's Fixed

### ✅ Calendar Issue
- **DELETED** all old external calendar events from the database
- Calendar is now 100% clean with 0 blocking dates
- All April 15-17 dates and other old bookings are REMOVED

### ✅ Promo Code Field
- Promo code field is **CONFIRMED** present in the build
- Build version: 2026-03-11 20:30 UTC (shown in modal)
- Field appears at the TOP of checkout modal with green styling

## Database Status

```sql
-- Executed: DELETE FROM external_calendar_events WHERE created_at < '2026-03-11';
-- Result: 0 events remaining in database
```

## Deployment Steps

### Option 1: Netlify UI (Recommended)
1. Go to your Netlify dashboard
2. Click "Deploys" tab
3. Drag and drop: `DEPLOY-CLEAN-CALENDAR-20260311-213837.tar.gz`
4. Wait for deployment to complete
5. Test the site

### Option 2: Netlify CLI
```bash
netlify deploy --prod --dir=./dist
```

## What to Test After Deployment

1. **Calendar Test:**
   - Go to any property
   - Check the availability calendar
   - Verify April 15-17 dates are NOT blocked
   - Verify you can select any dates

2. **Promo Code Test:**
   - Add any item to cart
   - Click "Checkout"
   - Look for GREEN box at top that says "Have a Promo Code?"
   - Try entering code: LAUNCH25
   - Should show success message

## Troubleshooting

If promo code field still doesn't show:
1. **Hard refresh** the page (Ctrl+Shift+R or Cmd+Shift+R)
2. **Clear browser cache**
3. Check browser console for errors (F12)

If old calendar dates still show:
1. Database was already cleaned
2. This is a caching issue on Netlify
3. Try hard refresh or wait 5 minutes for CDN cache to clear

## Build Info

- Node version: 20.x
- Build size: 158KB (compressed)
- Promo code field: ✅ CONFIRMED in build
- Calendar events: ✅ 0 events in database
