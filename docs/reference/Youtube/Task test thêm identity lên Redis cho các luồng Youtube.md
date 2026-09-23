# Task test thêm identity lên Redis cho các luồng Youtube


Mục tiêu: Bổ sung identity trên redis đối với các luồng crawl post/comment của Youtube.

Các script cần điều chỉnh:
1) scripts/youtubeV2/get_latest_top_50_trending.js
2) scripts/youtubeV3/get_latest_priority_videos_comments_by_api.js
3) scripts/youtubeV2/get_latest_priority_comments_replies.js
4) scripts/articlesV3WithNextCrawlTime/crawlYoutubeDetails.js

Wiki:
+ https://wiki.younetco.com/display/FB/%5BYoutube%5D+Get+Latest+Trending+Posts+By+Youtube+API
+ https://wiki.younetco.com/display/FB/%5BYoutube%5D+Get+Latest+Comments+From+Post+By+Youtube+API
+ https://wiki.younetco.com/display/FB/%5BYoutube%5D+Get+Latest+Replies+From+Comment+By+Youtube+API
+ https://wiki.younetco.com/pages/viewpage.action?spaceKey=FB&title=Crawl+Youtube+Detail


## Scope

Mục tiêu chỉ đơn giản là update identiy vào Redis
Nhưng phải có 1 số luồng có tinh chỉnh nhỏ 1 xíu
Và cuối cùng phải check xem những luồng này có update xuống các database đúng với value của các platform Youtube không

-> Cần phải kiểm tra kĩ và chạy lại full luồng


## Chi tiết về các luồng

ynmpdp-5324-staging-crawler-empty-container
kubectl get pods -n crawler-staging | grep ynmpdp-5324-staging-crawler-empty-container
kubectl exec -it ynmpdp-5324-staging-crawler-empty-container-5f66c59745-nqz9b -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh



### Luồng 50 top trending

-> Luồng này khá dễ nên là chạy khá nhanh




// Luồng chạy sẽ là: 

- Lấy video category 
- Gọi API lấy top trending
- Sau đó update vào các database: mentions/solr/identities/youtube_posts/Redis

API: 

https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,statistics&chart=mostPopular&regionCode=VN&maxResults=50&key=<key>&videoCategoryId=<videoCategoryId>


// Script để chạy

node services.js
node scripts/youtubeV2/get_latest_top_50_trending.js


**Đây là những gì get lại được khi chạy test**
Filter data:


updated_at: ["2025-08-14T03:20:42Z" TO "2025-08-14T04:13:42Z"]
updated_at: ["2025-08-14T03:20:42Z" TO *]


DATA TO QUEUE: {
  "id": "8cf173f0-2fe1-5e83-99a3-3fa4df6da963",
  "id_source": "UChUJa1JyBc7Lc4orkiNKKQg",
  "id_social": "LgmQmKNIDj0",
  "title": "JACK - J97 | LIỄU",
  "priority": null,
  "source_type": null,
  "created_date": "2025-08-10T13:09:07Z",
  "link": "youtube.com/watch?v=LgmQmKNIDj0"
}



Data ở identity
{
  "id": "UChUJa1JyBc7Lc4orkiNKKQg",
  "reply_next_crawl_time": "2025-08-14T03:39:27.854Z",
  "next_crawl_time": "2025-08-14T03:39:27.854Z",
  "domain": "youtube.com",
  "link": "youtube.com/channel/UChUJa1JyBc7Lc4orkiNKKQg",
  "platform": 7,
  "updated_at": "2025-08-14T03:24:27.854Z",
  "id_social": "UChUJa1JyBc7Lc4orkiNKKQg",
  "fullname": "J97",
  "created_date": "2025-08-14T03:24:26.625Z",
  "repost_next_crawl_time": "2025-08-14T03:39:27.854Z"
  "repost_next_crawl_time":"2025-08-14T03:39:27.854Z"
}

Data ở mention
{
  "id": "8cf173f0-2fe1-5e83-99a3-3fa4df6da963",
  "link": "youtube.com/watch?v=LgmQmKNIDj0",
  "id_source": "UChUJa1JyBc7Lc4orkiNKKQg",
  "views": 1365334,
  "likes": 55800,
  "comments": 12026,
  "shares": 0,
  "rating_score": 0,
  "engagement_total": 67826,
  "engagement_s_c": 12026,
  "identity": "UChUJa1JyBc7Lc4orkiNKKQg",
  "identity_name": "J97",
  "mention_type": 1,
  "title": "JACK - J97 | LIỄU THANH YÊN | Live performance show",
  "search_text": [
    "JACK - J97 | LIỄU THANH YÊN | Live performance show",
    "JACK - J97 | LIỄU THANH YÊN | Live performance show\n#jack #j97 #lieuthanhyen #liveperformance\n🎙 ️ Lyrics:\nThương má Em hồng, mình không trong bóng đêm\nNước mắt lưng tròng, chờ mong day dứt thêm\nMình vẫn còn yêu nhau, vậy mà đành xa cách\nChuyện tình mình như lá, mây bay ngang trời\nNỗi đau không lời, hận em suốt cuộc đời ....\nVER:\nCớ sao mà Anh vẫn thương, vẫn nhớ về Em ...\nÁnh trăng vừa lên chiếu soi bóng dáng hằng đêm\nBầu trời giờ tối đen giờ tối đen trong tâm hồn\nLòng đau nhói ngàn câu nói chẳng khôn\nNàng là đóa hoa ven đường, gió sương đem lòng yêu thương ....\nThế gian nổi trôi lắm em khế ước của hai đứa mình ...\nTrước khi người đi ngước theo anh đứng lặng thinh ....\nNgười là ngàn lí do ngàn lí do anh ở lại\nThuyền theo sóng chìm theo bóng hồng phai ...\nBởi vì tình yêu đã khác, giờ thì lòng anh tan nát em à ....\nPRE:\nLiễu thanh yên cõi lòng miên mang ...\nHọa bóng dung nhan, tay siết mang\nNhìn sao đêm, vầng trăng sáng, ngồi đây viết tương tư cho nàng\nTrời cho ôm lấy nhau, phút ra đi chẳng quay đầu ...\n_____________\nCopyright concern: copyright@j97entertainment.com\nWorking Contact: booking@j97entertainment.com\nMobile: (+84) 0909238355 / 0827171456\nJack’s Official Social Networks:\nFacebook Profile: https://www.facebook.com/phuongtuan1997\nFanpage: https://www.facebook.com/jack.phuongtuan1204\nInstagram: https://www.instagram.com/iamjack1997/\nTwitter: https://twitter.com/phuongtuan_j97\nTiktok: https://www.tiktok.com/@imjack1997\nJ97 Entertainment’s Official Social Networks:\nWebsite: https://j97entertainment.com\nFanpage: https://www.facebook.com/J97entertainment.official\nYoutube: https://www.youtube.com/@J97entertainment.official\nLinkedin: https://www.linkedin.com/company/j97entertainment\nAppreciate your supporting."
  ],
  "attachment": "{\"media_src\":\"https://i.ytimg.com/vi/LgmQmKNIDj0/default.jpg\",\"type\":\"video\"}",
  "is_to_topic": false,
  "domain": "youtube.com",
  "mention_type_details": 1,
  "platform": 7,
  "updated_at": "2025-08-14T03:24:28.090Z",
  "created_date": "2025-08-10T13:09:07Z"
}

