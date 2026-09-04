# Task loader luồng prioriy của a Đức


## Scope

Đều chỉnh priority của luồng crawl detail , load đi crawl theo priority


## Hướng xử lý


Phương án đề xuất là gom vùng 1 + vùng 2 lại (tạm gọi vùng A), gom vùng 3 + vùng 4 lại (tạm gọi vùng B).

Từ thứ 5 đến hết chủ nhật sẽ bật vùng A, những ngày còn lại trong tuần thì bật vùng B.

Nếu gặp trường hợp bị block thì chỉ ưu tiên vùng 1, nếu crawl hết thì load vùng 2.

Nếu rơi vào cuối tháng thì crawl vùng A từ bắt đầu 3 ngày cách cuối tháng đến hết ngày đầu tiên của tháng.



## Các case cần test

- Chạy được ở mode bình thường




## Cách chạy

1. K8s

shopee-ynm-cl-eca-crawling-loader-service-testing

https://k8s.ynm.local/#/deployment/crawler-testing/shopee-ynm-cl-eca-crawling-loader-service-testing?namespace=crawler-testing


2. RabbitMQ

eca_shopee_product_item_unify_crawling



3. Câu config



- name: PRODUCT_ITEM_BATCH_CRAWLING_LOADER_CHUNK_SIZE
  value: '5'
- name: PRODUCT_ITEM_BATCH_CRAWLING_LOADER_MAX_MSG_IN_QUEUE
  value: '1000'
- name: PRODUCT_ITEM_BATCH_CRAWLING_LOADER_OUTPUT_QUEUE
  value: product_item_unify_crawling
- name: PRODUCT_ITEM_BATCH_CRAWLING_LOADER_METADATA_ENABLE_AUTO_SELECT_PRIORITY
  value: '1'
- name: PRODUCT_ITEM_BATCH_CRAWLING_LOADER_METADATA_WEEKLY_PRIORITY_RULE
  value: '0,4,5,6'
- name: PRODUCT_ITEM_BATCH_CRAWLING_LOADER_METADATA_MONTH_END_PRIORITY_DAYS
  value: '3'


Đây là config extra filter
- name: PRODUCT_ITEM_BATCH_CRAWLING_LOADER_EXTRA_FILTER
              value: >-
                {"industry_id":"(2 13 19 22 31 46
                87)","crawled_date":"[NOW-180DAYS TO NOW] OR
                detail_crawled_date: [NOW-180DAYS TO NOW]", "latest_sold":"[1 TO
                *]", "-count_failed":"[5 TO *]"}