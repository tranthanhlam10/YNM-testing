# Hotfix identity cho Threads



TR_PROXY_CUA_LAMTT
TR_KEYWORD_POST_NO_COOKIE_CRAWLER
TR_SOURCE_POST_NO_COOKIE_CRAWLER
## Luồng Hastag Keyword



// Keyword
export HTTP_PORT=9010
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
 
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/api/graphql
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
 
export TOKEN_MANAGER_SERVICE_PORT=9011
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.keyword_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.keyword_posts_no_cookie_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.keyword_posts_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.keyword_posts_no_cookie_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.keyword_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_KEYWORD_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_KEYWORD_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_KEYWORD_POST_NO_COOKIE_CRAWLER
 
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=false
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
 
export REDIS_CACHE_HOST=192.168.0.170
export REDIS_CACHE_PORT=6390
export REDIS_CACHE_DB=1
export REDIS_CACHE_USERNAME=data_ynm_crawler
export REDIS_CACHE_PASSWORD=cQXf21j9LU5fm5V205MD
 
 
export REDIS_POST_USERNAME=data_ynm_crawler_use_cache_post
export REDIS_POST_PASSWORD=FAr7xW52hqP6
export REDIS_POST_HOST=192.168.0.170
export REDIS_POST_PORT=6390
export REDIS_POST_DATABASE=12
 
NODE_ENV=staging yarn start --scope=@ynm/cl-tr-keyword-post-crawler-service



// Hashtag
export HTTP_PORT=9010
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
 
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/api/graphql
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
 
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.hashtag_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.hashtag_posts_no_cookie_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.hashtag_posts_no_cookie_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_HASHTAG_POST_NO_COOKIE_CRAWLER
 
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
 
NODE_ENV=staging yarn start --scope=@ynm/cl-tr-hashtag-post-crawler-service

## Luồng Source

// Source Post


export HTTP_PORT=9997
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_posts_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_PROXY_CUA_LAMTT
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3

export REDIS_CACHE_DB=1
export REDIS_CACHE_USERNAME=data_ynm_crawler
export REDIS_CACHE_PASSWORD=sankmsiIm7V0LXh
 
export REDIS_DB=3
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
yarn start --scope=@ynm/cl-tr-source-post-crawler-service

// Source Reply
export HTTP_PORT=9999
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_replies_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_PROXY_CUA_LAMTT
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
 
yarn start --scope=@ynm/cl-tr-source-reply-crawler-service

// Repost

export HTTP_PORT=9995
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reposts_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_PROXY_CUA_LAMTT
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
 
yarn start --scope=@ynm/cl-tr-repost-crawler-service


# Cách chạy

ynmpdp-5370-staging-ynm-crawler-empty
kubectl get pods -n crawler-staging | grep ynmpdp-5370-staging-ynm-crawler-empty
kubectl exec -it ynmpdp-5370-staging-ynm-crawler-empty-5db4644688-fk9q8 -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh



// Câu SQL update crawler_type

# Mục tiêu của task
Giảm được việc push data trùng lặp trên Solr           
Giảm được việc push data trùng vào luồng reply crawl post
Đồng bộ lại tất cả Id User của Platform Threads trong luồng Hashtag/Keyword no cookie

# Giải pháp
Thêm phần cache và kiểm tra data sau khi crawl được post/reply từ hashtag/keyword trước khi đẩy qua queue push vào Solr
Thêm việc block source khi push vào luồng reply crawl post tương tự phần crawling loader
Thêm api lấy id Threads từ username



-> Thật tế scope test của task này là tránh Proxy bị BLOCKED quá nhiều, và nếu có mapping_id của User, nếu bị lỗi thì đi tiếp chứ không quay lại từ đầu
## Cách test

- Hiện tại chỉ cần lấy message dừng ở crawled source -> Sau đó chỉnh username bị lỗi
- Cuối cùng là chạy bạt resolver lên chạy tiếp -> Phải hoạt động đúng expected result của Đồng


Tối ưu lại mapping id bằng cách khi gọi lỗi và chỉ tiếp tục thực hiện crawl từ bước lỗi của lần crawl trước.
Ví dụ threads keyword: 
+ Lần đầu crawl: crawl được 10 post/replies -> bắt đầu mapping theo từng user -> Đến user thứ 5 -> bị lỗi -> retry max -> đẩy về crawled source -> crawl lại
+ Lần crawl lại: đã có 10 post/replies -> ko crawl bước này -> đã mapping đến user thứ 5 -> tiếp tục tại bước này
Đánh last_status = 4 cho các user có post nhưng xem trang cá nhân trên web không được

## Những message mẫu

{
  "id": 3513934,
  "retries": 0,
  "type": "CRISIS_TRACKING",
  "delay_time_rules": [],
  "last_data_date": "2024-09-05T07:40:00.734Z",
  "from_date": "1725522000",
  "to_date": "1757058000",
  "platform": 10,
  "createdBy": "ThreadsHashtagPostNoCookieCrawlingLoader",
  "startedCrawling": "2025-09-05T07:40:00.734Z",
  "hashtag": "duongdomic",
  "hashtagId": "18441738994043575"
}



{
  "id": 3513935,
  "retries": 0,
  "type": "CRISIS_TRACKING",
  "delay_time_rules": [],
  "last_data_date": "2024-09-05T07:41:05.531Z",
  "from_date": "1725522065",
  "to_date": "1757058065",
  "platform": 10,
  "createdBy": "ThreadsHashtagPostNoCookieCrawlingLoader",
  "startedCrawling": "2025-09-05T07:41:05.531Z",
  "hashtag": "Taylor Swift",
  "hashtagId": "18399060100039192"
}