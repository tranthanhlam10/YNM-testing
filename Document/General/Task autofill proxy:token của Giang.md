# Task autofill proxy/token của Giang

## Vấn đề

- Product Support phải bơm token thủ công mỗi ngày cho từng luồng crawl → dễ quên, dễ sai, mất thời gian
- Khi token bị block hàng loạt → không ai biết kịp thời → crawler ngưng hoạt động → mất data
- Proxy phải thay thủ công mỗi tháng (ngày 20) → login BuyProxies, copy IP, paste vào DB


## Hướng giải quyết

- Hệ thống tự động phát hiện thiếu token → bơm bù ngay trong 1 phút
- Khi token khan hiếm → tự động ưu tiên bơm cho luồng quan trọng (P0) trước
- Proxy tự động được làm mới vào ngày 20 hằng tháng → zero manual work


## Cách chạy


1. Deployment


ynmpdp-5912-auto-distribution-token-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-5912
kubectl exec -it ynmpdp-5912-auto-distribution-token-testing-ynm-crawler-emgmg2r  -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local



Câu lệnh chạy:


export LOG_LEVEL=debug

export TOKEN_ORCHESTRATOR_PLATFORM="facebook"

export TOKEN_ORCHESTRATOR_COUNTRY=VN

export TOKEN_ORCHESTRATOR_INTERVAL_DISTRIBUTION=10000

yarn start --scope=@ynm/token-orchestrator





export TOKEN_ORCHESTRATOR_PLATFORM=facebook

export TOKEN_ORCHESTRATOR_COUNTRY=VN

export TOKEN_ORCHESTRATOR_INTERVAL_DISTRIBUTION=40000

export SLACK_TOKEN=aaa

yarn start --scope=@ynm/token-orchestrator



env | grep TOKEN_ORCHESTRATOR_PLATFORM


2. Câu lệnh SQL config


// Bảng token

CREATE TABLE crawler_token_resource_config (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for each config record',
 
    platform VARCHAR(100) NOT NULL COMMENT 'Platform this configuration applies to',
 
    country VARCHAR(100) NOT NULL COMMENT 'Country this configuration applies to',
 
    priority VARCHAR(100) NULL ,
 
    crawler_type VARCHAR(100) COMMENT 'Crawler type this configuration is for',
 
    quota INT COMMENT 'Threshold value used to decide whether to distribute tokens (e.g., min available tokens)',
 
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when this config was created',
 
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when this config was last updated',
 
);


// Bảng proxy


CREATE TABLE crawler_proxy_resource_config (
    id INT AUTO_INCREMENT PRIMARY KEY COMMENT 'Unique identifier for each config record',
 
    country VARCHAR(100) NOT NULL COMMENT 'Country this configuration applies to',
 
    crawler_type VARCHAR(100) COMMENT 'Crawler type this configuration is for',
 
    quota INT COMMENT 'Threshold value used to decide whether to distribute proxy',
 
    created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP COMMENT 'Timestamp when this config was created',
 
    updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP COMMENT 'Timestamp when this config was last updated',
 
);



// Câu query tính toán của em Giang



SELECT
    cqc.crawler_type AS crawlerType,
    cqc.priority AS priority,
    cqc.platform AS platform,
    cqc.country AS country,
    cqc.quota AS quota,
    COALESCE(t.active_count, 0) AS activeCount,
    GREATEST(
        cqc.quota - COALESCE(t.active_count, 0),
        0
    ) AS tokensNeedToFill
FROM crawler_token_resource_config AS cqc
LEFT JOIN (
    SELECT
        crawler_type,
        platform,
        country,
        COUNT(*) AS active_count
    FROM tokens
    WHERE status != 'BROKEN' AND status != 'BLOCKED'
      AND crawler_type IS NOT NULL
    GROUP BY
        crawler_type,
        platform,
        country
) AS t
    ON t.crawler_type = cqc.crawler_type
   AND t.platform = cqc.platform
   AND t.country = cqc.country
WHERE cqc.platform = "facebook"
  AND cqc.country = "VN"






## Những việc cần check ở testing

Deployment:


