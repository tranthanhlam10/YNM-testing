# Task topic type

 facebook_posts, youtube_posts, youtube_comments, tiktok_post, threads_posts, threads_replies, instagram_posts 

 schema của từng collection trong solr


## Vision
 Để giảm request vào topic collections, thêm trường thông tin ở facebook post, tiktok post, ... phục vụ cho việc xác định luồng, phân phối crawling comments và thay đổi query để loading crawl 



- Ý nghĩa của các topic_types 
Internal	1
Client	3
Demo	4
SocialTrend	5

## Scope 
- Thêm field topic_types trong schema cho facebook_posts, youtube_posts, youtube_comments, tiktok_post, threads_posts, threads_replies, instagram_posts trong Solr

- Chỉnh lại điều kiện query để load data của các luồng comment



## Những thay đổi trong task

- Thay đổi query loader của các luồng của source mới và cũ
- Khi load post/comment để crawl comment/reply, lấy thêm thông tin topic_types của post/comment.
- Chỉnh lại điều kiện query để load data của các luồng comment
- Sau khi crawl post và insert comment, mỗi comment/reply được lưu kèm topic_types của post tại thời điểm crawl. (chỉ apply cho platform: Youtube và Threads)
Nếu lúc crawl post có topic_types = [ 1 ] → comment được insert sẽ có topic_types = [ 1 ].
Nếu sau này post được cập nhật thêm topic_types = [ 3 ] → comment đã insert trước đó không update, vẫn giữ = [ 3 ]. Chỉ những comment được insert lần đầu tiên mới có giá trị topic_types = [ 1,3 ] (hoặc giá trị mới).

## Testing planning

Những thay đổi câu query thì không cần test
Điểm thay đổi ở 2 Platform youtube và threads:
Thay đổi fomart load lên: Chỉ thêm field topic_type (topics type ở collection platform_post)
Thay đổi cập nhật thêm field topic_type vào collection youtube_comment/threads replies

Ví dụ:
Post nào thuộc topic_type nào thì khi lưu về collection comment thì lưu topic_type như vậy  

Load: Topic_type: 4 -> lưu comment: 4 

Lưu ý:  Chổ cập nhât lại topic_type ở collection comment

Hiện solr đang dùng  set để update lại value trên solr , đối với topic_type có nhiều giá trị thì phải dùng ad-distinct để lưu giá trị vào field 

Luồng crawl không thay đổi, Flow không thay đổi

Pick 1 2 luồng ra để đi kiểm tra loader thử

## Schema mới của các collection

 1. facebook_posts

id
id_social
title
id_source
comment_updated_at
priority
source_type
source_category
crawled_date
created_date
comment_last_date
post_share_crawled_date
post_share_last_date
cursor
last_status
closed_group
is_auto_engagement
error_message
last_crawled_total_comments
next_crawl_time
total_comments
last_crawled_total_post_shares
total_post_shares
likes
comments
shares
has_new_post_shared
has_new_comment
total_new_post_shared
total_new_comment
last_crawled_engagement
attachment_url
crawled_by
is_kol
is_admin_creator
is_fixed
is_sl_post
_version_
post_type
caption
shared_content
topic_types


2. youtube_posts

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

3. youtube_comments


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

4. tiktok_posts

id
link
id_social
title
caption
effect
sound
id_source
comment_updated_at
priority
source_type
crawled_date
created_date
comment_last_date
is_kol
likes
comments
shares
views
cursor
last_status
engagement_updated_at
caption_updated_at
is_auto_engagement
next_crawl_time
error_message
_version_
post_type
crawled_by
topic_types


5. threads_posts

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


6. threads_replies

id
link
id_social
title
id_source
comment_updated_at
priority
level
crawled_date
created_date
comment_last_date
is_kol
last_status
next_crawl_time
post_created_date
error_message
caption
shared_content
topic_types


7. instagram_posts

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
is_kol
likes
comments
shares
views
engagement_updated_at
next_crawl_time
last_status
error_message
_version_
caption
topic_types



## Câu lệnh chạy để test

Deployment:
kubectl config use-context lamtt-k8s-local

Search deployment:
ynmpdp-5679


