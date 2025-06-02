# Stripe Payment Integration - Troubleshooting Guide

## Biežākās problēmas un to risinājumi

### 1. Pāradresācija uz localhost pēc maksājuma

**Problēma**: Pēc veiksmīga maksājuma lietotājs tiek pāradresēts uz localhost, nevis production URL.

**Risinājums**:
1. Pārliecinieties, ka jūsu Vercel projektā ir iestatīts `NEXT_PUBLIC_BASE_URL` environment variable:
   ```
   NEXT_PUBLIC_BASE_URL=https://your-domain.vercel.app
   ```

2. Alternatīvi, kods automātiski izmantos `VERCEL_URL` ja `NEXT_PUBLIC_BASE_URL` nav iestatīts.

### 2. Webhook 400 kļūdas

**Problēma**: Stripe webhook saņem 400 kļūdas un neapstrādā maksājumu notikumus.

**Cēloņi un risinājumi**:

1. **Nepareizs webhook secret**:
   - Pārbaudiet, ka `STRIPE_WEBHOOK_SECRET` ir pareizi iestatīts Vercel environment variables
   - Secret ir formātā `whsec_...`

2. **Nepareizs webhook URL**:
   - Stripe dashboard webhook URL jābūt: `https://your-domain.vercel.app/api/webhook/stripe`
   - Pārliecinieties, ka URL ir bez trailing slash

3. **Nepareizi webhook eventi**:
   Stripe webhook jāiestata šādi eventi:
   - `checkout.session.completed`
   - `checkout.session.expired`
   - `payment_intent.succeeded`
   - `payment_intent.payment_failed`

### 3. Datubāze netiek atjaunināta

**Problēma**: Webhook saņem datus, bet order status netiek mainīts uz "PROCESSING".

**Debugging steps**:

1. Pārbaudiet Vercel logs:
   ```bash
   vercel logs --follow
   ```

2. Palaidiet debug script:
   ```bash
   npm run debug:stripe
   ```

3. Pārbaudiet webhook logs Stripe dashboard.

### 4. Environment Variables Setup

**Production (Vercel)**:
```bash
# Database
DATABASE_URL="your-production-database-url"

# NextAuth
NEXTAUTH_SECRET="your-production-secret"
NEXTAUTH_URL="https://your-domain.vercel.app"

# Stripe
STRIPE_PUBLIC_KEY="pk_live_..." # vai pk_test_... testēšanai
STRIPE_SECRET_KEY="sk_live_..." # vai sk_test_... testēšanai
STRIPE_WEBHOOK_SECRET="whsec_..." # no Stripe webhook settings

# Base URL
NEXT_PUBLIC_BASE_URL="https://your-domain.vercel.app"
```

### 5. Testing Webhooks Locally

1. Uzstādiet Stripe CLI:
   ```bash
   stripe listen --forward-to localhost:3000/api/webhook/stripe
   ```

2. Palaidiet development serveri:
   ```bash
   npm run dev
   ```

3. Testējiet ar:
   ```bash
   stripe trigger checkout.session.completed
   ```

### 6. Manuāla kļūdu labošana

Ja ir "stuck" orderi ar PENDING statusu:

1. Palaidiet cleanup script:
   ```bash
   npm run cleanup:orders
   ```

2. Vai manuāli atjauniniet datubāzē:
   ```sql
   UPDATE "Order" SET status = 'PROCESSING' WHERE id = 'your-order-id';
   ```

### 7. Monitoring un Logs

1. **Vercel logs**:
   ```bash
   vercel logs --follow
   ```

2. **Stripe webhook logs**:
   - Dodieties uz Stripe Dashboard > Webhooks
   - Izvēlieties savu webhook
   - Skatiet "Recent deliveries"

3. **Database audit log**:
   ```sql
   SELECT * FROM "AuditLog" WHERE "entityType" = 'ORDER' ORDER BY "createdAt" DESC;
   ```

### 8. Common Commands

```bash
# Debug Stripe configuration
npm run debug:stripe

# Cleanup incomplete orders
npm run cleanup:orders

# Test webhook setup
npm run test:webhook

# Check environment variables
vercel env ls
```

## Support

Ja problēmas turpinās:
1. Pārbaudiet Stripe dashboard webhook delivery status
2. Pārbaudiet Vercel function logs
3. Pārbaudiet datubāzes connection
4. Contactējiet support ar specific error messages no logs
