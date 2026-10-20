# Aura India — Production Deployment & Operations Guide

This guide details the deployment, configuration, and maintenance procedures for the **Aura India Adult Companion Booking Platform**.

---

## 1. System Architecture Overview

```
                      +-----------------------------+
                      |   Cloudflare / Vercel Edge  |
                      |    SSL / WAF / CDN Caching  |
                      +--------------+--------------+
                                     |
                      +--------------v--------------+
                      |       Next.js 14 App        |
                      |   (React 18 + TypeScript)   |
                      +--------------+--------------+
                                     |
               +---------------------+---------------------+
               |                                           |
+--------------v--------------+             +--------------v--------------+
|     Supabase PostgreSQL     |             |  Escrow Payment Gateway     |
|   (28 Tables + RLS Policies)|             |   (Razorpay / UPI Webhook)  |
+--------------+--------------+             +-----------------------------+
               |
+--------------v--------------+
|   Private KYC Storage S3    |
| (Encrypted Government Docs) |
+-----------------------------+
```

---

## 2. Database Provisioning & Schema Migration

The platform uses a relational PostgreSQL database with Row-Level Security (RLS).

1. Create a Supabase or standard PostgreSQL 15+ database instance.
2. In the Supabase SQL Editor or via `psql`:
   ```bash
   psql -h db.your-project.supabase.co -U postgres -d postgres -f supabase/migrations/001_initial_schema.sql
   ```
3. Verify that the 28 tables, RLS policies, and indexes are active.

---

## 3. Environment Configuration

Copy `.env.example` to `.env.local`:
```bash
cp .env.example .env.local
```
Fill in the production credentials:
- `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY`
- `DATABASE_URL` (direct connection string)
- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- `RAZORPAY_WEBHOOK_SECRET`

---

## 4. Building and Running

### Development Server:
```bash
npm run dev
```

### Production Build:
```bash
npm run build
npm start
```

### Automated Acceptance Tests:
```bash
npm test
```

---

## 5. Webhook Configuration (Section 10 Escrow & Payments)

In your Payment Provider dashboard (e.g. Razorpay / Cashfree):
1. Navigate to **Webhooks** > **Add New Webhook**.
2. Set URL to: `https://aura-india.com/api/payments/webhook`.
3. Select events:
   - `payment.authorized`
   - `payment.captured`
   - `payment.failed`
   - `refund.processed`
4. Set Secret to match `RAZORPAY_WEBHOOK_SECRET`.

---

## 6. Google Search Console & SEO Indexing (Section 15)

1. Verify domain ownership in **Google Search Console** via DNS TXT record.
2. Submit XML Sitemap:
   `https://aura-india.com/sitemap.xml`
3. Verify `robots.txt` configuration:
   `https://aura-india.com/robots.txt`
   - Disallowed: `/dashboard/*`, `/admin/*`, `/api/*`, `/private/*`
   - Allowed: `/`, `/explore`, `/cities/*`, `/profiles/*`, `/safety`, `/how-it-works`
4. Test structured data with Google Rich Results Test (validates `LocalBusiness`, `Service`, `FAQPage`, and `BreadcrumbList`).

---

## 7. Backup and Recovery Strategy

- **Daily Automated Backups**: Configured via Supabase / RDS with point-in-time recovery (PITR) for 30 days.
- **Ledger Immutability**: All commission transactions are append-only in `commission_ledger`.
- **Zero Raw Card Storage**: Raw card and CVV details are never collected or stored on our servers.
