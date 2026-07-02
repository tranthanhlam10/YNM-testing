# 🔍 Review: So sánh Wiki BA vs Wiki Dev — YNMPDP-5679

## Tóm tắt nhanh

> [!CAUTION]
> Phát hiện **nhiều điểm không khớp** giữa yêu cầu BA và query Solr của Dev. Các lỗi chính liên quan đến **thiếu điều kiện loại trừ (exclusion filter)** trong Solr query, dẫn đến **crawl trùng lặp** hoặc **crawl sai tần suất**.

---

## 📋 4 Điều kiện BA yêu cầu (Nguồn gốc)

BA quy định rõ 4 điều kiện query cho crawling comments, với **thứ tự ưu tiên từ cao → thấp**:

| # | Điều kiện BA | Solr Query đúng cần có | Tần suất |
|---|---|---|---|
| **①** | `topic_types contains 3 OR 4` | `topic_types:(3 4)` | Client/Demo |
| **②** | `topic_types = 5` AND **not contain (3, 4)** | `topic_types:(5)` **AND** `-topic_types:(3 4)` | SocialTrend |
| **③** | `topic_types = 1` AND **not contain (3, 4, 5)** | `topic_types:(1)` **AND** `-topic_types:(3 4 5)` | Internal |
| **④** | `is_kol = TRUE` AND **not contain topic_types (3, 4, 5)** | `is_kol:true` **AND** `-topic_types:(3 4 5)` | KOL |

**Bảng cases của BA:**

| Trường hợp | topic_types | Action |
|---|---|---|
| Post chỉ thuộc **Client/Demo** | `[3]` hoặc `[4]` hoặc `[3,4]` | Crawl theo Client/Demo |
| Post thuộc **Client/Demo** + Internal/SocialTrend | `[3,1]` hoặc `[4,5]`... | Crawl theo Client/Demo (ưu tiên cao nhất) |
| Post **chỉ** thuộc SocialTrend | `[5]` | Crawl theo SocialTrend |
| Post **chỉ** thuộc Internal | `[1]` | Crawl theo Internal |
| Post thuộc KOL (`is_kol=true`) | Không có `topic_types` hoặc `=[1]` | Crawl theo KOL |

---

## 🚨 Các điểm KHÔNG KHỚP

---

### Lỗi 1: Loader Internal (Priority) — THIẾU exclusion filter

> [!WARNING]
> **Ảnh hưởng: Facebook Page + Group (Source mới)**
> Post có `topic_types=[1,3]` sẽ bị crawl BỞI CẢ 2 loader → crawl trùng lặp

**BA yêu cầu:**
```
topic_types = 1 AND not contain (3, 4, 5)
```

**Dev query THỰC TẾ:**

| Loader | Query Dev đang dùng | Lỗi |
|---|---|---|
| `PagePriorityCommentCrawlingLoader` | `topic_types: (1)` | ❌ **Thiếu** `-topic_types:(3 4 5)` |
| `GroupPriorityCommentCrawlingLoader` | `topic_types: (1)` | ❌ **Thiếu** `-topic_types:(3 4 5)` |

**Query đúng theo BA:**
```
topic_types:(1) AND -topic_types:(3 4 5)
```

**Hậu quả:** Một post có `topic_types=[1, 3]` (vừa Internal vừa Client) sẽ:
- ✅ Match loader HighPriority (`topic_types:(3 4)`) → crawl theo tần suất Client ✅
- ❌ **CŨNG match** loader Priority (`topic_types:(1)`) → crawl thêm lần nữa theo tần suất Internal ❌
- → **Crawl trùng 2 lần**, lãng phí resource

---

### Lỗi 2: Loader SocialTrend — THIẾU exclusion filter

> [!WARNING]
> **Ảnh hưởng: Facebook Page + Group (Source mới)**
> Post có `topic_types=[3,5]` sẽ bị crawl BỞI CẢ 2 loader → crawl trùng lặp

**BA yêu cầu:**
```
topic_types = 5 AND not contain (3, 4)
```

**Dev query THỰC TẾ:**

| Loader | Query Dev đang dùng | Lỗi |
|---|---|---|
| `PageSocialtrendCommentCrawlingLoader` | `topic_types: (5)` | ❌ **Thiếu** `-topic_types:(3 4)` |
| `GroupSocialtrendCommentCrawlingLoader` | `topic_types: (5)` | ❌ **Thiếu** `-topic_types:(3 4)` |

**Query đúng theo BA:**
```
topic_types:(5) AND -topic_types:(3 4)
```

**Hậu quả:** Một post có `topic_types=[3, 5]` (vừa Client vừa SocialTrend) sẽ:
- ✅ Match loader HighPriority (`topic_types:(3 4)`) → crawl theo Client ✅  
- ❌ **CŨNG match** loader SocialTrend (`topic_types:(5)`) → crawl thêm theo SocialTrend ❌
- → **Crawl trùng 2 lần**

---

### Lỗi 3: Loader KOL (Socialift) — Exclusion filter SAI so với BA

> [!WARNING]
> **Ảnh hưởng: Facebook Page (Source mới)**
> KOL post với `topic_types=[1]` bị loại trừ sai khỏi luồng KOL

**BA yêu cầu:**
```
is_kol = TRUE AND not contain topic_types (3, 4, 5)
```
→ BA **KHÔNG** yêu cầu loại trừ `topic_types=1`. KOL post có Internal topic vẫn nên crawl theo tần suất KOL.

**Dev query THỰC TẾ:**

| Loader | Query Dev đang dùng | Lỗi |
|---|---|---|
| `PageSocialiftCommentCrawlingLoader` | `is_kol:true` AND `-topic_types:(1 3 4 5)` | ❌ **Loại trừ thừa** `1` |

**Query đúng theo BA:**
```
is_kol:true AND -topic_types:(3 4 5)
```

**So sánh cross-platform — KOL loader không nhất quán:**

| Platform | Source | Query KOL exclusion | So với BA |
|---|---|---|---|
| Facebook Page (mới) | `PageSocialiftCommentCrawlingLoader` | `-topic_types:(1 3 4 5)` | ❌ Thừa `1` |
| TikTok (mới) | `TiktokPostCommentSLCrawlingLoader` | `-topic_types:(3 4 5)` | ✅ Đúng |
| TikTok (cũ) | `tiktok-get-latest-post-comments-sl` | `-topic_types:(3 4 5)` | ✅ Đúng |
| Facebook User (cũ) | `user-post-comments-socialift` | `-topic_types:(3 4 5)` | ✅ Đúng |

> [!IMPORTANT]
> Facebook Page (source mới) loại trừ `-topic_types:(1 3 4 5)` trong khi tất cả platform khác loại trừ `-topic_types:(3 4 5)`. Đây là **không nhất quán** và **sai so với BA**.

---

### Lỗi 4: Threads — THIẾU loader cho Internal, SocialTrend, KOL

> [!CAUTION]
> **Ảnh hưởng: Threads (Source mới)**
> Threads chỉ có 3 loại loader, thiếu 3 loại so với yêu cầu BA

**BA yêu cầu 4 loại loader cho MỌI platform:**
1. Client/Demo (`topic_types: 3,4`)
2. SocialTrend (`topic_types: 5`)
3. Internal (`topic_types: 1`)
4. KOL (`is_kol: true`)

**Threads Comment - Dev chỉ implement:**

| Loader | Filter | Tương ứng BA |
|---|---|---|
| `PostCommentCrawlingLoader` | Không filter topic_types | Normal ✅ |
| `PriorityPostCommentCrawlingLoader` | `topic_types:(3 4)` | Client/Demo ✅ |
| `CrisisPostCommentCrawlingLoader` | `priority:99` | Crisis ✅ |
| ❌ *Không có* | — | **Internal** ❌ THIẾU |
| ❌ *Không có* | — | **SocialTrend** ❌ THIẾU |
| ❌ *Không có* | — | **KOL** ❌ THIẾU |

**Threads SubComment - Tương tự cũng thiếu:**

| Loader | Filter | Tương ứng BA |
|---|---|---|
| `CommentSubCommentCrawlingLoader` | Không filter | Normal ✅ |
| `PriorityCommentSubCommentCrawlingLoader` | `topic_types:(3 4)` | Client/Demo ✅ |
| `CrisisCommentSubCommentCrawlingLoader` | `priority:99` | Crisis ✅ |
| ❌ *Không có* | — | **Internal** ❌ THIẾU |
| ❌ *Không có* | — | **SocialTrend** ❌ THIẾU |
| ❌ *Không có* | — | **KOL** ❌ THIẾU |

---

### Lỗi 5: TikTok Priority (Source mới) — GỘP tất cả topic_types vào 1 loader

> [!WARNING]
> **Ảnh hưởng: TikTok (Source mới)**
> Internal, Client, Demo, SocialTrend crawl cùng tần suất thay vì phân biệt

**BA yêu cầu:** Mỗi loại topic_types có **tần suất crawl KHÁC NHAU**

**Dev query THỰC TẾ:**

| Loader | Query | Lỗi |
|---|---|---|
| `TiktokPriorityPostCommentCrawlingLoader` | `topic_types:(1 3 4 5)` | ❌ **Gộp tất cả** vào 1 loader |

**BA cần tách thành ít nhất 3 loader riêng biệt:**
- Client/Demo: `topic_types:(3 4)`
- SocialTrend: `topic_types:(5)` AND `-topic_types:(3 4)`
- Internal: `topic_types:(1)` AND `-topic_types:(3 4 5)`

**Hậu quả:** Post Internal (tần suất thấp) sẽ được crawl cùng tần suất với Client/Demo (tần suất cao) → **lãng phí resource**

---

### Lỗi 6: YouTube + TikTok (Source cũ) — GỘP topic_types không đúng

> [!WARNING]
> **Ảnh hưởng: YouTube, TikTok (Source cũ)**

**YouTube (cả 2 script đang chạy):**

| Script | Query | Lỗi |
|---|---|---|
| `monitoring_priority_video` | `topic_types:(1 3 4 5)` | ❌ Gộp tất cả, không phân tần suất |
| `get_latest_priority_comments_replies` | `topic_types:(1 3 4 5)` | ❌ Gộp tất cả, không phân tần suất |

