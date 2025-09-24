# Task improve cho luồng hashtag no cookie 

## Mục tiêu của task
Giảm được việc push data trùng lặp trên Solr           
Giảm được việc push data trùng vào luồng reply crawl post
Đồng bộ lại tất cả Id User của Platform Threads trong luồng Hashtag/Keyword no cookie

## Giải pháp 
Thêm phần cache và kiểm tra data sau khi crawl được post/reply từ hashtag/keyword trước khi đẩy qua queue push vào Solr
Thêm việc block source khi push vào luồng reply crawl post tương tự phần crawling loader
Thêm api lấy id Threads từ username

## Những thay đổi của luồng
- Trước khi đẩy qua crawled_source thì ở crawling_request gọi thêm API để lấy được id threads 
- Trước khi đẩy xuống các queueu của resolver -> Thì gọi gọi redis để check và cache lại data của hashtag/keyword trước khi build và push lên solr (Chỗ này xử lý tương tự loader)

## Các case cần check
- Kiểm tra API id source nó có giống với trên web hay không ? (Chỗ này cần phải xinxi)
- Kiểm tra username truyền qua builder nó có đúng với username của user không -> Nếu user name đó bị sai thì sao
- Kiểm tra message được build xuống crawled source có đúng format
- Kiểm tra nếu là user mới thì sao (Đẩy vào queue **cl.identities_2_solr_identities và cl.identities_2_redis_identities**)
- Kiểm tra nếu messages là post mới (field is_reply = false và kiểm tra trong redis) thì đẩy vào 2 queue **cl.posts_2_solr_tr_posts và cl.mentions_2_solr_mentions**
- Kiểm tra nếu message là reply mới (field is_reply = true và kiểm tra trong redis) thì đẩy vào **queue cl.reply_post_crawling_sources** (xử lý trong reply post flow)
- Crawl xong thì đẩy vào finished source


- Có 2 chỗ quan trọng cần check trong chỗ reply (DB 1)
+ Cache Data chống việc push quá nhiều duplicate data vào Solr: 
Key: ThreadsHashtagKeywordNoCookiePostCache
Score: thời gian hết hạn tính theo milisecond
Member: Id của post/reply
-> sẽ có 1 cronjob sẽ tiến hành quét với tần số 1 phút/lần rồi xóa thời gian quá hạn

+ Locked Source Cho Reply Post Flow	
Key: ThreadsReplyPostCrawlingLoader
Value: Id của post/reply

## Cách chạy 

ynmpdp-5120-tr-hashtag-keyword-dup-testing-ynm-crawler-empty
kubectl get pods -n crawler-testing | grep ynmpdp-5120-tr-hashtag-keyword-dup-
kubectl exec -it ynmpdp-5120-tr-hashtag-keyword-dup-testing-ynm-crawler-empm6xjc -n crawler-testing -- sh



## Các queue cần lưu ý của luồng hashtag keyword


cl.(mentions_2_solr_mentions|tr.keyword_posts_finished_sources|posts_2_solr_tr_posts|tr.identities_finished_sources|tr.keyword_posts_no_cookie_crawling_sources|tr.keyword_posts_no_cookie_crawling_requests|tr.keyword_posts_no_cookie_crawled_sources|tr.hashtag_posts_no_cookie_crawling_sources|tr.hashtag_posts_no_cookie_crawling_requests|tr.hashtag_posts_no_cookie_crawled_sources)


## Tìm flow để verify lại API identity 

(Chỗ này để nghiên cứu lại sau @@) -> DONE 


## Những việc cần làm để test task
- Dump keyword/hashtag (Hashtag cần phải tự lấy thêm tag_id)
- Chạy luồng builder và crawler để xem có mapping đúng với id mới của user hay không (Tự push vài message có id sai để check thử nó có mapping lại đúng hay không )
- Phải config proxy thành các type tương ứng
- Coi lại nó có cache ở redis hay không
- Cần phải compare data giữa luồng cũ và mới (Ngoài chỗ identity thì các fields còn lại phải chính xác) (Chỉ cần tiệp keyword mình chạy là được)


