ynmpdp-5603-crawler-forum-hot-fix-staging-empty-container

kubectl config use-context lamtt-k8s-ovh

kubectl get pods -n crawler-staging | grep ynmpdp-5603-crawler-forum-hot-fix-staging-empty-container
kubectl exec -it ynmpdp-5603-crawler-forum-hot-fix-staging-empty-container-8x94g -n crawler-staging -- sh



- node services.js
- node scripts/forumV3/get_posts.js
- node scripts/forumV3/get_posts_prev.js



// Check nhanh tassk của Huy 
ynmpdp-5610-staging-crawler-empty-container
kubectl config use-context lamtt-k8s-ovh
kubectl get pods -n crawler-staging | grep ynmpdp-5610-
kubectl exec -it ynmpdp-5610-staging-ynm-crawler-empty-67959574d9-cgrz7 -n crawler-staging -- sh


vietnambusinessinsider.vn


export HTTP_PORT=9990
export GRPC_PORT=9011
     
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
     
export RABBIT_HEARTBEAT=10
   
export MYSQL_DEFAULT_CONNECTION_DATABASE=ynm_crawling_loaders
export MYSQL_NEWS_CONNECTION_DATABASE=crawling
export MYSQL_NEWS_APP_CONNECTION_DATABASE=monitoring_master
   
export MONGO_NEWS_AUTH_SOURCE="ynm_crawler_staging"
export MONGO_NEWS_DATABASE="ynm_crawler_staging"
export MONGO_NEWS_REPLICA_SET="rs0"
 
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export BLOG_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
  
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export HIGH_PRIORITY_ECOM_REVIEW_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
 
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export HIGH_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=true
  
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=high_priority_detail_url_info
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=20000
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export NON_CATEGORY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
  
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_OUTPUT_QUEUE=normal_priority_detail_url_info
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=10000
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=500
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=60
export NORMAL_PRIORITY_NEWS_DETAIL_SOURCES_CRAWLING_LOADER_ENABLE=false
   
yarn start --scope=@ynm/cl-news-crawling-loader-service



// Task reviews của Đồng


- Pod chạy tái hiện ở Staging 
ynmpdp-5602-crawl-reviews-staging-crawler-empty-container

kubectl config use-context lamtt-k8s-ovh

kubectl get pods -n crawler-staging | grep ynmpdp-5602-crawl-reviews-staging-crawler-empty-container
kubectl exec -it ynmpdp-5602-crawl-reviews-staging-crawler-empty-container-lvp56 -n crawler-staging -- sh


- Câu lệnh chạy:
forever start services.js
node scripts/commentsV3/crawl_reviews.js -f ECOM




- Pod tái hiện ở testing

ynmpdp-5602-crawl-reviews-testing-crawl
kubectl config use-context lamtt-k8s-local

kubectl get pods -n crawler-testing | grep ynmpdp-5602-crawl-reviews-testing-crawl
kubectl exec -it ynmpdp-5602-crawl-reviews-testing-crawler-empty-container-6x6cb -n crawler-testing -- sh



updatePost [{"id":"2933e769-2f98-581f-9928-8d3d534692e9","curr_page":1,"end_page":1,"updated_date":1762331259.175,"count_failed":0,"next_time_crawl":"2025-11-05T14:27:39.175Z","status":1,"options":"","state":2,"platform":6}]
