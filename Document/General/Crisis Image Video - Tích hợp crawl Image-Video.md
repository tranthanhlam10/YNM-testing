# Crisis Image/Video - Tích hợp crawl Image / Video cho các crawling keywords thuộc process chỉ định


task: https://jira.younetco.com/browse/SHDIY-9301
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

### Những luồng bị ảnh hưởng/thay đổi:

- Faceboook Keyword - Source cũ -> DONE

- Facebook Keyword  - Source mới -> DONE

- Facebook Identity

- Facebook Engagement by Topic

- Tiktok search post by keyword -> Đang fix bug




---------------------------------------------------------------------------------
- Apply cho platform tiktok và faceboook

1. làm trong luồng crawl keyword/hsshtag fb/tiktok, nếu message gửi qua có cờ is_analyzer=0 thì chạy như cũ
+ Cờ is_analyzer = 0 thì chạy như bình thường
+ Cờ is_analyzer = 1 thì mới bắt đầu detect country

2. Sau khi có is_analyzer = 1 (Flow chung)

+ Facebook
- nếu=1 thì sau khi detect country xong nếu là VN + post liên quan ảnh/video -> đẩy đi crawl thêm ảnh nếu thiếu (bước này chỉ applyFB) -> đẩy mention qua queue để đi vào luồng crawl ảnh vào minIO, 

posts/identity đi như cũ (đẩy qua queue post/identity để insert vào Solr)

+ Tiktok
- Do country luôn để và VN nên lúc nào cũng đẩy mentions qua crawl ảnh/video để lưu vào minIO
posts/identity đi như cũ (đẩy qua queue post/identity để insert vào Solr)



3. Luồng crawl hình ảnh

- Luồng crawl hình ảnh thì bình thường, chỉ là consume xử lý và lưu lên MinIO

4. Đẩy message cho RnD

- Đẩy message mentions cho RnD có kèm video/image/transcripts

5. Cơ chế xả lũ

- Nếu bật cờ xả lũ lên thì phải đẩy mentions qua pusher

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
kubectl exec -it ynmpdp-download-crisis-image-v3-testing-ynm-crawler-empty-mqm77 -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


+ Source cũ

ynmpdp-5793-crisis-image-v1-testing-crawler-empty-container

kubectl get pods -n crawler-testing | grep ynmpdp-5793-crisis-image-v1-testing-crawler-empty-container
kubectl exec -it ynmpdp-5793-crisis-image-v1-testing-crawler-empty-containe9v467 -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local

2. RabbitMQ

cl.fb.keyword_posts_crisis_no_token_crawling_sources|app.socialheat.crawl_keyword.results|cl.fb.user_identity_countries_crawling_sources|cl.fb.page_identity_countries_crawling_sources|cl.fb.group_identity_countries_crawling_sources|cl.fb.engagement_by_topic_crawling_sources|cl.fb.crisis_media_download|cl.fb.hashtag_posts_critical_crawling_sources|cl.fb.hashtag_posts_critical_crawling_requests|cl.fb.hashtag_posts_critical_crawled_sources|cl.fb.user_identity_countries_crawling_requests|cl.fb.user_identity_countries_crawled_sources|cl.fb.graph_engagement_by_topic_crawling_requests|cl.fb.graph_engagements_by_topic_crawled_sources|cl.tt.posts_from_keyword_by_mobile_api_crawling_sources|cl.tt.posts_from_keyword_by_mobile_api_crawling_requests|cl.tt.posts_from_keyword_by_mobile_api_crawled_sources|cl.tt.crisis_media_download|cl.mentions_2_solr_mentions_LamTT|cl.posts_2_solr_fb_posts_LamTT|cl.posts_2_solr_tt_posts_LamTT|cl.identities_2_solr_identities_LamTT|cl.identities_2_redis_identities_LamTT|fb.identity_countries_crawling_sources|testing.cl.posts_2_solr_tt_posts_thutt|cl.fb.engagement_by_topic_crisis_image_crawling_source|cl.fb.engagement_by_topic_crisis_image_crawling_source|cl.fb.graph_engagement_by_topic_crisis_image_crawling_requests|cl.fb.graph_engagement_by_topic_crisis_image_crawled_sources|rnd.socialheat.llm.image_extraction|image.download_to_minio|cl.fb.keyword_posts_crisis_crawled_sources|cl.fb.keyword_posts_crisis_crawling_requests|cl.fb.keyword_posts_crisis_crawling_sources|cl.tt.posts_from_crisis_keyword_by_mobile_api_crawling_sources|cl.tt.posts_from_crisis_keyword_by_mobile_api_crawling_requests|cl.tt.posts_from_crisis_keyword_by_mobile_api_crawled_sources|cl.tt.posts_from_critical_keyword_by_mobile_api_crawling_sources|cl.tt.posts_from_critical_keyword_by_mobile_api_crawling_requests|cl.tt.posts_from_critical_keyword_by_mobile_api_crawled_sources


