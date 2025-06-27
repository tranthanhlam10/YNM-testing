# Check task merge data pusher và move chỗ detect language
- Chỗ detect language chuyển từ pusher t resolver
- Merge pusher của news vào data - pusher chung để đồng bộ với các platform khác 
- Pusher của news sẽ áp dung cơ chế delay (update theo batch) của những pusher khác


## Những thay đổi của DongLyHan

Copy các file từ news pusher sang data pusher.
Đổi tên các file và thêm metrics, index để thống nhất cấu trúc với các pusher khác.
Đổi exchange thành cl.resolved_data
Thêm các config maxWaitingTime, enableRedisService cho pusher, updater
Remove redis client trong source updater và dùng redis trong core.
Move detect language vào resolver core


### Prepare

- Nghiên cứu các luồng cần bật để có message ở chỗ pusher news  (Chỗ này nhờ Huy sp để chạy được nhanh hơn) -> Mai cần phân tích trước để hỏi Huy dễ hơn 




### Cách chạy của task này: 
move-news-data-pusher-testing-ynm-crawler-empty

kubectl config use-context lamtt-k8s-local
kubectl get pods -n crawler-testing | grep move-news-data-pusher-testing-ynm-crawler-empty
kubectl exec -it move-news-data-pusher-testing-ynm-crawler-empty-6bb4cc99bfl52gh -n crawler-testing -- sh


Loader để đẩy các keyword/hashtag lên: 




**Pusher**

export HTTP_PORT=9014
export GRPC_PORT=9011
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
export RABBIT_HEARTBEAT=10
  
