# Task clickhouse của ECI


## Scope

Chuyển đổi DB lưu trữ product_items_history từ timescale sang clickhouse


## Các scope để test


1. App

Hiện tại khi tính toán số liệu cho weekly monthly thì bên App đã tính toán WS và MS

Kiểm tra lại 2 luồng check Detect Invalid và Calculate Weekly và Monthly

Kiểm tra các function nào từng xử dụng timescale để view lên, thì những function đó cũng xử dụng clickhouse để view cho thay đổi này


2. Data

Kiểm tra các luồng pusher cảu bên Data đã đẩy vào DB clickhouse chưa



## Cách chạy


1. Data

- Đây là pusher của clickhouse

cl-team-clickhouse-ynm-cl-eca-data-pusher-service

- Đây là các luồng crawl, loader, updater và pusher ở team data

cl-team-ynm-cl-eca-product-item-crawler-service

cl-team-ynm-cl-eca-source-updater-service

cl-team-ynm-cl-eca-data-pusher-service

tiki-ynm-cl-eca-crawling-loader-service

tiktok-ynm-cl-eca-crawling-loader-service

shopee-ynm-cl-eca-crawling-loader-service

lazada-ynm-cl-eca-crawling-loader-service


- Những luồng crawl PIs của tiki


eci-testing-crawler-eca-tiki-api-pi-cats

eci-testing-crawler-eca-tiki-api-pi-detail

eci-testing-crawler-eca-tiki-api-pi-shops

eci-testing-crawler-load-tiki-cate-by-pz

eci-testing-crawler-load-tiki-shop-by-pz


2. App

cronjob-eca-detect-invalid-job-testing
cronjob-eca-ws-ms-calculate-pi-histories-job-testing

Trigger 2 jobs này để chạy


https://k8s.ynm.local/#/cronjob/crawler-testing/cronjob-eca-detect-invalid-job-testing?namespace=crawler-testing


https://k8s.ynm.local/#/cronjob/crawler-testing/cronjob-eca-ws-ms-calculate-pi-histories-job-testing?namespace=crawler-testing


3. Những queue cần biết để chạy luồng này






