# Thông tin ECI

## Tổng quan

```plaintext
total_rating_per_latest_sold: [ 0.03 TO *]
```

// Câu query khi test màn hình model management
SELECT DISTINCT * FROM `models`as m INNER JOIN product_lines as pl ON m.product_line_id = pl.id INNER JOIN industries as i ON pl.industry_id = i.id WHERE i.id = 1 and m.deleted_at IS null AND m.display_name LIKE "%Iphone%" ORDER BY m.display_name ASC 


SELECT DISTINCT * FROM `models`as m INNER JOIN product_lines as pl ON m.product_line_id = pl.id INNER JOIN industries as i ON pl.industry_id = i.id WHERE i.id IN (1,2,3,4,5) and m.deleted_at IS null AND query is not null AND brand_id IN (1,2,10,351) ORDER BY m.display_name ASC 



SELECT DISTINCT * FROM `models`as m INNER JOIN product_lines as pl ON m.product_line_id = pl.id INNER JOIN industries as i ON pl.industry_id = i.id 
WHERE i.id IN (1,2,3,4,5) and m.deleted_at IS null AND query is null AND brand_id IN (1,2,10,351)  AND m.product_line_id IN (1,2)
ORDER BY m.display_name ASC

// Câu query khi test màn hình brand management
SELECT * FROM `brands` as b INNER JOIN product_lines as pl ON b.id = pl.brand_id WHERE pl.industry_id = 1 AND b.deleted_at IS NULL 


SELECT * FROM `view_industries_brands` WHERE industry_id = 2 AND name LIKE "%Pediasure%" 


Câu facet tính toán Sold/GMV và sort trong Market Insights:

    json.facet=   {"total_gmv":"sum(gmv)", "total_sold_items":"sum(sold)" }

    json.facet= {"model_id":      {"type":"terms","field":"model_id", "limit": 100,  "facet":  {"total_sold_items":"sum(sold)" , "total_gmv_items":"sum(gmv)", "avg_discount":"avg(avg_discount)"  }  , sort : {total_sold_items :  desc} } }


    json.facet=   {"standard_category_id":      {"type":"terms","field":"standard_category_id", "limit": 100000,  "facet":  {"total_sold_items":"sum(sold)" , "total_gmv_items":"sum(gmv)"    }  , sort : {total_sold_items :  desc} } }

    json.facet=  {"brand_id":      {"type":"terms","field":"brand_id", "limit": 100000,  "facet":  {"total_sold_items":"sum(sold)" , "total_gmv_items":"sum(gmv)"    }  , sort : {total_sold_items :  desc} } }
    

    json.facet=  {"shop_id":      {"type":"terms","field":"shop_id", "limit": 100,  "facet":  {"total_sold_items":"sum(sold)" , "total_gmv_items":"sum(gmv)"    }  , sort : {total_sold_items :  desc} } }


    json.facet=  {"product_item_id":      {"type":"terms","field":"product_item_id", "limit": 100,  "facet":  {"total_sold_items":"sum(sold)" , "total_gmv_items":"sum(gmv)" , "avg_discount":"avg(avg_discount)"   }  , sort : {total_sold_items :  desc} } }


    Công thức tính số shop:
    {"total_shop":"hll(shop_id)"}


    Câu lện update trong mongoDB
    {
    "filter": { "id": "lazada_1258648486" },
    "update": { "$set": { "detail_crawled_date": "2024-05-14T17:00:00.000+00:00" } },
    "options": { "multi": true }
    }


    {$and: [{title: { "$regex": "Điện", "$options": "i" }}  , {source_id: "tiki.vn"}]}


    {
    $set: {
            "detail_crawled_date": "$date": "2018-04-15T16:54:40.000Z"
    },
    }

            {
        $set: {
                    "detail_crawled_date": {"$date": "2024-05-14T17:00:00.000+00:00"}
        },
        }

json.facet=  {"sell_price":      {"type":"terms","field":"sell_price", "limit": 100000,  "facet":  {"total_sold_items":"sum(sold)" , "total_gmv_items":"sum(gmv)"    }  , sort : {total_sold_items :  desc} } }


Câu query search like 2 giá trị trong Mongo compasss:
{
$or: [
    { brand_id: { $regex: 'lam1', $options: 'i' } },
    { brand_name: { $regex: 'lam1', $options: 'i' } }
], version: 1717475270056, relationship_type: "product_item"
}



{
$or: [
    { brand_id: { $regex: '3', $options: 'i' } },
    { brand_name: { $regex: '3', $options: 'i' } }
], version: 1718333789685, relationship_type: "product_item", shard: "202401", industry_id: 1
}

1717475270056


Câu lệnh SQL cho task Brand and Manufacturer:

SELECT brands.name FROM `brands` INNER JOIN product_lines ON brands.id = product_lines.brand_id 
WHERE product_lines.industry_id IN (1,2) AND brands.deleted_at IS NUll
GROUP BY brands.name

Cáu lệnh SQL sort group: 
SELECT * FROM `groups` WHERE project = "ECA" AND deleted_at is null ORDER BY expired_date  DESC

Câu lệnh SQL filter
SELECT * FROM `groups` WHERE project = "ECA" AND deleted_at is null AND expired_date BETWEEN "2023-10-11 00:00:00" AND "2023-10-11 23:59:59"


SELECT * FROM brands INNER JOIN product_lines ON brands.id = product_lines.brand_id WHERE product_lines.industry_id = 1 

Câu query để test filter Brand: (*:* -brand_id: [1 TO *]) OR brand_id: 1

SELECT * FROM `brands` WHERE manufacturer_id is null AND deleted_at is null AND is_active = 1 

SELECT brands.name FROM `brands` INNER JOIN product_lines ON brands.id = product_lines.brand_id WHERE product_lines.industry_id = 1 AND manufacturer_id is null AND brands.deleted_at is null AND is_active = 1 GROUP BY brands.name 



{
       "id":"shopee!34970992",
        "link": {"set": "https://shopee.vn/shop/34970992aaaaaaa"}
        "shop_status":{"set": 1}
}



lamtt@younetgroup.com/Lam@12345



DELETE FROM jobs WHERE type = "WEEKLY_CALCULATE_PI_TW" AND date = "2023-07-30" 


k8s
eyJhbGciOiJSUzI1NiIsImtpZCI6IjZWZlZVc3RidXAzUzQ1Q1lXY0s1dkcyeE1tN2RLTkhVamEtbE5RNVA3WlEifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImxhbXR0LXRva2VuLW45am13Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImxhbXR0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiODkyOWI1MjMtOTgyOC00ZjBlLThlZjctZmU2ZTUyYzg0ZDgxIiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmRlZmF1bHQ6bGFtdHQifQ.YBZH1vqK8ARmMs2AEobgtQVmBEECOQ0fB23eNPvfHg3QQkjBGEoahfDR22p3YchJ4ioHpF_PbP_cnW5m77TuSWt16qxITW2amQlVYgsMeoAyVJmpJ3YAjZ_R9kQUDKOGLpOIpNTqDrrYIsmPHVguVdu3NzwfvKmWi-Xlij43lXck0J3_prPZr20CCq6wyxoNo_9gat1rQ2J3mqFI14J4VbyD8M0Gvlv2XQt7BYgxjb5P5xZ8jaNYTB7xB952tGgat6Q0Y0_iBb6Pd0BCnvrFstLPsAjQQm-FGECC71nuYuTdTXbEW3wTO5baojg5ieUsdKaj9p76HctJ6-8mVrZ_IQss


{
    "$params": {
        "df": "title"
    },
    "$search": "ai_brand_id_first: (5020 5021)",
    "-model_id": "[* TO *]",
    "source_id": {
        "$in": [
            "lazada.vn"
        ]
    }
}


root / qF1ASZOudv
54.39.243.62 / 30495

Câu lệnh tạo shard: 
solr/admin/collections?action=CREATESHARD&collection=product_item_weekly&shard=202305


k8s local
eyJhbGciOiJSUzI1NiIsImtpZCI6ImJDUGlMNlR6TV9FRmZoUzY2cHNQZ1U0X0xUTU12bHFMLW56UDcyZ3I1b28ifQ.eyJpc3MiOiJrdWJlcm5ldGVzL3NlcnZpY2VhY2NvdW50Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9uYW1lc3BhY2UiOiJkZWZhdWx0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZWNyZXQubmFtZSI6ImxhbXR0LXRva2VuLWhqdndyIiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQubmFtZSI6ImxhbXR0Iiwia3ViZXJuZXRlcy5pby9zZXJ2aWNlYWNjb3VudC9zZXJ2aWNlLWFjY291bnQudWlkIjoiMDZiNzg3YzYtYmY0Ni00NGVkLWI1MzQtN2FkMzY3OTkyNTA5Iiwic3ViIjoic3lzdGVtOnNlcnZpY2VhY2NvdW50OmRlZmF1bHQ6bGFtdHQifQ.GGgVGxv_smAO2mdN-7A8ig8yaXN_64ALdqjSk6qLZJecRCULfNdm3s0WMG7As3_mT2GNkFF1Gp6YGM_MVYwRrdxqKOI-2pnyPznyJfya3T8-XdTH8h85Yrdau6qVpsp_vWUwgzYN2q4CgRqbMSiMC9J1l4p-6D32-CtZ1LhoPAxBAbJmLPbSTrMIIeu9777InFTAta3_EK1nc38uwvMm5NkRIdetolh530KN5MMWqp27ztUYJqZ-nM8jnpkjY3gRS9KiQkW5xA0yFegSs85GkE62WEy6rnhKAXegYfHlvk3WpTPF2a94nRTGu1qNoiUU9kB5EE3s7gg0zBP0J94vkg

{
  "name": "{{brand_name}}",
  "manufacturer_id": {{manu_id}}
}

 Câu lệnh query theo ngày để test Brand và Cate

 ["2024-01-01T17:00:00.000Z" TO "2024-01-31T16:59:59.000Z"]


 approval_date:["2024-03-05T17:00:00Z" TO "2024-05-27T16:59:59Z"]


ai_cate_retraining_date:["2024-05-12T17:00:00.000Z" TO "2024-05-19T16:59:59.000Z"]
"ai_cate_retraining_date":  {"set":"2024-05-14T17:00:00.000Z"}

"created_date":  {"set":"2024-05-14T16:59:59.000Z"}

2024-05-31T16:59:59.000Z

 ["2024-01-27T17:00:00.000Z" TO "2024-06-02T16:59:59.000Z"]


66515463b4b69800103eb0e8

"manual_standard_category_id": {"set": -1}

"is_approved": {"set": 1}

"approval_date": {"set":"2024-05-14T17:00:00.000Z"}

"ai_brand_id":{"set": 543}
"ai_brand_id":{"set": 517}

"brand_id": {"set": 543},
"ai_brand_id":{"set": 517},
"is_approved": {"set": 1},
"approval_date": {"set":"2024-05-14T17:00:00.000Z"}
"standard_category_id": {"set": 4}

"brand_id": {"set": 543},
"ai_brand_id":{"set": 543},
"is_approved": {"set": 1},
"approval_date": {"set":"2024-05-14T17:00:00.000Z"}
"standard_category_id": {"set": 382}


"brand_id": {"set":522 },
"ai_brand_id":{"set": 543},
"is_approved": {"set": 1},
"approval_date": {"set":"2024-05-14T17:00:00.000Z"}
"standard_category_id": {"set": 594}

"brand_id": {"set":522 },
"ai_brand_id":{"set": 543},
"is_approved": {"set": 1},
"approval_date": {"set":"2024-05-14T17:00:00.000Z"}
"standard_category_id": {"set": 4}\



"brand_id": {"set":516 },
"ai_brand_id":{"set": 516},
"is_approved": {"set": 1},
"approval_date": {"set":"2024-05-14T17:00:00.000Z"}
"standard_category_id": {"set": 691}

15.235.83.111
27017



"2024-06-02T17:00:00.000Z" TO "2024-06-09T16:59:59.999999Z"

"2024-01-10T17:00:00.000Z" TO "2024-05-27T16:59:59.999999Z"


2024-01-10T17:00:00.000Z

