# Data Mapping Youtube Post Crawler - Bổ sung Audit - YNMPDP-6004

Ngày audit bổ sung: 15/07/2026

Phạm vi: Cross-validation giữa file mapping gốc `data_mapping_youtube_post_crawler_2026-07-15.md` và dữ liệu thật trên Production. Bổ sung các field chưa được audit, sửa lỗi mapping sai, và đánh giá backward compatibility.

## 1. Dữ liệu Prod dùng để cross-validate

### 1.1 Mentions (Prod)

```json
{
    "id": "8ccb2f95-6978-5fb4-96a5-087de87658b8",
    "link": "youtube.com/watch?v=niHRi8Ed8u4",
    "id_source": "UCRyS_3HKtXlV-M4KC5E6i6Q",
    "views": 89787,
    "likes": 1909,
    "comments": 162,
    "shares": 0,
    "rating_score": 0,
    "engagement_total": 2071,
    "engagement_s_c": 162,
    "identity": "UCRyS_3HKtXlV-M4KC5E6i6Q",
    "identity_name": "W2W Movie",
    "mention_type": 1,
    "title": "Chê Phim THIẾU NIÊN NINJA RÙA ĐỘT BIẾN | Teenage Mutant Ninja Turtles",
    "search_text": ["<title>", "<title + description>"],
    "attachment": "{\"media_src\":\"https://i.ytimg.com/vi/niHRi8Ed8u4/default.jpg\",\"type\":\"video\"}",
    "is_to_topic": true,
    "domain": "youtube.com",
    "mention_type_details": 1,
    "platform": 7,
    "updated_at": "2023-12-08T14:45:42.951Z",
    "created_date": "2023-01-08T10:00:31Z"
}
```

### 1.2 Posts (Prod)

```json
{
    "id": "UCRyS_3HKtXlV-M4KC5E6i6Q",
    "avatar": "https://yt3.ggpht.com/...=s88-c-k-c0x00ffffff-no-rj",
    "language": 1,
    "reply_next_crawl_time": "2025-01-09T11:32:05.957Z",
    "priority": 1,
    "next_crawl_time": "2026-07-15T18:37:07.887Z",
    "domain": "youtube.com",
    "link": "youtube.com/channel/UCRyS_3HKtXlV-M4KC5E6i6Q",
    "platform": 7,
    "updated_at": "2026-04-16T06:03:05.722Z",
    "post_last_date": "2026-07-14T10:30:30Z",
    "is_kol": true,
    "last_status": 0,
    "id_social": "UCRyS_3HKtXlV-M4KC5E6i6Q",
    "post_updated_at": 1784097427,
    "subscriber_count": 625000,
    "fullname": "W2W Movie",
    "created_date": "2022-07-08T17:25:05.613Z",
    "repost_next_crawl_time": "2025-01-09T11:32:05.957Z"
}
```

### 1.3 Identity (Prod)

```json
{
    "id": "fe8af1b1-6d22-532f-a780-0821793e95b8",
    "id_source": "UCkgS1vfSkI8Z7qwmpvB1T9A",
    "id_social": "p7yuapnSno4",
    "title": "Liên Quân Mobile sự",
    "created_date": "2017-11-22T01:43:42Z",
    "crawled_date": "2017-11-24T00:46:44.046Z",
    "comment_updated_at": 1513178689
}
```

---

## 2. Lỗi mapping sai cần sửa (Errata)

### 2.1 🔴 `engagement_total` — Công thức SAI

| Hạng mục | Chi tiết |
|---|---|
| **File mapping gốc ghi (dòng 53)** | `engagement_total` = `views + likes + comments` |
| **Dữ liệu Prod thật** | `views=89787`, `likes=1909`, `comments=162`, `engagement_total=2071` |
| **Phép tính kiểm tra** | `1909 + 162 = 2071` ✅ — khớp Prod |
| | `89787 + 1909 + 162 = 91858` ❌ — KHÔNG khớp Prod |
| **Công thức đúng** | `engagement_total` = `likes + comments + shares` |
| **Mức độ** | 🔴 Critical — sai logic nghiệp vụ |