3. MinIO



4. Redis


Cache Mentions/Posts: Redis DB 12


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
export FB_API_ENDPOINT=http://fbgraphql-api-service-testing.ynm.local
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_USER_DETECT_COUNTRY_QUEUE=cl.fb.user_identity_countries_crawling_sources
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_PAGE_DETECT_COUNTRY_QUEUE=cl.fb.page_identity_countries_crawling_sources
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_GROUP_DETECT_COUNTRY_QUEUE=cl.fb.group_identity_countries_crawling_sources
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_ENGAGEMENT_BY_TOPIC_QUEUE=cl.fb.engagement_by_topic_crisis_image_crawling_source
 
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_IMAGE_DOWNLOAD_TO_MINIO_QUEUE=cl.fb.crisis_media_download
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_IMAGE_DOWNLOAD_TO_MINIO_ROUTING_KEY=cl.fb.crisis_media_download
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_IMAGE_DOWNLOAD_TO_MINIO_EXCHANGE=cl.crisis_media_download
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_FB_CRISIS_MEDIA_CRAWLER_CREATED_BY=CrisisMediaCrawlPostByKeyword
export FACEBOOK_POST_FROM_KEYWORD_CRAWLER_IS_CONGESTION=true
export IS_DETECT_COUNTRY=false
export SOLR_TOPIC_PORT=8888
export SOLR_MASTER_PORT=8888
node scripts/facebookV3/crawl_post_by_keywords.js isCrisis



- Facebook keyword mới


export LOG_LEVEL=info
export HTTP_PORT=6712
export NODE_ENV=testing
export CRAWLER_ENABLE=true
export BUILDER_ENABLE=true
export RESOLVER_ENABLE=true
export MEDIA_DOWNLOAD_RESOLVER_ENABLE=false
export MEDIA_DOWNLOAD_ENABLE=false
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
export CRAWLER_CONFIG_ENGAGEMENT_BY_TOPIC_OUTPUT_QUEUE=cl.fb.engagement_by_topic_crisis_image_crawling_source
export RESOLVER_IS_DETECT_COUNTRY=false
export CRAWLER_CONFIG_CRISIS_MEDIA_EXCHANGE=cl.crisis_media_download
export CRAWLER_CONFIG_CRISIS_MEDIA_RTK=cl.fb.crisis_media_download
export CRAWLER_CONFIG_ENGAGEMENT_BY_TOPIC_OUTPUT_QUEUE=cl.fb.engagement_by_topic_crisis_image_crawling_source
export CRAWLER_CONFIG_IS_CONGESTION=true
export CRAWLER_CONFIG_CRISIS_MEDIA_CRAWLER_CREATED_BY=CrisisMediaCrawlPostByKeyword
yarn start --scope @ynm/cl-fb-keyword-post-crawler-service



- Facebook Identity

export HTTP_PORT=6783
export NODE_ENV=testing
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_HASHTAG_POST_NON_CRISIS_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_HASHTAG_POST_KEYWORD_CRISIS_IMAGE_CRAWLER
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
export CRAWLER_CONFIG_IS_CONGESTION=false

export CRAWLER_CONFIG_ENGAGEMENT_BY_TOPIC_OUTPUT_QUEUE=cl.fb.engagement_by_topic_crawling_sources


yarn start --scope @ynm/cl-fb-identity-crawler-service


