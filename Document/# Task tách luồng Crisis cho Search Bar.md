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
kubectl exec -it ynmpdp-5134-testing-ynm-crawler-empty-5c99fc65f8-2vv62 -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh




