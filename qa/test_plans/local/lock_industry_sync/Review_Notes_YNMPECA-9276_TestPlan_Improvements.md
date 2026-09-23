# REVIEW NOTES — CÁC ĐIỂM CẦN CẢI THIỆN TEST PLAN

## YNMPECA-9276 — Exclude Locked Industries during WS/MS Sync

| Field | Value |
|---|---|
| Test Plan được review | `TestPlan_YNMPECA-9276_Exclude_Locked_Industries_Sync.md` |
| Requirement baseline | BA Spec `02-F01-exclude-locked-industries-sync.md` v2.1 |
| Kết quả review | Conditional Approval — cần cập nhật trước khi baseline/sign-off |
| Mục đích file | Checklist hành động để chỉnh Test Plan rõ ràng, nhất quán và có thể thực thi |

---

## 1. KẾT LUẬN NGẮN

Test Plan có cấu trúc tốt và coverage nghiệp vụ tương đối đầy đủ, đặc biệt ở core lock, rolling boundary, hai luồng sync và các edge case reclassify/concurrency.

Tuy nhiên, chưa nên dùng bản hiện tại làm execution baseline cho đến khi xử lý các điểm blocking sau:

- Làm rõ cách technical design bảo đảm lock xét cả `record.industry_id` và industry hiện tại của PI.
- Làm rõ expected result khi `record.industry_id = NULL` nhưng PI hiện tại thuộc locked industry.
- Đồng bộ trạng thái sub-task, dependency và Need Confirm.
- Bổ sung failure lifecycle cho message, Redis hash và callback API.
- Xác nhận cách QA trigger/observe luồng Sync industry và cách mock thời gian.
- Điều chỉnh timeline/resource cho phù hợp với effort 7.0–9.5 man-days.

---

## 2. CHECKLIST ƯU TIÊN

### 2.1 Blocker — cần hoàn tất trước khi baseline

- [ ] **B1 — Xác nhận two-sided lock của BR-06**
  - `lookupFilters industry_id` đang lọc theo industry trên PI hay trên PIW/PIM record?
  - Technical design bảo vệ trường hợp nào sau đây bằng cách nào?
    - Record industry locked, current PI industry unlocked.
    - Record industry unlocked, current PI industry locked.
  - Nếu filter chỉ xét một phía thì cần cập nhật design hoặc bổ sung guard tại consumer.

- [ ] **B2 — Chốt quy tắc NULL**
  - Cần BA/Dev xác nhận trường hợp closed period, `record.industry_id = NULL`, current PI industry locked.
  - Expected là `SKIP` theo guard chống inflow hay `SYNC` theo BR-07?
  - Sau khi chốt, cập nhật BR reference, decision table và test cases nhất quán.

- [ ] **B3 — Đồng bộ dependency status**
  - Metadata/NC-4 đang ghi YNMPECA-9293 `In Progress` nhưng D1 đang ghi `Done`.
  - Không đánh dấu D1–D7 `Done/Ready` nếu chưa có evidence.
  - Mỗi dependency cần có: owner, status thực tế, evidence/link, ngày xác nhận.

- [ ] **B4 — Chốt technical contract**
  - Message format và số lượng message khi có 0/1/2 bucket.
  - Inclusive/exclusive của time range.
  - Redis key format, TTL và lifecycle.
  - PUT API request/response/error contract.
  - Status của request khi partial success/failure.

- [ ] **B5 — Bảo đảm khả năng test luồng Sync industry**
  - Xác định script/tool/API dùng để trigger.
  - Xác định cách quan sát chiều 1 và chiều 2.
  - Cấp quyền log, queue, MySQL, SOLR và Redis cho QA.
  - Chuyển NC-6 và NC-7 từ `Nice-to-have` thành blocking cho integration testing.

- [ ] **B6 — Chốt chiến lược test thời gian**
  - Dùng injectable clock, test hook hoặc mock time.
  - Không phụ thuộc vào việc chờ 0h00 ngày 17 ngoài đời thực.
  - Xác nhận timezone của App, Data worker, DB/log và queue timestamp.

### 2.2 High — cần hoàn tất trước full execution/sign-off

- [ ] **H1 — Bổ sung queue/message partition scenarios**
  - Không có locked industry.
  - Tất cả industry đều locked.
  - Locked và unlocked cùng request.
  - Time range hoàn toàn closed.
  - Time range hoàn toàn open.
  - Time range cắt qua rolling boundary.
  - Record industry và PI industry mismatch theo cả hai chiều.