2024-05-27T16:59:59.999999Z

2024-03-05T17:00:00Z 
2024-05-27T16:59:59Z

"2024-06-02T17:00:00.000Z" TO "2024-06-09T16:59:59.999999Z"


Câu lệnh query tính API metric cho Production
ai_cate_retraining_date: ["2024-06-02T17:00:00.000Z" TO "2024-06-09T16:59:59.999999Z"] AND manual_standard_category_id: [1 TO *] AND -manual_standard_category_id: 404 AND standard_category_id: 404

ai_cate_retraining_date: ["2024-06-02T17:00:00.000Z" TO "2024-06-09T16:59:59.999999Z"] AND manual_standard_category_id: 438 AND standard_category_id: 438 AND is_approved: 1

ai_cate_retraining_date: ["2024-06-02T17:00:00.000Z" TO "2024-06-09T16:59:59.999999Z"] AND manual_standard_category_id: 438 AND is_approved: 1

ai_cate_retraining_date: ["2024-06-02T17:00:00.000Z" TO "2024-06-09T16:59:59.999999Z"] AND manual_standard_category_id: 438 AND -standard_category_id: 438 AND -is_approved: 1

ai_cate_retraining_date: ["2024-06-02T17:00:00.000Z" TO "2024-06-09T16:59:59.999999Z"] AND manual_standard_category_id: [1 TO *] AND -manual_standard_category_id: 438 AND standard_category_id: 438

created_date: ["2024-01-02T17:00:00.000Z" TO "2024-06-09T16:59:59.999999Z"] AND standard_category_id: 438


brand_id: 337066 AND ai_brand_id: 337066 AND industry_id: 5 AND approval_date: ["2024-06-02T17:00:00.000Z" TO "2024-06-09T16:59:59.999999Z"] AND is_approved: 1


brand_id: 337066 AND industry_id: 5 AND approval_date: ["2024-06-02T17:00:00.000Z" TO "2024-06-09T16:59:59.999999Z"]  AND is_approved: 1



ai_brand_id: 337066 AND -brand_id = 337066 AND  approval_date: ["2024-06-02T17:00:00.000Z" TO "2024-06-09T16:59:59.999999Z"]  AND is_approved: 1 AND standard_category_id: (626)



câu lệnh query industry Brand

{version: 1718176177604, industry_id: 1, is_active: 0}


{
$or: [
    { brand_id: { $regex: 'lam1', $options: 'i' } },
    { brand_name: { $regex: 'lam1', $options: 'i' } }
], {version: 1718176177604, industry_id: 1, is_active: 0, relationship_type: "product_item"}
}

[* TO {{end_date}}]


[
  {
    "name": "{{brand_name}}",
    "manufacturer_id": {{manu_id}},
    "is_active": 0
  },
  {
    "name": "{{brand_name_update}}",
    "manufacturer_id": {{manu_id}},
    "is_active": 1
  },
  {
    "name": "{{brand_name_clone}}",
    "manufacturer_id": {{manu_id3}},
    "is_active": 0
  }
]


Câu query tính toán số lượng Brand Extraction:
{version: 1720407541844, manual_standard_category_id: 14, brand_id: "2", pi_coverage:  { "$gte": 70 } }

{version: 1721071030903, manual_standard_category_id: 2, pi_coverage:  { "$gte": 70 }, is_active: 0, brand_id: "2", is_variant: true}


{version: 1721071030903, manual_standard_category_id: 97, pi_coverage:  { "$gte": 40 }, brand_id: "5727"}



// Data social 

kubectl config use-context lamtt-k8s-local
Câu lệnh tìm tất cả các pod trong namespace
kubectl get pods -n crawler-testing

Câu lệnh tìm tất cả các pod theo keyword
kubectl get pods -n crawler-testing | grep instagram
kubectl get pods -n crawler-testing | grep tiktok

Câu connect vào pod instagram
kubectl exec -it ynmpdp-4514-threads-keyword-post-testing-ynm-crawler-empty4txnj -n crawler-testing -- sh
kubectl exec -it "pod_name" -n "name_space" -- sh


Câu connect vào pod tiktok

