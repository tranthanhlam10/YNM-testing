# 📋 TEST PLAN REVIEW REPORT
## TP-YNMPDP-6004-v1.0 — [New Crawler] Youtube Post

| Field | Value |
|---|---|
| **Tài liệu được review** | [TestPlan_YNMPDP-6004_New_Crawler_Youtube_Post.md](file:///Users/tranthanhlam/YNM-testing/Ai_Agents/test_plans/local/youtube_post_crawler/TestPlan_YNMPDP-6004_New_Crawler_Youtube_Post.md) |
| **Jira ticket** | [YNMPDP-6004](https://jira.younetco.com/browse/YNMPDP-6004) |
| **Người review** | Senior QA Lead (AI-assisted) |
| **Ngày review** | 10/07/2026 |
| **Kết luận tổng thể** | **Tốt — Cần bổ sung một số phần trước khi sign-off** |

---

## 1. NHẬN XÉT TỔNG QUAN

> [!NOTE]
> Test Plan được viết với **chất lượng trên trung bình**, thể hiện sự hiểu biết sâu về kiến trúc data pipeline và luồng kỹ thuật. Tài liệu có cấu trúc logic, cover được hầu hết các module chính từ Loader → Builder → Crawler → Resolver → Persistence. Tuy nhiên, có **một số thiếu sót quan trọng** cần bổ sung trước khi đưa vào thực thi.

### Điểm đánh giá nhanh:

| Tiêu chí | Đánh giá | Ghi chú |
|---|:---:|---|
| Cấu trúc & format | ⭐⭐⭐⭐⭐ | Rõ ràng, chuyên nghiệp, dễ đọc |
| Scope coverage | ⭐⭐⭐⭐ | Khá đầy đủ, thiếu vài khu vực (xem bên dưới) |
| Test strategy | ⭐⭐⭐⭐ | Kỹ thuật test phù hợp, cần rõ hơn execution approach |
| Entry/Exit criteria | ⭐⭐⭐⭐ | Đủ cụ thể, cần bổ sung metrics |
| Risk management | ⭐⭐⭐⭐ | Risks phù hợp, mitigation thực tế |
| Timeline & Resource | ⭐⭐ | **Thiếu hoàn toàn** — Thiếu sót lớn nhất |
| Roles & Responsibilities | ⭐⭐ | **Thiếu hoàn toàn** |
| Test data specificity | ⭐⭐⭐ | Có nhưng còn generic |
| Traceability | ⭐⭐⭐ | Có link Jira/Wiki, thiếu requirement traceability matrix |

---

## 2. CÁC ĐIỂM TỐT ĐANG CÓ

### ✅ 2.1 Cấu trúc tài liệu chuyên nghiệp
- Metadata header đầy đủ: mã tài liệu, phiên bản, trạng thái, tham chiếu Jira/Wiki/Deployment.
- Các section được đánh số rõ ràng, dễ navigate.
- Sử dụng bảng (table) để trình bày thông tin có hệ thống.

### ✅ 2.2 Bối cảnh kỹ thuật và tóm tắt luồng xuất sắc
- Section 1.1 và 1.2 mô tả luồng pipeline 8 bước rất chi tiết, **khớp chính xác với Wiki technical** (page ID 314573364).
- Giúp bất kỳ QA nào đọc cũng hiểu được kiến trúc hệ thống mà không cần đọc thêm tài liệu khác.

### ✅ 2.3 Phần Assumption/Need Confirm rất thực tế
- 5 items cần confirm đều là những điểm mà QA thực chiến sẽ gặp: tên collection thực tế, downstream service readiness, parity expectation, API quota, country matrix.
- Đây là dấu hiệu của một Test Plan có tính thực thi cao.

### ✅ 2.4 In-Scope chi tiết đến từng hạng mục test (39 items)
- Chia rõ 6 module, mỗi module liệt kê cụ thể từng hạng mục verify.
- Mapping table cho Mention/Post **khớp hoàn toàn với Wiki mapping table** — cross-verification đã được thực hiện tốt.

### ✅ 2.5 Out-of-Scope có reasoning rõ ràng
- Mỗi hạng mục out-of-scope đều ghi lý do, tránh tranh cãi về scope sau này.

### ✅ 2.6 Test Strategy phân loại tốt
- Functional, API/Integration, Data Sync, Non-functional — cover đủ các layer testing cần thiết cho backend/data pipeline.
- Kỹ thuật test cụ thể cho từng nhóm: Boundary/Decision Table cho Loader, Contract Testing cho Queue, State Transition cho Paging.

### ✅ 2.7 Queue/Exchange monitor list chi tiết
- Section 4.3 liệt kê đầy đủ 7 nhóm queue/exchange với routing key, **khớp hoàn toàn với bảng queue trong Wiki**.

### ✅ 2.8 Risk analysis thực tế và actionable
- 8 risks được identify với impact và mitigation cụ thể, đặc biệt risk #4 (paging loop) và #6 (realtime data change) rất relevant cho Youtube crawler.

---

## 3. CÁC VẤN ĐỀ / THIẾU SÓT CẦN CHỈNH SỬA

### 🔴 3.1 THIẾU: Timeline / Schedule chi tiết (Critical)

> [!CAUTION]
> Test Plan **hoàn toàn thiếu section Timeline/Schedule**. Đây là thiếu sót nghiêm trọng nhất.

Từ Jira comment (Lam Tran Thanh, 10/07/2026), timeline đã được thông báo:
- Wiki/testcases: **10/07**
- Test done: **14/07**
- Done staging: **17/07**

Nhưng Test Plan không có:
- Timeline chi tiết theo từng phase (test design → execution → regression → staging)
- Effort estimation theo man-day
- Gantt chart hoặc milestone tracking

**→ Với 71-98 test cases và due date 17/07, QA chỉ có ~5 ngày làm việc (10/07 → 17/07). Cần đánh giá lại tính khả thi.**

### 🔴 3.2 THIẾU: Roles & Responsibilities (Critical)

Test Plan ghi `Người tạo: QA Team (AI-assisted)` nhưng **không có section Roles & Responsibilities**:
- Ai execute test? Ai review test result?
- Ai là Dev contact khi có blocker/question?
- Ai sign-off release?
- QA support từ Dev (Van Huynh Kien — assignee trên Jira) có vai trò gì trong testing phase?

### 🟡 3.3 SAI LOGIC: Loader filter `last_status` (Medium)

Trong Section 2.1, Module 1, STT #1:
> Verify chỉ load source có... loại `last_status` thuộc `(4 5)`

Trong Section 4.4, Test data:
> Source bị `last_status` 4/5 → Verify Loader **không load**

**Hai chỗ này mâu thuẫn nhau.** Theo Wiki query filter: `"-last_status": "(4 5)"` — dấu `-` prefix nghĩa là **exclude** (NOT IN). Vậy:
- ✅ Source có `last_status = 4 hoặc 5` → **KHÔNG được load** (bị exclude)
- ✅ Source có `last_status` khác 4, 5 → **được load**

Section 2.1 STT #1 mô tả không rõ ràng, dễ hiểu ngược. Cần sửa lại wording cho chính xác.

### 🟡 3.4 THIẾU: Engagement data collection flow (Medium)

> [!IMPORTANT]
> Wiki mapping ghi engagement (views, likes, comments) lấy từ `videos.list` statistics — đây là **một API call riêng biệt** (`youtube.videos.list`) khác với `playlistItems.list` đang được crawl.

Test Plan cần làm rõ:
- Resolver có gọi thêm `videos.list` API hay lấy statistics từ nguồn nào?
- Nếu gọi API riêng, token/quota bị ảnh hưởng gấp đôi?
- Nếu không gọi, engagement data lấy từ đâu?

Section 2.1 Module 4, STT #22 ghi verify engagement nhưng **không mô tả cách service lấy statistics data**.

### 🟡 3.5 THIẾU: `delay_time_rules`, `from_date`, `to_date` testing (Medium)

Builder module (STT #10) mention field `delay_time_rules`, `from_date`, `to_date` trong source metadata. Nhưng:
- Không có test case nào verify logic `delay_time_rules` (ảnh hưởng `next_crawl_time`)
- Không có test case verify `from_date`/`to_date` filtering behavior
- Đây có thể ảnh hưởng đến paging stop condition

### 🟡 3.6 MƠ HỒ: `shard` field derivation (Medium)

STT #21 ghi `shard derived from created_date` nhưng không mô tả rule derivation cụ thể. Cần confirm với Dev:
- Shard format là gì? (YYYY, YYYYMM, hash-based?)
- Ảnh hưởng gì đến Solr storage/query?

### 🟡 3.7 THIẾU: `mention_type` constant value (Medium)

Wiki ghi `mention_type = MENTION_TYPE.POST` nhưng Test Plan không ghi cụ thể giá trị constant là bao nhiêu (numeric value). Cần có expected value để verify trong Solr.

### 🟢 3.8 NÊN CẢI THIỆN: Test data thiếu cụ thể (Low)

Section 4.4 liệt kê nhóm data nhưng **không có channel/video id cụ thể**. Nên có:
- Ít nhất 2-3 Youtube channel id thực tế với đặc điểm khác nhau (nhiều video, ít video, private)
- Video id cố định để verify mapping (tránh issue realtime data change — đã nêu ở Risk #6)

### 🟢 3.9 NÊN CẢI THIỆN: Entry criteria #8 quá mơ hồ (Low)

> Testcase subtask YNMPDP-6082 đã có checklist/test cases baseline để execute

Subtask YNMPDP-6082 hiện đang **In Progress** trên Jira. Entry criteria nên ghi rõ: "Test cases đã được review và approve bởi QA Lead/Dev" thay vì chỉ "đã có baseline".

---

## 4. CÁC PHẦN NÊN BỔ SUNG

### 📌 4.1 Section: Timeline & Effort Estimation (Bắt buộc)

```markdown
## X. TIMELINE & EFFORT ESTIMATION

| Phase | Thời gian | Effort | Owner |
|---|---|---|---|
| Test Design & Review | 10/07 - 11/07 | 1.5 man-day | QA (Lam TT) |
| Test Data Preparation | 10/07 - 11/07 | 0.5 man-day | QA + Dev support |
| Smoke Test (Testing env) | 11/07 | 0.5 man-day | QA |
| Functional + Integration (Testing) | 11/07 - 14/07 | 3 man-days | QA |
| Bug Fix & Retest | 14/07 - 15/07 | 1 man-day | Dev + QA |
| Regression (Staging) | 15/07 - 16/07 | 1 man-day | QA |
| Sign-off & Report | 17/07 | 0.5 man-day | QA Lead |
| **Tổng** | **10/07 - 17/07** | **~8 man-days** | |

> [!WARNING]
> Buffer rất ít (0 ngày). Nếu có blocker từ API quota, 
> deployment issue, hoặc bug phức tạp, timeline sẽ bị trượt.
```

### 📌 4.2 Section: Roles & Responsibilities (Bắt buộc)

```markdown
## X. ROLES & RESPONSIBILITIES

| Vai trò | Người | Trách nhiệm |
|---|---|---|
| QA Owner | Lam Tran Thanh | Viết test plan/case, execute test, report bug, evidence |
| Dev Owner | Van Huynh Kien | Code fix, hỗ trợ setup env, giải đáp wiki/technical question |
| QA Lead/Manager | [Tên] | Review test plan, sign-off release |
| DevOps/Infra | [Tên/Team] | Deploy testing/staging, queue binding, log access |
| BA/PO | Thach Dung Pham Nhu | Clarify requirement khi cần |
```

### 📌 4.3 Section: Smoke Test Checklist (Khuyến nghị)

Nên thêm một smoke test nhanh để verify readiness trước khi chạy full execution:

```markdown
## X. SMOKE TEST CHECKLIST (Trước khi full execution)

| # | Check item | Status |
|---|---|---|
| 1 | Deployment ynmpdp-6004 healthy, pod running | ☐ |
| 2 | RabbitMQ queue/exchange binding đúng | ☐ |
| 3 | Redis DB 1 accessible | ☐ |
| 4 | MongoDB ynm_crawler accessible | ☐ |
| 5 | Solr mentions accessible | ☐ |
| 6 | MySQL crawling_loaders accessible | ☐ |
| 7 | Token Manager trả token thành công cho YT_IDENTITY_CRAWLER | ☐ |
| 8 | Loader load được ≥1 source, publish vào queue thành công | ☐ |
| 9 | E2E flow: 1 source → mention + post xuất hiện trong Solr/Mongo | ☐ |
```

### 📌 4.4 Section: Requirement Traceability Matrix (Khuyến nghị)

Nên có bảng mapping giữa requirement từ Wiki ↔ Test case group để đảm bảo coverage:

```markdown
## X. REQUIREMENT TRACEABILITY MATRIX

| Wiki Requirement | Test Plan Module | Test Cases (YNMPDP-6082) |
|---|---|---|
| Load identity query với filter | Module 1: Loader | TC-001 → TC-014 |
| Builder convert UC→UU, build request | Module 2: Builder | TC-015 → TC-022 |
| Crawler call YT API, token integration | Module 3: Crawler | TC-023 → TC-032 |
| Resolver mapping mention/post | Module 4: Resolver | TC-033 → TC-054 |
| Paging, finished source, lock | Module 5: Paging | TC-055 → TC-066 |
| Persistence Solr/Mongo/MySQL | Module 6: Persistence | TC-067 → TC-076 |
```

### 📌 4.5 Bug Severity/Priority Classification (Khuyến nghị)

Nên define rõ tiêu chí phân loại severity bug trong context task này:

```markdown
| Severity | Criteria (trong context YNMPDP-6004) |
|---|---|
| Blocker | Service crash, không chạy được pipeline end-to-end |
| Critical | Mất data (mention/post không lưu), duplicate data, lock treo không release |
| Major | Mapping sai field, engagement tính sai, paging thiếu/thừa page |
| Minor | Log thiếu trace info, format timestamp khác expected |
| Trivial | Typo trong log message, field order khác |
```

---

## 5. RỦI RO HOẶC ĐIỂM CẦN LÀM RÕ

### ⚠️ 5.1 Timeline rất tight — cần escalation plan

- Hôm nay 10/07, due date 17/07, chỉ còn **5 ngày làm việc**.
- 71-98 test cases là con số lớn cho 1 QA engineer.
- **Rủi ro cao nhất**: nếu Test Plan chưa được sign-off hôm nay, execution bắt đầu muộn → staging sẽ bị trượt.
- **Recommend**: Xác định rõ P0 cases phải pass (ước tính ~48-66 cases) và P1 cases có thể defer nếu hết thời gian.

### ⚠️ 5.2 Collection name discrepancy chưa resolve

Test Plan đã identify đúng (Assumption #1): Wiki ghi load từ `identity`, bảng DB ghi `identity_crawling`. 
- Từ Wiki page, bước 1 ghi rõ: *"Load dữ liệu của source từ collection **identity**"*
- Bảng DB lại ghi: *MongoDB `ynm_crawler` → `identity_crawling`*
- **→ Cần Dev confirm trước khi viết test case query DB.**

### ⚠️ 5.3 `videos.list` statistics API call — chưa rõ trong luồng

Wiki mapping table ghi engagement lấy từ `videos.list` statistics, nhưng:
- Luồng 8 bước chỉ mô tả `playlistItems` API call
- Không thấy bước nào gọi `videos.list`
- **→ Cần hỏi Dev: Resolver có gọi thêm `videos.list` API hay engagement data đã embedded trong crawled response?**

Nếu có API call riêng, cần bổ sung:
- Test case cho `videos.list` error handling
- Token quota consideration (double API calls)
- Batch/rate limiting logic

### ⚠️ 5.4 `standard` thumbnail thiếu trong priority list

Wiki ghi thumbnail priority: `maxres > high > medium > default`
Response mẫu trong Wiki có `standard` thumbnail nhưng **không được mention trong priority list**.
- Test Plan STT #24 ghi: `maxres > high > medium > default` — khớp với Wiki mapping
- **→ Nhưng cần verify: `standard` thumbnail bị bỏ qua hay nằm ở đâu trong priority?**

### ⚠️ 5.5 Sprint đã overdue

Jira cho thấy task đang ở sprint "DC: 22 Jun 2026 - 03 Jul 2026" với `endDate = 2026-07-03`. Sprint đã kết thúc 7 ngày trước nhưng task vẫn đang `To be Tested`.
- **→ Cần align với PM/Scrum Master về timeline expectation.**

### ⚠️ 5.6 Chưa có Rollback/Go-No-Go criteria

Exit criteria ghi "Release Sign-off/Go-No-Go" nhưng không define:
- Go criteria vs No-Go criteria cụ thể
- Rollback plan nếu production phát hiện issue
- Monitoring checklist sau release

---

## 6. ĐỀ XUẤT PHIÊN BẢN CẢI THIỆN CHO CÁC PHẦN CHƯA TỐT

### 6.1 Sửa Section 2.1 Module 1 STT #1 — Loader filter wording

**Hiện tại (mơ hồ):**
> Verify chỉ load source có `platform = 7`, đúng `country_code`, `priority` trong range, `next_crawl_time <= time_next_cycle`, loại `last_status` thuộc `(4 5)`

**Đề xuất (rõ ràng):**
> Verify chỉ load source thỏa **tất cả** điều kiện: `platform = 7`, đúng `country_code` theo config, `priority` nằm trong range `[min_priority, max_priority]`, `next_crawl_time <= time_next_cycle`, và `last_status` **KHÔNG thuộc** `(4, 5)` (exclude filter theo prefix `-` trong query)

### 6.2 Bổ sung vào Section 2.1 Module 4 — Engagement data source

**Thêm STT mới sau #22:**

| STT | Hạng mục | Mô tả |
|---|---|---|
| 22a | Statistics API call | [Need Confirm] Verify Resolver gọi `videos.list` API với `part=statistics` để lấy viewCount/likeCount/commentCount, hoặc confirm mechanism lấy statistics data |
| 22b | Statistics batch/error | Nếu gọi API riêng: verify batch request và error handling khi `videos.list` thất bại (fallback value cho engagement) |

### 6.3 Cải thiện Section 4.4 — Test data cụ thể

**Đề xuất bổ sung bảng sample data:**

| Nhóm | Channel ID / Video ID mẫu | Đặc điểm | Ghi chú |
|---|---|---|---|
| Happy path | `UC...` (channel có ~50-200 video) | Channel công khai, nhiều video, có statistics | Dev cung cấp hoặc QA chọn từ identity collection |
| Paging | `UC...` (channel có >50 video) | Đảm bảo có nextPageToken | Verify ≥2 pages |
| Empty | `UC...` (channel mới, 0 video) | Không có items trong response | Verify finished source |
| Private/deleted | `UC...` (channel bị private) | API trả lỗi 403/404 | Verify error handling |
| Edge case | Video thiếu thumbnail maxres | Chỉ có `default` thumbnail | Verify fallback logic |

### 6.4 Cải thiện Exit Criteria — Thêm metrics

**Thêm vào Section 5.2:**

| # | Điều kiện | Metric |
|---|---|---|
| 10 | Test execution rate | ≥ 95% test cases executed (N/A có lý do) |
| 11 | Pass rate | ≥ 90% test cases passed sau fix |
| 12 | Regression | 100% regression pass trên staging |
| 13 | Go-No-Go | QA Lead ký sign-off khi tất cả criteria 1-12 đạt |

### 6.5 Bổ sung Post-release Monitoring plan

```markdown
## Post-release Monitoring (Production)

| Thời điểm | Check item | Tool/Method |
|---|---|---|
| 0-1h sau release | Pod healthy, không restart loop | K8s dashboard |
| 0-1h sau release | Queue không backlog bất thường | RabbitMQ Management |
| 1-4h sau release | Mention/Post mới xuất hiện trong Solr/Mongo | DB query sample |
| 1-4h sau release | Redis lock không treo | Redis CLI |
| 24h sau release | So sánh throughput với baseline | Monitoring dashboard |
| 24h sau release | Log không có error pattern mới | Log search |
```

---

## TỔNG KẾT

| Hạng mục | Số lượng |
|---|---|
| Thiếu sót Critical (phải sửa trước sign-off) | **2** (Timeline, Roles & Responsibilities) |
| Thiếu sót Medium (nên sửa trước execution) | **5** (Loader filter wording, Engagement flow, delay_time_rules, shard, mention_type) |
| Thiếu sót Low (nice to have) | **2** (Test data specificity, Entry criteria clarity) |
| Sections nên bổ sung | **5** (Timeline, R&R, Smoke checklist, RTM, Severity guide) |
| Risks cần làm rõ với Dev | **4** (Collection name, videos.list API, standard thumbnail, delay_time_rules) |

> [!IMPORTANT]
> **Recommendation**: Test Plan có nền tảng kỹ thuật rất tốt. Cần bổ sung **Timeline** và **Roles & Responsibilities** trước khi sign-off. Song song đó, cần resolve các [Need Confirm] items (đặc biệt #2 - Engagement API flow và #1 - Collection name) với Dev **trong ngày 10/07** để không block test design.
>
> Sau khi bổ sung, Test Plan đủ điều kiện sign-off và bắt đầu execution.
