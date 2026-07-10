# Review Replies Sync - YNMSHGYSG-829 & YNMSHGYSG-1169

Ngày audit: 07/07/2026

File replies kiểm tra: `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_replies_2_mongo_x_replies_LamTT_2026-07-07T03-41-01-634Z.json`

File đối chiếu:

- Posts: `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_posts_2_mongo_x_posts_LamTT_2026-07-07T03-32-33-051Z.json`
- Mentions: `Data_get_from_rabbitMQ_by_scripts/messages_testing_cl_mentions_2_solr_mentions_LamTT_2_2026-07-06T08-35-13-809Z.json`

Lưu ý: posts và replies là cùng ngày 07/07/2026 nên có thể check sync trực tiếp. Mentions mới nhất hiện có là 06/07/2026, không cùng batch với replies/posts 07/07/2026, nên phần sync replies ↔ mentions chỉ dùng để kiểm subset khớp được, không dùng để kết luận missing là bug.

## 1. Tổng quan dữ liệu replies

| Chỉ số | Kết quả |
|---|---:|
| Wrapper messages | 144 |
| Total replies/comments sau khi flatten | 233 |
| Unique `id` | 207 |
| Unique `id_social` | 207 |
| `createdBy` | 233/233 là `XPostFromReplyCrawlingLoader` |
| `crawled_by` | 233/233 là `XPostFromReplyCrawlingLoader` |
| `source_type=3` | 233/233 |
| `last_status=0` | 233/233 |
| `country_code` missing | 0 |

Phân bố `level`:

| Level | Count |
|---:|---:|
| 1 | 143 |
| 2 | 36 |
| 3 | 16 |
| 4 | 12 |
| 5 | 8 |
| 6 | 6 |
| 7 | 4 |
| 8 | 3 |
| 9 | 2 |
| 10 | 2 |
| 11 | 1 |

## 2. Kết luận nhanh

| Nhóm kiểm tra | Kết luận |
|---|---|
| Reply contract | Pass: không thiếu required fields chính. |
| Date relation | Pass: không có reply nào `created_date < post_created_date`. |
| Country code | Pass: 233/233 có `country_code`. |
| Sync replies ↔ posts | Pass: 207/207 unique replies match được parent post trong posts file 07/07 bằng context parent. |
| Sync replies ↔ mentions | Pass cho subset match được: 136 reply records có mention tương ứng, parent reference/post context đều khớp. Không kết luận missing vì mentions dump đang cũ hơn replies. |
| Special content trong replies | Có 3 Audio Space reply contexts, pass link/not-skip. Không có Article/Broadcast replies trong file này. |
| Duplicate queue dump | Need DB verify: 21 duplicate groups do rerun/crawl nhiều thời điểm. |

## 3. Reply Contract

Không có record thiếu các field chính:

- `id`
- `id_social`
- `id_source`
- `title`
- `source_type`
- `crawled_date`
- `created_date`
- `last_status`
- `link`
- `level`
- `post_created_date`
- `crawled_by`
- `createdBy`

Không có record `country_code` rỗng.

Không có record có cả `caption` và `shared_content` cùng rỗng/null.

Kết luận: replies output đạt contract cơ bản cho luồng post-from-reply.

## 4. Sync Replies ↔ Posts

Đã đối chiếu 207 unique replies với posts file 07/07 bằng parent context:

```text
post_created_date + title + caption + shared_content
```

Kết quả:

| Check | Result |
|---|---:|
| Unique replies | 207 |
| Match strict parent context với posts | 207 |
| Missing parent post context | 0 |
| Mismatch `title/caption/shared_content/post_created_date` | 0 |

Kết luận: replies đang đồng bộ tốt với posts. Reply record đang giữ đúng context của parent post.

Ví dụ match:

| Reply `id_social` | Parent post `id_social` | Parent post link |
|---|---|---|
| `2073013957317525637` | `2073002696479555759` | `x.com/1774717939800846336/status/2073002696479555759` |
| `2073024097546547536` | `2073002696479555759` | `x.com/1774717939800846336/status/2073002696479555759` |
| `2073038523653931304` | `2072994587249934534` | `x.com/1457624675610206208/status/2072994587249934534` |

