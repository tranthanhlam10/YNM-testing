INSERT INTO crawler_token_resource_config (platform, country, priority, crawler_type, quota) VALUES ('facebook', 'VN', '1', 'FB', 50);



FB_GRAPH_ENGAGEMENT_BY_TOPIC_CRAWLER



// Proxy


INSERT INTO `crawler_proxy_resource_config` 
    (country, crawler_type, quota )
VALUES
    ('VN', 'PT_COMMENT_NO_COOKIE_CRAWLER', 300);


FB_KEYWORD_POST_CRISIS_CRAWLER


FB_PAGE_IDENTITY_CRAWLER

FB_PAGE_IDENTITY_CRAWLER


FB_HASHTAG_POST_NON_CRISIS_CRAWLER
FB_USER_IDENTITY_CRAWLER

INSERT INTO crawler_token_resource_config (platform, country, priority, crawler_type, quota) VALUES ('facebook', 'VN', '1', 'FB_KEYWORD_CRISIS_CRAWLER_LamTT', 10);


INSERT INTO crawler_token_resource_config (platform, country, priority, crawler_type, quota) VALUES ('facebook', 'VN', '2', 'FB_HASHTAG_CRISIS_CRAWLER_LamTT', 2);


INSERT INTO crawler_token_resource_config (platform, country, priority, crawler_type, quota) VALUES ('facebook', 'VN', '1', 'FB_GRAPH_ENGAGEMENT_BY_TOPIC_CRAWLER', 40);


INSERT INTO crawler_token_resource_config (platform, country, priority, crawler_type, quota) VALUES ('facebook', 'VN', '3', 'FB_PAGE_IDENTITY_CRAWLER', 50);


INSERT INTO crawler_token_resource_config (platform, country, priority, crawler_type, quota) VALUES ('facebook', 'VN', '3', 'FB_HASHTAG_POST_NON_CRISIS_CRAWLER', 10);


INSERT INTO crawler_token_resource_config (platform, country, priority, crawler_type, quota) VALUES ('instagram', 'VN', '1', 'IG_IDENTITY_COUNTRY_CRAWLER', 200);



INSERT INTO crawler_proxy_resource_config (country, crawler_type, quota) VALUES ('VN', 'LUANNX_PROXY', 20);





INSERT INTO crawler_token_resource_config (country, priority, crawler_type, quota) VALUES ('VN', '1', 'x_news', 100);


INSERT INTO crawler_token_resource_config (platform, country, priority, crawler_type, quota) VALUES ('facebook', 'VN', NULL, 'FB_PAGE_IDENTITY_COUNTRY_CRAWLER', 50);




-- Update 200 record cũ nhất (theo id) UPDATE `tokens` SET crawler_type = NULL WHERE crawler_type LIKE "%FB%" AND status = "ACTIVE" AND country = "VN" AND platform = "facebook" ORDER BY id ASC LIMIT 200



crawler_type LIKE "%FB_GRAPH_ENGAGEMENT_BY_TOPIC_CRAWLER%" AND status = "ACTIVE" AND country = "VN"




INSERT INTO ynm_tokens.tokens (id,platform,token,crawler_type,status,created_at,updated_at,last_used,error_message,error_code,country,blockedAt,urlQueryString,cookie,agent) VALUES
	 (UUID(),'facebook','NID=528=MBrwwicsJ-85NiG-Y4HGnVl0SjUKczbi7rA2P9AeRUD197Bo_u65aF8Vz93kdPx1rxrW-VKUTIN0Y9LRCg151BFw4bdUqVKgpnY8-HPvi9ndZSRTE2-cJu4WnNdcowDEthifcXWF3XnwoEQkMvFTVX7GNyL-Cih9NT1Xec1um7y2_LCvn6ncqp4NTorp8dP7e9a74UlBGnLz67Frr9806mjfRmYdkPgl64T3xVKhr2y5mO6IiQV1AXEoTsuQvTdg6nSXOwo0','NULL','ACTIVE','2026-01-19 13:53:07',NULL,'2026-03-19 02:54:00',NULL,NULL,'VN',NULL,NULL,NULL,NULL)





// Câu lệnh update


UPDATE `tokens`
SET crawler_type = NULL
WHERE crawler_type = "FB_TL"
  AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 10




UPDATE `tokens`
SET crawler_type = "FB_TL"
WHERE crawler_type IS NULL
  AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 74


UPDATE `tokens`
SET status = "BROKEN"
WHERE crawler_type LIKE "%FB_KEYWORD_DEV_TEST_CRAWLER%"
  AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 100


UPDATE `tokens`
SET status = 
WHERE crawler_type IS NULL
  AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 50



UPDATE `tokens`
SET status = "BROKEN"
WHERE crawler_type LIKE "%FB_KEYWORD_DEV_TEST_CRAWLER%"
  AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 20


// Câu kiểm tra pool


SELECT id, platform, country, status, crawler_type
FROM tokens
WHERE crawler_type IS NULL
  AND country = "VN"
  AND platform = "facebook"




SELECT id, platform, country, status, crawler_type
FROM tokens
WHERE crawler_type = "FB_TL"
  AND country = "VN"
  AND platform = "facebook"





  SELECT id, platform, country, status, crawler_type
FROM tokens
WHERE crawler_type IS NULL
  AND country = "VN"
  AND platform = "instagram"



// Kiểm tra token hiện tại
SELECT id, platform, country, status, crawler_type
FROM tokens
WHERE crawler_type = "FB_KEYWORD_DEV_TEST_CRAWLER"
	AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"



  SELECT id, platform, country, status, crawler_type
FROM tokens
WHERE crawler_type = "FB_KEYWORD_POST_CRISIS_CRAWLER"
	AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"


// Set token cho luồng chạy


UPDATE `tokens`
SET status = "ACTIVE"
WHERE crawler_type LIKE "%FB_KEYWORD_DEV_TEST_CRAWLER%"
  AND status = "BROKEN"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 80




UPDATE `tokens`
SET status = "ACTIVE"
WHERE crawler_type LIKE "%FB_KEYWORD_POST_CRISIS_CRAWLER%"
  AND status = "BROKEN"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 100




FB_KEYWORD_POST_CRISIS_CRAWLER



UPDATE `tokens`
SET crawler_type = "FB_KEYWORD_DEV_TEST_CRAWLER"
WHERE crawler_type LIKE "%FB_TL%"
  AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 10


UPDATE `tokens`
SET crawler_type = "FB_TL"
WHERE crawler_type LIKE "%FB_KEYWORD_DEV_TEST_CRAWLER%"
  AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 5






UPDATE `tokens`
SET crawler_type = "FB_TL"
WHERE crawler_type LIKE "%FB_KEYWORD_POST_CRISIS_CRAWLER%"
  AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 2




UPDATE `tokens`
SET crawler_type = "FB_TL"
WHERE crawler_type LIKE "%FB_HASHTAG_POST_NON_CRISIS_CRAWLER%"
  AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 10




FB_PAGE_IDENTITY_CRAWLER



UPDATE `tokens`
SET crawler_type = "FB_PAGE_IDENTITY_CRAWLER"
WHERE crawler_type = "FB_TL"
  AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 10



FB_HASHTAG_POST_NON_CRISIS_CRAWLER

UPDATE `tokens`
SET crawler_type = "FB_HASHTAG_POST_NON_CRISIS_CRAWLER"
WHERE crawler_type = "FB_TL"
  AND status = "ACTIVE"
  AND country = "VN"
  AND platform = "facebook"
ORDER BY id ASC
LIMIT 5
