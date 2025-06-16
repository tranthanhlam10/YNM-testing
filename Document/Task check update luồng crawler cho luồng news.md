# Check loader Mongo for news Loader

- Hiện tại phần wiki của Huy chưa nêu ra vấn đề cần giải quyết
- Outcome của task là sử dụng Môngo để tối lưu trữ, khi mà dữ liệu quá nhiều 


## Phần overview
- Dưạ theo cursor ở crawling_loader 
- Check tồn tại ở redis 
- Sau đó load các article_url không tồn lại ở Redis vào queue high_priority_detail_url_info/normal_priority_detail_url_info (này là load từ mongoDB)
- Sau đó load các source đó lên redis để tránh lần lặp sau 



*Phân giải các table
Các Article sẽ được lưu ở MongoDB 
Phần crawling loader chỉ có lưu cursor mà thôi
Các source load lên đi crawl chính là các monitor source
Redis thì cache và check dup các domain đẫ load lên 





## Phần data flow 
1. Sau bước load article_url lên thì lấy monitor_source của những article đó 
2. So sánh giữa article và monitor_source, nếu như article nào mà không có source được cache thì remove ra không load nữa
3. Các article trên nếu có field **current loading total > max loading total** -> push các article đó vào cache để crawl lần sau
4. Còn nêu **current loading total <= max loading total** thì lấy những article không tồn tại trong Redis
5. Push message lên các queue để đi crawl 
6. Cache lại các article trên redis để chống duplicate
7. Kiểm tra cursor, nếu cursor vẫn còn thì load article típ, còn nếu đã load xong thì chuyển thành default 


### Value của các field status trong article
IDLE = 1

SUCCESS = 2

ERROR = 3

IN_PROGRESS =4

### Value của các type trong monitor source
NEWS = 1

BLOG = 4

REVIEWS = 16

ECOM =32


### Các câu query dùng để load source trên monitor source

**HighPriorityNewsSourceCrawlingLoader**  - DONE


	
+ status = 1

+ next_crawl_time <= now

+ created_date > (now - 7 days)

+ platform = 3

+ id_category <> 0

+ priority: 1

Key redis: HighPriorityNewsDetailSourcesCrawlingLoader
crawling_loaders key: 

{
  $and: [
    { id_source: "alobacsi.com" },
    {
      id_source: {
        $nin: ["shopee.vn", "lazada.vn", "tiki.vn"]
      }
    }
  ]
}


SELECT `id`, `domain`, `name`, `type`, `max_connection`, `priority`, `state`, `pattern`, `pattern_login`, `views_avg`, `views_avg_cat`
FROM `monitor_sources`
WHERE state = 1
    AND type IN (1)
    AND priority IN (1, 2, 3)
    AND domain IN (<domains_of_loaded_articles>)




**NonCategorySourceCrawlingLoader** -> DONE



+ status = 1

+ next_crawl_time <= now

+ created_date > (now - 7 days)

+ platform = [3, 4, 5, 6]

+ id_category = 0

{
  $and: [
    {
      platform: 5,
      id_source: {
        $nin: [
          "shopee.vn",
          "lazada.vn",
          "tiki.vn"
        ]
      }
    }
  ]
}

Key redis: HighPriorityNewsDetailSourcesCrawlingLoader
crawling_loaders key: 

SELECT `id`, `domain`, `name`, `type`, `max_connection`, `priority`, `state`, `pattern`, `pattern_login`, `views_avg`, `views_avg_cat`
FROM `monitor_sources`
WHERE state = 1
    AND type IN (1, 4, 16, 32)
    AND priority IN (1, 2, 3)
    AND domain IN (<domains_of_loaded_articles>)




**BlogSourceCrawlingLoader**  - DONE 



+ status = 1

+ next_crawl_time <= now

+ created_date > (now - 7 days)

+ platform = 4

+ id_category <> 0

Key redis: HighPriorityNewsDetailSourcesCrawlingLoader
crawling_loaders key: 

SELECT `id`, `domain`, `name`, `type`, `max_connection`, `priority`, `state`, `pattern`, `pattern_login`, `views_avg`, `views_avg_cat`
FROM `monitor_sources`
WHERE state = 1
    AND type IN (4)
    AND priority IN (1, 2, 3)
    AND domain IN (<domains_of_loaded_articles>)




