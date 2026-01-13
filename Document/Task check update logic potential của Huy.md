# Task check updater của Huy

## Vấn đề

Nội dung điều chỉnh:
+ Thay đổi logic update thông tin identity trên Redis: Không sử dụng field id của value trong Redis để làm key update, thay vào đó sẽ sử dụng trực tiếp field id của crawling source làm key update. Mục đích là để tránh trường hợp 1 số identity trên Redis không có field id trong value.


## Scope

- Nếu như record của identity có tồn tại trên Redis (Valua có id hay không có id) -> Đều cập nhật lại subcriber_count, nếu không có id thì cập nhật luôn id
- Nếu như record của identity đó có tồn tại nhưng value của nó là null hoặc {} thì không cập nhật subcriber_count cũng như id
- Khi và chỉ khi value của record đó có ít nhất 1 field, thì mới cập nhật subcriber_count cũng như id
- Ngoài ra việc cập nhật subscriber_count xuống Solr và last_crawl_followers xuống Mongo cũng work đúng, không xảy ra lỗi


## Cách chạy


Deployment:
+ ynmpdp-5779-staging-crawler-empty-container (Luồng cũ)
+ new-ynmpdp-5779-staging-crawler-empty*(Luồng mới)*

Code commit:
+ https://git.younetmedia.com/YNM/crawler/-/merge_requests/2686 (Luồng cũ)
+ https://git.younetmedia.com/ynm-dataplatform/ynm-crawler/-/merge_requests/1835 (Luồng mới)

Scripts:
+ export FB_API_ENDPOINT=http://fbgraph-crawler-follower-user-potential-staging
 node scripts/facebookV3/update_user_profile_info_socialift_potential.js
+ node scripts/facebookV3/update_page_profile_info_socialift_potential.js (Luồng cũ)


export TT_API_ENDPOINT=http://ynm-cl-tt-api-user-service-staging:9010
+ node scripts/tiktok/get_latest_user_info_potential.js (Luồng cũ)


https://wiki.younetco.com/display/~huynvq/%5BData%5D+Script+To+Run+Services+About+Detecting+Country+For+Facebook+Identities (Luồng mới)




Tikotok: 9015
YT: 1048
FB_USER: 4280
FB_PAGE: 4281


SELECT * FROM `monitor_script_status` WHERE script_code IN (9015, 1048, 4280, 4281);

// Cách chạy updater

export HTTP_PORT=9876
export LOG_LEVEL=debug
 
# * All platforms *
export IDENTITIES_ENABLE=true
 
# * Facebook *
export FB_POST_ENABLE=false
export FB_POST_MAX_WAITING_TIME=1
export FB_POST_PREFETCH_MESSAGES=1000
export FB_POST_BATCH_SIZE=100
 
# export FB_IDENTITIES_ENABLE=false
# export FB_IDENTITIES_MAX_WAITING_TIME=60
# export FB_IDENTITIES_PREFETCH_MESSAGES=1000
# export FB_IDENTITIES_BATCH_SIZE=100
 
export ENGAGEMENTS_BY_TOPIC_ENABLE=false
export ENGAGEMENTS_BY_TOPIC_MAX_WAITING_TIME=1
export ENGAGEMENTS_BY_TOPIC_PREFETCH_MESSAGES=1000
export ENGAGEMENTS_BY_TOPIC_BATCH_SIZE=100
 
# * News *
export ARTICLE_TITLE_UPDATER_ENABLE=false
export ARTICLE_TITLE_UPDATER_MAX_WAITING_TIME=1
export ARTICLE_TITLE_UPDATER_PREFETCH_MESSAGES=1000
export ARTICLE_TITLE_UPDATER_BATCH_SIZE=100
 
export CATEGORY_LINK_UPDATER_ENABLE=false
export CATEGORY_LINK_UPDATER_MAX_WAITING_TIME=1
export CATEGORY_LINK_UPDATER_PREFETCH_MESSAGES=1000
export CATEGORY_LINK_UPDATER_BATCH_SIZE=100
 
# * Threads *
# export TR_KEYWORD_ENABLE=false
# export TR_KEYWORD_MAX_WAITING_TIME=60
# export TR_KEYWORD_PREFETCH_MESSAGES=1000
# export TR_KEYWORD_BATCH_SIZE=100
 
# export TR_HASHTAG_ENABLE=true
# export TR_HASHTAG_MAX_WAITING_TIME=60
# export TR_HASHTAG_PREFETCH_MESSAGES=1000
# export TR_HASHTAG_BATCH_SIZE=100
 