**TikTok (source cũ):**

| Script | Query | Lỗi |
|---|---|---|
| `get_latest_post_comments` | `topic_types:(1 5)` | ❌ Gộp Internal + SocialTrend (tần suất khác nhau) |

---

## 📊 Tổng hợp tất cả lỗi theo Platform

| Platform | Source | Lỗi |
|---|---|---|
| **Facebook Page** | Mới | ❌ Internal thiếu exclusion, ❌ SocialTrend thiếu exclusion, ❌ KOL exclusion sai |
| **Facebook Group** | Mới | ❌ Internal thiếu exclusion, ❌ SocialTrend thiếu exclusion |
| **Threads** | Mới | ❌ Thiếu loader Internal, SocialTrend, KOL (cả Comment và SubComment) |
| **TikTok** | Mới | ❌ Gộp tất cả topic_types vào 1 loader |
| **TikTok** | Cũ | ❌ Gộp Internal + SocialTrend |
| **YouTube** | Cũ | ❌ Gộp tất cả topic_types vào 1 loader |
| **Facebook User** | Cũ | ✅ OK (Client/Demo + KOL tách riêng đúng) |

---

## ✅ Các phần ĐÃ ĐÚNG

| Loader | Platform | Query | Đánh giá |
|---|---|---|---|
| `PageHighPriorityCommentCrawlingLoader` | FB Page | `topic_types:(3 4)` | ✅ Đúng BA |
| `GroupHighPriorityCommentCrawlingLoader` | FB Group | `topic_types:(3 4)` | ✅ Đúng BA |
| `GroupClosedPriorityCommentCrawlingLoader` | FB Group Closed | `topic_types:(3 4)` | ✅ Đúng BA |
| `PriorityPostCommentCrawlingLoader` | Threads | `topic_types:(3 4)` | ✅ Đúng BA |
| `PriorityCommentSubCommentCrawlingLoader` | Threads Sub | `topic_types:(3 4)` | ✅ Đúng BA |
| `user-post-comments-sh` | FB User (cũ) | `topic_types:(3 4)` | ✅ Đúng BA |
| `user-post-comments-socialift` | FB User (cũ) | `is_kol:true`, `-topic_types:(3 4 5)` | ✅ Đúng BA |
| `tiktok-get-latest-priority-post-comments` | TikTok (cũ) | `topic_types:(3 4)` | ✅ Đúng BA |
| `tiktok-get-latest-post-comments-sl` | TikTok (cũ) | `is_kol:true`, `-topic_types:(3 4 5)` | ✅ Đúng BA |
| `TiktokPostCommentSLCrawlingLoader` | TikTok (mới) | `is_kol:true`, `-topic_types:(3 4 5)` | ✅ Đúng BA |
| Tất cả Crisis/Normal loader | Tất cả | Không liên quan topic_types | ✅ OK |

---

## 🔧 Đề xuất fix

### Fix ngay (Ảnh hưởng trực tiếp đến crawl trùng lặp):

**1. Facebook Page/Group — Thêm exclusion filter:**

```diff
# PagePriorityCommentCrawlingLoader (Internal)
- "topic_types": "(1)"
+ "topic_types": "(1)", "-topic_types": "(3 4 5)"

# PageSocialtrendCommentCrawlingLoader
- "topic_types": "(5)"
+ "topic_types": "(5)", "-topic_types": "(3 4)"

# GroupPriorityCommentCrawlingLoader (Internal)
- "topic_types": "(1)"
+ "topic_types": "(1)", "-topic_types": "(3 4 5)"

# GroupSocialtrendCommentCrawlingLoader
- "topic_types": "(5)"
+ "topic_types": "(5)", "-topic_types": "(3 4)"
```

**2. Facebook Page — Sửa KOL exclusion:**

```diff
# PageSocialiftCommentCrawlingLoader
- "-topic_types": "(1 3 4 5)"
+ "-topic_types": "(3 4 5)"
```

### Cần discuss với team (Thiết kế loader):

**3. Threads** — Cần thêm loader cho Internal, SocialTrend, KOL (cả Comment + SubComment)

**4. TikTok (source mới)** — Cần tách `TiktokPriorityPostCommentCrawlingLoader` thành 3 loader riêng

**5. YouTube + TikTok (source cũ)** — Cần tách query `topic_types:(1 3 4 5)` và `topic_types:(1 5)` thành các script riêng theo tần suất

---

## ⚠️ Lưu ý quan trọng

Trong Solr, field `topic_types` là **multiValued**. Khi query `topic_types:(3 4)`, Solr sẽ trả về tất cả document có topic_types **chứa** 3 HOẶC 4 (hoặc cả hai). Điều này có nghĩa:
- Một post có `topic_types=[1, 3]` sẽ match CẢ `topic_types:(1)` LẪN `topic_types:(3 4)`
- Nếu không có exclusion filter (`-topic_types:(...)`) thì post đó sẽ bị load bởi **nhiều loader** cùng lúc
- Đây chính là nguyên nhân gốc của vấn đề crawl trùng
