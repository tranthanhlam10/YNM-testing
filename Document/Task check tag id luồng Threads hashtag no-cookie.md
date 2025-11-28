# Task check tag id luồng hashtag nocookie

ynmpdp-5686-tagid-threads-staging-ynm-crawler-empty



kubectl config use-context lamtt-k8s-ovh
kubectl get pods -n crawler-staging | grep ynmpdp-5686-tagid-threads-staging-ynm-crawler-empty

kubectl exec -it ynmpdp-5686-tagid-threads-staging-ynm-crawler-empty-577f48tcmtt -n crawler-staging -- sh


Câu lệnh đang search
https://www.threads.com/search?q=starbucks%20vi%E1%BB%87t%20nam&serp_type=tags&tag_id=1


# Câu lệnh chạy


1. Tag no-cookie bình thường 

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


## Những queue/deployment liên qua đến Threads


Những queue/deployment liên quan đến threads hashtag keyword

1. Non crisis

No-cookie
Deployment: ynm-cl-tr-hashtag-post-no-cookie-service-staging
cl.tr.hashtag_posts_no_cookie_crawling_sources
cl.tr.hashtag_posts_no_cookie_crawling_requests
cl.tr.hashtag_posts_no_cookie_crawled_sources

Deployment: ynm-cl-tr-keyword-post-no-cookie-service-staging

cl.tr.keyword_posts_no_cookie_crawling_sources
cl.tr.keyword_posts_no_cookie_crawling_requests
cl.tr.keyword_posts_no_cookie_crawled_sources

Có cookie

Deployment: ynm-cl-tr-hashtag-post-service-staging

cl.tr.hashtag_posts_crawling_sources
cl.tr.hashtag_posts_crawling_requests
cl.tr.hashtag_posts_crawled_sources

Deployment: ynm-cl-tr-keyword-post-service-staging

cl.tr.keyword_posts_crawling_sources
cl.tr.keyword_posts_crawling_requests
cl.tr.keyword_posts_crawled_sources

2. Crisis

No-cookie

Deployment: ynm-cl-tr-hashtag-post-crisis-nc-service-staging

cl.tr.hashtag_posts_crisis_no_cookie_crawling_sources
cl.tr.hashtag_posts_crisis_no_cookie_crawling_requests
cl.tr.hashtag_posts_crisis_no_cookie_crawled_sources

Deployment: ynm-cl-tr-keyword-post-crisis-nc-service-staging

cl.tr.keyword_posts_crisis_no_cookie_crawling_sources
cl.tr.keyword_posts_crisis_no_cookie_crawling_requests
cl.tr.keyword_posts_crisis_no_cookie_crawled_sources

Có cookie

Deployment: ynm-cl-tr-hashtag-post-crisis-service-staging

cl.tr.hashtag_posts_crisis_crawling_sources
cl.tr.hashtag_posts_crisis_crawling_requests
cl.tr.hashtag_posts_crisis_crawled_sources

Deployment: ynm-cl-tr-keyword-post-crisis-service-staging

cl.tr.keyword_posts_crisis_crawling_sources
cl.tr.keyword_posts_crisis_crawling_requests
cl.tr.keyword_posts_crisis_crawled_sources

3. Critical

No cookie

Deployment: ynm-cl-tr-hashtag-post-critical-nc-service-staging

cl.tr.hashtag_posts_critical_no_cookie_crawling_sources
cl.tr.hashtag_posts_critical_no_cookie_crawling_requests
cl.tr.hashtag_posts_critical_no_cookie_crawled_sources

Deployment: ynm-cl-tr-keyword-post-critical-nc-service-staging

cl.tr.keyword_posts_critical_no_cookie_crawling_sources
cl.tr.keyword_posts_critical_no_cookie_crawling_requests
cl.tr.keyword_posts_critical_no_cookie_crawled_sources

Có cookie

Deployment: ynm-cl-tr-hashtag-post-critical-service-staging

cl.tr.hashtag_posts_critical_crawling_sources
cl.tr.hashtag_posts_critical_crawling_requests
cl.tr.hashtag_posts_critical_crawled_sources

Deployment: ynm-cl-tr-keyword-post-critical-service-staging

cl.tr.keyword_posts_critical_crawling_sources
cl.tr.keyword_posts_critical_no_crawling_requests
cl.tr.keyword_posts_critical_crawled_sources

4. Reply crawl post

Deployment: ynm-cl-tr-hashtag-post-critical-nc-service-staging

cl.tr.reply_posts_hashtag_keyword_crawling_sources
cl.tr.reply_posts_hashtag_keyword_crawling_requests
cl.tr.reply_posts_hashtag_keyword_crawled_sources

Regex tên queue:

^(?:[\w-]+\.)*(?:cl\.(?:tr\.(?:hashtag|keyword|reply)posts(?:_hashtag_keyword)?(?:_no_cookie)?(?:crawling(?:(?:requests|sources(?:_next_page)?))|crawled_sources)|reply_posts_hashtag_keyword_crawling(?:(?:requests|sources(?:next_page)?))?|reply_posts_hashtag_keyword_crawled_sources|resolved(?:source|data)|posts_2_solr_tr_posts|mentions_2_solr_mentions|identities_2_solr_identities|identities_2_redis_identities|replies_2_solr_tr_replies)|app\.socialheat\.crawl_keyword\.results)$|app.socialheat.crawl_keyword.results_LamTT|cl.tr.keyword_posts_crawling_sources_next_pages|cl.tr.hashtag_posts_crawling_sources_next_pages|reply_posts_hashtag_keyword|LamTT|cl.tr.hashtag_posts_crisis|cl.tr.keyword_posts_crisis|cl.tr.keyword_posts_critical|cl.tr.hashtag_posts_critical