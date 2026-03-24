# Task crawl bài Facebook bằng Hashtag/Keyword thông qua luồng GG Search của Khiêm

## Vấn đề

- Hiện tại đang yêu cầu thêm luồng crawl bài cho Facebook
- Tận dụng lại luồng GG search để đi crawl bài cho Facebook


## Hướng triển khai

- Đơn giản là tận dụng lại luồng GG Search
- Thêm cách search cho Facebook site:facebook.com
- Khiêm có  xử lý thêm chỗ các link facebook
- Luồng nãy sau khi crawl xong thì bỏ vào article_url


## Câu lệnh và cách chạy

1. K8s


ynmpdp-5774-testing-ynm-crawler-empty
kubectl get pods -n crawler-testing | grep ynmpdp-5774-testing-ynm-crawler-empty


ynmpdp-5774-2-testing-ynm-crawler-empty


kubectl get pods -n crawler-testing | grep ynmpdp-5774-2-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5774-2-testing-ynm-crawler-empty-64fff9b76b-8xvdv -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


2. Queue 

cl.fb.article_urls_from_keyword_crawling_sources|cl.fb.article_urls_from_keyword_crawling_requests|cl.fb.article_urls_from_keyword_crawled_sources|cl.fb.article_urls_from_keyword_crawling_sources_next_pages|cl.fb.article_urls_from_critical_keyword_crawling_sources|cl.fb.article_urls_from_critical_keyword_crawling_requests|cl.fb.article_urls_from_critical_keyword_crawled_sources|cl.fb.article_urls_from_critical_keyword_crawling_sources_next_pages|cl.fb.article_urls_from_crisis_keyword_crawling_sources|cl.fb.article_urls_from_crisis_keyword_crawling_requests|cl.fb.article_urls_from_crisis_keyword_crawled_sources|cl.fb.article_urls_from_crisis_keyword_crawling_sources_next_pages|app.socialheat.crawling.fb_post_url|app.socialheat.crawl_keyword.results|temp.crawling.fb_post_url

3. Proxy/Token

- Proxy và token đều đang sử dụng crawler_type này:

FB_ARTICLE_URL_FROM_KEYWORD_CRAWLER


// Những crawler_type cũ khi chạy cho Huy

NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_CRAWLER



4. Lệnh chạy script

- Token



export HTTP_PORT=9020
export GRPC_PORT=9021
 
yarn start --scope @ynm/token-manager-service

- Proxy


export HTTP_PORT=9010
export GRPC_PORT=9011
 
yarn start --scope @ynm/proxy-manager-service



- Keyword:

export NODE_ENV=testing
#export HTTP_PORT=9997
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
#export REDIS_DB=3
#export REDIS_MAX_RETRIES_PER_REQUEST=null
  
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
   
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
    
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_BATCH_SIZE=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_IS_BATCH=false
export PAGING_ENABLE=true
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.1.keyword.crawler
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.article_urls_from_keyword_crawling_sources
 
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.article_urls_from_keyword_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.article_urls_from_keyword
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.article_urls_from_keyword_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.*.*.article_urls_from_keyword.next_page
 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=FacebookUrlFromGoogleKeywordCrawlingLoader
export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=12months
export CRAWLER_CONFIG_DEFAULT_PUBLISH_TIME=1
export CRAWLER_CONFIG_VALID_PLATFORMS='1'
export CRAWLER_CONFIG_PRIORITY_LIMIT=1000
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_ARTICLE_URL_FROM_KEYWORD_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_ARTICLE_URL_FROM_KEYWORD_CRAWLER
 
export GOT_SCRAPING_SERVICE_USE_PROXY_SAMPLE=true
export GOT_SCRAPING_SERVICE_PROXY_SAMPLE_PROXY=http://151.237.177.237:12345
export GOT_SCRAPING_SERVICE_PROXY_SAMPLE_CREDENTIAL=media2014:8983UHDk33455skdjfkj
export GOT_SCRAPING_SERVICE_USE_TOKEN_SAMPLE=true
export GOT_SCRAPING_SERVICE_TOKEN_SAMPLE_TOKEN="NID=528=KYtkdyuHUOtpRNk1807DHAwyNsE-l6gMVXkv8Tz1hByr59ImvvfFVJb9_Gb89i48mkHWpSYv7GvFGBHDZuUseouSFqfngxRj6WgA6RNuNDyEeh3x5C-JQ2TjH3dCDT0iCVBJtwoJnDM7hZ7MY0w-EVKEQgb8mFw99HZSUhXtt-KVPoIJ24706s1zWNmewJdej2wbSL1WtSqklwu8_WKziqXnBCth7-9bE3E3egffkTuUI8mrBah_lX0356LhkJOyknt1I4Yz"
 
