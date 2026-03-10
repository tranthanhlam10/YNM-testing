#Crisis Image/Video - Tích hợp crawl Image / Video cho các crawling keywords thuộc process chỉ định


https://jira.younetco.com/browse/SHDIY-9301
wiki dev: https://wiki.younetco.com/pages/viewpage.action?pageId=272882544
wiki script chạy: https://wiki.younetco.com/pages/viewpage.action?spaceKey=FB&title=Setup+Crisis+Image+Configuration+And+Flow
- Đã test done:
+ Pipeline
+ Đã test happy case của FB crisis keyword luồng mới , TT crisis keyword, FB detail, Download image Facebook

- Đang test:
+ FB crisis keyword luồng cũ

- Chưa test:
+ Luồng download transcript/image tiktok
+ Các loại lỗi (Dev có comment trong wiki)
+ check cờ is_congestion
+ Các edge case, disconnect, chạy tập data lớn


## Concept tổng của luồng


- Apply cho platform tiktok và faceboook

1. làm trong luồng crawl keyword/hsshtag fb/tiktok, nếu message gửi qua có cờ is_analyzer=0 thì chạy như cũ
+ Cờ is_analyzer = 0 thì chạy như bình thường
+ Cờ is_analyzer = 1 thì mới bắt đầu detect country

2. Sau khi có is_analyzer = 1 (Flow chung)

+ Facebook
- nếu=1 thì sau khi detect country xong nếu là VN+post liên quan ảnh/video -> đẩy đi crawl thêm ảnh nếu thiếu (bước này chỉ applyFB) -> đẩy mention qua queue để đi vào luồng crawl ảnh vào minIO, 

posts/identity đi như cũ (đẩy qua queue post/identity để insert vào Solr)

+ Tiktok
- Do country luôn để và VN nên lúc nào cũng đẩy mentions qua crawl ảnh/video để lưu vào minIO
posts/identity đi như cũ (đẩy qua queue post/identity để insert vào Solr)



3. Luồng crawl hình ảnh

- Luồng crawl hình ảnh thì bình thường, chỉ là consume xử lý và lưu lên MinIO

4. Đẩy message cho RnD

- Đẩy message mentions cho RnD có kèm video/image/transcripts

5. Cơ chế xả lũ



6. Cơ chế xử lý retry/fail khi mà proxy/token có vấn đề


Danh sách lỗi retry N lần:
- Lỗi mạng
- Lỗi máy chủ
- Lỗi Authentication
- Lỗi Blocking
- Lỗi Link Image hết hạn
- Lỗi liên quan tới Proxy

Danh sách lỗi retry mãi mãi:
- Tất cả lỗi liên quan tới MinIO Server mà không upload được ảnh thành công





## Cách chạy:


1. K8s

+ Source mới
ynmpdp-download-crisis-image-v3

kubectl get pods -n crawler-testing | grep ynmpdp-download-crisis-image-v3
kubectl exec -it ynmpdp-5774-2-testing-ynm-crawler-empty-64fff9b76b-jmjdj -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


+ Source cũ

ynmpdp-5793-crisis-image-v1-testing-crawler-empty-container

kubectl get pods -n crawler-testing | grep ynmpdp-5793-crisis-image-v1-testing-crawler-empty-container
kubectl exec -it ynmpdp-5774-2-testing-ynm-crawler-empty-64fff9b76b-jmjdj -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local

2. RabbitMQ


3. MinIO


4. Redis


5. Proxy/Token


6. Script chạy



- Facebook keyword cũ


