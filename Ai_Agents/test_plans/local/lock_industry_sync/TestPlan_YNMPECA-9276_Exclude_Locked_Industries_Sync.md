# TEST PLAN
## [ECI] Exclude Locked Industries during WS/MS Sync
### Feature: Lock Industry theo thời gian — Bảo vệ dữ liệu đã chốt khi Sync PI / Sync Industry

| Field | Value |
|---|---|
| **Mã tài liệu** | TP-YNMPECA-9276-v1.1 |
| **Dự án** | YouNet Media - EcomHeat (ECI) |
| **Ngày tạo** | 16/07/2026 |
| **Ngày cập nhật** | 16/07/2026 |
| **Người tạo** | QA Team (AI-assisted) |
| **Phiên bản** | 1.1 - Incorporated Review |
| **Trạng thái** | Draft - Pending Baseline Sign-off |
| **Jira chính** | https://jira.younetco.com/browse/YNMPECA-9276 |
| **Due date** | 24/07/2026 *(xem Section 8 — điều chỉnh timeline)* |
| **Tài liệu tham chiếu** | BA Spec v2.1: [02-F01-exclude-locked-industries-sync.md](file:///Users/tranthanhlam/product-ai-docs/EcomHeat/specs/02-lock-industry-sync/02-F01-exclude-locked-industries-sync.md) ; Dev Wiki v1: https://wiki.younetco.com/pages/viewpage.action?pageId=320701064 |
| **Sub-tasks** | YNMPECA-9293 (App - Update Report Sync API · **In Progress**), YNMPECA-9289 (Wiki/testcases · **In Progress**), YNMPECA-9290 (Testing · **Open**) |
| **Review Notes** | [Review_Notes_YNMPECA-9276_TestPlan_Improvements.md](file:///Users/tranthanhlam/YNM-testing/Ai_Agents/test_plans/local/lock_industry_sync/Review_Notes_YNMPECA-9276_TestPlan_Improvements.md) |

---

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1 Bối cảnh

EcomHeat lưu doanh số theo tuần trên **PIW** (Product Item Weekly) và theo tháng trên **PIM** (Product Item Monthly). Mỗi record PIW/PIM lưu sẵn `industry_id` của sản phẩm tại thời điểm tính.

Hiện tại, khi có thao tác sync (đồng bộ), hệ thống cập nhật lại **mọi record PIW/PIM** theo thông tin Product Item (PI) mới nhất — bao gồm cả industry đã verify xong và đang dùng để báo cáo cho khách. Hậu quả: **số liệu đã chốt bị thay đổi → sai báo cáo đã gửi khách**. Hiện chưa có cơ chế để ECI Team đánh dấu "industry này đừng đụng" — mỗi lần bảo vệ đều phải nhờ kỹ thuật can thiệp thủ công.

### 1.2 Giải pháp

Đánh dấu industry cần bảo vệ bằng **cờ `lock_sync`** trên bảng `industry` (MySQL). Khi một industry bị lock, hệ thống **khóa theo thời gian** (Rolling Time-Lock):

- **Period đã chốt** (tháng cũ đã verify) → **SKIP** — giữ nguyên record, **không phát sinh write** (không update bất kỳ field nào bao gồm `updated_at`, metadata).
- **Period đang mở** (tháng hiện hành đang verify) → **SYNC** bình thường.

**Quy tắc two-sided lock (BR-06):** Cổng lock xét lock theo **cả 2 phía**: (1) `industry_id` **lưu trên record** PIW/PIM (chống đổi/rời số khỏi industry lock — outflow) VÀ (2) `industry_id` **hiện tại của PI đang sync** (chống ghi thêm số vào industry lock — inflow). Chỉ cần **một trong hai phía** lock + period đã chốt → **SKIP**.

> **[Blocking — Need Confirm B1]:** Cần Dev xác nhận technical design bảo đảm lock xét cả `record.industry_id` và industry hiện tại của PI. Cụ thể: `lookupFilters industry_id` đang lọc theo phía nào? Design bảo vệ mismatch (record industry locked, current PI unlocked — và ngược lại) bằng cách nào?

Ranh giới "đã chốt / đang mở" trượt theo lịch tại **mốc ngày 17 hàng tháng** (giờ VN — UTC+7):
- Từ **0h00 ngày 17**: tháng liền trước chuyển sang "đã chốt".
- Trước ngày 17: tháng liền trước vẫn "đang mở".

### 1.3 Hai luồng sync cần bảo vệ

| Luồng | Mô tả | Chiều | Mốc chốt snapshot |
|---|---|---|---|
| **Luồng 1 — Sync PI** (trên tool) | User chọn 1 hoặc nhiều PI + khoảng thời gian, chạy sync cập nhật PIW/PIM. Có 2 Sync Mode: `Sync All Fields` (áp lock) và `Sync Only Labels` (KHÔNG áp lock). | 1 chiều: PI → PIW/PIM | Lúc **tạo request** |
| **Luồng 2 — Sync industry** (chạy nền) | Data Team classify PI vào industry rồi sync ngược quá khứ. Áp lock ở cả 2 chiều. | 2 chiều: PI ↔ PIW/PIM | Lúc **sync chạy** |

### 1.4 Cơ chế kỹ thuật (theo Dev Wiki)

Khi tạo sync request ở mode `Sync All Fields`:
1. App Team xác định mốc thời gian gửi request → chia `timerange` sync thành **2 messages** riêng biệt cho locked industries và unlocked industries.
2. Mỗi message kèm theo một **hash** được lưu trên Redis (format: `eca:report-sync:<sync_request_id>:<hash_id>`).
3. Message cho locked industries sử dụng `lookupFilters` dạng `industry_id:(1 2 3)` với time range bị giới hạn theo rolling boundary.
4. Message cho unlocked industries sử dụng `lookupFilters` dạng `-industry_id:(1 2 3)` với full time range.
5. Data Team xử lý sync dựa trên filters và điều kiện đi kèm.
6. Sau khi sync xong, Data Team gọi API (PUT `report-synchronizations`) để cập nhật status và xóa hash trên Redis.
7. Request chuyển status **"Synced"** khi không còn hash nào trên Redis.

> **[Blocking — Need Confirm B4]:** Cần Dev xác nhận: (a) message format số lượng khi 0/1/2 bucket; (b) inclusive/exclusive của time range; (c) Redis key TTL và lifecycle khi sync fail; (d) PUT API request/response/error contract; (e) Status request khi partial success/failure.

### 1.5 Mục tiêu kiểm thử

- Đảm bảo **cổng lock hoạt động đúng two-sided**: 100% record thuộc locked industry (xét cả record side và PI side) ở period đã chốt KHÔNG bị update sau sync — **không phát sinh write** ở record level.
- Đảm bảo **rolling time-lock** chính xác: ranh giới ngày 17, timezone UTC+7, tuần PIW lài 2 tháng quy đúng, calendar edge cases (cross-year, leap year).
- Đảm bảo **Sync Mode** phân biệt đúng: `Sync All Fields` áp lock, `Sync Only Labels` không áp lock.
- Đảm bảo **dynamic list**: thêm/bỏ industry khỏi danh sách lock chỉ cần update `lock_sync`, áp dụng từ lần sync kế tiếp.
- Đảm bảo **snapshot consistency**: trạng thái lock và boundary chốt tại mốc khởi tạo, không đổi khi sync đang chạy — kể cả qua queue delay, lock change, boundary change.
- Đảm bảo **cơ chế kỹ thuật**: message chia đúng 2 tập (locked/unlocked), hash trên Redis quản lý đúng lifecycle (bao gồm failure scenarios), API cập nhật status đúng.
- Đảm bảo **data integrity ở record level**: không chỉ aggregate GMV/Sold mà so sánh checksum/từng record trước–sau.
- Đảm bảo **không regression** trên luồng sync hiện tại cho industry không lock.

---

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1 In-Scope

#### Module 1: Cổng Lock thống nhất (Core Logic)

| STT | Hạng mục | BR / EC tham chiếu | Mô tả |
|---|---|---|---|
| 1 | Cờ `lock_sync` trên bảng `industry` | BR-01, BR-02, BR-03, BR-04, BR-05 | Xác minh trạng thái boolean (TRUE/FALSE), mặc định FALSE, cập nhật độc lập từng industry, áp dụng ngay lần sync kế tiếp |
| 2 | Quy tắc SKIP/SYNC (cổng lock) — **two-sided** | BR-06, BR-07, BR-08 | Xét lock theo **cả 2 phía**: industry trên record PIW/PIM + industry hiện tại của PI; non-bypassable. **SKIP = không phát sinh write** |
| 3 | Quy tắc NULL — tách chi tiết theo từng phía | BR-07, EC-02 | Xem Decision Table (Phụ lục B) — NULL cần xét từng phía record/PI riêng biệt. **[Blocking — B2]** |
| 4 | Snapshot consistency | BR-09, BR-10, BR-11, EC-05, EC-09 | Snapshot chốt tại mốc khởi tạo; thay đổi sau mốc chốt chỉ áp lần kế tiếp |
| 5 | Override adhoc | BR-12, EC-11 | Flip `lock_sync = FALSE` → sync được → set lại `TRUE` |

#### Module 2: Rolling Time-Lock (Ranh giới thời gian)

| STT | Hạng mục | BR / EC tham chiếu | Mô tả |
|---|---|---|---|
| 6 | Mốc khóa ngày 17 | BR-13, BR-14, BR-15, EC-10 | Ngày ≥ 17 → tháng liền trước đã chốt; Ngày < 17 → tháng liền trước vẫn mở; timezone UTC+7 |
| 7 | Quy shard PIW về tháng | BR-16, EC-08 | PIW lài 2 tháng → quy về tháng theo đa số ngày (≥ 4/7); PIM dùng trực tiếp shard YYYYMM |
| 8 | Tháng hiện tại luôn mở | BR-13 | Bất kể ngày nào, tháng hiện tại luôn cho sync |
| 9 | Calendar edge cases | BR-13, BR-16 | 16 23:59:59 vs 17 00:00:00 giờ VN; tháng 12 → tháng 1 (cross-year); ISO week 52/53; PIW/PIM boundary inclusive |

#### Module 3: Luồng 1 — Sync PI (trên tool)

| STT | Hạng mục | BR / EC tham chiếu | Mô tả |
|---|---|---|---|
| 10 | Sync All Fields áp cổng lock | BR-17, BR-06 | Record locked industry ở period đã chốt bị SKIP; period đang mở vẫn SYNC |
| 11 | Sync Only Labels không áp cổng lock | BR-18, EC-04 | Chỉ update field `labels`, không đổi mapping fields; cổng lock không khóa |
| 12 | UI note trên màn Create Sync Request | S5.2, S5.3 | Text `(Apply Restricted Industries)` in nghiêng, màu đỏ, dưới radio `Sync All Fields` |
| 13 | Message chia 2 tập locked/unlocked | Dev Wiki | Verify message format, `lookupFilters`, time range bị giới hạn cho locked |
| 14 | Hash trên Redis + lifecycle | Dev Wiki | Hash lưu đúng format, xóa khi sync xong, status = "Synced" khi hết hash |

#### Module 4: Luồng 2 — Sync Industry (chạy nền)

| STT | Hạng mục | BR / EC tham chiếu | Mô tả |
|---|---|---|---|
| 15 | Chiều PI → PIW/PIM áp cổng lock | BR-06, BR-19 | Record thuộc locked industry + period đã chốt bị SKIP |
| 16 | Chiều PIW/PIM (lookup PI) áp cổng lock | BR-06, BR-19, EC-12 | Lookup PI để kiểm tra industry lock; PI không bị chỉnh sửa |
| 17 | Chiều 2 tự kích hoạt sau chiều 1 | BR-19 | Hoàn tất tự động; PI không bị thay đổi |

#### Module 5: Edge Cases & Concurrency

| STT | Hạng mục | EC tham chiếu | Mô tả |
|---|---|---|---|
| 18 | Industry lock nhưng ngoài phạm vi sync | EC-03 | Không phát sinh thao tác, không gây side-effect |
| 19 | Record `industry_id = NULL` — chi tiết | EC-02, BR-07 | Tách theo phía NULL: xem Decision Table (Phụ lục B) |
| 20 | Industry trong scope nhưng không có record | EC-07 | No-op, không báo lỗi; Sync PI → Status = "Synced" |
| 21 | Lỗi/gián đoạn sync → retry | EC-06 | Cổng lock áp nhất quán; idempotent; retry dùng lại snapshot ban đầu |
| 22 | PI bị đổi phân loại (mismatch industry) | EC-12 | Lock xét cả industry trên record lẫn industry của PI — test cả 2 chiều mismatch |
| 23 | Hai luồng ghi song song cùng record | EC-13 | Record đã chốt SKIP ở cả 2 luồng; record mở = last-write-wins |
| 24 | Đồng hồ qua mốc 17 sau khi chốt snapshot | EC-09 | Giữ boundary theo snapshot; mốc mới áp lần sau |
| 25 | Snapshot scenarios mở rộng | BR-09, EC-05 | Đổi lock sau tạo request nhưng trước consumer chạy; đổi lock giữa 2 messages; request nằm trong queue qua ngày 17; 2 chiều Sync industry dùng cùng hay riêng snapshot |

#### Module 6: Queue / Redis / API Failure Lifecycle *(Bổ sung theo review)*

| STT | Hạng mục | Tham chiếu | Mô tả |
|---|---|---|---|
| 26 | Queue/message partition scenarios | Dev Wiki, BR-06 | 0 locked industry (1 message); tất cả locked (1 message); hỗn hợp (2 messages); time range hoàn toàn closed/open/cắt qua boundary |
| 27 | Callback lifecycle | Dev Wiki | 1 message hoàn tất, message còn lại fail/timeout; callback không đúng thứ tự; duplicate callback; callback với unknown/expired hash |
| 28 | Redis failure scenarios | Dev Wiki | Redis unavailable; key expired/bị xóa ngoài; hash còn nhưng sync đã xong; TTL behavior |
| 29 | API negative testing | Dev Wiki | API timeout; 4xx/5xx response; request body sai format; hash không tồn tại |
| 30 | Status transition | Dev Wiki | Request không chuyển "Synced" khi còn pending hash; partial success/failure behavior; retry không làm sai trạng thái |

#### Module 7: Schema / Migration *(Bổ sung theo review)*

| STT | Hạng mục | Tham chiếu | Mô tả |
|---|---|---|---|
| 31 | Field `lock_sync` schema | BR-01, BR-02 | Đúng type (boolean), nullability (NOT NULL), default (FALSE) |
| 32 | Industry mới mặc định FALSE | BR-02 | Insert industry mới → verify `lock_sync = FALSE` |
| 33 | Existing industries backfill | BR-02 | Tất cả industry hiện tại đã có `lock_sync = FALSE` sau migration; không có NULL/invalid |
| 34 | Rollback strategy | — | Xác nhận migration rollback plan nếu có |

### 2.2 Out-of-Scope

| Hạng mục | Lý do |
|---|---|
| **Giao diện quản lý lock cho end-user** | Ngoài scope 02-F01; hiện xử lý qua update trực tiếp `lock_sync` trên MySQL |
| **Cơ chế unlock/mở-tạm có giao diện riêng** | Hiện xử lý adhoc bằng flip `lock_sync` (EC-11), không có UI riêng |
| **Mốc khóa khác nhau theo từng industry** | Áp chung 1 mốc (ngày 17) cho mọi industry; đổi mốc cần sửa code |
| **Job aggregation gốc (tính WS/MS tuần/tháng)** | Job chỉ tính period hiện tại, không tính lại quá khứ; không nằm trong phạm vi sync |
| **Performance/Load test quy mô lớn** | NFR chỉ yêu cầu sync industry non-locked không chậm quá 10%; chưa có SLA throughput cụ thể cho test lớn |
| **Full regression toàn bộ EcomHeat** | Chỉ regression targeted trên luồng sync PI và sync industry hiện có |

---

## 3. CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)

### 3.1 Functional Testing — Trọng tâm chính

| Nhóm test | Kỹ thuật áp dụng | Mô tả |
|---|---|---|
| **Cổng Lock Core Logic (two-sided)** | Decision Table Testing | Xây bảng quyết định: lock status (record side) × lock status (PI side) × period status (open/closed) × NULL per-side → SKIP/SYNC. Xem Phụ lục B |
| **Rolling Time-Lock Boundary** | Boundary Value Analysis | Test các mốc: 16 23:59:59 vs 17 00:00:00 (giờ VN); tuần PIW lài 2 tháng (4-3 vs 3-4 ngày); tháng 12→1 cross-year; ISO week 52/53 |
| **Sync Mode Differentiation** | Equivalence Partitioning | `Sync All Fields` vs `Sync Only Labels`: verify cổng lock chỉ áp cho mode All Fields |
| **Dynamic Lock List** | State Transition Testing | Lock → Unlock → Lock lại; mặc định FALSE cho industry mới; thay đổi sau mốc chốt |
| **Snapshot Consistency** | Concurrency Testing | Đổi lock sau tạo request nhưng trước consumer chạy; đổi lock giữa 2 messages; request nằm trong queue qua ngày 17; retry dùng lại snapshot |
| **Two-way Sync (Sync Industry)** | Integration Testing | Chiều 1 (PI→PIW/PIM) + Chiều 2 (PIW/PIM lookup PI) áp lock đúng; PI không bị sửa; mismatch inflow/outflow |
| **Queue/Redis/API Lifecycle** | State Transition + Negative Testing | Message partition (0/1/2 buckets); callback lifecycle; Redis failure; API negative; status transition |
| **Record-level Data Integrity** | Checksum / Field-by-field Comparison | Không chỉ aggregate GMV/Sold — so sánh từng record hoặc checksum toàn document trước–sau. Xác nhận `updated_at`, version, metadata không đổi khi SKIP |
| **Edge Cases** | Error Guessing + Exploratory | NULL per-side, mismatch industry, no record, retry, concurrent writes, calendar edge |

#### Mapping User Story → Test Scenarios (với priority điều chỉnh theo review M1)

| User Story / Area | Số AC | Estimated Test Cases | Priority |
|---|---:|---:|---|
| US-01 · Sync industry: lock data đã chốt | 7 AC | 12-16 cases | **P0** |
| US-03 · Cổng lock 2 chiều (Sync industry) — mismatch/inflow/outflow | 3 AC | 6-8 cases | **P0** |
| US-05 · Rolling Time-Lock (boundary ngày 17, cross-year, PIW lài) | 9 AC | 18-24 cases | **P0** |
| Snapshot consistency (queue delay, lock change, retry) | — | 6-8 cases | **P0** |
| Two-sided lock guard (Decision Table #1–#9) | — | 9-12 cases | **P0** |
| US-04 · Sync Mode (Sync PI) — `Sync All Fields` vs `Sync Only Labels` | 3 AC | 6-8 cases | **P1** |
| US-02 · Dynamic lock list | 6 AC | 8-10 cases | **P1** |
| Queue/Redis/API failure lifecycle | — | 10-14 cases | **P1** |
| Non-locked regression | — | 4-6 cases | **P1** |
| Schema/migration validation | — | 4-5 cases | **P1** |
| UI note position/format/browser | — | 3-4 cases | **P2** |
| **Tổng ước tính** | | **86-115 cases** | |

### 3.2 UI/UX Testing

| Hạng mục | Mô tả | Priority |
|---|---|---|
| Note `(Apply Restricted Industries)` | Hiển thị dưới radio `Sync All Fields`; in nghiêng, màu đỏ; KHÔNG hiển thị dưới `Sync Only Labels` | P2 |
| Interaction khi chọn Sync Mode | Note tĩnh, không có animation đặc thù | P2 |
| Status "Synced" sau sync hoàn tất | Cột Status hiển thị đúng trên màn Create Sync Request | P1 |

### 3.3 API/Integration Testing

| Điểm tích hợp | Phương pháp | Công cụ/Cách thức |
|---|---|---|
| **Queue `app.eci.trigger.report_synchronization`** | Contract Testing | Verify message count (0/1/2 buckets), format, `lookupFilters`, time range inclusive/exclusive |
| **Redis hash lifecycle** | State Transition Testing | Verify tạo → tồn tại → xóa; TTL; key expired; Redis unavailable; duplicate callback |
| **API PUT `report-synchronizations`** | API Testing + Negative | Verify success, partial failure, 4xx/5xx, unknown hash, duplicate call, timeout |
| **MySQL bảng `industry`** | Data Verification | Verify field `lock_sync` type/nullability/default, backfill existing, insert mới |
| **SOLR PIW/PIM records** | Data Integrity (record-level) | Verify record locked industry + period đã chốt KHÔNG thay đổi bất kỳ field nào (checksum/field-by-field) |

### 3.4 Data Sync / Data Integrity

| Hạng mục | Mô tả |
|---|---|
| **Record-level integrity (SKIP)** | So sánh **từng record hoặc checksum toàn document** trước–sau sync. Xác nhận `industry_id`, `model_id`, `brand_id`, `product_line_id`, GMV, Sold, `updated_at`, version, metadata **đều không đổi** |
| **Aggregate GMV/Sold** | Đối chiếu tổng GMV/Sold của locked industry ở period đã chốt trước–sau sync (kỳ vọng chênh lệch = 0) — nhưng **không dùng aggregate làm tiêu chí duy nhất** vì có thể bù trừ |
| **Period đang mở vẫn update** | Verify record ở tháng hiện tại / tháng mở vẫn được sync đúng expected fields |
| **Labels vẫn update ở mode Only Labels** | Verify field `labels` vẫn cập nhật cho industry lock khi chạy `Sync Only Labels` |
| **Shard PIW quy tháng đúng** | Tuần lài 2 tháng → quy về tháng theo đa số ngày (≥ 4/7) rồi so boundary |

### 3.5 Non-functional Testing

| NFR | Tiêu chí đánh giá | Cách kiểm tra |
|---|---|---|
| **Performance (Tính độc lập)** | Cổng lock không làm chậm sync industry non-locked quá 10% (ceiling), kỳ vọng ≤ 5% | Benchmark cùng tập non-locked, cùng period & data volume, trước/sau khi bật lock; chạy ≥ 3 lần lấy trung bình |
| **Tính nhất quán** | Cùng **lock snapshot, rolling boundary, input và source data** → cùng tập SKIP/SYNC ở mọi lần chạy | Đối chiếu tập record bị skip giữa các lần chạy với cùng preconditions |
| **Khả năng kiểm tra (Audit)** | Log skip theo `industry_id` + lý do; báo cáo đối chiếu GMV/Sold và record-level diff | Verify log output, location, format và khả năng trace |
| **Tính linh hoạt** | Thêm/bỏ industry khỏi lock chỉ update `lock_sync`, không cần deploy | Review thao tác update + xác nhận không deploy |

### 3.6 Chiến lược test thời gian *(Bổ sung theo review B6)*

| Phương pháp | Mô tả | Ưu tiên |
|---|---|---|
| **Injectable clock / test hook** | Dùng injectable clock hoặc test hook để set system time cho App và Data worker, tránh phụ thuộc chờ 0h00 ngày 17 ngoài đời thực | **Ưu tiên cao** — cần Dev support |
| **Mock time** | Nếu không có injectable clock, mock time bằng cách set timezone và clock trên container/service Testing | Fallback |
| **Timezone verification** | Xác nhận timezone config của: App server, Data worker, MySQL, SOLR, Redis, log output, queue timestamp — phải nhất quán UTC+7 | Bắt buộc |

> **[Blocking — Need Confirm B6]:** Dev cần cung cấp injectable clock/test hook hoặc phương pháp mock time cho QA. QA không thể chờ 0h00 ngày 17 ngoài đời thực để test boundary.

---

## 4. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

### 4.1 Môi trường

| Môi trường | Mục đích | Giai đoạn sử dụng |
|---|---|---|
| **Testing** | Test chức năng chính: cổng lock, rolling boundary, Sync Mode, message format, failure lifecycle | Phase test chính |
| **Staging** | Regression + sign-off trước release; verify với data gần production | Sau khi pass Testing |
| **Production** | Monitor sau release, không test trực tiếp | Post-release monitoring |

### 4.2 Nền tảng/Thiết bị

| Thành phần | Chi tiết |
|---|---|
| **Web (UI Create Sync Request)** | Chrome latest *(browser matrix chính thức — NC-5 Nice-to-have)* |
| **Backend/API** | Node.js / Service stack ECI — cần ghi rõ build/version khi deploy |
| **Database** | MySQL (bảng `industry`), SOLR (PIW/PIM), Redis (hash sync request) |
| **Message Queue** | Queue `app.eci.trigger.report_synchronization` |

### 4.3 Dữ liệu cần chuẩn bị (Test Data Catalogue)

| # | Nhóm data | Mục đích | Expected decision | Owner | Cleanup/Reset |
|---|---|---|---|---|---|
| TD-1 | Industry `lock_sync = TRUE` + record closed period | Core lock SKIP | SKIP | QA + Dev | Reset `lock_sync` + verify record unchanged |
| TD-2 | Industry `lock_sync = TRUE` + record open period | Core lock SYNC khi open | SYNC | QA + Dev | N/A |
| TD-3 | Industry `lock_sync = FALSE` + record closed period | Non-locked regression | SYNC | QA | N/A |
| TD-4 | Industry mới (vừa thêm) | Default `lock_sync = FALSE` | SYNC | QA | Delete test industry |
| TD-5 | Record `industry_id = NULL` trên record, PI industry locked | B2 — cần confirm expected | **[B2 — Need Confirm]** | QA + Dev | N/A |
| TD-6 | Record industry locked, current PI industry unlocked (mismatch) | SKIP (outflow guard) | SKIP | QA + Dev | Separate test PI |
| TD-7 | Record industry unlocked, current PI industry locked (mismatch) | SKIP (inflow guard) | SKIP | QA + Dev | Separate test PI |
| TD-8 | PIW tuần lài 2 tháng: 4 ngày tháng cũ + 3 ngày tháng mới | Quy về tháng cũ (closed) | SKIP if locked | QA + Dev | N/A |
| TD-9 | PIW tuần lài 2 tháng: 3 ngày tháng cũ + 4 ngày tháng mới | Quy về tháng mới (open) | SYNC | QA + Dev | N/A |
| TD-10 | PI không có record PIW/PIM trong period | No-op, no error | No-op | QA | N/A |
| TD-11 | Data cho concurrency/retry | Cô lập khỏi data test khác | Per test | QA + Dev | Isolated dataset |
| TD-12 | Cross-year data: shard tháng 12 → tháng 1 | Calendar edge | Per boundary | QA + Dev | N/A |

---

## 5. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 5.1 Entry Criteria — Điều kiện để QA bắt đầu test

| # | Tiêu chí | Mức độ | Evidence bắt buộc |
|---|---|---|---|
| 1 | BA Spec v2.1 và Dev technical contract đã baseline | Mandatory | Link spec version + Dev Wiki version |
| 2 | App API (YNMPECA-9293), Data worker, UI và DB migration đã deploy lên Testing | Mandatory | Build/commit hash + deployment record |
| 3 | Unit/contract test cho BR-06 (two-sided lock), rolling boundary và callback API đã pass | Mandatory | CI result link |
| 4 | Message/hash/API contract và partial-failure behavior đã được Dev xác nhận | Mandatory | Dev Wiki version hoặc NC resolution |
| 5 | QA trigger được Sync PI (trên tool) và cả hai chiều Sync industry | Mandatory | Smoke evidence (script/tool + log) |
| 6 | QA truy cập được MySQL, SOLR, Redis, queue và logs trên Testing | Mandatory | Access smoke evidence |
| 7 | Controlled clock/test hook hoạt động đúng timezone UTC+7 | Mandatory | Time-boundary smoke result |
| 8 | Test dataset (TD-1 → TD-12) đã chuẩn bị, có reset procedure | Mandatory | Data catalogue link |
| 9 | Không còn blocking NC về two-sided lock (B1), NULL rule (B2), technical contract (B4), Sync industry access (B5), time mock (B6) | Mandatory | NC status = Closed |
| 10 | Testing environment smoke test pass (tạo sync request → verify message + hash + callback) | Mandatory | Smoke report |

### 5.2 Exit Criteria — Điều kiện để QA cho phép release

| # | Tiêu chí | Mức độ |
|---|---|---|
| 1 | 100% P0 đã executed và Passed; không có P0 Blocked/Skipped chưa được waiver | Mandatory |
| 2 | Không còn bug Critical/High trong toàn bộ feature scope | Mandatory |
| 3 | Mọi Medium/Low còn mở có **documented risk acceptance** từ Release Owner/BA/Dev Lead | Mandatory |
| 4 | Locked records ở closed period **không thay đổi ở record level** (field-by-field hoặc checksum) VÀ aggregate GMV/Sold | Mandatory |
| 5 | Open-period và unlocked records được update đúng expected fields | Mandatory |
| 6 | Sync PI pass cho cả `Sync All Fields` và `Sync Only Labels` | Mandatory |
| 7 | Cả **hai chiều** Sync industry pass, bao gồm mismatch/inflow/outflow | Mandatory |
| 8 | Rolling boundary, timezone UTC+7, PIW/PIM shard và cross-year cases pass | Mandatory |
| 9 | Snapshot giữ nguyên qua queue delay, lock change, boundary change và retry | Mandatory |
| 10 | Message/hash/API lifecycle pass cho success, partial failure, duplicate và out-of-order callback | Mandatory |
| 11 | Request **không** chuyển "Synced" khi còn pending hash/message | Mandatory |
| 12 | Performance regression ≤ 10%; audit log/traceability đạt requirement hoặc có approved waiver | Mandatory |
| 13 | Targeted regression trên non-locked industries pass | Mandatory |
| 14 | **Test Summary Report**, evidence và release recommendation đã phát hành | Mandatory |

---

## 6. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

### 6.1 Rủi ro kỹ thuật

| # | Rủi ro | Mức độ | Xác suất | Hướng giải quyết |
|---|---|---|---|---|
| R1 | **Rolling boundary tính sai ở mốc chuyển giao ngày 17** — đặc biệt edge case 0h00 ngày 17, timezone server ≠ UTC+7 | Cao | Trung bình | Test boundary: 16 23:59:59, 17 00:00:00, 17 00:00:01 (giờ VN). Verify timezone config trên server. Dùng injectable clock |
| R2 | **Tuần PIW lài 2 tháng quy tháng sai** — logic đa số ngày (≥ 4/7) có thể implement sai | Cao | Trung bình | Test data PIW lài: 4-3 vs 3-4. Verify shard → tháng trên SOLR |
| R3 | **Cổng lock chỉ xét 1 phía (record hoặc PI) thay vì cả 2 phía** — lọt inflow/outflow vào closed period | **Critical** | Trung bình | Contract review + mismatch integration tests cho cả 2 chiều (TD-6, TD-7). Verify `lookupFilters` xét đúng 2 phía |
| R4 | **Message queue chia sai 2 tập locked/unlocked** — `lookupFilters` hoặc time range bị lệch | Cao | Trung bình | Verify trực tiếp message: `lookupFilters`, time range, inclusive/exclusive |
| R5 | **Hash trên Redis không được xóa sau sync** — status request không chuyển "Synced" | Trung bình | Thấp | Verify Redis key lifecycle: tạo → tồn tại → xóa. Test failure scenarios |
| R11 | **Message partition chỉ xét một phía industry, làm lọt inflow/outflow vào closed period** | **Critical** | Trung bình | Contract review + mismatch integration tests cho cả hai chiều |
| R12 | **Request chuyển "Synced" sớm** khi một hash bị xóa nhưng message khác chưa hoàn tất | Cao | Trung bình | State-transition tests, partial/out-of-order callback tests |
| R13 | **Aggregate GMV/Sold không đổi nhưng record thành phần đã bị thay đổi bù trừ** | Cao | Trung bình | Record-level diff/checksum trước–sau — không dùng aggregate làm tiêu chí duy nhất |
| R14 | **Redis key hết TTL hoặc mất key** khiến request có trạng thái sai | Cao | Thấp | Confirm TTL/recovery strategy; test missing/expired hash |
| R15 | **Không kiểm soát được system time** làm boundary tests không lặp lại được | Cao | Cao | Injectable clock/test hook; xác nhận Dev support trước execution |
| R16 | **PIW shard tuần 52/53 hoặc cross-year** được map sai tháng | Cao | Trung bình | Dataset Dec→Jan, ISO week 52/53 |
| R17 | **Existing industries không được backfill `lock_sync = FALSE`** sau migration | Cao | Thấp | Schema/migration validation (Module 7) |

### 6.2 Rủi ro quy trình

| # | Rủi ro | Mức độ | Xác suất | Hướng giải quyết |
|---|---|---|---|---|
| R6 | **Sub-task Dev (YNMPECA-9293) chưa hoàn tất đúng timeline** — hiện đang In Progress | Cao | Trung bình | Theo dõi hằng ngày. QA chuẩn bị test cases trước. Escalate nếu block > 1 ngày |
| R7 | **Dev Wiki chưa hoàn thiện** — page mới tạo 16/07, version 1 | Trung bình | Cao | QA dùng BA spec làm nguồn chính. Nhưng **technical contract dùng để test phải được baseline** |
| R8 | **Test data thiếu — đặc biệt PIW tuần lài 2 tháng, industry mismatch** | Trung bình | Trung bình | Chuẩn bị trước với data catalogue (TD-1→TD-12). Xin Dev support |
| R18 | **QA không trigger/observe được chiều 2 của Sync industry** | Cao | Trung bình | Xác nhận tool/access/owner trong Entry Criteria. Chuyển NC-6 thành blocking |

### 6.3 Rủi ro nghiệp vụ

| # | Rủi ro | Mức độ | Xác suất | Hướng giải quyết |
|---|---|---|---|---|
| R9 | **Người vận hành quên set lock trước khi chạy sync** | Trung bình | Trung bình | Document quy trình vận hành rõ ràng; xem xét guard tự động ở phase sau |
| R10 | **Override adhoc quên set lại TRUE** — industry mất bảo vệ vĩnh viễn | Trung bình | Trung bình | Verify quy trình override: lock → unlock → sync → lock lại. Đề xuất checklist vận hành |

---

## 7. TÀI LIỆU BÀN GIAO (Deliverables)

| # | Tài liệu | Mô tả | Deadline | Owner | Người nhận | Link |
|---|---|---|---|---|---|---|
| 1 | **Test Plan v1.1** | Kế hoạch kiểm thử tổng thể | 16/07/2026 | QA - Lam Tran Thanh | PM, Dev Lead, BA | *(file này)* |
| 2 | **Test Cases + RTM** | Chi tiết 86-115 test cases + Requirements Traceability Matrix (BR/AC/EC/NFR → TC ID → Priority → Level → Evidence) | 16/07/2026 | QA - Lam Tran Thanh | PM, BA, Dev | *(TBD)* |
| 3 | **Test Data Catalogue** | Dataset preparation scripts/checklist, reset procedure, expected results | 17/07/2026 | QA - Lam Tran Thanh | Dev, QA | *(TBD)* |
| 4 | **Bug Reports** | Jira bug kèm: input data, actual result, expected result, evidence | Ongoing | QA - Lam Tran Thanh | Dev Team | Jira |
| 5 | **Data Integrity Evidence** | Record-level diff/checksum + aggregate GMV/Sold đối chiếu trước–sau sync | Ongoing | QA - Lam Tran Thanh | Dev, QA | *(evidence folder TBD)* |
| 6 | **Smoke Test Report** | Kết quả smoke env, trigger Sync PI + Sync industry, access verification | 17/07/2026 | QA - Lam Tran Thanh | PM, Dev | *(TBD)* |
| 7 | **Test Execution Report - Testing** | Trạng thái pass/fail/blocked từng test case trên Testing env | *(xem Section 8)* | QA - Lam Tran Thanh | PM | *(TBD)* |
| 8 | **Test Execution Report - Staging** | Kết quả regression + final retest trên Staging | *(xem Section 8)* | QA - Lam Tran Thanh | PM, Dev Lead, BA | *(TBD)* |
| 9 | **Test Summary Report + Sign-off** | Tổng kết coverage, bugs, residual risk, release recommendation | *(xem Section 8)* | QA - Lam Tran Thanh | PM, Dev Lead, Stakeholders | *(TBD)* |

---

## 8. TIMELINE & ƯỚC LƯỢNG KIỂM THỬ (Timeline & Estimation)

### 8.1 Phân tích timeline hiện tại

- Khoảng 16–24/07/2026 có **7 ngày làm việc** (trừ weekends 19-20/07).
- Tổng effort ước tính **8.5–12.0 man-days** (tăng so với v1.0 do bổ sung Module 6, 7 và test cases).
- Sub-task YNMPECA-9293 đang **In Progress** — ngày deploy lên Testing chưa confirm.

### 8.2 Phương án A — Giữ deadline 24/07 *(cần bổ sung resource)*

| Phase | Bắt đầu | Kết thúc | Nội dung | Output | Owner |
|---|---|---|---|---|---|
| Test Plan + Test Cases + Data Prep | 16/07/2026 | 16/07/2026 | Hoàn thiện test plan v1.1, test cases, RTM, data catalogue | Test plan, TCs, RTM, data catalogue | QA chính |
| Smoke + Env Readiness | 17/07/2026 | 17/07/2026 | Smoke trigger Sync PI + Sync industry, access, time mock | Smoke report, blocker list | QA chính + Dev |
| Testing Execution — P0 | 17/07/2026 | 21/07/2026 | Core lock, two-sided guard, boundary, snapshot, two-way sync | P0 execution report, bugs | QA chính |
| Testing Execution — P1 | 17/07/2026 | 21/07/2026 | Queue/Redis/API lifecycle, Sync Mode, dynamic list, regression | P1 execution report, bugs | QA hỗ trợ |
| Bug Fix + Retest | 22/07/2026 | 22/07/2026 | Dev fix bug, QA retest | Bug fix verification | Dev + QA |
| Staging Regression + Sign-off | 23/07/2026 | 24/07/2026 | Regression trên Staging, final retest, sign-off | Staging report + Test Summary | QA + PM/BA |

> **Lưu ý:** Phương án A cần **ít nhất 1 QA hỗ trợ** phụ trách queue/Redis/API testing, retry/concurrency và evidence. QA chính tập trung core functional, boundary và sign-off.

### 8.3 Phương án B — Giữ 1 QA *(dời deadline)*

| Phase | Bắt đầu | Kết thúc | Nội dung | Output | Owner |
|---|---|---|---|---|---|
| Test Plan + Test Cases + Data Prep | 16/07/2026 | 16/07/2026 | Như trên | Như trên | QA |
| Smoke + Env Readiness | 17/07/2026 | 17/07/2026 | Như trên | Như trên | QA + Dev |
| Testing Execution — P0 | 17/07/2026 | 23/07/2026 | Core lock, boundary, snapshot, two-way sync, queue/Redis/API | Execution report, bugs | QA |
| Testing Execution — P1 | 24/07/2026 | 25/07/2026 | Sync Mode, dynamic list, regression, schema | Execution report, bugs | QA |
| Bug Fix + Retest | 25/07/2026 | 28/07/2026 | Dev fix bug, QA retest (bao gồm buffer 0.5–1 ngày redeploy/retest) | Bug fix verification | Dev + QA |
| Staging Regression + Sign-off | 28/07/2026 | 29/07/2026 | Regression trên Staging, final retest, sign-off | Staging report + Test Summary | QA + PM/BA |

> **Lưu ý:** Phương án B dời sign-off dự kiến tới **28–29/07**. Chỉ cam kết ngày release sau khi Entry Criteria mandatory đã đạt.

### 8.4 Effort Estimation (điều chỉnh)

| Hoạt động | Effort ước tính | Ghi chú |
|---|---:|---|
| Hoàn thiện test plan + test cases + RTM | 1.0-1.5 man-days | Bao gồm update sau review, RTM, data catalogue |
| Chuẩn bị test data + env readiness + smoke | 1.0-1.5 man-days | Bao gồm time mock setup, trigger Sync industry verification |
| Testing execution — P0 (core lock, boundary, snapshot, two-way) | 3.0-4.0 man-days | Logic phức tạp, nhiều permutation |
| Testing execution — P1 (queue/Redis/API, Sync Mode, regression, schema) | 2.0-3.0 man-days | Failure lifecycle, negative testing |
| Bug fix + retest buffer | 1.0-1.5 man-days | Buffer cho bug fix/re-deploy/redeploy retest |
| Staging regression + sign-off | 1.0-1.5 man-days | Targeted regression + final verification |
| Test summary + sign-off | 0.5 man-day | Sau khi pass exit criteria |
| **Tổng effort** | **8.5-12.0 man-days** | Tách rõ QA effort vs Dev effort (không cộng Dev fix time vào QA man-days) |

> **Khuyến nghị:** PM cần quyết định Phương án A hay B dựa trên resource availability và business priority. [Need Confirm]

---

## 9. VAI TRÒ & TRÁCH NHIỆM (RACI Matrix)

| Hoạt động | QA Lead (Lam TT) | Developer (Tan VD) | BA/PM Owner (Nhung NTC) | DevOps/DBA | Data Team | App/Support Team | Release Owner |
|---|---|---|---|---|---|---|---|
| **Test Plan / Test Cases / RTM** | **R** A | C | C I | I | I | I | I |
| **Confirm NC / technical contract** | C | **R** A | **R** A | C | C | — | — |
| **Deploy lên Testing** | I | **R** | I | **R** A | — | — | — |
| **Chuẩn bị test data** | **R** | C | C | — | C | — | — |
| **Trigger Sync PI (tool)** | **R** | C | — | — | — | — | — |
| **Trigger Sync industry (nền)** | C | C | — | — | **R** | — | — |
| **Cập nhật `lock_sync` trên MySQL** | I | — | C | — | — | **R** A | — |
| **Test execution** | **R** A | C | I | C | C | — | I |
| **Fix bug** | C I | **R** A | I | — | — | — | — |
| **Verify GMV/Sold đối chiếu** | **R** | C | C | — | **R** | — | — |
| **Approve residual risk** | C | C | **R** | — | — | — | **R** A |
| **Release decision** | C | C | C | C | — | — | **R** A |
| **Post-release monitoring** | C | **R** | I | **R** | **R** | — | I |

> **R** = Responsible (thực hiện), **A** = Accountable (chịu trách nhiệm), **C** = Consulted, **I** = Informed

---

## 10. GIẢ ĐỊNH & PHỤ THUỘC (Assumptions & Dependencies)

### 10.1 Assumptions

| # | Giả định | Ảnh hưởng nếu sai |
|---|---|---|
| A1 | Bảng `industry` đã có field `lock_sync` (boolean, NOT NULL, default FALSE) trên Testing env; existing industries đã backfill FALSE | Không thể test cổng lock; schema/migration tests fail |
| A2 | 2 luồng sync (Sync PI + Sync industry) là **đường duy nhất** ghi lại GMV/Sold của record PIW/PIM đã chốt | Nếu có đường khác, data đã chốt vẫn có thể bị đổi dù cổng lock đã SKIP |
| A3 | Sync chỉ update, không xóa record PIW/PIM | Nếu sync xóa record, cần test thêm logic xóa vs lock |
| A4 | Mốc khóa ngày 17 là hằng số viết thẳng trong code, không phải config | Nếu là config, cần test thêm thay đổi config runtime |
| A5 | Dev Wiki sẽ được bổ sung chi tiết; nhưng technical contract dùng để test phải được baseline trước execution | QA dùng BA spec làm nguồn chính; Dev Wiki bổ sung |
| A6 | App Team chia message thành 2 tập (locked/unlocked) tại thời điểm tạo request — Data Team chỉ cần xử lý theo message nhận được | Nếu Data Team tự xác định lock, cần test thêm logic Data Team |
| A7 | SKIP = **không phát sinh write** — không update bất kỳ field nào bao gồm `updated_at`, version, metadata | Nếu SKIP vẫn ghi một số field, cần redefine expected behavior |

### 10.2 Dependencies (trạng thái có evidence)

| # | Phụ thuộc | Owner | Status hiện tại | Evidence | Ngày xác nhận |
|---|---|---|---|---|---|
| D1 | Deploy YNMPECA-9293 (App - Update Report Sync API) lên Testing | Dev (Tan Vo Duy) + DevOps | **Pending** — sub-task In Progress | — | **[Need Confirm B3]** |
| D2 | Field `lock_sync` trên MySQL bảng `industry` (type, nullability, default, backfill) | Dev + DBA | **Pending** — chưa có evidence | — | **[Need Confirm]** |
| D3 | Queue `app.eci.trigger.report_synchronization` bind đúng trên Testing | DevOps | **Pending** — chưa có evidence | — | **[Need Confirm]** |
| D4 | Redis instance + key format `eca:report-sync:*` + TTL config | DevOps | **Pending** — chưa có evidence | — | **[Need Confirm]** |
| D5 | API endpoint PUT `report-synchronizations` hoạt động + contract | Dev | **Pending** — chưa có evidence | — | **[Need Confirm B4]** |
| D6 | QA có quyền truy cập MySQL, SOLR, Redis, queue, logs trên Testing/Staging | DevOps | **Pending** — chưa có evidence | — | **[Need Confirm]** |
| D7 | Test data (TD-1 → TD-12) chuẩn bị + reset procedure | QA + Dev | **Pending** — cần data catalogue | — | — |
| D8 | Script/tool trigger Sync industry (luồng 2) cho QA | Dev / Data Team | **Pending** — chưa xác nhận | — | **[Need Confirm B5]** |
| D9 | Injectable clock / test hook cho time boundary testing | Dev | **Pending** — chưa xác nhận | — | **[Need Confirm B6]** |

---

## PHỤ LỤC

### A. Tổng hợp các điểm cần xác nhận *(Need Confirm)*

> **Blockers (B1–B6):** Cần hoàn tất trước khi baseline test plan. **NC-6, NC-7:** nâng từ Nice-to-have lên **Blocking** cho integration testing.

| # | Câu hỏi | Người cần hỏi | Ảnh hưởng nếu chưa confirm | Mức độ |
|---|---|---|---|---|
| **B1** | `lookupFilters industry_id` đang lọc theo industry trên PI hay trên PIW/PIM record? Technical design bảo vệ mismatch (record locked + PI unlocked, và ngược lại) bằng cách nào? Nếu chỉ xét 1 phía → cần cập nhật design hoặc bổ sung guard tại consumer | Dev (Tan Vo Duy) | Thay đổi core expected behavior; ảnh hưởng toàn bộ decision table và test cases | **Blocking** |
| **B2** | `record.industry_id = NULL` + current PI industry locked + closed period: expected là SKIP (guard chống inflow) hay SYNC (BR-07)? Cần BA/Dev chốt quy tắc. Sau khi chốt → cập nhật decision table, test cases nhất quán | BA (Nhung NTC) + Dev (Tan Vo Duy) | Thay đổi decision table row #5–#9 | **Blocking** |
| **B3** | Confirm deploy date YNMPECA-9293 + build/version. Dependency D1 đang Pending nhưng v1.0 ghi "Done" — không đúng thực tế | Dev (Tan Vo Duy) | Blocking Entry Criteria #2 | **Blocking** |
| **B4** | Chốt technical contract: (a) message format khi 0/1/2 bucket; (b) time range inclusive/exclusive; (c) Redis key TTL + lifecycle khi fail; (d) PUT API request/response/error contract; (e) status khi partial success/failure | Dev (Tan Vo Duy) | Blocking toàn bộ Module 6 và API testing | **Blocking** |
| **B5** | Xác định script/tool/API trigger Sync industry cho QA. Cách observe chiều 1 và chiều 2. Cấp quyền log, queue, MySQL, SOLR, Redis | Dev (Tan Vo Duy) + Data Team | Blocking test luồng 2 (Module 4) | **Blocking** |
| **B6** | Chiến lược test thời gian: injectable clock, test hook hay mock time? Xác nhận timezone của App, Data worker, DB/log, queue timestamp | Dev (Tan Vo Duy) | Blocking boundary tests (Module 2) | **Blocking** |
| NC-1 | Confirm message format cuối cùng cho 2 tập locked/unlocked — `lookupFilters` và cách chia time range | Dev (Tan Vo Duy) | Ảnh hưởng test API/Integration | **Merged into B4** |
| NC-2 | Hash Redis lifecycle: khi nào tạo, khi nào xóa, sync fail thì hash có bị xóa không? | Dev (Tan Vo Duy) | Ảnh hưởng test Redis hash + Status | **Merged into B4** |
| NC-3 | API PUT `report-synchronizations` — request/response contract, error handling | Dev (Tan Vo Duy) | Ảnh hưởng test API integration | **Merged into B4** |
| NC-4 | Deploy date YNMPECA-9293 lên Testing | Dev (Tan Vo Duy) | Blocking Entry Criteria | **Merged into B3** |
| NC-5 | Browser matrix cho UI Create Sync Request | BA (Nhung NTC) | Ảnh hưởng scope UI test (P2) | Nice-to-have |
| NC-6 | QA trigger/observe Sync industry — script/tool? quyền? | Dev + Data Team | Blocking test luồng 2 | **Blocking (nâng từ Nice-to-have)** → B5 |
| NC-7 | Log skip location, format, access method | Dev (Tan Vo Duy) | Blocking verify SKIP behavior | **Blocking (nâng từ Nice-to-have)** → B5 |
| NC-8 | Lịch tuần EcomHeat đánh số shard — bảng mapping shard → tuần → tháng? | Dev / Data Team | Ảnh hưởng test data PIW lài 2 tháng | High |
| NC-9 | 2 chiều Sync industry dùng **cùng snapshot hay snapshot riêng**? | Dev (Tan Vo Duy) | Ảnh hưởng snapshot test cases | High |

### B. Decision Table — Cổng Lock (BR-06) *(Cập nhật: tách NULL theo từng phía)*

| # | Industry trên Record | Industry hiện tại của PI | Period | Expected | Trạng thái xác nhận |
|---|---|---|---|---|---|
| 1 | Unlocked | Unlocked | Closed | **SYNC** | ✅ Đã rõ |
| 2 | **Locked** | Unlocked | Closed | **SKIP** | ✅ Đã rõ — outflow guard |
| 3 | Unlocked | **Locked** | Closed | **SKIP** | ✅ Đã rõ — inflow guard |
| 4 | **Locked** | **Locked** | Closed | **SKIP** | ✅ Đã rõ |
| 5 | **NULL** | Unlocked | Closed | **SYNC** theo BR-07 | ⚠️ Cần confirm — NULL trên record side, PI unlocked |
| 6 | **NULL** | **Locked** | Closed | **[B2 — Cần BA xác nhận]** | ❌ **Blocking** — SKIP (inflow guard) hay SYNC (BR-07)? |
| 7 | Unlocked | **NULL** | Closed | **SYNC** — cần confirm | ⚠️ Cần confirm — PI side NULL |
| 8 | **Locked** | **NULL** | Closed | **SKIP** theo record side | ⚠️ Cần confirm |
| 9 | **NULL** | **NULL** | Closed | **SYNC** | ⚠️ Cần confirm |
| 10 | Bất kỳ | Bất kỳ | **Open** | **SYNC** | ✅ Đã rõ |

> **Sau khi BA/Dev confirm B2**, cập nhật đồng bộ tại: (1) Objective/core rule (Section 1.2), (2) Scope Module 1 (Section 2.1), (3) Decision table này, (4) Test data matrix (Section 4.3), (5) Test cases cho cả Sync PI và Sync industry.

### C. Rolling Boundary — Ví dụ minh họa (BR-13)

| Ngày hiện tại (giờ VN) | Ngày ≥ 17? | Boundary = cuối tháng... | Tháng đã chốt (≤ boundary) | Tháng đang mở (> boundary) |
|---|---|---|---|---|
| 16/06/2026 23:59:59 | Không | Cuối tháng 4/2026 | ≤ T4/2026 | T5/2026 trở đi |
| 17/06/2026 00:00:00 | Có | Cuối tháng 5/2026 | ≤ T5/2026 | T6/2026 trở đi |
| 22/06/2026 | Có | Cuối tháng 5/2026 | ≤ T5/2026 | T6/2026 trở đi |
| 16/07/2026 23:59:59 | Không | Cuối tháng 5/2026 | ≤ T5/2026 | T6/2026 trở đi |
| 17/07/2026 00:00:00 | Có | Cuối tháng 6/2026 | ≤ T6/2026 | T7/2026 trở đi |
| 31/12/2026 | Có | Cuối tháng 11/2026 | ≤ T11/2026 | T12/2026 trở đi |
| 01/01/2027 | Không | Cuối tháng 11/2026 | ≤ T11/2026 | T12/2026 trở đi |
| 17/01/2027 00:00:00 | Có | Cuối tháng 12/2026 | ≤ T12/2026 | T1/2027 trở đi |

### D. Shard PIW lài 2 tháng — Ví dụ minh họa (BR-16, EC-08)

| Tuần PIW | Ngày trong tuần | Tháng cũ (ngày) | Tháng mới (ngày) | Đa số ngày thuộc | Kết luận |
|---|---|---|---|---|---|
| Tuần A | 29/06 – 05/07 | 2 ngày (29, 30) | 5 ngày (01–05) | Tháng 7 | Quy về **T7** (open nếu boundary = cuối T6) |
| Tuần B | 27/06 – 03/07 | 4 ngày (27–30) | 3 ngày (01–03) | Tháng 6 | Quy về **T6** (closed nếu boundary = cuối T6) |
| Tuần C | 30/06 – 06/07 | 1 ngày (30) | 6 ngày (01–06) | Tháng 7 | Quy về **T7** (open nếu boundary = cuối T6) |
| **Tuần D** *(cross-year)* | 29/12/2026 – 04/01/2027 | 3 ngày (29–31) | 4 ngày (01–04) | Tháng 1/2027 | Quy về **T1/2027** |
| **Tuần E** *(cross-year)* | 28/12/2026 – 03/01/2027 | 4 ngày (28–31) | 3 ngày (01–03) | Tháng 12/2026 | Quy về **T12/2026** |

### E. Phân loại mức độ Bug

| Severity | Định nghĩa | Ví dụ trong scope |
|---|---|---|
| **Critical** | Data đã chốt bị đổi sau sync (cổng lock fail); service crash; data loss | GMV/Sold hoặc bất kỳ field nào của locked industry ở period đã chốt thay đổi; API crash khi tạo sync request |
| **High** | Cổng lock áp sai (boundary sai, xét 1 phía, mismatch lọt); message chia sai tập; request chuyển "Synced" sớm; record-level thay đổi dù aggregate không đổi | Rolling boundary tính sai; `lookupFilters` sai; `Sync Only Labels` vẫn áp lock; hash xóa sớm |
| **Medium** | Hash Redis không xóa đúng lifecycle; log skip thiếu thông tin; schema migration thiếu backfill | Status không chuyển "Synced" đúng thời điểm; log không có industry_id; industry mới không có default |
| **Low** | Lỗi log/documentation/cosmetic; UI note sai vị trí/format nhưng chức năng đúng | Typo trong UI note; log warning thừa; browser-specific rendering |

### F. Queue/Message Partition Scenarios *(Bổ sung theo review H1)*

| # | Scenario | Locked count | Unlocked count | Expected messages | Time range behavior |
|---|---|---|---|---|---|
| F-1 | Không có locked industry nào | 0 | N | 1 message (unlocked) | Full time range |
| F-2 | Tất cả industry đều locked | N | 0 | 1 message (locked) | Time range giới hạn theo boundary |
| F-3 | Hỗn hợp locked + unlocked | M | N | 2 messages | Locked: giới hạn; Unlocked: full |
| F-4 | Time range hoàn toàn closed | — | — | Theo F-1/F-2/F-3 | Locked: tất cả SKIP; Unlocked: tất cả SYNC |
| F-5 | Time range hoàn toàn open | — | — | Theo F-1/F-2/F-3 | Tất cả SYNC (cả locked + unlocked) |
| F-6 | Time range cắt qua rolling boundary | — | — | Theo F-1/F-2/F-3 | Locked: SKIP closed, SYNC open; Unlocked: tất cả SYNC |
| F-7 | Record industry và PI industry mismatch cả 2 chiều | — | — | Theo F-1/F-2/F-3 | Xét two-sided → SKIP nếu bất kỳ phía nào locked + closed |

---

## PHÊ DUYỆT / SIGN-OFF

| Vai trò | Họ tên | Ngày ký | Trạng thái | Ghi chú |
|---|---|---|---|---|
| QA Lead/Tester | Lam Tran Thanh |  | Pending | Sign-off sau khi đạt Exit Criteria |
| Developer | Tan Vo Duy |  | Pending | Confirm bug fixed, technical readiness, B1/B4/B5/B6 |
| BA/PM Owner | Nhung Nguyen Thi Cam |  | Pending | Confirm B2 (NULL rule), expected behavior, residual risk |
| Release Owner | *(Need Confirm)* |  | Pending | Final release decision, approve residual risk |
| DevOps/DBA | *(Need Confirm)* |  | Pending | Confirm deployment, rollback readiness, access |

---

## DEFINITION OF READY CHO BASELINE

Test Plan v1.1 được xem là sẵn sàng baseline khi:

- [ ] Tất cả blocker **B1–B6** đã đóng
- [ ] Decision table không còn expected result mơ hồ (row #5–#9)
- [ ] Dependency status (D1–D9) khớp Jira/deployment evidence
- [ ] Entry/Exit Criteria đã cập nhật theo evidence thực tế
- [ ] Timeline phù hợp với số QA và ngày làm việc thực tế (PM chọn Phương án A hoặc B)
- [ ] RTM và test data catalogue có link/version
- [ ] Technical failure lifecycle (Module 6) đã có expected behavior
- [ ] BA, Dev Lead và QA Lead đã review/sign-off baseline

---

*-- Hết tài liệu Test Plan --*

*Tài liệu v1.1 cập nhật theo review notes, bao gồm: tách NULL trong decision table, bổ sung Module 6 (failure lifecycle) và Module 7 (schema/migration), chuẩn hóa RACI, nâng NC-6/NC-7 thành blocking, sửa dependency status có evidence, bổ sung rủi ro R11–R18, điều chỉnh timeline/resource với 2 phương án, bổ sung calendar edge cases, sửa priority system, sửa định nghĩa nhất quán, bổ sung record-level data integrity, bổ sung queue partition scenarios, bổ sung chiến lược test thời gian, và Definition of Ready cho baseline.*