- Luồng cũ: 


ynmpdp-5679-old-testing-crawler-empty-container
kubectl get pods -n crawler-testing | grep ynmpdp-5679-old-testing-crawler-empty-container
kubectl exec -it ynmpdp-5679-old-testing-crawler-empty-container-d66dcfd6f-c6n9h -n crawler-testing -- sh

- Luồng mới:
ynmpdp-5679-topic-types-new-testing-ynm-crawler-empty
kubectl get pods -n crawler-testing | grep ynmpdp-5679-topic-types-new-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5679-topic-types-new-testing-ynm-crawler-empty-6b85x8b7n -n crawler-testing -- sh


- Câu regex RabbitMQ
comment_priority_|posts.*comment_crawl|youtube.post

.posts.*comment_crawl|youtube.post|LamTT|tr_replies|tr_posts|yt_comment|comment_priority_



+ Những queue của luồng Threads

- Crisis
cl.tr.posts_sub_comment_priority_crawling_sources
cl.tr.posts_sub_comment_priority_crawling_requests
cl.tr.posts_sub_comment_priority_crawled_sources

- Normal
cl.tr.posts_sub_comment_crawling_sources
cl.tr.posts_sub_comment_crawling_requests
cl.tr.posts_sub_comment_crawled_sources

- Priority
cl.tr.posts_sub_comment_priority_crawling_sources
cl.tr.posts_sub_comment_priority_crawling_requests
cl.tr.posts_sub_comment_priority_crawled_sources


- Normal
cl.tr.posts_comment_crawling_sources
cl.tr.posts_comment_crawling_requests
cl.tr.posts_comment_crawled_sources

- Crisis
cl.tr.posts_comment_priority_crawling_sources
cl.tr.posts_comment_priority_crawling_requests
cl.tr.posts_comment_priority_crawled_sources

- Priority
cl.tr.posts_comment_priority_crawling_sources
cl.tr.posts_comment_priority_crawling_requests
cl.tr.posts_comment_priority_crawled_sources


1. Youtube


//Load Souce
node scripts/youtubeV3/monitoring_priority_video.js
 
//Crawl Comment
node scripts/youtubeV3/get_latest_priority_videos_comments_by_api.js
 
 
//Crawl Replies
node scripts/youtubeV2/get_latest_priority_comments_replies.js


2. Threads


//Threads Comment

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
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.posts_comment_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.posts_comment_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.comments.next_page

export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_REPLY_CRAWLER
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
export CRAWLER_CONCURRENCY=1

export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1

yarn testing:tr-reply-crawler



//Threads Sub comment



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
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.sub_comments.next_page
 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_REPLY_CRAWLER
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






// Loader

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
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_ENABLE=false

export PRIORITY_POST_COMMENT_CRAWLING_LOADER_ENABLE=false
export CRISIS_POST_COMMENT_CRAWLING_LOADER_ENABLE=false
export COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=true
export PRIORITY_COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=false
export CRISIS_COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=false
export POST_COMMENT_CRAWLING_LOADER_ENABLE=true

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
export MONGO_SOCIAL_HEAT_HOST=192.168.1.108
export MONGO_SOCIAL_HEAT_AUTH_SOURCE=socialheat_testing
export MONGO_SOCIAL_HEAT_PORT=27017

export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null

yarn testing:tr-loader




## Những deployment liên quan đến các luồng comment của Threads


// Sub comment
ynm-cl-tr-reply-crisis-service-testing
ynm-cl-tr-reply-priority-service-testing
ynm-cl-tr-reply-service-testing



// Comment
ynm-cl-tr-comment-crisis-service-testing
ynm-cl-tr-comment-priority-service-testing
ynm-cl-tr-comment-service-testing


// Câu query luồng ThreadsPriorityCommentSubCommentCrawlingLoader -> Fail (Fl không có topic_type)
{
  "q": "*:*",
  "fl": "id, id_social, id_source, title, post_created_date, comment_last_date, comment_updated_at, priority, link, is_kol, level, created_date, caption, shared_content",
  "fq": [
    "next_crawl_time:[* TO 2025-12-04T03:45:00.000Z]",
    "-last_status:(4 5)",
    "post_created_date:[NOW-30DAYS TO *]",
    "topic_types:(3 4)"
  ],
  "start": 0,
  "rows": 1000,
  "cursorMark": "*",
  "sort": "next_crawl_time asc, id asc"
}