Data ở Youtube Posts  
Hiện tại chỗ này đang thiếu field priority -> Hiện tại không cần lưu, như anh Thạch confirm

{
  "id": "8cf173f0-2fe1-5e83-99a3-3fa4df6da963",
  "id_source": "UChUJa1JyBc7Lc4orkiNKKQg",
  "id_social": "LgmQmKNIDj0",
  "title": "JACK - J97 | LIỄU",
  "created_date": "2025-08-10T13:09:07Z",
  "crawled_date": "2025-08-14T03:24:27.999Z",
  "next_crawl_time": "2025-08-14T03:39:27.999Z"
}


Data ở Redis
{
    "id": "UChUJa1JyBc7Lc4orkiNKKQg",
    "fullname": "J97",
    "platform": 7,
    "link": "youtube.com/channel/UChUJa1JyBc7Lc4orkiNKKQg",
    "id_social": "UChUJa1JyBc7Lc4orkiNKKQg",
    "created_date": "2025-08-14T03:24:26.625Z",
    "domain": "youtube.com"
}




### Luồng lastest comment from post by Youtube API

-> Luồng này chạy giống với task fix sources đã từng test trước đó

+ Huy có thêm vào queue để đi next page (Task này có 2 mục đích là không bị ngậm message và lưu được xuống identity)


// Luồng chạy sẽ là


- Loader từ youtube posts 

   + Database: MySQL

   + Table: crawling.monitor_script_status

   + script_code: 1035
-> Cursor của script


- Câu query để load lên

{
    fields: ['id','id_social','id_source','title','comment_last_date','comment_updated_at', 'priority', 'is_kol'],
    filter: {
      priority: "[1 TO 10]",
      created_date: "[NOW-30DAYS TO *]",
      next_crawl_time: "[* TO NOW]",
    },
    sorter: {
      next_crawl_time: "asc",
      id: "desc",
    },
  };
- Sau khi crawl xong thì lưu vào crawled queue bình thường

mentions_hdd

youtube.error_source

youtube.post.crawled_source

youtube.post.crawling_source

youtube.post.crawling_source_next_page



^(youtube\.post\.(crawling_source|crawled_source|crawling_source_next_page)|youtube\.error_source|mentions_(ssd|hdd))$


- Các logic xử lý, retry đều xử lí bình thường như các luồng khác


- Updater 
update vào youtube comments/ identity / Redis 


// Câu lệnh chạy script

+ node scripts/youtubeV3/monitoring_priority_video.js (Loader)

+ node services.js (Crawler)

+ node scripts/youtubeV3/get_latest_priority_videos_comments_by_api.js 


// Những cases cần check
- Kiểm tra thử xem có đi qua queue next page hay không -> Pass
- Kiểm tra xem điều kiện query có đúng hay không -> Pass
- Kiểm tra format queue -> Pass
- Kiểm tra số lượng comment sau khi crawl có đủ trong video đó không -> Pass
- Kiểm tra xem có push vào queue crawled source khi crawl xong hay không -> Pass
- Kiểm tra xem có đẩy identity lên Redis sau khi crawl hay không -> Pas
- Kiểm tra xem có push vào mention ssd/hdd hay không -> Pass
    Hiện tại đang lưu sai idenntity name -> Không phải sai nhưng cần đợi các luồng update engagement vào
- Kiểm tra value ở youtube comments/ identity / Redis -> Pass


// Message video bị lỗi
{
  "id": "2f654c95-d993-53e8-b8c4-6b048fce83fb",
  "id_source": "UCnRdHj745lc1tQP_gDR8YdQ",
  "id_social": "4u_bUivflmU",
  "title": "[36기 갈릴리학교] 7.",
  "priority": 1,
  "minDateToPull": "2024-08-19T09:23:26.235Z",
  "maxDateToPull": "2025-08-19T09:23:26.235Z",
  "iPullItems": 0,
  "iPullItemsFromSourceErr": 0
}

{
  "id": "2f654c95-d993-53e8-b8c4-6b048fce83fb",
  "id_source": "UCnzR18c-CrUwpmd69DcuyhA",
  "id_social": "Yi8gCqSBjlk",
  "title": "테슬라 2분기 실적 왜 안좋은가?",
  "priority": 1,
  "minDateToPull": "2024-08-19T09:23:26.235Z",
  "maxDateToPull": "2025-08-19T09:23:26.235Z",
  "iPullItems": 0,
  "iPullItemsFromSourceErr": 0
}



