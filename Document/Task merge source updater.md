# Task merge source updater


## Vấn đề

Hiện tại hệ thống đang chia source updater theo từng platform nên khó cho việc maintain và monitor dữ liệu.

## Mục tiêu

Merge các source updater của các platform: Facebook, Tiktok, Threads thành 1 service duy nhất
Tất cả các luồng updater đều sẽ đẩy dữ liệu vào queue và service updater mới này sẽ là nơi tập trung xử lý toàn bộ dữ liệu đó.


## Giải pháp

Viết mới 1 service sẽ tổng hợp lại các source-updater của các platform: Facebook, Tiktok, Threads. 
Cập nhật các exchange của các luồng có update thành cl.resolved_source


## Cách chạy

// Câu regex trên RabbitMQ
cl.fb.engagements_by_topic_finished_sources|cl.fb.identities_finished_sources|cl.fb.fb_posts_finished_sources|article_titles|cl.news.category_links_finished_sources|cl.tr.potential_identities_finished_sources|cl.tr.identities_finished_sources|cl.tr.posts_finished_sources|cl.tr.posts_by_topic_finished_sources|cl.tr.replies_finished_sources|cl.summary_mentions_finished_sources|cl.tt.identities_finished_sources|cl.tt.posts_info_finished_sources|testing.cl.identities_finished_sources


// Câu regex mới nhất
cl.fb.engagements_by_topic_finished_sources|cl.fb.identities_finished_sources|cl.fb.fb_posts_finished_sources|article_titles|cl.news.category_links_finished_sources|cl.tr.potential_identities_finished_sources|cl.tr.identities_finished_sources|cl.tr.posts_finished_sources|cl.tr.posts_by_topic_finished_sources|cl.tr.replies_finished_sources|cl.summary_mentions_finished_sources|cl.tt.identities_finished_sources|cl.tt.posts_info_finished_sources|testing.cl.identities_finished_sources


// Câu lệnh ở k8s
ynmpdp-5066-2-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-5066-2-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5066-2-testing-ynm-crawler-empty-fdb87c66b-7hh5h -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


export IDENTITIES_ENABLE_REDIS_SERVICE=true


// Câu lệnh chạy của Khiêm 



export HTTP_PORT=9876
export LOG_LEVEL=debug
 
# * All platforms *
export IDENTITIES_ENABLE=false
 
# * Facebook *
export FB_POST_ENABLE=false
export FB_POST_MAX_WAITING_TIME=1
export FB_POST_PREFETCH_MESSAGES=1000
export FB_POST_BATCH_SIZE=100
 
# export FB_IDENTITIES_ENABLE=true
# export FB_IDENTITIES_MAX_WAITING_TIME=60
# export FB_IDENTITIES_PREFETCH_MESSAGES=1000
# export FB_IDENTITIES_BATCH_SIZE=100
 
export ENGAGEMENTS_BY_TOPIC_ENABLE=false
export ENGAGEMENTS_BY_TOPIC_MAX_WAITING_TIME=1
export ENGAGEMENTS_BY_TOPIC_PREFETCH_MESSAGES=1000
export ENGAGEMENTS_BY_TOPIC_BATCH_SIZE=100
 
# * News *
export ARTICLE_TITLE_UPDATER_ENABLE=false
export ARTICLE_TITLE_UPDATER_MAX_WAITING_TIME=1
export ARTICLE_TITLE_UPDATER_PREFETCH_MESSAGES=1000
export ARTICLE_TITLE_UPDATER_BATCH_SIZE=100
 
export CATEGORY_LINK_UPDATER_ENABLE=false
export CATEGORY_LINK_UPDATER_MAX_WAITING_TIME=1
export CATEGORY_LINK_UPDATER_PREFETCH_MESSAGES=1000
export CATEGORY_LINK_UPDATER_BATCH_SIZE=100
 
# * Threads *
# export TR_KEYWORD_ENABLE=false
# export TR_KEYWORD_MAX_WAITING_TIME=60
# export TR_KEYWORD_PREFETCH_MESSAGES=1000
# export TR_KEYWORD_BATCH_SIZE=100
 
# export TR_HASHTAG_ENABLE=true
# export TR_HASHTAG_MAX_WAITING_TIME=60
# export TR_HASHTAG_PREFETCH_MESSAGES=1000
# export TR_HASHTAG_BATCH_SIZE=100
 
