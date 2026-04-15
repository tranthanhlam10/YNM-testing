# Task crawl Youtube bằng GG search của Giang


## Mô tả


- Overall flow chủ yếu mô tả quá trình đi crawl danh sách url từ các keyword được nhận từ team App. Sau đó, sẽ gửi danh sách url đã crawl được qua cho 2.2. Process "Post Crawler" để tiến hành đi crawl detail.

- Overall flow này đã được loại bỏ service Loader so với phiên bản trước.


## Vấn đề

- Hiện team Bussiness đang muốn crawl thêm bài post của Youtube
- Sử dụng GG search để tìm kiếm các bài youtube 


## Hướng triển khai


- Đơn giản là tận dụng lại luồng GG Search
- Thêm cách search cho Facebook site:(youtube.com)
- Khiêm có  xử lý thêm chỗ các link facebook
- Luồng nãy sau khi crawl xong thì bỏ vào article_url
- Hiện chỗ này khác của Khiêm là Giang sẽ không biến đổi các URL
- Hiện tại chỗ Youtube chỉ lấy video dạng watch (Không lấy video dạng short)


## Cách chạy

1. RabbitMQ

cl.yt.article_urls_from_keyword_crawling_sources|cl.yt.article_urls_from_keyword_crawling_requests|cl.yt.article_urls_from_keyword_crawled_sources|app.socialheat.crawl_keyword.results_LamTT|app.socialheat.crawling.yt_post_url_LamTT


2. K8s


ynmpdp-ytb-search-by-gg-testing


kubectl get pods -n crawler-testing | grep ynmpdp-ytb-search-by-gg-testing
kubectl exec -it ynmpdp-ytb-search-by-gg-testing-ynm-crawler-empty-8645d654xsh97 -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


3. Proxy/token

YT_ARTICLE_URL_FROM_KEYWORD_CRAWLER


4. Câu lệnh chạy script


export GOOGLE_SEARCH_CONFIG_SITES=youtube.com
export GOOGLE_SEARCH_CONFIG_TYPE_OF_SEARCH=7
export GOOGLE_SEARCH_CONFIG_LOCATION=''
export REDIS_CACHE_ENABLE=true
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.yt.article_urls_from_keyword_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.7__keyword.crawler
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.yt.article_urls_from_keyword_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.yt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.yt.article_urls_from_keyword_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.7.*.*.article_urls_from_keyword
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.7.*.*.article_urls_from_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_RESOLVED_URL_EXCHANGE=app.socialheat.crawling

export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_ARTICLE_URL_FROM_KEYWORD_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_ARTICLE_URL_FROM_KEYWORD_CRAWLER

export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=3
export CRAWLER_CONFIG_EXCLUDE_DOMAINS=apple,google,messenger,pinterest,wikipedia
export CRAWLER_CONFIG_EXCLUDE_EXTENSIONS=pdf,doc,docx,xls,xlsx,ppt,pptx,pps

export CRAWLER_CONFIG_CREATED_BY=YoutubeArticleUrlFromKeywordCrawlingLoader

export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=12months
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_PRIORITY_LIMIT=1000
export CRAWLER_CONFIG_VALID_PLATFORMS=7
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=15
export RESOLVER_ENABLE=true

export CRAWLER_CONFIG_RESOLVED_URL_EXCHANGE=app.socialheat.crawling
export CRAWLER_CONFIG_RESOLVED_URL_ROUTING_KEY=crawling.yt_post_url

yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service


5. Cases cần check ở local

Input: 
- Message ở crawling request -> DONE, hiện tại đã đúng với cú pháp/mode = videos
- Token/proxy có đi crawl được không -> Hiện tại nếu token/proxy không crawl được thì nó throw ra 0
- Số lượng bài (Total valid article urls, Total crawling article url, total unique url) -> Hiện tại nếu như Giang không biến đổi gì thì 3 chỉ số này bằng nhau



Output:
+ Đã format cho link cho video -> Chỗ này hỏi lại Giang hàm getValid Urls
+ Crawl 1 page -> Confirm lại với Giang 1 page đầu lấy được bao nhiêu video
+ Crawl nhiều page
+ Crawl có đầy đủ post hay không
+ Tại sao có 1 số keyword không crawl được URL
+ Cache lại URL -> Đã cache lại đúng UUID sau khi resolve -> DONE
+ Message gửi cho app -> Đã đúng với format -> DONE



## Data test


