# Mongo

# Tổng quan của luồng chạy


- Loader: ynm-cl-news-crawling-loader-service-staging
Chị muốn crawl loại nào chỉ cần enable loại đó:
+ BLOG_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
+ HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
+ HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true
+ NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
+ NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false

Sau khi load nó sẽ đẩy lên những queue sau đây:
high_priority_detail_url_info|normal_priority_detail_url_info|crisis_detail_url_info|cl.news.articles_finished_sources

- Crawler: ynm-cl-news-article-url-service-staging -> Chỗ này chị scale lên là nó sẽ đi crawl rồi push xuống queue cl.news.article_urls

- Pusher: ynm-cl-data-pusher-news-service-staging -> Scale deployment này sẽ chạy pusher của news, consume từ queue cl.news.article_urls

- Source Updater -> Scale deployment này để bật updater

Còn về luồng migrate thì chị chạy script được gắn với description của task này: https://jira.younetco.com/browse/YNMPDP-4994




## Chi tiết của từng services

1) News Data pusher: ynm-cl-data-pusher-news-service-staging
Deployment:
+ ynm-cl-data-pusher-service-staging
+ ynm-cl-data-pusher-news-service-staging
Input:
+ Queue: staging.cl.news.article_urls
Output:
+ Mongo: articles

- Những điều cần check lại
+ Thử cases transaction nó sẽ comsume nhiều message hay là lấy từng message đi -> DONE
+ Kiểm tra xem các giá trị được lưu vào 3 collection có đúng k (id, ngày tạo, ngày crawl) -> Hiện tại ngày tạo cũng đã chính xác với yêu cầu
+ Kiểm tra nếu lỗi thì transaction này sẽ xử lý như thế nào 



- Cách đơn giản để query tho UUID
{"_id": UUID("f673a12c-1c5c-5b22-a4ba-22483df14b54")}

Luồng crawl để  cl.news.article_urls có nhiều message: ynm-cl-news-article-url-service-staging




2) News Crawling Loader: ynm-cl-news-crawling-loader-service-staging -> Chỗ  này có thay đổi là Huy sửa load hết các source đầy đủ ->DONE

Chỗ này chỉ cần confirm lại các bug của chị Ngân nữa là đủ

Deployment:
+ ynm-cl-news-crawling-loader-service-staging
Input:
+ Mongo: articles
Output:
+ Queue: high_priority_detail_url_info/normal_priority_detail_url_info/crisis_detail_url_info (Bật stateful set auto-parser-staging-high-priority-classifier/auto-parser-staging-normal-priority-classifier/auto-parser-staging-crisis-classifier) ->  để đẩy qua luồng auto parser)

auto-parser-staging-high-priority-classifier
auto-parser-staging-normal-priority-classifier
auto-parser-staging-crisis-classifier


+ Câu regex tìm kiếm queue
high_priority_detail_url_info|normal_priority_detail_url_info|crisis_detail_url_info|cl.news.articles_finished_sources



high_priority_detail_url_info|normal_priority_detail_url_info|cl.news.articles_finished_sources

mongosh "mongodb://qc_lamtt:KAGuayQG25KB@192.168.1.108:27017/news-testing" (Câu lệnh kết nối mongo bằng mongosh): mongosh + connection string

For mongosh info see: https://www.mongodb.com/docs/mongodb-shell/ --- 

Keyword redis:
+ HighPriorityNewsSourceCrawlingLoader
Câu query:
{
  status: 1,
  next_crawl_time: { $lte: new Date() },
  created_date: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  platform: 3,
  id_category: { $ne: 0 },
  priority: 1
}



+ NonCategorySourceCrawlingLoader
Câu query:
{
  status: 1,
  next_crawl_time: { $lte: new Date() },
  created_date: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  platform: { $in: [3, 4, 5, 6] },
  id_category: 0
}



+ BlogSourceCrawlingLoader
Câu query:
{
  status: 1,
  next_crawl_time: { $lte: new Date() },
  created_date: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  platform: 4,
  id_category: { $ne: 0 }
}



+ EcomReviewSourceCrawlingLoader
Câu query:
{
  status: 1,
  next_crawl_time: { $lte: new Date() },
  created_date: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  platform: { $in: [5, 6] },
  id_category: { $ne: 0 },
  priority: 1
}







+ NormalPriorityNewsSourceCrawlingLoader
Câu query:
{
  status: 1,
  next_crawl_time: { $lte: new Date() },
  created_date: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  platform: 3,
  id_category: { $ne: 0 },
  priority: 2
}






- Những điều cần check lại
+ Format message có đúng hay không -> Hiện tại đã đúng với yêu cầu
+ Loader lên có cache lại ở Redis hay không -> Hiện tại chưa thấy thông tin ở Redis -> HIện tại đang bị lỗi
+ Điều kiện load lên có đúng hay không -> Load lên có đầy đủ hay không -> Hiện tại đang bị lỗi






3) News Source Updater: ynm-cl-news-source-updater-service-staging -> DONE
Deployment:
+ ynm-cl-news-source-updater-service-staging
Input:
+ Queue: article_titles
Output:
+ Mongo: articles

-> Hình như chỗ này chỉ cập nhật ngày crawl và status
  {
    "id": "dd369fd2-bd3d-5390-95e4-c1630447b983",
    "title": "Kỳ 3: Những dòng kênh bị \"bức tử\"",
    "crawled_date": "2025-10-24T03:49:38.353Z",
    "status": 2,
    "createdBy": "HighPriorityNewsDetailSourcesCrawlingLoader"
  }



4) Eci To Socialheat Loader: ynm-eci-to-sh-loader-service-staging
Deployment:
+ ynm-eci-to-sh-loader-service-staging
Input:
+ Solr: article_urls
+ Mongo: articles

Điều kiện đi crawl:
 filter: {
      "id_source": "(shopee.vn lazada.vn tiki.vn)"
    }
    sorters: [
      {
        "name": "id",
        "order": "asc"
      }
    ]
    fields: [
      "link",
      "id_source"
    ]



5) Eci To Socialheat Pusher: ynm-eci-to-sh-pusher-service-staging
Deployment:
+ ynm-eci-to-sh-pusher-service-staging
Input:
+ Queue: eci-pi-to-article-urls
Output:
+ Mongo: articles


-> 2 phần 4 và 5 này chỉ cần check lại bug chỗ ECI, phải đập xuống hết 3 collections
Hiện tại thì thấy đã đạp xuống 3 collection, nhưng mà cần phải validate lại các fields xem lưu đúng chưa