// Các message bị lỗi update ở crawled source
[
  {
    "id": "2f654c95-d993-53e8-b8c4-6b048fce83fb",
    "id_source": "UCnzR18c-CrUwpmd69DcuyhA",
    "id_social": "Yi8gCqSBjlk",
    "title": "테슬라 2분기 실적 왜 안좋은가?",
    "priority": 1,
    "minDateToPull": "2024-08-19T09:51:15.547Z",
    "maxDateToPull": "2025-08-19T09:51:15.547Z",
    "iPullItems": 0,
    "iPullItemsFromSourceErr": 3,
    "last_status": 1,
    "error_message": ""
  },
  {
    "id": "2f654c95-d993-53e8-b8c4-6b048fce83fb",
    "id_source": "UCnRdHj745lc1tQP_gDR8YdQ",
    "id_social": "4u_bUivflmU",
    "title": "[36기 갈릴리학교] 7.",
    "priority": 1,
    "minDateToPull": "2024-08-19T09:48:22.810Z",
    "maxDateToPull": "2025-08-19T09:48:22.810Z",
    "iPullItems": 0,
    "iPullItemsFromSourceErr": 3,
    "last_status": 1,
    "error_message": ""
  },
  {
    "id": "2f654c95-d993-53e8-b8c4-6b048fce83fb",
    "id_source": "UC0HxT53-9BRz93mU9Nju9ig",
    "id_social": "v2ALHctFoFM",
    "title": "[🔴라이브] 전기(산업)기사 2회차",
    "priority": 1,
    "minDateToPull": "2024-08-19T09:23:26.235Z",
    "maxDateToPull": "2025-08-19T09:23:26.235Z",
    "iPullItems": 0,
    "iPullItemsFromSourceErr": 1,
    "last_status": 1,
    "error_message": ""
  }
]





// Message cua queue youtube.post.crawling_source
{
  "id": "089eb5fe-31d3-5284-91f3-8e879c980736",
  "title": "TEN Transport Evolved News Episode 486. Elon's Threat, ID.7 Delayed Outside EU, Cybertruck Busted",
  "id_source": "UC675NhQ4EU5TzwCMwYp5XCw",
  "id_social": "7P41MKtF7c4",
  "minDateToPull": "2022-05-25T12:24:06Z",
  "maxDateToPull": "2022-04-30T23:59:59Z",
  "iPullItems": 0,
  "iPullItemsFromSourceErr": 0
}

// Message cua queue youtube.post.crawled_source
{
  "id": "089f2caa-2909-564c-ab4e-b705596d3018",
  "title": "Upgraded Model 3 Arrives! | Tesla Time News 384",
  "id_source": "UCMFmrcGuFNu_59L0pHcR0OA",
  "id_social": "BX6Vn48jZvE",
  "minDateToPull": "2024-08-15T03:22:05.595Z",
  "maxDateToPull": "2025-08-15T03:22:05.595Z",
  "iPullItems": 1,
  "iPullItemsFromSourceErr": 0,
  "last_status": 0,
  "failed_total": 0,
  "error_message": null
}


// Message cua queue next_page
{
  "id": "671b59ea-a657-5c75-ae9f-257541b6bac5",
  "title": "Is the 2026 Rivian R2 a new midsize SUV WORTH $45k?",
  "id_source": "UCILN_EvJ2ocZ5MW7168oQLg",
  "id_social": "2rvWNZs3c6g",
  "minDateToPull": "2024-08-18T03:15:01.906Z",
  "maxDateToPull": "2024-09-20T16:15:43Z",
  "iPullItems": 1,
  "iPullItemsFromSourceErr": 0,
  "nextPageToken": "Z2V0X25ld2VzdF9maXJzdC0tQ2dnSWdBUVZGN2ZST0JJRkNJa2dHQUFTQlFpZElCZ0JFZ1VJaUNBWUFCSUZDSWNnR0FBU0JRaW9JQmdBSWc0S0RBaXV2N2EzQmhDUXZjQ3NBZw==",
  "comment_last_date": "2025-08-11T22:59:34Z",
  "cursor": "Z2V0X25ld2VzdF9maXJzdC0tQ2dnSWdBUVZGN2ZST0JJRkNJa2dHQUFTQlFpZElCZ0JFZ1VJaUNBWUFCSUZDSWNnR0FBU0JRaW9JQmdBSWc0S0RBaXV2N2EzQmhDUXZjQ3NBZw=="
}



// Hiện tại message này đang không crawl được đủ bài: 

{
  "id": "089eb5fe-31d3-5284-91f3-8e879c980736",
  "title": "TEN Transport Evolved News Episode 486. Elon's Threat, ID.7 Delayed Outside EU, Cybertruck Busted",
  "id_source": "UC675NhQ4EU5TzwCMwYp5XCw",
  "id_social": "7P41MKtF7c4",
  "minDateToPull": "2022-05-25T12:24:06Z",
  "maxDateToPull": "2022-04-30T23:59:59Z",
  "iPullItems": 0,
  "iPullItemsFromSourceErr": 0
}

Đã chỉnh lại minDate maxDate -> Nhưng mà vẫn bị lỗi

Thông tin được lưu ở Solr

// Youtube_comment
 {
        "id":"53c3671e-602d-5c45-9500-1a82d3ddefa4",
        "id_source":"UC8VNCRnW59cwVS-eyOAI9Cw",
        "id_social":"UgwsDtbCzEgm_Nk7Ukh4AaABAg",
        "title":"Sai Lầm Lớn Trong Việc Phát Triển Bản Thân",
        "priority":1,
        "created_date":"2025-08-01T00:15:35Z",
        "video_id":"k6X6mauMvHs",
        "crawled_date":"2025-08-18T09:13:58.470Z",
        "next_crawl_time":"2025-08-18T09:28:58.470Z"
  }


   {
        "id":"9570c9f8-3691-5257-b069-26c9d748ce5f",
        "id_source":"UCc4V468kIqAyGd6TVZ4MDCg",
        "id_social":"Ugx0QbPFSbxgIx1OM754AaABAg",
        "title":"종아리ab슬라이드 쿠팡 특가템 언박싱",
        "priority":1,
        "created_date":"2025-07-21T21:46:25Z",
        "video_id":"4nRL3K4TmLE",
        "crawled_date":"2025-08-20T03:57:57.991Z",
        "next_crawl_time":"2025-08-20T04:12:57.991Z"}


  -> Hiện tại title ở Youtube comment đã lấy đúng
  -> Chỉ khác việc là lưu video_id với lại id_social thôi
  -> Cần confirm lại nếu như video bị xóa thì có đánh platform cho luồng Youtube hay không

