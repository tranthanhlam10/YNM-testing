# Task GG maps của anh Kim


## Mục tiêu


Luồng crawl comment của domain maps.google.com đang gặp tình trạng bị block nên cần cập nhật lại luồng để có thể lấy cookie đi crawl vượt qua block


## Scope

- Thêm Cookie cho request để vượt qua blocking của Google Maps ( Cookie được lấy từ luồng tự động, đẩy lên token manager theo crawler_type)
- Sau mỗi request ggmaps sẽ trả set-cookie chứa NID và sử dụng để đi crawl sẽ thành công nhưng cách này thì request đầu sẽ phải retry lại do lần đầu tiên chưa có cookie từ set-cookie trả về


## Crawling Flow (Tóm tắt)

1. Load dữ liệu ban đầu
- Lấy cursor từ MySQL (nếu có)
- Load source từ collection `article_posts`

2. Chuẩn bị & đưa vào queue
- Build source → đẩy vào `crawling_source` queue
- Build crawling request từ source → đẩy vào queue

3. Thực hiện crawl
- Lấy request từ queue
- Lấy token (Token Manager) + proxy (Proxy Manager)
- Gọi API Google Maps để lấy reviews

4. Xử lý kết quả crawl
- Convert response → crawled source → đẩy vào queue
- Build dữ liệu thành:
  - mentions
  - posts
  - identities

5. Lưu dữ liệu
- Data pusher:
  - Insert `mentions` vào collection mention
  - Insert `identities` vào collection identity
- Cache thêm vào Redis

6. Xử lý phân trang
- Nếu có next page:
  - Build crawling source mới → quay lại bước crawl
- Nếu không:
  - Đánh dấu source hoàn thành

7. Cập nhật source
- Source Updater cập nhật lại `article_posts`

---

Tổng quan
**Load source → queue → crawl API → xử lý → lưu DB → lặp nếu còn page → cập nhật trạng thái**



## Câu lệnh loader


    next_time_crawl:[* TO NOW]
    "id_social:[* TO *]",
    "platform:5",
    "id_source:(maps.google.com)",
    "-id_source:(youtube.com)"


Crawling Loader: GoogleMapsReviewsCrawlingLoader


## Rabbit 

 cl.news.ggmaps_crawling_sources|cl.news.ggmaps_crawling_sources_next_pages|cl.news.ggmaps_crawling_requests|cl.news.ggmaps_crawled_sources|cl.mentions_2_solr_mentions_LamTT|cl.news.article_posts_finished_sources


 cl.news.article_post_from_ggmaps_crawling_sources|cl.news.article_post_from_ggmaps_crawling_requests|cl.news.article_post_from_ggmaps_crawled_sources|cl.mentions_2_solr_mentions_LamTT|cl.news.article_posts_finished_sources|


## Câu lệnh chạy

ynmpdp-5841-ggmaps-reviews-testing-ynm-crawler-empty


kubectl get pods -n crawler-testing | grep ynmpdp-5841-ggmaps-reviews-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-5841-ggmaps-reviews-testing-ynm-crawler-empty-84c98hdz2j -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local





1. Loader

export HTTP_PORT=6789
export NODE_ENV=testing
yarn start --scope @ynm/cl-crawling-loader-service



2. Crawling

export HTTP_PORT=7689
export NODE_ENV=testing
export BUILDER_ENABLE=true
export CRAWLING_ENABLE=true
export RESOLVER_ENABLE=true

export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_REPLY_BY_REPLY_ST_CRAWLER

export CRAWLER_CONFIG_MAX_CRAWLED_DAY=3
export CRAWLER_CONFIG_NEXT_TIME_CRAWL=1
yarn start --scope @ynm/cl-news-article-post-from-ggmaps-crawler-service



TR_UNAUTHORIZED_CRAWLER
LAMTT_FAIL_PROXY
LAMTT_FAIL_TOKEN


export CRAWLER_CONFIG_PROXY_CRAWLER_TYPE=TR_UNAUTHORIZED_CRAWLER
export CRAWLER_CONFIG_TOKEN_CRAWLER_TYPE=LAMTT_FAIL_TOKEN


3. Data pusher