export POTENTIAL_IDENTITIES_ENABLE=false
export POTENTIAL_IDENTITIES_MAX_WAITING_TIME=1
export POTENTIAL_IDENTITIES_PREFETCH_MESSAGES=1000
export POTENTIAL_IDENTITIES_BATCH_SIZE=100
 
# export TR_IDENTITIES_ENABLE=true
# export TR_IDENTITIES_MAX_WAITING_TIME=3
# export TR_IDENTITIES_PREFETCH_MESSAGES=1000
# export TR_IDENTITIES_BATCH_SIZE=100
 
export TR_POSTS_ENABLE=true
export TR_POSTS_MAX_WAITING_TIME=1
export TR_POSTS_PREFETCH_MESSAGES=1000
export TR_POSTS_BATCH_SIZE=100
 
export TR_POSTS_BY_TOPIC_ENABLE=false
export TR_POSTS_BY_TOPIC_MAX_WAITING_TIME=1
export TR_POSTS_BY_TOPIC_PREFETCH_MESSAGES=1000
export TR_POSTS_BY_TOPIC_BATCH_SIZE=100
 
export TR_REPLIES_ENABLE=false
export TR_REPLIES_MAX_WAITING_TIME=1
export TR_REPLIES_PREFETCH_MESSAGES=1000
export TR_REPLIES_BATCH_SIZE=100
 
# * TikTok *
# export TT_IDENTITIES_ENABLE=false
# export TT_IDENTITIES_MAX_WAITING_TIME=60
# export TT_IDENTITIES_PREFETCH_MESSAGES=1000
# export TT_IDENTITIES_BATCH_SIZE=100
 
export TT_POSTS_ENABLE=false
export TT_POSTS_MAX_WAITING_TIME=1
export TT_POSTS_PREFETCH_MESSAGES=1000
export TT_POSTS_BATCH_SIZE=100
 
export TRANSCRIPT_ENABLE=false
export TRANSCRIPT_MAX_WAITING_TIME=1
export TRANSCRIPT_PREFETCH_MESSAGES=1000
export TRANSCRIPT_BATCH_SIZE=100

# export REDIS_HOST=192.168.1.103
# export REDIS_PORT=6390 
# export REDIS_DB=3
# export REDIS_CACHE_DB=1
# export REDIS_MAX_RETRIES_PER_REQUEST=null
 
yarn testing --scope=@ynm/cl-source-updater-service

-> Hiện tại câu lệnh này đã chạy được thành công


// Câu lệnh chạy của Đồng


export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
    
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
    
export RABBIT_HEARTBEAT=10
   