// Mention

 {
        "id":"53c3671e-602d-5c45-9500-1a82d3ddefa4",
        "link":"youtube.com/watch?v=k6X6mauMvHs&lc=UgwsDtbCzEgm_Nk7Ukh4AaABAg",
        "id_source":"UC8VNCRnW59cwVS-eyOAI9Cw",
        "id_reference":"2f654c95-d993-53e8-b8c4-6b048fce83fb",
        "views":0,
        "likes":0,
        "comments":0,
        "shares":0,
        "rating_score":0,
        "engagement_total":0,
        "engagement_s_c":0,
        "identity":"UCEup0bq1plrbcWAgjWx9Bbg",
        "identity_name":"@hyg2066",
        "mention_type":2,
        "search_text":["",
          "E giờ vẫn còn level 1 gái bỏ vẫn đau vãi lìn chx quên được nữa"],
        "attachment":"{\"parent_info\":{\"link\":\"youtube.com/watch?v=k6X6mauMvHs\",\"title\":\"Sai Lầm Lớn Trong Việc Phát Triển Bản Thân\"}}",
        "is_to_topic":false,
        "domain":"youtube.com",
        "mention_type_details":2,
        "platform":7,
        "updated_at":"2025-08-18T09:13:58.958Z",
        "created_date":"2025-08-01T00:15:35Z"
  }

 {
        "id":"90a69e79-1fa4-5e8f-937e-062e0f149114",
        "link":"youtube.com/watch?v=WH1VyN3GmQw&lc=Ugznz081bnLTLE-Mtb94AaABAg",
        "id_source":"UCa99Kw2LRY6lshTYp6wtLSQ",
        "id_reference":"db5b82ab-a2e1-5c3c-8cda-c2a56a606bc8",
        "views":0,
        "likes":0,
        "comments":0,
        "shares":0,
        "rating_score":0,
        "engagement_total":0,
        "engagement_s_c":0,
        "identity":"UC2_FBjDmvZk-utHC6bU2TEw",
        "identity_name":"@태산-v1u",
        "mention_type":2,
        "search_text":["",
          "문의 남기고 약수익 중ᄏ 가즈아!!!"],
        "attachment":"{\"parent_info\":{\"link\":\"youtube.com/watch?v=WH1VyN3GmQw\",\"title\":\"[컴퍼니케이 주가 분석] 넷플릭스도\"}}",
        "is_to_topic":false,
        "domain":"youtube.com",
        "mention_type_details":2,
        "platform":7,
        "updated_at":"2025-08-20T04:10:59.438Z",
        "created_date":"2025-07-24T02:30:31Z"}


// Identity

