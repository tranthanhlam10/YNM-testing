# Task check hotfix luồng youtube trên staging 

## Thông tin cơ bản cần nắm

Câu query ở Youtube
SELECT * FROM `monitor_keywords_v2` WHERE platform = "YOUTUBE" ORDER BY `monitor_keywords_v2`.`id` DESC

// Câu lệnh update status để clear những data thừa
UPDATE `monitor_keywords_v2` SET status = 'DONE' WHERE platform = 'YOUTUBE'


### Hiện trạng trước khi fix

Không load được keyword, hashtag -> Chỗ này có thể check được dễ dàng, chỉ cần có 1 bộ keyword hashtag -> Sau đó contriol bằng bộ keyword hashtag của mình là được -> **Fixed**

Improve filter date 1 ngày -> Chỗ này cần phải confirm lại -> Hướng giải quyết như thế nào -> Kiểm tra keyword Crisis crawl 1 giờ, các keyword khác thì 1 ngày 

Fix next page ? Khi mà sử lý xong first -page thì chạy như nào -> Chỗ này cũng phải confirm lại -> Hướng giải quyết như thế nào -> Next page has total links: 0 with nextPageInformation: true




Deployment staging : 

kubectl config use-context lamtt-k8s-ovh
hotfix-youtube-filter-1d-next-page-staging-crawler-empty-container

kubectl get pods -n crawler-staging | grep hotfix-youtube-filter-1d-next-page-staging

kubectl exec -it hotfix-youtube-filter-1d-next-page-staging-crawler-empty-cgpbzh -n crawler-staging -- sh



// Thông tin được lấy cũ từ task Youtube của Huy trên testing
1) Search Article Url From Keyword By Search Bar:   ->  Hiện tại chỗ này đã done
-> Load từ mySQL -> Đi crawl -> Push vào queue cl.news.article_urls -> Rồi mới insert xuống Solr

forever start services.js - (Chỗ này lúc nào cũng phải chạy trước)
node scripts/articlesV3/search_crisis_keywords_youtube_search_bar.js




UPDATE monitor_keyword_v2
SET status = 'DONE'
WHERE platform = 'YOUTUBE' AND status = 'IDLE';


UPDATE `monitor_keywords_v2`
SET status = 'DONE'
WHERE platform = 'YOUTUBE';




2) Crawl Detail Of Youtube Post: 

node services.js
node scripts/articlesV3WithNextCrawlTime/crawlYoutubeDetails.js

- Nếu mà ban đầu status là 1 -> 4 (Ban đầu reset từ 4 thành 1)
- Nếu mà ban đầu status là 2 -> DONE
- Nếu mà ban đầu status là 3 -> DONE  

-> Load từ mongo (Đối status của article từ 1 -> 4) -> Crawl detail -> Nếu có mention thì insert xuống mention , đồng thời update status bằng 2 (Còn lại thì sẽ update status bằng 1 hoặc 3 -> vẫn update xuống mongo ) 




curl 'https://www.youtube.com/results?search_query=M%E1%BB%B9%20M%E1%BB%B9&sp=CAISBAgBEAE%253D' \
  -x http://media2014:8983UHDk33455skdjfkj@50.2.38.104:12345 \
  -H 'authority: www.youtube.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'sec-ch-ua: " Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'upgrade-insecure-requests: 1' \
  -H 'accept-language: en-US,en;q=0.8,vi;q=0.6,co;q=0.4' \
  -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' \
  -H 'service-worker-navigation-preload: true' \
  -H 'sec-fetch-site: none' \
  -H 'sec-fetch-mode: navigate' \
  -H 'sec-fetch-user: ?1' \
  -H 'sec-fetch-dest: document' \
  -H 'cookie: GPS=1; YSC=raDJu7dgOI4; VISITOR_INFO1_LIVE=os4M1Cx7I_k; PREF=tz=Asia.Saigon' \
  -L



-youtube-search-crisis-keywords-search-bar -
-youtube-crawl-detail ->