**EcomReviewSourceCrawlingLoader** - DONE 

	
+ status = 1

+ next_crawl_time <= now

+ created_date > (now - 7 days)

+ platform = [5, 6]

+ id_category <> 0

+ priority: 1

{
  $and: [
    { platform: 6,
      id_source: {
        $nin: ["shopee.vn", "lazada.vn", "tiki.vn"]
      }
    }
  ]
}



Key redis: 
crawling_loaders key: 

SELECT `id`, `domain`, `name`, `type`, `max_connection`, `priority`, `state`, `pattern`, `pattern_login`, `views_avg`, `views_avg_cat`
FROM `monitor_sources`
WHERE state = 1
    AND type IN (16, 32)
    AND priority IN (1, 2, 3)
    AND domain IN (<domains_of_loaded_articles>)





**NormalPriorityNewsSourceCrawlingLoader**  - DONE
+ status = 1

+ next_crawl_time <= now

+ created_date > (now - 7 days)

+ platform = 3

+ id_category <> 0

+ priority: 2

{
  $and: [
    { id_source: "alobacsi.com" },
    {
      id_source: {
        $nin: ["shopee.vn", "lazada.vn", "tiki.vn"]
      }
    }
  ]
}

Key redis: NormalPriorityNewsDetailSourcesCrawlingLoader
crawling_loaders key: NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER

SELECT `id`, `domain`, `name`, `type`, `max_connection`, `priority`, `state`, `pattern`, `pattern_login`, `views_avg`, `views_avg_cat`
FROM `monitor_sources`
WHERE state = 1
    AND type IN (1)
    AND priority IN (1, 2, 3)
    AND domain IN (<domains_of_loaded_articles>)





### Message format:
{
  "item": {
    "id": string;
    "id_category": string;
    "title": string;
    "id_source": string;
    "platform": number;
    "link": string;
    "created_date": string;
    "count_failed": number;
    "status": number;
    "views_avg": number;
    "next_crawl_time": string;
    "priority": number;
  }
}

### Các bước để chạy được script

news-ynmpdp-4981-testing-ynm-crawler-empty


kubectl config use-context lamtt-k8s-local
kubectl get pods -n crawler-testing | grep news-ynmpdp-4981-testing-ynm-crawler-empty

kubectl exec -it news-ynmpdp-4981-testing-ynm-crawler-empty-6cd9f468b9-qqp8w -n crawler-testing -- sh




- Câu lệnh chạy cho luồng data pusher 
kubectl get pods -n crawler-testing | grep news-data-pusher-process-testing-ynm-crawler-empty
kubectl exec -it news-data-pusher-process-testing-ynm-crawler-empty-7c6c968dh927 -n crawler-testing -- sh


export ARTICLE_2_MONGO_ARTICLE_PUSHER_INPUT_EXCHANGE=cl.news.resolved_data
export ARTICLE_2_MONGO_ARTICLE_PUSHER_ROUTING_KEY=cl.3.*.*.article_url
export ARTICLE_2_MONGO_ARTICLE_PUSHER_INPUT_QUEUE=cl.news.article_urls
export ARTICLE_2_MONGO_ARTICLE_PUSHER_ENABLE=true
export ARTICLE_2_MONGO_ARTICLE_PUSHER_BATCH_SIZE=100
export ARTICLE_2_MONGO_ARTICLE_PUSHER_CONCURRENCY=5
export ARTICLE_2_MONGO_ARTICLE_PUSHER_PREFETCH_MESSAGES=500
 
export ARTICLE_URL_2_SOLR_ARTICLE_URL_ENABLE=false
export MONGO_NEWS_HOST=192.168.1.108           
export MONGO_NEWS_PORT=27017
export MONGO_NEWS_USERNAME=data_tannn
export MONGO_NEWS_PASSWORD=YK7U3UapDktu865fKHa4YvHJx           
export MONGO_NEWS_DATABASE=news-testing
 
cd services/news/services/data-pusher
NODE_ENV=testing node dist/main.js




Những queue cần phải check 
high_priority_detail_url_info_LamTT|normal_priority_detail_url_info

### Câu lệnh query ở Mongo trên CLI 
show collections
db.testing.articles.findOne()
db.testing.articles.find()
db.dev.articles.find({id_source:"shopee.vn" })
db.dev.articles.find({id_source:"shopee.vn" }).count()


