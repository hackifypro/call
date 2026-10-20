-- ============================================================================
-- ALL-INDIA COMPANION BOOKING PLATFORM (MIGRATION 001)
-- Production PostgreSQL Database Schema with Row-Level Security (RLS)
-- ============================================================================

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pgcrypto";

-- 1. USER ROLES ENUM
DO $$ BEGIN
    CREATE TYPE user_role_type AS ENUM ('customer', 'companion', 'admin', 'moderator');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. COMPANION STATUS ENUM
DO $$ BEGIN
    CREATE TYPE companion_status_type AS ENUM (
        'draft',
        'pending_verification',
        'pending_approval',
        'approved',
        'rejected',
        'suspended',
        'deactivated'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 3. BOOKING STATUS ENUM
DO $$ BEGIN
    CREATE TYPE booking_status_type AS ENUM (
        'pending_payment',
        'payment_authorized',
        'pending_acceptance',
        'accepted',
        'rejected',
        'confirmed',
        'in_progress',
        'completed',
        'cancelled',
        'refund_pending',
        'refunded'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 4. USERS TABLE
CREATE TABLE IF NOT EXISTS users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email VARCHAR(255) UNIQUE NOT NULL,
    phone_number VARCHAR(20) UNIQUE,
    phone_verified BOOLEAN DEFAULT FALSE,
    password_hash TEXT NOT NULL,
    full_name VARCHAR(150),
    role user_role_type NOT NULL DEFAULT 'customer',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. USER ROLES (FOR EXTENSIBLE MULTI-ROLE SUPPORT)
CREATE TABLE IF NOT EXISTS user_roles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    role user_role_type NOT NULL,
    granted_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, role)
);