## Câu lệnh dùng để chạy

**Câu lệnh chạy cho keyword**

export HTTP_PORT=9010
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
 
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/api/graphql
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10

 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.keyword_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.keyword_posts_no_cookie_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.keyword_posts_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.keyword_posts_no_cookie_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.keyword_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 

export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_KEYWORD_POST_NO_COOKIE_CRAWLER
 
export CRAWLER_CONFIG_PAGING_ENABLE=true

export REDIS_CACHE_HOST=192.168.1.103
export REDIS_CACHE_PORT=6390
export REDIS_CACHE_DB=1
export REDIS_CACHE_USERNAME=data_ynm_crawler
export REDIS_CACHE_PASSWORD=sankmsiIm7V0LXh
export REDIS_CACHE_MAX_RETRIES_PER_REQUEST=null
 
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390
export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null

export BUILDER_ENABLE=false
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
 
yarn testing:tr-keyword


**Câu lệnh chạy cho hashtag**

export HTTP_PORT=9020
export GRPC_PORT=9011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
 
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/api/graphql
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
 
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.hashtag_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.hashtag_posts_no_cookie_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source_no_cookie
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.hashtag_posts_no_cookie_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.hashtag_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_HASHTAG_POST_CRAWLER
export CRAWLER_CONFIG_PROXY_NO_COOKIE_CRAWLER_TYPE=TR_HASHTAG_POST_NO_COOKIE_CRAWLER
 
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_ENABLE=false
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=false
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
 
export REDIS_CACHE_HOST=192.168.1.103
export REDIS_CACHE_PORT=6390
export REDIS_CACHE_DB=1
export REDIS_CACHE_USERNAME=data_ynm_crawler
export REDIS_CACHE_PASSWORD=sankmsiIm7V0LXh
 
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390
export REDIS_DB=3
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_MAX_RETRIES_PER_REQUEST=null


yarn testing:tr-hashtag







### Test data 
Phải hoàn thiện được hàm check identity của mình

 'hallofdsh' => '63264009933',
  'uxishowa' => '66987609704',
  'star.zzling' => '71832764913',
  'mylaneisyours' => '73546239084',
  '__8thang2' => '63406302616',
  'atywhd_' => '66651954173',
  'rztolsh' => '72045157459'



  const data = [
  { username: 'hallofdsh', id: '63264009933' },
  { username: 'uxishowa', id: '66987609704' },
  { username: 'star.zzling', id: '71832764913' },
  { username: 'mylaneisyours', id: '73546239084' },
  { username: '__8thang2', id: '63406302616' },
  { username: 'atywhd_', id: '66651954173' },
  { username: 'rztolsh', id: '72045157459' }
];



cl.(mentions_2_solr_mentions|posts_2_solr_tr_posts|tr.identities_finished_sources|identities_2_solr_identities|identities_2_redis_identities|tr.keyword_posts_no_cookie_crawling_sources|tr.keyword_posts_no_cookie_crawling_requests|tr.keyword_posts_no_cookie_crawled_sources|tr.hashtag_posts_no_cookie_crawling_sources|tr.hashtag_posts_no_cookie_crawling_requests|tr.hashtag_posts_no_cookie_crawled_sources|tr.reply_posts_crawling_sources|cl.tr.posts_2_solr_tr_posts)


### Những services cần check ở testing
ynm-cl-tr-keyword-post-no-cookie-service-testing
ynm-cl-tr-hashtag-post-no-cookie-service-testing


