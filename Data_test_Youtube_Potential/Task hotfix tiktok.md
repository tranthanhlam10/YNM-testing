# Task hotfix tiktok



## Vấn đề

Hiện tại Tiktok change API nhờ team test lại luồng posts by source.

Deployment: hotfixes-tiktok-posts-mapping-response-staging-crawler-empty-container



## Cách chạy
kubectl config use-context lamtt-k8s-ovh

kubectl get pods -n crawler-staging | grep hotfixes-tiktok-posts-mapping-response-staging
kubectl exec -it hotfixes-tiktok-posts-mapping-response-staging-crawler-emppsqmd -n crawler-staging -- sh

RUN: CRAWLING_PATTERN_MANAGER_PATH=/app/node_modules/@ynm/pattern-manager TT_API_ENDPOINT=http://graph-tiktok.crawler-staging:5002 node scripts/tiktok/get_latest_user_posts.js


## Scope test (Theo dev confirm)
Scope:

Format Tiktok Posts và Mentions

Next_Page

Không đổi logic


## Scope test (Xác định theo QC và bussiness của task)

1. Run script có lấy được post không -> DONE
2. Check lại data có đúng không bao gồm ở collection tiktok_post và mentions -> DONE 
3. Khi crawl có bị stuck gì không -> Không
4. Crawl post lấy từ khi nào -> Case này check lại sau 
5. Thử lại những source private và bị không tồn tại -> Hiện tại chưa check được
6. Source crawl qua 1 lần rồi thì load lên post sẽ được lấy từ thời gian nào -> Hiện tại chưa check được
7. Check lại chổ lấy next_page. -> Hiện tại check chưa kịp 



## Check list


Cần phải test:
Mentions, tiktok_posts có lưu đúng value của records tiktok sau khi fix hay không


Mentions
{
        "id":"40c5fd5a-384f-5080-b265-9f4d3c57ff68",
        "link":"tiktok.com/@MS4wLjABAAAAy4raCvGsRpvv6uG62TzLOw_meJylr_kCYIBwZA8b2pM/video/7529552897634307336", -> Đúng
        "id_source":"tt_MS4wLjABAAAAy4raCvGsRpvv6uG62TzLOw_meJylr_kCYIBwZA8b2pM", -> Đúng
        "views":810, -> Đúng
        "likes":30, -> Đúng
        "comments":2, -> Đúng 
        "shares":0, -> Cần confirm lại là có lấy được số share hay không
        "rating_score":0,
        "engagement_total":32,
        "engagement_s_c":2,
        "identity":"tt_MS4wLjABAAAAy4raCvGsRpvv6uG62TzLOw_meJylr_kCYIBwZA8b2pM", -> Đúng
        "identity_name":"Fangkow  ♡💫🫧🪞 🧿", -> Đúng 
        "mention_type":1,
        "search_text":["",
          "แม่ก็อยากขายของ ลูกก็อยากช่วย"], -> Search Text của Tiktok chỉ có phần tử thứ 2
        "sound":["7529552925090122512 เสียงต้นฉบับ - Fangkow  ♡💫🫧🪞 🧿"], -> Đúng
        "attachment":"{\"media_src\":\"https://p16-sign-sg.tiktokcdn.com/tos-alisg-p-0037/ow7fAITQGwHALFWjAIeHAyCAkLk3VhGRmfwG4e~tplv-tiktokx-origin.image?dr=14575&x-expires=1754118000&x-signature=cx%2FbN6XqWYQB7%2BhF3l9IZ6P4F1Q%3D&t=4d5b0474&ps=13740610&shp=81f88b70&shcp=43f4a2f9&idc=maliva\",\"type\":\"video\"}", -> Attachment cũng lấy đúng ảnh thumbnail của video
        "id_social":7529552897634307336, (Chỗ này chính là id bài Post) -> Đúng 
        "is_to_topic":false,
        "domain":"tiktok.com",
        "mention_type_details":1,
        "platform":9,
        "updated_at":"2025-07-31T07:31:21.103Z",
        "created_date":"2025-07-21T15:10:51Z" -> Hiện tại ngày cũng đã chính xác 
        } 



Tiktok Post
{
        "id":"40c5fd5a-384f-5080-b265-9f4d3c57ff68",
        "title":"แม่ก็อยากขายของ",
        "link":"tiktok.com/@MS4wLjABAAAAy4raCvGsRpvv6uG62TzLOw_meJylr_kCYIBwZA8b2pM/video/7529552897634307336",
        "_version_":1839146814429724672,
        "sound":["7529552925090122512 เสียงต้นฉบับ - Fangkow  ♡💫🫧🪞 🧿"],
        "crawled_date":"2025-07-31T07:31:21.022Z",
        "priority":10,
        "id_social":"7529552897634307336",
        "next_crawl_time":"2025-07-31T07:46:21.022Z",
        "id_source":"tt_MS4wLjABAAAAy4raCvGsRpvv6uG62TzLOw_meJylr_kCYIBwZA8b2pM",
        "created_date":"2025-07-21T15:10:51Z"}

  {
        "id":"40c5fd5a-384f-5080-b265-9f4d3c57ff68",
        "title":"แม่ก็อยากขายของ",
        "link":"tiktok.com/@MS4wLjABAAAAy4raCvGsRpvv6uG62TzLOw_meJylr_kCYIBwZA8b2pM/video/7529552897634307336",
        "_version_":1839146814429724672,
        "sound":["7529552925090122512 เสียงต้นฉบับ - Fangkow  ♡💫🫧🪞 🧿"],
        "crawled_date":"2025-07-31T07:31:21.022Z",
        "priority":10,
        "id_social":"7529552897634307336",
        "next_crawl_time":"2025-07-31T07:46:21.022Z",
        "id_source":"tt_MS4wLjABAAAAy4raCvGsRpvv6uG62TzLOw_meJylr_kCYIBwZA8b2pM",
        "created_date":"2025-07-21T15:10:51Z"}




Chỗ này so với những source cũ đang thiếu các field engagaments
{
        "id":"f6b7f301-1824-553f-a8f9-e9089dd4fd26",
        "link":"tiktok.com/@MS4wLjABAAAAb4W_sTRVqX_MKTwprwbtVXHOTsAesGylAThTNFqWv1l2-AqznpNQruem_wjJc092/video/7514892583550668074",
        "title":"",
        "_version_":1835146012305391616,
        "sound":["7513417893539973889 Bắt beat nào"],
        "shares":6366,
        "crawled_date":"2025-06-17T03:40:17.659Z",
        "views":722412,
        "likes":88503,
        "comments":1058,
        "last_status":0,
        "id_social":"7514892583550668074",
        "next_crawl_time":"2025-06-17T03:55:18.719Z",
        "effect":["360986045 lắc đầu 4.0"],
        "id_source":"tt_MS4wLjABAAAAb4W_sTRVqX_MKTwprwbtVXHOTsAesGylAThTNFqWv1l2-AqznpNQruem_wjJc092",
        "created_date":"2025-06-12T03:01:48Z"}


