# Review Mentions Staging - YNMSHGYSG-829 / YNMSHGYSG-1169

Ngày review: 08/07/2026

Nguồn dữ liệu:

- `Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_mentions_2_solr_mentions_LamTT_2_2026-07-08T09-09-45-711Z/all_messages.json`
- `Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_mentions_2_solr_mentions_LamTT_2_2026-07-08T09-09-45-711Z/summary.json`
- `Data_get_from_rabbitMQ_by_scripts/messages_staging_cl_mentions_2_solr_mentions_LamTT_2_2026-07-08T09-09-45-711Z/errors_summary.json`

Mapping tham chiếu:

- `Ai_Agents/test_cases/x_special_cases_article_space_broadcast/data_mapping_x_special_mentions_article_space_broadcast_2026-07-02.md`
- `Ai_Agents/test_cases/x_crawling_from_reply/data_mapping_search_text_x_post_from_reply_all_types_2026-07-02.md`

## 1. Tổng Quan File

| Metric | Value |
|---|---:|
| Messages trong `all_messages.json` | 2,697 |
| Mention objects | 4,673 |
| Unique mention id | 3,995 |
| Success rate trong summary | 100.00% |
| Messages with parse errors | 0 |
| Messages with errors | 0 |
| Raw duplicates removed bởi script | 7,803 |

Phân bố unique mention theo `createdBy`:

| createdBy | Unique mentions |
|---|---:|
| `XPostFromReplyCrawlingLoader` | 3,324 |
| `XKeywordPostWebCrisisCrawlingLoader` | 664 |
| `XKeywordPostCommunityWebCrisisCrawlingLoader` | 7 |

Lưu ý: số mention object lớn hơn unique mention id vì cùng parent/mention có thể xuất hiện lại trong nhiều message crawl. Đây là queue dump, cần verify DB/Solr final theo idempotent/upsert nếu muốn chốt duplicate ở storage.

## 2. Kết Quả Task YNMSHGYSG-1169

Scope chính: mentions từ `XPostFromReplyCrawlingLoader`.

| Checkpoint | Result | Kết luận |
|---|---:|---|
| Unique mentions từ `XPostFromReplyCrawlingLoader` | 3,324 | Pass |
| Missing required fields | 0 | Pass |
| Còn field `is_admin_creator` | 0 | Pass |
| Engagement formula mismatch | 0 | Pass |
| `country_code` missing trên `XPostFromReplyCrawlingLoader` | 0 | Pass |
| Reply mentions `2/2` | 2,407 | Pass |
| Reply mentions thiếu `id_reference`/`id_parent_comment` | 0 | Pass |
| Reply parent reference không tìm thấy trong same message/`parent_posts` | 0 | Pass |

Phân bố unique mention type của `XPostFromReplyCrawlingLoader`:

| Type/Details | Count |
|---|---:|
| `1/1` | 613 |
| `1/5` | 88 |
| `1/9` | 2 |
| `1/10` | 3 |
| `2/2` | 2,407 |
| `3/3` | 211 |

Kết luận 1169: **mentions trong file staging này đạt các điều kiện chính của task**:

- Không còn `is_admin_creator`.
- Không có mention thiếu field bắt buộc trong queue Solr output.
- Engagement mapping đúng: `reaction=likes`, `engagement_total=likes+comments+shares`, `engagement_s_c=comments+shares`, `shares=engage_repost+engage_quote`.
- Reply mention có reference đầy đủ.
- Mentions từ `XPostFromReplyCrawlingLoader` đều có `country_code`.

Need Confirm ngoài phạm vi file này:

- Logic fallback identity community `fullname=user_<social_id>` cần check bằng file identity queue, không thể kết luận đầy đủ từ mention output vì file này không chứa object identity Redis.
- Logic invalid mention queue chỉ có thể kết luận gián tiếp: trong Solr output không có mention thiếu required field. Nếu muốn sign-off invalid queue thì cần thêm file `<env>.cl.x.invalid_data_crawling_sources`.

## 3. Kết Quả Task YNMSHGYSG-829

Rule chính theo mapping trước: Article / Audio Space / Broadcast direct special content cần:

- `mention_type=3`
- `mention_type_details=3`
- `link_shared` trỏ đến object special content
- `attachment.type` đúng: `article`, `audio`, `broadcast`
- `search_text[2]` có metadata đặc thù, tối thiểu `ynm_name`, `ynm_link`; riêng Article/Broadcast cần thêm `ynm_des` nếu raw có content/title.

