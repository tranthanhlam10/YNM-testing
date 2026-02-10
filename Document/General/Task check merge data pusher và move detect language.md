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


high|normal|auto_parser.raw

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


Article_url
ynm-cl-news-article-url-crawler-service-testing 


Crisis
ynm-cl-news-article-url-crawler-service-testing -> Nhưng bật chỗ gg crisis


Parse detail 2 mention
1. auto-parser-testing-high-priority-classifier
2. auto-parser-testing-high-priority-browser-crawler
3. auto-parser-testing-high-priority-http-crawler
4. auto-parser-testing-article-parser   (Đợi pod scale lên)
5. auto-parser-testing-error-article-handler
6. ynm-cl-news-parsed-details-2-mentions-service-testing



auto-parser-staging-high-priority-classifier

auto-parser-staging-high-priority-browser-crawler

auto-parser-staging-high-priority-http-crawler

auto-parser-staging-article-parser (Đợi pod scale lên)

auto-parser-staging-error-article-handler

ynm-cl-news-parsed-details-2-mentions-service-staging

OPEN AI
ynm-cl-news-category-link-by-openai-service-testing

- Mentions: DONE
- Article post -> DONE 
- Article_url -> DONE 
- Monitor_source -> DONE 
- Open AI -> Not DONE (Đã có message) -> Huy tự động push message lên queue để mình consume  -> DONE
- Review -> Not done (Đã có message)  -> Huy tự động push message lên queue để mình consume  -> DONE 


(cl\.news\.(monitor_news_categories|article_posts|article_crawl_reviews|monitor_sources|article_urlS|crisis_keyword\.(crawling_sources|crawling_requests|crawled_sources))|parsed_detail_output|mentions_2_solr_mentions)


### Cần phải check ở testing

- Tiếp theo là check luồng reply
- Check tiếp các luồng của news -> Kiểm tra xem đường đi có đúng không

- Hiện tại luồng keyword no cookie
ynm-cl-tr-keyword-post-no-cookie-service-testing


end call rnd with result: [{"id":0,"detected_language":"vi"},{"id":1,"detected_language":"vi"},{"id":2,"detected_language":"vi"},{"id":3,"detected_language":"vi"},{"id":4,"detected_language":"vi"},{"id":5,"detected_language":"vi"},{"id":6,"detected_language":"vi"},{"id":7,"detected_language":"vi"},{"id":8,"detected_language":"vi"},{"id":9,"detected_language":"vi"}]


- Luồng hashtag có detect language hay không 
ynm-cl-tr-hashtag-post-no-cookie-service-testing 
-> Hiện tại đang bị lỗi -> Đã được fix


- Hiện tại luồng Reply Post chưa có detect language
-> Hiện tại đã work đúng yêu cầu

- Category link by openai (đổi routing key và exchange)
Hiện tại đã config đúng


- Check article urls  -> Pass
CHỗ này cũng chỉ crawl để đẩy được message xuống article_urls là được

ynm-cl-news-article-url-crawler-service-testing
ynm-cl-news-crawling-loader-service-testing

Bật 2 deployments này lên để crawl

testing.cl.news.article_urls_crawled_sources
testing.cl.news.article_urls_crawling_requests
testing.cl.news.article_urls_crawling_sources
testing.cl.news.article_url

^(testing.cl.news.article_urls_crawled_sources|testing.cl.news.article_urls_crawling_requests|testing.cl.news.article_urls_crawling_sources|testing.cl.news.article_urls)$


- Crisis keyword -> Pass
Chỗ này chỉ cần chạy luồng crawl sau đó đẩy xuống article_urls là được\


ynm-cl-news-crisis-keyword-service-testing

cl.news.crisis_keyword.crawling_sources
cl.news.crisis_keyword.crawling_sources_next_pages
cl.news.crisis_keyword.crawling_requests
cl.news.crisis_keyword.crawled_sources
cl.news.updated_crisis_keywords
cl.news.article_urls
cl.news.inserted_monitor_sources

- Article_posts -> Pass
Miễn là message ở queue article_post được cl.pusher đẩy đi là đc 

Message mẫu: 

{
  "id": "debff0f5-7e5d-53c4-be79-20bcfa36033c",
  "id_category": "0",
  "title": "10 Địa chỉ Nha khoa Uy tín trên 15 năm hoạt động tại TPHCM",
  "id_source": "bookingcare.vn",
  "platform": 3,
  "link": "https://bookingcare.vn/cam-nang/10-dia-chi-nha-khoa-uy-tin-tren-15-nam-hoat-dong-tai-tphcm-p2963.html",
  "published_date": 1668963600,
  "last_have_data_date": 1754988456,
  "updated_date": 0
}

- Review
ERROR (cl-data-pusher-service): Processing data into solr has been occurred error: 'Error: Request HTTP error 400: {
  "responseHeader":{
    "rf":1,
    "status":400,
    "QTime":0},
  "error":{
    "metadata":[
      "error-class","org.apache.solr.common.SolrException",
      "root-error-class","org.apache.solr.common.SolrException"],
    "msg":"[doc=e54cb3fe-db54-56fd-b140-c2d4ecec7a98] missing required field: title",
    "code":400}}
' and retry after 5000ms


Hiện tại đang báo lỗi này -> Hiện dev đã fix chỗ này (Nguyên nhân xảy ra bug không có title )


- Monitor source
Hiện tại chỉ cần check consume message từ queue này là done 
Luồng này đang crawl từ luông keyword crisis cũ

ynm-cl-news-crisis-keyword-service-testing
Xóa record có priority 10 trong monitor_source

cl.news.monitor_sources


- Category link
-> Liên quan tới Open AI -> Không cần check

