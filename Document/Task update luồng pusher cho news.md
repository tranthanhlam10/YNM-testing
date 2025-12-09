* Task update luồng Pusher cho news

Sửa mấy phần này em
- Filter Unique Id : filter message consume queue
- Filter valid Url: filter sau khi insert article url -> filter valid url -> insert article title
- Update Schema: _id, hash_link: định dạng UUID

- Sample data: thay đổi data mẫu ở dưới thôi em
- Update config testing: thêm config MAX_WAITING_TIME=30: đợi đủ batch thì chạy , k đủ batch 30s sau mới chạy
- EXCLUDE_ID_SOURCES="['duhoc.cn']" loại trừ domain này vào hệ thống


### Phân tích luồng
1. Đầu tiên consume từ queue news.article_urls
2. Tiếp theo là unique các id lại (Nếu nhiều message có cùng 1 id, thì group by lại và chỉ xử lý 1 thằng)
3. Kiểm tra trên Redis -> Nếu có trên Redis thì end process luôn 
4. Nếu không có thì tiếp tục transaction (Nếu từng bước của transaction này bị lỗi thì cache lại -> Cache ở )
	- Insert vào article_urls -> 
	- Insert vào article_titles -> Nếu insert được vào article_titles thì cũng insert được vào articles -> Valid này dành cho title
	- Insert vào articles


-> Vậy chung quy lại muốn nó chạy đúng thì 
- Số lượng Record ở Redis = article_urls (Đúng)
- Consume từ queue news.article_urls (Đúng)
- Đã lưu đúng kiểu dữ liệu ở article_title, article_url, article (Đúng)
- Case check đã tồn tại trong Redis (Đúng)
- Giờ check vụ unique message trước khi tạo transaction (Chỗ này chỉ cần lấy 2 message trùng nhau là được) (Đúng)

- Kiểm tra luôn chỗ regex, tại sao nó lại bị regex -> Từ chỗ regex sinh ra title bị lỗi (Chỗ này phải check 4 trường hợp)
- Kiểm tra domian "duhoc.cn" -> Không được lưu xuống hệ thống
- Kiểm tra update theo batch -> Đủ message theo batch mới chạy -> còn không thì 30s mới chạy -> Chỗ này thì push message theo batch thôi nhỏ hơn, bằng, lớn hơn 


Chỗ valid article_url:

Loại bỏ source không có id_source, title, link
Loại bỏ link chứa chuỗi regex sau /^(javascript:).*|search|tien-ich\/[\w+\-?=&]+|tien-ich|tag-pro|(\?|)tag|(\?|\/)search|Search|tim-kiem|Tim-kiem/
Loại bỏ title chứa chuỗi regex sau /^(Trang trước|Trang sau|Trang tiếp|Xem theo ngày|Xem tiếp|tìm kiêm|Tìm kiếm|search|Search|Tag)$/
Loại bỏ domain chứa id_source không mong muốn: mặc định ['duhoc.cn'], thêm ở config 




Chạy migrate collection article
data-migrate-staging-6c7f959fc7-9kzpw

node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=articles --source=article_titles --fields=id,id_category,platform,link,title,id_source,status,parse_type,error_codes,failed_type,count_failed,views_avg,published_date,created_date,crawled_date,next_crawl_time,priority,type --query="created_date:[NOW-365DAYS TO *]" --cursorMark=*





## Chạy pusher cho news

Câu lệnh chạy:
kubectl config use-context lamtt-k8s-ovh
kubectl get pods -n crawler-staging | grep fix-news-pusher-staging-ynm-crawler-empty

- Câu lệnh chạy bằng mongosh:
mongosh mongodb://ynm_crawler_staging:saJgNJW8v6FRh7@15.235.43.253:27017,15.235.43.254:27017/ynm_crawler_staging?authSource=ynm_crawler_staging

// Câu lệnh query find đơn gianr
db.identity_last_mentions.find().limit(5).pretty()


// Cách sử dụng câu aggregations ở mongo
db.identity_last_mentions.aggregate([ { $group: { _id: "$platform", count: { $sum: 1 } } } ])


// Câu query thứ nhất của đều kiện phân trang
db.identity_last_mentions.find({ last_crawl_followers: { $exists: false },platform:7 }).count()

// Câu lệnh query đơn giản
{ platform: 7,  last_crawl_followers: { $exists: false }  }
{ last_mention_in_topic: -1 }



kubectl get pods -n crawler-staging | grep ynmpdp-5637-staging-ynm-crawler-empty
kubectl exec -it ynmpdp-5637-staging-ynm-crawler-empty-776fd77955-58tkq -n crawler-staging -- sh


- Những đều cần chạy để  có data 

- Deployment chạy để có data:

Luồng đi first page: ynm-cl-news-article-url-service-staging
Luồng loader của first page: ynm-cl-news-crawling-loader-service-staging 



REVIEW_ARTICLE_URL_BY_FIRST_PAGE_CRAWLING_LOADER_ENABLE
NEWS_ARTICLE_URL_BY_FIRST_PAGE_CRAWLING_LOADER_ENABLE
BLOG_ARTICLE_URL_BY_FIRST_PAGE_CRAWLING_LOADER_ENABLE
ECOM_ARTICLE_URL_BY_FIRST_PAGE_CRAWLING_LOADER_ENABLE
NEWS_ARTICLE_URL_BY_FIRST_PAGE_CRAWLING_LOADER_ENABLE



ynm-cl-news-crisis-hashtag-service
ynm-cl-news-crisis-hashtag-by-api-service
ynm-cl-news-crisis-keyword-service
ynm-cl-news-crisis-keyword-by-api-service
ynm-cl-news-critical-hashtag-service
ynm-cl-news-critical-hashtag-by-api-service
ynm-cl-news-critical-keyword-service
ynm-cl-news-critical-keyword-by-api-service
ynm-cl-news-hashtag-service
ynm-cl-news-hashtag-by-api-service
ynm-cl-news-keyword-service
ynm-cl-news-keyword-by-api-service
ynm-cl-news-category-link-by-openai-service
ynm-cl-news-article-url-service
ynm-cl-news-crisis-keyword-service
ynm-cl-news-keyword-service
ynm-cl-news-parsed-details-2-mentions-service


