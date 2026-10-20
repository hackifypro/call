-- =========================================================================
-- MIGRATION 003: CUSTOMER DASHBOARD ROW LEVEL SECURITY (RLS) & OWNERSHIP POLICIES
-- Platform: AURA INDIA — Verified Adult Companion Marketplace
-- Description: Enforces strict ownership-based data access for customers.
-- =========================================================================

-- 1. Ensure Row Level Security is Enabled on All Customer-Facing Entities
ALTER TABLE booking_requests ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE refunds ENABLE ROW LEVEL SECURITY;
ALTER TABLE booking_credits ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_tickets ENABLE ROW LEVEL SECURITY;
ALTER TABLE support_ticket_replies ENABLE ROW LEVEL SECURITY;

-- 2. Booking Requests RLS Policies
-- Customers can view their own booking requests
CREATE POLICY customer_view_own_bookings ON booking_requests
  FOR SELECT
  USING (
    customer_id = auth.uid()
    OR auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'support')
  );

-- Customers can create new booking requests tied strictly to their authenticated UID
CREATE POLICY customer_create_own_booking ON booking_requests
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
  );

-- Customers can cancel their own bookings (status modification only)
CREATE POLICY customer_cancel_own_booking ON booking_requests
  FOR UPDATE
  USING (
    customer_id = auth.uid()
  )
  WITH CHECK (
    customer_id = auth.uid()
  );

-- 3. Payments & Receipts RLS Policies
-- Customers can view only their own verified escrow transactions
CREATE POLICY customer_view_own_payments ON payments
  FOR SELECT
  USING (
    customer_id = auth.uid()
    OR auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'finance')
  );

-- 4. Refunds & Replacement Credits RLS Policies
-- Customers can view their own Section 11 refunds
CREATE POLICY customer_view_own_refunds ON refunds
  FOR SELECT
  USING (
    customer_id = auth.uid()
    OR auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'finance')
  );

-- Customers can view and redeem their own available replacement credits
CREATE POLICY customer_view_own_credits ON booking_credits
  FOR SELECT
  USING (
    user_id = auth.uid()
    OR auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'finance')
  );

CREATE POLICY customer_redeem_own_credits ON booking_credits
  FOR UPDATE
  USING (
    user_id = auth.uid()
  )
  WITH CHECK (
    user_id = auth.uid()
  );

-- 5. Favorites RLS Policies
-- Favorites are 100% private to the customer who created them
CREATE POLICY customer_manage_own_favorites ON favorites
  FOR ALL
  USING (
    customer_id = auth.uid()
  )
  WITH CHECK (
    customer_id = auth.uid()
  );

-- 6. Reviews RLS Policies
-- Anyone authenticated can view approved unflagged reviews
CREATE POLICY public_view_approved_reviews ON reviews
  FOR SELECT
  USING (
    is_flagged = FALSE
    OR customer_id = auth.uid()
    OR auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'moderator')
  );

-- Customers can only insert a review for a completed booking that belongs to them
CREATE POLICY customer_insert_own_review ON reviews
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
    AND EXISTS (
      SELECT 1 FROM booking_requests
      WHERE booking_requests.id = reviews.booking_id
        AND booking_requests.customer_id = auth.uid()
        AND booking_requests.status = 'completed'
    )
  );

-- 7. Notifications RLS Policies
-- Customers can view only notifications targeted to them or broadcast to all/customers
CREATE POLICY customer_view_notifications ON notifications
  FOR SELECT
  USING (
    target_user_id = auth.uid()
    OR target_role IN ('all', 'customer')
  );

CREATE POLICY customer_update_notification_read ON notifications
  FOR UPDATE
  USING (
    target_user_id = auth.uid()
    OR target_role IN ('all', 'customer')
  );

-- 8. Support Tickets RLS Policies
-- Customers can view and create their own support tickets
CREATE POLICY customer_view_own_tickets ON support_tickets
  FOR SELECT
  USING (
    customer_id = auth.uid()
    OR auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'support')
  );

CREATE POLICY customer_create_own_tickets ON support_tickets
  FOR INSERT
  WITH CHECK (
    customer_id = auth.uid()
  );

-- Customers can view and insert replies on tickets they own
CREATE POLICY customer_view_ticket_replies ON support_ticket_replies
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_ticket_replies.ticket_id
        AND (support_tickets.customer_id = auth.uid() OR auth.jwt() ->> 'role' IN ('admin', 'super_admin', 'support'))
    )
  );

CREATE POLICY customer_insert_ticket_replies ON support_ticket_replies
  FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM support_tickets
      WHERE support_tickets.id = support_ticket_replies.ticket_id
        AND support_tickets.customer_id = auth.uid()
    )
  );
