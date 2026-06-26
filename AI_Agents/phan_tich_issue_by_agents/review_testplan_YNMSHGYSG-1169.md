# 🔍 REVIEW TEST PLAN — YNMSHGYSG-1169
## [DATA] Improve Crawling Post From Reply On Platform X
**Reviewer:** Senior QA Lead (AI-assisted)
**Ngày review:** 26/06/2026
**Tài liệu review:** [TestPlan_YNMSHGYSG-1169](file:///Users/tranthanhlam/YNM-testing/Ai_Agents/TestPlan/Data%20local/TestPlan_YNMSHGYSG-1169_Improve_Crawling_Post_From_Reply_X.md)
**Requirement:** [YNMSHGYSG-1169](https://jira.younetco.com/browse/YNMSHGYSG-1169) — Status: **To be Tested**, Due: **06/07/2026**

---

## 1. Nhận xét tổng quan về Test Plan

> [!NOTE]
> **Đánh giá chung: 7.5/10 — Khá tốt, cần bổ sung một số phần quan trọng để hoàn chỉnh**

Test Plan được viết **khá chi tiết và có chiều sâu kỹ thuật** cho một task data pipeline backend. Người viết thể hiện sự hiểu biết tốt về luồng crawling X Post From Reply, các service liên quan, và các bug/task port từ hashtag/keyword flow. Tài liệu có cấu trúc logic rõ ràng, bao phủ từ scope → strategy → environment → criteria → risk.

**Tuy nhiên**, Test Plan **thiếu một số phần tiêu chuẩn quan trọng** của một bản Test Plan chuyên nghiệp và có **một số điểm cần làm rõ** trước khi có thể triển khai testing hiệu quả.

### Tóm tắt đánh giá theo từng phần:

| Phần | Đánh giá | Ghi chú |
|---|:---:|---|
| Objective & Background | ⭐⭐⭐⭐ | Rõ ràng, liên kết tốt với Jira |
| Scope (In/Out) | ⭐⭐⭐⭐ | Chi tiết, phân module hợp lý |
| Test Strategy | ⭐⭐⭐⭐ | Kỹ thuật test phù hợp cho backend pipeline |
| Test Environment | ⭐⭐⭐⭐ | Liệt kê đầy đủ services, queues, data |
| Entry/Exit Criteria | ⭐⭐⭐⭐ | Đủ và thực tế |
| Risks & Mitigations | ⭐⭐⭐⭐⭐ | Điểm mạnh nhất — phân tích rủi ro rất tốt |
| Deliverables | ⭐⭐⭐ | Có nhưng thiếu deadline cụ thể |
| **Timeline/Schedule** | ❌ | **THIẾU HOÀN TOÀN** |
| **Roles & Responsibilities** | ❌ | **THIẾU HOÀN TOÀN** |
| **Assumptions & Dependencies** | ❌ | **THIẾU — chỉ nằm rải rác** |
| **Test Estimation** | ⚠️ | Có ước lượng case nhưng thiếu effort (man-day) |
| **Approval/Sign-off** | ❌ | **THIẾU HOÀN TOÀN** |

---

## 2. Các điểm tốt đang có

### ✅ 2.1. Bối cảnh và mục tiêu rất rõ ràng
- Section 1.1–1.3 giải thích bối cảnh, giải pháp, và mục tiêu kiểm thử rất mạch lạc.
- Traceability tốt: mỗi nhóm thay đổi đều gắn với Jira reference cụ thể (YNMSHGYSG-1119, 1054, 661, 1139, 1117).
- Người đọc (PM/BA/Dev) có thể nhanh chóng hiểu *tại sao test* và *test gì*.

### ✅ 2.2. Phân module In-Scope chi tiết và logic
- 5 module được chia hợp lý theo luồng xử lý: Builder/Crawler → Mapping → Invalid Handling → Detect Country → Pusher/Regression.
- Mỗi module có 4-6 hạng mục cụ thể, đánh số liên tục (1-26), dễ track.
- Out-of-Scope hợp lý và giải thích rõ lý do.

### ✅ 2.3. Test Strategy phong phú, áp dụng nhiều kỹ thuật
- Sử dụng đa dạng kỹ thuật: Contract Testing, Decision Table, Equivalence Partitioning, Error Guessing, Integration Testing.
- Có bảng Mapping Requirement → Test Scenarios với ước lượng case và priority, giúp định hướng rõ.
- Non-functional testing phù hợp: stability, idempotency, log spam, partial processing.

### ✅ 2.4. Phân tích rủi ro rất tốt — Điểm mạnh nổi bật
- 12 rủi ro được phân thành 3 nhóm (kỹ thuật, quy trình, nghiệp vụ) với mức độ, xác suất, và hướng giải quyết cụ thể.
- R4 (detect country payload sai nhưng downstream vẫn ack) và R11 (consumer cũ expect `is_admin_creator`) là những insight rất sắc bén.
- R5 (empty/null/default chưa thống nhất) phản ánh kinh nghiệm thực tế.

### ✅ 2.5. Phụ lục có giá trị thực thi cao
- **Phụ lục A (Need Confirm):** 8 câu hỏi cần xác nhận — rất chuyên nghiệp, tránh QA viết sai expected result.
- **Phụ lục B (Required Fields):** Decision table cho mention validation — sẵn sàng để viết TC.
- **Phụ lục C (Mapping tree):** Trực quan hóa coverage requirement → test area.
- **Phụ lục D (Smoke checklist):** Practical, có thể dùng ngay ngày đầu test.

### ✅ 2.6. Test data có kịch bản cụ thể
- Section 4.4 liệt kê 8 nhóm data rõ ràng: happy path, community edge case, invalid, partial, idempotency.
- Phù hợp với Decision Table Testing đã nêu trong strategy.

---

## 3. Các vấn đề / thiếu sót cần chỉnh sửa

### 🔴 3.1. THIẾU phần Timeline / Schedule (Critical)

> [!CAUTION]
> Test Plan **không có section Timeline/Schedule** — đây là phần bắt buộc trong mọi Test Plan tiêu chuẩn. Không có timeline thì không thể track tiến độ, không thể commit với PM, và không thể đánh giá liệu deadline 06/07 có khả thi hay không.

**Thông tin từ Jira comment (Lam Tran Thanh - 22/06):**
```
Wiki/testcases: 26/06
Done local: 30/06
Done testing: 02/07
Done staging: 06/07
```

→ Timeline này tồn tại nhưng **chỉ nằm trong Jira comment**, không được đưa vào Test Plan. Cần bổ sung chính thức.

**Đánh giá tính khả thi của timeline:**
- Wiki/testcases 26/06 → Done local 30/06 = **2 ngày làm việc** cho 48-63 test cases + execute local → **Rất gấp**, nhưng có thể chấp nhận nếu đã chuẩn bị sẵn test data.
- Done testing 02/07 → Done staging 06/07 = **2 ngày working + weekend** → Hợp lý nếu không có blocker.
- Tổng effort: ~**8 ngày working** từ 26/06 → 06/07. Với 48-63 TC, trung bình ~6-8 TC/ngày → chấp nhận được cho 1 QA.

---

### 🔴 3.2. THIẾU phần Roles & Responsibilities (Critical)

> [!IMPORTANT]
> Không xác định rõ **ai làm gì**. Test Plan ghi "Nguoi tao: QA Team (AI-assisted)" nhưng không rõ:
> - QA nào execute test? (Từ Jira: Lam Tran Thanh)
> - Dev nào support/fix bug? (Từ Jira: Huy Nguyen Vo Quoc)
> - BA nào confirm Need Confirm items?
> - PM nào approve test plan/sign-off release?

Đây là thông tin quan trọng cho accountability và communication.

---

### 🔴 3.3. THIẾU phần Assumptions & Dependencies (Critical)

Các assumption và dependency nằm rải rác trong document nhưng **không có section tập trung**. Ví dụ:
- **Assumption ngầm:** Token/proxy manager hoạt động bình thường (out-of-scope nhưng là dependency).
- **Assumption ngầm:** X API không thay đổi behavior trong thời gian test.
- **Dependency:** Data Pusher, Source Updater phải deploy cùng version tương thích.
- **Dependency:** Invalid queue phải được bind trước khi test (đã nêu ở R2 nhưng không tập trung).

---

### 🟡 3.4. Estimation chưa đủ chi tiết

- Có ước lượng **số lượng test cases** (48-63) nhưng **thiếu effort estimation** (man-hours/man-days).
- Không có phân bổ effort theo phase: Preparation → Execution → Regression → Report.
- Không rõ QA resource: 1 người hay nhiều người?

---

### 🟡 3.5. Deliverables thiếu deadline và owner cụ thể

Section 7 có liệt kê deliverables nhưng:
- Cột "Thoi diem ban giao" quá chung: "Trước khi viết test cases", "Trong quá trình test" — không gắn ngày cụ thể.
- Cột "Nguoi nhan" có nhưng không có "Nguoi chiu trach nhiem" (owner tạo deliverable).

---

### 🟡 3.6. Entry Criteria #8 mâu thuẫn logic

> Entry #8: "BA/Dev đã confirm các điểm Need Confirm blocker trong phụ lục A" — đánh dấu **Khuyến khích** nhưng ghi chú "NC-1/NC-2/NC-4 là blocking cho TC chi tiết".

→ **Mâu thuẫn:** Nếu NC-1, NC-2, NC-4 là blocking thì không thể chỉ "Khuyến khích". Cần tách:
- NC-1, NC-2, NC-4 → **Bắt buộc** (blocking test case design)
- NC-3, NC-5, NC-6, NC-7, NC-8 → Khuyến khích

---

### 🟡 3.7. Exit Criteria thiếu test coverage metric

- Exit criteria liệt kê kết quả theo feature (community mapping pass, invalid handling pass...) nhưng **thiếu metric coverage cụ thể**.
- Nên thêm: "≥ 95% P1 test cases executed" hoặc "Test case pass rate ≥ 98% (P0+P1)".

---

### 🟡 3.8. Thiếu Bug Severity/Priority Classification

- Test Plan đề cập "0 bug Critical/High mở" trong Exit Criteria nhưng **không định nghĩa** severity classification cho project này.
- Ví dụ: service crash = Critical? Invalid data đi normal queue = High? Fallback name sai = Medium? → Cần bảng định nghĩa.

---

### 🟡 3.9. Section 3.4 (UI/UX Testing) không cần thiết

- Ghi "Không áp dụng" thì nên bỏ section này ra khỏi Test Plan thay vì để trống. Nó tạo cảm giác template chưa được customize.

---

### 🟢 3.10. Một số điểm nhỏ về format/consistency

- Tên tài liệu dùng tiếng Việt không dấu ở heading ("Muc tieu", "Pham vi") nhưng nội dung trong bảng lại dùng tiếng Việt có dấu → **Không nhất quán**, nên chọn 1 convention.
- Section numbering nhảy: Mục 1-7 nhưng bỏ mục 6 không đánh số deliverables → thực ra đánh 1-7 đúng nhưng thiếu section cho Timeline, Roles, Assumptions.

---

## 4. Các phần nên bổ sung

### 📋 4.1. Section "Timeline & Schedule" (Bắt buộc)

```markdown
## X. TIMELINE & LICH TRINH KIEM THU

| Phase | Bat dau | Ket thuc | Noi dung | Output |
|---|---|---|---|---|
| Preparation | 26/06 | 26/06 | Viết wiki, test cases, chuẩn bị test data | Test cases, test data |
| Smoke Test (Local) | 27/06 | 27/06 | Chạy smoke checklist Phụ lục D | Smoke report |
| Execution (Local) | 27/06 | 30/06 | Execute full TC trên Local/K8s | Execution report daily |
| Execution (Testing env) | 01/07 | 02/07 | Execute trên Testing env | Execution report |
| Regression (Staging) | 03/07 | 06/07 | Regression + sign-off | Test Summary Report |
| Buffer | - | 06/07 | Bug fix + re-test | Final sign-off |
```

---

### 📋 4.2. Section "Roles & Responsibilities" (Bắt buộc)

```markdown
## X. VAI TRO & TRACH NHIEM

| Vai tro | Nguoi | Trach nhiem |
|---|---|---|
| QA Lead/Tester | Lam Tran Thanh | Viết test plan, test cases, execute, report bugs, sign-off |
| Developer | Huy Nguyen Vo Quoc | Fix bugs, confirm Need Confirm items, support debug |
| BA/Reporter | Tai Vuong Ngoc | Confirm requirement, review test plan, approve release |
| PM | [Tên PM] | Approve timeline, accept exit criteria, release decision |
| DevOps | [Tên] | Setup queue binding, environment config |
```

---

### 📋 4.3. Section "Assumptions & Dependencies" (Bắt buộc)

```markdown
## X. GIA DINH & PHU THUOC

### Assumptions (Giả định)
| # | Giả định |
|---|---|
| A1 | X API giữ nguyên response shape trong thời gian testing (không có breaking change) |
| A2 | Token/Proxy manager hoạt động ổn định, không ảnh hưởng kết quả test |
| A3 | Code ở MR #2598 là final, không có thêm commit lớn trong quá trình test |
| A4 | Luồng X keyword/hashtag community đã stable (passed ở sprint trước) |
| A5 | Dev sẽ confirm các Need Confirm items (NC-1→NC-8) trong 1 ngày làm việc |

### Dependencies (Phụ thuộc)
| # | Phụ thuộc | Owner |
|---|---|---|
| D1 | Deploy MR #2598 lên Testing env thành công | Dev + DevOps |
| D2 | Queue `invalid_data_crawling_sources` đã bind đúng trên Testing/Staging | DevOps |
| D3 | Data Pusher + Source Updater version tương thích đang chạy | DevOps |
| D4 | QA có quyền truy cập RabbitMQ Management, Mongo, Solr, Redis trên Testing | DevOps |
| D5 | Test data (crawling source samples) sẵn sàng hoặc có khả năng tạo mock | QA + Dev |
```

---

### 📋 4.4. Section "Approval / Sign-off" (Bắt buộc)

```markdown
## X. PHE DUYET

| Vai tro | Ho ten | Ngay ky | Chu ky/Trang thai |
|---|---|---|---|
| QA Lead | Lam Tran Thanh | | Pending |
| Dev Lead | Huy Nguyen Vo Quoc | | Pending |
| BA | Tai Vuong Ngoc | | Pending |
| PM | [Tên PM] | | Pending |
```

---

### 📋 4.5. Bug Severity Classification

```markdown
## X. PHAN LOAI MUC DO BUG

| Severity | Định nghĩa | Ví dụ trong scope task |
|---|---|---|
| **Critical** | Service crash, data loss, luồng chính bị nghẽn hoàn toàn | Resolver crash khi gặp invalid data; valid mention bị mất |
| **High** | Chức năng chính sai, data mapping sai nghiêm trọng | Invalid mention đi vào normal queue; detect country thiếu `mentions`; `is_admin_creator` vẫn xuất hiện |
| **Medium** | Chức năng phụ sai, data không chính xác nhưng không gây mất data | Fallback name sai format; engagement field mapping sai |
| **Low** | Cosmetic, log, documentation | Log warning thừa; field thừa trong payload nhưng không ảnh hưởng logic |
```

---

### 📋 4.6. Test Data Preparation chi tiết hơn

Section 4.4 có liệt kê nhóm data nhưng **thiếu cách tạo/nguồn data cụ thể:**

```markdown
### Cach tao test data

| Nguon | Mo ta | Dung cho |
|---|---|---|
| **Real crawling source** | Lấy message thật từ production RabbitMQ (sanitized) | Happy path, community normal |
| **Mock crawled source** | Tự tạo JSON message publish vào queue | Invalid testing, edge cases |
| **Dev sample data** | Data sample từ Dev (Huy Nguyen) trong quá trình develop | Baseline comparison |
| **Modified real data** | Clone real data, xóa/sửa field để tạo invalid | Decision table testing |
```

---

## 5. Rủi ro hoặc điểm cần làm rõ

### ⚠️ 5.1. Mapping Consistency (YNMSHGYSG-1117) thiếu chi tiết trong scope

> [!WARNING]
> Jira description không đề cập trực tiếp YNMSHGYSG-1117 nhưng Test Plan liệt kê nó trong Section 1.2 ("Mapping consistency") mà **không có test hạng mục tương ứng trong Section 2.1**. Module 2 cover mapping nhưng không rõ hạng mục nào test riêng cho YNMSHGYSG-1117.

→ **Cần làm rõ:** YNMSHGYSG-1117 có thay đổi logic riêng hay đã được merge vào các item #6-#11?

---

### ⚠️ 5.2. NC-7 (Queue binding) là hard blocker nhưng chưa được escalate

NC-7 hỏi "Queue invalid data đã được bind trên Testing/Staging chưa?" — đây là **prerequisite** cho toàn bộ Module 3 (Invalid Data Handling) gồm 5 test items (12-16), chiếm ~25% P0 cases.

→ **Nếu queue chưa bind, ~12-16 test cases sẽ bị BLOCKED.** Cần confirm ngay, không chờ "khuyến khích".

---

### ⚠️ 5.3. Regression scope có thể chưa đủ

Test Plan chỉ regression "X keyword/hashtag community" (item #26) nhưng:
- Resolver code dùng chung → cần xem xét regression cho **X source post/shared** nữa (đã có trong Phụ lục C nhưng không có item tương ứng trong Section 2.1).
- Phụ lục C liệt kê "X source post/shared resolver mapping" nhưng Section 2.1 Module 5 chỉ có 1 dòng regression.

→ **Nên tách regression thành 2-3 items cụ thể** thay vì gom vào 1 dòng #26.

---

### ⚠️ 5.4. Xung đột Sprint timeline

- Sprint hiện tại: **15/06 - 26/06** (kết thúc hôm nay 26/06).
- Due date task: **06/07** (sprint sau).
- Test Plan tạo ngày **26/06** nhưng test cases chưa viết.

→ Task sẽ phải carry over sang sprint sau. Cần xác nhận với PM về timeline này.

---

### ⚠️ 5.5. MR thay đổi giữa quá trình test

Jira comment của Dev ghi:
> MR #2475 *(Remove)* → MR #2598

→ MR đầu bị remove, thay bằng MR mới. **Cần confirm MR #2598 là final** và không có thêm MR/commit nào nữa trước khi bắt đầu test. Nếu có thêm code change trong quá trình test thì cần re-smoke.

---

### ⚠️ 5.6. Thiếu Rollback Plan

Nếu phát hiện bug Critical trên Staging hoặc Production, **không có rollback plan** được đề cập. Nên thêm:
- Rollback deployment step.
- Ai có quyền quyết định rollback?
- Data đã push bị ảnh hưởng xử lý thế nào?

---

## 6. Đề xuất phiên bản cải thiện

### 6.1. Cấu trúc đề xuất cho Test Plan v1.1

```
1. Mục tiêu & Tổng quan (✅ giữ nguyên)
2. Phạm vi kiểm thử (✅ giữ nguyên, bổ sung regression items)
3. Chiến lược kiểm thử (✅ giữ nguyên, bỏ section 3.4 UI/UX)
4. Môi trường kiểm thử (✅ giữ nguyên, bổ sung test data creation)
5. Tiêu chí đánh giá (✅ sửa Entry #8, thêm coverage metric vào Exit)
6. [MỚI] Timeline & Lịch trình
7. [MỚI] Vai trò & Trách nhiệm
8. [MỚI] Giả định & Phụ thuộc
9. Rủi ro & Hướng giải quyết (✅ giữ nguyên)
10. [MỚI] Phân loại mức độ Bug
11. Tài liệu bàn giao (✅ bổ sung deadline + owner)
12. [MỚI] Phê duyệt
Phụ lục A-D (✅ giữ nguyên)
```

---

### 6.2. Sửa Entry Criteria #8

**Hiện tại:**
> | 8 | BA/Dev đã confirm các điểm Need Confirm blocker trong phụ lục A | Khuyến khích, nhưng NC-1/NC-2/NC-4 là blocking |

**Đề xuất sửa:**
```markdown
| 8a | BA/Dev đã confirm NC-1, NC-2, NC-4, NC-7 (blocking items) | Bắt buộc |
| 8b | BA/Dev đã confirm NC-3, NC-5, NC-6, NC-8 (nice-to-have items) | Khuyến khích |
```

---

### 6.3. Bổ sung Exit Criteria coverage metric

**Thêm vào Exit Criteria:**
```markdown
| 10 | Test case execution rate ≥ 95% (P0 + P1) | Bắt buộc |
| 11 | Test case pass rate ≥ 98% cho P0 | Bắt buộc |
```

---

### 6.4. Sửa Deliverables thêm deadline cụ thể

| # | Tai lieu | Deadline | Owner |
|---|---|---|---|
| 1 | Test Plan v1.1 | 26/06 | QA (Lam) |
| 2 | Test Cases | 26/06 | QA (Lam) |
| 3 | Smoke Test Report | 27/06 | QA (Lam) |
| 4 | Test Execution Report (Local) | 30/06 | QA (Lam) |
| 5 | Test Execution Report (Testing) | 02/07 | QA (Lam) |
| 6 | Bug Reports | On-going | QA (Lam) |
| 7 | Test Summary Report + Sign-off | 06/07 | QA (Lam) |

---

### 6.5. Bổ sung Regression items chi tiết

**Hiện tại (1 dòng):**
> | 26 | Regression X keyword/hashtag community | Các fix đã có ở luồng hashtag/keyword không bị phá |

**Đề xuất tách (3 dòng):**
```markdown
| 26 | Regression: X keyword community mapping | Verify community name, is_admin_creator đã bỏ, fallback name |
| 27 | Regression: X hashtag community invalid queue | Verify invalid mention vẫn đi đúng invalid queue |
| 28 | Regression: X source post/shared detect country | Verify detect country payload vẫn đúng format |
```

→ Tổng hạng mục In-Scope: 26 → 28 items.

---

## Tổng kết Action Items

| # | Action | Priority | Owner | Deadline |
|---|---|:---:|---|---|
| 1 | Bổ sung section Timeline & Schedule | 🔴 Critical | QA | 26/06 |
| 2 | Bổ sung section Roles & Responsibilities | 🔴 Critical | QA | 26/06 |
| 3 | Bổ sung section Assumptions & Dependencies | 🔴 Critical | QA | 26/06 |
| 4 | Bổ sung section Approval/Sign-off | 🔴 Critical | QA | 26/06 |
| 5 | Sửa Entry Criteria #8 tách blocking vs nice-to-have | 🟡 High | QA | 26/06 |
| 6 | Confirm NC-7 (queue binding) ngay — hard blocker | 🟡 High | QA → DevOps | 26/06 |
| 7 | Thêm Bug Severity Classification | 🟡 High | QA | 26/06 |
| 8 | Bổ sung Exit Criteria coverage metric | 🟡 High | QA | 26/06 |
| 9 | Tách regression items chi tiết hơn | 🟢 Medium | QA | 26/06 |
| 10 | Sửa Deliverables thêm deadline + owner | 🟢 Medium | QA | 26/06 |
| 11 | Bỏ section 3.4 UI/UX (không áp dụng) | 🟢 Low | QA | 26/06 |
| 12 | Thống nhất convention tiếng Việt có dấu/không dấu | 🟢 Low | QA | 26/06 |
| 13 | Confirm MR #2598 là final code | 🟢 Medium | QA → Dev | 26/06 |
| 14 | Làm rõ YNMSHGYSG-1117 nằm ở đâu trong scope | 🟢 Medium | QA → BA | 26/06 |

---

*Review được thực hiện bởi Senior QA Lead (AI-assisted) dựa trên phân tích Test Plan, Jira ticket YNMSHGYSG-1169, dev comments, sprint context, và best practices trong test planning.*
