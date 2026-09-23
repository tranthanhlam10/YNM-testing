-- YNMPECA-9338 - Seed data for Fill Missing Dates testing
-- Target: eci_testing.product_item_histories_distributed
--
-- IMPORTANT
-- 1. Run this only on the isolated Testing table/database.
-- 2. The qa_* product_item_id values must exist in Solr for the main migration
--    script to preload them. Otherwise replace qa_* with real Testing PIDs or
--    execute the core/offline harness directly.
-- 3. Use a clean destination table for every run. The current implementation
--    is not idempotent and rerunning may create duplicate physical rows.
-- 4. This seed intentionally contains is_abnormal=1 records for buff scenarios.
--    The migration query must exclude those records before distribution.

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
SELECT
    toDateTime64(crawled_date, 3),
    product_item_id,
    toDateTime64('2026-08-12 11:35:00.000', 3),
    toDateTime64(updated_date, 3),
    'PI_BY_SHOP',
    concat('qa!', product_item_id),
    'tiki.vn',
    toDecimal64(120000, 2),
    toDecimal64(120000, 2),
    toDecimal64(120000, 2),
    toDecimal64(100000, 2),
    toDecimal64(100000, 2),
    toDecimal64(100000, 2),
    total_sold,
    last_total_sold,
    toDateTime64(last_crawled_date, 3),
    true,
    is_abnormal,
    10
