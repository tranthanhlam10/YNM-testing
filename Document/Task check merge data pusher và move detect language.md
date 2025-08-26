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
