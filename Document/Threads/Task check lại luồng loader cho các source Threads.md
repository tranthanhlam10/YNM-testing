# Task check lại luồng loader cho các source Threads của Huy



## Vấn đề: Trong hệ thống đang có 1 số identity có filed id và id_social không trùng khớp với nhau + luồng crawling loader đang sử dụng id_social làm id cho quá trình crawl. Dẫn tới tình trạng source updater báo lỗi "missing required field: domain".

## Hướng xử lý: Điều chỉnh luồng crawling loader sử dụng field id để làm id cho quá trình crawl (Không sử dụng field id social nữa)

Code commit:
+ https://git.younetmedia.com/ynm-dataplatform/ynm-crawler/-/merge_requests/1814 (Merged)
+ https://git.younetmedia.com/ynm-dataplatform/ynm-crawler/-/merge_requests/1852




## Cách chạy:
Deployment: ynmpdp-5768-staging-ynm-crawler-empty

kubectl get pods -n crawler-staging | grep ynmpdp-5768-staging-ynm-crawler-empty
kubectl exec -it shdiy-9045-parent-post-created-date-testing-ynm-crawler-em4btlp -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh



## Tài liệu
Wiki: https://wiki.younetco.com/display/FB/%5BThreads%5D+Detect+Source



## Script chạy
Scope:

Các loader gặp vấn đề như trên: (Hiện tại dev đang đưa thiếu chỗ Repost)

+ SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER (Queue: cl.tr.source_replies_no_cookie_crawling_sources)
+ SOURCE_REPLY_CRAWLING_LOADER (Queue: cl.tr.source_replies_crawling_sources)
+ THREADS_FOLLOWERS_CRAWLING_LOADER (Queue: cl.tr.followers_crawling_sources)
+ THREADS_SOURCE_POST_CRAWLING_LOADER (Queue: cl.tr.source_posts_crawling_sources)
+ THREADS_SOURCE_POST_AUTO_CRISIS_CRAWLING_LOADER (Queue: cl.tr.source_posts_auto_crisis_crawling_sources)
+ THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER (Queue: cl.tr.source_posts_no_cookie_crawling_sources)
+ THREADS_SOURCE_POST_AUTO_CRISIS_NO_COOKIE_CRAWLING_LOADER (Queue: cl.tr.source_posts_auto_crisis_no_cookie_crawling_sources)



Script:

export LOG_LEVEL=debug

export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_ENABLE=true
export SOURCE_REPLY_CRAWLING_LOADER_ENABLE=true
export THREADS_FOLLOWERS_CRAWLING_LOADER_ENABLE=true
export THREADS_SOURCE_POST_CRAWLING_LOADER_ENABLE=true
export THREADS_SOURCE_POST_AUTO_CRISIS_CRAWLING_LOADER_ENABLE=true
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=true
export THREADS_SOURCE_POST_AUTO_CRISIS_NO_COOKIE_CRAWLING_LOADER_ENABLE=true
export REPOST_CRAWLING_LOADER_ENABLE=true
export REPOST_NO_COOKIE_CRAWLING_LOADER_ENABLE=true

export THREADS_SOURCE_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5
export SOURCE_REPLY_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5
export REPOST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5
export REPOST_NO_COOKIE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5
export THREADS_FOLLOWERS_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5

yarn start --scope=@ynm/cl-tr-crawling-loader-service

## Danh sách các queue cần phải check

cl.tr.source_replies_crawling_sources|cl.tr.source_replies_no_cookie_crawling_sources|cl.tr.source_posts_crawling_sources|cl.tr.source_posts_no_cookie_crawling_sources|cl.tr.reposts_crawling_sources|cl.tr.reposts_no_cookie_crawling_sources|cl.tr.followers_crawling_sources




## Danh sách các key trên Redis cần phải check


ThreadsSourcePostCrawlingLoader
ThreadsSourcePostNoCookieCrawlingLoader


ThreadsSourceReplyCrawlingLoader
ThreadsSourceReplyNoCookieCrawlingLoader

ThreadsRepostCrawlingLoader
ThreadsRepostNoCookieCrawlingLoader

ThreadsFollowersCrawlingLoader


## Danh sách các key ở crawling loader

THREADS_SOURCE_POST_CRAWLING_LOADER
THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER


THREADS_SOURCE_REPLY_CRAWLING_LOADER
c


THREADS_REPOST_CRAWLING_LOADER
THREADS_REPOST_NO_COOKIE_CRAWLING_LOADER

THREADS_FOLLOWERS_CRAWLING_LOADER




SELECT * FROM `crawling_loaders` 
WHERE id IN (
  'THREADS_SOURCE_POST_CRAWLING_LOADER',
  'THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER',
  'SOURCE_REPLY_CRAWLING_LOADER',
  'SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER',
  'THREADS_REPOST_CRAWLING_LOADER',
  'THREADS_REPOST_NO_COOKIE_CRAWLING_LOADER',
  'THREADS_FOLLOWERS_CRAWLING_LOADER'
);


## Schema của của collection Identity


id
id_social
mapping_id
is_personal
page_id
platform
link
shard
domain
is_kol
fullname
first_name
middle_name
last_name
gender
fb_user_type
category
friend_count
subscriber_count
birthday_day
birthday_month
birthday_year
id_city
current_city
fb_account
hometown
phone
email
address
interested
country
zip_code
relationship_status
job_level
education_level
industry
closed_group
is_private
language
avatar
post_updated_at
post_last_date
post_no_cookie_last_date
reply_updated_at
reply_last_date
reply_no_cookie_last_date
repost_updated_at
repost_last_date
repost_no_cookie_last_date
engagement_updated_at
info_updated_at
last_crawl_followers
next_crawl_time
reply_next_crawl_time
repost_next_crawl_time
priority
created_date
updated_at
last_status
error_message
commercial_rate
tt_user_id
tt_shop_id
last_active_date
identity_join_date
last_crisis_alert_date
country_code


## Loader của từng services

1. Source Post:

{
   "next_crawl_time": < next cycle if delay rule is configured,  

   "language": 1
   "platform": 10,
   "-last_status": 4

}
 
// Sorter 
[
  "next_crawl_time": "asc",
  "id": "asc"
]


- Câu query sau khi format:
language:1 AND platform:10 AND -last_status:4

sort: next_crawl_time asc, id asc


2. Source Reply

{
   "next_crawl_time": < next cycle if delay rule is configured,  

   "language": 1
   "platform": 10,
   "-last_status": 4

}
 
// Sorter 
[
  "next_crawl_time": "asc",
  "id": "asc"
]


- Câu query sau khi format: 
language:1 AND platform:10 AND -last_status:4

sort: next_crawl_time asc, id asc


3. Source Repost

const query = this.solrTopic.createQuery()
    .q('*:*')
    .fl('id', 'id_social', 'priority', 'platform', 'link', 'repost_last_date')
    .matchFilter('language', 1)
    .matchFilter('platform', 10)
    .matchFilter('-last_status', 4)
    .matchFilter('repost_next_crawl_time', `((*:* -repost_next_crawl_time:[* TO *]) OR repost_next_crawl_time:[* TO ${this.getTimeNextCycle()}])`)
    .sort({ 'id': 'asc' }, { 'repost_next_crawl_time': 'asc' })
    .cursorMark(<next_cursor> || '*')
    .rows(<limit>);


{
   "next_crawl_time": < next cycle if delay rule is configured,  

   "language": 1
   "platform": 10,
   "-last_status": 4

}
 
// Sorter 
[
  "next_crawl_time": "asc",
  "id": "asc"
]

- Câu query sau khi format:
language:1 AND platform:10 AND -last_status:4 AND (repost_next_crawl_time:[* TO NOW] OR (*:* -repost_next_crawl_time:[* TO *]))

sort: repost_next_crawl_time asc, id asc


4. Threads follower

query {

     platform: 10

     '-last_status': 4

     'last_crawl_followers':'[* TO NOW-1MONTHS] OR (*:* -last_crawl_followers:[* TO *])'

}
sort {

     last_crawl_followers: asc

     id: asc

}


