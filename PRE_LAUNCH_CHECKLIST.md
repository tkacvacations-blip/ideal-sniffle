# Pre-Launch Checklist - TKAC Vacations

## Critical Issues Fixed

- [x] Removed test/development files (test-email.html, EmailTest.tsx)
- [x] Removed /test-email route from App.tsx
- [x] Fixed critical RLS security vulnerability in bookings table
- [x] Removed 41 console.log statements from frontend code
- [x] Created .env.example file for documentation
- [x] Verified .env is in .gitignore
- [x] Successful production build completed

---

## Pre-Deployment Checklist

### Stripe Configuration (CRITICAL)

- [ ] Switch from TEST to LIVE Stripe keys
  - Go to https://dashboard.stripe.com
  - Toggle "Test mode" OFF (top right)
  - Copy your LIVE publishable key (starts with `pk_live_`)
  - Update `VITE_STRIPE_PUBLISHABLE_KEY` in deployment platform

- [ ] Configure Stripe Webhook for Production
  1. In Stripe Dashboard, go to Developers → Webhooks
  2. Add endpoint: `https://dihmwdryzulyesdgvzzk.supabase.co/functions/v1/stripe-webhook`
  3. Select events:
     - `checkout.session.completed`
     - `payment_intent.succeeded`
     - `charge.refunded`
  4. Copy the signing secret (starts with `whsec_`)
  5. Add to Supabase Edge Function secrets as `STRIPE_WEBHOOK_SECRET`

- [ ] Add Stripe LIVE secret key to Supabase
  - Go to Supabase Dashboard → Project Settings → Edge Functions → Secrets
  - Add `STRIPE_SECRET_KEY` with your LIVE secret key (starts with `sk_live_`)

### Email Configuration

- [ ] Verify sending domain in Resend
  - Verify `bookings@tkacvacations.com` in Resend dashboard
  - Ensure SPF and DKIM records are configured
  - Send test booking email to verify delivery

### Supabase Configuration

- [ ] Update Site URL in Supabase Auth
  - Go to Supabase Dashboard → Authentication → URL Configuration
  - Set Site URL to: `https://tkacvacations.com`
  - Add Redirect URLs:
    - `https://tkacvacations.com/**`
    - `https://www.tkacvacations.com/**`

- [ ] Verify Supabase Edge Function Secrets
  - [ ] `STRIPE_SECRET_KEY` (LIVE key)
  - [ ] `STRIPE_WEBHOOK_SECRET`
  - [ ] `RESEND_API_KEY`
  - [ ] `ADMIN_EMAIL`

### Domain Configuration

- [ ] Configure DNS records for tkacvacations.com
  - See DEPLOYMENT_GUIDE.md for detailed instructions
  - Point domain to deployment platform (Netlify/Vercel)
  - Verify SSL certificate is active

### Security Verification

- [ ] Test RLS policies are working
  - Try viewing bookings as non-admin user
  - Verify users can only see their own bookings
  - Confirm admin can view all bookings

- [ ] Test authentication flows
  - [ ] User signup works
  - [ ] User login works
  - [ ] Admin login works
  - [ ] Password reset works (if implemented)

### Payment Testing

- [ ] Test complete booking flow with LIVE Stripe
  1. Add property to cart
  2. Add activities to cart
  3. Complete checkout
  4. Verify payment succeeds
  5. Check booking appears in admin panel
  6. Verify confirmation email is sent

- [ ] Test security deposit authorization
  - [ ] $500 hold is created
  - [ ] Hold appears in Stripe dashboard
  - [ ] Release function works in admin panel

- [ ] Test damage protection option
  - [ ] Damage protection can be added
  - [ ] Fee is calculated correctly

### Functional Testing

- [ ] Test vacation rental bookings
  - [ ] Calendar shows correct availability
  - [ ] Date selection works
  - [ ] Pricing calculates correctly (including cleaning fee)
  - [ ] Booking confirmation sent
  - [ ] Calendar blocks dates after booking

- [ ] Test activity bookings
  - [ ] Activities display correctly
  - [ ] Can add to cart with custom date/time
  - [ ] Quantity selection works
  - [ ] Jet ski operator requirements show (if applicable)

- [ ] Test merchandise
  - [ ] Merchandise modal displays items
  - [ ] Size and color selection works
  - [ ] Can add multiple quantities
  - [ ] Stock quantity updates

- [ ] Test cart functionality
  - [ ] Items appear in cart
  - [ ] Can remove items
  - [ ] Can update quantities
  - [ ] Tax calculations are correct (6.5% sales + 11.5% lodging)
  - [ ] Totals calculate correctly

- [ ] Test admin panel
  - [ ] Login as admin works
  - [ ] Can view all bookings
  - [ ] Can manage properties
  - [ ] Can manage activities
  - [ ] Can manage merchandise
  - [ ] Can upload images
  - [ ] Can update site settings
  - [ ] Tax report displays correctly
  - [ ] Calendar sync works

### Mobile Testing

- [ ] Test on mobile devices
  - [ ] Hero image loads and displays correctly
  - [ ] Navigation works
  - [ ] Modals display properly
  - [ ] Cart button is accessible
  - [ ] Checkout flow works on mobile
  - [ ] Forms are usable on mobile

### Performance

- [ ] Images are optimized
  - Hero images are appropriate size
  - Property images load quickly
  - No images over 2MB

- [ ] Page load time is acceptable
  - Initial load under 3 seconds
  - Time to interactive under 5 seconds

### Documentation

- [ ] Admin user documentation exists
  - How to manage bookings
  - How to release security deposits
  - How to view tax reports
  - How to update site content

- [ ] Deployment documentation is complete
  - DEPLOYMENT_GUIDE.md is up to date
  - Environment variables documented
  - Troubleshooting steps included

---

## Post-Launch Monitoring

### Week 1

- [ ] Monitor Stripe webhook logs for errors
- [ ] Check booking confirmation emails are being delivered
- [ ] Monitor Supabase Edge Function logs
- [ ] Review error tracking (if implemented)
- [ ] Check for any customer support issues

### Ongoing

- [ ] Weekly backup verification
- [ ] Monthly review of security policies
- [ ] Quarterly review of Stripe integration
- [ ] Regular testing of critical flows

---

## Emergency Contacts

- **Stripe Support**: https://support.stripe.com
- **Supabase Support**: https://supabase.com/dashboard/support
- **Resend Support**: https://resend.com/support
- **Deployment Platform Support**: (Add your platform's support link)

---

## Rollback Plan

If critical issues are discovered after launch:

1. **Payment Issues**:
   - Disable checkout temporarily by setting properties to inactive
   - Display maintenance message
   - Fix issue in development
   - Test thoroughly before re-enabling

2. **Security Issues**:
   - Immediately apply RLS policy fixes
   - Review audit logs
   - Notify affected users if necessary

3. **Complete Rollback**:
   - Revert to previous deployment
   - Point domain back to maintenance page
   - Fix issues in staging environment
   - Re-deploy when ready

---

## Success Criteria

Your site is ready to launch when:

- [x] All critical issues have been fixed
- [x] Production build completes successfully
- [ ] All items in this checklist are completed
- [ ] Test bookings work end-to-end with LIVE Stripe
- [ ] Admin panel is fully functional
- [ ] Email notifications are being delivered
- [ ] Security policies are properly configured
- [ ] Domain is pointing to the correct deployment

---

Good luck with your launch!
