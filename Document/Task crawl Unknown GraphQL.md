# Task crawl Unknown của Kim


## Scope

- Check thêm phần user info (Task trước đã có check cho Page và Group)
- User info thì sử dụng lại API của Page
- Lấy đầy đủ các thông tin giống như crawl page
- Crawl Unknown user -> Thì sẽ crawl qua user/page/group -> Nếu không phải cả 3 entities trên thì đánh fail


## Hướng giải quyết

- Phát triển tiếp từ luồng đã có sẵn là Page/Group
- Chỉ thêm phần cho crawl User

## Cách chạy

// K8s

ynmpdp-5755-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-5755-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5755-testing-ynm-crawler-empty-74cb467584-n66sm -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local


// Regex rabbitMQ

identity_graph|cl.identities_finished_sources_LamTT|identities_2_solr_identities_LamTT|identities_2_redis_identities_LamTT

// Key cache ở Redis

UnknownGraphQLProfileCrawlingLoader
PageGraphQLProfileCrawlingLoader

// Id ở crawling loader MySQL

USER_GRAPH_QL_PROFILE_CRAWLING_LOADER_ENABLE
UNKNOWN_GRAPH_QL_PROFILE_CRAWLING_LOADER



// Câu query ở mySQL

- Unknown identity info

{
    "fields": ["id_social", "category", "priority", "fb_user_type", "mapping_id", "is_personal", "identity_join_date", "fullname", "subscriber_count", "current_city", "post_updated_at", "gender", "language", "education_level", "job_level", "avatar", "hometown", "id_city", "birthday_year", "post_last_date", "domain", "closed_group"],
    "filter": {
        "info_updated_at": "[* TO NOW-1MONTHS] OR (*:* -info_updated_at:[* TO *])",
        "platform": 1,
        "-fb_user_type": (1 2 3),
        "-last_status": (4 5)
    }
}


- User graphQL info

{
    "fields": ["id_social", "category", "priority", "fb_user_type", "mapping_id", "is_personal", "identity_join_date", "fullname", "subscriber_count", "current_city", "post_updated_at", "gender", "language", "education_level", "job_level", "avatar", "hometown", "id_city", "birthday_year", "post_last_date", "domain", "closed_group"],
    "filter": {
        "info_updated_at": "((*:* -country:[* TO *]) OR (*:* -info_updated_at:[* TO *]) OR (info_updated_at:[* TO NOW-6MONTHS]))",
        "platform": 1,
        "fb_user_type": 1,
        "-last_status": (4 5)
    }
}


// Câu lệnh chạy

- Unknown loader:

export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
   
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
   
export RABBIT_HEARTBEAT=10
 
export UNKNOWN_GRAPH_QL_PROFILE_CRAWLING_LOADER_ENABLE=true
export UNKNOWN_GRAPH_QL_PROFILE_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.identity_graphql_identities_crawling_sources
export UNKNOWN_GRAPH_QL_PROFILE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export UNKNOWN_GRAPH_QL_PROFILE_CRAWLING_LOADER_CYCLE="0 */12 * * *"
export UNKNOWN_GRAPH_QL_PROFILE_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export UNKNOWN_GRAPH_QL_PROFILE_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
 
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-crawling-loader-service


- User Loader:

export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
   
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
   
export RABBIT_HEARTBEAT=10
 
export USER_GRAPH_QL_PROFILE_CRAWLING_LOADER_ENABLE=true
export USER_GRAPH_QL_PROFILE_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.identity_graphql_identities_crawling_sources
export USER_GRAPH_QL_PROFILE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export USER_GRAPH_QL_PROFILE_CRAWLING_LOADER_CYCLE="0 */12 * * *"
export USER_GRAPH_QL_PROFILE_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export USER_GRAPH_QL_PROFILE_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
 
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-crawling-loader-service


- Crawler:


export HTTP_PORT=9010
 
export LOG_LEVEL=debug
 
export FB_GRAPH_SERVICE_ENDPOINT=https://www.facebook.com/api
export FB_GRAPH_SERVICE_TIMEOUT=30000
export FB_GRAPH_SERVICE_MAX_RETRIES=3
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.identity_graphql_identities_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.identity_graphql_identities_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.identity_graphql
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.identity_graphql_identities_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.*.*.identity_graphql
 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_USER_INFO_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_USER_INFO_CRAWLER
 
export CRAWLER_CONFIG_USE_TOKEN=false
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1


## Data mẫu