export IDENTITIES_INPUT_EXCHANGE=cl.resolved_source
export IDENTITIES_ROUTING_KEY=cl.*.identities
export IDENTITIES_INPUT_QUEUE=cl.identities_finished_sources
export IDENTITIES_BATCH_SIZE=1
export IDENTITIES_PREFETCH_MESSAGES=1000
export IDENTITIES_MAX_WAITING_TIME=60
export IDENTITIES_ENABLE=true
   
 
export FB_POST_INPUT_EXCHANGE=cl.resolved_source
export FB_POST_ROUTING_KEY=cl.1.posts
export FB_POST_INPUT_QUEUE=cl.fb.fb_posts_finished_sources
export FB_POST_MAX_WAITING_TIME=60
export FB_POST_BATCH_SIZE=1
export FB_POST_PREFETCH_MESSAGES=1000
export FB_POST_ENABLE=true
 
 
export TR_POSTS_INPUT_EXCHANGE=cl.resolved_source
export TR_POSTS_ROUTING_KEY=cl.10.posts
export TR_POSTS_INPUT_QUEUE=cl.tr.posts_finished_sources
export TR_POSTS_MAX_WAITING_TIME=60
export TR_POSTS_BATCH_SIZE=1
export TR_POSTS_PREFETCH_MESSAGES=1000
export TR_POSTS_ENABLE=true
 
 
export TR_POSTS_BY_TOPIC_INPUT_EXCHANGE=cl.resolved_source
export TR_POSTS_BY_TOPIC_ROUTING_KEY=cl.10.posts_by_topic
export TR_POSTS_BY_TOPIC_INPUT_QUEUE=cl.tr.posts_by_topic_finished_sources
export TR_POSTS_BY_TOPIC_MAX_WAITING_TIME=60
export TR_POSTS_BY_TOPIC_BATCH_SIZE=1
export TR_POSTS_BY_TOPIC_PREFETCH_MESSAGES=1000
export TR_POSTS_BY_TOPIC_ENABLE=true
 
 
export TR_KEYWORD_INPUT_EXCHANGE=cl.resolved_source
export TR_KEYWORD_ROUTING_KEY=cl.10.keyword_posts
export TR_KEYWORD_INPUT_QUEUE=cl.tr.keyword_posts_finished_sources
export TR_KEYWORD_MAX_WAITING_TIME=60
export TR_KEYWORD_BATCH_SIZE=1
export TR_KEYWORD_PREFETCH_MESSAGES=1000
export TR_KEYWORD_ENABLE=true
 
 
export TR_KEYWORD_INPUT_EXCHANGE=cl.resolved_source
export TR_KEYWORD_ROUTING_KEY=cl.10.replies
export TR_KEYWORD_INPUT_QUEUE=cl.tr.keyword_posts_finished_sources
export TR_KEYWORD_MAX_WAITING_TIME=60
export TR_KEYWORD_BATCH_SIZE=1
export TR_KEYWORD_PREFETCH_MESSAGES=1000
export TR_KEYWORD_ENABLE=true
 
 
export TT_POSTS_INPUT_EXCHANGE=cl.resolved_source
export TT_POSTS_ROUTING_KEY=cl.9.posts
export TT_POSTS_INPUT_QUEUE=cl.tt.posts_info_finished_sources
export TT_POSTS_MAX_WAITING_TIME=60
export TT_POSTS_BATCH_SIZE=1
export TT_POSTS_PREFETCH_MESSAGES=1000
export TT_POSTS_ENABLE=true
 
 
export TT_KEYWORD_INPUT_EXCHANGE=cl.resolved_source
export TT_KEYWORD_ROUTING_KEY=cl.2.keyword
export TT_KEYWORD_INPUT_QUEUE=cl.tt.keyword_posts_finished_sources
export TT_KEYWORD_MAX_WAITING_TIME=60
export TT_KEYWORD_BATCH_SIZE=1
export TT_KEYWORD_PREFETCH_MESSAGES=1000
export TT_KEYWORD_ENABLE=true
 
 
export TT_TRENDING_INPUT_EXCHANGE=cl.resolved_source
export TT_TRENDING_ROUTING_KEY=cl.9.posts_trending
export TT_TRENDING_INPUT_QUEUE=cl.tt.ads_posts_finished_sources
export TT_TRENDING_MAX_WAITING_TIME=60
export TT_TRENDING_BATCH_SIZE=1
export TT_TRENDING_PREFETCH_MESSAGES=1000
export TT_TRENDING_ENABLE=true
 
   
export REDIS_MAX_RETRIES_PER_REQUEST=null
   
NODE_ENV=staging yarn start --scope=@ynm/cl-source-updater-service



## Message ở từng queue


cl.fb.engagements_by_topic_finished_sources
cl.fb.identities_finished_sources
cl.fb.fb_posts_finished_sources

article_titles (no prefix)
cl.news.category_links_finished_sources
cl.tr.potential_identities_finished_sources
cl.tr.identities_finished_sources
cl.tr.posts_finished_sources
cl.tr.posts_by_topic_finished_sources
cl.tr.replies_finished_sources
cl.summary_mentions_finished_sources