{
        "id":"UCEup0bq1plrbcWAgjWx9Bbg",
        "reply_next_crawl_time":"2025-08-18T09:28:58.515Z",
        "next_crawl_time":"2025-08-18T09:28:58.515Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCEup0bq1plrbcWAgjWx9Bbg",
        "platform":7,
        "updated_at":"2025-08-18T09:13:58.515Z",
        "id_social":"UCEup0bq1plrbcWAgjWx9Bbg",
        "fullname":"@hyg2066",
        "created_date":"2025-08-18T09:13:58.493Z",
        "repost_next_crawl_time":"2025-08-18T09:28:58.515Z"
  }


  {
        "id":"UCDXzHaErMwAFhKJf-OiRrqQ",
        "reply_next_crawl_time":"2025-08-20T04:25:54.590Z",
        "next_crawl_time":"2025-08-20T04:25:54.590Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCDXzHaErMwAFhKJf-OiRrqQ",
        "platform":7,
        "updated_at":"2025-08-20T04:10:54.590Z",
        "id_social":"UCDXzHaErMwAFhKJf-OiRrqQ",
        "fullname":"@켄신-q8f",
        "created_date":"2025-08-20T04:10:54.584Z",
        "repost_next_crawl_time":"2025-08-20T04:25:54.590Z"


   {
        "id":"UCa99Kw2LRY6lshTYp6wtLSQ",
        "country":"KOREA",
        "language":1,
        "reply_next_crawl_time":"2025-05-16T07:08:52.903Z",
        "priority":1,
        "next_crawl_time":"2025-07-24T23:01:00.985Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCa99Kw2LRY6lshTYp6wtLSQ",
        "platform":7,
        "updated_at":"2025-05-16T06:53:52.903Z",
        "post_last_date":"2025-07-24T02:30:22Z",
        "last_status":0,
        "id_social":"UCa99Kw2LRY6lshTYp6wtLSQ",
        "post_updated_at":1753333260,
        "subscriber_count":38700,
        "fullname":"감동마트",
        "created_date":"2025-05-16T06:53:52.903Z",
        "repost_next_crawl_time":"2025-05-16T07:08:52.903Z"}

// Redis
{
    "id": "UCEup0bq1plrbcWAgjWx9Bbg",
    "fullname": "@hyg2066",
    "platform": 7,
    "link": "youtube.com/channel/UCEup0bq1plrbcWAgjWx9Bbg",
    "id_social": "UCEup0bq1plrbcWAgjWx9Bbg",
    "created_date": "2025-08-18T09:13:58.493Z",
    "domain": "youtube.com"
}


{
    "id": "UCa99Kw2LRY6lshTYp6wtLSQ",
    "fullname": "@주식의온도_1",
    "platform": 7,
    "link": "youtube.com/channel/UCa99Kw2LRY6lshTYp6wtLSQ",
    "id_social": "UCa99Kw2LRY6lshTYp6wtLSQ",
    "created_date": "2025-08-20T04:10:57.077Z",
    "domain": "youtube.com"
}

// Log:
DATA TO QUEUE: {
  "id": "8da4e980-100d-5c0b-9b3b-4aff33273749",
  "id_source": "UC8VNCRnW59cwVS-eyOAI9Cw",
  "id_social": "UgyxEGJ4ceD0gCtKmyJ4AaABAg",
  "title": "Sai Lầm Lớn Trong Việc Phát Triển Bản Thân",
  "priority": 1,
  "source_type": null,
  "created_date": "2025-07-31T16:35:08Z",
  "video_id": "k6X6mauMvHs",
  "link": "youtube.com/watch?v=k6X6mauMvHs&lc=UgyxEGJ4ceD0gCtKmyJ4AaABAg"
}




### Luồng get lastest replies from commment by youtube API

// Luồng chạy sẽ là

- Loader từ youtube comments

   + Database: MySQL

   + Table: crawling.monitor_script_status

   + script_code: 1031

-> Đây là cursor của Loader

Câu query: 

{
    fields: ['id','id_social','id_source','title', 'video_id','comment_last_date','comment_updated_at', 'priority', 'is_kol'],
    filter: {
      video_id: "*",
      priority: "[1 TO 10]",
      created_date: "[NOW-30DAYS TO *]",
      next_crawl_time: "[* TO NOW]",
    },
    sorter: {
      next_crawl_time: "asc",
      id: "desc",
    },
  };

- Crawler thì được crawl qua API


https://www.googleapis.com/youtube/v3/comments?part=snippet&fields=nextPageToken,items(id,snippet(authorChannelId,authorChannelUrl,authorDisplayName,authorProfileImageUrl,parentId,publishedAt,textDisplay,textOriginal,updatedAt,videoId))&parentId=<commentID>&maxResults=5&key=<key>


// Script chạy:

+ node services.js

+ node scripts/youtubeV2/get_latest_priority_comments_replies.js


-> Các chỗ  cần xử lý retry, hay crawler đều xử lý như những luồng khác (Chỉ đơn giản là nó xử lý trong buffer/code chứ không có queue ở bên ngoài)

// Record ở Redis
{
    "id": "UC3TNzf_avzH7qgdGlBNtazg",
    "fullname": "@GokulDhamMahatirth",
    "platform": 7,
    "link": "youtube.com/channel/UC3TNzf_avzH7qgdGlBNtazg",
    "id_social": "UC3TNzf_avzH7qgdGlBNtazg",
    "created_date": "2025-08-19T04:31:21.664Z",
    "domain": "youtube.com"
}


{
    "id": "UCVHwudzAXhMxluNbeUog0rg",
    "fullname": "@meiga00-n6b",
    "platform": 7,
    "link": "youtube.com/channel/UCVHwudzAXhMxluNbeUog0rg",
    "id_social": "UCVHwudzAXhMxluNbeUog0rg",
    "created_date": "2025-08-19T10:36:26.163Z",
    "domain": "youtube.com"
}



{
    "id": "UC5cRekspGofSLz8G9mEgdiw",
    "fullname": "@_IU___",
    "platform": 7,
    "link": "youtube.com/channel/UC5cRekspGofSLz8G9mEgdiw",
    "id_social": "UC5cRekspGofSLz8G9mEgdiw",
    "created_date": "2025-08-20T04:18:20.890Z",
    "domain": "youtube.com"
}

// Record ở identity
{
        "id":"UC3TNzf_avzH7qgdGlBNtazg",
        "country":"INDIA",
        "language":1,
        "reply_next_crawl_time":"2025-02-26T08:50:23.498Z",
        "priority":1,
        "next_crawl_time":"2025-07-25T21:43:43.551Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UC3TNzf_avzH7qgdGlBNtazg",
        "platform":7,
        "updated_at":"2023-12-31T17:00:00Z",
        "post_last_date":"2025-07-24T07:30:24Z",
        "last_status":0,
        "id_social":"UC3TNzf_avzH7qgdGlBNtazg",
        "post_updated_at":1753415023,
        "fullname":"gokuldhammahatirth",
        "created_date":"2025-02-26T08:35:23.498Z",
        "repost_next_crawl_time":"2025-02-26T08:50:23.498Z"}


        {
        "id":"UCVHwudzAXhMxluNbeUog0rg",
        "reply_next_crawl_time":"2025-08-19T10:51:26.192Z",
        "next_crawl_time":"2025-08-19T10:51:26.192Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCVHwudzAXhMxluNbeUog0rg",
        "platform":7,
        "updated_at":"2025-08-19T10:36:26.192Z",
        "id_social":"UCVHwudzAXhMxluNbeUog0rg",
        "fullname":"@meiga00-n6b",
        "created_date":"2025-08-19T10:36:26.163Z",
        "repost_next_crawl_time":"2025-08-19T10:51:26.192Z"}

         {
        "id":"UC5cRekspGofSLz8G9mEgdiw",
        "reply_next_crawl_time":"2025-08-20T04:33:20.896Z",
        "next_crawl_time":"2025-08-20T04:33:20.896Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UC5cRekspGofSLz8G9mEgdiw",
        "platform":7,
        "updated_at":"2025-08-20T04:18:20.896Z",
        "id_social":"UC5cRekspGofSLz8G9mEgdiw",
        "fullname":"@_IU___",
        "created_date":"2025-08-20T04:18:20.890Z",
        "repost_next_crawl_time":"2025-08-20T04:33:20.896Z"}


// Record ở youtube comment
 {
        "id":"74cd3786-fcfe-564c-bf1e-facaa6a05ec5",
        "id_source":"UC1N28tyMbicNMC26lPNuPLw",
        "id_social":"UgzW6_rdYD55MBQ0JOt4AaABAg",
        "title":"सिर्फ 7 दिन में",
        "priority":1,
        "created_date":"2025-07-21T07:56:15Z",
        "video_id":"1MCWZx-GoNM",
        "crawled_date":"2025-08-18T03:40:42.944Z",
        "comment_updated_at":1755578767,
        "comment_last_date":"2025-07-22T17:08:07Z",
        "next_crawl_time":"2025-08-21T04:46:07.411Z"
}


 {
        "id":"ea777811-5ab9-5ef0-8967-3ab626375856",
        "id_source":"UC1ifSsWUG241rRfK0ezYCgA",
        "id_social":"Ugxw2H1ZSvfCTULei_94AaABAg",
        "title":"\"월 850만원이 생활비로",
        "priority":1,
        "created_date":"2025-07-23T07:29:59Z",
        "video_id":"fztojzjO5R4",
        "crawled_date":"2025-08-18T03:54:46.721Z",
        "comment_updated_at":1755599834,
        "comment_last_date":"2025-07-26T03:16:20Z",
        "next_crawl_time":"2025-08-21T10:37:14.790Z"}

  sponse":{"numFound":1,"start":0,"docs":[
      {
        "id":"68bffdb7-1f9e-508b-b38c-2066ae2f75d7",
        "id_source":"UC1ifSsWUG241rRfK0ezYCgA",
        "id_social":"UgwIfybHdXr5YXtsJAN4AaABAg",
        "title":"\"나이 많다고 하더니 욕까지 해?\"",
        "priority":1,
        "created_date":"2025-07-25T07:47:33Z",
        "video_id":"Km_4iv5qj5A",
        "crawled_date":"2025-08-18T03:51:25.833Z",
        "comment_updated_at":1755663546,
        "comment_last_date":"2025-07-25T07:50:44Z",
        "next_crawl_time":"2025-08-22T04:19:06.570Z"}


Chỗ này nó sẽ update ở comment_updated_at

// Record ở mention

{
        "id":"b66cc4c5-3877-5cae-9a08-ea93e8c27064",
        "link":"youtube.com/watch?v=1MCWZx-GoNM&lc=UgzW6_rdYD55MBQ0JOt4AaABAg.AKpg_BLCToMAKtFWzHjFCk",
        "id_source":"UC1N28tyMbicNMC26lPNuPLw",
        "id_reference":"66a7ca14-8b3e-5d6a-8d0e-9fb853e64091",
        "id_parent_comment":"74cd3786-fcfe-564c-bf1e-facaa6a05ec5",
        "views":0,
        "likes":0,
        "comments":0,
        "shares":0,
        "rating_score":0,
        "engagement_total":0,
        "engagement_s_c":0,
        "identity":"UC1N28tyMbicNMC26lPNuPLw",
        "identity_name":"@Kavyanaturalbeauty",
        "mention_type":2,
        "search_text":["",
          "Han vahi bhi poshtik hota Hai"],
        "attachment":"{\"parent_info\":{\"link\":\"youtube.com/watch?v=1MCWZx-GoNM\",\"title\":\"सिर्फ 7 दिन में\"}}",
        "is_to_topic":false,
        "domain":"youtube.com",
        "mention_type_details":2,
        "platform":7,
        "updated_at":"2025-08-19T04:45:15.716Z",
        "created_date":"2025-07-22T17:08:07Z"
        
        }


  "created_date":"2025-07-23T09:44:35Z"},
      {
        "id":"7c6ee4a0-0f97-5d7d-b0e7-69cb70fc55d8",
        "link":"youtube.com/watch?v=fztojzjO5R4&lc=Ugxw2H1ZSvfCTULei_94AaABAg.AKun9Yshny0AKv6wdaRdZ7",
        "id_source":"UC1ifSsWUG241rRfK0ezYCgA",
        "id_reference":"c79c5808-b093-57f6-bedd-6d38ab0ca18f",
        "id_parent_comment":"ea777811-5ab9-5ef0-8967-3ab626375856",
        "views":0,
        "likes":0,
        "comments":0,
        "shares":0,
        "rating_score":0,
        "engagement_total":0,
        "engagement_s_c":0,
        "identity":"UCVHwudzAXhMxluNbeUog0rg",
        "identity_name":"@meiga00-n6b",
        "mention_type":2,
        "search_text":["",
          "​@@헐-h6d근데 학원비가 설령\n100이 넘는다쳐도.. 남편 실수령액이\n800만원대인데...\n100이 넘어도 저 800으로 커버가 안되겠어요.\n이건 솔직히 아내가 가계관리를 잘 못한거라고 봐야."],
        "attachment":"{\"parent_info\":{\"link\":\"youtube.com/watch?v=fztojzjO5R4\",\"title\":\"\\\"월 850만원이 생활비로\"}}",
        "is_to_topic":false,
        "domain":"youtube.com",
        "mention_type_details":2,
        "platform":7,
        "updated_at":"2025-08-19T10:36:26.039Z",
        "created_date":"2025-07-23T10:31:35Z"}

        {
        "id":"94c25dcd-3cec-52a5-a288-3db3df9bbd75",
        "link":"youtube.com/watch?v=Km_4iv5qj5A&lc=UgwIfybHdXr5YXtsJAN4AaABAg.AKzyl0Xnh5jAKzz7IJDhoG",
        "id_source":"UC1ifSsWUG241rRfK0ezYCgA",
        "id_reference":"17f39c11-9dca-5093-bb09-a8f6dccba024",
        "id_parent_comment":"68bffdb7-1f9e-508b-b38c-2066ae2f75d7",
        "views":0,
        "likes":0,
        "comments":0,
        "shares":0,
        "rating_score":0,
        "engagement_total":0,
        "engagement_s_c":0,
        "identity":"UC5cRekspGofSLz8G9mEgdiw",
        "identity_name":"@_IU___",
        "mention_type":2,
        "search_text":["",
          "나이부터딴지걸고 면접시간10분내외일텐데 3문제나 저렇게물어본건 시비건게 맞죠 님말처럼 스펙이상대적으로 부족하신거같은데 다른 사람보다 뛰어난 강점이있으신가요 물어봤으면될일"],
        "attachment":"{\"parent_info\":{\"link\":\"youtube.com/watch?v=Km_4iv5qj5A\",\"title\":\"\\\"나이 많다고 하더니 욕까지 해?\\\"\"}}",
        "is_to_topic":false,
        "domain":"youtube.com",
        "mention_type_details":2,
        "platform":7,
        "updated_at":"2025-08-20T04:18:20.552Z",
        "created_date":"2025-07-25T07:50:44Z"}


