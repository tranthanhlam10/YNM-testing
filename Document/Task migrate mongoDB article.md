# Optimize Article URL and Article Title Storage - Mongo DB
-> Chỗ này cần phải hỏi lại anh Tân scope test -> Do luồng loader đã test rồi 



## Collections need migration:

Article_urls
Article_titles

Git: https://git.younetmedia.com/YNM/data-migrate/-/commits/features/solr-2-mongodb

K8s Pod NS: sl-testing
K8s Pod Testing: data-migrate-solr2mongodb-testing-solr2mongo-7f5cfff48-lqpfn


data-migrate-solr2mongodb-testing-solr2mongo
kubectl get pods -n sl-testing | grep data-migrate-solr2mongodb-testing-solr2mongo
kubectl exec -it data-migrate-solr2mongodb-testing-solr2mongo-6cc9954744-7q2vf -n sl-testing -- sh

Script:

Artitcles Urls: node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=article_urls --source=article_urls --fields=id,link,created_date,title --query="platform:3" 

Artitcles Titles: node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=article_titles --source=article_titles --fields=id,hash_link,title



node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=article_urls --source=article_urls --fields=id,link,created_date --cursorMark="va"

node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=article_titles --source=article_titles --fields=id,hash_link,title --query="platform:3" --cursorMark=AoJ8oJ78gpUDPwU4YzkzMmM5OS0yZTI1LTU4MGMtOGI3Ni03MTI2MjliNzA5NDQ=


Artitcles Urls: node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=article_urls --source=article_urls --fields=id,link,created_date,title --cursorMark=*


Artitcles Titles: node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=article_titles --source=article_titles --fields=id --cursorMark=*


Update/Load theo batch, mỗi batch là 500, có lưu lại cursor



## Chạy migrate collection article


### Cách đơn giản để  query uuid

{"_id": UUID("396aecb8-0cb5-5a39-95b7-0648f0b93d37")}



- migrate từ article_title sáng article ở mongo

- Testing
data-migrate-testing-6f9b4d9cbd-h9xz4


node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=articles --source=article_titles --fields=id,id_category,platform,link,title,id_source,status,parse_type,error_codes,failed_type,count_failed,views_avg,published_date,created_date,crawled_date,next_crawl_time,priority,type --query="created_date:[NOW-365DAYS TO *]" --cursorMark=*


kubectl config use-context lamtt-k8s-local
kubectl get pods -n sl-testing | grep data-migrate-testing
kubectl exec -it data-migrate-testing-6f9b4d9cbd-h9xz4 -n sl-testing -- sh



export MONGODB_HOST=mongos-router.ynm.local
export MONGODB_PORT=27017
export MONGODB_USER=ynm_crawler_testing
export MONGODB_PASSWORD=8UfgEaFu3bsT8P


- Staging
data-migrate-staging-6c7f959fc7-9kzpw

node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=articles --source=article_titles --fields=id,id_category,platform,link,title,id_source,status,parse_type,error_codes,failed_type,count_failed,views_avg,published_date,created_date,crawled_date,next_crawl_time,priority,type --query="created_date:[NOW-365DAYS TO *]" --cursorMark="AoJxgK/b+ZgDPwUyZjcxNTNhMC00NmM5LTViNjYtOTQ2NS1jZjdlNTFmYzAzOGY="


node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=articles --source=article_titles --fields=id,id_category,platform,link,title,id_source,status,parse_type,error_codes,failed_type,count_failed,views_avg,published_date,created_date,crawled_date,next_crawl_time,priority,type --query="created_date:[NOW-365DAYS TO *]" --cursorMark="AoJxgK/b+ZgDPwUyZjcx"


node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=articles --source=article_titles --fields=id,id_category,platform,link,title,id_source,status,parse_type,error_codes,failed_type,count_failed,views_avg,published_date,created_date,crawled_date,next_crawl_time,priority,type --query="created_date:[NOW-365DAYS TO *]" --cursorMark=*


node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=articles --source=article_titles --fields=id,id_category,platform,link,title,id_source,status,parse_type,error_codes,failed_type,count_failed,views_avg,published_date,created_date,crawled_date,next_crawl_time,priority,type --query="created_date:[NOW-1DAYS TO *]" --cursorMark=*


node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=articles --source=article_titles --fields=id,id_category,platform,link,title,id_source,status,parse_type,error_codes,failed_type,count_failed,views_avg,published_date,created_date,crawled_date,next_crawl_time,priority,type --query="platformed:13" --cursorMark=*



node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=articles --source=article_titles --fields=id,id_category,platform,link,title,id_source,status,parse_type,error_codes,failed_type,count_failed,views_avg,published_date,created_date,crawled_date,next_crawl_time,priority,type --query="kekee:13" --cursorMark=*

platform: 3

kubectl config use-context lamtt-k8s-ovh
kubectl get pods -n sl-staging | grep data-migrate-staging
kubectl exec -it data-migrate-staging-6c7f959fc7-47585 -n sl-staging -- sh



env | grep MONGO
MONGODB_PASSWORD=saJgNJW8v6FRh7
MONGODB_HOST=mongos-router1.ynm.local:27017,mongos-router2.ynm.local
MONGODB_PORT=27017
MONGODB_DATABASE=ynm_crawler_staging
MONGODB_USERNAME=ynm_crawler_staging

export MONGODB_PASSWORD=saJgNJW8v6FRh8
