# Task improve của Huy

## Issue

+ Hiện tại, luồng đang gọi đến service graph-tiktok để crawl hashtag/keyword, nhưng service graph-tiktok đang gặp hiện tượng quá tải do có nhiều cùng gọi đến.
+ Ngoài ra còn gắng thêm luồng Crisis Video vào cho luồng tiktok-gg searhc


## Hướng xử lý


+ Cách giải quyết là điều chỉnh lại thành gọi trực tiếp đến Tiktok API.


## Cách chạy

1. K8s


ynmpdp-5898-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-5898-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5898-testing-ynm-crawler-empty-66bcb868f6-vhpl8 -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local



2. Queue


dev|testing|staging|production).cl.(mentions_2_solr_mentions|posts_2_solr_tt_posts|identities_2_solr_identities|identities_2_redis_identities)$|(dev|testing|staging|production).cl.tt.(article_urls|posts)_from(_crisis|_critical)?_(hashtag|keyword)(_url)?_(crawled|crawling)


3. Loader

Message mà bên app đẩy qua


4. Redis

Kiểm tra lại Redis (Cache 1 hoặc 2) khi chạy qua luồng download nếu is_analyze = 1


5. Proxy token

TT_ARTICLE_URL_FROM_CRISIS_KEYWORD_CRAWLER
TT_POST_FROM_CRISIS_KEYWORD_URL_CRAWLER


TT_IDENTITY_COUNTRY_CRAWLER
TT_WEB_API_POST_CRAWLER


6. Câu lệnh chạy 


- Crawl keyword từ google


export HTTP_PORT=7774
export GRPC_PORT=9011
   
export GOT_SCRAPING_SERVICE_TIMEOUT=45000
export GOT_SCRAPING_SERVICE_MAX_RETRIES=3
   
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tt.article_urls_from_crisis_keyword_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.9__keyword.crawler-crisis
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tt.article_urls_from_crisis_keyword_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tt.article_urls_from_crisis_keyword_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.9.*.*.article_urls_from_crisis_keyword
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.9.*.*.article_urls_from_crisis_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data

export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TT_POST_TRANSCRIPT_CRAWLER_LamTT
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=NEWS_ARTICLE_POST_GOOGLE_MAPS_REVIEWS_CRAWLER

export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=""
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=TiktokArticleUrlFromCrisisKeywordCrawlingLoader
export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=3days
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=5
export CRAWLER_CONFIG_PRIORITY_LIMIT=3
export CRAWLER_CONFIG_VALID_PLATFORMS='9'

export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true

export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true

export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_ENABLE=true

export LOG_LEVEL=debug

export RABBIT_HEARTBEAT=10

export GOOGLE_SEARCH_CONFIG_LOCATION=''
export GOOGLE_SEARCH_CONFIG_SITES='tiktok.com'
export GOOGLE_SEARCH_CONFIG_TYPE_OF_SEARCH=7

yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service



- Crawl detail


export HTTP_PORT=8885
export GRPC_PORT=9011
   
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tt.posts_from_crisis_keyword_url_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.9.*.*.posts_from_crisis_keyword_url
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tt.posts_from_crisis_keyword_url_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tt.posts_from_crisis_keyword_url_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.9.*.*.posts_from_crisis_keyword_url
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.9.*.*.posts_from_crisis_keyword_url.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE="TT_API_CRAWLER_CRISIS_KEYWORD"
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE="TT_API_CRAWLER_CRISIS_KEYWORD"
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true
       
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
      
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_ENABLE=true
    
export LOG_LEVEL=debug
   
export RABBIT_HEARTBEAT=10
 
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_DB=3
       
yarn start --scope=@ynm/cl-tt-post-from-url-crawler-service



- Luồng detect của tiktok

ynm-cl-tt-identity-country-service



- Luồng download


export HTTP_PORT=7473
export NODE_ENV=testing
export CRAWLER_ENABLE=false
export BUILDER_ENABLE=false
export RESOLVER_ENABLE=false
export MEDIA_DOWNLOAD_ENABLE=true
export MEDIA_DOWNLOAD_CONCURRENCY=1
export MEDIA_DOWNLOAD_MAX_RETRIES=3
export MEDIA_DOWNLOAD_CRAWLED_SOURCE_ROUTING_KEY=cl.tt.crisis_media_download
export MEDIA_DOWNLOAD_CRAWLED_SOURCE_EXCHANGE=cl.crisis_media_download
export MEDIA_DOWNLOAD_CRAWLED_SOURCE_QUEUE=cl.tt.crisis_media_download
export MEDIA_DOWNLOAD_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export MEDIA_DOWNLOAD_RND_EXCHANGE=rnd.socialheat.llm
export MEDIA_DOWNLOAD_RND_RTK=image_extraction
export MEDIA_DOWNLOAD_RESOLVER_ENABLE=true
export MEDIA_DOWNLOAD_RESOLVER_CONCURRENCY=1
export MEDIA_DOWNLOAD_RESOLVER_MAX_RETRIES=3
export MEDIA_DOWNLOAD_RESOLVER_TRANSCRIPT_DOWNLOAD_RETRY=1
export MEDIA_DOWNLOAD_RESOLVER_BUCKET_NAME=crisis-images
export MEDIA_DOWNLOAD_RESOLVER_PROXY_CRAWLER_TYPE=TT_API_CRAWLER_KEYWORD
export MEDIA_DOWNLOAD_RESOLVER_IS_CONGESTION=false



yarn start --scope @ynm/cl-tt-keyword-post-crawler-service



## Kiểm tra phần crisis_image video

- Cache lại chỗ 1 và 2 (Phân biệt giữa process có is_analyze và không có is_analyze như nào) -> Hiện tại đang bị sai logic cache

- Nếu is_analyze bằng 1, thì khi đẩy qua detect có còn gắng is_analyze = 1 -> DONE

- Nếu is_analyze bằng 0, thì khi đẩy qua detect có gắng is_analyze = 0 -> DONE

- Luồng crawl detail có cơ chế xả hay không

- Nếu như bản thân id_source có country = VN -> Đẩy qua luồng download

- Luồng detect nếu kết quả là VN thì như nào -> Bug

- Luồng detect nếu kết quả khác VN thì như nào -> Bug

- Verify lại message đẩy qua luồng download

- Chạy nhanh lại luồng download video

## RabbitMQ

testing.cl.tt.crisis_media_download|.cl.tt.identity_countries_|rnd.socialheat.llm.image_extraction

