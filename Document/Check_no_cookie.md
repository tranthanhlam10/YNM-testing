# Nguyên tắc để check task này
Nếu như các luồng trên trả ra các identity có id instagram -> đánh last_status bằng 4 

pod: threads-source-no-cookie-staging-ynm-crawler-empty
kubectl get pods -n crawler-staging | grep threads-source-no-cookie-staging-ynm-crawler-empty
kubectl exec -it threads-source-no-cookie-staging-ynm-crawler-empty-5fc6b65wnt4m -n crawler-staging -- sh


## Cách test 
1. Tìm kiếm proxy để chạy
2. Bật song song các luồng 
3. Sau khi crawl, vào queue identity, nếu như ở đó có crawler_type source_post hoặc source_reply thì check 
4. Thử xem các API và ở giao diện sẽ trả ra id như nào, cần lấy API cho chính xác 

### loader
fq=platform:10
fq=language:1
fq=-last_status:4
fq=next_crawl_time:[* TO NOW-1MONTH]



ThreadsSourcePostNoCookieCrawlingLoader

Các crawler_type cần dump 
TR_SOURCE_POST_CRAWLER
TR_SOURCE_REPLY_CRAWLER


ThreadsSourcePostNoCookieCrawlingLoader
ThreadsSourceReplyNoCookieCrawlingLoader


SELECT * FROM `proxies` WHERE crawler_type = "TR_SOURCE_REPLY_CRAWLER" 

UPDATE `proxies` SET crawler_type = 'TR_SOURCE_POST_CRAWLER' WHERE crawler_type = 'FB_PAGE_WEB_COMMENT_CRAWLER' LIMIT 45
UPDATE `proxies` SET crawler_type = 'TR_SOURCE_REPLY_CRAWLER' WHERE crawler_type = 'FB_PAGE_WEB_COMMENT_CRAWLER' LIMIT 45

crawler_type LIKE "TR_SOURCE_POST_CRAWLER" OR crawler_type LIKE "TR_SOURCE_REPLY_CRAWLER" 

cl.mentions_2_solr_mentions
cl.posts_2_solr_tr_posts
cl.tr.identities_finish_sources


- source_post: 
cl.tr.source_posts_no_cookie_crawling_sources
cl.tr.source_posts_no_cookie_crawling_requests 
cl.tr.source_posts_no_cookie_crawled_sources

- source_replies 
cl.tr.source_replies_no_cookie_crawling_sources
cl.tr.source_replies_no_cookie_crawled_sources
cl.tr.source_replies_no_cookie_crawling_requests


cl.(mentions_2_solr_mentions|posts_2_solr_tr_posts|tr.identities_finished_sources|tr.source_posts_no_cookie_crawling_sources|tr.source_posts_no_cookie_crawling_requests|tr.source_posts_no_cookie_crawled_sources|tr.source_replies_no_cookie_crawling_sources|tr.source_replies_no_cookie_crawling_requests|tr.source_replies_no_cookie_crawled_sources)





kubectl get pods -n crawler-staging | grep threads-source-no-cookie-staging-ynm-crawler-empty
kubectl exec -it threads-source-no-cookie-staging-ynm-crawler-empty-5fc6b65wnt4m -n crawler-staging -- sh


## Source_post:

export HTTP_PORT=9010
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false

export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==

export MYSQL_DEFAULT_CONNECTION_PORT=3306
export MYSQL_DEFAULT_CONNECTION_DATABASE=monitoring_crawl
export MYSQL_NEWS_PORT=3306
export MYSQL_NEWS_CONNECTION_DATABASE=monitoring_crawl

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_posts_no_cookie_crawling_requests

export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source

export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_SOURCE_POST_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true

export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=15

export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3

export REDIS_MAX_RETRIES_PER_REQUEST=

cd services/threads/services/source-post

NODE_ENV=staging node dist/main.js

## Source reply:

export HTTP_PORT=9033
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false

export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==

export MYSQL_DEFAULT_CONNECTION_DATABASE=crawling
export MYSQL_NEWS_CONNECTION_DATABASE=crawling

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_replies_no_cookie_crawling_requests

export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source

export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_SOURCE_REPLY_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=false

export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=15

export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3

export REDIS_MAX_RETRIES_PER_REQUEST=
cd services/threads/services/source-reply

NODE_ENV=staging node dist/main.js




### Những identity bị lỗi (nghi ngờ đó là id instagram)
[
  {
    "id": "tr_1485464339",
    "reply_updated_at": 1747213839,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_11902518540",
    "post_updated_at": 1747213249,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader"
  },
  {
    "id": "tr_13110199221",
    "reply_updated_at": 1747212808,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_1234297538",
    "reply_updated_at": 1747213822,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_1234297538",
    "reply_updated_at": 1747213822,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_1461902386",
    "reply_updated_at": 1747215335,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_1161318371",
    "reply_updated_at": 1747216275,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_1472964", -> Link user ở solr là: threads.net/@adxlib -> Hiện tại user đang private -> 
    "reply_updated_at": 1747214932,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_12127719348", -> Link user ở solr là: threads.net/@itsdiole -> Hiện tại user đang private -> Nhưng call API detect source vẫn trả ra response
    "reply_updated_at": 1747214866,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_1235890533", -> Link user ở solr là: threads.net/@ndtnguyen2211 -> Hiện tại user đang private -> Nhưng call API detect source vẫn trả ra response 
    "post_updated_at": 1747213887,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader"
  },
  {
    "id": "tr_11902518540", -> Link user ở solr là: threads.net/@_n.tzri19_ -> Hiện tại user không tìm thấy -> Nhưng call API detect source vẫn trả ra response
    "reply_updated_at": 1747216907,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_1235890533",  -> Link user ở solr là: threads.net/@ndtnguyen2211 -> Hiện tại user đang private -> Nhưng call API detect source vẫn trả ra response 
    "reply_updated_at": 1747217367,
    "last_status": 4,
    "platform": 10,
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  }
]