- Facebook engagement by topic


export HTTP_PORT=8712
export NODE_ENV=testing
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.engagement_by_topic_crisis_image_crawling_source
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.1.engagement_by_topic_crisis_image_crawling_source
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.graph_engagement_by_topic_crisis_image_crawling_requests
export CRAWLER_CONFIG_CRAWLING_REQUEST_ROUTING_KEY=cl.1.graph_engagement_by_topic_crisis_image_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.graph_engagement_by_topic_crisis_image
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.graph_engagement_by_topic_crisis_image_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_CRISIS_MEDIA_EXCHANGE=cl.crisis_media_download
export CRAWLER_CONFIG_CRISIS_MEDIA_RTK=cl.fb.crisis_media_download
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_HASHTAG_POST_KEYWORD_CRISIS_IMAGE_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_HASHTAG_POST_KEYWORD_CRISIS_IMAGE_CRAWLER
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
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=km.9__keyword.crawler
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tt.posts_from_keyword_by_mobile_api_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tt.posts_from_keyword_by_mobile_api_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.9.6.*.posts_from_keyword_by_mobile_api
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.9.6.*.posts_from_keyword_by_mobile_api.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TT_API_CRAWLER_KEYWORD
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TT_API_CRAWLER_KEYWORD
export CRAWLER_CONFIG_IS_CONGESTION=false

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
export MINIO_END_POINT=minio-api.ynm.local
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
export MEDIA_DOWNLOAD_RESOLVER_PROXY_CRAWLER_TYPE=TT_API_CRAWLER_KEYWORD
export MEDIA_DOWNLOAD_RESOLVER_IS_CONGESTION=false



yarn start --scope @ynm/cl-tt-keyword-post-crawler-service




- Data pusher 



export MENTION_2_SOLR_MENTION_ENABLE=true
export MENTION_2_SOLR_MENTION_INPUT_QUEUE=cl.mentions_2_solr_mentions_ai_summary
yarn start --scope=@ynm/cl-data-pusher-service

---------------------------------------------------------------------------------------------------

## Data test




- Facebook keyword luồng cũ:


{
    "id_keyword": 12345,
    "keyword": "Anh trai say 2 mùa 2",
    "id_platform": 1,
    "id_process": 987,
    "createdBy": "234567",
    "is_critical": 1,
    "crawling_type": "brand_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2025-12-01T10:20:30Z",
    "id_last_crawling": 5566,
    "tag_id": "123",
    "country": "vn",
    "is_analyze": 1
  },
  {
    "id_keyword": 33068,
    "keyword": "Em Xinh say 2",
    "id_platform": 1,
    "id_process": 2861,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 98694,
    "tag_id": null,
    "country": "VN"
  }

---------------------------------------------------------------------------------------------------

## Những cases cần test ở local

1. Luồng FB cũ

- Crawl bình thường -> DONE

{
    "id_keyword": 34544,
    "keyword": "Hòa Minzy",
    "id_platform": 1,
    "id_process": 2919,
    "is_critical": 0,
    "is_analyze": 0,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 104945,
    "tag_id": null,
    "country": "VN"
  }


  {
    "id_keyword": 34544,
    "keyword": "Ảnh",
    "id_platform": 1,
    "id_process": 2919,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 104945,
    "tag_id": null,
    "country": "VN"
  }


    {
    "id_keyword": 34544,
    "keyword": "Ảnh đẹp",
    "id_platform": 1,
    "id_process": 2919,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 104945,
    "tag_id": null,
    "country": "VN"
  }


     {
    "id_keyword": 34544,
    "keyword": "Anh trai",
    "id_platform": 1,
    "id_process": 2919,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 104945,
    "tag_id": null,
    "country": "VN"
  }


    {
    "id_keyword": 34544,
    "keyword": "Thanh Thủy",
    "id_platform": 1,
    "id_process": 2919,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 104945,
    "tag_id": null,
    "country": "VN"
  }



  {
    "id_keyword": 34544,
    "keyword": "Ngọc Trinh",
    "id_platform": 1,
    "id_process": 2919,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 104945,
    "tag_id": null,
    "country": "VN"
  }



  {
    "id_keyword": 34544,
    "keyword": "Quốc Trường",
    "id_platform": 1,
    "id_process": 2919,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 104945,
    "tag_id": null,
    "country": "VN"
  }

  -> Đi crawl bình thường, đẩy qua các queue mentions, post, identity

