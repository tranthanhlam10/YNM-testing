# Task check luồng Source Post cho global


## Scope

- Chỉ cần test đúng config:
+ Tên queue có tiền tố <env>.<country_code>
+ Redis cache dó tiền tố <country_code>
+ Có lưu lại country_code ở Post/Mention sau khi crawl

## Cách chạy
// Chạy script
kubectl get pods -n crawler-testing | grep ynmshgysg-44-testing-ynm-crawler-empty
kubectl exec -it  ynmshgysg-44-testing-ynm-crawler-empty-8679566dd6-4x4tb -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local


//regex queue
cl.fb.page_posts_|cl.fb.user_posts_|cl.fb.group_posts_

cl.fb_posts_2_solr_fb_posts|cl.identities_finished_sources|posts_2_solr_fb_posts|cl.mentions_2_solr_mentions|cl.fb.page_posts_|cl.fb.user_posts_|cl.fb.group_posts_


// Câu lệnh chạy
1. Token


export COUNTRY=TH
export HTTP_PORT=9020
export GRPC_PORT=9021
 
yarn start --scope @ynm/token-manager-service

2. Proxy

export COUNTRY=TH
export HTTP_PORT=9010
export GRPC_PORT=9011
 
yarn start --scope @ynm/proxy-manager-service


3. Loader

// User


export REDIS_KEY_PREFIX='TH_'
 
export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
   
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
   
export RABBIT_HEARTBEAT=10
 
export USER_POST_CRAWLING_LOADER_ENABLE=true
export USER_POST_CRAWLING_LOADER_COUNTRY=TH
export USER_POST_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.user_posts_crawling_sources
export USER_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export USER_POST_CRAWLING_LOADER_CYCLE="0 */24 * * *"
export USER_POST_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export USER_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export USER_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION="12months"
 
export USER_POST_CRAWLING_LOADER_FILTERS_0_FB_USER_TYPE=1
 
NODE_ENV=testing_th yarn start --scope=@ynm/cl-fb-crawling-loader-service

"TH_UserPostCrawlingLoader"

// Page
export REDIS_KEY_PREFIX='TH_'
 
export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
    
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
    
export RABBIT_HEARTBEAT=10
  
export PAGE_POST_CRAWLING_LOADER_ENABLE=true
export PAGE_POST_CRAWLING_LOADER_COUNTRY=TH
export PAGE_POST_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.page_posts_crawling_sources
export PAGE_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export PAGE_POST_CRAWLING_LOADER_CYCLE="0 */24 * * *"
export PAGE_POST_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export PAGE_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export PAGE_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION="12months"
  
export PAGE_POST_CRAWLING_LOADER_FILTERS_0_FB_USER_TYPE=2
  
NODE_ENV=testing_th yarn start --scope=@ynm/cl-fb-crawling-loader-service


"TH_PagePostCrawlingLoader"


// Group

export REDIS_KEY_PREFIX='TH_'
 
export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
    
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
    
export RABBIT_HEARTBEAT=10
  
export GROUP_POST_CRAWLING_LOADER_ENABLE=true
export GROUP_POST_CRAWLING_LOADER_COUNTRY=TH
export GROUP_POST_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.group_posts_crawling_sources
export GROUP_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export GROUP_POST_CRAWLING_LOADER_CYCLE="0 */24 * * *"
export GROUP_POST_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export GROUP_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export GROUP_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION="12months"
 
export GROUP_POST_CRAWLING_LOADER_FILTERS_0_FB_USER_TYPE=3
  
NODE_ENV=testing_th yarn start --scope=@ynm/cl-fb-crawling-loader-service


"TH_GroupPostCrawlingLoader"


4. Crawler

// User

export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
 
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export REDIS_KEY_PREFIX='TH_'
 
export HTTP_PORT=9110
  
export LOG_LEVEL=debug
 
export FB_GRAPH_SERVICE_ENDPOINT="https://graph.facebook.com"
export FB_GRAPH_SERVICE_TIMEOUT=30000
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE="cl.fb.user_posts_crawling_sources"
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE="cl.fb.user_posts_crawling_requests"
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY="cl.1.1.*.posts"
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE="cl.fb.crawled_source"
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE="cl.fb.user_posts_crawled_sources"
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE="cl.resolved_source"
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY="cl.1.1.*.posts.next_page"
 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE="cl.resolved_data"
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE="FB_USER_POST_CRAWLER"
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE="FB_USER_POST_CRAWLER"
 
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_IS_BATCH=true
  
NODE_ENV=testing_th yarn start --scope=@ynm/cl-fb-post-crawler-service


// Page

export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
 
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export REDIS_KEY_PREFIX='TH_'
 
export HTTP_PORT=9112
   
export LOG_LEVEL=debug
  
