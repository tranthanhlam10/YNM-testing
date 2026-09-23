# Data Mapping Youtube Post Crawler - YNMPDP-6004

Ngày audit: 15/07/2026

Phạm vi: kiểm tra dữ liệu từ luồng `YoutubePostApiCrawlingLoader` sau khi gọi Youtube API, sau đó resolver map ra `posts`, `mentions`, `identities` theo wiki dev `[Youtube] [ynm-crawler] Crawl Post From Source`.

## 1. Nguồn dữ liệu

| Output | File | Shape |
|---|---|---|
| Crawled source | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_yt_posts_crawled_sources_2026-07-15T04-23-06-359Z.json` | Array 1 message, chứa `source` và `data.data.items[]` |
| API response | `Data_get_from_rabbitMQ_by_scripts/data_youtube_testing.json` | Object Youtube `playlistItemListResponse`, chứa `items[]` |
| Posts | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_posts_2_mongo_yt_posts_LamTT_2026-07-15T07-08-53-398Z.json` | Array 1 message, chứa `posts[]` |
| Mentions | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_mentions_2_solr_mentions_LamTT_2026-07-15T07-07-54-490Z.json` | Array 1 message, chứa `mentions[]` và `parent_posts[]` |
| Identities | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_identities_2_solr_identities_LamTT_2026-07-15T07-08-12-775Z.json` | Array 1 message, chứa `identities[]` |
| Wiki dev | `https://wiki.younetco.com/pages/viewpage.action?pageId=314573364` | Mapping table cho Mentions/Post |

## 2. Source dùng để audit

| Field | Value |
|---|---|
| `source.id` / `source.id_social` | `UC-7dULIvz5qLwSWLzdLQUZA` |
| `source.link` | `youtube.com/channel/UC-7dULIvz5qLwSWLzdLQUZA` |
| `source.platform` | `7` |
| `source.createdBy` | `YoutubePostApiCrawlingLoader` |
| `source.from_date` | `1751518232` = `2025-07-03T04:50:32.000Z` |
| `source.to_date` | `1783054232` = `2026-07-03T04:50:32.000Z` |
| `source.country_code` / `is_kol` / `category` / `priority` / `fullname` | Không có trong crawled source payload |

## 3. Rule từ wiki dev dùng để audit

### 3.1 Mentions

| Field | Expected mapping |
|---|---|
| `id` | `hashUuid('yt_' + videoId)` |
| `id_social` | `videoId` từ `contentDetails.videoId` hoặc `snippet.resourceId.videoId` |
| `link` | `https://www.youtube.com/watch?v={videoId}` |
| `platform` | `7` |
| `domain` | `youtube.com` |
| `id_source` / `identity` | `hashUuid('yt_channel_' + source.id)` |
| `identity_name` | `source.fullname` hoặc `item.snippet.channelTitle` hoặc `''` |
| `mention_type` | `MENTION_TYPE.POST` |
| `title` | `item.snippet.title` hoặc `''` |
| `search_text` | `[item.snippet.title, item.snippet.description]`, filter bỏ falsy |
| `attachment` | Thumbnail tốt nhất: `maxres > high > medium > default` |
| `created_date` | `item.snippet.publishedAt` convert ISO |
| `updated_at` | Crawl time |
| `country_code` / `is_kol` / `source_category` | Lấy từ `source` |
| `shard` | Derived từ `created_date` |
| `views` / `likes` / `comments` | Từ `videos.list.statistics` |
| `shares` | Luôn `0` |
| `engagement_total` | `views + likes + comments` |
| `engagement_s_c` | `comments` |

### 3.2 Posts

| Field | Expected mapping |
|---|---|
| `id` | `hashUuid('yt_' + videoId)` |
| `id_social` / `video_id` | `videoId` |
| `id_source` | `hashUuid('yt_channel_' + source.id)` |
| `title` | `item.snippet.title` hoặc `''` |
| `created_date` | `item.snippet.publishedAt` convert ISO |
| `crawled_date` | Crawl time |
| `last_status` | `0` |
| `is_kol` / `priority` | Lấy từ `source` |
| `likes` / `comments` / `views` | Từ `videos.list.statistics` |

## 4. Kết luận tổng quan

