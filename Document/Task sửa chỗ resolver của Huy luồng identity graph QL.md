# Task sửa chỗ resolver của Huy luồng identity graph QL


## Scope

Nội dung điều chỉnh:
+ Điều chỉnh lại logic xử lý mapping identity: Nếu mapping identity đã tồn tại trong hệ thống thì sẽ publish cho Source Updater xử lý, ngược lại thì publish cho Data Pusher xử lý.
+ Gán giá trị created_date của identity được load lên từ collection identity vào finished source và mapping identity, mục đích là đồng nhất created_date.




## Cách chạy

// Loader_type


PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER_ENABLE
GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER_ENABLE



// Redis Key


PageGraphQLProfileCrawlingLoader
GroupGraphQLProfileCrawlingLoader


// RabbitMQ regex
identity_graph|cl.identities_finished_sources_LamTT|identities_2_solr_identities_LamTT|identities_2_redis_identities_LamTT




// Câu lệnh chạy pod
ynmpdp-5782-testing-ynm-crawler-empty


kubectl get pods -n crawler-testing | grep ynmpdp-5782-testing-ynm-crawler-empty
kubectl exec -it  ynmpdp-5782-testing-ynm-crawler-empty-648bcf7b4d-tw2rr -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local



// Script crawl

export HTTP_PORT=9010
 
export LOG_LEVEL=debug
 
export FB_GRAPH_SERVICE_ENDPOINT=https://www.facebook.com/api
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.identity_graphql_identities_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.identity_graphql_identities_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.identity_graphql
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.identity_graphql_identities_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.*.*.identity_graphql
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_PAGE_POST_1_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_API_CRAWLER_VN
 
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
 
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=5
 
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1


export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_DB=3
 
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-identity-graphql-crawler-service



// identity schema:
id id_social mapping_id is_personal page_id platform link shard domain is_kol fullname first_name middle_name last_name gender fb_user_type category friend_count subscriber_count birthday_day birthday_month birthday_year id_city current_city fb_account hometown phone email address interested country zip_code relationship_status job_level education_level industry closed_group is_private language avatar post_updated_at post_last_date reply_updated_at reply_last_date repost_updated_at repost_last_date engagement_updated_at info_updated_at last_crawl_followers next_crawl_time reply_next_crawl_time repost_next_crawl_time priority created_date updated_at last_status error_message commercial_rate tt_user_id post_no_cookie_last_date  reply_no_cookie_last_date repost_no_cookie_last_date


## Những cases cần phải check



Expected result

- Nếu như đã có ở Redis -> Đẩy qua updater
- Nếu như không có ở Redis -> Đẩy qua pusher

*Điều kiện tiên quyết để check những cases trên -> Tìm kiếm identity nào có id_user và id_page trên facebook*

- Kiểm tra User tồn tại trên Redis -> Đẩy qua Updater
- Kiểm tra User không tồn tại trên Redis -> Đẩy qua puser
- Kiểm tra User tồn tại trên Solr -> Case này không cần check
- Kiểm tra User không tồn tại trên Solr -> Case này không cần check
- Kiểm tra xem có created_date vào finished_source và mapping identity hay không -> Đã có ở finished_source. đã có ở mapping identity


// Note

- Hiện tại case country_code Huy chưa kéo về testing (loader,resolver) -> Khi nào Huy đẩy lên thì chạy full luồng

## Data mẫu


fb_103185561152714




{
  "sources": [
    {
      "id": "143654482415190",
      "retries": 0,
      "closed_group": false,
      "type": 2,
      "priority": 1,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "PageGraphQLProfileCrawlingLoader",
      "fullname": "Gimnazija in ekonomska srednja šola Trbovlje",
      "subscriber_count": 2921,
      "current_city": "Trbovlje",
      "language": 1,
      "domain": "facebook.com",
      "avatar": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-1/299032526_573252184446382_4246767158053653634_n.png?stp=dst-png_s480x480&_nc_cat=107&ccb=1-7&_nc_sid=f907e8&_nc_ohc=CeJEEJYa12kQ7kNvwGU-K4y&_nc_oc=AdmvruMcIWZJSm7_N4kMI1NcJNwOha2DxbClV3ETHP06KEoWJEyKEpMyrGe9aORodl1uzYkVA2WlrV4KaExj1Nbs&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-atl3-3.xx&oh=00_AfdAUNPiapuEyimNlLB5juf1aiZwOVhQ2StagizxA_OKVA&oe=68EAB119",
      "country_code": "VN"
    }
  ],
  "batch": [
    {
      "id_social": "143654482415190"
    }
  ]
}





{
  "sources": [
    {
      "id": "1437159613256256",
      "retries": 0,
      "closed_group": false,
      "type": 2,
      "priority": 1,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "PageGraphQLProfileCrawlingLoader",
      "mapping_id": "fb_100044595182195",
      "is_personal": false,
      "fullname": "Hoàng Dũng",
      "subscriber_count": 609991,
      "current_city": "Hanoi",
      "language": 1,
      "domain": "facebook.com",
      "avatar": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-1/506671516_1271057334390761_6834376204037453782_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=108&ccb=1-7&_nc_sid=f907e8&_nc_ohc=adNsm7tJHCsQ7kNvwE48Bei&_nc_oc=Adl-Z2Jxpuzqb9B5GQ7lB1Sy-orJ6JGq7R28tC6uGwGTdpE0IM71hSgHiNV5s7oJnVcLUW9_1jLyJGq4V6YSMd4I&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-atl3-3.xx&oh=00_Afcu2DjlEpiaiS38QGoAd5KCck5x79tEPrKkSpWmxavtZQ&oe=68EAB411",
      "country_code": "VN"
    }
  ],
  "batch": [
    {
      "id_social": "1437159613256256",
      "mapping_id": "fb_100044595182195"
    }
  ]
}
