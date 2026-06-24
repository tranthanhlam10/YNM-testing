# Task đều chỉnh link của luồng Crisi Image của em Giang


ynmpdp-6001-rename-filename-testing-ynm-crawler-empty

kubectl get pods -n crawler-testing | grep ynmpdp-6001-rename-filename-testing-ynm-crawler-empty
kubectl exec -it ynmpdp-6001-rename-filename-testing-ynm-crawler-empty-85756v99j -n crawler-testing -- sh
kubectl config use-context lamtt-k8s-local



## Các cases cần kiểm tra


- Kiểm tra xem tên có đúng hay không -> Hiện tại tiktok đã lưu đúng với yêu cầu, fb đã lưu đúng yêu cầu
- Kiểm tra xem đã tải lên đủ yêu cầu hay chưa
- Kiểm tra logic check dup -> Hiện tại đã check dup ở tiktok đúng với yêu cầu



## Câu lệnh chạy

export MINIO_CDN_URL=http://minio-api.ynm.local
export MINIO_END_POINT=minio-api.ynm.local
export MINIO_PATH_STYLE=true
export MINIO_PORT=80
export MINIO_USE_SSL=false
export MINIO_ACCESS_KEY=lpPUZ7qg3LjUmU3Nvtnw
export MINIO_SECRET_KEY=7FvDnuFF7cBuWaMVxugoTDU1ZK6hlRr4NOyuioJE

export CRAWLER_ENABLE=false
export BUILDER_ENABLE=false
export RESOLVER_ENABLE=false
export MEDIA_DOWNLOAD_ENABLE=true
export MEDIA_DOWNLOAD_RESOLVER_ENABLE=true

NODE_ENV=testing yarn start --scope=@ynm/cl-fb-keyword-post-crawler-service



export MINIO_CDN_URL=http://minio-api.ynm.local
export MINIO_END_POINT=minio-api.ynm.local
export MINIO_PATH_STYLE=true
export MINIO_PORT=80
export MINIO_USE_SSL=false
export MINIO_ACCESS_KEY=lpPUZ7qg3LjUmU3Nvtnw
export MINIO_SECRET_KEY=7FvDnuFF7cBuWaMVxugoTDU1ZK6hlRr4NOyuioJE

export CRAWLER_ENABLE=false
export BUILDER_ENABLE=false
export RESOLVER_ENABLE=false
export MEDIA_DOWNLOAD_ENABLE=true
export MEDIA_DOWNLOAD_RESOLVER_ENABLE=true


NODE_ENV=testing yarn start --scope=@ynm/cl-tt-keyword-post-crawler-service



## Câu query queue các task liên quan Crisi Imange


cl.fb.keyword_posts_crisis_no_token_crawling_sources|app.socialheat.crawl_keyword.results|cl.fb.user_identity_countries_crawling_sources|cl.fb.page_identity_countries_crawling_sources|cl.fb.group_identity_countries_crawling_sources|cl.fb.engagement_by_topic_crawling_sources|cl.fb.crisis_media_download|cl.fb.hashtag_posts_critical_crawling_sources|cl.fb.hashtag_posts_critical_crawling_requests|cl.fb.hashtag_posts_critical_crawled_sources|cl.fb.user_identity_countries_crawling_requests|cl.fb.user_identity_countries_crawled_sources|cl.fb.graph_engagement_by_topic_crawling_requests|cl.fb.graph_engagements_by_topic_crawled_sources|cl.tt.posts_from_keyword_by_mobile_api_crawling_sources|cl.tt.posts_from_keyword_by_mobile_api_crawling_requests|cl.tt.posts_from_keyword_by_mobile_api_crawled_sources|cl.tt.crisis_media_download|cl.mentions_2_solr_mentions_LamTT|cl.posts_2_solr_fb_posts_LamTT|cl.posts_2_solr_tt_posts_LamTT|cl.identities_2_solr_identities_LamTT|cl.identities_2_redis_identities_LamTT|fb.identity_countries_crawling_sources|testing.cl.posts_2_solr_tt_posts_thutt|cl.fb.engagement_by_topic_crisis_image_crawling_source|cl.fb.engagement_by_topic_crisis_image_crawling_source|cl.fb.graph_engagement_by_topic_crisis_image_crawling_requests|cl.fb.graph_engagement_by_topic_crisis_image_crawled_sources|rnd.socialheat.llm.image_extraction|image.download_to_minio|cl.fb.keyword_posts_crisis_crawled_sources|cl.fb.keyword_posts_crisis_crawling_requests|cl.fb.keyword_posts_crisis_crawling_sources|cl.tt.posts_from_crisis_keyword_by_mobile_api_crawling_sources|cl.tt.posts_from_crisis_keyword_by_mobile_api_crawling_requests|cl.tt.posts_from_crisis_keyword_by_mobile_api_crawled_sources|cl.tt.posts_from_critical_keyword_by_mobile_api_crawling_sources|cl.tt.posts_from_critical_keyword_by_mobile_api_crawling_requests|cl.tt.posts_from_critical_keyword_by_mobile_api_crawled_sources|cl.tt.user_identity_countries_crawling_sources|tt.identity_countries|posts_critical_crawl


## Message mẫu



 - Tiktok

{
"mentions": [
    {
     "id": "26572e47-3f34-5d2b-8ae2-15080d7638e3",
     "link": "tiktok.com/@MS4wLjABAAAA0-m3igwEpgo2Hs56UdanCyE3ijh0MXeJnFvhsdFtX36AMU8Ma93Okllm4eSc7u29/video/7619148341473037575",
     "platform": 9,
     "domain": "tiktok.com",
     "id_source": "tt_MS4wLjABAAAA0-m3igwEpgo2Hs56UdanCyE3ijh0MXeJnFvhsdFtX36AMU8Ma93Okllm4eSc7u29",
     "id_social": "7619148341473037575",
     "identity": "tt_MS4wLjABAAAA0-m3igwEpgo2Hs56UdanCyE3ijh0MXeJnFvhsdFtX36AMU8Ma93Okllm4eSc7u29",
     "identity_name": "Truyền hình Quảng Ngãi",
     "mention_type": 1,
     "mention_type_details": 1,
     "views": 8476,
     "likes": 199,
     "comments": 9,
     "shares": 33,
     "engagement_total": 241,
     "engagement_s_c": 42,
     "attachment": "{\"media_src\":\"https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/oEAeUL2HAYfWeGUbQYTGPPA4FzIJemKQAAJ5Iv~tplv-tiktokx-origin.image?dr=1364&refresh_token=ce0b072d&x-expires=1774062000&x-signature=tIxnhaZ26mR9Gn%2FBPCFKAoZqb8I%3D&t=bacd0480&ps=4f5296ae&shp=d05b14bd&shcp=c1333099&idc=my2&s=SEARCH&sc=dynamic_cover&biz_tag=tt_video\",\"type\":\"video\"}",
     "created_date": "2026-03-20T01:47:03.000Z",
     "updated_at": "2026-03-20T03:54:51.811Z",
     "shard": "20260320",
     "search_text": [
        "",
        "Giá xăng tăng hơn 5.100 đồng #dthquangngai #quangngai #76quangngai #tiktoknews #onhaxemtin #truyenhinhquangngai #xuhuong #tintuc #thinhhanh #ti̇ktok #congan #dthquangngaimcv #kontum #tintuchay #tintuctrongngay #anninh #anninhtrattu #antoangiaothong #tintucgiaitri #ptq #xangdau"
     ],
     "effect": [],
     "sound": [
        "7619148409417829138 âm thanh gốc - Truyền hình Quảng Ngãi"
     ],
     "is_kol": false,
     "createdBy": "TiktokPostFromCrisisKeywordByMobileApiCrawlingLoader",
     "caption_infos": [],
     "caption": "Giá xăng tăng hơn 5.100 đồng #dthquangngai #quangngai #76quangngai #tiktoknews #onhaxemtin #truyenhinhquangngai #xuhuong #tintuc #thinhhanh #ti̇ktok #congan #dthquangngaimcv #kontum #tintuchay #tintuctrongngay #anninh #anninhtrattu #antoangiaothong #tintucgiaitri #ptq #xangdau",
     "country_code": "VN"
    }
],
"canSkipRedisInsert": true
}




- Facebook