// Luồng crawler first page


export HTTP_PORT=9998
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.news.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls.next_page
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=ARTICLE_URL_CRAWLER
  
export BUILDER_ENABLE=false
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
  
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
  
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
  
export LOG_LEVEL=debug
  
yarn start --scope=@ynm/cl-news-article-url-crawler-service



// News pusher -> DONE (Hiện tại đã update thành công xuống mongo)

- Article của luồng first page đã push được xuống mongo thành 
- Artilce của luồng news proxy đã push được sống mongo thành công 
- Article của luồng news api đã được push vào mongo thành công
- Monitor source cũng update thành công

export HTTP_PORT=9999

export LOG_LEVEL=debug

export ARTICLE_2_MONGO_ARTICLE_PUSHER_ENABLE=true
export ARTICLE_2_MONGO_ARTICLE_PUSHER_BATCH_SIZE=1000
export ARTICLE_2_MONGO_ARTICLE_PUSHER_CONCURRENCY=5
export ARTICLE_2_MONGO_ARTICLE_PUSHER_PREFETCH_MESSAGES=5000
export ARTICLE_2_MONGO_ARTICLE_PUSHER_MAX_WAITING_TIME=1

export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_BATCH_SIZE=20
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_CONCURRENCY=5
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_ENABLE=true
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_INPUT_EXCHANGE=cl.resolved_data
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_INPUT_QUEUE=cl.news.monitor_sources
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_PREFETCH_MESSAGES=1000
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_ROUTING_KEY=cl.3.monitor_sources
export SOURCE_2_MYSQL_MONITOR_SOURCE_PUSHER_MAX_WAITING_TIME=60


export POST_2_SOLR_YT_COMMENT_ENABLE=false
export POST_2_SOLR_IG_POST_ENABLE=false


export MONGO_NEWS_AUTH_SOURCE=ynm_crawler_staging
export MONGO_NEWS_DATABASE=ynm_crawler_staging
export MONGO_NEWS_REPLICA_SET=rs0

yarn start --scope=@ynm/cl-data-pusher-service



ECI -> DONE Staging

ynm-eci-to-sh-pusher-service-staging



export HTTP_PORT=8080
 
export LOG_LEVEL=debug
export HEART_BEAT=10

 
export PRODUCT_ITEMS_TO_ARTICLE_POSTS_PUSHER_INPUT_QUEUE="eci-pi-to-article-posts"
export PRODUCT_ITEMS_TO_ARTICLE_POSTS_PUSHER_BATCH_SIZE=5
export PRODUCT_ITEMS_TO_ARTICLE_POSTS_PUSHER_PREFETCH_MESSAGES=5
export PRODUCT_ITEMS_TO_ARTICLE_POSTS_PUSHER_ENABLE=false
 
export PRODUCT_ITEMS_TO_ARTICLE_URLS_PUSHER_INPUT_QUEUE="eci-pi-to-article-urls"
export PRODUCT_ITEMS_TO_ARTICLE_URLS_PUSHER_BATCH_SIZE=5
export PRODUCT_ITEMS_TO_ARTICLE_URLS_PUSHER_PREFETCH_MESSAGES=5
export PRODUCT_ITEMS_TO_ARTICLE_URLS_PUSHER_ENABLE=true
 
export PRODUCT_ITEMS_TO_MENTIONS_PUSHER_INPUT_QUEUE="eci-pi-to-mentions"
export PRODUCT_ITEMS_TO_MENTIONS_PUSHER_BATCH_SIZE=5
export PRODUCT_ITEMS_TO_MENTIONS_PUSHER_PREFETCH_MESSAGES=5
export PRODUCT_ITEMS_TO_MENTIONS_PUSHER_MIN_SHARD=20221212
export PRODUCT_ITEMS_TO_MENTIONS_PUSHER_ENABLE=false
 
export MONGO_NEWS_AUTH_SOURCE=ynm_crawler_staging
export MONGO_NEWS_DATABASE=ynm_crawler_staging
export MONGO_NEWS_REPLICA_SET=rs0
 
yarn start --scope=@ynm/eci-to-sh-pusher-service





// Loader news -> DONE

export HTTP_PORT=9990
export GRPC_PORT=9011
     
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
     
export RABBIT_HEARTBEAT=10
   
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
   
export MONGO_NEWS_AUTH_SOURCE=ynm_crawler_staging
export MONGO_NEWS_DATABASE=ynm_crawler_staging
export MONGO_NEWS_REPLICA_SET=rs0
 
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true
  
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
 
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true
  
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
  
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=normal_priority_detail_url_info
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=10000
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
   
NODE_OPTIONS="--max-old-space-size=6144" yarn start --scope=@ynm/cl-news-crawling-loader-service





// Loader ECI -> DONE Staging

ynm-eci-to-sh-loader-service-staging

export HTTP_PORT=8090
 
export LOG_LEVEL=debug
 
export ARTICLE_POSTS_CACHING_LOADER_CYCLE="*/10 * * * *"
export ARTICLE_POSTS_CACHING_LOADER_DATA_LOAD_BATCH_SIZE=1000
export ARTICLE_POSTS_CACHING_LOADER_ENABLE=false
 
export ARTICLE_URLS_UPDATING_LOADER_CYCLE="*/10 * * * *"
export ARTICLE_URLS_UPDATING_LOADER_DATA_LOAD_BATCH_SIZE=1000
export ARTICLE_URLS_UPDATING_LOADER_ENABLE=true
 
export PRODUCT_ITEMS_LOADER_INPUT_QUEUE="social_listening_product_items"
export PRODUCT_ITEMS_LOADER_EXCHANGE="eci_pi.to.sh"
export PRODUCT_ITEMS_LOADER_ARTICLE_POSTS_QUEUE="eci-pi-to-article-posts"
export PRODUCT_ITEMS_LOADER_MENTIONS_QUEUE="eci-pi-to-mentions"
export PRODUCT_ITEMS_LOADER_ARTICLE_URLS_QUEUE="eci-pi-to-article-urls"
export PRODUCT_ITEMS_LOADER_BATCH_SIZE=1000
export PRODUCT_ITEMS_LOADER_PREFETCH_MESSAGES=5000
export PRODUCT_ITEMS_LOADER_ENABLE=true
 
export MYSQL_CONNECTION_DATABASE="ynm_crawling_loaders"
 
export MONGO_NEWS_AUTH_SOURCE=ynm_crawler_staging
export MONGO_NEWS_DATABASE=ynm_crawler_staging
export MONGO_NEWS_REPLICA_SET=rs0
 
yarn start --scope=@ynm/eci-to-sh-loader-service



// Updater -> DONE Staging

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
  
export MONGO_NEWS_AUTH_SOURCE=ynm_crawler_staging
export MONGO_NEWS_DATABASE=ynm_crawler_staging
export MONGO_NEWS_REPLICA_SET=rs0
  
export ARTICLE_TITLE_UPDATER_INPUT_QUEUE=article_titles
export ARTICLE_TITLE_UPDATER_BATCH_SIZE=500
export ARTICLE_TITLE_UPDATER_CONCURRENCY=1
export ARTICLE_TITLE_UPDATER_PREFETCH_MESSAGES=1000
export ARTICLE_TITLE_UPDATER_ENABLE=true
  
yarn start --scope=@ynm/cl-news-source-updater-service


- Câu lệnh chạy của các luồng keyword news
// Keyword thường

export HTTP_PORT=9990
export GRPC_PORT=9011
  
export GOT_SCRAPING_SERVICE_TIMEOUT=45000
export GOT_SCRAPING_SERVICE_MAX_RETRIES=3
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.3_keyword.crawler-crisis
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_from_crisis_keyword_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=NEWS_CRISIS_KEYWORD_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=""
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=NewsArticleUrlFromCrisisKeywordCrawlingLoader
export CRAWLER_CONFIG_DETAULT_DATA_DURATION=3days
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=1
export CRAWLER_CONFIG_PRIORITY_LIMIT=3
  
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
  
export GOOGLE_SEARCH_CONFIG_TYPE_OF_SEARCH=nws
  
yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service


// Keyword API

export HTTP_PORT=9996
export GRPC_PORT=9011
 
export GOOGLE_CUSTOM_SEARCH_SERVICE_TIMEOUT=45000
export GOOGLE_CUSTOM_SEARCH_SERVICE_MAX_RETRIES=3
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_by_api_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.3_keyword.crawler-crisis
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_from_crisis_keyword_by_api_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_by_api_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword_by_api
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword_by_api.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=""
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=LAMTT_PROXY
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=NewsArticleUrlFromCrisisKeywordByApiCrawlingLoader
export CRAWLER_CONFIG_DETAULT_DATA_DURATION=3days
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=1
export CRAWLER_CONFIG_PRIORITY_LIMIT=3
 
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=false
      
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


## Dữ liệu của data pusher



- Monitor source:
{
  "monitor_sources": [
    {
      "domain": "thoitrangthammy.com",
      "name": "thoitrangthammy.com",
      "type": "NEWS",
      "priority": 10,
      "max_connection": 10,
      "pattern": null,
      "pattern_login": 0,
      "views_avg": 0,
      "views_avg_cat": 0,
      "createdBy": "NewsArticleUrlFromKeywordByApiCrawlingLoader"
    },
    {
      "domain": "doanhnhanvn.com",
      "name": "doanhnhanvn.com",
      "type": "NEWS",
      "priority": 10,
      "max_connection": 10,
      "pattern": null,
      "pattern_login": 0,
      "views_avg": 0,
      "views_avg_cat": 0,
      "createdBy": "NewsArticleUrlFromKeywordByApiCrawlingLoader"
    }
  ]
}