+ Message mẫu:
{
"custom_id": "shopee_16778818349",
"custom_link": "https://shopee.vn/i-i.768954602.16778818349",
"custom_source_id": "shopee.vn",
"id": "shopee_16778818349",
"source_id": "shopee.vn",
"link": "https://shopee.vn/i-i.768954602.16778818349",
"title": "Điện Thoại Sharp Aqous R -Chip 835, Ram 4GB, Bộ nhớ 64GB , Tặng Ôp Lưng,Tiếng Việt Đầy Đủ",
"description": "Hình sản phẩm là hình mình chụp thật nhé... ➡️Máy là bản quốc tế, dùng tất cả sim việt nam,tiếng việt 100%, đang chạy trên nền tảng android 9 mới nhất ➡️Máy bảo hành 3 tháng *❤️*❤️*GIỚI THIỆU SẢN PHẨM: Sharp Aqous R *❤️*❤️* là chiếc điện thoại cao cấpMáy trang bi cấu hình rất đáng nể với chip Snapdragon 835, Kèm theo đó là màn hình IGZO 2K ☀️I:THIẾT KẾ CHẮC CHẮN, CHẤT LIỆU CAO CẤP sharp aqous r có thiết kế đơn giản giống các điện thoại trên thị trường.Chất liệu gia công hàng nhật luôn rất tốt..sharp aqous r cũng vậy khi khung máy được làm từ hợp kim Aluminum không gỉ -các cạnh máy được gia công trau truốt tỉ mỉ, bo cong mềm mại tạo nên sự sang trọng và khả năng cầm nắm rất tốt -mặt màn hình vát cong 2.5d, mặt trước là nút home cảm ứng lực tích hợp vân tay 1 chạm thế hệ mới cực nhạy ☀️II:MÀN HÌNH 2K TẦN SỐ 120 GHZ CỰC ĐẸP máy trang bị màn hình 5.3 inch, kính chống xước gorila thế hệ 4, độ phân giải lên đến 2k tần số quét được nâng lên tới 120 Hz, cao hơn gấp đôi tần số quét của hầu hết các loại điện thoại hiện nay.giúp cho hình ảnh hiển thị mượt mà và ít bị giật hơn -qua trải niệm màn hình sâu, nịnh mắt, ánh sáng cao,cho trải niệm thật sự tuyệt vời ☀️III:CẤU HÌNH CỰC KHỦNG CHIẾN MỌI GAME NẶNG -trái tim của sản phẩm là con chip tám nhân snapdragon 835 8 nhân mạnh mẽ, kèm theo ram 4GB -cùng với đó là bộ nhớ trong 64GB, hõ trợ khe cắm thẻ nhớ mở rông lên đến 256GB -Máy chiến cực kì mượt mà những game nặng như liên quân, đồ họa luôn ở mức cao nhất trên 60 fps ☀️III:CAMERA, KHẢ NĂNG CHỐNG NƯỚC, PIN, VÂN TAY 1 CHẠM ->1:CAMERA sản phẩm này được trang bị camera chính độ phân giải 22.6 MP khẩu độ F/1.9, hỗ trợ chống rung quang học OIS =>cho ra những bức ảnh có mật độ điểm ảnh cao, hình ảnh chân thực camera selfie có độ phân giải 16MP với ống kính góc rộng ->2:khả năng chống nước -máy trang bị tiêu chuẩn chống nước cao nhất ip 6*8 khách hàng có thể yên tâm sửa dụng khi trời mưa hoặc ->3:thời lượng pin -máy trang bị pin 3150 mah, màn igzo siêu tiết kiệm pin 30%, anh em có thể yên tâm sử dụng thoải mái một ngày ->4:vân tay 1 chạm",
"crawled_date": "2022-08-10T11:33:32.038Z",
"created_date": "2022-07-12T00:22:50.366Z"
}



social_listening_product_items|eci-pi-to-article-posts|eci-pi-to-mentions|eci-pi-to-article-urls





6) Youtube Crawl Search Bar: crawler-staging-youtube-search-crisis-keywords-search-bar -> DONE
Deployment:
+ crawler-staging-youtube-search-crisis-keywords-search-bar
+ crawler-staging-youtube-search-brand-campain-keywords-search-bar
Input:
+ MySQL: monitor_keywords_v2
Output:
+ Queue: staging.cl.news.article_urls

- Hiện tại luồng Youtube search bar khi crawl đã đẩy được mesage lên queue staging.cl.news.article_urls
{
  "id": "4650dee9-3d9e-5325-b47c-fc57cb7a13a4",
  "platform": 7,
  "id_category": 0,
  "id_source": "youtube.com",
  "link": "https://www.youtube.com/watch?v=dOnYmd_wA5Q",
  "title": "Nâng mức giảm trừ gia cảnh: Hàng triệu gia đình có thêm khoản chi tiêu",
  "views_avg": 0,
  "priority": 1,
  "status": 1,
  "failed_type": 1,
  "count_failed": 0,
  "crawled_date": "1970-01-01T00:00:00Z",
  "createdBy": "YoutubeSearchBarCrawlingLoader"
}