- Câu query sau khi format:
platform:10 AND -last_status:4 AND (last_crawl_followers:[* TO NOW-1MONTHS] OR (*:* -last_crawl_followers:[* TO *]))

sort: last_crawl_followers asc, id asc





## Những cases cần phải check

- Kiểm tra lại loader (khoảng 9 luồng)
- Kiểm tra lại Redis Cache (Coi có cache đúng id hay không)
- Chạy full luồng (1-2 luồng) -> Để xem vấn đề đã được giải quyết hay chưa



## Data mẫu:


Source Post:

{
  "id": "tr_63045317667",
  "avatar": "https://instagram.fsgn5-10.fna.fbcdn.net/v/t51.2885-19/454534388_1686490095449311_1623104050293666241_n.jpg?stp=dst-jpg_s150x150_tt6&_nc_ht=instagram.fsgn5-10.fna.fbcdn.net&_nc_cat=107&_nc_oc=Q6cZ2QHiT-kXUiGArjigNmcYPejMfCLX0WuiXiT76X16_S_7pecatwNZ5aXgScViCCnYY8_c6-28hSZrCEQH4dv9NQFW&_nc_ohc=tZVbbXd7JboQ7kNvwFmts6V&_nc_gid=RWNEsGD09X9EfEZbHqUtzQ&edm=AAZTMJEBAAAA&ccb=7-5&oh=00_AfETH0IbNuiKVRSKW_UFAKk_QxG0zeQ_UMp6cqlRoMHI8w&oe=680D3085&_nc_sid=49cb7f",
  "country_code": "VN",
  "language": 1,
  "info_updated_at": "2025-04-22T08:43:02.375Z",
  "reply_next_crawl_time": "2025-07-24T05:14:47.432Z",
  "repost_no_cookie_last_date": "2025-07-30T01:40:34.318Z",
  "next_crawl_time": "2025-07-24T05:14:47.432Z",
  "domain": "threads.net",
  "link": "threads.net/@mediicmusiic",
  "repost_last_date": "2025-08-27T17:52:01.007Z",
  "platform": 10,
  "repost_updated_at": 1756317121,
  "updated_at": "2025-07-24T04:59:47.432Z",
  "post_no_cookie_last_date": "2025-01-08T13:16:30Z",
  "reply_no_cookie_last_date": "2025-05-12T11:25:48Z",
  "last_status": 0,
  "id_social": {
    "set": "99999999"
  },
  "subscriber_count": 307,
  "mapping_id": "tr_63045317667",
  "fullname": "Mediic",
  "created_date": "2025-07-24T04:56:32.509Z",
  "repost_next_crawl_time": "2025-08-29T17:52:01.007Z"
}








Soure Repost:

{
    "id": "tr_62792271126",
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
    "last_data_date": "2025-08-24T15:39:47Z",
    "from_date": "1756049987",
    "to_date": "1768462972",
    "platform": 10,
    "createdBy": "ThreadsRepostNoCookieCrawlingLoader",
    "link": "threads.net/@ddaofthi",
    "startedCrawling": "2026-01-15T07:42:52.061Z",
    "default_data_duration": "2025-01-15T07:42:52.061Z",
    "id_social": "55555555",
    "is_first_crawled": false,
    "mapping_id": "tr_62792271126",
    "username": "ddaofthi"
  }



Source Reply:


{
  "id": "66861343491",
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
  "last_data_date": "2025-01-15T08:28:40.341Z",
  "from_date": "1736929720",
  "to_date": "1768465720",
  "platform": 10,
  "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader",
  "link": "threads.net/@_dynduyn.1_",
  "id_social": "22223333",
  "is_first_crawled": false,
  "mapping_id": "tr_66861343491",
  "username": "_dynduyn.1_"
}


Follower



{
  "id": "10003031071",
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-01-15T07:04:33.442Z",
  "platform": 10,
  "createdBy": "ThreadsFollowersCrawlingLoader"
}