{
  "transcriptTrackingId": "ID message",
  "id_classification_request": 1,
  "id_topic": 101311,
  "task_type": "SUMMARY",
  "mentions": [
    {
      "id": "1",
      "search_text": [
        "",
        "Nội dung transcript 2"
      ],
      "mention_type": 1,
      "transcript": "vậy do tao ngu mà SAO mày đi trốn đi\nbác sĩ kiếm mày kìa mày chỉ nhà con Chi vậy\nmẹ em có nhà hông Khang\nem hông có nhà nên em hông biết bác sĩ ơi kiếm tui Chi\nchúc mừng chị em Khang đã hết bệnh nói thiệt với bác sĩ á\nnó hết khùng nhưng mà nó ngu\nkêu nó đặt 4 mâm đặng mừng nhỏ em nó đậu đại học\nmà nó xuống bà 8 Nan á\nnó quất 40 mâm chứ nó đậu đại học không bà ăn 4 mâm rồi\ngiờ con hết bệnh bàn thêm BA 6 mâm nữa\nđược hông ăn thì cũng ăn vừa vừa thôi\ngiờ mày hồi người ta bớt được hông hồi SAO kịp nữa\nTao tới luôn rồi kìa\ncó AI CA đâu mà mướn nhạc sống Chi nữa\nvậy đám tiệc phải có vài nhạc chứ mẹ\nbà con AI thích dân nghệ thì lên CA thôi\nđầu cổ nó gói nùi vậy á rồi thấy đường đánh nhạc hông\nchứ hổng phải là do anh chơi đàng hoàng tử\nCho nên Việt Nam với anh số đèn quá nhập tâm\nbởi vậy anh nhập viện luôn rồi đó\nủa mày mới nói bữa nay Cha về mà\nSAO giờ chưa thấy nữa Cha về tới rồi nè\nhông lẽ sư phụ là là chồng của mẹ\nđúng rồi chồng của Tao á là Cha của mày đó\nnhận người thân phải quay vòng vòng vậy đó hả\ntới lượt mẹ kìa\nbà là mẹ của sư phụ\nhổng lẽ bà là đúng rồi\nmẹ chồng của Tao á là bà nội của mày đó\ntừ lúc mày bệnh mày quay video mày đưa lên mạng\ncả nhà hông biết mày làm quần què gì ở trển nữa\nnhưng cũng vì thương con mà mọi người\nthỏa thân làm một thiên vật\ntrời ơi\nhóa thân chứ hông phải là thỏa thân đâu bà đám lại ha\nnhưng cũng vì thương con\nmà mọi người hóa thân thành những nhân vật\nđể quay video với mày\ndọn lên được chưa\ntí nữa 2 dọn chị ơi\nđó giờ người ta đồn á mẹ ngoại tình với ông sư phụ\nmà ông đâu có tin\ngiờ ông tin rồi\nmà mặt ổng Ra SAO con muốn biết luôn á mẹ\nthì mặt của nó cũng giống y hệt mặt Cha mày thôi\ncởi khẩu trang Cho con nó coi đi anh\ngiở đại Cho nó coi đi\nmày đứng đó mày nại hoài lỗ Tai\nnay SAO hổng ngứa quá trời vậy\ntối rồi đó Cha\ntrời trời muốn thấy mặt ổng SAO khó dữ vậy\nta bây giờ Tao đếm một 2 BA mày gỡ Ra nghen\nmột cúp điện lấy đèn pin Cho mẹ liếng coi\nnó có nhà đâu mà kiểu lấy đèn pin Cho bà\ngiờ nó ở đâu rồi\nthi đại học xong á là nó xuống xe fonex để đổi điểm nhận vô\nchợ rồi mẹ chương\ntrình lên cấp máy mới lên đời\ndiễn Ra từ nay đến hết tháng 10\nnó mua sắm để nhận được quà độc quyền từ xe fonex đó mẹ\nkiếm con Chi vậy mẹ\ncó điện rồi khỏi đâu"
    }
  ],
  "aiResults": [
    {
      "id": "1",
      "summary_text": "Người nhà đang tìm Khang, người vừa hết bệnh. Mẹ Khang không có nhà. Gia đình dự định đặt 4 mâm cỗ mừng Khang đậu đại học, nhưng Khang lại muốn đặt 40 mâm. Sau khi hết bệnh, gia đình sẽ đặt thêm 36 mâm nữa để ăn mừng."
    }
  ]
}



cl.tt.identities_finished_sources
cl.tt.posts_info_finished_sources

cl.tt.ads_posts_finished_sources




### Câu lệnh chạy của các luồng Threads

1. Luồng crawl potential


Wiki:
https://wiki.younetco.com/pages/viewpage.action?pageId=221282665




// Loader

export NODE_ENV=testing
 
export HTTP_PORT=9999
export GRPC_PORT=9011
    