- Hiện tại đang bị thiếu identity, id_source ở mentions/sai id_source, identity ở Articles_post khi chạy luồng crawl detail
=> Nguyên nhân khi detect -> Code ở pattern cũ không lấy được các field đó ở HTML response -> Đẫ đến mis match (Luồng pattern cũ)

+ identity cho mention
+ id_social, id_channel cho article_posts
và đẩy thêm vào youtube_posts

https://wiki.younetco.com/display/FB/Crawl+Youtube+Detail -> Wiki cho luồng crawl detail


### Những cases hiện tại cần phải check lại



- Kiểm tra crawl detail từ search bar có đủ không (Ví dụ có 100 urls, thì có crawl đủ k)
platform: 7
status: 1
next_crawl_time: [* TO NOW ]
sort: next_crawl_time asc , id asc
limit: 1000


- Kiểm tra lại schema của mentions
- Kiểm tra lại schema của artcle post
- Kiểm tra lại schema ở Youtube post


- Kiểm tra lại các field identity, id_source, identity name ở Solr khi chạy luồng crawl detail
- Kiểm tra lại field id_social, id channel ở article post
- Kiểm tra record đẩy vào Youtube_post


- Kiểm tra nếu 1 url bị lỗi content -> Có lưu vào monitor error log không



shards=20250101,20250102,20250103,20250104,20250105,20250106,20250107,20250108,20250109,20250110,20250111,20250112,20250113,20250114,20250115,20250116,20250117,20250118,20250119,20250120,20250121,20250122,20250123,20250124,20250125,20250126,20250127,20250128,20250129,20250130,20250131,20250201,20250202,20250203,20250204,20250205,20250206,20250207,20250208,20250209,20250210,20250211,20250212,20250213,20250214,20250215,20250216,20250217,20250218,20250219,20250220,20250221,20250222,20250223,20250224,20250225,20250226,20250227,20250228,20250301,20250302,20250303,20250304,20250305,20250306,20250307,20250308,20250309,20250310,20250311,20250312,20250313,20250314,20250315,20250316,20250317,20250318,20250319,20250320,20250321,20250322,20250323,20250324,20250325,20250326,20250327,20250328,20250329,20250330,20250331,20250401,20250402,20250403,20250404,20250405,20250406,20250407,20250408,20250409,20250410,20250411,20250412,20250413,20250414,20250415,20250416,20250417,20250418,20250419,20250420,20250421,20250422,20250423,20250424,20250425,20250426,20250427,20250428,20250429,20250430,20250501,20250502,20250503,20250504,20250505,20250506,20250507,20250508,20250509,20250510,20250511,20250512,20250513,20250514,20250515,20250516,20250517,20250518,20250519,20250520,20250521,20250522,20250523,20250524,20250525,20250526,20250527,20250528,20250529,20250530,20250531,20250601,20250602,20250603,20250604,20250605,20250606,20250607,20250608,20250609,20250610,20250611,20250612,20250613,20250614,20250615,20250616,20250617,20250618,20250619,20250620,20250621,20250622,20250623,20250624,20250625,20250626,20250627,20250628,20250629,20250630,20250701,20250702,20250703,20250704,20250705,20250706,20250707,20250708,20250709,20250710,20250711,20250712,20250713,20250714,20250715,20250716,20250717,20250718,20250719,20250720,20250721,20250722,20250723,20250724




- Hiện tại cần điều tra search text -> Hiện tại đã build đúng

- Hiện tại sao attachment không lấy được
- Những cái khác thì ok 




// Schema article post
id
id_category
id_social
title
id_source
id_channel
updated_date
platform
shard
link
status
state
count_failed
curr_page
options
published_date
last_have_data_date
end_page
state_reach
reach_updated_date
views_count
views_lasted
likes_count
likes_lasted
shares_count
shares_lasted
comments_count
next_time_crawl



// Schema Youtube_post
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



// Những value cần lưu ý sau khi đẩy bản hotfix task Youtube


