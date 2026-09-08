# 🚨 Danh sách các luồng bị lỗi query topic_types — theo Platform

---

## 1. Facebook Page (Source mới)

### 1.1 `PagePriorityCommentCrawlingLoader` (Internal)

**Query hiện tại (SAI):**
```json
{
  "filter": {
    "topic_types": "(1)",
    "source_type": 2,
    "created_date": "[NOW-15DAYS TO *]",
    "next_crawl_time": "[* TO NOW]",
    "-last_status": "(4 5)"
  }
}
```

> ❌ **Lỗi:** Thiếu `-topic_types:(3 4 5)` → Post có `topic_types=[1,3]` sẽ bị crawl trùng với loader HighPriority

**Query đúng theo BA:**
```diff
  "filter": {
    "topic_types": "(1)",
+   "-topic_types": "(3 4 5)",
    "source_type": 2,
    ...
  }
```

---

### 1.2 `PageSocialtrendCommentCrawlingLoader` (SocialTrend)

**Query hiện tại (SAI):**
```json
{
  "filter": {
    "topic_types": "(5)",
    "source_type": 2,
    "created_date": "[NOW-7DAYS TO *]",
    "next_crawl_time": "[* TO NOW]",
    "-last_status": "(4 5)"
  }
}
```

> ❌ **Lỗi:** Thiếu `-topic_types:(3 4)` → Post có `topic_types=[3,5]` sẽ bị crawl trùng với loader HighPriority

**Query đúng theo BA:**
```diff
  "filter": {
    "topic_types": "(5)",
+   "-topic_types": "(3 4)",
    "source_type": 2,
    ...
  }
```

---

### 1.3 `PageSocialiftCommentCrawlingLoader` (KOL)

**Query hiện tại (SAI):**
```json
{
  "filter": {
    "is_kol": true,
    "-topic_types": "(1 3 4 5)",
    "source_type": 2,
    "created_date": "[NOW-7DAYS TO *]",
    "-last_status": "(4 5)"
  }
}
```

> ❌ **Lỗi:** Loại trừ thừa `1` (Internal). BA chỉ yêu cầu loại trừ `(3 4 5)`. KOL post có `topic_types=[1]` vẫn nên crawl theo KOL.

**Query đúng theo BA:**
```diff
  "filter": {
    "is_kol": true,
-   "-topic_types": "(1 3 4 5)",
+   "-topic_types": "(3 4 5)",
    ...
  }
```

---

## 2. Facebook Group (Source mới)

### 2.1 `GroupPriorityCommentCrawlingLoader` (Internal)

**Query hiện tại (SAI):**
```json
{
  "filter": {
    "topic_types": "(1)",
    "source_type": 3,
    "created_date": "[NOW-15DAYS TO *]",
    "-closed_group": true,
    "-last_status": "(4 5)"
  }
}
```

> ❌ **Lỗi:** Thiếu `-topic_types:(3 4 5)`

**Query đúng theo BA:**
```diff
  "filter": {
    "topic_types": "(1)",
+   "-topic_types": "(3 4 5)",
    "source_type": 3,
    ...
  }
```

---

### 2.2 `GroupSocialtrendCommentCrawlingLoader` (SocialTrend)

**Query hiện tại (SAI):**
```json
{
  "filter": {
    "topic_types": "(5)",
    "source_type": 3,
    "created_date": "[NOW-7DAYS TO *]",
    "-closed_group": true,
    "-last_status": "(4 5)"
  }
}
```

> ❌ **Lỗi:** Thiếu `-topic_types:(3 4)`

**Query đúng theo BA:**
```diff
  "filter": {
    "topic_types": "(5)",
+   "-topic_types": "(3 4)",
    "source_type": 3,
    ...
  }
```

---

## 3. Threads (Source mới) — THIẾU LOADER

### 3.1 Threads Comment — Thiếu 3 loader

Hiện tại chỉ có:
- ✅ `PostCommentCrawlingLoader` (Normal)
- ✅ `PriorityPostCommentCrawlingLoader` → `topic_types:(3 4)` (Client/Demo)
- ✅ `CrisisPostCommentCrawlingLoader` → `priority:99` (Crisis)

**Thiếu hoàn toàn:**

| Loader cần thêm | Query đúng theo BA |
|---|---|
| ❌ **InternalPostCommentCrawlingLoader** | `fq=topic_types:(1)`, `fq=-topic_types:(3 4 5)` |
| ❌ **SocialtrendPostCommentCrawlingLoader** | `fq=topic_types:(5)`, `fq=-topic_types:(3 4)` |
| ❌ **SocialiftPostCommentCrawlingLoader** | `fq=is_kol:true`, `fq=-topic_types:(3 4 5)` |

---

### 3.2 Threads SubComment — Thiếu 3 loader

Hiện tại chỉ có:
- ✅ `CommentSubCommentCrawlingLoader` (Normal)
- ✅ `PriorityCommentSubCommentCrawlingLoader` → `topic_types:(3 4)` (Client/Demo)
- ✅ `CrisisCommentSubCommentCrawlingLoader` → `priority:99` (Crisis)

