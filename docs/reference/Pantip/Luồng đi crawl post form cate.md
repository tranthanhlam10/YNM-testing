# Luồng đi crawl post form cate 


## Những cases cần kiểm tra

1. Loader

- Có load đúng từ monitor_sources/monitor_news_cate hay không -> Hiện đã load đúng -> DONE
- CÓ lưu cursor ở mySQL k -> Có lưu, nhưng ở chỗ last_crawl không biết đang lưu đúng hay không
- Có cache lại đúng key ở Redis hay không -> Hiện tại đã lưu đúng id của cate
- Có đúng format message loader hay không -> Cần confirm lại last_data_date/from_date/to_date
- Có load được nhiều message hay không- > DONE


2. Crawler
- Crawl bằng proxy, thì khi crawl nhiều có bị block hay không -> 
- Đi next_pages như nào, logic đi next page, điểm dừng là khi nào
- Số lượng bài lấy là bao nhiêu, có lấy đúng số lượng hay không
- Có bao nhiêu dạng bài trên pantip -> Ứng với dạng bài đó thì có những field nào cần phải lưu ý
- Kiểm tra crawl 1 link sai thì hệ thống sẽ xử lý như nào


3. Resover
- Kiểm tra mapping có đúng hay không
- Kiểm tra crawl 



### Post

