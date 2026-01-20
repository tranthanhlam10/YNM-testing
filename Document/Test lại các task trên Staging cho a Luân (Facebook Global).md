# Test lại các task trên Staging cho a Luân

1. Task Comment

## Redis -> Hiện tại đã đúng config

TH_PageCommentCrawlingLoader
TH_GroupCommentCrawlingLoader

SG_PageCommentCrawlingLoader
SG_GroupCommentCrawlingLoader

ID_PageCommentCrawlingLoader
ID_GroupCommentCrawlingLoader


MY_PageCommentCrawlingLoader
MY_GroupCommentCrawlingLoader


PH_PageCommentCrawlingLoader
PH_GroupCommentCrawlingLoader

## Name_sapce: -> Hiện tại namespace đã chuẩn


crawler-th-staging
crawler-sg-staging
crawler-ph-staging
crawler-my-staging
crawler-id-staging



## Crawler Type

Loader: ynm-cl-fb-crawling-loader-service-th-staging
Crawler:
page: ynmm-cl-fb-page-comment-service-th-staging
group: ynm-cl-fb-group-comment-service-th-staging -> DONE



Loader: ynm-cl-fb-crawling-loader-service-sg-staging
Crawler:
page: ynmm-cl-fb-page-comment-service-sg-staging
group: ynm-cl-fb-group-comment-service-sg-staging



Loader: ynm-cl-fb-crawling-loader-service-ph-staging
Crawler:
page: ynmm-cl-fb-page-comment-service-ph-staging
group: ynm-cl-fb-group-comment-service-ph-staging



Loader: ynm-cl-fb-crawling-loader-service-my-staging
Crawler:
page: ynmm-cl-fb-page-comment-service-my-staging
group: ynm-cl-fb-group-comment-service-my-staging


Loader: ynm-cl-fb-crawling-loader-service-id-staging
Crawler:
page: ynmm-cl-fb-page-comment-service-id-staging
group: ynm-cl-fb-group-comment-service-id-staging



## Regex RabbitMQ

cl.fb.page_comments|cl.fb.group_comments|cl.identities_finished_sources|posts_2_solr_fb_posts|cl.mentions_2_solr_mentions|cl.fb.fb_posts_finished_sources|cl.fb.keyword|cl.fb.hashtag


## Message mẫu

- Loader

Group: 


{
  "id": "850017709061465_2075014779895079",
  "id_source": "fb_850017709061465",
  "retries": 0,
  "type": 3,
  "delay_time_rules": [
    {
      "lte": 168,
      "delay": 18
    },
    {
      "lte": 336,
      "delay": 48
    },
    {
      "lte": 999999999,
      "delay": 720
    }
  ],
  "last_data_date": "2026-01-14T09:29:06Z",
  "from_date": "1768382946",
  "to_date": "1768533170",
  "platform": 1,
  "createdBy": "GroupCommentCrawlingLoader",
  "title": "Im Looking for 1",
  "created_date": "2026-01-14T09:29:06Z",
  "caption": "Im Looking for 1 solo room female po ako\nMove in March 1 or end of march . \n\nPrefer toa payoh , bishan or braddel only . \n\nW/ AC ROOM \n\n No weird rules \n\nVisitor welcome .",
  "country_code": "SG"
}

Page:


{
  "id": "505898399463667_1428703541952973",
  "id_source": "fb_505898399463667",
  "retries": 0,
  "type": 2,
  "delay_time_rules": [
    {
      "lte": 168,
      "delay": 18
    },
    {
      "lte": 240,
      "delay": 48
    },
    {
      "lte": 999999999,
      "delay": 720
    }
  ],
  "last_data_date": "2026-01-15T04:25:53Z",
  "from_date": "1768451153",
  "to_date": "1768533223",
  "platform": 1,
  "createdBy": "PageCommentCrawlingLoader",
  "title": "Cebuuh peepz!",
  "created_date": "2026-01-15T04:25:53Z",
  "caption": "Cebuuh peepz! RedBull DYS free community class for everyone happening tonight! Come throughhhhh! 🚀\n\n📍 Ayala Malls Central Bloc - Level 3, Activity Center\n⏰ 4:30PM - 8:30PM",
  "shared_content": " FREE WORKSHOPS‼️ \n  \n January 15, 2026 — Thursday \n Nemesis (KRUMP) 4:30pm to 6:00pm \n Crazy Beans and Lema Bee 6:00pm to 8:30pm \n  \n AYALA CENTRAL BLOC📍Ayala Malls Central Bloc \n (https://maps.app.goo.gl/GSLgnRjJwRVn6Q9CA?g_st=ipc) \n  \n Brought to you by Red Bull PH, Ayala Malls and 02 Creatives!❤️‍🔥🇵🇭 \n It’s open to everyone, no registration fee. \n See you all there!😉 ",
  "country_code": "PH"
}


- Mentions


// Group

{
          "id": "cefcf932-2f64-5d8c-af96-0aba9af2694b",
          "id_social": "1860100791416835",
          "link": "fb.com/1860097354750512_1860100791416835",
          "id_source": "fb_1056695685090687",
          "id_reference": "45e10d9d-c265-5f3d-963f-a4199b6ee3ef",
          "id_parent_comment": null,
          "identity": "fb_100005240829100",
          "identity_name": "Daniela Del Boccio",
          "source_type": 3,
          "search_text_exactly": null,
          "mention_type": 2,
          "mention_type_details": 2,
          "search_text": [
            "",
            "Bravissimi ❤ ️ ❤ ️❤ ️ ❤ ️❤ ️"
          ],
          "attachment": "{\"parent_info\":{\"link\":\"fb.com/1056695685090687_1860097354750512\",\"title\":\"Con la mia donna 💕 ♥️\"}}",
          "title": null,
          "link_shared": null,
          "link_shared_domain": null,
          "views": 0,
          "likes": 0,
          "comments": 0,
          "shares": 0,
          "rating_score": 0,
          "engagement_total": 0,
          "engagement_s_c": 0,
          "created_date": "2026-01-10T18:36:06.000Z",
          "updated_at": "2026-01-13T03:22:12.163Z",
          "platform": 1,
          "domain": "facebook.com",
          "shard": "20260110",
          "createdBy": "GroupCommentCrawlingLoader",
          "country_code": "PH"
        }

 "parent_posts": {
        "aa6f7595-4f87-507a-b642-3300a9c17c90": {
          "title": "🧧🔰𝐍𝐄𝐖 𝐎𝐍𝐋𝐈𝐍𝐄 𝐂𝐀𝐒𝐈𝐍𝐎",
          "caption": "🧧🔰 NEW ONLINE CASINO 🔰🧧\n💜 #SAGISAGPH 💜💣 NEW RELEASE 💣\n💥 SOFT ON THE SCATTER 💥\n💥 HIGH WIN RATE 💥\n💥 NEXT NEXT COMBO 💥\n❗ NOT SCAM LINK ❗\nhttp://sgglec.96sagisagph.cc/?referralCode=wpr5438\nhttp://sgglec.96sagisagph.cc/?referralCode=wpr5438\n✅ REGISTER AND DEPOSIT ON MY LINK TO HAVE FREE BONUS 💯\nhttp://sgglec.96sagisagph.cc/?referralCode=wpr5438\nEVERYDAY CASH OUT HERE IT'S TOO MUCH TO GIVE 💥 THE TOP 1 CASINO GAME\n🔔🧧 Lucky link 🧧🔔👇👇\nhttp://sgglec.96sagisagph.cc/?referralCode=wpr5438\n🔗 Gcash,Paymaya 👀 cash in Min.100 👀 cash outMin. 100 is available\n📌⛔ SCRATCH (LOTTO) ⛔\n🔗 Games\n🔗 Mines\n🔗 Slots\n🔗 Live Casino\n🔗 Limbo\n🔗 Crash\n🔗 Sports\n🔗 More games to choose from and TRENDING NA ❗ ❗❗ SCRATCH ❗❗❗ NOT ONLY IN LOTTOHAN AND ALSO AVAILABLE Online casino\nhttp://sgglec.96sagisagph.cc/?referralCode=wpr5438",
          "created_date": "2026-01-10T20:54:52Z"
        }

 {
          "id": "2de49e73-0071-52ab-8769-62912eb9de47",
          "id_social": "1886730831955183",
          "link": "fb.com/1886667825294817_1886730831955183",
          "id_source": "fb_321799658448316",
          "id_reference": "f32616e9-93e1-52ce-b701-c33f703c969b",
          "id_parent_comment": null,
          "identity": "fb_100093413363975",
          "identity_name": "Rommy Z",
          "source_type": 3,
          "search_text_exactly": null,
          "mention_type": 2,
          "mention_type_details": 2,
          "search_text": [
            "",
            "Yo kebacut pisan se wong Jatim ae loe gua loe gua njirr"
          ],
          "attachment": "{\"parent_info\":{\"link\":\"fb.com/321799658448316_1886667825294817\",\"title\":\"Maaf semuanya bukan\"}}",
          "title": null,
          "link_shared": null,
          "link_shared_domain": null,
          "views": 0,
          "likes": 0,
          "comments": 0,
          "shares": 0,
          "rating_score": 0,
          "engagement_total": 0,
          "engagement_s_c": 0,
          "created_date": "2026-01-10T20:29:08.000Z",
          "updated_at": "2026-01-13T03:48:06.348Z",
          "platform": 1,
          "domain": "facebook.com",
          "shard": "20260110",
          "createdBy": "GroupCommentCrawlingLoader",
          "country_code": "ID"
        }




{
          "id": "fcfc4882-10ee-59cb-b37f-db3209195f3e",
          "id_social": "1773189980304564",
          "link": "fb.com/1772859260337636_1773189980304564",
          "id_source": "fb_566039497686291",
          "id_reference": "174c3696-669e-5569-aeb5-0802eb5cca2d",
          "id_parent_comment": null,
          "identity": "fb_100080803808961",
          "identity_name": "Yawwary Phaksa",
          "source_type": 3,
          "search_text_exactly": null,
          "mention_type": 2,
          "mention_type_details": 2,
          "search_text": [
            "",
            "รับค่ะ"
          ],
          "attachment": "{\"parent_info\":{\"link\":\"fb.com/566039497686291_1772859260337636\",\"title\":\"หาคนรับต้มไข่ต้มแก้บ\"}}",
          "title": null,
          "link_shared": null,
          "link_shared_domain": null,
          "views": 0,
          "likes": 0,
          "comments": 0,
          "shares": 0,
          "rating_score": 0,
          "engagement_total": 0,
          "engagement_s_c": 0,
          "created_date": "2026-01-05T00:18:37.000Z",
          "updated_at": "2026-01-12T09:50:55.106Z",
          "platform": 1,
          "domain": "facebook.com",
          "shard": "20260105",
          "createdBy": "GroupCommentCrawlingLoader",
          "country_code": "TH"
        }

// Page


{
          "id": "da4a7138-9448-5a9f-a0cd-a7c6c8c91017",
          "id_social": "2647868098918055",
          "link": "fb.com/855294783944652_2647868098918055",
          "id_source": "fb_107962065345553",
          "id_reference": "98e4d280-4b11-52a4-8bec-4edccee02106",
          "id_parent_comment": null,
          "identity": "fb_100002275869798",
          "identity_name": "Wilgar Elarmo",
          "source_type": 2,
          "search_text_exactly": null,
          "mention_type": 2,
          "mention_type_details": 2,
          "search_text": [
            "",
            "Congrats nakapaldo nasab 🥰👍"
          ],
          "attachment": "{\"parent_info\":{\"link\":\"fb.com/107962065345553_855294783944652\",\"title\":\"salamat 2025 na 2.8M\"}}",
          "title": null,
          "link_shared": null,
          "link_shared_domain": null,
          "views": 0,
          "likes": 0,
          "comments": 0,
          "shares": 0,
          "rating_score": 0,
          "engagement_total": 0,
          "engagement_s_c": 0,
          "created_date": "2025-12-28T12:35:31.000Z",
          "updated_at": "2026-01-16T08:48:57.190Z",
          "platform": 1,
          "domain": "facebook.com",
          "shard": "20251228",
          "createdBy": "PageCommentCrawlingLoader",
          "country_code": "PH"
        }



// Post finished source

{
  "id": "3249362f-1fdb-5351-9777-c2147127fcf4",
  "id_social": "102559832717871_895583946740536",
  "id_source": "fb_102559832717871",
  "title": "Thanks you shopee",
  "comment_updated_at": 1768555070,
  "last_status": 0,
  "country_code": "PH",
  "comment_last_date": "2026-01-16T08:46:48.000Z",
  "next_crawl_time": "2026-01-17T03:17:50.944Z",
  "createdBy": "PageCommentCrawlingLoader"
}



{
  "id": "0e3a3627-40dc-58e4-8c5e-79fa67084166",
  "id_social": "1095144678186463_1603145160719743",
  "id_source": "fb_1095144678186463",
  "title": "*PROMO PROMO BTR*",
  "comment_updated_at": 1768556460,
  "last_status": 0,
  "country_code": "ID",
  "comment_last_date": "2026-01-16T09:05:28.000Z",
  "next_crawl_time": "2026-01-17T03:41:00.740Z",
  "createdBy": "GroupCommentCrawlingLoader"
}



2. Task Hashtag Keyword

## Redis -> Hiện tại phần load keyword sẽ do bên app đảm nhận, nên không có vde gì chỗ này

KeywordPostNonCrisisCrawlingLoader
HashtagPostNonCrisisCrawlingLoader



## Name_sapce: 


crawler-th-staging
crawler-sg-staging
crawler-ph-staging
crawler-my-staging
crawler-id-staging



## Crawler Type


- Luồng mới

Loader: ynm-cl-fb-crawling-loader-service-th-staging
Crawler:
Hashtag: ynm-cl-fb-hashtag-post-non-crisis-service-th-staging
Keyword: ynm-cl-fb-keyword-post-non-crisis-service-th-staging



Loader: ynm-cl-fb-crawling-loader-service-sg-staging
Crawler:
Hashtag: ynm-cl-fb-hashtag-post-non-crisis-service-sg-staging
Keyword: ynm-cl-fb-keyword-post-non-crisis-service-sg-staging



Loader: ynm-cl-fb-crawling-loader-service-my-staging
Crawler:
Hashtag: ynm-cl-fb-hashtag-post-non-crisis-service-my-staging
Keyword: ynm-cl-fb-keyword-post-non-crisis-service-my-staging



Loader: ynm-cl-fb-crawling-loader-service-ph-staging
Crawler:
Hashtag: ynm-cl-fb-hashtag-post-non-crisis-service-ph-staging
Keyword: ynm-cl-fb-keyword-post-non-crisis-service-ph-staging


Loader: ynm-cl-fb-crawling-loader-service-ph-staging
Crawler:
Hashtag: ynm-cl-fb-hashtag-post-non-crisis-service-ph-staging
Keyword: ynm-cl-fb-keyword-post-non-crisis-service-ph-staging




// Luồng mới
ynm-cl-fb-keyword-post-non-crisis-service-id-staging: 
queue - staging_id.cl.fb.keyword_posts_non_crisis_crawl

ynm-cl-fb-hashtag-post-non-crisis-service-id-staging: 
staging_id.cl.fb.hashtag_posts_non_crisis_crawl


// Luồng cũ
crawler-fb-id-staging-crawl-post-by-keywords - 
queue: cl.fb.keyword_posts_crisis_no_token_crawling_sources

https://studio-staging.younetmedia.com/auth/login -> adđ keyword khi add dang để mặc định country là Vn vào db chình lại country theo quốc gia mình cần
https://pma.younetmedia.com/index.php?route=/sql&db=monitoring_keyword&table=last_crawlings&pos=0




// Message crawl



Mention:


 		{
          "id": "5dddcb9a-df82-59bf-af78-4842340dd9fb",
          "id_social": "25824403517178061",
          "id_source": "fb_1166273040084451",
          "link": "fb.com/1166273040084451_25824403517178061",
          "mention_type": 1,
          "source_type": 3,
          "identity": "fb_61550622952092",
          "identity_name": "UrbanNomad UnknownSoul",
          "attachment": "{\"type\":\"photo\",\"media_src\":\"https://scontent.xx.fbcdn.net/v/t39.30808-6/615163502_122294115104020765_6959828303758571713_n.jpg?stp=cp0_dst-jpg_e48_fr_q65_tt6&cstp=mx591x857&ctp=s591x857&_nc_cat=108&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=7mTunzJUHN8Q7kNvwH22EMy&_nc_oc=AdlvhrGF7p88cHAFHRsXxstR_RlLSGTB5INpzDPPgOYZi7AR-I4PqV9qx4ai02iHR8w&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=00_Afo7sFX451A0bxPfGKvPTDZFrCNBnE1uPWxge7W_GytlPw&oe=69689679\"}",
          "title": null,
          "id_reference": null,
          "id_parent_comment": null,
          "views": 0,
          "likes": 11,
          "comments": 3,
          "shares": 0,
          "engagement_total": 14,
          "engagement_s_c": 3,
          "link_shared": null,
          "mention_type_details": 1,
          "search_text": [
            "",
            "إِنَّا لِلَّٰهِ وَإِنَّا إِلَيْهِ رَاجِعُونَ. اللَّهُمَّ اغْفِرْلَهُ وَارْحَمْهُ وَعَافِهِ وَاعْفُ عَنْهُ\nDukacita dimaklumkan bahawa Mohammad shohaimi bin Mohamed Amin\ntelah meninggal dunia pada 10hb Januari 2026, pada jam 7:33 malam\ndi Hospital Besar Kuala Lumpur disebabkan sakit jantung.\nJenazah akan dibawa pulang ke rumah malam ini.\nAlamat rumah :\nNo. 12, Lorong Sungai Mulia 4, Kampung Sungai Mulia, Batu 5 Jalan Gombak\nJenazah akan dimandikan & disolatkan & dikebumikan pada esok pagi 11hb Januari 2026 :\nMasjid Zaid Bin Haritsah\nJalan Gombak Kuala Lumpur"
          ],
          "platform": 1,
          "domain": "facebook.com",
          "updated_at": "2026-01-10T21:30:15.249Z",
          "created_date": "2026-01-10T16:54:05.000Z",
          "shard": "20260110",
          "createdBy": "KeywordPostCrisisCrawlingLoader",
          "language": -1,
          "country_code": "MY"
        }



            {
          "id": "4837bbae-e349-5dc1-ae28-658d24f4ccdc",
          "id_social": "1624904055343860",
          "id_source": "fb_1062108628290075",
          "link": "fb.com/1062108628290075_1624904055343860",
          "mention_type": 1,
          "source_type": 3,
          "identity": "fb_100052902941899",
          "identity_name": "Vhie Garut",
          "attachment": "{\"type\":\"album\",\"media_src\":\"https://scontent-sin6-2.xx.fbcdn.net/v/t39.30808-6/615335375_1469191514854266_7877629684579220540_n.jpg?stp=cp0_dst-jpg_e15_fr_q65_tt6&cstp=mx800x800&ctp=s800x800&_nc_cat=109&cb2=64d46a15-96f77184&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=ZG-Q06tYaL4Q7kNvwEKKEQJ&_nc_oc=AdmxsVh0b9HtnC2PTsBoqneheiz_mL7xwqefLBe7iBZJUfa9NZ-kJPP5Zy5V7_tgfMwP6nanitEtOjTAIPyHRb37&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent-sin6-2.xx&oh=00_Afqe2cOtRYlmvdESwLpaUsvvIwYdbZcJOoWJtB2E6s8f6g&oe=6968C6F7\"}",
          "title": null,
          "id_reference": null,
          "id_parent_comment": null,
          "views": 0,
          "likes": 0,
          "comments": 0,
          "shares": 0,
          "engagement_total": 0,
          "engagement_s_c": 0,
          "link_shared": null,
          "mention_type_details": 1,
          "search_text": [
            "",
            "Ready nobo\nLokasi garut 400\nLokasi singaparna 2000\nWa 082113961182"
          ],
          "platform": 1,
          "domain": "facebook.com",
          "updated_at": "2026-01-11T00:35:39.021Z",
          "created_date": "2026-01-11T00:30:57.000Z",
          "shard": "20260111",
          "createdBy": "KeywordPostCrisisCrawlingLoader",
          "language": -1,
          "country_code": "ID"
        }




 {
          "id": "12bace67-e02e-51e9-84b9-0dca7f8cce39",
          "id_social": "1793122451393953",
          "id_source": "fb_890769021629305",
          "link": "fb.com/890769021629305_1793122451393953",
          "mention_type": 1,
          "source_type": 3,
          "identity": "fb_999999999999999",
          "identity_name": "SocialHeat",
          "attachment": "{\"type\":\"status\"}",
          "title": null,
          "id_reference": null,
          "id_parent_comment": null,
          "views": 0,
          "likes": 1,
          "comments": 0,
          "shares": 0,
          "engagement_total": 1,
          "engagement_s_c": 0,
          "link_shared": null,
          "mention_type_details": 1,
          "search_text": [
            "",
            "Lf work bisan farm boy 20yrs old mayda experience hit pag mamanok. Pero bisa ano na work basta tuhay."
          ],
          "platform": 1,
          "domain": "facebook.com",
          "updated_at": "2026-01-10T21:49:47.692Z",
          "created_date": "2026-01-10T21:34:46.000Z",
          "shard": "20260110",
          "createdBy": "KeywordPostCrisisCrawlingLoader",
          "language": -1,
          "country_code": "PH"
        }



         {
          "id": "f7f3fb4f-f22c-54f6-ab45-74b888b7d24d",
          "id_social": "1543033080297729",
          "id_source": "fb_1494890621778642",
          "link": "fb.com/1494890621778642_1543033080297729",
          "mention_type": 1,
          "source_type": 3,
          "identity": "fb_840496502483138",
          "identity_name": "สล็อตเกมส์ V2",
          "attachment": "{\"type\":\"album\",\"media_src\":\"https://scontent.xx.fbcdn.net/v/t39.30808-6/614212821_122115148173087732_5408344304894518558_n.jpg?stp=cp0_dst-jpg_e48_fr_q65_tt6&cstp=mx1700x1080&ctp=s960x960&_nc_cat=103&ccb=1-7&_nc_sid=aa7b47&_nc_ohc=997Il9o3E1oQ7kNvwFSrJiZ&_nc_oc=Adlm9whrpVfAGACgMIbPhseg85qiAmG96LAkn_2z-cCYslAj5oYAk798CdCmjhA8iwA&_nc_ad=z-m&_nc_cid=0&_nc_zt=23&_nc_ht=scontent.xx&oh=00_AfoR-Y1tB3X9LyVuJcMbIVImpJZaW6-CWIb5DIJCou_OFQ&oe=69689A70\"}",
          "title": null,
          "id_reference": null,
          "id_parent_comment": null,
          "views": 0,
          "likes": 0,
          "comments": 6,
          "shares": 100,
          "engagement_total": 106,
          "engagement_s_c": 106,
          "link_shared": null,
          "mention_type_details": 1,
          "search_text": [
            "",
            "#สล็อตเกมส์ 👑 เว็บสล็อตออนไลน์ T O P 1 ระดับประเทศ ไม่ใช้บัญชีม้า\nสมัครกดลิ้งค์ 👉 https://shorturl.at/qLDmy\n🎮 สล็อตรวมทุกค่ายดัง เล่นมันส์ไม่หยุด สายปั่นต้องลอง #สล็อตเกมส์\n🔸 เล่นได้ทุกเกม ถอนได้จริง ไม่มีล็อกยูส ไม่มีเทิร์น\n🔸 รองรับทุกระบบ มือถือก็เล่นได้ ลื่นไหลไม่มีกระตุก\n👨‍💻 บริการมืออาชีพ ทีมงานสแตนด์บาย 24 ชั่วโมง ตอบไวสุดๆ\n☑ สล็อต ✅ สล็อตเกมส์ ☑ เว็บสล็อต ✅ เว็บตรง ☑ สล็อตเกมส์รับวอเลท\n🕊 ─•── ꧁ ✧XIAN69✧ ꧂──•─— 🕊"
          ],
          "platform": 1,
          "domain": "facebook.com",
          "updated_at": "2026-01-10T21:27:05.568Z",
          "created_date": "2026-01-10T21:19:25.000Z",
          "shard": "20260110",
          "createdBy": "KeywordPostCrisisCrawlingLoader",
          "country_code": "TH"
        }


// Luồng cũ


{
      "mentions": [
        {
          "id": "066d3eca-03ab-5089-af6e-230ec5869973",
          "link": "fb.com/61579970136373_122123026094999004",
          "domain": "facebook.com",
          "id_source": "fb_61579970136373",
          "id_reference": null,
          "id_parent_comment": null,
          "views": 0,
          "likes": 1,
          "comments": 0,
          "shares": 0,
          "rating_score": 0,
          "engagement_total": 1,
          "engagement_s_c": 0,
          "identity": "fb_61579970136373",
          "identity_name": "KA Beshy",
          "platform": 1,
          "mention_type": 1,
          "mention_type_details": 1,
          "title": null,
          "search_text": [
            "",
            "Ang apo Kong  best actor tatalonin pa Ang Lola kaBeshy sa actingan😂#actingchallenge \nGoodvibes##fbreels2026"
          ],
          "sound": [],
          "effect": [],
          "attachment": "{\"type\":\"video\"}",
          "link_shared": null,
          "link_shared_domain": null,
          "source_type": 1,
          "created_date": "2026-01-13T03:56:08.000Z",
          "updated_at": "2026-01-13T04:25:42.675Z",
          "shard": "20260113",
          "createdBy": "FacebookCrawlPostByKeywords",
          "country_code": "PH",
          "id_social": "122123026094999004",
          "language": -1
        }