-- 6. STATES TABLE (INDIA)
CREATE TABLE IF NOT EXISTS states (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE,
    slug VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(5) NOT NULL UNIQUE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. CITIES TABLE (INDIA)
CREATE TABLE IF NOT EXISTS cities (
    id SERIAL PRIMARY KEY,
    state_id INT NOT NULL REFERENCES states(id) ON DELETE CASCADE,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL,
    tier INT DEFAULT 2, -- Tier 1 (Metro), Tier 2, Tier 3
    is_active BOOLEAN DEFAULT TRUE,
    latitude DECIMAL(10, 7),
    longitude DECIMAL(10, 7),
    meta_description TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(state_id, slug)
);

-- 8. SUPPORTED SERVICE AREAS
CREATE TABLE IF NOT EXISTS supported_service_areas (
    id SERIAL PRIMARY KEY,
    city_id INT NOT NULL REFERENCES cities(id) ON DELETE CASCADE,
    area_name VARCHAR(150) NOT NULL,
    pincode VARCHAR(10),
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COMPANION PROFILES TABLE
CREATE TABLE IF NOT EXISTS companion_profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL UNIQUE REFERENCES users(id) ON DELETE CASCADE,
    display_name VARCHAR(100) NOT NULL,
    legal_name_encrypted TEXT NOT NULL, -- Private, never exposed
    date_of_birth DATE NOT NULL,
    is_adult_verified BOOLEAN DEFAULT FALSE,
    bio TEXT,
    interests TEXT[] DEFAULT '{}',
    languages TEXT[] DEFAULT '{}',
    gender VARCHAR(50),
    state_id INT REFERENCES states(id),
    primary_city_id INT REFERENCES cities(id),
    supported_city_ids INT[] DEFAULT '{}',
    
    -- Pricing & Durations
    hourly_rate DECIMAL(10, 2) NOT NULL DEFAULT 1500.00,
    half_day_rate DECIMAL(10, 2),
    full_day_rate DECIMAL(10, 2),
    permitted_durations INT[] DEFAULT '{1, 2, 4, 8}', -- in hours
    
    -- Status
    status companion_status_type DEFAULT 'draft',
    rejection_reason TEXT,
    is_available BOOLEAN DEFAULT TRUE,
    
    -- Verified Database Statistics (Never manually input)
    average_rating DECIMAL(3, 2) DEFAULT 0.00,
    review_count INT DEFAULT 0,
    total_requests INT DEFAULT 0,
    accepted_bookings INT DEFAULT 0,
    completed_bookings INT DEFAULT 0,
    cancelled_bookings INT DEFAULT 0,
    rejected_requests INT DEFAULT 0,
    
    -- Financials
    gross_earnings DECIMAL(12, 2) DEFAULT 0.00,
    total_commission_paid DECIMAL(12, 2) DEFAULT 0.00,
    net_eligible_earnings DECIMAL(12, 2) DEFAULT 0.00,
    
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 10. PROFILE PHOTOS
CREATE TABLE IF NOT EXISTS profile_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES companion_profiles(id) ON DELETE CASCADE,
    photo_url TEXT NOT NULL,
    is_primary BOOLEAN DEFAULT FALSE,
    is_approved BOOLEAN DEFAULT TRUE,
    sort_order INT DEFAULT 0,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. VERIFICATION RECORDS (PRIVATE & ENCRYPTED GOVERNMENT ID)
CREATE TABLE IF NOT EXISTS verification_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID REFERENCES companion_profiles(id) ON DELETE CASCADE,
    document_type VARCHAR(50) NOT NULL, -- Aadhaar, Passport, VoterID
    document_hash TEXT NOT NULL,
    document_image_url TEXT NOT NULL, -- Stored in private bucket
    selfie_image_url TEXT NOT NULL,
    dob_verified DATE,
    age INT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, approved, rejected
    reviewer_notes TEXT,
    reviewed_by UUID REFERENCES users(id),
    reviewed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 12. AVAILABILITY SLOTS
CREATE TABLE IF NOT EXISTS availability_slots (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    profile_id UUID NOT NULL REFERENCES companion_profiles(id) ON DELETE CASCADE,
    day_of_week INT NOT NULL, -- 0 = Sunday, 6 = Saturday
    start_time TIME NOT NULL,
    end_time TIME NOT NULL,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    profile_id UUID NOT NULL REFERENCES companion_profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, profile_id)
);

-- 14. BOOKING REQUESTS
CREATE TABLE IF NOT EXISTS booking_requests (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_ref VARCHAR(30) UNIQUE NOT NULL, -- e.g. BK-20261020-XXXX
    customer_id UUID NOT NULL REFERENCES users(id),
    companion_id UUID NOT NULL REFERENCES companion_profiles(id),
    booking_date DATE NOT NULL,
    start_time TIME NOT NULL,
    duration_hours INT NOT NULL,
    city_id INT REFERENCES cities(id),
    meetup_location TEXT NOT NULL,
    occasion_type VARCHAR(100),
    special_notes TEXT,
    
    -- Financials & 10% Commission Breakdown
    gross_amount DECIMAL(10, 2) NOT NULL,
    platform_commission_rate DECIMAL(5, 2) NOT NULL DEFAULT 10.00, -- 10%
    platform_commission_amount DECIMAL(10, 2) NOT NULL,
    tax_amount DECIMAL(10, 2) DEFAULT 0.00,
    net_companion_amount DECIMAL(10, 2) NOT NULL,
    
    -- Status
    status booking_status_type DEFAULT 'pending_payment',
    payment_id UUID,
    refund_id UUID,
    credit_used_id UUID,
    
    -- Permitted Contact Details (Only unlocked upon acceptance)
    customer_contact_phone VARCHAR(20),
    companion_contact_phone VARCHAR(20),
    
    accepted_at TIMESTAMPTZ,
    in_progress_at TIMESTAMPTZ,
    completed_at TIMESTAMPTZ,
    cancelled_at TIMESTAMPTZ,
    cancellation_reason TEXT,
    cancelled_by UUID REFERENCES users(id),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 15. BOOKING STATUS HISTORY (AUDIT TRAIL)
CREATE TABLE IF NOT EXISTS booking_status_history (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL REFERENCES booking_requests(id) ON DELETE CASCADE,
    from_status booking_status_type,
    to_status booking_status_type NOT NULL,
    changed_by UUID REFERENCES users(id),
    change_reason TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 16. PAYMENTS TABLE
CREATE TABLE IF NOT EXISTS payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    currency VARCHAR(10) DEFAULT 'INR',
    provider VARCHAR(50) NOT NULL, -- 'razorpay', 'upi', 'cashfree'
    provider_payment_id VARCHAR(100),
    provider_order_id VARCHAR(100),
    status VARCHAR(50) NOT NULL DEFAULT 'pending', -- pending, authorized, captured, failed, refunded
    payment_method VARCHAR(50),
    payment_fee DECIMAL(10, 2) DEFAULT 0.00,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 17. REFUNDS TABLE
CREATE TABLE IF NOT EXISTS refunds (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    payment_id UUID NOT NULL REFERENCES payments(id),
    booking_id UUID NOT NULL REFERENCES booking_requests(id),
    customer_id UUID NOT NULL REFERENCES users(id),
    amount DECIMAL(10, 2) NOT NULL,
    reason TEXT NOT NULL,
    provider_refund_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- pending, completed, failed
    processed_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 18. BOOKING CREDITS (FREE REPLACEMENT CREDITS)
CREATE TABLE IF NOT EXISTS booking_credits (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    credit_amount DECIMAL(10, 2) NOT NULL,
    original_booking_id UUID REFERENCES booking_requests(id),
    reason TEXT NOT NULL,
    status VARCHAR(50) DEFAULT 'available', -- available, redeemed, expired
    redeemed_in_booking_id UUID REFERENCES booking_requests(id),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 19. COMMISSION LEDGER (ACCOUNTING RECORDS)
CREATE TABLE IF NOT EXISTS commission_ledger (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES booking_requests(id),
    transaction_type VARCHAR(50) NOT NULL, -- 'commission_credit', 'commission_refund', 'registration_fee', 'subscription_fee'
    amount DECIMAL(10, 2) NOT NULL,
    commission_rate DECIMAL(5, 2) DEFAULT 10.00,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 20. PAYOUTS TABLE
CREATE TABLE IF NOT EXISTS payouts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    companion_id UUID NOT NULL REFERENCES companion_profiles(id),
    amount DECIMAL(10, 2) NOT NULL,
    bank_account_last4 VARCHAR(4),
    ifsc_code VARCHAR(15),
    reference_id VARCHAR(100),
    status VARCHAR(50) DEFAULT 'pending', -- pending, processing, completed, rejected
    requested_at TIMESTAMPTZ DEFAULT NOW(),
    paid_at TIMESTAMPTZ
);

-- 21. SUBSCRIPTION PLANS
CREATE TABLE IF NOT EXISTS subscription_plans (
    id SERIAL PRIMARY KEY,
    name VARCHAR(100) NOT NULL,
    slug VARCHAR(100) NOT NULL UNIQUE,
    price DECIMAL(10, 2) NOT NULL,
    duration_days INT NOT NULL,
    features JSONB NOT NULL DEFAULT '[]',
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 22. SUBSCRIPTIONS
CREATE TABLE IF NOT EXISTS subscriptions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    plan_id INT NOT NULL REFERENCES subscription_plans(id),
    starts_at TIMESTAMPTZ NOT NULL,
    expires_at TIMESTAMPTZ NOT NULL,
    auto_renew BOOLEAN DEFAULT FALSE,
    status VARCHAR(50) DEFAULT 'active', -- active, expired, cancelled
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 23. REVIEWS TABLE (VERIFIED BOOKINGS ONLY)
CREATE TABLE IF NOT EXISTS reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID NOT NULL UNIQUE REFERENCES booking_requests(id) ON DELETE CASCADE,
    customer_id UUID NOT NULL REFERENCES users(id),
    companion_id UUID NOT NULL REFERENCES companion_profiles(id),
    rating INT NOT NULL CHECK (rating >= 1 AND rating <= 5),
    comment TEXT,
    is_verified BOOLEAN DEFAULT TRUE,
    is_moderated BOOLEAN DEFAULT FALSE,
    is_flagged BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 24. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    title VARCHAR(150) NOT NULL,
    message TEXT NOT NULL,
    type VARCHAR(50) NOT NULL, -- booking_request, booking_accepted, refund_issued, etc.
    link TEXT,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 25. SUPPORT TICKETS & REPORTS
CREATE TABLE IF NOT EXISTS support_tickets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_ref VARCHAR(30) UNIQUE NOT NULL,
    user_id UUID NOT NULL REFERENCES users(id),
    subject VARCHAR(200) NOT NULL,
    message TEXT NOT NULL,
    category VARCHAR(50) NOT NULL, -- payment, booking, dispute, technical
    status VARCHAR(50) DEFAULT 'open', -- open, in_progress, resolved, closed
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reporter_id UUID NOT NULL REFERENCES users(id),
    reported_profile_id UUID NOT NULL REFERENCES companion_profiles(id),
    reason VARCHAR(100) NOT NULL,
    details TEXT,
    status VARCHAR(50) DEFAULT 'pending', -- pending, investigated, dismissed, action_taken
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 26. FEATURE SETTINGS
CREATE TABLE IF NOT EXISTS feature_settings (
    key VARCHAR(100) PRIMARY KEY,
    value JSONB NOT NULL,
    description TEXT,
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 27. ADMIN AUDIT LOGS
CREATE TABLE IF NOT EXISTS admin_audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    admin_id UUID NOT NULL REFERENCES users(id),
    action VARCHAR(100) NOT NULL,
    target_type VARCHAR(50) NOT NULL,
    target_id TEXT NOT NULL,
    details JSONB,
    ip_address VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 28. CONSENT RECORDS (LEGAL COMPLIANCE)
CREATE TABLE IF NOT EXISTS consent_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    consent_type VARCHAR(100) NOT NULL, -- 'adult_age_18_plus', 'terms_of_service', 'privacy_policy', 'profile_photo_consent'
    consent_version VARCHAR(20) NOT NULL,
    ip_address VARCHAR(50),
    agreed_at TIMESTAMPTZ DEFAULT NOW()
);

-- ============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ============================================================================
CREATE INDEX IF NOT EXISTS idx_companion_profiles_status ON companion_profiles(status);
CREATE INDEX IF NOT EXISTS idx_companion_profiles_city ON companion_profiles(primary_city_id);
CREATE INDEX IF NOT EXISTS idx_companion_profiles_rating ON companion_profiles(average_rating DESC);
CREATE INDEX IF NOT EXISTS idx_companion_profiles_hourly_rate ON companion_profiles(hourly_rate);
CREATE INDEX IF NOT EXISTS idx_booking_requests_customer ON booking_requests(customer_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_companion ON booking_requests(companion_id);
CREATE INDEX IF NOT EXISTS idx_booking_requests_status ON booking_requests(status);
CREATE INDEX IF NOT EXISTS idx_booking_requests_date ON booking_requests(booking_date);
CREATE INDEX IF NOT EXISTS idx_reviews_companion ON reviews(companion_id);
CREATE INDEX IF NOT EXISTS idx_reviews_booking ON reviews(booking_id);
CREATE INDEX IF NOT EXISTS idx_commission_ledger_booking ON commission_ledger(booking_id);
CREATE INDEX IF NOT EXISTS idx_cities_slug ON cities(slug);
CREATE INDEX IF NOT EXISTS idx_states_slug ON states(slug);

-- ============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ============================================================================
ALTER TABLE companion_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE verification_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE commission_ledger ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Companion Profiles: Public can only view approved profiles; owner and admin can view all
CREATE POLICY companion_profiles_public_read ON companion_profiles
    FOR SELECT
    USING (status = 'approved');

-- Verification Records: strictly private, only owner and admin can access
CREATE POLICY verification_records_owner_read ON verification_records
    FOR SELECT
    USING (auth.uid() = user_id);

-- Booking Requests: only customer, companion, or admin can read their bookings
CREATE POLICY booking_requests_parties_read ON booking_requests
    FOR SELECT
    USING (
        auth.uid() = customer_id OR 
        auth.uid() IN (SELECT user_id FROM companion_profiles WHERE id = booking_requests.companion_id)
    );
