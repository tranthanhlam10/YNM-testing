# X Special Content Mapping Summary

Ngày audit: 02/07/2026

Phạm vi: kiểm tra mapping cho 3 dạng special content của X trong luồng `XPostFromReplyCrawlingLoader`:

- Article
- Audio Space
- Broadcast/Livestream

Trong đó:

- Mục 1-9: audit **Mention mapping**.
- Mục 10-14: bổ sung audit **Posts**, **Replies**, **Identities** theo 3 file output tải thêm ngày 02/07/2026.
- Không audit `parent_posts` và detect country payload trong file này.

## 1. Nguồn dữ liệu

| Dạng | Raw API | Mention output dùng đối chiếu |
|---|---|---|
| Article | `Data_get_from_rabbitMQ_by_scripts/raw_data_api_article_2.json` | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_mentions_2_solr_mentions_LamTT_2_2026-07-01T07-22-19-153Z.json` |
| Audio Space | `Data_get_from_rabbitMQ_by_scripts/raw_data_api_audio_space.json` | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_x_identity_countries_crawling_sources_2026-06-30T09-51-44-473Z.json` và payload crawl mới đã paste |
| Broadcast/Livestream | `Data_get_from_rabbitMQ_by_scripts/raw_data_api_livestream_x.json` | Payload crawl mới đã paste ngày 02/07/2026 |

Resolved output bổ sung:

| Output | File | Shape thực tế |
|---|---|---|
| Posts | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_posts_2_mongo_x_posts_LamTT_2026-07-02T04-14-48-311Z.json` | Array message, mỗi message chứa `posts[]` |
| Replies | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_replies_2_mongo_x_replies_LamTT_2026-07-02T04-15-14-013Z.json` | Array message, mỗi message chứa `comments[]` |
| Identities | `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_identities_2_redis_identities_LamTT_2026-07-02T04-15-35-629Z.json` | Array message, mỗi message chứa `identities[]` |

Requirement tham chiếu:

- `Ai_Agents/test_plans/local/x_special_cases_article_space_broadcast/TestPlan_YNMSHGYSG-829_X_Special_Cases_Article_Space_Broadcast.md`
- BA rule: Article, Audio Space, Broadcast là special content, expected `mention_type=3`, `mention_type_details=3`, có `link_shared` và metadata trong `search_text`.

## 2. Kết luận tổng quan

| Dạng | Sample `id_social` | Kết luận Mention mapping |
|---|---|---|
| Article | `2030872456807023091` | Pass core mapping. Need Confirm nhẹ cho `search_text[1]` vì output dùng expanded URL thay vì raw `t.co`. |
| Audio Space | `2071178103603228743` | Pass core mapping. Need Confirm nhẹ cho `search_text[1]` vì output dùng expanded URL thay vì raw `t.co`. |
| Broadcast/Livestream | `2072513016755830907` | Pass core mapping. Need Confirm nhẹ cho `search_text[1]` nếu BA bắt raw `legacy.full_text`. |

Các field core đều đã đạt:

- `mention_type=3`
- `mention_type_details=3`
- `link_shared` trỏ đúng link special object
- `attachment.type` đúng theo từng dạng
- `search_text[2]` có metadata đặc thù
- engagement mapping đúng theo công thức chung

## 3. Rule mapping chung cho Mention

| Mention field | Expected mapping |
|---|---|
| `id` | UUID mention nội bộ, build theo canonical logic của resolver |
| `link` | Link của post/status chứa special content: `x.com/<author_id>/status/<tweet_id>` |
| `platform` | `11` |
| `domain` | `x.com` |
| `shard` | `YYYYMMDD` từ `created_date` |
| `id_social` | Tweet/status id của post chứa special content |
| `id_source` | Source/community/user id theo input source của luồng crawl |
| `identity` | `x_<author_id>` của người đăng post/status |
| `identity_name` | Tên user đăng post/status |
| `mention_type` | `3` cho Article, Audio Space, Broadcast direct special content |
| `mention_type_details` | `3` cho Article, Audio Space, Broadcast direct special content |
| `source_type` | Theo source thực tế của luồng crawl |
| `reaction` | Bằng `likes` |
| `likes` | Raw `favorite_count` |
| `comments` | Raw `reply_count` |
| `shares` | Raw `retweet_count + quote_count` |
| `engage_repost` | Raw `retweet_count` |
| `engage_quote` | Raw `quote_count` |
| `engage_bookmark` | Raw `bookmark_count` |
| `engagement_total` | `likes + comments + shares` |
| `engagement_s_c` | `comments + shares` |
| `created_date` | Raw `legacy.created_at`, convert sang ISO UTC |
| `createdBy` | `XPostFromReplyCrawlingLoader` |

## 4. Article Mention

### 4.1 Sample