| Hạng mục | Kết luận |
|---|---|
| Crawled source vs API response | Pass. Payload trong `crawled_source.data.data` deep equal với `data_youtube_testing.json`: `etag`, `nextPageToken`, `pageInfo`, số lượng item, thứ tự `videoId` đều khớp. |
| Số lượng API items | Pass. API có 50 items, crawled source cũng có 50 items. |
| Số lượng item resolver output | Pass theo crawl window. Trong 50 items, có 9 video nằm trong `from_date` - `to_date`; output có đúng 9 posts và 9 mentions, không thiếu/không dư `videoId`. |
| Posts mapping core fields | Pass. `id_social`, `video_id`, `title`, `created_date`, `last_status` map đúng với API/crawled source. |
| Mentions mapping core fields | Pass. `id_social`, `link`, `platform`, `domain`, `identity_name`, `title`, `search_text`, `attachment`, `created_date`, `shares`, `engagement_total`, `engagement_s_c` map đúng theo dữ liệu hiện có. |
| Identities mapping | Pass basic. Output có 1 identity đúng `id_social` source, `platform=7`, `domain=youtube.com`, link channel được normalize sang `https://www.youtube.com/channel/{channelId}`. Wiki hiện không có mapping table riêng cho identities. |
| Statistics mapping | Need Confirm. File API/crawled source hiện chỉ có `playlistItems`, không thấy payload `videos.list.statistics`; vì vậy output `views/likes/comments` đều là `0`. Không đủ dữ liệu để xác nhận đúng/sai với wiki. |
| Source metadata mapping | Need Confirm/Potential Fail. Crawled source thiếu `country_code`, `is_kol`, `category`, `priority`, `fullname`; nên mentions thiếu `country_code/is_kol/source_category`, posts thiếu `is_kol/priority`. Wiki có define các field này lấy từ `source`. |

## 5. Crawled source vs API response

| Checkpoint | Kết quả |
|---|---|
| Deep equal giữa `crawled_source.data.data` và `data_youtube_testing.json` | Pass |
| `etag` | Pass |
| `nextPageToken` | Pass |
| `pageInfo` | Pass |
| Item count | Pass: `50/50` |
| First `videoId` | Pass: `RzANQVa-CVk` |
| Last `videoId` | Pass: `lZ245b7f2MI` |

Kết luận: crawler đã đưa đúng response API vào queue `cl.yt.posts_crawled_sources`.

## 6. Filter theo crawl window

Source có window:

| Field | Value |
|---|---|
| From | `2025-07-03T04:50:32.000Z` |
| To | `2026-07-03T04:50:32.000Z` |

Trong 50 items của API/crawled source, resolver output đúng 9 video nằm trong window này:

| # | `videoId` | `publishedAt` | Trong Posts | Trong Mentions |
|---|---|---|---|---|
| 1 | `RzANQVa-CVk` | `2026-06-09T15:57:39.000Z` | Có | Có |
| 2 | `bSfoWZhVWM4` | `2026-06-08T12:12:01.000Z` | Có | Có |
| 3 | `LlPkEnA3m28` | `2026-05-07T04:04:17.000Z` | Có | Có |
| 4 | `7KBMhTs67gk` | `2026-03-22T13:05:55.000Z` | Có | Có |
| 5 | `BvTpgp50x84` | `2026-03-10T16:30:45.000Z` | Có | Có |
| 6 | `_mOYJi8XluA` | `2026-03-08T11:23:08.000Z` | Có | Có |
| 7 | `iEAOLQEed6E` | `2026-02-24T11:04:15.000Z` | Có | Có |
| 8 | `MepFjb5XEVY` | `2026-02-13T10:52:05.000Z` | Có | Có |
| 9 | `Q9gsmlv772M` | `2025-07-12T12:09:58.000Z` | Có | Có |

## 7. Mapping chi tiết theo video

