# Task crawl Unknown của Kim


## Scope

- Check thêm phần user info (Task trước đã có check cho Page và Group)
- User info thì sử dụng lại API của Page -> check lại mapping
- Lấy đầy đủ các thông tin giống như crawl Page
- Crawl Unknown user -> Thì sẽ crawl qua user/page/group -> Nếu không phải cả 3 entities trên thì đánh fail
- Kiểm tra lại thay đổi của toàn bộ service (Do có apply với global và apply logic mới của resolver)


## Hướng giải quyết

- Phát triển tiếp từ luồng đã có sẵn là Page/Group
- Chỉ thêm phần cho crawl User

## Cách chạy

// K8s

ynmpdp-5755-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-5755-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5755-testing-ynm-crawler-empty-56989c64dc-zntfr -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local


// Regex rabbitMQ

identity_graph|cl.identities_finished_sources_LamTT|identities_2_solr_identities_LamTT|identities_2_redis_identities_LamTT



identity_graph|cl.identities_finished_sources_LamTT|identities_2_solr_identities_LamTT|identities_2_redis_identities_LamTT|cl.identities_finished_sources

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


// Identity schema

id id_social mapping_id is_personal page_id platform link shard domain is_kol fullname first_name middle_name last_name gender fb_user_type category friend_count subscriber_count birthday_day birthday_month birthday_year id_city current_city fb_account hometown phone email address interested country zip_code relationship_status job_level education_level industry closed_group is_private language avatar post_updated_at post_last_date reply_updated_at reply_last_date repost_updated_at repost_last_date engagement_updated_at info_updated_at last_crawl_followers next_crawl_time reply_next_crawl_time repost_next_crawl_time priority created_date updated_at last_status error_message commercial_rate tt_user_id post_no_cookie_last_date  reply_no_cookie_last_date repost_no_cookie_last_date country_code


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
export CRAWLER_CONCURRENCY=5
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1


NODE_ENV=testing yarn start --scope=@ynm/cl-fb-identity-graphql-crawler-service


## Data mẫu

### Data dùng để test luồng User

// Người sáng tạo nội dung số
{
  "id": "100000021051381",
  "retries": 0,
  "closed_group": false,
  "type": 1,
  "delay_time_rules": [],
  "last_data_date": null,
  "platform": 1,
  "createdBy": "UserGraphQLProfileCrawlingLoader",
  "fullname": "Mischelle Chico Elumbaring",
  "domain": "facebook.com",
  "mentions": [],
  "posts": []
}

-> Data sau khi crawl được

- Mapping identity
{
  "identities": [
    {
      "id": "fb_491746890694909",
      "fullname": "Mischelle Chico Elumbaring",
      "platform": 1,
      "id_social": "491746890694909",
      "domain": "facebook.com",
      "created_date": "2026-01-23T09:00:57.323Z",
      "mapping_id": "fb_100000021051381",
      "is_personal": true,
      "fb_user_type": 2,
      "createdBy": "UserGraphQLProfileCrawlingLoader"
    }
  ]
}

- Updated identity

{
  "id": "fb_100000021051381",
  "fullname": "Mischelle Chico Elumbaring",
  "subscriber_count": 1000,
  "avatar": "https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-1/469289939_9332454263431849_6703116348943355687_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=101&ccb=1-7&_nc_sid=1d2534&_nc_ohc=fAD5b0Nl4w0Q7kNvwG1mtjS&_nc_oc=AdlBeb80WKnuToFTKQRd9M8FuLylTcDfjerFSA2xPIlns4eLWWtcvDLgXmYC16WPFvM&_nc_zt=24&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=-bTcs_itpOTjcovp9jYJAw&oh=00_AfoMS-eAjW9Erzwaf_Ix9MDBOlFjN3I_NwoMTtsGVG-puA&oe=6978F5C2",
  "updated_at": "2026-01-23T09:00:57.322Z",
  "gender": 2,
  "education_level": 0,
  "job_level": 0,
  "id_social": "100000021051381",
  "platform": 1,
  "id_city": 0,
  "birthday_year": 0,
  "domain": "facebook.com",
  "info_updated_at": "2026-01-23T09:00:57.323Z",
  "last_status": 0,
  "mapping_id": "fb_491746890694909",
  "is_personal": true,
  "createdBy": "UserGraphQLProfileCrawlingLoader"
}