### Những identity không bị lỗi 

[
  {
    "id": "tr_11196331411",
    "reply_updated_at": 1747217146,
    "last_status": 0,
    "platform": 10,
    "reply_last_date": "2025-02-08T22:49:07.000Z",
    "reply_next_crawl_time": "2025-05-15T18:05:46.630Z",
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_1462025095",
    "reply_updated_at": 1747217148,
    "last_status": 0,
    "platform": 10,
    "reply_last_date": "2024-05-14T08:39:42.432Z",
    "reply_next_crawl_time": "2025-05-15T18:05:48.319Z",
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_1305144321",
    "reply_updated_at": 1747217167,
    "last_status": 0,
    "platform": 10,
    "reply_last_date": "2025-05-01T14:03:08.000Z",
    "reply_next_crawl_time": "2025-05-14T14:06:07.690Z",
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_12323830738",
    "post_updated_at": 1747217446,
    "last_status": 0,
    "platform": 10,
    "post_last_date": "2024-10-31T12:53:42.000Z",
    "next_crawl_time": "2025-05-15T18:10:46.577Z",
    "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader"
  },
  {
    "id": "tr_11329306904",
    "post_updated_at": 1747217461,
    "last_status": 0,
    "platform": 10,
    "post_last_date": "2024-11-14T10:26:55.000Z",
    "next_crawl_time": "2025-05-15T18:11:01.355Z",
    "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader"
  },
  {
    "id": "tr_14478190435",
    "reply_updated_at": 1747217485,
    "last_status": 0,
    "platform": 10,
    "reply_last_date": "2025-05-07T17:18:55.000Z",
    "reply_next_crawl_time": "2025-05-14T14:11:25.120Z",
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_14471624131",
    "reply_updated_at": 1747217478,
    "last_status": 0,
    "platform": 10,
    "reply_last_date": "2025-05-03T03:14:53.000Z",
    "reply_next_crawl_time": "2025-05-14T14:11:18.735Z",
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_1447944397",
    "reply_updated_at": 1747217491,
    "last_status": 0,
    "platform": 10,
    "reply_last_date": "2025-05-05T16:01:26.000Z",
    "reply_next_crawl_time": "2025-05-14T14:11:31.483Z",
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_1448082381",
    "reply_updated_at": 1747217497,
    "last_status": 0,
    "platform": 10,
    "reply_last_date": "2025-01-08T19:12:10.000Z",
    "reply_next_crawl_time": "2025-05-15T18:11:37.985Z",
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  },
  {
    "id": "tr_144816567",
    "reply_updated_at": 1747217523,
    "last_status": 0,
    "platform": 10,
    "reply_last_date": "2025-04-21T05:42:57.000Z",
    "reply_next_crawl_time": "2025-05-14T14:12:03.804Z",
    "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
  }
]


no-c: 63232326284 - 63232326284
have-c: 63232326284 - 63232326284

63232326284

// Trước khi Threads migrate  
3540647487 _> TH (Có thể là id Threads)
A -> Id này là id IG 



no-c: 63232326284
have-c: 63232326284


{
        "id":"tr_3540647487",
        "next_crawl_time":"2024-12-13T15:06:49.948Z",
        "domain":"threads.net",
        "link":"threads.net/@m_cbi131",
        "platform":10,
        "updated_at":"2024-12-13T14:51:49.948Z",
        "last_status":4,
        "id_social":"3540647487",
        "post_updated_at":1734806571,
        "fullname":"m_cbi131",
        "created_date":"2024-12-13T14:51:49.709Z"}

Case này là bị case tương tự như anh tấn gửi 


#### Những id cần đạt biệt chú ý
đây em
tr_62109929445
https://www.threads.com/@boiboi7860
72513499082

- có cookie : 72513499082
- no cookie:  72513499082

Thread post
{
  "id": "62109929445",
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
  "last_data_date": "2024-05-15T07:19:01.476Z",
  "from_date": "1715757541",
  "to_date": "1747293541",
  "platform": 10,
  "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader"
}


{
  "id": "72513499082",
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
  "last_data_date": "2024-05-15T07:19:01.476Z",
  "from_date": "1715757541",
  "to_date": "1747293541",
  "platform": 10,
  "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader"
}

Thread reply
{
  "id": "62109929445",
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
  "last_data_date": "2024-05-15T08:15:32.335Z",
  "from_date": "1715760932",
  "to_date": "1747296932",
  "platform": 10,
  "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
}



{
  "id": "72513499082",
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
  "last_data_date": "2024-05-15T08:15:32.335Z",
  "from_date": "1715760932",
  "to_date": "1747296932",
  "platform": 10,
  "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader"
}


