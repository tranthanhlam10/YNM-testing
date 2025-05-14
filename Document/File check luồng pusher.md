## Các platform cần check -> Mỗi platform chỉ lấy 1 luồng ra check là được 

Scope của task
-Redis thì chỉ cần check duplicate (Nếu đã tồn tại rồi thì không update vào nữa)
-Tất cả các queue update/insert vào mentions -> update theo batch, và nếu như lố 60s thì update hết 

-> Theo như anh Tân nói chỉ cần check 1 luongf thoi, do cái này sửa ở trong core 



## Những bước cần phải làm để check task này 
- Tạo message ở queue (Mỗi queue cần check phải có ít nhất 100 messages)
- Phải lấy được message sample của tường luồng từng platform 
- Push message vào queue (Phải code 1 hàm push tự động)
- Test và ngòi xem log (Nguyên tắc là phải nhờ dev log ra nó đã consume các message nào )
- Nếu trên redis đã tồn tại rồi thì không insert lên Redis nữa 



Còn việc check update theo batch thì chỉ cần check các case 

- Nếu = 100 message  
- Nếu < 100 message 
- Nhiều message để xử lý nhiều batch 
- Còn phải monitor nếu như update số lượng lớn thì solr có stress hay không (Phải monitor qua devops)

### Các queue cần phải check 

cl.identities_2_redis_identities -> Kiểm tra xem nếu đã tồn tại ở redis thì có update nữa hay khong 
cl.mentions_2_solr_mentions -> Những case này là kiểm tra 
cl.fb_posts_2_solr_fb_posts
cl.profiles_2_solr_identities


cl.fb.identities_finished_sources
cl.fb.fb_posts_finished_sources


### Câu lệnh chạy test 
Môi trường: staging
ynmpdp-5041-hotfix-redis-nx-staging-ynm-crawler-empty



kubectl exec -it ynmpdp-5041-hotfix-redis-nx-staging-ynm-crawler-empty-65dcnqzlk -n crawler-staging -- sh

#### Pusher

export HTTP_PORT=9014
export GRPC_PORT=9011
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
export RABBIT_HEARTBEAT=10

export PROFILE_2_REDIS_IDENTITY_INPUT_EXCHANGE=cl.resolved_data
export PROFILE_2_REDIS_IDENTITY_ROUTING_KEY=cl.*.identities
export PROFILE_2_REDIS_IDENTITY_INPUT_QUEUE=cl.ẽexierix
export PROFILE_2_REDIS_IDENTITY_ENABLE=false
export PROFILE_2_REDIS_IDENTITY_MAX_WAITING_TIME=15
export PROFILE_2_REDIS_IDENTITY_BATCH_SIZE=100
export PROFILE_2_REDIS_IDENTITY_PREFETCH_MESSAGES=1000


export MENTION_2_SOLR_MENTION_BATCH_SIZE=100
export MENTION_2_SOLR_MENTION_CONCURRENCY=5
export MENTION_2_SOLR_MENTION_ENABLE=true
export MENTION_2_SOLR_MENTION_INPUT_EXCHANGE=cl.resolved_data
export MENTION_2_SOLR_MENTION_INPUT_QUEUE=cl.mentions_2_solr_mentions
export MENTION_2_SOLR_MENTION_PREFETCH_MESSAGES=100
export MENTION_2_SOLR_MENTION_ROUTING_KEY=cl.*.mentions
export MENTION_2_SOLR_MENTION_MAX_WAITING_TIME=15


export POST_2_SOLR_FB_POST_BATCH_SIZE=500
export POST_2_SOLR_FB_POST_CONCURRENCY=5
export POST_2_SOLR_FB_POST_ENABLE=false
export POST_2_SOLR_FB_POST_INPUT_EXCHANGE=cl.resolved_data
export POST_2_SOLR_FB_POST_INPUT_QUEUE=cl.fb_posts_2_solr_fb_posts
export POST_2_SOLR_FB_POST_PREFETCH_MESSAGES=5000
export POST_2_SOLR_FB_POST_ROUTING_KEY=cl.1.posts
export POST_2_SOLR_FB_IDENTITY_MAX_WAITING_TIME=15

export PROFILE_2_SOLR_IDENTITY_BATCH_SIZE=500
export PROFILE_2_SOLR_IDENTITY_CONCURRENCY=5
export PROFILE_2_SOLR_IDENTITY_ENABLE=false
export PROFILE_2_SOLR_IDENTITY_INPUT_EXCHANGE=cl.resolved_data
export PROFILE_2_SOLR_IDENTITY_INPUT_QUEUE=cl.profiles_2_solr_identities
export PROFILE_2_SOLR_IDENTITY_PREFETCH_MESSAGES=5000
export PROFILE_2_SOLR_IDENTITY_ROUTING_KEY=cl.*.identities
export PROFILE_2_SOLR_IDENTITY_MAX_WAITING_TIME=60


export REDIS_DB=3
export REDIS_MAX_RETRIES_PER_REQUEST=null


NODE_ENV=staging yarn start --scope=@ynm/cl-data-pusher-service

#### Updater 


export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
   
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
   
export RABBIT_HEARTBEAT=10
  
export IDENTITIES_INPUT_EXCHANGE=cl.fb.resolved_source
export IDENTITIES_ROUTING_KEY=cl.*.identities
export IDENTITIES_INPUT_QUEUE=cl.fb.identities_finished_sources
export IDENTITIES_BATCH_SIZE=1
export IDENTITIES_PREFETCH_MESSAGES=1000
export IDENTITIES_MAX_WAITING_TIME=60
export IDENTITIES_ENABLE=true
  
export FB_POST_INPUT_EXCHANGE=cl.fb.resolved_source
export FB_POST_ROUTING_KEY=cl.1.posts
export FB_POST_INPUT_QUEUE=cl.fb.fb_posts_finished_sources
export FB_POST_MAX_WAITING_TIME=60
export FB_POST_BATCH_SIZE=1
export FB_POST_PREFETCH_MESSAGES=1000
export FB_POST_ENABLE=false
  
export REDIS_MAX_RETRIES_PER_REQUEST=null
  
NODE_ENV=staging yarn start --scope=@ynm/cl-fb-source-updater-service




### Data test 

- Case check data nếu tồn tại ở redis thì không cập nhật nữa vào redis 
tt_MS4wLjABAAAAcGb7fiz9WGH-6AR71xt50InU_yFERchgssRczg2ZpOJIOlA8fsI9MQc55_iwseJK
fb_100064171292210
fb_100037809248570
fb_100009074470890


- Case check số lượng records ở các queue update vào solr 
cl.mentions_2_solr_mentions 
cl.fb_posts_2_solr_fb_posts
cl.profiles_2_solr_identities


cl.fb.fb_posts_finished_sources
cl.fb.identities_finished_sources

- Đây là những queue cần phải check 




ynm-cl-fb-page-web-post-service-staging


 Hiện tại case cucurrency = 1, batch size và prefectch = nhau thì chạy đúng với yêu cầu  100 100
 case cucurrency = 2, batch size và prefectch = nhau  thì cũng đang chạy đúng yêu cầu 100 100
 case cucurrency = 2, batch size và prefectch khac nhau (prefetch > batch size)