# Review Mentions - YNMSHGYSG-829 & YNMSHGYSG-1169

Ngày audit: 06/07/2026

File kiểm tra: `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_mentions_2_solr_mentions_LamTT_2_2026-07-06T08-35-13-809Z.json`

Phạm vi: chỉ audit `mentions` trong file này. Không kết luận cuối cho posts/replies/identity/invalid queue nếu không có file output tương ứng.

## 1. Tổng quan dữ liệu

| Chỉ số | Kết quả |
|---|---:|
| Wrapper messages | 629 |
| Total mentions sau khi flatten | 780 |
| Unique `id` | 673 |
| Unique `id_social` | 673 |
| `XPostFromReplyCrawlingLoader` | 652 mentions / 556 unique `id_social` |
| `XKeywordPostCommunityWebCriticalCrawlingLoader` | 128 mentions / 128 unique `id_social` |

Phân bố mention type:

| Field | Count |
|---|---:|
| `mention_type=1` | 304 |
| `mention_type=2` | 392 |
| `mention_type=3` | 84 |
| `mention_type_details=1` | 277 |
| `mention_type_details=2` | 392 |
| `mention_type_details=3` | 84 |
| `mention_type_details=5` | 25 |
| `mention_type_details=9` | 2 |

## 2. Kết luận nhanh

| Nhóm requirement | Kết luận |
|---|---|
| YNMSHGYSG-1169 - bỏ `is_admin_creator` | Pass: 0 mention còn field `is_admin_creator`. |
| YNMSHGYSG-1169 - required fields cho valid mention | Pass cơ bản: không có mention thiếu nhóm field bắt buộc chính (`id`, `link`, `platform`, `domain`, `id_social`, `id_source`, `identity`, `mention_type`, `source_type`, `created_date`). |
| YNMSHGYSG-1169 - engagement formula | Pass: không có record lệch `reaction=likes`, `engagement_total=likes+comments+shares`, `engagement_s_c=comments+shares`, `shares=engage_repost+engage_quote`. |
| YNMSHGYSG-1169 - detect country | Chỉ pass ở mức mention output có `country_code` cho 780/780 mentions. Cần file identity-country queue nếu muốn verify đúng handoff theo author. |
| YNMSHGYSG-1169 - community fallback `user_<social_id>` | Chưa đủ dữ liệu kết luận bằng mentions file này. 128 community-loader mentions đều có `identity_name` thật, không có case fallback `user_...`. Cần identity output hoặc raw community thiếu name để verify. |
| YNMSHGYSG-829 - Audio Space | Pass với 5 Audio Space mentions hiện có. |
| YNMSHGYSG-829 - Article | Chưa pass hoàn toàn theo mapping đã chốt. Có 1 case article metadata, nhưng `attachment.type=status` và `link_shared` là status gốc, article link chỉ nằm trong `search_text[2].ynm_link`. |
| YNMSHGYSG-829 - Broadcast/Livestream | Không có sample X broadcast/livestream trong file này, nên chưa cover được. |

## 3. YNMSHGYSG-829 - Special Content

### 3.1 Audio Space

Tìm thấy 5 mentions Audio Space:

| `id_social` | `attachment.type` | `mention_type/details` | `link_shared` | Kết luận |
|---|---|---|---|---|
| `2071178103603228743` | `audio` | `3/3` | `x.com/i/spaces/1nKOLLOvvkWGR` | Pass |
| `2073015818422517802` | `audio` | `3/3` | `x.com/i/spaces/1PKqrroRRyeGb` | Pass |
| `2073355184890318995` | `audio` | `3/3` | `x.com/i/spaces/1qJDzzBnWrDKV` | Pass |
| `2073411005871194592` | `audio` | `3/3` | `x.com/i/spaces/1kKzDDrLARrJv` | Pass |
| `2073983292416930198` | `audio` | `3/3` | `x.com/i/spaces/1wGWjjdmZVnKQ` | Pass |