export FB_GRAPH_SERVICE_ENDPOINT="https://graph.facebook.com"
export FB_GRAPH_SERVICE_TIMEOUT=30000
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE="cl.fb.page_posts_crawling_sources"
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE="cl.fb.page_posts_crawling_requests"
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY="cl.1.2.*.posts"
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE="cl.fb.crawled_source"
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE="cl.fb.page_posts_crawled_sources"
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE="cl.resolved_source"
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY="cl.1.2.*.posts.next_page"
  
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE="cl.resolved_data"
  
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE="FB_API_CRAWLER_VN"
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE="FB_API_CRAWLER_VN"
  
export CRAWLER_CONFIG_PAGING_ENABLE=true
  
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
  
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
  
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_IS_BATCH=true
   
NODE_ENV=testing_th yarn start --scope=@ynm/cl-fb-post-crawler-service

// Group


export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
 
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export REDIS_KEY_PREFIX='TH_'
 
export HTTP_PORT=9111
   
export LOG_LEVEL=debug
  
export FB_GRAPH_SERVICE_ENDPOINT="https://graph.facebook.com"
export FB_GRAPH_SERVICE_TIMEOUT=30000
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE="cl.fb.group_posts_crawling_sources"
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE="cl.fb.group_posts_crawling_requests"
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY="cl.1.3.*.posts"
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE="cl.fb.crawled_source"
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE="cl.fb.group_posts_crawled_sources"
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE="cl.resolved_source"
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY="cl.1.3.*.posts.next_page"
  
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE="cl.resolved_data"
  
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE="FB_API_CRAWLER_VN"
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE="FB_API_CRAWLER_VN"
  
export CRAWLER_CONFIG_PAGING_ENABLE=true
  
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
  
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
  
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_IS_BATCH=true
   
NODE_ENV=testing_th yarn start --scope=@ynm/cl-fb-post-crawler-service







#### Chạy data cho nước khác ngoài thái lan - Sing

1. Token


export COUNTRY=SG
export HTTP_PORT=9020
export GRPC_PORT=9021
 
yarn start --scope @ynm/token-manager-service

2. Proxy

export COUNTRY=SG
export HTTP_PORT=9010
export GRPC_PORT=9011
 
yarn start --scope @ynm/proxy-manager-service


3. Loader

// User


export REDIS_KEY_PREFIX='SG_'
 
export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
   
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
   
export RABBIT_HEARTBEAT=10
 
export USER_POST_CRAWLING_LOADER_ENABLE=true
export USER_POST_CRAWLING_LOADER_COUNTRY=SG
export USER_POST_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.user_posts_crawling_sources
export USER_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export USER_POST_CRAWLING_LOADER_CYCLE="0 */24 * * *"
export USER_POST_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export USER_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export USER_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION="12months"
 
export USER_POST_CRAWLING_LOADER_FILTERS_0_FB_USER_TYPE=1
 
NODE_ENV=testing_sg yarn start --scope=@ynm/cl-fb-crawling-loader-service

"SG_UserPostCrawlingLoader"

// Page

export REDIS_KEY_PREFIX='SG_'
 
export HTTP_PORT=9998
export GRPC_PORT=9011
export LOG_LEVEL=debug
    
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
    
export RABBIT_HEARTBEAT=10
  
export PAGE_POST_CRAWLING_LOADER_ENABLE=true
export PAGE_POST_CRAWLING_LOADER_COUNTRY=SG
export PAGE_POST_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.page_posts_crawling_sources
export PAGE_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export PAGE_POST_CRAWLING_LOADER_CYCLE="0 */24 * * *"
export PAGE_POST_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export PAGE_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export PAGE_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION="12months"
  
export PAGE_POST_CRAWLING_LOADER_FILTERS_0_FB_USER_TYPE=2
  
NODE_ENV=testing_sg yarn start --scope=@ynm/cl-fb-crawling-loader-service


"SG_PagePostCrawlingLoader"


// Group

export REDIS_KEY_PREFIX='SG_'
 
export HTTP_PORT=9999
export GRPC_PORT=9011
export LOG_LEVEL=debug
    
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
    
export RABBIT_HEARTBEAT=10
  
export GROUP_POST_CRAWLING_LOADER_ENABLE=true
export GROUP_POST_CRAWLING_LOADER_COUNTRY=SG
export GROUP_POST_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.group_posts_crawling_sources
export GROUP_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export GROUP_POST_CRAWLING_LOADER_CYCLE="0 */24 * * *"
export GROUP_POST_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export GROUP_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export GROUP_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION="12months"
 
export GROUP_POST_CRAWLING_LOADER_FILTERS_0_FB_USER_TYPE=3
  
NODE_ENV=testing_sg yarn start --scope=@ynm/cl-fb-crawling-loader-service


