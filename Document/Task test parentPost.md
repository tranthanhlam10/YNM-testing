## Câu lệnh chạy
shdiy-8164-parent-post-testing-ynm-crawler-empty


kubectl get pods -n crawler-testing | grep shdiy-8164-parent-post-testing-ynm-crawler-empty
kubectl exec -it shdiy-8164-parent-post-testing-ynm-crawler-empty-69fb94b4d89gql -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local




Deployment: old-crawler-shdiy-8164-parent-post-testing-empty-container


kubectl get pods -n crawler-testing | grep old-crawler-shdiy-8164-parent-post-testing-empty-container
kubectl exec -it old-crawler-shdiy-8164-parent-post-testing-empty-containerlhtzc -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local


// Câu regex để check posts 
yt|article_posts|tt_post|tt_com|fb_post|tr.post|testing.posts.comments.queuecualamtt


yt|article_posts|tt_post|tt_com|fb_post|tr.post|testing.posts.comments.queuecualamt|fb_comments|ynm.auto_parser|news.comment|review|thread
cl.fb.page_posts|cl.fb.page_web_comments|mentions_LamTT|cl.tr.posts_comment_|cl.tr.posts_sub_comment_|cl.tt.tag_posts|cl.tr.reply_posts|tr_replies|youtube






## Luồng mới 
- Post:

Build (Ở bước resolver ): 
+ Các queue Post thì nó có field caption, shared_content, title

Mention Post -Share
+ Không thay đổi gì hết, vẫn bình thường



- Comment:
Loader(Ở queue các crawling sources )
+ Các messages ở các queue loader của các luồng comment có thêm 2 fields (caption, shared_content) -> 2 field này lấy từ post -> Hàm check ở queue loader

Build (Ở bước resolver ): 
+ Các queue Comments thì nó có field caption, shared_content, title -> -> 2 field này lấy từ post (title thì lấy của post, hiện tại vẫn đang xử lý như vậy)

Mention Comments 
+ Thêm các message ở queue mention_2_solr_mention sẽ có parentPost [caption, shared_content,  title] -> 2 field này lấy từ post (title thì lấy của post, hiện tại vẫn đang xử lý như vậy)

Pusher (cl data pusher)
+ Remove parentPost ở mention trước khi insert lên Solr Mentions  



- Reply:
Loader(Ở queue các crawling sources )
+ Các messages ở các queue loader của các luồng comment có thêm 2 fields caption, shared_content -> 2 field này lấy từ post   -> Hàm check ở queue loader

Mention Replies 
+ Thêm các message ở queue mention_2_solr_mention sẽ có parentPost [caption, shared_content, title] -> 2 field này lấy từ post (title thì lấy của post, hiện tại vẫn đang xử lý như vậy)

Pusher (cl data pusher)
+ Remove parentPost ở mention trước khi insert lên Solr Mentions  



## Luồng cũ

- Post:

Build (Ở bước resolver ) -> Đều chạy về queue posts của từng platform 
+ Các queue Post thì nó có field caption, shared_content, title

Mention Post
+ Không thay đổi gì hết, vẫn bình thường
 


- Comment:

Build (Ở bước resolver ): 
+ Các queue Comments thì nó có field caption, shared_content, title -> -> 2 field này lấy từ post (title thì lấy của post, hiện tại vẫn đang xử lý như vậy)

Mention Comments 
+ Thêm các message ở queue mention_2_solr_mention sẽ có parentPost [caption, shared_content,  title] -> -> 2 field này lấy từ post (title thì lấy của post, hiện tại vẫn đang xử lý như vậy)

Pusher (cl data pusher)
+ Remove parentPost ở mention trước khi insert lên Solr Mentions  



- Reply:

Mention Replies 
+ Thêm các message ở queue mention_2_solr_mention sẽ có parentPost [caption, shared_content, title] -> 2 field này lấy từ post (title thì lấy của post, hiện tại vẫn đang xử lý như vậy)

Pusher (cl data pusher)
+ Remove parentPost ở mention trước khi insert lên Solr Mentions  


### Reply Crawl Post


Mention Replies 
+ Thêm các message ở queue mention_2_solr_mention sẽ có parentPost [caption, shared_content, title] -> 2 field này lấy từ post (title thì lấy của post, hiện tại vẫn đang xử lý như vậy)
+ Lưu ý cách build thông tin parentPost cho reply 

Pusher (cl data pusher)
+ Remove parentPost ở mention trước khi insert lên Solr Mentions  

Note: Chỉ đập xuống mention những reply nào có parentPost(Có post cha, post Cha còn sống ....)



##Các luồng cần phải check:

###Luồng cũ 



-FacebookGetLatestGroupPosts -> Cảm giác cũng đúng đúng -> Do đã có caption 
node services.js
FB_API_ENDPOINT=http://graph-local-testing.ynm.local node scripts/facebookV3/get_latest_group_posts.js


-FacebookGetLatestPriorityGroupPosts -> Khỏi chạy 


-FacebookGetLatestCrisisGroupPosts
node services.js
FB_API_ENDPOINT=http://graph-local-testing.ynm.local node scripts/facebookV3/get_latest_crisis_group_posts.js
-> Hiện tại chưa có mention và post 


-FacebookGetLatestPriorityCloseGroupPosts -> Khỏi chạy 



-FacebookCrawlPostByKeywords -> Passed
node services.js
FB_API_ENDPOINT=http://fbgraphql-api-service-testing.ynm.local node scripts/facebookV3/crawl_post_by_keywords.js


-FacebookGetLatestHashtagPosts -> Passed
FB_API_ENDPOINT=http://fbgraphql-api-service-testing.ynm.local node scripts/facebookV4/get_latest_hashtag_posts.js


-FacebookGetLatestHashtagPostsCrisis -> Passed

node scripts/facebookV4/get_latest_hashtag_posts_crisis.js



-FacebookCrawlPostByKeywordsCrisis -> Passed, nhưng mà vẫn có lưu ý do luồng thay đổi
script: FB_API_ENDPOINT=http://fbgraphql-api-service-testing.ynm.local node scripts/facebookV3/crawl_post_by_keywords_crisis.js

Mention có title trong bài post group fb, nhưng khi lưu mention thì không có search text

- Record có id 44e5f917-c6bb-59d7-9af1-1f6910ad9e2e: KHÔNG HỢP LỆ
  - createdBy: FacebookCrawlPostByKeywordsCrisis
  - has title: true
  - has caption: false
  - has shared_content: true
  - title match: false
  - caption match: false
  - shared_content match: false


- Record có id c46c8a24-1aba-5cfa-badd-4e9b3a71770d: KHÔNG HỢP LỆ
  - createdBy: FacebookCrawlPostByKeywordsCrisis
  - has title: true
  - has caption: false
  - has shared_content: true
  - title match: false
  - caption match: false
  - shared_content match: false


  


CommentsCrawlUrlComments

-> Load từ article post
-> Update xuống mention và news comments 
node scripts/commentsV3/crawl_url_comments.js -> article_posts -> Hiện tại đang báo lỗi ở Solr mention v2 



CommentsCrawlReviews
-> Hiện tại parentPost đang bị lỗi (Nguyên nhân có khi bài post chưa có caption và search )

node scripts/commentsV3/crawl_reviews.js -> article_crawl_reviews

ForumGetPosts
node services.js
node scripts/forumV3/get_posts.js



ForumGetPostsPrev





ArticlesCrawlYoutubeDetails
script: node scripts/articlesV3WithNextCrawlTime/crawlYoutubeDetails.js
-> Đang bị lỗi Mongo -> Hiện đã được fix
-> Check luồng này thử 


  



YoutubeGetLatestTop50Trending (Đã check qua lần 1) -> Passed
script: node scripts/youtubeV2/get_latest_top_50_trending.js
-> Mentions đã chính xác, còn posts đang có 1 số bài thiếu caption -> Chỗ này nếu video không có mô tả thì không lấy caption
-> Queue post: testing.cl.posts_2_solr_yt_posts


YoutubeMonitoringPriorityChannel -> Luồng này chỉ là luồng loader -> Không cần check (Load từ identity)
script: node scripts/youtubeV3/monitoring_priority_channel.js
-> Hiện tại không lưu được xuống mention và post -> Nhờ Đồng xem lại 




YoutubeMonitoringPriorityVideo  (Hiện luồng này chưa có bài ) -> Luồng này chỉ là luồng loader -> (Cũng cần phải check) -> Load từ YT post
script: node scripts/youtubeV3/monitoring_priority_video.js
-> Hiện tại không lưu được xuống mention và post -> Nhờ Đồng xem lại 


