# Task thêm created_date vào parentPost



## Problem:

Cần lọc comment của post có created_date trong 30 ngày để đánh topic_types


## Yêu cầu:


## Solution:

Thêm field created_date khi truyền parent_post
Phải lưu lại field post_created_date ở Threads_replies và Youtube_comments



## Cách chạy


1. Câu regex ở RabbitMQ

// Câu regex để st|tr.post|posts.comments.queuecualamttcheck posts 
yt|article_posts|tt_post|tt_com|fb_po


yt|article_posts|tt_post|tt_com|fb_post|tr.post|posts.comments.queuecualamt|fb_comments|ynm.auto_parser|news.comment|review|thread
cl.fb.page_posts|cl.fb.page_web_comments|mentions_LamTT|cl.tr.posts_comment_|cl.tr.posts_sub_comment_|cl.tt.tag_posts|cl.tr.reply_posts|tr_replies|youtube



tt_post|tt_com|fb_post|tr.post|posts.comments.queuecualamt|fb_comments|ynm.auto_parser|news.comment|review|thread
cl.fb.page_posts|cl.fb.page_web_comments|mentions_LamTT|cl.tr.posts_comment_|cl.tr.posts_sub_comment_|cl.tr.reply_posts|tr_replies|youtube



2. Câu lệnh chạy ở k8s

Deployment source mới: https://k8s.ynm.local/#/deployment/crawler-testing/shdiy-9045-parent-post-created-date-testing-ynm-crawler-empty?namespace=crawler-testing
 
Deployment source cũ: https://k8s.ynm.local/#/deployment/crawler-testing/shdiy-9045-old-created-date-testing-crawler-empty-container?namespace=crawler-testing


// Luồng mới

Deployment: shdiy-9045-parent-post-created-date-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep shdiy-9045-
kubectl exec -it shdiy-9045-parent-post-created-date-testing-ynm-crawler-em4btlp -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local



// Luồng cũ

Deployment: old-crawler-shdiy-8164-parent-post-testing-empty-container


kubectl get pods -n crawler-testing | grep shdiy-9045-
kubectl exec -it shdiy-9045-old-created-date-testing-crawler-empty-contained2jnl -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local


3. Schema

// threads_posts
id
link
id_social
title
id_source
comment_updated_at
priority
crawled_date
created_date
comment_last_date
is_kol
likes
comments
shares
views
last_status
engagement_updated_at
is_auto_engagement
next_crawl_time
error_message
post_type
crawled_by
caption
shared_content
topic_types


// youtube_posts

id
id_social
title
id_source
comment_updated_at
priority
source_type
crawled_date
created_date
comment_last_date
cursor
last_status
error_message
video_id
is_kol
engagement_updated_at
next_crawl_time
likes
comments
shares
views
caption
topic_types


// youtube_comments

id id_social title id_source comment_updated_at priority source_type crawled_date created_date comment_last_date cursor last_status error_message video_id _version_ is_kol engagement_updated_at next_crawl_time likes comments shares views caption topic_types post_created_date


// threads_replies

id link id_social title id_source comment_updated_at priority level crawled_date created_date comment_last_date is_kol last_status next_crawl_time post_created_date error_message _version_ caption shared_content topic_types

// mentions

id
link
platform
domain
shard
id_social
id_source
id_reference
id_parent_comment
identity
identity_name
mention_type
mention_type_details
source_type
source_category
post_format
views
likes
comments
shares
haha
sad
angry
wow
heart
reaction
rating_score
engagement_total
engagement_s_c
title
search_text
search_text_exactly
sound
sound_exactly
effect
effect_exactly
attachment
link_shared
link_shared_id
link_shared_domain
created_date
updated_at
is_noisy
id_seeder
is_admin_creator
is_to_topic
closed_group
is_kol
language


4. Shards ở mentions

20250101,20250102,20250103,20250104,20250105,20250106,20250107,20250108,20250109,20250110,20250111,20250112,20250113,20250114,20250115,20250116,20250117,20250118,20250119,20250120,20250121,20250122,20250123,20250124,20250125,20250126,20250127,20250128,20250129,20250130,20250131,20250201,20250202,20250203,20250204,20250205,20250206,20250207,20250208,20250209,20250210,20250211,20250212,20250213,20250214,20250215,20250216,20250217,20250218,20250219,20250220,20250221,20250222,20250223,20250224,20250225,20250226,20250227,20250228,20250301,20250302,20250303,20250304,20250305,20250306,20250307,20250308,20250309,20250310,20250311,20250312,20250313,20250314,20250315,20250316,20250317,20250318,20250319,20250320,20250321,20250322,20250323,20250324,20250325,20250326,20250327,20250328,20250329,20250330,20250331,20250401,20250402,20250403,20250404,20250405,20250406,20250407,20250408,20250409,20250410,20250411,20250412,20250413,20250414,20250415,20250416,20250417,20250418,20250419,20250420,20250421,20250422,20250423,20250424,20250425,20250426,20250427,20250428,20250429,20250430,20250501,20250502,20250503,20250504,20250505,20250506,20250507,20250508,20250509,20250510,20250511,20250512,20250513,20250514,20250515,20250516,20250517,20250518,20250519,20250520,20250521,20250522,20250523,20250524,20250525,20250526,20250527,20250528,20250529,20250530,20250531,20250601,20250602,20250603,20250604,20250605,20250606,20250607,20250608,20250609,20250610,20250611,20250612,20250613,20250614,20250615,20250616,20250617,20250618,20250619,20250620,20250621,20250622,20250623,20250624,20250625,20250626,20250627,20250628,20250629,20250630,20250701,20250702,20250703,20250704,20250705,20250706,20250707,20250708,20250709,20250710,20250711,20250712,20250713,20250714,20250715,20250716,20250717,20250718,20250719,20250720,20250721,20250722,20250723,20250724,20250725,20250726,20250727,20250728,20250729,20250730,20250731,20250801,20250802,20250803,20250804,20250805,20250806,20250807,20250808,20250809,20250810,20250811,20250812,20250813,20250814,20250815,20250816,20250817,20250818,20250819,20250820,20250821,20250822,20250823,20250824,20250825,20250826,20250827,20250828,20250829,20250830,20250831,20250901,20250902,20250903,20250904,20250905,20250906,20250907,20250908,20250909,20250910,20250911,20250912,20250913,20250914,20250915,20250916,20250917,20250918,20250919,20250920,20250921,20250922,20250923,20250924,20250925,20250926,20250927,20250928,20250929,20250930,20251001,20251002,20251003,20251004,20251005,20251006,20251007,20251009,20251010,20251011,20251012,20251013,20251014,20251015,20251016,20251017,20251018,20251019,20251020,20251021,20251022,20251023,20251024,20251025,20251026,20251027,20251028,20251029,20251030,20251031,20251101,20251102,20251103,20251104,20251105,20251106,20251107,20251108,20251109,20251110,20251111,20251112,20251113,20251114,20251115,20251116,20251117,20251118,20251119,20251120,20251121,20251122,20251123,20251124,20251125,20251126,20251127,20251128,20251129,20251130,20251201,20251202,20251203,20251204,20251205,20251206,20251207,20251208,20251209,20251210,20251211,20251212,20251213,20251214,20251215,20251216,20251217,20251218,20251219,20251220,20251221,20251222,20251223,20251224,20251225

## Các luồng cần chạy


1. Threads

export HTTP_PORT=9013
export GRPC_PORT=9011

export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658

export MYSQL_NEWS_APP_CONNECTION_PASSWORD=kejudsY%44sd
export MYSQL_DEFAULT_CONNECTION_HOST=192.168.1.252
export MYSQL_DEFAULT_CONNECTION_USER=crawler
export MYSQL_NEWS_APP_CONNECTION_HOST=192.168.1.252
export MYSQL_NEWS_APP_CONNECTION_USER=crawler
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_PORT=6033
export MYSQL_DEFAULT_CONNECTION_PORT=6033
export MYSQL_NEWS_APP_CONNECTION_PORT=6033
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_PASSWORD=kejudsY%44sd
export MYSQL_DEFAULT_CONNECTION_PASSWORD=kejudsY%44sd
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_HOST=192.168.1.252
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_USER=crawler

export THREADS_KEYWORD_POST_CRAWLING_LOADER_ENABLE=false
export THREADS_KEYWORD_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false
export THREADS_HASHTAG_POST_CRAWLING_LOADER_ENABLE=false
export THREADS_HASHTAG_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false
export THREADS_SOURCE_POST_CRAWLING_LOADER_ENABLE=false
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false
export SOURCE_REPLY_CRAWLING_LOADER_ENABLE=false
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_ENABLE=true

export PRIORITY_POST_COMMENT_CRAWLING_LOADER_ENABLE=false
export CRISIS_POST_COMMENT_CRAWLING_LOADER_ENABLE=false
export COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=true
export PRIORITY_COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=true
export CRISIS_COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=true
export POST_COMMENT_CRAWLING_LOADER_ENABLE=false

export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_ENABLE=false
export REPOST_CRAWLING_LOADER_ENABLE=false
export REPOST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false
export THREADS_FOLLOWERS_CRAWLING_LOADER_ENABLE=false
export THREADS_IDENTITY_CRAWLING_LOADER_ENABLE=false
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_ENABLE=false


export MONGO_SOCIAL_HEAT_DATABASE=socialheat_testing
export MONGO_SOCIAL_HEAT_USERNAME=ynm_socialheat
export MONGO_SOCIAL_HEAT_REPLICA_SET=rs0
export MONGO_SOCIAL_HEAT_PASSWORD=PfsFf6gmqoGP38
export MONGO_SOCIAL_HEAT_HOST=mongos-router.ynm.local
export MONGO_SOCIAL_HEAT_AUTH_SOURCE=socialheat_testing
export MONGO_SOCIAL_HEAT_PORT=27017


export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null

yarn testing:tr-loader



- Threads comment -> Hiện tại threads comment đã có field created_date ở mention, và post_created_date ở replies (Loader cũng đã load post_created_date )

export HTTP_PORT=6010
export GRPC_PORT=6011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
 
export MYSQL_DEFAULT_CONNECTION_PORT=3306
export MYSQL_DEFAULT_CONNECTION_DATABASE=monitoring_master
export MYSQL_DEFAULT_NEWS_PORT=3306
export MYSQL_DEFAULT_NEWS_DATABASE=monitoring_master

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
export TR_GRAPH_SERVICE_DELAY_TIMEOUT=3000

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.posts_comment_crawling_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.comments
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.crawled_source
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.posts_comment_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.posts_comment_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.comments.next_page

export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_TYPE=posts
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390
export REDIS_DB=3

export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1e 

export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1

yarn testing:tr-reply-crawler


+ Message sau khi crawl đc
{
        "id": "1eea9160-f2fe-5cb0-81dc-9bedb65c96c2",
        "link": "threads.net/t/DRmw7tJCJqz",
        "id_social": "3777182315245037656",
        "title": "Andrew Tate",
        "id_source": "tr_74880870592",
        "level": 1,
        "created_date": "2025-11-30T09:34:02.000Z",
        "crawled_date": "2025-12-25T10:25:48.130Z",
        "post_created_date": "2025-11-28T15:47:07Z",
        "last_status": 0,
        "createdBy": "ThreadsPostCommentCrawlingLoader",
        "caption": "Andrew Tate announced that he refuses to sleep with vaccinated women.\nIf you didn't believe vaccines work before, you should now."
      }


- Threads reply -> Hiện tại threads comment đã có field created_date ở mention, và post_created_date ở replies (Loader cũng đã load post_created_date )

export HTTP_PORT=6010
export GRPC_PORT=6011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658

export MYSQL_DEFAULT_CONNECTION_PORT=3306
export MYSQL_DEFAULT_CONNECTION_DATABASE=monitoring_master
export MYSQL_DEFAULT_NEWS_PORT=3306
export MYSQL_DEFAULT_NEWS_DATABASE=monitoring_master

export TOKEN_MANAGER_SERVICE_PORT=9011
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
export TR_GRAPH_SERVICE_DELAY_TIMEOUT=3000

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.posts_sub_comment_crawling_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.sub_comments
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.posts_sub_comment_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.posts_sub_comment_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.sub_comments.next_page
 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_TYPE=replies
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390 
export REDIS_DB=3
 
export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=1000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1

export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1

yarn testing:tr-reply-crawler



- Source reply -> Hiện tại threads source reply đã có field created_date ở mention, và post_created_date ở replies, chỉ có đều post_last_date và created_date ở reply lại đang có giá trị bằng nhau -> Đang nghi là sai post_created_date ở replies

export HTTP_PORT=9999
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_replies_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_CREATED_BY=ThreadsKeywordPostCrawlingLoader
 

export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
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

export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390
export REDIS_DB=3
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_MAX_RETRIES_PER_REQUEST=null
    
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post
export REDIS_POST_PASSWORD=RHTkP9M79at6
export REDIS_POST_DB=12
 