Youtube_posts
{
        "id":"359b3cfd-aa28-5305-96ce-08ba7b41da92",
        "id_source":"UC7xBrvlrk5QbrEUTYGbYTrw",
        "id_social":"h3lngymwVag",
        "title":"CHỜ BAO LÂU REMIX l",
        "priority":1,
        "created_date":"2025-07-23T02:27:54Z",
        "crawled_date":"2025-07-25T04:56:17.365Z",
        "next_crawl_time":"2025-07-25T05:11:17.365Z"
}

- Field id_social sẽ lấy theo những kí tự cuối của link
- Field id source chính là id channel của kênh đó
- Priority của các records được insert phải bằng 1


Article_posts
{
        "id":"359b3cfd-aa28-5305-96ce-08ba7b41da92",
        "id_category":"0",
        "id_social":"h3lngymwVag",
        "title":"CHỜ BAO LÂU REMIX l ÚT NHỊ MINO x HÀO JK | TRÍ THỨC REMIX Xuôi Dòng Theo Con Nước ... HOT TIKTOK",
        "id_source":"youtube.com",
        "platform":7,
        "link":"https://www.youtube.com/watch?v=h3lngymwVag",
        "published_date":1753237674,
        "last_have_data_date":1753419347,
        "id_channel":"UC7xBrvlrk5QbrEUTYGbYTrw",
        "curr_page":1,
        "reach_updated_date":"1970-01-01T00:00:00Z",
        "state_reach":2,
        "updated_date":0,
        "state":2,
        "status":1,
        "next_time_crawl":"2025-07-25T04:56:17.364Z"
}

- Field id_category = 0
- Field id_social sẽ lấy theo những kí tự cuối của link
- Field id_channel chính là id channel của kênh đó
- Field id_source luôn luôn là Youtube.com (Nó luôn là domain của trang được crawl về)

Mentions

{
        "id":"359b3cfd-aa28-5305-96ce-08ba7b41da92",
        "link":"https://www.youtube.com/watch?v=h3lngymwVag",
        "id_source":"UC7xBrvlrk5QbrEUTYGbYTrw",
        "views":15,
        "likes":0,
        "comments":0,
        "shares":0,
        "rating_score":0,
        "engagement_total":0,
        "engagement_s_c":0,
        "identity":"UC7xBrvlrk5QbrEUTYGbYTrw",
        "identity_name":"CAO ỐC REMIX",
        "mention_type":1,
        "title":"CHỜ BAO LÂU REMIX l ÚT NHỊ MINO x HÀO JK | TRÍ THỨC REMIX Xuôi Dòng Theo Con Nước ... HOT TIKTOK",
        "search_text":["CHỜ BAO LÂU REMIX l ÚT NHỊ MINO x HÀO JK | TRÍ THỨC REMIX Xuôi Dòng Theo Con Nước ... HOT TIKTOK",
          "CHỜ BAO LÂU REMIX l ÚT NHỊ MINO x HÀO JK | TRÍ THỨC REMIX Xuôi Dòng Theo Con Nước ... HOT TIKTOK<br> <br>"],
        "attachment":"{\"media_src\":\"https://i.ytimg.com/vi/7fSYTOe0UH8/hqdefault.jpg\"}",
        "is_to_topic":false,
        "domain":"youtube.com",
        "mention_type_details":1,
        "platform":7,
        "updated_at":"2025-07-25T04:56:17.318Z",
        "created_date":"2025-07-23T02:27:54Z"
        
}

- Field identity chính là id channel của kênh
- Field identity_name chính là tên của kênh
- Field id_source là id channel của kênh
- Field domain là domain của trang web
- Những field engagement đã lưu đúng
- Field search text được lấy theo field message và title của HTML youtube
- Field attachment thì lấy hình ảnh của video