"SG_GroupPostCrawlingLoader"


4. Crawler

// User

export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
 
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export REDIS_KEY_PREFIX='SG_'
 
export HTTP_PORT=9110
  
export LOG_LEVEL=debug
 
export FB_GRAPH_SERVICE_ENDPOINT="https://graph.facebook.com"
export FB_GRAPH_SERVICE_TIMEOUT=30000
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE="cl.fb.user_posts_crawling_sources"
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE="cl.fb.user_posts_crawling_requests"
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY="cl.1.1.*.posts"
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE="cl.fb.crawled_source"
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE="cl.fb.user_posts_crawled_sources"
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE="cl.resolved_source"
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY="cl.1.1.*.posts.next_page"
 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE="cl.resolved_data"
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_KEYWORD_POST_CRISIS_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_KEYWORD_POST_CRISIS_CRAWLER
 
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_IS_BATCH=true
  
NODE_ENV=testing_sg yarn start --scope=@ynm/cl-fb-post-crawler-service


// Page

export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
 
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export REDIS_KEY_PREFIX='SG_'
 
export HTTP_PORT=9112
   
export LOG_LEVEL=debug
  
export FB_GRAPH_SERVICE_ENDPOINT="https://graph.facebook.com"
export FB_GRAPH_SERVICE_TIMEOUT=30000
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE="cl.fb.page_posts_crawling_sources"
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE="cl.fb.page_posts_crawling_requests"
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY="cl.1.2.*.posts"
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE="cl.fb.crawled_source"
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE="cl.fb.page_posts_crawled_sources"
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE="cl.resolved_source"
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY="cl.1.2.*.posts.next_page"
  
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE="cl.resolved_data"
  
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE="FB_KEYWORD_POST_CRISIS_CRAWLER"
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE="FB_KEYWORD_POST_CRISIS_CRAWLER"
  
export CRAWLER_CONFIG_PAGING_ENABLE=true
  
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
  
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
  
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_IS_BATCH=true
   
NODE_ENV=testing_sg yarn start --scope=@ynm/cl-fb-post-crawler-service

// Group


export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
 
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export REDIS_KEY_PREFIX='SG_'
 
export HTTP_PORT=9111
   
export LOG_LEVEL=debug
  
export FB_GRAPH_SERVICE_ENDPOINT="https://graph.facebook.com"
export FB_GRAPH_SERVICE_TIMEOUT=30000
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE="cl.fb.group_posts_crawling_sources"
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE="cl.fb.group_posts_crawling_requests"
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY="cl.1.3.*.posts"
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE="cl.fb.crawled_source"
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE="cl.fb.group_posts_crawled_sources"
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE="cl.resolved_source"
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY="cl.1.3.*.posts.next_page"
  
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE="cl.resolved_data"
  
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE="FB_KEYWORD_POST_CRISIS_CRAWLER"
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE="FB_KEYWORD_POST_CRISIS_CRAWLER"
  
export CRAWLER_CONFIG_PAGING_ENABLE=true
  
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
  
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
  
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_IS_BATCH=true
   
NODE_ENV=testing_sg yarn start --scope=@ynm/cl-fb-post-crawler-service


5. Updater


export REDIS_KEY_PREFIX='SG_'
 
export HTTP_PORT=9063
  
export IDENTITIES_ENABLE=true
export IDENTITIES_INPUT_EXCHANGE=cl.resolved_source
export IDENTITIES_ROUTING_KEY=cl.*.identities
export IDENTITIES_INPUT_QUEUE=cl.identities_finished_sources
export IDENTITIES_CONCURRENCY=5
export IDENTITIES_BATCH_SIZE=100
export IDENTITIES_PREFETCH_MESSAGES=1000
export IDENTITIES_MAX_WAITING_TIME=60
  
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-source-updater-service




6. Pusher

export REDIS_KEY_PREFIX='SG_'
 
export HTTP_PORT=9063
 
export POST_2_SOLR_FB_POST_ENABLE=true
export POST_2_SOLR_FB_POST_ENABLE_REDIS_SERVICE=false
export POST_2_SOLR_FB_POST_INPUT_EXCHANGE=cl.resolved_data
export POST_2_SOLR_FB_POST_ROUTING_KEY=cl.1.posts
export POST_2_SOLR_FB_POST_INPUT_QUEUE=cl.posts_2_solr_fb_posts
export POST_2_SOLR_FB_POST_CONCURRENCY=5
export POST_2_SOLR_FB_POST_BATCH_SIZE=100
export POST_2_SOLR_FB_POST_MAX_WAITING_TIME=60
export POST_2_SOLR_FB_POST_PREFETCH_MESSAGES=1000
 
