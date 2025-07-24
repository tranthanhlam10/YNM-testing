# Task improve luông source no-cookie
## Mục tiêu của task 
- Mục tiêu:

   + Giảm tải cho luồng Reply Crawl Post nhằm tránh tình trạng xử lý chậm và tồn đọng message trên queue.

   + Đảm bảo build mention/post/reply đúng với ID của identity, tránh nhầm lẫn giữa Instagram ID và Threads ID.

   + Ngăn chặn vấn đề publish duplicated mention/post/reply qua cho luồng Data Pusher insert vào DB.


## Giải pháp
- Giải pháp:

   + Thêm cơ chế lock theo source trong service resolver của các luồng nhằm đảm bảo không publish duplicated message qua cho luồng Reply Crawl Post xử lý.

   + Ở service crawler của các luồng sẽ thêm bước gọi API dựa trên username từ identity để lấy Threads ID và kiểm tra ID hiện tại có trùng với Threads ID không. Nếu không trùng thì sẽ không tiến hành crawl, thay vào đó sẽ update last status 5 cho identity.

   + Thêm mới filed post_no_cookie_last_date, reply_no_cookie_last_date và repost_no_cookie_last_date vào collection identity để làm cột mốc thời gian dừng nhằm không cho các luồng source no cookie đi crawl các mention/post/reply đã được crawl trước đó.

   + Thêm luồng đi crawl next page cho luồng source no cookie để đảm bảo không bị miss mention/post/reply. Điều kiện để đi crawl next page của luồng source no cookie là kiểm tra ngày tạo của post/reply cuối cùng trong danh sách được crawl về có nằm sau field post_no_cookie_last_date/reply_no_cookie_last_date/repost_no_cookie_last_date của identity không.


## Những thay đổi của luồng
- Gọi API để map lại id_source (Chỗ xử lý khúc sau có khác của Đồng một xíu)
- Sử dụng thêm redis để check dup cho Solr trước ở resolver
- Thêm field mới cho collection identity
- Nếu như crawl lại lần 2 thì push message cho luồng extention chạy 


## Các cases cần check
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
kubectl get pods -n crawler-testing | grep threads-ynmpdp-5121-testing-ynm-crawler-empty
kubectl exec -it threads-ynmpdp-5121-testing-ynm-crawler-empty-5c67cffddb-q5css -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local


Những thông tin liên quan tới token và proxy

TR_SOURCE_REPLY_NO_COOKIE_CRAWLER
TR_REPOST_NO_COOKIE_CRAWLER
TR_SOURCE_POST_NO_COOKIE_CRAWLER




## Các queue cần check



ThreadsSourcePostNoCookieCrawlingLoader
ThreadsRepostNoCookieCrawlingLoader
ThreadsSourceReplyNoCookieCrawlingLoader

cl.mentions_2_solr_mentions
cl.posts_2_solr_tr_posts
cl.tr.identities_finish_sources


- source_post: 
cl.tr.source_posts_no_cookie_crawling_sources
cl.tr.source_posts_no_cookie_crawling_requests 
cl.tr.source_posts_no_cookie_crawled_sources

- source_replies 
cl.tr.source_replies_no_cookie_crawling_sources
cl.tr.source_replies_no_cookie_crawled_sources
cl.tr.source_replies_no_cookie_crawling_requests

- repost
cl.tr.reposts_no_cookie_crawling_sources
cl.tr.reposts_no_cookie_crawling_requests
cl.tr.reposts_no_cookie_crawled_sources



cl.(mentions_2_solr_mentions|tr.posts_2_solr_tr_posts|tr.identities_finished_sources|tr.source_posts_no_cookie_crawling_sources|tr.source_posts_no_cookie_crawling_requests|tr.source_posts_no_cookie_crawled_sources|tr.source_replies_no_cookie_crawling_sources|tr.source_replies_no_cookie_crawling_requests|tr.source_replies_no_cookie_crawled_sources|tr.reposts_no_cookie_crawling_sources|tr.reposts_no_cookie_crawling_requests|tr.reposts_no_cookie_crawled_sources)