Article_urls

 {
        "id":"2d2a764f-2a31-52e2-a06a-bab5be6d4ccc",
        "platform":7,
        "id_category":"0",
        "id_source":"youtube.com",
        "link":"https://www.youtube.com/watch?v=8ALBDBJrvEI",
        "title":"CÁ VOI 52HZ",
        "views_avg":0,
        "priority":1,
        "status":1,
        "failed_type":1,
        "count_failed":0,
        "crawled_date":"1970-01-01T00:00:00Z",
        "_version_":1838612177171251200,
        "next_crawl_time":"2025-07-25T09:53:31.193Z",
        "created_date":"2025-07-25T09:53:31.193Z"
}



- Những lưu ý quan trọng
+ 



### Những keyword cần tìm kiêm strong log:
Solr success/ failed
mentions




{
        "id":"c1abd432-86b1-526a-8c75-87b77f72cd0a",
        "link":"https://www.youtube.com/watch?v=fhB3cowVMIM",
        "id_source":"UCB1s_QHdgSZwXO2ZjCjtOMw",
        "views":240,
        "likes":9,
        "comments":3,
        "shares":0,
        "rating_score":0,
        "engagement_total":12,
        "engagement_s_c":3,
        "identity":"UCB1s_QHdgSZwXO2ZjCjtOMw",
        "identity_name":"VOV Live - Tin Tức Trong Ngày",
        "mention_type":1,
        "title":"Nhà thiết kế thời trang nổi tiếng vướng vòng lao lý \"liên quan đường dây ma túy\"! | VOV Live",
        "search_text":["Nhà thiết kế thời trang nổi tiếng vướng vòng lao lý \"liên quan đường dây ma túy\"! | VOV Live",
          "Famous fashion designer caught up in legal trouble \"related to drug ring\"! | VOV Live<br> <br>"],
        "attachment":"{\"media_src\":\"https://i.ytimg.com/vi/fhB3cowVMIM/hqdefault.jpg\"}",
        "is_to_topic":false,
        "domain":"youtube.com",
        "mention_type_details":1,
        "platform":7,
        "updated_at":"2025-07-29T03:36:11.576Z",
        "created_date":"2025-07-23T09:52:23Z"}




### Chạy lại luồng search bar trên Staging (Nguyên nhân fix là do conflict code)

hotfix-youtube-ynmpdp-5249-staging-crawler-empty-container


kubectl config use-context lamtt-k8s-ovh


kubectl get pods -n crawler-staging | grep hotfix-youtube-ynmpdp-5249-staging-crawler-empty-container


kubectl exec -it hotfix-youtube-ynmpdp-5249-staging-crawler-empty-container8tjc9 -n crawler-staging -- sh



// Nguyên tắt check luồng

Search bar load hết các keyword lên đi crawl

Crawl detail lưu được đúng mentions


1) Search Article Url From Keyword By Search Bar:  
-> Load từ mySQL -> Đi crawl -> Push vào queue cl.news.article_urls -> Rồi mới insert xuống Solr

forever start services.js - (Chỗ này lúc nào cũng phải chạy trước)
node scripts/articlesV3/search_crisis_keywords_youtube_search_bar.js




UPDATE monitor_keyword_v2
SET status = 'DONE'
WHERE platform = 'YOUTUBE' AND status = 'IDLE';


UPDATE `monitor_keywords_v2`
SET status = 'DONE'
WHERE platform = 'YOUTUBE';




2) Crawl Detail Of Youtube Post: 

node services.js
node scripts/articlesV3WithNextCrawlTime/crawlYoutubeDetails.js

- Nếu mà ban đầu status là 1 -> 4 (Ban đầu reset từ 4 thành 1)
- Nếu mà ban đầu status là 2 -> DONE
- Nếu mà ban đầu status là 3 -> DONE  

-> Load từ mongo (Đối status của article từ 1 -> 4) -> Crawl detail -> Nếu có mention thì insert xuống mention , đồng thời update status bằng 2 (Còn lại thì sẽ update status bằng 1 hoặc 3 -> vẫn update xuống mongo ) 