yarn start --scope=@ynm/cl-tr-source-reply-crawler-service

- Reply Crawl Post -> Hiện tại threads reply crawl post đã có field created_date ở mention, và post_created_date ở replies, chỉ có đều post_last_date và created_date ở reply lại đang có giá trị bằng nhau -> Đang nghi là sai post_created_date ở replies

export HTTP_PORT=9030
export GRPC_PORT=9031
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658

export MYSQL_DEFAULT_CONNECTION_PORT=3306
export MYSQL_DEFAULT_CONNECTION_DATABASE=monitoring_master
export MYSQL_DEFAULT_NEWS_PORT=3306
export MYSQL_DEFAULT_NEWS_DATABASE=monitoring_master

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
export TR_GRAPH_SERVICE_DELAY_TIMEOUT=3000
export CRAWLER_CONFIG_CRAWLING_ROUTING_KEY=cl.10.*.*.reply-post-detail
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reply_posts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reply_posts_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reply_post 
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reply_posts_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reply_post.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_ROUTING_KEY=cl.10.*.*.reply_post.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PAGING_ENABLE=true

export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER

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
export RESOLVER_MAX_RETRIES=10

export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390
export REDIS_DB=3
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_MAX_RETRIES_PER_REQUEST=null
    
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post
export REDIS_POST_PASSWORD=RHTkP9M79at6
export REDIS_POST_DB=12


yarn testing:tr-reply-post


2. Youtube

- Get lastest comment reply -> Chỗ này có thêm load post_created_date lên

//Load Souce
node scripts/youtubeV3/monitoring_priority_video.js
 
//Crawl Comment -> Hiện tại đã đúng với yêu cầu
node scripts/youtubeV3/get_latest_priority_videos_comments_by_api.js


	{
        "id": "4973c464-5146-5c31-a36e-f807bf8236e5",
        "id_source": "UClYUCB6tyZl50_7OcbgUHCA",
        "id_social": "Ugz9CfSbGWliJdKQPr14AaABAg",
        "title": "Thái Lan pháo kích, tiếp tục điều F-16 tấn công, Campuchia có động thái nóng",
        "priority": null,
        "source_type": null,
        "created_date": "2025-12-17T10:03:07Z",
        "createdBy": "YoutubeGetLatestPriorityVideosCommentsByApi",
        "video_id": "1hFhqsoyaRs",
        "caption": "Tin tức mới nhất | Thái Lan pháo kích, tiếp tục điều F-16 tấn công, Campuchia có động thái nóng\nBộ Quốc phòng Campuchia ngày 17/12 đã thông báo về một đợt tấn công mới của quân đội Thái Lan, khi tiêm kích F-16 của phía Bangkok ném bom vào làng Prey Chan, tỉnh Banteay Meanchey. Cùng với đó, các đợt pháo kích mạnh mẽ từ phía Thái Lan đã được ghi nhận tại khu vực Quân khu 5, gồm tỉnh Banteay Meanchey và Pursat.\n\nVẤN ĐỀ HÔM NAY - Cập nhật tin tức 24h trong ngày\nĐăng ký và nhấn chuông thông báo để cập nhật những tin tức mới và nóng nhất: \nTham gia làm hội viên của kênh để được hưởng đặc quyền:\nhttps://www.youtube.com/channel/UClYUCB6tyZl50_7OcbgUHCA/join\nVấn đề hôm nay, vtc news, VTC NEWS, VTC News Tin tức, tin tức, tin tức 24h, thời sự, tin thế giới, tin tức thế giới, thời sự quốc tế, tin trong nước, tin quốc tế, tin nóng thế giới, thái lan pháo kích, f-16 thái lan tấn công, thái lan không kích campuchia, campuchia phản ứng nóng, f-16 ném bom prey chan.\n#vandehomnay #tintuc #tinthegioi",
        "topic_types": [
          1,
          5,
          15,
          14
        ],
        "post_created_date": "2025-12-17T10:02:56Z"
      }
 
 
//Crawl Replies -> Hiện tại đã chạy đúng yêu cầu
node scripts/youtubeV2/get_latest_priority_comments_replies.js

3. Facebook


export HTTP_PORT=9013
export GRPC_PORT=9011
   
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
   
 
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_PORT=6033
export MYSQL_DEFAULT_CONNECTION_PORT=6033
export PAGE_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=1
export PAGE_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export PAGE_POST_CRAWLING_LOADER_LIMIT=1000
export PAGE_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export PAGE_POST_CRAWLING_LOADER_ENABLE=false
   



export PAGE_WEB_COMMENT_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=1
export PAGE_WEB_COMMENT_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export PAGE_WEB_COMMENT_CRAWLING_LOADER_LIMIT=1000
export PAGE_WEB_COMMENT_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export PAGE_WEB_COMMENT_CRAWLING_LOADER_ENABLE=true
 
export REDIS_DB=1  
   
yarn testing:loader


- Facebook Comment




- Facebook Web Comment ->  Hiện tại fb page web comment đã có field created_date ở mention -> Không cần check ở replies vì fb không lưu lại replies

export FB_GRAPH_SERVICE_ENDPOINT=https://www.facebook.com/api
   
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=null
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=null
    
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.page_web_comments_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.page_web_comments_crawling_requests
    
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.2.*.comments-web
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.page_web_comments_crawled_sources
    
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.fb.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.2.*.comments-web.next_page
    
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
   
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_KEYWORD_POST_NON_CRISIS_CRAWLER
    
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=10
     
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=10
     
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=10
    
export HTTP_PORT=9014
    
yarn testing:web-comment


+ Messsage khi crawl duoc
{
  "mentions": [
    {
      "id": "1cf8db62-ea51-5b11-bfad-e3856faec752",
      "id_social": "1149258080523517",
      "link": "fb.com/1382344273588544_1149258080523517",
      "id_source": "fb_1871839526453702",
      "id_reference": "02567618-6088-5058-9b1d-33b5434761c8",
      "id_parent_comment": null,
      "identity": "fb_61557817021582",
      "identity_name": "Goying gruz",
      "source_type": 2,
      "search_text_exactly": null,
      "mention_type": 2,
      "mention_type_details": 2,
      "search_text": [
        "",
        "Follow me"
      ],
      "attachment": "{\"parent_info\":{\"link\":\"fb.com/1871839526453702_1382344273588544\",\"title\":\"Shout out to my\"}}",
      "title": null,
      "link_shared": null,
      "link_shared_domain": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "created_date": "2025-12-03T05:59:55.000Z",
      "updated_at": "2025-12-26T06:57:38.377Z",
      "platform": 1,
      "domain": "facebook.com",
      "shard": "20251203",
      "createdBy": "PageWebCommentCrawlingLoader"
    }
  ],
  "parent_posts": {
    "02567618-6088-5058-9b1d-33b5434761c8": {
      "title": "Shout out to my",
      "caption": "Shout out to my newest followers! Excited to have you onboard! Majidul SK, Baby Sutradhar, Mdrakibulislam Rakib, রিমঝিম তাঁরা, Jannati Khatun, Billal Miya",
      "created_date": "2025-12-03T04:39:09Z"
    }
  }
}

4. News

Parse detail -> Hiện tại luồng nay có thể khong có comments


5. Tiktok -> Hiện tại luồng này chưa chạy được -> Hiện tại đã đúng với yêu cầu

- tiktok-get-latest-post-comments

node scripts/tiktok/get_latest_post_comments.js