| Field | Value |
|---|---|
| Post/status id | `2030872456807023091` |
| Article id | `2030871214206689280` |
| Post link | `x.com/834671629426794496/status/2030872456807023091` |
| Article link | `x.com/i/article/2030871214206689280` |
| Author | `afreegull2008` |

### 4.2 Raw signals

| Raw field | Value |
|---|---|
| `legacy.full_text` | `https://t.co/JzDkKnmvyS` |
| `legacy.entities.urls[0].expanded_url` | `http://x.com/i/article/2030871214206689280` |
| `article_results.result.rest_id` | `2030871214206689280` |
| `article_results.result.title` | `Rare Sats Topology` |
| `article_results.result.content_state.blocks` | Full article body |

### 4.3 Mention mapping

| Mention field | Actual | Status |
|---|---|---|
| `id_social` | `2030872456807023091` | Pass |
| `link` | `x.com/834671629426794496/status/2030872456807023091` | Pass |
| `id_source` | `x_834671629426794496` | Pass |
| `identity` | `x_834671629426794496` | Pass |
| `identity_name` | `afreegull2008` | Pass |
| `mention_type` | `3` | Pass |
| `mention_type_details` | `3` | Pass |
| `attachment` | `{"type":"article","href":"https://x.com/i/article/2030871214206689280"}` | Pass |
| `link_shared` | `x.com/i/article/2030871214206689280` | Pass |
| `link_shared_domain` | `x.com` | Pass |
| `search_text[0]` | `""` | Pass theo bảng BA hiện tại |
| `search_text[1]` | `http://x.com/i/article/2030871214206689280` | Need Confirm: output dùng expanded URL, raw `legacy.full_text` là `https://t.co/JzDkKnmvyS` |
| `search_text[2].ynm_name` | `afreegull2008` | Pass |
| `search_text[2].ynm_des` | Full article content từ `article_results` | Pass |
| `search_text[2].ynm_link` | `x.com/i/article/2030871214206689280` | Pass |
| Engagement | `likes=2`, `comments=1`, `shares=3`, `engage_repost=2`, `engage_quote=1` | Pass. `views` có thể thay đổi realtime theo thời điểm crawl. |

## 5. Audio Space Mention

### 5.1 Sample

| Field | Value |
|---|---|
| Post/status id | `2071178103603228743` |
| Space id | `1nKOLLOvvkWGR` |
| Post link | `x.com/1581256352072081409/status/2071178103603228743` |
| Space link | `x.com/i/spaces/1nKOLLOvvkWGR` |
| Author | `Kop Overlord` |

### 5.2 Raw signals

| Raw field | Value |
|---|---|
| `legacy.full_text` | `https://t.co/oFMEk0WvvG` |
| `legacy.entities.urls[0].expanded_url` | `https://x.com/i/spaces/1nKOLLOvvkWGR` |
| `card.legacy.name` | `3691233323:audiospace` |
| `card.legacy.binding_values.id` | `1nKOLLOvvkWGR` |

### 5.3 Mention mapping

| Mention field | Actual | Status |
|---|---|---|
| `id_social` | `2071178103603228743` | Pass |
| `link` | `x.com/1581256352072081409/status/2071178103603228743` | Pass |
| `id_source` | `x_1911330190183026989` | Pass, source/community id từ raw `community_results.result.id_str` |
| `identity` | `x_1581256352072081409` | Pass |
| `identity_name` | `Kop Overlord` | Pass |
| `mention_type` | `3` | Pass |
| `mention_type_details` | `3` | Pass |
| `attachment` | `{"type":"audio","href":"https://x.com/i/spaces/1nKOLLOvvkWGR"}` | Pass |
| `link_shared` | `x.com/i/spaces/1nKOLLOvvkWGR` | Pass |
| `link_shared_domain` | `x.com` | Pass |
| `search_text[0]` | `""` | Pass |
| `search_text[1]` | `https://x.com/i/spaces/1nKOLLOvvkWGR` | Need Confirm: output dùng expanded URL, raw `legacy.full_text` là `https://t.co/oFMEk0WvvG` |
| `search_text[2].ynm_name` | `Kop Overlord` | Pass |
| `search_text[2].ynm_link` | `x.com/i/spaces/1nKOLLOvvkWGR` | Pass |
| Engagement | `likes=5`, `comments=15`, `shares=2`, `engage_repost=2`, `engage_quote=0`, `engage_bookmark=1` trong payload crawl mới | Pass. Counter ở file cũ có thể lệch do crawl khác thời điểm. |

## 6. Broadcast/Livestream Mention

### 6.1 Sample

| Field | Value |
|---|---|
| Post/status id | `2072513016755830907` |
| Broadcast id | `1OGwbbqLeevKB` |
| Post link | `x.com/1504158728089911296/status/2072513016755830907` |
| Broadcast link | `x.com/i/broadcasts/1OGwbbqLeevKB` |
| Author/Broadcaster | `Thanh Ocean` |

### 6.2 Raw signals