export GOOGLE_SEARCH_CONFIG_LOCATION=""
export GOOGLE_SEARCH_CONFIG_SITES="facebook.com"
 
yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service




-----------------------------------------------------

export NODE_ENV=testing
export HTTP_PORT=9997
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
#export REDIS_DB=3
#export REDIS_MAX_RETRIES_PER_REQUEST=null
  
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
   
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
    
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_BATCH_SIZE=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_IS_BATCH=false
export PAGING_ENABLE=true
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=2
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.1___keyword.crawler
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.article_urls_from_keyword_crawling_sources
 
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.article_urls_from_keyword_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.article_urls_from_keyword
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.article_urls_from_keyword_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.*.*.article_urls_from_keyword.next_page
 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=FacebookUrlFromGoogleKeywordCrawlingLoader
export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=12months
export CRAWLER_CONFIG_DEFAULT_PUBLISH_TIME=1
export CRAWLER_CONFIG_VALID_PLATFORMS='1'
export CRAWLER_CONFIG_PRIORITY_LIMIT=1000

export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_ARTICLE_URL_FROM_KEYWORD_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_ARTICLE_URL_FROM_KEYWORD_CRAWLER
 

export GOT_SCRAPING_SERVICE_USE_PROXY_SAMPLE=false
export GOT_SCRAPING_SERVICE_USE_TOKEN_SAMPLE=false
export GOOGLE_SEARCH_CONFIG_LOCATION=""
export GOOGLE_SEARCH_CONFIG_SITES="facebook.com"
 
yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service









-----------------------------------------------------





export NODE_ENV=testing
#export HTTP_PORT=9997
export LOG_LEVEL=debug

export MYSQL_NEWS_CONNECTION_DATABASE=crawling

#export REDIS_DB=3
#export REDIS_MAX_RETRIES_PER_REQUEST=null

export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1

export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_BATCH_SIZE=1
export RESOLVER_MAX_RETRIES=3
export RESOLVER_IS_BATCH=false
export PAGING_ENABLE=true

export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.1.keyword.crawler
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.article_urls_from_keyword_crawling_sources

export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.article_urls_from_keyword_crawling_requests

export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.article_urls_from_keyword
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.article_urls_from_keyword_crawled_sources

export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.*.*.article_urls_from_keyword.next_page

export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data

export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_CREATED_BY=FacebookUrlFromGoogleKeywordCrawlingLoader
export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=12months
export CRAWLER_CONFIG_DEFAULT_PUBLISH_TIME=1
export CRAWLER_CONFIG_VALID_PLATFORMS='1'
export CRAWLER_CONFIG_PRIORITY_LIMIT=1000

export CRAWLER_PROXY_CRAWLER_TYPE=FB_ARTICLE_URL_FROM_KEYWORD_CRAWLER
export CRAWLER_TOKEN_CRAWLER_TYPE=FB_ARTICLE_URL_FROM_KEYWORD_CRAWLER

export GOT_SCRAPING_SERVICE_USE_PROXY_SAMPLE=true
export GOT_SCRAPING_SERVICE_PROXY_SAMPLE_PROXY=http://196.240.254.205:12345
export GOT_SCRAPING_SERVICE_PROXY_SAMPLE_CREDENTIAL=media2014:8983UHDk33455skdjfkj
export GOT_SCRAPING_SERVICE_USE_TOKEN_SAMPLE=true
export GOT_SCRAPING_SERVICE_TOKEN_SAMPLE_TOKEN="NID=528=RlJdbaDtraq79LR3oIyFg2hokM0LQ6Ds2rH5Qc2buwjX9k3s8RRRNP6wh_w4AY-hWzW1_oER3HuEdyh2z9F_FKwVOAYk_t7gnB28oXYgbYR0VWnqwXXXJ4I8zh-HPCOo_HbHF-kI16Jx_-DvV0UERdNUHjcrIJDzNaFPX523fJhFUn-ETuKHgIxdGTtp9ZGrlhro0GOGyeO5BsZW6PfcmtqepeyWjrLHB1tAIpEslZGWDw33iUpxLsya-V7mt_H98Im06i-9gq_EnbtxzpASyp0"
export GOOGLE_SEARCH_CONFIG_LOCATION=""
export GOOGLE_SEARCH_CONFIG_SITES="facebook.com"

yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service





- Crisis keyword:


- Critical keyword:



## Data mẫu dùng để test


{
  "id_keyword": 12345,
  "keyword": "iphone 17",
  "id_platform": 1,
  "id_process": 987,
  "is_critical": 1,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": "2025-12-01T10:20:30Z",
  "id_last_crawling": 5566,
  "tag_id": "123",
  "country": "vn"
}