- Crawl khi analyze = 1 

+ Keyword mới, bài post mới -> Hiện tại đã đẩy qua queue testing.cl.fb.crisis_media_download

  {
    "id_keyword": 34321,
    "keyword": "Hoa hậu Tiểu Vy",
    "id_platform": 1,
    "id_process": 2911,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 103963,
    "tag_id": null,
    "country": "VN"
  }


  {
    "id_keyword": 32736,
    "keyword": "Hoa hậu Thanh Thủy",
    "id_platform": 1,
    "id_process": 2855,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 97361,
    "tag_id": null,
    "country": "VN"
  }



  {
    "id_keyword": 32736,
    "keyword": "Hoa hậu Thanh Thủy",
    "id_platform": 9,
    "id_process": 2855,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 97361,
    "tag_id": null,
    "country": "VN"
  }



    {
    "id_keyword": 32736,
    "keyword": "Trịnh Thăng Bình",
    "id_platform": 9,
    "id_process": 2855,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 97361,
    "tag_id": null,
    "country": "VN"
  }

  {
    "id_keyword": 32738,
    "keyword": "Hoa Hậu Lương Thùy Linh",
    "id_platform": 1,
    "id_process": 2855,
    "is_critical": 0,
    "is_analyze": 0,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 97369,
    "tag_id": null,
    "country": "VN"
  }



    {
    "id_keyword": 32738,
    "keyword": "Sơn Tùng",
    "id_platform": 1,
    "id_process": 2855,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 97369,
    "tag_id": null,
    "country": "VN"
  }


     {
    "id_keyword": 32738,
    "keyword": "Ảnh con gái",
    "id_platform": 1,
    "id_process": 2855,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-05T13:53:00.000Z",
    "id_last_crawling": 97369,
    "tag_id": null,
    "country": "VN"
  }


-> Kiểm tra thêm check country ở Redis (Không thể set-up được country nước ngoài, do không biết identity mới vào như nào)
-> Kiểm tra xem mentions đẩy qua có phải là post có ảnh/video hay không
-> Identity/Posts đẩy qua các queue Identity/Post bình thường -> DONE

+ Keyword cũ, bài post cũ

-> Hiện tại xem log coi có check id_source trên Redis hay không


2. Luồng tiktok

- Crawl bình thường -> DONE




  {
    "id_keyword": 32700,
    "keyword": "Ho Chi Minh",
    "id_platform": 9,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }



  {
    "id_keyword": 32700,
    "keyword": "Gai dep",
    "id_platform": 9,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }



    {
    "id_keyword": 32700,
    "keyword": "Anh dep",
    "id_platform": 9,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }

- Crawl khi analyze = 1 

-> Kiểm tra thêm check country ở Redis (Không thể set-up được country nước ngoài, do không biết identity mới vào như nào)
-> Kiểm tra xem mentions đẩy qua có phải là post có ảnh/video hay không
-> Identity/Posts đẩy qua các queue Identity/Post bình thường -> Hiện tại có đẩy qua identities, nhưng không đẩy qua tiktok_posts

	
testing.cl.posts_2_solr_tt_posts

- Crawl 1 keyword cũ



3. Luồng FB keyword - source mới

- Crawl bình thường -> DONE
{
    "id_keyword": 32700,
    "keyword": "8/3",
    "id_platform": 1,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 0,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 0,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }

- Crawl khi analyze = 1 

{
    "id_keyword": 32700,
    "keyword": "Ảnh đẹp",
    "id_platform": 1,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }



  {
    "id_keyword": 32700,
    "keyword": "#GaiXinh",
    "id_platform": 1,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }




  {
    "id_keyword": 32700,
    "keyword": "Ronaldo",
    "id_platform": 1,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }




  {
    "id_keyword": 32700,
    "keyword": "Ảnh gái đẹp",
    "id_platform": 1,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }



  {
    "id_keyword": 32700,
    "keyword": "Ảnh gái",
    "id_platform": 1,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }


  {
    "id_keyword": 32700,
    "keyword": "Hoa hau",
    "id_platform": 9,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }



   {
    "id_keyword": 32700,
    "keyword": "Gai dep",
    "id_platform": 9,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }



     {
    "id_keyword": 32700,
    "keyword": "Anh dep",
    "id_platform": 9,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }

-> Kiểm tra thêm check country ở Redis (Không thể set-up được country nước ngoài, do không biết identity mới vào như nào)
-> Kiểm tra xem mentions đẩy qua có phải là post có ảnh/video hay không
-> Identity/Posts đẩy qua các queue Identity/Post bình thường -> Hiện tại đã works đúng yêu cầu


- Crawl 1 keyword cũ







4. Luồng FB identity

- Crawl bình thường -> DONE


- Crawl khi analyze = 1



-> Kiểm tra thêm check country ở Redis (Không thể set-up được country nước ngoài, do không biết identity mới vào như nào)
-> Kiểm tra xem mentions đẩy qua có phải là post có ảnh/video hay không
-> Identity/Posts đẩy qua các queue Identity/Post bình thường -


Note: 
+ Luồng này có chỗ đặc biệt, nếu như mà detect country != VN thì không đẩy qua luồng download
+ Nếu như detect country = VN thì đẩy qua luồng down-load


-> Nhưng mà phải chắc cú lại thì có đẩy posts đi như bình thường hay không ? -> Confirm với dev


5. Luồng FB engagement


- Hiện tại vẫn đang báo lỗi proxy/token
- Đã thỏa điều kiện đẩy qua luồng engagement để crawl detail



6. MinIO và đẩy qua RnD



- Hiện tại happy cases đã crawl và đã đẩy qua rnd -> Đã đẩy qua RnD


- Kiểm tra xem đã download đúng ảnh hay chưa -> Đã crawl đúng và đủ


- Kiểm tra các cases cần phải retry -> Hiện tại đã đúng với yêu cầu

+ Tắt MinIO -> Retry vô hạn -> Hiện tại đã retry vô hạn
+ Đưa 1 link bị xóa, hoặc là 1 link không download được -> Retry N lần -> Đã retry đúng theo config
+ Proxy (Chỉ apply cho luồng tiktok) -> Nếu như proxy bị lỗi/Block/Broken -> Retry N lần



- Nếu có rồi sẽ không lưu thêm -> Hiện tại đã đúng với yêu cầu


- Nếu như tất cả ảnh đều lỗi, thì đẩy qua mentions -> Hiện tại đã đúng với yêu cầu


- Congrestion (Xả lũ)

+ FB

+ Tiktok


-> Hiện tại đã retry đúng yêu cầu
-> Hiện tại nếu proxy bị lỗi thì retry liên tục






## Output data



## Những việc cần check lại ở testing

1. Source mới

- Facebook


ynm-cl-fb-keyword-post-crisis-images-service (download img svc) -> DONE


ynm-cl-fb-keyword-post-crisis-service -> DONE (Chạy is_analyze = 1, không xả, không detect language) -> DONE

fb-hashtag-post-critical


ynm-cl-fb-user-identity-country-service (detect country) -> Hiện tại chỗ này chưa chạy xả được


ynm-cl-fb-graph-engagement-by-crisis-imgs (crawl detail) -> DONE

+ Luồng engagement thì không có xả

- Tiktok

ynm-cl-tt-crisis-images-kw-mobi-api-service (download img svc) -> DONE

ynm-cl-tt-crisis-keyword-by-mob-api-service -> (Luồng này anh Luân đang test tasks khác)


ynm-cl-tt-critical-keyword-by-mob-api-service-testing -> DONE

data-pusher

ynm-cl-data-pusher-mention-service -> DONE 

-> Hiện tại data-pusher không bị lỗi



2. Source cũ

crawler-fb-testing-crawl-post-by-keywords-crisis -> DONE


## List lại các cases ở staging



staging

