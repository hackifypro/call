# Aura India — All-India Adult Companion Discovery & Booking Marketplace

A complete, production-ready, mobile-first companion discovery and booking marketplace built with **Next.js 14**, **TypeScript**, **Tailwind CSS**, and **PostgreSQL/Supabase**.

---

## Key Modules Implemented

### 1. Dual Entry Homepage (Section 2)
- **Top Prominent Search Bar**: State selection, City selection, profile text search, availability toggle, rating filter, published price range slider.
- **Option A**: Register as a Companion (5-step onboarding wizard).
- **Option B**: Explore and Book (Tinder-style swipe deck & city discovery).

### 2. India-Wide City Availability (Section 3 & 15)
- Support for 22+ Indian States and Union Territories.
- Dynamic SEO city landing pages:
  - `/cities/maharashtra/mumbai`
  - `/cities/maharashtra/pune`
  - `/cities/maharashtra/nashik`
  - `/cities/karnataka/bengaluru`
  - `/cities/delhi/delhi`
  - `/cities/gujarat/ahmedabad`
  - `/cities/west-bengal/kolkata`
  - `/cities/telangana/hyderabad`
  - `/cities/goa/goa`
- Automatic empty states when no verified profiles are registered — never displaying false availability.

### 3. Companion Registration System (Section 4)
- **Step 1: Basic Information**: Private legal name encryption, public display name, DOB (18+ adult age validation), email, phone with simulated SMS OTP verification.
- **Step 2: Public Profile**: Photo upload with explicit consent, biography, interests, languages spoken, hourly and day rates.
- **Step 3: Verification**: Private Government ID upload (Aadhaar / Passport / Voter ID), live selfie match, platform terms acceptance.
- **Step 4: Pricing & Fee**: Configured registration fee schedule and promotional campaign rules.
- **Step 5: Profile Approval**: Review status badge (`Pending Approval` -> `Approved`).

### 4. Swipe-Based Profile Discovery (Section 5)
- Tinder-inspired card browsing experience with Framer Motion gesture physics.
- Swipe left: Skip.
- Swipe right: Add to favorites.
- Tap card: View detailed profile.
- Accessible desktop controls: Keyboard arrows (Left = Skip, Right = Favorite, Up = Details, Z = Undo).
- Profile cards show: Photo gallery, display name, age, 18+ verified badge, city, rating, accepted/completed/cancelled bookings stats.

### 5. Public Profile Details (Section 6)
- Dedicated URLs: `/profiles/[id]`.
- Verified database statistics computed server-side.
- Verified reviews from completed bookings only.
- Transparent price card (1 hr, 2 hr, 4 hr, 8 hr).
- Request Booking, Save to Favorites, Report, and Block options.

### 6. Booking Management & 10% Commission (Section 7 & 10)
- End-to-end booking modal with date, time, duration, and public venue.
- Transparent price breakdown: Base amount, 10% platform commission, companion net earnings.
- Payment gateway simulation (UPI / Card / NetBanking) with escrow authorization.
- Dual-party state transitions: `pending_acceptance` -> `confirmed` -> `in_progress` -> `completed`.

### 7. Section 11 Refund & Replacement Credit Policy
- **Option A**: Instant full refund back to original payment method.
- **Option B**: 100% Replacement Booking Credit applied automatically at checkout on future bookings.

### 8. Customer Dashboard (Section 8)
- Upcoming, completed, and cancelled bookings.
- Available replacement booking credits balance.
- Saved favorites and payment history.
- Write verified review for completed bookings.
- Privacy controls & account deletion.

### 9. Companion Dashboard (Section 9)
- Performance statistics ribbon: Gross volume, 10% platform fee, Net eligible earnings.
- Incoming booking requests: Instant **Accept** / **Decline** controls.
- Availability calendar & weekly hours.
- Bank withdrawal payout requests (NEFT/UPI).

### 10. Complete Admin Panel (Section 14)
- **Overview & KPIs**: Gross volume, commission revenue, refunds liability.
- **Companion Verification Queue**: Inspect private KYC documents, 1-click Approve or Reject.
- **Booking Registry & Disputes**: Full audited list of marketplace bookings.
- **Finance Ledger**: Real-time 10% commission accounting ledger.
- **Feature Settings**: Configurable commission rate slider, free campaign toggle.
- **SEO Management**: Edit title tags, meta descriptions, and sitemap settings.
- **Trust & Safety Audit Trail**: Immutable log of administrative actions.

---

## Getting Started

1. Install dependencies:
   ```bash
   npm install
   ```

2. Run tests:
   ```bash
   npm test
   ```

3. Run development server:
   ```bash
   npm run dev
   ```
   Open `http://localhost:3000` in your browser.

4. Run production build:
   ```bash
   npm run build
   ```
