# Fix Netlify Node v18 Override Issue

## Problem
Even though you set `NODE_VERSION=20.18.1` in Netlify dashboard, the build logs show:
```
9:55:48 AM: Now using node v18.20.8 (npm v10.8.2)
```

Netlify's build image is **ignoring your NODE_VERSION setting** and using a pre-installed Node v18.

## Root Cause
The deploy log shows:
```
9:55:47 AM: mise ~/.config/mise/config.toml tools: python@3.14.3
9:55:47 AM: mise ~/.config/mise/config.toml tools: ruby@3.4.8
9:55:47 AM: v18.20.8 is already installed.
```

Netlify's build system has Node v18 pre-installed and is defaulting to it.

## Solution

### Option 1: Update Environment Variable (Recommended)

1. Go to Netlify Dashboard → **Site configuration** → **Environment variables**
2. **Delete** the existing `NODE_VERSION` variable
3. **Add it back** with value: `20` (not 20.18.1)
4. Make sure scope includes: **Production** and **Deploy previews**

### Option 2: Force Node 20 in Build Command

Update your `netlify.toml` build command to explicitly use Node 20:

```toml
[build]
  command = """
    export PATH=$HOME/.nvm/versions/node/v20/bin:$PATH && \
    node --version && \
    npm run build
  """
  publish = "dist"
```

### Step 2: Clear Everything

1. **Clear build cache**: Site configuration → Build & deploy → Clear build cache
2. **Clear CDN cache**: Site configuration → Build & deploy → Post processing → Clear cache and retry deploy
3. **Hard refresh browser**: Ctrl+Shift+R (Windows/Linux) or Cmd+Shift+R (Mac)

### Step 3: Trigger New Deploy

Push these latest changes or manually trigger a deploy.

## Files Updated

✅ `.nvmrc` → Changed to `20`
✅ `.node-version` → Changed to `20`
✅ `netlify.toml` → Using `NODE_VERSION = "20"`
✅ `.npmrc` → Added to suppress engine warnings

## Verify After Deploy

Check the build logs for:
```
Now using node v20.x.x (npm v10.x.x)
```

NOT:
```
Now using node v18.20.8  ← BAD!
```

## Promo Code Visibility

The promo code field **is in the code** and has:
- ✅ Bright green 3px border
- ✅ Large "Have a Promo Code?" heading
- ✅ Positioned between order summary and customer info
- ✅ URL parameter support (`?promo=CODE`)

If you still don't see it after fixing Node version:
1. Hard refresh browser (Ctrl+Shift+R)
2. Open in incognito/private window
3. Check browser console for JavaScript errors
4. Verify checkout modal opens (click cart → checkout)

## Required Environment Variables

Make sure these are set in Netlify:
- `VITE_SUPABASE_URL` - Your Supabase project URL
- `VITE_SUPABASE_ANON_KEY` - Your Supabase anon key
- `VITE_STRIPE_PUBLISHABLE_KEY` - Optional, only for payments

## Why Node 20 Matters

Your app uses:
- `react-router-dom@7.12.0` requires Node >= 20
- Modern JavaScript features that may fail on Node v18
- The promo code feature may have compatibility issues with older Node

## Next Steps

1. Update NODE_VERSION to `20` in Netlify dashboard
2. Push these file changes to trigger new deploy
3. Watch build logs to confirm Node v20 is used
4. Test promo code field after successful deploy
