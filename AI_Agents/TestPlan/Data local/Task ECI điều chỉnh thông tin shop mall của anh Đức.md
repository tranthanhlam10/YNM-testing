# Check task ECI điều chỉnh thông tin shop mall


## Scope

Một Shop hoặc Product Item (PI) đã là Mall thì không được bị bất kỳ lần
crawl, message đến trễ, retry hoặc service downstream nào cập nhật ngược
về 0, false hoặc null.



## Hướng xử lý


Đối với các shop đang là official:1 trong hệ thống thì không được cập nhật lại giá trị về 0 hay null.




## Cách chạy


1. Các deployment


- shopee-ynm-cl-eca-crawling-loader-service-testing
- tiki-ynm-cl-eca-crawling-loader-service-testing
- lazada-ynm-cl-eca-crawling-loader-service-testing
- tiktok-ynm-cl-eca-crawling-loader-service-testing

- cl-team-ynm-cl-eca-product-item-crawler-service-testing

- cl-team-ynm-cl-eca-data-pusher-service-testing

- cl-team-ynm-cl-eca-source-updater-service-testing

- ynmpeca-ynmpeca-7250-shopee-shop-info-testing


| Thành phần | Deployment |
|---|---|
| Shopee Loader | `shopee-ynm-cl-eca-crawling-loader-service-testing` |
| Tiki Loader | `tiki-ynm-cl-eca-crawling-loader-service-testing` |
| Lazada Loader | `lazada-ynm-cl-eca-crawling-loader-service-testing` |
| TikTok Loader | `tiktok-ynm-cl-eca-crawling-loader-service-testing` |
| Resolver | `cl-team-ynm-cl-eca-product-item-crawler-service-testing` |
| Data Pusher | `cl-team-ynm-cl-eca-data-pusher-service-testing` |
| Source Updater | `cl-team-ynm-cl-eca-source-updater-service-testing` |
| Shopee Shop Detail crawler | `ynmpeca-ynmpeca-7250-shopee-shop-info-testing` |



2. Câu regex các queue 



eca_shopee_shop_info_crawling| eca_shopee_product_item_by_shop_crawling| eca_shopee_product_item_by_shop_crawling|priority_1_product_item_by_shop_crawling|eca_tiktok_shop_info_crawling|priority_1_product_item_by_shop_crawling|eca_lazada_product_item_by_category_crawling|eca_tiktok_product_item_crawling|cl.eca.product_items_crawled_sources|cl.eca.product_items|cl.eca.shops|cl.eca.product_item_histories|cl.eca.ranking_product_items|eca_category|eca_lazada_product_item_by_shop_crawling|eca_shopee_product_item_crawling|eca_lazada_product_item_crawling|eca_tiki_product_item_crawling




cl.eca.product_items|cl.eca.shops|cl.eca.product_item_histories|cl.eca.ranking_product_items|eca_category


cl.eca.product_items|eca.shops|cl.eca.ranking_product_items|product_item_finish_sources|shop_finish_sources|cl.eca.product_item_weekly



3. Các message dùng dể test


- Loader 









- Resolver








- Updater












- Data pusher 




## Những cases cần phải check 



Loader: 

shopee-ynm-cl-eca-crawling-loader-service-testing -> Hiện tại đã chạy đúng yêu cầu
tiki-ynm-cl-eca-crawling-loader-service-testing -> Hiện tại đã chạy đúng với yêu cầu
lazada-ynm-cl-eca-crawling-loader-service-testing -> Hiện tại đã đúng yêu cầu
tiktok-ynm-cl-eca-crawling-loader-service-testing -> Hiện tại đã đúng với yêu cầu



Resolver:

cl-team-ynm-cl-eca-product-item-crawler-service-testing


Pusher:


cl-team-ynm-cl-eca-data-pusher-service-testing

Updater

cl-team-ynm-cl-eca-source-updater-service


## Những cases cần phải check lại ở Staging


- Loader:

Shop
Detail
PI


- Resolver


- Data pusher

PI
Shop
PIW
PIR


- Updater

PI
Shop



1. VN - namespace crawler-staging



eca-staging-crawler-eca-tiki-api-pi-shops

eca-staging-crawler-eca-tiki-api-pi-shops

cl-team-ynm-cl-eca-product-item-crawler-service-staging
cl-team-ynm-cl-eca-source-updater-service-staging
cl-team-ynm-cl-eca-data-pusher-service-staging


tiki-ynm-cl-eca-crawling-loader-service-staging
tiktok-ynm-cl-eca-crawling-loader-service-staging
shopee-ynm-cl-eca-crawling-loader-service-staging -> Hiện tại chỉ có chỗ này bị lỗi
lazada-ynm-cl-eca-crawling-loader-service-staging



TH - namespace crawler-th-staging
cl-team-ynm-cl-eca-product-item-crawler-service-th-staging
cl-team-ynm-cl-eca-source-updater-service-th-staging
cl-team-ynm-cl-eca-data-pusher-service-th-staging

lazada-ynm-cl-eca-crawling-loader-service-th-staging
shopee-ynm-cl-eca-crawling-loader-service-th-staging
tiktok-ynm-cl-eca-crawling-loader-service-th-staging