// Câu query luồng ThreadsPriorityPostCommentCrawlingLoader -> Hiện tại đã đúng với yêu cầu
{
  "q": "*:*",
  "fl": "id, id_social, id_source, title, comment_last_date, comment_updated_at, priority, link, is_kol, created_date, caption, shared_content, topic_types",
  "fq": [
    "next_crawl_time:[* TO 2025-12-04T03:45:00.000Z]",
    "-last_status:(4 5)",
    "created_date:[NOW-30DAYS TO *]",
    "topic_types:(3 4)"
  ],
  "start": 0,
  "rows": 1000,
  "cursorMark": "AoJ11r3E8ZoDPwVlZWZmNzZhYy1iZDk0LTU0ZDUtODZmZS03ODljNzM5ODYzYzA=",
  "sort": "next_crawl_time asc,id asc"
}

// Câu query luồng ThreadsCrisisCommentSubCommentCrawlingLoader -> Fail (Fl không có topic_type)

{
  "q": "*:*",
  "fl": "id, id_social, id_source, title, post_created_date, comment_last_date, comment_updated_at, priority, link, is_kol, level, created_date, caption, shared_content",
  "fq": [
    "-last_status:(4 5)",
    "post_created_date:[NOW-30DAYS TO *]",
    "priority:99"
  ],
  "start": 0,
  "rows": 1000,
  "cursorMark": "*",
  "sort": "id asc"
}

// Câu query luồng ThreadsCrisisPostCommentCrawlingLoader -> DONE

{
  "q": "*:*",
  "fl": "id, id_social, id_source, title, comment_last_date, comment_updated_at, priority, link, is_kol, created_date, caption, shared_content, topic_types",
  "fq": [
    "next_crawl_time:[* TO 2025-12-04T03:45:00.000Z]",
    "-last_status:(4 5)",
    "created_date:[NOW-30DAYS TO *]",
    "priority:99"
  ],
  "start": 0,
  "rows": 1000,
  "cursorMark": "*",
  "sort": "next_crawl_time asc, id asc"
}

// Câu query luồng ThreadsCommentSubCommentCrawlingLoader -> Fail (Fl không có topic_type)

{
  "q": "*:*",
  "fl": "id, id_social, id_source, title, post_created_date, comment_last_date, comment_updated_at, priority, link, is_kol, level, created_date, caption, shared_content",
  "fq": [
    "next_crawl_time:[* TO 2025-12-04T03:45:00.000Z]",
    "level:[1 TO 2]",
    "-last_status:(4 5)",
    "post_created_date:[NOW-30DAYS TO NOW]"
  ],
  "start": 0,
  "rows": 500,
  "cursorMark": "AoJx3u6l75oDPwUzZmRlZjQwYi0wMjQxLTUyYzUtOWM4MS0yNWY3Mzk5OWM0Mjc=",
  "sort": "next_crawl_time asc, id asc"
}


## Message đem đi crawl 


{
  "id": "072fc62c-93e7-58ed-afec-0cd3841578fd",
  "id_source": "tr_66377214627",
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-12-02T02:08:02Z",
  "from_date": "1764641282",
  "to_date": "1764823501",
  "platform": 10,
  "createdBy": "ThreadsPostCommentCrawlingLoader",
  "link": "threads.net/t/DRvmYDaD5UA",
  "id_social": "3778407391080453376",
  "title": "Bao năm mọt phim t",
  "level": 0,
  "post_created_date": "2025-12-02T02:08:02Z",
  "has_next_page": true,
  "caption": "Bao năm mọt phim t luôn bỏ qua bts, vì nó phá nát hình tượng nhân vật t thích. Dv giỏi thì đạo diễn hô cut 1 cái là sắc mặt biến đổi liền. Dv còn non thì phải chỉ đạo từng tí 1. Đến NA thì chem giữa ND còn đỉnh hơn SU nữa 🫠\nNếu tách riêng 2 đứa thì t sẽ k đu, vì t gặp nhiều ng tài năng giỏi giang nỗ lực k kém\nNhg sự dũng cảm của 2 đứa khi chọn cả ty và sự nghiệp, còn dám thể hiện ty đó cho mọi ng thấy, trong bối cảnh bị cấm ở TQ, khiến t thấy k thành 🌽 là có lỗi với 2 đứa lắm\nNhà 🌽 cũng rất vui ❤ ️",
  "topic_types": [
    1,3,5
  ]
}