Sau đó chạy đoạn script 
IG_API_ENDPOINT=http://graph-instagram-api-testing.ynm.local  node scripts/instagram/get_latest_post_comments.js :M6jaSinmnB@192.168.1.103:6380 

Câu lệnh kiểm tra xem script nào đang chạy
px aux 

Câu lệnh kill đoạn script vừa chạy theo id
kill -9 "id"

Câu lệnh dùng để check xem port nào đang được sử dụng trên hệ thống linux
netstat -tuln
Kết hợp với các thông tin về process
netstat -tulnp



Hướng test của củta việc crawl comment
1.Vào collection Instagram Post
2.Lấy 1 record, chỉnh lại id_social (Cách lấy id_social của user đó chính là lấy ở URL)
3.Chuyển đổi id source từ URL thành số, sau đó thêm "ig_" vào trước dãy số đó
4.Update record vừa được chỉnh sửa vào Instagram is_to_topic




Câu query các keyword trên monitor_keyword_v2
SELECT * FROM `monitor_keywords_v2` WHERE keyword LIKE "%Lam%" AND platform = "TIKTOK" ORDER BY `id` ASC 




Câu query load số keyword/hashtag đem đi crawl
SELECT *
FROM monitor_keywords_v2
WHERE status = 'IDLE'
  AND platform = 'TIKTOK'
  AND (
    (type = 'BRAND_TRACKING' AND (updated_date_hashtag < NOW() - INTERVAL 4 HOUR OR updated_date_hashtag IS NULL))
    OR (type = 'CAMPAIGN_TRACKING' AND (updated_date_hashtag < NOW() - INTERVAL 2 HOUR OR updated_date_hashtag IS NULL))
    OR (type = 'CRISIS_TRACKING' AND (updated_date_hashtag < NOW() - INTERVAL 30 MINUTE OR updated_date_hashtag IS NULL))
  )
  AND expiry_date > NOW()
  AND keyword IS NOT NULL
  AND keyword != ' '

// Nếu như field update_date_hashtag thỏa mãn điều kiện trên, các keyword(hashtag) tương ứng đều đủ điều kiện đem đi crawl
// Tương tự như update_date_keyword thỏa mãn điều kiện trên, các keyword tương ứng đều đủ đều kiện đem đi crawl

  

SELECT *
FROM monitor_keywords_v2
WHERE status = 'IDLE'  
  AND platform = 'TIKTOK'
  AND (
    (type = 'BRAND_TRACKING' AND updated_date_keyword < NOW() - INTERVAL 4 HOUR)
    OR (type = 'CAMPAIGN_TRACKING' AND updated_date_keyword < NOW() - INTERVAL 2 HOUR)
    OR (type = 'CRISIS_TRACKING' AND updated_date_keyword < NOW() - INTERVAL 30 MINUTE)
    OR updated_date_keyword IS NULL
  )
  AND expiry_date > NOW()
  AND keyword IS NOT NULL;




"mentions schema":
id
link
platform
domain
shard
id_social
id_source
id_reference
id_parent_comment
identity
identity_name
mention_type
mention_type_details
source_type
source_category
post_format
views
likes
comments
shares
haha
sad
angry
wow
heart
reaction
rating_score
engagement_total
engagement_s_c
title
search_text
search_text_exactly
sound
sound_exactly
effect
effect_exactly
attachment
link_shared
link_shared_id
link_shared_domain
created_date
updated_at
is_noisy
id_seeder
is_admin_creator
is_to_topic
closed_group
is_kol
language



"instagram post schema":
id
id_social
title
id_source
comment_updated_at
priority
source_type
crawled_date
created_date
comment_last_date
cursor
is_kol
likes
comments
shares
views
engagement_updated_at
next_crawl_time
last_status
error_message
_version_


