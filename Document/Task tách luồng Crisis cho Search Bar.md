# Task tách luồng Crisis cho Search Bar


## Câu query cho luồng search bar - non crisis 

// Load lên đi crawl
SELECT *
FROM `monitoring_master`.`monitor_keywords_v2`
WHERE `platform` = 'YOUTUBE'
  AND `status` = 'IDLE'
  AND `keyword` IS NOT NULL
  AND `keyword` <> ''
  AND (
        (`type` = 'BRAND_TRACKING' AND
         (`updated_date_keyword` < NOW() - INTERVAL 4 HOUR OR `updated_date_keyword` IS NULL))
     OR (`type` = 'CAMPAIGN_TRACKING' AND
         (`updated_date_keyword` < NOW() - INTERVAL 2 HOUR OR `updated_date_keyword` IS NULL))
      )
  AND `expiry_date` > NOW();







// Update 
UPDATE `monitoring_master`.`monitor_keywords_v2`
SET `status` = 'IDLE'
WHERE `status` = 'UPDATING'
  AND `platform` = 'YOUTUBE'
  AND `type` IN ('BRAND_TRACKING', 'CAMPAIGN_TRACKING')



  ## Câu query của luồng search bar - crisis


  // Load lên đi crawl

 SELECT *
FROM `monitoring_master`.`monitor_keywords_v2`
WHERE `platform` = 'YOUTUBE'
  AND `status` = 'IDLE'
  AND `keyword` IS NOT NULL
  AND `keyword` <> ''
  AND (
        `type` = 'CRISIS_TRACKING' AND
        (
          `updated_date_keyword` < NOW() - INTERVAL 30 MINUTE
          OR `updated_date_keyword` IS NULL
        )
      )
  AND `expiry_date` > NOW();


  // Update

  UPDATE `monitoring_master`.`monitor_keywords_v2`
SET `status` = 'IDLE'
WHERE `status` = 'UPDATING'
  AND `platform` = 'YOUTUBE'
  AND `type` = 'CRISIS_TRACKING'


## Câu query cho luồng crawl detail - non crisis 

{
  "solrVersion": 302,
  "parameters": [
    "q=*:*",
    "fl=id,id_category,title,id_source,platform,link,created_date,count_failed,status,views_avg,next_crawl_time,priority",
    "fq=status:1",
    "fq=next_crawl_time:[* TO NOW]",
    "rows=10000",
    "cursorMark=*",
    "sort=next_crawl_time asc,id asc",
    "fq=platform:(7)"
    "fq=priority:(2 OR 3)"
  ]
}


## Câu query cho luồng crawl detail - crisis 

{
  "solrVersion": 302,
  "parameters": [
    "q=*:*",
    "fl=id,id_category,title,id_source,platform,link,created_date,count_failed,status,views_avg,next_crawl_time,priority",
    "fq=status:1",
    "fq=next_crawl_time:[* TO NOW]",
    "rows=10000",
    "cursorMark=*",
    "sort=next_crawl_time asc,id asc",
    "fq=platform:(7)",
    "fq=priority:1"
  ]
}


## Reset trạng thái toàn bộ keyword

// Không có Crisis
{
  "platform": "YOUTUBE",
  "priority": 2 or 3
}


// Có Crisis
{
  "platform": "YOUTUBE",
  "priority": 1
}


# Cách chạy

// Crisis
node scripts/articlesV3WithNextCrawlTime/crawlCrisisYoutubeDetails.js
node scripts/articlesV3/search_crisis_keywords_youtube_search_bar.js

// Non Crisis 

node scripts/articlesV3WithNextCrawlTime/crawlYoutubeDetails.js
node scripts/articlesV3/search_brand_campaign_keywords_youtube_search_bar.js


ynmpdp-5129-ytb-crisis-staging-crawler-empty-container
kubectl get pods -n crawler-staging | grep ynmpdp-5129-ytb-crisis-staging-crawler-empty-container
kubectl exec -it ynmpdp-5129-ytb-crisis-staging-crawler-empty-container-857zxr4w -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh


## Câu SQL update

UPDATE monitoring_master.monitor_keywords
SET status = 'DONE'
WHERE platform = 'YOUTUBE'
  AND type = 'CRISIS_TRACKING'
  AND status IN ( 'IDLE', 'UPDATING');




# Các data sau khi crawl

## Luồng search bar

// Luồng non Crisis Youtube

articles: -> Hiện tại đã đúng


 {
        "id":"80117f08-96da-5675-b4ba-e3fb70e054ca",
        "platform":7,
        "id_category":"0",
        "id_source":"youtube.com",
        "link":"https://www.youtube.com/watch?v=ybVrMwIkF2c",
        "title":"🔴TƯỜNG THUẬT ĐẠI LỄ A80: Diễu binh – Diễu hành bừng khí thế tại Quảng trường Ba Đình | ĐBTV",
        "views_avg":0,
        "priority":2,
        "status":1,
        "failed_type":1,
        "count_failed":0,
        "crawled_date":"1970-01-01T00:00:00Z",
        "_version_":1842226606004764672,
        "next_crawl_time":"2025-09-03T07:23:19.147Z",
        "created_date":"2025-09-03T07:23:19.147Z"}

{
  "id": "6abf06f5-df4c-5b75-b308-9570ef674703",
  "platform": 7,
  "id_category": "0",
  "id_source": "youtube.com",
  "link": "https://www.youtube.com/watch?v=PrxnTWZtnH4",
  "title": "MORSE CODE/EM XINH \"SAY HI\"💖LAMON-PHƯƠNG MỸ CHI-ORANGE-PHÁO/#emxinhsayhi#music#vieon #diana",
  "views_avg": 0,
  "priority": 2,
  "status": 1,
  "failed_type": 1,
  "count_failed": 0,
  "crawled_date": "1970-01-01T00:00:00Z",
  "_version_": 1841773678732247000,
  "next_crawl_time": "2025-08-29T07:24:14.009Z",
  "created_date": "2025-08-29T07:24:14.009Z"
}


{
        "id":"943546b1-3647-5eb3-9d21-73de2bed817f",
        "platform":7,
        "id_category":"0",
        "id_source":"youtube.com",
        "link":"https://www.youtube.com/watch?v=Ntx9DS5ry_Q",
        "title":"Mẹ Huyến ngồi với Tổng Bí thư Tô Lâm, nghe mà nể!",
        "views_avg":0,
        "priority":1,
        "status":1,
        "failed_type":1,
        "count_failed":0,
        "crawled_date":"1970-01-01T00:00:00Z",
        "_version_":1842216300259049472,
        "next_crawl_time":"2025-09-03T04:39:30.822Z",
        "created_date":"2025-09-03T04:39:30.822Z"}



mentions
  {
        "id":"bf66206f-0d34-5071-b487-a678a0fe24a2",
        "link":"https://www.youtube.com/watch?v=aBsPYCurBO4",
        "id_source":"UCLmplqb2rtwQA7D97woEPyA",
        "views":3736,
        "likes":29,
        "comments":0,
        "shares":0,
        "rating_score":0,
        "engagement_total":29,
        "engagement_s_c":0,
        "identity":"UCLmplqb2rtwQA7D97woEPyA",
        "identity_name":"Thể Thao Văn Hóa",
        "mention_type":1,
        "title":"🔴TƯỜNG THUẬT TOÀN CẢNH DIỄU BINH A80: Khi triệu trái tim cùng hướng về Tổ quốc | Thể thao Văn hóa",
        "search_text":["🔴TƯỜNG THUẬT TOÀN CẢNH DIỄU BINH A80: Khi triệu trái tim cùng hướng về Tổ quốc | Thể thao Văn hóa",
          "🔴TƯỜNG THUẬT TOÀN CẢNH DIỄU BINH A80: Khi triệu trái tim cùng hướng về Tổ quốc | Thể thao Văn hóa<br> <br>"],
        "attachment":"{\"media_src\":\"https://i.ytimg.com/vi/aBsPYCurBO4/hqdefault.jpg\"}",
        "is_to_topic":false,
        "domain":"youtube.com",
        "mention_type_details":1,
        "platform":7,
        "updated_at":"2025-09-03T07:26:15.563Z",
        "created_date":"2025-09-02T15:09:07Z"}



youtube_posts

 {
        "id":"bf66206f-0d34-5071-b487-a678a0fe24a2",
        "id_source":"UCLmplqb2rtwQA7D97woEPyA",
        "id_social":"aBsPYCurBO4",
        "title":"🔴TƯỜNG THUẬT TOÀN",
        "priority":2,
        "created_date":"2025-09-02T15:09:07Z",
        "_version_":1842226791187480576,
        "crawled_date":"2025-09-03T07:26:15.587Z"}



// Luồng Crisis Youtube -> Hiện tại đã lưu đúng 


articles


mentions



youtube_posts




## Luồng crawl detail

// Luồng non Crisis Youtube


articles -> Hiện tại cũng đã đúng
{
        "id":"ed6db558-3c21-548a-8195-5c8ae641c003",
        "platform":7,
        "id_category":"0",
        "id_source":"youtube.com",
        "link":"https://www.youtube.com/watch?v=ogLpK5ThWY4",
        "title":"ĐIỀU ĐẶC BIỆT VỀ 2 VỊ TƯỚNG ANH HÙNG NGỒI CẠNH TỔNG BÍ THƯ TÔ LÂM KHI ĐỌC DIỄN VĂN TẠI ĐẠI LỄ A80",
        "views_avg":0,
        "priority":1,
        "status":1,
        "failed_type":1,
        "count_failed":0,
        "crawled_date":"1970-01-01T00:00:00Z",
        "_version_":1842223996978855936,
        "next_crawl_time":"2025-09-03T06:41:50.985Z",
        "created_date":"2025-09-03T06:41:50.985Z"}




mentions




youtube_posts



// Luồng Crisis Youtube



articles




mentions





youtube_posts