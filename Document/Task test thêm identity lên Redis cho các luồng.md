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
kubectl exec -it youtube-ynmpdp-5133-testing-ynm-crawler-empty-7b756d979f-f2q5v -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh



### Luồng 50 top trending

-> Luồng này khá dễ nên là chạy khá nhanh




// Luồng chạy sẽ là: 

- Lấy video category 
- Gọi API lấy top trending
- Sau đó update vào các database: mentions/solr/identities/Redis

API: 

https://www.googleapis.com/youtube/v3/videos?part=contentDetails,snippet,statistics&chart=mostPopular&regionCode=VN&maxResults=50&key=<key>&videoCategoryId=<videoCategoryId>


// Script để chạy

node services.js
node scripts/youtubeV2/get_latest_top_50_trending.js





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

