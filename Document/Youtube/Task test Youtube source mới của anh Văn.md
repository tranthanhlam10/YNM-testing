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


+ Đây nhà những cases cần test:

- Loader có được load từ mongo hay không
- Crawl được bài không
- Đi next_page có đủ page đủ bài hay không
- Mapping's resolver
- Cơ chế block/broken token/proxy
- Điều kiện dừng (phụ thuộc vào is_first_crawl)
- Điều kiện lọc mentions (Last_data_date/from_date)


## Cách chạy


1. k8s

ynmpdp-6004-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-6004-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-6004-testing-ynm-crawler-empty-76b94d78dc-rpbf4 -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local



- Shard dùng để query ở Solr:


20260201,20260202,20260203,20260204,20260205,20260206,20260207,20260208,20260209,20260210,20260211,20260212,20260213,20260214,20260215,20260216,20260217,20260218,20260219,20260220,20260221,20260222,20260223,20260224,20260225,20260226,20260227,20260228,20260301,20260302,20260303,20260304,20260305,20260306,20260307,20260308,20260309,20260310,20260311,20260312,20260313,20260314,20260315,20260316,20260317,20260318,20260319,20260320,20260321,20260322,20260323,20260324,20260325,20260326,20260327,20260328,20260329,20260330,20260331,20260401,20260402,20260403,20260404,20260405,20260406,20260407,20260408,20260409,20260410,20260411,20260412,20260413,20260414,20260415,20260416,20260417,20260418,20260419,20260420,20260421,20260422,20260423,20260424,20260425,20260426,20260427,20260428,20260429,20260430,20260501,20260502,20260503,20260504,20260505,20260506,20260507,20260508,20260509,20260510,20260511,20260512,20260513,20260514,20260515,20260516,20260517,20260518,20260519,20260520,20260521,20260522,20260523,20260524,20260525,20260526,20260527,20260528,20260529,20260530,20260531,20260601,20260602,20260603,20260604,20260605,20260606,20260607,20260608,20260609,20260610,20260611,20260612,20260613,20260614,20260615,20260616,20260617,20260618,20260619,20260620,20260621,20260622


2. RabbitMQ

(dev|testing|staging|production).cl.(mentions_2_solr_mentions|posts_2_mongo_yt_posts|identities_2_solr_identities|identities_2_redis_identities)$|(dev|testing|staging|production)(_+)?.cl.yt.posts_(crawled|crawling)|(dev|testing|staging|production).cl.identities_finished_sources|mentions_2_solr_mentions_LamTT|identities_2_solr_identities_LamTT|identities_2_redis_identities_LamTT|posts_2_mongo_yt_posts_LamTT|cl.identities_finished_sources_Linh|cl.yt.posts_crawling_requests_next_pages|cl.identities_crawling_finished_sources



3. Redis
Redis: YoutubePostApiCrawlingLoader


-> Đây là câu query ở Mongo để load source lên đi crawl:


{
  "fields": [
    "id",
    "id_social",
    "link",
    "fullname",
    "post_updated_at",
    "post_last_date",
    "category",
    "priority",
    "is_kol",
    "country_code"
  ],
  "filter": {
    "platform": 7,
    "country_code": "<country_code>",
    "-last_status": "(4 5)",
    "next_crawl_time": "* TO <time_next_cycle>",
    "priority": "[<min_priority> TO <max_priority>]"
  },
  "sorter": {
    "next_crawl_time": "asc",
    "id": "asc"
  }
}




4. MySQL

MySQL: YOUTUBE_POST_API_CRAWLING_LOADER


5. Script


- Loader

export NODE_ENV=testing
 
export HTTP_PORT=9999
export GRPC_PORT=9011
  
export YOUTUBE_MODULE_ENABLED=true
export YT_POST_API_CRAWLING_LOADER_ENABLE=true
export YT_POST_API_CRAWLING_LOADER_COUNTRY="VN"
  
export LOG_LEVEL=debug
 
export REDIS_KEY_PREFIX=''
   
export RABBIT_HEARTBEAT=10
     
yarn start --scope=@ynm/cl-crawling-loader-service




- Crawler


export HTTP_PORT=9998
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
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE="LamTT_YT"
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



LAMTT_YT_TEST
YT_IDENTITY_CRAWLER


## Những service cần chạy ở testing


+ ynm-cl-yt-post-service
+ ynm-cl-yt-crawling-loader-service