{
    "mentions": [
      {
        "id": "0a89d410-48e0-562d-aa23-d396d7f0be04",
        "link": "fb.com/100656019627968_958324347178468",
        "domain": "facebook.com",
        "id_source": "fb_100656019627968",
        "id_reference": null,
        "id_parent_comment": null,
        "views": 0,
        "likes": 7,
        "comments": 0,
        "shares": 1,
        "rating_score": 0,
        "engagement_total": 8,
        "engagement_s_c": 1,
        "identity": "fb_100656019627968",
        "identity_name": "Toàn Trung Xe Lướt TPHCM",
        "platform": 1,
        "mention_type": 1,
        "mention_type_details": 1,
        "title": null,
        "search_text": [
          "",
          "Xe Hot cập bến 🔥🔥\n🚘 Xe Mitsubishi Xforce Premium 2024 odo 14.000km\n📲 Định giá - Thu mua xe giá cao tại nhà\n💰 Hoa hồng cho người giới thiệu 😍\n0922325679 (Nhật Luân)\n0777393962 (Sa Lem)\n0777262628 (Anh Hào)\n0777262608 (Văn Thương)\n0777393990 (Công Toàn)\nCam kết quyền lợi tuyệt đối cho khách hàng:\n✅ Tài chính: Hỗ trợ giải ngân tức thì, bảo mật thông tin khách hàng tuyệt đối.\n✅ Quy trình: Thủ tục thu mua cực kỳ nhanh gọn.\n✅ Thanh toán: Giao xe là nhận tiền ngay."
        ],
        "sound": [],
        "effect": [],
        "attachment": "{\"type\":\"album\",\"id\":\"958324253845144\",\"media_src\":\"https://scontent.fsgn19-1.fna.fbcdn.net/v/t39.30808-6/702524659_958296313847938_4583808401265781448_n.jpg?stp=dst-jpg_s590x590_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=7sroDJYZkWIQ7kNvwGFBkeS&_nc_oc=AdqUNBJRdEsjzQPOGJqxqqP7Xs79xHQz4LuSppI-coOdFqrz3FGNTJmjjWVcCeBbsahUiusfiatfFZV0QzkkgWaN&_nc_zt=23&_nc_ht=scontent.fsgn19-1.fna&_nc_gid=bOPjOkg6Z-3HJu7z1uwEDw&_nc_ss=7320f&oh=00_Af47aLQ8Za9ZAWaYagIR0fS0gURP7lWnTEGMgmpD7TemfA&oe=6A10C152\"}",
        "attachments": [
          {
            "url": "https://scontent-atl3-2.xx.fbcdn.net/v/t39.30808-6/702524659_958296313847938_4583808401265781448_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=kPGniMw8LDsQ7kNvwFaZFO7&_nc_oc=AdrXZxdkaJ672skPBQoJzYFXgjpaJwz6_8Q3UAPArEvy3kK51j6_9Xtp4JQ00EHeM2ff6OMClfAckohG55v2GeYM&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-atl3-2.xx&_nc_ss=70120&oh=00_Af_J9w4OrgMp-r3TDWfpDnZwuz5bQACRsDJz7uVJLKudWg&oe=6A25A112",
            "mediaId": "958324253845144",
            "type": "photo"
          },
          {
            "url": "https://scontent-atl3-2.xx.fbcdn.net/v/t39.30808-6/702398284_958296350514601_4940537243460255215_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=PA6QODdnlJwQ7kNvwH0-WSD&_nc_oc=AdqrPf8pWafvkxR1vC88RUYB0pzj9s0gb_rueZqGsvR1BD9ykiCh4N-8x0KQl3LjzXAa-xn2BEM5ZmoN2UtD5iht&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-atl3-2.xx&_nc_ss=70120&oh=00_Af9HZxk8dsqS5h3jBbJRZYBv9MyP1o_OT9sYX1-WRsnkHw&oe=6A25A3A2",
            "mediaId": "958324260511810",
            "type": "photo"
          },
          {
            "url": "https://scontent-atl3-2.xx.fbcdn.net/v/t39.30808-6/702107497_958296343847935_3101887152581983853_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=101&ccb=1-7&_nc_sid=833d8c&_nc_ohc=Rim5GHBwZLQQ7kNvwH_bu1B&_nc_oc=AdpLMHNyTF-7Ady70qnbRAc38uGeP06Pg0zu9fC87ijUstk2F-dJLLNG5Rk4v9wAHKOQg1uVtuEpd6a2V6WRx2LM&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-atl3-2.xx&_nc_ss=70120&oh=00_Af-S9oGDj0ho08VRNVPT4_WPoL9lrTTjB5QQpoZLUWbe4Q&oe=6A259E16",
            "mediaId": "958324267178476",
            "type": "photo"
          },
          {
            "url": "https://scontent-atl3-1.xx.fbcdn.net/v/t39.30808-6/701559015_958296340514602_7062052307789505378_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=103&ccb=1-7&_nc_sid=833d8c&_nc_ohc=bvxPND_oe4gQ7kNvwE4nenl&_nc_oc=AdqcrA2XWpmJ7RE28Y0_tpFSWtS6nm1r07sUg1n54Rju8liHrkkMESkNwrnwc0hWwfOoCl0gxeOQPHmopUJdr9-v&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-atl3-1.xx&_nc_ss=70120&oh=00_Af_PNs_q79aGcuGnFhK0_FzwZgFlReLWwF5LYRmoeWr_Sg&oe=6A258A0E",
            "mediaId": "958324257178477",
            "type": "photo"
          },
          {
            "url": "https://scontent-atl3-3.xx.fbcdn.net/v/t39.30808-6/702259746_958296337181269_7966128920314847394_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=110&ccb=1-7&_nc_sid=833d8c&_nc_ohc=wis23mEZJsIQ7kNvwFVhMU5&_nc_oc=AdpD36gIOepP8Sy7zBiPlGzNhPWgfKdvWrXxhWGmCU_g_8NHgvDKmwuBbjetEfeJmLBN1j_PZHuEJkTnIwUBkWuQ&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-atl3-3.xx&_nc_ss=70120&oh=00_Af_wBurUUifYXdNKTtUyDFytMdkK9hbg2UWLC-yMDvDcrg&oe=6A2592EE",
            "mediaId": "958324250511811",
            "type": "photo"
          },
          {
            "url": "https://scontent-atl3-2.xx.fbcdn.net/v/t39.30808-6/702494731_958296347181268_6073187968100838467_n.jpg?stp=dst-jpg_s960x960_tt6&_nc_cat=100&ccb=1-7&_nc_sid=833d8c&_nc_ohc=9cLpoMNfX_8Q7kNvwE1ORCr&_nc_oc=AdpMFrIOEjyzQs7hqsHyW1fFxAlCl5eGC8Jfk62VPYo2ZmO4c61rQ7d6KHHt1bxl87XpqpwjT9idy-cFzeFqX5B7&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-atl3-2.xx&_nc_ss=70120&oh=00_Af9fJvJk0LakQb48RFhVl8u8i7roaicPtvLYZiAexY-9oA&oe=6A259028",
            "mediaId": "958324263845143",
            "type": "photo"
          }
        ],
        "actualAttachmentCount": 6,
        "link_shared": null,
        "link_shared_domain": null,
        "source_type": 2,
        "created_date": "2026-05-18T08:44:55.000Z",
        "updated_at": "2026-05-18T08:51:25.598Z",
        "shard": "20260518",
        "createdBy": "FacebookCrawlPostByKeywords",
        "country_code": "VN",
        "id_social": "958324347178468",
        "caption": "Xe Hot cập bến 🔥🔥\n🚘 Xe Mitsubishi Xforce Premium 2024 odo 14.000km\n📲 Định giá - Thu mua xe giá cao tại nhà\n💰 Hoa hồng cho người giới thiệu 😍\n0922325679 (Nhật Luân)\n0777393962 (Sa Lem)\n0777262628 (Anh Hào)\n0777262608 (Văn Thương)\n0777393990 (Công Toàn)\nCam kết quyền lợi tuyệt đối cho khách hàng:\n✅ Tài chính: Hỗ trợ giải ngân tức thì, bảo mật thông tin khách hàng tuyệt đối.\n✅ Quy trình: Thủ tục thu mua cực kỳ nhanh gọn.\n✅ Thanh toán: Giao xe là nhận tiền ngay."
      }
    ]
  }



- Message dùng để check dup