### Queue
high_priority_detail_url_info|normal_priority_detail_url_info|cl.news.articles_finished_sources


mongosh "mongodb://qc_lamtt:KAGuayQG25KB@192.168.1.108:27017/news-testing" (Câu lệnh kết nối mongo bằng mongosh): mongosh + connection string

For mongosh info see: https://www.mongodb.com/docs/mongodb-shell/ --- 

## Hướng check (Theo kinh nghiệm của bản thân chỉ nên test tập data )
- Làm cách nào để biết được bao nhiêu domain được load từ monitor source 
- Làm sao để biết có bao nhiêu articles được load lên    


#### Loader:

export HTTP_PORT=9990
export GRPC_PORT=9011
     
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
     
export RABBIT_HEARTBEAT=10
   
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
   
export MONGO_NEWS_DATABASE="news-testing"
export MONGO_NEWS_REPLICA_SET="rs0"
  
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true

export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true
 
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true

export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true

export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=normal_priority_detail_url_info
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=10000
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true
   
yarn dev --scope=@ynm/cl-news-crawling-loader-service

yarn start --scope=@ynm/cl-news-crawling-loader-service

#### Source Updater 

export HTTP_PORT=9980
export GRPC_PORT=9011
    
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
    
export RABBIT_HEARTBEAT=10
  
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
  
export MONGO_NEWS_DATABASE="news-testing"
export MONGO_NEWS_REPLICA_SET="rs0"
 
export REDIS_MAX_RETRIES_PER_REQUEST=null
  
export ARTICLE_TITLE_UPDATER_INPUT_QUEUE=cl.news.articles_finished_sources
export ARTICLE_TITLE_UPDATER_BATCH_SIZE=200
export ARTICLE_TITLE_UPDATER_CONCURRENCY=5
export ARTICLE_TITLE_UPDATER_PREFETCH_MESSAGES=1000
export ARTICLE_TITLE_UPDATER_ENABLE=true
  
yarn start  --scope=@ynm/cl-news-source-updater-service


### Chạy cho sources của ECI to data social

{ id_source: { $in: ["shopee.vn", "lazada.vn", "tiki.vn"] },  status: { $ne: 2 } }
-> Đây là câu query ra những PI cần phải chuyển đổi

#### Loader




export HTTP_PORT=8090

export LOG_LEVEL=debug
 
export ARTICLE_POSTS_CACHING_LOADER_CYCLE="*/10 * * * *"
export ARTICLE_POSTS_CACHING_LOADER_DATA_LOAD_BATCH_SIZE=1000
export ARTICLE_POSTS_CACHING_LOADER_ENABLE=false

export ARTICLE_URLS_UPDATING_LOADER_CYCLE="*/10 * * * *"
export ARTICLE_URLS_UPDATING_LOADER_DATA_LOAD_BATCH_SIZE=1000
export ARTICLE_URLS_UPDATING_LOADER_ENABLE=true

export PRODUCT_ITEMS_LOADER_INPUT_QUEUE="social_listening_product_items"
export PRODUCT_ITEMS_LOADER_EXCHANGE="eci_pi.to.sh"
export PRODUCT_ITEMS_LOADER_ARTICLE_POSTS_QUEUE="eci-pi-to-article-posts"
export PRODUCT_ITEMS_LOADER_MENTIONS_QUEUE="eci-pi-to-mentions"
export PRODUCT_ITEMS_LOADER_ARTICLE_URLS_QUEUE="eci-pi-to-article-urls"
export PRODUCT_ITEMS_LOADER_INPUT_BATCH_SIZE=1000
export PRODUCT_ITEMS_LOADER_INPUT_PREFETCH_MESSAGES=5000
export PRODUCT_ITEMS_LOADER_INPUT_ENABLE=true
 
export MYSQL_CONNECTION_DATABASE="ynm_crawling_loaders"
 
export MONGO_NEWS_DATABASE="news-testing"
export MONGO_NEWS_REPLICA_SET="rs0"
 
yarn start --scope=@ynm/eci-to-sh-loader-service

#### Pusher
export HTTP_PORT=8080
 
export LOG_LEVEL=debug
export HEART_BEAT=10

 
export PRODUCT_ITEMS_TO_ARTICLE_POSTS_PUSHER_INPUT_QUEUE="eci-pi-to-article-posts"
export PRODUCT_ITEMS_TO_ARTICLE_POSTS_PUSHER_BATCH_SIZE=5
export PRODUCT_ITEMS_TO_ARTICLE_POSTS_PUSHER_PREFETCH_MESSAGES=5
export PRODUCT_ITEMS_TO_ARTICLE_POSTS_PUSHER_ENABLE=false
 
export PRODUCT_ITEMS_TO_ARTICLE_URLS_PUSHER_INPUT_QUEUE="eci-pi-to-article-urls"
export PRODUCT_ITEMS_TO_ARTICLE_URLS_PUSHER_BATCH_SIZE=5
export PRODUCT_ITEMS_TO_ARTICLE_URLS_PUSHER_PREFETCH_MESSAGES=5
export PRODUCT_ITEMS_TO_ARTICLE_URLS_PUSHER_ENABLE=true
 
export PRODUCT_ITEMS_TO_MENTIONS_PUSHER_INPUT_QUEUE="eci-pi-to-mentions"
export PRODUCT_ITEMS_TO_MENTIONS_PUSHER_BATCH_SIZE=5
export PRODUCT_ITEMS_TO_MENTIONS_PUSHER_PREFETCH_MESSAGES=5
export PRODUCT_ITEMS_TO_MENTIONS_PUSHER_MIN_SHARD=20221212
export PRODUCT_ITEMS_TO_MENTIONS_PUSHER_ENABLE=false
 
export MONGO_NEWS_DATABASE="news-testing"
export MONGO_NEWS_REPLICA_SET="rs0"
 
yarn start --scope=@ynm/eci-to-sh-pusher-service



Những queue của luồng ECI
social_listening_product_items
eci-pi-to-mentions
eci-pi-to-article-urls




,{"$project":{"_id":0,"id":1,"id_source":1,"link":1}},{"$limit":1000}]


NDNjMWFkZjMtMGYwMS01NjY1LWI4OTYtNzA5MGI5NTMxNTky



### Test updater news
1. auto-parser-testing-high-priority-classifier
2. auto-parser-testing-high-priority-browser-crawler
3. auto-parser-testing-high-priority-http-crawler
4. auto-parser-testing-article-parser
5. auto-parser-testing-error-article-handler
6. ynm-cl-news-parsed-details-2-mentions-service-testing


Bước cuối không scale pod mà chạy script này:
export HTTP_PORT=9890
export LOG_LEVEL=debug


export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=parsed_detail_output
export CRAWLER_CONFIG_RESOLVED_SOURCE_QUEUE=cl.news.articles_finished_sources
export CRAWLER_CONFIG_RESOLVED_DATA_QUEUE=parsed_details_to_mentions

export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=100
export RESOLVER_ENABLE=true

yarn start --scope=@ynm/cl-news-parsed-details-2-mentions-service

