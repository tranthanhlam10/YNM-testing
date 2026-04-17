# Task update fb info bằng GraphQL

## Vấn đề
- Hiện tại đã có những luồng update fb info cho page và group, nhưng phải sử dụng đến fb token
## Mục tiêu 
- Giờ tạo thêm 2 luồng crawl phụ phụ trợ cho fb info mà không sử dụng token
## Giải pháp 
- Tạo thêm 2 luồng update info bằng graphQL cho page và group chỉ sử dụng proxy



# Câu lệnh chạy và các thông tin liên quan đến task

identity schema:
id id_social mapping_id is_personal page_id platform link shard domain is_kol fullname first_name middle_name last_name gender fb_user_type category friend_count subscriber_count birthday_day birthday_month birthday_year id_city current_city fb_account hometown phone email address interested country zip_code relationship_status job_level education_level industry closed_group is_private language avatar post_updated_at post_last_date reply_updated_at reply_last_date repost_updated_at repost_last_date engagement_updated_at info_updated_at last_crawl_followers next_crawl_time reply_next_crawl_time repost_next_crawl_time priority created_date updated_at last_status error_message commercial_rate tt_user_id post_no_cookie_last_date  reply_no_cookie_last_date repost_no_cookie_last_date


- Queue
cl.fb.identity_graphql_identities_crawling_sources
cl.fb.identity_graphql_identities_crawling_requests
cl.fb.identity_graphql_identities_crawled_sources
cl.identities_finished_sources

- Câu regex để tìm kiếm queue
^cl\.(fb\.identity_graphql_identities_|identities_finished_sources|fb\.resolved_source)

^cl\.(fb\.)?(identity_graphql_identities_(crawling_sources|crawling_requests|crawled_sources)|identities_finished_sources|resolved_source)$


// Câu migrate chuẩn

cl.fb.identity_graphql_identities_|cl.fb.identities_finished_sources


- Câu lệnh chạy deployment

ynmpdp-5105-testing-ynm-crawler-empty
kubectl config use-context lamtt-k8s-local
kubectl get pods -n crawler-testing | grep ynmpdp-5105-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5105-testing-ynm-crawler-empty-7cb48cf5dc-66lgr -n crawler-testing -- sh


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
export PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=10
export PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER_CYCLE='10 * * * *'
export PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER_DATA_LOAD_BATCH_SIZE=100
export PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER_MAX_WAITING_MESSAGE_IN_QUEUE_CHECK=10
 
export GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER_ENABLE=false
export GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER_OUTPUT_QUEUE=cl.fb.identity_graphql_identities_crawling_sources
export GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER_MAX_MSG_IN_QUEUE=10
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


3. Source Updater

export HTTP_PORT=9063
 
export IDENTITIES_ENABLE=true
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

info_updated_at: [* TO NOW-1MONTHS] OR (*:* -info_updated_at:[* TO *])
platform: 1 
fb_user_type: 2
-is_personal: true 
-last_status: (4 5)

2. Group

info_updated_at: [* TO NOW-1MONTHS] OR (*:* -info_updated_at:[* TO *])
platform: 1 
fb_user_type: 3
-last_status: (4 5)


- Key Redis

PageGraphQLProfileCrawlingLoader
GroupGraphQLProfileCrawlingLoader



- Crawling loaders
PAGE_GRAPH_QL_PROFILE_CRAWLING_LOADER
GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER


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


## Data test 


Group:

{
    "sources": [
      {
        "id": "1116158079474022",
        "retries": 0,
        "closed_group": false,
        "type": 3,
        "delay_time_rules": [],
        "platform": 1,
        "createdBy": "GroupGraphQLProfileCrawlingLoader",
        "fullname": "Hội mua bán điện thoại Sài Gòn HCM",
        "domain": "facebook.com"
      }
    ],
    "batch": [
      {
        "id_social": "1116158079474022"
      }
    ]
  }




    {
    "id": "100933375212492",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Tigon - Hàng Hiệu Authentic",
    "subscriber_count": 7462,
    "current_city": "Ho Chi Minh City",
    "language": 1,
    "id_city": 0,
    "domain": "facebook.com",
    "avatar": "https://scontent-atl3-1.xx.fbcdn.net/v/t39.30808-1/287770117_427410242564802_1483098576897282512_n.jpg?stp=dst-jpg_s100x100_tt6&_nc_cat=100&ccb=1-7&_nc_sid=f907e8&_nc_ohc=uu8yv_rrsKMQ7kNvwHS63Lj&_nc_oc=AdnzyFnzh7v9XJIrlkKPR2eK1J3BqxxSbidpjhhTSRkTxysbe2lnYyvNTQB-Uzdiv-IBDLNKKL77YgnDLpP5wGlI&_nc_ad=z-m&_nc_cid=0&_nc_zt=24&_nc_ht=scontent-atl3-1.xx&oh=00_Afb0DSXDD5zUkK85OHaUeK_qSVd0uxYhdvwafAW55yoQSA&oe=68D38EF9"
  }



    {
    "id": "100933487917671",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Events of UoG Hanoi - EUH",
    "domain": "facebook.com"
  }




      {
    "id": "100333487917671",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Events of UoG Hanoi - EUH",
    "domain": "facebook.com"
  }



      {
    "id": "100433487917671",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Events of UoG Hanoi - EUH",
    "domain": "facebook.com"
  }



  678158225380985

        {
    "id": "678158225380985",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Events of UoG Hanoi - EUH",
    "domain": "facebook.com"
  }




        {
    "id": "678158225380985",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Events of UoG Hanoi - EUH",
    "domain": "facebook.com"
  }





  100008173537398


