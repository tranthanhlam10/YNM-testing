# Task check change API Threads Hashtag Keyword No Cookie

## Vấn đề
Hiện tại Threads Hashtag keyword no-cookie bị thay đổi API 

## Mục tiêu
Tìm kiếm API khác để có thể crawl global trở lại

## Giải pháp
Hiện tại team data đã research được API crawling no-cookie mới 
API này không thay đổi việc mapping data

## Phạm vi test

Chung
- Data vẫn crawl về đúng đủ như ban đầu
- Tag_id = 1 vẫn phải apply
- Không đẩy qua luồng reply crawl post
- Mentions/Identity/ParentPost/Post/Reply/Message send app vẫn phải đúng như ban đầu

// Keyword
Identity
	+ Hiện tại identity đã lưu đúng thông tin ở Solr
	+ Identity đã lưu đúng ở Redis
Mentions
	+ Hiện tại mentions đã lưu đúng yêu cầu
	+ Hầu như là Post nên không có parentPost
Post
	+ Hiện tại posts đá lưu đúng với yêu cầu
	+ Hầu như là post nên chỉ có caption
Message gửi app
	+ Hiện tại số lượng Post đã đúng với số lượng mention crawl về

Crawling
	+ Nếu có reply thì như thế nào (Hiện tại không lưu lại reply)
	+ Hiện tại số lượng bài crawl về và số lượng bài API trả về đang có sự chênh lệch -> Nhớ lại chỗ Redis cache mention hashtag/key (những luồng Source cũng có)

- Thời gian đi crawl cũng phải nhanh như lúc đầu
- Proxy không bọ blocked/broken nhiều 

// Hashtag
Identity -> DONE
	+ Hiện tại identity đã lưu đúng thông tin ở Solr
	+ Identity đã lưu đúng ở Redis
Mentions -> DONE
	+ Hiện tại mentions đã lưu đúng yêu cầu
	+ Hầu như là Post nên không có parentPost
Post -> DONE
	+ Hiện tại posts đá lưu đúng với yêu cầu
	+ Hầu như là post nên chỉ có caption
Message gửi app
	+ Hiện tại số lượng Post đã đúng với số lượng mention crawl về

Crawling
	+ Nếu có reply thì như thế nào (Hiện tại không lưu lại reply)
	+ Hiện tại số lượng bài crawl về và số lượng bài API trả về đang có sự chênh lệch -> Nhớ lại chỗ Redis cache mention hashtag/key (những luồng Source cũng có)
	+ Kiểm tra nếu crawl không có tag_id thì như nào (Phải gán tag_id bằng 1)
	+ Kiểm tra nếu crawl với tag_id thì như nào -> Hiện tại đã crawl thành công

- Thời gian đi crawl cũng phải nhanh như lúc đầu
- Proxy không bọ blocked/broken nhiều 


*Noted*

- Nếu phát hiện user mới thì đẩy vào 2 queue cl.profile _2_solr_identities và cl.profile _2_redis_identities
- Nếu message là post (field is_reply = false) thì đẩy vào 2 queue cl.posts_2_solr_tr_posts và cl.mentions_2_solr_mentions
- Nếu message là reply (field is_reply = true) thì đẩy vào queue cl.reply_post_crawling_sources (xử lý trong reply post flow)
- Nếu hashtag đã crawl xong thì đẩy message chứa hashtag vào queue cl.hashtag/keyword_posts_finished_sources
- Điều kiện dừng (isFinished): crawl hết tất cả api trả về không có next page nữa



## Cách chạy



// Câu lệnh ở k8s



ynmpdp-5757-hotfix-tr-no-cookie-staging-ynm-crawler-empty


kubectl get pods -n crawler-staging | grep ynmpdp-5757-hotfix-tr-no-cookie-staging-ynm-crawler-empty
kubectl exec -it ynmpdp-5757-hotfix-tr-no-cookie-staging-ynm-crawler-empty-jsgfg -n crawler-staging -- sh

kubectl config use-context lamtt-k8s-ovh




// Câu regex ở RabbitmQ

^(?:[\w-]+\.)*(?:cl\.(?:tr\.(?:hashtag|keyword|reply)_posts(?:_hashtag_keyword)?(?:_no_cookie)?_(?:crawling(?:_(?:requests|sources(?:_next_page)?))|crawled_sources)|reply_posts_hashtag_keyword_crawling(?:_(?:requests|sources(?:_next_page)?))?|reply_posts_hashtag_keyword_crawled_sources|resolved_(?:source|data)|posts_2_solr_tr_posts|mentions_2_solr_mentions|identities_2_solr_identities|identities_2_redis_identities|replies_2_solr_tr_replies)|app\.socialheat\.crawl_keyword\.results)$|app.socialheat.crawl_keyword.results_LamTT|cl.tr.keyword_posts_crawling_sources_next_pages|cl.tr.hashtag_posts_crawling_sources_next_pages|reply_posts_hashtag_keyword|cl.tr.hashtag_posts_crisis|cl.tr.keyword_posts_crisis|cl.tr.keyword_posts_critical|cl.tr.hashtag_posts_critical|staging.cl.mentions_2_solr_mentions_LamTT|cl.identities_2_solr_identities_LamTT




// Câu lệnh chạy


1. Threads Keyword No-Cookie


export HTTP_PORT=9020
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
 
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/api/graphql
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
 
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.keyword_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.keyword_posts_no_cookie_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.keyword_posts_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.keyword_posts_no_cookie_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.keyword_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_KEYWORD_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_KEYWORD_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_KEYWORD_POST_NO_COOKIE_CRAWLER
 
export CRAWLER_CONFIG_PAGING_ENABLE=true

export CRAWLER_CONFIG_CREATED_BY=ThreadsKeywordPostNoCookieCrawlingLoader
 
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

 
NODE_ENV=staging yarn start --scope=@ynm/cl-tr-keyword-post-crawler-service



2. Threads Hashtag No-Cookie



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