export LOG_LEVEL=debug
export RABBIT_HEARTBEAT=10
    
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_OUTPUT_QUEUE=cl.tr.potential_identities_crawling_sources
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=10000
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_CYCLE="*/5 * * * *"
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=1000
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_CRAWL_INTERVAL="30days"
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_ENABLE=true
    
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
    
export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
export MONGO_NEWS_USERNAME="data_huynvq"
export MONGO_NEWS_PASSWORD="S45Hdasdffo"
export MONGO_NEWS_DATABASE="socialheat_testing"
export MONGO_NEWS_REPLICA_SET="rs0"
    
yarn start --scope=@ynm/cl-tr-crawling-loader-service

// Crawler

export NODE_ENV=testing
 
export HTTP_PORT=9998
export GRPC_PORT=9011
   
export LOG_LEVEL=debug
export RABBIT_HEARTBEAT=10
  
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAXRETRIES=5
   
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.potential_identities_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.potential_identities_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.potential_identities_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.potential_identities
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.potential_identities
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=""
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_POTENTIAL_IDENTITY_CRAWLER
   
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
export BUILDER_ENABLE=false
   
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
export CRAWLER_ENABLE=true
  
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=5
export RESOLVER_ENABLE=true
   
yarn start --scope=@ynm/cl-tr-identity-crawler-service





2. Luồng comment - update lại posts

// Loader

export HTTP_PORT=9013
export GRPC_PORT=9011

export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658

export MYSQL_NEWS_APP_CONNECTION_PASSWORD=kejudsY%44sd
export MYSQL_DEFAULT_CONNECTION_HOST=192.168.1.252
export MYSQL_DEFAULT_CONNECTION_USER=crawler
export MYSQL_NEWS_APP_CONNECTION_HOST=192.168.1.252
export MYSQL_NEWS_APP_CONNECTION_USER=crawler
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_PORT=6033
export MYSQL_DEFAULT_CONNECTION_PORT=6033
export MYSQL_NEWS_APP_CONNECTION_PORT=6033
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_PASSWORD=kejudsY%44sd
export MYSQL_DEFAULT_CONNECTION_PASSWORD=kejudsY%44sd
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_HOST=192.168.1.252
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_USER=crawler

export THREADS_KEYWORD_POST_CRAWLING_LOADER_ENABLE=false
export THREADS_KEYWORD_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false
export THREADS_HASHTAG_POST_CRAWLING_LOADER_ENABLE=false
export THREADS_HASHTAG_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false
export THREADS_SOURCE_POST_CRAWLING_LOADER_ENABLE=false
export THREADS_SOURCE_POST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false
export SOURCE_REPLY_CRAWLING_LOADER_ENABLE=false
export SOURCE_REPLY_NO_COOKIE_CRAWLING_LOADER_ENABLE=false

export PRIORITY_POST_COMMENT_CRAWLING_LOADER_ENABLE=true
export CRISIS_POST_COMMENT_CRAWLING_LOADER_ENABLE=true
export COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=true
export PRIORITY_COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=true
export CRISIS_COMMENT_SUB_COMMENT_CRAWLING_LOADER_ENABLE=true
export POST_COMMENT_CRAWLING_LOADER_ENABLE=true

export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_ENABLE=false
export REPOST_CRAWLING_LOADER_ENABLE=false
export REPOST_NO_COOKIE_CRAWLING_LOADER_ENABLE=false
export THREADS_FOLLOWERS_CRAWLING_LOADER_ENABLE=false
export THREADS_IDENTITY_CRAWLING_LOADER_ENABLE=false
export THREADS_POTENTIAL_IDENTITY_CRAWLING_LOADER_ENABLE=false


export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null

yarn testing:tr-loader



// Crawler
export HTTP_PORT=6010
export GRPC_PORT=6011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
 
export MYSQL_DEFAULT_CONNECTION_PORT=3306
export MYSQL_DEFAULT_CONNECTION_DATABASE=monitoring_master
export MYSQL_DEFAULT_NEWS_PORT=3306
export MYSQL_DEFAULT_NEWS_DATABASE=monitoring_master

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
export TR_GRAPH_SERVICE_DELAY_TIMEOUT=3000

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.posts_comment_crawling_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.comments
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.posts_comment_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.posts_comment_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.comments.next_page

export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_KEYWORD_POST_NO_COOKIE_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_TYPE=posts
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390
export REDIS_DB=3

