// web comment

export HTTP_PORT=9013
export GRPC_PORT=9011

export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658

export MYSQL_DEFAULT_CONNECTION_HOST="192.168.1.108"
export MYSQL_DEFAULT_CONNECTION_PORT=3306
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders

export MYSQL_NEWS_APP_HOST="192.168.1.108"
export MYSQL_NEWS_APP_CONNECTION_PORT=3306
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master

export PAGE_WEB_COMMENT_CRAWLING_LOADER_CYCLE="* */12 * * *"
export PAGE_WEB_COMMENT_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=1
export PAGE_WEB_COMMENT_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export PAGE_WEB_COMMENT_CRAWLING_LOADER_LIMIT=1000
export PAGE_WEB_COMMENT_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export PAGE_WEB_COMMENT_CRAWLING_LOADER_ENABLE=true
export PAGE_WEB_COMMENT_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.page_web_comments_crawling_sources_LamTT

export REDIS_MAX_RETRIES_PER_REQUEST=null

yarn testing:loader


export HTTP_PORT=9014
export FB_GRAPH_SERVICE_ENDPOINT=https://www.facebook.com/api
export FB_GRAPH_SERVICE_TIMEOUT=5000

 
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=null
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=null
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.page_web_comments_crawling_sources_LamTT
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.page_web_comments_crawling_requests_LamTT
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.2.*.comments-web
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source_LamTT
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.page_web_comments_crawled_sources_LamTT
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.fb.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.2.*.comments-web.next_page
  
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_PAGE_WEB_COMMENT_CRAWLER
  
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=10
   
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=5
   
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=10
  
yarn testing:web-comment


// web reply

export HTTP_PORT=9015
export FB_GRAPH_SERVICE_ENDPOINT=https://www.facebook.com/api
export FB_GRAPH_SERVICE_TIMEOUT=5000

  
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.*.page-reply-comments
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.page_web_reply_comments_crawling_sources_LamTT
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.page_web_reply_comments_crawling_requests_LamTT
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.2.*.comments-web-reply
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source_LamTT
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.page_web_reply_comments_crawled_sources_LamTT
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.fb.resolved_source_LamTT
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.2.*.comments-web-reply.next_page
  
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
  
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_PAGE_WEB_COMMENT_CRAWLER
  
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
   
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=5
   
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
  
yarn testing:web-comment


// Task crawl comment hoặc reply của facebook từ page 


// Phần loader của comment 
{
    "fields": ["id", "platform"],
    "filter": {
        "created_date": "[NOW-30DAYS TO *]",
        "source_type": 2,
        "-last_status": (4 5)
    }
}

// Những lưu ý cần nắm
- Nếu như bài post chưa có comment_last_date -> crawl hết comment của bài post đó, sau sau đó lưu thời gian của comment đầu tiên (Chỗ này phải confirm với Đồng xem nso có phải comment mới nhất hay không, hoặc thời gian reply của comment đầu tiên) 
- Nếu như bài post đã có comment_last_date -> Cứ crawl thời gian sau thời gian comment last_date đã lưu ở trên 
(Tương tự trong trường hợp của reply)


- Ở phần crawler, thì đơn giản nó chỉ consume từ builder thôi, nó sẽ build tất cả các thông tin cần thiết để đi crawl
- Tiếp theo là nó kiểm tra coi đây có phải là trang đầu tiên hay không, nếu không phải trang đầu thì tới bước ... 






// Các config của luồng crawl, câu lệnh chạy cũng như những thứ liên quan 
FB_PAGE_WEB_COMMENT_CRAWLER
PageWebCommentCrawlingLoader



// Câu lệnh tìm kiếm queue của bản thân 
.*fb\.page_web_comments.*LamTT.*


.*(fb\.page_web_comments|page_web_reply_comments).*LamTT.*

// Mốt biết thêm vài queue nữa 



id id_social source_type id_source title created_date crawled_date comment_updated_at next_crawl_time total_new_comment comment_last_date

//crawling loader 
PAGE_WEB_COMMENT_CRAWLING_LOADER


ynmpdp-4838-page-web-comment-testing-ynm-crawler-empty
namespace=crawler-testing


kubectl get pods -n crawler-testing | grep page-web-comment
kubectl exec -it ynmpdp-4838-page-web-comment-testing-ynm-crawler-empty-f467csrr -n crawler-testing -- sh

ynmpdp-4838-page-web-comment-testing-ynm-crawler-empty-f467csrr


"last_data_date": "2024-04-10T08:23:45.231Z", // Theo phân tích thì last_data_date là thời gian được
      "from_date": "1712737425",
      "to_date": "1744273425",




 // Các lỗi cần phải để ý 
 - Hiện tại proxy type thì ở Proxy manager đã nhận rồi, nhưng ở luồng crawl thì không nhận được proxy đó -> Hiện tại Đồng đã fix chỗ đó, chỉ là do không log ra thôi 
 - 