export NODE_ENV=testing
export MENTION_2_SOLR_MENTION_ENABLE=true
yarn start --scope @ynm/cl-data-pusher-service


4. Updater 

export HTTP_PORT=8769
export NODE_ENV=testing
export ARTICLE_POSTS_UPDATER_ENABLE=true
yarn start --scope @ynm/cl-source-updater-service


## Những cases cần phải check

1. Loader

- Kiểm tra có load đúng đều kiện hay không -> DONE
- Kiểu tra xem sau khi load có cache lại ở Redis hay không -> Hiện tại đã cache đúng yêu cầu
- Kiểm tra sau khi load có lưu lại cursor hay không -> {"solrCursor":"*","nextTimeCrawl":"2026-03-26T04:30:45.154Z"} -> Hiện tại có lưu lại cursor
- Kiểm tra xem có load lên đúng queue crawling_loader hay không -> Load đúng lên queue crawling loader
- Kiểm tra format message -> DONE



2. Builder

- Kiểm tra message có được consume từ queue crawling_sources hay không -> DONE
- Kiểm tra message có được push vào queue crawling_request hay không -> DONE
- Kiểm tra format message -> DONE


3. Proxy/Token

- Kiểm tra xem proxy và token có được lấy đúng config hay không -> Hiện tại đã lấy đúng config
- Kiểm tra xem proxy có bị blocked/broken nếu có vấn đề hay không -> Hiện tại chưa có cơ chế blocked cho proxy
- Kiểm tra xem token có bị blocked/broken nếu có vấn đề hay không


4. Crawler

- Kiểm tra xem message có được consume từ queue crawling request hay không -> DONE
- Kiểm tra xem crawl thành công hay không -> Hiện tại đã thấy crawl được thành công -> DONE
- Nếu crawl không có bài thì như nào -> DONE
- Nếu crawl bài có reply của review thì như thế nào -> Đã crawl được thành công, đang sai id_parent_comments
- Nếu như crawl 1 địa điểm không có bài thì như nào -> DONE
- Nếu như crawl 1 địa điểm không tồn tại thì như nào -> DONE
- Nếu như crawl bài có quá nhiều cmt thì như nào -> DONE
- Nếu crawl bài theo 1 page thì như thế nào
- Nếu crawl bài theo nhiều pages thì như thế nào
- Nếu crawl 1 review có ảnh thì như nào -> Hiện đang nhờ BA confirm
- Nếu crawl 1 reply của review có ảnh thì như thế nào


5. Resolver

- Kiểm tra xem mentions đã được push qua queue mentions hay chưa -> DONE
- Kiểm tra xenm mention đã được crawl đúng hay chưa -> Đang nhờ BA confirm lại các field

- Mapping article_post → Crawling Source Data Model

| # | Field       | Article Post Field     | Note                                     |
|---|------------|------------------------|-------------------------------------------|
| 1 | id         | article_post.id        | id của domain                             |
| 2 | platform   | article_post.platform  | platform của news = 5                     |
| 3 | id_social  | article_post.id_social | id_url của địa điểm                       |
| 4 | title      | article_post.title     | tên của địa điểm                          |
| 5 | link       | article_post.link      | link đầy đủ đến địa điểm đó trên ggmaps   |
| 6 | id_source  | article_post.id_source | domain của news                           |
| 7 | status     | article_post.status    | trạng thái của source                     |
| 8 | next_cursor| ""                     | next page cursor                          |


Danh sách fields cần check

- id -> 


- link -> Hiện tại đã đúng với yêu cầu


- platform -> Hiện đã đúng với yêu cầu


- domain -> Hiện tại đã đúng với yêu cầu


- shard -> Ảnh hưởng bởi created_date


- country_code Khi insert xuống sẽ auto map country code = VN


- id_social -> Không có id_social


- id_source -> Hiện đã đúng với yêu cầu


- id_reference -> Hiện đã đúng với yêu cầu


- id_parent_comment -> Đang không lấy được của reply


- identity -> Hiện tại đang không đúng format


- identity_name -> Hiện đã đúng với yêu cầu


- mention_type -> Hiện đã đúng với yêu cầu


- mention_type_details -> Cần confirm lại


- source_type -> Hiện tại đang lấy null


- source_category -> Hiện tại đang không lấy field này


