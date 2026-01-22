# Task thêm token cho luồng của Keyword News

## Issue

Luồng crawl keyword News trên PROD không crawl đủ bài, số lượng bài crawl được thấp hơn kỳ vọng so với thực tế Google Search.

## Mục tiêu 

Xác nhận cải tiến luồng crawl khắc phục được tình trạng thiếu bài
Đảm bảo crawl hoạt động ổn định 
Không phát sinh regression nghiêm trọng cho luồng crawl keyword News hiện tại
Scope chính (In scope)

Luồng crawl keyword News – Google Search

### Hiện tại (PROD)

Crawl bằng proxy
Không dùng token
Crawl ở mode: Tin tức (News)

### Cải tiến (Improve)

Crawl bằng proxy + token
Crawl ở mode: All

## Nội dung cần verify

1. Số lượng link crawl được
So sánh kết quả:
Trước cải tiến vs Sau cải tiến
Kỳ vọng:
Tổng số link crawl được tăng
Giảm tình trạng missing article
2. Chế độ crawl & cấu hình

## QC cần xác nhận:

Crawl thực sự chạy ở mode: All
Token được sử dụng trong quá trình crawl
Proxy vẫn được áp dụng đúng
3. Độ ổn định khi crawl
Không bị block / captcha bất thường
Crawl không fail hàng loạt
p/s: test logic sử dụng token như những luồng crawl khác và chuyển qua mode all, monitor chạy thử nghiệm để đánh giá độ ổn định, số lượng bài crawl được và tỉ lệ block token



## Chiến lược test

- Kiểm tra có crawl được thành công hay không -> Hiện tại đã crawl được thành công
- Kiểm tra có truyển token vào lúc đi crawl không -> Hiện tại có sử dụng token lúc đi crawl
- Kiểm tra có chuyển đổi đúng mode thành mode "All" không -> Hiện tại ở request đã xử dụng mode all
- Kiểm tra handle việc đánh blocked/broken token -> Hiện tại lên testing sẽ kiểm tra chỗ này
- Kiểm tra crawl có đủ bài hay không
- Kiểm tra data trả về (Số lượng đã ổn định lại chưa, verify sơ qua format - do data trả về sẽ không thay đổi so với lúc trước) -> DONE





## Cách chạy


// Câu lệnh chạy pod

ynmpdp-5776-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-5776-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5776-testing-ynm-crawler-empty-7d4cd5c77f-swd52 -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local

// Regex rabbitMQ


parsed_detail_output|(testing|staging|production).cl.mentions_2_solr_mentions$|(testing|staging|production).cl.news.(article_urls_from_crisis_keyword|article_posts$|article_crawled_reviews$|article_urls$|monitor_sources$)|cl.news.(http.|browser.)?posts_from_keyword_url|testing.cl.news.article_urls_LamTT




+ Keyword: parsed_detail_output|(testing|staging|production).cl.mentions_2_solr_mentions$|(testing|staging|production).cl.news.(article_urls_from_crisis_keyword|article_posts$|article_crawled_reviews$||article_urls$|monitor_sources$)|cl.news.(http.|browser.)?posts_from_keyword_url

+ Hashtag: parsed_detail_output|(testing|staging|production).cl.mentions_2_solr_mentions$|(testing|staging|production).cl.news.(article_urls_from_crisis_hashtag|article_posts$|article_crawled_reviews$|article_urls$|monitor_sources$)|cl.news.(http.|browser.)?posts_from_keyword_url





// Proxy và token type


NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_CRAWLER

NEWS_ARTICLE_URL_FROM_CRITICAL_KEYWORD_CRAWLER

NEWS_ARTICLE_URL_FROM_KEYWORD_CRAWLER

// Script chạy

+ Crisis

1. Hashtag

export NODE_ENV=testing
    
export HTTP_PORT=9991
export GRPC_PORT=9011
  
export GOT_SCRAPING_SERVICE_TIMEOUT=45000
export GOT_SCRAPING_SERVICE_MAX_RETRIES=3
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_from_crisis_hashtag_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.3_hashtag.crawler-crisis
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_from_crisis_hashtag_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_from_crisis_hashtag_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_hashtag
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_hashtag.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=NewsArticleUrlFromCrisisHashtagCrawlingLoader
export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=3days
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=2
export CRAWLER_CONFIG_PRIORITY_LIMIT=3
  
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true
      
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
     
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_ENABLE=true
  
export LOG_LEVEL=debug
  
export RABBIT_HEARTBEAT=10
  
export GOOGLE_SEARCH_CONFIG_TYPE_OF_SEARCH=all

export GOOGLE_SEARCH_CONFIG_ROWS=10
  
yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service



2. Keyword


export NODE_ENV=testing
    
export HTTP_PORT=9990
export GRPC_PORT=9011
  
export GOT_SCRAPING_SERVICE_TIMEOUT=45000
export GOT_SCRAPING_SERVICE_MAX_RETRIES=3
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.3_keyword.crawler-crisis
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_from_crisis_keyword_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_from_crisis_keyword_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_crisis_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=NewsArticleUrlFromCrisisKeywordCrawlingLoader
export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=3days
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=2
export CRAWLER_CONFIG_PRIORITY_LIMIT=3
  
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true
      
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
     
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_ENABLE=true
  
export LOG_LEVEL=debug
  
export RABBIT_HEARTBEAT=10
  
export GOOGLE_SEARCH_CONFIG_TYPE_OF_SEARCH=all

