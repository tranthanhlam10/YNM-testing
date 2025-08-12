# Task Youtube crawl crisis keyword bằng token API 


## Mục tiêu
Hiện tại các keyword crisis đang crawl khá chậm, nên phải cần có luồng khác đem đi crawl các keyword đó để keyword crisis đáp ứng được với yêu cầu của Bussiness


## Giải pháp

Service Loader

    Lấy cursor (offset) từ MySQL.

    Nếu cursor (offset) chưa tồn tại, service sẽ khởi tạo nó trong MySQL.

    Cursor này dùng để lấy keyword với valid position từ MySQL.

Service Loader lấy keyword từ MySQL theo cursor ở bước 1.

Service Loader lọc ra keyword duy nhất (non-existed) bằng cách kiểm tra id của keyword với locked_sources trong Redis.

Service Loader build keyword duy nhất (non-existed) thành crawling source và publish vào queue:

    cl.yt.posts_from_crisis_keyword_crawling_sources

    cl.yt.posts_from_keyword_crawling_sources

Service Loader insert keyword duy nhất vào locked_sources trong Redis (theo id).

Service Builder consume crawling source từ queue:

    cl.yt.posts_from_crisis_keyword_crawling_sources

    cl.yt.posts_from_keyword_crawling_sources

Service Builder build crawling source thành crawling request và publish vào queue:

    cl.yt.posts_from_crisis_keyword_crawling_requests

    cl.yt.posts_from_keyword_crawling_requests

Service Crawler consume crawling request từ queue:

    cl.yt.posts_from_crisis_keyword_crawling_requests

    cl.yt.posts_from_keyword_crawling_requests

Service Crawler lấy token từ Service Token Manager.

Service Crawler publish crawled sources vào queue qua exchange cl.yt.crawled_source:

    cl.yt.posts_from_crisis_keyword_crawled_sources

    cl.yt.posts_from_keyword_crawled_sources

Service Resolver consume crawled source từ queue:

    cl.yt.posts_from_crisis_keyword_crawled_sources

    cl.yt.posts_from_keyword_crawled_sources

Service Resolver build crawling source với next page hoặc updated source (cho lần crawl tiếp theo) và publish vào:

    Queue cl.yt.posts_from_crisis_keyword_crawling_sources_next_pages

    Queue cl.yt.posts_from_keyword_crawling_sources_next_pages

    Hoặc queue cl.keywords_finished_sources

    Qua exchange cl.resolved_source

Service Builder consume crawling source with next page từ queue:

    cl.yt.posts_from_crisis_keyword_crawling_sources_next_pages

    cl.yt.posts_from_keyword_crawling_sources_next_pages

Service Source Updater consume updated source từ queue:

    cl.keywords_finished_sources

Service Source Updater update updated source vào MySQL.

Service Source Updater release updated source (theo id) từ locked_sources trong Redis.

Service Resolver build:

    Mention

    Post

    Identity

    Article URL

Sau đó publish chúng vào queues qua exchange cl.resolved_data:

    cl.mentions_2_solr_mentions

    cl.posts_2_solr_yt_posts

    cl.identities_2_solr_identities

    cl.identities_2_redis_identities

Service Data Pusher consume mentions, posts, identities từ queue:

    cl.mentions_2_solr_mentions

    cl.posts_2_solr_yt_posts

    cl.identities_2_solr_identities

    cl.identities_2_redis_identities

Service Data Pusher insert mention, post, identity, article URL vào compatible database.



## Cách chạy


youtube-ynmpdp-5133-testing-ynm-crawler-empty
kubectl get pods -n crawler-testing | grep youtube-ynmpdp-5133-testing-ynm-crawler-empty
kubectl exec -it youtube-ynmpdp-5133-testing-ynm-crawler-empty-7b756d979f-f2q5v -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local


// Các key trên cursor của crawling loader

YOUTUBE_POST_FROM_CRISIS_KEYWORD_CRAWLING_LOADER
YOUTUBE_POST_FROM_KEYWORD_CRAWLING_LOADER

// Check cases token nếu bị hết quota thì phải block 1 ngày


// 
updated_at: ["2025-08-11T7:25:42Z" TO *]




## Câu lệnh script để chạy các services

### Loader





export NODE_ENV=testing
export HTTP_PORT=9999
export GRPC_PORT=9011
  
