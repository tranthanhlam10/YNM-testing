ynmpdp-5768-staging-ynm-crawler-empty

kubectl get pods -n crawler-staging | grep ynmpdp-5768-staging-ynm-crawler-empty
kubectl exec -it ynmpdp-5768-staging-ynm-crawler-empty-bbc49fc48-6gzsj -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh



Scope

- Chỉ thay đổi loader của luồng identity từ load bằng id_social

export HTTP_PORT=9998
export GRPC_PORT=9011
   
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
   
export RABBIT_HEARTBEAT=10
   
export THREADS_IDENTITY_CRAWLING_LOADER_OUTPUT_QUEUE=cl.tr.identities_crawling_sources
export THREADS_IDENTITY_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=10
export THREADS_IDENTITY_CRAWLING_LOADER_CYCLE="0 */12 * * *"
export THREADS_IDENTITY_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=10
export THREADS_IDENTITY_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export THREADS_IDENTITY_CRAWLING_LOADER_ENABLE=true
   
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders

   
export REDIS_DB=1
export REDIS_MAX_RETRIES_PER_REQUEST=null
   
yarn start --scope=@ynm/cl-tr-crawling-loader-service







Deployment: ynmpdp-5772-staging-crawler-empty-container

Script: concurrently --kill-others "node --max_old_space_size=8000 --stack-size=1500 services.js" "node scripts/youtubeV2/get_latest_potential_channels_info.js"


kubectl get pods -n crawler-staging | grep ynmpdp-5772-staging-crawler-empty-container
kubectl exec -it ynmpdp-5772-staging-crawler-empty-container-f9d989596-zsfgs -n crawler-staging -- sh

kubectl config use-context lamtt-k8s-ovh


Scope: Chỉ thay đổi lúc nào cũng update xuống Redis không phân biệt value của identity đó có field id hay không

-> Hiện tại theo cách xử lý của Huy là HUy vừa cập nhật subscriber_count và cập nhật id luôn cho record trên Redis



UC6Cefqz6INITmRVhb6i7AEg -> Không có id -> DONE
UCHZhgItQp2FwGt2uN88a4dw -> Có id -> DONE
UC6o8QcbiZQBBGVRDzgaQ4GQ -> {} -> DONE
UCETfNRb8j8OEiKwf3DYdjAQ -> Null -> DONE



// Bản fix updater của Khiêm



kubectl get pods -n crawler-staging | grep ynmpdp-5066-staging-ynm-crawler-empty
kubectl exec -it ynmpdp-5066-staging-ynm-crawler-empty-c76d6656d-8kl2f -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh



export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug

# --- System Config ---
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
export RABBIT_HEARTBEAT=10
export REDIS_MAX_RETRIES_PER_REQUEST=null

# --- Identities (General) ---
export IDENTITIES_ENABLE=false
export IDENTITIES_INPUT_EXCHANGE=cl.resolved_source
export IDENTITIES_ROUTING_KEY=cl.*.identities
export IDENTITIES_INPUT_QUEUE=cl.identities_finished_sources
export IDENTITIES_BATCH_SIZE=1
export IDENTITIES_PREFETCH_MESSAGES=1000
export IDENTITIES_MAX_WAITING_TIME=60

# --- Facebook ---
export FB_POST_ENABLE=false
export FB_POST_INPUT_EXCHANGE=cl.resolved_source
export FB_POST_ROUTING_KEY=cl.1.posts
export FB_POST_INPUT_QUEUE=cl.fb.fb_posts_finished_sources
export FB_POST_MAX_WAITING_TIME=60
export FB_POST_BATCH_SIZE=1
export FB_POST_PREFETCH_MESSAGES=1000

# --- Threads ---
export TR_POSTS_ENABLE=true
export TR_POSTS_INPUT_EXCHANGE=cl.resolved_source
export TR_POSTS_ROUTING_KEY=cl.10.posts
export TR_POSTS_INPUT_QUEUE=cl.tr.posts_finished_sources
export TR_POSTS_MAX_WAITING_TIME=60
export TR_POSTS_BATCH_SIZE=1
export TR_POSTS_PREFETCH_MESSAGES=1000

export TR_POSTS_BY_TOPIC_ENABLE=false
export TR_POSTS_BY_TOPIC_INPUT_EXCHANGE=cl.resolved_source
export TR_POSTS_BY_TOPIC_ROUTING_KEY=cl.10.posts_by_topic
export TR_POSTS_BY_TOPIC_INPUT_QUEUE=cl.tr.posts_by_topic_finished_sources
export TR_POSTS_BY_TOPIC_MAX_WAITING_TIME=60
export TR_POSTS_BY_TOPIC_BATCH_SIZE=1
export TR_POSTS_BY_TOPIC_PREFETCH_MESSAGES=1000

