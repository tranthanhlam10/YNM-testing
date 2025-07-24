# Threads source hot-fix
Những thông thi cần phải check

Fix: createdBy crawling loader

Update api cookie: 

+ Source post

+ Source reply

+ Repost





## Thông tin cơ bản của luồng
ThreadsSourcePostCrawlingLoader
ThreadsSourceReplyCrawlingLoader
ThreadsRepostCrawlingLoader



- source_post: 
cl.tr.source_posts_crawling_sources
cl.tr.source_posts_crawling_requests 
cl.tr.source_posts_crawled_sources

- source_replies 
cl.tr.source_replies_crawling_sources
cl.tr.source_replies_crawled_sources
cl.tr.source_replies_crawling_requests

- repost
cl.tr.reposts_crawling_sources
cl.tr.reposts_crawling_requests
cl.tr.reposts_crawled_sources



cl.mentions_2_solr_mentions
cl.posts_2_solr_tr_posts
cl.tr.identities_finish_sources


cl.(mentions_2_solr_mentions|posts_2_solr_tr_posts|tr.identities_finished_sources|tr.source_posts_crawling_sources|identities_2_redis_identities|identities_2_solr_identities|tr.source_posts_crawling_requests|tr.source_posts_crawled_sources|tr.source_replies_crawling_sources|tr.source_replies_crawling_requests|tr.source_replies_crawled_sources|tr.reposts_crawling_sources|tr.reposts_crawling_requests|tr.reposts_crawled_sources)



Câu lệnh query các proxy crawler_type của 3 luồng:
SELECT * FROM `proxies` WHERE crawler_type IN ('TR_SOURCE_REPLY_CRAWLER','TR_SOURCE_POST_CRAWLER','TR_REPOST_CRAWLER')

SELECT * FROM `tokens` WHERE crawler_type IN ('TR_SOURCE_REPLY_CRAWLER','TR_SOURCE_POST_CRAWLER','TR_REPOST_CRAWLER')

// Câu lệnh dùng để chỉnh sửa DB
crawler_type  NOT IN ('TR_SOURCE_REPLY_CRAWLER','TR_SOURCE_POST_CRAWLER','TR_REPOST_CRAWLER') AND crawler_type  LIKE "TR_%"


TR_SOURCE_POST_CRAWLER

TR_SOURCE_POST_CRAWLER
TR_REPLY_CRAWLER
TR_REPOST_CRAWLER

**Điều kiện loader**


*Post*
Query
{
    language: 1
    platform: 10,
    -last_status: 4,
    next_crawl_time: `[* TO NOW]`
}
 
Sort
{
next_crawl_time: asc
id: asc
}

*Replies*

Query
{
    language: 1,
    platform: 10,
    -last_status: 4,
    reply_next_crawl_time: `((*:* -reply_next_crawl_time:[* TO *]) OR reply_next_crawl_time:[* TO NOW}])`
}
 
Sort
{
reply_next_crawl_time: asc
id: asc
}


*Reposts*
language:1
platform:10
-last_status:4


## Các câu lệnh chạy script

export THREADS_SOURCE_POST_CRAWLING_LOADER_CYCLE=*/5 * * * *
export THREADS_SOURCE_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export THREADS_SOURCE_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export THREADS_SOURCE_POST_CRAWLING_LOADER_LIMIT=1000
export THREADS_SOURCE_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export THREADS_SOURCE_POST_CRAWLING_LOADER_ENABLE=true
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false
### Câu lệnh chạy cho phần loader

export HTTP_PORT=9100
export GRPC_PORT=9011

export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false

export REDIS_MAX_RETRIES_PER_REQUEST=


export SOURCE_POST_CRAWLING_LOADER_CYCLE=*/5 * * * *
export SOURCE_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export SOURCE_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export SOURCE_POST_CRAWLING_LOADER_LIMIT=1000
export SOURCE_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export SOURCE_POST_CRAWLING_LOADER_ENABLE=true
export SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false

export SOURCE_REPLY_CRAWLING_LOADER_CYCLE=*/5 * * * *
export SOURCE_REPLY_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export SOURCE_REPLY_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export SOURCE_REPLY_CRAWLING_LOADER_LIMIT=1000
export SOURCE_REPLY_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export SOURCE_REPLY_CRAWLING_LOADER_ENABLE=true
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_ENABLE=false


export REPOST_CRAWLING_LOADER_CYCLE=*/5 * * * *
export REPOST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export REPOST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export REPOST_CRAWLING_LOADER_LIMIT=1000
export REPOST_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export REPOST_CRAWLING_LOADER_ENABLE=true
export REPOST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false