"topic schema":
id
id_source
source_name
domain
id_reference
id_parent_comment
id_table
identity
identity_name
identity_gender
identity_city
identity_birthday_year
identity_job_level
identity_education_level
identity_commercial_rate
platform
mention_type
mention_type_details
man_updated_at
source_type
source_category
views
likes
comments
shares
haha
sad
angry
wow
heart
reaction
rating_score
engagement_total
engagement_s_c
title
search_text
search_text_exactly
sound
sound_exactly
effect
effect_exactly
link
link_shared
link_shared_domain
attachment
sentiment
category
categories
sentiment_auto
negative_level
created_date
date_gmt7
is_noisy
is_ignore
is_relevance
is_approved
tags
mention_tags
mention_attributes
tags_auto
tags_confident_score
competitors
updated_at
engagement_date
copied_at
last_activity
last_sentiment
flag
brand_mention
confident_score
is_sample
image
identity_created_date
cluster_id
rnd_cluster_processing_time
_version_


"identity schema"
id
id_social
mapping_id
is_personal
page_id
platform
link
shard
domain
is_kol
fullname
first_name
middle_name
last_name
gender
fb_user_type
category
friend_count
subscriber_count
birthday_day
birthday_month
birthday_year
id_city
current_city
fb_account
hometown
phone
email
address
interested
country
zip_code
relationship_status
job_level
education_level
industry
closed_group
is_private
language
avatar
post_updated_at
post_last_date
reply_updated_at
reply_last_date
repost_updated_at
repost_last_date
engagement_updated_at
info_updated_at
last_crawl_followers
next_crawl_time
reply_next_crawl_time
repost_next_crawl_time
priority
created_date
updated_at
last_status
error_message
commercial_rate
tt_user_id






SELECT * FROM `tokens` WHERE `crawler_type` LIKE 'TR_KEYWORD_POST_CRAWLER' ORDER BY `crawler_type` DESC 

shards=20240830,20240831,20240901,20240902,20240903,20240904,20240905,20240906,20240907,20240908,20240909 


shards=20240814,20240815,20240816,20240817,20240818,20240819,20240820,20240821,20240822,20240823,20240824,20240825,20240826,20240827,20240828,20240829,20240830,20240831,20240901,20240902,20240903,20240904,20240905,20240906,20240907,20240908,20240909,20240910,20240911,20240912,20240913,20240914,20240915,20240916,20240917,20240918,20240919,20240920,20240921,20240922,20240923,20240924,20240925,20240926,20240927,20240928,20240929,20240930,20241001,20241002,20241003,20241004,20241005,20241006,20241007,20241008,20241009,20241010,20241011,20241012,20241013,20241014,20241015,20241016,20241017,20241018,20241019,20241020,20241021,20241022,20241023


109647


COPY BAI VIET TU SOLR -> TOPIC
kubectl config use-context k8s-local
->kubectl config use-context linhhnm-k8s-local
kubectl get pods -n sl-testing | grep copy-data
kubectl exec -it # -n sl-testing sh
** next post thread:
<1> node scripts/sentiment/copy_docs_belong_topic.js -i 109647

** next comment thread:
<2> node scripts/sentiment/copy_comments_to_topic.js -i <id_topic>

** previous post thread:
node scripts/sentiment/copy_old_docs_to_topic.js -i 109647

** previous comment thread:
<3> node scripts/sentiment/copy_comments_to_topic_old.js -i <id_topic>

all topic
<4> node scripts/sentiment/copy_docs_belong_topic.js
<5> node scripts/sentiment/copy_comments_to_topic.js


staging (sl-staging)
kubectl config use-context lamtt-k8s-ovh
kubectl get pods -n sl-staging | grep copy-data
kubectl exec -it socialheat-copy-data-staging-dev-6fbbfbd674-xvglb -n sl-staging sh


Update DB để chạy script copy tới
Database: monitoring_app »Table: app_topics
solr_range_from=2025-10-14 03:27:33, solr_range_to=null, solr_core_segment=null, solr_range_offset=*

// Chinh field o DB truoc roi chajy script 1



-gift: 1
-abnormal: 1
- Nếu chọn thêm option thì abnormal mới có thêm param %
-country_id: 0

// Các tài khoản trên social suite
Account Admin
lamtt_AccountAdmin@younetgroup.com	
Lam@12345


User
lamtt_User@younetgroup.com	
Lam@12345

Editor
lamtt_Editor@younetgroup.com
Lam@12345


System Admin
lamtt@younetgroup.com
Lam@12345