Hiện tại cũng cần phải check cho các case:
Comment góc bị xóa
Comment không tồn tại 

### Luồng crawl detail

// Căn bản thì luồng này mình đã check rồi

Chỉ cần check là nó có lưu thêm vào Redis là được (Nhưng cần confirm với Huy là đã merge bản fix mới nhất của anh Tấn)

node services.js
node scripts/articlesV3WithNextCrawlTime/crawlYoutubeDetails.js

- Nếu mà ban đầu status là 1 -> 4 (Ban đầu reset từ 4 thành 1)
- Nếu mà ban đầu status là 2 -> DONE
- Nếu mà ban đầu status là 3 -> DONE  

-> Load từ mongo (Đối status của article từ 1 -> 4) -> Crawl detail -> Nếu có mention thì insert xuống mention , đồng thời update status bằng 2 (Còn lại thì sẽ update status bằng 1 hoặc 3 -> vẫn update xuống mongo ) 



-> Load từ mySQL -> Đi crawl -> Push vào queue cl.news.article_urls -> Rồi mới insert xuống Solr

forever start services.js - (Chỗ này lúc nào cũng phải chạy trước)
node scripts/articlesV3/search_crisis_keywords_youtube_search_bar.js


//Data sau khi chạy

[
  {
    "id": "UC1UOiZd3Scgarj5Da5-79wA",
    "fullname": "Fitrider X",
    "platform": 7,
    "link": "youtube.com/channel/UC1UOiZd3Scgarj5Da5-79wA",
    "id_social": "UC1UOiZd3Scgarj5Da5-79wA",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  },
  {
    "id": "UCyWlOrOHS6DHtRM5zKd5rXw",
    "fullname": "Học Tiếng Anh Cho Bé",
    "platform": 7,
    "link": "youtube.com/channel/UCyWlOrOHS6DHtRM5zKd5rXw",
    "id_social": "UCyWlOrOHS6DHtRM5zKd5rXw",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  },
  {
    "id": "UCKAPlZw0AOTMZWWGBplFebQ",
    "fullname": "Bảo Sting",
    "platform": 7,
    "link": "youtube.com/channel/UCKAPlZw0AOTMZWWGBplFebQ",
    "id_social": "UCKAPlZw0AOTMZWWGBplFebQ",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  },
  {
    "id": "UCaPJ_3h8fdBupcOTdvrAaCA",
    "fullname": "Farhan Khan official",
    "platform": 7,
    "link": "youtube.com/channel/UCaPJ_3h8fdBupcOTdvrAaCA",
    "id_social": "UCaPJ_3h8fdBupcOTdvrAaCA",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  },
  {
    "id": "UCb_9VTNnBLh1osp6lnRtiiQ",
    "fullname": "Semicenkdünyamolmuş",
    "platform": 7,
    "link": "youtube.com/channel/UCb_9VTNnBLh1osp6lnRtiiQ",
    "id_social": "UCb_9VTNnBLh1osp6lnRtiiQ",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  },
  {
    "id": "UC0hURbH0XaJNjHZXuPfXSpg",
    "fullname": "Ngoài đường piste",
    "platform": 7,
    "link": "youtube.com/channel/UC0hURbH0XaJNjHZXuPfXSpg",
    "id_social": "UC0hURbH0XaJNjHZXuPfXSpg",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  },
  {
    "id": "UCDBMjSGj6Lwpe0HyS6_lL2A",
    "fullname": "Trường Tiểu học Minh Đạo",
    "platform": 7,
    "link": "youtube.com/channel/UCDBMjSGj6Lwpe0HyS6_lL2A",
    "id_social": "UCDBMjSGj6Lwpe0HyS6_lL2A",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  },
  {
    "id": "UCQ21V9-3BB18RmhA-uy4h3A",
    "fullname": "VŨ SƯ QUẾ ANH HÁT VỌNG CỔ",
    "platform": 7,
    "link": "youtube.com/channel/UCQ21V9-3BB18RmhA-uy4h3A",
    "id_social": "UCQ21V9-3BB18RmhA-uy4h3A",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  },
  {
    "id": "UCO-7WyqiIDi8Cg9-05JsCkQ",
    "fullname": "Suti Kids TV",
    "platform": 7,
    "link": "youtube.com/channel/UCO-7WyqiIDi8Cg9-05JsCkQ",
    "id_social": "UCO-7WyqiIDi8Cg9-05JsCkQ",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  },
  {
    "id": "UCrI4iNMPZ2vT_G-TqRO6yrw",
    "fullname": "VTV Thể Thao",
    "platform": 7,
    "link": "youtube.com/channel/UCrI4iNMPZ2vT_G-TqRO6yrw",
    "id_social": "UCrI4iNMPZ2vT_G-TqRO6yrw",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  },
  {
    "id": "UCoX3xxHIdAdOMmsca29VDTg",
    "fullname": "Nhung Kim",
    "platform": 7,
    "link": "youtube.com/channel/UCoX3xxHIdAdOMmsca29VDTg",
    "id_social": "UCoX3xxHIdAdOMmsca29VDTg",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  },
  {
    "id": "UCW3UHrBAdGZ-ehfqQJY7xtQ",
    "fullname": "Dòng Sông Phẳng Lặng",
    "platform": 7,
    "link": "youtube.com/channel/UCW3UHrBAdGZ-ehfqQJY7xtQ",
    "id_social": "UCW3UHrBAdGZ-ehfqQJY7xtQ",
    "created_date": "2025-08-19T10:44:06.275Z",
    "domain": "youtube.com"
  }
]