// User hơi khác thường xíu (Chỗ này đang ghi user là game thủ)
{
  "id": "100000021084466",
  "retries": 0,
  "closed_group": false,
  "type": 1,
  "delay_time_rules": [],
  "last_data_date": null,
  "platform": 1,
  "createdBy": "UserGraphQLProfileCrawlingLoader",
  "fullname": "Arie Chandrawinata",
  "domain": "facebook.com",
  "mentions": [],
  "posts": []
}

- Mapping identity:
{
  "identities": [
    {
      "id": "fb_466905713163844",
      "fullname": "Arie Chandrawinata",
      "platform": 1,
      "id_social": "466905713163844",
      "domain": "facebook.com",
      "created_date": "2026-01-23T09:08:33.798Z",
      "mapping_id": "fb_100000021084466",
      "is_personal": true,
      "fb_user_type": 2,
      "createdBy": "UserGraphQLProfileCrawlingLoader"
    }
  ]
}

- Updated identity

{
  "id": "fb_100000021084466",
  "fullname": "Arie Chandrawinata",
  "subscriber_count": 1900,
  "avatar": "https://scontent.fsgn5-3.fna.fbcdn.net/v/t1.6435-1/46498347_2179563148721033_8663207850761256960_n.jpg?_nc_cat=104&ccb=1-7&_nc_sid=1d2534&_nc_ohc=tTmgHgfEWD0Q7kNvwHxYi_w&_nc_oc=Adn2XqsJ0owAgx_QLIEItJA0q8BfsVCTXuApkvJ1wKmR6iXhO_9825dnefWAOhJZBME&_nc_zt=24&_nc_ht=scontent.fsgn5-3.fna&_nc_gid=FYdGViSlmIyzUVOU7M36Eg&oh=00_Afr_cJ7_t2QfIA_pFq4Q-BjOM0Ylwn_lI9Ast2qxX8plVg&oe=699A9116",
  "updated_at": "2026-01-23T09:08:33.796Z",
  "gender": 1,
  "education_level": 0,
  "job_level": 0,
  "id_social": "100000021084466",
  "platform": 1,
  "id_city": 0,
  "birthday_year": 0,
  "domain": "facebook.com",
  "info_updated_at": "2026-01-23T09:08:33.797Z",
  "last_status": 0,
  "mapping_id": "fb_466905713163844",
  "is_personal": true,
  "createdBy": "UserGraphQLProfileCrawlingLoader"
}



// User bình bình (is_personal = false)

{
  "id": "100000021098485",
  "retries": 0,
  "closed_group": false,
  "type": 1,
  "delay_time_rules": [],
  "last_data_date": null,
  "platform": 1,
  "createdBy": "UserGraphQLProfileCrawlingLoader",
  "fullname": "Supakave Suraj",
  "domain": "facebook.com",
  "mentions": [],
  "posts": []
}

- Updated identity

{
  "id": "fb_100000021098485",
  "fullname": "Supakave Suraj",
  "current_city": "Bangkok, Thailand",
  "avatar": "https://scontent.fsgn5-14.fna.fbcdn.net/v/t39.30808-1/475661799_9543294789014463_2496794947725550142_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=101&ccb=1-7&_nc_sid=e99d92&_nc_ohc=61_hUHzEQyoQ7kNvwEXry5N&_nc_oc=AdkA690mZk7MQ8ZCflDQDr6QvTjMCjPcXUUuzZu8YGcnmOswvv-MYl3AuSsoi2502vI&_nc_zt=24&_nc_ht=scontent.fsgn5-14.fna&_nc_gid=iEanhjIRKS3lMsBNv5sUNQ&oh=00_AfrdNzyChHvQ1aulBdPFJSwZcjyyYMw_zT7Lj55qyzDfNQ&oe=697911D8",
  "updated_at": "2026-01-23T09:56:50.282Z",
  "gender": 1,
  "education_level": 0,
  "job_level": 0,
  "id_social": "100000021098485",
  "platform": 1,
  "hometown": "Bangkok, Thailand",
  "id_city": 0,
  "birthday_year": 0,
  "domain": "facebook.com",
  "info_updated_at": "2026-01-23T09:56:50.303Z",
  "last_status": 0,
  "mapping_id": null,
  "is_personal": false,
  "createdBy": "UserGraphQLProfileCrawlingLoader"
}

// User block profile

{
  "id": "100000021054433",
  "retries": 0,
  "closed_group": false,
  "type": 1,
  "delay_time_rules": [],
  "last_data_date": null,
  "platform": 1,
  "createdBy": "UserGraphQLProfileCrawlingLoader",
  "fullname": "Poosuwi Yada",
  "domain": "facebook.com",
  "mentions": [],
  "posts": []
}

