# Task improve luồng tiktok transcript của Huy



## Issue

+ Hiện tại, luồng đang gọi đến service graph-tiktok để crawl transcript, nhưng service graph-tiktok đang gặp hiện tượng quá tải do có nhiều cùng gọi đến.




## Hướng xử lý

+ Cách giải quyết là điều chỉnh lại thành gọi trực tiếp đến Tiktok API.



## Cách chạy

1. K8s


ynmpdp-5947-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-5947-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5947-testing-ynm-crawler-empty-c86c767b5-8hc4j -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


2. Queue


cl.tt.post_transcripts_crawling_sources|rnd.socialheat.llm.summary_input|rnd.socialheat.llm.summary_output



| Type     | Name                                    |
| -------- | --------------------------------------- |
| Queue    | cl.tt.post_transcripts_crawling_sources |
| Queue    | rnd.socialheat.llm.summary_input        |
| Exchange | rnd.socialheat.llm.summary_output       |



3. Loader


Message mà bên app đẩy qua

{
"id_classification_request": "1",
"transcriptTrackingId": "1",
"id_topic": "120306",
"mentions": [
    {
     "id": "f485070e-877d-59cd-a54b-c2b91d551fb1",
     "link": "tiktok.com/@MS4wLjABAAAAWuL0RsJ6KcaB1gdrDaFazyFtOLbANiX4696KbGG4sxRtdCAOrgEWIpeQrjuH8XYt/video/7548652337800203527",
     "platform": 9,
     "mention_type": 1,
     "id_social": "7548652337800203527",
     "search_text": [
        "",
        "Toàn cảnh full màn Cầu Hôn lãng mạn của anh Linh chị Viên Vibi . Đi xem Online mấy bà ơi 🤣 #cauhon #Vienvibi"
     ],
     "created_date": "2025-09-11T02:26:29Z"
    }
]
}




4. Redis

Không quan trọng


5. Proxy/token

TT_POST_TRANSCRIPT_CRAWLER

6. Câu lệnh chạy

id
link
platform
mention_type
id_social
search_text
created_date


id,link,platform,mention_type,id_social,search_text,created_date

- Luồng cũ hiện tại đang chạy:


ynm-cl-tt-post-transcript-service-testing



export HTTP_PORT=9898
 
export COMMON_CONFIG_CRAWLING_SOURCE_QUEUE="cl.tt.post_transcripts_crawling_sources"
export COMMON_CONFIG_CRAWLED_SOURCE_QUEUE="rnd.socialheat.llm.summary_input"
export COMMON_CONFIG_RESOLVED_SOURCE_EXCHANGE="rnd.socialheat.llm.summary_output"
export COMMON_CONFIG_MAX_RETRIES=5
export COMMON_CONFIG_PROXY_CRAWLER_TYPE="TT_POST_TRANSCRIPT_CRAWLER"
export TT_GRAPH_SERVICE_TIMEOUT=45000
export COMMON_CONFIG_ENABLE_INFINITE_RETRY_ON_UNKNOWN_ERROR=true
export COMMON_CONFIG_SLEEP_TIME_BETWEEN_RETRIES=1000


 
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
 
export LOG_LEVEL=debug
 
yarn start --scope=@ynm/cl-tt-post-transcript-crawler-service


## Check thêm hotfix ở tiktok identity của Huy

Scope: Lúc trước lỗi thì service bị đứng, sau 30s thì sẽ restart theo cơ chế của Rabbit
Hướng giải quyết: Huy sẽ sửa dụng timeout native để timeout, nếu như request quá thời gian timeout thì sẽ ném lỗi và sẽ retry lại theo số lần retry đã cấu hình

ynmpdp-5970-staging-ynm-crawler-empty
ynmpdp-5970-staging-ynm-crawler-empty
ynmpdp-5970-v2-staging-ynm-crawler-empty


kubectl get pods -n crawler-testing | grep ynmpdp-5970-staging-ynm-crawler-empty
kubectl exec -it ynmpdp-5970-staging-ynm-crawler-empty-5b546657f7-2569z -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-ovh

(dev|testing|staging|production).cl.tt.(identities|identity_countries)_(crawled|crawling)|(dev|testing|staging|production).cl.identities_finished_sources


- Câu lệnh chạy detect country

export HTTP_PORT=9999
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tt.identity_countries_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tt.identity_countries_crawling_requests
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tt.identity_countries_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.9.*.*.identity_countries
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.9.*.*.identity_countries
  
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TT_IDENTITY_COUNTRY_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=""
export TT_GRAPH_SERVICE_TIMEOUT=45000
 
export CRAWLER_CONFIG_POST_LIMIT=10
  
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
  
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
  
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
  
export LOG_LEVEL=debug
  
yarn start --scope=@ynm/cl-tt-identity-crawler-service

- Câu lệnh chạy của luồng identity info


export HTTP_PORT=9998
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tt.identities_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tt.identities_crawling_requests
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tt.identities_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.9.*.*.identities
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.9.*.*.identities
  
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TT_POST_TRANSCRIPT_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=""
export TT_GRAPH_SERVICE_TIMEOUT=45000
 
export CRAWLER_CONFIG_POST_LIMIT=10
  
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
  
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
  
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
  
export LOG_LEVEL=debug
  
yarn start --scope=@ynm/cl-tt-identity-crawler-service


Data cần test lại:


[
  {
    "id": "MS4wLjABAAAATQPMbdGurZNZ2emGLSBzhWfjINUpVKR6KBQ1FpX2taZN2xFtOWHbwcjch5X2tX4f",
    "platform": 9,
    "fullname": "YUuu°",
    "created_date": "2026-04-18T19:48:26.272Z",
    "retries": 0,
    "createdBy": "TiktokUserMonthlyCrawlingLoader",
    "mentions": [],
    "posts": [],
    "is_analyze": 0
  },
  {
    "id": "MS4wLjABAAAAu7c-2hmHqA4PspgKH7WSMe486KCaZmf8aSDiUQWS4FAa0P-v8hUdtM1_MhLVHbh5",
    "platform": 9,
    "fullname": "Mr.Fabulous-DJ FM Chicago",
    "created_date": "2026-04-18T19:48:26.272Z",
    "retries": 0,
    "createdBy": "TiktokUserMonthlyCrawlingLoader",
    "mentions": [],
    "posts": [],
    "is_analyze": 0
  }
]



- Những pod cần phải chạy

Deployment:
+ ynm-cl-tt-identity-service
+ ynm-cl-tt-identity-country-service

## Những việc cần test lại ở testing
 
 
ynm-cl-tt-post-transcript-service


## Những việc cần test lại ở staging


+ ynm-cl-tt-post-transcript-service
+ ynm-cl-tt-identity-service
+ ynm-cl-tt-identity-country-service....



