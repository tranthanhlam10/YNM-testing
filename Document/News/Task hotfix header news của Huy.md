# Task hotfix của Huy

Mô tả:
+ Có 1 số pattern (cũ) đang sử dụng invliad headers (Ví dụ: if-none-match-) dẫn đến luồng Crawl Article Url From Category của platform News bị crash.

Giải pháp:
+ Viết 1 hàm để thực hiện việc clean invalid headers trước khi thực hiện send request.


cl.news.article_post_from_ggmaps_crawling_sources|cl.news.article_post_from_ggmaps_crawling_requests|cl.news.article_post_from_ggmaps_crawled_sources|cl.mentions_2_solr_mentions_LamTT|cl.news.article_posts_finished_sources|cl.news.ggmaps_finished_sources


cl-news-high-priority-article-url-service
ynm-cl-article-post-ggmaps-service

ynm-cl-news-article-url-service-staging

ynm-cl-news-critical-hashtag-service-staging