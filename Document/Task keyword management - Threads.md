# Task Threads keyword management



## Cách chạy

ynmpdp-5464-threads-keyword-management-testing-ynm-crawler-empt
kubectl get pods -n crawler-testing | grep ynmpdp-5464-threads-keyword-management
kubectl exec -it ynmpdp-5464-threads-keyword-management-testing-ynm-crawlervbz9g -n crawler-testing -- sh

Nghiên cứu lại cách thêm keyword của bên app



- Câu query các keyword trên app


SELECT * FROM monitoring_keyword.`last_crawlings` WHERE id_keyword IN (30906,30910,30922,30928,30929,30949)
SELECT * FROM `keywords` WHERE id = 7819



- Regex casc queue



^(?:[\w-]+\.)?cl\.tr\.(?:hashtag|keyword)_posts(?:_no_cookie)?_(?:crawling(?:_(?:requests|sources(?:_next_page)?))|crawled_sources)$|^(?:[\w-]+\.)?app\.socialheat\.crawl_keyword\.results$|^(?:[\w-]+\.)?cl\.(?:resolved_(?:source|data)|posts_2_solr_tr_posts|mentions_2_solr_mentions|identities_2_solr_identities)$



^(?:[\w-]+\.)?(?:cl\.(?:tr\.(?:hashtag|keyword)_posts(?:_no_cookie)?_(?:crawling(?:_(?:requests|sources(?:_next_page)?))|crawled_sources)|reply_posts_hashtag_keyword_crawling(?:_(?:requests|sources(?:_next_page)?))?|reply_posts_hashtag_keyword_crawled_sources|resolved_(?:source|data)|posts_2_solr_tr_posts|mentions_2_solr_mentions|identities_2_solr_identities|identities_2_redis_identities|replies_2_solr_tr_replies)|app\.socialheat\.crawl_keyword\.results)$


// Câu regex đúng
^(?:[\w-]+\.)*(?:cl\.(?:tr\.(?:hashtag|keyword|reply)_posts(?:_hashtag_keyword)?(?:_no_cookie)?_(?:crawling(?:_(?:requests|sources(?:_next_page)?))|crawled_sources)|reply_posts_hashtag_keyword_crawling(?:_(?:requests|sources(?:_next_page)?))?|reply_posts_hashtag_keyword_crawled_sources|resolved_(?:source|data)|posts_2_solr_tr_posts|mentions_2_solr_mentions|identities_2_solr_identities|identities_2_redis_identities|replies_2_solr_tr_replies)|app\.socialheat\.crawl_keyword\.results)$|app.socialheat.crawl_keyword.results_LamTT|cl.tr.keyword_posts_crawling_sources_next_pages|cl.tr.hashtag_posts_crawling_sources_next_pages


// Câu regex được cập nhật mới nhât 
^(?:[\w-]+\.)*(?:cl\.(?:tr\.(?:hashtag|keyword|reply)_posts(?:_hashtag_keyword)?(?:_no_cookie)?_(?:crawling(?:_(?:requests|sources(?:_next_page)?))|crawled_sources)|reply_posts_hashtag_keyword_crawling(?:_(?:requests|sources(?:_next_page)?))?|reply_posts_hashtag_keyword_crawled_sources|resolved_(?:source|data)|posts_2_solr_tr_posts|mentions_2_solr_mentions|identities_2_solr_identities|identities_2_redis_identities|replies_2_solr_tr_replies)|app\.socialheat\.crawl_keyword\.results)$|app.socialheat.crawl_keyword.results_LamTT|cl.tr.keyword_posts_crawling_sources_next_pages|cl.tr.hashtag_posts_crawling_sources_next_pages|reply_posts_hashtag_keyword|LamTT|cl.tr.hashtag_posts_crisis|cl.tr.keyword_posts_crisis

1. Hashtag

cl.tr.hashtag_posts_crawling_requests
cl.tr.hashtag_posts_crawling_sources
cl.tr.hashtag_posts_crawling_sources_next_page
app.socialheat.crawl_keyword.results
cl.tr.hashtag_posts_crawled_sources
cl.posts_2_solr_tr_posts
cl.mentions_2_solr_mentions
cl.identities_2_solr_identities
cl.tr.hashtag_posts_no_cookie_crawling_requests
cl.tr.hashtag_posts_no_cookie_crawling_sources
cl.tr.hashtag_posts_no_cookie_crawling_sources_next_page
cl.tr.hashtag_posts_no_cookie_crawled_sources



2. Keyword

cl.tr.keyword_posts_crawling_requests
cl.tr.keyword_posts_crawling_sources
cl.tr.keyword_posts_crawling_sources_next_page
app.socialheat.crawl_keyword.results
cl.tr.keyword_posts_crawled_sources
cl.posts_2_solr_tr_posts
cl.mentions_2_solr_mentions
cl.identities_2_solr_identities
cl.tr.keyword_posts_no_cookie_crawling_requests
cl.tr.keyword_posts_no_cookie_crawling_sources
cl.tr.keyword_posts_no_cookie_crawling_sources_next_page
cl.tr.keyword_posts_no_cookie_crawled_sources



3. Reply

cl.reply_posts_hashtag_keyword_crawling_requests
cl.reply_posts_hashtag_keyword_crawling_sources
cl.reply_posts_hashtag_keyword_crawling_sources_next_page
cl.reply_posts_hashtag_keyword_crawled_sources
cl.identities_2_redis_identities
cl.identities_2_solr_identities
cl.replies_2_solr_tr_replies
cl.posts_2_solr_tr_posts
cl.mentions_2_solr_mentions
cl.identities_2_solr_identities
app.socialheat.crawl_keyword.results

- Keyword no cookie crawler