{
  "id": "a1c02cbb-678c-5681-a2af-e5f00b20ded3",
  "id_source": "tr_63085438826",
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-11-30T17:42:04Z",
  "from_date": "1764524524",
  "to_date": "1764823501",
  "platform": 10,
  "createdBy": "ThreadsPostCommentCrawlingLoader",
  "link": "threads.net/t/DRsHrLDjoPw",
  "id_social": "3777427940590912496",
  "title": "“Every breath you",
  "level": 0,
  "post_created_date": "2025-11-30T17:42:04Z",
  "has_next_page": true,
  "caption": "“Every breath you take, every move you make”\nThe Police on Top of the Pops in 1983 performing the always iconic Every Breath You Take. 🎵",
  "topic_types": [
    1
  ]
}



{
  "id": "d939d0d5-c714-5bda-8ee3-cd01710ec5ee",
  "id_source": "tr_76970480429",
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-11-10T08:30:53Z",
  "from_date": "1762763453",
  "to_date": "1764823500",
  "platform": 10,
  "createdBy": "ThreadsCommentSubCommentCrawlingLoader",
  "link": "threads.net/t/DQ3H5Avk4Ic",
  "id_social": "3762655017577968831",
  "title": "Mấy hôm nay lướt đâu",
  "level": 1,
  "post_created_date": "2025-11-10T08:30:53Z",
  "caption": "Mấy hôm nay lướt đâu cũng thấy mấy celeb dùng M.Asam Magic Finish hết 😳\nTừ chị Việt Hoa, Huỳnh Đăng Thông đến MC Thanh Thanh Huyền đều khen ‘một bước là đủ’\nThấy mấy bạn trong group cũng khoe được brand gửi quà test thật rồi luôn 💌\nForm Freecast vẫn đang mở đó nha – ai chưa apply thì nhanh tay kẻo lỡ trend này á 😍\n👉 Link đăng ký https://docs.google.com/forms/d/1575ItKNRCeVErk2tS9sETVFglyIgXMjve-jZa4ADhwE/edit",
  "topic_types": [
    4,
    5
  ]
}




{
  "id": "57b511cc-5c1a-5b51-90f9-c57a02c82b22",
  "id_source": "tr_63064799915",
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-11-10T08:02:46Z",
  "from_date": "1762761766",
  "to_date": "1764823500",
  "platform": 10,
  "createdBy": "ThreadsCommentSubCommentCrawlingLoader",
  "link": "threads.net/t/DQ29usUkuN5",
  "id_social": "3762640870273801055",
  "title": "Xây kênh tiktok cho",
  "level": 1,
  "post_created_date": "2025-11-10T08:02:46Z",
  "caption": "Xây kênh tiktok cho brand về Spa ở tỉnh lẻ, chi phí bao nhiu 1 tháng thì oke mấy bà nhỉ? Tất cả từ kịch bản, quay, edit, ... ạ",
  "topic_types": [
    4,
    5
  ]
}


