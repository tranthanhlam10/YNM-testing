# Task news crisis
## Vấn đề


- Luồng News Crisis Keyword Crawler đã gặp phải một vấn đề, đó là bị Google yêu cầu phải có cookie truyền vào header trước khi call Http request thì mới crawl được html.

- Vấn đề trên đã làm cho luồng News Crisis Keyword Crawler bị stuck và dẫn đến tình trạng nhiều bài crisis ở platform News không có trong hệ thống.

- Mặc dù đã tìm ra giải pháp để xử lý vấn đề trên trong thời gian ngắn, nhưng cần phải tìm một giải pháp dự phòng nhằm đảm bảo các bài crisis ở platform News không bị miss đối với các trường hợp tương tự như trên.


## Mục tiêu
- Giảm thiểu số lượng bài crisis ở platform News bị miss đối với các trường hợp không mong muốn từ phía Google tác động đến luồng News Crisis Keyword Crawler bị stuck.

## Giải pháp

- Sử dụng service Programmable Search Engine của Google, đây là service do Google tạo ra nhằm hỗ trợ search các bài viết theo keyword bằng Google Token.

- Service này đã được Google viết documentation rất chi tiết về cách sử dụng, nên trong trường hợp Google có bất cứ thay đổi gì thì ta có thể nhanh chóng vào documentation để điều chỉnh nhanh chóng. Thêm vào đó, đây là service do Google tạo ra nên khả năng bị block sẽ thấp so với cách hiện tại mà luồng News Crisis Keyword Crawler đang thực hiện.


## API

https://www.googleapis.com/customsearch/v1?q={searchTerms}&num={count?}&start={startIndex?}&lr={language?}&safe={safe?}&cx={cx?}&sort={sort?}&filter={filter?}&gl={gl?}&cr={cr?}&googlehost={googleHost?}&c2coff={disableCnTwTranslation?}&hq={hq?}&hl={hl?}&siteSearch={siteSearch?}&siteSearchFilter={siteSearchFilter?}&exactTerms={exactTerms?}&excludeTerms={excludeTerms?}&linkSite={linkSite?}&orTerms={orTerms?}&dateRestrict={dateRestrict?}&lowRange={lowRange?}&highRange={highRange?}&searchType={searchType}&fileType={fileType?}&rights={rights?}&imgSize={imgSize?}&imgType={imgType?}&imgColorType={imgColorType?}&imgDominantColor={imgDominantColor?}&alt=json


## Các queue

cl.news.article_urls_from_crisis_keyword_by_api_crawling_sources

cl.news.article_urls_from_crisis_keyword_by_api_crawling_requests

cl.news.article_urls_from_crisis_keyword_by_api_crawled_sources

cl.news.article_urls_from_crisis_keyword_by_api_crawling_sources_next_pages




cl.keywords_finished_sources

cl.news.article_urls_2_mongo_article_urls

cl.news.article_urls

cl.news.monitor_sources



^(cl\.news\.(article_urls_from_crisis_keyword_by_api_crawling_sources(_next_pages)?|article_urls_from_crisis_keyword_by_api_crawling_requests|article_urls_from_crisis_keyword_by_api_crawled_sources|article_urls_2_mongo_article_urls|monitor_sources_2_mysql_monitor_sources)|cl\.keywords_finished_sources)$




(cl.news.article_urls_from_crisis_keyword_by_api_crawling_sources|cl.news.article_urls_from_crisis_keyword_by_api_crawling_sources_next_pages|cl.news.article_urls_from_crisis_keyword_by_api_crawling_requests|cl.news.article_urls_from_crisis_keyword_by_api_crawled_sources|cl.news.article_urls|cl.news.monitor_sources|cl.news.updated_crisis_keywords)

## Flow


Câu query keyword:

SELECT `id`, `type`, `keyword`, `last_crawl_date`, `last_crawl_cursor`
FROM `monitor_keywords_v2`
WHERE `type` = 'CRISIS_TRACKING'
    AND `platform` = 'NEWS'
    AND `status` IN ('IDLE','UPDATING')
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND (`last_crawl_date` IS NULL
        OR `last_crawl_date` < NOW() - INTERVAL 30 MINUTE)
    AND `expiry_date` > NOW()
ORDER BY last_crawl_date ASC




- Loader sẽ load từ monitor_keyword_v2
- Có thêm crawling_loaders nữa
- Sau đó đó lock các keyword lên Redis
- Đi qua builder hay crawler thì cũng tương tự các luồng khác
- Ở Resolver -> Nếu có lỗi thì đem đi retry, còn những lỗi không retry được thì release ra luôn
- Data pusher thì sẽ update vào monitor_sources và articles
- Updater sẽ update vào monitor_keyword_v2 và Redis



## Cách chạy

ynmpdp-5134-testing-ynm-crawler-empty
kubectl get pods -n crawler-testing | grep ynmpdp-5134-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5134-testing-ynm-crawler-empty-5c99fc65f8-2vv62 -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local


### Loader

export NODE_ENV=testing
  
export HTTP_PORT=9999
export GRPC_PORT=9011
  
export NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLING_LOADER_ENABLE=true
export NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLING_LOADER_CRAWL_INTERVAL='{"brandTracking":{"amount":4,"unit":"hour"},"campaignTracking":{"amount":2,"unit":"hour"},"crisisTracking":{"amount":30,"unit":"minute"}}'
export NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLING_LOADER_CYCLE="*/1 * * * *"
export NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLING_LOADER_DEFAULT_DATA_DURATION=7days
export NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=1000
export NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLING_LOADER_OUTPUT_QUEUE=cl.news.article_urls_from_crisis_keyword_by_api_crawling_sources
 
export LOG_LEVEL=debug
  
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
  
export RABBIT_HEARTBEAT=10

export MONGO_NEWS_HOST=192.168.1.101
export MONGO_NEWS_PORT=27017
export MONGO_NEWS_USERNAME=root
export MONGO_NEWS_PASSWORD=4Cw94GKu22224Cw        
export MONGO_NEWS_DATABASE=news-testing
export MONGO_NEWS_REPLICA_SET=rs0
export MONGO_NEWS_AUTH_SOURCE=admin


  
export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null
  
yarn start --scope=@ynm/cl-news-crawling-loader-service


### Builder/Crawler/Resolver

export NODE_ENV=testing
   
export HTTP_PORT=9998
export GRPC_PORT=9011
 
export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
  
export GOOGLE_CUSTOM_SEARCH_SERVICE_MAXRETRIES=3
export GOOGLE_CUSTOM_SEARCH_SERVICE_TIMEOUT=45000
     
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_by_api_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_from_crisis_keyword_by_api_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_by_api_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword_by_api
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.news.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword_by_api.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=""
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=false
     
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true
     
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
    
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_ENABLE=true
 
export LOG_LEVEL=debug
 
export RABBIT_HEARTBEAT=10
 
yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service






### Crawler mới

export NODE_ENV=testing

export HTTP_PORT=9998
export GRPC_PORT=9011

export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021

export GOOGLE_CUSTOM_SEARCH_SERVICE_MAXRETRIES=3
export GOOGLE_CUSTOM_SEARCH_SERVICE_TIMEOUT=45000
    
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_by_api_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_from_crisis_keyword_by_api_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_by_api_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword_by_api
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.news.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword_by_api.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=""
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=false
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=1
    
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true
    
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
    
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_ENABLE=true

export LOG_LEVEL=debug

export RABBIT_HEARTBEAT=10

yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service


### Token

export HTTP_PORT=9020
export GRPC_PORT=9021
  
export LOG_LEVEL=debug
 
export TOKEN_CONFIGS_NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLER_IN_USED_TIMEOUT=15000
export TOKEN_CONFIGS_NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLER_IN_PENDING_TIMEOUT=5000
export TOKEN_CONFIGS_NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLER_IN_BLOCKED_TIMEOUT=43200000
 
export MYSQL_CONNECTION_PORT=6033 
export MYSQL_CONNECTION_DATABASE=ynm_tokens
 
export TOKEN_MANAGER_SERVICE_HOST=localhost
export TOKEN_MANAGER_SERVICE_PORT=9021
  
yarn start --scope=@ynm/token-manager-service


### Data pushser

export NODE_ENV=testing
export HTTP_PORT=9019 
export SOURCE_2_MYSQL_SOURCE_ENABLE=true
 
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
 
export RABBIT_HEART_BEAT=10
 
export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
yarn start --scope=@ynm/cl-news-data-pusher-service

## Source updater
export NODE_ENV=testing
 

export HTTP_PORT=9996
export GRPC_PORT=9011 
export CRISIS_KEYWORD_UPDATER_ENABLE=true
export CRISIS_KEYWORD_UPDATER_INPUT_EXCHANGE=cl.news.resolved_source
export CRISIS_KEYWORD_UPDATER_ROUTING_KEY=cl.3.*.*.updated_crisis_keyword
export CRISIS_KEYWORD_UPDATER_INPUT_QUEUE=cl.news.updated_crisis_keywords
 
export LOG_LEVEL=debug


export MONGO_NEWS_HOST=192.168.1.101
export MONGO_NEWS_PORT=27017
export MONGO_NEWS_USERNAME=root
export MONGO_NEWS_PASSWORD=4Cw94GKu22224Cw        
export MONGO_NEWS_DATABASE=news-testing
export MONGO_NEWS_REPLICA_SET=rs0
export MONGO_NEWS_AUTH_SOURCE=admin
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
 
export RABBIT_HEART_BEAT=10
 
export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
yarn start --scope=@ynm/cl-news-source-updater-service



## Message lấy được




- Hiện tại mỗi lần crawl thì 1 keyword đi được 10 bài -> 






## Message mẫu



# Check lại ở testing

ynm-cl-news-crisis-keyword-by-api-service-testing
ynm-cl-news-crawling-loader-service-testing
ynm-cl-news-source-updater-service-testing



# Check lại ở testing

ynm-cl-news-crisis-keyword-by-api-service-staging -> Hiện tại đã xử lý đúng với yêu cầu 
ynm-cl-news-crawling-loader-service-staging-> Hiện tại đã load lên đúng với yêu cầu
ynm-cl-news-source-updater-service-staging -> Hiện tại đã được xử lý đúng yêu cầu



hotfix-ynmpdp-5134-staging-ynm-crawler-empty
kubectl get pods -n crawler-staging | grep hotfix-ynmpdp-5134-staging-ynm-crawler-empty
kubectl exec -it hotfix-ynmpdp-5134-staging-ynm-crawler-empty-65ff77c94-jlw4w -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh