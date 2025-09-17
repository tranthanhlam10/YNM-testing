# Hotfix identity cho Threads



TR_PROXY_CUA_LAMTT
TR_KEYWORD_POST_NO_COOKIE_CRAWLER
TR_SOURCE_POST_NO_COOKIE_CRAWLER
## Luồng Hastag Keyword



// Keyword  -> Hiện tại luồng keyword đã crawl thành công -> Không thấy bị lỗi cũng như bị block nhiều
export HTTP_PORT=9055
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
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_KEYWORD_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_KEYWORD_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_SOURCE_POST_NO_COOKIE_CRAWLER
 
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=10
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=10
 
export REDIS_CACHE_HOST=192.168.0.170
export REDIS_CACHE_PORT=6390
export REDIS_CACHE_DB=1
export REDIS_CACHE_USERNAME=data_ynm_crawler
export REDIS_CACHE_PASSWORD=cQXf21j9LU5fm5V205MD
 
 
export REDIS_POST_USERNAME=data_ynm_crawler_use_cache_post
export REDIS_POST_PASSWORD=FAr7xW52hqP6
export REDIS_POST_HOST=192.168.0.170
export REDIS_POST_PORT=6390
export REDIS_POST_DATABASE=12
 
NODE_ENV=staging yarn start --scope=@ynm/cl-tr-keyword-post-crawler-service



// Hashtag -> 
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
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.hashtag_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.hashtag_posts_no_cookie_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.hashtag_posts_no_cookie_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_SOURCE_POST_NO_COOKIE_CRAWLER
 
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
 
export REDIS_CACHE_HOST=192.168.0.170
export REDIS_CACHE_PORT=6390
export REDIS_CACHE_DB=1
export REDIS_CACHE_USERNAME=data_ynm_crawler
export REDIS_CACHE_PASSWORD=cQXf21j9LU5fm5V205MD
 
 
export REDIS_POST_USERNAME=data_ynm_crawler_use_cache_post
export REDIS_POST_PASSWORD=FAr7xW52hqP6
export REDIS_POST_HOST=192.168.0.170
export REDIS_POST_PORT=6390
export REDIS_POST_DATABASE=12
 
NODE_ENV=staging yarn start --scope=@ynm/cl-tr-hashtag-post-crawler-service

## Luồng Source

// Source Post


export HTTP_PORT=9997
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_posts_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_SOURCE_REPLY_POST_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=10
 
export RESOLVER_ENABLE=false
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=10
export RESOLVER_MAX_RETRIES=3

export REDIS_CACHE_HOST=192.168.0.170
export REDIS_CACHE_PORT=6390
export REDIS_CACHE_DB=1
export REDIS_CACHE_USERNAME=data_ynm_crawler
export REDIS_CACHE_PASSWORD=cQXf21j9LU5fm5V205MD
 
 
export REDIS_POST_USERNAME=data_ynm_crawler_use_cache_post
export REDIS_POST_PASSWORD=FAr7xW52hqP6
export REDIS_POST_HOST=192.168.0.170
export REDIS_POST_PORT=6390
export REDIS_POST_DATABASE=12
 
NODE_ENV=staging yarn start --scope=@ynm/cl-tr-source-post-crawler-service

// Source Reply
export HTTP_PORT=9999
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_replies_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=5
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=5
export RESOLVER_MAX_RETRIES=3


export REDIS_CACHE_HOST=192.168.0.170
export REDIS_CACHE_PORT=6390
export REDIS_CACHE_DB=1
export REDIS_CACHE_USERNAME=data_ynm_crawler
export REDIS_CACHE_PASSWORD=cQXf21j9LU5fm5V205MD
 
 
export REDIS_POST_USERNAME=data_ynm_crawler_use_cache_post
export REDIS_POST_PASSWORD=FAr7xW52hqP6
export REDIS_POST_HOST=192.168.0.170
export REDIS_POST_PORT=6390
export REDIS_POST_DATABASE=12
 
yarn start --scope=@ynm/cl-tr-source-reply-crawler-service

// Repost

export HTTP_PORT=9995
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reposts_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
export BUILDER_ENABLE=false
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=10
 