Identity  -> Confirm lại với anh Tân xem có -> Hiện tại không có cập nhật

    {
        "id":"tt_MS4wLjABAAAAb4W_sTRVqX_MKTwprwbtVXHOTsAesGylAThTNFqWv1l2-AqznpNQruem_wjJc092",
        "reply_next_crawl_time":"2025-07-07T05:59:36.574Z",
        "next_crawl_time":"2025-07-07T05:59:36.574Z",
        "domain":"tiktok.com",
        "platform":9,
        "updated_at":"2025-07-07T05:44:36.574Z",
        "id_social":"MS4wLjABAAAAb4W_sTRVqX_MKTwprwbtVXHOTsAesGylAThTNFqWv1l2-AqznpNQruem_wjJc092",
        "fullname":"Chuỗi của Sann 😈",
        "created_date":"2025-07-07T05:44:35.759Z",
        "repost_next_crawl_time":"2025-07-07T05:59:36.574Z"
        }


   {
        "id":"tt_MS4wLjABAAAAy4raCvGsRpvv6uG62TzLOw_meJylr_kCYIBwZA8b2pM",
        "language":1,
        "reply_next_crawl_time":"2025-07-31T07:46:22.499Z",
        "priority":10,
        "next_crawl_time":"2025-06-31T12:31:22.462Z",
        "domain":"tiktok.com",
        "tt_user_id":"77799202108",
        "link":"tiktok.com/@MS4wLjABAAAAy4raCvGsRpvv6uG62TzLOw_meJylr_kCYIBwZA8b2pM",
        "platform":9,
        "updated_at":"2024-12-09T20:50:05.224Z",
        "post_last_date":"2025-07-01T15:10:51Z",
        "last_status":0,
        "id_social":"MS4wLjABAAAAy4raCvGsRpvv6uG62TzLOw_meJylr_kCYIBwZA8b2pM",
        "post_updated_at":1753947082,
        "fullname":"Fangkow  ♡💫🫧🪞",
        "created_date":"2024-12-09T20:50:05.170Z",
        "repost_next_crawl_time":"2025-07-31T07:46:22.499Z"},
      {
        "avatar":"https://p16-sign-sg.tiktokcdn.com/tos-alisg-avt-0068/e9d5d10a676e27b775a0f10db5f213a9~tplv-tiktokx-cropcenter:100:100.jpeg?dr=14579&refresh_token=2c320885&x-expires=1754121600&x-signature=csTN%2FEY37p%2FV1C5kW%2BQHQTva9AY%3D&t=4d5b0474&ps=13740610&shp=a5d48078&shcp=81f88b70&idc=maliva",
        "id":"tt_MS4wLjABAAAAsGWvj88af0HqtdX_ZHNEax38kRitirMv1swvEeMPe0qo18szI3ySfgW1kEr6AeXd",
        "language":1,
        "reply_next_crawl_time":"2025-07-31T08:37:56.781Z",
        "next_crawl_time":"2025-07-31T08:37:56.781Z",
        "domain":"tiktok.com",
        "link":"tiktok.com/@emikashiiuu",
        "platform":9,
        "updated_at":"2025-07-31T08:22:56.781Z",
        "id_social":"MS4wLjABAAAAsGWvj88af0HqtdX_ZHNEax38kRitirMv1swvEeMPe0qo18szI3ySfgW1kEr6AeXd",
        "fullname":"ྀིᴇιмι 𐙚",
        "created_date":"2025-07-31T08:22:55.928Z",
        "repost_next_crawl_time":"2025-07-31T08:37:56.781Z"
        }

Xem thử post có crawl đủ bài hay không (Nếu crawl 1 source thì crawl đến ngày mấy)




Compare output với luồng chạy trên support tool






### Câu query ở solr

id link platform domain shard id_social id_source id_reference id_parent_comment identity identity_name mention_type mention_type_details source_type source_category post_format views likes comments shares haha sad angry wow heart reaction rating_score engagement_total engagement_s_c title search_text search_text_exactly sound sound_exactly effect effect_exactly attachment link_shared link_shared_id link_shared_domain created_date updated_at is_noisy id_seeder is_admin_creator is_to_topic closed_group is_kol language