YoutubeMonitoringChannel ->  Không cần check (Load từ identity)
script: node scripts/youtubeV3/monitoring_channel.js
-> Hiện tại không lưu được xuống mention và post -> Nhờ Đồng xem lại 


YoutubeMonitoringVideo > Luồng này chỉ là luồng loader -> (Cũng cần phải check) -> Load từ YT post
script: node scripts/youtubeV3/monitoring_video.js
-> Hiện tại không lưu được xuống mention và post -> Nhờ Đồng xem lại 



YoutubeGetLatestPriorityChannelsVideosByApi (Đã check qua lần 1) -> Pass 
script: node scripts/youtubeV3/get_latest_priority_channels_videos_by_api.js
-> Hiện tại đã có post và mention
-> Queue post: testing.cl.posts_2_solr_yt_posts
-> Mentions đã chính xác
-> Post thì cũng tương tự như luồng top 50 -> Nếu không có mô tả thì không lấy caption


YoutubeGetLatestPriorityVideosCommentsByApi -> Failed
script: node scripts/youtubeV3/get_latest_priority_videos_comments_by_api.js
-> Hiện tại mention có parentPost rỗng
-> Comment thì cũng không có caption
-> Queue post: testing.cl.posts_2_solr_yt_comments




YoutubeGetLatestPriorityChannelsInfo -> Luồng này chỉ lấy thông tin channel -> Confirm lại với Đồng 
script:node scripts/youtubeV2/get_latest_priority_channels_info.js
-> Hiện tại không lưu được xuống mention và post -> Nhờ Đồng xem lại 



YoutubeGetLatestPriorityCommentsReplies -> Chưa lấy được comments 
script: node scripts/youtubeV2/get_latest_priority_comments_replies.js
-> Hiện tại đã có parentPost, nhưng mà trong parentPost đó chưa có caption tại vì caption của post chưa có 
-> Title của comment hay reply lúc nào cũng là title của Video
-> Chưa thấy comment push vào queue -> Nhờ Đồng check lại 






YoutubeGetLatestPriorityChannelsInfoMonthly -> Luồng này chỉ lấy thông tin channel -> Confirm lại với Đồng 
script: node scripts/youtubeV2/get_latest_priority_channels_info_monthly.js
-> Hiện tại không lưu được xuống mention và post -> Nhờ Đồng xem lại 



YoutubeGetLatestPotentialChannelsInfo -> Luồng này chỉ lấy thông tin channel -> Confirm lại đòng 
script: node scripts/youtubeV2/get_latest_potential_channels_info.js
-> Hiện tại không lưu được xuống mention và post -> Nhờ Đồng xem lại 



TiktokGetLatestUserPosts -> Passed 
-> Mentions thì đã work đúng
-> Nhưng mà ở post thì những bài post nào không có title thì cũng không có caption 



TiktokGetLatestPriorityUserPosts -> Hiện tại priority chưa cần test 





TiktokGetLatestUserPostsSl -> Không cầ chạy của SL 
-> Mentions thì đã work đúng
-> Nhưng mà ở post thì những bài post nào không có title thì cũng không có caption 




TiktokGetLatestPostComments
-> Hiện tại chưa có mentions cũng như comments



TiktokGetLatestPriorityPostComments -> Hiện tại priority chưa cần test 




TiktokGetLatestPostCommentsSl -> -> Không cầ chạy của SL




Instagram - instagram-get-latest-user-posts
IG_API_ENDPOINT=https://graph-instagram-api-staging.younetmedia.com node scripts/instagram/get_latest_user_posts.js


Instagram - instagram-get-latest-post-comments
IG_API_ENDPOINT=https://graph-instagram-api-staging.younetmedia.com node scripts/instagram/get_latest_post_comments.js



### Luồng mới

#### Loader
Loader Facebook @ynm/cl-fb-crawling-loader-service
-> Hiện tại cần coi lại ở fb post




Loader News @ynm/cl-news-crawling-loader-service -> DONE
-> Luồng news mới có chỗ nào load từ article post crawl hay không
-> Không cần check 



