# Task crawl source post ở Platform X của Kim


## Vấn đề

Hiện tại chưa có luồng crawl source post ở platform X 

## Giải pháp

Tạo ra luồng crawl source post ở platform X. Đi bằng cookie và của no-cookie

## Cú pháp và câu lệnh chạy



1. Queue

cl.x.posts_crawling_sources

cl.x.posts_crawling_requests

cl.x.posts_crawled_sources

cl.mentions_2_solr_mentions

cl.posts_2_solr_x_posts

cl.identities_2_solr_identities

cl.identities_finished_sources


// Câu chuẩn chung

cl.x.posts_crawling_sources|cl.x.posts_crawling_requests|cl.x.posts_crawled_sources|cl.mentions_2_solr_mentions|cl.posts_2_solr_x_posts|cl.identities_2_solr_identities|cl.identities_finished_sources


// Câu với hậu tố LamTT

cl.x.posts_crawling_sources|cl.x.posts_crawling_requests|cl.x.posts_crawled_sources|cl.mentions_2_solr_mentions_LamTT|cl.posts_2_solr_x_posts|cl.identities_2_solr_identities_LamTT|cl.identities_2_redis_identities_LamTT|cl.identities_finished_sources

2. Key Redis


XUserPostNoCookieCrawlingLoader
XUserPostCrawlingLoader


3. Key mySQL

X_USER_POST_NO_COOKIE_CRAWLING_LOADER
X_USER_POST_CRAWLING_LOADER


4. Proxy/token

X_POST_CRAWLER
X_POST_CRAWLER



X_UNAUTHORIZED_POST_CRAWLER


5. Câu lệnh chạy trên k8s

ynmshgysg-135


kubectl get pods -n crawler-testing | grep ynmshgysg-135-testing-ynm-crawler-empty

kubectl exec -it ynmshgysg-135-testing-ynm-crawler-empty-67b447888b-f7xkn -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local



- Loader

+ Cookie
export HTTP_PORT=9955
export LOG_LEVEL=debug
  
export LOG_LOG_STASH_HOST=51.222.44.171
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
  
export RABBIT_HEARTBEAT=10
  
export REDIS_KEY_PREFIX='TH_'
  
export X_USER_POST_CRAWLING_LOADER_OUTPUT_QUEUE=cl.x.posts_crawling_sources
export X_USER_POST_CRAWLING_LOADER_COUNTRY=TH
export X_USER_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export X_USER_POST_CRAWLING_LOADER_CYCLE='0 */12 * * *'
export X_USER_POST_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export X_USER_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=100
export X_USER_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export X_USER_POST_CRAWLING_LOADER_ENABLE=true
  
NODE_ENV=testing_th yarn start --scope=@ynm/cl-x-crawling-loader-service


+ No cookie

export HTTP_PORT=9955
export LOG_LEVEL=debug
  
export LOG_LOG_STASH_HOST=51.222.44.171
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
  
export RABBIT_HEARTBEAT=10
  
export REDIS_KEY_PREFIX='TH_'
  
export X_USER_POST_NO_COOKIE_CRAWLING_LOADER_OUTPUT_QUEUE=cl.x.posts_crawling_sources
export X_USER_POST_NO_COOKIE_CRAWLING_LOADER_COUNTRY=TH
export X_USER_POST_NO_COOKIE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export X_USER_POST_NO_COOKIE_CRAWLING_LOADER_CYCLE='0 */12 * * *'
export X_USER_POST_NO_COOKIE_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export X_USER_POST_NO_COOKIE_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=100
export X_USER_POST_NO_COOKIE_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export X_USER_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=true
  
NODE_ENV=testing_th yarn start --scope=@ynm/cl-x-crawling-loader-service


- Crawler



export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
   
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
   
export REDIS_KEY_PREFIX='TH_'
  
export REDIS_DB=3
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
  
export HTTP_PORT=9998
export LOG_LEVEL=debug
   
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.x.posts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.x.posts_crawling_requests
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.11.*.*.posts
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.x.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.x.posts_crawled_sources
   
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.11.*.*.posts.next_page
   
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
  
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=X_POST_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=X_POST_CRAWLER
  
export CRAWLER_CONFIG_PAGING_ENABLE=true
   
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
   
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
   
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
   
NODE_ENV=testing_th yarn start --scope=@ynm/cl-x-post-crawler-service


- Token

export COUNTRY=TH
export HTTP_PORT=9020
export GRPC_PORT=9021
 
yarn start --scope @ynm/token-manager-service

- Proxy
export COUNTRY=TH
export HTTP_PORT=9010
export GRPC_PORT=9011
 
yarn start --scope @ynm/proxy-manager-service