export NODE_ENV=testing
 
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_PREFETCH_MESSAGES_CRISIS=300
 
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
 
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_CRAWLING_SOURCE_CRISIS_QUEUE=cl.fb.keyword_posts_crisis_no_token_crawling_sources
 
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_CRAWLING_SOURCE_CRISIS_ROUTING_KEY=km.1_keyword.crawler-crisis
 
 
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FINISHED_SOURCE_QUEUE=app.socialheat.crawl_keyword.results
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FINISHED_SOURCE_ROUTING_KEY=cl.1.hashtag_keyword_finished_sources
 
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_DEFAULT_DATA_DURATION_CRISIS=3days
 
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_USER_DETECT_COUNTRY_QUEUE=cl.fb.user_identity_countries_crawling_sources
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_PAGE_DETECT_COUNTRY_QUEUE=cl.fb.page_identity_countries_crawling_sources
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_GROUP_DETECT_COUNTRY_QUEUE=cl.fb.group_identity_countries_crawling_sources
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_ENGAGEMENT_BY_TOPIC_QUEUE=cl.fb.engagement_by_topic_crawling_sources
 
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_IMAGE_DOWNLOAD_TO_MINIO_QUEUE=cl.fb.crisis_media_download
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_IMAGE_DOWNLOAD_TO_MINIO_ROUTING_KEY=cl.fb.crisis_media_download
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_IMAGE_DOWNLOAD_TO_MINIO_EXCHANGE=cl.crisis_media_download
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_CRISIS_MEDIA_CRAWLER_CREATED_BY=CrisisMediaCrawlPostByKeyword
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_IS_CONGESTION=0

node scripts/facebookV3/crawl_post_by_keywords.js isCrisis


- Facebook keyword mới

export HTTP_PORT=6712
export NODE_ENV=testing
export CRAWLER_ENABLE=true
export BUILDER_ENABLE=true
export RESOLVER_ENABLE=true
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_HASHTAG_POST_KEYWORD_CRISIS_IMAGE_CRAWLER
export CRAWLER_CONFIG_IS_HASHTAG=false
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_HASHTAG_POST_KEYWORD_CRISIS_IMAGE_CRAWLER
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.1_hashtag.crawler-crisis-critical
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.hashtag_posts_critical_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.hashtag_posts_critical_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.hashtag_posts_critical
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.hashtag_posts_critical_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.*.*.hashtag_posts_critical.next_page
export CRAWLER_CONFIG_ENGAGEMENT_BY_TOPIC_OUTPUT_QUEUE=cl.fb.engagement_by_topic_crawling_sources


yarn start --scope @ynm/cl-fb-keyword-post-crawler-service

- Facebook Identity

export HTTP_PORT=6783
export NODE_ENV=testing
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_GRAPH_ENGAGEMENT_BY_TOPIC_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_GRAPH_ENGAGEMENT_BY_TOPIC_CRAWLER
export CRAWLER_ENABLE=true
export BUILDER_ENABLE=true
export RESOLVER_ENABLE=true
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.user_identity_countries_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.user_identity_countries_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.user_identity_countries_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.1.*.identity_countries
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.1.*.identity_countries
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_CRISIS_MEDIA_EXCHANGE=cl.crisis_media_download
export CRAWLER_CONFIG_CRISIS_MEDIA_RTK=cl.fb.crisis_media_download
export CRAWLER_CONFIG_ENGAGEMENT_BY_TOPIC_OUTPUT_QUEUE=cl.fb.engagement_by_topic_crawling_sources


yarn start --scope @ynm/cl-fb-identity-crawler-service


- Facebook engagement by topic

export HTTP_PORT=8712
export NODE_ENV=testing
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.engagement_by_topic_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.1.engagement_by_topic_crawling_source
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.graph_engagement_by_topic_crawling_requests
export CRAWLER_CONFIG_CRAWLING_REQUEST_ROUTING_KEY=cl.1.graph_engagement_by_topic_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.graph_engagements_by_topic
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.graph_engagements_by_topic_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_CRISIS_MEDIA_EXCHANGE=cl.crisis_media_download
export CRAWLER_CONFIG_CRISIS_MEDIA_RTK=cl.fb.crisis_media_download
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_GRAPH_ENGAGEMENT_BY_TOPIC_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_GRAPH_ENGAGEMENT_BY_TOPIC_CRAWLER
export CRAWLER_ENABLE=true
export BUILDER_ENABLE=true
export RESOLVER_ENABLE=true
export DEVICE_GENERATE_CONFIG_ENDPOINT=https://tiktok-api-wrapper.younetmedia.com/device?country=VietNam
export DEVICE_GENERATE_CONFIG_ACCESS_KEY=dGlrdG9rLWFwaS13cmFwcGVyLXRlc3Rpbmc6dDFrdDBrQHAxd3JAcHAzcnQzc3Qxbmc=



yarn start --scope @ynm/cl-fb-engagement-by-topic-crawler-service

- Tiktok search post by keyword

