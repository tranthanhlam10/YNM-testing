# Task fix pusher news của Huy


## Vấn đề


Hiện tại, logic code của Data Pusher News đang gặp vấn đề dẫn tới hiện tượng chỉ insert data vào collection article_urls và Redis, còn 2 collection article_titles và article_crawling thì bị bỏ qua.

## Scope

+ Khi insert data vào collection article_urls thì logic code check new records đang không đúng, mô phỏng lại quá trình bị sai như sau:

Step 1: Insert data có giá trị là [A, B, C] (Với A và C là data mới chưa tồn tại trong hệ thống) vào collection article_urls và response sau khi insert vào collection article_urls lúc này là [ "0": A, "2": C ]

Step 2: Nhưng logic lấy new article url đang dựa vào index của mảng thay vì key của response dẫn tới giá trị của new article url là [A, B].


## Hướng giải quyết

Hiện Huy sẽ fix để lấy key của response


## Cách chạy


ynmpdp-5822-
YNMPDP-5822-ver-2


kubectl get pods -n crawler-staging | grep ynmpdp-5822-
kubectl exec -it ynmpdp-5755-testing-ynm-crawler-empty-8546cd4bf8-cx2bw -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh


- Deployment gốc
ynm-cl-data-pusher-news-service-staging


- Pusher

export LOG_LEVEL=debug

export ARTICLE_2_MONGO_ARTICLE_PUSHER_ENABLE=true

export MONGO_NEWS_ENABLE=true
export MONGO_NEWS_AUTH_SOURCE="ynm_crawler_staging"
export MONGO_NEWS_DATABASE="ynm_crawler_staging"
export MONGO_NEWS_REPLICA_SET="rs0"

yarn start --scope=@ynm/cl-data-pusher-service


parsed_detail_output|(testing|staging|production).cl.mentions_2_solr_mentions$|(testing|staging|production).cl.news.(article_urls_from_crisis_keyword|article_posts$|article_crawled_reviews$|article_urls$|monitor_sources$)|cl.news.(http.|browser.)?posts_from_keyword_url|cl.news.article_urls_LamTT

-- News keyword crawler


export NODE_ENV=staging
    
export HTTP_PORT=9988
export GRPC_PORT=9011
  
export GOT_SCRAPING_SERVICE_TIMEOUT=45000
export GOT_SCRAPING_SERVICE_MAX_RETRIES=3
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.3_keyword.crisis-crawler
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_from_crisis_keyword_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_TOKEN_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=NewsArticleUrlFromCrisisKeywordCrawlingLoader
export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=12months
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=1
export CRAWLER_CONFIG_PRIORITY_LIMIT=3
  
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=false
      
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=10
export CRAWLER_ENABLE=true
     
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_ENABLE=true
  
export LOG_LEVEL=debug
  
export RABBIT_HEARTBEAT=10
  
export GOOGLE_SEARCH_CONFIG_TYPE_OF_SEARCH=all
  
yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service



ynm-cl-news-crisis-keyword-


{
  "article_urls": [
    {
      "id": "01492b2a-1fa1-5009-b0b8-adceafc61474",
      "platform": 3,
      "id_category": "0",
      "id_source": "vn.investing.com",
      "link": "https://vn.investing.com/news/stock-market-news/prudential-tang-co-phan-trong-cong-ty-bao-hiem-malaysia-len-70-93CH-2517136",
      "title": "Investing.com Việt NamPrudential tăng cổ phần trong công ty bảo hiểm Malaysia lên 70%Investing.com -- Prudential plc hôm thứ Năm cho biết công ty đã đồng ý tăng tỷ lệ sở hữu tại Prudential Assurance Malaysia Berhad (PAMB) lên 70% bằng cách....23 hours ago",
      "views_avg": 0,
      "priority": 1,
      "status": 1,
      "failed_type": 1,
      "count_failed": 0,
      "crawled_date": "1970-01-01T00:00:00.000Z",
      "createdBy": "NewsArticleUrlFromCrisisKeywordCrawlingLoader"
    },
    {
      "id": "1382c209-f4b1-5fca-a81e-00439e17a488",
      "platform": 3,
      "id_category": "0",
      "id_source": "baotintuc.vn",
      "link": "https://baotintuc.vn/the-gioi/ba-tap-doan-lon-thu-hoi-sua-cong-thuc-vi-nguy-co-nhiem-doc-to-20260123005227639.htm",
      "title": "baotintuc.vnBa tập đoàn lớn thu hồi sữa công thức vì nguy cơ nhiễm độc tốNestlé, Danone và Lactalis đang tiến hành thu hồi quy mô lớn các sản phẩm sữa công thức dành cho trẻ sơ sinh trên toàn cầu..8 hours ago",
      "views_avg": 0,
      "priority": 1,
      "status": 1,
      "failed_type": 1,
      "count_failed": 0,
      "crawled_date": "1970-01-01T00:00:00.000Z",
      "createdBy": "NewsArticleUrlFromCrisisKeywordCrawlingLoader"
    },
    {
      "id": "56e19411-55af-5643-93d3-9e26abbd17af",
      "platform": 3,
      "id_category": "0",
      "id_source": "vietnambiz.vn",
      "link": "https://vietnambiz.vn/tung-thach-thuc-coca-cola-pepsi-mot-ong-lon-nganh-giai-khat-viet-nay-phai-chat-vat-de-ton-tai-202612293811780.htm",
      "title": "VietnamBizTừng thách thức Coca-Cola, Pepsi, một ông lớn ngành giải khát Việt nay phải chật vật để sinh tồnChìm trong chuỗi thua lỗ 20 quý liên tiếp cùng áp lực nợ vay đáo hạn, biểu tượng..1 day ago",
      "views_avg": 0,
      "priority": 1,
      "status": 1,
      "failed_type": 1,
      "count_failed": 0,
      "crawled_date": "1970-01-01T00:00:00.000Z",
      "createdBy": "NewsArticleUrlFromCrisisKeywordCrawlingLoader"
    }
  ]
}




reddit.com_I'm visiting the Twilight Highlands for the first time as a Dracthyr... the ...
reddit.com_Canada: German TKMS and Korean Hanwah identified as possible ...
reddit.com_Kristian Jack interviewing Zorhan Bassong, Ralph Priso and Shola ...
reddit.com_Sáng đá bát phở thịt CP, trưa đớp hộp hạ long,tối về làm đĩa giá ...
reddit.com_Hỡi các anh em ai đã và đang bị trĩ : r/vozforums
reddit.com_[AFTN] Jesse Marsch is using Ralph Priso as a CB : r/whitecapsfc



{
  "_id": {
    "$in": [
      UUID("5925dfdc-3663-5cb4-b078-65d791931876"),
      UUID("a572b790-95e0-5536-a0a3-e3d636f728ec"),
      UUID("44c14d72-f79f-5512-a8f8-2413c1eef98a"),
      UUID("2779209b-303f-5218-b66f-060ea5a6ab34"),
      UUID("3a652b54-409b-54b4-8c90-efc155510de5"),
      UUID("308bbe5e-6689-5573-85f3-651fc2160cbf"),
    ]
  }
}


