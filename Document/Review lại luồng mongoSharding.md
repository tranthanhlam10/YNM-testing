# Mongo


1) News Data pusher: ynm-cl-data-pusher-news-service-staging
Deployment:
+ ynm-cl-data-pusher-service-staging
+ ynm-cl-data-pusher-news-service-staging
Input:
+ Queue: staging.cl.news.article_urls
Output:
+ Mongo: articles

- Những điều cần check lại
+ Thử cases transaction nó sẽ comsume nhiều message hay là lấy từng message đi
+ Kiểm tra xem các giá trị được lưu vào 3 collection có đúng k (id, ngày tạo, ngày crawl)
+ Kiểm tra nếu lỗi thì transaction này sẽ xử lý như thế nào



- Cách đơn giản để query tho UUID
{"_id": UUID("f673a12c-1c5c-5b22-a4ba-22483df14b54")}





2) News Crawling Loader: ynm-cl-news-crawling-loader-service-staging -> Chỗ  này có thay đổi là Huy sửa load hết các source đầy đủ
Deployment:
+ ynm-cl-news-crawling-loader-service-staging
Input:
+ Mongo: articles
Output:
+ Queue: high_priority_detail_url_info/normal_priority_detail_url_info/crisis_detail_url_info (Bật stateful set auto-parser-staging-high-priority-classifier/auto-parser-staging-normal-priority-classifier/auto-parser-staging-crisis-classifier để đẩy qua luồng auto parser)

+ Câu regex tìm kiếm queue
high_priority_detail_url_info|normal_priority_detail_url_info|crisis_detail_url_info 



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






3) News Source Updater: ynm-cl-news-source-updater-service-staging
Deployment:
+ ynm-cl-news-source-updater-service-staging
Input:
+ Queue: article_titles
Output:
+ Mongo: articles

-> Hình như chỗ này chỉ cập nhật ngày crawl và status


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





6) Youtube Crawl Search Bar: crawler-staging-youtube-search-crisis-keywords-search-bar
Deployment:
+ crawler-staging-youtube-search-crisis-keywords-search-bar
+ crawler-staging-youtube-search-brand-campain-keywords-search-bar
Input:
+ MySQL: monitor_keywords_v2
Output:
+ Queue: staging.cl.news.article_urls








7) Youtube Crawl Detail: crawler-staging-youtube-crawl-detail
Deployment:
+ crawler-staging-youtube-crawl-detail-crisis
+ crawler-staging-youtube-crawl-detail
Input:
+ Mongo: articles
Output:
+ Solr: mentions/youtube_posts/identities
+ Redis: identities


-> Phần 6-7 này phải chạy được là được