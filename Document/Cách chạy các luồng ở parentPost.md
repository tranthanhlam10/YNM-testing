## Câu lệnh chạy crawl


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
    
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.keyword_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.keyword_posts_no_cookie_crawling_requests
    
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.keyword_posts_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.keyword_posts_no_cookie_crawled_sources
    
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.keyword_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
    
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_KEYWORD_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_KEYWORD_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
    
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
export RESOLVER_DETECT_LANGUAGE_ENDPOINT_RND_SERVICE=http://rnd-dev.younetmedia.com/en-translation/v1/models/en-translation:predict
    
export REDIS_CACHE_HOST=192.168.1.103
export REDIS_CACHE_PORT=6390
export REDIS_CACHE_DB=1
export REDIS_CACHE_USERNAME=data_ynm_crawler
export REDIS_CACHE_PASSWORD=sankmsiIm7V0LXh
    
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
    
yarn testing:tr-keyword


// Threads Source Post


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


// Threads Source Reply

export HTTP_PORT=9999
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_replies_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data


export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_POTENTIAL_IDENTITY_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
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
 
yarn start --scope=@ynm/cl-tr-source-reply-crawler-service




// Threads Reposts


export HTTP_PORT=9995
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reposts_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_POTENTIAL_IDENTITY_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
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
yarn start --scope=@ynm/cl-tr-repost-crawler-service



// Loader




export HTTP_PORT=9087
export GRPC_PORT=9011
  
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
  
export MYSQL_NEWS_APP_CONNECTION_PASSWORD=kejudsY%44sd
export MYSQL_DEFAULT_CONNECTION_HOST=192.168.1.252
export MYSQL_DEFAULT_CONNECTION_USER=crawler
export MYSQL_NEWS_APP_CONNECTION_HOST=192.168.1.252
export MYSQL_NEWS_APP_CONNECTION_USER=crawler
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_PORT=6033
export MYSQL_DEFAULT_CONNECTION_PORT=6033
export MYSQL_NEWS_APP_CONNECTION_PORT=6033
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_PASSWORD=kejudsY%44sd
export MYSQL_DEFAULT_CONNECTION_PASSWORD=kejudsY%44sd
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_HOST=192.168.1.252
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_USER=crawler
  
export THREADS_KEYWORD_POST_NO_COOKIE_CRAWLING_LOADER_CYCLE=*/5 * * * *
export THREADS_KEYWORD_POST_NO_COOKIE_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=1
export THREADS_KEYWORD_POST_NO_COOKIE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export THREADS_KEYWORD_POST_NO_COOKIE_CRAWLING_LOADER_LIMIT=1000
export THREADS_KEYWORD_POST_NO_COOKIE_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export THREADS_KEYWORD_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false



export POST_COMMENT_CRAWLING_LOADER_CYCLE="*/1 * * * *"
export POST_COMMENT_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export POST_COMMENT_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export POST_COMMENT_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=1000
export POST_COMMENT_CRAWLING_LOADER_DEFAULT_DATA_DURATION=10months
export POST_COMMENT_CRAWLING_LOADER_ENABLE=true


export COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=true
 
export MONGO_SOCIAL_HEAT_DATABASE=socialheat_testing
export MONGO_SOCIAL_HEAT_USERNAME=ynm_socialheat
export MONGO_SOCIAL_HEAT_REPLICA_SET=rs0
export MONGO_SOCIAL_HEAT_PASSWORD=PfsFf6gmqoGP38
export MONGO_SOCIAL_HEAT_HOST=192.168.1.108
export MONGO_SOCIAL_HEAT_AUTH_SOURCE=socialheat_testing
export MONGO_SOCIAL_HEAT_PORT=27017
  
export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null
   
yarn testing:tr-loader



// Reply crawl post


export HTTP_PORT=9030
 
export GRPC_PORT=9031
 
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
 
export CRAWLER_CONFIG_CRAWLING_ROUTING_KEY=cl.10.*.*.reply-post-detail
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reply_posts_crawling_sources
 
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reply_posts_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reply_post
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reply_posts_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reply_post.next_page
 
export CRAWLER_CONFIG_RESOLVED_DATA_ROUTING_KEY=cl.10.*.*.reply_post.next_page
 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_SOURCE_REPLY_POST_CRAWLER
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_POTENTIAL_IDENTITY_CRAWLER
 
 
 
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
 
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post_tmp_13
export REDIS_POST_PASSWORD=RHTkP9M79at6tmp13
export REDIS_POST_DB=13
 
export REDIS_DB=3
 
yarn testing:tr-reply-post




// Youtube



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
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=YT_POST_FROM_CRISIS_KEYWORD_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=""
export CRAWLER_CONFIG_PAGING_ENABLE=false
     
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
 
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post_tmp_13
export REDIS_POST_PASSWORD=RHTkP9M79at6tmp13
export REDIS_POST_DB=13
     
yarn start --scope=@ynm/cl-yt-post-from-keyword-crawler-service


// Comment


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
   
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_REPLY_BY_REPLY_ST_CRAWLER
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_POTENTIAL_IDENTITY_CRAWLER
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


// Reply


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
   
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_SOURCE_POST_NO_COOKIE_EXTENSION_CRAWLER
   
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_SOURCE_POST_NO_COOKIE_CRAWLER
   
export CRAWLER_CONFIG_TYPE=replies
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

## Facebook


export HTTP_PORT=9013
export GRPC_PORT=9011
   
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
   
 
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_PORT=6033
export MYSQL_DEFAULT_CONNECTION_PORT=6033
export PAGE_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=1
export PAGE_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export PAGE_POST_CRAWLING_LOADER_LIMIT=1000
export PAGE_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export PAGE_POST_CRAWLING_LOADER_ENABLE=true
   