FROM values(
    'crawled_date String, product_item_id String, updated_date String, total_sold Int32, last_total_sold Int32, last_crawled_date String, is_abnormal Bool',

    -- TC_NO_GAP_001
    -- Full daily chain. Expected: no FILL_MISSING is generated.
    ('2026-07-19 00:00:00.001', 'qa_fill_no_gap', '2026-08-12 11:35:01.000', 100, 100, '2026-07-18 00:00:00.001', false),
    ('2026-07-20 00:00:00.001', 'qa_fill_no_gap', '2026-08-12 11:35:02.000', 100, 100, '2026-07-19 00:00:00.001', false),
    ('2026-07-21 00:00:00.001', 'qa_fill_no_gap', '2026-08-12 11:35:03.000', 100, 100, '2026-07-20 00:00:00.001', false),
    ('2026-07-22 00:00:00.001', 'qa_fill_no_gap', '2026-08-12 11:35:04.000', 100, 100, '2026-07-21 00:00:00.001', false),
    ('2026-07-23 00:00:00.001', 'qa_fill_no_gap', '2026-08-12 11:35:05.000', 100, 100, '2026-07-22 00:00:00.001', false),
    ('2026-07-24 00:00:00.001', 'qa_fill_no_gap', '2026-08-12 11:35:06.000', 100, 100, '2026-07-23 00:00:00.001', false),
    ('2026-07-25 00:00:00.001', 'qa_fill_no_gap', '2026-08-12 11:35:07.000', 100, 100, '2026-07-24 00:00:00.001', false),
    ('2026-07-26 00:00:00.001', 'qa_fill_no_gap', '2026-08-12 11:35:08.000', 100, 100, '2026-07-25 00:00:00.001', false),

    -- TC_ELIG_001 - only one valid point.
    -- Expected: skip by FR-01. The zero-point scenario has no ClickHouse row.
    ('2026-02-13 00:00:00.001', 'qa_fill_one_point', '2026-08-12 11:36:01.000', 101, 100, '2026-02-12 00:00:00.001', false),

    -- TC_ELIG_002 / TC_ELIG_005 / TC_OUT_001-003 / TC_RETRY_001
    -- Wiki happy path. Expected missing dates: 2026-02-02 through 2026-02-09.
    ('2026-02-01 00:00:00.001', 'qa_fill_happy_8d', '2026-08-12 11:37:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-10 00:00:00.001', 'qa_fill_happy_8d', '2026-08-12 11:37:02.000', 120, 100, '2026-02-01 00:00:00.001', false),

    -- TC_ELIG_003 - FR-02 counterexample.
    -- 27/04 and 01/05 are in the same week but cross month-end.
    -- Business expected: no fill. Current code may fill 28/04-30/04.
    ('2026-04-27 00:00:00.001', 'qa_fill_same_week_month_end', '2026-08-12 11:38:01.000', 100, 100, '2026-04-26 00:00:00.001', false),
    ('2026-05-01 00:00:00.001', 'qa_fill_same_week_month_end', '2026-08-12 11:38:02.000', 120, 100, '2026-04-27 00:00:00.001', false),

    -- TC_ELIG_004 - no future-week evidence.
    -- Expected: no fill after the last observed point.
    ('2026-02-01 00:00:00.001', 'qa_fill_no_future_week', '2026-08-12 11:39:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-04 00:00:00.001', 'qa_fill_no_future_week', '2026-08-12 11:39:02.000', 110, 100, '2026-02-01 00:00:00.001', false),

    -- TC_ELIG_006 - observed record on Thursday.
    -- Business expected: do not fill the week containing 12/02.
    ('2026-02-01 00:00:00.001', 'qa_fill_weekend_thu', '2026-08-12 11:40:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-12 00:00:00.001', 'qa_fill_weekend_thu', '2026-08-12 11:40:02.000', 120, 100, '2026-02-01 00:00:00.001', false),
    ('2026-02-18 00:00:00.001', 'qa_fill_weekend_thu', '2026-08-12 11:40:03.000', 130, 120, '2026-02-12 00:00:00.001', false),

    -- TC_ELIG_006 - observed record on Friday.
    -- Business expected: do not fill the week containing 13/02.
    ('2026-02-01 00:00:00.001', 'qa_fill_weekend_fri', '2026-08-12 11:41:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-13 00:00:00.001', 'qa_fill_weekend_fri', '2026-08-12 11:41:02.000', 120, 100, '2026-02-01 00:00:00.001', false),
    ('2026-02-18 00:00:00.001', 'qa_fill_weekend_fri', '2026-08-12 11:41:03.000', 130, 120, '2026-02-13 00:00:00.001', false),

    -- TC_ELIG_006 - observed record on Saturday.
    -- Business expected: do not fill the week containing 14/02.
    ('2026-02-01 00:00:00.001', 'qa_fill_weekend_sat', '2026-08-12 11:42:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-14 00:00:00.001', 'qa_fill_weekend_sat', '2026-08-12 11:42:02.000', 120, 100, '2026-02-01 00:00:00.001', false),
    ('2026-02-18 00:00:00.001', 'qa_fill_weekend_sat', '2026-08-12 11:42:03.000', 130, 120, '2026-02-14 00:00:00.001', false),

    -- TC_ELIG_007 - Wednesday is the control case for FR-05.
    -- Expected: Wednesday alone must not block distribution.
    ('2026-02-01 00:00:00.001', 'qa_fill_weekday_wed', '2026-08-12 11:43:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-11 00:00:00.001', 'qa_fill_weekday_wed', '2026-08-12 11:43:02.000', 120, 100, '2026-02-01 00:00:00.001', false),
    ('2026-02-18 00:00:00.001', 'qa_fill_weekday_wed', '2026-08-12 11:43:03.000', 130, 120, '2026-02-11 00:00:00.001', false),

    -- TC_ELIG_008 - total_sold delta boundaries 0, 1 and 2.
    ('2026-02-01 00:00:00.001', 'qa_fill_delta_0', '2026-08-12 11:44:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-10 00:00:00.001', 'qa_fill_delta_0', '2026-08-12 11:44:02.000', 100, 100, '2026-02-01 00:00:00.001', false),
    ('2026-02-01 00:00:00.001', 'qa_fill_delta_1', '2026-08-12 11:45:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-10 00:00:00.001', 'qa_fill_delta_1', '2026-08-12 11:45:02.000', 101, 100, '2026-02-01 00:00:00.001', false),
    ('2026-02-01 00:00:00.001', 'qa_fill_delta_2', '2026-08-12 11:46:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-10 00:00:00.001', 'qa_fill_delta_2', '2026-08-12 11:46:02.000', 102, 100, '2026-02-01 00:00:00.001', false),

    -- TC_ELIG_009 - negative delta.
    -- Expected: no negative distributed sold.
    ('2026-02-01 00:00:00.001', 'qa_fill_negative_delta', '2026-08-12 11:47:01.000', 120, 120, '2026-01-31 00:00:00.001', false),
    ('2026-02-10 00:00:00.001', 'qa_fill_negative_delta', '2026-08-12 11:47:02.000', 100, 120, '2026-02-01 00:00:00.001', false),

    -- TC_DATE_001 - synthetic left anchor from last_* of the first loaded row.
    -- Run with From=20260201. Expected first fill date: 2026-02-01.
    ('2026-02-10 00:00:00.001', 'qa_fill_left_anchor', '2026-08-12 11:48:01.000', 120, 100, '2026-01-31 00:00:00.001', false),

    -- TC_DATE_002 - first observed point appears mid-week.
    -- Expected: do not backfill 01/02-02/02; first fill date is 04/02.
    ('2026-02-03 00:00:00.001', 'qa_fill_first_midweek', '2026-08-12 11:49:01.000', 100, 100, '2026-02-02 00:00:00.001', false),
    ('2026-02-10 00:00:00.001', 'qa_fill_first_midweek', '2026-08-12 11:49:02.000', 120, 100, '2026-02-03 00:00:00.001', false),

    -- TC_DATE_003 - long gap.
    -- Expected missing dates: 02/02 through 17/02 (16 dates).
    ('2026-02-01 00:00:00.001', 'qa_fill_gap_16d', '2026-08-12 11:50:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-18 00:00:00.001', 'qa_fill_gap_16d', '2026-08-12 11:50:02.000', 140, 100, '2026-02-01 00:00:00.001', false),

    -- TC_DATE_004 - two independent gaps aligned with two important Saturdays.
    -- Expected gaps: 02/02-09/02 and 11/02-17/02 when all rules pass.
    ('2026-02-01 00:00:00.001', 'qa_fill_two_gaps', '2026-08-12 11:51:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-10 00:00:00.001', 'qa_fill_two_gaps', '2026-08-12 11:51:02.000', 120, 100, '2026-02-01 00:00:00.001', false),
    ('2026-02-18 00:00:00.001', 'qa_fill_two_gaps', '2026-08-12 11:51:03.000', 140, 120, '2026-02-10 00:00:00.001', false),

    -- TC_DIST_003 - deterministic/remainder test.
    -- Delta=10 across nine steps; run dry-run five times and compare date/total_sold.
    ('2026-02-01 00:00:00.001', 'qa_fill_deterministic', '2026-08-12 11:52:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-10 00:00:00.001', 'qa_fill_deterministic', '2026-08-12 11:52:02.000', 110, 100, '2026-02-01 00:00:00.001', false),

    -- TC_DIST_004 - actual hard-coded mega-sale window in current code.
    -- Current code applies +20% average increase on 14/12/2024-21/12/2024.
    ('2024-12-08 00:00:00.001', 'qa_fill_mega_sale', '2026-08-12 11:53:01.000', 100, 100, '2024-12-07 00:00:00.001', false),
    ('2024-12-22 00:00:00.001', 'qa_fill_mega_sale', '2026-08-12 11:53:02.000', 140, 100, '2024-12-08 00:00:00.001', false),

    -- TC_DIST_004 control range with the same duration/delta and no hard-coded sale date.
    ('2024-11-24 00:00:00.001', 'qa_fill_mega_control', '2026-08-12 11:54:01.000', 100, 100, '2024-11-23 00:00:00.001', false),
    ('2024-12-08 00:00:00.001', 'qa_fill_mega_control', '2026-08-12 11:54:02.000', 140, 100, '2024-11-24 00:00:00.001', false),

    -- TC_BUFF_001 - abnormal point in the middle must not become an anchor.
    ('2026-02-01 00:00:00.001', 'qa_fill_buff_middle', '2026-08-12 11:55:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-05 00:00:00.001', 'qa_fill_buff_middle', '2026-08-12 11:55:02.000', 9999, 100, '2026-02-01 00:00:00.001', true),
    ('2026-02-10 00:00:00.001', 'qa_fill_buff_middle', '2026-08-12 11:55:03.000', 120, 9999, '2026-02-05 00:00:00.001', false),

    -- TC_BUFF_001 - after abnormal filtering only one valid point remains.
    -- Expected: skip by FR-01 after clean timeline is rebuilt.
    ('2026-02-01 00:00:00.001', 'qa_fill_buff_insufficient', '2026-08-12 11:56:01.000', 100, 100, '2026-01-31 00:00:00.001', false),
    ('2026-02-10 00:00:00.001', 'qa_fill_buff_insufficient', '2026-08-12 11:56:02.000', 5000, 100, '2026-02-01 00:00:00.001', true)
);

-- Seed verification: record counts and effective date boundaries per scenario.
SELECT
    product_item_id,
    count() AS row_count,
    countIf(is_abnormal = 0) AS valid_row_count,
    countIf(is_abnormal = 1) AS abnormal_row_count,
    min(crawled_date) AS min_crawled_date,
    max(crawled_date) AS max_crawled_date,
    groupArray((crawled_date, total_sold, last_total_sold, last_crawled_date, is_abnormal)) AS timeline
FROM eci_testing.product_item_histories_distributed
WHERE startsWith(product_item_id, 'qa_fill_')
GROUP BY product_item_id
ORDER BY product_item_id;

-- Output verification after running the migration to the recommended temp table.
-- Change the table name if a different destination_source is used.
SELECT
    product_item_id,
    crawler_type,
    count() AS row_count,
    min(crawled_date) AS first_date,
    max(crawled_date) AS last_date,
    groupArray((crawled_date, total_sold, last_total_sold, last_crawled_date)) AS output_timeline
FROM eci_testing.product_item_histories_fill_missing_tmp
WHERE startsWith(product_item_id, 'qa_fill_')
GROUP BY product_item_id, crawler_type
ORDER BY product_item_id, crawler_type;