### Message mẫu các luồng tmdt 
{
    "id": "shopee_16778818349",
    "title": "Điện Thoại Sharp Aqous R  -Chip 835, Ram 4GB, Bộ nhớ 64GB , Tặng Ôp Lưng,Tiếng Việt Đầy Đủ",
    "description": "Hình sản phẩm là hình mình chụp thật nhé... ➡️Máy là bản quốc tế, dùng tất cả sim việt nam,tiếng việt 100%, đang chạy trên nền tảng android 9 mới nhất ➡️Máy bảo hành 3 tháng *❤️*❤️*GIỚI THIỆU SẢN PHẨM: Sharp Aqous R *❤️*❤️* là chiếc điện thoại cao cấpMáy trang bi cấu hình rất đáng nể với chip Snapdragon 835, Kèm theo đó là màn hình IGZO 2K ☀️I:THIẾT KẾ CHẮC CHẮN, CHẤT LIỆU CAO CẤP sharp aqous r có thiết kế đơn giản giống các điện thoại trên thị trường.Chất liệu gia công hàng nhật luôn rất tốt..sharp aqous r cũng vậy khi khung máy được làm từ hợp kim Aluminum không gỉ -các cạnh máy được gia công trau truốt tỉ mỉ, bo cong mềm mại tạo nên sự sang trọng và khả năng cầm nắm rất tốt -mặt màn hình vát cong 2.5d, mặt trước là nút home cảm ứng lực tích hợp vân tay 1 chạm thế hệ mới cực nhạy ☀️II:MÀN HÌNH 2K TẦN SỐ 120 GHZ CỰC ĐẸP máy trang bị màn hình 5.3 inch, kính chống xước gorila thế hệ 4, độ phân giải lên đến 2k tần số quét được nâng lên tới 120 Hz, cao hơn gấp đôi tần số quét của hầu hết các loại điện thoại hiện nay.giúp cho hình ảnh hiển thị mượt mà và ít bị giật hơn -qua trải niệm màn hình sâu, nịnh mắt, ánh sáng cao,cho trải niệm thật sự tuyệt vời ☀️III:CẤU HÌNH CỰC KHỦNG CHIẾN MỌI GAME NẶNG -trái tim của sản phẩm là con chip tám nhân snapdragon 835 8 nhân mạnh mẽ, kèm theo ram 4GB -cùng với đó là bộ nhớ trong 64GB, hõ trợ khe cắm thẻ nhớ mở rông lên đến 256GB -Máy chiến cực kì mượt mà những game nặng như liên quân, đồ họa luôn ở mức cao nhất trên 60 fps ☀️III:CAMERA, KHẢ NĂNG CHỐNG NƯỚC, PIN, VÂN TAY 1 CHẠM ->1:CAMERA sản phẩm này được trang bị camera chính độ phân giải 22.6 MP khẩu độ F/1.9, hỗ trợ chống rung quang học OIS =>cho ra những bức ảnh có mật độ điểm ảnh cao, hình ảnh chân thực camera selfie có độ phân giải 16MP với ống kính góc rộng ->2:khả năng chống nước -máy trang bị tiêu chuẩn chống nước cao nhất ip 6*8 khách hàng có thể yên tâm sửa dụng khi trời mưa hoặc ->3:thời lượng pin -máy trang bị pin 3150 mah, màn igzo siêu tiết kiệm pin 30%, anh em có thể yên tâm sử dụng thoải mái một ngày ->4:vân tay 1 chạm",
    "link": "https://shopee.vn/i-i.768954602.16778818349",
    "created_date": "2022-07-12T00:22:50.366Z",
    "crawled_date": "2022-08-10T11:33:32.038Z",
    "source_id": "shopee.vn"
},



{"data":[{"id":"5487b7f2-2b13-5932-8002-bc78325edb18","platform":3,"link":"https://kinhtechungkhoan.vn/kiem-toan-nha-nuoc-du-kien-thuc-hien-16-cuoc-kiem-toan-trong-nam-2023-154487.html","title":"Kiểm toán Nhà nước dự kiến thực hiện 16 cuộc kiểm toán trong năm 2023","id_source":"kinhtechungkhoan.vn","crawled_date":{"set":"2025-05-23T09:32:55.493Z"},"status":{"set":"2"}}]}



{"data":[{"id":"0863d1cb-92d5-5add-b44d-31e5ab387325","platform":4,"link":"http://soha.vn/gan-1-trieu-nguoi-xem-gil-le-xoa-lung-xoai-non-thi-ra-day-la-ly-do-khien-hot-girl-2k2-me-tit-198250213085655181.htm","title":"Gần 1 triệu người xem Gil Lê xoa lưng Xoài Non: Thì ra đây là lý do khiến hot girl 2K2 mê tít!","id_source":"soha.vn","crawled_date":{"set":"2025-05-23T10:04:20.175Z"},"status":{"set":"2"}}]}



{"data":[{"id":"43e9cb1d-684f-5dfd-8bc5-4b29ffef2ae4","platform":4,"link":"http://soha.vn/cach-gui-tin-nhan-tu-dong-xoa-gui-thong-bao-khi-nguoi-nhan-chup-man-hinh-tin-nhan-tren-zalo-messenger-19825021314533723.htm","title":"Cách gửi tin nhắn tự động xoá, gửi thông báo khi người nhận 'chụp màn hình' tin nhắn trên Zalo, Messenger","id_source":"soha.vn","crawled_date":{"set":"2025-05-23T10:40:28.208Z"},"status":{"set":"2"}}]}