Loader Threads  @ynm/cl-tr-crawling-loader-service -> DONE
-> Post comment đã xong
-> Reply cũng đã xong 



Loader Tiktok @ynm/cl-tt-crawling-loader-service -> Passed 
-> Không cần, bởi vì hiện tại luồng youtube chỉ load hashtag keyword -> Không load từ post 




Loader Youtube  @ynm/cl-yt-post-from-keyword-crawler-service -> Passed 
-> Không cần, bởi vì hiện tại luồng youtube chỉ load hashtag keyword -> Không load từ post




### Các luồng mới cần chạy



1.Facebook Comment






2.Facebook Post







3.Facebook Web Comment -> Chỗ này cần xác nhận lại
-> Chỗ này đã có parentPost, nhưng mà ở field caption đang không có ở mention -> Đang nghi là do ở post đang chưa lưu caption chứ không phải nó sai







5.Threads Keyword Post -> Passed
- Hiện tại chạy cho luồng no-cookie trước 
-> Post đã có caption, mention để check sau
-> Cần phải check xem có đẩy qua reply crawl post có caption của post cha không



6.Threads Hashtag Post -> Passed





7.Threads Reply Crawl Post -> Passed 
-> Hiện tại mentions, post, reply đã crawl đúng với yêu cầu

  {
    "id": "3c049bd3-e58b-5cc2-9231-bff121c90f0c",
    "link": "threads.net/t/DOLwyj2ktKe",
    "id_social": "3715476394433769500",
    "title": "Phản ứng của tôi:",
    "id_source": "tr_63454508403",
    "level": 2,
    "created_date": "2025-09-06T06:15:23.000Z",
    "crawled_date": "2025-10-03T07:11:57.438Z",
    "post_created_date": "2025-09-06T06:15:23.000Z",
    "last_status": 0,
    "createdBy": "ThreadsReplyPostCrawlingLoader",
    "caption": "Phản ứng của tôi: “ehm... c-cảm ơn? 🥹 ”"
  }


  {
    "id": "3c049bd3-e58b-5cc2-9231-bff121c90f0c",
    "link": "threads.net/t/DOQBhhlkvAc",
    "platform": 10,
    "domain": "threads.net",
    "id_social": "3715476394433769500",
    "id_source": "tr_63454508403",
    "id_reference": "61ebe1e2-98e5-5168-be46-d500b8ee4642",
    "id_parent_comment": "ee143b06-bb3e-5a6b-846c-f9169ff363b8",
    "mention_type": 2,
    "mention_type_details": 2,
    "identity": "tr_63454508403",
    "identity_name": "maidora.maidora",
    "attachment": "{\"media_type\":19,\"parent_info\":{\"link\":\"threads.net/t/DOLwyj2ktKe\",\"title\":\"Phản ứng của tôi:\"}}",
    "views": 0,
    "likes": 3,
    "comments": 1,
    "shares": 0,
    "engagement_total": 4,
    "engagement_s_c": 1,
    "search_text": [
      "",
      "Ngừi ta chỉ mún thấy cái họ mún thấy"
    ],
    "updated_at": "2025-10-03T07:11:57.445Z",
    "created_date": "2025-09-06T06:15:23.000Z",
    "shard": "20250906",
    "createdBy": "ThreadsReplyPostCrawlingLoader",
    "parentPost": {
      "title": "Phản ứng của tôi:",
      "caption": "Phản ứng của tôi: “ehm... c-cảm ơn? 🥹 ”"
    }
  }





8.Threads Repost -> Passed
-> Hiện tại mention và post đã lấy đúng 




9.Threads Source Post -> Passed
-> Hiện tại mention và post đã đúng với yêu cầu 



10.Threads Source Reply -> Hiện tại đã được fix
-> Hiện tại mention có mention_type = 2 thì không có parentPost 
-> Còn post thì vẫn có caption đầy đủ


11.Threads Comment
-> Hiện tại mention, post, reply đã crawl đúgn với yêu cầu








13.Tiktok Keyword Post
-> Hiện tại mentions và post đã đúng yêu cầu 

14.Tiktok Tag Post
-> Hiện tại mentions và post đã đúng yêu cầu




15.Youtube Keyword Post -> Passed
-> Hiện tại luồng Youtube đã có caption ở Post, mentions cũng đúng điều kiện 

