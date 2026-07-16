# TEST PLAN
## [ECI] Exclude Locked Industries during WS/MS Sync
### Feature: Lock Industry theo thời gian — Bảo vệ dữ liệu đã chốt khi Sync PI / Sync Industry

| Field | Value |
|---|---|
| **Mã tài liệu** | TP-YNMPECA-9276-v1.0 |
| **Dự án** | YouNet Media - EcomHeat (ECI) |
| **Ngày tạo** | 16/07/2026 |
| **Ngày cập nhật** | 16/07/2026 |
| **Người tạo** | QA Team (AI-assisted) |
| **Phiên bản** | 1.0 - Draft |
| **Trạng thái** | Draft - Pending Review/Sign-off |
| **Jira chính** | https://jira.younetco.com/browse/YNMPECA-9276 |
| **Due date** | 24/07/2026 |
| **Tài liệu tham chiếu** | BA Spec: [02-F01-exclude-locked-industries-sync.md](file:///Users/tranthanhlam/product-ai-docs/EcomHeat/specs/02-lock-industry-sync/02-F01-exclude-locked-industries-sync.md) ; Dev Wiki: https://wiki.younetco.com/pages/viewpage.action?pageId=320701064 |
| **Sub-tasks** | YNMPECA-9293 (App - Update Report Sync API · In Progress), YNMPECA-9289 (Wiki/testcases · In Progress), YNMPECA-9290 (Testing · Open) |

---

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1 Bối cảnh

EcomHeat lưu doanh số theo tuần trên **PIW** (Product Item Weekly) và theo tháng trên **PIM** (Product Item Monthly). Mỗi record PIW/PIM lưu sẵn `industry_id` của sản phẩm tại thời điểm tính.

Hiện tại, khi có thao tác sync (đồng bộ), hệ thống cập nhật lại **mọi record PIW/PIM** theo thông tin Product Item (PI) mới nhất — bao gồm cả industry đã verify xong và đang dùng để báo cáo cho khách. Hậu quả: **số liệu đã chốt bị thay đổi → sai báo cáo đã gửi khách**. Hiện chưa có cơ chế để ECI Team đánh dấu "industry này đừng đụng" — mỗi lần bảo vệ đều phải nhờ kỹ thuật can thiệp thủ công.

### 1.2 Giải pháp

Đánh dấu industry cần bảo vệ bằng **cờ `lock_sync`** trên bảng `industry` (MySQL). Khi một industry bị lock, hệ thống **khóa theo thời gian** (Rolling Time-Lock):

- **Period đã chốt** (tháng cũ đã verify) → **SKIP** — giữ nguyên record, không cho sync ghi đè.
- **Period đang mở** (tháng hiện hành đang verify) → **SYNC** bình thường.

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

### 1.5 Mục tiêu kiểm thử

- Đảm bảo **cổng lock hoạt động đúng**: 100% record thuộc locked industry ở period đã chốt KHÔNG bị update sau sync.
- Đảm bảo **rolling time-lock** chính xác: ranh giới ngày 17, timezone UTC+7, tuần PIW lài 2 tháng quy đúng.
- Đảm bảo **Sync Mode** phân biệt đúng: `Sync All Fields` áp lock, `Sync Only Labels` không áp lock.
- Đảm bảo **dynamic list**: thêm/bỏ industry khỏi danh sách lock chỉ cần update `lock_sync`, áp dụng từ lần sync kế tiếp.
- Đảm bảo **snapshot consistency**: trạng thái lock và boundary chốt tại mốc khởi tạo, không đổi khi sync đang chạy.
- Đảm bảo **cơ chế kỹ thuật**: message chia đúng 2 tập (locked/unlocked), hash trên Redis quản lý đúng lifecycle, API cập nhật status đúng.
- Đảm bảo **không regression** trên luồng sync hiện tại cho industry không lock.

---

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1 In-Scope

#### Module 1: Cổng Lock thống nhất (Core Logic)

| STT | Hạng mục | BR / EC tham chiếu | Mô tả |
|---|---|---|---|
| 1 | Cờ `lock_sync` trên bảng `industry` | BR-01, BR-02, BR-03, BR-04, BR-05 | Xác minh trạng thái boolean (TRUE/FALSE), mặc định FALSE, cập nhật độc lập từng industry, áp dụng ngay lần sync kế tiếp |
| 2 | Quy tắc SKIP/SYNC (cổng lock) | BR-06, BR-07, BR-08 | Xét lock theo **cả 2 phía**: industry trên record PIW/PIM + industry hiện tại của PI; NULL = SYNC; non-bypassable |
| 3 | Snapshot consistency | BR-09, BR-10, BR-11, EC-05, EC-09 | Snapshot chốt tại mốc khởi tạo (Sync PI = tạo request, Sync industry = lúc chạy); thay đổi sau mốc chốt chỉ áp lần kế tiếp |
| 4 | Override adhoc | BR-12, EC-11 | Flip `lock_sync = FALSE` → sync được → set lại `TRUE` |

#### Module 2: Rolling Time-Lock (Ranh giới thời gian)

| STT | Hạng mục | BR / EC tham chiếu | Mô tả |
|---|---|---|---|
| 5 | Mốc khóa ngày 17 | BR-13, BR-14, BR-15, EC-10 | Ngày ≥ 17 → tháng liền trước đã chốt; Ngày < 17 → tháng liền trước vẫn mở; timezone UTC+7 |
| 6 | Quy shard PIW về tháng | BR-16, EC-08 | PIW lài 2 tháng → quy về tháng theo đa số ngày (≥ 4/7); PIM dùng trực tiếp shard YYYYMM |
| 7 | Tháng hiện tại luôn mở | BR-13 | Bất kể ngày nào, tháng hiện tại luôn cho sync |

#### Module 3: Luồng 1 — Sync PI (trên tool)

| STT | Hạng mục | BR / EC tham chiếu | Mô tả |
|---|---|---|---|
| 8 | Sync All Fields áp cổng lock | BR-17, BR-06 | Record locked industry ở period đã chốt bị SKIP; period đang mở vẫn SYNC |
| 9 | Sync Only Labels không áp cổng lock | BR-18, EC-04 | Chỉ update field `labels`, không đổi mapping fields; cổng lock không khóa |
| 10 | UI note trên màn Create Sync Request | S5.2, S5.3 | Text `(Apply Restricted Industries)` in nghiêng, màu đỏ, dưới radio `Sync All Fields` |
| 11 | Message chia 2 tập locked/unlocked | Dev Wiki | Verify message format, `lookupFilters`, time range bị giới hạn cho locked |
| 12 | Hash trên Redis + lifecycle | Dev Wiki | Hash lưu đúng format, xóa khi sync xong, status = "Synced" khi hết hash |

#### Module 4: Luồng 2 — Sync Industry (chạy nền)

| STT | Hạng mục | BR / EC tham chiếu | Mô tả |
|---|---|---|---|
| 13 | Chiều PI → PIW/PIM áp cổng lock | BR-06, BR-19 | Record thuộc locked industry + period đã chốt bị SKIP |
| 14 | Chiều PIW/PIM (lookup PI) áp cổng lock | BR-06, BR-19, EC-12 | Lookup PI để kiểm tra industry lock; PI không bị chỉnh sửa |
| 15 | Chiều 2 tự kích hoạt sau chiều 1 | BR-19 | Hoàn tất tự động; PI không bị thay đổi |

#### Module 5: Edge Cases & Concurrency

| STT | Hạng mục | EC tham chiếu | Mô tả |
|---|---|---|---|
| 16 | Industry lock nhưng ngoài phạm vi sync | EC-03 | Không phát sinh thao tác, không gây side-effect |
| 17 | Record `industry_id = NULL` | EC-02, BR-07 | SYNC bình thường, không bị lock chặn |
| 18 | Industry trong scope nhưng không có record | EC-07 | No-op, không báo lỗi; Sync PI → Status = "Synced" |
| 19 | Lỗi/gián đoạn sync → retry | EC-06 | Cổng lock áp nhất quán; idempotent |
| 20 | PI bị đổi phân loại (mismatch industry) | EC-12 | Lock xét cả industry trên record lẫn industry của PI |
| 21 | Hai luồng ghi song song cùng record | EC-13 | Record đã chốt SKIP ở cả 2 luồng; record mở = last-write-wins |
| 22 | Đồng hồ qua mốc 17 sau khi chốt snapshot | EC-09 | Giữ boundary theo snapshot; mốc mới áp lần sau |

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
| **Cổng Lock Core Logic** | Decision Table Testing | Xây bảng quyết định: lock status × period status (open/closed) × industry on record × industry on PI → SKIP/SYNC |
| **Rolling Time-Lock Boundary** | Boundary Value Analysis | Test các mốc: ngày 16 vs 17 vs 18; tuần PIW lài 2 tháng (4-3 vs 3-4 ngày); đúng 0h00 ngày 17 |
| **Sync Mode Differentiation** | Equivalence Partitioning | `Sync All Fields` vs `Sync Only Labels`: verify cổng lock chỉ áp cho mode All Fields |
| **Dynamic Lock List** | State Transition Testing | Lock → Unlock → Lock lại; mặc định FALSE cho industry mới; thay đổi sau mốc chốt |
| **Snapshot Consistency** | Concurrency Testing | Đổi lock / đổi boundary sau khi sync bắt đầu → verify snapshot không đổi |
| **Two-way Sync (Sync Industry)** | Integration Testing | Chiều 1 (PI→PIW/PIM) + Chiều 2 (PIW/PIM lookup PI) áp lock đúng; PI không bị sửa |
| **Edge Cases** | Error Guessing + Exploratory | NULL industry, mismatch industry, no record, retry, concurrent writes |

#### Mapping User Story → Test Scenarios

| User Story | Số AC | Estimated Test Cases | Priority |
|---|---:|---:|---|
| US-01 · Sync industry: lock data đã chốt | 7 AC | 12-16 cases | P0 |
| US-02 · Dynamic lock list | 6 AC | 10-14 cases | P0 |
| US-03 · Cổng lock 2 chiều (Sync industry) | 3 AC | 6-8 cases | P0 |
| US-04 · Sync Mode (Sync PI) + UI note | 3 AC | 8-10 cases | P0 |
| US-05 · Rolling Time-Lock (boundary ngày 17) | 9 AC | 16-22 cases | P0 |
| Edge Cases tổng hợp (EC-01 → EC-13) | 13 EC | 10-14 cases | P0-P1 |
| **Tổng ước tính** | | **62-84 cases** | |

### 3.2 UI/UX Testing

| Hạng mục | Mô tả | Priority |
|---|---|---|
| Note `(Apply Restricted Industries)` | Hiển thị dưới radio `Sync All Fields`; in nghiêng, màu đỏ; KHÔNG hiển thị dưới `Sync Only Labels` | P0 |
| Interaction khi chọn Sync Mode | Note tĩnh, không có animation đặc thù | P1 |
| Status "Synced" sau sync hoàn tất | Cột Status hiển thị đúng trên màn Create Sync Request | P1 |

### 3.3 API/Integration Testing

| Điểm tích hợp | Phương pháp | Công cụ/Cách thức |
|---|---|---|
| **Queue `app.eci.trigger.report_synchronization`** | Contract Testing | Verify 2 messages riêng (locked/unlocked) đúng format, `lookupFilters`, time range |
| **Redis hash lifecycle** | State Verification | Verify hash lưu đúng format `eca:report-sync:<id>:<hash>`, xóa khi sync xong |
| **API PUT `report-synchronizations`** | API Testing | Verify cập nhật status, xóa hash, status = "Synced" khi hết hash |
| **MySQL bảng `industry`** | Data Verification | Verify field `lock_sync` TRUE/FALSE, mặc định FALSE, update không cần deploy |
| **SOLR PIW/PIM records** | Data Integrity | Verify record locked industry + period đã chốt KHÔNG thay đổi sau sync |

### 3.4 Data Sync / Data Integrity

| Hạng mục | Mô tả |
|---|---|
| **GMV/Sold không đổi** | Đối chiếu GMV/Sold của locked industry ở period đã chốt trước–sau sync (kỳ vọng chênh lệch = 0) |
| **Period đang mở vẫn update** | Verify record ở tháng hiện tại / tháng mở vẫn được sync đúng |
| **Fields mapping đúng** | `industry_id`, `model_id`, `brand_id`, `product_line_id` không bị đổi cho record locked + period đã chốt |
| **Labels vẫn update ở mode Only Labels** | Verify field `labels` vẫn cập nhật cho industry lock khi chạy `Sync Only Labels` |
| **Shard PIW quy tháng đúng** | Tuần lài 2 tháng → quy về tháng theo đa số ngày (≥ 4/7) rồi so boundary |

### 3.5 Non-functional Testing

| NFR | Tiêu chí đánh giá | Cách kiểm tra |
|---|---|---|
| **Performance (Tính độc lập)** | Cổng lock không làm chậm sync industry non-locked quá 10% (ceiling), kỳ vọng ≤ 5% | Benchmark cùng tập non-locked, cùng period & data volume, trước/sau khi bật lock; chạy ≥ 3 lần lấy trung bình |
| **Tính nhất quán** | Cùng danh sách locked → cùng kết quả skip/sync ở mọi lần chạy | Đối chiếu tập record bị skip giữa các lần chạy |
| **Khả năng kiểm tra (Audit)** | Log skip theo `industry_id` + lý do; báo cáo đối chiếu GMV/Sold | Verify log output và khả năng trace |
| **Tính linh hoạt** | Thêm/bỏ industry khỏi lock chỉ update `lock_sync`, không cần deploy | Review thao tác update + xác nhận không deploy |

---

## 4. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

### 4.1 Môi trường

| Môi trường | Mục đích | Giai đoạn sử dụng |
|---|---|---|
| **Testing** | Test chức năng chính: cổng lock, rolling boundary, Sync Mode, message format | Phase test chính (17/07 → 21/07) |
| **Staging** | Regression + sign-off trước release; verify với data gần production | Sau khi pass Testing (22/07 → 24/07) |
| **Production** | Monitor sau release, không test trực tiếp | Post-release monitoring |

### 4.2 Nền tảng/Thiết bị

| Thành phần | Chi tiết |
|---|---|
| **Web (UI Create Sync Request)** | Chrome latest, Firefox latest *(Confirm: browser matrix chính thức)* [Giả định - Need Confirm] |
| **Backend/API** | Node.js / Service stack ECI |
| **Database** | MySQL (bảng `industry`), SOLR (PIW/PIM), Redis (hash sync request) |
| **Message Queue** | Queue `app.eci.trigger.report_synchronization` |

### 4.3 Dữ liệu cần chuẩn bị

| Nhóm data | Mục đích |
|---|---|
| **Industry có `lock_sync = TRUE`** | Test cổng lock, rolling boundary, SKIP behavior |
| **Industry có `lock_sync = FALSE`** | Test sync bình thường, baseline comparison |
| **Industry mới (vừa thêm)** | Verify mặc định `lock_sync = FALSE` |
| **Record PIW/PIM đa dạng period** | Period đã chốt, period đang mở, period null industry |
| **PIW tuần lài 2 tháng** | Verify quy tháng theo đa số ngày (≥ 4/7) |
| **PI đã đổi phân loại (mismatch industry)** | Industry trên record ≠ industry hiện tại của PI |
| **PI không có record PIW/PIM trong period** | Verify no-op, không báo lỗi |

---

## 5. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 5.1 Entry Criteria — Điều kiện để QA bắt đầu test

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | Code sub-task YNMPECA-9293 (App - Update Report Sync API) đã deploy lên Testing | Bắt buộc |
| 2 | Bảng `industry` đã có field `lock_sync` (mặc định FALSE) trên Testing | Bắt buộc |
| 3 | Queue `app.eci.trigger.report_synchronization` đã bind đúng trên Testing | Bắt buộc |
| 4 | Redis instance sẵn sàng, có thể verify hash `eca:report-sync:*` | Bắt buộc |
| 5 | API PUT `report-synchronizations` hoạt động trên Testing | Bắt buộc |
| 6 | Dev đã pass Unit Test cho logic cổng lock (rolling boundary, Sync Mode) | Bắt buộc |
| 7 | BA/Dev đã confirm các Need Confirm blocking (NC-1 → NC-4) | Bắt buộc |
| 8 | Test data đủ: industry lock/unlock, PIW/PIM đa dạng period, PIW tuần lài 2 tháng | Bắt buộc |
| 9 | QA có quyền truy cập MySQL (bảng industry), SOLR (PIW/PIM), Redis (hash) trên Testing | Bắt buộc |
| 10 | Dev Wiki hoàn thiện (message format, API contract, hash lifecycle) | Khuyến khích |

### 5.2 Exit Criteria — Điều kiện để QA cho phép release

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | 100% P0 test cases đã executed với kết quả Passed hoặc Bug Fixed/Re-tested Passed | Bắt buộc |
| 2 | 0 bug Critical/High mở liên quan: cổng lock không hoạt động, data đã chốt bị đổi, rolling boundary sai | Bắt buộc |
| 3 | GMV/Sold đối chiếu trước–sau sync cho locked industry ở period đã chốt = 0 chênh lệch | Bắt buộc |
| 4 | `Sync Only Labels` KHÔNG áp lock, chỉ update field `labels` | Bắt buộc |
| 5 | `Sync All Fields` áp lock đúng: message chia 2 tập, time range giới hạn đúng cho locked | Bắt buộc |
| 6 | Rolling boundary (ngày 17, UTC+7) tính đúng cho cả PIW (shard tuần) và PIM (shard tháng) | Bắt buộc |
| 7 | Dynamic list: thêm/bỏ lock không cần deploy; áp dụng lần sync kế tiếp | Bắt buộc |
| 8 | Industry non-locked sync bình thường, không bị ảnh hưởng bởi cổng lock (regression pass) | Bắt buộc |
| 9 | Test case execution rate ≥ 95% cho P0 + P1 | Bắt buộc |
| 10 | P0 pass rate = 100% và P0+P1 pass rate ≥ 98% sau retest | Bắt buộc |
| 11 | UI note `(Apply Restricted Industries)` hiển thị đúng vị trí, format trên màn Create Sync Request | Bắt buộc |
| 12 | Bug Medium/Low còn mở đã được PM/BA/Dev Lead đánh giá và chấp nhận release | Khuyến khích |
| 13 | Test Summary Report đã được gửi cho PM/Dev/BA | Khuyến khích |

---

## 6. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

### 6.1 Rủi ro kỹ thuật

| # | Rủi ro | Mức độ | Xác suất | Hướng giải quyết |
|---|---|---|---|---|
| R1 | **Rolling boundary tính sai ở mốc chuyển giao ngày 17** — đặc biệt edge case 0h00 ngày 17, timezone server ≠ UTC+7 | Cao | Trung bình | Viết test cases chi tiết cho boundary: ngày 16 23:59, ngày 17 00:00, ngày 17 00:01 (giờ VN). Verify timezone config trên server. Chạy test qua mốc 0h00 thực tế nếu có thể |
| R2 | **Tuần PIW lài 2 tháng quy tháng sai** — logic đa số ngày (≥ 4/7) có thể implement sai khiến record bị SKIP hoặc SYNC nhầm | Cao | Trung bình | Chuẩn bị test data PIW tuần lài: 4-3 vs 3-4 phân bổ ngày. Verify bằng đối chiếu trực tiếp shard → tháng trên SOLR |
| R3 | **Cổng lock chỉ xét 1 phía (record hoặc PI) thay vì cả 2 phía** — dẫn đến data bị ghi sang industry lock (inflow) hoặc bị rời khỏi industry lock (outflow) | Cao | Trung bình | Test case cụ thể cho mismatch industry (EC-12): PI hiện tại thuộc industry A (lock), record PIW/PIM thuộc industry B (không lock) — và ngược lại. Verify SKIP đúng khi một trong hai phía lock |
| R4 | **Message queue chia sai 2 tập locked/unlocked** — `lookupFilters` hoặc time range bị lệch | Cao | Trung bình | Verify trực tiếp message trên RabbitMQ/queue: `lookupFilters` đúng danh sách industry, time range locked bị giới hạn đúng theo boundary |
| R5 | **Hash trên Redis không được xóa sau sync** — status request không chuyển "Synced" | Trung bình | Thấp | Verify Redis key lifecycle: tạo → tồn tại → xóa. Kiểm tra API PUT response. Test case: sync thành công nhưng hash còn lại |

### 6.2 Rủi ro quy trình

| # | Rủi ro | Mức độ | Xác suất | Hướng giải quyết |
|---|---|---|---|---|
| R6 | **Sub-task Dev (YNMPECA-9293) chưa hoàn tất đúng timeline** — hiện đang In Progress, ảnh hưởng Entry Criteria | Cao | Trung bình | Theo dõi progress hằng ngày. QA chuẩn bị test cases trước, sẵn sàng execution ngay khi deploy. Escalate nếu block > 1 ngày |
| R7 | **Dev Wiki chưa hoàn thiện** — page mới tạo cùng ngày (16/07), version 1 | Trung bình | Cao | QA đọc kỹ BA spec (đã approved) làm nguồn chính; dùng Dev Wiki bổ sung. Đặt NC cho các điểm chưa rõ trong Dev Wiki |
| R8 | **Test data thiếu — đặc biệt PIW tuần lài 2 tháng, industry mismatch** | Trung bình | Trung bình | Chuẩn bị test data trước; xin Dev support tạo data nếu cần. Mock data trực tiếp trên SOLR/MySQL nếu được phép |

### 6.3 Rủi ro nghiệp vụ

| # | Rủi ro | Mức độ | Xác suất | Hướng giải quyết |
|---|---|---|---|---|
| R9 | **Người vận hành quên set lock trước khi chạy sync** — sync sẽ đi qua data đã chốt vì cờ lock chưa được bật | Trung bình | Trung bình | Đây là rủi ro vận hành thủ công, nằm ngoài scope code. QA ghi nhận và đề xuất: (1) document quy trình vận hành rõ ràng, (2) xem xét guard tự động ở phase sau |
| R10 | **Override adhoc (flip lock_sync = FALSE) quên set lại TRUE** — industry mất bảo vệ vĩnh viễn | Trung bình | Trung bình | Verify quy trình override: lock → unlock → sync → lock lại. QA ghi nhận risk và đề xuất checklist vận hành |

---

## 7. TÀI LIỆU BÀN GIAO (Deliverables)

| # | Tài liệu | Mô tả | Deadline | Owner | Người nhận |
|---|---|---|---|---|---|
| 1 | **Test Plan v1.0** | Kế hoạch kiểm thử tổng thể: scope, strategy, risk, timeline, criteria | 16/07/2026 | QA - Lam Tran Thanh | PM, Dev Lead, BA |
| 2 | **Test Cases** | Chi tiết 62-84 test cases: steps, test data, expected result, mapping BR/EC/US | 16/07/2026 | QA - Lam Tran Thanh | PM, BA, Dev |
| 3 | **Bug Reports** | Jira bug kèm: input data, actual result, expected result, evidence (screenshots/queries) | Ongoing | QA - Lam Tran Thanh | Dev Team |
| 4 | **Data Integrity Evidence** | Query result đối chiếu GMV/Sold trước–sau sync cho locked industry ở period đã chốt | Ongoing | QA - Lam Tran Thanh | Dev, QA |
| 5 | **Test Execution Report - Testing** | Trạng thái pass/fail/blocked từng test case trên Testing env | 21/07/2026 | QA - Lam Tran Thanh | PM |
| 6 | **Test Execution Report - Staging** | Kết quả regression + final retest trên Staging | 24/07/2026 | QA - Lam Tran Thanh | PM, Dev Lead, BA |
| 7 | **Test Summary Report + Sign-off** | Tổng kết coverage, bugs, residual risk, release recommendation | 24/07/2026 | QA - Lam Tran Thanh | PM, Dev Lead, Stakeholders |

---

## 8. TIMELINE & ƯỚC LƯỢNG KIỂM THỬ (Timeline & Estimation)

### 8.1 Timeline

| Phase | Bắt đầu | Kết thúc | Nội dung | Output | Owner |
|---|---|---|---|---|---|
| Test Plan + Test Cases | 16/07/2026 | 16/07/2026 | Hoàn thiện test plan, viết test cases, chuẩn bị Need Confirm | Test plan, test cases, NC list | QA |
| Testing Env Execution | 17/07/2026 | 21/07/2026 | Execute full TC trên Testing, ưu tiên P0 cổng lock / boundary / Sync Mode | Testing execution report, bugs | QA + Dev |
| Bug Fix + Retest | 22/07/2026 | 22/07/2026 | Dev fix bug, QA retest | Bug fix verification | Dev + QA |
| Staging Regression + Sign-off | 23/07/2026 | 24/07/2026 | Regression trên Staging, final retest, sign-off | Staging report + Test Summary | QA + PM/BA |

> Lưu ý: Timeline dựa trên comment Jira (Lam Tran Thanh) — "Done wiki/testcases: 16/07, Done testing: 21/07, Fix bug: 22/07, Done staging: 24/07". Dev sub-task YNMPECA-9293 đang In Progress — cần confirm deploy date lên Testing. [Need Confirm]

### 8.2 Effort Estimation

| Hoạt động | Effort ước tính | Ghi chú |
|---|---:|---|
| Hoàn thiện test plan + test cases | 1.0 man-day | Bao gồm update sau review |
| Chuẩn bị test data + env readiness | 0.5-1.0 man-day | Phụ thuộc quyền truy cập DB/SOLR/Redis |
| Testing execution (P0 + P1) | 3.0-4.0 man-days | Logic phức tạp: rolling boundary, 2 luồng sync, edge cases |
| Bug fix + retest buffer | 1.0-1.5 man-days | Buffer cho bug fix/re-deploy |
| Staging regression + sign-off | 1.0-1.5 man-days | Targeted regression + final verification |
| Test summary + sign-off | 0.5 man-day | Sau khi pass exit criteria |
| **Tổng effort** | **7.0-9.5 man-days** | Giả định 1 QA chính |

---

## 9. VAI TRÒ & TRÁCH NHIỆM (Roles & Responsibilities)

| Vai trò | Người phụ trách | Trách nhiệm |
|---|---|---|
| QA Lead/Tester | Lam Tran Thanh | Viết test plan/test cases, chuẩn bị data, execute, report bug, test summary, sign-off QA |
| Developer | Tan Vo Duy (Assignee) | Code cổng lock + API, fix bug, support debug, xác nhận deployment |
| BA/PM Owner | Nhung Nguyen Thi Cam (Reporter/Creator) | Confirm requirement, review Need Confirm, approve expected behavior |
| PM/Release Owner | *(Need Confirm)* | Approve timeline, accept residual risk, quyết định release |
| App/Support Team | *(Need Confirm)* | Cập nhật `lock_sync` trên MySQL; thao tác override adhoc |
| Data Team | *(Need Confirm)* | Chạy Sync industry (luồng 2), verify đối chiếu GMV/Sold |

---

## 10. GIẢ ĐỊNH & PHỤ THUỘC (Assumptions & Dependencies)

### 10.1 Assumptions

| # | Giả định | Ảnh hưởng nếu sai |
|---|---|---|
| A1 | Bảng `industry` đã có field `lock_sync` (boolean, default FALSE) trên Testing env | Không thể test cổng lock nếu field chưa tồn tại |
| A2 | 2 luồng sync (Sync PI + Sync industry) là **đường duy nhất** ghi lại GMV/Sold của record PIW/PIM đã chốt — job aggregation gốc không tính lại quá khứ | Nếu có đường khác, data đã chốt vẫn có thể bị đổi dù cổng lock đã SKIP |
| A3 | Sync chỉ update, không xóa record PIW/PIM | Nếu sync xóa record, cần test thêm logic xóa vs lock |
| A4 | Mốc khóa ngày 17 là hằng số viết thẳng trong code, không phải config | Nếu là config, cần test thêm thay đổi config runtime |
| A5 | Dev Wiki (pageId=320701064) sẽ được bổ sung thêm chi tiết (hiện version 1, mới tạo 16/07) | QA dùng BA spec làm nguồn chính; Dev Wiki bổ sung |
| A6 | App Team chia message thành 2 tập (locked/unlocked) tại thời điểm tạo request — Data Team chỉ cần xử lý theo message nhận được | Nếu Data Team tự xác định lock, cần test thêm logic Data Team |

### 10.2 Dependencies

| # | Phụ thuộc | Owner | Trạng thái cần có trước test |
|---|---|---|---|
| D1 | Deploy YNMPECA-9293 (App - Update Report Sync API) lên Testing | Dev (Tan Vo Duy) + DevOps | Done |
| D2 | Field `lock_sync` trên MySQL bảng `industry` | Dev + DBA | Done |
| D3 | Queue `app.eci.trigger.report_synchronization` bind đúng | DevOps | Done |
| D4 | Redis instance + key format `eca:report-sync:*` | DevOps | Done |
| D5 | API endpoint PUT `report-synchronizations` hoạt động | Dev | Done |
| D6 | QA có quyền truy cập MySQL, SOLR, Redis, queue trên Testing/Staging | DevOps | Done |
| D7 | Test data: industry lock/unlock, PIW/PIM đa dạng period, PIW tuần lài 2 tháng | QA + Dev | Ready |

---

## PHỤ LỤC

### A. Tổng hợp các điểm cần xác nhận *(Need Confirm)*

> Các điểm dưới đây cần confirm trước khi chốt test cases chi tiết. NC-1 → NC-4 là blocking theo Entry Criteria.

| # | Câu hỏi | Người cần hỏi | Ảnh hưởng nếu chưa confirm | Mức độ |
|---|---|---|---|---|
| NC-1 | Dev Wiki mới tạo (version 1, 16/07). Confirm message format cuối cùng cho 2 tập locked/unlocked — đặc biệt `lookupFilters` và cách chia time range? | Dev (Tan Vo Duy) | Ảnh hưởng test API/Integration và message contract | Blocking |
| NC-2 | Hash trên Redis: confirm lifecycle chính xác — khi nào tạo, khi nào xóa, edge case sync fail thì hash có bị xóa không? | Dev (Tan Vo Duy) | Ảnh hưởng test Redis hash + Status "Synced" | Blocking |
| NC-3 | API PUT `report-synchronizations` — confirm request/response contract, error handling khi hash không tồn tại | Dev (Tan Vo Duy) | Ảnh hưởng test API integration | Blocking |
| NC-4 | Confirm deploy date của YNMPECA-9293 lên Testing — hiện đang In Progress | Dev (Tan Vo Duy) | Blocking Entry Criteria #1 | Blocking |
| NC-5 | Browser matrix cho UI Create Sync Request: chỉ test Chrome? Hay cả Firefox/Safari/Edge? | BA (Nhung NTC) | Ảnh hưởng scope UI test | Nice-to-have |
| NC-6 | Sync industry (luồng 2) do Data Team chạy nền — QA cần quyền gì để trigger và verify? Script/tool nào? | Dev + Data Team | Ảnh hưởng khả năng test luồng 2 | Nice-to-have |
| NC-7 | Log skip theo `industry_id` + lý do: log ở đâu (app log, queue, DB)? QA cần truy cập log bằng cách nào? | Dev (Tan Vo Duy) | Ảnh hưởng khả năng verify SKIP behavior | Nice-to-have |
| NC-8 | Tuần PIW lài 2 tháng: confirm lịch tuần EcomHeat đánh số shard — có bảng mapping shard → tuần → tháng không? | Dev / Data Team | Ảnh hưởng test data PIW lài 2 tháng | Nice-to-have |

### B. Decision Table — Cổng Lock (BR-06)

| # | Industry trên Record (lock?) | Industry hiện tại của PI (lock?) | Period status | `industry_id` | Expected |
|---|---|---|---|---|---|
| 1 | FALSE | FALSE | Đã chốt | Có giá trị | **SYNC** |
| 2 | TRUE | FALSE | Đã chốt | Có giá trị | **SKIP** |
| 3 | FALSE | TRUE | Đã chốt | Có giá trị | **SKIP** |
| 4 | TRUE | TRUE | Đã chốt | Có giá trị | **SKIP** |
| 5 | FALSE | FALSE | Đang mở | Có giá trị | **SYNC** |
| 6 | TRUE | FALSE | Đang mở | Có giá trị | **SYNC** |
| 7 | FALSE | TRUE | Đang mở | Có giá trị | **SYNC** |
| 8 | TRUE | TRUE | Đang mở | Có giá trị | **SYNC** |
| 9 | N/A | N/A | Đã chốt | NULL | **SYNC** |
| 10 | N/A | N/A | Đang mở | NULL | **SYNC** |

> **Giải thích**: SKIP chỉ xảy ra khi (1) period **đã chốt** VÀ (2) **ít nhất 1 trong 2 phía** industry đang lock. Period **đang mở** → luôn SYNC bất kể lock status. `industry_id = NULL` → luôn SYNC.

### C. Rolling Boundary — Ví dụ minh họa (BR-13)

| Ngày hiện tại (giờ VN) | Ngày ≥ 17? | Boundary = cuối tháng... | Tháng đã chốt (≤ boundary) | Tháng đang mở (> boundary) |
|---|---|---|---|---|
| 16/06/2026 | Không | Cuối tháng 4/2026 | ≤ T4/2026 | T5/2026 trở đi |
| 17/06/2026 | Có | Cuối tháng 5/2026 | ≤ T5/2026 | T6/2026 trở đi |
| 22/06/2026 | Có | Cuối tháng 5/2026 | ≤ T5/2026 | T6/2026 trở đi |
| 16/07/2026 | Không | Cuối tháng 5/2026 | ≤ T5/2026 | T6/2026 trở đi |
| 17/07/2026 | Có | Cuối tháng 6/2026 | ≤ T6/2026 | T7/2026 trở đi |
| 01/08/2026 | Không | Cuối tháng 6/2026 | ≤ T6/2026 | T7/2026 trở đi |
| 17/08/2026 | Có | Cuối tháng 7/2026 | ≤ T7/2026 | T8/2026 trở đi |

### D. Shard PIW lài 2 tháng — Ví dụ minh họa (BR-16, EC-08)

| Tuần PIW | Ngày trong tuần | Tháng 6 (ngày) | Tháng 7 (ngày) | Đa số ngày thuộc | Kết luận |
|---|---|---|---|---|---|
| Tuần A | 29/06 – 05/07 | 2 ngày (29, 30) | 5 ngày (01–05) | Tháng 7 | Quy về **T7** (open nếu boundary = cuối T6) |
| Tuần B | 27/06 – 03/07 | 4 ngày (27–30) | 3 ngày (01–03) | Tháng 6 | Quy về **T6** (closed nếu boundary = cuối T6) |
| Tuần C | 30/06 – 06/07 | 1 ngày (30) | 6 ngày (01–06) | Tháng 7 | Quy về **T7** (open nếu boundary = cuối T6) |

### E. Phân loại mức độ Bug

| Severity | Định nghĩa | Ví dụ trong scope |
|---|---|---|
| **Critical** | Data đã chốt bị đổi sau sync (cổng lock fail), service crash | GMV/Sold locked industry ở period đã chốt thay đổi; API crash khi tạo sync request |
| **High** | Cổng lock áp sai (boundary sai, xét 1 phía), message chia sai tập | Rolling boundary tính sai ngày 17; message `lookupFilters` không đúng danh sách locked; `Sync Only Labels` vẫn áp lock |
| **Medium** | Hash Redis không xóa đúng, UI note sai format, log skip thiếu thông tin | Status không chuyển "Synced"; note không hiển thị; log không có industry_id |
| **Low** | Lỗi log/documentation/cosmetic | Typo trong UI note; log warning thừa |

---

## PHÊ DUYỆT / SIGN-OFF

| Vai trò | Họ tên | Ngày ký | Trạng thái | Ghi chú |
|---|---|---|---|---|
| QA Lead/Tester | Lam Tran Thanh |  | Pending | Sign-off sau khi đạt Exit Criteria |
| Developer | Tan Vo Duy |  | Pending | Confirm bug fixed và technical readiness |
| BA/PM Owner | Nhung Nguyen Thi Cam |  | Pending | Confirm expected behavior và residual risk |
| PM/Release Owner | *(Need Confirm)* |  | Pending | Final release decision |

---

*-- Hết tài liệu Test Plan --*

*Tài liệu này được tạo bởi QA Team với sự hỗ trợ của AI, dựa trên Jira YNMPECA-9276, BA spec 02-F01-exclude-locked-industries-sync.md (version 2.1, approved Gate 3), Dev Wiki (pageId=320701064, version 1), và phân tích nghiệp vụ lock industry + rolling time-lock. Các giả định đã được đánh dấu rõ bằng `Need Confirm` để follow-up trước khi viết/execution test cases chi tiết.*