export MENTION_2_SOLR_MENTION_BATCH_SIZE=500
export MENTION_2_SOLR_MENTION_CONCURRENCY=5
export MENTION_2_SOLR_MENTION_ENABLE=false
export MENTION_2_SOLR_MENTION_INPUT_EXCHANGE=cl.resolved_data_LamTT
export MENTION_2_SOLR_MENTION_INPUT_QUEUE=cl.mentions_2_solr_mentions_LamTT
export MENTION_2_SOLR_MENTION_PREFETCH_MESSAGES=1000
export MENTION_2_SOLR_MENTION_ROUTING_KEY=cl.*.*.mentions
export MENTION_2_SOLR_MENTION_MAX_WAITING_TIME=60
  
 
export CATEGORY_LINK_2_MYSQL_MONITOR_NEWS_CATEGORY_PUSHER_BATCH_SIZE=20
export CATEGORY_LINK_2_MYSQL_MONITOR_NEWS_CATEGORY_PUSHER_CONCURRENCY=5
export CATEGORY_LINK_2_MYSQL_MONITOR_NEWS_CATEGORY_PUSHER_ENABLE=true
export CATEGORY_LINK_2_MYSQL_MONITOR_NEWS_CATEGORY_PUSHER_INPUT_EXCHANGE=cl.resolved_data
export CATEGORY_LINK_2_MYSQL_MONITOR_NEWS_CATEGORY_PUSHER_INPUT_QUEUE=cl.news.monitor_news_categories
export CATEGORY_LINK_2_MYSQL_MONITOR_NEWS_CATEGORY_PUSHER_PREFETCH_MESSAGES=1000
export CATEGORY_LINK_2_MYSQL_MONITOR_NEWS_CATEGORY_PUSHER_ROUTING_KEY=cl.3.monitor_news_categories
export CATEGORY_LINK_2_MYSQL_MONITOR_NEWS_CATEGORY_PUSHER_MAX_WAITING_TIME=60
 
 
export ARTICLE_POST_2_SOLR_ARTICLE_POST_BATCH_SIZE=20
export ARTICLE_POST_2_SOLR_ARTICLE_POST_CONCURRENCY=5
export ARTICLE_POST_2_SOLR_ARTICLE_POST_ENABLE=false
export ARTICLE_POST_2_SOLR_ARTICLE_POST_INPUT_EXCHANGE=cl.resolved_data
export ARTICLE_POST_2_SOLR_ARTICLE_POST_INPUT_QUEUE=cl.news.article_posts
export ARTICLE_POST_2_SOLR_ARTICLE_POST_PREFETCH_MESSAGES=1000
export ARTICLE_POST_2_SOLR_ARTICLE_POST_ROUTING_KEY=cl.3.posts
export ARTICLE_POST_2_SOLR_ARTICLE_POST_MAX_WAITING_TIME=60
 
 
export ARTICLE_CRAWL_REVIEW_2_SOLR_ARTICLE_CRAWL_REVIEWS_BATCH_SIZE=20
export ARTICLE_CRAWL_REVIEW_2_SOLR_ARTICLE_CRAWL_REVIEWS_CONCURRENCY=5
export ARTICLE_CRAWL_REVIEW_2_SOLR_ARTICLE_CRAWL_REVIEWS_ENABLE=true
export ARTICLE_CRAWL_REVIEW_2_SOLR_ARTICLE_CRAWL_REVIEWS_INPUT_EXCHANGE=cl.resolved_data
export ARTICLE_CRAWL_REVIEW_2_SOLR_ARTICLE_CRAWL_REVIEWS_INPUT_QUEUE=cl.news.article_crawl_reviews
export ARTICLE_CRAWL_REVIEW_2_SOLR_ARTICLE_CRAWL_REVIEWS_PREFETCH_MESSAGES=1000
export ARTICLE_CRAWL_REVIEW_2_SOLR_ARTICLE_CRAWL_REVIEWS_ROUTING_KEY=cl.3.reviews
export ARTICLE_CRAWL_REVIEW_2_SOLR_ARTICLE_CRAWL_REVIEWS_MAX_WAITING_TIME=60
 
 
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_BATCH_SIZE=20
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_CONCURRENCY=5
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_ENABLE=false
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_INPUT_EXCHANGE=cl.resolved_data
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_INPUT_QUEUE=cl.news.monitor_sources
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_PREFETCH_MESSAGES=1000
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_ROUTING_KEY=cl.3.*.*.monitor_sources
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_MAX_WAITING_TIME=60
 
 
export ARTICLE_URL_2_SOLR_ARTICLE_URL_PUSHER_BATCH_SIZE=20
export ARTICLE_URL_2_SOLR_ARTICLE_URL_PUSHER_CONCURRENCY=5
export ARTICLE_URL_2_SOLR_ARTICLE_URL_PUSHER_ENABLE=false
export ARTICLE_URL_2_SOLR_ARTICLE_URL_PUSHER_INPUT_EXCHANGE=cl.resolved_data
export ARTICLE_URL_2_SOLR_ARTICLE_URL_PUSHER_INPUT_QUEUE=cl.news.article_urlS
export ARTICLE_URL_2_SOLR_ARTICLE_URL_PUSHER_PREFETCH_MESSAGES=1000
export ARTICLE_URL_2_SOLR_ARTICLE_URL_PUSHER_ROUTING_KEY=cl.3.*.*.article_url
export ARTICLE_URL_2_SOLR_ARTICLE_URL_PUSHER_MAX_WAITING_TIME=60
   
  
export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null

NODE_ENV=testing yarn start --scope=@ynm/cl-data-pusher-service



**Có 3 luồng để check chỗ detect language**
Luồng Hashtag keyword (Check luồng no-cookie thôi, nếu check luồng có cookie nữa thì hơi phí thời gian, nhưng mà cũng cần phải chạy lại chút ít)

-Luồng keyword no cookie:  0> Hiện tại check cũng tạm ổn đó 


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
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data_LamTT
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_KEYWORD_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_KEYWORD_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_KEYWORD_POST_NO_COOKIE_CRAWLER
 
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
export RESOLVER_DETECT_LANGUAGE_TOKEN_RND_SERVICE=ZGF0YV9kb25nbGg6ZGFzZmJobGtlaHQ5MjNuaw==
export RESOLVER_DETECT_LANGUAGE_ENABLE=true
export RESOLVER_DETECT_LANGUAGE_BATCH_SIZE_RND_SERVICE=64 
 
export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
yarn testing:tr-keyword


- Luồng hashtag no cookie:

export HTTP_PORT=9020
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
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data_LamTT
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_HASHTAG_POST_NO_COOKIE_CRAWLER
 
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
export RESOLVER_DETECT_LANGUAGE_TOKEN_RND_SERVICE=ZGF0YV9kb25nbGg6ZGFzZmJobGtlaHQ5MjNuaw==
export RESOLVER_DETECT_LANGUAGE_ENABLE=true
export RESOLVER_DETECT_LANGUAGE_BATCH_SIZE_RND_SERVICE=64 
 