**Giải thích nghiệp vụ:** Trên YouTube, `views` là metric **reach** (lượt xem thụ động), không phải metric **engagement** (tương tác chủ động). Engagement chỉ bao gồm các hành động chủ động của người dùng: like, comment, share. Đây là chuẩn chung của ngành social listening. Nếu cộng views vào engagement sẽ inflate số engagement lên gấp hàng chục/hàng trăm lần, làm sai lệch toàn bộ báo cáo.

**Hành động:** Sửa file mapping gốc dòng 53, sửa audit kết luận ở section 9 (dòng 167).

---

### 2.2 🔴 `id_source` / `identity` trong Mentions — Mâu thuẫn với Prod

| Hạng mục | Chi tiết |
|---|---|
| **File mapping gốc ghi (dòng 41)** | `id_source` / `identity` = `hashUuid('yt_channel_' + source.id)` |
| **Dữ liệu Prod thật** | `id_source = "UCRyS_3HKtXlV-M4KC5E6i6Q"` (raw channel ID) |
| | `identity = "UCRyS_3HKtXlV-M4KC5E6i6Q"` (raw channel ID) |
| **Kỳ vọng nếu mapping đúng** | Giá trị phải là UUID dạng `xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx` |
| **Thực tế** | Giá trị là raw channel ID, không phải hash |
| **Mức độ** | 🔴 Critical — mapping description sai so với behavior thật |

**Phân tích:**
- Prod lưu `id_source` và `identity` bằng **raw channel ID** (`UC...`), KHÔNG phải hash UUID.
- Nếu wiki dev ghi `hashUuid('yt_channel_' + source.id)`, có thể:
  1. Wiki đã outdate và chưa reflect logic hiện tại
  2. Hoặc new source đang implement khác old source → **breaking change** cần confirm
- File mapping gốc audit chỉ check consistency (`post.id_source = mention.id_source = mention.identity`) mà không cross-check giá trị thực vs công thức → bỏ lọt lỗi

**Hành động:** Confirm với dev team giá trị đúng của `id_source`/`identity` là raw channel ID hay hash UUID. Nếu new source đổi sang hash UUID → đây là **breaking change** ảnh hưởng downstream.

---

### 2.3 🟡 `link` trong Mentions — Format khác biệt giữa Test output và Prod

| Hạng mục | Chi tiết |
|---|---|
| **File mapping gốc ghi (dòng 38, 154)** | `link` = `https://www.youtube.com/watch?v={videoId}` → audit **Pass** |
| **Test output (new source)** | `https://www.youtube.com/watch?v={videoId}` (full URL với scheme + www) |
| **Dữ liệu Prod (old source)** | `youtube.com/watch?v=niHRi8Ed8u4` (không có `https://www.`) |
| **Mức độ** | 🟡 Medium — format khác nhau, có thể ảnh hưởng dedup/matching downstream |

**Phân tích:**
- Old source lưu link dạng rút gọn: `youtube.com/watch?v=...`
- New source lưu link dạng full: `https://www.youtube.com/watch?v=...`
- Nếu downstream system dùng `link` để dedup hoặc match mention, sự khác biệt format sẽ gây ra **duplicate mentions** hoặc **miss matching**

**Hành động:**
1. Confirm với dev team format link chuẩn là gì
2. Kiểm tra downstream có normalize link trước khi compare không
3. Nếu không normalize → cần align format giữa old/new source

---

### 2.4 🟡 `id` trong Posts — Khác biệt format giữa Test output và Prod

| Hạng mục | Chi tiết |
|---|---|
| **File mapping gốc ghi (dòng 58-62)** | `id` = `hashUuid('yt_' + videoId)`, `id_social`/`video_id` = `videoId` |
| **Dữ liệu Prod posts thật** | `id = "UCRyS_3HKtXlV-M4KC5E6i6Q"` (raw channel ID, KHÔNG phải hash UUID) |
| | `id_social = "UCRyS_3HKtXlV-M4KC5E6i6Q"` (raw channel ID) |
| **Mức độ** | 🟡 Medium — cần clarify |

**Phân tích:**
- Dữ liệu Prod cho thấy `posts.id` = `posts.id_social` = raw channel ID. Điều này cho thấy trên Prod hiện tại, **1 post document = 1 channel** (post là đại diện channel-level, không phải video-level).
- File mapping gốc mô tả `posts.id` = `hashUuid('yt_' + videoId)` → mỗi video tạo 1 post document riêng.
- Đây có thể là sự khác biệt design giữa old source (channel-level posts) vs new source (video-level posts) → cần confirm rõ.