- likes -> Confirm với anh Thạch


- rating_score -> Hiện tại đã đúng yêu cầu


- engagement_total -> Nếu lấy likes thì thằng này phải count luôn



- title -> Hiện đang lấy đúng với tên quán


- search_text -> Hiện tại đã lấy đúng yêu cầu


- attachment -> Confirm lại với anh Thạch


- created_date -> Hiện tại không lấy ngày crawl mà lấy ngày tạo của post


- updated_at -> Hiện tại đã đúng yêu cầu


- language


6. Data pusher

- Không thay đổi -> Không cần test


7. Updater

- Consume message từ queue finish_source -> Hiện đã consume từ queue finished source
- Kiểm tra format message -> Hiện tại đã đúng với yêu cầu
- Cập nhật giá trị next_time_crawl + 1 ngày -> Đang bị lỗi chỗ updated_date -> BUG
- Remove Redis -> Hiện tại đã hoạt động đúng yêu cầu



## Note

Những field cần confirm

title -> Đang lấy tên quán
attachment -> Chỉ lấy đúng 1 link ảnh
likes -> Hiện tại không lấy được chỉ số like
source_type: đang lấy null
id_social: đang không lấy

mention_type_detail: đang lấy bằng 2 -> Hiện tại đã lấy đúng yêu cầu





## Data test





- Data test crawl bình thường -> Crawl được mentions



{
    "id": "9e38cc40-496a-552c-b41d-5914d95dc83f",
    "title": "Jollibee Nguyễn Sinh Sắc",
    "id_source": "maps.google.com",
    "platform": 5,
    "link": "https://www.google.com/maps/place/Jollibee+Nguy%E1%BB%85n+Sinh+S%E1%BA%AFc/@10.2906055,105.7557435,17z/data=!3m1!4b1!4m6!3m5!1s0x310a7f6799ac19d7:0x71460c767184145c!8m2!3d10.2906055!4d105.7557435!16s%2Fg%2F11l2vhn70j?hl=en-VN&entry=ttu&g_ep=EgoyMDI1MDIyNi4xIKXMDSoASAFQAw%3D%3D",
    "retries": 0,
    "curr_page": 0,
    "status": 1,
    "next_crawl_time": "2026-03-26T04:30:44.929Z",
    "createdBy": "GoogleMapsReviewsCrawlingLoader",
    "id_social": "!1s0x310a7f6799ac19d7:0x71460c767184145c",
    "next_cursor": null,
    "hash_link": "",
    "isFullPage": true,
    "end_page": 1
  }


- Data test crawl 1 link sai -> Không crawl được bài nào -> Throw ra finished_post luôn


{
    "id": "9e38cc40-496a-552c-b41d-5914d95dc83f",
    "title": "Jollibee Thanh Lâm",
    "id_source": "maps.google.com",
    "platform": 5,
    "link": "https://www.google.com/maps/place/Jollibee+Nguy%E1%BB%85n+Sinh+S%E1%BA%AFc/@10.2906055,105.7557435,17z/data=!3m1!4b1!4m6!3m5!1s0x310a7f6799jsjdjdjsdsjsdksdkskdac19d7:0x71460c767184145c!8m2!3d10.2906055!4d105.7557435!16s%2Fg%2F11l2vhn70j?hl=en-VN&entry=ttu&g_ep=EgoyMDI1MDIyNi4xIKXMDSoASAFQAw%3D%3Dnvnv",
    "retries": 0,
    "curr_page": 0,
    "status": 1,
    "next_crawl_time": "2026-03-26T04:30:44.929Z",
    "createdBy": "GoogleMapsReviewsCrawlingLoader",
    "id_social": "!1s0x310a7f6799sdjsdjsdac19d7:0x71460c767184145cksdjjsjsjsdsjdds",
    "next_cursor": null,
    "hash_link": "",
    "isFullPage": true,
    "end_page": 1
  }




- Data test crawl 1 địa điểm không có bài thì như nào -> Không crawl được bài nào -> Throw ra finished_post luôn


{
    "id": "ChIJ8dYGdsEudTERAEPpi-RL9PQ",
    "title": "Hồ Chí Minh Đại học Bách Khoa",
    "id_source": "https://www.google.com/maps/place/H%E1%BB%93+Ch%C3%AD+Minh+%C4%90%E1%BA%A1i+h%E1%BB%8Dc+B%C3%A1ch+Khoa/@10.7712345,106.6555378,18.07z/data=!4m15!1m8!3m7!1s0x31752ec031363df5:0x705978e7a9bca5c8!2zxJAuIEzhu68gR2lhLCBQaMO6IFRo4buNLCBI4buTIENow60gTWluaCwgVmnhu4d0IE5hbQ!3b1!8m2!3d10.770769!4d106.6554942!16s%2Fg%2F1vppq06g!3m5!1s0x31752ec17606d6f1:0xf4f44be48be94300!8m2!3d10.7724592!4d106.6575122!16s%2Fg%2F11vzy8s3g1!5m2!1e1!1e4?hl=vi&entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D",
    "platform": 5,
    "link": "https://maps.google.com/?cid=17650816284543763200&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNl",
    "retries": 0,
    "curr_page": 0,
    "status": 1,
    "next_crawl_time": "2026-03-26T04:30:44.929Z",
    "createdBy": "GoogleMapsReviewsCrawlingLoader",
    "id_social": "!1s0x31752ec17606d6f1:0xf4f44be48be94340",
    "next_cursor": null,
    "hash_link": "",
    "isFullPage": true,
    "end_page": 1
}


- Data test crawk 1 địa điểm có quá nhiều cmt thì như nào





- Nếu crawl bài theo 1 page thì như thế nào

{
  "id": "b3c7d912-84fa-4e02-a93c-6d17f28eb541",
  "title": "Highlands Coffee Lotte Lê Đại Hành",
  "id_source": "maps.google.com",
  "platform": 5,
  "link": "https://www.google.com/maps/place/Highlands+Coffee+Lotte+L%C3%AA+%C4%90%E1%BA%A1i+H%C3%A0nh/@10.7620118,106.6378757,3858m/data=!3m1!1e3!4m12!1m2!2m1!1sHighlands+Coffee!3m8!1s0x31752f3fe9b43253:0x14dd041c57cdfed7!8m2!3d10.7620118!4d106.6569301!9m1!1b1!15sChBIaWdobGFuZHMgQ29mZmVlIgOIAQFaEiIQaGlnaGxhbmRzIGNvZmZlZZIBC2NvZmZlZV9zaG9w4AEA!16s%2Fg%2F11yv0mgkpp?entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D",
  "retries": 0,
  "curr_page": 0,
  "status": 1,
  "next_crawl_time": "2026-03-30T04:30:44.929Z",
  "createdBy": "GoogleMapsReviewsCrawlingLoader",
  "id_social": "!1s0x31752f3fe9b43253:0x14dd041c57cdfed7",
  "next_cursor": null,
  "hash_link": "",
  "isFullPage": true,
  "end_page": 1
}



{
    "id": "5135eef6-417e-5590-9621-194044968f04",
    "title": "PNJ Co.op Tuy Lý Vương · 45 Tuy Lý Vương, P.13, Quận 8, Thành phố Hồ Chí Minh 700000",
    "id_source": "maps.google.com",
    "platform": 5,
    "link": "https://www.google.com/maps/place/PNJ+Co.op+Tuy+L%C3%BD+V%C6%B0%C6%A1ng/@10.7443631,106.6550367,15z/data=!4m6!3m5!1s0x31752f51919b8e63:0x2d3eaced4c5b2368!8m2!3d10.7443631!4d106.6550367!16s%2Fg%2F11gvy13922?hl=vi",
    "retries": 0,
    "curr_page": 0,
    "status": 1,
    "next_crawl_time": "2026-03-26T04:30:45.154Z",
    "createdBy": "GoogleMapsReviewsCrawlingLoader",
    "id_social": "!1y3563806707515362915!2y3260233315451085672",
    "next_cursor": null,
    "hash_link": "",
    "isFullPage": false,
    "end_page": 1
  }


- Nếu crawl bài theo nhiều pages thì như thế nào