cl.(mentions_2_solr_mentions_LamTT|tr.posts_2_solr_tr_posts_LamTT|identities_finished_sources_LamTT|identities_2_redis_identities_LamTT|identities_2_solr_identities_LamTT|tr.source_posts_no_cookie_crawling_sources|tr.source_posts_no_cookie_crawling_requests|tr.source_posts_no_cookie_crawled_sources|tr.source_replies_no_cookie_crawling_sources|tr.source_replies_no_cookie_crawling_requests|tr.source_replies_no_cookie_crawled_sources|tr.reposts_no_cookie_crawling_sources|tr.reposts_no_cookie_crawling_requests|tr.reposts_no_cookie_crawled_sources|tr.source_posts_no_cookie_extension_crawling_sources|tr.source_posts_no_cookie_extension_crawling_requests|tr.source_posts_no_cookie_extension_crawled_sources|tr.source_replies_no_cookie_extension_crawling_sources|tr.source_replies_no_cookie_extension_crawling_requests|tr.source_replies_no_cookie_extension_crawled_sources|tr.reposts_no_cookie_extension_crawling_sources|tr.reposts_no_cookie_extension_crawling_requests|tr.reposts_no_cookie_extension_crawled_sources)


cl.(mentions_2_solr_mentions_LamTT|tr.posts_2_solr_tr_posts_LamTT|identities_finished_sources_LamTT|identities_2_redis_identities_LamTT|identities_2_solr_identities_LamTT|tr.source_posts_no_cookie_crawling_sources|tr.source_posts_no_cookie_crawling_requests|tr.source_posts_no_cookie_crawled_sources|tr.source_replies_no_cookie_crawling_sources|tr.source_replies_no_cookie_crawling_requests|tr.source_replies_no_cookie_crawled_sources|tr.reposts_no_cookie_crawling_sources|tr.reposts_no_cookie_crawling_requests|tr.reposts_no_cookie_crawled_sources|tr.source_posts_no_cookie_extension_crawling_sources|tr.source_posts_no_cookie_extension_crawling_requests|tr.source_posts_no_cookie_extension_crawled_sources|tr.source_replies_no_cookie_extension_crawling_sources|tr.source_replies_no_cookie_extension_crawling_requests|tr.source_replies_no_cookie_extension_crawled_sources|tr.reposts_no_cookie_extension_crawling_sources|tr.reposts_no_cookie_extension_crawling_requests|tr.reposts_no_cookie_extension_crawled_sources)

## Tìm flow để verify lại API identity 

(Chỗ này để nghiên cứu lại sau @@) -> DONE 

Chỗ này lưu ý nếu như id sai thì set status bằng 5 (Khác với luồng hashtag keyword, chỉ đơn giản là nếu có id nó sẽ map -> push vào các queue solr id và redis id)

## Những việc cần phải làm để check task:

- Bật loader để load các keyword hashtag lên
- Chạy luồng builder và crawler để xem có mapping đúng với id mới của user hay không (Tự push vài message có id sai để check thử nó có mapping lại đúng hay không )
- Phải config proxy thành các type tương ứng
- Coi lại nó có cache ở redis hay không
- Cần phải compare data giữa luồng cũ và mới (Ngoài chỗ identity thì các fields còn lại phải chính xác) (Chỉ cần tiệp keyword mình chạy là được)
- Kiểm tra xem nó có đẩy qua luồng extention không

## Script chạy

### Loader

export HTTP_PORT=9993
export LOG_LEVEL=debug
 
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
 
export REDIS_DB=1
 
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_OUTPUT_QUEUE=cl.tr.source_posts_no_cookie_crawling_sources
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_CYCLE="* * * * *"
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=1000
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE=60
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=true
 
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_OUTPUT_QUEUE=cl.tr.source_replies_no_cookie_crawling_sources
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_CYCLE="* * * * *"
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=1000
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE=60
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_ENABLE=true
 
export REPOST_NO_COOKIE_CRAWLING_LOADER_OUTPUT_QUEUE=cl.tr.reposts_no_cookie_crawling_sources
export REPOST_NO_COOKIE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export REPOST_NO_COOKIE_CRAWLING_LOADER_CYCLE="5 * * * *"
export REPOST_NO_COOKIE_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=1000
export REPOST_NO_COOKIE_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE=60
export REPOST_NO_COOKIE_CRAWLING_LOADER_DEFAULT_DATA_DURATION=12months
export REPOST_NO_COOKIE_CRAWLING_LOADER_ENABLE=true
 