Observer
lamtt_Observer@younetgroup.com
Lam@12345

nguyennp@younetgroup.com
123456789q

// setup ynm local
nameserver 192.168.1.101
nameserver 8.8.8.8
options edns0 trust-ad
search YNM.LOCAL

// Cau lenh de chinh sua
sudo vim  /etc/resolv.conf


// Các kiến thức bổ trợ được khi test task Monthly (Có làm việc với BigQuery)
fq={!frange l=0 u=0}if(eq(sentiment_rule, sentiment), 1, 0)

fq={!frange l=0 u=0}if(eq(sentiment_auto, sentiment), 1, 0)
fq=-sentiment_rule:[* TO *]



fq=sentiment_auto:-10 AND is_noisy:1

fq=(-sentiment_auto:-10 AND is_noisy:1) OR (sentiment_auto:-10 AND is_noisy:0)

fq=(sentiment_auto:-10 AND is_noisy:1 AND is_ignore:1)



Câu query ở solr đế tính toán  


select id, is_active From topic where is_active = 1 


Các bước gọi được API trên Postman:
1.  paste cURL vào Postman curl
    curl --location 'https://bigquery.googleapis.com/bigquery/v2/projects/eci-testing/queries' \
--header 'Authorization: Bearer ya29.a0AeXRPp6jpfxllvcifUjhV6_bXu7PWCfUuAP2uDfAK5_rLVz9hkuicrNwmeOy1gSiiRlMOmMd7DpWP2_yA9tnuWIEHSsgRDPrwK4CShZVgUnCZa5Qev1CNlwg6gnGpOf7begkN9eE8xOkeHCODEXRCZkLJbwrqejrLg7j2ewSMnSn4AaCgYKARMSARMSFQHGX2MiiPrygitajZMLsebZ1gpOug0181' \
--header 'Content-Type: application/json' \
--data '{
  "query": "SELECT * FROM `eci-testing.Socialheat_Monitoring.local_monthly_action_topics` LIMIT 1000",
  "useLegacySql": false
}'
2. 	Cài đặt gg cloud CLI
3.  gcloud auth login -> Đăng nhập tài khoản GG 
4. 	gcloud config set project eci-testing (eci-testing là project mà mình muốn access vào )
5.  gcloud auth print-access-token -> Chạy câu lệnh này để lấy Bearer token để gọi 



ya29.a0AeXRPp6jpfxllvcifUjhV6_bXu7PWCfUuAP2uDfAK5_rLVz9hkuicrNwmeOy1gSiiRlMOmMd7DpWP2_yA9tnuWIEHSsgRDPrwK4CShZVgUnCZa5Qev1CNlwg6gnGpOf7begkN9eE8xOkeHCODEXRCZkLJbwrqejrLg7j2ewSMnSn4AaCgYKARMSARMSFQHGX2MiiPrygitajZMLsebZ1gpOug0181




Chạy postman bằng newman CLI
newman run SH - Script calculate monthly topic.postman_collection.json -e SH - Script calculate monthly topic.postman_environment.json  -n 5000
// Hiện tại thằng Postman V6 nó không hỗ trợ như vầy nữa, nên chỉ có thể chạy 3 luồng song song


// Cách chạy đúng
Tên folder chưa request cần chạy

newman run "SH - Script calculate monthly topic.postman_collection.json" \
  -e "SH - Script calculate monthly topic.postman_environment.json" \
  --iteration-data "data.json" \
  --folder "Topic" \
  -n 10000 &

newman run "SH - Script calculate monthly topic.postman_collection.json" \
  -e "SH - Script calculate monthly topic.postman_environment.json" \
  --iteration-data "data.json" \
  --folder "Topic" \
  -n 10000 &

newman run "SH - Script calculate monthly topic.postman_collection.json" \
  -e "SH - Script calculate monthly topic.postman_environment.json" \
  --iteration-data "data.json" \
  --folder "Tên Topic" \
  -n 10000 &

wait

1. Phải tạo 1 thư mục chứa collection SH - Script calculate monthly topic.postman_collection.json
2. Ngoài ra phải tạo thư mục chứa collection -> 