Các Audio Space đều đạt rule chính:

- `mention_type=3`, `mention_type_details=3`
- `attachment.type=audio`
- `link_shared` trỏ về `x.com/i/spaces/<space_id>`
- `search_text[2]` có `ynm_name` và `ynm_link`

Need Confirm nhẹ: `search_text[1]` hiện là expanded space URL, không phải raw `t.co`. Mapping trước đó đã note điểm này là chấp nhận được nếu BA đồng ý dùng expanded URL.

### 3.2 Article

Tìm thấy 1 mention có article metadata trong `search_text[2]`:

| Field | Actual |
|---|---|
| `id_social` | `2073708199400612071` |
| `link` | `x.com/1844268919772606480/status/2073708199400612071` |
| `mention_type/details` | `3/3` |
| `attachment.type` | `status` |
| `link_shared` | `x.com/1848874039634546688/status/2073685316980916587` |
| `search_text[2].ynm_link` | `x.com/i/article/2073681644435726336` |
| `search_text[2].ynm_des` | Có full article content dài |
| `search_text[2].ynm_name` | `IsraelHilltopNews` |

Kết luận:

- Pass phần `mention_type=3`, `mention_type_details=3`.
- Pass phần article metadata trong `search_text[2]`: có `ynm_des`, `ynm_name`, `ynm_link`.
- Need Confirm/Potential Fail phần `link_shared` và `attachment` nếu áp rule Article direct/special của BA: mapping trước đó kỳ vọng `link_shared=x.com/i/article/<article_id>` và `attachment.type=article`. Hiện tại output đang giữ `link_shared` là status gốc chứa article, còn article link nằm trong `search_text[2].ynm_link`.

Nếu BA/Dev xác nhận đây là case quote/repost chứa article và rule final cho quote vẫn giữ `link_shared` là status gốc, thì có thể accept. Nếu đây được xem là special Article, nên log bug mapping `link_shared/attachment`.

### 3.3 Broadcast/Livestream

Không tìm thấy mention nào có:

- `attachment.type=broadcast`
- `link_shared` chứa `x.com/i/broadcasts`
- `search_text[2].ynm_link` chứa `x.com/i/broadcasts`

Kết luận: file này chưa đủ coverage để sign-off YNMSHGYSG-829 cho Broadcast/Livestream.

## 4. YNMSHGYSG-1169 - Mention Mapping

### 4.1 Required fields

Kết quả check tự động:

| Rule | Result |
|---|---:|
| Thiếu field bắt buộc chính | 0 |
| Attachment JSON parse lỗi | 0 |
| `search_text` không phải array hoặc thiếu index cơ bản | 0 |
| Có `is_admin_creator` | 0 |

Kết luận: các mentions trong file là valid mention ở mức contract cơ bản.

### 4.2 Engagement

Không có record lệch công thức:

- `reaction = likes`
- `shares = engage_repost + engage_quote`
- `engagement_total = likes + comments + shares`
- `engagement_s_c = comments + shares`

Kết luận: engagement mapping đúng với các mapping trước đó.

### 4.3 Detect country

780/780 mentions có `country_code`.

Kết luận: output mention đã có country code. Tuy nhiên để verify đúng requirement "message gửi qua luồng Update Identity Info/detect country theo author", cần thêm file queue `cl.x.identity_countries...` hoặc raw handoff message. Mentions file sau pusher không đủ để chứng minh handoff đúng author/không duplicate detect.

### 4.4 Community mapping

Trong 128 mentions từ `XKeywordPostCommunityWebCriticalCrawlingLoader`:

- Không có `is_admin_creator`: Pass.
- `id_source` đều có dạng `x_<community/social_id>`: Pass cơ bản.
- Không thấy case `identity_name` fallback dạng `user_<social_id>`.

Kết luận: file này pass phần remove field, nhưng chưa cover được fallback `user_<social_id>` vì sample hiện đều có tên author thật.