16.Parse Detail 2 Mention -> Hiện tại đã chạy đúng với yêu cầu 

Parse detail 2 mention
1. auto-parser-testing-high-priority-classifier
2. auto-parser-testing-high-priority-browser-crawler
3. auto-parser-testing-high-priority-http-crawler -> Chạy này 
4. auto-parser-testing-article-parser  -> Chạy này 
5. auto-parser-testing-error-article-handler
6. ynm-cl-news-parsed-details-2-mentions-service-testing


{
"item": {
    "id": "61f630df-fd4a-5b7b-8148-5ad2ff4fcc14",
    "id_category": "375067",
    "id_source": "thanhnien.vn",
    "platform": 3,
    "link": "https://thanhnien.vn/vu-nha-xay-nham-dat-o-hai-phong-nguoi-vi-pham-van-co-thu-185250918102449851.htm",
    "views_avg": 0,
    "priority": 1,
    "status": 1,
    "failed_type": 1,
    "count_failed": 0,
    "crawled_date": "1970-01-01T00:00:00Z",
    "next_crawl_time": "2023-08-23T07:06:33.577Z",
    "created_date": "2023-08-23T07:06:33.577Z",
    "hash_link": "09aefa4d-f261-51cc-864d-548a959b88d8"
}
}


-> Hiện tại đã crawl đúng yêu cầu



17.Data Pusher
-> Hiện tại đối với mentions đã update thành công
-> Hiện tại đối với post đã update thành công







### Tổng hợp những cases cần report cho Đồng
- Threads Source Post/Reply/Repost bị lỗi redis 
- Loader facebook bị lỗi
- Loader tiktok không load được message vào queue cl.tt.tag_posts_crawling_sources




### Task check nhanh lại chỗ identity_name:
ynmpdp-5564-hot-fix-identity-name-staging-crawler-empty-container
kubectl get pods -n crawler-staging | grep ynmpdp-5564-hot-fix-identity-name
kubectl exec -it ynmpdp-5564-hot-fix-identity-name-staging-crawler-empty-coldkw5 -n crawler-staging -- sh
kubectl config use-context lamtt-k8s-ovh

// Câu lệnh query

FB_API_ENDPOINT=http://fbgraph-staging.younetmedia.com node scripts/facebookV3/get_latest_group_posts.js

FB_API_ENDPOINT=http://fbgraph-staging.younetmedia.com node scripts/facebookV4/get_latest_hashtag_posts.js




### Những luồng chạy phải chạy lại ở testing

- Youtube:
+ 1 Luồng cũ: Crawl Detail -> Pass, YoutubeGetLatestPriorityVideosCommentsByApi -> Testing DONE
+ 1 Luồng mới: Youtube Crisis Keyword -> Pass

- News
+ Luồng cũ:
+ Luồng mới: parsed Detail -> Hiện đã lấy đúng nhưng không có createdBy

- Threads:
+ Luồng Post: Hiện tại đã lưu đung -> Pass
+ Luồng comment: HIện tại đang sai ngay chỗ Threads Replies, còn luồng Threads comment và sub comment đã lưu đúng -> Fixed
+ Reply Crawl Post: Hiện tại đã đúng, nhưng nó bị đúng như Threads Replies -> Link các replies đang trùng nhau -> Fixed

- Facebook:
+ Luồng cũ: FacebookGetLatestGroupPosts và FacebookCrawlPostByKeywords -> Hiện tại luồng Group Post đã đúng -> Testing DONE
+ Luồng mới: FB Page Post -> Hiện tại chạy chưa có mentions , FB PageWebComment -> Testing DONE

- Tiktok:
+ Luồng cũ: TiktokGetLatestUserPosts và TiktokGetLatestPostComments (Hiện tại chưa chạy được-Hbua thì chạy được bình thường)
+ Luồng mới: Hashtag/Keyword -> DONE


- Forums
+ ForumGetPosts: Hiện tại đã chạy đúng yêu cầu -> Chỉ là do ở thread_url chưa có schema nên chưa chạy được case có caption
+ ForumGetPostPrev: Hiện chưa chạy được có mentions -> nhưng cũng tương tự như luồng ở trên


- Reviews:
+ CommentsCrawlUrlComments -> Hiện tại chưa có mentions
+ CommentsCrawlReviews -> Hiện tại đã có mention của concung