// Các cases đã check cho comment last date 


(.*(fb\.page_web_comments|page_web_reply_comments).*LamTT.*)|(cl\.(mentions_2_solr_mentions|profile_2_solr_identities|profile_2_redis_identities|fb_posts_finished_sources))

(.*(fb\.page_web_comments|page_web_reply_comments).*LamTT.*)|(cl\.(mentions_2_solr_mentions|profiles_2_solr_identities|profiles_2_redis_identities|fb_posts_finished_sources))


(.*(fb\.page_web_comments|page_web_reply_comments).*LamTT.*)|(cl\.(mentions_2_solr_mentions|profiles_2_solr_identities|profiles_2_redis_identities|fb_posts_finished_sources))



20250201,20250202,20250203,20250204,20250205,20250206,20250207,20250208,20250209,20250210,...
20250201,20250202,20250203,20250204,20250205,20250206,20250207,20250208,20250209,20250210,20250211,20250212,20250213,20250214,20250215,20250216,20250217,20250218,20250219,20250220,20250221,20250222,20250223,20250224,20250225,20250226,20250227,20250228,20250301,20250302,20250303,20250304,20250305,20250306,20250307,20250308,20250309,20250310,20250311,20250312,20250313,20250314,20250315,20250316,20250317,20250318,20250319,20250320,20250321,20250322,20250323,20250324,20250325,20250326,20250327,20250328,20250329,20250330,20250331,20250401,20250402,20250403,20250404,20250405,20250406,20250407,20250408,20250409,20250410,20250411,20250412,20250413,20250414,20250415,20250416,20250417,20250418,20250419,20250420,20250421,20250422,20250423  





// Những field cần lưu ý ở fb_post
comment_last_date : comment / replies mối nhất của post đó
comment_updated_at:  post được đi crawl ở thời gian nào 
Cập nhật lại last-status nếu post đó bị xóa.




// Note thêm phần mention type của facebook 

MENTION TYPE:
{
    POST:                   1
    COMMENT:        2
    SHARE:                3
}

MENTION TYPE DETAIL:

{

    POST:                   1

    COMMENT:        2

    SHARE:                3

    FORUM:              4

    NEWS:                 5

    BLOG:                  6

    REVIEWS:           7

    ECOM:                 8

    YOUTUBE:          9

    INSTAGRAM:     10

    TIKTOK:              11

}

MENTION TYPE DETAIL sẽ dựa vào bảng trên mysql để mapping với mention type: https://pma.datatrend.io/sql.php?server=1&db=monitoring_crawl&table=monitor_sources&pos=0

3. Các field như link_shared, link_shared_domain, share_id cách lưu như thế nào? Có format lưu không? Có dùng lại với share_id như bên facebook không? 
(Ví dụ các trường hợp từng bắt bug thì threads có cách xử lý như nào https://wiki.younetco.com/pages/viewpage.action?pageId=27989136)



4. Field shares sẽ được tính như thế nào? (Threads có 3 cách shares là repost, quote, shares)

5. Các field trong attachment sẽ được lưu như thế nào đối với photo, video, audio, gif ? (Threads sẽ trả nhiều link video với kích thước video khác nhau)

6. Các trường hợp nếu như bài share thì đối với function nào trên threard được coi là bài share (repost, quote, )




Câu query ở mentions:
platform: 1
mention_type: 2
id_reference: f0ed62d4-f432-5c14-8ba3-93d07cfbd2b5

id_parent_comment: [* TO *]


http://graph.facebook.com/pfbid02BYnzGuenbUCbFPMwQBADVLK34yg6wK4DsjbLMW4xBMg3RmkHhYcF5QiXcfhUYCcrl&access_token=1


- Crawl post không tồn tại đang bị lỗi 



- Message pushed to Loader queue cl.fb.page_web_comments_crawling_sources
- Cursor in ymn.crawling_loaders was set (!= "*")
- Id post h



11h20p -> Chạy lần đầu, xem thử khi nào thì dừng script 





ynm-cl-fb-page-web-cmt-service
ynm-cl-fb-page-web-reply-cmt-service



// Những deployment đã deploy cho task comment facebook 

ynm-cl-fb-page-web-cmt-service
ynm-cl-fb-page-web-reply-cmt-service


PAGE_WEB_COMMENT_CRAWLING_LOADER_ENABLE

(.*(fb\.page_web_comments|page_web_reply_comments).*)|(cl\.(mentions_2_solr_mentions|profiles_2_solr_identities|profiles_2_redis_identities|fb_posts_finished_sources))