| `videoId` | Title | `created_date` expected | `search_text` length | Post | Mention | Check core fields |
|---|---|---|---:|---|---|---|
| RzANQVa-CVk | Trailer pokemon Adventure 4k 120fps ] Hoàng nopro | 2026-06-09T15:57:39.000Z | 2 | Pass | Pass | Post exists, Mention exists, post.title, post.created_date, last_status=0, mention.link, attachment, search_text |
| bSfoWZhVWM4 | Hoàng nopro \| mình sẽ cố gắng làm về minecraft | 2026-06-08T12:12:01.000Z | 2 | Pass | Pass | Post exists, Mention exists, post.title, post.created_date, last_status=0, mention.link, attachment, search_text |
| LlPkEnA3m28 | sinh tồn minecraft 1.21.132 tập 4 : hành trình mới tìm những thứ mới | 2026-05-07T04:04:17.000Z | 1 | Pass | Pass | Post exists, Mention exists, post.title, post.created_date, last_status=0, mention.link, attachment, search_text |
| 7KBMhTs67gk | 1 ngày xuống địa ngục bất ổn cùng hoàng #minecraft | 2026-03-22T13:05:55.000Z | 1 | Pass | Pass | Post exists, Mention exists, post.title, post.created_date, last_status=0, mention.link, attachment, search_text |
| BvTpgp50x84 | 1 ngày bất ổn sinh tồn minecraft hoàng và perden #minecraft | 2026-03-10T16:30:45.000Z | 1 | Pass | Pass | Post exists, Mention exists, post.title, post.created_date, last_status=0, mention.link, attachment, search_text |
| _mOYJi8XluA | sinh tồn minecraft 1.12.132 tập 3 : 1 ngày bất ổn Hoàng & Perden #minecraft | 2026-03-08T11:23:08.000Z | 1 | Pass | Pass | Post exists, Mention exists, post.title, post.created_date, last_status=0, mention.link, attachment, search_text |
| iEAOLQEed6E | sinh tồn minecraft 1.12.132 tập 2 : cùng hoàng xây nhà và khám phá khai thác địa ngục | 2026-02-24T11:04:15.000Z | 1 | Pass | Pass | Post exists, Mention exists, post.title, post.created_date, last_status=0, mention.link, attachment, search_text |
| MepFjb5XEVY | sinh tồn minecraft 1.21.132 tập 1 : ngày comback cùng hoàng | 2026-02-13T10:52:05.000Z | 1 | Pass | Pass | Post exists, Mention exists, post.title, post.created_date, last_status=0, mention.link, attachment, search_text |
| Q9gsmlv772M | Tâm sự clip minecraft sau 1 năm vắng bóng không ra video ? Lý do là gì ? Hoàng nopro | 2025-07-12T12:09:58.000Z | 2 | Pass | Pass | Post exists, Mention exists, post.title, post.created_date, last_status=0, mention.link, attachment, search_text |

## 8. Mapping Posts

| Field | Kết quả audit | Kết luận |
|---|---|---|
| `id` | Cùng giá trị với mention id theo từng `videoId`. Không tự tính lại được `hashUuid`, nhưng consistency giữa post/mention pass. | Pass basic |
| `id_social` / `video_id` | Khớp `contentDetails.videoId` của 9 expected items. | Pass |
| `id_source` | Cùng giá trị với mention `id_source/identity`. Không tự tính lại được `hashUuid('yt_channel_' + source.id)`, nhưng consistency pass. | Pass basic |
| `title` | Khớp `item.snippet.title`. | Pass |
| `created_date` | Khớp `item.snippet.publishedAt` convert ISO. | Pass |
| `crawled_date` | Có giá trị crawl time `2026-07-15T07:06:20.xxxZ`. | Pass |
| `last_status` | Tất cả bằng `0`. | Pass |
| `likes` / `comments` / `views` | Tất cả bằng `0`. Không có data `videos.list.statistics` trong input để đối chiếu. | Need Confirm |
| `is_kol` / `priority` | Không xuất hiện trong output posts vì source payload không có 2 field này. Wiki có define lấy từ source. | Need Confirm/Potential Fail |

## 9. Mapping Mentions

| Field | Kết quả audit | Kết luận |
|---|---|---|
| `id` | Cùng giá trị với post id theo từng `videoId`. Không tự tính lại được `hashUuid`, nhưng consistency pass. | Pass basic |
| `id_social` | Khớp `contentDetails.videoId`. | Pass |
| `link` | Đúng format `https://www.youtube.com/watch?v={videoId}`. | Pass |
| `platform` | Tất cả bằng `7`. | Pass |
| `domain` | Tất cả bằng `youtube.com`. | Pass |
| `id_source` / `identity` | Hai field bằng nhau và khớp với post `id_source`. | Pass basic |
| `identity_name` | Source không có `fullname`, output fallback đúng sang `item.snippet.channelTitle = Hoàng nopro`. | Pass |
| `mention_type` | Tất cả bằng `1`, tương ứng `MENTION_TYPE.POST`. | Pass |
| `title` | Khớp `item.snippet.title`. | Pass |
| `search_text` | Đúng rule `[title, description]` và filter bỏ falsy. Những video không có description chỉ còn 1 phần tử. | Pass |
| `attachment` | Đúng thumbnail tốt nhất theo thứ tự `maxres > high > medium > default`. | Pass |
| `created_date` | Khớp `item.snippet.publishedAt` convert ISO. | Pass |
| `updated_at` | Có giá trị crawl time `2026-07-15T07:06:20.xxxZ`. | Pass |
| `shard` | Derived đúng từ `created_date`, ví dụ `2026-06-09` -> `20260609`. | Pass |
| `shares` | Tất cả bằng `0`. | Pass |
| `engagement_total` | Tất cả bằng `0`, bằng `views + likes + comments` trong output hiện tại. | Pass theo output hiện tại |
| `engagement_s_c` | Tất cả bằng `0`, bằng `comments` trong output hiện tại. | Pass theo output hiện tại |
| `views` / `likes` / `comments` | Tất cả bằng `0`. Không có data `videos.list.statistics` trong input để đối chiếu. | Need Confirm |
| `country_code` / `is_kol` / `source_category` | Không xuất hiện trong output mentions vì source payload thiếu `country_code/is_kol/category`. Wiki có define lấy từ source. | Need Confirm/Potential Fail |

## 10. Mapping Identities

| Field | Expected từ source | Actual | Kết luận |
|---|---|---|---|
| `id_social` | `UC-7dULIvz5qLwSWLzdLQUZA` | `UC-7dULIvz5qLwSWLzdLQUZA` | Pass |
| `platform` | `7` | `7` | Pass |
| `link` | Channel link từ source, normalize full URL | `https://www.youtube.com/channel/UC-7dULIvz5qLwSWLzdLQUZA` | Pass |
| `domain` | `youtube.com` | `youtube.com` | Pass |
| `last_status` | Source finished/released thành `0` | `0` | Pass |

Note: wiki hiện chỉ define mapping table cho `Mentions` và `Post`, chưa có mapping table riêng cho identities. Vì vậy phần identities chỉ audit theo source và output thực tế.

## 11. Issue / Need Confirm

| ID | Mô tả | Mức độ | Gợi ý xử lý |
|---|---|---|---|
| NC-1 | Source payload trong crawled source thiếu `country_code`, `is_kol`, `category`, `priority`, `fullname`. Wiki define mentions cần `country_code/is_kol/source_category`, post cần `is_kol/priority`. Output hiện tại cũng thiếu các field này. | Medium | Confirm lại vì sao loader/builder/crawler không giữ các field này từ identity. Nếu source gốc có data nhưng bị drop trên queue thì nên log bug mapping/source propagation. |
| NC-2 | Không có response `videos.list.statistics` trong file API hoặc crawled source. Output `views/likes/comments` đang là `0`, nên chưa verify được đúng mapping từ statistics như wiki. | Medium | Cần thêm dump response `videos.list` hoặc log resolver để xác nhận crawler có gọi statistics API hay không. Nếu không gọi, đây là gap so với wiki. |
| NC-3 | `nextPageToken` tồn tại trong API/crawled source nhưng không có file queue `posts_crawling_sources_next_pages` trong bộ data input để audit next page. | Low/Medium | Nếu scope test bao gồm next-page flow, cần dump thêm queue next page để verify resolver push next page đúng routing key. |
| NC-4 | Không tự tính lại được `hashUuid('yt_' + videoId)` và `hashUuid('yt_channel_' + source.id)` do chưa có implementation/helper hashUuid trong input audit. | Low | Hiện chỉ verify consistency `post.id = mention.id` và `post.id_source = mention.id_source = mention.identity`. Nếu cần strict, chạy helper hashUuid từ codebase/dev service. |

## 12. Kết luận cuối

Core mapping của batch hiện tại đạt:

- Crawled source đã chứa đúng response API: 50/50 items, deep equal với file API.
- Resolver lọc đúng 9 videos nằm trong crawl window.
- 9/9 posts và 9/9 mentions khớp `videoId`, `title`, `created_date`, `link`, `search_text`, `attachment`, `last_status`.
- Identity source được release/output đúng basic fields.

Các điểm cần confirm trước khi chốt pass hoàn toàn theo wiki:

- Source metadata `country_code/is_kol/category/priority` đang bị thiếu trên payload nên output thiếu các field tương ứng.
- Chưa có dữ liệu `videos.list.statistics`, nên chưa xác nhận được mapping `views/likes/comments` thật sự theo wiki.
- Chưa có dump next-page queue dù API có `nextPageToken`.