export GOOGLE_SEARCH_CONFIG_ROWS=10
  
yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service


+ Critical

1. Hashtag


export NODE_ENV=testing
    
export HTTP_PORT=9993
export GRPC_PORT=9011
  
export GOT_SCRAPING_SERVICE_TIMEOUT=45000
export GOT_SCRAPING_SERVICE_MAX_RETRIES=3
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_from_critical_hashtag_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.3_hashtag.crawler-crisis-critical
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_from_critical_hashtag_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_from_critical_hashtag_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_critical_hashtag
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_critical_hashtag.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRITICAL_KEYWORD_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRITICAL_KEYWORD_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=NewsArticleUrlFromCriticalHashtagCrawlingLoader
export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=3days
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=1
export CRAWLER_CONFIG_PRIORITY_LIMIT=3
  
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true
      
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
     
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_ENABLE=true
  
export LOG_LEVEL=debug
  
export RABBIT_HEARTBEAT=10
  
export GOOGLE_SEARCH_CONFIG_TYPE_OF_SEARCH=all
  
yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service


2. Keyword

export NODE_ENV=testing
    
export HTTP_PORT=9992
export GRPC_PORT=9011
  
export GOT_SCRAPING_SERVICE_TIMEOUT=45000
export GOT_SCRAPING_SERVICE_MAX_RETRIES=3
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_from_critical_keyword_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.3_keyword.crawler-crisis-critical
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_from_critical_keyword_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_from_critical_keyword_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_critical_keyword
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_critical_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRITICAL_KEYWORD_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRITICAL_KEYWORD_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=NewsArticleUrlFromCriticalKeywordCrawlingLoader
export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=3days
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=1
export CRAWLER_CONFIG_PRIORITY_LIMIT=3
  
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true
      
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
     
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_ENABLE=true
  
export LOG_LEVEL=debug
  
export RABBIT_HEARTBEAT=10
  
export GOOGLE_SEARCH_CONFIG_TYPE_OF_SEARCH=all
  
yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service



+ Non-crisis

1. Hashtag

export NODE_ENV=testing
    
export HTTP_PORT=9989
export GRPC_PORT=9011
  
export GOT_SCRAPING_SERVICE_TIMEOUT=45000
export GOT_SCRAPING_SERVICE_MAX_RETRIES=3
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_from_hashtag_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.3_hashtag.crawler
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_from_hashtag_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_from_hashtag_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_hashtag
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_hashtag.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_KEYWORD_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_KEYWORD_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=NewsArticleUrlFromHashtagCrawlingLoader
export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=12months
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=1
export CRAWLER_CONFIG_PRIORITY_LIMIT=3
  
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true
      
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
     
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_ENABLE=true
  
export LOG_LEVEL=debug
  
export RABBIT_HEARTBEAT=10
  
export GOOGLE_SEARCH_CONFIG_TYPE_OF_SEARCH=all
  
yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service


2. Keyword


export NODE_ENV=testing
    
export HTTP_PORT=9988
export GRPC_PORT=9011
  
export GOT_SCRAPING_SERVICE_TIMEOUT=45000
export GOT_SCRAPING_SERVICE_MAX_RETRIES=3
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_from_keyword_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.3_keyword.crawler
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_from_keyword_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_from_keyword_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_keyword
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls_from_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_KEYWORD_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_KEYWORD_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=NewsArticleUrlFromKeywordCrawlingLoader
export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=12months
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=1
export CRAWLER_CONFIG_PRIORITY_LIMIT=3
  
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=true
      
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
     
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_ENABLE=true
  
export LOG_LEVEL=debug
  
export RABBIT_HEARTBEAT=10
  
export GOOGLE_SEARCH_CONFIG_TYPE_OF_SEARCH=all
  
yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service



## Data mẫu

  {
    "sources": [
      {
        "id_keyword": 35564,
        "keyword": "sữa coosbaby",
        "id_platform": 3,
        "is_critical": 0,
        "id_process": 2943,
        "crawling_type": "crisis_tracking",
        "source": "graph",
        "is_first_crawl": 0,
        "id_last_crawling": 109040,
        "start_crawl_at": "2026-01-19T09:10:02.987Z",
        "total_posts": 0,
        "article_url_index": 0,
        "article_urls": [],
        "retries": 0,
        "last_data_date": "2026-01-19T07:45:00.000Z",
        "from_date": "1768808700",
        "to_date": "1768813802",
        "createdBy": "NewsArticleUrlFromCrisisKeywordCrawlingLoader",
        "crawledPages": 0
      }
    ],
    "batch": {
      "url": "https://www.google.com.vn/search?cr=countryVN&hl=en&ie=UTF-8&lr=lang_vi&num=100&oe=UTF-8&q=s%E1%BB%AFa%20coosbaby&sa=N&start=0&tbs=lr%3Alang_1vi%2Cctr%3AcountryVN%2Ccdr%3A1%2Ccd_min%3A1%2F18%2F2026",
      "headers": {}
    }
  }


## Những deployment cần check lại ở testing


- Hashtag
ynm-cl-news-crisis-hashtag-service-testing
ynm-cl-news-critical-hashtag-service-testing
ynm-cl-news-hashtag-service-testing

- Keyword

ynm-cl-news-crisis-keyword-service-testing
ynm-cl-news-critical-keyword-service-testing
ynm-cl-news-keyword-service-testing


-> Hiện tại cần check lại vấn đề performance