export MENTION_2_SOLR_MENTION_ENABLE=true
export MENTION_2_SOLR_MENTION_ENABLE_REDIS_SERVICE=false
export MENTION_2_SOLR_MENTION_INPUT_EXCHANGE=cl.resolved_data
export MENTION_2_SOLR_MENTION_ROUTING_KEY=cl.*.*.*.mentions
export MENTION_2_SOLR_MENTION_INPUT_QUEUE=cl.mentions_2_solr_mentions
export MENTION_2_SOLR_MENTION_CONCURRENCY=5
export MENTION_2_SOLR_MENTION_BATCH_SIZE=100
export MENTION_2_SOLR_MENTION_MAX_WAITING_TIME=60
export MENTION_2_SOLR_MENTION_PREFETCH_MESSAGES=1000
export MENTION_2_SOLR_MENTION_BEFORE_TIME=3years
export MENTION_2_SOLR_MENTION_AFTER_TIME=1days
  
NODE_ENV=testing_th yarn start --scope=@ynm/cl-data-pusher-service




---------------------------------------------------------------------------------------------------------------------------------------------------------



5. Updater


export REDIS_KEY_PREFIX='TH_'
 
export HTTP_PORT=9063
  
export IDENTITIES_ENABLE=true
export IDENTITIES_INPUT_EXCHANGE=cl.resolved_source
export IDENTITIES_ROUTING_KEY=cl.*.identities
export IDENTITIES_INPUT_QUEUE=cl.identities_finished_sources
export IDENTITIES_CONCURRENCY=5
export IDENTITIES_BATCH_SIZE=100
export IDENTITIES_PREFETCH_MESSAGES=1000
export IDENTITIES_MAX_WAITING_TIME=60
  
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-source-updater-service




6. Pusher

export REDIS_KEY_PREFIX='TH_'
 
export HTTP_PORT=9063
 
export POST_2_SOLR_FB_POST_ENABLE=true
export POST_2_SOLR_FB_POST_ENABLE_REDIS_SERVICE=false
export POST_2_SOLR_FB_POST_INPUT_EXCHANGE=cl.resolved_data
export POST_2_SOLR_FB_POST_ROUTING_KEY=cl.1.posts
export POST_2_SOLR_FB_POST_INPUT_QUEUE=cl.posts_2_solr_fb_posts
export POST_2_SOLR_FB_POST_CONCURRENCY=5
export POST_2_SOLR_FB_POST_BATCH_SIZE=100
export POST_2_SOLR_FB_POST_MAX_WAITING_TIME=60
export POST_2_SOLR_FB_POST_PREFETCH_MESSAGES=1000
 
export MENTION_2_SOLR_MENTION_ENABLE=true
export MENTION_2_SOLR_MENTION_ENABLE_REDIS_SERVICE=false
export MENTION_2_SOLR_MENTION_INPUT_EXCHANGE=cl.resolved_data
export MENTION_2_SOLR_MENTION_ROUTING_KEY=cl.*.*.*.mentions
export MENTION_2_SOLR_MENTION_INPUT_QUEUE=cl.mentions_2_solr_mentions
export MENTION_2_SOLR_MENTION_CONCURRENCY=5
export MENTION_2_SOLR_MENTION_BATCH_SIZE=100
export MENTION_2_SOLR_MENTION_MAX_WAITING_TIME=60
export MENTION_2_SOLR_MENTION_PREFETCH_MESSAGES=1000
export MENTION_2_SOLR_MENTION_BEFORE_TIME=3years
export MENTION_2_SOLR_MENTION_AFTER_TIME=1days
  
NODE_ENV=testing_th yarn start --scope=@ynm/cl-data-pusher-service



FB_USER_POST_CRAWLER

FB_USER_POST_CRAWLER
FB_GROUP_POST_CRAWLER
FB_PAGE_POST_CRAWLER

## Những cases cần check khi chạy với số lượng lớn trên testing

- Xem mention, posts, identity có crawl đúng với yêu cầu hay không (mention và identity có field TH - country của nước được crawl)
- Nếu như chạy số lượng nhiều thì có bị nghẽn gì không, có báo lỗi gì đặc biệt hay không

+ ynm-cl-fb-user-post-service-testing
+ ynm-cl-fb-page-post-service-testing
+ ynm-cl-fb-group-post-service-testing

+ ynm-cl-fb-user-post-service-staging
+ ynm-cl-fb-page-post-service-staging
+ ynm-cl-fb-group-post-service-staging




ynm-cl-fb-group-comment-service-staging
ynm-cl-fb-page-comment-service-staging



FB_GROUP_COMMENT_CRAWLER
FB_PAGE_COMMENT_CRAWLER
FB_USER_POST_CRAWLER
FB_PAGE_POST_CRAWLER
FB_GROUP_POST_CRAWLER

FB_KEYWORD_POST_CRISIS_CRAWLER