# Review Posts - YNMSHGYSG-829 & YNMSHGYSG-1169

Ngày audit: 07/07/2026

File kiểm tra: `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_posts_2_mongo_x_posts_LamTT_2026-07-07T03-32-33-051Z.json`

Phạm vi: chỉ audit output `posts[]` trong queue `cl.posts_2_mongo_x_posts`. Không kết luận cho mentions/replies/identities/invalid queue nếu không có file tương ứng.

## 1. Tổng quan dữ liệu

| Chỉ số | Kết quả |
|---|---:|
| Wrapper messages | 581 |
| Total posts sau khi flatten | 612 |
| Unique `id` | 502 |
| Unique `id_social` | 502 |
| `country_code` missing | 0 |
| `last_status=0` | 612/612 |
| `source_type=3` | 612/612 |

Phân bố theo loader:

| `createdBy` | Total | Unique `id_social` | Note |
|---|---:|---:|---|
| `XPostFromReplyCrawlingLoader` | 339 | 249 | Scope chính của YNMSHGYSG-1169/829 |
| `XKeywordPostCommunityWebCriticalCrawlingLoader` | 273 | 273 | Có trong cùng file dump, nhưng không phải scope chính của post-from-reply |

## 2. Kết luận nhanh

| Requirement | Kết luận |
|---|---|
| YNMSHGYSG-1169 - post mapping core | Pass cho `XPostFromReplyCrawlingLoader`: 339/339 không thiếu required fields chính. |
| YNMSHGYSG-1169 - engagement mapping | Pass: `shares=engage_repost+engage_quote`, không có số âm ở likes/comments/shares/views. |
| YNMSHGYSG-1169 - detect country output | Pass ở mức post output có `country_code` cho 339/339 post-from-reply records. Handoff detect-country cần file queue riêng để kết luận chắc. |
| YNMSHGYSG-1169 - duplicate/idempotency | Need verify DB final: file queue có duplicate do rerun/dynamic engagement. |
| YNMSHGYSG-829 - Article post content | Pass core với sample Article `2073708199400612071`: `shared_content` có full article body dài 7,264 chars. |
| YNMSHGYSG-829 - Audio Space post | Pass ở mức không bị skip và có link Space trong `caption`; Need Confirm vì `shared_content=null`, chưa có title/state/host trong post output. |
| YNMSHGYSG-829 - Broadcast/Livestream post | Chưa cover: không tìm thấy post chứa `x.com/i/broadcasts` hoặc broadcast metadata trong file này. |

## 3. YNMSHGYSG-1169 - Post Mapping

### 3.1 Scope chính: `XPostFromReplyCrawlingLoader`

Kết quả check 339 posts:

| Rule | Result |
|---|---:|
| Missing required fields chính | 0 |
| `crawled_date=null` | 0 |
| `country_code` missing | 0 |
| Engagement formula lệch | 0 |
| Duplicate `id` trong queue dump | 48 groups |

Required fields đã check:

- `id`
- `id_social`
- `id_source`
- `title`
- `source_type`
- `crawled_date`
- `created_date`
- `last_status`
- `link`
- `crawled_by`
- `createdBy`

Kết luận: post-from-reply post records đạt core contract.

### 3.2 Engagement

Không có record lệch:

- `shares = engage_repost + engage_quote`
- `likes/comments/shares/views` không âm

Kết luận: engagement mapping đúng với công thức đã dùng trong mentions/replies mapping trước đó.

### 3.3 Country code

339/339 post-from-reply records có `country_code`.

Kết luận: output đã có country code. Tuy nhiên nếu cần verify logic handoff detect country theo đúng author/source thì cần file queue `cl.x.identity_countries...`.

### 3.4 Community-loader records trong cùng file

273 records từ `XKeywordPostCommunityWebCriticalCrawlingLoader` có:

- `crawled_date=null`
- Không thiếu title/caption
- Không thiếu `country_code`
- Engagement formula đúng

Kết luận: `crawled_date=null` chỉ xuất hiện ở community-loader records. Không xem là bug cho 2 task này nếu scope review là post-from-reply. Nếu file này được dùng để sign-off cả community keyword flow thì cần confirm riêng expectation của `crawled_date`.

## 4. YNMSHGYSG-829 - Special Content In Posts

### 4.1 Article

Tìm thấy sample Article:

| Field | Actual |
|---|---|
| `id_social` | `2073708199400612071` |
| `link` | `x.com/1844268919772606480/status/2073708199400612071` |
| `title` | `An American once saw` |
| `caption` | Full text của post chứa article |
| `shared_content` | Article body, length `7264` |
| `country_code` | `IL` |
| Engagement | `likes=10`, `comments=2`, `shares=1`, `views=401` |

