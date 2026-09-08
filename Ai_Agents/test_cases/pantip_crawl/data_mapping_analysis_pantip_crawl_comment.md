# Pantip Crawl Comment Data Mapping - Retest Sau Khi Fix

> Retest ngày 05/06/2026, đối chiếu input crawler với output Mention, Identity và mục **Crawl comment from post** trong [Pantip platform technical specification](https://wiki.younetco.com/display/FB/Pantip+platform+technical+specification).

---

## 1. Phạm vi kiểm tra

| Loại | File | Số record |
|---|---|---:|
| Input crawler | `messages_testing_th_cl_pt_comments_no_cookie_crawled_sources_2026-06-05T04-00-08-301Z.json` | 31 root comments + 5 replies |
| Output Mention | `messages_testing_cl_mentions_2_solr_mentions_LamTT_2_2026-06-05T03-47-35-485Z.json` | 36 mentions |
| Output Identity | `messages_testing_cl_identities_2_redis_identities_LamTT_2026-06-05T03-53-45-077Z.json` | 36 identities, 32 user duy nhất |
| API reference | `Document/Pantip/data_response_api_comment.json` | 31 root comments + 5 replies |

Thông tin topic:

| Field | Giá trị |
|---|---|
| `topic_id` | `44098569` |
| Parent post UUID | `442e9bbe-7a92-56f8-8cf9-d84f3b7855c8` |
| Parent post link | `pantip.com/topic/44098569` |
| Crawler | `PtCommentCrawlingLoader` |

---

## 2. Kết quả tổng quan

| Hạng mục | Trước fix | Sau fix | Kết quả |
|---|---|---|---|
| Root comment được emit | 100/100 | 31/31 | Pass |
| Reply được emit | 0/1 | 5/5 | Đã fix |
| `id_source` | Thiếu | Có đủ field nhưng map bằng author identity | Fail |
| `source_type` | Thiếu | Có đủ, giá trị `1` | Đã fix |
| `search_text` | Thiếu | Có đủ 36/36 | Fix một phần, còn raw HTML |
| `created_date` root comment | Thiếu | Có đủ và đúng 31/31 | Đã fix |
| `created_date` reply | Thiếu | Vẫn thiếu 5/5 | Fail |
| Link root comment/reply | Chưa ghi nhận | Cả 36/36 có tiền tố sai `//` | Fail |
| `id_parent_comment` reply | Thiếu | Có đủ 5/5 | Đã fix, nhưng khác cách diễn đạt trên wiki |
| Identity output | Chưa kiểm | Có đủ 36/36 author occurrences | Pass một phần, thiếu `shard` |

Kết luận: dev đã fix phần lớn bug chính, đặc biệt đã crawl/map reply. Tuy nhiên chưa thể kết luận mapping hoàn toàn đúng vì `id_source` đang bị map nhầm thành identity của người comment, ngoài các lỗi timestamp/shard của reply, raw HTML trong `search_text`, Identity thiếu `shard`, và một số field khác wiki cần xác nhận.

---

## 3. Mention Mapping - Root Comment

Kiểm tra tự động trên 31 root comments:

| Schema field | Expected | Kết quả |
|---|---|---|
| `id` | UUID v5 build từ link output | 31/31 đúng |
| `platform` | `14` | 31/31 đúng |
| `domain` | `pantip.com` | 31/31 đúng |
| `shard` | Ngày từ `data_utime`, format `YYYYMMDD` | 31/31 đúng |
| `country_code` | `th` | 31/31 đúng |
| `id_social` | `comment._id` | 31/31 đúng |
| `id_source` | `id_source` của source/post chứa comment, ở topic này là `pt_4928846` | 0/31 đúng; actual lấy `user.mid` |
| `identity` | `pt_{user.mid}` | 31/31 đúng |
| `identity_name` | `user.name` | 31/31 đúng |
| `mention_type` | `2` | 31/31 đúng |
| `mention_type_details` | `2` | 31/31 đúng |
| `source_type` | `1` | 31/31 đúng |
| `created_date` | `data_utime` đổi sang UTC | 31/31 đúng |
| `createdBy` | `PtCommentCrawlingLoader` | 31/31 đúng |

Ví dụ comment no. 1:

| Field | Input | Output |
|---|---|---|
| `_id` / `id_social` | `118956372` | `118956372` |
| Parent source `id_source` / `id_source` | `pt_4928846` | `"28038"` - sai, đây là MID của commenter |
| `identity` | user `28038` | `pt_28038` |
| `data_utime` | `05/22/2026 09:41:49` | `2026-05-22T02:41:49.000Z` |
| `shard` | ngày 22/05/2026 | `20260522` |

---

## 4. Mention Mapping - Reply

Input có 5 replies và output đã có đủ 5 reply mentions.

Các field sau mapping đúng 5/5:

- `id_social = reply_id`
- Phần path xác định reply có đúng `comment{comment_no}-{reply_no}`
- `identity = pt_{reply.user.mid}`
- `identity_name = reply.user.name`
- `id_parent_comment` trỏ đúng UUID của parent mention
- `search_text` có nội dung reply
- `mention_type = 2`
- `source_type = 1`

`id_source` sai 5/5 replies: expected là `id_source` của source/post chứa comment (`pt_4928846`), nhưng actual lấy `reply.user.mid`. `id_source` và `identity` chỉ tình cờ giống nhau khi chính chủ source là người comment/reply.

Lưu ý: chỉ phần suffix/path của reply đúng. Giá trị link hoàn chỉnh vẫn sai vì có tiền tố `//`, được phân tích ở mục 5.1.

### Lỗi còn lại: date/shard của reply

| Field | Expected | Actual | Kết quả |
|---|---|---|---|
| `created_date` | Parse từ reply `data_utime` | Không có trên cả 5 replies | Fail |
| `shard` | `20260522` | `19700101` trên cả 5 replies | Fail |

Ví dụ reply đầu tiên:

| Field | Giá trị |
|---|---|
| `reply_id` | `40132813` |
| Input `data_utime` | `05/22/2026 17:52:46` |
| Expected `created_date` | `2026-05-22T10:52:46.000Z` |
| Expected `shard` | `20260522` |
| Actual `created_date` | Thiếu |
| Actual `shard` | `19700101` |

Nguyên nhân có khả năng cao: reply không có `created_time`, code đang đọc `created_time` thay vì fallback/parse `data_utime`, dẫn đến Unix epoch.

---

## 5. Các điểm khác wiki/spec

### 5.1. Link root comment và reply đều sai tiền tố

Kết quả kiểm tra:

| Loại | Số record sai | Output | Canonical URL trên Pantip |
|---|---:|---|---|
| Root comment | 31/31 | `//pantip.com/topic/44098569/comment1` | `https://pantip.com/topic/44098569/comment1` |
| Reply | 5/5 | `//pantip.com/topic/44098569/comment1-1` | `https://pantip.com/topic/44098569/comment1-1` |

Nếu theo convention schema nội bộ đang bỏ protocol thì expected có thể là:

```text
pantip.com/topic/44098569/comment1
pantip.com/topic/44098569/comment1-1
```

Như vậy:

- Format reply `comment{comment_no}-{reply_no}` là đúng.
- Link hoàn chỉnh của reply vẫn sai do bắt đầu bằng `//`.
- Không nên dùng `reply_id` trong path. Ví dụ reply đầu tiên dùng `comment1-1`, không phải `comment1-40132813`.
- Cần thống nhất dùng canonical `https://pantip.com/...` hoặc convention nội bộ `pantip.com/...`.

Tiền tố sai cũng tạo UUID khác:

| Input hash | UUID |
|---|---|
| `//pantip.com/topic/44098569/comment1` | `e953e3cc-3e75-512d-90fe-ba2fa2e05311` |
| `pantip.com/topic/44098569/comment1` | `752e81f1-a096-5d89-a1c3-d760be5633fd` |

Đánh giá: đây là bug trên cả root comment và reply. Nếu cùng comment/reply từng được crawl bằng link không có `//`, hệ thống có thể tạo hai UUID khác nhau và gây duplicate mention.

### 5.2. `id_reference`

| Nguồn | Giá trị |
|---|---|
| Wiki | `paging.topic_id = 44098569` |
| Output | Parent post UUID `442e9bbe-7a92-56f8-8cf9-d84f3b7855c8` |

Output hiện trỏ đúng UUID của parent post và có tính nhất quán với schema quan hệ nội bộ. Tuy nhiên nó không đúng literal mapping đang ghi trên wiki. Cần xác nhận schema chính thức và cập nhật một trong hai bên.

### 5.3. `id_parent_comment`

| Nguồn | Giá trị |
|---|---|
| Wiki | `comment_id`, có thể hiểu là raw Pantip comment ID |
| Output | UUID của parent mention |

Cả 5 replies đều trỏ đúng UUID của root comment tương ứng. Mapping này hợp lý cho join nội bộ, nhưng wiki cần ghi rõ là parent mention UUID, không phải raw `comment._id`.

---

## 6. Search Text và Attachment

### 6.1. `search_text` vẫn chứa HTML

Wiki note:

- Chỉ lấy text, không lấy toàn bộ HTML tag.
- Image và emoji không cần lấy thông tin trong HTML tag.

Actual:

- 12/36 mentions vẫn chứa HTML trong `search_text[1]`.
- Bao gồm 11 root comments và 1 reply.
- Một số comment chỉ có thẻ emoji/image nên `search_text` gần như chỉ là raw `<img>`.

Ví dụ:

```json
[
  "",
  "น่าทานมากค่ะ<img class=\"img-in-emotion\" ... />"
]
```

Đánh giá: chưa đúng spec. Cần strip HTML, bỏ emoji image tag và giữ text thuần.

Ngoài ra có 1 record bị thay đổi Unicode từ `ยำ` thành `ยํา`. Nội dung nhìn giống nhau nhưng có thể ảnh hưởng exact-match/search normalization; nên dùng một chuẩn Unicode nhất quán.

### 6.2. `attachment` chưa có

Không mention nào có field `attachment`.

Trong input:

- Không có `app_message`.
- Có 10 comments chứa emoji image.
- Có 1 comment thực sự chứa ảnh nội dung với class `img-in-post`.
- Có 1 reply chứa emoji image.

Theo bảng mapping text-only trong wiki, attachment nên có ít nhất `{"type":"status"}`. Riêng comment no. 3 có `img-in-post`, cần xác nhận có phải parse thành photo attachment hay không.

Đánh giá: cần confirm requirement. Nếu `attachment` là required schema field thì hiện tại vẫn thiếu 36/36.

---

## 7. Identity Mapping

Input có 36 author occurrences, tương ứng 32 user duy nhất. Output có 36 identities và 32 `id` duy nhất.

Các field sau đúng 36/36:

| Identity field | Mapping |
|---|---|
| `id` | `pt_{user.mid}` |
| `id_social` | `user.mid` dạng string |
| `platform` | `14` |
| `link` | `pantip.com/profile/{user.mid}` |
| `domain` | `pantip.com` |
| `fullname` | `user.name` |
| `fb_user_type` | `1` |
| `country_code` | `th` |
| `avatar` | `user.avatar.large` |
| `created_date` | Thời điểm xử lý hiện tại |
| `createdBy` | `PtCommentCrawlingLoader` |

### Lỗi/điểm cần lưu ý

| Vấn đề | Kết quả |
|---|---|
| Identity `shard` | Thiếu 36/36, trong khi wiki yêu cầu `data_utime -> YYYYMMDD` |
| Identity duplicate trong cùng message | User `pt_4928846` xuất hiện 5 lần |

Duplicate identity có thể không gây sai dữ liệu nếu Redis upsert theo `id`, nhưng làm tăng message volume. Có thể deduplicate theo identity `id` trước khi publish.

---

## 8. Kết luận Retest

### Đã fix

- Emit đầy đủ 31 root comments và 5 replies.
- Bổ sung field `id_source`, `source_type`, `search_text`, `created_date` cho root comments, nhưng giá trị `id_source` còn sai.
- Bổ sung `id_parent_comment` và quan hệ reply -> parent mention đúng.
- Identity mapping đúng các field đang có.

### Còn bug

| Mức độ | Vấn đề |
|---|---|
| High | `id_source` sai 36/36 mentions: đang lấy identity của commenter/replier thay vì source của parent post (`pt_4928846`) |
| High | 5/5 replies thiếu `created_date` và có `shard = 19700101` |
| High | Link sai 36/36 records, bao gồm 31 root comments và 5 replies; tiền tố `//` làm UUID khác canonical link |
| Medium | 12/36 `search_text` còn raw HTML, trái wiki note |
| Medium | Identity thiếu `shard` 36/36 |

### Cần BA/Dev xác nhận

- `id_reference` nên là raw `topic_id` hay UUID parent post.
- `id_parent_comment` nên là raw Pantip `comment_id` hay UUID parent mention.
- `attachment` có bắt buộc luôn tồn tại với `type=status` hay chỉ map khi có media.
- Có cần deduplicate identities trước khi publish sang Redis hay không.

**Đánh giá cuối:** mapping đã cải thiện đáng kể nhưng **chưa pass hoàn toàn**. Cần retest lại tối thiểu phần reply date/shard, canonical link/UUID và HTML cleaning.