---

## 3. Fields thiếu audit trong file mapping gốc

### 3.1 Mentions — Fields trên Prod nhưng chưa audit

| Field | Giá trị Prod | Mô tả | Mức độ cần audit |
|---|---|---|---|
| `mention_type_details` | `1` | Chi tiết loại mention, dùng để phân loại content. Trên Prod luôn = `mention_type` cho YouTube. | 🔴 High — field nghiệp vụ quan trọng |
| `is_to_topic` | `true` | Flag đánh dấu mention có liên quan đến topic monitoring hay không. Ảnh hưởng đến việc mention có xuất hiện trong dashboard topic hay không. | 🔴 High — ảnh hưởng trực tiếp đến user output |
| `rating_score` | `0` | Điểm rating/sentiment. YouTube video không có star rating nên expected = `0`. | 🟡 Medium — cần confirm default value |

**Đề xuất mapping:**

| Field | Expected mapping | Ghi chú |
|---|---|---|
| `mention_type_details` | `MENTION_TYPE.POST` (= `1`) | Nên bằng `mention_type` cho YouTube post |
| `is_to_topic` | `true` nếu mention thuộc topic tracking, `false` nếu là KOL-only crawl | Cần confirm logic set field này |
| `rating_score` | `0` | YouTube không có star rating system |

---

### 3.2 Posts — Fields trên Prod nhưng chưa audit

| Field | Giá trị Prod | Mô tả | Mức độ cần audit |
|---|---|---|---|
| `avatar` | `https://yt3.ggpht.com/...` | Avatar channel. Lấy từ YouTube channel API. | 🟡 Medium |
| `language` | `1` | Ngôn ngữ channel (1 = Vietnamese?). Có thể lấy từ source hoặc detect. | 🟡 Medium |
| `subscriber_count` | `625000` | Số subscriber channel. Lấy từ `channels.list.statistics`. | 🔴 High — metric quan trọng cho KOL |
| `fullname` | `"W2W Movie"` | Tên channel. File gốc ghi thiếu field này từ source. | 🔴 High |
| `is_kol` | `true` | Flag KOL. File gốc ghi "Need Confirm" nhưng Prod **CÓ** field này. | 🔴 High |
| `priority` | `1` | Priority crawl. File gốc ghi "Need Confirm" nhưng Prod **CÓ** field này. | 🟡 Medium |
| `post_last_date` | `"2026-07-14T10:30:30Z"` | Ngày publish video mới nhất. Cần update mỗi lần crawl. | 🟡 Medium |
| `post_updated_at` | `1784097427` (Unix timestamp) | Timestamp lần cập nhật post cuối. | 🟡 Medium |
| `next_crawl_time` | `"2026-07-15T18:37:07.887Z"` | Lần crawl tiếp theo. Scheduler dùng field này. | 🟡 Medium |
| `reply_next_crawl_time` | `"2025-01-09T11:32:05.957Z"` | Lần crawl reply/comment tiếp theo. | 🟢 Low |
| `repost_next_crawl_time` | `"2025-01-09T11:32:05.957Z"` | Lần crawl repost tiếp theo (YouTube không có repost concept). | 🟢 Low |
| `link` | `"youtube.com/channel/UCRyS_3HKtXlV-M4KC5E6i6Q"` | Link channel (format rút gọn trên Prod). | 🟡 Medium |

**Đề xuất mapping:**

| Field | Expected mapping |
|---|---|
| `avatar` | Từ `channels.list.snippet.thumbnails.default.url` hoặc source |
| `language` | Từ `source.language` hoặc detect từ content |
| `subscriber_count` | Từ `channels.list.statistics.subscriberCount` |
| `fullname` | Từ `source.fullname` hoặc `channels.list.snippet.title` |
| `is_kol` | Từ `source.is_kol` |
| `priority` | Từ `source.priority` |
| `post_last_date` | `max(items[].snippet.publishedAt)` của batch hiện tại |
| `post_updated_at` | Unix timestamp của crawl time |
| `next_crawl_time` | Tính bởi scheduler dựa trên priority/frequency |

---

### 3.3 Identities — Fields trên Prod nhưng chưa audit