export HTTP_PORT=5712
export NODE_ENV=testing
export CRAWLER_ENABLE=true
export BUILDER_ENABLE=true
export RESOLVER_ENABLE=true
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=keyword.crawl.dispatch
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tt.posts_from_keyword_by_mobile_api_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.9_keyword.crawler
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tt.posts_from_keyword_by_mobile_api_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tt.posts_from_keyword_by_mobile_api_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.9.6.*.posts_from_keyword_by_mobile_api
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.9.6.*.posts_from_keyword_by_mobile_api.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TT_API_CRAWLER_KEYWORD
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TT_API_CRAWLER_KEYWORD



yarn start --scope @ynm/cl-tt-keyword-post-crawler-service


- Facebook media download

export HTTP_PORT=10283
export NODE_ENV=testing
export CRAWLER_ENABLE=false
export BUILDER_ENABLE=false
export RESOLVER_ENABLE=false
export MEDIA_DOWNLOAD_ENABLE=true
export MEDIA_DOWNLOAD_CONCURRENCY=1
export MEDIA_DOWNLOAD_MAX_RETRIES=3
export MEDIA_DOWNLOAD_CRAWLED_SOURCE_ROUTING_KEY=cl.fb.crisis_media_download
export MEDIA_DOWNLOAD_CRAWLED_SOURCE_EXCHANGE=cl.crisis_media_download
export MEDIA_DOWNLOAD_CRAWLED_SOURCE_QUEUE=cl.fb.crisis_media_download
export MEDIA_DOWNLOAD_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export MEDIA_DOWNLOAD_RND_EXCHANGE=rnd.socialheat.llm
export MEDIA_DOWNLOAD_RND_RTK=image_extraction
export MEDIA_DOWNLOAD_IS_CONGESTION=false
export MEDIA_DOWNLOAD_RESOLVER_ENABLE=true
export MEDIA_DOWNLOAD_RESOLVER_CONCURRENCY=1
export MEDIA_DOWNLOAD_RESOLVER_MAX_RETRIES=3
export MINIO_CDN_URL=http://minio-api.ynm.local
export MINIO_ENDPOINT=minio-api.ynm.local
export MINIO_PATH_STYLE=true
export MINIO_PORT=80
export MINIO_USE_SSL=false
export MINIO_ACCESS_KEY=lpPUZ7qg3LjUmU3Nvtnw
export MINIO_SECRET_KEY=7FvDnuFF7cBuWaMVxugoTDU1ZK6hlRr4NOyuioJE


yarn start --scope @ynm/cl-fb-keyword-post-crawler-service



- Tiktok media download


export HTTP_PORT=7473
export NODE_ENV=testing
export CRAWLER_ENABLE=false
export BUILDER_ENABLE=false
export RESOLVER_ENABLE=false
export MEDIA_DOWNLOAD_ENABLE=true
export MEDIA_DOWNLOAD_CONCURRENCY=1
export MEDIA_DOWNLOAD_MAX_RETRIES=3
export MEDIA_DOWNLOAD_CRAWLED_SOURCE_ROUTING_KEY=cl.tt.crisis_media_download
export MEDIA_DOWNLOAD_CRAWLED_SOURCE_EXCHANGE=cl.crisis_media_download
export MEDIA_DOWNLOAD_CRAWLED_SOURCE_QUEUE=cl.tt.crisis_media_download
export MEDIA_DOWNLOAD_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export MEDIA_DOWNLOAD_RND_EXCHANGE=rnd.socialheat.llm
export MEDIA_DOWNLOAD_RND_RTK=image_extraction
export MEDIA_DOWNLOAD_RESOLVER_ENABLE=true
export MEDIA_DOWNLOAD_RESOLVER_CONCURRENCY=1
export MEDIA_DOWNLOAD_RESOLVER_MAX_RETRIES=3
export MEDIA_DOWNLOAD_RESOLVER_TRANSCRIPT_DOWNLOAD_RETRY=1
export MEDIA_DOWNLOAD_RESOLVER_BUCKET_NAME=crisis-images
export MEDIA_DOWNLOAD_RESOLVER_PROXY_CRAWLER_TYPE=TT_API_CRAWLER_CRISIS_KEYWORD
export MEDIA_DOWNLOAD_RESOLVER_IS_CONGESTION=false



yarn start --scope @ynm/cl-tt-keyword-post-crawler-service



