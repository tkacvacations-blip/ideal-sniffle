# Netlify Environment Variables Setup

## Critical: Your deployment is built but not functional yet!

The build succeeded, but the app needs environment variables to run properly.

## Required Environment Variables

You MUST add these three environment variables in Netlify:

### 1. Go to Netlify Dashboard
- Navigate to: **Site settings → Environment variables**
- Or direct link: `https://app.netlify.com/sites/YOUR_SITE_NAME/settings/env`

### 2. Add These Variables

#### VITE_SUPABASE_URL
- **Value**: Your Supabase project URL
- **Format**: `https://xxxxxxxxxxxxx.supabase.co`
- **Where to find it**:
  - Supabase Dashboard → Project Settings → API
  - Look for "Project URL"

#### VITE_SUPABASE_ANON_KEY
- **Value**: Your Supabase anonymous/public key
- **Where to find it**:
  - Supabase Dashboard → Project Settings → API
  - Look for "Project API keys" → "anon" / "public"
  - This is the PUBLIC key (safe to expose in frontend)

#### VITE_STRIPE_PUBLISHABLE_KEY
- **Value**: Your Stripe publishable key
- **Format**: `pk_test_...` or `pk_live_...`
- **Where to find it**:
  - Stripe Dashboard → Developers → API keys
  - Look for "Publishable key"
  - Use TEST key for testing, LIVE key for production

### 3. Set Scope
- Set all variables to: **"All deploys"** or at minimum **"Production"**

### 4. Redeploy
After adding the variables:
- Go to: **Deploys** tab
- Click: **Trigger deploy → Clear cache and deploy site**

## Verification

After redeploying, check your site:
1. Open the browser console (F12)
2. You should NOT see "Missing Supabase environment variables"
3. Try logging in or using a feature that requires Supabase

## Current Error

The error you're seeing:
```
Invalid supabaseUrl: Must be a valid HTTP or HTTPS URL
```

This happens because `VITE_SUPABASE_URL` is not set, so it's empty/undefined.

## Need Help Finding Your Keys?

### Supabase Keys
1. Go to https://supabase.com/dashboard
2. Select your project
3. Click the gear icon (⚙️) for Settings
4. Click "API" in the left sidebar
5. Copy the values shown

### Stripe Keys
1. Go to https://dashboard.stripe.com
2. Click "Developers" in the left sidebar
3. Click "API keys"
4. Copy the "Publishable key" (NOT the Secret key)

## Important Notes

- These are FRONTEND environment variables (prefixed with `VITE_`)
- They are embedded in the build at build-time
- You MUST redeploy after changing them
- The Stripe and Supabase ANON keys are safe to expose (they're meant for frontend use)
- NEVER use Supabase SERVICE_ROLE key or Stripe SECRET key in frontend code