| Raw field | Value |
|---|---|
| `legacy.full_text` | `Hello https://t.co/oapb0GXDq1` |
| `legacy.entities.urls[0].expanded_url` | `https://x.com/i/broadcasts/1OGwbbqLeevKB` |
| `card.legacy.name` | `745291183405076480:broadcast` |
| `card.legacy.binding_values.broadcast_id` | `1OGwbbqLeevKB` |
| `card.legacy.binding_values.broadcast_title` | `Hello` |
| `card.legacy.binding_values.broadcast_state` | `ENDED` |
| `card.legacy.binding_values.broadcaster_display_name` | `Thanh Ocean` |

### 6.3 Mention mapping

| Mention field | Actual | Status |
|---|---|---|
| `id_social` | `2072513016755830907` | Pass |
| `link` | `x.com/1504158728089911296/status/2072513016755830907` | Pass |
| `id_source` | `x_1504158728089911296` | Pass |
| `identity` | `x_1504158728089911296` | Pass |
| `identity_name` | `Thanh Ocean` | Pass |
| `mention_type` | `3` | Pass |
| `mention_type_details` | `3` | Pass |
| `attachment` | `{"type":"broadcast","href":"https://x.com/i/broadcasts/1OGwbbqLeevKB"}` | Pass |
| `link_shared` | `x.com/i/broadcasts/1OGwbbqLeevKB` | Pass |
| `link_shared_domain` | `x.com` | Pass |
| `search_text[0]` | `""` | Pass |
| `search_text[1]` | `Hello https://x.com/i/broadcasts/1OGwbbqLeevKB` | Need Confirm: output dùng expanded URL, raw `legacy.full_text` là `Hello https://t.co/oapb0GXDq1` |
| `search_text[2].ynm_des` | `Hello` | Pass, lấy từ `broadcast_title` |
| `search_text[2].ynm_name` | `Thanh Ocean` | Pass |
| `search_text[2].ynm_link` | `x.com/i/broadcasts/1OGwbbqLeevKB` | Pass |
| Engagement | `views=16`, `likes=0`, `comments=7`, `shares=0`, `engagement_total=7`, `engagement_s_c=7` | Pass |

## 7. Actual Mention Payloads

Các payload bên dưới là mention thực tế dùng để đối chiếu mapping. Riêng `search_text[2].ynm_des` của Article được rút gọn trong tài liệu vì nội dung full article dài khoảng 13k ký tự; phần full content đã được verify ở mục Article mapping.

### 7.1 Article Mention

```json
{
  "id": "45eb8c2f-edf7-560d-9876-dbabf3776559",
  "link": "x.com/834671629426794496/status/2030872456807023091",
  "platform": 11,
  "domain": "x.com",
  "shard": "20260309",
  "id_social": "2030872456807023091",
  "id_source": "x_834671629426794496",
  "identity": "x_834671629426794496",
  "identity_name": "afreegull2008",
  "mention_type": 3,
  "mention_type_details": 3,
  "source_type": 1,
  "reaction": 2,
  "views": 187,
  "likes": 2,
  "comments": 1,
  "shares": 3,
  "engagement_total": 6,
  "engagement_s_c": 4,
  "search_text": [
    "",
    "http://x.com/i/article/2030871214206689280",
    "{\"ynm_des\":\"Rare Sats Topology\\nThe Internal Structure of Bitcoin, Revealed\\n... <full article content verified from article_results> ...\",\"ynm_name\":\"afreegull2008\",\"ynm_link\":\"x.com/i/article/2030871214206689280\"}"
  ],
  "attachment": "{\"type\":\"article\",\"href\":\"https://x.com/i/article/2030871214206689280\"}",
  "link_shared": "x.com/i/article/2030871214206689280",
  "link_shared_domain": "x.com",
  "created_date": "2026-03-09T05:05:00.000Z",
  "engage_repost": 2,
  "engage_quote": 1,
  "engage_bookmark": 0,
  "createdBy": "XPostFromReplyCrawlingLoader"
}
```

### 7.2 Audio Space Mention

```json
{
  "id": "09b718ca-4ad9-5d86-b55c-756370f5c5fc",
  "link": "x.com/1581256352072081409/status/2071178103603228743",
  "platform": 11,
  "domain": "x.com",
  "shard": "20260628",
  "id_social": "2071178103603228743",
  "id_source": "x_1911330190183026989",
  "identity": "x_1581256352072081409",
  "identity_name": "Kop Overlord",
  "mention_type": 3,
  "mention_type_details": 3,
  "source_type": 1,
  "reaction": 5,
  "views": 453,
  "likes": 5,
  "comments": 15,
  "shares": 2,
  "engagement_total": 22,
  "engagement_s_c": 17,
  "search_text": [
    "",
    "https://x.com/i/spaces/1nKOLLOvvkWGR",
    "{\"ynm_name\":\"Kop Overlord\",\"ynm_link\":\"x.com/i/spaces/1nKOLLOvvkWGR\"}"
  ],
  "attachment": "{\"type\":\"audio\",\"href\":\"https://x.com/i/spaces/1nKOLLOvvkWGR\"}",
  "link_shared": "x.com/i/spaces/1nKOLLOvvkWGR",
  "link_shared_domain": "x.com",
  "created_date": "2026-06-28T10:25:15.000Z",
  "updated_at": "2026-07-01T09:46:01.435Z",
  "engage_repost": 2,
  "engage_quote": 0,
  "engage_bookmark": 1,
  "createdBy": "XPostFromReplyCrawlingLoader"
}
```

