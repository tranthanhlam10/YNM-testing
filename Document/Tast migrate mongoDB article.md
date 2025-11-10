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

Artitcles Urls: node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=article_urls --source=article_urls --fields=id,link,created_date
Artitcles Titles: node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=article_titles --source=article_titles --fields=id,hash_link,title



node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=article_urls --source=article_urls --fields=id,link,created_date --cursorMark=AoJytum//5QDPwUyMzYxMjExNy1mN2FiLTU3NDgtYTU4Zi1jMmU5NWMwODA4YTA=

node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=article_titles --source=article_titles --fields=id,hash_link,title --cursorMark=AoJ8oJ78gpUDPwU4YzkzMmM5OS0yZTI1LTU4MGMtOGI3Ni03MTI2MjliNzA5NDQ=


Update/Load theo batch, mỗi batch là 500, có lưu lại cursor



## Chạy migrate collection article

data-migrate-staging-6c7f959fc7-9kzpw

node scripts/solr2mongo/migrate_solr_to_mongodb.js --dest=articles --source=article_titles --fields=id,id_category,platform,link,title,id_source,status,parse_type,error_codes,failed_type,count_failed,views_avg,published_date,created_date,crawled_date,next_crawl_time,priority,type --query="created_date:[NOW-365DAYS TO *]" --cursorMark=*


kubectl config use-context lamtt-k8s-ovh
kubectl get pods -n sl-staging | grep data-migrate-staging
kubectl exec -it data-migrate-staging-6c7f959fc7-9kzpw -n sl-staging -- sh