yarn start --scope=@ynm/cl-tr-crawling-loader-service






### Post

export HTTP_PORT=9997
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_posts_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source_LamTT
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data_LamTT
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_SOURCE_POST_NO_COOKIE_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
 
yarn start --scope=@ynm/cl-tr-source-post-crawler-service



// Luong extension

export HTTP_PORT=9996
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_DB=3
export REDIS_CACHE_DB=1
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_extension_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie_extension
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_posts_no_cookie_extension_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_extension_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie_extension
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source_LamTT
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie_extension.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data_LamTT
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_SOURCE_POST_NO_COOKIE_EXTENSION_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_SOURCE_POST_NO_COOKIE_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
 
yarn start --scope=@ynm/cl-tr-source-post-crawler-service


### Reply

export HTTP_PORT=9999
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_DB=3
export REDIS_CACHE_DB=1
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_replies_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source_LamTT
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data_LamTT





 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_SOURCE_REPLY_NO_COOKIE_CRAWLER_1
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
 
yarn start --scope=@ynm/cl-tr-source-reply-crawler-service



// Luong extension

export HTTP_PORT=9998
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_DB=3
export REDIS_CACHE_DB=1
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_extension_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie_extension
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_replies_no_cookie_extension_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_replies_no_cookie_extension_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie_extension
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source_LamTT
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_replies_no_cookie_extension.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data_LamTT
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_SOURCE_POST_NO_COOKIE_EXTENSION_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_SOURCE_REPLY_NO_COOKIE_CRAWLER_1
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
 
yarn start --scope=@ynm/cl-tr-source-reply-crawler-service




### Repost 




export HTTP_PORT=9995
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_DB=3
export REDIS_CACHE_DB=1
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reposts_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reposts_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source_LamTT
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data_LamTT
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_REPOST_NO_COOKIE_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1

export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
 
yarn start --scope=@ynm/cl-tr-repost-crawler-service



//Luong extension


export HTTP_PORT=9994
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_DB=3
export REDIS_CACHE_DB=1
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.reposts_no_cookie_extension_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie_extension
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.reposts_no_cookie_extension_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.reposts_no_cookie_extension_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie_extension
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tr.resolved_source_LamTT
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.reposts_no_cookie_extension.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.tr.resolved_data_LamTT
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_SOURCE_POST_NO_COOKIE_EXTENSION_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_SOURCE_REPLY_NO_COOKIE_CRAWLER_1
export CRAWLER_CONFIG_PAGING_ENABLE=true
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
 
yarn start --scope=@ynm/cl-tr-repost-crawler-service



### Updater 

export HTTP_PORT=9987
export GRPC_PORT=9011
  
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
  
export RABBIT_HEARTBEAT=10
  
export IDENTITIES_INPUT_EXCHANGE=cl.tr.resolved_source_LamTT
export IDENTITIES_ROUTING_KEY=cl.*.identities
export IDENTITIES_INPUT_QUEUE=cl.identities_finished_sources_LamTT
export IDENTITIES_ENABLE=true
export IDENTITIES_BATCH_SIZE=100
export IDENTITIES_PREFETCH_MESSAGES=1000

export TR_POSTS_ENABLE=false

  
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
  
export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null
  
yarn testing --scope=@ynm/cl-tr-source-updater-service



### Pusher


export HTTP_PORT=9086
export GRPC_PORT=9011
 
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
 
export RABBIT_HEARTBEAT=10
  
export POST_2_SOLR_TR_POST_INPUT_EXCHANGE=cl.tr.resolved_data_LamTT
export POST_2_SOLR_TR_POST_ROUTING_KEY=cl.10.posts
export POST_2_SOLR_TR_POST_INPUT_QUEUE=cl.tr.posts_2_solr_tr_posts_LamTT
export POST_2_SOLR_TR_POST_ENABLE=true
export POST_2_SOLR_TR_POST_BATCH_SIZE=100
export POST_2_SOLR_TR_POST_PREFETCH_MESSAGES=1000
  