- Updated identity

{
  "id": "fb_100000021054433",
  "fullname": "Poosuwi Yada",
  "avatar": "https://scontent.fsgn5-9.fna.fbcdn.net/v/t39.30808-1/544790715_25017771777806845_4988795045113359194_n.jpg?stp=dst-jpg_s240x240_tt6&_nc_cat=105&ccb=1-7&_nc_sid=e99d92&_nc_ohc=_T6gCBQrF4gQ7kNvwFbCNye&_nc_oc=AdnXge-6KgCcPUYh6R-lnm02SH5gXGJ7T37FYbfDpEC7fJkonrBAnagxcEUdnsRGwBs&_nc_zt=24&_nc_ht=scontent.fsgn5-9.fna&_nc_gid=JNRYukWisWYOzkuy1YVIAA&oh=00_AfrG9kXaMNoxfIC5zt4vYV29dLu6-HvePCZUgoWZ7iZilw&oe=69791A56",
  "updated_at": "2026-01-23T09:59:32.669Z",
  "gender": 2,
  "education_level": 0,
  "job_level": 0,
  "id_social": "100000021054433",
  "platform": 1,
  "id_city": 0,
  "birthday_year": 0,
  "domain": "facebook.com",
  "info_updated_at": "2026-01-23T09:59:32.669Z",
  "last_status": 0,
  "mapping_id": null,
  "is_personal": false,
  "createdBy": "UserGraphQLProfileCrawlingLoader"
}



// User không tồn tại (Hiện tại chỗ này cần tồn tại với Kim. chỗ Page thì đang để 1)

{
  "id": "1000123021054433",
  "retries": 0,
  "closed_group": false,
  "type": 1,
  "delay_time_rules": [],
  "last_data_date": null,
  "platform": 1,
  "createdBy": "UserGraphQLProfileCrawlingLoader",
  "fullname": "User này không tồn tại",
  "domain": "facebook.com",
  "mentions": [],
  "posts": []
}


- Updated identity

{
  "id": "fb_1000123021054433",
  "type": 1,
  "error_message": "Identity unavailable",
  "last_status": 4,
  "createdBy": "UserGraphQLProfileCrawlingLoader"
}

-> Hiện tại page đang xử lý như vầy:


  {
    "id": "fb_143671058819880",
    "error_message": "IdentityUnavailableException",
    "last_status": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader"
  }



### Data dùng để test luồng Unknow

- Crawl identity là user -> DONE


 {
      "id": "100003936575518",
      "retries": 0,
      "closed_group": false,
      "type": 255,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "UnknownGraphQLProfileCrawlingLoader",
      "fullname": "Crawl User",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
    }


- Crawl identity là page

{
  "sources": [
    {
      "id": "722516444282476",
      "retries": 0,
      "closed_group": false,
      "type": 255,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "UnknownGraphQLProfileCrawlingLoader",
      "fullname": "Crawl Page",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
    }
  ],
  "batch": [
    {
      "id_social": "722516444282476"
    }
  ]
}



{
  "sources": [
    {
      "id": "103098731619499",
      "retries": 0,
      "closed_group": false,
      "type": 255,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "UnknownGraphQLProfileCrawlingLoader",
      "fullname": "Crawl Page",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
    }
  ],
  "batch": [
    {
      "id_social": "103098731619499"
    }
  ]
}



{
  "sources": [
    {
      "id": "103099325599666",
      "retries": 0,
      "closed_group": false,
      "type": 255,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "UnknownGraphQLProfileCrawlingLoader",
      "fullname": "Crawl Page",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
    }
  ],
  "batch": [
    {
      "id_social": "103099325599666"
    }
  ]
}


- Crawl identity là group

{
  "sources": [
    {
      "id": "206815861588738",
      "retries": 0,
      "closed_group": false,
      "type": 255,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "UnknownGraphQLProfileCrawlingLoader",
      "fullname": "Crawl Group",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
    }
  ],
  "batch": [
    {
      "id_social": "206815861588738"
    }
  ]
}


{
  "sources": [
    {
      "id": "2373029679820882",
      "retries": 0,
      "closed_group": false,
      "type": 255,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "UnknownGraphQLProfileCrawlingLoader",
      "fullname": "Crawl Group",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
    }
  ],
  "batch": [
    {
      "id_social": "2373029679820882"
    }
  ]
}


