# Task crawl comment Pantip của Đồng


## Vấn đề

Tạo luồng crawl comment từ post của Platform Pantip


## Các case cần check


1. Loader

- Có load đúng từ Mông Pantip_posts có đúng hay không hay không 
- CÓ lưu cursor ở mySQL k 
- Có cache lại đúng key ở Redis hay không
- Có đúng format message loader hay không -> Cần confirm lại last_data_date/from_date/to_date
- Có load được nhiều message hay không


2. Crawler
- Crawl bằng proxy, thì khi crawl nhiều có bị block hay không
- Đi next_pages như nào, logic đi next page, điểm dừng là khi nào
- Số lượng comment lấy là bao nhiêu, có lấy đúng số lượng hay không
- Kiểm tra luôn có lấy reply của comment
- Kiểm tra xem nếu crawl comment - reply của bài post 
- Kiểm tra crawl 1 link sai thì hệ thống sẽ xử lý như nào


3. Resover
- Kiểm tra mapping có đúng hay không
- Kiểm tra parent posts
- Kiểm tra crawl 


## Cấu hình và thông tin


1. Queue


cl.pt.comments_no_cookie_crawling_sources|cl.pt.comments_no_cookie_crawling_requests|cl.pt.comments_no_cookie_crawled_sources|cl.mentions_2_solr_mentions_LamTT|cl.identities_2_redis_identities_LamTT|cl.pt.posts_finished_sources



2. k8s

ynmshgysg-1011-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmshgysg-1011-testing-ynm-crawler-empty
kubectl exec -it ynmshgysg-1011-testing-ynm-crawler-empty-6bcc6455d5-sprlm  -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local


3. Thông tin khác


- Điều kiện loader




Crawling Loader: BD User Post No Cookie Crawling Loader
Mongo Collection: pantip_posts
Key MySQL: PT_COMMENT_NO_COOKIE_CRAWLING_LOADER
Key Redis: PTCommentNoCookieCrawlingLoader


4. Câu query ở loader


{
  "$or": [
    { "comment_updated_at": null },
    {
      "$expr": {
        "$and": [
          { "$gte": ["$created_date", { "$dateSubtract": { "startDate": "$$NOW", "unit": "day", "amount": 30 } }] },
          { "$lt": ["$created_date", "$$NOW"] }
        ]
      }
    }
  ],
  "last_status": { "$in": [null, 0, 1, 2, 3] }
}


{next_crawl_time: 1}


## Cách chạy


1. Loader



export HTTP_PORT=9955
export LOG_LEVEL=debug
    
export LOG_LOG_STASH_HOST=51.222.44.171
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
    
export RABBIT_HEARTBEAT=10
   
export PANTIP_MODULE_ENABLED=true
 
export REDIS_KEY_PREFIX='TH_'
   
export PT_COMMENT_NO_COOKIE_CRAWLING_LOADER_OUTPUT_QUEUE=cl.pt.comments_no_cookie_crawling_sources
export PT_COMMENT_NO_COOKIE_CRAWLING_LOADER_COUNTRY=TH
export PT_COMMENT_NO_COOKIE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export PT_COMMENT_NO_COOKIE_CRAWLING_LOADER_CYCLE='0 */1 * * *'
export PT_COMMENT_NO_COOKIE_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export PT_COMMENT_NO_COOKIE_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=100
export PT_COMMENT_NO_COOKIE_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export PT_COMMENT_NO_COOKIE_CRAWLING_LOADER_ENABLE=true
    
NODE_ENV=testing_th yarn start --scope=@ynm/cl-crawling-loader-service


2. Crawler


    

   
export HTTP_PORT=9998
export LOG_LEVEL=debug
    
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.pt.comments_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.pt.comments_no_cookie_crawling_requests
    
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.14.*.*.comments_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.bd.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.pt.comments_no_cookie_crawled_sources
    
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.14.*.*.comments_no_cookie.next_page
    
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
   
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=PT_COMMENT_NO_COOKIE_CRAWLER
   
export CRAWLER_CONFIG_PAGING_ENABLE=true

export REDIS_USE_NEW_COMMAND=false
    
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
    
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
    
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1


NODE_ENV=staging_th yarn start --scope=@ynm/cl-pt-comment-crawler-service


    
NODE_ENV=testing_th yarn start --scope=@ynm/cl-pt-comment-crawler-service