{"insertedCount":0,"matchedCount":0,"modifiedCount":0,"deletedCount":0,"upsertedCount":64,"upsertedIds":{"0":"c449f830-19e4-5e63-8091-aeec8a27ede6","1":"8cfd4c67-ad0f-51f5-8f35-9f86db4413da","2":"a4273c63-af80-558f-a89d-a8dee20c4d23","3":"8da66a46-7bb4-5f04-8bb5-d18f8988b4b9","4":"bb145b5d-d3bb-551f-92ae-e3aca8b73eae","5":"e747c108-830e-5581-938d-abe7b3b64992","6":"308499b1-80c3-57ca-950a-f0467cef20a5","7":"1f13ba5b-5988-5140-a33c-b1d4c4bc16ca","8":"579893ec-e1f0-5cfd-a124-1cdf9677e866","9":"a897a6ea-51c7-5133-9c13-95baa3ae4ee4","10":"5ae2dffd-15d3-5b6b-9c39-5ac0d4640f81","11":"a8e73465-3b52-564c-b897-e9b20ed43fb6","12":"efa6fc4a-cb92-59f9-84f0-bdda87bb12d6","13":"48f05af0-ed9f-5a78-80ea-397668066822","14":"997e27aa-bb28-5a74-a15c-0cfa5fc61369","15":"21e3cff4-c714-5fe3-a24d-cba45f564e8e","16":"233385e5-9122-5d3d-b1ed-47745496ff07","17":"fb920592-1552-5ab8-aeb5-4e8bd065a534","18":"ee63dcf0-14bf-58cc-9fd5-3c2ae40a2d34","19":"6b855b5f-a23f-524a-b0b6-53b57b6d4344","20":"dbd7f78f-30ac-51d3-a34a-a90e32437642","21":"07993d0e-f761-5474-b2a2-ae7b2cb52401","22":"c9576dde-e8a9-5482-84ce-3ab312e6759a","23":"dd8f18ba-766a-5940-9e37-943d17f84a83","24":"c44d8146-39e6-5608-b1cd-f4b717734d29","25":"e1aef74f-944a-575c-8ef2-6cba869bebeb","26":"9e004abb-81c4-51e4-9e69-52952abb5bcb","27":"285ee786-ce33-5b0c-a610-59f62b766040","28":"15a1ff7a-8a74-50a4-9a15-d34a0af0c3ba","29":"594edb68-7bf3-5ad3-ba39-279076b36e71","30":"2f5858af-51ed-5aa5-a7bf-f6fbf971ee16","31":"b1f8f53b-019e-5f13-8aaf-7f0040701f67","32":"3c8ccbec-2747-52ad-b1ca-136a24f6761b","33":"575c961c-dc07-5ccb-87dc-d7c164fac4fd","34":"a73eb86b-61b3-5f2f-a7ce-392cc1cb132c","35":"a23c8fc1-f045-5661-b867-718f349df7c1","36":"cc71a670-0147-5cfb-9a9c-d55e95496284","37":"d189e06a-2324-55c1-84d8-45f4f045923d","38":"373b0275-6ef6-5211-bb5d-a4281c4135ec","39":"18677f68-bb92-5ad5-8086-ddded091ecde","40":"c78c83d8-9f5e-5393-b87e-750c0b30dd36","41":"e42569b2-8cab-5519-9c49-1fbdddb059b7","42":"453030e1-c8b6-5264-9947-fe649c79dbfd","43":"74697178-fd68-5b5b-b8e3-f0e0320e86a5","44":"4cfc7cb1-604f-5676-b145-515d32b495bb","45":"db2f0af0-aa85-5cb9-b9fe-ab2380e86e8f","46":"ecd95163-54bb-5e51-8479-22caf112216a","47":"7c4c30a4-86ab-5b43-baac-4dcdf747b05a","48":"56297295-643e-5c63-8265-a3887214b79b","49":"b6a16e86-b753-541d-99d8-d5bf0c2b57b5","50":"700e9209-caaa-5427-af06-dea328f30049","51":"8107976b-5c4e-58e2-a6a5-8e18f69a9082","52":"3e92aced-e181-56ae-be51-acc12c950217","53":"f4a65bac-407b-5514-843e-c272625ed37e","54":"fa8136c3-88c1-5f54-b64d-d7f03a6ac6c7","55":"a86fbdd1-d45e-579a-9737-5a20e04c31af","56":"795e827c-df8e-50a2-a3bc-60e359d9f999","57":"e70912dd-c2cf-53d8-b8cf-16f7b9ee4352","58":"339915db-3047-5f18-8517-e4eae514c0ca","59":"47db0666-051b-5e9b-a192-2662abed349c","60":"b6e1a813-63c7-55b6-b747-aa045e90aa25","61":"00f3a306-a4d4-5a8e-8aeb-129f843109d1","62":"e6fbfb10-6a55-54ce-bc9f-0dbda5f8f01b","63":"60d8a8e2-7e25-57f7-89c4-5ee7c4fae00b"},"insertedIds":{}}




[
  {
    "_id": "7a172df8-2cd4-5989-85b2-b6ff2c8ccd46"
  },
  {
    "_id": "d0938b86-215d-59b3-8811-7c7718f3b673"
  },
  {
    "_id": "3e69dad8-a45f-5140-90d4-9853615b7af5"
  },
  {
    "_id": "189948cc-a42b-50d6-9cee-bfddbabcd935"
  },
  {
    "_id": "a299cd32-c57f-57a1-8ae2-1997809dd696"
  },
  {
    "_id": "a8a618dd-daa6-51db-bb89-52a44bc9eeb5"
  },
  {
    "_id": "b8437d02-5050-5045-9403-07e2284bde69"
  },
  {
    "_id": "dfd29007-d6e0-523e-ab15-0596abc791c2"
  },
  {
    "_id": "5e45315f-a6db-5d04-b4d4-434a170200ef"
  },
  {
    "_id": "5d6876ef-d328-5afb-980b-405d77536e70"
  },
  {
    "_id": "c7bb7edf-1d0a-5ce5-beea-5b3e2eceec14"
  },
  {
    "_id": "ffd12c4a-06f6-5980-a033-e6ae041d4eb3"
  },
  {
    "_id": "7d7553b1-4c20-5749-8bb8-fd56ae2e52e0"
  },
  {
    "_id": "07dad6d6-6099-5972-8c91-8e41a2148c11"
  },
  {
    "_id": "95f023a5-9e75-5537-820e-781b3e7a9d42"
  },
  {
    "_id": "896b867a-55a8-5a88-a424-a64b93787d49"
  },
  {
    "_id": "75932bd3-1258-50ed-82b4-de43967afc60"
  },
  {
    "_id": "d9a90c32-ba5e-5dda-bc2f-c69a1e8d4ea5"
  },
  {
    "_id": "a88b8e27-5b91-5206-b27a-e6738f24da85"
  },
  {
    "_id": "f4afb912-028c-53b8-8410-8a11b1e0709b"
  },
  {
    "_id": "1a9d7613-7165-5193-a30e-3f57d7ab5d7e"
  },
  {
    "_id": "a279547d-d36e-5fb9-85c0-27c3cd8ecde6"
  },
  {
    "_id": "0ab3d833-f023-5ba9-af04-0ac6ddfc5fa0"
  },
  {
    "_id": "e7f32663-40c6-5588-a762-53f9587d230d"
  },
  {
    "_id": "db44a8f7-66bf-5f92-b595-e3f5dc5c4f96"
  },
  {
    "_id": "507b0372-c6d3-550d-bf15-e56b363d8b6e"
  },
  {
    "_id": "11199782-e3a0-571a-b2ed-7eb33cdee80b"
  },
  {
    "_id": "5eb871f6-4985-57b5-a676-1a0299b609bb"
  },
  {
    "_id": "05386872-c618-5366-a898-79eb7c38e5f4"
  },
  {
    "_id": "03fd2d82-9e85-5e55-8049-62987f3eb3de"
  },
  {
    "_id": "b1e47c64-a320-51ec-8004-3eb6e31dc9ce"
  },
  {
    "_id": "a7c28c6c-1371-53c6-8201-7a12f743961c"
  },
  {
    "_id": "42d6f43f-6bb2-553e-b621-48eb206459e1"
  },
  {
    "_id": "aaa0bfac-89bf-5cd3-b415-f95e96dc7d9e"
  },
  {
    "_id": "b8f6a80d-c685-5004-8be1-5a505dc34f47"
  },
  {
    "_id": "49a2bc87-8fe8-56e1-8dbe-02360c82b17c"
  },
  {
    "_id": "a2ce3e0e-f065-5012-8623-aa8674b7cb3d"
  },
  {
    "_id": "8f49dcbf-eb15-5504-b128-cf67c958503d"
  },
  {
    "_id": "2955d189-f9d9-57d4-9317-11e19d18232d"
  },
  {
    "_id": "08495f65-a2b4-551e-9ebf-9c4f56c811d7"
  },
  {
    "_id": "35c48e84-558e-57d0-96c0-fbaa64018f6a"
  },
  {
    "_id": "632000c0-bccf-5594-815b-5eac9f3e99d8"
  },
  {
    "_id": "861df285-a8f0-5c21-823d-c8c35635bdd2"
  },
  {
    "_id": "da29cb89-6009-53aa-a999-03cf4e6cde03"
  },
  {
    "_id": "84ba873d-5ca1-57dc-a157-81676b1e8e4d"
  },
  {
    "_id": "71de1ae9-fb90-52f5-9089-37bf3beaf71a"
  },
  {
    "_id": "a69e9c21-2da4-58e4-9465-1905b0885411"
  },
  {
    "_id": "d5a6eaa8-91bf-5147-b1e8-3ba425fc652f"
  },
  {
    "_id": "a9aca281-7e96-52bf-b755-964f96793550"
  },
  {
    "_id": "2e21ca40-0a86-5063-91b0-d7a0d01f17dd"
  },
  {
    "_id": "d943bf70-cd71-5a67-a573-2f4bb52473ce"
  },
  {
    "_id": "8c77ee9c-8895-5c10-9743-eeb89fa8410f"
  },
  {
    "_id": "496e6233-5c5b-5e78-a15d-1eb371b06925"
  },
  {
    "_id": "ad9f96e2-024d-50a1-b94b-050973ce2f3b"
  },
  {
    "_id": "b47049fe-47dc-570f-9c58-c6a8a92d325f"
  },
  {
    "_id": "f372a29b-d6ac-52ac-9af7-a3871063063b"
  },
  {
    "_id": "3c20c03b-b7cb-5c65-ab20-2fa7fb69890b"
  },
  {
    "_id": "1fa7f79d-08fb-58de-8bc2-7580e02a2883"
  },
  {
    "_id": "25d1c2ce-1e16-52b0-b59e-d0d19f7f0a97"
  },
  {
    "_id": "a24bce80-ca79-5d7a-9fc2-e889b1fb22a3"
  },
  {
    "_id": "d504bc80-60cd-59cd-a5bb-8af04bc52b9a"
  },
  {
    "_id": "a2faf76e-0601-5874-9f84-a3aba81635be"
  },
  {
    "_id": "3aff36a5-b734-5cb2-ba2a-d7f0cfe8473e"
  },
  {
    "_id": "d69237be-ea89-504c-a877-419e87799f30"
  }
]