{
  "mentions": [
    {
      "id": "a7ed5cd4-b354-55be-acd5-39c262c9e256",
      "link": "tiktok.com/@MS4wLjABAAAAOWdTpeLCwNidXWILOqJS3MMzg4jwsxPICgMdDHoJ_VMz4MrzwF4rj2Mf8K961gyH/video/7649692984975396117",
      "platform": 9,
      "domain": "tiktok.com",
      "id_source": "tt_MS4wLjABAAAAOWdTpeLCwNidXWILOqJS3MMzg4jwsxPICgMdDHoJ_VMz4MrzwF4rj2Mf8K961gyH",
      "id_social": "7649692984975396117",
      "identity": "tt_MS4wLjABAAAAOWdTpeLCwNidXWILOqJS3MMzg4jwsxPICgMdDHoJ_VMz4MrzwF4rj2Mf8K961gyH",
      "identity_name": "BrightexV",
      "mention_type": 1,
      "mention_type_details": 1,
      "views": 26321,
      "likes": 629,
      "comments": 3,
      "shares": 40,
      "engagement_total": 672,
      "engagement_s_c": 43,
      "attachment": "{\"media_src\":\"https://p16-common-sign.tiktokcdn.com/tos-alisg-p-0037/osdDvZUDBVjYI5eILlAJVQQGSAeoUJRCGteooU~tplv-tiktokx-shrink-aq:360:360:q75.webp?dr=17995&refresh_token=b0f1b4ca&x-expires=1781337600&x-signature=dRhCOuzBI7S9tdr0krcxrmzg0Ww%3D&t=bacd0480&ps=d97f9a4f&shp=d05b14bd&shcp=c1333099&idc=my&biz_tag=tt_video&s=SEARCH&sc=feed_cover\",\"type\":\"video\"}",
      "created_date": "2026-06-10T09:15:47.000Z",
      "updated_at": "2026-06-12T08:29:20.123Z",
      "shard": "20260610",
      "search_text": [
        "",
        "🚨🚨 | Lionel Messi marked his return from an Achilles injury with scoring his 911th goal in less than a minute after coming on. He also won a penalty on his return. 🌟 🇦🇷#messi #messi10 #argentina🇦🇷 #trendingvideo #fyp @FIFA World Cup @FIFA"
      ],
      "effect": [],
      "sound": [
        "7638490698165897232 DAI DAI FIFA WORLD CUP 2026"
      ],
      "is_kol": false,
      "createdBy": "TiktokPostFromCrisisKeywordByMobileApiCrawlingLoader",
      "language": -1,
      "caption_infos": [],
      "caption": "🚨🚨 | Lionel Messi marked his return from an Achilles injury with scoring his 911th goal in less than a minute after coming on. He also won a penalty on his return. 🌟 🇦🇷#messi #messi10 #argentina🇦🇷 #trendingvideo #fyp @FIFA World Cup @FIFA"
    },
    {
      "id": "746bc9f5-1076-57dd-98a9-f8756bf44910",
      "link": "tiktok.com/@MS4wLjABAAAAy1jeqZX91AIsUjviZ0TR8BbwplwQUY_XgH_R1CwkhLqv_n75ptDyO2M-b4Rmys16/video/7649679141712776466",
      "platform": 9,
      "domain": "tiktok.com",
      "id_source": "tt_MS4wLjABAAAAy1jeqZX91AIsUjviZ0TR8BbwplwQUY_XgH_R1CwkhLqv_n75ptDyO2M-b4Rmys16",
      "id_social": "7649679141712776466",
      "identity": "tt_MS4wLjABAAAAy1jeqZX91AIsUjviZ0TR8BbwplwQUY_XgH_R1CwkhLqv_n75ptDyO2M-b4Rmys16",
      "identity_name": "HẠ",
      "mention_type": 1,
      "mention_type_details": 1,
      "views": 2925,
      "likes": 159,
      "comments": 24,
      "shares": 1,
      "engagement_total": 184,
      "engagement_s_c": 25,
      "attachment": "{\"media_src\":\"https://p16-common-sign.tiktokcdn.com/tos-alisg-p-0037/oknkfADK2PhBVFRZqVJ6tBUEgQhSByeQH69REX~tplv-tiktokx-shrink-aq:360:360:q75.webp?dr=17995&refresh_token=4223168e&x-expires=1781337600&x-signature=7oieS%2F40ocWh0HYoElIfRufuodI%3D&t=bacd0480&ps=d97f9a4f&shp=d05b14bd&shcp=c1333099&idc=my&biz_tag=tt_video&s=SEARCH&sc=feed_cover\",\"type\":\"video\"}",
      "created_date": "2026-06-10T08:22:06.000Z",
      "updated_at": "2026-06-12T08:29:20.123Z",
      "shard": "20260610",
      "search_text": [
        "",
        "Here..!LeO Messi came on and scored a goal immediately.. #argentina🇦🇷 #argentinavsiceland #messi #fyp #roadtoworldcup2026"
      ],
      "effect": [],
      "sound": [
        "7605166944787761169 Đam mê của bạn là gì"
      ],
      "is_kol": false,
      "createdBy": "TiktokPostFromCrisisKeywordByMobileApiCrawlingLoader",
      "language": -1,
      "caption_infos": [
        {
          "caption_format": "webvtt",
          "caption_length": 505,
          "cla_subtitle_id": 7649683779559067000,
          "complaint_id": 7649683779559067000,
          "expire": 1783845007,
          "is_auto_generated": true,
          "is_original_caption": true,
          "lang": "vie-VN",
          "language_code": "vi",
          "language_id": 10,
          "source_tag": "trantor,hot_prediction,vv_counter,",
          "sub_id": -631116691,
          "sub_version": "1",
          "subtitle_type": 1,
          "translation_type": 0,
          "translator_id": 0,
          "url": "https://v16-cla.tiktokcdn.com/b12d4a265f031d682705e211dc93caa7/6a53508f/video/tos/alisg/tos-alisg-pv-0037/47fd27cffed94564a69f4e3976a017eb/?a=1233&bti=NEBzNTY6QGo6OjZALnAjNDQuYCMxNDNg&&bt=8952&ft=WcJ-TNM6VUOwU0mr1arz7Er5SO9Dk1PXtvWAEPcyqF_4&mime_type=video_mp4&rc=ajdsaHg5cnhrOzMzODczNEBpajdsaHg5cnhrOzMzODczNEBxazZpMmRramhhLS1kMTFzYSNxazZpMmRramhhLS1kMTFzcw%3D%3D&vvpl=1&l=20260612162916AC4972EC2B294F1BAB15&btag=e00048000",
          "url_list": [
            "https://v16-cla.tiktokcdn.com/b12d4a265f031d682705e211dc93caa7/6a53508f/video/tos/alisg/tos-alisg-pv-0037/47fd27cffed94564a69f4e3976a017eb/?a=1233&bti=NEBzNTY6QGo6OjZALnAjNDQuYCMxNDNg&&bt=8952&ft=WcJ-TNM6VUOwU0mr1arz7Er5SO9Dk1PXtvWAEPcyqF_4&mime_type=video_mp4&rc=ajdsaHg5cnhrOzMzODczNEBpajdsaHg5cnhrOzMzODczNEBxazZpMmRramhhLS1kMTFzYSNxazZpMmRramhhLS1kMTFzcw%3D%3D&vvpl=1&l=20260612162916AC4972EC2B294F1BAB15&btag=e00048000",
            "https://v19-cla.tiktokcdn.com/c1e56c5e379134f678723c6a35557c5f/6a53508f/video/tos/alisg/tos-alisg-pv-0037/47fd27cffed94564a69f4e3976a017eb/?a=1233&bti=NEBzNTY6QGo6OjZALnAjNDQuYCMxNDNg&&bt=8952&ft=WcJ-TNM6VUOwU0mr1arz7Er5SO9Dk1PXtvWAEPcyqF_4&mime_type=video_mp4&rc=ajdsaHg5cnhrOzMzODczNEBpajdsaHg5cnhrOzMzODczNEBxazZpMmRramhhLS1kMTFzYSNxazZpMmRramhhLS1kMTFzcw%3D%3D&vvpl=1&l=20260612162916AC4972EC2B294F1BAB15&btag=e00048000",
            "https://api.tiktokv.com/aweme/v1/play/?faid=1233&format=webvtt&is_play_url=1&language=vie-VN&line=0&signaturev3=dmlkZW9faWQ7ZmlsZV9pZDtpdGVtX2lkLjEwYzg4NzQwYmEyMWQ4NzIwZGU2MGJkMGI3Mjc2ZTI3&source=SmartPlayerSubtitleRedirect&version=1%3Awhisper_lid&video_id=v14044g50000d8khmunog65ule9in4tg"
          ],
          "variant": "whisper_lid"
        }
      ],
      "caption": "Here..!LeO Messi came on and scored a goal immediately.. #argentina🇦🇷 #argentinavsiceland #messi #fyp #roadtoworldcup2026"
    },
    {
      "id": "e2f2ee6d-95da-5ee6-9e0f-12af1fe28788",
      "link": "tiktok.com/@MS4wLjABAAAAzPNBBT1O-g5UVw7tgf3LYtx5U-T7Y2sD_tUnAeS84KBhXyhRVa0_SXNM-PyXAckd/video/7649628513942719752",
      "platform": 9,
      "domain": "tiktok.com",
      "id_source": "tt_MS4wLjABAAAAzPNBBT1O-g5UVw7tgf3LYtx5U-T7Y2sD_tUnAeS84KBhXyhRVa0_SXNM-PyXAckd",
      "id_social": "7649628513942719752",
      "identity": "tt_MS4wLjABAAAAzPNBBT1O-g5UVw7tgf3LYtx5U-T7Y2sD_tUnAeS84KBhXyhRVa0_SXNM-PyXAckd",
      "identity_name": "Bóng đá FC🇻🇳🇻🇳🇻🇳",
      "mention_type": 1,
      "mention_type_details": 1,
      "views": 11488,
      "likes": 326,
      "comments": 9,
      "shares": 2,
      "engagement_total": 337,
      "engagement_s_c": 11,
      "attachment": "{\"media_src\":\"https://p16-common-sign.tiktokcdn.com/tos-alisg-p-0037/oEI4viEBUoPsoB4Y2arIjSAYFlQ8BtWiAd8iX~tplv-tiktokx-shrink-aq:360:360:q75.webp?dr=17995&refresh_token=e6bd4b3c&x-expires=1781337600&x-signature=WGTzego%2FYFWVuZrHi45DrWnjflE%3D&t=bacd0480&ps=d97f9a4f&shp=d05b14bd&shcp=c1333099&idc=my&biz_tag=tt_video&s=SEARCH&sc=feed_cover\",\"type\":\"video\"}",
      "created_date": "2026-06-10T05:05:41.000Z",
      "updated_at": "2026-06-12T08:29:20.123Z",
      "shard": "20260610",
      "search_text": [
        "",
        "Goat thật khác biệt 🥶🥶🥶 #yeubongda #yeubongda ❤⚽ #leomessi #messi # 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
      ],
      "effect": [],
      "sound": [
        "7630969017695619861 âm thanh gốc - Shin Music"
      ],
      "is_kol": false,
      "createdBy": "TiktokPostFromCrisisKeywordByMobileApiCrawlingLoader",
      "caption_infos": [],
      "caption": "Goat thật khác biệt 🥶🥶🥶 #yeubongda #yeubongda ❤⚽ #leomessi #messi # 🔥🔥🔥🔥🔥🔥🔥🔥🔥🔥"
    },
    {
      "id": "59a6bf1f-2f35-5921-91af-9a98a2694492",
      "link": "tiktok.com/@MS4wLjABAAAAs-DeDwgZUQAvxluApVL6W1q4CpnANTB_-3lRBpXFXY2ZWM_2GC25tuVi7mqy44oO/video/7649609541688003848",
      "platform": 9,
      "domain": "tiktok.com",
      "id_source": "tt_MS4wLjABAAAAs-DeDwgZUQAvxluApVL6W1q4CpnANTB_-3lRBpXFXY2ZWM_2GC25tuVi7mqy44oO",
      "id_social": "7649609541688003848",
      "identity": "tt_MS4wLjABAAAAs-DeDwgZUQAvxluApVL6W1q4CpnANTB_-3lRBpXFXY2ZWM_2GC25tuVi7mqy44oO",
      "identity_name": "El Pulga",
      "mention_type": 1,
      "mention_type_details": 1,
      "views": 2493,
      "likes": 32,
      "comments": 0,
      "shares": 0,
      "engagement_total": 32,
      "engagement_s_c": 0,
      "attachment": "{\"media_src\":\"https://p16-common-sign.tiktokcdn.com/tos-alisg-p-0037/o4sU4IeIDeNwbC3QAEf2AJAJsF6G8UDIU8IjIo~tplv-tiktokx-shrink-aq:360:360:q75.webp?dr=17995&refresh_token=688c6f2b&x-expires=1781337600&x-signature=bu4wekCSC6FFSkE6sCE9%2BJ1PJD4%3D&t=bacd0480&ps=d97f9a4f&shp=d05b14bd&shcp=c1333099&idc=my&s=SEARCH&sc=feed_cover&biz_tag=tt_video\",\"type\":\"video\"}",
      "created_date": "2026-06-10T03:52:00.000Z",
      "updated_at": "2026-06-12T08:29:20.123Z",
      "shard": "20260610",
      "search_text": [
        "",
        "Màn chạy đà hoàn hảo cho World cup 2026 #argentina #worldcup #xuhuong #viral #leomessi"
      ],
      "effect": [],
      "sound": [
        "7641860809278245650 âm thanh gốc - Chim Music 🎧🎵"
      ],
      "is_kol": false,
      "createdBy": "TiktokPostFromCrisisKeywordByMobileApiCrawlingLoader",
      "caption_infos": [],
      "caption": "Màn chạy đà hoàn hảo cho World cup 2026 #argentina #worldcup #xuhuong #viral #leomessi"
    },
    {
      "id": "cc72c0bc-4bc9-5998-a47c-5119191e025c",
      "link": "tiktok.com/@MS4wLjABAAAAmjvnZOf3D3J9kmehxp1j6oA2Hc76PhykIRiUPqfXW9nGvyVYdXvW6OzsfmOpSFsU/video/7649604219917405461",
      "platform": 9,
      "domain": "tiktok.com",
      "id_source": "tt_MS4wLjABAAAAmjvnZOf3D3J9kmehxp1j6oA2Hc76PhykIRiUPqfXW9nGvyVYdXvW6OzsfmOpSFsU",
      "id_social": "7649604219917405461",
      "identity": "tt_MS4wLjABAAAAmjvnZOf3D3J9kmehxp1j6oA2Hc76PhykIRiUPqfXW9nGvyVYdXvW6OzsfmOpSFsU",
      "identity_name": "𝕷𝖚 𝖋𝖔𝖔𝖙𝖇𝖆𝖑𝖑",
      "mention_type": 1,
      "mention_type_details": 1,
      "views": 46242,
      "likes": 1061,
      "comments": 56,
      "shares": 17,
      "engagement_total": 1134,
      "engagement_s_c": 73,
      "attachment": "{\"media_src\":\"https://p19-common-sign.tiktokcdn.com/tos-alisg-p-0037/oIJpQUED72fBL13CtqNREhAQRQF8oRAKHzBhfg~tplv-tiktokx-shrink-aq:360:360:q75.webp?dr=17995&refresh_token=dbf8d26a&x-expires=1781337600&x-signature=RiKM52p%2FcTc6VNRMxcGk2vBWaSc%3D&t=bacd0480&ps=d97f9a4f&shp=d05b14bd&shcp=c1333099&idc=my&biz_tag=tt_video&s=SEARCH&sc=feed_cover\",\"type\":\"video\"}",
      "created_date": "2026-06-10T03:31:24.000Z",
      "updated_at": "2026-06-12T08:29:20.123Z",
      "shard": "20260610",
      "search_text": [
        "",
        "Messi vừa vào sân đã tung ra đường chọc khe đẳng cấp cho Lautaro Martínez mang về quả phạt đền cho Argentina. 💪👏 Và rồi chính anh là người ghi bàn thắng thứ hai cho La Albiceleste. Đẳng cấp của GOAT là đây. 🐐 🇦🇷#messi #leomessi #lionelmessi #argentina #iceland"
      ],
      "effect": [],
      "sound": [
        "7638603806564961040 âm thanh gốc - 🇻🇳1986🐅\"BG\""
      ],
      "is_kol": false,
      "createdBy": "TiktokPostFromCrisisKeywordByMobileApiCrawlingLoader",
      "caption_infos": [],
      "caption": "Messi vừa vào sân đã tung ra đường chọc khe đẳng cấp cho Lautaro Martínez mang về quả phạt đền cho Argentina. 💪👏 Và rồi chính anh là người ghi bàn thắng thứ hai cho La Albiceleste. Đẳng cấp của GOAT là đây. 🐐 🇦🇷#messi #leomessi #lionelmessi #argentina #iceland"
    },
    {
      "id": "be29a9ad-3c2e-5093-8c58-5cf5a23d89a1",
      "link": "tiktok.com/@MS4wLjABAAAAAC6UTwQGd1JYLDbfRSIjmp_DlgjDuxbUz_r3yt6RXQEJhO0TJyNEVubPQJ3XDt65/video/7649594410107276574",
      "platform": 9,
      "domain": "tiktok.com",
      "id_source": "tt_MS4wLjABAAAAAC6UTwQGd1JYLDbfRSIjmp_DlgjDuxbUz_r3yt6RXQEJhO0TJyNEVubPQJ3XDt65",
      "id_social": "7649594410107276574",
      "identity": "tt_MS4wLjABAAAAAC6UTwQGd1JYLDbfRSIjmp_DlgjDuxbUz_r3yt6RXQEJhO0TJyNEVubPQJ3XDt65",
      "identity_name": "absolutemessi",
      "mention_type": 1,
      "mention_type_details": 1,
      "views": 385386,
      "likes": 69646,
      "comments": 1118,
      "shares": 2972,
      "engagement_total": 73736,
      "engagement_s_c": 4090,
      "attachment": "{\"media_src\":\"https://p16-common-sign.tiktokcdn.com/tos-useast8-p-0068-tx2/o4ABRFwcFKB1DoPgRfbBNDExAVEXEhsQpqfBQI~tplv-tiktokx-shrink-aq:360:360:q75.webp?dr=17995&refresh_token=98f42309&x-expires=1781337600&x-signature=3796YraLAfWt0gbm8%2FSgkliuQF4%3D&t=bacd0480&ps=d97f9a4f&shp=d05b14bd&shcp=c1333099&idc=my&biz_tag=tt_video&s=SEARCH&sc=feed_cover\",\"type\":\"video\"}",
      "created_date": "2026-06-10T02:53:26.000Z",
      "updated_at": "2026-06-12T08:29:20.124Z",
      "shard": "20260610",
      "search_text": [
        "",
        "Lionel Messi Goal Today VS Iceland 😮‍💨 🇦🇷 | #messigoaltoday #argentinavsiceland #worldcup2026 #messipenaltytoday #edit"
      ],
      "effect": [],
      "sound": [
        "7611053533433022465 Bajo La Luz (SLOWED)"
      ],
      "is_kol": false,
      "createdBy": "TiktokPostFromCrisisKeywordByMobileApiCrawlingLoader",
      "language": -1,
      "caption_infos": [],
      "caption": "Lionel Messi Goal Today VS Iceland 😮‍💨 🇦🇷 | #messigoaltoday #argentinavsiceland #worldcup2026 #messipenaltytoday #edit"
    },
    {
      "id": "cf39bb68-51de-51fc-85e1-a62c8834f848",
      "link": "tiktok.com/@MS4wLjABAAAAmjvnZOf3D3J9kmehxp1j6oA2Hc76PhykIRiUPqfXW9nGvyVYdXvW6OzsfmOpSFsU/video/7649570107512950037",
      "platform": 9,
      "domain": "tiktok.com",
      "id_source": "tt_MS4wLjABAAAAmjvnZOf3D3J9kmehxp1j6oA2Hc76PhykIRiUPqfXW9nGvyVYdXvW6OzsfmOpSFsU",
      "id_social": "7649570107512950037",
      "identity": "tt_MS4wLjABAAAAmjvnZOf3D3J9kmehxp1j6oA2Hc76PhykIRiUPqfXW9nGvyVYdXvW6OzsfmOpSFsU",
      "identity_name": "𝕷𝖚 𝖋𝖔𝖔𝖙𝖇𝖆𝖑𝖑",
      "mention_type": 1,
      "mention_type_details": 1,
      "views": 107375,
      "likes": 4361,
      "comments": 127,
      "shares": 40,
      "engagement_total": 4528,
      "engagement_s_c": 167,
      "attachment": "{\"media_src\":\"https://p16-common-sign.tiktokcdn.com/tos-alisg-p-0037/oMvo6VwFfAItC2gQBBI1k6ADuiAuiCDz5F6Is0~tplv-tiktokx-shrink-aq:360:360:q75.webp?dr=17995&refresh_token=9a590439&x-expires=1781337600&x-signature=1p4O3FmNXmQdiWNcWGBEjGDrEQQ%3D&t=bacd0480&ps=d97f9a4f&shp=d05b14bd&shcp=c1333099&idc=my&biz_tag=tt_video&s=SEARCH&sc=feed_cover\",\"type\":\"video\"}",
      "created_date": "2026-06-10T01:18:59.000Z",
      "updated_at": "2026-06-12T08:29:20.124Z",
      "shard": "20260610",
      "search_text": [
        "",
        "Sau trận mưa lớn trước giờ thi đấu giữa tuyển Argentina với tuyển Iceland , Messi và anh em đã có mặt trên sân khởi động. 👏😍😍 Messi vẫn sẽ ngồi dự bị,hy vọng anh sẽ vào sân ở hiệp hai. 🤗🤩 #messi #leomessi #argentina #iceland #lionelmessi"
      ],
      "effect": [],
      "sound": [
        "7645643476143852309 âm thanh gốc - NamConProducer"
      ],
      "is_kol": false,
      "createdBy": "TiktokPostFromCrisisKeywordByMobileApiCrawlingLoader",
      "caption_infos": [],
      "caption": "Sau trận mưa lớn trước giờ thi đấu giữa tuyển Argentina với tuyển Iceland , Messi và anh em đã có mặt trên sân khởi động. 👏😍😍 Messi vẫn sẽ ngồi dự bị,hy vọng anh sẽ vào sân ở hiệp hai. 🤗🤩 #messi #leomessi #argentina #iceland #lionelmessi"
    },
    {
      "id": "8911b3c8-dff1-58e0-b554-4f22b8a9f5cf",
      "link": "tiktok.com/@MS4wLjABAAAAsHSqdT8tqf3gk8ruTsrgisdSmecuc5_ODqSVDCxgRJPDjfHKR6xYGybdkYxeM_xw/video/7649386779065322759",
      "platform": 9,
      "domain": "tiktok.com",
      "id_source": "tt_MS4wLjABAAAAsHSqdT8tqf3gk8ruTsrgisdSmecuc5_ODqSVDCxgRJPDjfHKR6xYGybdkYxeM_xw",
      "id_social": "7649386779065322759",
      "identity": "tt_MS4wLjABAAAAsHSqdT8tqf3gk8ruTsrgisdSmecuc5_ODqSVDCxgRJPDjfHKR6xYGybdkYxeM_xw",
      "identity_name": "VTV Times",
      "mention_type": 1,
      "mention_type_details": 1,
      "views": 1109177,
      "likes": 50875,
      "comments": 1363,
      "shares": 6808,
      "engagement_total": 59046,
      "engagement_s_c": 8171,
      "attachment": "{\"media_src\":\"https://p19-common-sign.tiktokcdn.com/tos-alisg-p-0037/o86IdyYBEia1BEiVUqBBTIMgFAkFVPPIgAo6i~tplv-tiktokx-shrink-aq:360:360:q75.webp?dr=17995&refresh_token=38ddfb44&x-expires=1781337600&x-signature=TGsMab28uwPibkAAs2ZJK6L3q8w%3D&t=bacd0480&ps=d97f9a4f&shp=d05b14bd&shcp=c1333099&idc=my&sc=feed_cover&biz_tag=tt_video&s=SEARCH\",\"type\":\"video\"}",
      "created_date": "2026-06-10T00:57:00.000Z",
      "updated_at": "2026-06-12T08:29:20.124Z",
      "shard": "20260610",
      "search_text": [
        "",
        "Lionel Messi vẫn là linh hồn của đội tuyển Argentina tại World Cup 2026, trong suốt 2 thập kỷ qua Messi đã làm say đắm hàng triệu trái tim của người hâm mộ bóng đá bằng những màn trình diễn đầy “ma thuật”. Sau đây chúng ta sẽ cùng tìm hiểu kĩ thuật của siêu sao này dưới góc độ khoa học. #vtvtimes #vtvonline #lionelmessi #phatichkythuat #duoigocdokhoahoc"
      ],
      "effect": [],
      "sound": [
        "7649386812963687185 âm thanh gốc - VTV Times"
      ],
      "is_kol": false,
      "createdBy": "TiktokPostFromCrisisKeywordByMobileApiCrawlingLoader",
      "caption_infos": [
        {
          "caption_format": "webvtt",
          "caption_length": 1201,
          "cla_subtitle_id": 7649564835602697000,
          "complaint_id": 7649564835602697000,
          "expire": 1783845026,
          "is_auto_generated": true,
          "is_original_caption": true,
          "lang": "vie-VN",
          "language_code": "vi",
          "language_id": 10,
          "source_tag": "vv_counter,",
          "sub_id": 133031888,
          "sub_version": "1",
          "subtitle_type": 1,
          "translation_type": 0,
          "translator_id": 0,
          "url": "https://v16-cla.tiktokcdn.com/e5be3d45802982bae9541e7925022f13/6a5350a2/video/tos/alisg/tos-alisg-pv-0037/a0a582d56e58420e8937351c780b035c/?a=1233&bti=NTY6QGo0QHM6OjZANDQuYCMucCMxNDNg&&bt=7071&ft=WcJ-TNM6VUOwU0mr1arz7Er5SO9Dk1PXtvWAEPcyqF_4&mime_type=video_mp4&rc=Mzc8am85cjc0OzMzODczNEBpMzc8am85cjc0OzMzODczNEBpXmI0MmQ0NmhhLS1kMTFzYSNpXmI0MmQ0NmhhLS1kMTFzcw%3D%3D&vvpl=1&l=20260612162916AC4972EC2B294F1BAB15&btag=e00050000",
          "url_list": [
            "https://v16-cla.tiktokcdn.com/e5be3d45802982bae9541e7925022f13/6a5350a2/video/tos/alisg/tos-alisg-pv-0037/a0a582d56e58420e8937351c780b035c/?a=1233&bti=NTY6QGo0QHM6OjZANDQuYCMucCMxNDNg&&bt=7071&ft=WcJ-TNM6VUOwU0mr1arz7Er5SO9Dk1PXtvWAEPcyqF_4&mime_type=video_mp4&rc=Mzc8am85cjc0OzMzODczNEBpMzc8am85cjc0OzMzODczNEBpXmI0MmQ0NmhhLS1kMTFzYSNpXmI0MmQ0NmhhLS1kMTFzcw%3D%3D&vvpl=1&l=20260612162916AC4972EC2B294F1BAB15&btag=e00050000",
            "https://v19-cla.tiktokcdn.com/18c018de4fa65b827d80102243457c25/6a5350a2/video/tos/alisg/tos-alisg-pv-0037/a0a582d56e58420e8937351c780b035c/?a=1233&bti=NTY6QGo0QHM6OjZANDQuYCMucCMxNDNg&&bt=7071&ft=WcJ-TNM6VUOwU0mr1arz7Er5SO9Dk1PXtvWAEPcyqF_4&mime_type=video_mp4&rc=Mzc8am85cjc0OzMzODczNEBpMzc8am85cjc0OzMzODczNEBpXmI0MmQ0NmhhLS1kMTFzYSNpXmI0MmQ0NmhhLS1kMTFzcw%3D%3D&vvpl=1&l=20260612162916AC4972EC2B294F1BAB15&btag=e00050000",
            "https://api.tiktokv.com/aweme/v1/play/?faid=1233&format=webvtt&is_play_url=1&language=vie-VN&line=0&signaturev3=dmlkZW9faWQ7ZmlsZV9pZDtpdGVtX2lkLjkxYzFlZjliYWExY2M3MGMyZmEwMTJlMmYwZjI1Y2Jm&source=SmartPlayerSubtitleRedirect&version=1%3Awhisper_lid&video_id=v14044g50000d8k1947og65l7ge9a4l0"
          ],
          "variant": "whisper_lid"
        }
      ],
      "caption": "Lionel Messi vẫn là linh hồn của đội tuyển Argentina tại World Cup 2026, trong suốt 2 thập kỷ qua Messi đã làm say đắm hàng triệu trái tim của người hâm mộ bóng đá bằng những màn trình diễn đầy “ma thuật”. Sau đây chúng ta sẽ cùng tìm hiểu kĩ thuật của siêu sao này dưới góc độ khoa học. #vtvtimes #vtvonline #lionelmessi #phatichkythuat #duoigocdokhoahoc"
    }
  ],
  "canSkipRedisInsert": false
}


## Chạy lại các luồng crawl Crisis Image


+ fb
ynm-cl-fb-keyword-post-crisis-images-service (download img svc)
ynm-cl-fb-keyword-post-crisis-service
ynm-cl-fb-keyword-post-critical-service
ynm-cl-fb-hashtag-post-critical-service
ynm-cl-fb-user-identity-country-service (detect country)
ynm-cl-fb-graph-engagement-by-crisis-imgs (crawl detail)

+ tt
ynm-cl-tt-crisis-images-kw-mobi-api-service (download img svc)

ynm-cl-tt-crisis-keyword-by-mob-api-service
ynm-cl-tt-critical-keyword-by-mob-api-service



tt-crisis-keyword-




## Các message dùng để chạy crawl


 {
    "id_keyword": 32700,
    "keyword": "Leo Messi",
    "id_platform": 9,
    "id_process": 2955,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }





   {
    "id_keyword": 32700,
    "keyword": "Messi",
    "id_platform": 1,
    "id_process": 2955,
    "is_critical": 1,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }



   {
    "id_keyword": 32700,
    "keyword": "Messi",
    "id_platform": 9,
    "id_process": 2955,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }



  {
    "id_keyword": 32700,
    "keyword": "Tiểu Vy",
    "id_platform": 9,
    "id_process": 2955,
    "is_critical": 0,
    "is_analyze": 1,
    "crawling_type": "crisis_tracking",
    "source": "graph",
    "is_first_crawl": 1,
    "last_data_date": "2026-03-10T06:29:00.000Z",
    "id_last_crawling": 97217,
    "tag_id": null,
    "country": "VN"
  }


  ## Những cases cần check lại ở testing

ynm-cl-fb-keyword-post-crisis-images-service

ynm-cl-tt-crisis-images-kw-mobi-api-service



ynm-cl-tt-crisis-keyword-by-mob-api-srv-testing



ynm-cl-fb-keyword-post-critical