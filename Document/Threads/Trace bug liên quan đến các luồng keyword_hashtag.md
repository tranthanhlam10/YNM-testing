# Trace các bug liên quan đến luồng keyword/hashtag của FB và Threads 


## Câu query cho keywod FB 
### Hiển thị số lượng được load lên 

SELECT
    `id`,
    `type`,
    `keyword`,
    `last_crawl_date`,
    `last_crawl_cursor`,
    `updated_date_keyword`
FROM
    monitoring_master.`monitor_keywords_v2`
WHERE
    `platform` = 'FACEBOOK'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND (
        `updated_date_keyword` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW()
ORDER BY
    `id` ASC
LIMIT 1000 
OFFSET 0;


### Tính số lượng các keyword cần đi crawl 

SELECT COUNT(*) AS total
FROM monitoring_master.`monitor_keywords_v2`
WHERE
    `platform` = 'FACEBOOK'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND (
        `updated_date_keyword` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW();


## Câu query cho hashtag  FB
### Hiển thị số lượng được load lên 
SELECT
    `id`,
    `type`,
    `keyword`,
    `last_crawl_date`,
    `last_crawl_cursor`,
    `updated_date_hashtag`
FROM
    monitoring_master.`monitor_keywords_v2`
WHERE
    `platform` = 'FACEBOOK'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND `keyword` LIKE "#%"
    AND (
        `updated_date_hashtag` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW()
ORDER BY
    `id` ASC
LIMIT 1000 
OFFSET 0;

### Câu lệnh tính số lượng cho hashtag của FACEBOOK
SELECT COUNT(*) AS total
FROM monitoring_master.`monitor_keywords_v2`
WHERE
    `platform` = 'FACEBOOK'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND `keyword` LIKE "#%"
    AND (
        `updated_date_hashtag` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW();


## Câu query cho keywod THREADS 
### Hiển thị số lượng được load lên 
SELECT
    `id`,
    `type`,
    `keyword`,
    `last_crawl_date`,
    `last_crawl_cursor`,
    `updated_date_keyword`
FROM
    monitoring_master.`monitor_keywords_v2`
WHERE
    `platform` = 'THREADS'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND (
        `updated_date_keyword` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW()
ORDER BY
    `id` ASC
LIMIT 1000 
OFFSET 0;


### Câu tính số lượng:
SELECT COUNT(*) AS total
FROM monitoring_master.`monitor_keywords_v2`
WHERE
    `platform` = 'THREADS'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND (
        `updated_date_keyword` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_keyword` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW();

## Câu query cho Hashtag THREADS 
### Câu ghi chi tiết 
SELECT
    `id`,
    `type`,
    `keyword`,
    `last_crawl_date`,
    `last_crawl_cursor`,
    `updated_date_hashtag `
FROM
    monitoring_master.`monitor_keywords_v2`
WHERE
    `platform` = 'THREADS'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND (
        `updated_date_hashtag` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW()
ORDER BY
    `id` ASC
LIMIT 1000 
OFFSET 0;


### Câu tính số lượng:
SELECT COUNT(*) AS total
FROM monitoring_master.`monitor_keywords_v2`
WHERE
    `platform` = 'THREADS'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND (
        `updated_date_hashtag` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_hashtag` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW();

## Câu query cho keywod/hashtag THREADS (No cookie)
### Câu query cho luồng keyword
SELECT 
    `id`,
    `type`,
    `keyword`
FROM 
    monitoring_master.`monitor_keywords_v2`
WHERE 
    `platform` = 'THREADS'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND `id` > 0
    AND (
        `updated_date_keyword_no_cookie` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_keyword_no_cookie` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_keyword_no_cookie` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_keyword_no_cookie` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW()
ORDER BY 
    `id` ASC
LIMIT 
    1000 
OFFSET 
    0;

### Câu tính số lượng:

SELECT 
    COUNT(*) AS total
FROM 
    monitoring_master.`monitor_keywords_v2`
WHERE 
    `platform` = 'THREADS'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND `id` > 0
    AND (
        `updated_date_keyword_no_cookie` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_keyword_no_cookie` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_keyword_no_cookie` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_keyword_no_cookie` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW();


### Câu query cho luồng hashtag
SELECT 
    `id`,
    `type`,
    `keyword`,
    `tagID`
FROM 
    monitoring_master.`monitor_keywords_v2`
WHERE 
    `platform` = 'THREADS'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND `tagID` IS NOT NULL
    AND `tagID` <> ""
    AND `id` > 0
    AND (
        `updated_date_hashtag_no_cookie` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_hashtag_no_cookie` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_hashtag_no_cookie` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_hashtag_no_cookie` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW()
ORDER BY 
    `id` ASC
LIMIT 
    1000 
OFFSET 
    0;

### Câu tính số lượng
SELECT 
    COUNT(*) AS total
FROM 
    monitoring_master.`monitor_keywords_v2`
WHERE 
    `platform` = 'THREADS'
    AND `status` = 1
    AND `keyword` IS NOT NULL
    AND `keyword` <> ""
    AND `tagID` IS NOT NULL
    AND `tagID` <> ""
    AND `id` > 0
    AND (
        `updated_date_hashtag_no_cookie` IS NULL
        OR (
            `type` = "BRAND_TRACKING"
            AND `updated_date_hashtag_no_cookie` < NOW() - INTERVAL 4 HOUR
        )
        OR (
            `type` = "CAMPAIGN_TRACKING"
            AND `updated_date_hashtag_no_cookie` < NOW() - INTERVAL 2 HOUR
        )
        OR (
            `type` = "CRISIS_TRACKING"
            AND `updated_date_hashtag_no_cookie` < NOW() - INTERVAL 30 MINUTE
        )
    )
    AND `expiry_date` > NOW();







## Những deployment liên quan đến FB hashtag và kewyord -> DONE 
crawler-fb-staging-crawl-hashtag-posts -> Hiện tại chạy thử lại cho luồng fb thử xem sa
crawler-fb-staging-crawl-post-by-keywords 




ynm-cl-tr-crawling-loader-service-staging

## Những deployment liên quan đến Threads kewyord no cookie và có cookie 
ynm-cl-tr-keyword-post-service-staging
ynm-cl-tr-keyword-post-no-cookie-service-staging


## Những deployment liên quan đến Threads hashtag no cookie và có cookie
ynm-cl-tr-hashtag-post-service-staging
ynm-cl-tr-hashtag-post-no-cookie-service-staging


// Câu query luồng proxy của Threads 
SELECT * FROM `proxies` WHERE crawler_type LIKE "TR_HASHTAG_POST_CRAWLER%" OR crawler_type LIKE "TR_KEYWORD_POST_CRAWLER%"


Threads cần 



(.*(fb\.page_web_comments|page_web_reply_comments).*)|(cl\.(mentions_2_solr_mentions|profiles_2_solr_identities|profiles_2_redis_identities|fb_posts_finished_sources))



    
staging.cl.tr.profile_2_solr_identities
staging.cl.tr.profile_2_redis_identities
staging.cl.tr.posts_2_solr_tr_posts
staging.cl.tr.mentions_2_solr_mentions
staging.cl.tr.reply_post_crawling_sources

(^staging\.cl\.tr\.(hashtag_posts_|keyword_posts_).*)|(^cl\.(profile_2_solr_identities|profile_2_redis_identities|posts_2_solr_tr_posts|mentions_2_solr_mentions|reply_post_crawling_sources)$)








[FCV-Type of Milk] Others

Hiện tại nếu update thường thì không bị lỗi 

TR_HASHTAG_POST_NO_COOKIE_CRAWLER
TR_KEYWORD_POST_NO_COOKIE_CRAWLER

ThreadsKeyword*



high_priority_detail_url_info|staging.cl.news.article_urls|auto_parser