# Task merge source updater

## Cách chạy

// Câu regex trên RabbitMQ
cl.fb.engagements_by_topic_finished_sources|cl.fb.identities_finished_sources|cl.fb.fb_posts_finished_sources|article_titles|cl.news.category_links_finished_sources|cl.tr.potential_identities_finished_sources|cl.tr.identities_finished_sources|cl.tr.posts_finished_sources|cl.tr.posts_by_topic_finished_sources|cl.tr.replies_finished_sources|cl.summary_mentions_finished_sources|cl.tt.identities_finished_sources|cl.tt.posts_info_finished_sources


// Câu lệnh ở k8s
ynmpdp-5066-2-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-5066-2-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5066-2-testing-ynm-crawler-empty-7745d7b948-p2f5r -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local

// Câu lệnh chạy của Khiêm 



export HTTP_PORT=9876
export LOG_LEVEL=debug
 
# * Facebook *
export FB_POST_ENABLE=false
export FB_POST_MAX_WAITING_TIME=60
export FB_POST_PREFETCH_MESSAGES=1000
export FB_POST_BATCH_SIZE=100
 
export FB_IDENTITIES_ENABLE=false
export FB_IDENTITIES_MAX_WAITING_TIME=60
export FB_IDENTITIES_PREFETCH_MESSAGES=1000
export FB_IDENTITIES_BATCH_SIZE=100
 
export ENGAGEMENTS_BY_TOPIC_ENABLE=false
export ENGAGEMENTS_BY_TOPIC_MAX_WAITING_TIME=60
export ENGAGEMENTS_BY_TOPIC_PREFETCH_MESSAGES=1000
export ENGAGEMENTS_BY_TOPIC_BATCH_SIZE=100
 
# * News *
export ARTICLE_TITLE_UPDATER_ENABLE=false
export ARTICLE_TITLE_UPDATER_MAX_WAITING_TIME=60
export ARTICLE_TITLE_UPDATER_PREFETCH_MESSAGES=1000
export ARTICLE_TITLE_UPDATER_BATCH_SIZE=100
 
export CATEGORY_LINK_UPDATER_ENABLE=false
export CATEGORY_LINK_UPDATER_MAX_WAITING_TIME=60
export CATEGORY_LINK_UPDATER_PREFETCH_MESSAGES=1000
export CATEGORY_LINK_UPDATER_BATCH_SIZE=100
 
# * Threads *
# export TR_KEYWORD_ENABLE=false
# export TR_KEYWORD_MAX_WAITING_TIME=60
# export TR_KEYWORD_PREFETCH_MESSAGES=1000
# export TR_KEYWORD_BATCH_SIZE=100
 
# export TR_HASHTAG_ENABLE=false
# export TR_HASHTAG_MAX_WAITING_TIME=60
# export TR_HASHTAG_PREFETCH_MESSAGES=1000
# export TR_HASHTAG_BATCH_SIZE=100
 
export POTENTIAL_IDENTITIES_ENABLE=false
export POTENTIAL_IDENTITIES_MAX_WAITING_TIME=60
export POTENTIAL_IDENTITIES_PREFETCH_MESSAGES=1000
export POTENTIAL_IDENTITIES_BATCH_SIZE=100
 
export TR_IDENTITIES_ENABLE=false
export TR_IDENTITIES_MAX_WAITING_TIME=3
export TR_IDENTITIES_PREFETCH_MESSAGES=1000
export TR_IDENTITIES_BATCH_SIZE=100
 
export TR_POSTS_ENABLE=false
export TR_POSTS_MAX_WAITING_TIME=60
export TR_POSTS_PREFETCH_MESSAGES=1000
export TR_POSTS_BATCH_SIZE=100
 
export TR_POSTS_BY_TOPIC_ENABLE=false
export TR_POSTS_BY_TOPIC_MAX_WAITING_TIME=60
export TR_POSTS_BY_TOPIC_PREFETCH_MESSAGES=1000
export TR_POSTS_BY_TOPIC_BATCH_SIZE=100
 
export TR_REPLIES_ENABLE=false
export TR_REPLIES_MAX_WAITING_TIME=60
export TR_REPLIES_PREFETCH_MESSAGES=1000
export TR_REPLIES_BATCH_SIZE=100
 
# * TikTok *
export TT_IDENTITIES_ENABLE=true
export TT_IDENTITIES_MAX_WAITING_TIME=60
export TT_IDENTITIES_PREFETCH_MESSAGES=1000
export TT_IDENTITIES_BATCH_SIZE=100
 
export TT_POSTS_ENABLE=true
export TT_POSTS_MAX_WAITING_TIME=60
export TT_POSTS_PREFETCH_MESSAGES=1000
export TT_POSTS_BATCH_SIZE=100
 
# export TRANSCRIPT_ENABLE=true
# export TRANSCRIPT_MAX_WAITING_TIME=60
# export TRANSCRIPT_PREFETCH_MESSAGES=1000
# export TRANSCRIPT_BATCH_SIZE=100
 
yarn testing --scope=@ynm/cl-source-updater-service


-> Hiện tại câu lệnh này đã chạy được thành công


// Câu lệnh chạy của Đồng


export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
    
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
    
export RABBIT_HEARTBEAT=10
   
export IDENTITIES_INPUT_EXCHANGE=cl.resolved_source
export IDENTITIES_ROUTING_KEY=cl.*.identities
export IDENTITIES_INPUT_QUEUE=cl.identities_finished_sources
export IDENTITIES_BATCH_SIZE=1
export IDENTITIES_PREFETCH_MESSAGES=1000
export IDENTITIES_MAX_WAITING_TIME=60
export IDENTITIES_ENABLE=true
   
 
export FB_POST_INPUT_EXCHANGE=cl.resolved_source
export FB_POST_ROUTING_KEY=cl.1.posts
export FB_POST_INPUT_QUEUE=cl.fb.fb_posts_finished_sources
export FB_POST_MAX_WAITING_TIME=60
export FB_POST_BATCH_SIZE=1
export FB_POST_PREFETCH_MESSAGES=1000
export FB_POST_ENABLE=true
 
 
export TR_POSTS_INPUT_EXCHANGE=cl.resolved_source
export TR_POSTS_ROUTING_KEY=cl.10.posts
export TR_POSTS_INPUT_QUEUE=cl.tr.posts_finished_sources
export TR_POSTS_MAX_WAITING_TIME=60
export TR_POSTS_BATCH_SIZE=1
export TR_POSTS_PREFETCH_MESSAGES=1000
export TR_POSTS_ENABLE=true
 
 
export TR_POSTS_BY_TOPIC_INPUT_EXCHANGE=cl.resolved_source
export TR_POSTS_BY_TOPIC_ROUTING_KEY=cl.10.posts_by_topic
export TR_POSTS_BY_TOPIC_INPUT_QUEUE=cl.tr.posts_by_topic_finished_sources
export TR_POSTS_BY_TOPIC_MAX_WAITING_TIME=60
export TR_POSTS_BY_TOPIC_BATCH_SIZE=1
export TR_POSTS_BY_TOPIC_PREFETCH_MESSAGES=1000
export TR_POSTS_BY_TOPIC_ENABLE=true
 
 
export TR_KEYWORD_INPUT_EXCHANGE=cl.resolved_source
export TR_KEYWORD_ROUTING_KEY=cl.10.keyword_posts
export TR_KEYWORD_INPUT_QUEUE=cl.tr.keyword_posts_finished_sources
export TR_KEYWORD_MAX_WAITING_TIME=60
export TR_KEYWORD_BATCH_SIZE=1
export TR_KEYWORD_PREFETCH_MESSAGES=1000
export TR_KEYWORD_ENABLE=true
 
 
export TR_KEYWORD_INPUT_EXCHANGE=cl.resolved_source
export TR_KEYWORD_ROUTING_KEY=cl.10.replies
export TR_KEYWORD_INPUT_QUEUE=cl.tr.keyword_posts_finished_sources
export TR_KEYWORD_MAX_WAITING_TIME=60
export TR_KEYWORD_BATCH_SIZE=1
export TR_KEYWORD_PREFETCH_MESSAGES=1000
export TR_KEYWORD_ENABLE=true
 
 
export TT_POSTS_INPUT_EXCHANGE=cl.resolved_source
export TT_POSTS_ROUTING_KEY=cl.9.posts
export TT_POSTS_INPUT_QUEUE=cl.tt.posts_info_finished_sources
export TT_POSTS_MAX_WAITING_TIME=60
export TT_POSTS_BATCH_SIZE=1
export TT_POSTS_PREFETCH_MESSAGES=1000
export TT_POSTS_ENABLE=true
 
 
export TT_KEYWORD_INPUT_EXCHANGE=cl.resolved_source
export TT_KEYWORD_ROUTING_KEY=cl.2.keyword
export TT_KEYWORD_INPUT_QUEUE=cl.tt.keyword_posts_finished_sources
export TT_KEYWORD_MAX_WAITING_TIME=60
export TT_KEYWORD_BATCH_SIZE=1
export TT_KEYWORD_PREFETCH_MESSAGES=1000
export TT_KEYWORD_ENABLE=true
 
 
export TT_TRENDING_INPUT_EXCHANGE=cl.resolved_source
export TT_TRENDING_ROUTING_KEY=cl.9.posts_trending
export TT_TRENDING_INPUT_QUEUE=cl.tt.ads_posts_finished_sources
export TT_TRENDING_MAX_WAITING_TIME=60
export TT_TRENDING_BATCH_SIZE=1
export TT_TRENDING_PREFETCH_MESSAGES=1000
export TT_TRENDING_ENABLE=true
 
   
export REDIS_MAX_RETRIES_PER_REQUEST=null
   
NODE_ENV=staging yarn start --scope=@ynm/cl-source-updater-service



## Message ở từng queue


cl.fb.engagements_by_topic_finished_sources
cl.fb.identities_finished_sources
cl.fb.fb_posts_finished_sources

article_titles (no prefix)
cl.news.category_links_finished_sources
cl.tr.potential_identities_finished_sources
cl.tr.identities_finished_sources
cl.tr.posts_finished_sources
cl.tr.posts_by_topic_finished_sources
cl.tr.replies_finished_sources
cl.summary_mentions_finished_sources
cl.tt.identities_finished_sources
cl.tt.posts_info_finished_sources

cl.tt.ads_posts_finished_sources




### Câu lệnh chạy của các luồng Threads

1. Luồng crawl potential


Wiki:
https://wiki.younetco.com/pages/viewpage.action?pageId=221282665




// Loader

export NODE_ENV=testing
 
export HTTP_PORT=9999
export GRPC_PORT=9011
    
export LOG_LEVEL=debug
export RABBIT_HEARTBEAT=10
    
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_OUTPUT_QUEUE=cl.tr.potential_identities_crawling_sources
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=10000
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_CYCLE="*/5 * * * *"
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=1000
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_CRAWL_INTERVAL="30days"
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_ENABLE=true
    
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
    
export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
export MONGO_NEWS_USERNAME="data_huynvq"
export MONGO_NEWS_PASSWORD="S45Hdasdffo"
export MONGO_NEWS_DATABASE="socialheat_testing"
export MONGO_NEWS_REPLICA_SET="rs0"
    
yarn start --scope=@ynm/cl-tr-crawling-loader-service

// Crawler

export NODE_ENV=testing
 
export HTTP_PORT=9998
export GRPC_PORT=9011
   
export LOG_LEVEL=debug
export RABBIT_HEARTBEAT=10
  
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAXRETRIES=5
   
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.potential_identities_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.potential_identities_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.potential_identities_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.potential_identities
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.potential_identities
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=""
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_POTENTIAL_IDENTITY_CRAWLER
   
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
   
yarn start --scope=@ynm/cl-tr-identity-crawler-service

// Updater


export NODE_ENV=testing
 
export HTTP_PORT=9997
export GRPC_PORT=9011
   
export LOG_LEVEL=debug
export RABBIT_HEARTBEAT=10
   
export TR_KEYWORD_ENABLE=false
export TR_HASHTAG_ENABLE=false
export IDENTITIES_ENABLE=false
export TR_POSTS_ENABLE=false
export TR_REPLIES_ENABLE=false
export TR_POSTS_BY_TOPIC_ENABLE=false
 
export POTENTIAL_IDENTITIES_INPUT_EXCHANGE=cl.resolved_source
export POTENTIAL_IDENTITIES_ROUTING_KEY=cl.*.potential_identities
export POTENTIAL_IDENTITIES_INPUT_QUEUE=cl.tr.potential_identities_finished_sources
export POTENTIAL_IDENTITIES_BATCH_SIZE=100
export POTENTIAL_IDENTITIES_PREFETCH_MESSAGES=1000
export POTENTIAL_IDENTITIES_ENABLE=true
   
export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
export IDENTITY_CACHE_DB=3
export IDENTITY_CACHE_MAX_RETRIES_PER_REQUEST=null
 
export MONGO_NEWS_USERNAME="data_huynvq"
export MONGO_NEWS_PASSWORD="S45Hdasdffo"
export MONGO_NEWS_DATABASE="socialheat_testing"
export MONGO_NEWS_REPLICA_SET="rs0"
   
yarn start --scope=@ynm/cl-tr-source-updater-service






2. Luồng comment - update lại posts

export HTTP_PORT=6010
export GRPC_PORT=6011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
 
export MYSQL_DEFAULT_CONNECTION_PORT=3306
export MYSQL_DEFAULT_CONNECTION_DATABASE=monitoring_master
export MYSQL_DEFAULT_NEWS_PORT=3306
export MYSQL_DEFAULT_NEWS_DATABASE=monitoring_master

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
export TR_GRAPH_SERVICE_DELAY_TIMEOUT=3000

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.posts_comment_crawling_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.comments
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.posts_comment_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.posts_comment_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.comments.next_page

