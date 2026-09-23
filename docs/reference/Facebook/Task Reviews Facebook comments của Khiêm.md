# Task Reviews Facebook comments của Khiêm

## Issue

Hiện tại luồng crawl comment cũ đang chỉ crawl được

50 posts - 25 comments / requests -> Mỗi 1 post tối đa 25 cmts

Dẫn đến không đủ số lượng comments không đầy đủ như mong muốn của bussiness



## Scope

Hiện tại dev sẽ thay đổi param ở API crawler -> thành limit 500

3 posts - 500 comments / requests -> Mỗi 1 post/page trả tối đa là 500 cmts


Resolve - parser - mapping data không thây đổi

Ví dụ: 

paging

request 1 - > Post A -> trả 500 cmts



## Tài liệu kham khảo


Wiki tương tự về facebook comment:
https://wiki.younetco.com/pages/viewpage.action?pageId=178880731


Wiki phân giải chi tiết:
https://wiki.younetco.com/pages/viewpage.action?pageId=140312850


## Câu lệnh chạy


1. K8s

kubectl get pods -n crawler-testing | grep ynmpdp-5913-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5913-testing-ynm-crawler-empty-5f77dd8db6-pv5lx -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


2. Rabbit MQ


cl.fb.group_comments_numerous_crawling_sources|cl.fb.group_comments_numerous_crawling_reqests|cl.fb.group_comments_numerous_crawled_sources|cl.mentions_2_solr_mentions_LamTT|identities_2_solr_identities_LamTT|identities_2_redis_identities_LamTT|testing.cl.fb.group_comments_crawling_sources



3. Message loader

ynm-cl-fb-crawling-loader-service-testing


{
    "id": "535844485428888_1299415749071754",
    "id_source": "fb_1299415749071754",
    "retries": 0,
    "type": 3,
    "delay_time_rules": [
        {
            "lte": 168,
            "delay": 18
        },
        {
            "lte": 336,
            "delay": 48
        },
        {
            "lte": 999999999,
            "delay": 720
        }
    ],
    "last_data_date": "2026-02-22T02:14:31Z",
    "from_date": "1771726471",
    "to_date": "1773831081",
    "platform": 1,
    "createdBy": "GroupNumerousCommentCrawlingLoader",
    "title": "xyz",
    "created_date": "2026-02-22T02:14:33Z",
    "shared_content": "xyzt",
    "country_code": "VN"
}


# Script run

export NODE_ENV=testing
export HTTP_PORT=9999
export LOG_LEVEL=debug
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.group_comments_numerous_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.group_comments_numerous_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.3.*.comments-numerous
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.group_comments_numerous_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.3.*.comments-numerous.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_GROUP_COMMENT_NUMEROUS_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_GROUP_COMMENT_NUMEROUS_CRAWLER
 
export BUILDER_ENABLE='true'
export BUILDER_WAIT_FOR_BATCH='false'
export BUILDER_BATCH_SIZE='3'
export BUILDER_DATA_LIMIT='500'
export BUILDER_CONCURRENCY='1'
 
export CRAWLER_ENABLE='true'
export CRAWLER_BATCH_SIZE='1'
export CRAWLER_CONCURRENCY='1'
 
export RESOLVER_ENABLE='true'
export RESOLVER_CONCURRENCY='1'

yarn start --scope @ynm/cl-fb-comment-crawler-service




