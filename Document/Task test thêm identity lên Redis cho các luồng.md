# Task test thêm identity lên Redis cho các luồng Youtube



Mục tiêu: Bổ sung identity trên redis đối với các luồng crawl post/comment của Youtube.

Các script cần điều chỉnh:
1) scripts/youtubeV2/get_latest_top_50_trending.js
2) scripts/youtubeV3/get_latest_priority_videos_comments_by_api.js
3) scripts/youtubeV2/get_latest_priority_comments_replies.js
4) scripts/articlesV3WithNextCrawlTime/crawlYoutubeDetails.js

Wiki:
+ https://wiki.younetco.com/display/FB/%5BYoutube%5D+Get+Latest+Trending+Posts+By+Youtube+API
+ https://wiki.younetco.com/display/FB/%5BYoutube%5D+Get+Latest+Comments+From+Post+By+Youtube+API
+ https://wiki.younetco.com/display/FB/%5BYoutube%5D+Get+Latest+Replies+From+Comment+By+Youtube+API
+ https://wiki.younetco.com/pages/viewpage.action?spaceKey=FB&title=Crawl+Youtube+Detail