export THREADS_KEYWORD_POST_CRAWLING_LOADER_ENABLE=false
export THREADS_KEYWORD_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false
export THREADS_HASHTAG_POST_CRAWLING_LOADER_ENABLE=false
export THREADS_HASHTAG_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false
export THREADS_IDENTITY_CRAWLING_LOADER_ENABLE=false
export THREADS_FOLLOWERS_CRAWLING_LOADER_ENABLE=false

export POST_COMMENT_CRAWLING_LOADER_ENABLE=false
export PRIORITY_POST_COMMENT_CRAWLING_LOADER_ENABLE=false
export COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=false
export PRIORITY_COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=false
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_ENABLE=false

cd services/threads/services/crawling-loader
NODE_ENV=staging yarn start

**Các câu lệnh k8s dùng để chạy:**

hotfix-thread-source-cookie-staging-ynm-crawler-empty

kubectl config use-context lamtt-k8s-ovh

kubectl get pods -n crawler-staging | grep hotfix-thread-source-cookie-staging-ynm-crawler-empty
kubectl exec -it hotfix-thread-source-cookie-staging-ynm-crawler-empty-76f9g7qcz -n crawler-staging -- sh





### Repost:

export HTTP_PORT=9033
export GRPC_PORT=9011

export RABBIT_HEARTBEAT=10

export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false

export TOKEN_MANAGER_SERVICE_PORT=9011
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==

export MYSQL_NEWS_CONNECTION_DATABASE=monitoring_crawl

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=3

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reposts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reposts_crawling_requests

export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reposts_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts

export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts.next_page

export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data

export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_TOKEN_CUA_LAMTT
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_PROXY_CUA_LAMTT

export CRAWLER_CONFIG_PAGING_ENABLE=true

export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1

export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3

export REDIS_MAX_RETRIES_PER_REQUEST=

cd services/threads/services/repost
NODE_ENV=staging node dist/main.js

### Source_post: -> DONE

export HTRP_PORT=9010
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false

export TOKEN_MANAGER_SERVICE_PORT=9011
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==

export MYSQL_DEFAULT_CONNECTION_PORT=3306
export MYSQL_DEFAULT_CONNECTION_DATABASE=monitoring_crawl
export MYSQL_NEWS_PORT=3306
export MYSQL_NEWS_CONNECTION_DATABASE=monitoring_crawl

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_posts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_posts_crawling_requests

export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_posts_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source

export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_TOKEN_CUA_LAMTT
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_PROXY_CUA_LAMTT
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
export RESOLVER_MAX_RETRIES=3

export REDIS_MAX_RETRIES_PER_REQUEST=

cd services/threads/services/source-post
NODE_ENV=staging node dist/main.js

### Source reply:  -> DONE

export HTRP_PORT=9010
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false

export TOKEN_MANAGER_SERVICE_PORT=9011
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==

export MYSQL_DEFAULT_CONNECTION_DATABASE=crawling
export MYSQL_NEWS_CONNECTION_DATABASE=crawling

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_replies_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_replies_crawling_requests

export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_replies_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source

export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_TOKEN_CUA_LAMTT
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_PROXY_CUA_LAMTT
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
export RESOLVER_MAX_RETRIES=3

export REDIS_MAX_RETRIES_PER_REQUEST=

cd services/threads/services/source-reply
NODE_ENV=staging node dist/main.js




### Những token acc clone

ig_did=AA00882D-013C-47DB-A3DD-2A322D1D9181; mid=aAsT3gAEAAFb4Jq_b-Ua04_7ZaqP; ps_l=1; ps_n=1; csrftoken=jS8biv3ex6jdpgraEt3JrHuRrufwUl8V; ds_user_id=69772749184; sessionid=69772749184%3AJclHq3tBGd6GnU%3A4%3AAYf_UGaHKTesGtBmHe6vv0Q1Tsxj_04-0PwK5Mj38cE



ig_did=FECE44D4-C7D0-4961-AAAB-751414F9F3A2; mid=aCRHhAAEAAEmqt0MzaeXBV75_gYs; ps_l=1; ps_n=1; csrftoken=1nB7lAxumtWDPnPq5TzOsCbMismEnUYP; ds_user_id=63448193071; sessionid=63448193071%3AQRZDj9YInueYn1%3A9%3AAYczSWGanHePTiyrqw7e47DfoLaFvbYSDhqYjMLjGA; rur="CCO\05463448193071\0541781237472:01fee8877743179af0cf7604fbec951bdd8e4690830b8f1eee8dcdcd5396b11542a92dfa"


### Câu lệnh update 

UPDATE `tokens`
SET status = 'ACTIVE'



