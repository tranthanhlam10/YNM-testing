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
kubectl exec -it ynmpdp-5324-staging-crawler-empty-container-849c774b98-n26s6 -n crawler-staging -- sh
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
Hiện tại chỗ này đang thiếu field priority

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
- Kiểm tra xem có push vào queue crawled source khi crawl xong hay không 
- Kiểm tra xem có đẩy identity lên Redis sau khi crawl hay không
- Kiểm tra xem có push vào mention ssd/hdd hay không -> Chưa pass
    Hiện tại đang lưu sai idenntity name
- Kiểm tra value ở youtube comments/ identity / Redis 
- Compare output




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