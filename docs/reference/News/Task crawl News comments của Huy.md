# Task crawl News comments của Huy


## Scope

Chỉ thêm country cho luồng chạy
Các luồng chạy cho global phải chạy theo config country
Ngoài ra về logic luồng crawl thì không thay đổi gì nhiều


## Chiến lược test

- Chuẩn bị data cho các luồng reviews/replies (Do data để đi crawl ở các luồng này khá ít)
- Kiểm tra loader (Load đúng config country hay không - còn query loader thì không thay đổi so với luồng VN)
- Kiểm tra crawling (Push bài xem có crawl được reviews/replies - còn logic crawling thì không thay đổi)
- Kiểm tra resolver (Đẩy được đúng mentions xuống routing_keys <country>)
- Kiểm tra pusher (Có mapping đúng country khi insert xuống solr)


## Câu lệnh chạy

1. RabbitMQ

(dev|testing|staging|production).cl.(mentions_2_solr_mentions_LamTT|news.news_comments|identities_2_solr_identities_LamTT|identities_2_redis_identities_LamTT)$


(dev|testing|staging|production).cl.(mentions_2_solr_mentions|news.news_comments|identities_2_solr_identities|identities_2_redis_identities)$


2. K8s

kubectl get pods -n crawler-testing | grep ynmshgysg-353-testing-crawler-empty-container
kubectl exec -it ynmshgysg-353-testing-crawler-empty-container-56497486f8-4rzjn -n crawler-testing -- sh

kubectl config use-context lamtt-k8s-local


3. SQL


SELECT `id`, `domain`, `pattern`, `max_connection`, `country`
FROM `monitor_sources`
WHERE state = 1
  AND domain NOT IN ('youtube.com')
  AND type & 4
  AND country = <COUNTRY>;


SELECT `id`, `domain`, `pattern`, `max_connection`, `country`
FROM `monitor_sources`
WHERE state = 1
  AND domain NOT IN ('youtube.com')
  AND type & 16
  AND country = <COUNTRY>;


SELECT `id`, `domain`, `pattern`, `max_connection`, `country`
FROM `monitor_sources`
WHERE state = 1
  AND domain NOT IN ('youtube.com')
  AND type & 32
  AND country = <COUNTRY>;


4. Solr


- News
q=*:* 
&fq=next_time_crawl:[* TO NOW]
&fq=state:2
&fq=id_social:[* TO *]
&fq=platform:(3 OR 4)
&fq=published_date:{NOW-1MONTH TO *]
&fq=last_have_data_date:{NOW-7DAYS TO *]
&fq=id_source:(<list_sources>)
&sort=next_time_crawl asc, id asc
&fl=id,title,link,platform,id_source,id_social,status,state,count_failed,end_page,options,shard,last_have_data_date,next_time_crawl,id_channel,caption,published_date,country_code


- Reviews

q=*:* 
&fq=next_time_crawl:[* TO NOW]
&fq=state:2
&fq=id_social:[* TO *]
&fq=platform:5
&fq=id_source:(<list_sources>)
&sort=next_time_crawl asc, id asc
&fl=id,title,link,platform,id_source,id_social,status,state,count_failed,end_page,options,shard,last_have_data_date,next_time_crawl,id_channel,caption,published_date,country_code



- Ecom

q=*:* 
&fq=next_time_crawl:[* TO NOW]
&fq=state:2
&fq=id_social:[* TO *]
&fq=platform:6
&fq=published_date:{NOW-6MONTHS TO *]
&fq=id_source:(<list_sources>)
&sort=next_time_crawl asc, id asc
&fl=id,title,link,platform,id_source,id_social,status,state,count_failed,end_page,options,shard,last_have_data_date,next_time_crawl,id_channel,caption,published_date,country_code




5. Câu lệnh chạy


- Luồng comment


export PUBLISHED_LIMIT=3650
export MIN_TIME_TO_COMMIT_WHEN_END_PAGE=5000
export COUNTRY=VN
concurrently --kill-others "node --max_old_space_size=8000 --stack-size=1500 services.js" "node scripts/commentsV3/crawl_url_comments.js"



export PUBLISHED_LIMIT=3650
export MIN_TIME_TO_COMMIT_WHEN_END_PAGE=5000
export COUNTRY=TH
concurrently --kill-others "node --max_old_space_size=8000 --stack-size=1500 services.js" "node scripts/commentsV3/crawl_url_comments.js"
 
 
export COUNTRY=VN
concurrently --kill-others "node --max_old_space_size=8000 --stack-size=1500 services.js" "node scripts/commentsV3/crawl_url_comments.js -f ECOM -e thegioididong.com,fptshop.com.vn,shopee.vn,lazada.vn"
 
 
export COUNTRY=VN
concurrently --kill-others "node --max_old_space_size=8000 --stack-size=1500 services.js" "node scripts/commentsV3/crawl_url_comments.js -f REVIEWS"
 
 
export COUNTRY=VN
concurrently --kill-others "node --max_old_space_size=8000 --stack-size=1500 services.js" "node scripts/commentsV3/crawl_url_comments.js -f ECOM -s thegioididong.com"
 
 
export COUNTRY=VN
concurrently --kill-others "node --max_old_space_size=8000 --stack-size=1500 services.js" "node scripts/commentsV3/crawl_url_comments.js -f ECOM -s shopee.vn"
 
 
export COUNTRY=VN
concurrently --kill-others "node --max_old_space_size=8000 --stack-size=1500 services.js" "node scripts/commentsV3/crawl_url_comments.js -f ECOM -s lazada.vn"
 
 
export COUNTRY=VN
concurrently --kill-others "node --max_old_space_size=8000 --stack-size=1500 services.js" "node scripts/commentsV3/crawl_url_comments.js -f ECOM -s fptshop.com.vn"
 
 
export COUNTRY=VN
concurrently --kill-others "node --max_old_space_size=8000 --stack-size=1500 services.js" "node scripts/commentsV3/crawl_url_comments.js -f REVIEWS -s maps.google.com"