## 5. Issues / Need Confirm

### NC-1: Article link_shared/attachment chưa khớp mapping special Article

Affected:

- `id_social=2073708199400612071`

Actual:

- `attachment.type=status`
- `link_shared=x.com/1848874039634546688/status/2073685316980916587`
- Article link chỉ nằm trong `search_text[2].ynm_link=x.com/i/article/2073681644435726336`

Expected theo mapping special Article đã chốt trước đó:

- `attachment.type=article`
- `link_shared=x.com/i/article/<article_id>`

Mức độ: High nếu BA coi đây là special Article; Medium/Need Confirm nếu đây là quote status có article.

### NC-2: Không có Broadcast/Livestream sample trong file

Không thể sign-off task 829 cho Broadcast/Livestream bằng file này. Cần crawl lại sample broadcast đã dùng trước đó hoặc sample mới có `x.com/i/broadcasts/<id>`.

### NC-3: Quote/Repost type 3 thiếu metadata `search_text[2]`

Affected:

| `id_social` | `link_shared` | `search_text[1]` |
|---|---|---|
| `2071270451410518249` | `x.com/PulseEdgeSports/status/2066672621836497209` | `RUUD was good but not to be compared with Ronaldo 😌😌` |
| `2073124814638772495` | `x.com/GORILLIONSKID/status/2073081836650049619` | Có full text dài |

Actual:

- `mention_type=3`, `mention_type_details=3`
- Có `link_shared`
- `search_text[2]=null`

Expected theo mapping quote/repost trước đó:

- `search_text[2]` nên có metadata quoted/shared status như `ynm_name`, `ynm_des` nếu raw/API resolve được.

Mức độ: Medium. Cần check raw API: nếu quoted status unavailable/deleted thì có thể accept/fallback; nếu raw có quoted_status_result thì là bug.

### NC-4: Một số media mention không có content và chưa fallback `search_text[0]=attachment.type`

Affected:

| `id_social` | Type | Attachment | Mention type |
|---|---|---|---|
| `2071092589583855994` | Comment/reply | `animated_gif` | `2/2` |
| `2073464878405218420` | Comment/reply | `photo` | `2/2` |
| `2073946671457956348` | Comment/reply | `photo` | `2/2` |
| `2073985149574770912` | Post | `photo` | `1/1` |

Actual:

- `search_text[0]=""`
- `search_text[1]=""`
- `search_text[2]=null`

Expected theo note BA trong mapping search_text:

- Nếu không có title/content/search_text[2] thì fallback từ `attachment.type`.

Mức độ: Medium/Need Confirm. Nếu BA áp rule fallback cho cả mention comment/post thì nên log bug.

### NC-5: Duplicate trong queue dump

File có 780 mentions nhưng chỉ 673 unique `id/id_social`, tức có duplicate do queue dump nhiều batch/rerun.

Kết luận: không xem là bug mapping nếu đây là file dump RabbitMQ sau nhiều lần chạy. Khi sign-off DB final cần kiểm tra upsert/idempotency ở Solr/Mongo.

## 6. Kết luận cuối

Với file mentions ngày 06/07/2026:

- YNMSHGYSG-1169: pass phần mention contract cơ bản, remove `is_admin_creator`, required fields, engagement, và có `country_code`. Chưa đủ dữ liệu để kết luận fallback identity `user_<social_id>`, invalid queue, và detect-country handoff đúng author.
- YNMSHGYSG-829: pass Audio Space cho các sample hiện có. Chưa đủ coverage Broadcast/Livestream. Article đang có 1 case cần confirm vì `link_shared/attachment` không giống mapping special Article đã chốt trước đó.
- Các mapping search_text trước đó vẫn mostly đúng, nhưng còn các need-confirm quan trọng: article link_shared, type 3 thiếu `search_text[2]`, và media rỗng chưa fallback attachment type.
