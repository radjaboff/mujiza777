-- ==============================================================================
-- V20: High-performance production indexes
-- Optimized for high-concurrency order processing, analytics, and cashier searches.
-- ==============================================================================

-- 1. Foreign key index on orders.branch_id (for pickup orders and branch filtering)
CREATE INDEX IF NOT EXISTS idx_orders_branch_id
    ON orders (branch_id)
    WHERE branch_id IS NOT NULL;

-- 2. Fast composite range index for dashboard analytics and reporting
-- Serves queries: WHERE created_at >= :fromAt AND created_at < :toAt AND status <> 'CANCELLED'
CREATE INDEX IF NOT EXISTS idx_orders_created_status
    ON orders (created_at, status);

-- 3. Foreign key index on cake_requests.cake_type_id
CREATE INDEX IF NOT EXISTS idx_cake_requests_cake_type_id
    ON cake_requests (cake_type_id)
    WHERE cake_type_id IS NOT NULL;

-- 4. Covering composite index on order_items (order_id, product_id)
-- Dramatically speeds up self-joins for "Frequently Bought Together" recommendations
CREATE INDEX IF NOT EXISTS idx_order_items_order_product
    ON order_items (order_id, product_id);

-- 5. Fast pickup code lookup index for cashiers and store pickup verification
CREATE INDEX IF NOT EXISTS idx_orders_pickup_code
    ON orders (pickup_code)
    WHERE pickup_code IS NOT NULL;