export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=5000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1

export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1

yarn testing:tr-reply-crawler





3. Luồng sub comment - update lại replies


export HTTP_PORT=6010
export GRPC_PORT=6011
export RABBIT_HEARTBEAT=10
export LOG_LEVEL=info
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658

export MYSQL_DEFAULT_CONNECTION_PORT=3306
export MYSQL_DEFAULT_CONNECTION_DATABASE=monitoring_master
export MYSQL_DEFAULT_NEWS_PORT=3306
export MYSQL_DEFAULT_NEWS_DATABASE=monitoring_master

export TOKEN_MANAGER_SERVICE_PORT=9011
export TOKEN_MANAGER_SERVICE_ACCESS_KEY=XCKx6Scss+fq+cHyNNX2Tw==
export PROXY_MANAGER_SERVICE_PORT=9011
export PROXY_MANAGER_SERVICE_ACCESS_KEY=RpctiXNGzMXP7kza2QHV+A==

export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/graphql/query
export TR_GRAPH_SERVICE_TIMEOUT=60000
export TR_GRAPH_SERVICE_MAX_RETRIES=10
export TR_GRAPH_SERVICE_DELAY_TIMEOUT=3000

export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.posts_sub_comment_crawling_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.sub_comments
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.posts_sub_comment_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.posts_sub_comment_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.sub_comments.next_page
 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_PAGING_ENABLE=true
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_HASHTAG_POST_CRISIS_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_TYPE=replies
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390 
export REDIS_DB=3
 
export BUILDER_ENABLE=true
export BUILDER_MAX_MSG_IN_QUEUE=1000
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1

export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1

export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1

yarn testing:tr-reply-crawler

4. Luồng threads post by topic

Wiki: 
https://wiki.younetco.com/display/FB/%5BThreads%5D+Get+Engagement+Of+Posts+By+Topic


// Loader
export HTTP_PORT=9998
export GRPC_PORT=9011
 
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
 
export RABBIT_HEARTBEAT=10
 
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_OUTPUT_QUEUE=cl.tr.post_engagement_by_topic_crawling_sources
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_CYCLE="*/10 * * * * *"
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_DEFAULT_DATA_DURATION: 1months
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_TOPIC_LOAD_BATCH_SIZE=5
export POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_ENABLE=true
 
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
 
export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
yarn testing --scope=@ynm/cl-tr-crawling-loader-service


// Crawler

export HTTP_PORT=9999
export GRPC_PORT=9011
 
export LOG_LEVEL=debug
export RABBIT_HEARTBEAT=10
 
export TR_GRAPH_SERVICE_ENDPOINT=https://www.threads.net/api/graphql
export TR_GRAPH_SERVICE_TIMEOUT=30000
export TR_GRAPH_SERVICE_MAXRETRIES=10
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.post_engagement_by_topic_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.*.*.post_engagement_by_topic_crawling_source
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.post_engagement_by_topic_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.post_engagement_by_topic_crawled_sources
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TR_KEYWORD_POST_CRISIS_CRAWLER_LamTT
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_KEYWORD_POST_CRITICAL_NO_COOKIE_CRAWLER_LAMTT
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=5
 
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3
 
yarn testing --scope=@ynm/cl-tr-post-engagement-by-topic-crawler-service


// Updater

export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
 
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
 
export RABBIT_HEARTBEAT=10
 
export TR_POSTS_BY_TOPIC_INPUT_EXCHANGE=cl.tr.resolved_source
export TR_POSTS_BY_TOPIC_ROUTING_KEY=cl.10.posts_by_topic
export TR_POSTS_BY_TOPIC_INPUT_QUEUE=cl.tr.posts_by_topic_finished_sources
export TR_POSTS_BY_TOPIC_ENABLE=true
export TR_POSTS_BY_TOPIC_BATCH_SIZE=100
export TR_POSTS_BY_TOPIC_PREFETCH_MESSAGES=1000
 
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
 
export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
yarn testing --scope=@ynm/cl-tr-source-updater-service



5. Luồng crawl identity -> Update xuống identity


// Loader




// Crawler

