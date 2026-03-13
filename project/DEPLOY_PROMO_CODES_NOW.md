# Deploy Promo Codes to Both Netlify Sites

Your promo code feature is working in Bolt but not on your deployed sites because they're using cached builds.

## Site Information
- **Connected Site ID**: f5ddf1ba-7da6-4d04-bd63-97805fb13e44
- **Fresh Build**: Ready in `dist/` folder with promo codes

## OPTION 1: Deploy via Netlify CLI (Fastest)

### For Your First Site (Already Connected):
```bash
netlify deploy --prod --dir=dist
```

### For Your Second Site:
1. Get the Site ID from Netlify dashboard (Settings → Site details → Site ID)
2. Deploy using:
```bash
netlify deploy --prod --dir=dist --site=YOUR_SECOND_SITE_ID
```

## OPTION 2: Deploy via Git (Recommended for Both Sites)

If both sites are connected to a Git repository:

1. **Commit your changes:**
```bash
git add .
git commit -m "Add promo code functionality to all booking cards"
git push
```

2. **Netlify will auto-deploy** to both sites if they're connected to the same repo

3. **Clear cache** in Netlify dashboard for both sites:
   - Go to Deploys → Trigger deploy → Clear cache and deploy site

## OPTION 3: Manual Drag & Drop

For each site:
1. Go to Netlify dashboard
2. Select the site
3. Go to "Deploys" tab
4. Drag the entire `dist/` folder into the deploy zone
5. Wait for deployment to complete

## After Deployment: Clear Cache

For BOTH sites:
1. Go to Site Settings → Build & Deploy
2. Click "Clear cache"
3. Click "Trigger deploy" → "Clear cache and deploy site"

## Verify Deployment

After deploying, check that promo codes appear on:
- Activity booking cards
- Property rental cards
- Merchandise cards

The promo code field should show: "Have a promo code?"

---

**Current Status**: Build is ready. Promo codes work in Bolt. Need to deploy to production.