export MENTION_2_SOLR_MENTION_INPUT_EXCHANGE=cl.tr.resolved_data_LamTT
export MENTION_2_SOLR_MENTION_ROUTING_KEY=cl.*.mentions
export MENTION_2_SOLR_MENTION_INPUT_QUEUE=cl.mentions_2_solr_mentions_LamTT
export MENTION_2_SOLR_MENTION_ENABLE=true
export MENTION_2_SOLR_MENTION_BATCH_SIZE=100
export MENTION_2_SOLR_MENTION_PREFETCH_MESSAGES=1000

  
export MENTION_2_SOLR_MENTION_DETECT_LANGUAGE_ENDPOINT_RND_SERVICE=http://rnd-dev.younetmedia.com/en-translation/v1/models/en-translation:predict
export MENTION_2_SOLR_MENTION_DETECT_LANGUAGE_TOKEN_RND_SERVICE=ZGF0YV9kb25nbGg6ZGFzZmJobGtlaHQ5MjNuaw==
export MENTION_2_SOLR_MENTION_DETECT_LANGUAGE_FILTER_RND_SERVICE=['']
export MENTION_2_SOLR_MENTION_DETECT_BATCH_SIZE_RND_SERVICE=64
 
export PROFILE_2_SOLR_IDENTITY_INPUT_EXCHANGE=cl.tr.resolved_data_LamTT
export PROFILE_2_SOLR_IDENTITY_ROUTING_KEY=cl.*.identities
export PROFILE_2_SOLR_IDENTITY_INPUT_QUEUE=cl.identities_2_solr_identities_LamTT
export PROFILE_2_SOLR_IDENTITY_ENABLE=true
export PROFILE_2_SOLR_IDENTITY_BATCH_SIZE=100
export PROFILE_2_SOLR_IDENTITY_PREFETCH_MESSAGES=1000

  
export PROFILE_2_REDIS_IDENTITY_INPUT_EXCHANGE=cl.tr.resolved_data_LamTT
export PROFILE_2_REDIS_IDENTITY_ROUTING_KEY=cl.*.identities
export PROFILE_2_REDIS_IDENTITY_INPUT_QUEUE=cl.identities_2_redis_identities_LamTT
export PROFILE_2_REDIS_IDENTITY_ENABLE=true
export PROFILE_2_REDIS_IDENTITY_BATCH_SIZE=100
export PROFILE_2_REDIS_IDENTITY_PREFETCH_MESSAGES=1000
  

export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
yarn testing --scope=@ynm/cl-threads-pusher-service



### Các cases cần quan tâm
- Hiện tại đã cache vào luồng extention
- Check thêm các cases tương tự cho 2 luồng còn lại
- Check các luồng extention (Quan trọng là check cache, và check load lên queue loader có chính xác hay không)
- Chỗ này cũng get đúng 
- Cần check lại loader sau khi crawl lần 2


ở chỗ luồng no-cookie-extension thì (finalize push qua extension)
+ last_data_date: sẽ là thời gian của bài viết mới nhất được lấy từ luồng no cookie. (Đây là giá trị post_last_data_date mới)
+ to_date: sẽ lấy field last_data_date (giá trị mới) convert thành timestamp.
+ from_date: sẽ lấy giá trị của field post_last_data_date (giá trị cũ từ Solr) convert thành thành timestamp.

+ Publish crawling source qua queue cl.source_replies_no_cookie_extension_crawling_source để cho luồng Source Reply No Cookie Extension đi crawl next page, nếu thỏa điều kiện: ngày tạo của reply cuối cùng > reply_no_cookie_last_date. Bên cạnh đó, thêm phần check locked source để tránh publish duplicated crawling source cho luồng Source Reply No Cookie Extension.


Các cases cần check khi đẩy qua luồng extension:

* So sánh last_data_date với oldest post 

- Nếu như last_data_date = null -> Không quan tâm so sánh các fields khác, không đẩy vào luồng extension -> DONE(Case này chắc chắn đúng )

- Nếu như oldestPost =< last_data_date(to_date): Cases này cũng không push message vào luồng extension 

- Nếu như oldest_post > last_data_date(to_date):  Hiện tại case này sẽ push qua luồng extentions


- Luồng reply không push qua queue reply (Đã log)



// Có khi thằng source post này nó bị lỗi
 


 {
  "id": "68569233627",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 4
    },
    {
      "lte": 1440,
      "delay": 12
    },
    {
      "lte": 2160,
      "delay": 18
    },
    {
      "lte": 999999999,
      "delay": 32
    }
  ],
  "last_data_date": "2025-04-01T08:03:13.913Z",
  "from_date": "1719993793",
  "to_date": "1748745091",
  "platform": 10,
  "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader",
  "link": "threads.net/@tiem_changhy",
  "id_social": "68569233627",
  "username": "tiem_changhy"
}









{
  "id": "63472089649",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 4
    },
    {
      "lte": 1440,
      "delay": 12
    },
    {
      "lte": 2160,
      "delay": 18
    },
    {
      "lte": 999999999,
      "delay": 32
    }
  ],
  "last_data_date": null,
  "from_date": "1719993793",
  "to_date": "1751529793",
  "platform": 10,
  "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader",
  "link": "threads.net/@miule5791",
  "id_social": "63472089649",
  "username": "miule5791"
}



{
  "id": "63472089649",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 4
    },
    {
      "lte": 1440,
      "delay": 12
    },
    {
      "lte": 2160,
      "delay": 18
    },
    {
      "lte": 999999999,
      "delay": 32
    }
  ],
  "last_data_date": null,
  "from_date": "2025-07-04T02:45:52.000Z",
  "to_date": "1751529793",
  "platform": 10,
  "post_no_cookie_last_date": "2025-05-24T02:45:52.000Z",
  "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader",
  "link": "threads.net/@miule5791",
  "id_social": "63472089649",
  "username": "miule5791"
}







// Message mau

{
  "id": "tr_63098113013",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 5
    },
    {
      "lte": 1440,
      "delay": 24
    },
    {
      "lte": 999999999,
      "delay": 48
    }
  ],
  "last_data_date": "2025-05-01T08:03:07.662Z",
  "from_date": "1735727297",
  "to_date": "1751529785",
  "platform": 10,
  "createdBy": "ThreadsRepostNoCookieCrawlingLoader",
  "link": "threads.net/@misthyyyy",
  "startedCrawling": "2025-07-03T08:03:05.897Z",
  "id_social": "63098113013",
  "default_data_duration": "2025-06-01T08:03:05.897Z",
  "username": "misthyyyy"
}




{
  "id": "tr_63098113013",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 5
    },
    {
      "lte": 1440,
      "delay": 24
    },
    {
      "lte": 999999999,
      "delay": 48
    }
  ],
  "last_data_date": "2025-05-01T08:03:07.662Z",
  "from_date": "2025-06-30T02:45:52.000Z",
  "to_date": "1751529785",
  "platform": 10,
  "createdBy": "ThreadsRepostNoCookieCrawlingLoader",
  "repost_no_cookie_last_date": "2025-06-30T02:45:52.000Z"
  "link": "threads.net/@misthyyyy",
  "startedCrawling": "2025-07-03T08:03:05.897Z",
  "id_social": "63098113013",
  "default_data_duration": "2024-07-03T08:03:05.897Z",
  "username": "misthyyyy"
}






{
  "id": "63454508403",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 4
    },
    {
      "lte": 1440,
      "delay": 12
    },
    {
      "lte": 2160,
      "delay": 18
    },
    {
      "lte": 999999999,
      "delay": 32
    }
  ],
  "last_data_date": "2025-05-01T08:03:07.662Z",
  "from_date": "1719993787",
  "to_date": "1751529787",
  "platform": 10,
  "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader",
  "link": "threads.com/@maidora.maidora",
  "id_social": "63454508403",
  "username": "maidora.maidora"
}




{
  "id": "63472089649",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 4
    },
    {
      "lte": 1440,
      "delay": 12
    },
    {
      "lte": 2160,
      "delay": 18
    },
    {
      "lte": 999999999,
      "delay": 32
    }
  ],
  "last_data_date": null,
  "from_date": "1719993787",
  "to_date": "1751682691",
  "platform": 10,
  "createdBy": "ThreadsSourceReplyNoCookieCrawlingLoader",
  "link": "threads.com/@miule5791",
  "id_social": "63472089649",
  "username": "miule5791"
}




f:1750687428
t:1751032355 (thằng này chính là last data date luôn )


- Cần check lại số lượng reply được đẩy qua có đúng hay không (Chỗ này xong task news thì test)

- Phần test cho luồng extenstion -> Check lại crawl có đầy đủ (Chặn dưới theo luồng from_date)

- Phần repost thì logic build mentions sẽ khác với 2 luồng post và reply: From date chỉ dùng để chặng dưới -> Crawl hết các bài từ fromdate về và build thành list -> Sau đó dựa vào field default data date để build mention


message o luong reply
{
  "id": "63472089649",
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-06-27T13:52:35.000Z",
  "from_date": "1750301895",
  "to_date": "1750687428",
  "platform": 10,
  "createdBy": "ThreadsSourceReplyNoCookieExtensionCrawlingLoader",
  "link": "threads.com/@miule5791",
  "id_social": "63472089649",
  "username": "miule5791"
}


{
  "id": "63373544163",
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-07-11T13:52:35.000Z",
  "from_date": "1735095495",
  "to_date": "1750687428",
  "platform": 10,
  "createdBy": "ThreadsSourceReplyNoCookieExtensionCrawlingLoader",
  "link": "threads.com/@_nt.wuan_",
  "id_social": "63373544163",
  "username": "_nt.wuan_"
}




{
  "id": "63472089649",
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-06-27T13:52:35.000Z",
  "from_date": "1750301895",
  "to_date": "1750687428",
  "platform": 10,
  "createdBy": "ThreadsSourceReplyNoCookieExtensionCrawlingLoader",
  "link": "threads.com/@miule5791",
  "id_social": "63472089649",
  "username": "miule5791"
}





{
  "id": "tr_63098113013",
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-07-07T15:12:04.000Z",
  "from_date": "1749524295",
  "to_date": "1748177044",
  "platform": 10,
  "createdBy": "ThreadsRepostNoCookieExtensionCrawlingLoader",
  "link": "threads.net/@misthyyyy",
  "default_data_duration": "2024-07-03T08:03:05.897Z",
  "id_social": "63098113013",
  "username": "misthyyyy"
}



{
  "id": "tr_70449450608",
  "retries": 0,
  "delay_time_rules": [],
  "last_data_date": "2025-07-07T15:12:04.000Z",
  "from_date": "1735700295",
  "to_date": "1748177044",
  "platform": 10,
  "createdBy": "ThreadsRepostNoCookieExtensionCrawlingLoader",
  "link": "threads.net/@quynhanhshyn_",
  "default_data_duration": "2025-01-01T08:03:05.897Z",
  "id_social": "70449450608",
  "username": "quynhanhshyn_"
}




+ Luồng source post extension đã crawl đủ bài -> DONE
+ Luồng source reply extension chưa crawl đủ bài -> Not done -> Can xem lai luong reply (Hiện tại số lượng push qua mentions đã chính xác, nhưng số lượng repost thì chưa đúng)
+ Luồng repost extension đã crawl đủ bài -> DONE 



Message trong queue posts bị dư 3 field  
"engage_repost": 169,
"engage_quote": 1,
"engage_reshare": 43

Luồng reply tương tự như source post, cũng bị dư tương tự 3 field trên
Luồng reply có cache các reply lên Redis

Luồng repost tương tự như source post, cũng bị dư tương tự 3 field trên



Message trong queue mention
Bên phần source_post đã đúng với format 
Bên phần source_reply đã đúng với format 
Bên phần source_repost đã đúng với format 


Message trong queue finished source
Bên phần source_post đã đúng format
Bbên phần source_reply đã đúng với format
Bbên phần source_repost đã đúng với format


Message trong queue identities 
Bên phần source_post đã đúng với format
Bên phần source_replies đã đúng với format


- Chạy luông có cookie cũ -> Compare data 



## Những service cần check lại ở các luồng sources

ynm-cl-tr-source-reply-no-cookie-service-testing -> DONE
ynm-cl-tr-source-reply-extension-service-testing -> DONE

ynm-cl-tr-source-post-no-cookie-service-testing -> DONE
ynm-cl-tr-source-post-extension-service-testing -> DONE