| Field | Giá trị Prod | Mô tả | Mức độ cần audit |
|---|---|---|---|
| `id` | `"fe8af1b1-6d22-532f-a780-0821793e95b8"` | UUID của identity. Là hash UUID. | 🔴 High |
| `id_source` | `"UCkgS1vfSkI8Z7qwmpvB1T9A"` | Channel ID gốc tạo video. Khác với `id_social` là video ID. | 🔴 High |
| `id_social` | `"p7yuapnSno4"` | Video ID. Trên Prod identity dùng video ID làm `id_social`. | 🔴 High — cần clarify vì file gốc ghi `id_social` = channel ID |
| `title` | `"Liên Quân Mobile sự"` | Title video hoặc channel. | 🟡 Medium |
| `created_date` | `"2017-11-22T01:43:42Z"` | Ngày tạo video/channel. | 🟡 Medium |
| `crawled_date` | `"2017-11-24T00:46:44.046Z"` | Ngày crawl. | 🟡 Medium |
| `comment_updated_at` | `1513178689` (Unix timestamp) | Timestamp update comment cuối. | 🟡 Medium |

**Phân tích quan trọng:**
- Prod identity có `id_social = "p7yuapnSno4"` (đây là **video ID**), trong khi `id_source = "UCkgS1vfSkI8Z7qwmpvB1T9A"` là **channel ID**
- File mapping gốc section 10 ghi `id_social = UC-7dULIvz5qLwSWLzdLQUZA` (channel ID) → **khác hoàn toàn** concept so với Prod
- Cần clarify: Identity trên Prod thực chất đại diện cho **video** (mỗi video 1 identity) hay **channel** (mỗi channel 1 identity)?

---

## 4. Backward Compatibility — So sánh New Source vs Old Source (Prod)

> [!CAUTION]
> Đây là phần quan trọng nhất khi làm migration mà file mapping gốc **hoàn toàn thiếu**.

### 4.1 Mentions: New Source output vs Prod

| Field | Old Source (Prod) | New Source (Test) | Tương thích? |
|---|---|---|---|
| `id` | UUID hash `8ccb2f95-...` | UUID hash (chưa rõ formula) | ⚠️ Cần verify cùng formula |
| `link` | `youtube.com/watch?v=...` (no scheme) | `https://www.youtube.com/watch?v=...` (full URL) | ❌ **Khác format** |
| `id_source` | Raw channel ID `UCRyS_3HKtXlV-...` | `hashUuid('yt_channel_' + source.id)` (theo wiki) | ❌ **Khác format** |
| `identity` | Raw channel ID `UCRyS_3HKtXlV-...` | `hashUuid('yt_channel_' + source.id)` (theo wiki) | ❌ **Khác format** |
| `identity_name` | `"W2W Movie"` (từ source.fullname) | Fallback `item.snippet.channelTitle` | ⚠️ Có thể khác nếu channel đổi tên |
| `engagement_total` | `likes + comments` = `2071` | File gốc ghi `views + likes + comments` | ❌ **Formula sai** |
| `mention_type_details` | `1` | Không xuất hiện trong output | ❌ **Thiếu field** |
| `is_to_topic` | `true` | Không xuất hiện trong output | ❌ **Thiếu field** |
| `rating_score` | `0` | Không xuất hiện trong output | ❌ **Thiếu field** |
| `views/likes/comments` | Có giá trị thật (89787/1909/162) | Tất cả `0` (thiếu statistics API) | ⚠️ Need Confirm |
| `shares` | `0` | `0` | ✅ Khớp |
| `platform` | `7` | `7` | ✅ Khớp |
| `domain` | `youtube.com` | `youtube.com` | ✅ Khớp |
| `mention_type` | `1` | `1` | ✅ Khớp |
| `search_text` | `[title, title+description]` | `[title, description]` filter falsy | ⚠️ Cần verify format |
| `attachment` | `{"media_src":"...default.jpg","type":"video"}` | Thumbnail tốt nhất `maxres>high>medium>default` | ⚠️ Có thể khác resolution |

### 4.2 Posts: New Source output vs Prod

