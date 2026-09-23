# Task crawl hashtag keyword của Đồng


## Vấn đề

- Hiện tại chủ yếu các luồng crawl Instagram đều là các luồng cũ
- Làm luồng crawling Instagram theo pipeline mới
- Chạy instagram cho Global
- Luồng được clone ra giống facebook


## Scope

- Loader thì app gửi (Chỉ cần test message app gửi lên có đúng với format/value hay không) -> Hiện tại đã đúng yêu cầu
- Luồng crawler được clone từ luồng facebook (Có thêm chỗ check duplicate)
- Check trường hơp có last_data_date
- Check số lượng page phải đi -> Hiện tại đã đúng yêu cầu
- Kiểm tra kĩ next_page -> Có bug và đã log bug -> Hiện tại đã fix và đúng yêu cầu
- Resolver/Pusher/Updater giữ nguyên
- Kiểm tra kĩ coutry_code/created_date cho post/mentions/identity
- Confirm lại chỗ đẩy đi detect country_code

Note:

+ Luồng web và mobi data trả về phải đúng format và giống nhau
+ Kiểm tra lại việc đi next_page
+ Cơ chế block/broken proxy/token
+ Cơ chế chống duplicate
+ Các dạng post ở IG có thể có


## Wiki/tài liệu

https://wiki.younetco.com/pages/viewpage.action?pageId=269818315

## Cách chạy


1. K8s

ynmshgysg-96-testing-ynm-crawler-empty?namespace=crawler-testing

kubectl get pods -n crawler-testing | grep ynmshgysg-96-testing-ynm-crawler-empty
kubectl exec -it ynmshgysg-96-testing-ynm-crawler-empty-6758b88495-npz5n -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local



deployment bắn message lên của app: ynm-socialheat-scheduler-testing


2. Regex RabbitMQ


- Câu regex:

cl\.ig\.(keyword|hashtag)_posts(_web)?_crisis_crawling_(sources|requests)|cl\.ig\.(keyword|hashtag)_posts(_web)?_crisis_crawled_sources|mentions_2_solr_mentions_LamTT|identities_2_solr_identities_LamTT|identities_2_redis_identities_LamTT|cl.posts_2_solr_ig_posts_LamTT|app.socialheat.crawl_keyword.results_LamTT|ig.identity_countries_crawling_sources




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


crawler_type LIKE "%LAMTT%"

4. Câu lệnh chạy script

- Token



export COUNTRY=VN
export HTTP_PORT=9020
export GRPC_PORT=9021
 
yarn start --scope @ynm/token-manager-service

- Proxy

export COUNTRY=VN
export HTTP_PORT=9010
export GRPC_PORT=9011
 
yarn start --scope @ynm/proxy-manager-service






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
export RESOLVER_IS_DETECT_COUNTRY=false
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
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=_km.8_hashtag.crawler-crisis
 
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
 
export HTTP_PORT=9014
    
   
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
export HTTP_PORT=9015
    
   
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
export HTTP_PORT=9015
    
   
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


## Data test


id_process:
3327


// Message đi crawl mẫu


// Case chế

{
  "id_keyword": 32707,
  "keyword": "#CR7",
  "id_platform": 8,
  "id_process": 2855,
  "is_critical": 0,
  "crawling_type": "crisis_tracking",
  "source": "graph",
  "is_first_crawl": 0,
  "last_data_date": "2026-02-06T07:47:25.177Z",
  "id_last_crawling": 134824,
  "tag_id": "11111",
  "country": "VN"
}



{
  "id_keyword": 32707,
  "keyword": "messi",
  "id_platform": 8,
  "id_process": 2855,
  "is_critical": 0,
  "crawling_type": "crisis_tracking",
  "source": "graph",
  "is_first_crawl": 0,
  "last_data_date": "2026-02-06T07:47:25.177Z",
  "id_last_crawling": 134824,
  "tag_id": "11111",
  "country": "VN"
}



// Case bình thường

{
  "id_keyword": 32707,
  "keyword": "Đình bắc",
  "id_platform": 8,
  "id_process": 2855,
  "is_critical": 0,
  "crawling_type": "crisis_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": null,
  "id_last_crawling": 134824,
  "tag_id": null,
  "country": "VN"
}



{
  "id_keyword": 32707,
  "keyword": "#ronaldo",
  "id_platform": 8,
  "id_process": 2855,
  "is_critical": 0,
  "crawling_type": "crisis_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": null,
  "id_last_crawling": 134824,
  "tag_id": null,
  "country": "VN"
}



{
  "id_keyword": 32707,
  "keyword": "realmadridcf",
  "id_platform": 8,
  "id_process": 2855,
  "is_critical": 0,
  "crawling_type": "crisis_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": null,
  "id_last_crawling": 134824,
  "tag_id": null,
  "country": "VN"
}


{
  "id_keyword": 32707,
  "keyword": "#wemby",
  "id_platform": 8,
  "id_process": 2855,
  "is_critical": 0,
  "crawling_type": "crisis_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": null,
  "id_last_crawling": 134824,
  "tag_id": null,
  "country": "VN"
}



{
  "id_keyword": 32707,
  "keyword": "#lebronjames",
  "id_platform": 8,
  "id_process": 2855,
  "is_critical": 0,
  "crawling_type": "crisis_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": null,
  "id_last_crawling": 134824,
  "tag_id": null,
  "country": "VN"
}


#kawhi



{
  "id_keyword": 32707,
  "keyword": "#Barca",
  "id_platform": 8,
  "id_process": 2855,
  "is_critical": 0,
  "crawling_type": "crisis_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": null,
  "id_last_crawling": 134824,
  "tag_id": null,
  "country": "VN"
}



{
  "id_keyword": 32707,
  "keyword": "Yamal",
  "id_platform": 8,
  "id_process": 2855,
  "is_critical": 0,
  "crawling_type": "crisis_tracking",
  "source": "graph",
  "is_first_crawl": 0,
  "last_data_date": "2026-02-06T07:47:25.177Z",
  "id_last_crawling": 134824,
  "tag_id": null,
  "country": "VN"
}




{
  "id_keyword": 32707,
  "keyword": "suzy",
  "id_platform": 8,
  "id_process": 2855,
  "is_critical": 0,
  "crawling_type": "crisis_tracking",
  "source": "graph",
  "is_first_crawl": 0,
  "last_data_date": null,
  "id_last_crawling": 134824,
  "tag_id": null,
  "country": "VN"
}


## Chạy số lượng nhiều ở testing

1. Các namespace:




2. Các deployment ở VN:


// Keyword
ynm-cl-ig-keyword-post-web-crisis-service-testing
ynm-cl-ig-keyword-post-web-critical-service-testing
ynm-cl-ig-keyword-post-web-non-crisis-service-testing


// Hashtag


ynm-cl-ig-hashtag-post-web-critical-service-testing
ynm-cl-ig-hashtag-post-web-crisis-service-testing
ynm-cl-ig-hashtag-post-web-non-crisis-service-testing
