Kết luận:

- Pass core post mapping: article body đã xuống `shared_content`, không chỉ title/preview ngắn.
- So với mentions audit ngày 06/07, link Article vẫn cần confirm ở mention layer (`link_shared/attachment`); posts file không có `link_shared`, nên không chứng minh được rule đó.

### 4.2 Audio Space

Tìm thấy 7 Audio Space posts:

| `id_social` | `title` | `caption` | `shared_content` | Kết luận |
|---|---|---|---|---|
| `2071178103603228743` | `https://x.com/i/spac` | `https://x.com/i/spaces/1nKOLLOvvkWGR` | `null` | Pass link, Need Confirm content |
| `2073015818422517802` | `https://x.com/i/spac` | `https://x.com/i/spaces/1PKqrroRRyeGb` | `null` | Pass link, Need Confirm content |
| `2073355184890318995` | `https://x.com/i/spac` | `https://x.com/i/spaces/1qJDzzBnWrDKV` | `null` | Pass link, Need Confirm content |
| `2073411005871194592` | `https://x.com/i/spac` | `https://x.com/i/spaces/1kKzDDrLARrJv` | `null` | Pass link, Need Confirm content |
| `2073983292416930198` | `https://x.com/i/spac` | `https://x.com/i/spaces/1wGWjjdmZVnKQ` | `null` | Pass link, Need Confirm content |
| `2074133730575142972` | `https://x.com/i/spac` | `https://x.com/i/spaces/1AGRnnqRgAgGl` | `null` | Pass link, Need Confirm content |
| `2074162948126470619` | `https://x.com/i/spac` | `https://x.com/i/spaces/1kJzDDAvWRLKv` | `null` | Pass link, Need Confirm content |

Kết luận:

- Pass ở mức Space không bị skip và link Space được lưu ở `caption`.
- Need Confirm: nếu BA kỳ vọng post output phải có title/state/host/description của Space trong `shared_content`, thì hiện output chưa đủ. Trước đó mapping đã chấp nhận mức core này nếu raw/API chỉ có link/card id.

### 4.3 Broadcast/Livestream

Không tìm thấy post nào có:

- `caption` chứa `x.com/i/broadcasts`
- `shared_content` chứa broadcast metadata
- title/caption chứa `broadcast`

Kết luận: file posts này chưa đủ coverage để sign-off Broadcast/Livestream cho YNMSHGYSG-829.

## 5. Need Confirm / Potential Issues

### NC-1: Media-only post fallback

Affected:

| `id_social` | `link` | `title` | `caption` | `shared_content` |
|---|---|---|---|---|
| `2073985149574770912` | `x.com/1644597255901421571/status/2073985149574770912` | `photo` | `null` | `null` |

Actual: media-only post chỉ còn `title=photo`, không có `caption/shared_content`.

Expected: nếu BA note fallback `attachment.type` áp dụng cho post title thì có thể accept. Nếu downstream bắt buộc `caption` không null thì cần confirm/log bug.

### NC-2: Audio Space content trong posts

Audio Space posts chỉ có link Space ở `caption`, `shared_content=null`. Nếu BA muốn lưu title/state/host trong posts layer thì chưa đạt. Nếu metadata chi tiết đã nằm ở mentions `search_text[2]` thì có thể accept.

### NC-3: Broadcast chưa có data trong file

Chưa thể sign-off Broadcast/Livestream bằng file posts này. Cần crawl lại sample broadcast và verify posts output.

### NC-4: Duplicate queue dump

Trong scope `XPostFromReplyCrawlingLoader`, có 339 records nhưng 249 unique ids, 48 duplicate groups. Một số duplicate có engagement khác nhau do crawl/rerun khác thời điểm.

Kết luận: không xem là bug mapping ở RabbitMQ dump. Khi sign-off Mongo final, cần query DB để xác nhận upsert theo `id`, không tạo duplicate document ngoài ý muốn.

## 6. Kết luận cuối

Với file posts ngày 07/07/2026:

- YNMSHGYSG-1169: pass core post mapping cho luồng `XPostFromReplyCrawlingLoader`.
- YNMSHGYSG-829: Article pass core content trong posts; Audio Space pass link/not-skip nhưng cần confirm nếu yêu cầu content metadata trong posts; Broadcast chưa có sample nên chưa sign-off được.
- Không thấy lỗi mapping nghiêm trọng trong posts file. Các điểm cần follow-up là Broadcast coverage, Audio Space `shared_content=null`, media-only fallback, và DB idempotency.
