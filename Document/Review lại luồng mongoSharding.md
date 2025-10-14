- Mongo


1) News Data pusher: ynm-cl-data-pusher-news-service-staging
Deployment:
+ ynm-cl-data-pusher-service-staging
+ ynm-cl-data-pusher-news-service-staging
Input:
+ Queue: staging.cl.news.article_urls
Output:
+ Mongo: articles


2) News Crawling Loader: ynm-cl-news-crawling-loader-service-staging
Deployment:
+ ynm-cl-news-crawling-loader-service-staging
Input:
+ Mongo: articles
Output:
+ Queue: high_priority_detail_url_info/normal_priority_detail_url_info/crisis_detail_url_info (Bật stateful set auto-parser-staging-high-priority-classifier/auto-parser-staging-normal-priority-classifier/auto-parser-staging-crisis-classifier để đẩy qua luồng auto parser)
Keyword redis:
+ HighPriorityNewsSourceCrawlingLoader
+ NonCategorySourceCrawlingLoader
+ BlogSourceCrawlingLoader
+ EcomReviewSourceCrawlingLoader
+ NormalPriorityNewsSourceCrawlingLoader


3) News Source Updater: ynm-cl-news-source-updater-service-staging
Deployment:
+ ynm-cl-news-source-updater-service-staging
Input:
+ Queue: article_titles
Output:
+ Mongo: articles


4) Eci To Socialheat Loader: ynm-eci-to-sh-loader-service-staging
Deployment:
+ ynm-eci-to-sh-loader-service-staging
Input:
+ Solr: article_urls
+ Mongo: articles


5) Eci To Socialheat Pusher: ynm-eci-to-sh-pusher-service-staging
Deployment:
+ ynm-eci-to-sh-pusher-service-staging
Input:
+ Queue: eci-pi-to-article-urls
Output:
+ Mongo: articles


6) Youtube Crawl Search Bar: crawler-staging-youtube-search-crisis-keywords-search-bar
Deployment:
+ crawler-staging-youtube-search-crisis-keywords-search-bar
+ crawler-staging-youtube-search-brand-campain-keywords-search-bar
Input:
+ MySQL: monitor_keywords_v2
Output:
+ Queue: staging.cl.news.article_urls


7) Youtube Crawl Detail: crawler-staging-youtube-crawl-detail
Deployment:
+ crawler-staging-youtube-crawl-detail-crisis
+ crawler-staging-youtube-crawl-detail
Input:
+ Mongo: articles
Output:
+ Solr: mentions/youtube_posts/identities
+ Redis: identities