- [ ] **H2 — Bổ sung Redis/API failure lifecycle**
  - Một message hoàn tất, message còn lại fail/timeout.
  - Callback đến không đúng thứ tự.
  - Duplicate callback.
  - Callback với unknown/expired hash.
  - API timeout hoặc trả 4xx/5xx.
  - Redis unavailable/key expired.
  - Retry không làm request chuyển `Synced` sớm hoặc sai trạng thái.

- [ ] **H3 — Bổ sung record-level data integrity**
  - Không chỉ đối chiếu GMV/Sold aggregate.
  - So sánh từng record hoặc checksum toàn document trước–sau.
  - Xác nhận các field mapping, GMV/Sold, `updated_at`, version và metadata có được phép đổi hay không.
  - Với hành vi `SKIP`, cần định nghĩa rõ “không phát sinh write”.

- [ ] **H4 — Bổ sung schema/migration coverage**
  - Field `lock_sync` đúng type/nullability/default.
  - Industry mới mặc định FALSE.
  - Existing industries được backfill FALSE.
  - Không có record NULL/invalid sau migration.
  - Xác nhận rollback/migration failure strategy nếu có.

- [ ] **H5 — Bổ sung snapshot scenarios**
  - Đổi lock sau khi tạo Sync PI request nhưng trước khi consumer chạy.
  - Đổi lock giữa hai message.
  - Đồng hồ qua ngày 17 khi request đang nằm trong queue.
  - Retry dùng lại snapshot ban đầu.
  - Hai chiều Sync industry dùng cùng snapshot hay snapshot riêng — cần confirm.

- [ ] **H6 — Sửa Entry Criteria**
  - Bổ sung build/version cho App API, Data worker, UI và DB migration.
  - Bổ sung trigger/access/log readiness.
  - Bổ sung controlled clock/test hook.
  - Bổ sung test data catalogue và reset procedure.
  - Dev Wiki có thể chưa hoàn thiện toàn bộ, nhưng contract dùng để test phải được baseline.

- [ ] **H7 — Sửa Exit Criteria**
  - 100% P0 executed và passed; không còn P0 blocked/skipped chưa waiver.
  - Không còn bug Critical/High trong toàn bộ scope.
  - Medium/Low còn mở phải có risk acceptance bằng văn bản.
  - Record-level integrity và aggregate integrity đều pass.
  - Cả hai luồng và hai chiều Sync industry đều pass.
  - Snapshot/retry/partial failure/callback idempotency đều pass.
  - Performance và auditability phải pass hoặc có waiver.
  - Test Summary Report phải là deliverable bắt buộc trước sign-off.

### 2.3 Medium — cải thiện tính chuyên nghiệp và khả năng thực thi

- [ ] **M1 — Điều chỉnh priority**
  - P0: core lock, two-sided guard, closed/open boundary, snapshot, two-way Sync industry, retry không làm đổi dữ liệu locked.
  - P1: Sync Only Labels, dynamic list, non-locked regression, API negative, performance/audit.
  - P2: vị trí/màu sắc/in nghiêng của UI note và browser breadth nếu không có business impact lớn.

- [ ] **M2 — Sửa định nghĩa tính nhất quán**
  - Không dùng: “Cùng locked list thì kết quả giống nhau ở mọi lần chạy”.
  - Nên dùng: “Cùng lock snapshot, rolling boundary, input và source data thì tập SKIP/SYNC phải giống nhau”.

- [ ] **M3 — Bổ sung calendar edge cases**
  - 16 23:59:59 và 17 00:00:00 giờ VN.
  - Tháng 12 → tháng 1.
  - ISO week 52/53 và tuần nằm giữa hai năm.
  - Leap year nếu logic chuyển đổi ngày/tháng có liên quan.
  - Boundary inclusive cho PIM và PIW.

- [ ] **M4 — Chuẩn hóa test data**
  - Mỗi dataset có PI ID, record ID, record industry, current PI industry, lock state, shard, expected decision và expected fields.
  - Có script/setup steps, owner, cleanup/reset và evidence location.
  - Data giữa các test concurrency/retry phải được cô lập.

- [ ] **M5 — Bổ sung RTM**
  - Mapping `BR/AC/EC/NFR → Test Case ID → Priority → Test level → Evidence`.
  - Không chỉ ghi estimated number of cases theo User Story.

- [ ] **M6 — Chuẩn hóa roles thành RACI**
  - Bổ sung DevOps/DBA, Data Team, App/Support, ECI/QC và Release Owner.
  - Ghi rõ ai trigger, ai cung cấp data, ai verify GMV/Sold, ai approve residual risk và ai quyết định release.