## 5. Sync Replies ↔ Mentions

Mentions file dùng đối chiếu là `2026-07-06T08-35-13-809Z`, còn replies file có data tới `2026-07-07T02:40:16.000Z`, nên 2 file không phải cùng batch.

Kết quả khi đối chiếu theo subset có thể match:

| Check | Result |
|---|---:|
| Unique replies trong replies file | 207 |
| Unique mention type 2 trong mentions file | 361 |
| Replies match được mention tương ứng | 136 |
| Reply trong file 07/07 chưa thấy ở mentions 06/07 | 71 |
| Mention type 2 trong file 06/07 chưa thấy ở replies 07/07 | 225 |
| Với 136 cặp match được: missing parent post theo `id_reference` | 0 |
| Với 136 cặp match được: mismatch context parentPost | 0 |

Kết luận:

- Những cặp replies ↔ mentions match được thì đồng bộ đúng: `id/id_social`, parent reference, `title/shared_content/post_created_date`.
- Không xem 71 missing mention hoặc 225 missing reply là bug vì 2 files không cùng thời điểm/dump.
- Muốn sign-off 1-1 replies ↔ mentions cần tải lại mentions cùng batch/run với replies 07/07.

## 6. Special Content Trong Replies

Tìm thấy 3 replies giữ context Audio Space:

| Reply `id_social` | Parent post `id_social` | `title` | `caption` | `shared_content` | Kết luận |
|---|---|---|---|---|---|
| `2073999816804229463` | `2073983292416930198` | `https://x.com/i/spac` | `https://x.com/i/spaces/1wGWjjdmZVnKQ` | `null` | Pass link/not-skip, Need Confirm content |
| `2074154975475970266` | `2074133730575142972` | `https://x.com/i/spac` | `https://x.com/i/spaces/1AGRnnqRgAgGl` | `null` | Pass link/not-skip, Need Confirm content |
| `2074172341009989883` | `2074162948126470619` | `https://x.com/i/spac` | `https://x.com/i/spaces/1kJzDDAvWRLKv` | `null` | Pass link/not-skip, Need Confirm content |

Không tìm thấy replies có Article body dài hoặc Broadcast/Livestream context trong file này.

Kết luận cho YNMSHGYSG-829:

- Audio Space replies pass ở mức giữ đúng link/context parent.
- Chưa đủ data để sign-off replies cho Article/Broadcast trong file này.
- `shared_content=null` của Space vẫn là Need Confirm tương tự posts: nếu BA muốn title/state/host ở replies layer thì hiện chưa đủ; nếu metadata chi tiết nằm ở mentions `search_text[2]` thì có thể accept.

## 7. Duplicate / Idempotency

File replies có 233 records nhưng 207 unique ids, tương ứng 21 duplicate groups.

Các duplicate có cùng `id_social`, `title`, `caption`, `shared_content`, `country_code`; khác chủ yếu ở `crawled_date`.

Kết luận: không xem là bug mapping trong RabbitMQ dump. Khi sign-off Mongo final, cần query DB để xác nhận upsert theo `id`, không tạo duplicate documents.

## 8. Kết luận cuối

Với file replies ngày 07/07/2026:

- YNMSHGYSG-1169: pass core reply mapping và sync với posts. Date relation, country_code, level, required fields đều ổn.
- Replies ↔ posts: đồng bộ tốt 100% trên 207 unique replies.
- Replies ↔ mentions: subset match được đều đúng, nhưng chưa đủ kết luận 1-1 vì mentions file không cùng batch.
- YNMSHGYSG-829: Audio Space reply context pass link/not-skip; chưa có Article/Broadcast replies để sign-off đủ 3 dạng.
- Follow-up nên làm: tải mentions cùng run 07/07 và query Mongo final để verify idempotency.