| Field | Old Source (Prod) | New Source (Test) | Tương thích? |
|---|---|---|---|
| `id` | Raw channel ID `UCRyS_3HKtXlV-...` | `hashUuid('yt_' + videoId)` | ❌ **Khác concept** (channel vs video) |
| `id_social` | Raw channel ID | `videoId` | ❌ **Khác concept** |
| `avatar` | Có | Không audit | ⚠️ Thiếu |
| `language` | `1` | Không audit | ⚠️ Thiếu |
| `subscriber_count` | `625000` | Không audit | ⚠️ Thiếu |
| `fullname` | `"W2W Movie"` | Không có (source thiếu) | ❌ **Thiếu field** |
| `is_kol` | `true` | Không có (source thiếu) | ❌ **Thiếu field** |
| `priority` | `1` | Không có (source thiếu) | ❌ **Thiếu field** |
| `post_last_date` | `"2026-07-14T10:30:30Z"` | Không audit | ⚠️ Thiếu |
| `post_updated_at` | `1784097427` | Không audit | ⚠️ Thiếu |
| `next_crawl_time` | Có | Không audit | ⚠️ Thiếu |

### 4.3 Identity: New Source output vs Prod

| Field | Old Source (Prod) | New Source (Test) | Tương thích? |
|---|---|---|---|
| `id` | UUID hash `fe8af1b1-...` | Không audit | ⚠️ Thiếu |
| `id_source` | Raw channel ID `UCkgS1vfSkI8Z7qwmpvB1T9A` | Không audit | ⚠️ Thiếu |
| `id_social` | Video ID `p7yuapnSno4` | Channel ID `UC-7dULIvz5qLwSWLzdLQUZA` | ❌ **Khác concept** |
| `title` | `"Liên Quân Mobile sự"` (video title) | Không audit | ⚠️ Thiếu |
| `created_date` | `"2017-11-22T01:43:42Z"` | Không audit | ⚠️ Thiếu |
| `crawled_date` | `"2017-11-24T00:46:44.046Z"` | Không audit | ⚠️ Thiếu |
| `comment_updated_at` | `1513178689` | Không audit | ⚠️ Thiếu |

---

## 5. Tổng hợp Issues bổ sung

| ID | Mô tả | Mức độ | Loại | Hành động |
|---|---|---|---|---|
| **ERR-1** | `engagement_total` formula sai: file gốc ghi `views + likes + comments`, Prod thật là `likes + comments + shares` | 🔴 Critical | Bug mapping | Sửa file mapping gốc dòng 53, 167 |
| **ERR-2** | `id_source`/`identity` trong Mentions: file ghi `hashUuid(...)` nhưng Prod là raw channel ID | 🔴 Critical | Mâu thuẫn wiki vs Prod | Confirm với dev, xác định behavior đúng |
| **BC-1** | `link` format khác: Prod = `youtube.com/...`, Test = `https://www.youtube.com/...` | 🟡 Medium | Breaking change | Confirm downstream có normalize không |
| **BC-2** | Posts `id` concept khác: Prod = channel-level, Test = video-level | 🟡 Medium | Breaking change | Confirm design intent của new source |
| **BC-3** | Identity `id_social` concept khác: Prod = video ID, Test = channel ID | 🟡 Medium | Breaking change | Confirm design intent |
| **MISS-1** | Mentions thiếu field `mention_type_details` trong output | 🔴 High | Missing field | Confirm resolver có set field này không |
| **MISS-2** | Mentions thiếu field `is_to_topic` trong output | 🔴 High | Missing field | Confirm resolver có set field này không |
| **MISS-3** | Mentions thiếu field `rating_score` trong output | 🟡 Medium | Missing field | Confirm default value |
| **MISS-4** | Posts thiếu fields: `avatar`, `language`, `subscriber_count`, `fullname`, `is_kol`, `priority`, `post_last_date`, `post_updated_at`, `next_crawl_time` | 🔴 High | Missing fields | Confirm source propagation |
| **MISS-5** | Identity thiếu audit fields: `id`, `id_source`, `title`, `created_date`, `crawled_date`, `comment_updated_at` | 🟡 Medium | Audit gap | Bổ sung audit |
| **MISS-6** | Mentions `search_text` format: Prod = `[title, title+description]`, mapping ghi `[title, description]` | 🟡 Medium | Potential diff | Cross-check actual Prod behavior |

---

## 6. Đề xuất cập nhật file mapping gốc

