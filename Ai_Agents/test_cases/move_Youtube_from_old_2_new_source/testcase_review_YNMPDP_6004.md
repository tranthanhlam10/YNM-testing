# 📋 TEST CASE REVIEW REPORT
## YNMPDP-6004 — [New Crawler] Youtube Post
### Bộ Test Cases trên Google Sheets

| Field | Value |
|---|---|
| **Tài liệu được review** | [Google Sheets - Test case](https://docs.google.com/spreadsheets/d/1ST5vBv4YgbnuTslh7hJFpNOg2b-Ik730D3_fe-DB1Zk/edit?gid=1704880699#gid=1704880699) |
| **Jira ticket** | [YNMPDP-6004](https://jira.younetco.com/browse/YNMPDP-6004) |
| **Người review** | Senior QA/Test Analyst (AI-assisted) |
| **Ngày review** | 10/07/2026 |
| **Tổng số test cases** | **56 cases** |
| **Kết luận tổng thể** | **Chất lượng tốt — Cần bổ sung thêm một số cases và sửa vài điểm nhỏ** |

---

## 1. NHẬN XÉT TỔNG QUAN

> [!NOTE]
> Bộ test case **56 cases** được viết ở **mức chuyên nghiệp cao**, thể hiện hiểu biết sâu về kiến trúc data pipeline. Cấu trúc phân module rõ ràng, test data cụ thể dạng JSON, expected result chi tiết đến từng field. Đặc biệt ấn tượng ở việc sử dụng `Need Confirm` annotations hợp lý và test data có giá trị thực tế.

### Thống kê tổng quan:

| Module | Số cases | Positive | Negative | Edge/Boundary |
|---|:---:|:---:|:---:|:---:|
| Smoke/Environment | 6 | 5 | 1 | 0 |
| Loader | 14 | 4 | 6 | 4 |
| Builder | 10 | 5 | 3 | 2 |
| Crawler/API | 10 | 2 | 5 | 3 |
| Resolver Mapping | 16 | 8 | 3 | 5 |
| Paging & Source Update | 8 | 4 | 2 | 2 |
| Persistence/Regression | 4 | 3 | 0 | 1 |
| Non-functional | 8 | 2 | 3 | 3 |
| **Tổng** | **56** (nằm trong ước lượng 71-98 của Test Plan, nhưng hơi thấp) |

### Đánh giá nhanh:

| Tiêu chí | Đánh giá | Ghi chú |
|---|:---:|---|
| Cấu trúc & naming convention | ⭐⭐⭐⭐⭐ | `TC_MODULE_NNN`, tên mô tả rõ [Priority][Type] |
| Test steps rõ ràng, executable | ⭐⭐⭐⭐ | Đủ bước, nhưng một số case thiếu step verify cụ thể |
| Test data quality | ⭐⭐⭐⭐⭐ | JSON format, giá trị thực tế, sample data hợp lý |
| Expected result cụ thể | ⭐⭐⭐⭐ | Chi tiết đến field level, nhưng vài case nên có expected value cứng |
| Coverage vs requirement | ⭐⭐⭐⭐ | Cover tốt happy/negative/edge, thiếu một số area (xem Section 4) |
| Traceability to Wiki/Jira | ⭐⭐⭐ | Không có cột Requirement ID — khó map ngược |
| Priority assignment | ⭐⭐⭐ | Cột Priority để trống trong data, chỉ ghi trong Test Name |

---

## 2. CÁC LỖI / VẤN ĐỀ TRONG TESTCASE HIỆN TẠI

### 🔴 2.1 Vấn đề cấu trúc (Structural Issues)

#### 2.1.1 Cột PRIORITY hoàn toàn trống

Mặc dù test name có ghi `[High]`, `[Medium]` nhưng **cột PRIORITY (cột K)** trong spreadsheet hoàn toàn trống cho tất cả 56 cases. Điều này gây khó khăn khi:
- Filter/sort theo priority
- Báo cáo coverage theo priority level
- Quyết định test nào chạy trước khi bị time pressure

**→ Fix:** Populate cột PRIORITY từ tag trong test name: `High` → P0, `Medium` → P1.

---

#### 2.1.2 Thiếu cột Requirement ID / Traceability

Sheet không có cột mapping test case ↔ wiki requirement/test plan hạng mục. Ví dụ:
- TC_LOADER_001 tương ứng Test Plan Module 1, STT #1-#2
- TC_RESOLVER_004 tương ứng Test Plan Module 4, STT #19

Không có mapping này, rất khó biết requirement nào đã được cover và requirement nào bị bỏ sót.

**→ Fix:** Thêm cột `REQ_ID` hoặc `TEST_PLAN_REF` link đến STT trong test plan.

---

#### 2.1.3 OverView sheet chưa cập nhật cho Youtube Post

Sheet OverView hiện ghi `FEATURE NAME = "Proxy cho các luồng cũ"` — đây là feature khác, không phải Youtube Post crawler. Cần cập nhật để reflect đúng task YNMPDP-6004.

---

### 🟡 2.2 Vấn đề nội dung / logic (Content & Logic Issues)

#### 2.2.1 TC_LOADER_001 — Test data thiếu field `is_kol` và `category`

Expected result ghi verify đủ field bao gồm `is_kol`, `category`, nhưng test data source chỉ có:
```json
{"id", "platform", "country_code", "last_status", "next_crawl_time", "priority", "fullname"}
```
Thiếu `is_kol`, `category`, `post_updated_at`, `post_last_date`, `id_social`, `link`.

**→ Fix:** Bổ sung đầy đủ field trong test data hoặc ghi rõ "các field khác có giá trị default/null" để tester biết expected behavior.

---

#### 2.2.2 TC_BUILDER_006 — Assumption quá mạnh về UC prefix validation

Test case giả định Builder phải reject channel id không bắt đầu bằng `UC`. Tuy nhiên:
- Wiki chỉ mô tả logic convert `UC` → `UU`
- Không rõ implementation có **validate** prefix hay chỉ **replace** 2 ký tự đầu

Nếu implementation chỉ replace blind, `INVALID_CHANNEL_ID` sẽ thành `INALID_CHANNEL_ID` → vẫn tạo request (sai).

**→ Fix:** Ghi rõ 2 expected scenarios: (1) Nếu có validation thì reject, (2) Nếu không validation thì tạo request nhưng API sẽ trả lỗi → cần confirm behavior thực tế.

---

#### 2.2.3 TC_RESOLVER_013 — `engagement_total` tính sai trong expected

Expected ghi `engagement_total = 1032` nhưng test data có:
- viewCount = 1000, likeCount = 25, commentCount = 7
- Đúng ra: 1000 + 25 + 7 = **1032** ✅

Kiểm tra lại thì kết quả đúng. Tuy nhiên, expected nên ghi rõ **công thức** thay vì chỉ giá trị để reviewer/tester biết logic:
```
engagement_total = views + likes + comments = 1000 + 25 + 7 = 1032
```

---

#### 2.2.4 TC_RESOLVER_010 & TC_RESOLVER_011 — Priority thumbnail không nhất quán

- TC_RESOLVER_010 expected: `maxres > high > medium > default` (khớp wiki)
- TC_RESOLVER_011 cũng dùng đúng priority này
- NHƯNG TC_RESOLVER_012 test `standard` thumbnail behavior

**Vấn đề:** Wiki ghi priority `maxres > high > medium > default` — **bỏ qua `standard`**. Nhưng response mẫu Youtube có `standard`. Nếu code implementation có xử lý `standard`, test case TC_RESOLVER_011 nên test thêm case:
- Có `standard` nhưng không có `maxres/high` → chọn `standard` hay `medium`?

**→ TC_RESOLVER_012 đã cover điểm này với annotation `Need Confirm` — đây là cách xử lý tốt.** Chỉ cần đảm bảo Dev confirm trước khi execute.

---

### 🟢 2.3 Vấn đề coverage (Coverage Gaps)

#### 2.3.1 Thiếu test cho `updated_at` field

Wiki mapping ghi `updated_at = new Date().toISOString()` (crawl time, not video time). Không có test case nào verify:
- `updated_at` là thời điểm crawl chứ không phải video publish time
- `updated_at` khác `created_date`

#### 2.3.2 Thiếu test cho `mention_type` constant value

Wiki ghi `mention_type = MENTION_TYPE.POST`. Không có case nào verify giá trị numeric thực tế trong Solr.

#### 2.3.3 Thiếu test cho `domain` field constant

TC_RESOLVER_005 verify `domain=youtube.com` nhưng chỉ trong expected result text. Nên có dedicated case hoặc verify rõ ràng hơn.

#### 2.3.4 Thiếu test cho `shard` derivation

Wiki ghi `shard derived from created_date` nhưng không có test case verify shard value.

#### 2.3.5 Thiếu test cho Loader `last_status` hợp lệ (không phải 4/5)

TC_LOADER_003/004 test exclude `last_status = 4, 5`. Nhưng thiếu case positive:
- Source có `last_status = 0` → loaded ✅ (TC_LOADER_001 cover ngầm)
- Source có `last_status = 1, 2, 3` → loaded ✅ (không có case nào test explicit)

---

## 3. TESTCASE CẦN CHỈNH SỬA

### 📝 3.1 TC_LOADER_001 — Bổ sung test data đầy đủ field

**Hiện tại:**
```json
{"source":{"id":"UC_VALID_LOADER_0000000001","platform":7,"country_code":"VN",
"last_status":0,"next_crawl_time":"2026-07-10T00:00:00.000Z","priority":1,
"fullname":"QA Valid Channel"}}
```

**Đề xuất sửa:**
```json
{"source":{"id":"UC_VALID_LOADER_0000000001","id_social":"UC_VALID_LOADER_0000000001",
"link":"youtube.com/channel/UC_VALID_LOADER_0000000001","platform":7,
"country_code":"VN","last_status":0,"next_crawl_time":"2026-07-10T00:00:00.000Z",
"priority":1,"fullname":"QA Valid Channel","post_updated_at":"2026-06-01T00:00:00.000Z",
"post_last_date":"2026-06-01T00:00:00.000Z","category":10,"is_kol":false}}
```

---

### 📝 3.2 TC_BUILDER_006 — Clarify expected behavior

**Expected result hiện tại:**
> Builder không tạo request sai playlistId gây gọi API vô nghĩa.

**Đề xuất sửa:**
> - **Scenario A (nếu Builder validate UC prefix):** Builder reject message, log invalid source reason, message đi dead-letter hoặc skip, service không crash.
> - **Scenario B (nếu Builder không validate prefix):** Builder replace 2 ký tự đầu tạo playlistId "INALID_CHANNEL_ID", Crawler gọi API sẽ trả lỗi 404 → error handling bình thường.
> - **→ Need Confirm với Dev: Builder có validate UC prefix không?**

---

### 📝 3.3 TC_RESOLVER_013 — Thêm công thức engagement

**Expected result bổ sung:**
> - `engagement_total = views + likes + comments = 1000 + 25 + 7 = 1032`
> - `engagement_s_c = comments = 7`
> - `shares = 0` (Youtube API không có share count)
> - **Verify kiểu dữ liệu:** statistics từ Youtube API trả về dạng **string** ("1000"), cần parse thành **number** (1000).

---

### 📝 3.4 TC_SMOKE_006 — Test type nên là Security, không phải Functional

**Hiện tại:** TEST TYPE = Functional
**Đề xuất:** TEST TYPE = Security

---

### 📝 3.5 TC_NFR_004 — Test type nên là Security

**Hiện tại:** TEST TYPE = (implicit Functional)
**Đề xuất:** TEST TYPE = Security

---

### 📝 3.6 TC_CRAWLER_010 — Test type nên là Security

**Hiện tại:** TEST TYPE = Functional
**Đề xuất:** TEST TYPE = Security

Tất cả các case liên quan secret/credential/token exposure nên được classify là **Security test** để dễ tracking và reporting.

---

### 📝 3.7 TC_PAGING_003 — Test steps cần cụ thể hơn

**Hiện tại:**
> 1. Publish page 1 crawled source.
> 2. Cho Builder/Crawler/Resolver xử lý page 2 và page 3.

**Đề xuất bổ sung:**
> 1. Publish page 1 crawled source với `nextPageToken = TOKEN_2`.
> 2. Resolver publish next page source → Builder build request page 2 → Crawler call API page 2 → Resolver nhận page 2 crawled source có `nextPageToken = TOKEN_3`.
> 3. Tương tự cho page 3 (không có nextPageToken).
> 4. **Count** số message trong `posts_crawling_sources_next_pages` = đúng 2.
> 5. **Count** unique video_id trong mention output = 5.
> 6. Verify Redis lock vẫn giữ suốt quá trình paging, chỉ release sau finished source page 3.

---

### 📝 3.8 TC_PERSIST_004 — Test data thiếu baseline reference

**Hiện tại:**
```json
{"baseline_videoId":"parity_video_001","fields_to_compare":["id","id_social",...]}
```

**Đề xuất bổ sung:**
```json
{"baseline_videoId":"parity_video_001",
 "baseline_source":"repo_cu_output_captured_by_dev",
 "fields_to_compare":["id","id_social","link","id_source","identity","title",
   "created_date","views","likes","comments"],
 "fields_allowed_diff":["crawled_date","updated_at"],
 "note":"Need Dev cung cấp sample output repo cũ trước khi execute case này"}
```

---

## 4. TESTCASE NÊN BỔ SUNG

### 🆕 4.1 TC_LOADER_015 — Loader load source có `last_status` hợp lệ (1, 2, 3)

| Field | Value |
|---|---|
| **Module** | Loader |
| **Test Name** | [Medium] [Positive] Loader load source có last_status hợp lệ (không phải 4/5) |
| **Pre-condition** | Source có `last_status=1`, thỏa tất cả điều kiện filter khác |
| **Test Steps** | 1. Chuẩn bị source `last_status=1`. 2. Trigger Loader. 3. Kiểm tra queue crawling source. |
| **Test Data** | `{"source":{"id":"UC_STATUS_1_001","platform":7,"last_status":1,"country_code":"VN","priority":1,"next_crawl_time":"2026-07-10T00:00:00.000Z"}}` |
| **Expected** | Source được load thành công. Filter `-last_status:(4 5)` chỉ exclude 4 và 5. |
| **Lý do cần có** | TC_LOADER_003/004 chỉ test negative (exclude 4/5). Cần positive case khẳng định các status khác được load đúng. |

---

### 🆕 4.2 TC_RESOLVER_017 — Verify `updated_at` là crawl time

| Field | Value |
|---|---|
| **Module** | Resolver Mapping |
| **Test Name** | [Medium] [Positive] Mention `updated_at` là thời điểm crawl, không phải video publish time |
| **Pre-condition** | Crawled source có video `publishedAt = 2026-06-17T17:00:21Z` |
| **Test Steps** | 1. Ghi nhận thời gian trước khi publish crawled source. 2. Chạy Resolver. 3. Inspect mention output `updated_at` vs `created_date`. |
| **Expected** | `created_date = 2026-06-17T17:00:21Z` (từ video), `updated_at` ≈ thời điểm crawl (gần thời gian hiện tại), hai giá trị khác nhau. |
| **Lý do cần có** | Wiki mapping rõ ràng `updated_at = new Date().toISOString()`. Nếu sai (ghi video time), ảnh hưởng freshness tracking downstream. |

---

### 🆕 4.3 TC_RESOLVER_018 — Verify `mention_type` constant value

| Field | Value |
|---|---|
| **Module** | Resolver Mapping |
| **Test Name** | [Medium] [Positive] Mention có `mention_type` đúng constant MENTION_TYPE.POST |
| **Pre-condition** | Resolver đã tạo mention hợp lệ |
| **Test Steps** | 1. Inspect mention output. 2. Query Solr mention. 3. Verify `mention_type` value. |
| **Expected** | `mention_type` = giá trị numeric của `MENTION_TYPE.POST`. **Need Confirm numeric value với Dev.** |
| **Lý do cần có** | Routing key mention dùng `mention_type`, Solr query cũng filter theo `mention_type`. Nếu sai, mention không tìm thấy khi report. |

---

### 🆕 4.4 TC_RESOLVER_019 — Verify `shard` derivation từ created_date

| Field | Value |
|---|---|
| **Module** | Resolver Mapping |
| **Test Name** | [Medium] [Positive] Mention `shard` được derive đúng từ created_date |
| **Pre-condition** | Video có `publishedAt = 2026-06-17T17:00:21Z` |
| **Test Steps** | 1. Chạy Resolver. 2. Inspect mention output `shard`. 3. So sánh với expected format. |
| **Expected** | `shard` khớp pattern/format theo implementation. **Need Confirm:** shard format với Dev (YYYY? YYYYMM? hash?). |
| **Lý do cần có** | Wiki ghi `shard derived from created_date`. Shard ảnh hưởng đến Solr collection routing/partitioning. |

---

### 🆕 4.5 TC_RESOLVER_020 — Statistics string parsing

| Field | Value |
|---|---|
| **Module** | Resolver Mapping |
| **Test Name** | [Medium] [Edge] Statistics parse đúng khi Youtube trả string numbers |
| **Pre-condition** | Statistics có `viewCount: "1000000"` (string, không phải number) |
| **Test Steps** | 1. Publish crawled source có statistics dạng string. 2. Inspect mention output engagement. |
| **Test Data** | `{"statistics":{"viewCount":"1000000","likeCount":"500","commentCount":"100"}}` |
| **Expected** | `views=1000000` (number), không phải `"1000000"` (string). Parse thành công không lỗi NaN. |
| **Lý do cần có** | Youtube API trả statistics dưới dạng **string**. Nếu không parse, downstream so sánh/tính toán sai. |

---

### 🆕 4.6 TC_LOADER_016 — Loader xử lý source có `next_crawl_time` đúng boundary

| Field | Value |
|---|---|
| **Module** | Loader |
| **Test Name** | [Medium] [Edge] Loader load source có next_crawl_time = time_next_cycle (exact boundary) |
| **Pre-condition** | Source có `next_crawl_time` **bằng đúng** `time_next_cycle` |
| **Test Data** | `{"source":{"next_crawl_time":"2026-07-10T23:59:59.000Z"},"time_next_cycle":"2026-07-10T23:59:59.000Z"}` |
| **Expected** | Source **được load** (filter là `<= time_next_cycle`). Đây là boundary case exact match. |
| **Lý do cần có** | TC_LOADER_005 test `next_crawl_time > time_next_cycle` (negative). Cần case exact boundary để verify `<=` vs `<`. |

---

### 🆕 4.7 TC_PAGING_009 — Paging stop condition theo delay_time_rules/from_date

| Field | Value |
|---|---|
| **Module** | Paging & Source Update |
| **Test Name** | [Medium] [Edge] Paging dừng khi video cũ hơn from_date/delay threshold |
| **Pre-condition** | Source có `from_date` hoặc `delay_time_rules` set |
| **Expected** | Resolver dừng paging khi video `publishedAt` cũ hơn threshold. **Need Confirm logic stop paging từ Dev.** |
| **Lý do cần có** | Builder giữ `from_date`, `to_date`, `delay_time_rules`. Nếu paging không có stop condition, crawl toàn bộ history → tốn quota. |

---

### 🆕 4.8 TC_CRAWLER_011 — Crawler xử lý API rate limit (429)

| Field | Value |
|---|---|
| **Module** | Crawler/API |
| **Test Name** | [Medium] [Negative] Crawler xử lý Youtube API rate limit 429 |
| **Pre-condition** | API/mock trả HTTP 429 Too Many Requests |
| **Expected** | Crawler backoff/retry theo policy, không crash, không ack trước khi xử lý. |
| **Lý do cần có** | TC_CRAWLER_004 test quota 403, nhưng rate limit 429 là lỗi khác (temporary vs permanent). Behavior retry khác nhau. |

---

### 🆕 4.9 TC_CRAWLER_012 — Crawler xử lý API 500 Internal Server Error

| Field | Value |
|---|---|
| **Module** | Crawler/API |
| **Test Name** | [Medium] [Negative] Crawler xử lý Youtube API 500 server error |
| **Expected** | Retry có giới hạn, không crash, log rõ error. |
| **Lý do cần có** | Youtube API đôi khi trả 500. Cần verify retry behavior khác với 403/404. |

---

### 🆕 4.10 TC_PERSIST_005 — Solr mention engagement fields

| Field | Value |
|---|---|
| **Module** | Persistence/Solr |
| **Test Name** | [High] [Positive] Solr mention có engagement fields đúng sau Data Pusher |
| **Expected** | Solr có `views`, `likes`, `comments`, `shares=0`, `engagement_total`, `engagement_s_c` đúng. |
| **Lý do cần có** | TC_PERSIST_001 verify field chính nhưng `expected_fields` list không bao gồm engagement fields. Engagement là core cho reporting. |

---

### 🆕 4.11 TC_PERSIST_006 — Mongo youtube_posts upsert không duplicate

| Field | Value |
|---|---|
| **Module** | Persistence/Mongo |
| **Test Name** | [High] [Edge] Mongo youtube_posts upsert cùng videoId chỉ update, không tạo record mới |
| **Expected** | `db.youtube_posts.find({video_id: "xxx"}).count()` luôn = 1 sau 2 lần crawl. |
| **Lý do cần có** | TC_PAGING_008 test idempotency ở mức queue, nhưng cần verify upsert behavior cụ thể ở DB level. |

---

### 🆕 4.12 TC_LOADER_017 — Loader batch xử lý nhiều source hợp lệ cùng lúc

| Field | Value |
|---|---|
| **Module** | Loader |
| **Test Name** | [Medium] [Positive] Loader load batch nhiều source và publish đúng số lượng |
| **Test Data** | 5 source hợp lệ trong DB |
| **Expected** | Queue có đúng 5 message, mỗi message cho 1 source, Redis có 5 lock entries. |
| **Lý do cần có** | TC_LOADER_001 chỉ test 1 source. Cần verify batch loading không bỏ sót source. |

---

### 🆕 4.13 TC_RESOLVER_021 — Resolver xử lý item thiếu title/description

| Field | Value |
|---|---|
| **Module** | Resolver Mapping |
| **Test Name** | [Medium] [Edge] Resolver xử lý item thiếu cả title và description |
| **Test Data** | Item có `snippet.title = undefined`, `snippet.description = undefined` |
| **Expected** | `title = ''`, `search_text` rỗng hoặc không có phần tử. Resolver không crash. Mention/post vẫn được tạo nếu có videoId. |
| **Lý do cần có** | Wiki ghi `title = item.snippet.title ?? ''`. Cần verify fallback hoạt động khi cả hai đều thiếu. |

---

## 5. BỘ TESTCASE PHIÊN BẢN CẢI THIỆN (Tóm tắt thay đổi)

> [!TIP]
> Không cần viết lại toàn bộ 56 cases vì chất lượng gốc đã tốt. Dưới đây là checklist thay đổi cần áp dụng:

### Thay đổi cấu trúc:
| # | Hành động | Scope |
|---|---|---|
| 1 | Populate cột PRIORITY cho tất cả 56 cases | All rows |
| 2 | Thêm cột `REQ_ID` mapping test plan STT | All rows |
| 3 | Sửa TEST TYPE cho TC_SMOKE_006, TC_CRAWLER_010, TC_NFR_004 → Security | 3 rows |
| 4 | Cập nhật OverView sheet cho đúng Youtube Post feature | OverView tab |

### Thay đổi nội dung:
| # | Test Case | Hành động |
|---|---|---|
| 5 | TC_LOADER_001 | Bổ sung test data đầy đủ field (Section 3.1) |
| 6 | TC_BUILDER_006 | Clarify expected behavior 2 scenarios (Section 3.2) |
| 7 | TC_RESOLVER_013 | Thêm công thức engagement + note string parsing (Section 3.3) |
| 8 | TC_PAGING_003 | Expand test steps chi tiết hơn (Section 3.7) |
| 9 | TC_PERSIST_004 | Bổ sung baseline reference + allowed diff fields (Section 3.8) |

### Cases mới cần thêm:
| # | Test Case ID | Module | Mô tả |
|---|---|---|---|
| 10 | TC_LOADER_015 | Loader | Positive test last_status hợp lệ (1,2,3) |
| 11 | TC_LOADER_016 | Loader | Boundary exact `next_crawl_time = time_next_cycle` |
| 12 | TC_LOADER_017 | Loader | Batch loading nhiều source |
| 13 | TC_RESOLVER_017 | Resolver | `updated_at` = crawl time |
| 14 | TC_RESOLVER_018 | Resolver | `mention_type` constant value |
| 15 | TC_RESOLVER_019 | Resolver | `shard` derivation |
| 16 | TC_RESOLVER_020 | Resolver | Statistics string → number parsing |
| 17 | TC_RESOLVER_021 | Resolver | Item thiếu cả title + description |
| 18 | TC_CRAWLER_011 | Crawler | API 429 rate limit |
| 19 | TC_CRAWLER_012 | Crawler | API 500 server error |
| 20 | TC_PAGING_009 | Paging | Stop condition delay_time_rules/from_date |
| 21 | TC_PERSIST_005 | Persistence | Solr engagement fields |
| 22 | TC_PERSIST_006 | Persistence | Mongo upsert không duplicate |

**Tổng sau bổ sung: 56 + 13 = 69 cases** (gần sát lower bound 71 của Test Plan estimate)

---

## 6. PHÂN TÍCH TẠI SAO MỖI NHÓM TESTCASE PHẢI CÓ

### 6.1 Smoke/Environment Tests (TC_SMOKE_001 → 006)

```
Requirement: Service deployment trên K8s phải healthy trước khi test.
Wiki reference: Wiki script page (pageId 317161648) mô tả cách chạy service.
```

| Case | Tại sao phải có | Hậu quả nếu không test |
|---|---|---|
| TC_SMOKE_001 | Verify deployment healthy trước khi bắt đầu bất kỳ test nào. Nếu pod crash loop, toàn bộ test sẽ fail mà QA tưởng là bug code. | Phí thời gian debug "bug" mà thực ra là env issue. |
| TC_SMOKE_002 | RabbitMQ queue/exchange binding sai = message không đến downstream. Đây là kiến trúc message-driven, nếu binding sai thì toàn bộ pipeline im lặng, không có error. | QA report "service không hoạt động" nhưng thực tế là infra config issue. |
| TC_SMOKE_003 | 5 datastore (Redis, Mongo, Solr, MySQL) đều cần accessible. Nếu 1 cái down, test sẽ inconclusive. | Tester execute hết nhưng không verify được persistence → miss bug. |
| TC_SMOKE_004 | Token Manager là dependency bắt buộc. Không có token = API call fail 100%. | Blocker toàn bộ Crawler test module. |
| TC_SMOKE_005 | E2E smoke 1 source xuyên suốt pipeline — đây là **canary test** quan trọng nhất. Nếu pass, pipeline cơ bản hoạt động. | Không có baseline confidence → có thể test chi tiết từng module mà pipeline thực tế không kết nối. |
| TC_SMOKE_006 | Security gate — nếu service log secret, cần raise ngay trước khi test tiếp (avoid sharing secret trong evidence). | Vi phạm security compliance, credential leak qua test evidence. |

---

### 6.2 Loader Tests (TC_LOADER_001 → 014)

```
Requirement: Wiki bước 1 — Load identity theo query filter cụ thể.
Wiki query: platform=7, country_code, -last_status:(4 5), 
  next_crawl_time <= time_next_cycle, priority [min TO max]
Sorter: next_crawl_time asc, id asc
```

| Case | Tại sao phải có | Mapping requirement |
|---|---|---|
| TC_LOADER_001 | **Happy path** — verify toàn bộ filter đều pass và message output đúng field. Đây là case nền tảng. | Wiki query filter + field list |
| TC_LOADER_002 | Platform filter — hệ thống có nhiều platform (FB=1, TW=2, IG=3...). Loader Youtube chỉ load platform=7. | `"platform": 7` trong query |
| TC_LOADER_003/004 | **Exclude filter** — `last_status=4` (stopped) và `5` (error permanent) phải bị exclude. Nếu load nhầm, crawl source lỗi → waste API quota + potential error loop. | `"-last_status": "(4 5)"` |
| TC_LOADER_005 | **Time filter** — source chưa đến lúc crawl (future next_crawl_time) phải skip. Nếu load, crawl trước schedule → duplicate data + quota waste. | `"next_crawl_time": "* TO <time_next_cycle>"` |
| TC_LOADER_006/007 | **Boundary** priority min/max — verify `[1 TO 3]` bao gồm cả 1 và 3. Off-by-one error phổ biến ở range query. | `"priority": "[<min> TO <max>]"` |
| TC_LOADER_008/009 | **Negative boundary** — priority ngoài range bị exclude. Nếu load nhầm low/high priority, ảnh hưởng crawl schedule. | Priority range filter |
| TC_LOADER_010 | **Country filter** — Loader chạy theo country config. Source country khác phải bị filter. Nếu load nhầm, data bị mix country. | `"country_code": "<country_code>"` |
| TC_LOADER_011 | **Sort order** — `next_crawl_time asc, id asc` đảm bảo source cũ hơn được crawl trước. Sai sort = unfair scheduling. | `"sorter"` trong wiki query |
| TC_LOADER_012 | **Cursor tracking** — MySQL cursor đảm bảo restart không load lại batch cũ. Nếu cursor reset, duplicate crawl diện rộng. | MySQL `crawling_loaders` table |
| TC_LOADER_013 | **Redis lock add** — ngăn duplicate crawl cùng source trong cùng cycle. Nếu không lock, 2 loader instance crawl song song cùng source. | Redis DB 1, key `YoutubePostApiCrawlingLoader` |
| TC_LOADER_014 | **Redis lock check** — source đang lock phải skip. Nếu load lại source đang crawl → duplicate message → duplicate API call → duplicate data. | Lock check trước khi publish |

---

### 6.3 Builder Tests (TC_BUILDER_001 → 010)

```
Requirement: Wiki bước 4 — Build crawling request từ crawling source.
Key logic: Convert UC→UU, set playlistItems params, giữ metadata.
```

| Case | Tại sao phải có | Mapping requirement |
|---|---|---|
| TC_BUILDER_001 | **Happy path** consume + publish — Builder là bridge giữa Loader và Crawler. Nếu Builder fail, pipeline đứt. | Wiki bước 4 |
| TC_BUILDER_002 | **Core logic UC→UU** — Youtube upload playlist id = channel id thay UC bằng UU. Sai convert = gọi API sai endpoint = 0 data. | Wiki cURL mẫu: `playlistId=UUxxxxxxxx` |
| TC_BUILDER_003 | **API params** — `maxResults=50`, `part=[snippet,contentDetails]` phải đúng. Sai maxResults = fetch ít hơn, sai part = thiếu field. | Wiki cURL mẫu |
| TC_BUILDER_004 | **Metadata passthrough** — priority, delay_time_rules, country phải đi xuyên suốt pipeline. Nếu mất = Resolver/Source Updater thiếu thông tin. | Source contract giữa các module |
| TC_BUILDER_005/006 | **Negative** — source thiếu field hoặc id sai format. Builder phải graceful handle, không crash cả service. | Error resilience |
| TC_BUILDER_007 | **Next page** — Builder cũng consume next page queue. Logic phải giữ đúng same source + add page token. | Wiki bước 8, queue #2 |
| TC_BUILDER_008 | **Config testing** — batch_size=1, concurrency=1 trên testing env. Verify config hoạt động đúng. | Wiki script page environment vars |
| TC_BUILDER_009 | **Date window** — `from_date`/`to_date` ảnh hưởng paging stop. Nếu mất/convert sai, crawl quá nhiều hoặc quá ít. | Source metadata |
| TC_BUILDER_010 | **Security** — Builder message không chứa API key. Nếu lộ, token bị abuse. | Security requirement |

---

### 6.4 Crawler/API Tests (TC_CRAWLER_001 → 010)

```
Requirement: Wiki bước 5-6 — Gọi Youtube API, build crawled source.
Key integration: Token Manager, Youtube playlistItems API.
```

| Case | Tại sao phải có | Mapping requirement |
|---|---|---|
| TC_CRAWLER_001 | **Happy path** API success — xác nhận Crawler gọi đúng API và nhận response. | Wiki bước 5 |
| TC_CRAWLER_002 | **Contract** crawled source — downstream (Resolver) phụ thuộc vào schema crawled source. Sai contract = Resolver crash. | Wiki bước 6, queue #4 |
| TC_CRAWLER_003 | **Token expired** — Token Manager token có TTL. Nếu expired, Crawler phải handle chứ không crash. | Token Manager integration |
| TC_CRAWLER_004 | **Quota exceeded** — Youtube API có daily quota limit. Crawler phải log rõ + retry có giới hạn. | External dependency risk |
| TC_CRAWLER_005 | **Channel private/deleted** — Không phải mọi channel đều accessible. Crawler phải graceful handle. | Edge case API response |
| TC_CRAWLER_006 | **Network timeout** — Infrastructure issue phổ biến. Service phải retry + không crash. | Reliability |
| TC_CRAWLER_007 | **Malformed response** — API trả 200 nhưng body sai schema. Defense coding. | Robustness |
| TC_CRAWLER_008 | **Empty items** — Channel mới, 0 video. Crawler vẫn phải output crawled source để Resolver finish source. | Edge case: empty channel |
| TC_CRAWLER_009 | **Full page + nextPageToken** — Verify boundary page size 50. Không mất item cuối. | Paging trigger |
| TC_CRAWLER_010 | **Security** — API key/token không lộ trong message/log. | Security requirement |

---

### 6.5 Resolver Mapping Tests (TC_RESOLVER_001 → 016)

```
Requirement: Wiki bước 7 + Mapping table mention/post.
Key logic: videoId extraction, field mapping, engagement calculation, 
  thumbnail priority, routing key.
```

| Case | Tại sao phải có | Mapping requirement |
|---|---|---|
| TC_RESOLVER_001/002 | **videoId priority** — `contentDetails.videoId` ưu tiên hơn `snippet.resourceId.videoId`. Đây là **primary key** cho mention/post. | Wiki mapping: `contentDetails.videoId ?? snippet.resourceId.videoId` |
| TC_RESOLVER_003 | **Missing videoId** — Nếu không có videoId, không thể tạo `id`, `link`, `id_social`. Resolver phải skip item. | Defense: thiếu primary key |
| TC_RESOLVER_004 | **id/link formula** — `hashUuid('yt_' + videoId)` phải stable. Nếu hash khác giữa các lần → duplicate record. | Wiki mapping `id`, `link` |
| TC_RESOLVER_005 | **Source fields** — `id_source`, `identity`, `country_code`, `is_kol` lấy từ source, không từ API. | Wiki mapping source fields |
| TC_RESOLVER_006/007 | **identity_name fallback** — `source.fullname` → `channelTitle` → `''`. Sai priority = hiển thị sai tên nguồn. | Wiki: `source.fullname ?? item.snippet.channelTitle ?? ''` |
| TC_RESOLVER_008 | **Content fields** — title, search_text, created_date là core cho search/display. | Wiki mapping content fields |
| TC_RESOLVER_009 | **search_text filter** — Lọc bỏ falsy entries. Nếu không filter, Solr index text thừa. | Wiki: `falsy entries filtered` |
| TC_RESOLVER_010/011/012 | **Thumbnail priority** — `maxres > high > medium > default`. Ảnh hưởng chất lượng display. | Wiki mapping `attachment` |
| TC_RESOLVER_013/014 | **Engagement** — views/likes/comments/shares/engagement_total/engagement_s_c. Đây là **core metric** cho reporting. | Wiki mapping engagement |
| TC_RESOLVER_015 | **Post mapping** — Post output khác mention (thêm `video_id`, `crawled_date`, `last_status=0`). Cần verify riêng. | Wiki mapping post table |
| TC_RESOLVER_016 | **Routing key** — Sai routing = message đến sai queue = mất data. | Wiki queue table #5, #6 |

---

### 6.6 Paging & Source Update Tests (TC_PAGING_001 → 008)

```
Requirement: Wiki bước 8 — next_page, finished source, release lock, update source.
Key logic: nextPageToken detection, stop condition, lock lifecycle.
```

| Case | Tại sao phải có | Mapping requirement |
|---|---|---|
| TC_PAGING_001 | **Trigger next page** — Khi có `nextPageToken`, Resolver phải publish next page source. Nếu không, chỉ crawl page 1. | Wiki bước 8 |
| TC_PAGING_002 | **Stop paging** — Không có `nextPageToken` = hết data. Phải publish finished source. | Finished source flow |
| TC_PAGING_003 | **Multi-page no loop** — Loop vô hạn = tốn quota + queue backlog. Risk #4 trong Test Plan. | Risk mitigation |
| TC_PAGING_004 | **Empty response finish** — Channel 0 video vẫn phải finish + release lock. | Edge case |
| TC_PAGING_005 | **Lock release** — Core requirement. Lock treo = source không bao giờ crawl lại. | Redis lock lifecycle |
| TC_PAGING_006 | **Lock release on error** — API lỗi cũng phải release lock (hoặc có TTL). Nếu không, source bị abandoned. | Error recovery |
| TC_PAGING_007 | **Source metadata update** — `next_crawl_time`, `post_last_date` phải update đúng. Sai = crawl schedule lệch. | Source updater |
| TC_PAGING_008 | **Idempotency** — Replay không tạo duplicate. Core requirement cho data quality. | Data integrity |

---

### 6.7 Persistence & Regression (TC_PERSIST_001 → 004)

```
Requirement: Data phải đến đúng Solr/Mongo, cursor MySQL đúng.
Key validation: Field mapping end-to-end, upsert behavior, parity repo cũ.
```

| Case | Tại sao phải có |
|---|---|
| TC_PERSIST_001 | **Solr mention** — Final destination cho reporting. Nếu mention không đến Solr, tính năng vô nghĩa. |
| TC_PERSIST_002 | **Mongo post** — Final destination cho Youtube post data. Downstream dashboard/API phụ thuộc. |
| TC_PERSIST_003 | **Cursor recovery** — Cursor MySQL phải survive restart. Nếu reset, Loader re-load toàn bộ → duplicate crawl. |
| TC_PERSIST_004 | **Parity repo cũ** — Task chuyển repo. Output phải tương thích downstream đang chạy. Nếu sai contract → break reporting/dashboard. |

---

### 6.8 Non-functional & Go-No-Go (TC_NFR_001 → 008)

```
Requirement: Stability, security, observability, recovery.
Key validation: Service không crash, không leak secret, log đủ trace.
```

| Case | Tại sao phải có |
|---|---|
| TC_NFR_001 | **Performance baseline** — Channel lớn không gây service degradation. |
| TC_NFR_002 | **Concurrency safety** — Redis lock phải ngăn race condition thực tế. |
| TC_NFR_003 | **Observability** — Log thiếu trace = không debug được bug production. |
| TC_NFR_004 | **Evidence security** — QA không leak credential qua Jira/Sheet. |
| TC_NFR_005 | **Recovery** — K8s pod restart không mất message. RabbitMQ ack mechanism. |
| TC_NFR_006 | **Post-release monitoring** — Production verify sau release. Last defense. |
| TC_NFR_007/008 | **Go-No-Go gate** — Define rõ điều kiện KHÔNG cho release. Protects production. |

---

## TỔNG KẾT

| Hạng mục | Số lượng |
|---|---|
| Cases cần sửa nội dung | **5** |
| Cases cần sửa TEST TYPE | **3** |
| Cases mới cần thêm | **13** |
| Thay đổi cấu trúc sheet | **4** |
| Tổng cases sau cải thiện | **69** |

> [!IMPORTANT]
> **Đánh giá chung:** Bộ test case hiện tại có **chất lượng tốt trên trung bình**. Người viết thể hiện hiểu biết sâu về hệ thống, cover được hầu hết luồng chính với test data JSON cụ thể và expected result chi tiết đến field level. Các `Need Confirm` annotations cho thấy awareness về ambiguity trong requirement — đây là dấu hiệu của QA có kinh nghiệm.
>
> **Action items ưu tiên cao nhất:**
> 1. Populate cột PRIORITY ngay (5 phút)
> 2. Confirm 6 items `Need Confirm` với Dev **trong ngày 10/07**
> 3. Thêm 13 cases mới (ưu tiên TC_RESOLVER_017-020 và TC_PERSIST_005-006)
> 4. Cập nhật OverView sheet
