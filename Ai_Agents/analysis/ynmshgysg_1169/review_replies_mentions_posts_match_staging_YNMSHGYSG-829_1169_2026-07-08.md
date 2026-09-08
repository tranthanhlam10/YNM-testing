# Review Replies Mapping & Match Mentions/Posts - Staging YNMSHGYSG-829 / YNMSHGYSG-1169

Ngày review: 08/07/2026

Nguồn dữ liệu:

- Replies: `Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_replies_2_mongo_x_replies_LamTT_2026-07-08T10-43-46-275Z/all_messages.json`
- Replies summary: `Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_replies_2_mongo_x_replies_LamTT_2026-07-08T10-43-46-275Z/summary.json`
- Mentions đối chiếu: `Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_mentions_2_solr_mentions_LamTT_2_2026-07-08T09-09-45-711Z/all_messages.json`
- Posts đối chiếu: `Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_posts_2_mongo_x_posts_LamTT_2026-07-08T10-27-48-577Z/all_messages.json`

## 1. Tổng Quan Replies Output

| Metric | Value |
|---|---:|
| Reply messages trong `all_messages.json` | 1,176 |
| Reply/comment objects | 2,589 |
| Unique reply/comment id | 2,292 |
| Summary `total_expected` | 1,178 |
| Summary `total_processed` | 1,176 |
| Success rate | 99.83% |
| Messages with errors | 0 |
| Messages with parse errors | 0 |
| Duplicates removed | 2,024 |

Tất cả unique replies trong file đều thuộc:

- `createdBy = XPostFromReplyCrawlingLoader`

Lưu ý: replies queue có timeout ở một số batch và summary chưa đủ tuyệt đối `1176/1178`, nên nếu cần sign-off sync 100% thì nên check thêm Mongo final hoặc re-consume queue.

## 2. Mapping Check Cho Replies

| Checkpoint | Result | Kết luận |
|---|---:|---|
| Unique replies từ `XPostFromReplyCrawlingLoader` | 2,292 | Pass |
| Missing required fields | 0 | Pass |
| Invalid link format `/status/<id_social>` | 0 | Pass |
| `last_status != 0` | 0 | Pass |
| `createdBy != crawled_by` | 0 | Pass |
| Invalid `level` | 0 | Pass |
| Missing `country_code` | 0 | Pass |
| Không có context `title/caption/shared_content` | 0 | Pass |
| Reply `created_date` trước `post_created_date` | 0 | Pass |

Phân bố `source_type`:

| source_type | Unique replies |
|---|---:|
| `1` | 1,374 |
| `3` | 918 |

Kết luận mapping: **replies map đúng theo requirement core của luồng Crawl Post From Reply**.

## 3. Match Replies Với Mentions

Rule đối chiếu:

- Mentions lấy từ `XPostFromReplyCrawlingLoader` và `mention_type=2`.
- Match với replies bằng key `id`.
- Khi match, so các field định danh: `id_social`, `id_source`, `source_type`, `created_date`, `link`, `country_code`.

| Checkpoint | Result | Kết luận |
|---|---:|---|
| Mention replies `type=2/2` | 2,407 |  |
| Unique replies | 2,292 |  |
| Replies match được mention | 2,287 | Pass cho records match |
| Matched field mismatch | 0 | Pass |
| Replies không tìm thấy mention | 5 | Need Check |
| Mentions không tìm thấy reply | 120 | Need Check |

### 3.1 Records Match Được

2,287 replies match mention tương ứng và **không có field mismatch**:

- `id_social` match
- `id_source` match
- `source_type` match
- `created_date` match
- `link` match
- `country_code` match

Đây là bằng chứng mạnh rằng resolver đang map replies đúng khi dữ liệu có mặt ở cả hai queue.

### 3.2 Replies Không Tìm Thấy Mention

Có 5 replies chưa tìm thấy mention tương ứng trong mentions dump:

| id | id_social | source_type | id_source | created_date |
|---|---|---:|---|---|
| `3249d68e-7672-5f93-93af-858184fa9768` | `2074312362362884181` | 3 | `x_1891373388368932913` | `2026-07-07T01:59:40.000Z` |
| `0a7afd59-2d49-5258-b362-88f3a8b5300b` | `2074709792245809238` | 3 | `x_1891373388368932913` | `2026-07-08T04:18:55.000Z` |
| `ab0e5ac6-4dba-5a0f-b5ef-e0e8799618ab` | `2074696114272440829` | 3 | `x_1891373388368932913` | `2026-07-08T03:24:34.000Z` |
| `3c53f567-f01d-50eb-b34a-f87b40d02c7a` | `2074696679215845565` | 3 | `x_1891373388368932913` | `2026-07-08T03:26:48.000Z` |
| `ec69aaa6-be0b-570a-b413-badd23d8b576` | `2074747122193203273` | 3 | `x_1891373388368932913` | `2026-07-08T06:47:15.000Z` |

Nhận định:

- 5 replies này cũng không match được strict post context trong posts dump.
- Đây có khả năng là dữ liệu mới hơn/khác coverage so với mentions/posts dump hoặc do các queue chưa được consume cùng snapshot.
- Cần check lại Mongo/Solr final nếu muốn sign-off sync tuyệt đối.

### 3.3 Mentions Không Tìm Thấy Reply

Có 120 mention `type=2/2` chưa tìm thấy reply tương ứng trong replies dump.

Phân bố:

| source_type | Count |
|---|---:|
| `1` | 118 |
| `3` | 2 |

Created date range:

- Min: `2026-03-30T14:15:39.000Z`
- Max: `2026-06-25T00:38:55.000Z`

Nhận định:

- Các mention thiếu reply chủ yếu là source type `1`, nhiều case là comment text/link bình thường.
- Replies queue summary chỉ processed `1176/1178`, nhưng chênh lệch 120 records lớn hơn số message thiếu trong summary, nên cần check Mongo final hoặc xác nhận các queue dump có cùng input window hay không.
- Không có dấu hiệu field mapping sai ở những records đã match; vấn đề hiện tại là **coverage/sync giữa 2 queue dump**, không phải lỗi mapping trực tiếp.

## 4. Match Replies Với Posts

Rule đối chiếu:

- Dùng strict context key giữa reply và post:
  - `post_created_date` của reply = `created_date` của post
  - `title`
  - `caption`
  - `shared_content`

| Checkpoint | Result | Kết luận |
|---|---:|---|
| Posts từ `XPostFromReplyCrawlingLoader` | 916 |  |
| Replies strict match post context | 2,287 | Pass |
| Replies missing strict post context | 5 | Need Check |
| Replies missing `post_created_date` trong posts | 5 | Need Check |

5 replies thiếu post context chính là 5 replies không tìm thấy mention ở mục 3.2.

Kết luận: **toàn bộ replies có match mention thì cũng match được post context**, không thấy lỗi parent context mapping.

## 5. Kết Luận

| Hạng mục | Kết luận |
|---|---|
| Replies mapping tự thân | Pass |
| Match field giữa replies và mentions cho records cùng tồn tại | Pass, 0 mismatch |
| Match context giữa replies và posts cho records cùng tồn tại | Pass |
| Sync tuyệt đối replies vs mentions | Need Check: 5 replies không có mention, 120 mentions không có reply |
| YNMSHGYSG-1169 | Pass mapping; cần check queue/DB final nếu yêu cầu sync 100% |
| YNMSHGYSG-829 | Không phát hiện lỗi replies ảnh hưởng special content; full 829 vẫn phụ thuộc sample direct Article/Broadcast như report mentions/posts trước |

Đề xuất:

1. Nếu chỉ cần đánh giá mapping của replies: có thể **Pass**.
2. Nếu cần đánh giá đồng bộ 100% giữa Solr mentions và Mongo replies: cần re-consume/check final storage vì hiện 3 queue dump không cùng coverage tuyệt đối.
3. Ưu tiên verify 5 reply ids ở mục 3.2 trong Solr mentions final và 120 mention ids trong Mongo replies final trước khi log bug.
