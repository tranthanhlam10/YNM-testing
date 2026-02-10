# Task crawl hashtag keyword của Đồng


## Vấn đề

- Hiện tại chủ yếu các luồng crawl Instagram đều là các luồng cũ
- Làm luồng crawling Instagram theo pipeline mới
- Chạy instagram cho Global
- Luồng được clone ra giống facebook


## Scope

- Loader thì app gửi (Chỉ cần test message app gửi lên có đúng với format/value hay không)
- Luồng crawler được clone từ luồng facebook (Có thêm chỗ check duplicate)
- Resolver/Pusher/Updater giữ nguyên
- Kiểm tra kĩ coutry_code/created_date cho post/mentions/identity
- Confirm lại chỗ đẩy đi detect country

## Cách chạy


1. K8s

ynmshgysg-96-testing-ynm-crawler-empty?namespace=crawler-testing

kubectl get pods -n crawler-testing | grep ynmshgysg-96-testing-ynm-crawler-empty
kubectl exec -it  ynmshgysg-96-testing-ynm-crawler-empty-668f95dddb-wxx5w -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local


2. Regex RabbitMQ


- Câu regex:

cl\.ig\.(keyword|hashtag)_posts(_web)?_crisis_crawling_(sources|requests)|cl\.ig\.(keyword|hashtag)_posts(_web)?_crisis_crawled_sources




- Keyword web
cl.ig.keyword_posts_web_crisis_crawling_sources
cl.ig.keyword_posts_web_crisis_crawling_requests
cl.ig.keyword_posts_web_crisis_crawled_sources


- Hastag web
cl.ig.hashtag_posts_web_crisis_crawling_sources
cl.ig.hashtag_posts_web_crisis_crawling_requests
cl.ig.hashtag_posts_web_crisis_crawled_sources


- Keyword mobile
cl.ig.keyword_posts_crisis_crawling_sources
cl.ig.keyword_posts_crisis_crawling_requests
cl.ig.keyword_posts_crisis_crawled_sources

- Hashtag mobile
cl.ig.hashtag_posts_crisis_crawling_sources
cl.ig.hashtag_posts_crisis_crawling_requests
cl.ig.hashtag_posts_crisis_crawled_sources


3. Proxy/token type


IG_KEYWORD_POST_WEB_CRISIS_CRAWLER
IG_HASHTAG_POST_WEB_CRISIS_CRAWLER
IG_KEYWORD_POST_CRISIS_CRAWLER
IG_HASGTAG_POST_CRISIS_CRAWLER

4. Câu lệnh chạy script


- Keyword web

export IG_GRAPH_SERVICE_ENDPOINT=https://i.instagram.com/api/v1
    
export LOG_LEVEL=debug
 
export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
  
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.ig.keyword_posts_web_crisis_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.8_keyword.crawler-crisis
 
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.ig.keyword_posts_web_crisis_crawling_requests
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.8.*.*.keyword_posts_web_crisis
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.ig.keyword_posts_web_crisis_crawled_sources
   
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.8.*.*.keyword_posts_web_crisis.next_page
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.ig.crawled_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
    
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=IG_KEYWORD_POST_WEB_CRISIS_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=IG_KEYWORD_POST_WEB_CRISIS_CRAWLER
   
export CRAWLER_CONFIG_IS_MOBILE=false
export CRAWLER_CONFIG_CREATED_BY=InstagramKeywordPostWebCrisisCrawlingLoader
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
export BUILDER_BATCH_SIZE=1
      
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
      
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_DETECT_LANGUAGE_ENABLE=true
export RESOLVER_IS_DETECT_COUNTRY=true
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
      
NODE_ENV=testing yarn start --scope=@ynm/cl-ig-keyword-post-crawler-service



- Hashtag web

export IG_GRAPH_SERVICE_ENDPOINT=https://i.instagram.com/api/v1
    
export LOG_LEVEL=debug
 
export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
  
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.ig.hashtag_posts_web_crisis_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.8_hashtag.crawler-crisis
 
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.ig.hashtag_posts_web_crisis_crawling_requests
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.8.*.*.hashtag_posts_web_crisis
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.ig.hashtag_posts_web_crisis_crawled_sources
   
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.8.*.*.hashtag_posts_web_crisis.next_page
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.ig.crawled_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
    
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=IG_HASHTAG_POST_WEB_CRISIS_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=IG_HASHTAG_POST_WEB_CRISIS_CRAWLER
   
export CRAWLER_CONFIG_IS_MOBILE=false
export CRAWLER_CONFIG_CREATED_BY=InstagramHashtagPostWebCrisisCrawlingLoader
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
export BUILDER_BATCH_SIZE=1
      
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
      
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_DETECT_LANGUAGE_ENABLE=true
export RESOLVER_IS_DETECT_COUNTRY=true
 
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
      
NODE_ENV=testing yarn start --scope=@ynm/cl-ig-keyword-post-crawler-service


- Keyword mobi

export IG_GRAPH_SERVICE_ENDPOINT=https://i.instagram.com/api/v1
    
export LOG_LEVEL=debug
 
export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
  
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.ig.keyword_posts_crisis_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.8_keyword.crawler-crisis
 
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.ig.keyword_posts_crisis_crawling_requests
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.8.*.*.keyword_posts_crisis
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.ig.keyword_posts_crisis_crawled_sources
   
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.8.*.*.keyword_posts_crisis.next_page
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.ig.crawled_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
    
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=IG_KEYWORD_POST_CRISIS_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=IG_KEYWORD_POST_CRISIS_CRAWLER
   
export CRAWLER_CONFIG_IS_MOBILE=true
export CRAWLER_CONFIG_CREATED_BY=InstagramKeywordPostCrisisCrawlingLoader
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
export BUILDER_BATCH_SIZE=1
      
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
      
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_DETECT_LANGUAGE_ENABLE=true
export RESOLVER_IS_DETECT_COUNTRY=true
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
      
NODE_ENV=testing yarn start --scope=@ynm/cl-ig-keyword-post-crawler-service


- Hastag mobi

export IG_GRAPH_SERVICE_ENDPOINT=https://i.instagram.com/api/v1
    
export LOG_LEVEL=debug
 
export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
  
export PROXY_MANAGER_SERVICE_HOST=localhost
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.ig.hashtag_posts_crisis_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.8_hashtag.crawler-crisis
 
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.ig.hashtag_posts_crisis_crawling_requests
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.8.*.*.hashtag_posts_crisis
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.ig.hashtag_posts_crisis_crawled_sources
   
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.8.*.*.hashtag_posts_crisis.next_page
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.ig.crawled_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
    
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=IG_HASHTAG_POST_CRISIS_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=IG_HASHTAG_POST_CRISIS_CRAWLER
   
export CRAWLER_CONFIG_IS_MOBILE=true
export CRAWLER_CONFIG_CREATED_BY=InstagramHashtagPostCrisisCrawlingLoader
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
export BUILDER_BATCH_SIZE=1
      
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
      
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_DETECT_LANGUAGE_ENABLE=true
export RESOLVER_IS_DETECT_COUNTRY=true
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
      
NODE_ENV=testing yarn start --scope=@ynm/cl-ig-keyword-post-crawler-service

