shards=20250101,20250102,20250103,20250104,20250105,20250106,20250107,20250108,20250109,20250110,20250111,20250112,20250113,20250114,20250115,20250116,20250117,20250118,20250119,20250120,20250121,20250122,20250123,20250124,20250125,20250126,20250127,20250128,20250129,20250130,20250131,20250201,20250202,20250203,20250204,20250205,20250206,20250207,20250208,20250209,20250210,20250211,20250212,20250213,20250214,20250215,20250216,20250217,20250218,20250219,20250220,20250221,20250222,20250223,20250224,20250225,20250226,20250227,20250228,20250301,20250302,20250303,20250304,20250305,20250306,20250307,20250308,20250309,20250310,20250311,20250312,20250313,20250314,20250315,20250316,20250317,20250318,20250319,20250320,20250321,20250322,20250323,20250324,20250325,20250326,20250327,20250328,20250329,20250330,20250331,20250401,20250402,20250403,20250404,20250405,20250406,20250407,20250408,20250409,20250410,20250411,20250412,20250413,20250414,20250415,20250416,20250417,20250418,20250419,20250420,20250421,20250422,20250423,20250424,20250425,20250426,20250427,20250428,20250429,20250430,20250501,20250502,20250503,20250504,20250505,20250506,20250507,20250508,20250509,20250510,20250511,20250512,20250513,20250514,20250515,20250516,20250517,20250518,20250519,20250520,20250521,20250522,20250523,20250524,20250525,20250526,20250527,20250528,20250529,20250530,20250531,20250601,20250602,20250603,20250604,20250605,20250606,20250607,20250608,20250609,20250610,20250611,20250612,20250613,20250614,20250615,20250616,20250617,20250618,20250619,20250620,20250621,20250622,20250623,20250624,20250625,20250626,20250627,20250628,20250629,20250630,20250701,20250702,20250703,20250704,20250705,20250706,20250707,20250708,20250709,20250710,20250711,20250712,20250713,20250714,20250715,20250716,20250717,20250718,20250719,20250720,20250721,20250722,20250723,20250724,20250725,20250726,20250727,20250728,20250729,20250730,20250731



<delete>
<query>
shard:20250101,20250102,20250103,20250104,20250105,20250106,20250107,20250108,20250109,20250110,20250111,20250112,20250113,20250114,20250115,20250116,20250117,20250118,20250119,20250120,20250121,20250122,20250123,20250124,20250125,20250126,20250127,20250128,20250129,20250130,20250131,20250201,20250202,20250203,20250204,20250205,20250206,20250207,20250208,20250209,20250210,20250211,20250212,20250213,20250214,20250215,20250216,20250217,20250218,20250219,20250220,20250221,20250222,20250223,20250224,20250225,20250226,20250227,20250228,20250301,20250302,20250303,20250304,20250305,20250306,20250307,20250308,20250309,20250310,20250311,20250312,20250313,20250314,20250315,20250316,20250317,20250318,20250319,20250320,20250321,20250322,20250323,20250324,20250325,20250326,20250327,20250328,20250329,20250330,20250331,20250401,20250402,20250403,20250404,20250405,20250406,20250407,20250408,20250409,20250410,20250411,20250412,20250413,20250414,20250415,20250416,20250417,20250418,20250419,20250420,20250421,20250422,20250423,20250424,20250425,20250426,20250427,20250428,20250429,20250430,20250501,20250502,20250503,20250504,20250505,20250506,20250507,20250508,20250509,20250510,20250511,20250512,20250513,20250514,20250515,20250516,20250517,20250518,20250519,20250520,20250521,20250522,20250523,20250524,20250525,20250526,20250527,20250528,20250529,20250530,20250531,20250601,20250602,20250603,20250604,20250605,20250606,20250607,20250608,20250609,20250610,20250611,20250612,20250613,20250614,20250615,20250616,20250617,20250618,20250619,20250620,20250621,20250622,20250623,20250624,20250625,20250626,20250627,20250628,20250629,20250630,20250701,20250702,20250703,20250704,20250705,20250706,20250707,20250708,20250709,20250710,20250711,20250712,20250713,20250714,20250715,20250716,20250717,20250718,20250719,20250720,20250721,20250722,20250723,20250724,20250725,20250726,20250727,20250728,20250729,20250730,20250731
</query>
<query>
identity: tt_MS4wLjABAAAAy4raCvGsRpvv6uG62TzLOw_meJylr_kCYIBwZA8b2pM
</query>
</delete>