export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_REPLY_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_TYPE=posts
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390
export REDIS_DB=3

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

yarn testing:tr-reply-crawler





3. Luồng sub comment - update lại replies

export HTTP_PORT=6010
export GRPC_PORT=6011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658

export MYSQL_DEFAULT_CONNECTION_PORT=3306
export MYSQL_DEFAULT_CONNECTION_DATABASE=monitoring_master
export MYSQL_DEFAULT_NEWS_PORT=3306
export MYSQL_DEFAULT_NEWS_DATABASE=monitoring_master

export TOKEN_MANAGER_SERVICE_PORT=9011
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
export TR_GRAPH_SERVICE_DELAY_TIMEOUT=3000

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.posts_sub_comment_crawling_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.sub_comments
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.posts_sub_comment_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.posts_sub_comment_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.sub_comments.next_page
 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_REPLY_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_TYPE=replies
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390 
export REDIS_DB=3
 
export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=1000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1

export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1

yarn testing:tr-reply-crawler

4. Luồng threads post by topic

Wiki: 
https://wiki.younetco.com/display/FB/%5BThreads%5D+Get+Engagement+Of+Posts+By+Topic


// Loader
export HTTP_PORT=9998
export GRPC_PORT=9011
 
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
 
export RABBIT_HEARTBEAT=10
 
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_OUTPUT_QUEUE=cl.tr.post_engagement_by_topic_crawling_sources
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_CYCLE="*/10 * * * * *"
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_DEFAULT_DATA_DURATION: 1months
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_TOPIC_LOAD_BATCH_SIZE=5
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_ENABLE=true
 
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
 
export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
yarn testing --scope=@ynm/cl-tr-crawling-loader-service


// Crawler

export HTTP_PORT=9999
export GRPC_PORT=9011
 
export LOG_LEVEL=debug
export RABBIT_HEARTBEAT=10
 
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/api/graphql
export TR_GRAPH_SERVICE_TIMEOUT=30000
export TR_GRAPH_SERVICE_MAXRETRIES=10
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.post_engagement_by_topic_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.*.*.post_engagement_by_topic_crawling_source
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.post_engagement_by_topic_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.post_engagement_by_topic_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_POST_ENGAGEMENT_BY_TOPIC_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_POST_ENGAGEMENT_BY_TOPIC_CRAWLER
 
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
 
yarn testing --scope=@ynm/cl-tr-post-engagement-by-topic-crawler-service


// Updater

export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
 
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
 
export RABBIT_HEARTBEAT=10
 
export TR_POSTS_BY_TOPIC_INPUT_EXCHANGE=cl.tr.resolved_source
export TR_POSTS_BY_TOPIC_ROUTING_KEY=cl.10.posts_by_topic
export TR_POSTS_BY_TOPIC_INPUT_QUEUE=cl.tr.posts_by_topic_finished_sources
export TR_POSTS_BY_TOPIC_ENABLE=true
export TR_POSTS_BY_TOPIC_BATCH_SIZE=100
export TR_POSTS_BY_TOPIC_PREFETCH_MESSAGES=1000
 
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
 
export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
yarn testing --scope=@ynm/cl-tr-source-updater-service



5. Luồng crawl identity -> Update xuống identity

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
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TT_POST_TRANSCRIPT_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3

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
 
yarn start --scope=@ynm/cl-tr-source-post-crawler-service




### Câu lệnh chạy của các luồng Facebook


1. Update vào identity

Wiki:
https://wiki.younetco.com/display/FB/%5BFacebook%5D+Update+Identity+Info


2. Update vào post

Wiki: (Có luồng của chị Trang đang test -> Hỏi thử)


3. Update engagement by topic

Wiki:
https://wiki.younetco.com/display/FB/%5BFACEBOOK%5D+WEB+ENGAGEMENT+AND+PARALLEL+WITH+TOKEN+FLOW




### Câu lệnh chạy của luồng Tiktok




1. Update vào identity

Wiki: https://wiki.younetco.com/display/FB/%5BTiktok%5D+Crawl+Post

2. Update vào post

Wiki: https://wiki.younetco.com/display/FB/Tiktok+Post+Info+Documents
Wiki: https://wiki.younetco.com/display/FB/Tiktok+Comment+Documents



### Câu lệnh chạy của News


1. Article title

Chạy luồng crawl first page hoặc luồng crawl keyword là được



2. Category links

Wiki: https://wiki.younetco.com/display/FB/%5BNews%5D%5BNew+Crawler%5D+Process+Of+Crawling+Article+Urls+By+First+Page