7) Youtube Crawl Detail: crawler-staging-youtube-crawl-detail -> DONE
Deployment:
+ crawler-staging-youtube-crawl-detail-crisis
+ crawler-staging-youtube-crawl-detail
Input:
+ Mongo: articles
Output:
+ Solr: mentions/youtube_posts/identities
+ Redis: identities

- Phần này load từ article-> đi crawl mentions, sau đó update xuống mention và youtube_posts

{
  "_id": "UUID('1a4888c8-9bb6-5acc-a3a8-67fadca31af8')",
  "count_failed": 1,
  "crawled_date": "2025-10-24T07:51:05.000+00:00",
  "created_date": "2025-10-23T09:21:55.150+00:00",
  "error_codes": [
    1
  ],
  "failed_type": 1,
  "id_category": "0",
  "id_source": "youtube.com",
  "link": "https://www.youtube.com/watch?v=XdF0h4skkIY",
  "next_crawl_time": "2025-10-24T08:51:05.604+00:00",
  "platform": 7,
  "priority": 1,
  "status": 1,
  "title": "Tiktok | (cre:tịtok) #duet #xuhuongyoutube #nzaa #xuhướng #thinhhanh",
  "views_avg": 0,
  "parse_type": 2
}




-> Phần 6-7 này phải chạy được là được



## Tổng hợp những thông tin:
- Loader: 
1. Deployment

ynm-cl-news-crawling-loader-service-staging
Chị muốn crawl loại nào chỉ cần enable loại đó:
+ BLOG_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
+ HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
+ HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true
+ NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
+ NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false

2. Luồng chạy 
Load các message từ collection articles ở mongo lên các queue 
high_priority_detail_url_info|normal_priority_detail_url_info

- Đi crawl detail
1. Deployment

Sau khi load lên được các queue ở loader thì bật các deployment/stateful set sau:
auto-parser-testing-high-priority-classifier (bật chỗ này là được)
auto-parser-testing-high-priority-browser-crawler
auto-parser-testing-high-priority-http-crawler (bật chỗ này là được)
auto-parser-testing-article-parser (bật chỗ này là được)
auto-parser-testing-error-article-handler
ynm-cl-news-parsed-details-2-mentions-service-testing (bật chỗ này là đc)

2. Luồng chạy 
Luồng crawl detail sẽ consume các message từ các queue loader, sau đó xử lý và đẩy xuống queue:

+ ynm.auto_parser.high_priority_article_urls_crawled_by_http_crawler (do service auto-parser-testing-high-priority-classifier xử lý)
+ Sau đó khi bật auto-parser-testing-high-priority-http-crawler thì sẽ push message xuốgn queue ynm.auto_parser.raw_article_contents
+ Tiếp tục thì bật service auto-parser-testing-article-parser để phân rã data raw và push xuống queue parsed_detail_output
+ Cuối cùng khi bật luồng ynm-cl-news-parsed-details-2-mentions-service-testing thì sẽ đẩy qua các queue sau:


article_titles
cl.news.article_posts
cl.news.article_crawl_reviews
parsed_details_to_mentions

- Source Updater:
1. Deployment
ynm-cl-news-source-updater-service-testing

2. Luồng chạy 
Consume từ queue article_titles sau đó update xuống collection articles ở mongo 


- Đi crawl link

Detail nằm ở wiki này: https://wiki.younetco.com/display/FB/%5BNews%5D%5BNew+Crawler%5D+Process+Of+Crawling+Article+Urls+By+First+Page

Tóm gọi lại là sẽ load các cate lên đi crawl, sau khi qua các queue:
cl.news.article_urls_crawling_sources 
cl.news.article_urls_crawling_requests
cl.news.article_urls_crawled_sources

Sau khi crawl xong sẽ push vào queue cl.news.article_urls


- Pusher: 
ynm-cl-data-pusher-news-service-staging  
Scale deployment này sẽ chạy pusher của news, consume từ queue cl.news.article_urls