{
  "item": {
    "id": "3be8a2dc-e584-5780-a690-af034846d7b6",
    "id_category": "294732",
    "title": "Ngành công nghiệp quốc phòng Việt Nam ký kết nhiều hợp đồng, tổng giá trị hơn 286 triệu USD",
    "id_source": "soha.vn",
    "platform": 4,
    "link": "https://soha.vn/nganh-cong-nghiep-quoc-phong-viet-nam-ky-ket-nhieu-hop-dong-tong-gia-tri-hon-286-trieu-usd-198241222185029093.htm",
    "created_date": "2025-05-20T09:01:16.381Z",
    "count_failed": 0,
    "status": 1,
    "views_avg": 0,
    "next_crawl_time": "2025-05-20T09:01:16.381Z",
    "priority": 10,
    "createdBy": "BlogDetailSourcesCrawlingLoader"
  }
}


{
  $and: [
    { 
    
      id_source: {
        $nin: [
          "shopee.vn",
          "lazada.vn",
          "tiki.vn"
        ]
      }
    }
  ]
}



{
"custom_id": "shopee_16778818349",
"custom_link": "https://shopee.vn/i-i.768954602.16778818349",
"custom_source_id": "shopee.vn",
"id": "shopee_16778818349",
"source_id": "shopee.vn",
"link": "https://shopee.vn/i-i.768954602.16778818349",
"title": "Điện Thoại Sharp Aqous R -Chip 835, Ram 4GB, Bộ nhớ 64GB , Tặng Ôp Lưng,Tiếng Việt Đầy Đủ",
"description": "Hình sản phẩm là hình mình chụp thật nhé... ➡️Máy là bản quốc tế, dùng tất cả sim việt nam,tiếng việt 100%, đang chạy trên nền tảng android 9 mới nhất ➡️Máy bảo hành 3 tháng *❤️*❤️*GIỚI THIỆU SẢN PHẨM: Sharp Aqous R *❤️*❤️* là chiếc điện thoại cao cấpMáy trang bi cấu hình rất đáng nể với chip Snapdragon 835, Kèm theo đó là màn hình IGZO 2K ☀️I:THIẾT KẾ CHẮC CHẮN, CHẤT LIỆU CAO CẤP sharp aqous r có thiết kế đơn giản giống các điện thoại trên thị trường.Chất liệu gia công hàng nhật luôn rất tốt..sharp aqous r cũng vậy khi khung máy được làm từ hợp kim Aluminum không gỉ -các cạnh máy được gia công trau truốt tỉ mỉ, bo cong mềm mại tạo nên sự sang trọng và khả năng cầm nắm rất tốt -mặt màn hình vát cong 2.5d, mặt trước là nút home cảm ứng lực tích hợp vân tay 1 chạm thế hệ mới cực nhạy ☀️II:MÀN HÌNH 2K TẦN SỐ 120 GHZ CỰC ĐẸP máy trang bị màn hình 5.3 inch, kính chống xước gorila thế hệ 4, độ phân giải lên đến 2k tần số quét được nâng lên tới 120 Hz, cao hơn gấp đôi tần số quét của hầu hết các loại điện thoại hiện nay.giúp cho hình ảnh hiển thị mượt mà và ít bị giật hơn -qua trải niệm màn hình sâu, nịnh mắt, ánh sáng cao,cho trải niệm thật sự tuyệt vời ☀️III:CẤU HÌNH CỰC KHỦNG CHIẾN MỌI GAME NẶNG -trái tim của sản phẩm là con chip tám nhân snapdragon 835 8 nhân mạnh mẽ, kèm theo ram 4GB -cùng với đó là bộ nhớ trong 64GB, hõ trợ khe cắm thẻ nhớ mở rông lên đến 256GB -Máy chiến cực kì mượt mà những game nặng như liên quân, đồ họa luôn ở mức cao nhất trên 60 fps ☀️III:CAMERA, KHẢ NĂNG CHỐNG NƯỚC, PIN, VÂN TAY 1 CHẠM ->1:CAMERA sản phẩm này được trang bị camera chính độ phân giải 22.6 MP khẩu độ F/1.9, hỗ trợ chống rung quang học OIS =>cho ra những bức ảnh có mật độ điểm ảnh cao, hình ảnh chân thực camera selfie có độ phân giải 16MP với ống kính góc rộng ->2:khả năng chống nước -máy trang bị tiêu chuẩn chống nước cao nhất ip 6*8 khách hàng có thể yên tâm sửa dụng khi trời mưa hoặc ->3:thời lượng pin -máy trang bị pin 3150 mah, màn igzo siêu tiết kiệm pin 30%, anh em có thể yên tâm sử dụng thoải mái một ngày ->4:vân tay 1 chạm",
"crawled_date": "2025-05-10T11:33:32.038Z",
"created_date": "2025-05-12T00:22:50.366Z"
}


