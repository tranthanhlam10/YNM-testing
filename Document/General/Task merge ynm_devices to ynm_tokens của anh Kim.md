# Task merge ynm_devices to ynm_tokens của anh Kim



## Vấn đề


Gộp bảng ynm_devices vào ynm_tokens để dễ quản lý và sử dụng chung cho tất cả platforms đồng thời có thể mở rộng thêm cho sau này



## Scope


- Kiểm tra lại table, field, schema của bảng ynm_tokens mới
- Kiểm tra các luồng sử dụng devices trước đây đã sử dụng devices ở ynm_tokens mới hay chưa
- Kiểm tra lại các config của tokens mới
- Check lại chỗ migrate từ devices qua tokens
- Intergrate giữa token và proxy cho các luồng sử dụng token/proxy để xem có ảnh hưởng gì không



## Cách chạy

ynmpdp-5740-merge-crawling-loader-v2-testing-ynm-crawler-empty
ynmpdp-5740-merge-crawling-loader-v2-testing-ynm-crawler-empty


kubectl get pods -n crawler-testing | grep ynmpdp-5740-
kubectl exec -it ynmpdp-5740-merge-crawling-loader-v2-testing-ynm-crawler-ehrjjx -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


cl.tr.keyword_posts_crawl|cl.tt.posts_from_keyword_by_mobile_api|cl.mentions_2_solr_mentions




- Các câu SQL


-- Câu lệnh UPDATE cơ bản
UPDATE tokens
SET status = 'ACTIVE',
    error_message = NULL,
    error_code = NULL
WHERE crawler_type = 'FB_KEYWORD_POST_CRISIS_CRAWLER'


- Kiểm tra case bị đánh block/broken

+ Token bị đánh block
+ Token bị đánh broken



- Token manager

export HTTP_PORT=9020
export GRPC_PORT=9021
 
export DEVICE_GENERATE_CONFIG_ENDPOINT=https://tiktok-api-wrapper.younetmedia.com/device?country=VietNam
export DEVICE_GENERATE_CONFIG_ACCESS_KEY=dGlrdG9rLWFwaS13cmFwcGVyLXRlc3Rpbmc6dDFrdDBrQHAxd3JAcHAzcnQzc3Qxbmc=
 
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
export PROXY_MANAGER_SERVICE_DEVICE_PROXY_TYPE=TT_DEVICE_PROXY

export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_PLATFORM=tiktok
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_IN_USED_TIMEOUT=0
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_IN_PENDING_TIMEOUT=0
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_IN_BLOCKED_TIMEOUT=172800000
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_MAX_NUMBER_OF_REQUEST=5
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_REFRESH_TIMEOUT=5000
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_MAX_NUMBER_TOKEN=1



# Proxy Configs - Hashtag Post Crisis Crawler
export TOKEN_CONFIGS_TR_KEYWORD_POST_CRISIS_CRAWLER_IN_USED_TIMEOUT=0
export TOKEN_CONFIGS_TR_KEYWORD_POST_CRISIS_CRAWLER_IN_PENDING_TIMEOUT=0
export TOKEN_CONFIGS_TR_KEYWORD_POST_CRISIS_CRAWLER_IN_BLOCKED_TIMEOUT=300000
# export PROXY_CONFIGS_TR_KEYWORD_POST_CRISIS_CRAWLER_MAX_REQUEST=20



export TOKEN_CONFIGS_TR_HASHTAG_POST_CRAWLER_IN_USED_TIMEOUT=0
export TOKEN_CONFIGS_TR_HASHTAG_POST_CRAWLER_IN_PENDING_TIMEOUT=0
export TOKEN_CONFIGS_TR_HASHTAG_POST_CRAWLER_IN_BLOCKED_TIMEOUT=30000
# export PROXY_CONFIGS_TR_HASHTAG_POST_CRISIS_CRAWLER_MAX_REQUEST=20

yarn start --scope=@ynm/token-manager-service