### Những services cần check ở staging 
ynm-cl-tr-keyword-post-no-cookie-service-staging -> DONE
- Hiện tại đã insert được xuống Solr,Redis
- Thieu detect
{
        "id":"309fbe4c-2bf8-5cd2-b384-2fd9f250cb67",
        "link":"threads.net/t/DMP3C6RB9DV",
        "id_social":3679401513144799445,
        "id_source":"tr_63662600087",
        "mention_type":1,
        "link_shared":"https://l.threads.com/?u=https%3A%2F%2Fwww.nytimes.com%2F2025%2F06%2F27%2Fus%2Fpolitics%2Fgavin-newsom-fox-news-lawsuit-trump-call.html%3Fcampaign_id%3D60%26emc%3Dedit_na_20250627%26instance_id%3D157390%26nl%3Dbreaking-news%26regi_id%3D259859570%26segment_id%3D200784%26user_id%3D32e4bff974e99d7eb7e6e6f451f2faf0&e=AT1qBEiDMingecu_L9c4D3CZVtAfhp7Er4pl30jNSU2udKcykKwRVXQLck7Wme6KElPLhg4jIeMamefZ7jvx_qroM9sVuBKzvP_ftpR-1cxUQb31ZOXYtg",
        "identity":"tr_63662600087",
        "identity_name":"fuseboxradio",
        "attachment":"{\"media_type\":19}",
        "views":0,
        "likes":0,
        "comments":0,
        "shares":0,
        "engagement_total":0,
        "engagement_s_c":0,
        "search_text":["",
          "Newsom Sues Fox News for Saying He Lied About Call With Trump l New York Times https://www.nytimes.com/2025/06/27/us/politics/gavin-newsom-fox-news-lawsuit-trump-call.html?campaign_id=60&emc=edit_na_20250627&instance_id=157390&nl=breaking-news&regi_id=259859570&segment_id=200784&user_id=32e4bff974e99d7eb7e6e6f451f2faf0",
          "{\"ynm_name\":\"Newsom Sues Fox News for Saying He Lied About Call With Trump\",\"ynm_caption\":\"nytimes.com\",\"ynm_link\":\"https://www.nytimes.com/2025/06/27/us/politics/gavin-newsom-fox-news-lawsuit-trump-call.html?campaign_id=60&emc=edit_na_20250627&instance_id=157390&nl=breaking-news&regi_id=259859570&segment_id=200784&user_id=32e4bff974e99d7eb7e6e6f451f2faf0\"}"],
        "is_to_topic":false,
        "language":-1,
        "domain":"threads.net",
        "mention_type_details":5,
        "platform":10,
        "updated_at":"2025-07-18T11:46:11.889Z",
        "created_date":"2025-07-18T11:41:04Z",
        "link_shared_domain":"nytimes.com"}



// Check mapping_id luồng keyword no-cookie:
{
        "id":"e84ae226-d272-52e4-b1ff-ad3cadd3fc44",
        "link":"threads.net/t/DMo5BTSyWsZ",
        "id_social":3686447073089645337,
        "id_source":"tr_63413191960",
        "mention_type":1,
        "identity":"tr_63413191960",
        "identity_name":"football_buzzer",
        "attachment":"{\"media_type\":1,\"media_src\":\"https://instagram.fsgn5-8.fna.fbcdn.net/v/t51.2885-15/524369353_17915168385119961_299212441126011472_n.webp?efg=eyJ2ZW5jb2RlX3RhZyI6InRocmVhZHMuRkVFRC5pbWFnZV91cmxnZW4uMTA4MHgxMDgwLnNkci5mODI3ODcuZGVmYXVsdF9pbWFnZS5jMiJ9&_nc_ht=instagram.fsgn5-8.fna.fbcdn.net&_nc_cat=109&_nc_oc=Q6cZ2QEx3Mb4ilo1rr7qF6WKOZJE-RgxF2sqovdPEpYMUvlBNfjAes1hGV3FWueMSPhowos&_nc_ohc=lF_4sC5dirIQ7kNvwFKny2O&_nc_gid=p9ANAhC--uJydFytM-qT9w&edm=APs17CUBAAAA&ccb=7-5&ig_cache_key=MzY4NjQ0NzA3MzA4OTY0NTMzNw%3D%3D.3-ccb7-5&oh=00_AfTsToFZpWD9nGVmweBYuK-BB9U6lmmIoR3R0Seyd4kIlg&oe=688D2E0C&_nc_sid=10d13b\"}",
        "views":0,
        "likes":13,
        "comments":0,
        "shares":0,
        "engagement_total":13,
        "engagement_s_c":0,
        "search_text":["",
          "🔵 Chelsea are pushing to sign Jorrel Hato!\n✅ Personal terms agreed — talks ongoing with Ajax.\n🚨 Hato has missed two pre-season games, hoping to force a move.\n[@TheSunFootball]\n#CFC #Ajax #Transfers"],
        "is_to_topic":false,
        "language":-1,
        "domain":"threads.net",
        "mention_type_details":1,
        "platform":10,
        "updated_at":"2025-07-28T10:43:45.723Z",
        "created_date":"2025-07-28T04:59:18Z"
        }