**Thiếu hoàn toàn:**

| Loader cần thêm | Query đúng theo BA |
|---|---|
| ❌ **InternalCommentSubCommentCrawlingLoader** | `fq=topic_types:(1)`, `fq=-topic_types:(3 4 5)` |
| ❌ **SocialtrendCommentSubCommentCrawlingLoader** | `fq=topic_types:(5)`, `fq=-topic_types:(3 4)` |
| ❌ **SocialiftCommentSubCommentCrawlingLoader** | `fq=is_kol:true`, `fq=-topic_types:(3 4 5)` |

---

## 4. TikTok (Source mới) — GỘP SAI

### 4.1 `TiktokPriorityPostCommentCrawlingLoader`

**Query hiện tại (SAI):**
```
fq=topic_types:(1 3 4 5)
fq=-last_status:4
sort=id asc
```

> ❌ **Lỗi:** Gộp tất cả topic_types vào 1 loader → Internal, Client/Demo, SocialTrend crawl cùng tần suất

**Cần tách thành 3 loader riêng:**

| Loader cần có | Query đúng theo BA |
|---|---|
| **TiktokHighPriorityPostCommentCrawlingLoader** | `fq=topic_types:(3 4)`, `fq=-last_status:4` |
| **TiktokInternalPostCommentCrawlingLoader** | `fq=topic_types:(1)`, `fq=-topic_types:(3 4 5)`, `fq=-last_status:4` |
| **TiktokSocialtrendPostCommentCrawlingLoader** | `fq=topic_types:(5)`, `fq=-topic_types:(3 4)`, `fq=-last_status:4` |

---

## 5. YouTube (Source cũ) — GỘP SAI

### 5.1 `monitoring_priority_video`

**Query hiện tại (SAI):**
```
fq=topic_types:(1 3 4 5)
fq=created_date:[NOW-30DAYS TO *]
fq=next_crawl_time:[* TO NOW]
sort=next_crawl_time asc,id desc
```

> ❌ **Lỗi:** Gộp tất cả topic_types vào 1 script, không phân biệt tần suất

---

### 5.2 `get_latest_priority_comments_replies`

**Query hiện tại (SAI):**
```
fq=topic_types:(1 3 4 5)
fq=video_id:*
fq=created_date:[NOW-30DAYS TO *]
fq=next_crawl_time:[* TO NOW]
sort=next_crawl_time asc,id desc
```

> ❌ **Lỗi:** Gộp tất cả topic_types vào 1 script, không phân biệt tần suất

---

## 6. TikTok (Source cũ) — GỘP SAI

### 6.1 `get_latest_post_comments`

**Query hiện tại (SAI):**
```
fq=topic_types:(1 5)
fq=-last_status:4
fq=created_date:[NOW-7DAYS TO *]
sort=id asc
```

> ❌ **Lỗi:** Gộp Internal (`1`) + SocialTrend (`5`) vào 1 script. BA yêu cầu 2 tần suất khác nhau.

---

## 📊 Tổng hợp

| # | Platform | Source | Loader bị lỗi | Loại lỗi |
|---|---|---|---|---|
| 1 | FB Page | Mới | `PagePriorityCommentCrawlingLoader` | Thiếu exclusion |
| 2 | FB Page | Mới | `PageSocialtrendCommentCrawlingLoader` | Thiếu exclusion |
| 3 | FB Page | Mới | `PageSocialiftCommentCrawlingLoader` | Exclusion sai |
| 4 | FB Group | Mới | `GroupPriorityCommentCrawlingLoader` | Thiếu exclusion |
| 5 | FB Group | Mới | `GroupSocialtrendCommentCrawlingLoader` | Thiếu exclusion |
| 6 | Threads | Mới | *(thiếu Internal loader)* | Thiếu loader |
| 7 | Threads | Mới | *(thiếu SocialTrend loader)* | Thiếu loader |
| 8 | Threads | Mới | *(thiếu KOL loader)* | Thiếu loader |
| 9 | Threads | Mới | *(thiếu Internal sub-comment loader)* | Thiếu loader |
| 10 | Threads | Mới | *(thiếu SocialTrend sub-comment loader)* | Thiếu loader |
| 11 | Threads | Mới | *(thiếu KOL sub-comment loader)* | Thiếu loader |
| 12 | TikTok | Mới | `TiktokPriorityPostCommentCrawlingLoader` | Gộp sai |
| 13 | YouTube | Cũ | `monitoring_priority_video` | Gộp sai |
| 14 | YouTube | Cũ | `get_latest_priority_comments_replies` | Gộp sai |
| 15 | TikTok | Cũ | `get_latest_post_comments` | Gộp sai |

**Tổng: 15 luồng bị lỗi** (5 thiếu exclusion/sai exclusion + 6 thiếu loader + 4 gộp sai)