- Luồng reviews

export PUBLISHED_LIMIT=3650
export COUNTRY=VN
concurrently --kill-others "node --max_old_space_size=8000 --stack-size=1500 services.js" "node scripts/commentsV3/crawl_reviews.js -f ECOM"



## Data test




{
  "id":"144153dd-4d40-592f-8b0d-5b31670a3fb9",
  "id_category":"358350",
  "id_social":"4155186-3",
  "title": { "set": "Phi hành đoàn Artemis II vào vùng không gian Mặt Trăng Phi hành đoàn Artemis II vào vùng không gian Mặt Trăng" },
  "id_source":"vnexpress.net",
  "platform":3,
  "link":"https://vnexpress.net/phi-hanh-doan-artemis-ii-vao-vung-khong-gian-mat-trang-5059038.html",
  "published_date":1775149200,
  "last_have_data_date":1775149200,
  "options":"\"null\"",
  "updated_date":0,
  "curr_page":1,
  "reach_updated_date":"1970-01-01T00:00:00Z",
  "state_reach":2,
  "state":2,
  "status":1,
  "next_time_crawl":"2025-02-11T10:03:54.844Z"
}



{
        "id":"668fec81-d55b-50ab-b99e-7e9a6d943e5e",
        "id_category":"0",
        "id_social":"4859969-1",
        "title":{"set":"vnexpress.net › Tâm sự › Hẹn hò"},
        "id_source":"vnexpress.net",
        "platform":3,
        "link":"https://vnexpress.net/em-co-nu-cuoi-toa-nang-4859969.html",
        "published_date":1775149200,
        "last_have_data_date":1775149200,
        "options":"",
        "updated_date":1775464198,
        "curr_page":2,
        "reach_updated_date":"1970-01-01T00:00:00Z",
        "state_reach":2,
        "state":2,
        "status":1,
        "end_page":1,
        "count_failed":0,
        "next_time_crawl":"2025-04-01T14:29:58.484Z"}


{
        "id":"0aeb1f4f-328b-554b-9b94-ef55cff8b0e8",
        "id_category":"335524",
        "id_social":"9999999",
        "title":"Điều bất ngờ xảy ra khi ngư dân khoe bắt được mực khổng lồ",
        "id_source":"baomoi.com",
        "platform":3,
        "link":"http://baomoi.com/dieu-bat-ngo-xay-ra-khi-ngu-dan-khoe-bat-duoc-muc-khong-lo-c52989501.epi",
        "published_date":1755147720,
        "last_have_data_date":1755678259,
        "options":"\"null\"",
        "updated_date":0,
        "curr_page":1,
        "reach_updated_date":"1970-01-01T00:00:00Z",
        "state_reach":2,
        "state":2,
        "status":1,
        "next_time_crawl":"2025-08-20T10:46:49.400Z"}