- Parse detail
{
  "id": "22ec6059-4a42-5477-a77f-07765a7bd5cd",
  "link": "https://vtcnews.vn/mira-murati-nguoi-phu-nu-tu-choi-loi-de-nghi-1-ty-usd-tu-meta-la-ai-ar957409.html",
  "domain": "vtcnews.vn",
  "id_source": "vtcnews.vn",
  "id_reference": null,
  "id_parent_comment": null,
  "views": 0,
  "likes": 0,
  "comments": 0,
  "shares": 0,
  "engagement_total": 0,
  "engagement_s_c": 0,
  "identity": null,
  "identity_name": null,
  "platform": 3,
  "mention_type": 1,
  "mention_type_details": 1,
  "title": "Mira Murati - người phụ nữ từ chối lời đề nghị 1 tỷ USD từ Meta là ai?",
  "search_text": [
    "Mira Murati - người phụ nữ từ chối lời đề nghị 1 tỷ USD từ Meta là ai?",
    "<p class='ap-description'><b>Quyết định từ chối lời mời trị giá 1 tỷ USD từ Meta, Mira Murati - cựu Giám đốc Công nghệ (CTO) của OpenAI - khiến nhiều người bất ngờ.</b></p><p class='ap-content'><html><head></head><body><div class=\"edittor-content box-cont mt15 clearfix \" itemprop=\"articleBody\"><p>Mira Murati từng là người đứng sau thành công của hàng loạt dự án AI đình đám tại OpenAI như ChatGPT, DALL·E, Codex và gần đây là Sora. Được mệnh danh là \"trái tim trí tuệ\" của chiến lược AI, Murati góp phần định hình cách con người tương tác với trí tuệ nhân tạo trong đời sống hiện đại.</p><figure class=\"expNoEdit\"><img alt=\"Mira Murati - người phụ nữ mang tầm nhìn AI vượt ra ngoài những con số tỷ USD. (Nguồn: Getty Images)\" height=\"440\" data-id=\"2634993\" data-detail=\"1\" data-width=\"660\" data-height=\"440\" data-src=\"https://cdn-i.vtcnews.vn/resize/th/upload/2025/08/01/123-14361951.jpeg\" class=\" lazy\" data-index=\"1\"><figcaption><p class=\"expEdit\">Mira Murati - người phụ nữ mang tầm nhìn AI vượt ra ngoài những con số tỷ USD. (Nguồn: Getty Images)</p></figcaption></figure><p>Mira Murati sinh ra tại thành phố Vlore, Albania - trái ngược với một số đồn đoán rằng cô có nguồn gốc Ấn Độ. Sau thời gian học tập tại Canada, cô chuyển đến Hoa Kỳ để theo đuổi niềm đam mê với công nghệ tiên tiến. Murati tốt nghiệp ngành Toán học tại Colby College và sau đó lấy bằng Kỹ thuật cơ khí tại Dartmouth College (Thayer School of Engineering) vào năm 2012.</p><p>Trước khi gia nhập OpenAI, cô từng làm việc tại các tập đoàn hàng đầu như Zodiac Aerospace, Tesla và Leap Motion, nơi cô tích lũy kinh nghiệm đáng kể trong lĩnh vực công nghệ cao và giao diện người - máy.</p><p>Tháng 2/2025, Murati sáng lập Thinking Machines Lab, một startup định giá gần 12 tỷ USD dù chưa ra mắt sản phẩm. Sứ mệnh của công ty là phát triển các công cụ AI dễ tiếp cận, tùy chỉnh, và minh bạch - nhằm phá vỡ sự độc quyền công nghệ của các 'ông lớn' Thung lũng Silicon.</p><p>Meta, dưới sự điều hành của Mark Zuckerberg, đã đề nghị 200 triệu đến 1 tỷ USD để mua lại Thinking Machines Lab hoặc thu hút Murati về nhóm AI Superintelligence. Câu trả lời của Murati là một lời từ chối rõ ràng: <em>'Cho đến nay, chưa ai trong nhóm chấp nhận lời đề nghị đó.'</em></p><p>Tại Diễn đàn Kinh tế Thế giới 2025 ở Davos, Murati từng nói: <em>\"AI không có giá trị là trí tuệ không có lương tâm.\"</em> Cô hiện đang tư vấn cho Ủy ban Châu Âu về các chính sách AI - một vai trò hiếm có đối với người sáng lập startup.</p><figure class=\"expNoEdit\"><img alt=\"Mira Murati tại một buổi chia sẻ về trí tuệ nhân tạo - nơi cô không chỉ lan tỏa lý tưởng công nghệ nhân văn. (Nguồn: Getty Images)\" height=\"440\" data-id=\"2634995\" data-detail=\"1\" data-width=\"660\" data-height=\"440\" data-src=\"https://cdn-i.vtcnews.vn/resize/th/upload/2025/08/01/456-14373499.jpeg\" class=\" lazy\" data-index=\"2\"><figcaption><p class=\"expEdit\">Mira Murati tại một buổi chia sẻ về trí tuệ nhân tạo - nơi cô không chỉ lan tỏa lý tưởng công nghệ nhân văn. (Nguồn: Getty Images)</p></figcaption></figure><p>Dù chưa có số liệu chính thức, tài sản cá nhân của Mira Murati được ước tính nằm trong khoảng 5-10 triệu USD. Tuy nhiên, giá trị thực của cô nằm ở tầm ảnh hưởng với cộng đồng AI và những quyết định mang tính biểu tượng.</p><p>Mira Murati không chỉ là người phụ nữ đã nói 'Không' với 1 tỷ USD - cô còn là đại diện cho một xu hướng mới trong ngành công nghệ: Đề cao đạo đức, minh bạch và sự tiếp cận rộng rãi của AI.</p></div></body></html></p>"
  ],
  "attachment": "{\"thumbnail\":\"https://cdn-i.vtcnews.vn/resize/DKBM1_6r5IaJAh1_on6DnA2/upload/2025/08/01/upscaleimage320250801-14381196.jpeg\"}",
  "link_shared": null,
  "link_shared_domain": null,
  "source_type": null,
  "created_date": "2025-08-04T04:34:37.000Z",
  "shard": "20250804",
  "source_category": null,
  "updated_at": "2025-08-25T03:05:41.279Z",
  "createdBy": "HighPriorityNewsDetailSourcesCrawlingLoader"
}


### Cần phải check ở staging


- Hiện tại luồng keyword no cookie -> Pass
ynm-cl-tr-keyword-post-no-cookie-service-staging

start call rnd
    context: "KeywordPostResolver"
[2025-08-27 07:16:49.061 +0000] INFO (cl-tr-keyword-post-crawler-service): end call rnd with result: [{"id":0,"detected_language":"vi"},{"id":1,"detected_language":"vi"},{"id":2,"detected_language":"vi"},{"id":3,"detected_language":"vi"},{"id":4,"detected_language":"vi"}]
    context: "KeywordPostResolver"



