# Task update fb info bằng GraphQL

## Vấn đề
- Hiện tại đã có những luồng update fb info cho page và group, nhưng phải sử dụng đến fb token
## Mục tiêu 
- Giờ tạo thêm 2 luồng crawl phụ phụ trợ cho fb info mà không sử dụng token
## Giải pháp 
- Tạo thêm 2 luồng update info bằng graphQL cho page và group chỉ sử dụng proxy



# Câu lệnh chạy và các thông tin liên quan đến task

- Queue
cl.fb.identity_graphql_identities_crawling_sources
cl.fb.identity_graphql_identities_crawling_requests
cl.fb.identity_graphql_identities_crawled_sources
cl.identities_finished_sources

- Câu regex để tìm kiếm queue
^cl\.(fb\.identity_graphql_identities_|identities_finished_sources|fb\.resolved_source)

^cl\.(fb\.)?(identity_graphql_identities_(crawling_sources|crawling_requests|crawled_sources)|identities_finished_sources|resolved_source)$


- Câu lệnh chạy deployment

ynmpdp-5105-testing-ynm-crawler-empty
kubectl config use-context lamtt-k8s-local
kubectl get pods -n crawler-testing | grep ynmpdp-5105-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5105-testing-ynm-crawler-empty-66449c4ff6-x2smt -n crawler-testing -- sh


- Câu lệnh chạy các services

1. Loader


export HTTP_PORT=9997
export GRPC_PORT=9011
export LOG_LEVEL=debug
   
export LOG_LEVEL=debug
export LOG_LOG_STASH_HOST=51.222.44.17
export LOG_LOG_STASH_PORT=31658
export LOG_LOG_STASH_ENABLE=false
   
export RABBIT_HEARTBEAT=10
 
 
export PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER_ENABLE=true
export PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.identity_graphql_identities_crawling_sources
export PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER_CYCLE='10 * * * *'
export PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
 
export GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER_ENABLE=true
export GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.identity_graphql_identities_crawling_sources
export GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=5000
export GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER_CYCLE='10 * * * *'
export GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
 
 
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-crawling-loader-service


2. Crawler

export HTTP_PORT=9010
 
export LOG_LEVEL=debug
 
export FB_GRAPH_SERVICE_ENDPOINT=https://www.facebook.com/api
 
export CRAWLER_CONFIG_CRAWLING_SOURCE_QUEUE=cl.fb.identity_graphql_identities_crawling_sources
export CRAWLER_CONFIG_CRAWLING_REQUEST_QUEUE=cl.fb.identity_graphql_identities_crawling_requests
 
export CRAWLER_CONFIG_CRAWLED_SOURCE_ROUTING_KEY=cl.1.*.*.identity_graphql
export CRAWLER_CONFIG_CRAWLED_SOURCE_EXCHANGE=cl.fb.crawled_source
export CRAWLER_CONFIG_CRAWLED_SOURCE_QUEUE=cl.fb.identity_graphql_identities_crawled_sources
 
export CRAWLER_CONFIG_RESOLVED_SOURCE_EXCHANGE=cl.fb.resolved_source
export CRAWLER_CONFIG_RESOLVED_SOURCE_ROUTING_KEY=cl.1.*.*.identity_graphql
export CRAWLER_CONFIG_RESOLVED_DATA_EXCHANGE=cl.fb.resolved_data
 
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=FB_CRAWLER
export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=FB_API_CRAWLER_VN
 
 
export BUILDER_ENABLE=true
export BUILDER_BATCH_SIZE=1
export BUILDER_CONCURRENCY=1
 
 
export CRAWLER_ENABLE=true
export CRAWLER_CONCURRENCY=1
 
 
export RESOLVER_ENABLE=true
export RESOLVER_CONCURRENCY=1
 
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-identity-graphql-crawler-service


3. Source Updater

export HTTP_PORT=9063
 
export IDENTITIES_ENABLE=false
export IDENTITIES_INPUT_EXCHANGE=cl.fb.resolved_source
export IDENTITIES_ROUTING_KEY=cl.*.identities
export IDENTITIES_INPUT_QUEUE=cl.fb.identities_finished_sources
export IDENTITIES_CONCURRENCY=5
export IDENTITIES_BATCH_SIZE=100
export IDENTITIES_PREFETCH_MESSAGES=1000
export IDENTITIES_MAX_WAITING_TIME=60
 
NODE_ENV=testing yarn start --scope=@ynm/cl-fb-source-updater-service


# Flow
## Flow tổng quan

(1) Tải identity từ collection identity theo query
(2) Kiểm tra identity trong locked_sources - bỏ qua nếu đã tồn tại
(3) Chuyển identity thành crawling source → đẩy lên queue cl.fb.identity_graphql_identities_crawling_sources
(4) Lấy crawling source từ queue
(5) Chuyển crawling source thành crawling request → đẩy lên queue cl.fb.identity_graphql_identities_crawling_requests
(6) Lấy crawling request từ queue
(7) Lấy proxy từ Proxy Manager
(8) Thực hiện crawl API → chuyển response thành crawled source → đẩy lên queue cl.fb.identity_graphql_identities_crawled_sources
(9) Lấy crawled source từ queue
(10) Trích xuất thông tin từ crawled source → chuyển thành updated identity hoặc retry crawling source → đẩy qua exchange:
Retry → cl.fb.resolved_source
Thành công → cl.identities_finished_sources
(11) Lấy updated identity từ queue cl.identities_finished_sources
(12) Cập nhật identity vào collection identity
(13) Cập nhật identity vào Redis identity


## Loader của cả 2 luồng

1. Page

info_updated_at: [* TO NOW-1MONTHS] OR (*:* -info_updated_at:[* TO *
platform: 1 
fb_user_type: 2
-is_personal: true 
-last_status: (4 5)

2. Group

info_updated_at: [* TO NOW-1MONTHS] OR (*:* -info_updated_at:[* TO *
platform: 1 
fb_user_type: 3
-last_status: (4 5)


- Key Redis

PageGraphQLProfileCrawlingLoader
GroupGraphQLProfileCrawlingLoader


## Crawler của 2 luồng

1. Page

Bước 1: Lấy crawling request từ queue
Bước 2: Lấy proxy từ Proxy Manager → Kiểm tra mapping_id:

Chưa có mapping_id → Bước 3
Đã có mapping_id → Bước 4

Bước 3: Gọi Facebook URL lấy HTML:

Thất bại / Page không tồn tại → Bước 8
Thành công → Bước 4

Bước 4: Trích xuất userID từ HTML → Gán vào mapping_id:

mapping_id = null/undefined → Bước 8
Có giá trị → Bước 5

Bước 5: Gọi API lấy thông tin page (tên, avatar, follower,...):

Thất bại → Bước 8
Thành công → Bước 6

Bước 6: Gọi API lấy overview (education, work, city,...):

Thất bại → Bước 8
Thành công → Kiểm tra language:

Chưa có language → Bước 7
Đã có language → Bước 8

Bước 7: Gọi API lấy danh sách post mới nhất → Bước 8
Bước 8: Build API responses + errors thành crawled source
Bước 9: Đẩy crawled source lên queue → Kết thúc

Request → Proxy → HTML (userID) → API Page Info → API Overview → API Posts → Build Result → Push Queue


2. Group

Bước 1: Lấy crawling request từ queue
Bước 2: Lấy proxy từ Proxy Manager
Bước 3: Gọi API lấy thông tin group (tên, avatar,...):

Thất bại → Bước 6
Thành công → Bước 4

Bước 4: Gọi API lấy chính xác số followers:

Thất bại → Bước 6
Thành công → Kiểm tra language:

Chưa có language → Bước 5
Đã có language → Bước 6

Bước 5: Gọi API lấy danh sách post mới nhất → Bước 6
Bước 6: Build API responses + errors thành crawled source
Bước 7: Đẩy crawled source lên queue → Kết thúc

Request → Proxy → API Group Info → API Followers → API Posts → Build Result → Push Queue


## Resolver

Bước 1: Lấy crawled source từ queue
Bước 2: Kiểm tra status code của 3 API response:

Không có lỗi → Kiểm tra language:

Chưa có language → Bước 5
Đã có language → Bước 6


Có lỗi → Kiểm tra số lần retry:

Chưa vượt limit → Bước 3
Vượt limit → Bước 4


Bước 3: Đẩy crawled source về queue để retry → Kết thúc
Bước 4: Build updated identity từ error → Bước 9
Bước 5: Detect language từ tên, mô tả và post mới nhất → Bước 6
Bước 6: Lấy số lượng subscriber mới → Bước 7
Bước 7: Lấy các thông tin khác → Bước 8
Bước 8: Build updated identity từ kết quả mới nhất → Bước 9
Bước 9: Đẩy updated identity lên queue → Kết thúc

Crawled Source → Check Error → [Retry / Process] → Detect Language → Get Subscriber → Extract Info → Build Update → Push Queue