{
        "id":"199d6fd8-1434-5657-9b12-304e74c2f3e8",
        "id_category":"358363",
        "id_social":"4817372-1",
        "title":"Rửa mũi",
        "id_source":"vnexpress.net",
        "platform":3,
        "link":"https://vnexpress.net/dieu-gi-xay-ra-khi-rua-mui-bang-nuoc-muoi-4817372.html",
        "published_date":1775149200,
        "last_have_data_date":1775149200,
        "options":"",
        "updated_date":1775464128,
        "curr_page":1,
        "reach_updated_date":"1970-01-01T00:00:00Z",
        "state_reach":2,
        "state":2,
        "status":1,
        "end_page":1,
        "count_failed":0,
        "next_time_crawl":"2026-04-03T00:00:00Z",
        "country_code": {"set": "TH"}



{
        "id":"4b75350a-7f78-5050-90b0-7bce8908f428",
        "id_category":"0",
        "id_social":"9999999",
        "title":"Ưu đãi cho HOÀNG LONG HOTEL (Khách sạn) (Việt Nam)",
        "id_source":"booking.com",
        "platform":5,
        "link":"https://booking.com/hotel/vn/hoang-long-ha-long12.vi.html",
        "published_date":1755170445,
        "last_have_data_date":1755184649,
        "updated_date":1767586121,
        "curr_page":1,
        "reach_updated_date":"1970-01-01T00:00:00Z",
        "state_reach":2,
        "state":2,
        "status":1,
        "end_page":1,
        "count_failed":0,
        "options":"",
        "country_code": {"set":"VN"},
        "next_time_crawl":"2026-01-06T04:08:41.723Z"}


{
        "id":"0abf4af6-8a2b-5b7b-9636-446b237b1b30",
        "id_category":"187971",
        "id_social":"330246",
        "title":"Tai nghe Bluetooth Open-Ear True Wireless AVA+ FreeGo OWS02",
        "id_source":"thegioididong.com",
        "platform":6,
        "link":"https://www.thegioididong.com/tai-nghe/tai-nghe-bluetooth-open-ear-tws-ava-freego-ows02",
        "published_date":1775149200,
        "options":"",
        "updated_date":1767002542,
        "curr_page":1,
        "reach_updated_date":"1970-01-01T00:00:00Z",
        "state_reach":2,
        "state":2,
        "status":1,
        "end_page":1,
        "count_failed":0,
        "country_code": {"set":"VN"}
      }



## Data sau khi test



1. Queue mentions


{
        "id": "d40b56c6-4d2f-51b0-a92d-bc5bbd07b79e",
        "link": "https://vnexpress.net/ba-rac-roi-cua-ham-chung-cu-khi-xe-may-dien-tang-nhanh-5060089.html#5ceb3125d80b6eb5",
        "domain": "vnexpress.net",
        "id_source": "vnexpress.net",
        "id_reference": "f073a560-f5b2-555a-96e6-b90c7e0a0354",
        "id_parent_comment": "0d5eb89f-d49b-575f-9d0c-27b5a2e94c30",
        "views": 0,
        "likes": 0,
        "comments": 0,
        "shares": 0,
        "rating_score": 0,
        "engagement_total": 0,
        "engagement_s_c": 0,
        "identity": "e8745ed6715e8e65",
        "identity_name": "alibaD",
        "platform": 3,
        "mention_type": 2,
        "mention_type_details": 2,
        "title": "Ba vấn đề của xe máy điện với hầm chung cư",
        "search_text": [
          "Ba vấn đề của xe máy điện với hầm chung cư",
          "Hạ tầng phải đáp ứng thì mới được sử dụng, bạn láy trực thăng đến Chung cư rồi bảo họ phải xây bãi đáp cho bạn hả !?"
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"parent_info\":{\"link\":\"vnexpress.net/ba-rac-roi-cua-ham-chung-cu-khi-xe-may-dien-tang-nhanh-5060089.html\",\"title\":\"Ba vấn đề của xe máy điện với hầm chung cư\"}}",
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": null,
        "created_date": "2026-04-13T03:44:25.000Z",
        "updated_at": "2026-04-13T13:00:00.171Z",
        "shard": "20260413",
        "createdBy": "VnexpressCrawlUrlComments",
        "country_code": "VN"
      }



2. Queue comment






https://www.lazada.vn/products/pdp-i3192239679-s15194179105.html?c=&channelLpJumpArgs=&clickTrackInfo=query%253Aloa%252Bdi%252B%2525C4%252591%2525E1%2525BB%252599ng%252B%252Bloa%252Bth%2525C3%2525B9ng%252Bboombox%253Bnid%253A3192239679%253Bsrc%253ALazadaMainSrp%253Brn%253A2c3971d1c9d6218aa9fe224205695678%253Bregion%253Avn%253Bsku%253A3192239679_VNAMZ%253Bprice%253A660000%253Bclient%253Adesktop%253Bsupplier_id%253A200976336053%253Bsession_id%253A%253Bbiz_source%253Ahp_categories%253Bslot%253A21%253Butlog_bucket_id%253A470687%253Basc_category_id%253A10100399%253Bitem_id%253A3192239679%253Bsku_id%253A15194179105%253Bshop_id%253A5018489%253BtemplateInfo%253A107883_E%2523-1_A3_C%2523&freeshipping=1&fs_ab=2&fuse_fs=&lang=vi&location=H%E1%BB%93%20Ch%C3%AD%20Minh&price=6.6E%205&priceCompare=skuId%3A15194179105%3Bsource%3Alazada-search-voucher%3Bsn%3A2c3971d1c9d6218aa9fe224205695678%3BoriginPrice%3A660000%3BdisplayPrice%3A660000%3BsinglePromotionId%3A-1%3BsingleToolCode%3AmockedSalePrice%3BvoucherPricePlugin%3A0%3Btimestamp%3A1775529790972&qSellingPoint=p--th%C3%B9ng___p--di%20%C4%91%E1%BB%99ng___p--boombox&ratingscore=4.0&request_id=2c3971d1c9d6218aa9fe224205695678&review=4&sale=11&search=1&source=search&spm=a2o4n.searchlist.list.21&stock=1



## Những case cần test lại ở Testing

+ crawler-testing-news-crawl-reviews
+ crawler-testing-news-crawl-url-comments


## Những case cần test lại ở Staging

+ crawler-staging-news-crawl-reviews
+ crawler-staging-news-crawl-url-comments




