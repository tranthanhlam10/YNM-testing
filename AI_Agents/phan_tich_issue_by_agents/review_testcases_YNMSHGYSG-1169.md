# 🔍 REVIEW BỘ TESTCASE — YNMSHGYSG-1169
## [DATA] Improve Crawling Post From Reply On Platform X
**Reviewer:** Senior QA / Test Analyst (AI-assisted)
**Ngày review:** 26/06/2026
**Test Plan tham chiếu:** [TestPlan_YNMSHGYSG-1169_v1.1](file:///Users/tranthanhlam/YNM-testing/Ai_Agents/TestPlan/Data%20local/TestPlan_YNMSHGYSG-1169_Improve_Crawling_Post_From_Reply_X.md)
**Testcase sheet:** [Google Sheet](https://docs.google.com/spreadsheets/d/1hJkgSEvk-CEvqVl3UZ2gnq1B3S6oQ8Ux2064Z0FKdVU/edit?gid=1704880699#gid=1704880699)

---

## 1. Nhận xét tổng quan

> [!NOTE]
> **Đánh giá chung: 7/10** — Bộ testcase có chiều sâu rất tốt ở module Invalid Data Handling nhưng **thiếu nghiêm trọng** ở module Source Updater, Regression, và DB Verification.

### Tóm tắt thống kê

| Metric | Giá trị | Nhận xét |
|---|:---:|---|
| **Tổng số TC** | **43** | Nằm trong khoảng dưới của ước lượng Test Plan (54-72) |
| **TC theo priority High** | 37 (86%) | Tỷ lệ High quá cao, thiếu phân biệt P0 vs P1 |
| **TC theo priority Medium** | 6 (14%) | Ít case Medium/Low cho edge/phụ |
| **TC Positive** | 18 (42%) | |
| **TC Negative** | 19 (44%) | |
| **TC Edge** | 6 (14%) | |
| **Test type** | 100% Functional | Thiếu Integration, Non-functional testing |

### Phân bố TC theo module

| Module (theo Test Plan) | TC hiện tại | Ước lượng Test Plan | Coverage |
|---|:---:|:---:|:---:|
| Module 1: Builder/Crawler/Resolver | 10 | 6-8 | ✅ Đủ |
| Module 2: Mapping Mention/Post/Reply/Identity | 12 | 10-14 | ⚠️ Gần đủ |
| Module 3: Invalid Data Handling | 22 | 12-16 | ✅ Vượt |
| Module 4: Detect Country Handoff | 6 | 8-10 | ⚠️ Thiếu |
| Module 5: Data Pusher | 3 | 5-7 | ⚠️ Thiếu |
| Module 5: Source Updater | **0** | 3-4 | ❌ **THIẾU HOÀN TOÀN** |
| Module 5: Regression | **0** | 7-9 | ❌ **THIẾU HOÀN TOÀN** |
| Idempotency/NFR | **0** | 3-5 | ❌ **THIẾU HOÀN TOÀN** |

> [!CAUTION]
> **3 module/nhóm test hoàn toàn không có test case:** Source Updater (#26), Regression keyword/hashtag/source (#27-#29), và Idempotency/NFR. Đây là gap nghiêm trọng so với Test Plan v1.1 đã được approved.

---

## 2. Các điểm tốt đang có

### ✅ 2.1. Invalid Data Matrix rất chi tiết và có hệ thống
Bộ TC_INVALID_001 → TC_INVALID_022 cover **22 test cases** cho invalid handling, phủ gần hết required field list trong Phụ lục B của Test Plan:
- Mỗi required field (id, id_source, domain, identity, identity_name, platform, mention_type, source_type, likes, comments, shares, engagement_total, engagement_s_c, search_text, link, attachment, created_date, updated_at) đều có TC riêng.
- TC_INVALID_016 cover conditional field `link_shared` khi `mention_type=3` — rất tốt.
- TC_INVALID_018 kết hợp cả missing và invalid date — smart.
- TC_INVALID_020 cover partial success (valid + invalid batch) — critical case.
- TC_INVALID_021 verify invalid payload giữ đủ context debug — chuyên nghiệp.
- TC_INVALID_022 cover raw response malformed — edge case quan trọng.

### ✅ 2.2. Test data chất lượng, gần thật
- Sử dụng social IDs thực tế (dạng `2051280917629460670`, `1910200888578523136`).
- JSON structure giống X API response thật (tweetResult, legacy, core.user_results).
- Mỗi TC có test data riêng, không trùng ID → dễ trace kết quả.
- Include cả field `createdBy` cho traceability.

### ✅ 2.3. Cấu trúc TC nhất quán
- Naming convention rõ ràng: `TC_<MODULE>_<SEQ>`.
- Mỗi TC đều có đủ: Pre-condition → Steps → Test Data → Expected Result.
- Test name format `[Priority] [Type] Description` giúp scan nhanh.
- Expected result chi tiết: không chỉ "pass" mà mô tả cụ thể field/queue/behavior.

### ✅ 2.4. Community/Identity coverage tốt
- 6 TC community (TC_COMMUNITY_001 → 006) cover đầy đủ:
  - Community có name ✅
  - Community chỉ có social id (fallback) ✅
  - Remove `is_admin_creator` ✅
  - Parser không crash khi thiếu admin/creator object ✅
  - Mapping consistency id_source/source_type ✅
  - Identity pusher fallback name ✅

### ✅ 2.5. Chú ý boundary/edge case
- TC_PAGING_003: Cursor trùng lặp → infinite loop prevention.
- TC_RESOLVER_008: Poll/card/note_tweet dài 5000 ký tự.
- TC_MAPPING_005: Views optional khi state Enabled nhưng thiếu count.
- TC_DETECT_004: Author anonymous/null → fallback.
- TC_DETECT_006: Retry/concurrent → duplicate prevention.

### ✅ 2.6. Traceability tốt với requirement
- Nhiều TC reference đúng Jira ticket (YNMSHGYSG-1054, 1117, 1119, 661, 1139).
- Expected result ghi rõ "không lặp bug YNMSHGYSG-1139" hoặc "theo BA YNMSHGYSG-1119/1169".

---

## 3. Các lỗi/vấn đề trong testcase hiện tại

### 🔴 3.1. THIẾU toàn bộ TC cho Source Updater (Critical)

> [!CAUTION]
> Test Plan Section 2.1 Module 5, item #26 yêu cầu verify: "Source/crawled source được update status, next crawl/paging state đúng". Hiện tại **0 test case** cho Source Updater.

Cần test:
- Source hợp lệ hoàn tất → status = finished/completed
- Source có paging → status giữ paging state
- Toàn bộ batch invalid → source status?
- Source updater không bị treo khi invalid data

---

### 🔴 3.2. THIẾU toàn bộ TC Regression (Critical)

> [!CAUTION]
> Test Plan items #27-#29 yêu cầu 3 nhóm regression:
> - X keyword community mapping
> - X hashtag community invalid queue
> - X source post/shared detect country
>
> Hiện tại **0 test case** regression. Đây là Exit Criteria #7 bắt buộc.

---

### 🔴 3.3. THIẾU toàn bộ TC Idempotency & Non-functional (Critical)

Test Plan Section 3.3 yêu cầu NFR testing:
- Idempotency: Re-run cùng source → không duplicate → **0 TC**
- Stability: Service không crash khi malformed → chỉ cover gián tiếp trong invalid TC
- No log spam: Không lỗi lặp liên tục → **0 TC riêng**
- Processing latency: Đo thời gian xử lý → **0 TC**

---

### 🟡 3.4. Thiếu TC verify DB persistence (Mongo/Solr/Redis)

Test Plan Section 3.4 yêu cầu verify data sync:
- Post upsert đúng Mongo X posts → TC_RESOLVER_002 chỉ check queue, **không check DB**
- Reply upsert đúng Mongo X replies → TC_RESOLVER_003 chỉ check queue
- Mention vào Solr → TC_PUSHER_001 check queue nhưng **không query Solr**
- Identity vào Solr/Redis → TC_COMMUNITY_006 check queue nhưng **không verify Solr/Redis**

> [!IMPORTANT]
> Queue message ≠ DB record. Cần TC riêng hoặc bổ sung step verify DB sau khi pusher xử lý.

---

### 🟡 3.5. TC_INVALID nhóm engagement (009-013) quá tương tự, nên gom

5 TC (TC_INVALID_009 → TC_INVALID_013) cover thiếu likes/comments/shares/engagement_total/engagement_s_c. Cấu trúc gần giống nhau 100%, chỉ khác field thiếu.

**Vấn đề:**
- Rất repetitive → khó maintain
- Không cover case field engagement = `null`, `undefined`, `NaN`, `""` (chỉ cover missing)
- Không cover case engagement = negative number (-1)

**Đề xuất:** Gom thành 2-3 TC dùng decision table thay vì 5 TC riêng lẻ, và thêm boundary value cho engagement.

---

### 🟡 3.6. Priority ALL HIGH — Thiếu phân biệt P0 vs P1

37/43 TC đều là High (86%). Test Plan phân biệt P0 và P1 nhưng bộ TC không reflect:
- Community fallback, invalid handling, detect country = **P0** theo Test Plan
- Happy path, pusher, attachment = **P1** theo Test Plan
- Edge cases (poll/card, cursor dup, views optional) nên là **P1 hoặc P2**

Không phân biệt priority → khó prioritize khi thời gian gấp, không biết chạy case nào trước.

---

### 🟡 3.7. Test Steps quá generic ở nhiều TC

Nhiều TC có steps chỉ 3 dòng rất chung:
```
1. Publish/Inject/Crawl...
2. Consume output queue.
3. Verify/Kiểm tra...
```

**Ví dụ TC_INVALID_001:**
> 1. Đưa raw payload làm mention thiếu id vào resolver.
> 2. Consume invalid queue.
> 3. Kiểm tra không có output Solr mention.

**Vấn đề:**
- "Đưa raw payload... vào resolver" → **Bằng cách nào?** Publish message vào queue nào? Dùng tool nào?
- "Consume invalid queue" → Dùng RabbitMQ Management UI? Script? Bao lâu chờ?
- Thiếu step kiểm tra log service

**Đề xuất mẫu cải thiện:**
```
1. Mở RabbitMQ Management UI → queue testing.cl.x.posts_from_reply_by_cookie_crawled_sources.
2. Publish message JSON (xem Test Data) vào queue trên.
3. Chờ 30s để resolver xử lý.
4. Kiểm tra queue testing.cl.x.invalid_data_crawling_sources → Get Message.
5. Kiểm tra queue testing.cl.mentions_2_solr_mentions → không có message mới.
6. Kiểm tra log service → không có uncaught exception.
```

---

### 🟡 3.8. Test type 100% Functional — Thiếu đa dạng

Tất cả 43 TC đều ghi `Test Type = Functional`. Nhưng nhiều TC thực chất là:
- **Integration Testing**: TC_RESOLVER_002, TC_RESOLVER_003, TC_PUSHER_001-003 (verify liên thông giữa services)
- **Contract Testing**: TC_DETECT_005, TC_INVALID_021 (verify payload schema)
- **Non-functional**: TC_DETECT_006 (concurrent/duplicate), TC_PAGING_003 (infinite loop prevention)

→ Nên gán đúng test type để phân loại báo cáo chính xác.

---

### 🟡 3.9. TC_INVALID_020 label sai: ghi [Positive] nhưng là Negative/Mixed

TC_INVALID_020 test "batch có valid và invalid → chỉ invalid bị tách". Test name ghi `[High] [Positive]` nhưng bản chất là mixed case. Nên đổi thành `[High] [Mixed]` hoặc `[High] [Integration]`.

---

### 🟡 3.10. Không TC nào test identity mapping sang cả Solr VÀ Redis

Test Plan item #10 yêu cầu verify identity output sang **2 queue**: `cl.identities_2_solr_identities` VÀ `cl.identities_2_redis_identities`. TC_COMMUNITY_006 chỉ mention "identities_2_solr_identities hoặc identities_2_redis_identities" (dùng "hoặc" thay vì "và") → có nguy cơ chỉ verify 1 queue.

---

### 🟡 3.11. TC_INVALID_018 gom 2 case: missing VÀ invalid date

TC_INVALID_018 test cả `created_date` missing và `created_date = "Invalid Date"`. Nên **tách thành 2 TC**:
- TC_INVALID_018a: `created_date` missing (field absent)
- TC_INVALID_018b: `created_date = "Invalid Date"` (field present but malformed)

Vì logic xử lý khác nhau: field missing → validator reject; field present nhưng parse fail → có thể crash nếu không catch.

---

### 🟢 3.12. Expected result một số TC dùng "Need Confirm" — Chưa chốt

Các TC sau có ghi "Need Confirm" trong expected result:
- TC_BUILDER_003: "Need Confirm cơ chế lưu lỗi source-level"
- TC_MAPPING_004: "Need Confirm công thức tổng engagement"
- TC_MAPPING_005: "Need Confirm convention views"
- TC_DETECT_004: "Need Confirm nếu BA muốn bỏ detect country"
- TC_INVALID_014: "Need Confirm nếu business cho phép empty string"
- TC_INVALID_022: "Need Confirm cơ chế error source-level"

→ 6 TC cần confirm trước khi execute, chiếm 14%. Nên track và resolve trước khi bắt đầu execute phase.

---

## 4. Testcase nên bổ sung

### 📋 4.1. Source Updater (4-5 TC mới)

| TC ID đề xuất | Test Name | Priority | Mô tả |
|---|---|:---:|---|
| TC_UPDATER_001 | [High][Positive] Source hoàn tất crawl → status finished | P1 | Verify source status update sau khi resolve xong, không bị treo |
| TC_UPDATER_002 | [High][Positive] Source có paging → giữ paging state | P1 | Verify source lưu cursor/page state cho next crawl cycle |
| TC_UPDATER_003 | [High][Negative] Toàn batch invalid → source status xử lý đúng | P0 | Verify source không bị stuck khi 100% invalid (Need Confirm NC-5) |
| TC_UPDATER_004 | [Medium][Edge] Source retry/re-crawl → status reset đúng | P1 | Verify source updater idempotency khi cùng source chạy lại |

---

### 📋 4.2. Idempotency & Stability (3-4 TC mới)

| TC ID đề xuất | Test Name | Priority | Mô tả |
|---|---|:---:|---|
| TC_IDEMPOTENT_001 | [High][Positive] Re-run cùng source → không duplicate post/reply | P1 | Publish cùng source 2 lần, verify Mongo không tạo duplicate |
| TC_IDEMPOTENT_002 | [High][Positive] Re-run cùng source → mention Solr không duplicate | P1 | Publish cùng source 2 lần, verify Solr không tạo duplicate mention |
| TC_STABILITY_001 | [High][Negative] 10 invalid liên tiếp → service vẫn sống | P1 | Push 10 malformed messages liên tiếp, verify service không crash, không OOM |
| TC_STABILITY_002 | [Medium][Negative] Log không spam lỗi cũ sau fix | P1 | Search log cho patterns: `Cannot read property`, `Invalid time value`, `Cannot convert undefined` |

---

### 📋 4.3. DB Verification (4-5 TC mới)

| TC ID đề xuất | Test Name | Priority | Mô tả |
|---|---|:---:|---|
| TC_DB_001 | [High][Positive] Post upsert đúng Mongo X posts collection | P1 | Query Mongo theo id_social, verify document fields |
| TC_DB_002 | [High][Positive] Reply upsert đúng Mongo X replies + parent relation | P1 | Query Mongo replies, verify parent_id/relation |
| TC_DB_003 | [High][Positive] Identity community tồn tại trong Solr và Redis | P1 | Query Solr + Redis key, verify fallback name nhất quán |
| TC_DB_004 | [High][Negative] Invalid mention KHÔNG có trong Solr | P0 | Query Solr theo mention id invalid, verify 0 results |
| TC_DB_005 | [Medium][Positive] Mention valid tồn tại trong Solr với đúng field | P1 | Query Solr mention, field-by-field verify |

---

### 📋 4.4. Regression (5-6 TC mới)

| TC ID đề xuất | Test Name | Priority | Mô tả |
|---|---|:---:|---|
| TC_REGRESS_001 | [High][Positive] X keyword community → mapping name đúng, no is_admin_creator | P1 | Crawl keyword community source, verify mapping |
| TC_REGRESS_002 | [High][Positive] X keyword community invalid → invalid queue đúng | P1 | Push invalid data qua keyword flow, verify invalid queue |
| TC_REGRESS_003 | [High][Positive] X hashtag community → fallback name đúng | P1 | Crawl hashtag community, verify user_\<social_id\> |
| TC_REGRESS_004 | [High][Positive] X hashtag community invalid → invalid queue đúng | P1 | Push invalid qua hashtag flow |
| TC_REGRESS_005 | [High][Positive] X source post/shared → detect country payload đúng | P1 | Crawl source post/shared, verify detect country message |
| TC_REGRESS_006 | [Medium][Positive] X source post/shared → mapping consistency | P1 | Verify id_source, source_type không bị lệch |

---

### 📋 4.5. Boundary & Edge Cases bổ sung (3-4 TC mới)

| TC ID đề xuất | Test Name | Priority | Mô tả |
|---|---|:---:|---|
| TC_BOUNDARY_001 | [Medium][Edge] Engagement field = 0 → valid, không nhầm invalid | P1 | likes=0, comments=0, shares=0 → mention vẫn valid |
| TC_BOUNDARY_002 | [Medium][Edge] Engagement field = null/undefined → invalid | P1 | likes=null → invalid queue, không NaN downstream |
| TC_BOUNDARY_003 | [Medium][Edge] Empty string fields: domain="", link="" → invalid handling | P1 | Verify empty string vs null treatment (NC-6) |
| TC_BOUNDARY_004 | [Medium][Edge] Unicode/emoji trong full_text → không lỗi encoding | P2 | Verify search_text/content xử lý đúng emoji/unicode |

---

### 📋 4.6. Security/Data Leakage (1-2 TC mới)

| TC ID đề xuất | Test Name | Priority | Mô tả |
|---|---|:---:|---|
| TC_SECURITY_001 | [High][Negative] Token/cookie/proxy KHÔNG xuất hiện trong output message | P0 | Inspect tất cả output queues: mention/post/reply/identity/invalid/detect country → không chứa token/cookie |
| TC_SECURITY_002 | [Medium][Negative] Log không chứa raw token/cookie | P1 | Search logs cho pattern token/cookie → 0 matches |

---

## 5. Gap Analysis: Test Plan vs Testcase Coverage

### Ma trận coverage chi tiết

| # | Test Plan Item | Test Plan Module | TC Coverage | Status | Gap |
|:---:|---|---|---|:---:|---|
| 1 | Consume crawling source | M1 | TC_BUILDER_001 | ✅ | |
| 2 | Build crawling request | M1 | TC_BUILDER_002 | ✅ | |
| 3 | Crawl post from reply | M1 | TC_CRAWLER_001-004 | ✅ | |
| 4 | Paging/next page | M1 | TC_PAGING_001-003 | ✅ | |
| 5 | Resolver output | M1 | TC_RESOLVER_001-008 | ✅ | |
| 6 | Mention mapping cơ bản | M2 | TC_RESOLVER_001, TC_MAPPING_004 | ⚠️ | Thiếu TC verify toàn bộ required fields ở happy path |
| 7 | Mapping consistency YNMSHGYSG-1117 | M2 | TC_COMMUNITY_005 | ⚠️ | Chỉ cover community, thiếu User source mapping |
| 8 | Post mapping | M2 | TC_RESOLVER_002 | ✅ | |
| 9 | Reply mapping | M2 | TC_RESOLVER_003 | ✅ | |
| 10 | Identity mapping | M2 | TC_COMMUNITY_006 | ⚠️ | Thiếu verify cả Solr VÀ Redis |
| 11 | Community fallback name | M2 | TC_COMMUNITY_002, 004, 006 | ✅ | |
| 12 | Bỏ is_admin_creator | M2 | TC_COMMUNITY_003 | ✅ | |
| 13 | Validate required fields | M3 | TC_INVALID_001-019 | ✅ | Rất chi tiết |
| 14 | Route invalid mention | M3 | TC_INVALID_001-019 | ✅ | |
| 15 | Không crash service | M3 | TC_INVALID_022, TC_COMMUNITY_004 | ✅ | |
| 16 | Partial success | M3 | TC_INVALID_020 | ✅ | |
| 17 | Invalid evidence | M3 | TC_INVALID_021 | ✅ | |
| 18 | Publish identity countries | M4 | TC_DETECT_001 | ✅ | |
| 19 | Payload có mentions | M4 | TC_DETECT_005 | ✅ | |
| 20 | Detect theo author | M4 | TC_DETECT_003 | ✅ | |
| 21 | Không duplicate detect | M4 | TC_DETECT_006 | ✅ | |
| 22 | Tắt detect country | M4 | TC_DETECT_002 | ✅ | |
| 23 | Data Pusher - Post | M5 | TC_PUSHER_003 | ⚠️ | Chỉ check queue, không check DB |
| 24 | Data Pusher - Reply | M5 | TC_PUSHER_003 | ⚠️ | Chỉ check queue, không check DB |
| 25 | Identity Pusher | M5 | TC_COMMUNITY_006 | ⚠️ | Thiếu verify Redis |
| 26 | Source Updater | M5 | ❌ **KHÔNG CÓ** | ❌ | **Gap Critical** |
| 27 | Regression keyword community | M5 | ❌ **KHÔNG CÓ** | ❌ | **Gap Critical** |
| 28 | Regression hashtag community | M5 | ❌ **KHÔNG CÓ** | ❌ | **Gap Critical** |
| 29 | Regression source post/shared | M5 | ❌ **KHÔNG CÓ** | ❌ | **Gap Critical** |

### NFR Coverage

| NFR Item | TC Coverage | Status |
|---|---|:---:|
| Stability | Gián tiếp qua invalid TC | ⚠️ |
| No log spam | ❌ Không có TC riêng | ❌ |
| Idempotency | ❌ Không có | ❌ |
| Partial processing | TC_INVALID_020 | ✅ |
| Processing latency | ❌ Không có | ❌ |

---

## 6. Testcase cần chỉnh sửa

### 6.1. TC cần sửa Priority

| TC ID | Priority hiện tại | Priority đề xuất | Lý do |
|---|:---:|:---:|---|
| TC_COMMUNITY_001-005 | High | **P0** | Core change của task YNMSHGYSG-1169 |
| TC_INVALID_001-022 | High | **P0** | Core change, Exit Criteria bắt buộc |
| TC_DETECT_001, 003, 005 | High | **P0** | Core change, Exit Criteria bắt buộc |
| TC_RESOLVER_004-008 | Medium | **P1** | Attachment/edge case, không phải core change |
| TC_MAPPING_003 | Medium | **P1** | External link mapping, phụ |
| TC_MAPPING_005 | Medium | **P2** | Views edge case, optional field |
| TC_CRAWLER_002 | Medium | **P2** | Config verification, phụ |

---

### 6.2. TC cần sửa Test Name/Label

| TC ID | Vấn đề | Sửa thành |
|---|---|---|
| TC_INVALID_020 | Label `[Positive]` nhưng test mixed valid+invalid | `[High] [Integration] Partial success: valid mention đi normal, invalid đi invalid queue` |
| TC_DETECT_002 | Label `[Negative]` cho config off | `[Medium] [Config] Tắt RESOLVER_IS_DETECT_COUNTRY → không gửi detect country` |
| TC_COMMUNITY_006 | Module ghi "Identity Pusher" nhưng chỉ check queue | `X Post From Reply - Identity Queue Output` hoặc bổ sung step verify Solr+Redis |

---

### 6.3. TC_INVALID_018 nên tách

**Hiện tại:** 1 TC cover cả `created_date` missing và invalid value.

**Đề xuất tách:**

```
TC_INVALID_018a:
  Name: [High] [Negative] Mention thiếu created_date (field absent) → invalid
  Test Data: mention JSON không có key "created_date"
  Expected: Invalid queue, reason "missing created_date"

TC_INVALID_018b:
  Name: [High] [Negative] Mention có created_date="Invalid Date" → invalid, no crash
  Test Data: mention JSON có "created_date": "Invalid Date"
  Expected: Invalid queue, reason "invalid created_date format", 
            không có uncaught "Invalid time value" trong log
```

---

### 6.4. TC cần bổ sung Steps chi tiết

Các TC sau cần mở rộng test steps để người khác có thể execute:

| TC ID | Step thiếu | Bổ sung |
|---|---|---|
| TC_INVALID_001-019 | Cách inject invalid data | "Mở RabbitMQ UI → queue `testing.cl.x.posts_from_reply_by_cookie_crawled_sources` → Publish Message với JSON body trong Test Data" |
| TC_DETECT_001-006 | Cách verify queue identity_countries | "Mở RabbitMQ UI → queue `testing.cl.x.identity_countries_crawling_sources` → Get Message → Verify JSON payload" |
| TC_COMMUNITY_001-006 | Cách inspect mention output | "Mở RabbitMQ UI → queue `testing.cl.mentions_2_solr_mentions` → Get Message → Search JSON key `is_admin_creator`" |
| ALL | Step kiểm tra log | Thêm: "Kiểm tra service log (kubectl logs hoặc Kibana) → tìm keyword `error`, `exception`, `Cannot read property`" |

---

### 6.5. TC_COMMUNITY_006 bổ sung verify cả Solr VÀ Redis

**Hiện tại:** Pre-condition ghi "identities_2_solr_identities **hoặc** identities_2_redis_identities"

**Sửa thành:** "identities_2_solr_identities **và** identities_2_redis_identities"

Bổ sung steps:
```
4. Query Solr: /select?q=id:1227692641560801280 → verify name="user_1227692641560801280"
5. Query Redis: GET identity:1227692641560801280 → verify name="user_1227692641560801280"
```

---

## Tổng kết Action Items

| # | Action | Priority | Impact |
|---|---|:---:|---|
| 1 | **Bổ sung 4-5 TC Source Updater** | 🔴 Critical | Exit Criteria #6 |
| 2 | **Bổ sung 5-6 TC Regression** keyword/hashtag/source | 🔴 Critical | Exit Criteria #7 |
| 3 | **Bổ sung 3-4 TC Idempotency & Stability** | 🔴 Critical | NFR coverage |
| 4 | **Bổ sung 4-5 TC DB Verification** Mongo/Solr/Redis | 🟡 High | Data persistence |
| 5 | Sửa Priority: phân biệt P0/P1/P2 | 🟡 High | Prioritization |
| 6 | Chi tiết hóa Test Steps | 🟡 High | Executability |
| 7 | Tách TC_INVALID_018 thành 2 TC | 🟢 Medium | Test precision |
| 8 | Sửa label TC_INVALID_020 | 🟢 Medium | Correctness |
| 9 | Bổ sung 3-4 TC Boundary engagement | 🟢 Medium | Boundary coverage |
| 10 | Bổ sung 1-2 TC Security/Data Leakage | 🟢 Medium | Security |
| 11 | Resolve 6 TC có "Need Confirm" | 🟢 Medium | Executability |
| 12 | Fix Test Type (Integration, Contract...) | 🟢 Low | Report accuracy |

> [!IMPORTANT]
> **Ước tính bổ sung:** 20-23 TC mới → tổng bộ TC sẽ là **63-66 cases**, nằm đúng trong khoảng ước lượng Test Plan (54-72). Sau khi bổ sung, bộ TC sẽ đạt coverage **95%+** so với Test Plan scope.

---

*Review được thực hiện bởi Senior QA/Test Analyst (AI-assisted) dựa trên đối chiếu 43 test cases trong Google Sheet với Test Plan v1.1 YNMSHGYSG-1169, Jira ticket, và best practices trong test design.*
