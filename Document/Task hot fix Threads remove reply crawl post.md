# Task hot fix remove reply crawl post 



## Cách chạy 
kubectl get pods -n crawler-staging | grep hotfix-remove-crawl-reply-post-staging
kubectl exec -it hotfix-remove-crawl-reply-post-staging-ynm-crawler-empty-78pwds -n crawler-staging -- sh

kubectl config use-context lamtt-k8s-ovh



## Những cases cần phải check


- Kiểm tra khi đi crawl các luông hashtag keword (Có cookie hoặc không có cookie) -> Điều release khi crawl xong post 
- Kiểm tra không đẩy message vào queue 



## Cách chạy cho từng luồng

1. Hashtag no-cookie

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
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.hashtag_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.hashtag_posts_no_cookie_crawling_requests
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.hashtag_posts_no_cookie_crawled_sources
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
  
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_HASHTAG_POST_NO_COOKIE_CRAWLER
  
export CRAWLER_CONFIG_CREATED_BY=ThreadsHashtagPostNoCookieCrawlingLoader
  
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
  
NODE_ENV=staging yarn start --scope=@ynm/cl-tr-hashtag-post-crawler-service




2. Hashtag có cookie

export HTTP_PORT=9010
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
 
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/api/graphql
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10

 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.hashtag_posts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.hashtag_posts_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.hashtag_posts_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRITICAL_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true


export CRAWLER_CONFIG_CREATED_BY=ThreadsHashtagPostCrawlingLoader
 
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
export RESOLVER_MAX_RETRIES=10
export RESOLVER_MAX_PAGE=1
 
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
 
NODE_ENV=staging yarn start --scope=@ynm/cl-tr-hashtag-post-crawler-service

3. Keyword có cookie


export HTTP_PORT=9010
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
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRITICAL_CRAWLER
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
export RESOLVER_MAX_RETRIES=10
export RESOLVER_MAX_PAGE=2
 
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


## Note
Neu nhu is_first_crawl = 0 (Chi crawl 2 page) -> Chỗ này có thể config đc
Nếu như is_first_crawl = 1 (Đi 1000 page) -> Chỗ này thì đang set cứng ở code