### Luồng cần check thêm 

kubectl config use-context lamtt-k8s-local
kubectl get pods -n crawler-testing | grep news-ynmpdp-4981-old-testing-crawler-empty-container
kubectl exec -it news-ynmpdp-4981-old-testing-crawler-empty-container-7db8dzwl6z -n crawler-testing -- sh

Deployment: news-ynmpdp-4981-old-testing-crawler-empty-container

1) Search Article Url From Keyword By Search Bar: node scripts/articlesV3/search_crisis_keywords_youtube_search_bar.js
-> Load từ mySQL -> Đi crawl -> Push vào queue cl.news.article_urls -> Luồng anh Tấn mới insert xuống 

-> forever start services.js

-> Case này crawl xong hỏi Huy, tại sao ở article_url thì nhiều, nhưng mà lúc insert xuống thì hơi ít **(Chỗ này hơi tricky 1 xíu)**

Để test được case này phải Xóa Redis -> Xóa a


kubectl get pods -n crawler-testing | grep news-data-pusher-process-testing-ynm-crawler-
kubectl exec -it news-data-pusher-process-testing-ynm-crawler-empty-655558777w6l -n crawler-testing -- sh




export ARTICLE_2_MONGO_ARTICLE_PUSHER_INPUT_EXCHANGE=cl.news.resolved_data
export ARTICLE_2_MONGO_ARTICLE_PUSHER_ROUTING_KEY=cl.3.*.*.article_url
export ARTICLE_2_MONGO_ARTICLE_PUSHER_INPUT_QUEUE=cl.news.article_urls
export ARTICLE_2_MONGO_ARTICLE_PUSHER_ENABLE=true
export ARTICLE_2_MONGO_ARTICLE_PUSHER_BATCH_SIZE=100
export ARTICLE_2_MONGO_ARTICLE_PUSHER_CONCURRENCY=5
export ARTICLE_2_MONGO_ARTICLE_PUSHER_PREFETCH_MESSAGES=500
export TIMEOUT=0
 
export ARTICLE_URL_2_SOLR_ARTICLE_URL_ENABLE=false
export MONGO_NEWS_HOST=192.168.1.108           
export MONGO_NEWS_PORT=27017
export MONGO_NEWS_USERNAME=data_tannn
export MONGO_NEWS_PASSWORD=YK7U3UapDktu865fKHa4YvHJx           
export MONGO_NEWS_DATABASE=news-testing
 
cd services/news/services/data-pusher
NODE_ENV=testing node dist/main.js



2) Crawl Detail Of Youtube Post: node scripts/articlesV3WithNextCrawlTime/crawlYoutubeDetails.js
- Nếu mà ban đầu status là 1 -> 4 (Ban đầu reset từ 4 thành 1)
- Nếu mà ban đầu status là 2 -> DONE
- Nếu mà ban đầu status là 3 -> DONE  

-> Load từ mongo (Đối status của article từ 1 -> 4) -> Crawl detail -> Nếu có mention thì insert xuống mention , đồng thời update status bằng 2 (Còn lại thì sẽ update status bằng 1 hoặc 3 -> vẫn update xuống mongo ) 




### Khúc này là lúc updater -> Nhưng mà cần phải check lại hết các queue trên 
Queue của source updater: testing.(cl.news.articles_finished_sources) -> Chỉ check thằng này 

Queue của data pusher+ updater: testing.(cl.posts_2_solr_news_posts|cl.reviews_2_solr_news_reviews|cl.mentions_2_solr_mentions)|testing.(cl.news.articles_finished_sources)
Queue của luồng auto parser: high_priority_detail_url_info|normal_priority_detail_url_info|ynm.auto_parser|parsed_output   -> Không quan tâm




high_priority_detail_url_info|normal_priority_detail_url_info|cl.news.articles_finished_sources

Chạy những cái này trong cùng 1 pod
#### Script @ynm/cl-news-parsed-details-2-mentions-service:


export HTTP_PORT=9890
export LOG_LEVEL=debug

export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source

