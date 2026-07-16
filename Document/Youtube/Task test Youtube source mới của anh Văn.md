# Task test Youtube source mới của anh Văn

## Scope


Task YNMPDP-6004 thực hiện chuyển đổi luồng Crawl Youtube Post From Source từ repo cũ sang repo mới ynm-crawler. Luồng này lấy danh sách Youtube source từ collection identity, crawl danh sách video/post của channel thông qua Youtube API, sau đó resolver dữ liệu thành mentions và youtube posts để downstream service lưu vào Solr/Mongo và cập nhật trạng thái source.

Đây là tính năng thuộc nhóm backend/data pipeline, không có thay đổi UI trực tiếp. Rủi ro chính nằm ở contract message giữa các queue, mapping dữ liệu, paging, lock/release source và tính tương thích dữ liệu giữa crawler cũ và crawler mới.


## Vấn đề


Đảm bảo luồng mới chạy end-to-end từ Loader -> Builder -> Crawler -> Resolver -> Data Pusher/Source Updater.
Đảm bảo crawler load đúng Youtube identity theo tiêu chí filter trong wiki và không crawl source bị exclude.
Đảm bảo Builder tạo request đúng endpoint/params Youtube API: playlistItems, part=snippet,contentDetails, maxResults=50, playlistId=UU....
Đảm bảo Resolver mapping đúng dữ liệu mention và post theo wiki, bao gồm id, link, source, title, thumbnail, created date, country, KOL, engagement.
Đảm bảo paging, retry, idempotency và lock/release source hoạt động ổn định, không gây duplicate hoặc kẹt source.
Đảm bảo output contract tương thích downstream queue, Solr mentions, Mongo youtube_posts và source updater.

## Hướng giải quyết

Xây dựng source mới cho luồng Youtube crawl source


## Cách chạy


1. k8s

ynmpdp-6004-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-6004-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-6004-testing-ynm-crawler-empty-568d9f8f58-8ds86 -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


2. RabbitMQ

(dev|testing|staging|production).cl.(mentions_2_solr_mentions|posts_2_mongo_yt_posts|identities_2_solr_identities|identities_2_redis_identities)$|(dev|testing|staging|production)(_+)?.cl.yt.posts_(crawled|crawling)|(dev|testing|staging|production).cl.identities_finished_sources



3. Redis
Redis: YoutubePostApiCrawlingLoader

4. MySQL

MySQL: YOUTUBE_POST_API_CRAWLING_LOADER


5. Script


- Loader

export NODE_ENV=testing
 
export HTTP_PORT=9999
export GRPC_PORT=9011
  
export YOUTUBE_MODULE_ENABLED=true
export YT_POST_API_CRAWLING_LOADER_ENABLE=true
export YT_POST_API_CRAWLING_LOADER_COUNTRY=""
  
export LOG_LEVEL=debug
 
export REDIS_KEY_PREFIX=''
   
export RABBIT_HEARTBEAT=10
     
yarn start --scope=@ynm/cl-crawling-loader-service




- Crawler


export HTTP_PORT=9999
export GRPC_PORT=9011
    
export PROXY_MANAGER_SERVICE_PORT=9011
export TOKEN_MANAGER_SERVICE_PORT=9011
    
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.yt.posts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.yt.posts_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.yt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.yt.posts_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.7.*.*.posts
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.7.*.*.posts.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=""
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE="YT_IDENTITY_CRAWLER"
export CRAWLER_CONFIG_PAGING_ENABLE=true
        
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
 
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6393
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_DB=1
export REDIS_USE_NEW_COMMAND=true
    
yarn start --scope=@ynm/cl-yt-post-crawler-service