### 6.1 Sửa Section 3.1 — Mentions mapping

```diff
 | `engagement_total` | `views + likes + comments` |
+ | `engagement_total` | `likes + comments + shares` |

- | `id_source` / `identity` | `hashUuid('yt_channel_' + source.id)` |
+ | `id_source` / `identity` | Raw channel ID `source.id` (⚠️ confirm với dev nếu wiki ghi hashUuid) |

 Bổ sung:
+ | `mention_type_details` | `MENTION_TYPE.POST` (= `1`) |
+ | `is_to_topic` | `true` hoặc logic từ topic matching |
+ | `rating_score` | `0` (YouTube không có star rating) |
```

### 6.2 Sửa Section 3.2 — Posts mapping

```diff
 Bổ sung:
+ | `avatar` | Từ `channels.list.snippet.thumbnails.default.url` hoặc `source.avatar` |
+ | `language` | Từ `source.language` hoặc detect |
+ | `subscriber_count` | Từ `channels.list.statistics.subscriberCount` |
+ | `fullname` | Từ `source.fullname` hoặc `channels.list.snippet.title` |
+ | `post_last_date` | `max(items[].snippet.publishedAt)` |
+ | `post_updated_at` | Unix timestamp crawl time |
+ | `next_crawl_time` | Tính bởi scheduler |
+ | `link` | `youtube.com/channel/{channelId}` (confirm format với Prod) |
```

### 6.3 Bổ sung Section — Identities mapping

```diff
 Bổ sung mapping table cho Identities:
+ | `id` | `hashUuid(...)` — cần confirm formula |
+ | `id_source` | Channel ID gốc |
+ | `id_social` | Video ID (theo Prod) hoặc Channel ID (theo test) — ⚠️ cần confirm |
+ | `title` | Video title hoặc channel title |
+ | `created_date` | Video `publishedAt` hoặc channel created date |
+ | `crawled_date` | Crawl time |
+ | `comment_updated_at` | Unix timestamp update comment cuối |
```

### 6.4 Sửa Section 9 — Audit mentions kết luận

```diff
- | `engagement_total` | Tất cả bằng `0`, bằng `views + likes + comments` trong output hiện tại. | Pass theo output hiện tại |
+ | `engagement_total` | Tất cả bằng `0`, bằng `likes + comments + shares` trong output hiện tại. ⚠️ Formula gốc sai, đã sửa. | Pass theo output hiện tại |
```

### 6.5 Bổ sung Section — Backward Compatibility Check

File mapping gốc thiếu hoàn toàn section so sánh output new source vs Prod data. Đề xuất thêm section "Cross-validation with Production" như section 4 của file bổ sung này.

---

## 7. Kết luận audit bổ sung

### Tổng hợp theo mức độ

| Mức độ | Số lượng | Danh sách |
|---|---|---|
| 🔴 Critical / High | 5 | ERR-1, ERR-2, MISS-1, MISS-2, MISS-4 |
| 🟡 Medium | 6 | BC-1, BC-2, BC-3, MISS-3, MISS-5, MISS-6 |

### Đánh giá tổng thể

| Tiêu chí | Đánh giá |
|---|---|
| **Cấu trúc file mapping** | ✅ Tốt — flow audit rõ ràng, có hệ thống |
| **Core field mapping** | ⚠️ Cần sửa — `engagement_total` formula sai, `id_source`/`identity` mâu thuẫn |
| **Field coverage** | ❌ Thiếu — khoảng 15+ fields trên Prod không được audit |
| **Backward compatibility** | ❌ Không có — không so sánh output new vs old source |
| **Identity mapping** | ❌ Quá sơ sài — thiếu hầu hết fields |
| **Nghiệp vụ YouTube** | ⚠️ Cần review — formula engagement sai cho thấy cần hiểu rõ hơn metric YouTube |

### Ưu tiên xử lý

1. **Ngay lập tức:** Sửa formula `engagement_total`, confirm `id_source`/`identity` format
2. **Trước khi release:** Bổ sung audit `mention_type_details`, `is_to_topic`, posts missing fields
3. **Trước khi migrate data:** Hoàn thành backward compatibility check, confirm breaking changes
4. **Nice to have:** Bổ sung identity mapping table đầy đủ, thêm dump `videos.list.statistics` API