export HTTP_PORT=9997
export LOG_LEVEL=debug
 
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tr.source_posts_no_cookie_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tr.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tr.source_posts_no_cookie_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.10.*.*.source_posts_no_cookie.next_page
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_PAGING_ENABLE=false
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=1
 
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
export RESOLVER_MAX_RETRIES=3

export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390
export REDIS_DB=3
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_MAX_RETRIES_PER_REQUEST=null
    
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_USERNAME=data_crawler_use_cache_post
export REDIS_POST_PASSWORD=RHTkP9M79at6
export REDIS_POST_DB=12
 
yarn start --scope=@ynm/cl-tr-source-post-crawler-service




### Câu lệnh chạy của các luồng Facebook


1. Update vào identity

Wiki:
https://wiki.younetco.com/display/FB/%5BFacebook%5D+Update+Identity+Info




export HTTP_PORT=9010
 
export LOG_LEVEL=debug
 
export FB_GRAPH_SERVICE_ENDPOINT=https://www.facebook.com/api
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.identity_graphql_identities_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.identity_graphql_identities_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.identity_graphql
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.identity_graphql_identities_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.*.*.identity_graphql
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_API_CRAWLER_VN
 
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
 
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
 
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=10
 
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-identity-graphql-crawler-service


2. Update vào post


cl.fb.page_web|cl.fb.group_web

-> Chạy luồng page web comment

export FB_GRAPH_SERVICE_ENDPOINT=https://www.facebook.com/api
 
export LOG_LEVEL=info
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=null
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=null
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.page_web_comments_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.page_web_comments_crawling_requests
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.2.*.comments-web
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.page_web_comments_crawled_sources
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.2.*.comments-web.next_page
  
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
 
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_API_CRAWLER_VN
  
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=10
   
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=10
   
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=10
  
export HTTP_PORT=9013
 
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_MAX_RETRIES_PER_REQUEST=null
export REDIS_DB=3
   
yarn testing:web-comment


-> Chạy luồng group web comment


export FB_GRAPH_SERVICE_ENDPOINT=https://www.facebook.com/api
 
export LOG_LEVEL=info
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_EXCHANGE=null
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=null
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.group_web_comments_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.group_web_comments_crawling_requests
   
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.3.*.comments-web
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.group_web_comments_crawled_sources
   
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.3.*.comments-web.next_page
   
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
  
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_API_CRAWLER_VN
   
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=10
    
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=10
    
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=10
   
export HTTP_PORT=9013
 
export REDIS_HOST=192.168.1.103
export REDIS_PORT=6390
export REDIS_USERNAME=data_ynm_crawler_use_identity
export REDIS_PASSWORD=TzdcdL6SCIyFdLM
export REDIS_MAX_RETRIES_PER_REQUEST=null
export REDIS_DB=3
   
yarn testing:web-comment





Wiki: (Có luồng của chị Trang đang test -> Hỏi thử)

https://wiki.younetco.com/pages/viewpage.action?pageId=178880731


3. Update engagement by topic

Wiki:
https://wiki.younetco.com/display/FB/%5BFACEBOOK%5D+WEB+ENGAGEMENT+AND+PARALLEL+WITH+TOKEN+FLOW
https://wiki.younetco.com/display/~donglh/%5BFACEBOOK%5D+WEB+COMMENT+RUN+POD



// Loader
export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
  
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
  
export RABBIT_HEARTBEAT=10
 
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
 
export ENGAGEMENT_BY_TOPIC_LOADER_ENABLE=true
export ENGAGEMENT_BY_TOPIC_LOADER_OUTPUT_QUEUE=cl.fb.engagement_by_topic_crawling_sources
export ENGAGEMENT_BY_TOPIC_LOADER_MAX_MSG_IN_QUEUE=5000
export ENGAGEMENT_BY_TOPIC_LOADER_CYCLE='* * * * *'
export ENGAGEMENT_BY_TOPIC_LOADER_DATA_LOAD_BATCH_SIZE=100
export ENGAGEMENT_BY_TOPIC_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
export ENGAGEMENT_BY_TOPIC_LOADER_DEFAULT_DURATION=30days
 
export REDIS_MAX_RETRIES_PER_REQUEST=null
 
 
yarn testing:loader



// Crawler

export FB_GRAPH_SERVICE_ENDPOINT=https://www.facebook.com/api
  