export YOUTUBE_POST_FROM_CRISIS_KEYWORD_CRAWLING_LOADER_ENABLE=true
export YOUTUBE_POST_FROM_CRISIS_KEYWORD_CRAWLING_LOADER_CRAWL_INTERVAL='{"brandTracking":{"amount":4,"unit":"hour"},"campaignTracking":{"amount":2,"unit":"hour"},"crisisTracking":{"amount":30,"unit":"minute"}}'
export YOUTUBE_POST_FROM_CRISIS_KEYWORD_CRAWLING_LOADER_CYCLE="*/1 * * * *"
export YOUTUBE_POST_FROM_CRISIS_KEYWORD_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=10
export YOUTUBE_POST_FROM_CRISIS_KEYWORD_CRAWLING_LOADER_DEFAULT_DATA_DURATION=7days
export YOUTUBE_POST_FROM_CRISIS_KEYWORD_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=100
export YOUTUBE_POST_FROM_CRISIS_KEYWORD_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export YOUTUBE_POST_FROM_CRISIS_KEYWORD_CRAWLING_LOADER_OUTPUT_QUEUE=cl.yt.posts_from_crisis_keyword_crawling_sources
  
export YOUTUBE_POST_FROM_KEYWORD_CRAWLING_LOADER_ENABLE=true
export YOUTUBE_POST_FROM_KEYWORD_CRAWLING_LOADER_CRAWL_INTERVAL='{"brandTracking":{"amount":4,"unit":"hour"},"campaignTracking":{"amount":2,"unit":"hour"},"crisisTracking":{"amount":30,"unit":"minute"}}'
export YOUTUBE_POST_FROM_KEYWORD_CRAWLING_LOADER_CYCLE="*/1 * * * *"
export YOUTUBE_POST_FROM_KEYWORD_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=10
export YOUTUBE_POST_FROM_KEYWORD_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export YOUTUBE_POST_FROM_KEYWORD_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=100
export YOUTUBE_POST_FROM_KEYWORD_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export YOUTUBE_POST_FROM_KEYWORD_CRAWLING_LOADER_OUTPUT_QUEUE=cl.yt.posts_from_keyword_crawling_sources
  
export LOG_LEVEL=debug
  
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
  
export RABBIT_HEARTBEAT=10
  
export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null
  
yarn start --scope=@ynm/cl-yt-crawling-loader-service





### Crawler (Non-crisis keyword):

export NODE_ENV=testing
  
export HTTP_PORT=9977
export GRPC_PORT=9011
 
export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
 
export YOUTUBE_API_SERVICE_MAXRETRIES=10
export YOUTUBE_API_SERVICE_TIMEOUT=45000
    
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.yt.posts_from_keyword_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.yt.posts_from_keyword_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.yt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.yt.posts_from_keyword_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.7.*.*.posts_from_keyword
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.7.*.*.posts_from_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=1_YT_TOKEN_CUA_LAMTT
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=""
export CRAWLER_CONFIG_PAGING_ENABLE=true
    
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true
    
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
   
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=5
export RESOLVER_ENABLE=true
export LOG_LEVEL=debug
 
export RABBIT_HEARTBEAT=10
 
export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null
    
yarn start --scope=@ynm/cl-yt-post-from-keyword-crawler-service


### Crawler (Crisis keyword):

export NODE_ENV=testing
  
export HTTP_PORT=9998
export GRPC_PORT=9011
 
export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
 
export YOUTUBE_API_SERVICE_MAXRETRIES=10
export YOUTUBE_API_SERVICE_TIMEOUT=45000
    
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.yt.posts_from_crisis_keyword_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.yt.posts_from_crisis_keyword_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.yt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.yt.posts_from_crisis_keyword_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.7.*.*.posts_from_crisis_keyword
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.7.*.*.posts_from_crisis_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=YT_TOKEN_CUA_LAMTT
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=""
export CRAWLER_CONFIG_PAGING_ENABLE=true
    
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true
    
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
   
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=5
export RESOLVER_ENABLE=true
 
export LOG_LEVEL=debug
 
export RABBIT_HEARTBEAT=10
 
export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null
    
yarn start --scope=@ynm/cl-yt-post-from-keyword-crawler-service


### Token manager