// Data ở Redis:
{
    "id": "UCeyn-iB-aWiNFii2wghgJFQ",
    "fullname": "fan guột của em xinh",
    "platform": 7,
    "link": "youtube.com/channel/UCeyn-iB-aWiNFii2wghgJFQ",
    "id_social": "UCeyn-iB-aWiNFii2wghgJFQ",
    "created_date": "2025-08-20T02:50:31.843Z",
    "domain": "youtube.com"
}


{
    "id": "UCeyn-iB-aWiNFii2wghgJFQ",
    "fullname": "fan guột của em xinh",
    "platform": 7,
    "link": "youtube.com/channel/UCeyn-iB-aWiNFii2wghgJFQ",
    "id_social": "UCeyn-iB-aWiNFii2wghgJFQ",
    "created_date": "2025-08-20T02:50:31.843Z",
    "domain": "youtube.com"
}

// Data ở mention:
{
        "id":"5d44d3b9-925f-5136-88bc-27b5b641556f",
        "link":"https://www.youtube.com/watch?v=4eWLTWL1U94",
        "id_source":"UCeyn-iB-aWiNFii2wghgJFQ",
        "views":4,
        "likes":0,
        "comments":0,
        "shares":0,
        "rating_score":0,
        "engagement_total":0,
        "engagement_s_c":0,
        "identity":"UCeyn-iB-aWiNFii2wghgJFQ",
        "identity_name":"fan guột của em xinh",
        "mention_type":1,
        "title":"19 tháng 8, 2025",
        "search_text":["19 tháng 8, 2025",
          "19 tháng 8, 2025<br> <br>"],
        "attachment":"{\"media_src\":\"https://i.ytimg.com/vi/4eWLTWL1U94/hqdefault.jpg\"}",
        "is_to_topic":false,
        "domain":"youtube.com",
        "mention_type_details":1,
        "platform":7,
        "updated_at":"2025-08-20T02:50:30.419Z",
        "created_date":"2025-08-19T10:06:11Z"
}



 {
        "id":"cd9cb519-07e9-5b22-b674-12d6f4c2bb3c",
        "link":"https://www.youtube.com/watch?v=z2Pi8LO3iDk",
        "id_source":"UCrmsVrq4GAxkhYg4PHnIlNg",
        "views":48,
        "likes":1,
        "comments":0,
        "shares":0,
        "rating_score":0,
        "engagement_total":1,
        "engagement_s_c":0,
        "identity":"UCrmsVrq4GAxkhYg4PHnIlNg",
        "identity_name":"NDT Moto Du Lịch",
        "mention_type":1,
        "title":"35 Thái Lan Ẩm Thực Hải Sản Đường Phố Pattaya Đường Sai Song RD",
        "search_text":["35 Thái Lan Ẩm Thực Hải Sản Đường Phố Pattaya Đường Sai Song RD",
          "35 Thái Lan Ẩm Thực Hải Sản Đường Phố Pattaya Đường Sai Song RD<br> <br>"],
        "attachment":"{\"media_src\":\"https://i.ytimg.com/vi/z2Pi8LO3iDk/hqdefault.jpg\"}",
        "is_to_topic":false,
        "domain":"youtube.com",
        "mention_type_details":1,
        "platform":7,
        "updated_at":"2025-08-20T02:50:30.418Z",
        "created_date":"2025-08-19T10:25:43Z"}