// Message crawl duoc
{
  "mentions": [
    {
      "id": "56f8f23f-ad84-5bb4-a2d9-6a5529c32f5c",
      "link": "tiktok.com/@MS4wLjABAAAAUyQRj9meFYdNmJJVa9T1KltnYoi1eqdsWpzAbKFgQIaP5gEVXhmx9yr3eAFg2Cnz/video/7582499584354651399#7582582507998905109",
      "domain": "tiktok.com",
      "id_source": "tt_MS4wLjABAAAAUyQRj9meFYdNmJJVa9T1KltnYoi1eqdsWpzAbKFgQIaP5gEVXhmx9yr3eAFg2Cnz",
      "id_reference": "1a8c7a43-5259-5e96-a5bb-4187d8d6c4a9",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "tt_MS4wLjABAAAAe_ZIqCOUXSwDXU2We9c0bGoCzq6VVYMUtrEADNuuJfXcZiUVJchYuYcZLRG8M9Wf",
      "identity_name": "Lê sâm",
      "platform": 9,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": null,
      "search_text": [
        "",
        "❤❤❤"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"parent_info\":{\"link\":\"tiktok.com/@MS4wLjABAAAAUyQRj9meFYdNmJJVa9T1KltnYoi1eqdsWpzAbKFgQIaP5gEVXhmx9yr3eAFg2Cnz/video/7582499584354651399\",\"title\":\"Xuân ơi Xuân hết\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-12-11T12:52:56.000Z",
      "updated_at": "2025-12-26T10:22:38.883Z",
      "shard": "20251211",
      "createdBy": "TiktokGetLatestPostComments",
      "id_social": "7582582507998905109"
    },
    {
      "id": "a58e04c6-247b-5206-b4cb-92d31bb43156",
      "link": "tiktok.com/@MS4wLjABAAAAY7BK5ySXMcXZ1egULasAX2fmRjCbN4OZZh9Tfez-MYzV9gCnRplEQBDdzxPPLiCi/video/7582510883717287189#7582869700733846292",
      "domain": "tiktok.com",
      "id_source": "tt_MS4wLjABAAAAY7BK5ySXMcXZ1egULasAX2fmRjCbN4OZZh9Tfez-MYzV9gCnRplEQBDdzxPPLiCi",
      "id_reference": "fb7e8bbc-2a87-5e18-9b14-b9eea4dd3d1b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "tt_MS4wLjABAAAAY7BK5ySXMcXZ1egULasAX2fmRjCbN4OZZh9Tfez-MYzV9gCnRplEQBDdzxPPLiCi",
      "identity_name": "Min Mũm Mĩm",
      "platform": 9,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": null,
      "search_text": [
        "",
        "Tẻn V mới bền 🤭🤭"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"parent_info\":{\"link\":\"tiktok.com/@MS4wLjABAAAAY7BK5ySXMcXZ1egULasAX2fmRjCbN4OZZh9Tfez-MYzV9gCnRplEQBDdzxPPLiCi/video/7582510883717287189\",\"title\":\"Một đứa khùng ở\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-12-12T07:27:29.000Z",
      "updated_at": "2025-12-26T10:22:38.883Z",
      "shard": "20251212",
      "createdBy": "TiktokGetLatestPostComments",
      "id_social": "7582869700733846292"
    }
  ],
  "parent_posts": {
    "1a8c7a43-5259-5e96-a5bb-4187d8d6c4a9": {
      "title": "Xuân ơi Xuân hết",
      "created_date": "2025-12-24T07:31:08Z"
    },
    "fb7e8bbc-2a87-5e18-9b14-b9eea4dd3d1b": {
      "title": "Một đứa khùng ở",
      "created_date": "2025-12-24T08:14:56Z"
    }
  }
}

6. Instagram -> Hiện tại luồng instagram comment đã có field created_date ở mention -> Không cần check ở instagram vì fb không lưu lại replies

- instagram-get-latest-post-comments

node scripts/instagram/get_latest_post_comments.js


IG_API_ENDPOINT=http://graph-instagram-api-testing.ynm.local/ node scripts/instagram/get_latest_post_comments.js

7. Forum -> Hiện tại luồng này chưa chạy được -> Hiện tại bên Đồng đã chạy thành công

// Câu query:
q=*:* 
&fl=id,
    id_source,
    post_page,
    post_network_failed,
    post_parse_failed,
    post_page_from,
    post_page_to,
    post_is_new,
    post_old,
    title,
    link,
    priority,
    post_updated_at,
    caption
&fq=thread_state:2
&fq=post_is_new:1
&fq=post_updated_at:[* TO 1766746228}
&rows=1000
&sort=post_updated_at asc, id asc




- forums-get-posts
node scripts/forumV3/get_posts.js

- forums-get-posts-prev
node scripts/forumV3/get_posts_prev.js


{
  "mentions": [
    {
      "id": "0f5243f5-2095-5805-b064-332cb8a5a0cb",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23973854",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_quannguyentsnct",
      "identity_name": "quannguyentsnct",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\">Toy ko có giải nào ? thật khó tin.</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/quannguyentsnct.306623/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T06:24:18.000Z",
      "updated_at": "2025-12-29T08:01:21.995Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23973854
    },
    {
      "id": "bb314611-ce8a-5585-9677-e243de230ddd",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23973903",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_crabs",
      "identity_name": "crabs",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\"><blockquote class=\"bbCodeBlock bbCodeBlock--expandable bbCodeBlock--quote js-expandWatch\">\n\t\n\t\t<div class=\"bbCodeBlock-title\">\n\t\t\t\n\t\t\t\t<a class=\"bbCodeBlock-sourceJump\">quannguyentsnct nói:</a>\n\t\t\t\n\t\t</div>\n\t\n\t<div class=\"bbCodeBlock-content\">\n\t\t\n\t\t<div class=\"bbCodeBlock-expandContent js-expandContent \">\n\t\t\tToy ko có giải nào ? thật khó tin.\n\t\t</div>\n\t\t\n\t</div>\n</blockquote>anh gì đó cũng đầy giải nội địa mà qt chưa có giải nhỉ?</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/crabs.192854/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T06:45:41.000Z",
      "updated_at": "2025-12-29T08:01:21.995Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23973903
    },
    {
      "id": "e99e94ca-5952-5ecc-a83e-528b99679b8b",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23973937",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_nta139",
      "identity_name": "nta139",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\"><blockquote class=\"bbCodeBlock bbCodeBlock--expandable bbCodeBlock--quote js-expandWatch\">\n\t\n\t\t<div class=\"bbCodeBlock-title\">\n\t\t\t\n\t\t\t\t<a class=\"bbCodeBlock-sourceJump\">quannguyentsnct nói:</a>\n\t\t\t\n\t\t</div>\n\t\n\t<div class=\"bbCodeBlock-content\">\n\t\t\n\t\t<div class=\"bbCodeBlock-expandContent js-expandContent \">\n\t\t\tToy ko có giải nào ? thật khó tin.\n\t\t</div>\n\t\t\n\t</div>\n</blockquote>lexus lx...<br>\n<div class=\"bbImageWrapper  js-lbImage\" title=\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi\">\n\t\t<img src=\"https://cdn1.otosaigon.com/data-resize/attachments/3381/3381308-ee0ccdc9b091bcaeb57db29a6a99ee69.jpg?w=750\" class=\"bbImage\" alt=\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi\" title=\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi\" width=\"420\" height=\"50\">\n\t</div></div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/nta139.172218/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T06:59:49.000Z",
      "updated_at": "2025-12-29T08:01:21.995Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23973937
    },
    {
      "id": "cee2fd97-ecdb-5a48-ba82-d8cf069a1964",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23975061",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_phikimtuan",
      "identity_name": "PhiKimTuan",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\">Tốt nhứt không có nghĩa là bền nhứt <img class=\"smilie smilie--sprite smilie--sprite8\" alt=\":D\" title=\"Big Grin    :D\"><img class=\"smilie smilie--sprite smilie--sprite8\" alt=\":D\" title=\"Big Grin    :D\"><img class=\"smilie smilie--sprite smilie--sprite8\" alt=\":D\" title=\"Big Grin    :D\"></div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/phikimtuan.207593/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T17:19:55.000Z",
      "updated_at": "2025-12-29T08:01:21.995Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23975061
    },
    {
      "id": "79780dc0-0ad6-58a0-a7d8-a500483969db",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23975276",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_ga.an.thoc",
      "identity_name": "Ga.An.Thoc",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\"><blockquote class=\"bbCodeBlock bbCodeBlock--expandable bbCodeBlock--quote js-expandWatch\">\n\t\n\t\t<div class=\"bbCodeBlock-title\">\n\t\t\t\n\t\t\t\t<a class=\"bbCodeBlock-sourceJump\">nta139 nói:</a>\n\t\t\t\n\t\t</div>\n\t\n\t<div class=\"bbCodeBlock-content\">\n\t\t\n\t\t<div class=\"bbCodeBlock-expandContent js-expandContent \">\n\t\t\tlexus lx...<br>\n<a>View attachment 3373667</a>\n\t\t</div>\n\t\t\n\t</div>\n</blockquote>đang nói toy mà bác</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/ga-an-thoc.184890/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-02T01:05:01.000Z",
      "updated_at": "2025-12-29T08:01:21.995Z",
      "shard": "20251002",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23975276
    },
    {
      "id": "35bef686-7c26-5dcf-a1ac-585adac75dd1",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23979473",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_osakagarden",
      "identity_name": "OSAKAGARDEN",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\">đi sau tụi xe xăng dầu lấy gió ngoài vẫn hôi<br>\nmong 1 ngày lúc nào ra đường cũng có thể lấy gió ngoài<br>\nvì bên trong nhiều mùi quá, dầu gió, nước hoa, hách nôi....<br>\ne chạy dịch vụ!</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/osakagarden.112993/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-03T19:28:54.000Z",
      "updated_at": "2025-12-29T08:01:21.995Z",
      "shard": "20251003",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23979473
    },
    {
      "id": "0f5243f5-2095-5805-b064-332cb8a5a0cb",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23973854",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_quannguyentsnct",
      "identity_name": "quannguyentsnct",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\">Toy ko có giải nào ? thật khó tin.</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/quannguyentsnct.306623/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T06:24:18.000Z",
      "updated_at": "2025-12-29T08:01:21.995Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23973854
    },
    {
      "id": "bb314611-ce8a-5585-9677-e243de230ddd",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23973903",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_crabs",
      "identity_name": "crabs",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\"><blockquote class=\"bbCodeBlock bbCodeBlock--expandable bbCodeBlock--quote js-expandWatch\">\n\t\n\t\t<div class=\"bbCodeBlock-title\">\n\t\t\t\n\t\t\t\t<a class=\"bbCodeBlock-sourceJump\">quannguyentsnct nói:</a>\n\t\t\t\n\t\t</div>\n\t\n\t<div class=\"bbCodeBlock-content\">\n\t\t\n\t\t<div class=\"bbCodeBlock-expandContent js-expandContent \">\n\t\t\tToy ko có giải nào ? thật khó tin.\n\t\t</div>\n\t\t\n\t</div>\n</blockquote>anh gì đó cũng đầy giải nội địa mà qt chưa có giải nhỉ?</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/crabs.192854/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T06:45:41.000Z",
      "updated_at": "2025-12-29T08:01:21.995Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23973903
    },
    {
      "id": "e99e94ca-5952-5ecc-a83e-528b99679b8b",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23973937",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_nta139",
      "identity_name": "nta139",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\"><blockquote class=\"bbCodeBlock bbCodeBlock--expandable bbCodeBlock--quote js-expandWatch\">\n\t\n\t\t<div class=\"bbCodeBlock-title\">\n\t\t\t\n\t\t\t\t<a class=\"bbCodeBlock-sourceJump\">quannguyentsnct nói:</a>\n\t\t\t\n\t\t</div>\n\t\n\t<div class=\"bbCodeBlock-content\">\n\t\t\n\t\t<div class=\"bbCodeBlock-expandContent js-expandContent \">\n\t\t\tToy ko có giải nào ? thật khó tin.\n\t\t</div>\n\t\t\n\t</div>\n</blockquote>lexus lx...<br>\n<div class=\"bbImageWrapper  js-lbImage\" title=\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi\">\n\t\t<img src=\"https://cdn1.otosaigon.com/data-resize/attachments/3381/3381308-ee0ccdc9b091bcaeb57db29a6a99ee69.jpg?w=750\" class=\"bbImage\" alt=\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi\" title=\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi\" width=\"420\" height=\"50\">\n\t</div></div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/nta139.172218/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T06:59:49.000Z",
      "updated_at": "2025-12-29T08:01:21.996Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23973937
    },
    {
      "id": "cee2fd97-ecdb-5a48-ba82-d8cf069a1964",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23975061",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_phikimtuan",
      "identity_name": "PhiKimTuan",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\">Tốt nhứt không có nghĩa là bền nhứt <img class=\"smilie smilie--sprite smilie--sprite8\" alt=\":D\" title=\"Big Grin    :D\"><img class=\"smilie smilie--sprite smilie--sprite8\" alt=\":D\" title=\"Big Grin    :D\"><img class=\"smilie smilie--sprite smilie--sprite8\" alt=\":D\" title=\"Big Grin    :D\"></div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/phikimtuan.207593/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T17:19:55.000Z",
      "updated_at": "2025-12-29T08:01:21.996Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23975061
    },
    {
      "id": "79780dc0-0ad6-58a0-a7d8-a500483969db",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23975276",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_ga.an.thoc",
      "identity_name": "Ga.An.Thoc",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\"><blockquote class=\"bbCodeBlock bbCodeBlock--expandable bbCodeBlock--quote js-expandWatch\">\n\t\n\t\t<div class=\"bbCodeBlock-title\">\n\t\t\t\n\t\t\t\t<a class=\"bbCodeBlock-sourceJump\">nta139 nói:</a>\n\t\t\t\n\t\t</div>\n\t\n\t<div class=\"bbCodeBlock-content\">\n\t\t\n\t\t<div class=\"bbCodeBlock-expandContent js-expandContent \">\n\t\t\tlexus lx...<br>\n<a>View attachment 3373667</a>\n\t\t</div>\n\t\t\n\t</div>\n</blockquote>đang nói toy mà bác</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/ga-an-thoc.184890/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-02T01:05:01.000Z",
      "updated_at": "2025-12-29T08:01:21.996Z",
      "shard": "20251002",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23975276
    },
    {
      "id": "35bef686-7c26-5dcf-a1ac-585adac75dd1",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23979473",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_osakagarden",
      "identity_name": "OSAKAGARDEN",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\">đi sau tụi xe xăng dầu lấy gió ngoài vẫn hôi<br>\nmong 1 ngày lúc nào ra đường cũng có thể lấy gió ngoài<br>\nvì bên trong nhiều mùi quá, dầu gió, nước hoa, hách nôi....<br>\ne chạy dịch vụ!</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/osakagarden.112993/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-03T19:28:54.000Z",
      "updated_at": "2025-12-29T08:01:21.996Z",
      "shard": "20251003",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23979473
    },
    {
      "id": "0f5243f5-2095-5805-b064-332cb8a5a0cb",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23973854",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_quannguyentsnct",
      "identity_name": "quannguyentsnct",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\">Toy ko có giải nào ? thật khó tin.</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/quannguyentsnct.306623/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T06:24:18.000Z",
      "updated_at": "2025-12-29T08:01:21.996Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23973854
    },
    {
      "id": "bb314611-ce8a-5585-9677-e243de230ddd",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23973903",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_crabs",
      "identity_name": "crabs",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\"><blockquote class=\"bbCodeBlock bbCodeBlock--expandable bbCodeBlock--quote js-expandWatch\">\n\t\n\t\t<div class=\"bbCodeBlock-title\">\n\t\t\t\n\t\t\t\t<a class=\"bbCodeBlock-sourceJump\">quannguyentsnct nói:</a>\n\t\t\t\n\t\t</div>\n\t\n\t<div class=\"bbCodeBlock-content\">\n\t\t\n\t\t<div class=\"bbCodeBlock-expandContent js-expandContent \">\n\t\t\tToy ko có giải nào ? thật khó tin.\n\t\t</div>\n\t\t\n\t</div>\n</blockquote>anh gì đó cũng đầy giải nội địa mà qt chưa có giải nhỉ?</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/crabs.192854/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T06:45:41.000Z",
      "updated_at": "2025-12-29T08:01:21.996Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23973903
    },
    {
      "id": "e99e94ca-5952-5ecc-a83e-528b99679b8b",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23973937",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_nta139",
      "identity_name": "nta139",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\"><blockquote class=\"bbCodeBlock bbCodeBlock--expandable bbCodeBlock--quote js-expandWatch\">\n\t\n\t\t<div class=\"bbCodeBlock-title\">\n\t\t\t\n\t\t\t\t<a class=\"bbCodeBlock-sourceJump\">quannguyentsnct nói:</a>\n\t\t\t\n\t\t</div>\n\t\n\t<div class=\"bbCodeBlock-content\">\n\t\t\n\t\t<div class=\"bbCodeBlock-expandContent js-expandContent \">\n\t\t\tToy ko có giải nào ? thật khó tin.\n\t\t</div>\n\t\t\n\t</div>\n</blockquote>lexus lx...<br>\n<div class=\"bbImageWrapper  js-lbImage\" title=\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi\">\n\t\t<img src=\"https://cdn1.otosaigon.com/data-resize/attachments/3381/3381308-ee0ccdc9b091bcaeb57db29a6a99ee69.jpg?w=750\" class=\"bbImage\" alt=\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi\" title=\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi\" width=\"420\" height=\"50\">\n\t</div></div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/nta139.172218/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T06:59:49.000Z",
      "updated_at": "2025-12-29T08:01:21.996Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23973937
    },
    {
      "id": "cee2fd97-ecdb-5a48-ba82-d8cf069a1964",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23975061",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_phikimtuan",
      "identity_name": "PhiKimTuan",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\">Tốt nhứt không có nghĩa là bền nhứt <img class=\"smilie smilie--sprite smilie--sprite8\" alt=\":D\" title=\"Big Grin    :D\"><img class=\"smilie smilie--sprite smilie--sprite8\" alt=\":D\" title=\"Big Grin    :D\"><img class=\"smilie smilie--sprite smilie--sprite8\" alt=\":D\" title=\"Big Grin    :D\"></div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/phikimtuan.207593/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-01T17:19:55.000Z",
      "updated_at": "2025-12-29T08:01:21.996Z",
      "shard": "20251001",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23975061
    },
    {
      "id": "79780dc0-0ad6-58a0-a7d8-a500483969db",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23975276",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_ga.an.thoc",
      "identity_name": "Ga.An.Thoc",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\"><blockquote class=\"bbCodeBlock bbCodeBlock--expandable bbCodeBlock--quote js-expandWatch\">\n\t\n\t\t<div class=\"bbCodeBlock-title\">\n\t\t\t\n\t\t\t\t<a class=\"bbCodeBlock-sourceJump\">nta139 nói:</a>\n\t\t\t\n\t\t</div>\n\t\n\t<div class=\"bbCodeBlock-content\">\n\t\t\n\t\t<div class=\"bbCodeBlock-expandContent js-expandContent \">\n\t\t\tlexus lx...<br>\n<a>View attachment 3373667</a>\n\t\t</div>\n\t\t\n\t</div>\n</blockquote>đang nói toy mà bác</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/ga-an-thoc.184890/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-02T01:05:01.000Z",
      "updated_at": "2025-12-29T08:01:21.996Z",
      "shard": "20251002",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23975276
    },
    {
      "id": "35bef686-7c26-5dcf-a1ac-585adac75dd1",
      "link": "https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/post-23979473",
      "domain": "otosaigon.com",
      "id_source": "otosaigon.com",
      "id_reference": "61e5e501-4354-5349-aea1-322baaec709b",
      "id_parent_comment": null,
      "views": 0,
      "likes": 0,
      "comments": 0,
      "shares": 0,
      "rating_score": 0,
      "engagement_total": 0,
      "engagement_s_c": 0,
      "identity": "otosaigon.com_osakagarden",
      "identity_name": "OSAKAGARDEN",
      "platform": 2,
      "mention_type": 2,
      "mention_type_details": 2,
      "title": "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "search_text": [
        "RE: 10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
        "<div class=\"bbWrapper\">đi sau tụi xe xăng dầu lấy gió ngoài vẫn hôi<br>\nmong 1 ngày lúc nào ra đường cũng có thể lấy gió ngoài<br>\nvì bên trong nhiều mùi quá, dầu gió, nước hoa, hách nôi....<br>\ne chạy dịch vụ!</div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>"
      ],
      "sound": [],
      "effect": [],
      "attachment": "{\"user_profile_url\":\"https://www.otosaigon.com/members/osakagarden.112993/\",\"parent_info\":{\"link\":\"https://www.otosaigon.com/threads/10-he-truyen-dong-o-to-tot-nhat-da-phan-la-xe-hybrid-ky-nguyen-dien-hoa-len-ngoi.10041993/\",\"title\":\"10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon\"}}",
      "link_shared": null,
      "link_shared_domain": null,
      "source_type": null,
      "created_date": "2025-10-03T19:28:54.000Z",
      "updated_at": "2025-12-29T08:01:21.996Z",
      "shard": "20251003",
      "createdBy": "OtosaigonGetPosts",
      "id_social": 23979473
    }
  ],
  "parent_posts": {
    "61e5e501-4354-5349-aea1-322baaec709b": {
      "title": "10 hệ truyền động ô tô tốt nhất: Đa phần là xe hybrid, kỷ nguyên điện hóa lên ngôi | Otosaigon",
      "caption": "<div class=\"bbWrapper\"><b>Wards đã công bố 10 hệ truyền động chiến thắng giải thưởng Tốt nhất hàng năm và danh sách này nghiêng hẳn về các hệ thống điện hóa.</b><br>\n<br>\n<div class=\"bbImageWrapper  js-lbImage\" title=\"bmw-m5-0.jpg\">\n\t\t<img src=\"https://cdn1.otosaigon.com/data-resize/attachments/3380/3380764-26308d41970a037b2ea1593fb6a723d0.jpg?w=750\" class=\"bbImage\" alt=\"bmw-m5-0.jpg\" title=\"bmw-m5-0.jpg\" width=\"1600\" height=\"900\">\n\t</div><br>\n<br>\nTrong suốt 31 năm qua, Wards Auto đã tổng hợp danh sách thường niên 10 Động cơ & Hệ thống truyền động Tốt nhất, nhằm vinh danh những hệ truyền động sáng tạo và có hiệu suất cao nhất trên thị trường. Qua nhiều năm, danh sách này đã từng ghi nhận mọi thứ, từ động cơ bốn xi-lanh tăng áp, V8 mạnh mẽ, cho đến các hệ thống hybrid và thuần điện.<br>\n<br>\nNăm nay, với sự gia tăng mạnh mẽ của xe điện hóa tại Mỹ, không có gì ngạc nhiên khi danh sách nghiêng hẳn về xe hybrid và xe điện (EV). Đáng tiếc, điều này khiến cho những động cơ hút khí tự nhiên, đặc biệt là động cơ V8, không còn nhiều chỗ đứng.<br>\n<br>\n<div class=\"bbImageWrapper  js-lbImage\" title=\"bmw-m5-2024-im-test.jpg\">\n\t\t<img src=\"https://cdn1.otosaigon.com/data-resize/attachments/3380/3380765-76144ac7b486d9763dc7b73f2fa5bf27.jpg?w=750\" class=\"bbImage\" alt=\"bmw-m5-2024-im-test.jpg\" title=\"bmw-m5-2024-im-test.jpg\" width=\"1920\" height=\"1080\">\n\t</div><br>\n<br>\nHệ truyền động điện được đại diện bởi bốn mẫu xe: Nissan Leaf, Lucid Gravity, Hyundai Ioniq 9 và Dodge Charger Daytona. Về phía xe hybrid, năm mẫu xe đã lọt vào danh sách: BMW M5, Honda Civic, Ford F-150, Lexus LX và Mercedes-AMG E53.<br>\n<br>\nChỉ có hai động cơ V8 xuất hiện trong năm nay: hệ thống plug-in hybrid của BMW M5 và động cơ V8 5.5L của Corvette ZR1.<br>\n<br>\n<b>Dưới đây là danh sách đầy đủ:</b><br>\n<ul>\n<li>BMW M5 — Động cơ V8 4.4L Tăng áp PHEV (Plug-in Hybrid Electric Vehicle)</li>\n<li>Chevrolet Corvette ZR1 — Động cơ V8 5.5L Tăng áp kép</li>\n<li>Dodge Charger Daytona — Hệ thống truyền động điện (Electric Propulsion System)</li>\n<li>Ford F-150 — Động cơ V6 3.5L Tăng áp HEV (Hybrid Electric Vehicle) (Đã thắng giải năm 2024)</li>\n<li>Honda Civic Hybrid — Động cơ I-4 2.0L HEV (Đã thắng giải năm 2024)</li>\n<li>Hyundai Ioniq 9 — Hệ thống truyền động điện</li>\n<li>Lexus LX — 700h Động cơ V6 3.4L Tăng áp HEV</li>\n<li>Lucid Gravity — Hệ thống truyền động điện</li>\n<li>Mercedes-AMG E53 — Động cơ I-6 3.0L Tăng áp PHEV</li>\n<li>Nissan Leaf – Hệ thống truyền động điện</li>\n</ul><div class=\"bbImageWrapper  js-lbImage\" title=\"Lexus-LX-700h-Overtrail-4-800x533.jpg\">\n\t\t<img src=\"https://cdn1.otosaigon.com/data-resize/attachments/3380/3380759-3a2e828799a6e956f8fd3feb8b53ad78.jpg?w=750\" class=\"bbImage\" alt=\"Lexus-LX-700h-Overtrail-4-800x533.jpg\" title=\"Lexus-LX-700h-Overtrail-4-800x533.jpg\" width=\"800\" height=\"533\">\n\t</div><br>\n<div><i>Lexus LX 700h với Động cơ V6 3.4L Tăng áp HEV</i>​</div><br>\n\"Khi ngành công nghiệp ô tô tránh xa các mốc thời gian chuyển đổi hoàn toàn sang điện trong tương lai gần, người tiêu dùng Mỹ đang chấp nhận điện hóa nhiều hơn bao giờ hết, cụ thể là dưới hình thức hybrid hóa,\" Christie Schweinsberg, quản lý chương trình giải thưởng Wards 10 Best và là giám khảo của Wards 10 Best Engines & Propulsion Systems, cho biết.<br>\n<br>\nTheo Wards, quá trình lựa chọn năm nay bắt đầu với 28 đề cử, bao gồm 10 xe hybrid và 10 xe điện. Các giám khảo đã lái thử từng chiếc xe trước khi chọn ra 10 cái tên cuối cùng. Wards không xếp hạng các hệ truyền động theo thứ tự cụ thể nào, do đó tất cả các xe lọt vào danh sách đều được công nhận ngang nhau.<br>\n<br>\n<div class=\"bbImageWrapper  js-lbImage\" title=\"Honda Civic RS Hybrid (24).jpg\">\n\t\t<img src=\"https://cdn1.otosaigon.com/data-resize/attachments/3380/3380761-3504ab8f0c8d6fdb768b49fa476ca2d3.jpg?w=750\" class=\"bbImage\" alt=\"Honda Civic RS Hybrid (24).jpg\" title=\"Honda Civic RS Hybrid (24).jpg\" width=\"1600\" height=\"1069\">\n\t</div><br>\n<div><i>Honda Civic HEV I4 2.0L (Đã thắng giải năm 2024)</i>​</div><br>\nMột số cái tên chiến thắng như hệ thống hybrid ấn tượng của Honda Civic hay động cơ V6 tuyệt vời của Lexus LX không gây ngạc nhiên. Tuy nhiên, việc thiếu vắng các động cơ V8 vẫn là một điều đáng thất vọng, nhưng đó cũng là dấu hiệu của thời đại.<br>\n<br>\n<div><i>Theo: Wards Auto, Motor 1</i>​</div><br>\n<i>>>> Xem thêm: </i><br>\n<ul>\n<li><a class=\"link link--internal\">10 mẫu xe sử dụng động cơ V10 ấn tượng nhất lịch sử ngành công nghiệp ô tô</a></li>\n<li><a class=\"link link--internal\">Vì sao Hyundai và Kia dần từ bỏ phiên bản động cơ dầu diesel trên các mẫu xe mới?</a></li>\n<li><a class=\"link link--internal\">Kết thúc kỷ nguyên động cơ W-12 của Bentley: Hành trình 21 năm huy hoàng</a></li>\n</ul><b>Các bác nhẫn xét thế nào về kết quả này? Có bác nào đã được trải nghiệm trong các động cơ thắng giải kể trên?</b></div>\n\t\t\t\t\t\t\t\t<div class=\"js-selectToQuoteEnd\"> </div>",
      "created_date": "2025-10-01T03:14:24.976Z"
    }
  }
}



8. Reviews -> Hiện tại luồng này chưa chạy được

- news-crawl-reviews
export SOLR_MASTER_HOST=http://solrmaster-testing.ynm.local 
node scripts/commentsV3/crawl_reviews.js -f ECOM



export COMMON_API_ENDPOINT=http://ynm-cl-common-service-staging.crawler-staging:9010

q=*:* 
&fl=id,
    state,
    platform
&fq=state:1
&fq=platform:6
&rows=1000
&sort=id asc
&cursorMark=*

[
  {
    "mentions": [
      {
        "id": "b8145f27-a5e1-5511-a58e-1fe5ee7d509c",
        "link": "https://concung.com/khan-uot-kho-vai-kho/khan-uot-diu-nhe-animo-khong-mui-100-to-69186.html#84361c340a7c4edf",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "6350a904-cc0d-5b97-9609-2fc01cdaca3d",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "2dd40d5b54b4a6e6",
        "identity_name": "NGUYỄN THỊ CHÂM",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Khăn Ướt Dịu Nhẹ Animo không mùi (100 tờ)",
        "search_text": [
          "Khăn Ướt Dịu Nhẹ Animo không mùi (100 tờ)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/khan-uot-kho-vai-kho/khan-uot-diu-nhe-animo-khong-mui-100-to-69186.html\",\"title\":\"Khăn Ướt Dịu Nhẹ Animo không mùi (100 tờ)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-22T13:59:00.000Z",
        "updated_at": "2025-12-29T10:00:04.382Z",
        "shard": "20251222",
        "createdBy": "ConcungCrawlReviews"
      }
    ],
    "parent_posts": {
      "6350a904-cc0d-5b97-9609-2fc01cdaca3d": {
        "title": "Khăn Ướt Dịu Nhẹ Animo không mùi (100 tờ)",
        "created_date": "2025-10-15T08:14:04.000Z"
      }
    }
  },
  {
    "mentions": [
      {
        "id": "b7f451e5-ee64-5497-a8e7-e1cc5ca1c5a1",
        "link": "https://concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html#a6bd8bb98cd3a456",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "972f7e2b-4bad-52fe-a946-7326f8a37a00",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "cdd35ee49e2f25c9",
        "identity_name": "Hà Phạm",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
        "search_text": [
          "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html\",\"title\":\"Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-19T04:27:00.000Z",
        "updated_at": "2025-12-29T10:00:35.417Z",
        "shard": "20251219",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "a129a6a0-052e-58c5-8d15-c7b7356f18f3",
        "link": "https://concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html#dadc81b03c88e0d8",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "972f7e2b-4bad-52fe-a946-7326f8a37a00",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "7bcf885977434949",
        "identity_name": "Phạm Nguyễn Trúc Linh",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
        "search_text": [
          "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html\",\"title\":\"Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-13T09:40:00.000Z",
        "updated_at": "2025-12-29T10:00:35.417Z",
        "shard": "20251213",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "8070dc7a-a253-5e19-8493-68e897499ec7",
        "link": "https://concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html#38c4175d1f3e5579",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "972f7e2b-4bad-52fe-a946-7326f8a37a00",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "b651895a2bb60a1a",
        "identity_name": "Trần Diễm Uyên",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
        "search_text": [
          "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html\",\"title\":\"Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-09-06T16:53:00.000Z",
        "updated_at": "2025-12-29T10:00:35.417Z",
        "shard": "20250906",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "637d132f-c007-5b9c-95e9-fa8cba72bbbb",
        "link": "https://concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html#7f57bbedbf173464",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "972f7e2b-4bad-52fe-a946-7326f8a37a00",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "a2026e1f3076308c",
        "identity_name": "Nguyễn Thị Bích Lụa",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
        "search_text": [
          "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html\",\"title\":\"Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-08-16T03:12:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250816",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "0552db91-6a85-5e7d-971b-13f83dd3d6a3",
        "link": "https://concung.com/thoi-trang-tre-em/non-vanh-tron-be-gai-1-3y-animo-a2503-jk002-48cm-hong-72458.html#442da1d12907526e",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "181f1c54-548d-59f6-9757-7f3b553042c4",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "9e1574a8d6dd7bda",
        "identity_name": "Xuân Diệu",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Nón vành tròn bé gái 1-3Y Animo A2503_JK002",
        "search_text": [
          "Nón vành tròn bé gái 1-3Y Animo A2503_JK002",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/thoi-trang-tre-em/non-vanh-tron-be-gai-1-3y-animo-a2503-jk002-48cm-hong-72458.html\",\"title\":\"Nón vành tròn bé gái 1-3Y Animo A2503_JK002\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-08-26T04:35:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250826",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "c5a77544-b125-5480-8d7e-b7520f2e4c7d",
        "link": "https://concung.com/thoi-trang-tre-em/set-kep-toc-10-mon-animo-a2501-mn042-nhieu-mau-70443.html#e4535b5bd2886941",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "7e97758a-5ae2-556d-b011-ea8df30ab0b2",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "716c3c96fa4c97dc",
        "identity_name": "Nha Vy",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Set kẹp tóc 10 món Animo A2501_MN042",
        "search_text": [
          "Set kẹp tóc 10 món Animo A2501_MN042",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/thoi-trang-tre-em/set-kep-toc-10-mon-animo-a2501-mn042-nhieu-mau-70443.html\",\"title\":\"Set kẹp tóc 10 món Animo A2501_MN042\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-09-14T06:57:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250914",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "24eff5d8-2bc5-59c6-bde0-3fc4ea1de705",
        "link": "https://concung.com/thoi-trang-tre-em/set-kep-toc-10-mon-animo-a2501-mn042-nhieu-mau-70443.html#2825d4f1dc08e3a7",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "7e97758a-5ae2-556d-b011-ea8df30ab0b2",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "06bedf1952851760",
        "identity_name": "Nguyễn Quyên",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Set kẹp tóc 10 món Animo A2501_MN042",
        "search_text": [
          "Set kẹp tóc 10 món Animo A2501_MN042",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/thoi-trang-tre-em/set-kep-toc-10-mon-animo-a2501-mn042-nhieu-mau-70443.html\",\"title\":\"Set kẹp tóc 10 món Animo A2501_MN042\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-03-27T15:10:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250327",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "0bbae775-7277-5f01-8586-f571581d4b92",
        "link": "https://concung.com/thoi-trang-tre-em/dam-be-gai-animo-easy-tx0625032-1y-trang-duong-tt02-72443.html#e4535b5bd2886941",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "37f95a08-55d0-5e5f-82ef-d37243cdab62",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "716c3c96fa4c97dc",
        "identity_name": "Nha Vy",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Đầm bé gái Animo Easy TX0625032",
        "search_text": [
          "Đầm bé gái Animo Easy TX0625032",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/thoi-trang-tre-em/dam-be-gai-animo-easy-tx0625032-1y-trang-duong-tt02-72443.html\",\"title\":\"Đầm bé gái Animo Easy TX0625032\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-09-14T06:57:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250914",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "85536efe-1f98-5a19-97a0-f65ac748f418",
        "link": "https://concung.com/bim-ta-khuyen-mai/ta-quan-takato-sieu-mem-mai-m-76-mieng-72335.html#c6bb74d249950c70",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "2fc46a8e-4215-5bac-a5cb-4550a07d97d9",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "2182ab4e4c7350d3",
        "identity_name": "Kim Thảo",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Tã quần Takato siêu mềm mại (M, 76 miếng)",
        "search_text": [
          "Tã quần Takato siêu mềm mại (M, 76 miếng)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/bim-ta-khuyen-mai/ta-quan-takato-sieu-mem-mai-m-76-mieng-72335.html\",\"title\":\"Tã quần Takato siêu mềm mại (M, 76 miếng)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-10-03T02:27:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20251003",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "eecc1323-28b1-58dc-9bf3-22f9994b799f",
        "link": "https://concung.com/bim-ta-khuyen-mai/ta-quan-takato-sieu-mem-mai-m-76-mieng-72335.html#1eb5cede4d4501f7",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "2fc46a8e-4215-5bac-a5cb-4550a07d97d9",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "2e1912afb61db802",
        "identity_name": "Nguyễn Thu Hồng",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Tã quần Takato siêu mềm mại (M, 76 miếng)",
        "search_text": [
          "Tã quần Takato siêu mềm mại (M, 76 miếng)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/bim-ta-khuyen-mai/ta-quan-takato-sieu-mem-mai-m-76-mieng-72335.html\",\"title\":\"Tã quần Takato siêu mềm mại (M, 76 miếng)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-09-26T02:11:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250926",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "758ad138-632c-5bdd-9fa6-1bba82cc2dab",
        "link": "https://concung.com/bim-ta-khuyen-mai/ta-quan-takato-sieu-mem-mai-m-76-mieng-72335.html#414a61ff843bf409",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "2fc46a8e-4215-5bac-a5cb-4550a07d97d9",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "aa2186f949fdc85e",
        "identity_name": "Thanh Trà",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Tã quần Takato siêu mềm mại (M, 76 miếng)",
        "search_text": [
          "Tã quần Takato siêu mềm mại (M, 76 miếng)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/bim-ta-khuyen-mai/ta-quan-takato-sieu-mem-mai-m-76-mieng-72335.html\",\"title\":\"Tã quần Takato siêu mềm mại (M, 76 miếng)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-08-24T09:14:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250824",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "a491ecbd-b735-58db-bbbe-a734eb12e744",
        "link": "https://concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html#ec821bc3d2bdb8a5",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "972f7e2b-4bad-52fe-a946-7326f8a37a00",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "0c4e27b52c39066d",
        "identity_name": "Nguyễn Thị Kim Cúc",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
        "search_text": [
          "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html\",\"title\":\"Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-19T06:23:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250719",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "d553dd9f-ee4a-5b3a-9df2-96851d2ad863",
        "link": "https://concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html#e63dd6853ec3b9ca",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "972f7e2b-4bad-52fe-a946-7326f8a37a00",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "870107227f423d7e",
        "identity_name": "Lữ Minh Ngọc",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
        "search_text": [
          "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html\",\"title\":\"Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-17T05:17:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250617",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "bd4bd48f-72eb-5275-a194-558839fdea0c",
        "link": "https://concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html#c9d30ebceb4d4fe1",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "972f7e2b-4bad-52fe-a946-7326f8a37a00",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "9cf973825a7dac51",
        "identity_name": "Tuyết Minh",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
        "search_text": [
          "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html\",\"title\":\"Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-05T13:48:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250405",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "bcb15334-9606-5bee-b6eb-8dc83155053f",
        "link": "https://concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html#172bf70bf967a399",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "972f7e2b-4bad-52fe-a946-7326f8a37a00",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "78109b8d43e7df80",
        "identity_name": "Yến Nhi",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
        "search_text": [
          "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html\",\"title\":\"Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-03-18T02:25:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250318",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "5c6a1f19-f54f-5e16-8049-a5f28c3c2525",
        "link": "https://concung.com/bim-ta-khuyen-mai/ta-quan-takato-sieu-mem-mai-m-76-mieng-72335.html#5d6b769140d3b4f7",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "2fc46a8e-4215-5bac-a5cb-4550a07d97d9",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "d4d3d144a75d62a2",
        "identity_name": "Hồng đào",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Tã quần Takato siêu mềm mại (M, 76 miếng)",
        "search_text": [
          "Tã quần Takato siêu mềm mại (M, 76 miếng)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/bim-ta-khuyen-mai/ta-quan-takato-sieu-mem-mai-m-76-mieng-72335.html\",\"title\":\"Tã quần Takato siêu mềm mại (M, 76 miếng)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-08-20T09:42:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250820",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "158e3d50-d1c7-5d80-9f08-f028472ec300",
        "link": "https://concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html#dba45dd1575f90a4",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "972f7e2b-4bad-52fe-a946-7326f8a37a00",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "0e2d7c8ba53428ec",
        "identity_name": "Nguyễn Hương",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
        "search_text": [
          "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/dung-dich-ve-sinh-phu-nu/dung-dich-ve-sinh-phu-nu-lactacyd-fh-250ml-43041.html\",\"title\":\"Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-01-18T14:47:00.000Z",
        "updated_at": "2025-12-29T10:00:35.418Z",
        "shard": "20250118",
        "createdBy": "ConcungCrawlReviews"
      }
    ],
    "parent_posts": {
      "972f7e2b-4bad-52fe-a946-7326f8a37a00": {
        "title": "Dung Dịch Vệ Sinh Phụ Nữ Lactacyd FH 250ml (Giao mẫu ngẫu nhiên)",
        "created_date": "2025-09-04T14:47:21.000Z"
      },
      "181f1c54-548d-59f6-9757-7f3b553042c4": {
        "title": "Nón vành tròn bé gái 1-3Y Animo A2503_JK002",
        "created_date": "2025-09-04T00:55:20.000Z"
      },
      "7e97758a-5ae2-556d-b011-ea8df30ab0b2": {
        "title": "Set kẹp tóc 10 món Animo A2501_MN042",
        "created_date": "2025-09-04T10:34:12.000Z"
      },
      "37f95a08-55d0-5e5f-82ef-d37243cdab62": {
        "title": "Đầm bé gái Animo Easy TX0625032",
        "created_date": "2025-09-03T22:23:59.000Z"
      },
      "2fc46a8e-4215-5bac-a5cb-4550a07d97d9": {
        "title": "Tã quần Takato siêu mềm mại (M, 76 miếng)",
        "created_date": "2025-10-15T08:13:52.000Z"
      }
    }
  },
  {
    "mentions": [
      {
        "id": "88b96f93-dc9d-5901-af8e-a0ebdd10552f",
        "link": "https://concung.com/do-choi-em-be/do-choi-may-bat-bong-hinh-khung-long-co-nhac-den-js060506-c401-66207.html#f62381bae8afe86e",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "43a73792-ebac-5906-b261-f60fd2454f35",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "32121597bc26df00",
        "identity_name": "Thu Cúc",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Đồ chơi máy bắt bóng hình khủng long có nhạc đèn JS060506 C401",
        "search_text": [
          "Đồ chơi máy bắt bóng hình khủng long có nhạc đèn JS060506 C401",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/do-choi-em-be/do-choi-may-bat-bong-hinh-khung-long-co-nhac-den-js060506-c401-66207.html\",\"title\":\"Đồ chơi máy bắt bóng hình khủng long có nhạc đèn JS060506 C401\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-11T11:17:00.000Z",
        "updated_at": "2025-12-29T10:01:05.440Z",
        "shard": "20251211",
        "createdBy": "ConcungCrawlReviews"
      },
      {
        "id": "be7b793c-a140-5a37-ba74-7b96a8a5f0de",
        "link": "https://concung.com/do-choi-em-be/do-choi-may-bat-bong-hinh-khung-long-co-nhac-den-js060506-c401-66207.html#3cc0460d45cf438c",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "43a73792-ebac-5906-b261-f60fd2454f35",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "a51159040b6d2813",
        "identity_name": "Ba Mẹ",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Đồ chơi máy bắt bóng hình khủng long có nhạc đèn JS060506 C401",
        "search_text": [
          "Đồ chơi máy bắt bóng hình khủng long có nhạc đèn JS060506 C401",
          "5 sao -"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/do-choi-em-be/do-choi-may-bat-bong-hinh-khung-long-co-nhac-den-js060506-c401-66207.html\",\"title\":\"Đồ chơi máy bắt bóng hình khủng long có nhạc đèn JS060506 C401\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-17T15:30:00.000Z",
        "updated_at": "2025-12-29T10:01:05.440Z",
        "shard": "20250717",
        "createdBy": "ConcungCrawlReviews"
      }
    ],
    "parent_posts": {
      "43a73792-ebac-5906-b261-f60fd2454f35": {
        "title": "Đồ chơi máy bắt bóng hình khủng long có nhạc đèn JS060506 C401",
        "created_date": "2025-10-09T14:05:23.000Z"
      }
    }
  }
]

- crawl comments

// Query

q=*:* 
&fl=id,
    title,
    link,
    platform,
    id_source,
    id_social,
    status,
    state,
    count_failed,
    end_page,
    options,
    shard,
    last_have_data_date,
    next_time_crawl,
    id_channel,
    caption,
    published_date
&fq=platform:6
&fq=id_source:(
    adayroi.com
    alobuy.vn
    anycar.vn
    bachlongmobile.com
    banhangtructuyen.vn
    bibomart.com.vn
    cellphones.com.vn
    chon.vn
    concung.com
    deal.adayroi.com
    deca.vn
    didongthongminh.vn
    didongviet.vn
    dienmay.com
    dienmaycholon.vn
    dienmaythienhoa.vn
    digicity.vn
    dulichthienthai.vn
    giacmosuaviet.com.vn
    giahuymobile.vn
    giamua.com
    hasaki.vn
    hc.com.vn
    hcm.thegioithietbiso.vn
    hnammobile.com
    hoanghamobile.com
    kidsplaza.vn
    lixibox.com
    mainguyen.vn
    mediamart.vn
    nguyenkim.com
    nhatcuong.com
    pico.vn
    sendo.vn
    sieuthismartphone.vn
    techone.vn
    tiki.vn
    vienthonga.vn
    viettablet.com
    viettelstore.vn
    vinhphatmobile.com
    vuivui.com
)
&rows=1000
&sort=next_time_crawl asc, id asc
&cursorMark=AoJ19vaqtZsDPwVhYjMwMTU3Yi0wMzViLTUxNDAtOTA2Yy1mMTdlODg5ZmU4OGU=



node scripts/commentsV3/crawl_url_comments.js



[
  {
    "mentions": [
      {
        "id": "3dbcc38f-ee3c-53ef-8318-bcf789c2b178",
        "link": "https://concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html#3232beac9e84f4ae",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "4c6dc483-a5a0-5261-85f7-9806bdac22f7",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
        "search_text": [
          "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
          "Chào Ba Mẹ, Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml phù hợp cho bé sơ sinh. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html\",\"title\":\"Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-15T01:49:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20251215",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "3347940b-0a6c-5860-a92b-8723a4c5940c",
        "link": "https://concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html#2f6e20458c6182f7",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "4c6dc483-a5a0-5261-85f7-9806bdac22f7",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "7618f1a3da47627d",
        "identity_name": "Hoàng Thị Kim Hương",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
        "search_text": [
          "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
          "Dành cho trẻ sơ sinh được không ạ?"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html\",\"title\":\"Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-15T01:49:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20251215",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "b7f5d035-e70b-5ad1-97a5-5a2b8400eb89",
        "link": "https://concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html#fd1bdccbcf1b2ca7",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "4c6dc483-a5a0-5261-85f7-9806bdac22f7",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
        "search_text": [
          "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
          "Dạ chào Ba Mẹ, để kiểm tra thông tin sản phẩm và quà tặng hoặc đặt mua, Ba Mẹ vui lòng nhắn tin trực tiếp vào Fanpage Con Cưng hoặc liên hệ hotline 1800 6609 (miễn phí) phím 1 để được nhân viên giúp Ba Mẹ kiểm tra ạ.Con Cưng cảm ơn ạ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html\",\"title\":\"Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-08T08:22:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20251208",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "d547c9fb-b23e-5f29-a00f-d63e040ff268",
        "link": "https://concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html#bd263f2a6f7e0aae",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "4c6dc483-a5a0-5261-85f7-9806bdac22f7",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "0d2b7fba12c84df8",
        "identity_name": "Như Ý",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
        "search_text": [
          "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
          "Đường số 3, Bình Hưng Hoà B còn quà tặng không nhỉ, đợt rồi mình đi mua bảo có chương trình mà bảo hết quà tặng"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html\",\"title\":\"Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-08T08:22:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20251208",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "63661122-9ab8-595e-a6cb-00ef53072f4b",
        "link": "https://concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html#761d54e609f251a9",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "4c6dc483-a5a0-5261-85f7-9806bdac22f7",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
        "search_text": [
          "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
          "Chào Ba mẹ dạ sp Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml phù hợp cho bé sơ sinh ạ. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html\",\"title\":\"Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-11-10T10:16:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20251110",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "c698c512-9f5a-5d44-9013-a7cbab4d89d4",
        "link": "https://concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html#6f8d1b8073cca78e",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "4c6dc483-a5a0-5261-85f7-9806bdac22f7",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "a724639348e05abf",
        "identity_name": "Vân Anh",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
        "search_text": [
          "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
          "dùng cho trẻ sơ sinh được không ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html\",\"title\":\"Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-11-10T10:16:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20251110",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "c760eee9-947a-5704-b687-c72ed1ca5f42",
        "link": "https://concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html#404a10ab246845d5",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "4c6dc483-a5a0-5261-85f7-9806bdac22f7",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
        "search_text": [
          "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
          "Chào Ba mẹ dạ sản phẩm Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml phù hợp cho bé sơ sinh ạ. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html\",\"title\":\"Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-23T07:05:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20250623",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "660c8cd9-d1e6-5b01-adbe-8adbdfc0c1fd",
        "link": "https://concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html#70d021d528a0c3c1",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "4c6dc483-a5a0-5261-85f7-9806bdac22f7",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "df76f37833818986",
        "identity_name": "Linh Trang",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
        "search_text": [
          "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
          "Bé sơ sinh dùng được không ạ?"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html\",\"title\":\"Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-23T07:05:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20250623",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "95ee590c-d174-5e6b-a5c8-4d52d4f1a91b",
        "link": "https://concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html#23e5ddd1f5d83713",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "4c6dc483-a5a0-5261-85f7-9806bdac22f7",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
        "search_text": [
          "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
          "Chào Ba mẹ dạ CTKM  Tặng Kem dưỡng da cho bé tinh chất hoa cúc 50ml khi mua Sữa tắm gội trẻ em Cetaphil 400ml áp dụng đến 24/06 ạ. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html\",\"title\":\"Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-23T03:59:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20250623",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "a969af60-fb94-5159-831e-88afb5fe5452",
        "link": "https://concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html#84fec7931d301dd0",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "4c6dc483-a5a0-5261-85f7-9806bdac22f7",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "5d40f0404171eb33",
        "identity_name": "Lê Thi Lan",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
        "search_text": [
          "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
          "Áp dụng quà tặng kem dưỡng tới ngày mấy vậy ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/tam-goi-toan-than/sua-tam-goi-cho-tre-em-cetaphil-baby-gentle-400ml-52246.html\",\"title\":\"Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-23T03:59:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20250623",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "80d3f306-040b-591d-95e1-16685108fb91",
        "link": "https://concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html#2ebe423d476f8cee",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "f890372c-a2d6-5f06-a873-3abb1498c2f6",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "search_text": [
          "Sữa bầu Similac Mom 900g hương Vani",
          "Chào Ba mẹ, sản phẩm bên em đang có CTKM Tặng Bộ đệm nằm cho bé Similac khi mua 1 lon Similac Mom Hương Vani, 900g ạ. Con Cưng cảm ơn Ba mẹ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html\",\"title\":\"Sữa bầu Similac Mom 900g hương Vani\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-21T08:15:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20250721",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "a9b459a1-1ec2-5989-be29-b33a096720d7",
        "link": "https://concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html#b6f227a144e32cd3",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "f890372c-a2d6-5f06-a873-3abb1498c2f6",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "226acb8c3b96ce87",
        "identity_name": "Trần Thị Ngọc Hương",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "search_text": [
          "Sữa bầu Similac Mom 900g hương Vani",
          "Đang đươhc tặng bộ đệm cho bé đúng không ạ?"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html\",\"title\":\"Sữa bầu Similac Mom 900g hương Vani\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-21T08:15:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20250721",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "9fdce505-1d50-5a53-9185-71f4c008ade2",
        "link": "https://concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html#c458f000cacc1ecd",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "f890372c-a2d6-5f06-a873-3abb1498c2f6",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "search_text": [
          "Sữa bầu Similac Mom 900g hương Vani",
          "Chào Ba mẹ, để kiểm tra tồn kho sản phẩm và CTKM Ba mẹ vui lòng liên hệ hotline 18006609 nhấn phím 1 (miễn phí) hoặc nhắn tin qua fanpage Con Cưng để được hỗ trợ ạ. Con Cưng xin cảm ơn."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html\",\"title\":\"Sữa bầu Similac Mom 900g hương Vani\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-16T17:31:00.000Z",
        "updated_at": "2025-12-29T09:34:35.293Z",
        "shard": "20250716",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "86229ced-c16b-58e9-854c-e183699805ab",
        "link": "https://concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html#856d2bdd8834b4d2",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "f890372c-a2d6-5f06-a873-3abb1498c2f6",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "9171f42c37ac1d4f",
        "identity_name": "Hồ Thanh Tú",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "search_text": [
          "Sữa bầu Similac Mom 900g hương Vani",
          "CH khu vực phường Đông Hưng Thuận, TP.HCM còn CH nào còn quà tặng k ạ. Tks ad"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html\",\"title\":\"Sữa bầu Similac Mom 900g hương Vani\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-16T17:31:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250716",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "6966c4f2-df94-5a21-be10-69e1adb824af",
        "link": "https://concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html#0f1ac8409cce4256",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "f890372c-a2d6-5f06-a873-3abb1498c2f6",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "search_text": [
          "Sữa bầu Similac Mom 900g hương Vani",
          "Chào ba mẹ, để hỗ trợ kịp thời ba mẹ vui lòng nhắn tin tại Fanpage Con Cưng hoặc liên hệ số hotline 1800 6609 (miễn phí) - nhấn phím 1 ạ.Con Cưng xin cảm ơn."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html\",\"title\":\"Sữa bầu Similac Mom 900g hương Vani\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-20T14:55:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250620",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "51718046-2089-5a52-be6e-a4e6c3338c9d",
        "link": "https://concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html#af1be445e65750fb",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "f890372c-a2d6-5f06-a873-3abb1498c2f6",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "a51159040b6d2813",
        "identity_name": "Ba Mẹ",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "search_text": [
          "Sữa bầu Similac Mom 900g hương Vani",
          "similac mom mình pha thấy lợn cợn li ti là sao shop"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html\",\"title\":\"Sữa bầu Similac Mom 900g hương Vani\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-20T14:55:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250620",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "9d18debf-17e4-5b45-9310-e21791f1fc2b",
        "link": "https://concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html#90f51f687628f35f",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "f890372c-a2d6-5f06-a873-3abb1498c2f6",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "cf7834d0789eb73d",
        "identity_name": "Luong Bình Minh",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "search_text": [
          "Sữa bầu Similac Mom 900g hương Vani",
          "Sữa similac mom có chương trình khuyến mãi gì không ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html\",\"title\":\"Sữa bầu Similac Mom 900g hương Vani\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-14T07:03:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250614",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "08d5868c-b444-5731-aa5a-484a64b0117c",
        "link": "https://concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html#bdfa6040c026986b",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "f890372c-a2d6-5f06-a873-3abb1498c2f6",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "search_text": [
          "Sữa bầu Similac Mom 900g hương Vani",
          "Chào Ba Mẹ, Sữa bầu Similac Mom 900g hương Vani mẹ sau sinh dùng được ạ. Con Cưng xin cảm ơn."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html\",\"title\":\"Sữa bầu Similac Mom 900g hương Vani\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-05-23T09:52:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250523",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "52c61419-15e1-5e76-9102-11f4953138fc",
        "link": "https://concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html#68ec7ae078fb3009",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "f890372c-a2d6-5f06-a873-3abb1498c2f6",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8bb7d1ff6b547ca8",
        "identity_name": "Nguyễn Thế Mỹ",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "search_text": [
          "Sữa bầu Similac Mom 900g hương Vani",
          "sữa này có hỗ trợ cho mẹ bầu thiếu sữa hk ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html\",\"title\":\"Sữa bầu Similac Mom 900g hương Vani\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-05-23T09:52:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250523",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "5cb12955-a0b1-5449-a61e-80557a6211e0",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#ad5536bca362e029",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Chào Ba mẹ, mời Ba mẹ tham khảo thêm sản phẩm qua link ạ: https://concung.com/sua-bot/enfamil-aii-neuropro-2-follow-up-formula-6-12-thang-tuoi-800g-51723.html ạ. Con Cưng cảm ơn Ba mẹ ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-27T13:58:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20251227",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "c759dd95-a495-5de9-85db-a96eb680f42d",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#a2d238ec809e98f5",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "2d5b5c665c8e0d28",
        "identity_name": "Võ Thị Hương",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "có Enfagrow A2 số 2 ko ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-27T13:58:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20251227",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "27acdc59-0362-5dab-8554-01da0eb3cc12",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#3f8bde09a82e0501",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Chào Ba Mẹ. Dạ Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi) có hướng dẫn pha với mỗi muỗng gạt bột sữa với 50ml nước đun sôi để nguội còn khoảng 40 độ. Ba mẹ tham khảo chia pha theo nhu cầu dùng của bé nhé . Con Cưng cảm ơn Ba Mẹ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-25T08:43:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20251225",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "3f9d3c9e-78f4-59f9-a391-e6add0e0bbcc",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#8be32485cf1493bb",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "e55319214e6cdfee",
        "identity_name": "Bé Xíu",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Bé tui ún 120ml thì pha như nào ạ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-25T08:43:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20251225",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "ade9ee63-981c-51d9-9fe2-5efeb6b6e01f",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#f60dbe3d527d1036",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Chào Ba Mẹ, dạ Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi) có vị nhạt dễ uống ạ, tuy nhiên tùy thuộc vào cảm nhận của từng bé.Con Cưng xin cảm ơn."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-10-23T13:43:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20251023",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "c0912645-cb5e-5ce2-8c99-0b7fe733fc59",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#0fa57e42d22575fa",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "f9a82e70d68d7aaa",
        "identity_name": "Phương Tuyền",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Cho em hỏi vị sữa này như nào ạ?"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-10-23T13:43:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20251023",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "cfad2084-fde5-5fda-a532-f98242567bb2",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#ac401bf477b999b5",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Chào Ba Mẹ, dạ Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi) có vị nhạt dễ uống ạ. Con Cưng xin cảm ơn."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-22T02:21:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250722",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "2388d9f7-1098-55d6-a9b4-150a5dbb6709",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#f25e5babaf199149",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "f2a5628db9c434cf",
        "identity_name": "Kim Ngân Nguyễn Thị",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "sữa này vị như thế nào? bé uống có tăng cân nhiều không?"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-22T02:21:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250722",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "342f7c67-8faa-5f6e-97dd-b16130afec56",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#752f4fe04cac4dd1",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Con Cưng chào Ba Mẹ, Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi) sẽ có mức năng lượng cho 40g (200ml sữa theo như hướng dẫn của hãng) là 176 kcal ạ. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-02T11:36:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250702",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "5fd7faa6-e7d4-57f4-861a-61d10ca35e9f",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#5e4f46be1b3abb07",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "d4755ef0fce6fe68",
        "identity_name": "Phan Mỹ Huyền",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Cho em hỏi lon số 3 mức năng lượng trên 100ml là bao nhiêu vậy ạ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-02T11:36:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250702",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "52276408-61bd-5001-b9f7-830924cb7cb3",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#da527157fc186caf",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Dạ chào Ba Mẹ, để kiểm tra thông tin sản phẩm và quà tặng, khuyến mãi hoặc đặt mua, Ba Mẹ vui lòng nhắn tin trực tiếp vào Fanpage Con Cưng hoặc liên hệ hotline 1800 6609 (miễn phí) phím 1 để được nhân viên giúp Ba Mẹ kiểm tra ạ. Con Cưng cảm ơn ạ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-02T22:58:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20251202",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "078d2dac-8520-5be8-a2cb-0ab6f757c9be",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#cebc91a59f939aa2",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "3dd7d314ce4dfc6f",
        "identity_name": "Trần Thị Mỹ Linh",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Co khuyến mãi gi ko vậy su"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-12-02T22:58:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20251202",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "2da00d27-e8df-5de6-9523-723435cdd1ff",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#457a2e0cbd84c762",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Chào Ba Mẹ, Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml) sẽ có vị  nhạt thanh  mát dễ uống ạ. Con Cưng   xin cảm ơn."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-10-03T14:37:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20251003",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "ff63cb02-29b3-5725-981e-76ff853531ff",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#ddd022144243f78f",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "fe1c2c2954237fc8",
        "identity_name": "Anh Thư",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Nan này vị giống SCT không ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-10-03T14:37:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20251003",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "a978303f-1a18-5cf6-8fab-b93a8d3a40c5",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#4b70175a7da13be3",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Dạ chào Ba Mẹ,Dạ để hỗ trợ thông tin chi tiết Ba mẹ có thể liên hệ tổng đài 1800 6609 phím 1 (miễn phí) để được các bạn hỗ trợ Ba mẹ nhé. Cám ơn Ba mẹ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-09-30T07:33:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250930",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "2faad114-5117-5c9c-b9fb-b179b4e4eda2",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#0c34b3a8fd4bd59f",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "5de48b6eb33aa357",
        "identity_name": "An Lạc Cư Tuệ Mẫn",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Đặt hàng bao giờ có ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-09-30T07:33:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250930",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "62cf7154-43b9-542b-ba37-fe0be3a9c651",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#afb4d83a3d0b23b1",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Con Cưng chào Ba Mẹ, Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml) phù hợp cho bé từ 1 tuổi trở lên. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-08-31T00:11:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250831",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "eae57634-1054-5b79-ae87-10360d28cf05",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#61fd59997f08f17d",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "0acb1af0d4892f25",
        "identity_name": "Nguyễn Thị Phương Thuỷ",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Con nhà mình đang uống nan infinipro a2 có thể uống nan pha sẵn được không shop"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-08-31T00:11:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250831",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "375046c4-339b-561d-896f-d1c6cd620983",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#0f1ac8409cce4256",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Chào ba mẹ, để hỗ trợ kịp thời ba mẹ vui lòng nhắn tin tại Fanpage Con Cưng hoặc liên hệ số hotline 1800 6609 (miễn phí) - nhấn phím 1 ạ.Con Cưng xin cảm ơn."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-01T14:45:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250701",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "8ebab580-bc3b-5aa8-be8b-9a137da78627",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#09fa29070e305a27",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "566540f6a05f10b0",
        "identity_name": "Nguyễn Hằng Ny",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Bán sữa đắng ngét, chua lè"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-07-01T14:45:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250701",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "e9b8d15d-66fa-52b4-a018-43dabd52835f",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#41863a3144710a45",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Chào Ba Mẹ, dạ TNANGROW 9 , 1 thùng  nguyên  có 9 lốc . Còn NANGROW 6 thì 1 thùng nguyên sẽ  có 6 lốc ạ.  Con Cưng   xin cảm ơn."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-10T13:23:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250610",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "3f7f7b46-e1ac-58ca-980c-7c12d190b5ae",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#ac24dcdd5e8fa298",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "a646115a55d6b5a1",
        "identity_name": "Võ Thị Mỹ Phương",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Cho hỏi Nangrow 6 và 9 khác thành phần thế nào ạ, nhìn hình minh hoạ ko khác gì luôn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-10T13:23:00.000Z",
        "updated_at": "2025-12-29T09:34:35.294Z",
        "shard": "20250610",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "f83373e1-c039-5ba6-99f7-7770c4f5a7c3",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#b9de26c0822278ba",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Chào Ba Mẹ , Dạ Thực phẩm bổ sung Nestlé NANGROW 6, 9 và 4 chỉ khác nhau về quy cách đóng gói ạ, sản phẩm phù hợp cho bé từ 12 tháng tuổi trở lên . Con Cưng cảm ơn Ba Mẹ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-02T13:44:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250602",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "b286f6f4-6725-50c9-89ac-3cf707149f4f",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#23f493a8e77ba985",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "12f4c66b56933d92",
        "identity_name": "Trần Minh Tâm",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Nan grow 9 và nan grow 6 khác  nhau thế nào ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-06-02T13:44:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250602",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "666738f4-6dbc-59cd-bcd6-d0c90c8ac092",
        "link": "https://concung.com/an-dam-dinh-duong/knorr-hat-nem-tu-thit-400g-16-goi-57300.html#c14ebe30ccb0e760",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "d214eb08-26f4-5350-b955-1225c2275545",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "KNORR hạt nêm từ thịt 400g/16 gói",
        "search_text": [
          "KNORR hạt nêm từ thịt 400g/16 gói",
          "Chào ba mẹ, dạ sản phẩm có Hướng dẫn sử dụng - CANH: 3 muỗng nhỏ cho 1 lít nước.- KHO: 2 muỗng nhỏ cho 500g thịt/cá- XÀO: 1 muỗng nhỏ cho 500g rau/củ- ƯỚP: 1 muỗng nhỏ cho 500g thịt/cáCon cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/an-dam-dinh-duong/knorr-hat-nem-tu-thit-400g-16-goi-57300.html\",\"title\":\"KNORR hạt nêm từ thịt 400g/16 gói\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-09T14:06:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250409",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "590e60f7-16dc-557f-92f7-cfe1aebb1e4c",
        "link": "https://concung.com/an-dam-dinh-duong/knorr-hat-nem-tu-thit-400g-16-goi-57300.html#579daf7900d48069",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "d214eb08-26f4-5350-b955-1225c2275545",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "a51159040b6d2813",
        "identity_name": "Ba Mẹ",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "KNORR hạt nêm từ thịt 400g/16 gói",
        "search_text": [
          "KNORR hạt nêm từ thịt 400g/16 gói",
          "dùng để nêm cháo được không ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/an-dam-dinh-duong/knorr-hat-nem-tu-thit-400g-16-goi-57300.html\",\"title\":\"KNORR hạt nêm từ thịt 400g/16 gói\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-09T14:06:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250409",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "a4335e6a-8717-5da7-aaff-76f8a3398db8",
        "link": "https://concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html#9694cfe3749d5c59",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "f890372c-a2d6-5f06-a873-3abb1498c2f6",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "search_text": [
          "Sữa bầu Similac Mom 900g hương Vani",
          "Con Cưng chào Ba Mẹ, Sữa bột sau khi đã mở nắp nên sử dụng trong vòng 3 tuần. Sau khi pha phải dùng ngay hoặc có thể cho vào tủ lạnh sau khi đã đậy kín và phải dùng trong vòng 24 giờ ạ. Thông tin đến Ba Mẹ. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html\",\"title\":\"Sữa bầu Similac Mom 900g hương Vani\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-01-20T07:58:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250120",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "888084cc-8730-548c-8cf2-385d246d903f",
        "link": "https://concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html#88a861f771171b0c",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "f890372c-a2d6-5f06-a873-3abb1498c2f6",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "0dc0544810f819b6",
        "identity_name": "Ngoc Vy",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "search_text": [
          "Sữa bầu Similac Mom 900g hương Vani",
          "hộp này dùng được bao lâu"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot-sua-nuoc/similac-mom-huong-vani-900g-52459.html\",\"title\":\"Sữa bầu Similac Mom 900g hương Vani\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-01-20T07:58:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250120",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "a2fb4391-027a-559f-80bb-fcdaa63d94cd",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#5bbf9795a287d915",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Chào Ba Mẹ, dạ Ba mẹ vui lòng  gửi hình ảnh   và nhắn tin vào hộp thư chat để nhân viên bên em  kiểm tra cho  mình ạ. Cảm ơn Ba Mẹ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-14T04:50:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250414",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "e18f19ad-7d26-50ca-a9aa-c2403305061b",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#650c0a7f3e7ec9e8",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "186473cc3c830982",
        "identity_name": "Oanh",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "sữa nan pha sẵn sao có màu nâu ,còn sữa nan tự ta có màu trắng ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-14T04:50:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250414",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "a693f296-2318-5b88-b725-fa77401f320e",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#c458f000cacc1ecd",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Chào Ba mẹ, để kiểm tra tồn kho sản phẩm và CTKM Ba mẹ vui lòng liên hệ hotline 18006609 nhấn phím 1 (miễn phí) hoặc nhắn tin qua fanpage Con Cưng để được hỗ trợ ạ. Con Cưng xin cảm ơn."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-13T05:39:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250413",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "1e8d2412-c03f-5239-af7f-b180d4ca57d9",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#436d6f866d179e50",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "b92ede6388124d73",
        "identity_name": "Chị Hường",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "cửa hàng ở quảng trị có không ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-13T05:39:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250413",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "aa57d6ed-98fc-59fe-9bc2-b0472e94bc1a",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#33316b8c9cb1c752",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Dạ Con Cưng chào Ba Mẹ, sữa dùng cho bé từ 1 tuổi trở lên ạ. Thông tin đến Ba Mẹ. Con Cưng xin cảm ơn Ba Mẹ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-09T05:38:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250409",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "1a3ed1b5-5589-5011-9d51-895763988083",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#ca72a7d1b43bdd7f",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "9be60e0fef4f83e4",
        "identity_name": "Lương Ngọc Vũ Lien",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "dạ này bé bao nhiêu tuổi uống dc ah"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-09T05:38:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250409",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "90635225-85a7-56d7-907e-7ae9da8e7ad3",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#06d7da9ceaf4a218",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Dạ Con Cưng chào Ba Mẹ, sữa phù hợp cho trẻ từ 1 tuổi ạ. Thông tin đến Ba Mẹ. Con Cưng xin cảm ơn Ba Mẹ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-09T05:33:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250409",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "6de57848-3b58-5fda-bc04-232e94cda010",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#6b2c4974688a65ac",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "9be60e0fef4f83e4",
        "identity_name": "Lương Ngọc Vũ Lien",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "lốc sữa này dành cho bé mấy tuổi uống dc vậy ah"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-09T05:33:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250409",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "bb5f53f4-8d93-526b-b2d4-fa1503ced013",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#df88599c8456a851",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "0f9334a5926fabdd",
        "identity_name": "Lý Thị Bích Hạnh",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Nan đang có chương trình gì ko e"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-03-14T13:20:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250314",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "46737971-f3f2-5c60-b53d-bbd44655ad27",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#b0731cc28c975457",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Chào Ba mẹ dạ sản phẩm có vị ngọt thanh tuy nhiên cũng tùy vào cảm nhận cá nhân của các bé khác nhau nữa ạ. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-02-07T13:49:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250207",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "0f8527c5-8717-5171-9933-cea56f3c10d7",
        "link": "https://concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html#67298b5cf9c77a1b",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "e2458ce547e864ef",
        "identity_name": "Thiên Ngân",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
        "search_text": [
          "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)",
          "Cho em hỏi là vị của sữa này nhạt thanh hay ngậy béo ạ?"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-tuoi-cac-loai/thuc-pham-bo-sung-nestle-nangrow-9-4x110ml-63702.html\",\"title\":\"Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-02-07T13:49:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250207",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "532d13b7-d063-59bc-bf74-a73aa8b3793d",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#0c6d218d726add11",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Con Cưng chào Ba Mẹ, Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi) có công thức phù hợp cho trẻ nhỏ. Ba Mẹ yên tâm ạ. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-05-26T23:32:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250526",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "64017baa-b495-596c-86ec-a48f290e6381",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#adcf3c8f563370f8",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "1cc02a576622025e",
        "identity_name": "Na Na Nguyễn",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Sữa có chứa đạm đậu nành vậy bé trai uống có sao k ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-05-26T23:32:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250526",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "c1b89c3c-f388-5f3c-b2f5-53b60c4ca083",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#55a1ca131665f39e",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Chào Ba mẹ nhìn chung cả 2 dòng đều giúp bé phát triển toàn diện về cân nặng chiều cao và trí tuệ , tuy nhiên cũng tùy cơ địa của mỗi bé sẽ có khả năng hấp thu khác nhau ạ. Ba mẹ có thể tham khảo cho bé dùng và theo dõi thích ứng của bé ạ. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-05-10T15:09:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250510",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "59f0b74f-b0dc-5ef5-bf98-a258bf404d94",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#faa0a6979509416d",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "bc291ee10c635771",
        "identity_name": "C Ngân",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Giữa nan và Enfamil cái nào tốt cho hệ tiêu hóa hơn ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-05-10T15:09:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250510",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "ff4023ea-c0bb-5095-8e92-143cfec9e90c",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#ec6e9b8e630c053e",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Con Cưng chào Ba Mẹ, Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi) Con Cưng nhập khẩu nguyên hộp ạ. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-05-03T15:06:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250503",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "fa25e37e-745c-50c2-9309-12e460a05f7f",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#4fcf284b7d27b257",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "9dcceba89e41b997",
        "identity_name": "Tạo",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Cho e hỏi sữa này nhập khẩu nguyên hộp hay sao ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-05-03T15:06:00.000Z",
        "updated_at": "2025-12-29T09:34:35.295Z",
        "shard": "20250503",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "6c7b71bd-c752-575f-a3a3-1a6a45398271",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#54b8818d93e0610c",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Chào Chị, sản phẩm Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi) hỗ trợ bé phát triển toàn diện, tuy nhiên tăng cân sẽ còn tùy cơ địa mỗi bé ạ. Cảm ơn Chị"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-17T19:08:00.000Z",
        "updated_at": "2025-12-29T09:34:35.296Z",
        "shard": "20250417",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "ee80175a-9078-552a-8714-fab952ed7685",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#4163bdfc74d87401",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "a51159040b6d2813",
        "identity_name": "Ba Mẹ",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "cho e hỏi sữa này tiêu hoá tốt không ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-17T19:08:00.000Z",
        "updated_at": "2025-12-29T09:34:35.296Z",
        "shard": "20250417",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "48c58137-3b66-5b47-bf48-9b64437415cc",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#82cd9e3d22a87af1",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Chào Ba mẹ dạ rất tiếc sản phẩm Sữa Enfagrow A2 bên em không có loại pha sẵn ạ. Con Cưng xin cảm ơn"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-16T05:23:00.000Z",
        "updated_at": "2025-12-29T09:34:35.296Z",
        "shard": "20250416",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "2de69543-e428-5394-8422-3b69d41bf12d",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#f86cbe3685ad3115",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "a51159040b6d2813",
        "identity_name": "Ba Mẹ",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Loại này có sữa hộp k ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-16T05:23:00.000Z",
        "updated_at": "2025-12-29T09:34:35.296Z",
        "shard": "20250416",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "cf48644d-f52a-5f02-896b-89bd335cbf1b",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#91ccac28be7b1340",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Chào Ba mẹ, sản phẩm Sữa Enfagrow A2 NeuroPro số 3 chưa có lon nhỏ ạ. Con Cưng cảm ơn Ba mẹ."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-07T08:52:00.000Z",
        "updated_at": "2025-12-29T09:34:35.296Z",
        "shard": "20250407",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "f41f4d51-0fd3-5fe7-ba9b-773b0ffe52e1",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#8d4771f6055282e7",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "4aa6eac8410e22bd",
        "identity_name": "Lê Văn Trường",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Loại này có lon nhỏ ko ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-07T08:52:00.000Z",
        "updated_at": "2025-12-29T09:34:35.296Z",
        "shard": "20250407",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "d315ac17-2933-5357-96c7-9fc4701b5468",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#0f1ac8409cce4256",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "8eb4aca823a886a9",
        "identity_name": "Concung",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "Chào ba mẹ, để hỗ trợ kịp thời ba mẹ vui lòng nhắn tin tại Fanpage Con Cưng hoặc liên hệ số hotline 1800 6609 (miễn phí) - nhấn phím 1 ạ.Con Cưng xin cảm ơn."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-07T02:57:00.000Z",
        "updated_at": "2025-12-29T09:34:35.296Z",
        "shard": "20250407",
        "createdBy": "ConcungCrawlUrlComments"
      },
      {
        "id": "ee5d89e3-15a8-5324-93aa-18b3fabb51d0",
        "link": "https://concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html#13a9786fc70c536a",
        "domain": "concung.com",
        "id_source": "concung.com",
        "id_reference": "014a57e6-0e6f-5b70-a114-7304d5d98562",
        "id_parent_comment": null,
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "d5ae408782645401",
        "identity_name": "ĐÀO THỊ XUÂN",
        "platform": 6,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "search_text": [
          "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
          "8554321 kiểm tra giúp mẹ đơn hàng này có giao hàng ko ạ. Mẹ đặt giao nganh 1-2h mà từ tối qua giờ ko thấy giao ạ"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"concung.com/sua-bot/enfagrow-aii-neuropro-3-1-6-tuoi-800g-59019.html\",\"title\":\"Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2025-04-07T02:57:00.000Z",
        "updated_at": "2025-12-29T09:34:35.296Z",
        "shard": "20250407",
        "createdBy": "ConcungCrawlUrlComments"
      }
    ],
    "parent_posts": {
      "4c6dc483-a5a0-5261-85f7-9806bdac22f7": {
        "title": "Sữa tắm gội cho trẻ em Cetaphil baby gentle 400ml",
        "created_date": "2025-08-14T11:23:25.000Z"
      },
      "f890372c-a2d6-5f06-a873-3abb1498c2f6": {
        "title": "Sữa bầu Similac Mom 900g hương Vani",
        "created_date": "2025-08-14T14:58:43.000Z"
      },
      "014a57e6-0e6f-5b70-a114-7304d5d98562": {
        "title": "Sữa Enfagrow A2 NeuroPro số 3 800g (1 - 6 tuổi)",
        "created_date": "2025-08-14T15:12:46.000Z"
      },
      "b7b94bb6-62f4-570c-8fb7-f4f7e68f9047": {
        "title": "Thực phẩm bổ sung Nestlé NANGROW 9 (4x110ml)"
      },
      "d214eb08-26f4-5350-b955-1225c2275545": {
        "title": "KNORR hạt nêm từ thịt 400g/16 gói",
        "created_date": "2025-08-14T11:19:58.000Z"
      }
    }
  }
]



## Những luồng cần chạy lại ở testing

// Câu query ở các queue 
tt_post|tt_com|fb_post|tr.post|posts.comments.queuecualamt|fb_comments|tr.source|cl.tr.source_replies|review|thread
cl.fb.page_posts|cl.fb.page_web_comments|mentions_LamTT|cl.tr.posts_comment_|cl.tr.posts_sub_comment_|cl.tr.reply_posts|tr_replies|youtube

1. Threads

- Luồng comment -> DONE
ynm-cl-tr-comment-service-testing 
- Luồng reply -> DONE
ynm-cl-tr-reply-service-testing
- Luồng reply crawl post -> DONE
ynm-cl-tr-reply-post-service-testing
- Luồng source reply -> DONE
ynm-cl-tr-source-reply-no-cookie-service-testing

2. Youtube

- Get lastest comment reply -> Chỗ này có thêm load post_created_date lên

//Load Souce
node scripts/youtubeV3/monitoring_priority_video.js

crawler-testing-youtube-api-monitoring-priority-video
 
//Crawl Comment -> Hiện tại đã đúng với yêu cầu
node scripts/youtubeV3/get_latest_priority_videos_comments_by_api.js -> DONE

crawler-testing-youtube-api-get-latest-priority-videos-comments-by-api


//Crawl Replies -> Hiện tại đã chạy đúng yêu cầu -> DONE
node scripts/youtubeV2/get_latest_priority_comments_replies.js

crawler-testing-youtube-api-get-latest-priority-comments-replies -> DONE

3. Facebook

- Facebook comment
- Facebook page web comment -> DONE

ynm-cl-fb-page-web-cmt-service-testing

4. News (Không cần check)

- Parse detail (Luồng này thì không có reply)

5. Tiktok

- Tiktok commnet

tiktok-get-latest-post-comments

crawler-testing-tiktok-get-latest-post-comments

node scripts/tiktok/get_latest_post_comments.js

6. Instagram 

- instagram-get-latest-post-comments -> DONE

crawler-testing-instagram-get-latest-post-comments

node scripts/instagram/get_latest_post_comments.js


IG_API_ENDPOINT=http://graph-instagram-api-testing.ynm.local/ node scripts/instagram/get_latest_post_comments.js

7. Forum

- get-posts
crawler-testing-forums-get-posts -> Chỗ này lên Staging chạy lại

crawler-testing-forums-get-posts-prev -> Chỗ này lên Staging chạy lại

- get-posts-pre

8. Reviews


- news-crawl-reviews -> DONE
export SOLR_MASTER_HOST=http://solrmaster-testing.ynm.local 
node scripts/commentsV3/crawl_reviews.js -f ECOM

crawler-testing-news-crawl-reviews

- url-comment -> Chỗ này lên Staging chạy lại
node scripts/commentsV3/crawl_url_comments.js
crawler-testing-news-crawl-url-comments


// Câu regex RabbitMQ mới nhất

cl.tr.posts_comment|cl.tr.posts_sub_comment|cl.tr.source_replies|reply_post|l.fb.page_web_comments|.posts.*comment_crawl|youtube.post|LamTT|tr_replies|tr_posts|yt_comment|comment_priority_