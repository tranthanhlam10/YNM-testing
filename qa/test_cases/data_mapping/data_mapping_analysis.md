# Pantip Data Mapping Analysis Report

> [!NOTE]
> Phân tích data mapping giữa **Input** (crawled source từ RabbitMQ) và **Output** (Mentions Solr + Posts Mongo), đối chiếu với [Wiki Specification](https://wiki.younetco.com/display/FB/Pantip+platform+technical+specification).

---

## 1. Tổng quan dữ liệu

| File | Mô tả | Số records |
|------|--------|-----------|
| [Input: crawled_sources](file:///Users/tranthanhlam/YNM-testing/Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_pt_category_posts_crawled_sources_2026-05-22T04-37-53-997Z.json) | Data gốc crawl từ Pantip API (queue `cl_pt_category_posts_crawled_sources`) | 10 topics |
| [Output: mentions](file:///Users/tranthanhlam/YNM-testing/Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_mentions_2_solr_mentions_LamTT_2026-05-22T04-51-51-000Z.json) | Mention data đẩy sang Solr (queue `cl_mentions_2_solr_mentions`) | 10 records |
| [Output: posts](file:///Users/tranthanhlam/YNM-testing/Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_posts_2_mongo_pt_posts_2026-05-22T04-52-09-966Z.json) | Post data đẩy sang MongoDB (queue `cl_posts_2_mongo_pt_posts`) | 10 records |

---

## 2. Kiểm tra Mention Mapping (Input → Solr Mentions)

Dùng **topic_id = 44098725** (record đầu tiên) làm ví dụ chính, đồng thời kiểm tra tất cả 10 records.

### 2.1. Bảng đối chiếu chi tiết

| # | Schema Field | Wiki Spec (Pantip API field) | Giá trị thực tế trong Output | Giá trị Input tương ứng | ✅/⚠️/❌ | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | `id` | `topic_id → build link → hash uuid` | `e0d04cbe-6834-5ded-869b-1773e554896f` | topic_id: `44098725` | ✅ | UUID v5 từ link `pantip.com/topic/44098725` — đúng logic |
| 2 | `link` | `pantip.com/topic/{topic_id}` | `pantip.com/topic/44098725` | topic_id: `44098725` | ✅ | Đúng |
| 3 | `platform` | `14` | `14` | — | ✅ | Đúng |
| 4 | `domain` | `pantip.com` | `pantip.com` | — | ✅ | Đúng |
| 5 | `shard` | `created_time (YYYYMMDD)` | `20260522` | created_time: `2026-05-22T04:30:04Z` | ✅ | Đúng |
| 6 | `country_code` | `"th"` | `TH` | — | ⚠️ | Wiki ghi `"th"` (lowercase), output là `"TH"` (uppercase). Cần xác nhận convention hệ thống |
| 7 | `id_social` | `topic_id` | `44098725` (string) | topic_id: `44098725` (number) | ✅ | Đúng, chuyển sang string là OK |
| 8 | `identity` | `author.id` | `pt_652492` | author.id: `652492` | ⚠️ | Wiki ghi `author.id`, nhưng output thêm prefix `pt_`. Đây có thể là convention Identity (spec Identity ghi `"pt_" + author.id`). **Cần confirm: Mention field `identity` có nên dùng format Identity không?** |
| 9 | `identity_name` | `author.name` | `double two` | author.name: `double two` | ✅ | Đúng |
| 10 | `mention_type` | `1` | `1` | — | ✅ | Đúng (post từ category) |
| 11 | `mention_type_details` | Common mapping | `1` | — | ✅ | Giá trị `1` — cần verify với common mapping doc |
| 12 | `reaction` | `likes` (= votes_count theo #16) | `0` | votes_count: `0` | ✅ | Đúng |
| 13 | `views` | — | `0` | views_count: `0` | ✅ | Field không có trong wiki spec nhưng có trong output, mapping hợp lý |
| 14 | `likes` | `votes_count` | `0` | votes_count: `0` | ✅ | Đúng |
| 15 | `comments` | `comments_count` | `1` | comments_count: `1` | ✅ | Đúng |
| 16 | `shares` | — | `0` | — | ✅ | Pantip không có shares, default `0` hợp lý |
| 17 | `engagement_total` | `likes + comments` | `1` | 0 + 1 = 1 | ✅ | Đúng |
| 18 | `engagement_s_c` | `comments` | `1` | comments_count: `1` | ✅ | Đúng |
| 19 | `search_text` | `title` | `["ปูนแดงแกงร้อน ร้านอร่อย @The Glass Market บางนา", ""]` | title: `ปูนแดงแกงร้อน ร้านอร่อย @The Glass Market บางนา` | ✅ | Đúng, `search_text[0]` = title, `search_text[1]` = "" (chưa có body) |
| 20 | `attachment` | `thumbnail_url → wrap JSON` | `{"type":"photo","media_src":"https://f.ptcdn.info/..."}` | thumbnail_url: `https://f.ptcdn.info/311/091/000/mpfkwnzshF4SiYElXql-s.jpg` | ✅ | Đúng format |
| 21 | `created_date` | `created_time` | `2026-05-22T04:30:04.000Z` | created_time: `2026-05-22T04:30:04Z` | ✅ | Đúng (thêm `.000Z` là format chuẩn) |
| — | `updated_at` | — | `2026-05-22T04:43:07.068Z` | — | ✅ | Field bổ sung, thời điểm xử lý |
| — | `createdBy` | — | `PtCategoryPostsCrawlingLoader` | — | ✅ | Metadata nội bộ |

### 2.2. Kiểm tra các field THIẾU trong output so với wiki spec

| # | Wiki Schema Field | Trạng thái | Nhận xét |
|---|---|---|---|
| 8 | `id_source` | ❌ **THIẾU** | Wiki: "Tự tạo id riêng cho mỗi room". Output không có field này |
| 13 | `source_type` | ❌ **THIẾU** | Wiki: `1`. Output không có field `source_type` |

> [!WARNING]
> **2 fields thiếu trong Mention output**: `id_source` và `source_type` không xuất hiện trong output mentions. Cần xác nhận:
> - `id_source` có thể được xử lý ở tầng khác (ví dụ: set khi insert vào Solr)?
> - `source_type` có phải hardcode ở tầng consumer không?

### 2.3. Kiểm tra chéo tất cả 10 records — Kết quả engagement

| topic_id | votes_count (input) | comments_count (input) | likes (output) | reaction (output) | comments (output) | engagement_total (output) | engagement_s_c (output) | Đúng? |
|---|---|---|---|---|---|---|---|---|
| 44098725 | 0 | 1 | 0 | 0 | 1 | 1 | 1 | ✅ |
| 44098708 | 0 | 6 | 0 | 0 | 6 | 6 | 6 | ✅ |
| 44098574 | 0 | 9 | 0 | 0 | 9 | 9 | 9 | ✅ |
| 44098573 | **1** | 8 | **1** | **1** | 8 | **9** | 8 | ✅ |
| 44098569 | 0 | 10 | 0 | 0 | 10 | 10 | 10 | ✅ |
| 44098536 | **1** | 9 | **1** | **1** | 9 | **10** | 9 | ✅ |
| 44098520 | 0 | 26 | 0 | 0 | 26 | 26 | 26 | ✅ |
| 44098507 | 0 | 14 | 0 | 0 | 14 | 14 | 14 | ✅ |
| 44098499 | 0 | 12 | 0 | 0 | 12 | 12 | 12 | ✅ |
| 44098460 | **3** | 32 | **3** | **3** | 32 | **35** | 32 | ✅ |

> [!TIP]
> Tất cả engagement metrics đều mapping chính xác:
> - `likes` = `reaction` = `votes_count`
> - `engagement_total` = `likes + comments`  
> - `engagement_s_c` = `comments`

### 2.4. Kiểm tra attachment logic

| topic_id | Có thumbnail_url? | attachment output | Đúng? |
|---|---|---|---|
| 44098725 | ✅ Có | `{"type":"photo","media_src":"..."}` | ✅ |
| 44098708 | ✅ Có | `{"type":"photo","media_src":"..."}` | ✅ |
| 44098574 | ❌ Không | `{"type":"status"}` | ✅ |
| 44098573 | ✅ Có | `{"type":"photo","media_src":"..."}` | ✅ |
| 44098569 | ✅ Có | `{"type":"photo","media_src":"..."}` | ✅ |
| 44098536 | ✅ Có | `{"type":"photo","media_src":"..."}` | ✅ |
| 44098520 | ✅ Có | `{"type":"photo","media_src":"..."}` | ✅ |
| 44098507 | ❌ Không | `{"type":"status"}` | ✅ |
| 44098499 | ✅ Có | `{"type":"photo","media_src":"..."}` | ✅ |
| 44098460 | ✅ Có | `{"type":"photo","media_src":"..."}` | ✅ |

> [!TIP]
> Logic attachment hoạt động đúng: có `thumbnail_url` → `{"type":"photo",...}`, không có → `{"type":"status"}`. Phù hợp section C "Mapping search text & attachment" trong wiki.

---

## 3. Kiểm tra Post Mapping (Input → Mongo Posts)

### 3.1. Bảng đối chiếu chi tiết (topic_id = 44098725)

| # | Schema Field | Wiki Spec | Giá trị thực tế | Giá trị Input | ✅/⚠️/❌ | Ghi chú |
|---|---|---|---|---|---|---|
| 1 | `id` | `topic_id → build link → hash uuid` | `e0d04cbe-6834-5ded-869b-1773e554896f` | topic_id: `44098725` | ✅ | Cùng UUID với mention (đúng vì cùng link) |
| 2 | `id_social` | `topic_id` | `44098725` | topic_id: `44098725` | ✅ | Đúng |
| 3 | `id_source` | Tự tạo id cho mỗi room | `pt_652492` | author.id: `652492` | ⚠️ | **Wiki nói `id_source` là ID room**, nhưng output lại dùng format `pt_{author.id}`. Đây giống `identity` hơn. Có thể đây là **sai spec** hoặc **spec đã thay đổi**? |
| 4 | `title` | — | `ปูนแดงแกงร้อน...` | title: `ปูนแดงแกงร้อน...` | ✅ | Đúng (field không có trong wiki Post mapping nhưng hợp lý) |
| 5 | `country_code` | `"th"` | `TH` | — | ⚠️ | Tương tự mention — uppercase vs lowercase |
| 6 | `crawled_date` | `now` | `2026-05-22T04:43:07.076Z` | — | ✅ | Đúng, timestamp hiện tại |
| 7 | `created_date` | `created_time` | `2026-05-22T04:30:04.000Z` | created_time: `2026-05-22T04:30:04Z` | ✅ | Đúng |
| 8 | `last_status` | — | `0` | — | ✅ | Default initial status |
| 9 | `likes` | `votes_count` | `0` | votes_count: `0` | ✅ | Đúng |
| 10 | `comments` | `comments_count` | `1` | comments_count: `1` | ✅ | Đúng |
| 11 | `shares` | — | `0` | — | ✅ | Default 0 |
| 12 | `views` | — | `0` | views_count: `0` | ✅ | Mapping hợp lý |
| 13 | `link` | `pantip.com/topic/{topic_id}` | `pantip.com/topic/44098725` | — | ✅ | Đúng |
| — | `crawled_by` | — | `PtCategoryPostsCrawlingLoader` | — | ✅ | Metadata bổ sung |

### 3.2. Các field THIẾU trong Post output so với wiki spec

| # | Wiki Schema Field | Trạng thái | Nhận xét |
|---|---|---|---|
| 6 | `source_type` | ❌ **THIẾU** | Wiki: `1`. Không có trong output |
| 11 | `attachment_url` | ❌ **THIẾU** | Wiki: `thumbnail_url`. Không có trong output |

> [!WARNING]
> **Post output thiếu 2 fields**: `source_type` và `attachment_url`. Đặc biệt `attachment_url` chứa `thumbnail_url` — thông tin visual quan trọng cho post.

### 3.3. Vấn đề `id_source` trong Post

> [!CAUTION]
> **Mâu thuẫn giữa wiki spec và implementation:**
> 
> - Wiki spec Post mapping ghi: `id_source` = "Tự tạo id riêng cho mỗi room (room trả về từ nền tảng là text)"
> - Nhưng output thực tế: `id_source` = `pt_{author.id}` (ví dụ: `pt_652492`, `pt_8021333`, ...)
> - Giá trị này giống với field `identity` trong Mention mapping
> 
> **Khả năng:**
> 1. Spec cũ, implementation đã thay đổi ý nghĩa field
> 2. Hoặc đang map **sai** — cần dùng source/room ID thay vì author ID

---

## 4. Kiểm tra cross-consistency giữa Mention và Post

| Kiểm tra | Kết quả | Ghi chú |
|---|---|---|
| Số lượng records | Mention: 10, Post: 10 | ✅ Khớp |
| `id` giống nhau | ✅ Tất cả 10 UUID khớp | Cùng hash từ cùng link |
| `link` giống nhau | ✅ | Consistent |
| `created_date` giống nhau | ✅ | Consistent |
| `likes` (Mention) = `likes` (Post) | ✅ | Consistent |
| `comments` (Mention) = `comments` (Post) | ✅ | Consistent |
| Thứ tự records | ✅ Cùng thứ tự | Consistent |

---

## 5. Các vấn đề và lưu ý cho Platform Pantip

### 🔴 Issues cần fix/confirm

| # | Issue | Mức độ | Chi tiết |
|---|---|---|---|
| 1 | **`id_source` (Post) sai/khác spec** | 🔴 High | Wiki nói là room ID, output dùng `pt_{author.id}`. Cần confirm definition |
| 2 | **Thiếu `source_type`** | 🟡 Medium | Cả Mention và Post đều thiếu field `source_type = 1` |
| 3 | **Thiếu `id_source` (Mention)** | 🟡 Medium | Mention output hoàn toàn thiếu field này |
| 4 | **Thiếu `attachment_url` (Post)** | 🟡 Medium | Post không lưu `thumbnail_url` |

### 🟡 Cần lưu ý cho các cases khác trên Pantip

| # | Lưu ý | Giải thích |
|---|---|---|
| 1 | **`country_code` case sensitivity** | Output dùng `"TH"` uppercase, wiki ghi `"th"` lowercase. Nên thống nhất convention (suggest: uppercase theo ISO 3166-1 alpha-2) |
| 2 | **`identity` format trong Mention** | Wiki chỉ ghi `author.id`, nhưng output dùng `pt_{author.id}`. Đây có vẻ đúng hơn spec (vì cần unique across platforms), nhưng wiki cần update |
| 3 | **`topic_type` không được mapping** | Input có `topic_type` (1, 3, 4, 5) nhưng không có field nào trong output mapping nó. Thông tin này có thể hữu ích cho filtering (ví dụ: phân loại bài review vs question vs discussion) |
| 4 | **`tags` không được mapping** | Input có array `tags` với name/slug, không thấy trong output. Đây là thông tin quan trọng cho content categorization |
| 5 | **`is_cr`, `is_sr`, `is_br` flags** | Các flags content type (consumer review, sponsored review, brand review) trong input không được lưu. Có thể cần cho việc phân loại sponsored content |
| 6 | **`views_count` luôn = 0** | Tất cả 10 records đều có `views_count = 0`. Đây có thể là do API Pantip không trả về real-time view count khi crawl category, chỉ có khi crawl post detail |
| 7 | **`tag_hit` không được xử lý** | Input có `tag_hit` (trending tags), có thể hữu ích nhưng không có mapping |
| 8 | **Pagination (`next_id`)** | Input có `next_id: 44098460` cho cursor pagination. Cần đảm bảo loader xử lý pagination đầy đủ |
| 9 | **`search_text[1]` luôn empty** | Tất cả records đều có `search_text[1] = ""` — đây là vì crawl từ category chỉ có title, chưa crawl body. Body sẽ có khi crawl post detail |
| 10 | **`from_date` / `to_date`** | Source config dùng epoch format: `from_date: "1747887616"`, `to_date: "1779423616"`. Cần đảm bảo logic filter date hoạt động đúng với timezone TH |

### 🟢 Những điểm mapping đúng và tốt

- ✅ UUID generation từ link (consistent giữa Mention và Post)
- ✅ Engagement calculation logic chính xác
- ✅ Attachment type detection (photo vs status) hoạt động đúng
- ✅ Shard format `YYYYMMDD` từ `created_time` đúng
- ✅ `createdBy` tracking source loader name
- ✅ All 10 records mapped đầy đủ, không mất data

---

## 6. Tổng kết

| Đánh giá | Kết quả |
|---|---|
| **Mention mapping** | ✅ Phần lớn đúng, thiếu 2 fields (`id_source`, `source_type`), 1 field khác convention (`country_code`) |
| **Post mapping** | ⚠️ Cần review `id_source` (dùng author ID thay vì room ID), thiếu `source_type` và `attachment_url` |
| **Data integrity** | ✅ 10/10 records mapped đầy đủ, không mất data |
| **Cross-consistency** | ✅ Mention và Post hoàn toàn consistent về ID, link, dates, engagement |
| **Risks for other cases** | ⚠️ Cần lưu ý topic_type, tags, sponsored flags khi mở rộng use cases |
