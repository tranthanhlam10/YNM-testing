# Task tính WS của anh Minh

## Scope

ClickHouse — kiểm tra trạng thái abnormal / last_total_sold


Solr — kiểm tra doc weekly còn/mất:


Log job — các dòng log hữu ích khi debug:



## k8s

detect-invalid-record


## Điều kiện kiểm tra abnormal

is_abnormal = 0

detal_sold = 0




// Câu query:

- Lấy các PIs của QC:


select * from eci_testing.product_item_histories_distributed pihd 
limit 100 


SELECT
    crawled_date,
    product_item_id,
    shop_id,
    source_id,
    crawler_type,
    price,
    sell_price,
    total_sold,
    last_total_sold,
    last_crawled_date,
    created_date,
    updated_date,
    official,
    is_abnormal,
    total_rating
FROM eci_testing.product_item_histories_distributed
WHERE
  crawled_date >= toDateTime('2026-07-27 00:00:00')
  AND crawled_date < toDateTime('2026-08-01 00:00:00')
ORDER BY crawled_date ASC, updated_date DESC;