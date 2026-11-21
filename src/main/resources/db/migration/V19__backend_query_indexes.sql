-- Hot order lookups: admin status/date lists and per-phone concurrency/abuse checks.
DROP INDEX IF EXISTS idx_orders_status;
DROP INDEX IF EXISTS idx_orders_customer_phone;
DROP INDEX IF EXISTS idx_orders_created_at;
CREATE INDEX IF NOT EXISTS idx_orders_status_created_id
    ON orders (status, created_at DESC, id DESC);
CREATE INDEX IF NOT EXISTS idx_orders_phone_status
    ON orders (customer_phone, status);
CREATE INDEX IF NOT EXISTS idx_orders_created_id_desc
    ON orders (created_at DESC, id DESC);

-- Replace the old two-column index: the new index serves the same prefix and filters cancellations too.
DROP INDEX IF EXISTS idx_orders_slot_date;
CREATE INDEX IF NOT EXISTS idx_orders_slot_date_status
    ON orders (slot_id, scheduled_date, status)
    WHERE slot_id IS NOT NULL;

-- Public catalog and admin category filters only return non-deleted products.
DROP INDEX IF EXISTS idx_products_category;
CREATE INDEX IF NOT EXISTS idx_products_active_category_sort
    ON products (category_id, sort_order, id)
    WHERE is_deleted = FALSE;
CREATE INDEX IF NOT EXISTS idx_categories_public_sort
    ON categories (sort_order, id)
    WHERE is_deleted = FALSE AND is_active = TRUE;
CREATE INDEX IF NOT EXISTS idx_branches_public_sort
    ON branches (sort_order, id)
    WHERE is_deleted = FALSE AND is_active = TRUE;

-- Public promotion queries filter active rows and order by display position.
CREATE INDEX IF NOT EXISTS idx_promotions_public_sort
    ON promotions (sort_order, id)
    WHERE is_deleted = FALSE AND is_active = TRUE;

-- Admin audit log uses a stable descending created-time page order.
DROP INDEX IF EXISTS idx_audit_log_created_at;
CREATE INDEX IF NOT EXISTS idx_audit_log_created_id_desc
    ON audit_log (created_at DESC, id DESC);

CREATE INDEX IF NOT EXISTS idx_catering_status_created_id
    ON catering_requests (status, created_at DESC, id DESC);