[
  {
    "_id": "c449f830-19e4-5e63-8091-aeec8a27ede6",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/vinfuture-mua-5-lan-dau-tien-10-dai-hoc-lon-dong-hanh-kien-tao-mang-luoi-tri-thuc-toan-cau-102251113100722991.htm",
    "title": "VinFuture mùa 5: Lần đầu tiên 10 đại học lớn đồng hành kiến tạo mạng lưới tri thức toàn cầu",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "8cfd4c67-ad0f-51f5-8f35-9f86db4413da",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/ke-hoach-trien-khai-he-thong-quan-ly-van-ban-mat-cua-chinh-phu-102251113152227927.htm",
    "title": "Kế hoạch triển khai Hệ thống Quản lý văn bản mật của Chính phủ",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "efa6fc4a-cb92-59f9-84f0-bdda87bb12d6",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/bo-cong-thuong-khuyen-cao-doanh-nghiep-cap-nhat-quy-dinh-moi-cua-trung-quoc-ve-xuat-khau-thuc-pham-102251113155909263.htm",
    "title": "Bộ Công Thương khuyến cáo doanh nghiệp cập nhật quy định mới của Trung Quốc về xuất khẩu thực phẩm",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "dd8f18ba-766a-5940-9e37-943d17f84a83",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/danh-gia-dung-kho-khan-phan-bo-hieu-qua-nghi-dinh-272-2025-nd-cp-mo-loi-cho-dau-tu-vung-dtts-va-mien-nui-102251113193347906.htm",
    "title": "Đánh giá đúng khó khăn, phân bổ hiệu quả: Nghị định 272/2025/NĐ-CP mở lối cho đầu tư vùng DTTS và miền núi",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "a73eb86b-61b3-5f2f-a7ce-392cc1cb132c",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/the-che-duoc-thao-go-nguon-luc-duoc-khai-thong-dong-luc-moi-cho-cac-du-an-bat-dong-san-phia-nam-102251114082427036.htm",
    "title": "Thể chế được tháo gỡ, nguồn lực được khai thông: Động lực mới cho các dự án bất động sản phía nam",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "db2f0af0-aa85-5cb9-b9fe-ab2380e86e8f",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/doi-moi-tu-duy-phat-huy-vai-tro-tien-phong-trong-hoi-nhap-quoc-te-102251013160247701.htm",
    "title": "Đổi mới tư duy, phát huy vai trò tiên phong trong hội nhập quốc tế",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "795e827c-df8e-50a2-a3bc-60e359d9f999",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/thu-tuong-pham-minh-chinh-gui-thong-diep-toi-hoi-nghi-unctad16-102251020212252466.htm",
    "title": "Thủ tướng Phạm Minh Chính gửi thông điệp tới hội nghị UNCTAD16",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "00f3a306-a4d4-5a8e-8aeb-129f843109d1",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/viet-nam-dang-cai-hoi-nghi-ke-toan-asean-lan-thu-24-102251027153436301.htm",
    "title": "Việt Nam đăng cai Hội nghị Kế toán ASEAN lần thứ 24",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "e6fbfb10-6a55-54ce-bc9f-0dbda5f8f01b",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/khac-phuc-cac-han-che-vuong-mac-trong-qua-trinh-thuc-hien-luat-dieu-uoc-quoc-te-102251031092329885.htm",
    "title": "Khắc phục các hạn chế, vướng mắc trong quá trình thực hiện Luật Điều ước quốc tế",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "60d8a8e2-7e25-57f7-89c4-5ee7c4fae00b",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/dai-su-eu-cai-cach-cua-viet-nam-se-tiep-tuc-thu-hut-nha-dau-tu-nuoc-ngoai-10225111116460289.htm",
    "title": "Đại sứ EU: Cải cách của Việt Nam sẽ tiếp tục thu hút nhà đầu tư nước ngoài",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "a4273c63-af80-558f-a89d-a8dee20c4d23",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/thu-tuong-danh-60-ty-dong-tai-dinh-cu-cho-nguoi-dan-mat-nha-do-bao-tai-de-gi-gia-lai-102251113122845522.htm",
    "title": "Thủ tướng: Dành 60 tỷ đồng tái định cư cho người dân mất nhà do bão tại Đề Gi (Gia Lai)",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "8da66a46-7bb4-5f04-8bb5-d18f8988b4b9",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/pho-thu-tuong-mai-van-chinh-tiep-tong-giam-doc-thong-tan-xa-pathet-lao-102251113132609336.htm",
    "title": "Phó Thủ tướng Mai Văn Chính tiếp Tổng Giám đốc Thông tấn xã Pathet Lào",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "bb145b5d-d3bb-551f-92ae-e3aca8b73eae",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/dong-chi-phung-thi-hong-ha-duoc-bau-giu-chuc-chu-tich-hdnd-tp-ha-noi-nhiem-ky-2021-2026-103251113160052937.htm",
    "title": "Đồng chí Phùng Thị Hồng Hà được bầu giữ chức Chủ tịch HĐND TP. Hà Nội nhiệm kỳ 2021-2026",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "e747c108-830e-5581-938d-abe7b3b64992",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/tao-co-so-cho-dong-nai-tang-truong-2-con-so-102251113172626618.htm",
    "title": "Tạo cơ sở cho Đồng Nai tăng trưởng 2 con số",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "308499b1-80c3-57ca-950a-f0467cef20a5",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/dong-chi-nguyen-duc-trung-giu-chuc-chu-tich-ubnd-tp-ha-noi-nhiem-ky-2021-2026-103251113171324315.htm",
    "title": "Tân Chủ tịch UBND TP. Hà Nội: Tạo đột phá để đạt mục tiêu tăng trưởng trên 11%",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "1f13ba5b-5988-5140-a33c-b1d4c4bc16ca",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/thu-tuong-khan-truong-xay-dung-lai-1900-nha-sap-do-67000-nha-toc-mai-cho-dong-bao-mien-trung-102251113165321586.htm",
    "title": "Thủ tướng: Khẩn trương xây dựng lại 1.900 nhà sập đổ, 67.000 nhà tốc mái cho đồng bào miền Trung",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "579893ec-e1f0-5cfd-a124-1cdf9677e866",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/tong-bi-thu-to-lam-tiep-truong-ban-tuyen-truyen-trung-uong-dang-cong-san-trung-quoc-ly-thu-loi-102251113193338656.htm",
    "title": "Tổng Bí thư Tô Lâm tiếp Trưởng Ban Tuyên truyền Trung ương Đảng Cộng sản Trung Quốc Lý Thư Lỗi",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "a897a6ea-51c7-5133-9c13-95baa3ae4ee4",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/pho-thu-tuong-ho-duc-phoc-hoi-kien-thu-tuong-lao-sonexay-siphandone-102251113213401373.htm",
    "title": "Phó Thủ tướng Hồ Đức Phớc hội kiến Thủ tướng Lào Sonexay Siphandone",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "5ae2dffd-15d3-5b6b-9c39-5ac0d4640f81",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/pho-thu-tuong-bui-thanh-son-luat-thuong-mai-dien-tu-phai-vua-kien-tao-phat-trien-vua-bao-ve-nguoi-tieu-dung-102251113191324257.htm",
    "title": "Phó Thủ tướng Bùi Thanh Sơn: Luật Thương mại điện tử phải vừa kiến tạo phát triển, vừa bảo vệ người tiêu dùng",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "a8e73465-3b52-564c-b897-e9b20ed43fb6",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/pho-thu-tuong-nguyen-chi-dung-tham-hoi-dong-vien-cac-gia-dinh-bi-anh-huong-boi-mua-lu-tai-hue-102251113214707948.htm",
    "title": "Phó Thủ tướng Nguyễn Chí Dũng thăm hỏi, động viên các gia đình bị ảnh hưởng bởi mưa lũ tại Huế",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "48f05af0-ed9f-5a78-80ea-397668066822",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/pho-thu-tuong-mai-van-chinh-du-ngay-hoi-dai-doan-ket-toan-dan-toc-tai-khanh-hoa-10225111410521664.htm",
    "title": "Phó Thủ tướng Mai Văn Chính dự ngày hội đại đoàn kết toàn dân tộc tại Khánh Hòa",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "997e27aa-bb28-5a74-a15c-0cfa5fc61369",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/pho-thu-tuong-nguyen-chi-dung-thi-sat-kiem-tra-cac-du-an-trong-diem-tinh-quang-tri-102251114115556445.htm",
    "title": "Phó Thủ tướng Nguyễn Chí Dũng thị sát, kiểm tra các dự án trọng điểm tỉnh Quảng Trị",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "21e3cff4-c714-5fe3-a24d-cba45f564e8e",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/dong-chi-nguyen-khac-than-giu-chuc-bi-thu-tinh-uy-nghe-an-102251111114314254.htm",
    "title": "Đồng chí Nguyễn Khắc Thận giữ chức Bí thư Tỉnh ủy Nghệ An",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "233385e5-9122-5d3d-b1ed-47745496ff07",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/phe-chuan-ket-qua-bau-bai-nhiem-chuc-vu-pho-chu-tich-ubnd-tinh-thanh-hoa-102251111155422492.htm",
    "title": "Phê chuẩn kết quả bầu, bãi nhiệm chức vụ Phó Chủ tịch UBND tỉnh Thanh Hóa",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "fb920592-1552-5ab8-aeb5-4e8bd065a534",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/thu-truong-bo-ngoai-giao-ngo-le-van-giu-chuc-chu-tich-uy-ban-quoc-gia-unesco-viet-nam-102251111181548347.htm",
    "title": "Thứ trưởng Bộ Ngoại giao Ngô Lê Văn giữ chức Chủ tịch Ủy ban Quốc gia UNESCO Việt Nam",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "ee63dcf0-14bf-58cc-9fd5-3c2ae40a2d34",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/tao-dieu-kien-toi-da-de-vien-chuc-phat-huy-nang-luc-dong-thoi-ngan-truc-loi-chinh-sach-102251113143519498.htm",
    "title": "Tạo điều kiện tối đa để viên chức phát huy năng lực, đồng thời ngăn trục lợi chính sách",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "6b855b5f-a23f-524a-b0b6-53b57b6d4344",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/quoc-hoi-viet-nam-san-sang-thuc-day-chinh-sach-ho-tro-hop-tac-song-phuong-voi-jordan-102251112204322664.htm",
    "title": "Quốc hội Việt Nam sẵn sàng thúc đẩy chính sách hỗ trợ hợp tác song phương với Jordan",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "dbd7f78f-30ac-51d3-a34a-a90e32437642",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/quoc-vuong-jordan-ket-thuc-tot-dep-chuyen-tham-chinh-thuc-viet-nam-102251113181334724.htm",
    "title": "Quốc vương Jordan kết thúc tốt đẹp chuyến thăm chính thức Việt Nam",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "07993d0e-f761-5474-b2a2-ae7b2cb52401",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/thu-tuong-pham-minh-chinh-va-phu-nhan-tham-chinh-thuc-kuwait-va-algeria-du-hoi-nghi-thuong-dinh-g20-tai-nam-phi-tu-ngay-16-24-11-102251113180502304.htm",
    "title": "Thủ tướng Phạm Minh Chính và Phu nhân thăm chính thức Kuwait và Algeria, dự Hội nghị Thượng đỉnh G20 tại Nam Phi từ ngày 16-24/11",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "c9576dde-e8a9-5482-84ce-3ab312e6759a",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/chuyen-tham-cua-thu-tuong-toi-kuwait-khai-pha-cac-linh-vuc-con-nhieu-tiem-nang-hop-tac-102251112171306187.htm",
    "title": "Chuyến thăm của Thủ tướng tới Kuwait: Khai phá các lĩnh vực còn nhiều tiềm năng hợp tác",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "c44d8146-39e6-5608-b1cd-f4b717734d29",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/chuyen-tham-cua-thu-tuong-toi-algeria-dua-quan-he-song-phuong-len-tam-cao-moi-102251112165318348.htm",
    "title": "Chuyến thăm của Thủ tướng tới Algeria đưa quan hệ song phương lên tầm cao mới",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "e1aef74f-944a-575c-8ef2-6cba869bebeb",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/pho-thu-tuong-ho-quoc-dung-du-ngay-hoi-dai-doan-ket-toan-dan-toc-tai-khu-dan-cu-na-coc-cao-bang-102251114131135155.htm",
    "title": "Phó Thủ tướng Hồ Quốc Dũng dự Ngày hội Đại đoàn kết toàn dân tộc tại khu dân cư Nà Cốc, Cao Bằng",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "9e004abb-81c4-51e4-9e69-52952abb5bcb",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/phu-tho-khan-truong-xay-dung-quy-hoach-dinh-huong-phat-trien-sau-sap-nhap-102251114133136689.htm",
    "title": "Phú Thọ khẩn trương xây dựng quy hoạch, định hướng phát triển sau sáp nhập",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "285ee786-ce33-5b0c-a610-59f62b766040",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/chinh-tri/thoi-su.htm",
    "title": "Thời sự",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "15a1ff7a-8a74-50a4-9a15-d34a0af0c3ba",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/tinh-than-dai-doan-ket-toan-dan-toc-tham-sau-vao-tung-khu-dan-cu-tung-gia-dinh-va-tung-con-nguoi-102251114150041694.htm",
    "title": "Tinh thần đại đoàn kết toàn dân tộc thấm sâu vào từng khu dân cư, từng gia đình và từng con người",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "594edb68-7bf3-5ad3-ba39-279076b36e71",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/nghien-cuu-tiep-thu-day-du-cac-y-kien-dong-gop-doi-voi-du-an-luat-xay-dung-sua-doi-102251114151040345.htm",
    "title": "Nghiên cứu, tiếp thu đầy đủ các ý kiến đóng góp đối với dự án Luật Xây dựng (sửa đổi)",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "2f5858af-51ed-5aa5-a7bf-f6fbf971ee16",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/pho-bi-thu-tinh-uy-lao-cai-nguyen-tuan-anh-duoc-bau-giu-chuc-chu-tich-ubnd-tinh-102251114154433702.htm",
    "title": "Phó Bí thư Tỉnh ủy Lào Cai Nguyễn Tuấn Anh được bầu giữ chức Chủ tịch UBND tỉnh",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "b1f8f53b-019e-5f13-8aaf-7f0040701f67",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/nghien-cuu-lam-ro-chuc-nang-nhiem-vu-cua-trung-tam-phong-ngua-tranh-chap-dau-tu-quoc-te-102251113105234972.htm",
    "title": "Nghiên cứu, làm rõ chức năng, nhiệm vụ của Trung tâm Phòng ngừa tranh chấp đầu tư quốc tế",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "3c8ccbec-2747-52ad-b1ca-136a24f6761b",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/tong-thuat-toa-dam-bao-dam-an-ninh-quoc-phong-gan-voi-phat-trien-ben-vung-trong-dinh-huong-chien-luoc-dai-hoi-xiv-cua-dang-102251113083221427.htm",
    "title": "TỔNG THUẬT: Tọa đàm 'Bảo đảm an ninh, quốc phòng gắn với phát triển bền vững trong định hướng chiến lược Đại hội XIV của Đảng'",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "575c961c-dc07-5ccb-87dc-d7c164fac4fd",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/thu-tuong-no-luc-cao-nhat-ho-tro-doanh-nghiep-sau-bao-khong-phan-biet-doanh-nghiep-nha-nuoc-hay-tu-nhan-102251113101403422.htm",
    "title": "Thủ tướng: Nỗ lực cao nhất hỗ trợ doanh nghiệp sau bão, không phân biệt doanh nghiệp Nhà nước hay tư nhân",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "a23c8fc1-f045-5661-b867-718f349df7c1",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/can-khung-phap-ly-moi-cho-hop-tac-kinh-te-viet-nam-jordan-102251113114818965.htm",
    "title": "Cần khung pháp lý mới cho hợp tác kinh tế Việt Nam - Jordan",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "cc71a670-0147-5cfb-9a9c-d55e95496284",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/tong-bi-thu-to-lam-kiem-tra-du-an-san-bay-long-thanh-102251113112311243.htm",
    "title": "Cảng HKQT Long Thành phải là hình mẫu mới về hạ tầng hàng không hiện đại, bền vững và thông minh",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "d189e06a-2324-55c1-84d8-45f4f045923d",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/thu-tuong-du-ngay-hoi-dai-doan-ket-toan-dan-toc-tai-xa-de-gi-tinh-gia-lai-10225111312132138.htm",
    "title": "Thủ tướng dự Ngày hội Đại đoàn kết toàn dân tộc tại xã Đề Gi, tỉnh Gia Lai",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "373b0275-6ef6-5211-bb5d-a4281c4135ec",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/chu-de/thuc-day-phat-trien-khoa-hoc-cong-nghe-doi-moi-sang-tao-va-chuyen-doi-so-171.htm",
    "title": "Thúc đẩy phát triển khoa học công nghệ, đổi mới sáng tạo và chuyển đổi số",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "18677f68-bb92-5ad5-8086-ddded091ecde",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/chu-de/chien-dich-than-toc-xay-dung-truong-pho-thong-noi-tru-xa-bien-gioi-266.htm",
    "title": "Chiến dịch thần tốc xây dựng trường phổ thông nội trú xã biên giới",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "c78c83d8-9f5e-5393-b87e-750c0b30dd36",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/chu-de/dai-hoi-thi-dua-yeu-nuoc-toan-quoc-xi-tang-toc-but-pha-dua-dat-nuoc-vao-ky-nguyen-hung-cuong-thinh-vuong-262.htm",
    "title": "Đại hội thi đua yêu nước toàn quốc XI: Tăng tốc bứt phá đưa đất nước vào kỷ nguyên hùng cường, thịnh vượng",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "e42569b2-8cab-5519-9c49-1fbdddb059b7",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/chu-de/huong-toi-dai-hoi-dai-bieu-toan-quoc-lan-thu-xiv-cua-dang-206.htm",
    "title": "Hướng tới Đại hội đại biểu toàn quốc lần thứ XIV của Đảng",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "453030e1-c8b6-5264-9947-fe649c79dbfd",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/chu-de/thu-tuong-pham-minh-chinh-tham-chinh-thuc-kuwait-va-algeria-du-hoi-nghi-thuong-dinh-g20-tai-nam-phi-270.htm",
    "title": "Thủ tướng Phạm Minh Chính thăm chính thức Kuwait và Algeria, dự Hội nghị Thượng đỉnh G20 tại Nam Phi",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "74697178-fd68-5b5b-b8e3-f0e0320e86a5",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/tin-moi.htm",
    "title": "Mới Nhất",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "4cfc7cb1-604f-5676-b145-515d32b495bb",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/quoc-te/viet-nam-asean.htm",
    "title": "Việt Nam - ASEAN",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "ecd95163-54bb-5e51-8479-22caf112216a",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/quoc-te.htm",
    "title": "Quốc tế",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "7c4c30a4-86ab-5b43-baac-4dcdf747b05a",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/khoa-giao/bien-viet-nam.htm",
    "title": "Biển Việt Nam",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "56297295-643e-5c63-8265-a3887214b79b",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/khoa-giao/khoa-hoc-cong-nghe.htm",
    "title": "Khoa học - Công nghệ",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "b6a16e86-b753-541d-99d8-d5bf0c2b57b5",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/khoa-giao/giao-duc.htm",
    "title": "Giáo dục",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "700e9209-caaa-5427-af06-dea328f30049",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/khoa-giao.htm",
    "title": "Khoa giáo",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "8107976b-5c4e-58e2-a6a5-8e18f69a9082",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/xa-hoi/nong-thon-moi.htm",
    "title": "Nông thôn mới",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "3e92aced-e181-56ae-be51-acc12c950217",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/xa-hoi/an-sinh-xa-hoi.htm",
    "title": "An sinh xã hội",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "f4a65bac-407b-5514-843e-c272625ed37e",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/xa-hoi/doi-song.htm",
    "title": "Đời sống",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "fa8136c3-88c1-5f54-b64d-d7f03a6ac6c7",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/xa-hoi/y-te.htm",
    "title": "Y tế",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "a86fbdd1-d45e-579a-9737-5a20e04c31af",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/xa-hoi/phap-luat.htm",
    "title": "Pháp luật",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "e70912dd-c2cf-53d8-b8cf-16f7b9ee4352",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/xa-hoi.htm",
    "title": "Xã hội",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "339915db-3047-5f18-8517-e4eae514c0ca",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/van-hoa/du-lich.htm",
    "title": "Du lịch",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  },
  {
    "_id": "47db0666-051b-5e9b-a192-2662abed349c",
    "id_category": 439647,
    "platform": 3,
    "link": "https://mnews.chinhphu.vn/van-hoa/the-thao.htm",
    "title": "Thể thao",
    "id_source": "mnews.chinhphu.vn",
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "views_avg": 0,
    "created_date": "2025-11-14T10:01:07.569Z",
    "crawled_date": "1970-01-01T00:00:00Z",
    "priority": 2
  }
]