{
    "id_keyword": 37009,
    "keyword": "Bầu cử",
    "id_platform": 7,
    "id_process": 3058,
    "is_critical": 0,
    "is_analyze": 0,
    "crawling_type": "campaign_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "id_last_crawling": 114599,
    "tag_id": null,
    "country": "VN"
  }





  {
    "id_keyword": 37009,
    "keyword": "World cup",
    "id_platform": 7,
    "id_process": 3058,
    "is_critical": 0,
    "is_analyze": 0,
    "crawling_type": "campaign_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "id_last_crawling": 114599,
    "tag_id": null,
    "country": "VN"
  }



  {
    "id_keyword": 37009,
    "keyword": "Hoa hậu Thanh Thủy",
    "id_platform": 7,
    "id_process": 3058,
    "is_critical": 0,
    "is_analyze": 0,
    "crawling_type": "campaign_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "id_last_crawling": 114599,
    "tag_id": null,
    "country": "VN"
  }

  {
    "id_keyword": 37009,
    "keyword": "Hoa hậu Thanh Thủy",
    "id_platform": 7,
    "id_process": 3058,
    "is_critical": 0,
    "is_analyze": 0,
    "crawling_type": "campaign_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "id_last_crawling": 114599,
    "tag_id": null,
    "country": "VN"
  }


  {
    "id_keyword": 37009,
    "keyword": "Hoa hậu Tiểu Vy",
    "id_platform": 7,
    "id_process": 3058,
    "is_critical": 0,
    "is_analyze": 0,
    "crawling_type": "campaign_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "id_last_crawling": 114599,
    "tag_id": null,
    "country": "VN"
  }


  {
    "id_keyword": 37009,
    "keyword": "Hòa Minzy",
    "id_platform": 7,
    "id_process": 3058,
    "is_critical": 0,
    "is_analyze": 0,
    "crawling_type": "campaign_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "id_last_crawling": 114599,
    "tag_id": null,
    "country": "VN"
  }



    {
    "id_keyword": 37009,
    "keyword": "Blv Anh Quân",
    "id_platform": 7,
    "id_process": 3058,
    "is_critical": 0,
    "is_analyze": 0,
    "crawling_type": "campaign_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "id_last_crawling": 114599,
    "tag_id": null,
    "country": "VN"
  }


      {
    "id_keyword": 37009,
    "keyword": "Blv Mai Anh Tài",
    "id_platform": 7,
    "id_process": 3058,
    "is_critical": 0,
    "is_analyze": 0,
    "crawling_type": "campaign_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "id_last_crawling": 114599,
    "tag_id": null,
    "country": "VN"
  }

  


  https://www.google.com/search?sa=X&sca_esv=23f0f744d103c75c&rlz=1C5CHFA_enVN1065VN1065&udm=7&fbs=ADc_l-aN0CWEZBOHjofHoaMMDiKp0UJuhqwKhR0QUhF54-6jIYFfWbU_Clyew-1Wh7zkL7GXEIyGmuNECR0N8Mieh0vrmfTMXwDe3hTlp9jq84DbGimhZEFOPkJpE7ldXQsFG0Dj0-Ufs0SzVjYvsfRD_fUAXWktgW-3-UpOKhiR5QyzWlu-ZjTDDYd9MnNOrUiASmBdxMBjMxL9SPXXhEetd1co-L2AyA&q=Ronaldo+site:(youtube.com)&ved=2ahUKEwijhefrz62TAxXs2zQHHXmjAe8QtKgLegQIExAB&biw=1455&bih=822&dpr=



  https://www.google.com.vn/search?hl=en&ie=UTF-8&lr=lang_vi&num=10&oe=UTF-8&q=BUDWEISER%20GENfest%20site%3A%28youtube.com%29&sa=N&start=0&tbs=lr%3Alang_1vi%2Ccdr%3A1%2Ccd_min%3A3%2F18%2F2026&udm=7


## Những việc cần phải check ở Testing


deployment: ynm-cl-ytb-url-keyword


## Những việc cần phải check ở Staging


Hiện tại flow sẽ là:
1. Crawl được HTML
2. Bulld ra các artilces (Từ các article đó -> check dup ở Redis DB)
3. Nếu như articles đó tồn tại thì không xử lý
4. Nếu như article đó không tồn tại thì đưa vào xử lý tiếp (build crawling url/build unique url)
5. Kết thúc process

deployment: ynm-cl-ytb-url-keyword

missing-cache-ytb-mention-staging-ynm-crawler-empty



            - name: CRAWLER_CONFIG_PROXY_CRAWLER_TYPE
              value: IG_KEYWORD_POST_WEB_CRISIS_CRAWLER
            - name: CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE
              value: YT_ARTICLE_URL_FROM_CRISIS_KEYWORD_CRAWLER_LAMTT


export LOG_LEVEL=debug
export GOOGLE_SEARCH_CONFIG_SITES=youtube.com
export GOOGLE_SEARCH_CONFIG_TYPE_OF_SEARCH=7
export GOOGLE_SEARCH_CONFIG_LOCATION=''
export REDIS_CACHE_ENABLE=true
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.yt.article_urls_from_keyword_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.7__keyword.crawler
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.yt.article_urls_from_keyword_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.yt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.yt.article_urls_from_keyword_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.7.*.*.article_urls_from_keyword
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.7.*.*.article_urls_from_keyword.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_RESOLVED_URL_EXCHANGE=app.socialheat.crawling

export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=IG_KEYWORD_POST_WEB_CRISIS_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=YT_ARTICLE_URL_FROM_CRISIS_KEYWORD_CRAWLER_LAMTT
export CRAWLER_CONFIG_MAX_CRAWLED_PAGES=3
export CRAWLER_CONFIG_EXCLUDE_DOMAINS=apple,google,messenger,pinterest,wikipedia
export CRAWLER_CONFIG_EXCLUDE_EXTENSIONS=pdf,doc,docx,xls,xlsx,ppt,pptx,pps

export CRAWLER_CONFIG_CREATED_BY=YoutubeArticleUrlFromKeywordCrawlingLoader

export CRAWLER_CONFIG_DEFAULT_DATA_DURATION=12months
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_PRIORITY_LIMIT=1000
export CRAWLER_CONFIG_VALID_PLATFORMS=7
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=15
export RESOLVER_ENABLE=true

export CRAWLER_CONFIG_RESOLVED_URL_EXCHANGE=app.socialheat.crawling
export CRAWLER_CONFIG_RESOLVED_URL_ROUTING_KEY=crawling.yt_post_url

yarn start --scope=@ynm/cl-news-article-url-from-keyword-crawler-service