- Crawl identity không tồn tại


  {
    "id": "fb_100003933319980",
    "type": 255,
    "error_message": "IdentityUnavailableException",
    "last_status": 4,
    "createdBy": "UnknownGraphQLProfileCrawlingLoader"
  }


  {
      "id": "100003933319980",
      "retries": 0,
      "closed_group": false,
      "type": 255,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "UnknownGraphQLProfileCrawlingLoader",
      "fullname": "Crawl Fail Identity",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
    }


   {
      "id": "100003933319980",
      "retries": 0,
      "closed_group": false,
      "type": 2,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "PageGraphQLProfileCrawlingLoader",
      "fullname": "Crawl Fail Page",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
    }


    {
      "id": "237302967982088200",
      "retries": 0,
      "closed_group": false,
      "type": 3,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "GroupGraphQLProfileCrawlingLoader",
      "fullname": "Crawl Fail Group",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
    }

 {
      "id": "1084910258537458",
      "retries": 0,
      "closed_group": false,
      "type": 3,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "GroupGraphQLProfileCrawlingLoader",
      "fullname": "Crawl Group",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
    }

    1084910258537458

- Crawl 1 user bị khóa

  {
      "id": "100003927669898",
      "retries": 0,
      "closed_group": false,
      "type": 255,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "UnknownGraphQLProfileCrawlingLoader",
      "fullname": "Crawl Fail Identity",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
  }

- Crawl 1 user được gọi là type event

{
      "id": "1433172075056690",
      "retries": 0,
      "closed_group": false,
      "type": 255,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "UnknownGraphQLProfileCrawlingLoader",
      "fullname": "Crawl type event",
      "domain": "facebook.com",
      "created_date": "2026-01-09T04:40:52.972Z"
}

-> Tất nhiên nếu là type event thì sẽ không detect được

- Message detect unknown chuẩn

{
  "id": "100000044781471",
  "retries": 0,
  "closed_group": false,
  "type": 255,
  "delay_time_rules": [],
  "last_data_date": null,
  "platform": 1,
  "createdBy": "UnknownGraphQLProfileCrawlingLoader",
  "fullname": "Nathan Travis",
  "domain": "facebook.com",
  "created_date": "2026-01-09T05:03:58.678Z",
  "country_code": "VN",
  "mentions": [],
  "posts": []
}


{
  "id": "fb_100000044781471",
  "fullname": "Nathan Travis",
  "avatar": "https://scontent.fsgn5-5.fna.fbcdn.net/v/t39.30808-1/589416744_25863458853238920_7954121183446079926_n.jpg?stp=dst-jpg_s480x480_tt6&_nc_cat=108&ccb=1-7&_nc_sid=e99d92&_nc_ohc=_Y-UGwC7LcUQ7kNvwF1aMv2&_nc_oc=AdnVc-Eee1WWWPDHX0m2Ii8feCu7qr3A0sMyB6k1pcqTGhA6G-lJWaIaHE-Tr-ytsyA&_nc_zt=24&_nc_ht=scontent.fsgn5-5.fna&_nc_gid=azoMmkOp0u0WZqOavwO0rQ&oh=00_AfoqZJpGVSot4qUU_xmcc2Gx9tqdq6onM5pSqa9liDYeEg&oe=697E10EC",
  "updated_at": "2026-01-27T04:41:05.422Z",
  "gender": 1,
  "fb_user_type": 1,
  "education_level": 97,
  "job_level": 99,
  "id_social": "100000044781471",
  "platform": 1,
  "id_city": 0,
  "birthday_year": 0,
  "domain": "facebook.com",
  "info_updated_at": "2026-01-27T04:41:05.424Z",
  "last_status": 0,
  "country_code": "VN",
  "created_date": "2026-01-09T05:03:58.678Z",
  "mapping_id": null,
  "is_personal": false,
  "createdBy": "UnknownGraphQLProfileCrawlingLoader"
}


-> Kết quả



## Note

- Hiện tại nếu như là user (Có chữ người sáng tạo nội dung số) thì sẽ có mapping identity
- Hiện sẽ không cần detect field language cho identity nữa -> Do đã có field country_code
- *Nếu như crawl user -> mapping identity sẽ là page, nếu như crawl page -> mapping identity sẽ là user*
- Hiện tại chỉ đi qua Page/Group/User, nếu identity khác những entity trên thì sẽ không thể detect được


