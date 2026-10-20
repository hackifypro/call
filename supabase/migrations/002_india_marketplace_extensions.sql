-- ============================================================================
-- ALL-INDIA COMPANION BOOKING MARKETPLACE (MIGRATION 002)
-- Marketplace Extensions: Private In-App Messaging, Referral Program,
-- Coupons & Promotions, Dispute Resolution & Advanced Audit Trails
-- ============================================================================

-- 1. CHAT CONVERSATIONS TABLE (BOOKING-LINKED PRIVATE MESSAGING)
CREATE TABLE IF NOT EXISTS chat_conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    booking_id UUID REFERENCES booking_requests(id) ON DELETE SET NULL,
    customer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    companion_id UUID NOT NULL REFERENCES companion_profiles(id) ON DELETE CASCADE,
    is_active BOOLEAN DEFAULT TRUE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(customer_id, companion_id, booking_id)
);

-- 2. CHAT MESSAGES TABLE
CREATE TABLE IF NOT EXISTS chat_messages (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    conversation_id UUID NOT NULL REFERENCES chat_conversations(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message_text TEXT NOT NULL,
    is_read BOOLEAN DEFAULT FALSE,
    flagged_for_moderation BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. REFERRAL CAMPAIGNS & REWARDS TABLE
CREATE TABLE IF NOT EXISTS referral_campaigns (
    id SERIAL PRIMARY KEY,
    name VARCHAR(150) NOT NULL,
    reward_amount_referrer DECIMAL(10, 2) NOT NULL DEFAULT 250.00,
    reward_amount_referee DECIMAL(10, 2) NOT NULL DEFAULT 250.00,
    min_booking_value DECIMAL(10, 2) NOT NULL DEFAULT 2000.00,
    is_active BOOLEAN DEFAULT TRUE,
    starts_at TIMESTAMPTZ DEFAULT NOW(),
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS user_referrals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    referrer_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    referee_id UUID REFERENCES users(id) ON DELETE SET NULL,
    referral_code VARCHAR(30) UNIQUE NOT NULL,
    status VARCHAR(50) DEFAULT 'registered', -- registered, completed_first_booking, rewarded
    reward_credit_id UUID REFERENCES booking_credits(id),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. PROMOTIONAL COUPONS TABLE
CREATE TABLE IF NOT EXISTS promotional_coupons (
    id SERIAL PRIMARY KEY,
    code VARCHAR(30) UNIQUE NOT NULL,
    discount_type VARCHAR(20) NOT NULL DEFAULT 'percentage', -- 'percentage' or 'flat'
    discount_value DECIMAL(10, 2) NOT NULL,
    max_discount_amount DECIMAL(10, 2) DEFAULT 500.00,
    min_order_amount DECIMAL(10, 2) DEFAULT 1000.00,
    usage_limit INT DEFAULT 1000,
    times_used INT DEFAULT 0,
    is_active BOOLEAN DEFAULT TRUE,
    expires_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. SUPPORT TICKET MESSAGES / REPLIES TABLE
CREATE TABLE IF NOT EXISTS support_ticket_replies (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    ticket_id UUID NOT NULL REFERENCES support_tickets(id) ON DELETE CASCADE,
    sender_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    message TEXT NOT NULL,
    is_admin_reply BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 6. INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_chat_conversations_participants ON chat_conversations(customer_id, companion_id);
CREATE INDEX IF NOT EXISTS idx_chat_messages_conv ON chat_messages(conversation_id);
CREATE INDEX IF NOT EXISTS idx_user_referrals_code ON user_referrals(referral_code);
CREATE INDEX IF NOT EXISTS idx_promotional_coupons_code ON promotional_coupons(code);

-- 7. ROW LEVEL SECURITY (RLS) FOR CONVERSATIONS & CHAT
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_referrals ENABLE ROW LEVEL SECURITY;

-- Only authorized conversation participants can view their conversations
CREATE POLICY chat_conversations_participants ON chat_conversations
    FOR ALL
    USING (
        auth.uid() = customer_id OR
        auth.uid() IN (SELECT user_id FROM companion_profiles WHERE id = chat_conversations.companion_id)
    );

-- Only message senders and participants can read messages
CREATE POLICY chat_messages_participants ON chat_messages
    FOR ALL
    USING (
        auth.uid() IN (
            SELECT customer_id FROM chat_conversations WHERE id = chat_messages.conversation_id
            UNION
            SELECT user_id FROM companion_profiles WHERE id = (
                SELECT companion_id FROM chat_conversations WHERE id = chat_messages.conversation_id
            )
        )
    );
