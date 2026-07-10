# Task crawl post from reply của Huy

## Vấn đề



+Hiện tại, API chỉ trả ra thông tin social id của community nên sẽ tiến hành bỏ field is_admin_creator khỏi mention (Luồng Crawl Hashtag/Keyword đã làm xong - https://jira.younetco.com/browse/YNMSHGYSG-1119) và field name của identity (của community) sẽ được build là user_<social id của community> (https://wiki.younetco.com/display/FB/X+platform+technical+specification).

+ Bổ sung logic build invalid mention và đẩy qua queue <env>.cl.x.invalid_data_crawling_sources đối với mention không có đủ field bắt buộc (Luồng Crawl Hashtag/Keyword đã làm xong - https://jira.younetco.com/browse/YNMSHGYSG-1054)

+ Điều chỉnh logic gửi message qua luồng Update Identity Info (detect country) theo task https://jira.younetco.com/browse/YNMSHGYSG-661

## Hướng xử lý

-Dạng X - Article, Space, Broadcast fix để lấy đủ nội dung(hiện tại đang ignore)
-Bỏ k lưu is_admin_creator trên luồng Crawling Post From Reply(post/comment trên group)
-Bổ sung logic build invalid mention và đẩy qua queue <env>.cl.x.invalid_data_crawling_sources đối với mention khi không có đủ field bắt buộc trên luồng Crawling Post From Reply
-Điều chỉnh logic gửi message qua luồng Update Identity Info theo identity
-Level của reply có đúng thứ tự hay không -> DONE


https://x.com/i/web/status/2071264811539906947

## Cách chạy


- Task Improve

1. k8s

kubectl get pods -n crawler-testing | grep ynmshgysg-1169-testing-ynm-crawler-empty
kubectl exec -it ynmshgysg-1169-testing-ynm-crawler-empty-5fdd7d77d4-784tz -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


- Task các dạng bài đặc biệt


1. k8s

kubectl get pods -n crawler-testing | grep ynmshgysg-1169-testing-ynm-crawler-empty
kubectl exec -it ynmshgysg-1169-testing-ynm-crawler-empty-5fdd7d77d4-784tz -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local



// Các luồng chạy hashtag keyword


ynm-cl-x-hashtag-post-web-

ynm-cl-x-keyword-post-web-

2. Queue


(dev|testing|staging|production).cl.(mentions_2_solr_mentions|posts_2_mongo_x_posts|replies_2_mongo_x_replies|identities_2_solr_identities|identities_2_redis_identities)$|(dev|testing|staging|production).cl.x.posts_from_reply_by_cookie_(crawled|crawling)|(dev|testing|staging|production).cl.x.identity_countries|cl.mentions_2_solr_mentions_LamTT|cl.identities_2_redis_identities_LamTT|cl.identities_2_solr_identities_LamTT|cl.replies_2_mongo_x_replies_LamTT|cl.posts_2_mongo_x_posts_LamTT|cl.x.invalid_data_crawling_sources



cl.x.hashtag_posts_community|cl.x.keyword_posts_community

cl.x.hashtag_posts_|cl.x.keyword_posts_



3. Câu lệnh chạy


- Crawler


export HTTP_PORT=9999
export GRPC_PORT=9011
   
export PROXY_MANAGER_SERVICE_PORT=9011
export TOKEN_MANAGER_SERVICE_PORT=9011
   
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.x.posts_from_reply_by_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.*.*.*.posts_from_reply
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.x.posts_from_reply_by_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.x.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.x.posts_from_reply_by_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.11.*.*.posts_from_reply_by_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.11.*.*.posts_from_reply_by_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=LAMTT_NEW_PROXY_1
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=X_POST_FROM_REPLY_BY_COOKIE_CRAWLER
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
export RESOLVER_IS_DETECT_COUNTRY=false
    
export LOG_LEVEL=debug
 
export RABBIT_HEARTBEAT=10

export REDIS_HOST=192.168.1.103
export REDIS_PORT=6393
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_DB=1
export REDIS_USE_NEW_COMMAND=true

export CRAWLER_CONFIG_MENTION_REQUIRED_FIELDS="id,id_source,domain,identity,identity_name,platform,mention_type,source_type,views,likes,comments,shares,engagement_total,engagement_s_c,search_text,link,link_shared,attachment,created_date,updated_at"
  
yarn start --scope=@ynm/cl-x-post-from-reply-crawler-service




- Data pusher


export HTTP_PORT=9998
export GRPC_PORT=9011
 
export POST_2_MONGO_X_POST_ENABLE=true
export REPLY_2_MONGO_X_REPLY_ENABLE=true
 
export LOG_LEVEL=debug
  
export RABBIT_HEARTBEAT=10
 
export MONGO_CONNECTION_DEFAULT_ENABLE=true
export MONGO_CONNECTION_DEFAULT_HOST=mongos-router.ynm.local
export MONGO_CONNECTION_DEFAULT_PORT=27017
export MONGO_CONNECTION_DEFAULT_USERNAME=data_minhtk
export MONGO_CONNECTION_DEFAULT_PASSWORD=yy7k18L0Eisj
export MONGO_CONNECTION_DEFAULT_DATABASE=ynm_crawler_testing
export MONGO_CONNECTION_DEFAULT_REPLICA_SET=
export MONGO_CONNECTION_DEFAULT_AUTH_SOURCE=ynm_crawler_testing
 
export MONGO_NEWS_DATABASE=ynm_crawler_testing
export MONGO_NEWS_REPLICA_SET=
export MONGO_NEWS_AUTH_SOURCE=ynm_crawler_testing
 
export MONGO_SOCIAL_HEAT_DATABASE=socialheat_testing
export MONGO_SOCIAL_HEAT_REPLICA_SET=
export MONGO_SOCIAL_HEAT_AUTH_SOURCE=socialheat_testing
 
yarn start --scope=@ynm/cl-data-pusher-service




- Source updater


export HTTP_PORT=9997
export GRPC_PORT=9011
 
export X_POST_ENABLE=true
export X_REPLY_ENABLE=true
 
export LOG_LEVEL=debug
  
export RABBIT_HEARTBEAT=10
 
export MONGO_CONNECTION_DEFAULT_ENABLE=true
export MONGO_CONNECTION_DEFAULT_HOST=mongos-router.ynm.local
export MONGO_CONNECTION_DEFAULT_PORT=27017
export MONGO_CONNECTION_DEFAULT_USERNAME=data_minhtk
export MONGO_CONNECTION_DEFAULT_PASSWORD=yy7k18L0Eisj
export MONGO_CONNECTION_DEFAULT_DATABASE=ynm_crawler_testing
export MONGO_CONNECTION_DEFAULT_REPLICA_SET=
export MONGO_CONNECTION_DEFAULT_AUTH_SOURCE=ynm_crawler_testing
 
export MONGO_NEWS_DATABASE=ynm_crawler_testing
export MONGO_NEWS_REPLICA_SET=
export MONGO_NEWS_AUTH_SOURCE=ynm_crawler_testing
 
export MONGO_SOCIAL_HEAT_DATABASE=socialheat_testing
export MONGO_SOCIAL_HEAT_REPLICA_SET=
export MONGO_SOCIAL_HEAT_AUTH_SOURCE=socialheat_testing
 
yarn start --scope=@ynm/cl-source-updater-service






4. Message mẫu

- Data test cho task improve

{
  "id": "5a1b2c3d-4e5f-4a1b-9c2d-3e4f5a6b7c8d",
  "id_social": "2071444018081546401",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}



{
  "id": "b9f0d1a2-3c4e-4f5b-8a1c-2d3e4f5a6b7c",
  "id_social": "2071444066118807682",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}

2071444066118807682



{
  "id": "2c9e4b1a-7d5f-4c8e-a2f1-8f3a5b6c7d4e",
  "id_social": "2036958960201482626",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}




2071318911048384890


{
  "id": "8b5c2a1d-4e7f-4b9a-bd43-2e1f3a5b6c7d",
  "id_social": "2071318911048384890",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}


- Data test cho các dạng bài đặc biệt


+ Article

2036958960201482626

{
  "id": "7a5d3c1e-9b2f-4a8d-bd42-6e1c5f3b7a9e",
  "id_social": "2036958960201482626",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}



2037057055954198974


{
  "id": "7a5d3c1e-9b2f-4a8d-bd42-6e1c5f3b7a9e",
  "id_social": "2037057055954198974",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}


+ Audio Space

2071209036549136474


{
  "id": "c3f8a2e1-7d9b-4c5a-bd42-1e5f3b4a6c7d",
  "id_social": "2071209036549136474",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}

+ Broadcast/Livestream

1927500290086867039

{
  "id": "8b5c2a1d-4e7f-4b9a-bd43-2e1f3a5b6c7d",
  "id_social": "1927500290086867039",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}


2072518205831327764

{
  "id": "e1a5b3c2-4d7e-4f8a-9b1c-2d3e4f5a6b7c",
  "id_social": "2072518205831327764",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}




poll:


https://x.com/ikirigin/status/2047711558189674508



{
  "id": "e1a5b3c2-4d7e-4f8a-9b1c-2d3e4f5a6b7c",
  "id_social": "2047711558189674508",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}


external link


2072598309680877668



{
  "id": "9a5d1e2c-3b4f-4c8a-bd41-8f2e3b4a5c6d",
  "id_social": "2072598309680877668",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}


Native pool

{
  "id": "4c7b2a1d-5e9f-4a8b-bd43-6e1f2a3b4c5d",
  "id_social": "1594765232160882688",
  "type": 1,
  "platform": 11,
  "retries": 0,
  "createdBy": "XKeywordPostWebCrisisCrawlingLoader"
}

1594765232160882688

## Những cái em sửa


Article/Audio/Live

Pre
- Skip

Now
- Sửa ở search_text[2]
- Đổi mention_type
- Logic của các phần tử còn lại của search_text -> Không thay 0,1
- Attachment/link_shared