export HTTP_PORT=9020
export GRPC_PORT=9021
  
export LOG_LEVEL=debug
  
export TOKEN_CONFIGS_YT_TOKEN_CUA_LAMTT_IN_USED_TIMEOUT=15000
export TOKEN_CONFIGS_YT_TOKEN_CUA_LAMTT_IN_PENDING_TIMEOUT=5000
export TOKEN_CONFIGS_YT_TOKEN_CUA_LAMTT_IN_BLOCKED_TIMEOUT=43200000
 
export MYSQL_CONNECTION_PORT=6033 
export MYSQL_CONNECTION_DATABASE=ynm_tokens
 
export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
  
yarn start --scope=@ynm/token-manager-service



## Những queue cần lưu ý cho quá trình  check



// Non crisis
cl.yt.posts_from_keyword_crawling_sources

cl.yt.posts_from_keyword_crawling_requests

cl.yt.posts_from_keyword_crawled_sources

cl.yt.posts_from_keyword_crawling_sources_next_pages

cl.keywords_finished_sources

cl.mentions_2_solr_mentions

cl.posts_2_solr_yt_posts

cl.identities_2_solr_identities

cl.identities_2_redis_identities


// Crisis
cl.yt.posts_from_crisis_keyword_crawling_sources

cl.yt.posts_from_crisis_keyword_crawling_requests

cl.yt.posts_from_crisis_keyword_crawled_sources

cl.yt.posts_from_crisis_keyword_crawling_sources_next_pages

cl.keywords_finished_sources

cl.mentions_2_solr_mentions

cl.posts_2_solr_yt_posts

cl.identities_2_solr_identities

cl.identities_2_redis_identities



// Câu Regex để lấy các queue

cl.(mentions_2_solr_mentions|cl.keywords_finished_sources
|posts_2_solr_yt_posts|identities_finished_sources|identities_2_redis_identities|identities_2_solr_identities|yt.posts_from_keyword_crawling_sources|yt.posts_from_keyword_crawling_requests|yt.posts_from_keyword_crawled_sources|yt.posts_from_keyword_crawling_sources_next_pages|yt.posts_from_crisis_keyword_crawling_sources|yt.posts_from_crisis_keyword_crawling_requests|yt.posts_from_crisis_keyword_crawled_sources|yt.posts_from_crisis_keyword_crawling_sources_next_pages)


Nhờ Huy config lại chỗ pusher và updater thành những queue riêng LamTT để chạy


// Cau query cua token
crawler_type IN ( 'YT_TOKEN_CUA_LAMTT', '1_YT_TOKEN_CUA_LAMTT'  ) 


## Message mẫu

1. Message loader

// Crisis
{
  "id": 1,
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-07-03T08:43:34.700Z",
  "from_date": "1751532214",
  "to_date": "1752137014",
  "platform": 7,
  "createdBy": "YoutubePostFromCrisisKeywordCrawlingLoader",
  "keyword_info": {
    "id": 1,
    "type": "CRISIS_TRACKING",
    "keyword": "BMW",
    "action": "POST",
    "expiry_date": "2025-12-31T16:59:59.000Z",
    "last_crawl_cursor": null,
    "last_crawl_date": null
  }

// Non Crisis

{
  "id": 1,
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-07-03T08:43:34.700Z",
  "from_date": "1751532214",
  "to_date": "1752137014",
  "platform": 7,
  "createdBy": "YoutubePostFromKeywordCrawlingLoader",
  "keyword_info": {
    "id": 1,
    "type": "CRISIS_TRACKING",
    "keyword": "BMW",
    "action": "POST",
    "expiry_date": "2025-12-31T16:59:59.000Z",
    "last_crawl_cursor": null,
    "last_crawl_date": null
  }




{
  "id": 577246,
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-08-11T09:01:27.000Z",
  "from_date": "1754299200",
  "to_date": "1754904000",
  "platform": 7,
  "createdBy": "YoutubePostFromCrisisKeywordCrawlingLoader",
  "keyword_info": {
    "id": 577246,
    "type": "CRISIS_TRACKING",
    "keyword": "Mỹ Mỹ Em Xinh",
    "action": "POST",
    "expiry_date": "2025-08-30T16:59:59.000Z",
    "last_crawl_cursor": null,
    "last_crawl_date": null
  }
}