{
  "id": "a1f4e820-7c3b-4d91-b87e-2f063a1dc950",
  "title": "KATINAT Cao Thắng",
  "id_source": "maps.google.com",
  "platform": 5,
  "link": "https://www.google.com/maps/place/KATINAT+Cao+Th%E1%BA%AFng/@10.775188,106.5485322,12z/data=!4m12!1m2!2m1!1skatinat!3m8!1s0x31752f0fd45204e3:0xb9bb1fe46692de6c!8m2!3d10.775188!4d106.6720775!9m1!1b1!15sCgdrYXRpbmF0IgOIAQFaCSIHa2F0aW5hdJIBBGNhZmXgAQA!16s%2Fg%2F11ssv0j0p0!5m2!1e1!1e4?hl=vi&entry=ttu&g_ep=EgoyMDI2MDMyNC4wIKXMDSoASAFQAw%3D%3D",
  "retries": 0,
  "curr_page": 0,
  "status": 1,
  "next_crawl_time": "2026-03-30T04:30:44.929Z",
  "createdBy": "GoogleMapsReviewsCrawlingLoader",
  "id_social": "!1s0x31752f0fd45204e3:0xb9bb1fe46692de6c",
  "next_cursor": null,
  "hash_link": "",
  "isFullPage": true,
  "end_page": 1
}



{
    "id": "ChIJT9Pk5PsudTER3sQCMS5UC_0",
    "title": "Baoz Dimsum",
    "id_source": "https://www.google.com/maps/place/Baoz+Dimsum/@10.7543323,106.6658556,15.02z/data=!4m16!1m9!3m8!1s0x31752f51919b8e63:0x2d3eaced4c5b2368!2zUE5KIENvLm9wIFR1eSBMw70gVsawxqFuZw!8m2!3d10.7443631!4d106.6550367!9m1!1b1!16s%2Fg%2F11gvy13922!3m5!1s0x31752efbe4e4d34f:0xfd0b542e3102c4de!8m2!3d10.7531011!4d106.6696548!16s%2Fg%2F11bccmchpw?hl=vi&entry=ttu&g_ep=EgoyMDI2MDMyOS4wIKXMDSoASAFQAw%3D%3D",
    "platform": 5,
    "link": "https://maps.google.com/?cid=18233760073707078878&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNl",
    "retries": 0,
    "curr_page": 0,
    "status": 1,
    "next_crawl_time": "2026-03-26T04:30:44.929Z",
    "createdBy": "GoogleMapsReviewsCrawlingLoader",
    "id_social": "!1s0x31752efb44e4d34f:0xfd0b542e3102c4de",
    "next_cursor": null,
    "hash_link": "",
    "isFullPage": true,
    "end_page": 1
}



{
    "id": "f8a4b2c1-9d3e-4f67-8b1a-2e5d9c3b1a40",
    "title": "Hội An Quán",
    "id_source": "https://www.google.com/maps/place/H%E1%BB%99i+An+Qu%C3%A1n/@10.7797353,106.6788753,15.63z/data=!4m8!3m7!1s0x31752f279f276659:0x31151bc5d1ce02ed!8m2!3d10.7769944!4d106.6776261!9m1!1b1!16s%2Fg%2F11csb2s35m?entry=ttu&g_ep=EgoyMDI2MDMyOS4wIKXMDSoASAFQAw%3D%3D",
    "platform": 5,
    "link": "https://maps.google.com/?cid=3536763618811839213&g_mp=CiVnb29nbGUubWFwcy5wbGFjZXMudjEuUGxhY2VzLkdldFBsYWNl",
    "retries": 0,
    "curr_page": 0,
    "status": 1,
    "next_crawl_time": "2026-04-01T10:00:00.000Z",
    "createdBy": "GoogleMapsReviewsCrawlingLoader",
    "id_social": "!1s0x31752f279f276659:0x31151bc5d1ce01ed",
    "next_cursor": null,
    "hash_link": "",
    "isFullPage": true,
    "end_page": 1
}


## Những cases cần check lại ở testing


ynm-cl-news-crawling-loader-service-testing -> DONE

ynm-cl-article-post-ggmaps-service-testing -> DONE 

source-updater -> DONE




## Những cases cần check lại ở staging


ynm-cl-news-crawling-loader-service-staging -> DONE

ynm-cl-article-post-ggmaps-service-staging -> DONE

source-updater -> DONE














