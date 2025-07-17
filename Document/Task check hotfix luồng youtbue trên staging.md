# Task check hotfix luồng youtube trên staging 

## Thông tin cơ bản cần nắm

Câu query ở Youtube
SELECT * FROM `monitor_keywords_v2` WHERE platform = "YOUTUBE" ORDER BY `monitor_keywords_v2`.`id` DESC

// Câu lệnh update status để clear những data thừa
UPDATE `monitor_keywords_v2` SET status = 'DONE' WHERE platform = 'YOUTUBE'


### Hiện trạng trước khi fix

Không load được keyword, hashtag -> Chỗ này có thể check được dễ dàng, chỉ cần có 1 bộ keyword hashtag -> Sau đó contriol bằng bộ keyword hashtag của mình là được -> **Fixed**

Improve filter date 1 ngày -> Chỗ này cần phải confirm lại -> Hướng giải quyết như thế nào -> Kiểm tra keyword Crisis crawl 1 giờ, các keyword khác thì 1 ngày 

Fix next page ? Khi mà sử lý xong first -page thì chạy như nào -> Chỗ này cũng phải confirm lại -> Hướng giải quyết như thế nào -> Next page has total links: 0 with nextPageInformation: true




Deployment staging : 

kubectl config use-context lamtt-k8s-ovh
hotfix-youtube-filter-1d-next-page-staging-crawler-empty-container

kubectl get pods -n crawler-staging | grep hotfix-youtube-filter-1d-next-page-staging

kubectl exec -it hotfix-youtube-filter-1d-next-page-staging-crawler-empty-chpzl6 -n crawler-staging -- sh



// Thông tin được lấy cũ từ task Youtube của Huy trên testing
1) Search Article Url From Keyword By Search Bar:   ->  Hiện tại chỗ này đã done
-> Load từ mySQL -> Đi crawl -> Push vào queue cl.news.article_urls -> Rồi mới insert xuống Solr

forever start services.js - (Chỗ này lúc nào cũng phải chạy trước)
node scripts/articlesV3/search_crisis_keywords_youtube_search_bar.js




UPDATE monitor_keyword_v2
SET status = 'DONE'
WHERE platform = 'YOUTUBE' AND status = 'IDLE';


UPDATE `monitor_keywords_v2`
SET status = 'DONE'
WHERE platform = 'YOUTUBE';




2) Crawl Detail Of Youtube Post: 

node services.js
node scripts/articlesV3WithNextCrawlTime/crawlYoutubeDetails.js

- Nếu mà ban đầu status là 1 -> 4 (Ban đầu reset từ 4 thành 1)
- Nếu mà ban đầu status là 2 -> DONE
- Nếu mà ban đầu status là 3 -> DONE  

-> Load từ mongo (Đối status của article từ 1 -> 4) -> Crawl detail -> Nếu có mention thì insert xuống mention , đồng thời update status bằng 2 (Còn lại thì sẽ update status bằng 1 hoặc 3 -> vẫn update xuống mongo ) 




curl 'https://www.youtube.com/results?search_query=M%E1%BB%B9%20M%E1%BB%B9&sp=CAISBAgBEAE%253D' \
  -x http://media2014:8983UHDk33455skdjfkj@50.2.38.104:12345 \
  -H 'authority: www.youtube.com' \
  -H 'pragma: no-cache' \
  -H 'cache-control: no-cache' \
  -H 'sec-ch-ua: " Not;A Brand";v="99", "Google Chrome";v="91", "Chromium";v="91"' \
  -H 'sec-ch-ua-mobile: ?0' \
  -H 'upgrade-insecure-requests: 1' \
  -H 'accept-language: en-US,en;q=0.8,vi;q=0.6,co;q=0.4' \
  -H 'accept: text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.9' \
  -H 'service-worker-navigation-preload: true' \
  -H 'sec-fetch-site: none' \
  -H 'sec-fetch-mode: navigate' \
  -H 'sec-fetch-user: ?1' \
  -H 'sec-fetch-dest: document' \
  -H 'cookie: GPS=1; YSC=raDJu7dgOI4; VISITOR_INFO1_LIVE=os4M1Cx7I_k; PREF=tz=Asia.Saigon' \
  -L



-youtube-search-crisis-keywords-search-bar -
-youtube-crawl-detail ->

- Hiện tại đang bị thiếu identity, id_source ở mentions/sai id_source, identity ở Articles_post khi chạy luồng crawl detail
=> Nguyên nhân khi detect -> Code ở pattern cũ không lấy được các field đó ở HTML response -> Đẫ đến mis match (Luồng pattern cũ)

+ identity cho mention
+ id_social, id_channel cho article_posts
và đẩy thêm vào youtube_posts

https://wiki.younetco.com/display/FB/Crawl+Youtube+Detail -> Wiki cho luồng crawl detail


### Những cases hiện tại cần phải check lại



- Kiểm tra crawl detail từ search bar có đủ không (Ví dụ có 100 urls, thì có crawl đủ k)
platform: 7
status: 1
next_crawl_time: [* TO NOW ]
sort: next_crawl_time asc , id asc
limit: 1000


- Kiểm tra lại schema của mentions
- Kiểm tra lại schema của artcle post
- Kiểm tra lại schema ở Youtube post


- Kiểm tra lại các field identity, id_source, identity name ở Solr khi chạy luồng crawl detail
- Kiểm tra lại field id_social, id channel ở article post
- Kiểm tra record đẩy vào Youtube_post


- Kiểm tra nếu 1 url bị lỗi content -> Có lưu vào monitor error log không