# Task check remove forever và sử dụng thư viện concurrently

## Những pod cần kiểm tra

1. Facebook
- group-posts - node scripts/facebookV3/get_latest_group_posts.js -> Luồng này không cần sử  dụng thư viện mới 
- crawl-post-by-keywords - node scripts/facebookV3/crawl_post_by_keywords.js -> Luồng này không cần sử  dụng thư viện mới 


2. Tiktok
- tiktok-get-latest-post-comments - node scripts/tiktok/get_latest_post_comments.js -> Luồng này không cần sử  dụng thư viện mới 
- tiktok-get-latest-user-posts - node scripts/tiktok/get_latest_user_posts.js -> Luồng này không cần sử  dụng thư viện mới 


3. Youtube
- youtube-top-trendng - node scripts/youtubeV2/get_latest_top_50_trending.js

Theo mẫu thì câu lệnh chạy sẽ như vầy
  args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node
              scripts/youtubeV2/get_latest_top_50_trending.js"


Câu lệnh cũ:
concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node
              scripts/youtubeV2/get_latest_top_50_trending.js"



forever start services.js max_old_space_size=8000 --stack-size=1500 ; node scripts/youtubeV2/get_latest_top_50_trending.js

-> Hiện tại đã crawl được data, luồng vẫn work bình thường

- youtube-api-get-latest-priority-channels-videos-by-api - node scripts/youtubeV3/get_latest_priority_channels_videos_by_api.js

Theo mẫu thì câu lệnh sẽ chạy như vầy
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node
              scripts/youtubeV3/get_latest_priority_channels_videos_by_api.js"

-> Hiện tại đã crawl được data, luồng vẫn work bình thường


- youtube-api-get-latest-priority-videos-comments-by-api - node scripts/youtubeV3/get_latest_priority_videos_comments_by_api.js

Theo mẫu thì câu lệnh sẽ chạy như vầy
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node
              scripts/youtubeV3/get_latest_priority_videos_comments_by_api.js"

-> Hiện tại vẫn work bình thường, **Nhưng chưa crawl được data**

+ Kiểm tra thêm 1 các luồng khác
- youtube-api-monitoring-priority-channel
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node
              scripts/youtubeV3/monitoring_priority_channel.js"
-> Hiện tại luồng này cũng đã config đúng, **nhưng mà không có data**


youtube-api-monitoring-priority-video
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node scripts/youtubeV3/monitoring_priority_video.js"
-> Hiện tại luồng này cũng đã config đúng, **nhưng mà không có data**

youtube-api-monitoring-channel
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node scripts/youtubeV3/monitoring_channel.js"

-> Hiện tại luồng này cũng đã config đúng, **nhưng mà không có data**

youtube-api-monitoring-video
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node scripts/youtubeV3/monitoring_priority_video.js"

-> Hiện tại luồng này cũng đã config đúng, **nhưng mà không có data**

youtube-api-get-latest-priority-channels-info
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node
              scripts/youtubeV2/get_latest_priority_channels_info.js"

-> Hiện tại luồng này cũng đã config đúng, **nhưng mà không có data**


youtube-api-get-latest-priority-comments-replies
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node
              scripts/youtubeV2/get_latest_priority_comments_replies.js"
-> Hiện tại luồng này cũng đã config đúng, **nhưng mà không có data**

youtube-api-get-latest-priority-channels-info-monthly

    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node
              scripts/youtubeV2/get_latest_priority_channels_info_monthly.js"

-> Hiện tại luồng này cũng đã config đúng, **nhưng mà không có data**

youtube-api-get-latest-potential-channels-info

    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node
              scripts/youtubeV2/get_latest_potential_channels_info.js"

crawler-staging-youtube-crawl-detail

    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node
              scripts/articlesV3WithNextCrawlTime/crawlCrisisYoutubeDetails.js"

forever start services.js max_old_space_size=8000 --stack-size=1500 ; node scripts/articlesV3WithNextCrawlTime/crawlYoutubeDetails.js

-> Hiện tại luồng này cũng đã config đúng

4. Instagram
- instagram-get-latest-user-posts -> node scripts/instagram/get_latest_user_posts.js -> Luồng này không cần sử  dụng thư viện mới 
- instagram-get-latest-post-comments -> node scripts/instagram/get_latest_post_comments.js -> Luồng này không cần sử  dụng thư viện mới 


5. Forums
- forums-get-posts

Theo mẫu thì câu lệnh sẽ chạy như vầy
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node scripts/forumV3/get_posts.js"

-> Hiện tại vẫn work bình thường, **Nhưng chưa crawl được data**


- forums-get-posts-prev

Theo mẫu thì câu lệnh sẽ chạy như vầy
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node scripts/forumV3/get_posts_prev.js"

-> Hiện tại vẫn work bình thường, **Nhưng chưa crawl được data**


6. Reviews
- news-crawl-url-comments

Theo mẫu thì câu lệnh sẽ chạy như vầy
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node scripts/commentsV3/crawl_url_comments.js"

-> Hiện tại vẫn work bình thường, **Nhưng chưa crawl được data**

- news-crawl-reviews

Theo mẫu thì câu lệnh sẽ chạy như vầy
    args:
            - '-c'
            - >-
              concurrently "node --max_old_space_size=8000 --stack-size=1500
              services.js" "node scripts/commentsV3/crawl_reviews.js -f ECOM"

-> Hiện tại vẫn work bình thường, **Nhưng chưa crawl được data**