staging.cl.resolved_data -> cl.10.*.*.reply-post-detail
[2025-08-27 07:19:45.395 +0000] INFO (cl-tr-keyword-post-crawler-service): Key 'copyRealTime-postTopics-b396b343-1466-5935-a5c4-3da93f08f273' inserted successfully.
[2025-08-27 07:19:45.395 +0000] INFO (cl-tr-keyword-post-crawler-service): Key 'copyRealTime-postTopics-f8e2ef83-374b-51ce-90d4-58fa73b2c366' inserted successfully.
[2025-08-27 07:19:45.395 +0000] INFO (cl-tr-keyword-post-crawler-service): Key 'copyRealTime-postTopics-d8c21605-6a95-5346-8ca1-c459526c0e7a' inserted successfully.
[2025-08-27 07:19:45.395 +0000] INFO (cl-tr-keyword-post-crawler-service): Key 'copyRealTime-postTopics-980fb1ef-0cc0-50e2-90e4-f33301f8a177' inserted successfully.
[2025-08-27 07:19:45.396 +0000] INFO (cl-tr-keyword-post-crawler-service): staging.cl.resolved_data -> cl.10.posts


- Luồng hashtag có detect language hay không 
ynm-cl-tr-hashtag-post-no-cookie-service-staging 
start call rnd
    context: "HashtagPostResolver"
[2025-08-26 15:51:40.763 +0000] INFO (cl-tr-hashtag-post-crawler-service): end call rnd with result: [{"id":0,"detected_language":"en"},{"id":1,"detected_language":"en"},{"id":2,"detected_language":"vi"},{"id":3,"detected_language":"en"},{"id":4,"detected_language":"en"},{"id":5,"detected_language":"es"},{"id":6,"detected_language":"en"},{"id":7,"detected_language":"pt"},{"id":8,"detected_language":"vi"}]
    context: "HashtagPostResolver"


Hiện tại không thấy normalize + đẩy qua mentions


- Hiện tại luồng Reply Post chưa có detect language
-> Hiện tại đã work đúng yêu cầu

- Category link by openai (đổi routing key và exchange)
Hiện tại đã config đúng


- Check article urls  -> Pass
-> Hiện tại đã đẩy được vào article_urls

ynm-cl-news-article-url-crawler-service-staging
ynm-cl-news-crawling-loader-service-staging

Bật 2 deployments này lên để crawl

cl.news.article_urls_crawled_sources
cl.news.article_urls_crawling_requests
cl.news.article_urls_crawling_sources
cl.news.article_url

(cl.news.article_urls_crawled_sources|cl.news.article_urls_crawling_requests|cl.news.article_urls_crawling_sources|cl.news.article_urls)
  {
        "id":"c0be3bdd-0069-5c4d-abd4-7b45346bcff0",
        "id_category":"144387",
        "id_source":"tonynguyen19.wordpress.com",
        "platform":4,
        "link":"https://tonynguyen19.wordpress.com/category/gi%e1%ba%a3i-phap/cloud-computing/",
        "title":"Cloud Computing",
        "views_avg":0,
        "priority":99,
        "status":1,
        "failed_type":1,
        "count_failed":0,
        "crawled_date":"1970-01-01T00:00:00Z",
        "_version_":1841595391214092291,
        "next_crawl_time":"2025-08-27T08:10:25.813Z",
        "created_date":"2025-08-27T08:10:25.813Z"
  }
Hiện tại đã push vào artcle URL




- Crisis keyword -> Pass
Chỗ này chỉ cần chạy luồng crawl sau đó đẩy xuống article_urls là được\
ynm-cl-news-crisis-keyword-service-staging

-> Hiện tại luồng này đã push đúng xuống article urls



cl.news.crisis_keyword.crawling_sources
cl.news.crisis_keyword.crawling_sources_next_pages
cl.news.crisis_keyword.crawling_requests
cl.news.crisis_keyword.crawled_sources
cl.news.updated_crisis_keywords
cl.news.article_urls
cl.news.inserted_monitor_sources


Hiện tại đã push xuống article_urls và pusher đã pushs đúng

{
        "id":"7ab9e8bb-dacb-53dd-8ca3-e920536ff113",
        "id_category":"0",
        "id_source":"giaoducthoidai.vn",
        "link":"https://giaoducthoidai.vn/chi-tiet-diem-chuan-cac-phuong-thuc-xet-tuyen-cua-truong-dh-thuong-mai-post745233.html",
        "title":"Chi tiết điểm chuẩn các phương thức xét tuyển của Trường ĐH ...",
        "views_avg":0,
        "priority":1,
        "status":1,
        "failed_type":1,
        "count_failed":0,
        "crawled_date":"1970-01-01T00:00:00Z",
        "platform":3,
        "_version_":1841596134768771072,
        "next_crawl_time":"2025-08-27T08:22:14.922Z",
        "created_date":"2025-08-27T08:22:14.922Z"}


- Article_posts -> Pass
Miễn là message ở queue article_post được cl.pusher đẩy đi là đc 
  {
        "id":"debff0f5-7e5d-53c4-be79-20bcfa36033c",
        "id_category":"0",
        "title":"10 Địa chỉ Nha khoa Uy tín trên 15 năm hoạt động tại TPHCM",
        "id_source":"bookingcare.vn",
        "platform":3,
        "link":"https://bookingcare.vn/cam-nang/10-dia-chi-nha-khoa-uy-tin-tren-15-nam-hoat-dong-tai-tphcm-p2963.html",
        "published_date":1668963600,
        "last_have_data_date":1754988456,
        "updated_date":0,
        "_version_":1841596758591799296,
        "curr_page":1,
        "reach_updated_date":"1970-01-01T00:00:00Z",
        "state_reach":2,
        "state":2,
        "status":1}

Message mẫu: 

{
  "id": "debff0f5-7e5d-53c4-be79-20bcfa36033c",
  "id_category": "0",
  "title": "10 Địa chỉ Nha khoa Uy tín trên 15 năm hoạt động tại TPHCM",
  "id_source": "bookingcare.vn",
  "platform": 3,
  "link": "https://bookingcare.vn/cam-nang/10-dia-chi-nha-khoa-uy-tin-tren-15-nam-hoat-dong-tai-tphcm-p2963.html",
  "published_date": 1668963600,
  "last_have_data_date": 1754988456,
  "updated_date": 0
}


Hiện tại message đã được đẩy xuống article_posts ở Solr