export PAGE_WEB_COMMENT_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=1
export PAGE_WEB_COMMENT_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export PAGE_WEB_COMMENT_CRAWLING_LOADER_LIMIT=1000
export PAGE_WEB_COMMENT_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export PAGE_WEB_COMMENT_CRAWLING_LOADER_ENABLE=true
 
export REDIS_DB=1  
   
yarn testing:loader






export FB_GRAPH_SERVICE_ENDPOINT=https://www.facebook.com/api
   
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=null
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=null
    
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.page_web_comments_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.page_web_comments_crawling_requests
    
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.2.*.comments-web
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.page_web_comments_crawled_sources
    
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.fb.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.2.*.comments-web.next_page
    
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
   
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_HASHTAG_POST_CRISIS_CRAWLER
    
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=10
     
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=10
     
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=10
    
export HTTP_PORT=9014
    
yarn testing:web-comment



{
  "id": "747009708826580_1333744361683803",
  "id_source": "fb_747009708826580",
  "retries": 0,
  "is_kol": false,
  "type": 2,
  "delay_time_rules": [],
  "last_data_date": "2025-09-12T13:21:39Z",
  "from_date": "1757683299",
  "to_date": "1758881492",
  "platform": 1,
  "createdBy": "PageWebCommentCrawlingLoader",
  "title": "Hôm nay 12/09/2025",
  "created_date": "2025-09-12T13:21:39Z",
  "caption": "LamTT -test"
}





export HTTP_PORT=9997
export GRPC_PORT=9011
  
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
  
export RABBIT_HEARTBEAT=10
  
export FB_GRAPH_SERVICE_ENDPOINT=https://graph.facebook.com
  
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.page_posts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.page_posts_crawling_requests
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.2.*.posts
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.page_posts_crawled_sources
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.fb.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.2.*.posts.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
  
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_PAGE_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_KEYWORD_POST_NON_CRISIS_CRAWLER
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=10
export BUILDER_BATCH_SIZE=1
  
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=10
  
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=10
  
export HTTP_PORT=9013
  
export REDIS_MAX_RETRIES_PER_REQUEST=null
export REDIS_DB=3
  
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post_tmp_13
export REDIS_POST_PASSWORD=RHTkP9M79at6tmp13
export REDIS_POST_DB=13
  
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-post-crawler-service



// Tiktok


export HTTP_PORT=9010
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export TT_GRAPH_SERVICE_ENDPOINT="http://tiktok.younetmedia.com"
export TT_GRAPH_SERVICE_TIMEOUT=60000
export TT_GRAPH_SERVICE_MAX_RETRIES=100
export TT_GRAPH_SERVICE_DELAY_TIMEOUT=3000
export TT_GRAPH_SERVICE_TRUST_HOST="http://51.79.83.113:15898/trust"
export TT_GRAPH_SERVICE_HEADERS_USER_AGENT="com.zhiliaoapp.musically/2023105030 (Linux; U; Android 13;vi_VN; 22041219PG; Build/TP1A.220624.014.14.0.3.0.TLSMIXM; Cronet/TTNetVersion:e9e93d02 2023-04-17 QuicVersion:4e69ae94 2023-02-13)"
export TT_GRAPH_SERVICE_PARAMS="search_id=&source=challenge_video&type=5&query_type=0&tt_data=a&ac=mobile&channel=googleplay&aid=1233&app_name=musical_ly&version_code=3105030&version_name=31.5.3&device_platform=android&ab_version=31.5.3&ssmix=a&device_type=22041219PG&device_brand=Xiaomi&language=vi&os_api=33&os_version=13&manifest_version_code=2023105030&resolution=2276*1080&dpi=420&update_version_code=2023105030&_rticket=1701683977733&app_type=normal&sys_region=VN&mcc_mnc=45205&timezone_name=Asia/Ho_Chi_Minh&ts=1701683977&timezone_offset=25200&build_number=31.5.3®ion=VN&uoo=0&app_language=vi&carrier_region=VN&locale=vi-VN&op_region=VN&ac2=wifi&host_abi=arm64-v8a&cdid=feb8a84b-b08d-40d7-9feb-a8882bef492a&okhttp_version=4.1.120.22-tiktokuse_store_region_cookie=1"
export DEVICE_MANAGER_SERVICE_PORT=9011
export DEVICE_MANAGER_SERVICE_HOST=ynm-device-manager-service-testing
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tt.tag_posts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tt.tag_posts_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.9.5.*.posts
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tt.tag_posts_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tt.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.9.5.*.posts.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_DEVICE_CRAWLER_TYPE=TT_API_CRAWLER_KEYWORD
export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_CONCURRENCY=20
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=20
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=20
 
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post_tmp_13
export REDIS_POST_PASSWORD=RHTkP9M79at6tmp13
export REDIS_POST_DB=13
 
NODE_ENV=testing yarn start --scope @ynm/cl-tt-tag-post-crawler-service



// Data pusher
export HTTP_PORT=9014
export GRPC_PORT=9011
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
export RABBIT_HEARTBEAT=10
 

 
export MENTION_2_SOLR_MENTION_INPUT_EXCHANGE=cl.resolved_data
export MENTION_2_SOLR_MENTION_ROUTING_KEY=cl.*.*.mentions
export MENTION_2_SOLR_MENTION_INPUT_QUEUE=cl.mentions_2_solr_mentions_LamTT
export MENTION_2_SOLR_MENTION_ENABLE=true
export MENTION_2_SOLR_MENTION_BATCH_SIZE=100
export MENTION_2_SOLR_MENTION_PREFETCH_MESSAGES=1000
 
 
NODE_ENV=testing yarn start --scope=@ynm/cl-data-pusher-service