{
    "id": "100008173537398",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Phim Địa Đạo",
    "domain": "facebook.com"
}





259973647202325



Page bình thường

{
    "id": "259973647202325",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Events of UoG Hanoi - EUH",
    "domain": "facebook.com"
}



{
    "id": "61557397876906",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Events of UoG Hanoi - EUH",
    "domain": "facebook.com"
}


211850638687526


{
    "id": "211850638687526",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Events of UoG Hanoi - EUH",
    "domain": "facebook.com"
}



Page chuyên nghiệp


{
    "id": "100000341917521",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Events of UoG Hanoi - EUH",
    "domain": "facebook.com"
}



{
    "id": "259973647202325",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Events of UoG Hanoi - EUH",
    "domain": "facebook.com"
}



100076675519950
{
    "id": "100076675519950",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Hân Đàm Gia ",
    "domain": "facebook.com"
}


{
    "id": "100027625200783",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Hồ Gia Hùng",
    "domain": "facebook.com"
}

{
    "id": "100008121392402",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Hồ Gia Hùng",
    "domain": "facebook.com"
}


{
    "id": "100006652272999",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Hồ Gia Hùng",
    "domain": "facebook.com"
}


64760994940


{
    "id": "100042187784191",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Hồ Gia Hùng",
    "domain": "facebook.com"
}


{
    "id": "64760994940",
    "retries": 0,
    "closed_group": false,
    "type": 2,
    "delay_time_rules": [],
    "last_data_date": null,
    "platform": 1,
    "createdBy": "PageGraphQLProfileCrawlingLoader",
    "fullname": "Hồ Gia Hùng",
    "domain": "facebook.com"
}




64760994940

100005384285036


100008121392402

100027625200783

100000341917521



## Những việc phải chạy lại ở testing

Thông tin ở bảng mapping 


ynm-cl-fb-identity-graphql-service-testing

ynm-cl-fb-crawling-loader-service-testing

ynm-cl-fb-source-updater-service-testing

identity schema


Update
id
fullname
subscriber_count
avatar
updated_at
gender
language
education_level
job_level
id_social
platform
id_city
birthday_year
domain
info_updated_at
last_status
mapping_id
is_personal
updated_at


Insert
id fullname subscriber_count avatar updated_at gender language education_level job_level id_social platform id_city birthday_year domain info_updated_at last_status mapping_id is_personal updated_at fb_user_type




- Cursor key:
GROUP_GRAPH_QL_PROFILE_CRAWLING_LOADER


Proxy
FB_API_CRAWLER_VN


1. Loader -> DONE

- Kiểm tra xem load lên đủ chưa -> Hiện tại thấy đã load lên đẩy đủ
- Kiểm tra cursor -> Hiện tại cursor đã lưu đúng ở data base (ynm crawling loader)
- Kiểm ra lưu ở Redis -> Hiện tại đã đúng với yêu cầu
- Kiểm tra format message -> Hiện tại đã đúng với yêu cầu 

Loader

+ Group: 
{
  "id": "1061541132216883",
  "retries": 0,
  "closed_group": false,
  "type": 3,
  "delay_time_rules": [],
  "last_data_date": null,
  "platform": 1,
  "createdBy": "GroupGraphQLProfileCrawlingLoader",
  "fullname": "Việc làm PG PB MC Event, Bán hàng Trưng bày Sale Siêu thị MT, GT, TTTM",
  "domain": "facebook.com"
}

+ Page: 


Những page bị sai (user nhưng đang được đánh type 2 )
{
  "id": "100026462970054",
  "retries": 0,
  "closed_group": false,
  "type": 2,
  "delay_time_rules": [],
  "last_data_date": null,
  "platform": 1,
  "createdBy": "PageGraphQLProfileCrawlingLoader",
  "fullname": "Cửa hàng Viettel Thượng Thanh",
  "domain": "facebook.com"
}