### 3.1 Direct Special Content Trong File

| Direct special type | Unique count | Kết luận |
|---|---:|---|
| Article | 0 | Chưa đủ sample staging để sign-off |
| Audio Space | 5 | Pass |
| Broadcast/Livestream | 0 | Chưa đủ sample staging để sign-off |

5 Audio Space đều pass:

| id_social | link_shared | attachment.type | search_text[2] | Status |
|---|---|---|---|---|
| `2042052542796845497` | `x.com/i/spaces/1aJbdbBElkrKX` | `audio` | Có `ynm_name`, `ynm_link` | Pass |
| `2046406059493834774` | `x.com/i/spaces/1yxBeMbEebpJN` | `audio` | Có `ynm_name`, `ynm_link` | Pass |
| `2049532025296601366` | `x.com/i/spaces/1mxPaLRjYnbKN` | `audio` | Có `ynm_name`, `ynm_link` | Pass |
| `2041168619711730054` | `x.com/i/spaces/1pKkOyDjMnjKj` | `audio` | Có `ynm_name`, `ynm_link` | Pass |
| `2056068403358482692` | `x.com/i/spaces/1RKjpzPjwroJw` | `audio` | Có `ynm_name`, `ynm_link` | Pass |

Kết luận 829: **Audio Space đã thỏa mapping. File này chưa có direct Article/Broadcast nên chưa thể kết luận full coverage cho 829 trên staging batch này.**

### 3.2 Article Metadata Gián Tiếp

File có 2 mentions chứa `search_text[2].ynm_link` dạng `x.com/i/article/...`, nhưng đây không phải direct article theo mapping trước vì `link_shared` đang là link status và `attachment.type` không phải `article`.

| id_social | createdBy | attachment.type | link_shared | search_text[2].ynm_link | Nhận định |
|---|---|---|---|---|---|
| `2074463530431160685` | `XKeywordPostWebCrisisCrawlingLoader` | `status` | `x.com/1310606940821745664/status/2074425112988664266` | `x.com/i/article/2074423925656727552` | Need Confirm: article metadata gián tiếp qua shared/quoted status, không phải direct Article |
| `2064440642907029986` | `XPostFromReplyCrawlingLoader` | `photo` | `x.com/1804869241021050880/status/2057331233030287495` | `x.com/i/article/2056815107834044417` | Need Confirm: article metadata gián tiếp qua shared/quoted status, không phải direct Article |

Không nên log bug ngay cho 2 case này nếu BA phân biệt direct Article với quote/share status chứa article metadata. Core metadata đang có `ynm_name`, `ynm_des`, `ynm_link`.

## 4. Mapping Search Text / Link Cần Chú Ý

Ngoài scope core 829/1169, file có nhiều external link mentions:

| Checkpoint | Count |
|---|---:|
| External link mentions | 303 |
| External link chỉ có `search_text[2].ynm_link`, chưa có `ynm_name/ynm_des/ynm_caption` | 166 |

Nhận định: đây là nhóm **Need Confirm**, không phải bug chắc chắn. Nếu raw X chỉ trả entity URL mà không có card metadata thì chỉ có `ynm_link` là chấp nhận được. Nếu raw có card `title/description/domain` mà output vẫn chỉ có `ynm_link` thì mới nên log bug mapping external link/card.

## 5. Kết Luận Cuối

| Task | Kết luận |
|---|---|
| YNMSHGYSG-1169 | Pass cho mention output staging hiện tại. Không thấy lỗi required field, `is_admin_creator`, engagement, reply reference, country code. |
| YNMSHGYSG-829 | Pass cho Audio Space. Chưa đủ data direct Article/Broadcast trong file để sign-off toàn bộ task. |
| Mapping trước | Core mapping phù hợp. Có 2 article metadata gián tiếp và 166 external link chỉ có `ynm_link` cần confirm theo raw/card metadata nếu muốn audit sâu hơn. |

Đề xuất bước tiếp theo:

- Nếu cần close 829 chắc tay trên staging, crawl thêm ít nhất 1 direct Article và 1 direct Broadcast/Livestream rồi verify lại.
- Nếu cần audit external link/card strict, cần raw API tương ứng để biết X có trả card `title/description/domain` hay không.