- Proxy manager


export HTTP_PORT=9010
export GRPC_PORT=9011

yarn start --scope=@ynm/proxy-manager-service

yarn dev:proxy




- Tiktok keyword post

export HTTP_PORT=9999
 
# builder
export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_IS_BATCH=true
 
#Queue
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tt.posts_from_keyword_by_mobile_api_crawling_sources1
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.9_keyword.crawler1
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tt.posts_from_keyword_by_mobile_api_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tt.posts_from_keyword_by_mobile_api_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.9.6.*.posts_from_keyword_by_mobile_api
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.9.6.*.posts_from_keyword_by_mobile_api.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
# CrawlerType
export CRAWLER_CONFIG_DEVICE_CRAWLER_TYPE=TT_API_CRAWLER_CRISIS_KEYWORD
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=KIMTT_TEST_TEST
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TT_API_CRAWLER_CRISIS_KEYWORD
 
export DEVICE_GENERATE_CONFIG_ENDPOINT=https://tiktok-api-wrapper.younetmedia.com
export DEVICE_GENERATE_CONFIG_ACCESS_KEY=dGlrdG9rLWFwaS13cmFwcGVyLXRlc3Rpbmc6dDFrdDBrQHAxd3JAcHAzcnQzc3Qxbmc=
#Config for run proxy and token in a pod
export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
export PROXY_MANAGER_SERVICE_DEVICE_PROXY_TYPE=TT_DEVICE_PROXY



yarn start --scope=@ynm/cl-tt-keyword-post-crawler-service


- Threads Hashtag/Keyword -> Hiện tại đã crawl thành công


export HTTP_PORT=9099
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
 
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/api/graphql
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
 
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.keyword_posts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.keyword_posts_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.keyword_posts
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.keyword_posts_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.keyword_posts.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true


export CRAWLER_CONFIG_CREATED_BY=ThreadsKeywordPostCrawlingLoader
 
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
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=10
export RESOLVER_MAX_PAGE=5
 
export REDIS_CACHE_HOST=192.168.1.103
export REDIS_CACHE_PORT=6390
export REDIS_CACHE_DB=1
export REDIS_CACHE_USERNAME=data_ynm_crawler
export REDIS_CACHE_PASSWORD=sankmsiIm7V0LXh
 
 
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post
export REDIS_POST_PASSWORD=RHTkP9M79at6
export REDIS_POST_DB=12

#Config for run proxy and token in a pod
export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export REDIS_DB=3
 
yarn testing:tr-keyword



SELECT * FROM `tokens` WHERE crawler_type = "TR_HASHTAG_POST_CRAWLER"



- Facebook Hashtag Keyword -> 


export FB_GRAPH_SERVICE_ENDPOINT=https://graph.facebook.com
    
export LOG_LEVEL=debug
 
    
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.keyword_posts_crisis_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.1_keyword.crawler-crisis    
 
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.keyword_posts_crisis_crawling_requests
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.keyword_posts_crisis
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.keyword_posts_crisis_crawled_sources
   
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.*.*.keyword_posts_crisis.next_page
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
    
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_KEYWORD_POST_CRISIS_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_API_CRAWLER_VN
   
export CRAWLER_CONFIG_IS_HASHTAG=false
export CRAWLER_CONFIG_CREATED_BY=KeywordPostCrisisCrawlingLoader
   
export BUILDER_ENABLE=false
export BUILDER_CONCURRENCY=1
export BUILDER_BATCH_SIZE=1
      
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
      
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_DETECT_LANGUAGE_ENABLE=false
     
export HTTP_PORT=9013
    
   
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390
export REDIS_DB=3
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_MAX_RETRIES_PER_REQUEST=null
      
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post
export REDIS_POST_PASSWORD=RHTkP9M79at6
export REDIS_POST_DB=12


export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
      
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-keyword-post-crawler-service






# config

