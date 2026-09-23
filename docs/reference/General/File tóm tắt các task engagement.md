Các bước để scale luồng engagement
1. Enable Loader 
- Tìm kiếm deployment ynm-cl-tr-crawling-loader-service-testing
- Ctrl F, tìm kiếm POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_ENABLE, chỉnh giá trị lại bằng true 
- Scale 
2. Enable Crawler 
- Tìm kiếm deployment  ynm-cl-tr-post-engagement-by-topic-service-testing 
- Scale 
3. Enable Updater 
- Tìm kiếm deployment ynm-cl-tr-source-updater-service-testing
- Scale 


Note: 
- Để coi proxy và token thì tiềm kiếm theo type TR_POST_ENGAGEMENT_BY_TOPIC_CRAWLER
- Nếu muốn xem luồng crawl có đang crawl hay không thì xem long ở chỗ pod Crawler 



Các bước để bật  egagement của facebook, tiktok, youtube
1. Vào k8s, namespace sl testing 
2. Tìm kiếm các deployment sau:
- Facebook
+ ynm-utilities-testing-fb-engagement-testing

- Tiktok 
+ crawler-testing-tiktok-update-engagement-loader
+ crawler-testing-tiktok-update-engagement-crawler 

- Youtube 
+ crawler-testing-youtube-update-engagement-loader
+ crawler-testing-youtube-update-engagement-crawler 

Muốn crawl platform nào thì scale pod của platform đó là được



// Staging  

1. Enable Loader 
- Tìm kiếm deployment ynm-cl-tr-crawling-loader-service-testing
- Ctrl F, tìm kiếm POST_ENGAGEMENT_BY_TOPIC_CRAWLING_LOADER_ENABLE, chỉnh giá trị lại bằng true 
- Scale 
2. Enable Crawler 
- Tìm kiếm deployment  ynm-cl-tr-post-engagement-by-topic-service-staging
- Scale 
3. Enable Updater 
- Tìm kiếm deployment ynm-cl-tr-source-updater-service-testing
- Scale 