export POTENTIAL_IDENTITIES_ENABLE=true
export POTENTIAL_IDENTITIES_MAX_WAITING_TIME=1
export POTENTIAL_IDENTITIES_PREFETCH_MESSAGES=1000
export POTENTIAL_IDENTITIES_BATCH_SIZE=100
 
# export TR_IDENTITIES_ENABLE=false
# export TR_IDENTITIES_MAX_WAITING_TIME=3
# export TR_IDENTITIES_PREFETCH_MESSAGES=1000
# export TR_IDENTITIES_BATCH_SIZE=100
 
export TR_POSTS_ENABLE=false
export TR_POSTS_MAX_WAITING_TIME=1
export TR_POSTS_PREFETCH_MESSAGES=1000
export TR_POSTS_BATCH_SIZE=100
 
export TR_POSTS_BY_TOPIC_ENABLE=false
export TR_POSTS_BY_TOPIC_MAX_WAITING_TIME=1
export TR_POSTS_BY_TOPIC_PREFETCH_MESSAGES=1000
export TR_POSTS_BY_TOPIC_BATCH_SIZE=100
 
export TR_REPLIES_ENABLE=false
export TR_REPLIES_MAX_WAITING_TIME=1
export TR_REPLIES_PREFETCH_MESSAGES=1000
export TR_REPLIES_BATCH_SIZE=100
 
# * TikTok *
# export TT_IDENTITIES_ENABLE=false
# export TT_IDENTITIES_MAX_WAITING_TIME=60
# export TT_IDENTITIES_PREFETCH_MESSAGES=1000
# export TT_IDENTITIES_BATCH_SIZE=100
 
export TT_POSTS_ENABLE=false
export TT_POSTS_MAX_WAITING_TIME=1
export TT_POSTS_PREFETCH_MESSAGES=1000
export TT_POSTS_BATCH_SIZE=100
 
export TRANSCRIPT_ENABLE=false
export TRANSCRIPT_MAX_WAITING_TIME=1
export TRANSCRIPT_PREFETCH_MESSAGES=1000
export TRANSCRIPT_BATCH_SIZE=100


export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_NEWS_CONNECTION_DATABASE=crawling


export MONGO_NEWS_ENABLE=true
export MONGO_NEWS_DATABASE=ynm_crawler_staging
export MONGO_NEWS_AUTH_SOURCE=ynm_crawler_staging

export MONGO_SOCIAL_HEAT_ENABLE=true
export MONGO_SOCIAL_HEAT_DATABASE=socialheat_staging
export MONGO_SOCIAL_AUTH_SOURCE=socialheat_staging

 
NODE_ENV=staging yarn start --scope=@ynm/cl-source-updater-service


## Data test






1. Threads -> DONE

{_id: { $in: [ "tr_66253863098", "tr_76011553913", "tr_75892049911", "tr_73408728885"]}}
Câu query ở mongo

id: (tr_74855610003 tr_76011553913 tr_75892049911 tr_73408728885 )
Câu query ở Solr

// Happy case -> DONE
{
  "id": "tr_74855610003",
  "last_status": 0,
  "last_crawl_followers": "2026-01-08T04:09:24.369Z",
  "subscriber_count": 266,
  "createdBy": "ThreadsPotentialIdentityCrawlingLoader"
}


{
    "id": "tr_74855610003",
    "mapping_id": "tr_74855610003",
    "fullname": "linlianaa",
    "platform": 10,
    "link": "threads.net/@linlianaa",
    "id_social": "74855610003",
    "created_date": "2025-07-28T14:35:21.009Z",
    "domain": "threads.net",
    "subscriber_count": 266
}

// Thiếu Id -> DONE
{
  "id": "tr_76011553913",
  "last_status": 0,
  "last_crawl_followers": "2026-01-09T04:08:46.418Z",
  "subscriber_count": 297,
  "createdBy": "ThreadsPotentialIdentityCrawlingLoader"
}

{
    "mapping_id": "tr_76011553913",
    "fullname": "nguyenthuytrinh097",
    "platform": 10,
    "link": "threads.net/@nguyenthuytrinh097",
    "id_social": "76011553913",
    "created_date": "2025-07-28T16:52:05.362Z",
    "domain": "threads.net",
    "id": "tr_76011553913",
    "subscriber_count": 297
}

// Có value là {} -> DONE

{
  "id": "tr_75892049911",
  "last_status": 0,
  "last_crawl_followers": "2026-01-08T04:08:52.564Z",
  "subscriber_count": 431,
  "createdBy": "ThreadsPotentialIdentityCrawlingLoader"
}

{    "id": "tr_75892049911",    "subscriber_count": 431}


// Có value = null (Case này sẽ không xử lý) -> DONE

{
  "id": "tr_73408728885",
  "last_status": 0,
  "last_crawl_followers": "2026-01-08T04:08:54.157Z",
  "subscriber_count": 116,
  "createdBy": "ThreadsPotentialIdentityCrawlingLoader"
}

Không cập nhật lên Redis


- Case
+ Đã cập nhật xuống mongo
+ Đã cập nhật xuống Solr


2. Tiktok

Query mongo
{
  "_id": {
    "$in": [
      "tt_MS4wLjABAAAA--92gIoXosMtPQWVqd8RVsjJ_bzDleDw9LY1BC5gG6C-r1wA2HDVkNwMmQjxT8JF",
      "tt_MS4wLjABAAAA--2-PrbdAEE3g8-y4uYrK0gFpcJdhxKYFOoNkfMyRJrvjkrEW_RcrhvHxmHPxU0e",
      "tt_MS4wLjABAAAA--5ylrySXNY8Cs4ACJfmoqll-kFTkmp5aYQQFbncroyGfcWcs4LtwE8LE85PUc-R",
      "tt_MS4wLjABAAAA--61cyqNl7SNv0s1vM5a6n1jqTNFGKyqSQ5DrojXZVo0YQf2rAqjC5tDaBM7714-"
    ]
  }
}



Query Solr
id: ("tt_MS4wLjABAAAAUrSDiQeQtUa35VK-AvmrpGX1qg00M6NYkY0YOGDd8YMzPZunDwWzzNY4GWQ2wGSQ" "tt_MS4wLjABAAAAUn25VC5UZAek3OQmMZI60Excjxw4gNp96GYBkhNAXUlHSf_-PtWjHr3xhZ6rTnME" "tt_MS4wLjABAAAAUnBmGyboqEeVRMfV3P0dPt3PW2-KWsXTdlYeVrO4O1oZaIRxUox1HM-llH_R_Ps9" "tt_MS4wLjABAAAAUcOTv5RbT8eUNlrmMpZrUWqobtX-uL-aKXU-HX3LLSw")


// Happy case -> Hiện tại đã work đúng yêu cầu

tt_MS4wLjABAAAA--92gIoXosMtPQWVqd8RVsjJ_bzDleDw9LY1BC5gG6C-r1wA2HDVkNwMmQjxT8JF


// Thiếu id -> Hiện tại đã work đúng yêu cầu
tt_MS4wLjABAAAA--2-PrbdAEE3g8-y4uYrK0gFpcJdhxKYFOoNkfMyRJrvjkrEW_RcrhvHxmHPxU0e


// Có value là {} -> Hiện tại case này đã hoạt động đúng
tt_MS4wLjABAAAA--5ylrySXNY8Cs4ACJfmoqll-kFTkmp5aYQQFbncroyGfcWcs4LtwE8LE85PUc-R


// Có value là null -> Hiện tại case này đã hoạt động đúng
tt_MS4wLjABAAAA--61cyqNl7SNv0s1vM5a6n1jqTNFGKyqSQ5DrojXZVo0YQf2rAqjC5tDaBM7714-



3. Facebook

Query Mongo
{
  "_id": {
    "$in": [
      "fb_100000000000454",
      "fb_100000000061197",
      "fb_100000000075237",
      "fb_100000000155924"
    ]
  }
}
id: ("fb_100000000000454" "fb_100000000061197" "fb_100000000075237" "fb_100000000155924")

Query Solr



// Happy case -> Hiện tại đã work đúng yêu cầu
fb_100000000000454


fb_100090820188147


// Thiếu id -> Hiện tại đã work đúng yêu cầu
fb_100000000061197


// Có value là {} -> Hiện tại đã work đúng yêu cầu
fb_100000000075237

// Có value là null -> Hiện tại đã work đúng yêu cầu
fb_100000000155924








4. Join Date Tiktok -> DONE