<delete>
<query>
id: (869c78fe-6b02-5109-9f4d-155a8d82c46e f569d593-f9dd-5a9b-8724-169baced014b 3e200c1b-e629-53bb-9e70-a18978d64b0f c6fb5e32-4b22-5f26-937e-17ba142d6c61 76a2b1d7-21bc-582b-a90a-1a67025178d5 e790fd0a-f135-579c-9bfd-27462833f8a9 e0d24a1e-0e60-5bbb-bbe9-ad1caff1bed5 b0ae4012-5044-5304-98a9-305a409ba1ec 2c96f456-8669-5a27-a309-f069d52e4cd2 f2e8b094-dc18-502d-9785-452669757bcb 0a129b10-b9d6-5bf9-baaa-203ddc215597 2a8a61dd-27a6-5a51-9a1a-3d34a62cfef7 c4f2081d-2849-5c44-bd2f-1411386aecbc a1ce0c66-998d-5237-9f84-2bb1fce7f33f bc60c657-7c74-5464-b6ea-87264dce88a6 e490e657-00d6-5872-b030-db3054603b93 b6e7295c-1b1f-573f-80c6-a4808bea442e 58266874-7c5b-515c-919b-dd094364f521 ced6a17c-eddd-5b97-bef0-01dc95f2b56c 979b3e2e-14ae-5c78-b4be-310b98618807 737cef6a-06bc-5ea0-9be0-1042f1574f52 4a610c30-fe5c-5748-b746-6d039ec94d73 727c4124-8571-56b5-b788-c72226e39b8d aca80993-7097-59e1-8162-8fd1fdb43879)
</query>
</delete>







## Những cases cần phải check lại ở testing

.posts.*comment_crawl|youtube.post|LamTT|tr_replies|tr_posts|yt_comment|comment_priority_|post_finished|yt_repl


1. Youtube -> Hiện tại đã có đẩy đủ ở topic_type ở các luồng comt

youtube-api-monitoring-priority-video	-> Hiện tại đã load thành công ở testing -> DONE
youtube-api-get-latest-priority-videos-comments-by-api -> Hiện tại đã chạy thành công ở testing -> DONE

-> Queue nay moi la queue day vao youtube comment: testing.cl.posts_2_solr_yt_comments

youtube-api-get-latest-priority-comments-replies -> DONE
(Note: Luông này chỉ crawl reply mention của youtube_comment -> không lưu vào youtube comment ở solr )


2. Threads

Những luồng cần phải check

1. Comment
ynm-cl-tr-comment-crisis-service-testing
ynm-cl-tr-comment-priority-service-testing
ynm-cl-tr-comment-service-testing

2. Sub comment

ynm-cl-tr-reply-service-testing
ynm-cl-tr-reply-priority-service-testing
ynm-cl-tr-reply-crisis-service-testing


## Những cases cần phải check lại ở  staging




1. Youtube -> Hiện tại đã có đẩy đủ ở topic_type ở các luồng comt

youtube-api-monitoring-priority-video -> Hiện tại đã load đúng yêu cầu
youtube-api-get-latest-priority-videos-comments-by-api -> Hiện tại đã crawl đúng yêu cầu

-> Queue nay moi la queue day vao youtube comment: testing.cl.posts_2_solr_yt_comments

youtube-api-get-latest-priority-comments-replies 
(Note: Luông này chỉ crawl reply mention của youtube_comment 


2. Threads

Những luồng cần phải check

tr-loader
ynm-cl-tr-crawling-loader-service-staging -> Hiện tại đã load đúng yêu cầu 



// Hiện tại các luồng crawl comment và sub comment đã đúng yêu cầu
1. Comment
ynm-cl-tr-comment-crisis-service-staging -> Chỉ cần chạy 1 luồng trên này là được
ynm-cl-tr-comment-priority-service-staging -> Chỉ cần chạy 1 luồng trên này là được
ynm-cl-tr-comment-service-staging -> Chỉ cần chạy 1 luồng trên này là được

2. Sub comment

ynm-cl-tr-reply-service-staging -> Chỉ cần chạy 1 luồng trên này là được
ynm-cl-tr-reply-priority-service-staging -> Chỉ cần chạy 1 luồng trên này là được
ynm-cl-tr-reply-crisis-service-staging -> Chỉ cần chạy 1 luồng trên này là được



## Note
Cách chạy của Threads Comment và Threads Sub Comment:

+ Hiện tại đang có 3 luồng Normal, Crisis, Priority (Có 3 loaders khác nhau)

+ Nhưng khi load lên thì created_by vẫn là của Normal (ThreadsCommentSubCommentCrawlingLoader và ThreadsPostCommentCrawlingLoader)

+ Dù cho điều kiện load có khác nhau

Từ trước đến giờ luồng vẫn chạy như vậy, và đã chạy được hơn 7 tháng theo hotfix của anh Tân