export HTTP_PORT=9010
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
export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
 
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

 
NODE_ENV=testing yarn start --scope=@ynm/cl-tr-keyword-post-crawler-service


- Hashtag no cookie crawler

export HTTP_PORT=9088
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
 
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/api/graphql
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10

 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.hashtag_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.hashtag_posts_no_cookie_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.hashtag_posts_no_cookie_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 

export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
 
export CRAWLER_CONFIG_PAGING_ENABLE=true

export CRAWLER_CONFIG_CREATED_BY=ThreadsHashtagPostNoCookieCrawlingLoader
 
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

 
NODE_ENV=testing yarn start --scope=@ynm/cl-tr-hashtag-post-crawler-service


- Reply crawl post 

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
export CRAWLER_CONFIG_CRAWLING_ROUTING_KEY=cl.10.*.*.reply-post-hashtag-keyword-detail
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reply_posts_hashtag_keyword_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reply_posts_hashtag_keyword_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reply_post_hashtag_keyword
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reply_posts_hashtag_keyword_crawled_sources

export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reply_post_hashtag_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_ROUTING_KEY=cl.10.*.*.reply_post_hashtag_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_FOLLOWERS_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER



export CRAWLER_CONFIG_CREATED_BY=ThreadsReplyPostHashtagKeywordCrawlingLoader


export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=5
export CRAWLER_CONCURRENCY=5
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=10
 
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post
export REDIS_POST_PASSWORD=RHTkP9M79at6
export REDIS_POST_DB=12
 
export REDIS_DB=3
 
yarn testing:tr-reply-post


- Source reply
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



export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
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
  "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader",
  "link": "threads.com/@maidora.maidora",
  "id_social": "63454508403",
  "username": "maidora.maidora"
}


- Keyword có cookie

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
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_REPLY_BY_REPLY_CRAWLER
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

 
export REDIS_DB=3
 
yarn testing:tr-keyword



- Hashtag có cookie


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
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_SOURCE_REPLY_POST_CRAWLER
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
export RESOLVER_MAX_PAGE=50
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=10
export RESOLVER_MAX_PAGE=10
 
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post
export REDIS_POST_PASSWORD=RHTkP9M79at6
export REDIS_POST_DB=12
 
export REDIS_DB=3
 
yarn testing:tr-hashtag



- Reply crawl post cũ: 
export HTTP_PORT=9040
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
 
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_FOLLOWERS_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_CREATED_BY=ThreadsReplyPostCrawlingLoader
export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1

export CRAWLER_CONFIG_CREATED_BY=ThreadsReplyPostCrawlingLoader

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=10

export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post
export REDIS_POST_PASSWORD=RHTkP9M79at6
export REDIS_POST_DB=12

export REDIS_DB=3

yarn testing:tr-reply-post



## Scope 

- Hiện tại bỏ loader và updater khi crawl keyword/hashtag
- Check kĩ điều kiện dừng
- Check luồng reply crawl post (Hiện tại format message đã thay đổi, cần check kĩ lại format message)
- Ngoài ra về luồng crawl không thay đổi quá nhiều
- Không cần check lại cách crawl, cách lưu trữ thông tin
- Check lại các thông tin bên app gửi có đúng hay không
- Check lại khi crawl xong đã gửi thông tin cho team app đúng hay không


## Data check


// Hashtag:
{
  "id_keyword": 30930,
  "keyword": "liverpool",
  "id_platform": 10,
  "id_process": 359,
  "is_critical": 0,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": null,
  "id_last_crawling": 90217,
  "tag_id": null
}


// Keyword:

[
  {
    "id_keyword": 30949,
    "keyword": "Olympia",
    "id_platform": 10,
    "id_process": 359,
    "is_critical": 0,
    "crawling_type": "brand_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": null,
    "id_last_crawling": 90254,
    "tag_id": "18276896743093264"
  },
   {
    "id_keyword": 30949,
    "keyword": "Olympia",
    "id_platform": 10,
    "id_process": 359,
    "is_critical": 0,
    "crawling_type": "brand_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": null,
    "id_last_crawling": 90254,
    "tag_id": null
  },
  {
    "id_keyword": 30949,
    "keyword": "phuongly",
    "id_platform": 10,
    "id_process": 359,
    "is_critical": 0,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": null,
    "id_last_crawling": 90254,
    "tag_id": null
  },
    {
    "id_keyword": 30949,
    "keyword": "Phương Ly Em Xinh Say Hi",
    "id_platform": 10,
    "id_process": 359,
    "is_critical": 0,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": null,
    "id_last_crawling": 90254,
    "tag_id": null
  },
  {
    "id_keyword": 30949,
    "keyword": "B Ray Anh Trai Say Hi",
    "id_platform": 10,
    "id_process": 359,
    "is_critical": 0,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": null,
    "id_last_crawling": 90254,
    "tag_id": null
  }


  {
    "id_keyword": 30910,
    "keyword": "jjjjkkkkhhhhhvnvnvv",
    "id_platform": 10,
    "id_process": 355,
    "is_critical": 0,
    "crawling_type": "brand_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": null,
    "id_last_crawling": 90189,
    "tag_id": null
  },
  {
    "id_keyword": 30922,
    "keyword": "Anh trai say hi",
    "id_platform": 10,
    "id_process": 355,
    "is_critical": 0,
    "crawling_type": "brand_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": null,
    "id_last_crawling": 90212,
    "tag_id": null
  }

 {
    "id_keyword": 30922,
    "keyword": "Anh trai say hi",
    "id_platform": 10,
    "id_process": 355,
    "is_critical": 0,
    "crawling_type": "brand_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": null,
    "id_last_crawling": 90212,
    "tag_id": "18349625383091985"
  }


  18349625383091985
]