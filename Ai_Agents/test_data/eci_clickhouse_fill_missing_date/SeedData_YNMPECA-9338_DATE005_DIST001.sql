-- YNMPECA-9338
-- Seed bổ sung cho TC_DATE_005 và TC_DIST_001.
-- Chạy phần PRE-CHECK trước. Không chạy INSERT lần hai nếu các record đã tồn tại.

-- ============================================================
-- 1. PRE-CHECK
-- ============================================================
SELECT
    product_item_id,
    crawled_date,
    total_sold,
    last_total_sold,
    last_crawled_date,
    crawler_type,
    is_abnormal
FROM eci_testing.product_item_histories_distributed
WHERE product_item_id IN
(
    'shopee_1025992724',
    'shopee_10295129417',
    'shopee_1742931213',
    'shopee_18082117466'
)
AND
(
       crawled_date BETWEEN '2024-02-25 00:00:00' AND '2024-03-10 23:59:59.999'
    OR crawled_date BETWEEN '2026-01-25 00:00:00' AND '2026-02-08 23:59:59.999'
    OR crawled_date BETWEEN '2026-03-01 00:00:00' AND '2026-03-16 23:59:59.999'
    OR crawled_date BETWEEN '2026-12-27 00:00:00' AND '2027-01-10 23:59:59.999'
)
ORDER BY product_item_id, crawled_date;

-- ============================================================
-- 2. INSERT SOURCE SEED
-- ============================================================
INSERT INTO eci_testing.product_item_histories_distributed
(
    crawled_date,
    product_item_id,
    created_date,
    updated_date,
    crawler_type,
    shop_id,
    source_id,
    price,
    price_1,
    price_2,
    sell_price,
    sell_price_1,
    sell_price_2,
    total_sold,
    last_total_sold,
    last_crawled_date,
    official,
    is_abnormal,
    total_rating
)
VALUES
    -- TC_DATE_005-A: qua cuối tháng 01/2026 -> 02/2026.
    -- Expected FILL_MISSING: 2026-01-26 -> 2026-02-07 (13 ngày).
    ('2026-01-25 00:00:00.001', 'shopee_1025992724', '2026-08-18 10:00:00.000', '2026-08-18 10:00:01.000', 'PI_BY_SHOP', 'shopee!seed_date_month', 'shopee.vn', 120000.00, 120000.00, 120000.00, 100000.00, 100000.00, 100000.00, 100, 100, '2026-01-24 00:00:00.001', true, false, 10),
    ('2026-02-08 00:00:00.001', 'shopee_1025992724', '2026-08-18 10:00:00.000', '2026-08-18 10:00:02.000', 'PI_BY_SHOP', 'shopee!seed_date_month', 'shopee.vn', 120000.00, 120000.00, 120000.00, 100000.00, 100000.00, 100000.00, 140, 100, '2026-01-25 00:00:00.001', true, false, 10),

    -- TC_DATE_005-B: qua cuối năm 2026 -> 2027.
    -- Expected FILL_MISSING: 2026-12-28 -> 2027-01-09 (13 ngày).
    ('2026-12-27 00:00:00.001', 'shopee_10295129417', '2026-08-18 10:01:00.000', '2026-08-18 10:01:01.000', 'PI_BY_SHOP', 'shopee!seed_date_year', 'shopee.vn', 120000.00, 120000.00, 120000.00, 100000.00, 100000.00, 100000.00, 100, 100, '2026-12-26 00:00:00.001', true, false, 10),
    ('2027-01-10 00:00:00.001', 'shopee_10295129417', '2026-08-18 10:01:00.000', '2026-08-18 10:01:02.000', 'PI_BY_SHOP', 'shopee!seed_date_year', 'shopee.vn', 120000.00, 120000.00, 120000.00, 100000.00, 100000.00, 100000.00, 140, 100, '2026-12-27 00:00:00.001', true, false, 10),

    -- TC_DATE_005-C: qua ngày nhuận 29/02/2024.
    -- Expected FILL_MISSING: 2024-02-26 -> 2024-03-09 (13 ngày).
    ('2024-02-25 00:00:00.001', 'shopee_1742931213', '2026-08-18 10:02:00.000', '2026-08-18 10:02:01.000', 'PI_BY_SHOP', 'shopee!seed_date_leap', 'shopee.vn', 120000.00, 120000.00, 120000.00, 100000.00, 100000.00, 100000.00, 100, 100, '2024-02-24 00:00:00.001', true, false, 10),
    ('2024-03-10 00:00:00.001', 'shopee_1742931213', '2026-08-18 10:02:00.000', '2026-08-18 10:02:02.000', 'PI_BY_SHOP', 'shopee!seed_date_leap', 'shopee.vn', 120000.00, 120000.00, 120000.00, 100000.00, 100000.00, 100000.00, 140, 100, '2024-02-25 00:00:00.001', true, false, 10),

    -- TC_DIST_001: gap đầu chỉ thiếu ngày 02/03; mốc 10/03 là future evidence.
    -- Assertion chính: output phải chứa đúng một FILL_MISSING cho gap 01/03 -> 03/03, tại 02/03.
    ('2026-03-01 00:00:00.001', 'shopee_18082117466', '2026-08-18 10:03:00.000', '2026-08-18 10:03:01.000', 'PI_BY_SHOP', 'shopee!seed_dist_one_day', 'shopee.vn', 120000.00, 120000.00, 120000.00, 100000.00, 100000.00, 100000.00, 100, 100, '2026-02-28 00:00:00.001', true, false, 10),
    ('2026-03-03 00:00:00.001', 'shopee_18082117466', '2026-08-18 10:03:00.000', '2026-08-18 10:03:02.000', 'PI_BY_SHOP', 'shopee!seed_dist_one_day', 'shopee.vn', 120000.00, 120000.00, 120000.00, 100000.00, 100000.00, 100000.00, 110, 100, '2026-03-01 00:00:00.001', true, false, 10),
    ('2026-03-10 00:00:00.001', 'shopee_18082117466', '2026-08-18 10:03:00.000', '2026-08-18 10:03:03.000', 'PI_BY_SHOP', 'shopee!seed_dist_one_day', 'shopee.vn', 120000.00, 120000.00, 120000.00, 100000.00, 100000.00, 100000.00, 120, 110, '2026-03-03 00:00:00.001', true, false, 10);

-- ============================================================
-- 3. VERIFY SOURCE SEED
-- ============================================================
SELECT
    product_item_id,
    crawled_date,
    total_sold,
    last_total_sold,
    last_crawled_date,
    crawler_type,
    is_abnormal
FROM eci_testing.product_item_histories_distributed
WHERE product_item_id IN
(
    'shopee_1025992724',
    'shopee_10295129417',
    'shopee_1742931213',
    'shopee_18082117466'
)
AND
(
       crawled_date BETWEEN '2024-02-25 00:00:00' AND '2024-03-10 23:59:59.999'
    OR crawled_date BETWEEN '2026-01-25 00:00:00' AND '2026-02-08 23:59:59.999'
    OR crawled_date BETWEEN '2026-03-01 00:00:00' AND '2026-03-16 23:59:59.999'
    OR crawled_date BETWEEN '2026-12-27 00:00:00' AND '2027-01-10 23:59:59.999'
)
ORDER BY product_item_id, crawled_date;