export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_PLATFORM=tiktok
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_IN_USED_TIMEOUT=0
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_IN_PENDING_TIMEOUT=0
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_IN_BLOCKED_TIMEOUT=172800000
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_MAX_NUMBER_OF_REQUEST=1
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_REFRESH_TIMEOUT=5000 
export TOKEN_CONFIGS_TT_API_CRAWLER_CRISIS_HASHTAG_MAX_NUMBER_TOKEN=10

## Config


{
  "FB_PAGE_COMMENT_HIGH_PRIORITY_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 300000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_PAGE_COMMENT_PRIORITY_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 300000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_PAGE_COMMENT_SOCIALIFT_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 300000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_USER_POST_AUTO_CRISIS_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 300000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_PAGE_POST_AUTO_CRISIS_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 300000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_GROUP_POST_AUTO_CRISIS_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 300000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TR_POST_ENGAGEMENT_BY_TOPIC_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TR_SOURCE_POST_AUTO_CRISIS_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TR_KEYWORD_POST_CRISIS_CRAWLER": {
    "inUsedTimeout": 0,
    "inPendingTimeout": 0,
    "inBlockedTimeout": 300000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TR_KEYWORD_POST_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TR_KEYWORD_POST_CRITICAL_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TR_HASHTAG_POST_CRISIS_CRAWLER": {
    "inUsedTimeout": 0,
    "inPendingTimeout": 0,
    "inBlockedTimeout": 30000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TR_HASHTAG_POST_CRAWLER": {
    "inUsedTimeout": 0,
    "inPendingTimeout": 0,
    "inBlockedTimeout": 30000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TR_HASHTAG_POST_CRITICAL_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TR_FOLLOWERS_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "YT_POST_FROM_CRISIS_KEYWORD_CRAWLER": {
    "inUsedTimeout": 45000,
    "inPendingTimeout": 15000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "YT_POST_FROM_KEYWORD_CRAWLER": {
    "inUsedTimeout": 45000,
    "inPendingTimeout": 15000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "YT_POST_FROM_CRITICAL_HASHTAG_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "YT_POST_FROM_CRISIS_HASHTAG_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "YT_POST_FROM_HASHTAG_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "YT_POST_FROM_CRITICAL_KEYWORD_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "YT_POST_FROM_CRISIS_KEYWORD_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "YT_POST_FROM_KEYWORD_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "NEWS_ARTICLE_URL_FROM_CRITICAL_HASHTAG_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "NEWS_ARTICLE_URL_FROM_CRISIS_HASHTAG_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "NEWS_ARTICLE_URL_FROM_HASHTAG_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "NEWS_ARTICLE_URL_FROM_CRITICAL_KEYWORD_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "NEWS_ARTICLE_URL_FROM_KEYWORD_BY_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 60000,
    "inBlockedTimeout": 43200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_HASHTAG_POST_CRISIS_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_HASHTAG_POST_NON_CRISIS_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_HASHTAG_POST_CRITICAL_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_KEYWORD_POST_CRISIS_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_KEYWORD_POST_NON_CRISIS_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_KEYWORD_POST_CRITICAL_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TT_API_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "platform": "tiktok",
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TT_WEB_API_POST_AUTO_CRISIS_CRAWLER": {
    "inUsedTimeout": 5000,
    "inPendingTimeout": 15000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TT_API_CRAWLER_CRITICAL_HASHTAG": {
    "inUsedTimeout": 0,
    "inPendingTimeout": 0,
    "inBlockedTimeout": 172800000,
    "maxNumberOfRequest": 1,
    "platform": "tiktok",
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TT_API_CRAWLER_CRISIS_HASHTAG": {
    "inUsedTimeout": 0,
    "inPendingTimeout": 0,
    "inBlockedTimeout": 172800000,
    "maxNumberOfRequest": 5,
    "platform": "tiktok",
    "refreshTimeout": 5000,
    "maxNumberToken": 1
  },
  "TT_API_CRAWLER_HASHTAG": {
    "inUsedTimeout": 0,
    "inPendingTimeout": 0,
    "inBlockedTimeout": 172800000,
    "maxNumberOfRequest": 1,
    "platform": "tiktok",
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TT_API_CRAWLER_CRITICAL_KEYWORD": {
    "inUsedTimeout": 10000,
    "inPendingTimeout": 10000,
    "inBlockedTimeout": 172800000,
    "maxNumberOfRequest": 1,
    "platform": "tiktok",
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TT_API_CRAWLER_CRISIS_KEYWORD": {
    "inUsedTimeout": 20000,
    "inPendingTimeout": 30000,
    "inBlockedTimeout": 172800000,
    "maxNumberOfRequest": 1,
    "platform": "tiktok",
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TT_API_CRAWLER_KEYWORD": {
    "inUsedTimeout": 0,
    "inPendingTimeout": 0,
    "inBlockedTimeout": 172800000,
    "maxNumberOfRequest": 1,
    "platform": "tiktok",
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TT_WEB_API_POST_CRAWLER": {
    "inUsedTimeout": 0,
    "inPendingTimeout": 0,
    "inBlockedTimeout": 172800000,
    "maxNumberOfRequest": 1,
    "platform": "tiktok",
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "TT_WEB_API_COMMENT_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_USER_IDENTITY_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_PAGE_IDENTITY_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_GROUP_IDENTITY_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_USER_IDENTITY_COUNTRY_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_PAGE_IDENTITY_COUNTRY_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  },
  "FB_GROUP_IDENTITY_COUNTRY_CRAWLER": {
    "inUsedTimeout": 60000,
    "inPendingTimeout": 5000,
    "inBlockedTimeout": 7200000,
    "maxNumberOfRequest": 1,
    "refreshTimeout": 5000,
    "maxNumberToken": 10
  }
}



## Những việc cần check lại ở testing

Kiểm tra lại deployment: 
ynm-token-manager-service-testing

- Những case cần phải check
+ Kiểm tra lại token manager có hoạt động được hay không
+ Chạy thử các config xem có lỗi gì không
+ Kiểm tra lại các luồng sử dụng devices cũ có hoạt động được không
+ Kiểm tra lại các luồng sử dụng token có hoạt động hay không


1. Tiktok
ynm-cl-tt-keyword-by-mob-api-service-testing

2. Threads
ynm-cl-tr-keyword-


## Những việc cần check lại ở staging

Kiểm tra lại deployment: 
ynm-token-manager-service-staging

- Những case cần phải check
+ Kiểm tra lại các field có được migrate/tạo đúng không -> Hiện tại đã tạo đúng với yêu cầu
+ Kiểm tra lại token manager có hoạt động được hay không -> Hiện tại token manager đã hoạt động bình thường
+ Chạy thử các config xem có lỗi gì không -> Hiện tại config đã đúng với yêu cầu
+ Kiểm tra lại các luồng sử dụng devices cũ có hoạt động được không -> Hiện tại các luồng sử dụng devices cũ đã hoạt động bình thường
+ Kiểm tra lại các luồng sử dụng token có hoạt động hay không -> Đang bị lỗi


1. Tiktok
ynm-cl-tt-keyword-by-mob-api-service-staging

2. Threads
ynm-cl-tr-keyword-


tr-source


{
  "id": "63454508403",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 4
    },
    {
      "lte": 1440,
      "delay": 12
    },
    {
      "lte": 2160,
      "delay": 18
    },
    {
      "lte": 999999999,
      "delay": 32
    }
  ],
  "last_data_date": "2025-05-01T08:03:07.662Z",
  "from_date": "1719993787",
  "to_date": "1751529787",
  "platform": 10,
  "createdBy": "ThreadsSourceReplyCrawlingLoader",
  "link": "threads.com/@maidora.maidora",
  "id_social": "63454508403",
  "username": "maidora.maidora"
}