export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
yarn testing:tr-hashtag



Các queue cần check
cl.(mentions_2_solr_mentions|posts_2_solr_tr_posts|tr.identities_finished_sources|tr.keyword_posts_no_cookie_crawling_sources|tr.keyword_posts_no_cookie_crawling_requests|tr.crawled_source_no_cookie|tr.hashtag_posts_no_cookie_crawling_sources|tr.hashtag_posts_no_cookie_crawling_requests|hashtag_posts_no_cookie_crawled_sources)

Câu lệnh SQL để xử lý data
SELECT * FROM `proxies` WHERE crawler_type IN ("TR_KEYWORD_POST_CRAWLER", "TR_HASHTAG_POST_CRAWLER")


UPDATE monitor_keyword_v2
SET status = 'DONE'
WHERE platform = 'THREADS';



**---------------------------------------------------------------------**

-Luồng reply crawl post

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
  
   
  
export TOKEN_MANAGER_SERVICE_PORT=9011
  
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
  
export PROXY_MANAGER_SERVICE_PORT=9011
  
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==
  
   
  
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
  
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data_LamTT
  
export CRAWLER_CONFIG_PAGING_ENABLE=true
  
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_REPLY_POSTS_CRAWLER
  
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_REPLY_POSTS_CRAWLER
  
   
  
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
 
 
export RESOLVER_DETECT_LANGUAGE_ENDPOINT_RND_SERVICE=http://rnd-dev.younetmedia.com/en-translation/v1/models/en-translation:predict
export RESOLVER_DETECT_LANGUAGE_TOKEN_RND_SERVICE=ZGF0YV9kb25nbGg6ZGFzZmJobGtlaHQ5MjNuaw==
export RESOLVER_DETECT_LANGUAGE_ENABLE=true
export RESOLVER_DETECT_LANGUAGE_BATCH_SIZE_RND_SERVICE=64 
  
export REDIS_DB=3
  
yarn testing:tr-reply-post


**---------------------------------------------------------------------**

## Check data pushser + resolver có config đúng hay không 

- Những queue cần check
(cl\.news\.(monitor_news_categories|article_posts|article_crawl_reviews|monitor_sources|article_urlS|crisis_keyword\.(crawling_sources|crawling_requests|crawled_sources))|parsed_detail_output|mentions_2_solr_mentions)

crawler_type LIKE "TR_%"


ARTICLE_URL_CRAWLER

NEWS_FORUMS_CRAWLER


/--------------------------------------------------------------------------------------/

### Resolver

**Article Url**  -> DONE (Hiện tại đã push đúng queue )

export HTTP_PORT=9980
export GRPC_PORT=9011
   
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
   
export RABBIT_HEARTBEAT=10
 
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
 
export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
export GOT_SCRAPING_SERVICE_MAX_OF_NUMBER_RETRY=5
export BROWSER_SERVICE_MAX_OF_NUMBER_RETRY=5
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.news.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls.next_page
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=""
export CRAWLER_CONFIG_TABLE_IDS_FOR_OPENAI_BATCH="[3]"
  
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
   
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=10
   
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=10
 
yarn testing --scope=@ynm/cl-news-article-url-crawler-service


**Crisis Keyword** -> DONE 


export HTTP_PORT=9010
export GRPC_PORT=9011
  
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=debug
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.crisis_keyword.crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.crisis_keyword.crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.crisis_keyword.crawled_sources
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.news.resolved_source
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.3.*.*.crisis_keyword_crawling_source
export CRAWLER_CONFIG_PAGING_SOURCE_ROUTING_KEY=cl.3.*.*.crisis_keyword_next_page
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE="ARTICLE_URL_CRAWLER"
  
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=5
export BUILDER_FREFETCH_MESSAGES=15
  
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=20
export CRAWLER_FREFETCH_MESSAGES=100
  
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=5
export RESOLVER_FREFETCH_MESSAGES=15
  
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
  
yarn start --scope=@ynm/cl-news-crisis-keyword-crawler-service