| STT | Schema Field | Pantip API field |
| --- | --- | --- |
| 1 | id | topic_id -> build link -> hash uuid |
| 2 | link | [pantip.com/topic/](https://www.google.com/search?q=https://pantip.com/topic/){topic_id} |
| 3 | id_social | topic_id |
| 4 | id_source | Tự tạo id riêng cho mỗi room (room trả về từ nền tảng là text) |
| 5 | country_code | "th" |
| 6 | source_type | 1 |
| 7 | crawled_date | now |
| 8 | created_date | created_time |
| 9 | likes | votes_count |
| 10 | comments | comments_count |
| 11 | attachment_url | thumbnail_url |




## Thông tin luồng chạy


1. Queue
cl.pt.category_posts_crawling_sources|cl.pt.category_posts_crawling_requests|cl.pt.category_posts_crawled_sources|cl.news.category_links_finished_sources|cl.posts_2_mongo_pt_posts|cl.mentions_2_solr_mentions_LamTT|cl.pt.category_posts_crawling_requests_next_pages|cl.identities_2_redis_identities_LamTT


2. Deployment

ynmshgysg-1009-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmshgysg-1009-testing-ynm-crawler-empty
kubectl exec -it ynmshgysg-1009-testing-ynm-crawler-empty-7cb5788455-hp78m  -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local



3. Câu lệnh chạy


PtCategoryPostsCrawlingLoader


- Loader:


export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
   
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
   
export RABBIT_HEARTBEAT=10
 
export PT_CATEGORY_POSTS_CRAWLING_LOADER_ENABLE=true
export PANTIP_MODULE_ENABLED=true
 
export NODE_ENV=testing
 
yarn start --scope=@ynm/cl-crawling-loader-service



- Crawler

export HTTP_PORT=9910
  
export LOG_LEVEL=debug
 
export  REDIS_HOST=192.168.1.103
export  REDIS_PORT=6393
export  REDIS_USERNAME=data_ynm_crawler_use_identity
export  REDIS_PASSWORD=TzdcdL6SCIyFdLM
export  REDIS_DB=1
 
export PT_GRAPH_SERVICE_TIMEOUT=30000
export PT_GRAPH_SERVICE_MAX_RETRIES=3
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.pt.category_posts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.pt.category_posts_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.14.*.*.category_posts
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.pt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.pt.category_posts_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.14.*.*.category_posts.next_page
 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_RESOLVED_DATA_ROUTING_KEY=cl.14.category_posts
 
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TT_POST_TRANSCRIPT_CRAWLER
 
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
export BUILDER_BATCH_SIZE=1
export BUILDER_WAIT_FOR_BATCH=false
 
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
 
export NODE_ENV=testing
 
yarn start --scope=@ynm/cl-pt-category-posts-crawler-service



- Data pusher

export HTTP_PORT=9064
 
export PROFILE_2_SOLR_IDENTITY_ENABLE=true
export PROFILE_2_SOLR_IDENTITY_ENABLE_REDIS_SERVICE=false
export PROFILE_2_SOLR_IDENTITY_INPUT_EXCHANGE=cl.resolved_data
export PROFILE_2_SOLR_IDENTITY_ROUTING_KEY=cl.*.identities
export PROFILE_2_SOLR_IDENTITY_INPUT_QUEUE=cl.identities_2_solr_identities
export PROFILE_2_SOLR_IDENTITY_CONCURRENCY=5
export PROFILE_2_SOLR_IDENTITY_BATCH_SIZE=100
export PROFILE_2_SOLR_IDENTITY_MAX_WAITING_TIME=60
export PROFILE_2_SOLR_IDENTITY_PREFETCH_MESSAGES=1000
 
export PROFILE_2_REDIS_IDENTITY_ENABLE=true
export PROFILE_2_REDIS_IDENTITY_ENABLE_REDIS_SERVICE=false
export PROFILE_2_REDIS_IDENTITY_INPUT_EXCHANGE=cl.resolved_data
export PROFILE_2_REDIS_IDENTITY_ROUTING_KEY=cl.*.identities
export PROFILE_2_REDIS_IDENTITY_INPUT_QUEUE=cl.identities_2_redis_identities
export PROFILE_2_REDIS_IDENTITY_CONCURRENCY=5
export PROFILE_2_REDIS_IDENTITY_BATCH_SIZE=100
export PROFILE_2_REDIS_IDENTITY_MAX_WAITING_TIME=60
export PROFILE_2_REDIS_IDENTITY_PREFETCH_MESSAGES=1000
 
export MENTION_2_SOLR_MENTION_ENABLE=true
export MENTION_2_SOLR_MENTION_ENABLE_REDIS_SERVICE=false
export MENTION_2_SOLR_MENTION_INPUT_EXCHANGE=cl.resolved_data
export MENTION_2_SOLR_MENTION_ROUTING_KEY=cl.*.*.*.mentions
export MENTION_2_SOLR_MENTION_INPUT_QUEUE=cl.mentions_2_solr_mentions
export MENTION_2_SOLR_MENTION_CONCURRENCY=5
export MENTION_2_SOLR_MENTION_BATCH_SIZE=100
export MENTION_2_SOLR_MENTION_MAX_WAITING_TIME=60
export MENTION_2_SOLR_MENTION_PREFETCH_MESSAGES=1000
 
export POST_2_MONGO_PT_POST_ENABLE=true
export POST_2_MONGO_PT_POST_ENABLE_REDIS_SERVICE=false
export POST_2_MONGO_PT_POST_INPUT_EXCHANGE=cl.resolved_data
export POST_2_MONGO_PT_POST_ROUTING_KEY=cl.14.posts
export POST_2_MONGO_PT_POST_INPUT_QUEUE=cl.posts_2_mongo_pt_posts
 
export MONGO_CONNECTION_DEFAULT_ENABLE=true
export MONGO_CONNECTION_DEFAULT_HOST=mongos-router.ynm.local
export MONGO_CONNECTION_DEFAULT_PORT=27017
export MONGO_CONNECTION_DEFAULT_USERNAME=data_minhtk
export MONGO_CONNECTION_DEFAULT_PASSWORD=yy7k18L0Eisj
export MONGO_CONNECTION_DEFAULT_DATABASE=ynm_crawler_testing
export MONGO_CONNECTION_DEFAULT_REPLICA_SET=
export MONGO_CONNECTION_DEFAULT_AUTH_SOURCE=ynm_crawler_testing
  
NODE_ENV=testing yarn start --scope=@ynm/cl-data-pusher-service


4. Proxy token


PANTIP_CATEGORY_POSTS_CRAWLER






5. Data test


{
  "id": 439882,
  "categoryInfo": {
    "id": 439882,
    "link": "https://pantip.com/forum/food",
    "curr_page_link": "",
    "first_page_next_crawl_time": "2026-05-14T09:52:32.000Z",
    "platform": 14
  },
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 72,
      "delay": 18
    },
    {
      "lte": 144,
      "delay": 24
    },
    {
      "lte": 999999999,
      "delay": 48
    }
  ],
  "last_data_date": "2025-05-22T04:20:16.024Z",
  "from_date": "1747887616",
  "to_date": "1779423616",
  "createdBy": "PtCategoryPostsCrawlingLoader"
}





