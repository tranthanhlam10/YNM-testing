# Task improve luồng tiktok transcript của Huy



## Issue

+ Hiện tại, luồng đang gọi đến service graph-tiktok để crawl transcript, nhưng service graph-tiktok đang gặp hiện tượng quá tải do có nhiều cùng gọi đến.




## Hướng xử lý

+ Cách giải quyết là điều chỉnh lại thành gọi trực tiếp đến Tiktok API.



## Cách chạy

1. K8s


ynmpdp-5947-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-5947-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5947-testing-ynm-crawler-empty-d9dc7d9c4-4q5z4 -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


2. Queue


cl.tt.post_transcripts_crawling_sources|rnd.socialheat.llm.summary_input



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



export HTTP_PORT=9999
 
export COMMON_CONFIG_CRAWLING_SOURCE_QUEUE="cl.tt.post_transcripts_crawling_sources"
export COMMON_CONFIG_CRAWLED_SOURCE_QUEUE="rnd.socialheat.llm.summary_input"
export COMMON_CONFIG_RESOLVED_SOURCE_EXCHANGE="rnd.socialheat.llm.summary_output"
export COMMON_CONFIG_MAX_RETRIES=10
export COMMON_CONFIG_PROXY_CRAWLER_TYPE="TT_POST_TRANSCRIPT_CRAWLER"
 
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
 
export LOG_LEVEL=debug
 
yarn start --scope=@ynm/cl-tt-post-transcript-crawler-service