export RESOLVER_ENABLE=false
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
 
yarn start --scope=@ynm/cl-tr-repost-crawler-service


# Cách chạy

ynmpdp-5370-staging-ynm-crawler-empty
kubectl get pods -n crawler-staging | grep ynmpdp-5370-staging-ynm-crawler-empty
kubectl exec -it ynmpdp-5370-staging-ynm-crawler-empty-789b647566-5bn2j -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh



// Câu SQL update crawler_type

UPDATE ynm_proxies.proxies
SET crawler_type = 'TR_SOURCE_REPLY_NO_COOKIE_CRAWLER'
WHERE crawler_type = 'TR_SOURCE_POST_NO_COOKIE_CRAWLER';


# Mục tiêu của task
Giảm được việc push data trùng lặp trên Solr           
Giảm được việc push data trùng vào luồng reply crawl post
Đồng bộ lại tất cả Id User của Platform Threads trong luồng Hashtag/Keyword no cookie

# Giải pháp
Thêm phần cache và kiểm tra data sau khi crawl được post/reply từ hashtag/keyword trước khi đẩy qua queue push vào Solr
Thêm việc block source khi push vào luồng reply crawl post tương tự phần crawling loader
Thêm api lấy id Threads từ username



-> Thật tế scope test của task này là tránh Proxy bị BLOCKED quá nhiều, và nếu có mapping_id của User, nếu bị lỗi thì đi tiếp chứ không quay lại từ đầu
## Cách test

- Hiện tại chỉ cần lấy message dừng ở crawled source -> Sau đó chỉnh username bị lỗi
- Cuối cùng là chạy bạt resolver lên chạy tiếp -> Phải hoạt động đúng expected result của Đồng


Tối ưu lại mapping id bằng cách khi gọi lỗi và chỉ tiếp tục thực hiện crawl từ bước lỗi của lần crawl trước.
Ví dụ threads keyword: 
+ Lần đầu crawl: crawl được 10 post/replies -> bắt đầu mapping theo từng user -> Đến user thứ 5 -> bị lỗi -> retry max -> đẩy về crawled source -> crawl lại
+ Lần crawl lại: đã có 10 post/replies -> ko crawl bước này -> đã mapping đến user thứ 5 -> tiếp tục tại bước này
Đánh last_status = 4 cho các user có post nhưng xem trang cá nhân trên web không được

## Những message mẫu


// Luồng keyword
{
  "id": 3513934,
  "retries": 0,
  "type": "CRISIS_TRACKING",
  "delay_time_rules": [],
  "last_data_date": "2024-09-05T07:40:00.734Z",
  "from_date": "1725522000",
  "to_date": "1757058000",
  "platform": 10,
  "createdBy": "ThreadsHashtagPostNoCookieCrawlingLoader",
  "startedCrawling": "2025-09-05T07:40:00.734Z",
  "hashtag": "duongdomic",
  "hashtagId": "18441738994043575"
}



{
  "id": 3513935,
  "retries": 0,
  "type": "CRISIS_TRACKING",
  "delay_time_rules": [],
  "last_data_date": "2024-09-05T07:41:05.531Z",
  "from_date": "1725522065",
  "to_date": "1757058065",
  "platform": 10,
  "createdBy": "ThreadsHashtagPostNoCookieCrawlingLoader",
  "startedCrawling": "2025-09-05T07:41:05.531Z",
  "hashtag": "Taylor Swift",
  "hashtagId": "18399060100039192"
}

// Luồng hashtag