{
  "id_keyword": 12345,
  "keyword": "trump",
  "id_platform": 1,
  "id_process": 987,
  "is_critical": 1,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": "2025-12-01T10:20:30Z",
  "id_last_crawling": 5566,
  "tag_id": "",
  "country": "vn"
}


{
  "id_keyword": 12345,
  "keyword": "iran",
  "id_platform": 1,
  "id_process": 987,
  "is_critical": 1,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": "2025-12-01T10:20:30Z",
  "id_last_crawling": 5566,
  "tag_id": "",
  "country": "vn"
}



{
  "id_keyword": 12345,
  "keyword": "Thỏ ơi",
  "id_platform": 1,
  "id_process": 987,
  "is_critical": 1,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": "2025-12-01T10:20:30Z",
  "id_last_crawling": 5566,
  "tag_id": "",
  "country": "vn"
}




{
  "id_keyword": 12345,
  "keyword": "Báu vật trời cho",
  "id_platform": 1,
  "id_process": 987,
  "is_critical": 1,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": "2025-12-01T10:20:30Z",
  "id_last_crawling": 5566,
  "tag_id": "",
  "country": "vn"
}



{
  "id_keyword": 12345,
  "keyword": "Messi",
  "id_platform": 1,
  "id_process": 987,
  "is_critical": 1,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": "2025-12-01T10:20:30Z",
  "id_last_crawling": 5566,
  "tag_id": "",
  "country": "vn"
}


{
  "id_keyword": 12345,
  "keyword": "Ronaldo",
  "id_platform": 1,
  "id_process": 987,
  "is_critical": 1,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": "2025-12-01T10:20:30Z",
  "id_last_crawling": 5566,
  "tag_id": "",
  "country": "vn"
}


{
  "id_keyword": 12345,
  "keyword": "Hòa Minzy",
  "id_platform": 1,
  "id_process": 987,
  "is_critical": 1,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": "2025-12-01T10:20:30Z",
  "id_last_crawling": 5566,
  "tag_id": "",
  "country": "vn"
}


{
  "id_keyword": 12345,
  "keyword": "Bạn trai Hòa Minzy",
  "id_platform": 1,
  "id_process": 987,
  "is_critical": 1,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": "2025-12-01T10:20:30Z",
  "id_last_crawling": 5566,
  "tag_id": "",
  "country": "vn"
}


{
  "id_keyword": 12345,
  "keyword": "Ronaldo",
  "id_platform": 1,
  "id_process": 987,
  "is_critical": 1,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": "2025-12-01T10:20:30Z",
  "id_last_crawling": 5566,
  "tag_id": "",
  "country": "vn"
}




## Cases


- Hiện tại chỉ bỏ 1 message đi crawl, nhưng lại finish nhiều message
- Proxy bị lỗi nhiều
- Crawl được thành công -> DONE
- Đúng format của App -> DONE
- Số total post -> Hiện tại đã đúng với yêu cầu
- Đi bao nhiêu page -> Hiện tại đang sai
- Format cho video -> DONE



### Những việc cần check ở testing:


- Cases:
+ Đã format cho link post và video -> DONE
+ Crawl nhiều page -> DONE
+ Tại sao có 1 số keyword không crawl được URL -> Đã fix



ynm-cl-fb-url-hashtag-service-testing



ynm-cl-fb-url-keyword-service-testing



ynm-cl-fb-url-crisis-hashtag-service-testing




ynm-cl-fb-url-crisis-keyword-service-testing



ynm-cl-fb-url-critical-hashtag-service-testing




ynm-cl-fb-url-critical-keyword-service-testing




- Những keyword crawl không được bài nào:

VFMVSF
c2 ngo doc
AIA VN
thtruefomula
aptaclub




{
  "id_keyword": 12345,
  "keyword": "thtruefomula",
  "id_platform": 1,
  "id_process": 987,
  "is_critical": 1,
  "crawling_type": "brand_tracking",
  "source": "graph",
  "is_first_crawl": 1,
  "last_data_date": "2025-12-01T10:20:30Z",
  "id_last_crawling": 5566,
  "tag_id": "",
  "country": "vn"
}


### Những việc cần check ở staging


- Cases:
+ Đã format cho link post và video -> DONE
+ Crawl nhiều page -> DONE
+ Tại sao có 1 số keyword không crawl được URL -> Đã fix



ynm-cl-fb-url-hashtag-service-staging


ynm-cl-fb-url-keyword-service-staging


ynm-cl-fb-url-crisis-hashtag-service-staging


ynm-cl-fb-url-crisis-keyword-service-staging


ynm-cl-fb-url-critical-hashtag-service-staging


ynm-cl-fb-url-critical-keyword-service-staging



Note: Hiện tại chỗ country_code của luồng bên App đang set country_code là VN