- Review
ERROR (cl-data-pusher-service): Processing data into solr has been occurred error: 'Error: Request HTTP error 400: {
  "responseHeader":{
    "rf":1,
    "status":400,
    "QTime":0},
  "error":{
    "metadata":[
      "error-class","org.apache.solr.common.SolrException",
      "root-error-class","org.apache.solr.common.SolrException"],
    "msg":"[doc=e54cb3fe-db54-56fd-b140-c2d4ecec7a98] missing required field: title",
    "code":400}}
' and retry after 5000ms


Hiện tại đã push xuông mention


- Monitor source
Hiện tại chỉ cần check consume message từ queue này là done 
Luồng này đang crawl từ luông keyword crisis cũ

ynm-cl-news-crisis-keyword-service-testing
Xóa record có priority 10 trong monitor_source

cl.news.monitor_sources


- Category link
-> Liên quan tới Open AI -> Không cần check

- Parse detail

1. auto-parser-staging-high-priority-classifier
2. auto-parser-staging-high-priority-browser-crawler
3. auto-parser-staging-high-priority-http-crawler
4. auto-parser-staging-article-parser   (Đợi pod scale lên)
5. auto-parser-staging-error-article-handler
6. ynm-cl-news-parsed-details-2-mentions-service-staging

-> Hiện tại luồng parse detail đã push vào mention và pus