ynm-cl-tr-repost-no-cookie-service-testing -> DONE
ynm-cl-tr-repost-extension-service-testing -> DONE (Lên staging check lại nguyên nhân không đẩy xuống mentions)



cl.(mentions_2_solr_mentions|tr.posts_2_solr_tr_posts|tr.identities_finished_sources|identities_2_redis_identities|identities_2_solr_identities|tr.source_posts_no_cookie_crawling_sources|tr.source_posts_no_cookie_crawling_requests|tr.source_posts_no_cookie_crawled_sources|tr.source_replies_no_cookie_crawling_sources|tr.source_replies_no_cookie_crawling_requests|tr.source_replies_no_cookie_crawled_sources|tr.reposts_no_cookie_crawling_sources|tr.reposts_no_cookie_crawling_requests|tr.reposts_no_cookie_crawled_sources|tr.source_posts_no_cookie_extension_crawling_sources|tr.source_posts_no_cookie_extension_crawling_requests|tr.source_posts_no_cookie_extension_crawled_sources|tr.source_replies_no_cookie_extension_crawling_sources|tr.source_replies_no_cookie_extension_crawling_requests|tr.source_replies_no_cookie_extension_crawled_sources|tr.reposts_no_cookie_extension_crawling_sources|tr.reposts_no_cookie_extension_crawling_requests|tr.reposts_no_cookie_extension_crawled_sources)



## Những service cần check lại ở các luồng sources
ynm-cl-tr-source-reply-no-cookie-service-staging 
ynm-cl-tr-source-reply-extension-service-staging

ynm-cl-tr-source-post-no-cookie-service-staging
ynm-cl-tr-source-post-extension-service-staging


ynm-cl-tr-repost-no-cookie-service-staging 
ynm-cl-tr-repost-extension-service-staging


Hiện tại loader đã load đúng với yêu cầu



{
  "id": "63444134794",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 4
    },
    {
      "lte": 1440,
      "delay": 12
    },
    {
      "lte": 2160,
      "delay": 18
    },
    {
      "lte": 999999999,
      "delay": 32
    }
  ],
  "last_data_date": "2025-05-25T08:03:13.913Z",
  "from_date": "1719993793",
  "to_date": "1751529793",
  "platform": 10,
  "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader",
  "link": "threads.net/@yeolan___",
  "id_social": "63444134794",
  "username": "yeolan___"
}


// Message có đẩy qua extension
{
  "id": "63444134794",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 4
    },
    {
      "lte": 1440,
      "delay": 12
    },
    {
      "lte": 2160,
      "delay": 18
    },
    {
      "lte": 999999999,
      "delay": 32
    }
  ],
  "last_data_date": "2024-07-06T10:42:20.960Z",
  "from_date": "1751798540",
  "to_date": "1753267340",
  "platform": 10,
  "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader",
  "link": "threads.net/@yeolan___",
  "id_social": "63444134794",
  "is_first_crawled": false,
  "username": "yeolan___"
}


// Message không đẩy qua extension
{
  "id": "63444134794",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 4
    },
    {
      "lte": 1440,
      "delay": 12
    },
    {
      "lte": 2160,
      "delay": 18
    },
    {
      "lte": 999999999,
      "delay": 32
    }
  ],
  "last_data_date": "2025-07-23T10:42:20.960Z",
  "from_date": "1751798540",
  "to_date": "1753267340",
  "platform": 10,
  "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader",
  "link": "threads.net/@yeolan___",
  "id_social": "63444134794",
  "is_first_crawled": false,
  "username": "yeolan___"
}



{
  "id": "74081456906",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 720,
      "delay": 4
    },
    {
      "lte": 1440,
      "delay": 12
    },
    {
      "lte": 2160,
      "delay": 18
    },
    {
      "lte": 999999999,
      "delay": 32
    }
  ],
  "last_data_date": "2024-07-06T10:42:20.960Z",
  "from_date": "1751798540",
  "to_date": "1753267340",
  "platform": 10,
  "createdBy": "ThreadsSourcePostNoCookieCrawlingLoader",
  "link": "threads.net/@lamoonlmao",
  "id_social": "74081456906",
  "is_first_crawled": false,
  "username": "lamoonlmao"
}