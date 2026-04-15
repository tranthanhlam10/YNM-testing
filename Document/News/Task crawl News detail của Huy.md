# Task crawl News detail của Huy


## Scope

Chỉ thêm country cho luồng chạy
Các luồng chạy cho global phải chạy theo config country
Ngoài ra về logic luồng crawl thì không thay đổi gì nhiều


## Chiến lược test

- Chuẩn bị data cho các crawl detail
- Kiểm tra loader (Load đúng config country hay không - còn query loader thì không thay đổi so với luồng VN)
- Kiểm tra crawling
- Kiểm tra resolver (Đẩy được đúng mentions xuống routing_keys <country>)
- Kiểm tra pusher (Có mapping đúng country khi insert xuống solr)



## Thay đổi


+ Service Loader thay đổi:

Query để load bổ sung thêm điều kiện "country_code = <country_code>" .
+ Các serivce Article Url Classifier, Http Crawler, Browser Crawler, Article Parser không thay đổi.

+ Service Parsed Details 2 Mentions thay đổi:

Thêm field country_code cho mention / article post / article review (nếu có).
+ Service Data Pusher thay đổi:

Nếu article post / article review (nếu có) không có giá trị ở field country_code thì gắn mặc định là VN.
+ Service Source Updater không thay đổi.


## Câu lệnh chạy

1. RabbitMQ

(high|normal)_priority_detail_url_info(_global)?$|ynm.auto_parser(_global)?.(high|normal)_priority_article_urls_crawled_by_(browser|http)_crawler$|ynm.auto_parser(_global)?.error_article_urls$|ynm.auto_parser(_global)?.raw_article_contents$|parsed_detail_output$|(dev|testing|staging|production).cl.mentions_2_solr_mentions$|(dev|testing|staging|production).cl.news.(article_posts|article_crawl_reviews)$|cl.mentions_2_solr_mentions_LamTT|staging.cl.news.article_posts_LamTT


2. K8s


kubectl get pods -n crawler-testing | grep ynmshgysg-351-testing-ynm-crawler-empty
kubectl exec -it ynmshgysg-351-testing-ynm-crawler-empty-65554f795f-q6vwd -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


3. Mongo

- HighPriorityNewsSourceCrawlingLoader

+ status = 1

+ next_crawl_time <= now

+ created_date > (now - 7 days)

+ platform = 3

+ id_category <> 0

+ priority: 1


- BlogSourceCrawlingLoader


+ status = 1

+ next_crawl_time <= now

+ created_date > (now - 7 days)

+ platform = 4

+ id_category <> 0


- EcomReviewSourceCrawlingLoader

+ status = 1

+ next_crawl_time <= now

+ created_date > (now - 7 days)

+ platform = [5, 6]

+ id_category <> 0

+ priority: 1

- NormalPriorityNewsSourceCrawlingLoader

+ status = 1

+ next_crawl_time <= now

+ created_date > (now - 7 days)

+ platform = 3

+ id_category <> 0

+ priority: 2


4. Script chạy


- Loader

export HTTP_PORT=9999

export LOG_LEVEL=debug

export NEWS_MODULE_ENABLED=true

export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_QUEUE=high_priority_detail_url_info

export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_QUEUE=high_priority_detail_url_info

export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_QUEUE=high_priority_detail_url_info

export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_QUEUE=normal_priority_detail_url_info

yarn start --scope=@ynm/cl-crawling-loader-service





- Parse detail to mentions

export HTTP_PORT=9998
 
export LOG_LEVEL=debug
 
yarn start --scope=@ynm/cl-news-parsed-details-2-mentions-service



5. Redis


HighPriorityNewsSourceCrawlingLoader

BlogSourceCrawlingLoader

EcomReviewSourceCrawlingLoader

NormalPriorityNewsSourceCrawlingLoader


## Những việc cần check ở testing

Thứ tự các pod cần scale của Huy

- Loader

ynm-cl-news-crawling-loader-service


- Parser

| # | Service         | High Priority                                    | Normal Priority                                    |
| - | --------------- | ------------------------------------------------ | -------------------------------------------------- |
| 1 | Classifier      | auto-parser-testing-high-classifier              | auto-parser-testing-normal-classifier              |
| 2 | Browser Crawler | auto-parser-testing-high-browser-crawler         | auto-parser-testing-normal-browser-crawler         |
| 3 | Http Crawler    | auto-parser-testing-high-http-crawler            | auto-parser-testing-normal-http-crawler            |
| 4 | Article Parser  | auto-parser-testing-high-priority-article-parser | auto-parser-testing-normal-priority-article-parser |
| 5 | Error Handler   | auto-parser-testing-error-article-handler        |                                                    |



| # | Service                   | Deployment                                    |
| - | ------------------------- | --------------------------------------------- |
| 1 | Parsed Details 2 Mentions | ynm-cl-news-parsed-details-2-mentions-service |



## Những việc cần check lại ở Staging

- Loader

ynm-cl-news-crawling-loader-service


- Parser

| # | Service         | High Priority                                    | Normal Priority                                    |
| - | --------------- | ------------------------------------------------ | -------------------------------------------------- |
| 1 | Classifier      | auto-parser-staging-high-classifier              | auto-parser-staging-normal-classifier              |
| 2 | Browser Crawler | auto-parser-staging-high-browser-crawler         | auto-parser-staging-normal-browser-crawler         |
| 3 | Http Crawler    | auto-parser-staging-high-http-crawler            | auto-parser-staging-normal-http-crawler            |
| 4 | Article Parser  | auto-parser-staging-high-priority-article-parser | auto-parser-staging-normal-priority-article-parser |
| 5 | Error Handler   | auto-parser-staging-error-article-handler        |                                                    |



| # | Service                   | Deployment                                    |
| - | ------------------------- | --------------------------------------------- |
| 1 | Parsed Details 2 Mentions | ynm-cl-news-parsed-details-2-mentions-service |






