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

(high|normal)_priority_detail_url_info(_global)?$|ynm.auto_parser(_global)?.(high|normal)_priority_article_urls_crawled_by_(browser|http)_crawler$|ynm.auto_parser(_global)?.error_article_urls$|ynm.auto_parser(_global)?.raw_article_contents$|parsed_detail_output$|(dev|testing|staging|production).cl.mentions_2_solr_mentions$|(dev|testing|staging|production).cl.news.(article_posts|article_crawl_reviews)$


2. K8s


kubectl get pods -n crawler-testing | grep  ynmshgysg-335-testing-crawler-empty-container
kubectl exec -it ynmshgysg-353-testing-crawler-empty-container-54f54b894c-58wnt -n crawler-testing -- sh

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