- [ ] **M7 — Gắn link deliverables**
  - Test Cases.
  - RTM.
  - Data preparation scripts/checklist.
  - Execution report và evidence folder.
  - Test Summary Report.

---

## 3. DECISION TABLE CẦN BỔ SUNG

Decision table hiện tại cần tách rõ trạng thái NULL của từng phía thay vì dùng chung `N/A`.

| # | Record industry | Current PI industry | Period | Expected | Trạng thái |
|---|---|---|---|---|---|
| 1 | Unlocked | Unlocked | Closed | SYNC | Đã rõ |
| 2 | Locked | Unlocked | Closed | SKIP | Đã rõ |
| 3 | Unlocked | Locked | Closed | SKIP | Đã rõ |
| 4 | Locked | Locked | Closed | SKIP | Đã rõ |
| 5 | NULL | Unlocked | Closed | Cần xác nhận/SYNC theo BR-07 | Cần confirm |
| 6 | NULL | Locked | Closed | Cần BA xác nhận | **Blocking** |
| 7 | Unlocked | NULL | Closed | Cần xác nhận | Cần confirm |
| 8 | Locked | NULL | Closed | SKIP theo record side | Cần confirm |
| 9 | NULL | NULL | Closed | SYNC | Cần confirm |
| 10 | Bất kỳ | Bất kỳ | Open | SYNC | Đã rõ |

Sau khi BA confirm, cập nhật cùng lúc ở:

- Objective/core rule.
- Scope Module 1.
- Decision table phụ lục.
- Test data matrix.
- Test cases cho cả Sync PI và Sync industry.

---

## 4. NỘI DUNG MẪU ĐỂ THAY ENTRY CRITERIA

### Entry Criteria — Proposed

| # | Tiêu chí | Mức độ | Evidence bắt buộc |
|---|---|---|---|
| 1 | BA Spec và Dev technical contract đã baseline theo version | Mandatory | Link/version/date |
| 2 | App API, Data worker, UI và DB migration đã deploy lên Testing | Mandatory | Build/commit/deployment record |
| 3 | Unit/contract test cho BR-06, rolling boundary và callback API đã pass | Mandatory | CI result |
| 4 | Message/hash/API contract và partial-failure behavior đã được Dev xác nhận | Mandatory | Wiki/contract/NC resolution |
| 5 | QA trigger được Sync PI và cả hai chiều Sync industry | Mandatory | Smoke evidence |
| 6 | QA truy cập được MySQL, SOLR, Redis, queue và logs | Mandatory | Access smoke evidence |
| 7 | Controlled clock/test hook hoạt động với timezone UTC+7 | Mandatory | Time-boundary smoke result |
| 8 | Test dataset và expected results đã được chuẩn bị, có reset procedure | Mandatory | Data catalogue/link |
| 9 | Không còn blocking NC về two-sided lock, NULL, snapshot và failure lifecycle | Mandatory | NC status = Closed |
| 10 | Testing environment smoke test pass | Mandatory | Smoke report |

---

## 5. NỘI DUNG MẪU ĐỂ THAY EXIT CRITERIA

### Exit Criteria — Proposed

| # | Tiêu chí | Mức độ |
|---|---|---|
| 1 | 100% P0 đã executed và Passed; không có P0 Blocked/Skipped chưa được waiver | Mandatory |
| 2 | Không còn bug Critical/High trong toàn bộ feature scope | Mandatory |
| 3 | Mọi Medium/Low còn mở có documented risk acceptance từ Release Owner/BA/Dev Lead | Mandatory |
| 4 | Locked records ở closed period không thay đổi ở record level và aggregate GMV/Sold | Mandatory |
| 5 | Open-period và unlocked records được update đúng expected fields | Mandatory |
| 6 | Sync PI pass cho All Fields và Only Labels | Mandatory |
| 7 | Cả hai chiều Sync industry pass, bao gồm mismatch/inflow/outflow | Mandatory |
| 8 | Rolling boundary, timezone, PIW/PIM shard và cross-year cases pass | Mandatory |
| 9 | Snapshot giữ nguyên qua queue delay, lock change, boundary change và retry | Mandatory |
| 10 | Message/hash/API lifecycle pass cho success, partial failure, duplicate và out-of-order callback | Mandatory |
| 11 | Request không chuyển `Synced` khi còn pending hash/message | Mandatory |
| 12 | Performance regression ≤10%; audit log/traceability đạt requirement hoặc có approved waiver | Mandatory |
| 13 | Targeted regression trên non-locked industries pass | Mandatory |
| 14 | Test Summary Report, evidence và release recommendation đã phát hành | Mandatory |