ynm-cl-tr-hashtag-post-no-cookie-service-staging


- Hiện tại đã insert được xuống Solr,Redis
- Thieu detect



      {
        "id":"5a0d5f57-7a1e-5884-9da1-c82ec1487cc8",
        "link":"threads.net/t/DMP1uZDv5Ha",
        "id_social":3679395705052434906,
        "id_source":"tr_63440321672",
        "mention_type":1,
        "link_shared":"https://l.threads.com/?u=https%3A%2F%2Fwww.espn.com%2Fradio%2Fplay%2F_%2Fid%2F45765705&e=AT2RgoesVQOO5oRj2NfhclSWrkmCwXY966j0jKCFJyvOwfmZkfjG3ttRAxcKOnTVV4ApUpUSnaLv1u6wmrCAj3VA48BAgq4M3pJf0tIYHits26hPxkd9Uw",
        "identity":"tr_63440321672",
        "identity_name":"colemanespn",
        "attachment":"{\"media_type\":19}",
        "views":0,
        "likes":0,
        "comments":0,
        "shares":0,
        "engagement_total":0,
        "engagement_s_c":0,
        "search_text":["",
          "Thursday Cool Hour 4 FreddieandHD Showcast w/Me and @HDouglas83 had HD's Top WRs,\nCaitlinClark22 troubles, _TJWatt's new $$$ helping @MicahhParsons11, another edition of Florida Floridaing and mo' Listen Now https://espn.com/radio/play/_/id/45765705\nShare via http://espn.com/app",
          "{\"ynm_name\":\"Freddie and Harry - Hour 4: White or Brown Gravy | ESPN\",\"ynm_caption\":\"espn.com\",\"ynm_link\":\"https://www.espn.com/radio/play/_/id/45765705\"}"],
        "is_to_topic":false,
        "language":-1,
        "domain":"threads.net",
        "mention_type_details":5,
        "platform":10,
        "updated_at":"2025-07-18T11:38:41.799Z",
        "created_date":"2025-07-18T11:29:29Z",
        "link_shared_domain":"espn.com"}

Keyword đã có detect


platform IN ('THREADS')



kubectl config use-context lamtt-k8s-ovh

kubectl get pods -n crawler-staging | grep ynm-cl-tr-keyword-post-no-cookie-service-staging

kubectl get pods -n crawler-staging | grep ynm-cl-tr-hashtag-post-no-cookie-service-staging


kubectl exec -it ynm-cl-tr-keyword-post-no-cookie-service-staging-6dc48994cxzp47 -n crawler-staging -- sh


kubectl logs -f ynm-cl-tr-keyword-post-no-cookie-service-staging-6dc48994cxzp47 -n crawler-staging --sh



kubectl logs -f ymn-cl-tr-keyword-post-no-cookie-service-staging-6dc48994cxzp47 -n crawler-staging