3. Pusher


export HTTP_PORT=9064
   
export COMMENT_2_MONGO_PT_COMMENT_ENABLE=true
export COMMENT_2_MONGO_PT_COMMENT_ENABLE_REDIS_SERVICE=false
export COMMENT_2_MONGO_PT_COMMENT_INPUT_EXCHANGE=cl.resolved_data
export COMMENT_2_MONGO_PT_COMMENT_ROUTING_KEY=cl.14.comments
export COMMENT_2_MONGO_PT_COMMENT_INPUT_QUEUE=cl.comments_2_mongo_pt_comments
export COMMENT_2_MONGO_PT_COMMENT_CONCURRENCY=5
export COMMENT_2_MONGO_PT_COMMENT_BATCH_SIZE=100
export COMMENT_2_MONGO_PT_COMMENT_MAX_WAITING_TIME=60
export COMMENT_2_MONGO_PT_COMMENT_PREFETCH_MESSAGES=1000
   
export MENTION_2_SOLR_MENTION_ENABLE=true
export MENTION_2_SOLR_MENTION_ENABLE_REDIS_SERVICE=false
export MENTION_2_SOLR_MENTION_INPUT_EXCHANGE=cl.resolved_data
export MENTION_2_SOLR_MENTION_ROUTING_KEY=cl.14.*.*.mentions
export MENTION_2_SOLR_MENTION_INPUT_QUEUE=cl.mentions_2_solr_mentions
export MENTION_2_SOLR_MENTION_CONCURRENCY=5
export MENTION_2_SOLR_MENTION_POST_BATCH_SIZE=100
export MENTION_2_SOLR_MENTION_POST_MAX_WAITING_TIME=60
export MENTION_2_SOLR_MENTION_POST_PREFETCH_MESSAGES=1000
   
export PROFILE_2_SOLR_IDENTITY_ENABLE=true
export PROFILE_2_SOLR_IDENTITY_ENABLE_REDIS_SERVICE=false
export PROFILE_2_SOLR_IDENTITY_INPUT_EXCHANGE=cl.resolved_data
export PROFILE_2_SOLR_IDENTITY_ROUTING_KEY=cl.14.identities
export PROFILE_2_SOLR_IDENTITY_INPUT_QUEUE=cl.identities_2_solr_identities
export PROFILE_2_SOLR_IDENTITY_CONCURRENCY=5
export PROFILE_2_SOLR_IDENTITY_BATCH_SIZE=100
export PROFILE_2_SOLR_IDENTITY_MAX_WAITING_TIME=60
export PROFILE_2_SOLR_IDENTITY_PREFETCH_MESSAGES=1000
   
export PROFILE_2_REDIS_IDENTITY_ENABLE=true
export PROFILE_2_REDIS_IDENTITY_ENABLE_REDIS_SERVICE=false
export PROFILE_2_REDIS_IDENTITY_INPUT_EXCHANGE=cl.resolved_data
export PROFILE_2_REDIS_IDENTITY_ROUTING_KEY=cl.14.identities
export PROFILE_2_REDIS_IDENTITY_INPUT_QUEUE=cl.identities_2_redis_identities
export PROFILE_2_REDIS_IDENTITY_CONCURRENCY=5
export PROFILE_2_REDIS_IDENTITY_BATCH_SIZE=100
export PROFILE_2_REDIS_IDENTITY_MAX_WAITING_TIME=60
export PROFILE_2_REDIS_IDENTITY_PREFETCH_MESSAGES=1000
   
NODE_ENV=testing yarn start --scope=@ynm/cl-data-pusher-service


4. Updater


export HTTP_PORT=9876
   
export PT_POST_INPUT_EXCHANGE=cl.resolved_source
export PT_POST_ROUTING_KEY=cl.14.posts
export PT_POST_INPUT_QUEUE=cl.pt.posts_finished_sources
export PT_POST_BATCH_SIZE=1
export PT_POST_PREFETCH_MESSAGES=1000
export PT_POST_ENABLE=true
export PT_POST_MAX_WAITING_TIME=60
   
NODE_ENV=testing yarn start --scope=@ynm/cl-source-updater-service


5. Proxy

export COUNTRY=TH
export HTTP_PORT=9010
export GRPC_PORT=9011
 
yarn start --scope @ynm/proxy-manager-service


6. Token





## Message mẫu