default` rabbit consumed message: {"list":[{"result":{"data":{"content":"<p class='ap-description'><b>Ngày 21/08/2025, VinFast công bố hai quyết sách bước ngoặt: mở rộng chính sách chuyển đổi xanh đặc biệt tới 34/34 tỉnh thành; đồng thời triển khai 150.000 trạm đổi pin xe máy điện và ra mắt các dòng xe máy điện đổi pin trên quy mô toàn quốc.</b></p><p class='ap-content'><html><head></head><body><div><figure><div class=\"text-center\"><img src=\"https://media.thitruonghanghoa.com/2025/08/1/ava-3-1755826268256517568270-1755832131500-1755832131743473014044.png\" alt=\"Nóng: VinFast lần đầu công bố mô hình xe máy điện đổi pin, sẽ lắp 150.000 trạm trên cả nước - Ảnh 1\" class=\" lazyloaded\" data-src=\"https://media.thitruonghanghoa.com/2025/08/1/ava-3-1755826268256517568270-1755832131500-1755832131743473014044.png\"></div></figure><p>Theo thông tin từ VinFast, <b>đối với ô tô,</b> chính sách đang áp dụng tại Hà Nội, TP.HCM và An Giang sẽ được VinFast chính thức áp dụng mở rộng tới tất cả các địa phương trên cả nước. Ngoài mức ưu đãi 4% giá niêm yết, khách hàng sẽ được hỗ trợ 3% lãi suất/năm nếu vay mua ô tô trả góp phục vụ nhu cầu cá nhân, và hỗ trợ 4% lãi suất/năm nếu vay mua ô tô để vận doanh trên nền tảng Xanh SM Platform, thời gian hỗ trợ kéo dài trong 3 năm.</p><p><span><span><span><b>Đối với xe máy điện,</b> khách hàng sẽ được tặng ngay 10% giá xe. Nếu mua xe phục vụ nhu cầu cá nhân, khách hàng sẽ được hỗ trợ để có thể vay trả góp lên tới 80% giá xe và chỉ cần trả 10% đối ứng ban đầu để có thể nhận xe về sử dụng. Nếu mua xe để vận doanh trên nền tảng Xanh SM Platform, khách hàng sẽ được hỗ trợ vay trả góp lên tới 90% giá xe, có thể nhận xe ngay với 0 đồng vốn đối ứng, đồng thời được GSM cam kết mức chia sẻ doanh thu cố định 90% trong vòng 3 năm. Ngoài ra, khách hàng sẽ được hỗ trợ 100% lệ phí trước bạ khi mua xe máy điện VinFast từ ngày 21/08/2025 đến hết ngày 31/12/2025.</span></span></span></p><p><span><span><span>Ngoài các ưu đãi khi mua xe, người dùng ô tô và xe máy điện VinFast sẽ được miễn phí sạc pin, tương ứng đến hết ngày 30/06/2027 (ô tô) và 31/05/2027 (xe máy) tại tất cả các trạm sạc công cộng V-Green.</span></span></span></p><p><span><span><span><b>Lần đầu tiên triển khai hệ thống đổi pin</b></span></span></span></p><p><span><span><span>Đáng chú ý, VinFast cho biết sẽ triển khai<b>hệ thống đổi pin dày đặc lên tới 150.000 trạm</b>tại tất cả các địa phương; đồng thời<b>ra mắt phiên bản xe đổi pin của các dòng xe máy điện hiện tại.<br></b></span></span></span></p><figure><div><b class=\"text-center\"><img alt=\"Nóng: VinFast lần đầu công bố mô hình xe máy điện đổi pin, sẽ lắp 150.000 trạm trên cả nước - Ảnh 2\" class=\"lazyload\" data-src=\"https://media.thitruonghanghoa.com/2025/08/1/a3-1755825549959-17558255500721648562878-1755832132566-17558321328601478436677.jpg\"></b></div></figure><p><span><span><span>Theo đó, ngay trong tháng 10/2025, VinFast sẽ lắp đặt 1.000 trạm đổi pin đầu tiên, tiến tới đạt 50.000 trạm đổi pin vào cuối năm nay và hoàn tất toàn bộ hệ thống trong vòng 3 năm tới. Theo VinFast, quy hoạch mạng lưới trạm đổi pin của công ty lớn gấp nhiều lần so với hệ thống trạm xăng.</span></span></span></p><figure><div class=\"text-center\"><img alt=\"Nóng: VinFast lần đầu công bố mô hình xe máy điện đổi pin, sẽ lắp 150.000 trạm trên cả nước - Ảnh 3\" class=\"lazyload\" data-src=\"https://media.thitruonghanghoa.com/2025/08/1//nong-vinfast-lan-dau-cong-bo-mo-hinh-xe-may-dien-doi-pin-se-lap-150000-tram-tren-ca-nuoc-3.jpg\"></div></figure><p>Các dòng xe máy điện đổi pin được VinFast thiết kế và trang bị tính năng tương tự xe bán kèm pin, khác biệt duy nhất nằm ở khoang chứa pin được thiết kế hai ngăn, hỗ trợ hai pin có thể tháo lắp và thay thế dễ dàng tại các trạm đổi pin công cộng, với dung lượng 1,5 kWh/pin. Tùy vào nhu cầu sử dụng, khách hàng có thể thuê một hoặc hai pin để sử dụng, với mức phí thuê pin hàng tháng là 200.000 đồng/pin, phí đổi pin là 9.000 đồng/lần (đã bao gồm tiền sạc điện), đi được quãng đường tối đa 85 km/pin/lần sạc (điều kiện tiêu chuẩn), tương ứng với chi phí năng lượng cực rẻ so với chi phí mua xăng cho cùng quãng đường.</p><p>Dự kiến, dòng xe đầu tiên được bổ sung phiên bản đổi pin là Evo với tên gọi Evo Max, sẽ chính thức ra mắt vào tháng 10/2025 với mức giá 20 triệu đồng. Sau đó, VinFast sẽ lần lượt ra mắt thêm ba dòng xe đổi pin khác ngay trong năm nay, bao gồm Feliz Max (24,9 triệu đồng), Verox Max (33,9 triệu đồng), Drift Max (39,9 triệu đồng), đáp ứng nhu cầu đa dạng của đông đảo khách hàng.</p><p>Song song với phiên bản đổi pin, VinFast vẫn tiếp tục duy trì phiên bản kèm pin cho những khách hàng muốn sở hữu xe trọn gói và tự sạc tại nhà. Khách hàng cũng có thể mua xe thuê pin và tự sạc tại nhà, tùy theo nhu cầu sử dụng.</p><figure><div class=\"text-center\"><img alt=\"Nóng: VinFast lần đầu công bố mô hình xe máy điện đổi pin, sẽ lắp 150.000 trạm trên cả nước - Ảnh 4\" class=\"lazyload\" data-src=\"https://media.thitruonghanghoa.com/2025/08/1/a4-1755825550838-1755825550925704176632-1755832133903-17558321341831140701.jpg\"></div></figure></div></body></html></p><p class='ap-tags'>Tags: <a href='https://www.thitruonghanghoa.com/vinfast' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Vinfast</a></p>","publishedDate":1755831720,"thumbnail":"","id_social":null,"title":"Nóng: VinFast lần đầu công bố mô hình xe máy điện đổi pin, sẽ lắp 150.000 trạm trên cả nước","published_date":1755831720},"errors":[],"parse_type":1,"isFailedLimitTimeCrawling":false,"isFailedContent":false,"status":true,"referenceLinks":[],"imageLinks":["https://media.thitruonghanghoa.com/2025/08/1/ava-3-1755826268256517568270-1755832131500-1755832131743473014044.png",null,null,null],"rawHtml":["Toggle Navigation","Thị trường hàng hóa","* Nông sản","* Cao su - RUBBER","* Đường - SUGAR","* Bắp ngô - CORN","* Đậu nành - SOYBEANS","* Bột đậu nành - SOYBEAN MEAL","* Dầu đậu nành - SOYBEAN OIL","* Dầu cọ - PALM OIL","* Cacao - COCOA","* Cà phê Arabica","* Gạo - RICE","* Dừa khô - COPRA","* Lúa mì - WHEAT","* Kim loại","* Vàng - GOLD","* Bạc - SILVER","* Đồng - COPPER","* Chì - LEAD","* Nhôm - ALUMINUM","* Nickel - NICKEL","* Bạch kim - PLATINUM","* Kẽm - ZINC","* Thiếc - TIN","* Quặng sắt 62% Fe - IRON ORE","* Năng lượng","* Dầu thô Brent - BRENT CRUDE","* Dầu thô WTI - DUBAI CRUDE OIL","* Khí tự nhiên US - NATURAL GAS US","* Than đá - COAL","* Thực phẩm","* Thịt heo - LEAN HOGS","* Thịt bò - BEEF","* Thịt gà - CHICKEN","* Tin thị trường","* Chứng khoán","* Tài chính","* Bất động sản","* Doanh nghiệp","* Doanh nhân","* Tin tổng hợp","/ Tin tức thị trường Kim loại / Nóng: VinFast lần đầu công bố mô hình xe máy điện đổi pin, sẽ lắp 150.000 trạm trên cả nước","Nóng: VinFast lần đầu công bố mô hình xe máy điện đổi pin, sẽ lắp 150.000 trạm trên cả nước","22/08/2025 10:02","Ngày 21/08/2025, VinFast công bố hai quyết sách bước ngoặt: mở rộng chính sách chuyển đổi xanh đặc biệt tới 34/34 tỉnh thành; đồng thời triển khai 150.000 trạm đổi pin xe máy điện và ra mắt các dòng xe máy điện đổi pin trên quy mô toàn quốc.","* Tweet","Theo thông tin từ VinFast, đối với ô tô, chính sách đang áp dụng tại Hà Nội, TP.HCM và An Giang sẽ được VinFast chính thức áp dụng mở rộng tới tất cả các địa phương trên cả nước. Ngoài mức ưu đãi 4% giá niêm yết, khách hàng sẽ được hỗ trợ 3% lãi suất/năm nếu vay mua ô tô trả góp phục vụ nhu cầu cá nhân, và hỗ trợ 4% lãi suất/năm nếu vay mua ô tô để vận doanh trên nền tảng Xanh SM Platform, thời gian hỗ trợ kéo dài trong 3 năm.","Đối với xe máy điện, khách hàng sẽ được tặng ngay 10% giá xe. Nếu mua xe phục vụ nhu cầu cá nhân, khách hàng sẽ được hỗ trợ để có thể vay trả góp lên tới 80% giá xe và chỉ cần trả 10% đối ứng ban đầu để có thể nhận xe về sử dụng. Nếu mua xe để vận doanh trên nền tảng Xanh SM Platform, khách hàng sẽ được hỗ trợ vay trả góp lên tới 90% giá xe, có thể nhận xe ngay với 0 đồng vốn đối ứng, đồng thời được GSM cam kết mức chia sẻ doanh thu cố định 90% trong vòng 3 năm. Ngoài ra, khách hàng sẽ được hỗ trợ 100% lệ phí trước bạ khi mua xe máy điện VinFast từ ngày 21/08/2025 đến hết ngày 31/12/2025.","Ngoài các ưu đãi khi mua xe, người dùng ô tô và xe máy điện VinFast sẽ được miễn phí sạc pin, tương ứng đến hết ngày 30/06/2027 (ô tô) và 31/05/2027 (xe máy) tại tất cả các trạm sạc công cộng V-Green.","Lần đầu tiên triển khai hệ thống đổi pin","Đáng chú ý, VinFast cho biết sẽ triển khaihệ thống đổi pin dày đặc lên tới 150.000 trạmtại tất cả các địa phương; đồng thờira mắt phiên bản xe đổi pin của các dòng xe máy điện hiện tại.","Theo đó, ngay trong tháng 10/2025, VinFast sẽ lắp đặt 1.000 trạm đổi pin đầu tiên, tiến tới đạt 50.000 trạm đổi pin vào cuối năm nay và hoàn tất toàn bộ hệ thống trong vòng 3 năm tới. Theo VinFast, quy hoạch mạng lưới trạm đổi pin của công ty lớn gấp nhiều lần so với hệ thống trạm xăng.","Các dòng xe máy điện đổi pin được VinFast thiết kế và trang bị tính năng tương tự xe bán kèm pin, khác biệt duy nhất nằm ở khoang chứa pin được thiết kế hai ngăn, hỗ trợ hai pin có thể tháo lắp và thay thế dễ dàng tại các trạm đổi pin công cộng, với dung lượng 1,5 kWh/pin. Tùy vào nhu cầu sử dụng, khách hàng có thể thuê một hoặc hai pin để sử dụng, với mức phí thuê pin hàng tháng là 200.000 đồng/pin, phí đổi pin là 9.000 đồng/lần (đã bao gồm tiền sạc điện), đi được quãng đường tối đa 85 km/pin/lần sạc (điều kiện tiêu chuẩn), tương ứng với chi phí năng lượng cực rẻ so với chi phí mua xăng cho cùng quãng đường.","Dự kiến, dòng xe đầu tiên được bổ sung phiên bản đổi pin là Evo với tên gọi Evo Max, sẽ chính thức ra mắt vào tháng 10/2025 với mức giá 20 triệu đồng. Sau đó, VinFast sẽ lần lượt ra mắt thêm ba dòng xe đổi pin khác ngay trong năm nay, bao gồm Feliz Max (24,9 triệu đồng), Verox Max (33,9 triệu đồng), Drift Max (39,9 triệu đồng), đáp ứng nhu cầu đa dạng của đông đảo khách hàng.","Song song với phiên bản đổi pin, VinFast vẫn tiếp tục duy trì phiên bản kèm pin cho những khách hàng muốn sở hữu xe trọn gói và tự sạc tại nhà. Khách hàng cũng có thể mua xe thuê pin và tự sạc tại nhà, tùy theo nhu cầu sử dụng.","* Từ khóa:","* Vinfast","Nguồn: CafeF - Xem link gốc","Xem thêm","* Động thái đầu tiên của VinFast trong chiến lược đổi pin xe máy điện: Bắt tay với FPT Shop, cho phép đổi pin tại tất cả cửa hàng trên toàn quốc","* Tỷ phú Phạm Nhật Vượng lần đầu đưa xe buýt điện VinFast ra thị trường quốc tế","* VinFast Klara S2 và Yamaha Neo's: Xe máy điện nào 'ghi điểm' hơn với phái đẹp?","* Quy định mới về sạc xe điện VinFast: Chỉ được đỗ 10 phút miễn phí sau khi sạc đầy, phút 11 trở đi phải trả tiền","* Dùng nam châm dò khắp thân VinFast VF 9, vỏ xe dùng chất liệu gì mà không hút?","* Xe VinFast VF 9 limousine chi chít vết đạn bắn, tổng hơn 400 phát: Hé lộ về đơn vị nâng cấp chống đạn","* VinFast bán được bao nhiêu xe tại bang đông dân nhất nước Mỹ trong nửa đầu năm?","Tin mới","Từ ngày mai, gần 336 triệu cổ phiếu chứng khoán sẽ thoát diện cảnh báo","10 giờ trước","Nguyên nhân do kết luận soát xét tại báo cáo tài chính soát xét bán niên năm 2025 của Chứng khoán Tiên Phong là chấp nhận toàn phần.","Nhức nhối nạn lừa đảo từ 'tài khoản ngân hàng ma'","10 giờ trước","Nhiều \"tài khoản ngân hàng ma\" vẫn hoạt động, thậm chí có sự tiếp tay của nhân viên ngân hàng lừa đảo, rửa tiền, chuyển tiền phi pháp lách luật, gây thiệt hại nghiêm trọng cho người dân và hệ thống tài chính quốc gia.","Mưa gió ngập nhiều nơi ở Hà Nội: Đi xem nhà lúc này mới là chuẩn nhất, đừng chỉ đi xem vào ngày đẹp trời","10 giờ trước","Mưa lớn những ngày qua khiến nhiều tuyến phố Hà Nội chìm trong biển nước, nhưng với người mua nhà, đây lại là 'phép thử' chân thực nhất để nhận diện đâu là khu vực ngập nặng cần tránh và đâu mới là bất động sản đáng để xuống tiền.","Giá sầu riêng tăng nóng, vì sao nông dân vẫn than khó xuất khẩu?","9 giờ trước","Sầu riêng xuất khẩu vừa tăng giá đến 10.000 đồng/kg so với tuần trước nhưng nhiều nhà vườn vẫn lên mạng rao bán từng quả sầu riêng lẻ","TP HCM: Khẩn trương rà soát trật tự số nhà, tên đường","9 giờ trước","Sở Xây dựng đề nghị các xã, phường giáp ranh cùng phối hợp thực hiện theo nguyên tắc bảo đảm tính ổn định của trật tự số nhà hiện hữu.","Bảng giá cập nhật trực tuyến","Vàng","GOLD","107.278.713 VNĐ / lượng","3,382.60 USD / toz","0.33 % - 11.10","Bạc","SILVER","1.217.185 VNĐ / lượng","38.38 USD / toz 0.60 %","- 0.23","Đồng","COPPER","260.533.758 VNĐ / tấn","449.25 UScents / lb","0.89 % - 4.05","Bạch kim","PLATINUM","42.464.623 VNĐ / lượng","1,338.95 USD / toz","0.77 % - 10.45","Nickel","NICKEL","399.628.645 VNĐ / tấn","15,192.00 USD / mt","0.58 % - 88.00","Chì","LEAD","52.326.310 VNĐ / tấn","1,989.20 USD / mt","0.01 % - 0.30","Nhôm","ALUMINUM","68.859.130 VNĐ / tấn","2,617.70 USD / mt","0.78 % - 20.50","' Xem tất cả giá Kim loại","Tin cùng chuyên mục","Herbalife Việt Nam 4 năm liền đồng hành VnExpress Marathon Nha Trang","9 giờ trước","Sự hiện diện của Herbalife tại VnExpress Marathon Nha Trang 2025 không chỉ ở vai trò tài trợ, mà đã trở thành người bạn đồng hành tin cậy của runner, mang đến sự hỗ trợ cả thể chất lẫn tinh thần.","Doanh nghiệp Việt củng cố nội lực trước thềm kỷ nguyên vươn mình","9 giờ trước","Việt Nam đang bước vào giai đoạn bản lề để bứt phá về kinh tế và vị thế quốc gia. Đồng hành cùng đất nước, ROX Group triển khai chiến lược quản trị hiện đại, đẩy mạnh chuyển đổi số và củng cố năng lực quản trị rủi ro tạo đà tăng trưởng bền vững trong kỷ nguyên số.","Tài sản của tỷ phú Phạm Nhật Vượng vượt đỉnh lịch sử","2 giờ trước","Tỷ phú Phạm Nhật Vượng hiện đứng ở vị trí 196 trong bảng xếp hạng những người giàu nhất thế giới của Forbes với khối tài sản 13,6 tỷ USD.","Sau SpaceX, Amazon cũng muốn đầu tư dịch vụ Internet vệ tinh tầm thấp tại Việt Nam","3 giờ trước","Đại diện Amazon khẳng định Việt Nam là thị trường chiến lược, đồng thời giới thiệu kế hoạch triển khai chòm sao hơn 3.200 vệ tinh, cung cấp Internet tốc độ cao tới 400 Mbps cho cá nhân và 1 Gbps cho doanh nghiệp, với độ trễ thấp, hướng tới phục vụ các vùng sâu, vùng xa, hải đảo."]},"url_info":{"id":"fa90d0c8-73cd-5c74-9210-d3045872e8d8","id_category":"0","title":"Nóng: VinFast lần đầu công bố mô hình xe máy điện đổi pin, sẽ lắp 150.000 trạm trên cả nước","id_source":"thitruonghanghoa.com","platform":3,"link":"https://thitruonghanghoa.com/tin-tuc/nong-vinfast-lan-dau-cong-bo-mo-hinh-xe-may-dien-doi-pin-se-lap-150000-tram-tren-ca-nuoc-277109.html","created_date":"2025-08-27T08:31:41.424Z","count_failed":0,"status":1,"views_avg":0,"next_crawl_time":"2025-08-27T08:31:41.424Z","priority":1,"hash_link":"5fe03657-a57c-5e16-8daa-14be21dc8892","is_auto_parser":true,"meta":{"status":200,"responseHeaders":{"cache-control":"no-cache, private","content-encoding":"gzip","content-type":"text/html; charset=UTF-8","date":"Wed, 27 Aug 2025 08:40:19 GMT","server":"nginx/1.24.0 (Ubuntu)","set-cookie":"XSRF-TOKEN=eyJpdiI6Ik1WM2NqclJLZFBEQXJLZy9PU3Fld1E9PSIsInZhbHVlIjoiaDhHT1MxUjN6NWROQjNJVVhtNzVkZXZRSHVkcU9hSld1ekltUmViUmRBdXhtcFI3NTcrWFNJRUxDTy9ucWg0L2xIdE5ma2VlV09DRXhRSkhoUDBoZHZwLy9ibFFXZE02Y29sSjBucmVsNFFEOGNXWWFWVG4wU2g2cUV0Uk5aMzgiLCJtYWMiOiI1MTdlOTFmZTg1MDg4NTVlM2RlYTgyMjRlZGRlYzE1ZDJjNGJhZGNmNGJkNjgzYTU1NTJmZWIyN2FjY2VjNTdkIiwidGFnIjoiIn0%3D; expires=Wed, 27 Aug 2025 10:40:19 GMT; Max-Age=7200; path=/\nlaravel_session=eyJpdiI6IktId2VTbENZeExNU0pHbFVhT01jMVE9PSIsInZhbHVlIjoiM1luVmpVbk9EemFzUkw3cnVaMTZ0cDU3a3lFRnlucjFDc1JXWCsySDhJdFMxdVVnMlZWeVZqa2dKZElJNU4vOWxZL0ZOZlh2cDNJWUZrY1RMTXhyUDNyTUlNWS84YXBZaEJMVmxZN1pMKys2MzhvNGVXWUVOb2J6NzY5anloUEMiLCJtYWMiOiIyMTllNTYyMTAwNzJhNzViODliNDI5MTI3ZGVlZmU4NWY5ZDUyZTA1NjI5ZDcyY2Y4MjY0MTQzZDI4NTZjMGQ5IiwidGFnIjoiIn0%3D; expires=Wed, 27 Aug 2025 10:40:19 GMT; Max-Age=7200; path=/; httponly"},"browserId":"V0NI5hzgTwKOhqCSyeXCk"},"crawled_date":"2025-08-27T08:40:22.942Z"}}],"outputRoutingKey":"ynm_v1.solr.master.parse_detail_input","time":1756284022942}
    context: "RabbitService"
[2025-08-27 08:40:23.095 +0000] INFO (cl-news-parsed-details-2-mentions-service): staging.cl.resolved_data -> cl.3.1.mentions
    context: "ParsedDetails2MentionsResolverDataProducer"
[2025-08-27 08:40:23.096 +0000] INFO (cl-news-parsed-details-2-mentions-service): staging.cl.resolved_data -> cl.3.posts
    context: "ParsedDetails2MentionsResolverPostProducer"





 {
        "id":"9e34dbfa-acf2-5e30-88d3-7936c6af205f",
        "link":"http://banxehoi.com/mua-ban-xe-shacman",
        "id_source":"banxehoi.com",
        "views":0,
        "likes":0,
        "comments":0,
        "shares":0,
        "engagement_total":0,
        "engagement_s_c":0,
        "mention_type":1,
        "title":"Mua bán xe ô tô Shacman cũ",
        "attachment":"{\"thumbnail\":\"https://img1.oto.com.vn/Static/Images/Thumbnail-mua-ban-xe-1200x630.png\"}",
        "is_to_topic":false,
        "search_text":["Mua bán xe ô tô Shacman cũ",
          "<p class='ap-description'><b>Mua bán xe Shacman cũ uy tín tại Việt Nam. Tại Oto.com.vn có nhiều lựa chọn mua Shacman với giá hợp lý cùng nhiều ưu đãi, xe ô tô chính chủ, thông tin đáng tin cậy.</b></p><p class='ap-content'><html><head></head><body><div class=\"desc\"><p>Hyundai Long An - Used car cung cấp đa dạng các mẫu xe hơi đã qua sử dụng, đặc biệt là những mẫu xe đang được ưa chuộng tại thị trường hiện nay như Mitsubishi Xpander, Toyota Innova, Mazda 2, Hyundai Grand i10, Hyundai Accent, Kia Cerato,...</p></div></body></html></p><p class='ap-tags'>Tags: <a href='https://oto.com.vn/mua-ban-xe' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ô tô cũ</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Giá xe ô tô</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-218i-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW 218i</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-320i-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW 320i</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-330i-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW 330i</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-420i-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW 420i</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-430i-convertible-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW 430i Convertible</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-520i-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW 520i</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-530i-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW 530i</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-730li-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW 730Li</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-735i-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW 735i</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-740i-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW 740i</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-740li-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW 740Li</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-x1-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW X1</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-x3-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW X3</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-x4-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW X4</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-x5-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW X5</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-x6-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW X6</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-x7-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW X7</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-xm-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW XM</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-bmw-z4-sdrive30i-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BMW Z4 sDrive30i</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-byd-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BYD</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-byd-atto-2-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BYD Atto 2</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-byd-atto-3-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BYD Atto 3</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-byd-dolphin-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BYD Dolphin</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-byd-han-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BYD Han</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-byd-m6-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BYD M6</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-byd-seal-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BYD Seal</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-byd-sealion-6-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BYD Sealion 6</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-byd-sealion-8-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>BYD Sealion 8</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-escape-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford Escape</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-everest-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford Everest</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-evos-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford Evos</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-explorer-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford Explorer</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-f-150-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford F-150</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-fiesta-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford Fiesta</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-mustang-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford Mustang</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-ranger-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford Ranger</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-ranger-raptor-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford Ranger Raptor</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-territory-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford Territory</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-tourneo-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford Tourneo</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-ford-transit-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Ford Transit</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-honda-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Honda</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-honda-accord-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Honda Accord</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-honda-brio-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Honda Brio</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-honda-br-v-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Honda BR-V</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-honda-city-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Honda City</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-honda-civic-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Honda Civic</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-honda-civic-type-r-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Honda Civic Type R</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-honda-cr-v-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Honda CR-V</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-honda-hr-v-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Honda HR-V</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-accent-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai Accent</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-creta-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai Creta</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-custin-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai Custin</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-elantra-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai Elantra</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-grand-i10-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai Grand i10</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-loniq-5-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai Ioniq 5</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-palisade-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai Palisade</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-santa-fe-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai SantaFe</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-solati-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai Solati</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-stargazer-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai Stargazer</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-tucson-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai Tucson</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-hyundai-venue-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Hyundai Venue</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-isuzu-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Isuzu</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-isuzu-d-max-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Isuzu D-Max</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-isuzu-mu-x-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Isuzu mu-X</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-isuzu-qkr-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Isuzu QKR</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-carens-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA Carens</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-carnival-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA Carnival</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-ev6-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA EV6</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-k3-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA K3</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-k5-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA K5</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-morning-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA Morning</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-rondo-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA Rondo</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-seltos-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA Seltos</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-soluto-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA Soluto</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-sonet-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA Sonet</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-sorento-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA Sorento</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-sportage-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA Sportage</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-kia-telluride-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>KIA Telluride</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-es-250-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus ES 250</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-es-300h-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus ES 300h</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-gx-460-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus GX 460</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-gx-550-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus GX 550</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-is-300-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus IS 300</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-lm-350-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus LM 350</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-lm-500h-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus LM 500h</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-ls-500-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus LS 500</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-570-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus LX 570</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-lx-600-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus LX 600</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-nx-300-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus NX 300</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-nx-350-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus NX 350</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-rc-300-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus RC 300</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-rx-300-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus RX 300</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-rx-350-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus RX 350</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-lexus-rx-500h-f-sport-performance-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Lexus RX 500h F Sport Performance</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mazda-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mazda</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mazda-2-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mazda 2</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mazda-3-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mazda 3</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mazda-6-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mazda 6</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mazda-bt-50-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mazda BT50</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mazda-cx-3-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mazda CX-3</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mazda-cx-30-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mazda CX-30</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mazda-cx-5-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mazda CX5</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mazda-cx-8-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mazda CX-8</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-amg-c43-4matic-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-AMG C 43 4Matic</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-amg-c63-s-e-performance-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-AMG C 63 S E Performance</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-amg-g-63-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-AMG G 63</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-amg-glb-35-4-matic-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-AMG GLB 35 4MATIC</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-amg-gle-53-4matic-coupe-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-AMG GLE 53 4MATIC + Coupé</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-amg-sl43-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-AMG SL 43</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-amg-sl63-se-performance-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-AMG SL 63 S E Performance</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-c-200-avantgarde-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz C 200 Avantgarde</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-c300-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz C 300 AMG</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-e180-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz E 180</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-e200-exclusive-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz E 200 Exclusive</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-e300-amg-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz E 300 AMG</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-eqb-250-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz EQB 250</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-eqe-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz EQE 500 4Matic</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-eqs-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz EQS</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-ben-eqs-500-4matic-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz EQS 500 4Matic</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-glb-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz GLB 200 AMG</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-glc-200-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz GLC 200</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-glc-200-4matic-moi-nhat' target='_blank' class='badge badge-secondary p-1 text-sm-left'>Mercedes-Benz GLC 200 4Matic</a>,<a href='https://oto.com.vn/bang-gia-xe-o-to-mercedes-benz-glc-250-moi-nhat' target='_blank' class='badge badge"],
        "domain":"banxehoi.com",
        "mention_type_details":1,
        "platform":6,
        "updated_at":"2025-08-27T08:41:15.951Z",
        "created_date":"2025-08-27T08:40:20Z"}