### Câu lệnh update
UPDATE tokens
SET crawler_type = 'TR_SOURCE_POST_CRAWLER'
WHERE id IN (
    SELECT id FROM (
        SELECT id 
        FROM tokens
        WHERE crawler_type = 'TR_POST_ENGAGEMENT_BY_TOPIC_CRAWLER'
          AND status = 'ACTIVE'
        LIMIT 10
    ) AS temp
);




SELECT * FROM `tokens` WHERE crawler_type LIKE "TR_TOKEN_CUA_LAMTT%" AND status = "BROKEN"




shards=20250101,20250102,20250103,20250104,20250105,20250106,20250107,20250108,20250109,20250110,20250111,20250112,20250113,20250114,20250115,20250116,20250117,20250118,20250119,20250120,20250121,20250122,20250123,20250124,20250125,20250126,20250127,20250128,20250129,20250130,20250131,20250201,20250202,20250203,20250204,20250205,20250206,20250207,20250208,20250209,20250210,20250211,20250212,20250213,20250214,20250215,20250216,20250217,20250218,20250219,20250220,20250221,20250222,20250223,20250224,20250225,20250226,20250227,20250228,20250301,20250302,20250303,20250304,20250305,20250306,20250307,20250308,20250309,20250310,20250311,20250312,20250313,20250314,20250315,20250316,20250317,20250318,20250319,20250320,20250321,20250322,20250323,20250324,20250325,20250326,20250327,20250328,20250329,20250330,20250331,20250401,20250402,20250403,20250404,20250405,20250406,20250407,20250408,20250409,20250410,20250411,20250412,20250413,20250414,20250415,20250416,20250417,20250418,20250419,20250420,20250421,20250422,20250423,20250424,20250425,20250426,20250427,20250428,20250429,20250430,20250501,20250502,20250503,20250504,20250505,20250506,20250507,20250508,20250509,20250510,20250511,20250512,20250513,20250514,20250515,20250516,20250517,20250518,20250519,20250520,20250521,20250522,20250523,20250524,20250525,20250526,20250527,20250528,20250529,20250530,20250531,20250601,20250602,20250603,20250604,20250605,20250606,20250607,20250608,20250609,20250610,20250611,20250612,20250613,20250614,20250615,20250616,20250617,20250618,20250619,20250620,20250621,20250622,20250623,20250624,20250625,20250626,20250627,20250628,20250629,20250630,20250701,20250702,20250703,20250704,20250705,20250706,20250707,20250708,20250709,20250710,20250711,20250712,20250713,20250714,20250715,20250716,20250717,20250718,20250719,20250720,20250721,20250722


{
  "id": "63472089649",
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
  "last_data_date": null,
  "from_date": "1719993793",
  "to_date": "1751529793",
  "platform": 10,
  "createdBy": "ThreadsSourcePostCrawlingLoader",
  "link": "threads.net/@miule5791",
  "id_social": "63472089649"
}



{
  "id": "63472089649",
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
  "last_data_date": "2024-12-02T03:38:57.077Z",
  "from_date": "1733110737",
  "to_date": "1753166632",
  "platform": 10,
  "createdBy": "ThreadsSourcePostCrawlingLoader",
  "link": "threads.net/@miule5791",
  "id_social": "63472089649"
}





{
  "id": "63208655667",
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
  "last_data_date": "2024-12-02T03:38:57.077Z",
  "from_date": "1733110737",
  "to_date": "1753166632",
  "platform": 10,
  "createdBy": "ThreadsSourceReplyCrawlingLoader",
  "link": "threads.net/@peach_jaye_a1j",
  "id_social": "63208655667"
}




{
  "id": "tr_63098113013",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 5
    },
    {
      "lte": 1440,
      "delay": 24
    },
    {
      "lte": 999999999,
      "delay": 48
    }
  ],
  "last_data_date": "2025-05-01T08:03:07.662Z",
  "from_date": "2025-06-30T02:45:52.000Z",
  "to_date": "1751529785",
  "platform": 10,
  "createdBy": "ThreadsRepostCrawlingLoader",
  "repost_no_cookie_last_date": "2025-06-30T02:45:52.000Z"
  "link": "threads.net/@misthyyyy",
  "startedCrawling": "2025-07-03T08:03:05.897Z",
  "id_social": "63098113013",
  "default_data_duration": "2024-07-03T08:03:05.897Z"
}



###
Nguyên nhân:
Lúc gọi crawl -> max response time = 60s (API graph)
export TR_GRAPH_SERVICE_MAX_RETRIES=10 -> Dẫn tới > max response time và ở trường hơp này max retry không tăng lên được 10 -> Nên không đẩy qua crawled được