---

## 6. ĐIỀU CHỈNH TIMELINE & RESOURCE

### Vấn đề hiện tại

- Khoảng 16–24/07/2026 có 7 ngày làm việc.
- Tổng effort ghi trong Test Plan là 7.0–9.5 man-days với 1 QA.
- Phase execution 17–21/07 chỉ có 3 ngày làm việc nhưng estimate 3.0–4.0 man-days.
- Chưa có buffer rõ ràng cho environment block, triage, redeploy và failed regression.

### Phương án A — Giữ deadline 24/07

- Bổ sung ít nhất 1 QA hỗ trợ integration/data/concurrency.
- QA chính tập trung core functional, boundary và sign-off.
- QA hỗ trợ phụ trách queue/Redis/API, retry/concurrency và evidence.
- UI cosmetic/browser breadth chuyển P2 nếu cần giảm scope.
- Technical contract và deploy phải hoàn tất trước execution.

### Phương án B — Giữ 1 QA

- Dời sign-off dự kiến tới 28–29/07, tùy ngày code thực tế sẵn sàng.
- Tách rõ QA effort và Dev effort; không cộng thời gian Dev fix vào QA man-days.
- Dành tối thiểu 0.5–1 ngày buffer cho redeploy/retest.
- Chỉ cam kết ngày release sau khi Entry Criteria mandatory đã đạt.

---

## 7. RỦI RO NÊN BỔ SUNG VÀO TEST PLAN

| ID | Rủi ro | Mức độ | Hướng xử lý |
|---|---|---|---|
| R11 | Message partition chỉ xét một phía industry, làm lọt inflow/outflow vào closed period | Critical | Contract review + mismatch integration tests cho cả hai chiều |
| R12 | Request chuyển `Synced` sớm khi một hash bị xóa nhưng message khác chưa hoàn tất | High | State-transition tests, partial/out-of-order callback tests |
| R13 | Aggregate GMV/Sold không đổi nhưng các record thành phần đã bị thay đổi bù trừ | High | Record-level diff/checksum trước–sau |
| R14 | Redis key hết TTL hoặc mất key khiến request có trạng thái sai | High | Confirm TTL/recovery; test missing/expired hash |
| R15 | Không kiểm soát được system time làm boundary tests không lặp lại được | High | Injectable clock/test hook |
| R16 | PIW shard tuần 52/53 hoặc cross-year được map sai tháng | High | Dataset Dec–Jan, ISO week 52/53 |
| R17 | Existing industries không được backfill `lock_sync = FALSE` đúng sau migration | High | Schema/migration validation |
| R18 | QA không trigger/observe được chiều 2 của Sync industry | High | Xác nhận tool/access/owner trong Entry Criteria |

---

## 8. THỨ TỰ CẬP NHẬT KHUYẾN NGHỊ

1. Đóng B1 và B2 với BA/Dev vì có thể làm thay đổi core expected behavior.
2. Cập nhật technical contract và failure lifecycle.
3. Sửa dependency/Need Confirm/Entry Criteria theo trạng thái có evidence.
4. Cập nhật decision table và test data matrix.
5. Bổ sung queue/API/Redis, snapshot, retry và record-level integrity coverage.
6. Sửa Exit Criteria và priority.
7. Điều chỉnh timeline/resource.
8. Bổ sung RTM, RACI, deliverable links và production monitoring.
9. Gửi lại Test Plan v1.1 để BA/Dev/QA Lead review và baseline.

---

## 9. DEFINITION OF READY CHO TEST PLAN V1.1

Test Plan v1.1 được xem là sẵn sàng baseline khi:

- [ ] Tất cả blocker B1–B6 đã đóng.
- [ ] Decision table không còn expected result mơ hồ.
- [ ] Dependency status khớp Jira/deployment evidence.
- [ ] Entry/Exit Criteria đã cập nhật.
- [ ] Timeline phù hợp với số QA và ngày làm việc thực tế.
- [ ] RTM và test data catalogue có link/version.
- [ ] Technical failure lifecycle đã có expected behavior.
- [ ] BA, Dev Lead và QA Lead đã review/sign-off baseline.

---

*File note này phục vụ cập nhật Test Plan; không thay thế BA Spec, Dev Wiki hoặc quyết định chính thức trên Jira.*
