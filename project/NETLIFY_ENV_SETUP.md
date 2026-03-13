# Netlify Environment Variables Setup

## Critical Issue

Your site is currently broken because Netlify doesn't have the required environment variables set. The build completes, but the JavaScript cannot connect to Supabase at runtime.

## Required Environment Variables

You MUST set these three environment variables in the Netlify Dashboard:

1. `VITE_SUPABASE_URL`
2. `VITE_SUPABASE_ANON_KEY`
3. `VITE_STRIPE_PUBLISHABLE_KEY`

## How to Set Environment Variables in Netlify

### Step 1: Go to Site Settings
1. Log into [Netlify](https://app.netlify.com/)
2. Select your site: **tkacvacations.netlify.app**
3. Click on **Site settings** in the top navigation

### Step 2: Navigate to Environment Variables
1. In the left sidebar, click **Environment variables** (under "Site settings")
2. Click the **Add a variable** button

### Step 3: Add Each Variable
For each of the three variables above:

1. Click **Add a variable**
2. In the "Key" field, enter the variable name exactly as shown (e.g., `VITE_SUPABASE_URL`)
3. In the "Values" field, enter the actual value from your `.env` file
4. Under "Scopes", select **All** (or at minimum "Production")
5. Click **Save**

### Step 4: Get Values from .env

Your local `.env` file contains the values. You can view them with:

```bash
cat .env
```

Copy each value and paste it into Netlify.

### Step 5: Redeploy

After adding all three variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Clear cache and deploy site**

The next build will show the environment check and should pass.

## Verification

After the build completes, you'll see this output in the build logs:

```
🔍 Netlify Environment Variables Check

==================================================
✓ VITE_SUPABASE_URL: SET (https://...)
✓ VITE_SUPABASE_ANON_KEY: SET (eyJhbGciOiJIUzI1NiIs...)
✓ VITE_STRIPE_PUBLISHABLE_KEY: SET (pk_test_...)
==================================================

✓ All environment variables are set!
```

## Common Issues

### Issue: Variables show as "NOT SET" in build logs
- Check that you added them in the Netlify dashboard, not just in your local `.env` file
- Make sure the "Scopes" include "Production" or "All"
- Verify there are no typos in the variable names

### Issue: Build fails with "Missing required environment variables"
- This is expected and correct behavior when variables are not set
- Follow the steps above to add them

### Issue: Node version warning
- The site is configured to use Node 20
- If Netlify uses Node 18, the build will still work but you may see warnings

## Why This Happens

Vite bakes environment variables into the JavaScript at build time. The values you set in Netlify's dashboard are available during the build process and get compiled into the final JavaScript bundle. Without them, the code tries to connect to `undefined` URLs, which causes the error you're seeing.