{
  "id": "100026462970054",
  "retries": 0,
  "closed_group": false,
  "type": 2,
  "delay_time_rules": [],
  "last_data_date": null,
  "platform": 1,
  "createdBy": "PageGraphQLProfileCrawlingLoader",
  "mapping_id": "fb_100001426564660",
  "fullname": "Cửa hàng Viettel Thượng Thanh",
  "domain": "facebook.com"
}




{
  "id": "1000264629700545555",
  "retries": 0,
  "closed_group": false,
  "type": 2,
  "delay_time_rules": [],
  "last_data_date": null,
  "platform": 1,
  "createdBy": "PageGraphQLProfileCrawlingLoader",
  "mapping_id": "fb_100001426564660",
  "fullname": "Cửa hàng Viettel Thượng Thanh",
  "domain": "facebook.com"
}

100075884173205


{
  "id": "100075884173205",
  "retries": 0,
  "closed_group": false,
  "type": 2,
  "delay_time_rules": [],
  "last_data_date": null,
  "platform": 1,
  "createdBy": "PageGraphQLProfileCrawlingLoader",
  "fullname": "Cửa hàng Viettel Thượng Thanh",
  "domain": "facebook.com"
}

------------------------------------------------

{
        "id":"fb_100026462970054",
        "id_social":"100026462970054",
        "platform":1,
        "is_personal":false,
        "updated_at":"2025-04-30T03:46:25.148Z",
        "domain":"facebook.com",
        "mapping_id":"fb_100001426564660",
        "fb_user_type":2}

- Kiểm tra nếu lỗi thì có retry đúng như yêu cầu hay không -> Hiện tại chưa check cases này được, để đến cuối check thử


Builder

+ Group: 

{
  "sources": [
    {
      "id": "1135366287734560",
      "retries": 0,
      "closed_group": false,
      "type": 3,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "GroupGraphQLProfileCrawlingLoader",
      "fullname": "Konten Kreator Digital Papua (KKDP) 👩🏽‍🦱📸",
      "domain": "facebook.com"
    }
  ],
  "batch": [
    {
      "id_social": "1135366287734560"
    }
  ]
}


+ Page: 


// Trường hợp đã có mapping_id sẵn
{
  "sources": [
    {
      "id": "1000813109977405",
      "retries": 0,
      "closed_group": false,
      "type": 2,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "PageGraphQLProfileCrawlingLoader",
      "mapping_id": "fb_100064305357229",
      "is_personal": false,
      "fullname": "NSHOP Mô hình",
      "domain": "facebook.com"
    }
  ],
  "batch": [
    {
      "id_social": "1000813109977405",
      "mapping_id": "fb_100064305357229"
    }
  ]
}



{
  "sources": [
    {
      "id": "100100135871792",
      "retries": 0,
      "closed_group": false,
      "type": 2,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "PageGraphQLProfileCrawlingLoader",
      "fullname": "GIA HUY LAND",
      "domain": "facebook.com"
    }
  ],
  "batch": [
    {
      "id_social": "100100135871792"
    }
  ]
}




  {
      "id": "1133486032298980",
      "retries": 0,
      "closed_group": false,
      "type": 3,
      "delay_time_rules": [],
      "platform": 1,
      "createdBy": "GroupGraphQLProfileCrawlingLoader",
      "fullname": "Konten Kreator Digital Papua (KKDP) 👩🏽‍🦱📸",
      "domain": "facebook.com"
    }

2. Crawler
- Kiểm tra xem crawl đã đúng các giá trị 
- Kiểm tra xem nếu gặp lỗi thì đã retry chưa
- Kiểm tra nếu đẩy message sai thì đã xử lý lỗi đúng chưa
- Kiểm tra nếu lỗi thì có retry đúng như yêu cầu hay không


3. Updater

- Kiểm tra xem có update được vào solr hay không -> DONE 
- Kiểm tra nếu lỗi thì có retry đúng như yêu cầu hay không -> Hiện tại chưa check được 



## Những việc cần check ở Staging





1. Loader 
ynm-cl-fb-crawling-loader-service-staging

Load lên có đúng hay không -> Hiện tại load lên đã đúng
Có cache ở Redis hay không -> Đã cache ở Redis
Format message có đúng không 

2. Crawler
ynm-cl-fb-identity-graphql-service-staging

Crawl được bài, đủ fields cho Page và Group
Crawl được các trường hợp đặt biệt/nếu lỗi thì vẫn phải retry


3. Pusher
cl-data-pusher

Nếu như identity mới thì push xuống queue pusher
Push được xuống Solr


4. Updater
ynm-cl-fb-source-updater-service-staging

Nếu như identity cập nhật thì push xuống queue update
Update được xuống Solr 



