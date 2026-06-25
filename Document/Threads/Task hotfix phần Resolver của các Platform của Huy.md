# Task hotfix phần Resolver của các Platform của Huy



## Thông tin deployment

ynmpdp-6033-staging-ynm-crawler-empty


- deployment đang lỗi ở Staging:


ynm-cl-tr-repost-no-cookie-service-staging



## Danh sách các queue




## Câu lệnh chạy

export HTTP_PORT=9044
export GRPC_PORT=9011

export RABBIT_HEARTBEAT=10

export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false


export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==

export MYSQL_NEWS_CONNECTION_DATABASE=monitoring_crawl

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reposts_no_cookie_crawling_requests

export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie

export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie.next_page

export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data

export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_REPOST_CRAWLER

export CRAWLER_CONFIG_PAGING_ENABLE=true

export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=10

export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3

export REDIS_MAX_RETRIES_PER_REQUEST=


cd services/threads/services/repost
NODE_ENV=staging node dist/main.js









export HTTP_PORT=9995
export LOG_LEVEL=debug
 

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reposts_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=LAMTT_TEST_TR
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
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
 
yarn start --scope=@ynm/cl-tr-repost-crawler-service





## Message dù để test



{
  "id": "tr_63608336239",
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
  "last_data_date": null,
  "from_date": "1744790723",
  "to_date": "1747382723",
  "platform": 10,
  "createdBy": "ThreadsRepostNoCookieCrawlingLoader",
  "link": "threads.net/@lamminnhoo_",
  "startedCrawling": "2025-05-16T08:05:23.098Z",
  "id_social": "63608336239",
  "default_data_duration": "2025-04-16T08:05:23.098Z"
}



{
    "id": "tr_63608336239",
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
    "last_data_date": "2026-06-16T09:25:32Z",
    "from_date": "1781601932",
    "to_date": "1781666085",
    "platform": 10,
    "createdBy": "ThreadsRepostNoCookieCrawlingLoader",
    "link": "threads.net/@lamminnhoo_",
    "startedCrawling": "2026-06-17T03:14:45.903Z",
    "default_data_duration": "2025-06-17T03:14:45.903Z",
    "id_social": "63608336239",
    "is_first_crawled": false,
    "mapping_id": "63608336239",
    "username": "lamminnhoo_"
  }




https://www.threads.com/@quynhanhshyn_/reposts

lamminnhoo_

{
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
  "retries": 0,
  "id": "tr_63396643669",
  "last_data_date": "2026-06-16T09:25:32Z",
  "from_date": "1781601932",
  "to_date": "1781666085",
  "platform": 10,
  "createdBy": "ThreadsRepostNoCookieCrawlingLoader",
  "link": "threads.net/@_sakura_yamayuki_",
  "startedCrawling": "2026-06-17T03:14:45.903Z",
  "default_data_duration": "2025-06-17T03:14:45.903Z",
  "id_social": "63396643669",
  "is_first_crawled": false,
  "mapping_id": "63396643669",
  "username": "_sakura_yamayuki_",
  "props": {
    "id": "tr_63396643669",
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
    "last_data_date": "2026-06-16T09:25:32Z",
    "from_date": "1781601932",
    "to_date": "1781666085",
    "platform": 10,
    "createdBy": "ThreadsRepostNoCookieCrawlingLoader",
    "link": "threads.net/@_sakura_yamayuki_",
    "startedCrawling": "2026-06-17T03:14:45.903Z",
    "default_data_duration": "2025-06-17T03:14:45.903Z",
    "id_social": "63396643669",
    "is_first_crawled": false,
    "mapping_id": "63396643669",
    "username": "_sakura_yamayuki_"
  }
}







{
    "id": "tr_63396643669",
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
    "last_data_date": "2026-05-01T09:25:32Z",
    "from_date": "1746088432",
    "to_date": "1781666085",
    "platform": 10,
    "createdBy": "ThreadsRepostNoCookieCrawlingLoader",
    "link": "threads.net/@_sakura_yamayuki_",
    "startedCrawling": "2026-05-01T03:14:45.903Z",
    "default_data_duration": "2025-06-17T03:14:45.903Z",
    "id_social": "63396643669",
    "is_first_crawled": false,
    "mapping_id": "63396643669",
    "username": "_sakura_yamayuki_"
  }