### 7.3 Broadcast/Livestream Mention

```json
{
  "id": "a29970a3-24c4-5e96-b9a4-eb20c2c6df9a",
  "link": "x.com/1504158728089911296/status/2072513016755830907",
  "platform": 11,
  "domain": "x.com",
  "shard": "20260702",
  "id_social": "2072513016755830907",
  "id_source": "x_1504158728089911296",
  "identity": "x_1504158728089911296",
  "identity_name": "Thanh Ocean",
  "mention_type": 3,
  "mention_type_details": 3,
  "source_type": 1,
  "reaction": 0,
  "views": 16,
  "likes": 0,
  "comments": 7,
  "shares": 0,
  "engagement_total": 7,
  "engagement_s_c": 7,
  "search_text": [
    "",
    "Hello https://x.com/i/broadcasts/1OGwbbqLeevKB",
    "{\"ynm_des\":\"Hello\",\"ynm_name\":\"Thanh Ocean\",\"ynm_link\":\"x.com/i/broadcasts/1OGwbbqLeevKB\"}"
  ],
  "attachment": "{\"type\":\"broadcast\",\"href\":\"https://x.com/i/broadcasts/1OGwbbqLeevKB\"}",
  "link_shared": "x.com/i/broadcasts/1OGwbbqLeevKB",
  "link_shared_domain": "x.com",
  "created_date": "2026-07-02T02:49:43.000Z",
  "updated_at": "2026-07-02T03:52:34.265Z",
  "engage_repost": 0,
  "engage_quote": 0,
  "engage_bookmark": 0,
  "createdBy": "XPostFromReplyCrawlingLoader"
}
```

## 8. Notes cần confirm

| ID | Nội dung | Mức ảnh hưởng |
|---|---|---|
| NC-1 | `search_text[1]` trong BA ghi `full_text`. Resolver hiện đang dùng expanded URL thay cho raw `t.co` URL đối với Article, Audio Space, Broadcast. | Medium. Mapping semantic tốt hơn cho người dùng, nhưng cần BA xác nhận nếu testcase strict raw API. |
| NC-2 | Audio Space raw sample hiện chỉ có card id/link, không có title/state/host object đầy đủ. Output chỉ có `ynm_name` và `ynm_link`, chưa có `ynm_des`. | Low/Medium. Pass theo dữ liệu raw hiện có, nhưng nếu BA yêu cầu title/state thì cần sample raw khác. |
| NC-3 | Broadcast raw có thêm `broadcast_state`, thumbnail, media key, width/height. Mention output hiện chỉ lưu title/name/link/attachment. | Low/Medium. Pass core mapping, nhưng cần BA/Dev xác nhận có cần lưu thêm metadata trong `search_text[2]` hoặc `attachment` không. |

## 9. Kết luận Mention

Ba dạng special content hiện tại **pass phần Mention core mapping**:

- Article: pass `mention_type/details`, `link_shared`, `attachment`, `ynm_name`, `ynm_des`, `ynm_link`.
- Audio Space: pass `mention_type/details`, `link_shared`, `attachment`, `ynm_name`, `ynm_link`.
- Broadcast/Livestream: pass `mention_type/details`, `link_shared`, `attachment`, `ynm_des`, `ynm_name`, `ynm_link`.

Điểm duy nhất cần giữ note khi log testcase là `search_text[1]`: output đang dùng URL đã expand từ `t.co`. Nếu BA chấp nhận `full_text` đã normalize/expand URL thì cả 3 case pass sạch.

## 10. Posts Mapping

### 10.1 Rule đối chiếu Posts

| Post field | Expected mapping |
|---|---|
| `id` | Trùng `id` mention của post gốc/special post |
| `id_social` | Tweet/status id của post gốc/special post |
| `id_source` | Source/community/user id theo input source của luồng crawl |
| `title` | Tiêu đề ngắn dùng cho Mongo post. Với special content hiện đang lấy từ caption/link/title sau khi resolver build |
| `source_type` | Theo source thực tế của luồng crawl |
| `crawled_date` | Thời điểm resolver emit message |
| `created_date` | Raw `legacy.created_at`, convert ISO UTC |
| `last_status` | `0` với data crawl thành công |
| `likes/comments/shares/views` | Mapping từ raw engagement tại thời điểm crawl |
| `engage_repost` | Raw `retweet_count` |
| `engage_quote` | Raw `quote_count` |
| `engage_bookmark` | Raw `bookmark_count` |
| `link` | Link post/status gốc chứa special content |
| `caption` | Text/link sau khi resolver normalize |
| `shared_content` | Nội dung share/content dài nếu resolver lấy được từ raw |
| `crawled_by`, `createdBy` | `XPostFromReplyCrawlingLoader` |

### 10.2 Kết quả đối chiếu Posts

| Dạng | Sample `id_social` | Actual chính | Kết luận |
|---|---|---|---|
| Article | `2030872456807023091` | `title="http://x.com/i/artic"`, `caption="http://x.com/i/article/2030871214206689280"`, `shared_content_len=13488`, engagement `likes=2`, `comments=1`, `shares=3`, `views=187/188` | Pass core mapping: id/link/source/date/engagement/content dài đều đúng. Need Confirm nhẹ: `title` đang là link article bị truncate, không phải title article `Rare Sats Topology`. |
| Article | `2036824811712942576` | `title="http://x.com/i/artic"`, `caption="http://x.com/i/article/2036821104418029568"`, `shared_content_len=19828`, engagement `likes=7052`, `comments=267`, `shares=1081`, `views=4038336` | Pass core mapping cho sample Article thứ 2. Need Confirm tương tự về `title` nếu BA muốn lấy title article thật. |
| Audio Space | `2071178103603228743` | `title="https://x.com/i/spac"`, `caption="https://x.com/i/spaces/1nKOLLOvvkWGR"`, `shared_content=null`, engagement `likes=5`, `comments=15`, `shares=2`, `views=453` | Pass core mapping. Need Confirm: raw Space hiện chỉ có link/card id nên `shared_content=null` có thể chấp nhận; nếu BA muốn title/state/host của Space trong post thì output hiện chưa có. |
| Broadcast/Livestream | `2072513016755830907` | `title="Hello"`, `caption="Hello https://x.com/i/broadcasts/1OGwbbqLeevKB"`, `shared_content="Hello"`, engagement `likes=0`, `comments=7`, `shares=0`, `views=16` | Pass. Mapping post cho Broadcast mới đúng theo raw `broadcast_title=Hello` và link broadcast. |

### 10.3 Notes cho Posts

- File posts có duplicate object cho Article `id=45eb8c2f-edf7-560d-9876-dbabf3776559` ở 2 thời điểm crawl khác nhau (`views=187` và `views=188`). Nếu đây là queue dump thì chấp nhận; khi verify DB final cần check upsert/idempotency để không tạo duplicate record.
- Có sample broadcast backup cũ `id_social=1927499737852256365`. Post core mapping của sample này lưu được caption/link/engagement, nhưng sample này từng không đạt Mention special mapping nên không dùng làm sample chính cho Broadcast.

## 11. Replies Mapping

### 11.1 Rule đối chiếu Replies

| Reply field | Expected mapping |
|---|---|
| `id` | UUID của reply/comment |
| `id_social` | Tweet/status id của reply |
| `id_source` | Source/community/user id theo input source của luồng crawl |
| `title`, `caption`, `shared_content` | Context của parent post/special content theo pattern hiện tại của luồng post-from-reply |
| `link` | Link reply/comment |
| `level` | `1` với reply trực tiếp vào post gốc |
| `post_created_date` | `created_date` của parent post gốc |
| `created_date` | Raw `legacy.created_at` của reply |
| `last_status` | `0` với data crawl thành công |
| `crawled_by`, `createdBy` | `XPostFromReplyCrawlingLoader` |

### 11.2 Kết quả đối chiếu Replies

| Dạng | Reply `id_social` | Parent/sample | Actual chính | Kết luận |
|---|---|---|---|---|
| Article | `2036958960201482626` | Parent article post `2030872456807023091` | `link=x.com/1989976438695747584/status/2036958960201482626`, `level=1`, `post_created_date=2026-03-09T05:05:00.000Z`, `caption=http://x.com/i/article/2030871214206689280`, `shared_content_len=13488` | Pass core mapping. Reply record giữ context Article của parent đúng pattern hiện tại. Need Confirm nhẹ cho `title="http://x.com/i/artic"` nếu BA muốn title article thật. |
| Article | `2037057055954198974` | Parent article post `2036824811712942576` | `link=x.com/1602554179238891520/status/2037057055954198974`, `level=1`, `post_created_date=2026-03-25T15:17:32.000Z`, `caption=http://x.com/i/article/2036821104418029568`, `shared_content_len=19828` | Pass core mapping cho sample Article thứ 2. |
| Audio Space | `2071209036549136474` | Parent audio post `2071178103603228743` | `link=x.com/1770929024606273536/status/2071209036549136474`, `level=1`, `post_created_date=2026-06-28T10:25:15.000Z`, `caption=https://x.com/i/spaces/1nKOLLOvvkWGR`, `shared_content=null` | Pass core mapping. `shared_content=null` khớp với post Audio hiện tại, Need Confirm nếu BA muốn lưu title/state của Space. |
| Broadcast/Livestream | `2072518205831327764` | Parent broadcast post `2072513016755830907` | `link=x.com/2049438103732109312/status/2072518205831327764`, `level=1`, `post_created_date=2026-07-02T02:49:43.000Z`, `title=Hello`, `caption=Hello https://x.com/i/broadcasts/1OGwbbqLeevKB`, `shared_content=Hello` | Pass. Reply context map đúng Broadcast title/link của parent post. |

### 11.3 Notes cho Replies

- File replies cũng có duplicate object cho Article reply `id=3c2fcdb1-66de-5b87-bc3c-095f16a68ddb` ở 2 thời điểm crawl. Nếu đây là queue dump thì không xem là bug; DB final cần verify upsert theo `id`.
- Có reply backup cũ `id_social=1927500290086867039` đi từ broadcast cũ `1927499737852256365`. Sample này không dùng làm sample chính vì mention của parent broadcast cũ từng bị map như normal post.

## 12. Identities Mapping

### 12.1 Rule đối chiếu Identities

| Identity field | Expected mapping |
|---|---|
| `id` | `x_<raw_user_id>` |
| `id_social` | Raw X user id |
| `fullname` | Raw user display name |
| `platform` | `11` |
| `domain` | `x.com` |
| `link` | `x.com/i/user/<raw_user_id>` |
| `avatar` | Raw profile image URL |
| `fb_user_type` | `1` cho user identity |
| `createdBy` | `XPostFromReplyCrawlingLoader` |

### 12.2 Kết quả đối chiếu Identities

| Nhóm | Identity | Actual chính | Kết luận |
|---|---|---|---|
| Article reply author | `x_1602554179238891520` | `id_social=1602554179238891520`, `fullname=Saurabh`, `link=x.com/i/user/1602554179238891520`, `platform=11`, `domain=x.com`, `fb_user_type=1` | Pass cho identity có trong file. Đây là author của Article reply sample `2037057055954198974`. |
| Audio Space reply author | `x_1770929024606273536` | `id_social=1770929024606273536`, `fullname=Joshpeelfc`, `link=x.com/i/user/1770929024606273536`, `platform=11`, `domain=x.com`, `fb_user_type=1` | Pass cho identity có trong file. |
| Broadcast author | `x_1504158728089911296` | `id_social=1504158728089911296`, `fullname=Thanh Ocean`, `link=x.com/i/user/1504158728089911296`, `platform=11`, `domain=x.com`, `fb_user_type=1` | Pass. Đây là author/broadcaster của Broadcast sample chính `2072513016755830907`. |
| Broadcast reply author | `x_2049438103732109312` | `id_social=2049438103732109312`, `fullname=Mai Trang`, `link=x.com/i/user/2049438103732109312`, `platform=11`, `domain=x.com`, `fb_user_type=1` | Pass. Đây là author của reply `2072518205831327764`. |

### 12.3 Notes cho Identities

- Identity file hiện có 4 identities, không cover toàn bộ author của mọi post/reply trong posts/replies output. Ví dụ primary Article author `x_834671629426794496` và Audio Space author `x_1581256352072081409` không xuất hiện trong file identity này.
- Nếu queue `cl_identities_2_redis_identities` chỉ emit identity khi có nhu cầu refresh/detect thì trạng thái trên là chấp nhận được.
- Nếu requirement kỳ vọng mỗi mention/post/reply đều phải emit đủ identity tương ứng, cần confirm với Dev/BA vì hiện output chưa đủ coverage.

## 13. Actual Messages Theo Mention

Các message bên dưới giữ đúng wrapper thực tế của file output (`posts[]`, `comments[]`, `identities[]`) nhưng đã rút gọn `shared_content` dài thành preview + `shared_content_len` để file mapping dễ đọc. Full payload nằm trong các file source ở mục 1.

### 13.1 Article - Mention `45eb8c2f-edf7-560d-9876-dbabf3776559`

Trace chính:

- Mention: `id=45eb8c2f-edf7-560d-9876-dbabf3776559`, `id_social=2030872456807023091`, `identity=x_834671629426794496`
- Post message: có object cùng `id=45eb8c2f-edf7-560d-9876-dbabf3776559`
- Reply message: reply `id=3c2fcdb1-66de-5b87-bc3c-095f16a68ddb` đang giữ context Article parent
- Identity message: chưa thấy identity author `x_834671629426794496` trong file identity hiện tại

Post message:

```json
{
  "posts": [
    {
      "id": "45eb8c2f-edf7-560d-9876-dbabf3776559",
      "id_social": "2030872456807023091",
      "id_source": "x_834671629426794496",
      "title": "http://x.com/i/artic",
      "source_type": 1,
      "crawled_date": "2026-07-01T07:20:43.839Z",
      "created_date": "2026-03-09T05:05:00.000Z",
      "last_status": 0,
      "likes": 2,
      "comments": 1,
      "shares": 3,
      "views": 187,
      "crawled_by": "XPostFromReplyCrawlingLoader",
      "link": "x.com/834671629426794496/status/2030872456807023091",
      "caption": "http://x.com/i/article/2030871214206689280",
      "shared_content_preview": "Rare Sats Topology\\nThe Internal Structure of Bitcoin, Revealed\\nThe Discovery and Visualization of Bitcoin’s Intrinsic Topological Structure\\n...",
      "shared_content_len": 13488,
      "engage_repost": 2,
      "engage_quote": 1,
      "engage_bookmark": 0,
      "createdBy": "XPostFromReplyCrawlingLoader"
    }
  ]
}
```

Reply message:

```json
{
  "comments": [
    {
      "id": "3c2fcdb1-66de-5b87-bc3c-095f16a68ddb",
      "id_social": "2036958960201482626",
      "id_source": "x_834671629426794496",
      "title": "http://x.com/i/artic",
      "source_type": 1,
      "crawled_date": "2026-07-01T07:20:43.844Z",
      "created_date": "2026-03-26T00:10:35.000Z",
      "last_status": 0,
      "crawled_by": "XPostFromReplyCrawlingLoader",
      "link": "x.com/1989976438695747584/status/2036958960201482626",
      "level": 1,
      "post_created_date": "2026-03-09T05:05:00.000Z",
      "caption": "http://x.com/i/article/2030871214206689280",
      "shared_content_preview": "Rare Sats Topology\\nThe Internal Structure of Bitcoin, Revealed\\nThe Discovery and Visualization of Bitcoin’s Intrinsic Topological Structure\\n...",
      "shared_content_len": 13488,
      "createdBy": "XPostFromReplyCrawlingLoader"
    }
  ]
}
```

Identity message:

```json
{
  "identities": [],
  "note": "Không thấy identity message cho author của mention Article: x_834671629426794496 trong file identities 2026-07-02T04-15-35-629Z."
}
```

### 13.2 Audio Space - Mention `09b718ca-4ad9-5d86-b55c-756370f5c5fc`

Trace chính:

- Mention: `id=09b718ca-4ad9-5d86-b55c-756370f5c5fc`, `id_social=2071178103603228743`, `identity=x_1581256352072081409`
- Post message: có object cùng `id=09b718ca-4ad9-5d86-b55c-756370f5c5fc`
- Reply message: reply `id=733272a8-4c7c-558a-bd0b-bcdaa7cd89ab` đang giữ context Audio Space parent
- Identity message: chưa thấy identity author `x_1581256352072081409`; có identity của reply author `x_1770929024606273536`

Post message:

```json
{
  "posts": [
    {
      "id": "09b718ca-4ad9-5d86-b55c-756370f5c5fc",
      "id_social": "2071178103603228743",
      "id_source": "x_1911330190183026989",
      "title": "https://x.com/i/spac",
      "source_type": 3,
      "crawled_date": "2026-07-01T09:46:01.437Z",
      "created_date": "2026-06-28T10:25:15.000Z",
      "last_status": 0,
      "likes": 5,
      "comments": 15,
      "shares": 2,
      "views": 453,
      "crawled_by": "XPostFromReplyCrawlingLoader",
      "link": "x.com/1581256352072081409/status/2071178103603228743",
      "caption": "https://x.com/i/spaces/1nKOLLOvvkWGR",
      "shared_content": null,
      "engage_repost": 2,
      "engage_quote": 0,
      "engage_bookmark": 1,
      "createdBy": "XPostFromReplyCrawlingLoader"
    }
  ]
}
```

Reply message:

```json
{
  "comments": [
    {
      "id": "733272a8-4c7c-558a-bd0b-bcdaa7cd89ab",
      "id_social": "2071209036549136474",
      "id_source": "x_1911330190183026989",
      "title": "https://x.com/i/spac",
      "source_type": 3,
      "crawled_date": "2026-07-01T09:46:01.441Z",
      "created_date": "2026-06-28T12:28:10.000Z",
      "last_status": 0,
      "crawled_by": "XPostFromReplyCrawlingLoader",
      "link": "x.com/1770929024606273536/status/2071209036549136474",
      "level": 1,
      "post_created_date": "2026-06-28T10:25:15.000Z",
      "caption": "https://x.com/i/spaces/1nKOLLOvvkWGR",
      "shared_content": null,
      "createdBy": "XPostFromReplyCrawlingLoader"
    }
  ]
}
```

Identity message:

```json
{
  "identities": [
    {
      "id": "x_1770929024606273536",
      "id_social": "1770929024606273536",
      "fullname": "Joshpeelfc",
      "platform": 11,
      "domain": "x.com",
      "link": "x.com/i/user/1770929024606273536",
      "avatar": "https://pbs.twimg.com/profile_images/2056662993987883008/npM_ZF4k_normal.jpg",
      "fb_user_type": 1,
      "createdBy": "XPostFromReplyCrawlingLoader"
    }
  ],
  "note": "Identity author của mention Audio Space x_1581256352072081409 không xuất hiện trong file identity hiện tại."
}
```

### 13.3 Broadcast/Livestream - Mention `a29970a3-24c4-5e96-b9a4-eb20c2c6df9a`

Trace chính:

- Mention: `id=a29970a3-24c4-5e96-b9a4-eb20c2c6df9a`, `id_social=2072513016755830907`, `identity=x_1504158728089911296`
- Post message: có object cùng `id=a29970a3-24c4-5e96-b9a4-eb20c2c6df9a`
- Reply message: reply `id=38f07905-d6c8-5bc9-bd71-f07b3d41ddab` đang giữ context Broadcast parent
- Identity message: có đủ author/broadcaster `x_1504158728089911296` và reply author `x_2049438103732109312`

Post message:

```json
{
  "posts": [
    {
      "id": "a29970a3-24c4-5e96-b9a4-eb20c2c6df9a",
      "id_social": "2072513016755830907",
      "id_source": "x_1504158728089911296",
      "title": "Hello",
      "source_type": 1,
      "crawled_date": "2026-07-02T03:52:34.273Z",
      "created_date": "2026-07-02T02:49:43.000Z",
      "last_status": 0,
      "likes": 0,
      "comments": 7,
      "shares": 0,
      "views": 16,
      "crawled_by": "XPostFromReplyCrawlingLoader",
      "link": "x.com/1504158728089911296/status/2072513016755830907",
      "caption": "Hello https://x.com/i/broadcasts/1OGwbbqLeevKB",
      "shared_content": "Hello",
      "engage_repost": 0,
      "engage_quote": 0,
      "engage_bookmark": 0,
      "createdBy": "XPostFromReplyCrawlingLoader"
    }
  ]
}
```

Reply message:

```json
{
  "comments": [
    {
      "id": "38f07905-d6c8-5bc9-bd71-f07b3d41ddab",
      "id_social": "2072518205831327764",
      "id_source": "x_1504158728089911296",
      "title": "Hello",
      "source_type": 1,
      "crawled_date": "2026-07-02T03:52:34.275Z",
      "created_date": "2026-07-02T03:10:20.000Z",
      "last_status": 0,
      "crawled_by": "XPostFromReplyCrawlingLoader",
      "link": "x.com/2049438103732109312/status/2072518205831327764",
      "level": 1,
      "post_created_date": "2026-07-02T02:49:43.000Z",
      "caption": "Hello https://x.com/i/broadcasts/1OGwbbqLeevKB",
      "shared_content": "Hello",
      "createdBy": "XPostFromReplyCrawlingLoader"
    }
  ]
}
```

Identity message:

```json
{
  "identities": [
    {
      "id": "x_1504158728089911296",
      "id_social": "1504158728089911296",
      "fullname": "Thanh Ocean",
      "platform": 11,
      "domain": "x.com",
      "link": "x.com/i/user/1504158728089911296",
      "avatar": "https://pbs.twimg.com/profile_images/1504158776366370816/re2trSEz_normal.jpg",
      "fb_user_type": 1,
      "createdBy": "XPostFromReplyCrawlingLoader"
    },
    {
      "id": "x_2049438103732109312",
      "id_social": "2049438103732109312",
      "fullname": "Mai Trang",
      "platform": 11,
      "domain": "x.com",
      "link": "x.com/i/user/2049438103732109312",
      "avatar": "https://pbs.twimg.com/profile_images/2049438156953673728/iMQkI3Ou_normal.png",
      "fb_user_type": 1,
      "createdBy": "XPostFromReplyCrawlingLoader"
    }
  ]
}
```

## 14. Kết luận tổng hợp sau khi bổ sung Posts/Replies/Identities

| Nhóm output | Kết luận |
|---|---|
| Mentions | Pass core mapping cho Article, Audio Space, Broadcast. |
| Posts | Pass core mapping cho cả 3 dạng. Article/Audio cần confirm thêm nếu BA muốn `title` hiển thị title thật thay vì link bị truncate. |
| Replies | Pass core mapping cho cả 3 dạng, reply giữ context parent post/special content đúng pattern hiện tại. |
| Identities | Pass cho 4 identities có trong file. Need Confirm về coverage nếu kỳ vọng emit đủ identity cho mọi author liên quan. |

Kết luận QA hiện tại: 3 dạng special content đã map đúng ở mức core data flow từ Mention sang Posts/Replies/Identities. Các điểm còn lại không phải lỗi chắc chắn, nhưng nên để note confirm trước khi close testcase: `search_text[1]` dùng expanded URL, `title` Article/Audio đang là link truncate, và identity output chưa cover 100% author của toàn bộ sample.