export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=parsed_detail_output
export CRAWLER_CONFIG_RESOLVED_SOURCE_QUEUE=cl.news.articles_finished_sources
export CRAWLER_CONFIG_RESOLVED_DATA_QUEUE=parsed_details_to_mentions

export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=100
export RESOLVER_LIMITED_DATE="10 * 12 * 30 * 24 * 60 * 60 * 1000"
export RESOLVER_ENABLE=true

yarn start --scope=@ynm/cl-news-parsed-details-2-mentions-service


#### Script @ynm/cl-news-source-updater-service

export HTTP_PORT=9900
export LOG_LEVEL=debug

export ARTICLE_TITLE_UPDATER_INPUT_EXCHANGE=cl.resolved_source
export ARTICLE_TITLE_UPDATER_ROUTING_KEY=cl.3.articles
export ARTICLE_TITLE_UPDATER_INPUT_QUEUE=cl.news.articles_finished_sources
export ARTICLE_TITLE_UPDATER_ENABLE=true

export MONGO_NEWS_DATABASE=news-testing
export MONGO_NEWS_REPLICA_SET=rs0

yarn start --scope=@ynm/cl-news-source-updater-service


#### Script @ynm/cl-news-data-pusher-service

export HTTP_PORT=9800
export LOG_LEVEL=debug

export ARTICLE_POST_2_SOLR_ARTICLE_POST_INPUT_EXCHANGE=cl.resolved_data
export ARTICLE_POST_2_SOLR_ARTICLE_POST_ROUTING_KEY=cl.3.posts
export ARTICLE_POST_2_SOLR_ARTICLE_POST_INPUT_QUEUE=cl.posts_2_solr_news_posts
export ARTICLE_POST_2_SOLR_ARTICLE_POST_ENABLE=true

export ARTICLE_CRAWL_REVIEWS_2_SOLR_ARTICLE_CRAWL_REVIEWS_INPUT_EXCHANGE=cl.resolved_data
export ARTICLE_CRAWL_REVIEWS_2_SOLR_ARTICLE_CRAWL_REVIEWS_ROUTING_KEY=cl.3.reviews
export ARTICLE_CRAWL_REVIEWS_2_SOLR_ARTICLE_CRAWL_REVIEWS_INPUT_QUEUE=cl.reviews_2_solr_news_reviews
export ARTICLE_CRAWL_REVIEWS_2_SOLR_ARTICLE_CRAWL_REVIEWS_ENABLE=true

export ARTICLE_2_MONGO_ARTICLE_PUSHER_ENABLE=true

export MONGO_NEWS_DATABASE=news-testing
export MONGO_NEWS_REPLICA_SET=rs0

yarn start --scope=@ynm/cl-news-data-pusher-service



#####
Các shard của tháng 5:
20250501,20250502,20250503,20250504,20250505,20250506,20250507,20250508,20250509,20250510,20250511,20250512,20250513,20250514,20250515,20250516,20250517,20250518,20250519,20250520,20250521,20250522,20250523,20250524,20250525,20250526,20250527,20250528,20250529,20250530,20250531



{
    id: 'eba72f40-4824-5e84-be6e-98e618f3e66b',
    platform: 7,
    id_category: 0,
    id_source: 'youtube.com',
    link: 'https://www.youtube.com/watch?v=_hOJDSNUKWE',
    title: 'Vợ chồng Ngân Collagen bị CĐM soi phông bạt nhưng thiếu đầu tư #ngancollagen',
    views_avg: 0,
    priority: 1,
    status: 1,
    failed_type: 1,
    count_failed: 0,
    crawled_date: '1970-01-01T00:00:00Z'
  }

#### Những service cần bật chạy ở testing:
ynm-cl-news-crawling-loader-service-testing  -> DONE
ynm-cl-news-source-updater-service-testing -> DONE



ynm-eci-to-sh-loader-service-testing -> DONE
ynm-eci-to-sh-pusher-service-testing  -> DONE 



crawler-testing-youtube-search-crisis-keywords-search-bar -> Hiện tại crawl keyword youtube đã được crawl đúng và luuw xuống Mongo
crawler-testing-youtube-crawl-detail -> 

ynm-cl-news-article-url-crawler-service-testing -> Bật chõ này lên thì có nhiều article


db.articles.find({
  status: 1,
  next_crawl_time: { $lte: new Date() },
  created_date: { $gt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) },
  platform: 3,
  id_category: { $ne: 0 },
  priority: 1
})