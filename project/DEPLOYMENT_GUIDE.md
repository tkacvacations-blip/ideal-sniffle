# Complete Deployment Guide

This guide will walk you through deploying your vacation rental booking site to production with your Squarespace domain using Vercel.

## Prerequisites Checklist

- [ ] Node.js installed on your computer (you already have this from running the project)
- [ ] Squarespace domain access
- [ ] Supabase credentials (you already have these)
- [ ] Stripe LIVE API keys (not test keys)

---

## STEP 1: Install Vercel CLI

Open your terminal and install Vercel globally:

```bash
npm install -g vercel
```

That's it! No GitHub or account setup needed yet.

---

## STEP 2: Deploy Your Site

### 2.1 Navigate to Your Project

In your terminal, make sure you're in your project folder (where your code is).

### 2.2 Run the Deploy Command

```bash
vercel
```

Vercel will ask you some questions:

1. **Set up and deploy?** → Press `Y` (yes)
2. **Which scope?** → Choose "Create New Account" or log in if you have one
3. **Link to existing project?** → Press `N` (no, it's a new project)
4. **What's your project's name?** → Type `tkac-vacations` or whatever you prefer
5. **In which directory is your code located?** → Press Enter (current directory)
6. **Want to override settings?** → Press `N` (no)

Vercel will automatically:
- Detect it's a Vite project
- Build your site (`npm run build`)
- Deploy it to a URL

You'll get a **Production URL** like: `https://tkac-vacations.vercel.app`

### 2.3 Add Environment Variables

After deployment, add your environment variables:

```bash
vercel env add VITE_SUPABASE_URL
```

When prompted, paste your Supabase URL from your `.env` file

```bash
vercel env add VITE_SUPABASE_ANON_KEY
```

When prompted, paste your Supabase Anon Key from your `.env` file

```bash
vercel env add VITE_STRIPE_PUBLISHABLE_KEY
```

**⚠️ IMPORTANT - Use LIVE Stripe Key:**

You're currently using **TEST** keys. For production, you need a **LIVE** key:

1. Go to https://dashboard.stripe.com
2. Toggle "Test mode" to **OFF** (top right)
3. Go to Developers → API keys
4. Copy your **Publishable key** (starts with `pk_live_...`)
5. Paste this when prompted

### 2.4 Redeploy with Environment Variables

Now redeploy so the environment variables are included:

```bash
vercel --prod
```

Your site is now live at your Vercel URL!

---

## STEP 3: Configure Stripe for Production

### 3.1 Update Webhook Endpoint

Your Stripe webhooks are handled by Supabase Edge Functions. You need to configure Stripe to send webhooks to your Supabase function:

1. In Stripe Dashboard, go to **Developers → Webhooks**
2. Click "Add endpoint"
3. Enter: `<YOUR_SUPABASE_URL>/functions/v1/stripe-webhook` (use your Supabase URL from .env)
4. Select events to listen for:
   - `checkout.session.completed`
   - `payment_intent.succeeded`
   - `charge.refunded`
5. Click "Add endpoint"
6. Copy the **Signing secret** (starts with `whsec_...`)

### 3.2 Add Stripe Secrets to Supabase

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to Project Settings → Edge Functions → Secrets
4. Add these secrets (if not already added):
   - Name: `STRIPE_SECRET_KEY`
   - Value: Your Stripe **Secret key** (from Dashboard → API keys, starts with `sk_live_...`)
5. Add webhook secret:
   - Name: `STRIPE_WEBHOOK_SECRET`
   - Value: The webhook signing secret you just copied

---

## STEP 4: Connect Your Squarespace Domain

### 4.1 Add Domain in Vercel

1. Go to https://vercel.com/dashboard
2. Click on your project
3. Go to **Settings → Domains**
4. Click "Add"
5. Enter: `tkacvacations.com`
6. Click "Add"
7. Also add: `www.tkacvacations.com`

Vercel will show you the DNS records you need to add.

### 4.2 Configure Squarespace DNS

1. Log in to Squarespace
2. Go to **Settings → Domains**
3. Click on your domain `tkacvacations.com`
4. Click **Advanced Settings → Custom Records**

**Add these DNS records (Vercel will show you the exact values):**

**For root domain (tkacvacations.com):**
- Type: `A`
- Host: `@`
- Value: `76.76.21.21` (Vercel's IP)

**For www subdomain:**
- Type: `CNAME`
- Host: `www`
- Value: `cname.vercel-dns.com`

### 4.3 Verify Domain

1. Back in Vercel, click "Refresh" to check DNS
2. Wait 10-60 minutes for DNS to propagate
3. Vercel will automatically provision an SSL certificate (HTTPS)

---

## STEP 5: Update Supabase Settings

### 5.1 Add Your Domain to Supabase

1. Go to Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **Authentication → URL Configuration**
4. Add your domain to **Site URL**: `https://tkacvacations.com`
5. Add to **Redirect URLs**:
   - `https://tkacvacations.com/**`
   - `https://www.tkacvacations.com/**`

---

## STEP 6: Final Testing

### 6.1 Test Your Live Site

Visit `https://tkacvacations.com` and test:

- [ ] Site loads correctly
- [ ] Images display properly
- [ ] Login/signup works
- [ ] Booking flow works
- [ ] Calendar displays availability
- [ ] Cart functionality works
- [ ] **Make a test booking with a real card** (Stripe will charge, then refund it)

### 6.2 Test Stripe Payment

Use a real card or Stripe test card:
- Card: `4242 4242 4242 4242`
- Expiry: Any future date
- CVC: Any 3 digits

---

## STEP 7: Configure Email (Optional but Recommended)

Your Resend API key is already configured for sending booking notifications. Make sure:

1. Verify your sending domain in Resend dashboard
2. Test booking confirmation emails
3. Check spam folders if emails don't arrive

---

## Ongoing Updates

When you want to update your site:

### Option 1: From Your Computer

1. Make changes to your code in Bolt or locally
2. Run `vercel --prod` from your project folder
3. Vercel will rebuild and deploy (takes 1-2 minutes)

### Option 2: Enable Git Integration (Optional)

If you want automatic deployments:

1. Push your code to GitHub (one-time setup)
2. In Vercel dashboard, connect your GitHub repo
3. Every time you push code, Vercel auto-deploys

---

## Troubleshooting

### Site won't load
- Check DNS propagation: https://dnschecker.org
- Verify Vercel shows your domain as "Valid"
- Try `vercel domains inspect tkacvacations.com`

### Payment not working
- Verify you're using LIVE Stripe keys (not test keys)
- Check Stripe webhook is pointing to Supabase URL
- Check Stripe webhook secret is set in Supabase
- Test webhook: Stripe Dashboard → Webhooks → Click endpoint → Send test webhook

### Images not showing
- Check image URLs in your database
- Verify Supabase storage bucket policies are set to public
- Check browser console for CORS errors

### Booking emails not sending
- Verify Resend API key in Supabase Edge Function secrets
- Check your email isn't going to spam
- Verify admin email in site settings
- Check Supabase Edge Function logs for errors

### Deployment fails
- Run `vercel logs` to see error details
- Verify all environment variables are set
- Try `npm run build` locally to catch build errors

---

## Support Resources

- **Vercel Docs**: https://vercel.com/docs
- **Vercel CLI Docs**: https://vercel.com/docs/cli
- **Supabase Docs**: https://supabase.com/docs
- **Stripe Docs**: https://stripe.com/docs

---

## Quick Reference

**Your Production URLs:**
- Site: https://tkacvacations.com
- Supabase: (see your .env file)
- Stripe Dashboard: https://dashboard.stripe.com
- Vercel Dashboard: https://vercel.com/dashboard

**Important: Keep these secret and secure:**
- Stripe Secret Key (sk_live_...)
- Stripe Webhook Secret (whsec_...)
- Supabase Service Role Key
- Resend API Key

---

## Quick Commands Reference

```bash
# Deploy to production
vercel --prod

# View deployment logs
vercel logs

# List all deployments
vercel ls

# Check domain status
vercel domains inspect tkacvacations.com

# Add environment variable
vercel env add VARIABLE_NAME

# Remove a deployment
vercel rm DEPLOYMENT_URL
```

---

Good luck with your deployment!