**Parse detail 2 mention** ->  Chỉnh lại routing key
export HTTP_PORT=9890
export LOG_LEVEL=debug
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=parsed_detail_output
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
 
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=100
export RESOLVER_LIMITED_DATE="10 * 12 * 30 * 24 * 60 * 60 * 1000"
export RESOLVER_ENABLE=true
 
yarn testing --scope=@ynm/cl-news-parsed-details-2-mentions-service


**OPEN AI**  -> Hiện tại API key đang báo lỗi -> Cần phải request anh Thái để có API key 

export HTTP_PORT=9940
export GRPC_PORT=9011
    
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
    
export RABBIT_HEARTBEAT=10

export OPENAI_CONFIG_CLIENT_OPTIONS_API_KEY=sk-svcacct-rGhgjvOUWy4VJeNJFCKl4wCug5uEEPb-kG8naIrR4UPkPv0qzscw9ZtbWuJFj1Y4PIiABkbEdUfhDT3BlbkFJBKzHIcy9DffntjjaI7g8DYF11KxvJV73fFb9Pb2YqNCjulHwcUG4z5G1fuqxJhjELaVILeZpdNk2gA
export OPENAI_CONFIG_CLIENT_OPTIONS_ORGANIZATION=""
export OPENAI_CONFIG_CLIENT_OPTIONS_PROJECT=""
 
export COMMON_CONFIG_INPUT_QUEUE=cl.news.html_2_mysql_openai_batches
export COMMON_CONFIG_INPUT_ROUTING_KEY=cl.3.openai_batch_inputs
export COMMON_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export COMMON_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.news.resolved_source
 
export BATCH_CREATOR_BATCH_SIZE=100
export BATCH_CREATOR_CONCURRENCY=1
export BATCH_CREATOR_MAX_BATCH_WAITING_TIMES=40
export BATCH_CREATOR_WAIT_FOR_BATCH=true
export BATCH_CREATOR_ENABLE=true
 
export BATCH_STATUS_MONITOR_CYCLE="*/30 * * * *"
export BATCH_STATUS_MONITOR_DATA_LOAD_BATCH_SIZE=100
export BATCH_STATUS_MONITOR_REMAIN_STORAGE_OPENAI=false
export BATCH_STATUS_MONITOR_ENABLE=false
 
export MYSQL_NEWS_CONNECTION_DATABASE=monitoring_crawl
 
yarn start --scope=@ynm/cl-news-category-link-by-openai-service



/______________________________________________________________________________________-/
Tổng hợp lại các issue còn gặp phải
- Mentions: DONE
- Article post -> DONE 
- Article_url -> DONE 
- Monitor_source -> DONE 
- Open AI -> Not DONE (Đã có message) -> Huy tự động push message lên queue để mình consume  -> DONE
- Review -> Not done (Đã có message)  -> Huy tự động push message lên queue để mình consume  -> DONE 



{"id_source":"mock-data.com","link":"mock-category-link","title":"[Mock] Category Link By Openai","updated_date":1750923968}

{
  "id": 164754,
  "platform": 3,
  "type": "BRAND_TRACKING",
  "createdBy": "GoogleCrisisKeywordCrawlingLoader",
  "keyword": "Em xinh say hi",
  "last_crawl_date": null,
  "last_crawl_cursor": null,
  "checkSum": "",
  "numOfRetries": 0,
  "typeOfSearchEngine": "google",
  "urlBuilderOptions": {
    "language": "lang_vi",
    "location": "countryVN",
    "period": "w",
    "sites": [],
    "start": 0,
    "fromDate": "",
    "toDate": ""
  }
}


{
  "id": "001fc1b6-4bb9-5351-8f8b-ede0cab52886",
  "id_social": "52700604",
  "title": "Áo thun BTS COOKY BT21 xe đạp",
  "id_source": "tiki.vn",
  "platform": 6,
  "link": "https://tiki.vn/ao-thun-bts-cooky-bt21-xe-dap-p52700604.html",
  "published_date": 1589389201,
  "last_have_data_date": 1589389201,
  "curr_page": 1,
  "reach_updated_date": "1970-01-01T00:00:00Z",
  "state_reach": 2,
  "updated_date": 1604892897,
  "state": 2,
  "status": 1,
  "end_page": 1,
  "count_failed": 0,
  "options": ""
}