[
  {
    "sources": [
      {
        "delay_time_rules": [],
        "retries": 0,
        "id": 3513935,
        "type": "CRISIS_TRACKING",
        "last_data_date": "2024-09-05T07:41:05.531Z",
        "from_date": "1725522065",
        "to_date": "1757058065",
        "platform": 10,
        "createdBy": "ThreadsHashtagPostNoCookieCrawlingLoader",
        "startedCrawling": "2025-09-05T07:41:05.531Z",
        "hashtag": "Taylor Swift",
        "hashtagId": "18399060100039192"
      }
    ],
    "batch": {
      "requestOptions": {
        "requestHashtagOptions": {
          "headers": {
            "Accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
            "Accept-Language": "vi ",
            "Accept-Encoding": "gzip, deflate",
            "x-csrftoken": "0b0ayYHsFTLxqF5MEniu7x"
          },
          "body": "",
          "endpoint": "https://www.threads.net/search?q=Taylor%20Swift&serp_type=tags&filter=recent&tag_id=18399060100039192",
          "isNoCookieFlow": true,
          "method": "GET"
        }
      }
    },
    "msg": {
      "fields": {
        "consumerTag": "amq.ctag-6ipAf9UnaphdT3VHJVnUAg",
        "deliveryTag": 5,
        "redelivered": false,
        "exchange": "",
        "routingKey": "staging.cl.tr.hashtag_posts_no_cookie_crawling_requests"
      },
      "properties": {
        "headers": {},
        "deliveryMode": 2
      }
    }
  }
]


// Luồng source post

  {
    "source": {
      "id": "65349095089",
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
      "last_data_date": "2025-07-05T00:32:05Z",
      "from_date": "1751675525",
      "to_date": "1756223053",
      "platform": 10,
      "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader",
      "link": "threads.net/@lee.mylink",
      "id_social": "65349095089",
      "is_first_crawled": false,
      "mapping_id": "65349095089",
      "username": "lee.mylink"
    }}


    {
  "sources": [
    {
      "id": "65695826126",
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
      "last_data_date": "2025-07-19T18:47:08Z",
      "from_date": "1752950828",
      "to_date": "1756222720",
      "platform": 10,
      "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader",
      "link": "threads.net/@rah_jaaa",
      "id_social": "65695826126",
      "is_first_crawled": false,
      "username": "rah_jaaa"
    }
  ],
  "batch": [
    {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
        "x-ig-app-id": "238260118697367",
        "x-logged-out-threads-migrated-request": "true"
      },
      "body": "fb_api_caller_class=RelayModern&fb_api_req_friendly_name=BarcelonaUsernameHovercardImplDirectQuery&variables=%7B%22username%22%3A%22rah_jaaa%22%2C%22__relay_internal__pv__BarcelonaIsInternalUserrelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaIsLoggedInrelayprovider%22%3Atrue%2C%22__relay_internal__pv__BarcelonaHasSpoilerStylingInforelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaShouldShowFediverseM075Featuresrelayprovider%22%3Atrue%7D&server_timestamps=true&doc_id=9425696887539459"
    },
    {
      "headers": {
        "accept": "*/*",
        "accept-language": "en-US,en;q=0.9",
        "content-type": "application/x-www-form-urlencoded",
        "sec-fetch-site": "same-origin",
        "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/133.0.0.0 Safari/537.36 Edg/133.0.0.0",
        "x-ig-app-id": "238260118697367",
        "x-logged-out-threads-migrated-request": "true"
      },
      "body": "method=post&locale=vi_VN&pretty=true&format=json&purpose=fetch&fb_api_req_friendly_name=BarcelonaProfileThreadsTabDirectQuery&variables=%7B%22first%22%3A15%2C%22userID%22%3A%2265695826126%22%2C%22__relay_internal__pv__BarcelonaIsLoggedInrelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaHasSelfReplyContextrelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaHasInlineReplyComposerrelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaIsSearchDiscoveryEnabledrelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaOptionalCookiesEnabledrelayprovider%22%3Atrue%2C%22__relay_internal__pv__BarcelonaHasSpoilerStylingInforelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaQuotedPostUFIEnabledrelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaIsCrawlerrelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaHasDisplayNamesrelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaCanSeeSponsoredContentrelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaShouldShowFediverseM075Featuresrelayprovider%22%3Afalse%2C%22__relay_internal__pv__BarcelonaIsInternalUserrelayprovider%22%3Afalse%7D&server_timestamps=true&doc_id=9605580269539982"
    }
  ]
}

Hiện tại đã gắng field mapping_id vào source -> Nếu lỗi thì tránh gọi lại, phí token 

