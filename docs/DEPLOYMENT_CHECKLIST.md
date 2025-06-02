# Stripe Payment Integration - Deployment Checklist

## Pre-deployment Checklist

### 1. Environment Variables Setup ✅
```powershell
# Check local environment
npm run debug:stripe

# Setup Vercel environment variables
.\scripts\setup-vercel-env.ps1
```

### 2. Code Changes Verification ✅
- [x] Webhook URL dinamically uses correct domain
- [x] Webhook error handling improved
- [x] Payment intent metadata includes orderId
- [x] Stripe API version updated to 2025-05-28.basil
- [x] Enhanced logging for debugging

### 3. Database Check ✅
```powershell
# Check for stuck PENDING orders
npm run fix:pending

# Cleanup old incomplete orders
npm run cleanup:orders
```

### 4. Stripe Configuration ✅
```powershell
# Validate webhook setup
npm run validate:webhook

# Test webhook connectivity
npm run test:webhook
```

## Deployment Steps

### Step 1: Pre-deployment Testing
```powershell
# Build locally to check for errors
npm run build

# Run validation scripts
npm run debug:stripe
npm run validate:webhook
```

### Step 2: Deploy to Vercel
```powershell
# Deploy to preview first
vercel

# Deploy to production
vercel --prod
```

### Step 3: Post-deployment Configuration

#### Configure Stripe Webhook
1. Go to [Stripe Dashboard](https://dashboard.stripe.com/webhooks)
2. Click "Add endpoint"
3. URL: `https://your-domain.vercel.app/api/webhook/stripe`
4. Events to select:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`
5. Copy webhook secret and add to Vercel env vars

#### Update Environment Variables
```powershell
# Set production base URL
vercel env add NEXT_PUBLIC_BASE_URL
# Enter: https://your-domain.vercel.app

# Set webhook secret from Stripe
vercel env add STRIPE_WEBHOOK_SECRET
# Enter: whsec_...
```

### Step 4: Test Production
1. Make a test purchase
2. Check Vercel function logs: `vercel logs --follow`
3. Check Stripe webhook delivery in dashboard
4. Verify order status updates correctly

## Troubleshooting

### Common Issues and Solutions

#### Issue 1: 400 Webhook Errors
**Solution**: Check webhook secret in Vercel environment variables
```powershell
vercel env ls
```

#### Issue 2: Localhost Redirect
**Solution**: Ensure `NEXT_PUBLIC_BASE_URL` is set correctly
```powershell
vercel env add NEXT_PUBLIC_BASE_URL production
# Enter: https://your-actual-domain.vercel.app
```

#### Issue 3: Orders Stuck in PENDING
**Solution**: Run fix script and check webhook delivery
```powershell
npm run fix:pending
```

### Debug Commands
```powershell
# Check deployment status
vercel ls

# View function logs
vercel logs --follow

# Check environment variables
vercel env ls

# Test webhook locally
stripe listen --forward-to localhost:3000/api/webhook/stripe
```

## Post-Deployment Monitoring

### Daily Checks
- Monitor webhook delivery success rate
- Check for stuck PENDING orders
- Review error logs in Vercel

### Weekly Maintenance
```powershell
# Cleanup old incomplete orders
npm run cleanup:orders
```

### Monthly Review
- Review Stripe webhook logs
- Update API versions if needed
- Check for any security updates

## Emergency Procedures

### If Webhooks Stop Working
1. Check Stripe webhook endpoint status
2. Verify Vercel function is running
3. Check environment variables
4. Re-deploy if necessary

### If Orders Stuck in PENDING
```powershell
# Quick fix for recent orders
npm run fix:pending

# Manual database update if needed
# UPDATE "Order" SET status = 'PROCESSING' WHERE status = 'PENDING' AND "createdAt" > NOW() - INTERVAL '1 hour';
```

### Contact Information
- Stripe Support: [https://support.stripe.com](https://support.stripe.com)
- Vercel Support: [https://vercel.com/support](https://vercel.com/support)

---

**Last Updated**: June 2, 2025
**Version**: 1.0