export TR_KEYWORD_ENABLE=false
export TR_KEYWORD_INPUT_EXCHANGE=cl.resolved_source
export TR_KEYWORD_ROUTING_KEY=cl.10.keyword_posts
export TR_KEYWORD_INPUT_QUEUE=cl.tr.keyword_posts_finished_sources
export TR_KEYWORD_MAX_WAITING_TIME=60
export TR_KEYWORD_BATCH_SIZE=1
export TR_KEYWORD_PREFETCH_MESSAGES=1000

# --- TikTok ---
export TT_POSTS_ENABLE=false
export TT_POSTS_INPUT_EXCHANGE=cl.resolved_source
export TT_POSTS_ROUTING_KEY=cl.9.posts
export TT_POSTS_INPUT_QUEUE=cl.tt.posts_info_finished_sources
export TT_POSTS_MAX_WAITING_TIME=60
export TT_POSTS_BATCH_SIZE=1
export TT_POSTS_PREFETCH_MESSAGES=1000

export TT_KEYWORD_ENABLE=false
export TT_KEYWORD_INPUT_EXCHANGE=cl.resolved_source
export TT_KEYWORD_ROUTING_KEY=cl.2.keyword
export TT_KEYWORD_INPUT_QUEUE=cl.tt.keyword_posts_finished_sources
export TT_KEYWORD_MAX_WAITING_TIME=60
export TT_KEYWORD_BATCH_SIZE=1
export TT_KEYWORD_PREFETCH_MESSAGES=1000

export TT_TRENDING_ENABLE=false
export TT_TRENDING_INPUT_EXCHANGE=cl.resolved_source
export TT_TRENDING_ROUTING_KEY=cl.9.posts_trending
export TT_TRENDING_INPUT_QUEUE=cl.tt.ads_posts_finished_sources
export TT_TRENDING_MAX_WAITING_TIME=60
export TT_TRENDING_BATCH_SIZE=1
export TT_TRENDING_PREFETCH_MESSAGES=1000

# --- News & Others ---
export CATEGORY_LINK_UPDATER_ENABLE=false
export CATEGORY_LINK_UPDATER_MAX_WAITING_TIME=1
export CATEGORY_LINK_UPDATER_PREFETCH_MESSAGES=1000
export CATEGORY_LINK_UPDATER_BATCH_SIZE=100

export ARTICLE_TITLE_UPDATER_ENABLE=true
export ENGAGEMENTS_BY_TOPIC_ENABLE=false
export TRANSCRIPT_ENABLE=false
export POTENTIAL_IDENTITIES_ENABLE=true

export MONGO_NEWS_ENABLE=true
export MONGO_NEWS_DATABASE=ynm_crawler_staging
export MONGO_NEWS_AUTH_SOURCE=ynm_crawler_staging

export MONGO_SOCIAL_HEAT_ENABLE=true
export MONGO_SOCIAL_HEAT_DATABASE=socialheat_staging
export MONGO_SOCIAL_AUTH_SOURCE=socialheat_staging

# --- Start Command ---
NODE_ENV=staging yarn start --scope=@ynm/cl-source-updater-service









///

export HTTP_PORT=9876
export LOG_LEVEL=debug
 
# * All platforms *
export IDENTITIES_ENABLE=false
 
# * Facebook *
export FB_POST_ENABLE=false
export FB_POST_MAX_WAITING_TIME=1
export FB_POST_PREFETCH_MESSAGES=1000
export FB_POST_BATCH_SIZE=100
 
# export FB_IDENTITIES_ENABLE=false
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
 
export POTENTIAL_IDENTITIES_ENABLE=true
export POTENTIAL_IDENTITIES_MAX_WAITING_TIME=1
export POTENTIAL_IDENTITIES_PREFETCH_MESSAGES=1000
export POTENTIAL_IDENTITIES_BATCH_SIZE=100
 
# export TR_IDENTITIES_ENABLE=false
# export TR_IDENTITIES_MAX_WAITING_TIME=3
# export TR_IDENTITIES_PREFETCH_MESSAGES=1000
# export TR_IDENTITIES_BATCH_SIZE=100
 
export TR_POSTS_ENABLE=false
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


export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_APP_TOPIC_ENGAGEMENT_CONNECTION_DATABASE=monitoring_app
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
export MYSQL_NEWS_CONNECTION_DATABASE=crawling


export MONGO_NEWS_ENABLE=true
export MONGO_NEWS_DATABASE=ynm_crawler_staging
export MONGO_NEWS_AUTH_SOURCE=ynm_crawler_staging

export MONGO_SOCIAL_HEAT_ENABLE=true
export MONGO_SOCIAL_HEAT_DATABASE=socialheat_staging
export MONGO_SOCIAL_AUTH_SOURCE=socialheat_staging

 
NODE_ENV=staging yarn start --scope=@ynm/cl-source-updater-service
