# Chạy task Source Post của chị Trang


+ ynm-cl-ig-crawling-loader-service-testing (INSTAGRAM_POST_API_CRAWLING_LOADER_ENABLE,
INSTAGRAM_POST_GRAPHQL_CRAWLING_LOADER_ENABLE)
+ ynm-cl-source-updater-service-staging (IDENTITIES_ENABLE)

+ ynm-cl-data-pusher-service-staging (POST_2_SOLR_IG_POST_ENABLE, PROFILE_2_SOLR_IDENTITY_ENABLE, PROFILE_2_REDIS_IDENTITY_ENABLE)

+ ynm-cl-data-pusher-mention-service-staging (MENTION_2_SOLR_MENTION_ENABLE)

+ ynm-cl-ig-post-service-staging

## Proxy/token


IG_UNAUTHORIZED_POST_CRAWLER
IG_POST_CRAWLER



INSTAGRAM_POST_API_
INSTAGRAM_POST_GRAPHQL_





cl.ig.posts_|mentions_2_solr_mentions_LamTT|identities_2_solr_identities_LamTT|identities_2_redis_identities_LamTT|cl.posts_2_solr_ig_posts|app.socialheat.crawl_keyword.results_LamTT|ig.identity_countries_crawling_sources|cl.identities_finished_sources




## Những cases cần check của task Chị Trang

- Kiểm tra xem loader có hoạt động đúng hay không -
+ Kiểm tra có load đúng country_code hay không
+ Kiểm tra thử config của các luồng nước ngoài có đúng không
+ Kiểm tra có cache lại identity trên Redis không
+ Kiểm tra có lưu crawling loader hay không

- Kiểm tra crawler luồng web
+ Crawl mentions/posts/identity/finished_source đầy đủ hay không
+ Kiểm tra case đặc biệt (User bị block/User Bình thường/User có tick xanh)


- Kiểm tra crawler luồng mobi
+ Crawl mentions/posts/identity/finished_source đầy đủ hay không
+ Kiểm tra case đặc biệt (User bị block/User Bình thường/User có tick xanh)
 


- Kiểm tra resolver

+ Kiểm tra country_code
+ Kiểm tra xem có release Redis






## Data test


// Luồng crawl bình thường
{
  "id": "66649393854",
  "retries": 0,
  "delay_time_rules": [
    {
      "lte": 72,
      "delay": 18
    },
    {
      "lte": 144,
      "delay": 24
    },
    {
      "lte": 999999999,
      "delay": 48
    }
  ],
  "last_data_date": "2025-02-13T08:32:41.425Z",
  "from_date": "1739435561",
  "to_date": "1770971561",
  "platform": 8,
  "createdBy": "InstagramPostGraphqlCrawlingLoader",
  "link": "instagram.com/rapidrantspodcast/",
  "username": "rapidrantspodcast"
}