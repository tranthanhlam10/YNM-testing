# Review Posts Mapping & Match Mentions - Staging YNMSHGYSG-829 / YNMSHGYSG-1169

Ngày review: 08/07/2026

Nguồn dữ liệu:

- Posts: `Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_posts_2_mongo_x_posts_LamTT_2026-07-08T10-27-48-577Z/all_messages.json`
- Posts summary: `Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_posts_2_mongo_x_posts_LamTT_2026-07-08T10-27-48-577Z/summary.json`
- Mentions dùng đối chiếu: `Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_mentions_2_solr_mentions_LamTT_2_2026-07-08T09-09-45-711Z/all_messages.json`

## 1. Tổng Quan Posts Output

| Metric | Value |
|---|---:|
| Post messages trong `all_messages.json` | 1,379 |
| Post objects | 1,903 |
| Unique post id | 1,522 |
| Summary `total_expected` | 1,409 |
| Summary `total_processed` | 1,379 |
| Success rate | 97.87% |
| Messages with errors | 0 |
| Messages with parse errors | 0 |
| Duplicates removed | 2,021 |

Lưu ý quan trọng: posts dump **chưa consume đủ 100% expected messages** theo summary (`1379/1409`). Vì vậy các check match bị thiếu 1 vài record cần được xác nhận lại sau khi consume đủ queue hoặc check trực tiếp DB/Mongo final.

Phân bố unique posts theo `createdBy`:

| createdBy | Unique posts |
|---|---:|
| `XPostFromReplyCrawlingLoader` | 916 |
| `XKeywordPostWebCrisisCrawlingLoader` | 599 |
| `XKeywordPostCommunityWebCrisisCrawlingLoader` | 7 |

## 2. Mapping Check Cho Posts

### 2.1 Scope `XPostFromReplyCrawlingLoader`

| Checkpoint | Result | Kết luận |
|---|---:|---|
| Unique posts từ `XPostFromReplyCrawlingLoader` | 916 | Pass |
| Missing required fields | 0 | Pass |
| Invalid link format `/status/<id_social>` | 0 | Pass |
| `last_status != 0` | 0 | Pass |
| `createdBy != crawled_by` | 0 | Pass |
| `shares != engage_repost + engage_quote` | 0 | Pass |
| Counter âm | 0 | Pass |
| Missing `country_code` | 0 | Pass |
| Không có `title/caption/shared_content` | 0 | Pass |

Kết luận: **posts của `XPostFromReplyCrawlingLoader` đang map đúng các field core của task 1169**.

### 2.2 Ngoài Scope `XPostFromReplyCrawlingLoader`

Có 606 unique posts không có `crawled_date`, toàn bộ thuộc keyword/crisis loaders:

| createdBy | Missing `crawled_date` |
|---|---:|
| `XKeywordPostWebCrisisCrawlingLoader` | 599 |
| `XKeywordPostCommunityWebCrisisCrawlingLoader` | 7 |

Nhận định: đây **không phải lỗi của luồng Crawl Post From Reply**. Nếu schema posts Mongo bắt buộc `crawled_date` cho mọi crawler thì cần mở rộng scope kiểm tra cho keyword/crisis loaders.

## 3. Match Posts Với Mentions

Rule đối chiếu:

- Chỉ đối chiếu posts `createdBy=XPostFromReplyCrawlingLoader`.
- Match với parent mentions của cùng loader có `mention_type` là `1` hoặc `3`.
- Key match chính: `id`.
- Sau khi match, so thêm `id_social`, `id_source`, `source_type`, `created_date`, `link`, engagement counters, `country_code`.

| Checkpoint | Result | Kết luận |
|---|---:|---|
| Parent mentions `type=1/3` từ `XPostFromReplyCrawlingLoader` | 917 |  |
| Posts từ `XPostFromReplyCrawlingLoader` | 916 |  |
| Posts match được parent mention | 916 | Pass cho posts hiện có |
| Posts không tìm thấy parent mention | 0 | Pass |
| Parent mentions không tìm thấy post | 1 | Need Check |
| Matched records lệch field/counter | 11 | Need Confirm do engagement realtime |

### 3.1 Parent Mention Chưa Có Post Tương Ứng

| Field | Value |
|---|---|
| `id` | `0e4b7fa7-6c35-5c5f-9047-2fe899a5cc19` |
| `id_social` | `2061519895859220973` |
| `link` | `x.com/2061428238946062337/status/2061519895859220973` |
| Mention type | `1/5` |
| `id_source` | `x_2033238591455850939` |
| `source_type` | `3` |
| `link_shared` | `https://discord.gg/xPUub5mX7` |
| `search_text[2]` | Có đầy đủ card metadata Discord: `ynm_des`, `ynm_name`, `ynm_caption`, `ynm_link` |

Nhận định:

- Mention mapping của case này đang đúng về external link/card.
- Chưa thấy post tương ứng trong posts dump.
- Vì posts summary chỉ processed `1379/1409`, cần re-consume/check Mongo final trước khi log bug.

### 3.2 Matched Field Mismatch

Có 11 matched records lệch counter giữa posts và mentions, chủ yếu ở:

- `views`
- `likes`
- `shares`
- `engage_repost`
- `engage_bookmark`

Nhận định: các lệch này nhiều khả năng do **posts và mentions được dump ở 2 thời điểm khác nhau**, engagement trên X là realtime. Các field định danh (`id`, `id_social`, `id_source`, `source_type`, `created_date`, `link`, `country_code`) vẫn match. Không xem là bug mapping nếu không yêu cầu counters phải snapshot tuyệt đối cùng thời điểm.

## 4. Liên Quan YNMSHGYSG-829

Trong posts output hiện tại, scope direct special content cần check chính vẫn phụ thuộc vào có sample Article/Space/Broadcast hay không.

Từ mentions staging trước đó:

- Direct Audio Space có sample và đã pass mentions.
- Direct Article/Broadcast chưa có sample để sign-off full 829.

Với posts hiện tại:

- Posts của `XPostFromReplyCrawlingLoader` match mentions parent gần như đầy đủ.
- Không thấy lỗi core posts mapping làm ảnh hưởng Audio Space đã có.
- Chưa đủ data để chốt posts mapping cho direct Article/Broadcast nếu không crawl thêm sample direct Article/Broadcast.

## 5. Kết Luận

| Hạng mục | Kết luận |
|---|---|
| Posts mapping cho `XPostFromReplyCrawlingLoader` | Pass |
| Posts match với mentions parent hiện có | Pass cho 916/916 posts |
| Parent mention thiếu post | Need Check 1 case, có thể do posts dump chưa consume đủ |
| Counter mismatch posts vs mentions | Need Confirm, khả năng do realtime engagement/crawl khác thời điểm |
| YNMSHGYSG-1169 posts | Có đủ cơ sở pass sau khi verify lại 1 missing post hoặc consume đủ queue |
| YNMSHGYSG-829 posts | Pass phần dữ liệu hiện có; chưa đủ direct Article/Broadcast sample để sign-off full 829 |

Đề xuất:

1. Re-run/consume lại posts queue hoặc check Mongo final cho `id_social=2061519895859220973`.
2. Nếu post vẫn không tồn tại trong Mongo final trong khi mention parent đã vào Solr, log bug mất đồng bộ mention/post.
3. Nếu cần close full 829, crawl thêm direct Article và direct Broadcast/Livestream ở staging rồi check lại posts + mentions.