[
  {
    "id": "tt_MS4wLjABAAAABTt2dDbEGAaxCUAD8qat5RZY4C873EHr-DeYNBPBU8ZFPrtgJomojdk3hYeubStl",
    "last_status": 0,
    "platform": 9,
    "identity_join_date": "2025-04-02T11:49:57.000Z",
    "createdBy": "TiktokQualifiedUserInfoCrawlingLoader"
  },
  {
    "id": "tt_MS4wLjABAAAACZQ-c3HMAOjGJ7K_rG1sOZFbOP9FvnPhlZnHbHDFKlsp4CWWCcg4yoiAmq-dc_3P",
    "last_status": 0,
    "platform": 9,
    "identity_join_date": "2025-05-02T11:49:57.000Z",
    "createdBy": "TiktokQualifiedUserInfoCrawlingLoader"
  },
  {
    "id": "tt_MS4wLjABAAAAqEWSusNHgIrVshJQl8a8D2kUu1qpHevkropMasLacZbI4tDU61A-7kFmPuSULy8U",
    "last_status": 0,
    "platform": 9,
    "identity_join_date": "2025-06-02T11:49:57.000Z",
    "createdBy": "TiktokQualifiedUserInfoCrawlingLoader"
  },
  {
    "id": "tt_MS4wLjABAAAAuo3mp6Pr-jfy0Oszk71by_xoySeVn1tq9YC2pptLaaDfm2L4ICGE2j4V4ds6K8Hr",
    "last_status": 0,
    "platform": 9,
    "identity_join_date": "2025-06-02T11:49:57.000Z",
    "createdBy": "TiktokQualifiedUserInfoCrawlingLoader"
  }
]



// Thiếu id
{
  "id": "tt_MS4wLjABAAAABTt2dDbEGAaxCUAD8qat5RZY4C873EHr-DeYNBPBU8ZFPrtgJomojdk3hYeubStl",
  "last_status": 0,
  "platform": 9,
  "identity_join_date": "2024-10-02T11:49:57.000Z",
  "createdBy": "TiktokQualifiedUserInfoCrawlingLoader"
}


// Happy case
 {
 	"id": "tt_MS4wLjABAAAACZQ-c3HMAOjGJ7K_rG1sOZFbOP9FvnPhlZnHbHDFKlsp4CWWCcg4yoiAmq-dc_3P",
  "last_status": 0,
  "platform": 9,
  "identity_join_date": "2024-04-02T11:49:57.000Z",
  "createdBy": "TiktokQualifiedUserInfoCrawlingLoader"
}

// Có value là {}
{
  "id": "tt_MS4wLjABAAAAqEWSusNHgIrVshJQl8a8D2kUu1qpHevkropMasLacZbI4tDU61A-7kFmPuSULy8U",
  "last_status": 0,
  "platform": 9,
  "identity_join_date": "2024-04-02T11:49:57.000Z",
  "createdBy": "TiktokQualifiedUserInfoCrawlingLoader"
}

// Có value là null

{
  "id": "tt_MS4wLjABAAAAuo3mp6Pr-jfy0Oszk71by_xoySeVn1tq9YC2pptLaaDfm2L4ICGE2j4V4ds6K8Hr",
  "last_status": 0,
  "platform": 9,
  "identity_join_date": "2024-06-02T11:49:57.000Z",
  "createdBy": "TiktokQualifiedUserInfoCrawlingLoader"
}


5. Join date Facebook -> DONE

// Happy case
{
  "id": "fb_100015193179440",
  "last_status": 0,
  "createdBy": "UserProfileJoinDateCrawlingLoader",
  "identity_join_date": "2010-01-13T23:50:47.000Z"
}

// Thiếu id
{
  "id": "fb_61552581541453",
  "last_status": 0,
  "createdBy": "UserProfileJoinDateCrawlingLoader",
  "identity_join_date": "2010-02-13T23:50:47.000Z"
}


// Có value là {}
{
  "id": "fb_61559714513403", 
  "last_status": 0,
  "createdBy": "UserProfileJoinDateCrawlingLoader",
  "identity_join_date": "2010-03-13T23:50:47.000Z"
}

// Có value là null
{
  "id": "fb_61556767207932",
  "last_status": 0,
  "createdBy": "UserProfileJoinDateCrawlingLoader",
  "identity_join_date": "2010-04-13T23:50:47.000Z"
}


6. Youtube -> DONE

Scope:

Cập nhật lại id và subscriber_count cho record không có field id ở Redis

Case:

Record trên Redis value không có field "id". Ví dụ UC6Cefqz6INITmRVhb6i7AEg
Record trên Redis value có field "id". Ví dụ UCHZhgItQp2FwGt2uN88a4dw
Record trên Redis có value là "{}". Ví dụ: UC6o8QcbiZQBBGVRDzgaQ4GQ
Record trên Redis có value là null. Ví dụ UCETfNRb8j8OEiKwf3DYdjAQ
Tất cả các case trên đã test pass ở Staging

Ngoài ra việc cập nhật subscriber_count xuống Solr và last_crawl_followers xuống Mongo cũng work đúng, không xảy ra lỗi