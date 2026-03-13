# Netlify Deployment Setup

## Environment Variables Configuration

Your site is currently deployed but missing required environment variables. Follow these steps to configure them:

### Step 1: Access Netlify Dashboard

1. Log in to [Netlify](https://app.netlify.com/)
2. Select your site from the dashboard
3. Go to **Site settings** → **Environment variables**

### Step 2: Add Environment Variables

Add the following environment variables:

#### Required Variables:

| Variable Name | Value |
|--------------|-------|
| `VITE_SUPABASE_URL` | `https://dihmwdryzulyesdgvzzk.supabase.co` |
| `VITE_SUPABASE_ANON_KEY` | `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpaG13ZHJ5enVseWVzZGd2enprIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NjgwMTEzODgsImV4cCI6MjA4MzU4NzM4OH0.4KxcZFbnifbyCyOvzFQkPXi23VUMIZqJkqad7Mwserk` |
| `VITE_STRIPE_PUBLISHABLE_KEY` | `pk_live_51SpIZzBsSWo6V7QNcmrEkKqnHPNFkJE6Zg2PSToGgZLjiU2dWoPYrJoB0qMseAhIYYq8vmqBxoMhXREjKWVhlboV00igMsm6tz` |

### Step 3: Redeploy

After adding the environment variables:

1. Go to **Deploys** tab
2. Click **Trigger deploy** → **Deploy site**

OR

Simply push a new commit to your repository to trigger an automatic deployment.

### Step 4: Verify

Once the deployment completes, visit your site. The error should be resolved and your site should load correctly.

## Why This Happens

- The `.env` file in your repository is only used for local development
- Netlify doesn't read `.env` files for security reasons
- Environment variables must be explicitly configured in the Netlify Dashboard
- Vite automatically picks up variables prefixed with `VITE_` during build time

## Troubleshooting

If you still see errors after following these steps:

1. Double-check that variable names are exactly as shown (case-sensitive)
2. Ensure there are no extra spaces in the values
3. Verify the deployment completed successfully
4. Clear your browser cache and hard refresh (Ctrl+Shift+R or Cmd+Shift+R)
