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


cl.(mentions_2_solr_mentions|posts_2_solr_tr_posts|tr.identities_finished_sources|tr.source_posts_crawling_sources|tr.source_posts_crawling_requests|tr.source_posts_crawled_sources|tr.source_replies_crawling_sources|tr.source_replies_crawling_requests|tr.source_replies_crawled_sources|tr.reposts_crawling_sources|tr.reposts_crawling_requests|tr.reposts_crawled_sources)



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


### Câu lệnh chạy cho phần loader

export HTTP_PORT=9100
export GRPC_PORT=9011

export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false

export REDIS_MAX_RETRIES_PER_REQUEST=

export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app


export THREADS_SOURCE_POST_CRAWLING_LOADER_CYCLE=*/5 * * * *
export THREADS_SOURCE_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export THREADS_SOURCE_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export THREADS_SOURCE_POST_CRAWLING_LOADER_LIMIT=1000
export THREADS_SOURCE_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export THREADS_SOURCE_POST_CRAWLING_LOADER_ENABLE=true
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false

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
kubectl exec -it hotfix-thread-source-cookie-staging-ynm-crawler-empty-5585nklt9 -n crawler-staging -- sh





### Repost:

export HTTP_PORT=9010
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
export TR_GRAPH_SERVICE_MAX_RETRIES=10

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reposts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reposts_crawling_requests

export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reposts_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts

export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts.next_page

export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data

export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_REPOST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_REPOST_CRAWLER

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


### Source_post:

export HTTP_PORT=9011
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
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_SOURCE_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_SOURCE_POST_CRAWLER
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


### Source reply:

export HTTP_PORT=9012
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
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_SOURCE_REPLY_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_SOURCE_REPLY_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=false

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