export LOG_LEVEL=info
  
   
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.engagement_by_topic_crawling_sources
export CRAWLER_CONFIG_CRAWLING_SOURCE_ROUTING_KEY=cl.1.engagement_by_topic_crawling_source
 
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.web_engagement_by_topic_crawling_requests
export CRAWLER_CONFIG_CRAWLING_REQUEST_ROUTING_KEY=cl.1.web_engagement_by_topic_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.web_engagements_by_topic
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.web_engagements_by_topic_crawled_sources
   
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source 
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
  
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_WEB_ENGAGEMENT_BY_TOPIC_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=null
 
export CRAWLER_CONFIG_USE_TOKEN=false
 
export BUILDER_ENABLE=true
export BUILDER_CONCURRENCY=10
export BUILDER_BATCH_SIZE=1
    
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=10
    
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=10
   
export HTTP_PORT=9013
  
 
export REDIS_MAX_RETRIES_PER_REQUEST=null
export REDIS_DB=3
    
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-engagement-by-topic-crawler-service


### Câu lệnh chạy của luồng Tiktok




1. Update vào identity

Wiki: https://wiki.younetco.com/display/FB/%5BTiktok%5D+Crawl+Post


// Loader

export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
   
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
   
export RABBIT_HEARTBEAT=10
 
export TIKTOK_POST_CRAWLING_LOADER_OUTPUT_QUEUE=cl.tt.posts_crawling_sources
export TIKTOK_POST_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=50000
export TIKTOK_POST_CRAWLING_LOADER_CYCLE='58 * * * *'
export TIKTOK_POST_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=1000
export TIKTOK_POST_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=100
export TIKTOK_POST_CRAWLING_LOADER_DEFAULT_DATA_DURATION=1months
export TIKTOK_POST_CRAWLING_LOADER_ENABLE=true
 
export REDIS_POST_USERNAME=data_ynm_crawler_use_cache_post
export REDIS_POST_PASSWORD=vhAVNkJEaeBX
export REDIS_POST_HOST=192.168.1.103
export REDIS_POST_PORT=6390
export REDIS_POST_DATABASE=12
export HTTP_PORT=9910
 
NODE_ENV=testing yarn start --scope=@ynm/cl-tt-crawling-loader-service



// Crawler

export HTTP_PORT=9910
  
export LOG_LEVEL=debug
  
export TT_GRAPH_SERVICE_API_TYPE=WEB
 
export DEVICE_MANAGER_SERVICE_HOST=localhost
export DEVICE_MANAGER_SERVICE_PORT=9611
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.tt.posts_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.tt.posts_crawling_requests
  
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.9.1.*.posts
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.tt.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.tt.posts_crawled_sources
  
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.tt.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.9.1.*.posts.next_page
  
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
  
export CRAWLER_CONFIG_DEVICE_CRAWLER_TYPE=TT_API_WEB_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TT_API_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=TT_API_CRAWLER
  
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
  
  
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
  
  
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
  
NODE_ENV=testing yarn start --scope=@ynm/cl-tt-post-crawler-service





2. Update vào post

Wiki: https://wiki.younetco.com/display/FB/Tiktok+Post+Info+Documents
Wiki: https://wiki.younetco.com/display/FB/Tiktok+Comment+Documents





-> Hiện chưa có script chạy



### Câu lệnh chạy của News


1. Article title






2. Category links

Wiki: https://wiki.younetco.com/display/FB/%5BNews%5D%5BNew+Crawler%5D+Process+Of+Crawling+Article+Urls+By+First+Page



Chạy luồng crawl first page hoặc luồng crawl keyword là được

export HTTP_PORT=9998
  
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.news.article_urls_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.news.article_urls_crawling_requests
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.news.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.news.article_urls_crawled_sources
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.resolved_data
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.3.*.*.article_urls.next_page
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=NEWS_ARTICLE_URL_FROM_CRISIS_KEYWORD_BY_API_CRAWLER
  
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
  
export CRAWLER_ENABLE=true
export CRAWLER_BATCH_SIZE=1
export CRAWLER_CONCURRENCY=1
  
export RESOLVER_ENABLE=true
export RESOLVER_BATCH_SIZE=1
export RESOLVER_CONCURRENCY=1
  
export LOG_LEVEL=debug
  
yarn start --scope=@ynm/cl-news-article-url-crawler-service


