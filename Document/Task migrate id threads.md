# Task migrate id Threads cuả anh Tân
## Vấn đề 
- Hiện tại đang không lưu id của Threads, mà lưu id của IG
- Việc identity sai, đãn đến các luồng khác điều bị sau

## Mục tiêu và giải pháp
- Đưa id của hệ thống về lại id_threads
- Migrate ID identity bằng endpoint của Threads
- Cập nhật Redis Identiy
- Them mapping giữa id instagram và id Threads




## Những cases cần check 

- Check thử xem số lượng identity load lên có đúng điều kiện không
- Kiểm tra khi gọi API có cần phải xử dụng porxy gì hay không
- Nếu như gọi API thất bại (API không trả ra kết quả, retry -> Có )





## Flow

1. Điều kiện để load identity đi migrate


-mapping_id:[* TO *]
platform:10
link:[* TO *]
-last_status:4

q=fullname:/[a-z0-9_.]{3,15}/



2. Gọi API mapping 
Truyền username lấy từ link vào để lấy id mới -> kiểm tra xem identity đó có bằng với identity đã load từ trên Solr hay không

+ Nếu không tồn tại thì đánh last status = 4
Chỉ cập nhật lại last status của identity đó 

+ Nếu như có tồn tại, id không giống nhau thì update mapping id vào record identity cũ trên solr, đánh last status = 0 cho record mới, record cũ tồn tại thì đánh last_status =5 
Khi cập nhật lại thì mapping các field cũ qua record mới, nhưng vẫn sẽ có các field thay đổi
- Id : được lấy theo id của API
- Mapping id : Cũng được lấy theo id của API
- Created_date: Update lại theo ngày migrate
- Updated_date: Update lại theo ngày migrate
- Ngoài ra thì các Fields còn lại sẽ được mapping giống như record cũ 

+ Nếu như có tồn tại, id giống nhau thì update mapping_id
Khi gặp trường hợp này thì có cần update last_status hay không (Thực tế đây là record đã tồn tại- có thể sử dụng với nhiều mục đích, nên việc mapping last_status là không cần thiết)



Script
scripts/crawler/migrate_threads_identities.js --cursorMark=*
Namespace: 
sl-testing
Deployment 
job-queue-threads-consumer-testing-st-job-queue


kubectl get pods -n sl-testing | grep data-migrate-identities-testing

job-queue-threads-consumer-testing-st-job-queue-6b754c7446q4xlm
kubectl exec -it data-migrate-identities-testing-5995f568d5-kwcpg -n sl-testing -- sh


node scripts/crawler/migrate_threads_identities.js --cursorMark=*


node scripts/crawler/migrate_threads_identities.js --cursorMark=AoJ0pOes65MDLXRyXzI5Mjk2ODI5NzU=
AoJ0pOes65MDLXRyXzI5Mjk2ODI5NzU=


-> Theo luồng migrate thì mỗi patch 10 identity được crawl 



## Những việc cần check ở staging
Namespace: 
sl-staging
Deployment 
data-migrate-staging


kubectl get pods -n sl-staging | grep data-migrate-staging

data-migrate-staging-787768cc46-s4prn
kubectl exec -it data-migrate-staging-864c689ffd-74kv7 -n sl-staging -- sh

node scripts/crawler/migrate_threads_identities.js --cursorMark=*



-mapping_id:[* TO *]
platform:10
link:[* TO *]
-last_status:4


## Các câu lệnh SQL dùng để  set-up token
UPDATE ynm_proxies.proxies
SET crawler_type = "TR_UNAUTHORIZED_CRAWLER"
WHERE crawler_type LIKE 'TR_IDENTITY_CRAWLER_1%';

UPDATE ynm_proxies.proxies
SET status = "ACTIVE"
WHERE crawler_type LIKE 'TR_UNAUTHORIZED_CRAWLER%';

SELECT *  FROM `proxies` WHERE `crawler_type` LIKE '%TR_%'


SELECT *  FROM `proxies` WHERE `crawler_type` LIKE '%TR_UNAUTHORIZED_CRAWLER%'