// Data ở identity:


   {
        "id":"UCb_9VTNnBLh1osp6lnRtiiQ",
        "reply_next_crawl_time":"2025-08-19T10:59:06.590Z",
        "next_crawl_time":"2025-08-19T10:59:06.590Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCb_9VTNnBLh1osp6lnRtiiQ",
        "platform":7,
        "updated_at":"2025-08-19T10:44:06.590Z",
        "id_social":"UCb_9VTNnBLh1osp6lnRtiiQ",
        "fullname":"Semicenkdünyamolmuş",
        "created_date":"2025-08-19T10:44:06.275Z",
        "repost_next_crawl_time":"2025-08-19T10:59:06.590Z"
}



{
        "id":"UCrmsVrq4GAxkhYg4PHnIlNg",
        "reply_next_crawl_time":"2025-08-20T03:05:32.434Z",
        "next_crawl_time":"2025-08-20T03:05:32.434Z",
        "domain":"youtube.com",
        "link":"youtube.com/channel/UCrmsVrq4GAxkhYg4PHnIlNg",
        "platform":7,
        "updated_at":"2025-08-20T02:50:32.434Z",
        "id_social":"UCrmsVrq4GAxkhYg4PHnIlNg",
        "fullname":"NDT Moto Du Lịch",
        "created_date":"2025-08-20T02:50:31.843Z",
        "repost_next_crawl_time":"2025-08-20T03:05:32.434Z"}


// Data ở Youtube posts


 {
        "id":"5d44d3b9-925f-5136-88bc-27b5b641556f",
        "id_source":"UCeyn-iB-aWiNFii2wghgJFQ",
        "id_social":"4eWLTWL1U94",
        "title":"19 tháng 8, 2025",
        "priority":1,
        "created_date":"2025-08-19T10:06:11Z",
        "crawled_date":"2025-08-20T02:50:30.470Z",
        "next_crawl_time":"2025-08-20T03:05:30.470Z"
  }



  {
        "id":"cd9cb519-07e9-5b22-b674-12d6f4c2bb3c",
        "id_source":"UCrmsVrq4GAxkhYg4PHnIlNg",
        "id_social":"z2Pi8LO3iDk",
        "title":"35 Thái Lan Ẩm Thực",
        "priority":1,
        "created_date":"2025-08-19T10:25:43Z",
        "crawled_date":"2025-08-20T02:50:30.470Z",
        "next_crawl_time":"2025-08-20T03:05:30.470Z"}

// Data ở article_urls

 {
        "id":"5d44d3b9-925f-5136-88bc-27b5b641556f",
        "platform":7,
        "id_category":"0",
        "id_source":"youtube.com",
        "link":"https://www.youtube.com/watch?v=4eWLTWL1U94",
        "title":"19 tháng 8, 2025",
        "views_avg":0,
        "priority":1,
        "status":2,
        "failed_type":1,
        "count_failed":1,
        "crawled_date":"2025-08-20T02:50:31.843Z",
        "next_crawl_time":"2025-08-19T11:43:46.871Z",
        "created_date":"2025-08-19T10:42:37.893Z",
        "parse_type":2,
        "_version_":1840941086122442752
}


{
        "id":"cd9cb519-07e9-5b22-b674-12d6f4c2bb3c",
        "platform":7,
        "id_category":"0",
        "id_source":"youtube.com",
        "link":"https://www.youtube.com/watch?v=z2Pi8LO3iDk",
        "title":"35 Thái Lan Ẩm Thực Hải Sản Đường Phố Pattaya Đường Sai Song RD",
        "views_avg":0,
        "priority":1,
        "status":2,
        "failed_type":1,
        "count_failed":1,
        "crawled_date":"2025-08-20T02:50:31.843Z",
        "next_crawl_time":"2025-08-19T11:43:47.946Z",
        "created_date":"2025-08-19T10:42:37.895Z",
        "parse_type":2,
        "_version_":1840941086122442752}