- Luồng mới
+ fb
ynm-cl-fb-keyword-post-crisis-images-service (download img svc)
ynm-cl-fb-keyword-post-crisis-service
ynm-cl-fb-keyword-post-critical-service
ynm-cl-fb-user-identity-country-service (detect country)
ynm-cl-fb-graph-engagement-by-crisis-imgs (crawl detail)

+ tt
ynm-cl-tt-crisis-images-kw-mobi-api-service (download img svc)

ynm-cl-tt-crisis-keyword-by-mob-api-service
ynm-cl-tt-critical-keyword-by-mob-api-service

+ data-pusher
ynm-cl-data-pusher-mention-service

- Luồng cũ

crawler-fb-testing-crawl-post-by-keywords-crisis

1. Luồng FB cũ


- Kiểm tra luồng xả xem có vừa đẩy qua mentions, vừa đẩy qua download hay không


2. Luồng FB mới


FB_GROUP_POST_CRAWLER

- Kiểm tra luồng xả
+ chạy 1 luồng bật xả, bật detect country -> Keyword crisis -> DONE
+ chạy 1 luồng bật xả, không bật detect country -> Hashtag crisis -> DONE


Note: Nếu như identity đó đã có country_code, thì post và mentions cũng có country code

- Kiểm tra detect country -> DONE
+ bật xả luồng detect country 


- Kiểm tra engagement -> DONE
+ Bật bình thường


3. Luồng tiktok
- Kiểm tra luồng xả xem có vừa đẩy qua mentions, vừa đẩy qua download hay không
+ Chạy 1 luồng xả -> DONE
+ Chạy 1 luồng không xả -> DONE

4. Luồng download fb

- Kiểm tra xem có upload 


5. Update keyword cho App

Hiện tại đã update được số lượng bài post crawl về


Câu regex mới nhất:

cl.fb.keyword_posts_crisis_no_token_crawling_sources|app.socialheat.crawl_keyword.results|cl.fb.user_identity_countries_crawling_sources|cl.fb.page_identity_countries_crawling_sources|cl.fb.group_identity_countries_crawling_sources|cl.fb.engagement_by_topic_crawling_sources|cl.fb.crisis_media_download|cl.fb.hashtag_posts_critical_crawling_sources|cl.fb.hashtag_posts_critical_crawling_requests|cl.fb.hashtag_posts_critical_crawled_sources|cl.fb.user_identity_countries_crawling_requests|cl.fb.user_identity_countries_crawled_sources|cl.fb.graph_engagement_by_topic_crawling_requests|cl.fb.graph_engagements_by_topic_crawled_sources|cl.tt.posts_from_keyword_by_mobile_api_crawling_sources|cl.tt.posts_from_keyword_by_mobile_api_crawling_requests|cl.tt.posts_from_keyword_by_mobile_api_crawled_sources|cl.tt.crisis_media_download|cl.mentions_2_solr_mentions_LamTT|cl.posts_2_solr_fb_posts_LamTT|cl.posts_2_solr_tt_posts_LamTT|cl.identities_2_solr_identities_LamTT|cl.identities_2_redis_identities_LamTT|fb.identity_countries_crawling_sources|testing.cl.posts_2_solr_tt_posts_thutt|cl.fb.engagement_by_topic_crisis_image_crawling_source|cl.fb.engagement_by_topic_crisis_image_crawling_source|cl.fb.graph_engagement_by_topic_crisis_image_crawling_requests|cl.fb.graph_engagement_by_topic_crisis_image_crawled_sources|rnd.socialheat.llm.image_extraction|image.download_to_minio|cl.fb.keyword_posts_crisis_crawled_sources|cl.fb.keyword_posts_crisis_crawling_requests|cl.fb.keyword_posts_crisis_crawling_sources|cl.tt.posts_from_crisis_keyword_by_mobile_api_crawling_sources|cl.tt.posts_from_crisis_keyword_by_mobile_api_crawling_requests|cl.tt.posts_from_crisis_keyword_by_mobile_api_crawled_sources|cl.tt.posts_from_critical_keyword_by_mobile_api_crawling_sources|cl.tt.posts_from_critical_keyword_by_mobile_api_crawling_requests|cl.tt.posts_from_critical_keyword_by_mobile_api_crawled_sources