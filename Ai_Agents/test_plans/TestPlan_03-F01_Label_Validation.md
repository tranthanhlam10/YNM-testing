# TEST PLAN — 03-F01 Label Validation

## Thông tin tài liệu

| Field | Value |
|---|---|
| Sản phẩm | EcomHeat |
| Initiative | PRD-03 — QC Duplicate Label |
| Feature | 03-F01 — Label Validation (Đợt 1: Prefix Scanner) |
| Priority | P0 |
| Release dự kiến | 21/09/2026 |
| Trạng thái test plan | Draft — chờ đóng các Need Confirm tại mục 5.1 |
| Test owner | QA EcomHeat `[TBD - cần QA Lead xác nhận]` |
| Business owner | NhungNTC |
| Test oracle nghiệp vụ | [`03-F01-label-validation.md`](/Users/tranthanhlam/product-ai-docs/EcomHeat/specs/03-qc-duplicate-label/03-F01-label-validation.md) v3.0 và [`PRD-03-qc-duplicate-label.md`](/Users/tranthanhlam/product-ai-docs/EcomHeat/specs/03-qc-duplicate-label/PRD-03-qc-duplicate-label.md) v1.3 |
| Technical design | [`architecture.md`](/Users/tranthanhlam/product-ai-docs/EcomHeat/specs/03-qc-duplicate-label/technical-specs/03-F01-label-validation/architecture.md) và bốn spec con trong [`technical-specs/03-F01-label-validation/`](/Users/tranthanhlam/product-ai-docs/EcomHeat/specs/03-qc-duplicate-label/technical-specs/03-F01-label-validation/) |
| Prototype / evidence UI | 15 ảnh trong [`_assets/`](/Users/tranthanhlam/product-ai-docs/EcomHeat/specs/03-qc-duplicate-label/_assets/) |

### Thứ tự ưu tiên nguồn

1. PRD/FRD quyết định hành vi nghiệp vụ và expected result.
2. Technical spec quyết định điểm tích hợp, cách tạo dữ liệu và cách quan sát.
3. Prototype/ảnh dùng để đối chiếu bố cục và trạng thái UI. Prototype không ghi đè FRD.
4. Khi technical spec khác FRD, QA test theo FRD và ghi blocker để Dev cập nhật contract trước khi execute.

### Inventory nguồn đã phân tích

| Nhóm nguồn | Artifact | Vai trò |
|---|---|---|
| Business requirement | PRD-03 v1.3 | Mục tiêu, release boundary, persona, success metric, dependency |
| Feature requirement / AC | FRD 03-F01 v3.0 | Oracle chính: BR-01 → BR-51, EC, NFR, US/AC, message và email |
| Context lịch sử | `_brainstorm-duplicate-label-ver1.md` | As-Is và quyết định cũ; không dùng nội dung Phase 1 để xác định scope đợt này |
| Review artifact | `_review-03-F01-label-validation.md` | Quyết định gần nhất về guard 4 điều kiện và đóng băng tập bulk |
| Technical architecture | `architecture.md` | Luồng API → tracker → RabbitMQ → worker → Solr → Google Sheet → email |
| Frontend design | `eca-tool.md` | Route, component, API mapping, permission, state UI |
| API design | `social-listening-api.md` | Endpoint, appCode, guard, enqueue, cancel race, soft delete |
| Migration design | `sl-api-migrates.md` | Bảng `label_validation_requests`, permission catalogue, verification và rollback |
| Worker design | `ynm-ecomheat.md` | Cursor scan, Rule D/M, tracker, file, email, timeout, self-chaining |
| Data model | `_context/data-models/mysql/eca-reports/label_validation_requests.md`, `monitoring_app_new/trackers.md` | Điểm quan sát DB và ràng buộc dữ liệu |

---

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1 Mục tiêu kiểm thử

Xác nhận ECI Data có thể thay thế script Console F12 bằng luồng Label Validation trên EcomHeat để:

- Lưu một cấu hình kiểm tra sống lâu dài và chạy lại trên toàn bộ Product Item trong phạm vi.
- Phát hiện đúng vi phạm `Duplicate` và `Missing` theo prefix tên label.
- Không bỏ sót PI do lọc sai `manual_updated`, label đã xóa hoặc cấu hình đã mất toàn vẹn.
- Vận hành lượt chạy nền an toàn qua hàng đợi, kể cả khi hủy, chạy lại, thao tác đồng thời hoặc service lỗi.
- Sinh đúng Google Sheet, share và gửi email cho đúng người khởi chạy.
- Không làm thay đổi dữ liệu Product Item, luồng Product Management, Report Sync, Auto-Labeling và Export Data hiện hữu.

### 1.2 Luồng kỹ thuật cần kiểm chứng

`eca-tool` gọi `social-listening-api` → API validate và chạy guard → ghi `eca_reports.label_validation_requests` + `monitoring_app_new.trackers` → publish RabbitMQ `ecomheat.label_validation` → worker `services/label-validation` đọc MySQL và quét Solr `product_items` theo cursor → áp Rule D/M → sinh Google Sheet nếu có vi phạm → cập nhật trạng thái → share file và gửi email.

UI không polling/realtime. User bấm `Refresh` để nạp trạng thái mới.

### 1.3 Test oracle cốt lõi

| Nhóm | Oracle |
|---|---|
| Phạm vi PI | `industry_id` đã chọn AND `latest_sold > 0`; không lọc `manual_updated`; `Labels`/`Brand`/`Model` là điều kiện thu hẹp tùy chọn |
| Gom nhóm | `label_name` STARTS WITH prefix, phân biệt hoa/thường, loại label `DELETED` |
| Rule D | Mỗi PI × prefix có `COUNT ≥ 2` sinh một dòng `Duplicate` |
| Rule M | Với bộ 2–20 prefix, PI tham gia ít nhất một nhóm thì mỗi nhóm có `COUNT = 0` sinh một dòng `Missing`; PI không tham gia nhóm nào bị bỏ qua |
| Kết quả | Một vi phạm = một dòng; bật cả hai rule thì dùng cùng tập PI và cùng bộ prefix |
| Trạng thái nghiệp vụ | `Active` → `Processing` → `Completed` hoặc `Failed`; không có trạng thái thứ năm |
| Progress | `Completed = 100%`; các trạng thái còn lại = `0%` |
| Data freshness | Snapshot dữ liệu tại lúc lượt chạy bắt đầu; chạy lại quét toàn bộ phạm vi |

---

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1 In-Scope

| Khu vực | Phạm vi kiểm thử |
|---|---|
| RBAC | Ba quyền mới trong nhóm `Label Validation`; ẩn tab khi thiếu quyền xem; disable thao tác khi thiếu quyền tạo/xóa; server-side enforcement khi gọi API trực tiếp; gỡ quyền giữa phiên |
| Danh sách request | 8 cột, empty/no-match state, default sort, single-column sort, tie-break ID, search, 5 filter, badge, server-side account option, phân trang, footer count, `Refresh` |
| Validation Setup | Create/Edit/Copy; 7 field; required, trần 120/20/100; cascade Industry → Brand → Model; Labels độc lập; inline error và auto-scroll |
| Prefix input | Gõ/chốt chip; trim; case-sensitive; bỏ trùng; dán nguyên cụm thành một chip; trần 20; xóa chip; thay đổi prefix xóa Preview cũ |
| Preview | Đếm label theo prefix; loại `DELETED`; 0 label; warning đúng 1 label với Rule D; tooltip; lỗi label service |
| Guard toàn vẹn | Bốn điều kiện BR-21 tại mọi điểm xếp lượt; cách ưu tiên message; trạng thái không đổi khi bị chặn |
| Rule engine | Rule D, Rule M, bật đồng thời; prefix giao nhau; label `DELETED`; `latest_sold = 0`; dữ liệu do Auto-Labeling gắn |
| Lifecycle | Create/Start/Edit/Copy/Cancel/Delete; version; Updated By/Date; khóa thao tác theo trạng thái; concurrent start/edit/cancel |
| Bulk | Tick cộng dồn qua trang/sort; reset tick đúng trigger; `Select All`; Start/Delete không giới hạn số dòng; confirm luôn mở; đóng băng tập đủ điều kiện; chỉ loại bớt lúc execute |
| Queue/worker | Tracker per-run, payload `{id, tracker_id}`, cursor self-chaining, queue saturation, cooperative cancel, worker/service failure, timeout |
| File | 4 cột đúng thứ tự/nội dung; 0 PI/0 vi phạm; tách trên 50.000 dòng; tên và `file_sequence`; file lượt cũ; soft delete không xóa Drive |
| Email | 4 biến thể tiếng Anh; sender; người nhận; thời điểm; N lượt bulk = N email; không email khi cancel; lỗi mail không đổi status |
| Migration | DDL 18 cột, 6 index, enum/status/version/file_sequence; 8 permission catalogue; migrate/rollback; deploy order |
| Regression | Hai tab Label Management cũ, User & Permission, Export Data, email export, Product Management, Report Sync, Auto-Labeling |
| NFR | Thời gian quét, sinh file, email, UI/API/bulk, danh sách, concurrency và data freshness theo FRD S4 |

### 2.2 Out-of-Scope

- 03-F02 Label Group và toàn bộ nội dung Phase 1 trong brainstorm.
- Lịch chạy tự động/định kỳ.
- Lịch sử nhiều lượt chạy trên UI.
- Hủy hàng loạt request `Active`.
- Gate tự động tại Report Sync hoặc hệ thống tự sửa label.
- Product Line filter, chống trùng `Validate Name`, progress trung gian, push/realtime notification.
- Security penetration test và browser/device matrix rộng. Chỉ kiểm authorization/RBAC và browser được release support xác nhận.
- Load test vượt các cỡ dữ liệu và concurrency đã nêu trong FRD, trừ khi Infra yêu cầu capacity test riêng.

### 2.3 Release boundary

Đợt này chỉ ship 03-F01 Prefix Scanner. Release không đạt nếu thiếu một trong các khối P0: permission, UI/API quản lý request, guard, worker Rule D/M, queue/cancel, Google Sheet hoặc email kết quả.

---

## 3. CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)

### 3.1 Loại test áp dụng

| Loại test | Mục tiêu | Evidence tối thiểu |
|---|---|---|
| Functional UI | Form, list, state, message, menu, bulk và RBAC | Screenshot/video + request ID |
| API/Integration | Validate contract, permission, appCode, guard, transaction/race, soft delete | Request/response đã che token + DB before/after |
| Data validation | Đối chiếu MySQL/Solr input với dòng output | Query/result snapshot + file Sheet |
| Async/Reliability | Queue, tracker, cancel, retry/recovery, worker/ingestor/mail/Drive failure | Tracker timeline + worker/queue/job log |
| Migration | Schema, permission catalogue, idempotency, rollback | Output migration + 6 verification SQL |
| Performance | Đo P50/P95 và timeout theo FRD S4 | k6/report timing + log mốc bắt đầu/kết thúc |
| Regression | Các dependency dùng chung không bị ảnh hưởng | Test result theo smoke suite hiện hữu |

Không lập compatibility/security suite riêng khi chưa có release matrix hoặc security requirement tương ứng.

### 3.2 Ma trận rule chính

| Rule | Dữ liệu PI | Expected |
|---|---|---|
| D | 0 hoặc 1 label hợp lệ trong prefix | Không có dòng `Duplicate` |
| D | 2+ label hợp lệ trong một prefix | Một dòng `Duplicate` cho PI × prefix |
| D | Trùng ở hai prefix | Hai dòng `Duplicate` |
| M | PI không có label thuộc bất kỳ prefix nào | Không có dòng `Missing` |
| M | PI có label ở một phần bộ 2–20 prefix | Một dòng `Missing` cho mỗi nhóm còn thiếu |
| M | PI có đủ mọi nhóm | Không có dòng `Missing` |
| D + M | Cùng PI vi phạm cả hai rule | Các dòng riêng trong cùng kết quả/file |
| D/M | Label thuộc prefix nhưng `DELETED` | Loại khỏi phép đếm |
| D/M | Prefix nằm giữa tên hoặc sai casing | Không thuộc nhóm |
| D/M | Hai prefix lồng nhau | Vẫn chạy; label chung được tính trong từng nhóm tương ứng; không cảnh báo |

### 3.3 Boundary cần phủ

| Đối tượng | Giá trị biên |
|---|---|
| Validate Name | rỗng sau trim; 1; 120; 121 ký tự qua Copy/API |
| Labels | 0; 1; 19; 20; 21 qua API |
| Brand / Model | 0; 1; 99; 100; 101 qua API |
| Prefix | 0; 1; 2; 19; 20; 21; Rule M với 1 và 2 prefix |
| PI | `latest_sold = 0`; `latest_sold > 0`; có/không `manual_updated` |
| Kết quả file | 0 PI; ≥1 PI nhưng 0 vi phạm; 1; 9.999; 10.000; 50.000; 50.001; 62.480 dòng |
| Danh sách | 0; 1; 20; 21; 50; 100; ≥500 request |
| Bulk | 1; 10; 100; 250; 500 và toàn bộ tập đang lọc |
| Concurrency | 11 và 22 lượt đồng thời; vượt trần worker được cấu hình |
| Timeout | Trước, đúng và sau 900 giây pha quét; trước, đúng và sau 15 phút pha file |

### 3.4 State transition và race condition

- Xác minh chỉ có bốn trạng thái nghiệp vụ và map đúng với tracker kỹ thuật.
- `Start` chỉ tạo tracker/lượt mới, không tăng `version`; submit Create/Edit tăng `version` kể cả không đổi field.
- `Cancel run` chỉ thành công khi request vẫn `Active`; conditional update thua race với worker phải trả `LV_CANCEL_TOO_LATE`.
- Hủy lượt cũ rồi chạy lượt mới: message cũ phải bị bỏ theo `tracker_id`; không tạo scan/file/email trùng.
- Hai member cùng Edit: last-write-wins khi cả hai submit lúc request còn sửa được.
- Edit đang mở nhưng người khác Start: submit bị từ chối, draft giữ nguyên.
- Bulk confirm: tập đủ điều kiện chốt lúc modal mở; lúc execute chỉ được loại bớt, không thêm request vừa đổi sang đủ điều kiện.
- Delete bulk: request `Processing` được hứa giữ nguyên không bị xóa nếu chuyển `Completed` trước lúc bấm OK.

### 3.5 Test data tối thiểu

| Dataset | Yêu cầu |
|---|---|
| Industry A | Có PI `latest_sold > 0`, PI `latest_sold = 0`, PI có và không có `manual_updated` |
| Prefix groups | Ít nhất 3 prefix hợp lệ; 1 prefix khớp đúng 1 label; 1 prefix khớp 0; 2 prefix lồng nhau; biến thể sai casing |
| PI rule set | PI sạch; Duplicate một nhóm; Duplicate hai nhóm; Missing một nhóm; Missing nhiều nhóm; vi phạm đồng thời D+M; PI không tham gia nhóm nào |
| Deleted masters | Industry bị xóa; toàn bộ Brand/Model được cấu hình bị xóa; một phần Brand/Model bị xóa; một trong nhiều Labels bị xóa |
| Accounts | Không quyền; chỉ view; view+create; view+delete; đủ ba quyền; hai account dùng cho concurrency |
| Requests | Đủ bốn trạng thái; chưa từng kết thúc; có lượt cũ cùng version; có lượt cũ khác version; có file cũ |
| Scale | ≥500 request; ~50.000 PI; output 62.480 dòng; tập bulk 10/100/250/500 |

Test data phải tách namespace/staging và có phương án dọn sau test. Không dùng production data chưa được ẩn thông tin.

### 3.6 Điểm quan sát và đối soát

- UI/API: HTTP status, `appCode`, payload, timestamp và request ID.
- MySQL `eca_reports.label_validation_requests`: `status`, `version`, `file_sequence`, `report_link`, `report_reason`, audit fields, `deleted_at`.
- MySQL `monitoring_app_new.trackers`: `tracker_type`, `source_id`, `status`, `filters`, `metadata.version`, cursor/count và audit fields.
- RabbitMQ: routing key, queue depth, payload `id/tracker_id/cursorMark`, số message self-chaining.
- Solr: tập PI đầu vào và field trả về; xác nhận feature chỉ đọc.
- Google Drive/Sheet: owner/share, số file, tên file, số dòng và 4 cột.
- Mail log/inbox: sender, recipient, subject, body, delivery latency và failure log.

### 3.7 Traceability mức test suite

| Suite | Requirement chính |
|---|---|
| TP-RBAC | BR-08 → BR-10; US-01 |
| TP-LIST | BR-06, BR-07, BR-39 → BR-46; US-02 |
| TP-SETUP | BR-01 → BR-05, BR-14 → BR-16; US-03/US-04 |
| TP-PREVIEW-GUARD | BR-20 → BR-22; EC-12/EC-15; US-05/US-06 |
| TP-RULE | BR-11 → BR-19; US-07 |
| TP-RUN | BR-23 → BR-31; EC-08 → EC-21; US-06/US-09 |
| TP-OUTPUT | BR-32 → BR-38; EC-05/EC-09 → EC-11; US-08 |
| TP-BULK | BR-45 → BR-51; US-10 |
| TP-MIGRATION | Technical migration §4–§8 |
| TP-NFR | FRD S4.1 và S4.2 |
| TP-REG | FRD S8 Impact Analysis |

---

## 4. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

### 4.1 Môi trường và component

| Thành phần | Yêu cầu |
|---|---|
| Environment | EcomHeat staging có topology tương đương release; URL/build `[TBD - cần DevOps xác nhận]` |
| Frontend | Build `eca-tool` chứa tab Label Validation và i18n EN/VN |
| API | `social-listening-api` với 9 endpoint `eca/label-validation-requests*` |
| Worker | `@ynm/label-validation-service`, queue/deployment riêng |
| Database | MySQL `eca_reports` và `monitoring_app_new`; quyền read-only cho QA hoặc query evidence do Dev cung cấp |
| Solr | Core `product_items` có dataset kiểm soát được |
| RabbitMQ | Exchange `ynm-eca`, routing key/queue `ecomheat.label_validation`; có quan sát queue depth/message |
| Ingestor | `services/ingestor` sẵn sàng cho self-chaining hoặc phương án kỹ thuật thay thế đã chốt |
| Google | Tài khoản/thư mục dùng chung Export Data; quota đủ cho test scale; QA có quyền mở file được share |
| Email | Sender `no-reply@youneteci.com`; inbox test và quyền xem log gửi |
| Timezone | GMT+7 cho UI, filter ngày và timestamp evidence |

### 4.2 Browser và ngôn ngữ

- Browser chính: `[TBD - cần QA Lead xác nhận theo release support matrix]`.
- Chạy smoke trên UI EN và VN cho message động; email luôn kiểm bằng tiếng Anh.
- Không mở rộng device/browser matrix khi chưa có requirement hỗ trợ tương ứng.

### 4.3 Công cụ

- API client hoặc automated integration test cho endpoint/appCode.
- SQL client read-only và Solr query tool để dựng/đối soát oracle.
- k6 cho NFR API/list/bulk/concurrency.
- Queue dashboard/log aggregation, Drive/Sheets và mail log.
- Screen recording cho race/bulk state transition khó tái hiện bằng screenshot đơn.

---

## 5. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 5.1 Entry Criteria

Chỉ bắt đầu test execution chính thức khi đạt tất cả điều kiện sau:

- PRD-03 và FRD 03-F01 v3.0 được baseline cho release; change sau baseline có impact assessment.
- Build của W1–W6 đã deploy; migration chạy trước runtime; 6 verification SQL của `sl-api-migrates.md` đều pass.
- Unit/integration test của `social-listening-api` pass; worker build/lint và smoke thủ công pass vì repo worker chưa có test suite tự động.
- Ba permission có thể cấp qua `User & Permission`; account test theo ma trận quyền đã sẵn sàng.
- Dataset chức năng, scale, deleted-master và concurrency tại mục 3.5 đã sẵn sàng.
- QA truy cập được API log, tracker/job log, queue metric, Google Sheet và mail log.
- Dev/Infra chốt `prefetchCount` test và cơ chế timeout/recovery khi worker hoặc ingestor chết.
- Các mâu thuẫn/blocker dưới đây đã có quyết định ghi vào source-of-truth hoặc release note:

| ID | Need Confirm / conflict | Tác động | Owner |
|---|---|---|---|
| NC-01 | FRD v3.0 bỏ trần bulk; `architecture.md`, `eca-tool.md` và `social-listening-api.md` còn giới hạn 20 ID | Chặn contract/API và test bulk >20. Expected theo FRD: không giới hạn số dòng, test ít nhất 10/100/250/500 | BA + FE + API |
| NC-02 | `eca-tool.md` còn mô tả tick bị xóa khi đổi trang/sort, trái BR-46; FRD yêu cầu giữ tick qua trang và sort | Chặn expected bulk selection | FE + BA |
| NC-03 | Technical docs còn dùng tracker `QUEUED` ở một số chỗ, trong khi schema chỉ có `INITIALIZING/PROCESSING/DONE/FAILED` | Có thể lỗi insert hoặc worker không nhận lượt | API + Worker |
| NC-04 | Data model `label_validation_requests.md` mô tả transition khác FRD, gồm cancel ở `Processing` và các bước `ACTIVE/PROCESSING` sai trigger | Chặn test state/Cancel nếu implementation bám model cũ | API + Worker + BA |
| NC-05 | Endpoint nạp toàn bộ option `Created By`/`Updated By` cho server-side search vẫn Open (`social-listening-api.md` F-04) | Không execute đầy đủ BR-06/US-02-AC-16 | FE + API |
| NC-06 | Cơ chế ack/requeue/DLQ, self-chaining khi `services/ingestor` lỗi, và watchdog cho worker chết vẫn Open | Chặn reliability/recovery và nguy cơ request treo | Dev + Infra |
| NC-07 | Trần concurrency thật/prefetchCount chưa chốt | Chặn kết luận capacity ở 11/22 lượt | Dev Lead + Infra |
| NC-08 | `Refresh` khi popup `Details` đang mở có cập nhật nội dung popup hay không vẫn Open | Expected UI chưa xác định | BA |
| NC-09 | Technical spec dùng `report.failedTooLong`, trong khi FRD S5 dùng `report.failed` cho cả timeout quét/file | Có thể lệch message/email và contract DB | BA + Dev |
| NC-10 | Route UI còn ghi `[TBD - Dev chốt]` | Cần chốt để test navigation/deep link và permission route guard | FE |

### 5.2 Exit Criteria

- 100% test case P0 đã execute; không còn test `Blocked` do môi trường hoặc requirement chưa chốt.
- 100% BR-01 → BR-51 và 12 EC hiện hành có ít nhất một test case traceable; các AC critical có evidence.
- Không còn defect Critical/High mở.
- Defect Medium còn mở chỉ được chấp nhận khi BA, Dev Lead và QA Lead cùng sign-off, có workaround và không ảnh hưởng tính đúng của file QC, permission, dữ liệu hoặc lifecycle.
- Rule D/M, guard 4 điều kiện, cancel race, bulk snapshot, file split/share và email recipient đều pass.
- Data integrity pass: feature không thay đổi Product Item/Label/master data; `report_link` và `report_reason` loại trừ nhau; file cũ không bị xóa ngoài ý muốn.
- Migration forward pass; rollback được diễn tập trên staging hoặc có quyết định giữ schema khi rollback app theo technical plan.
- Regression smoke của Label Management, User & Permission, Export Data, email export, Product Management, Report Sync và Auto-Labeling pass.
- NFR có báo cáo P50/P95/timeout cho toàn bộ mốc FRD S4. Mọi mốc chưa đạt có defect hoặc waiver được sign-off trước release.
- Test Summary Report được QA Lead, BA và Dev Lead xác nhận.

---

## 6. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

| ID | Rủi ro | Mức | Dấu hiệu phát hiện | Hướng xử lý / Owner |
|---|---|---|---|---|
| R-01 | Technical docs cũ khiến Dev triển khai trần bulk 20 hoặc vòng đời cũ | Cao | API trả `LV_BULK_TOO_MANY`; tick bị xóa qua trang; xuất hiện `QUEUED` | Đóng NC-01→NC-04 trước SIT; BA/API/FE/Worker |
| R-02 | Prefix sai/case-sensitive hoặc label đổi tên làm file báo sạch giả | Cao | Preview count lệch; guard chỉ bắt prefix về 0, không bắt thiếu một phần | Dataset prefix biến thể; khuyến nghị Preview khi tạo mới; QA + BA |
| R-03 | Cancel rồi chạy lại tạo message/file/email trùng | Cao | Hai tracker chạy cho cùng request/version; hai file/email | Kiểm theo `tracker_id`, conditional update, race test lặp; API + Worker |
| R-04 | Worker/ingestor chết giữa self-chaining làm request treo `Processing` | Cao | Cursor không tiến, queue rỗng nhưng request chưa kết thúc | Chốt watchdog/retry/DLQ ở NC-06; Infra alert; Worker + Infra |
| R-05 | Google quota/permission hoặc mail lỗi làm mất bàn giao kết quả | Cao | `Failed`, file không share, email không tới | Fault injection; kiểm retry/log; file lỗi không share; mail lỗi không đổi status; Dev + Infra |
| R-06 | Trần concurrency không phù hợp gây quá tải Solr hoặc hàng đợi kéo dài | Cao | P95 tăng, Solr error, queue depth không giảm | Benchmark 11/22 VU, tune `prefetchCount`, theo dõi Solr/queue; Dev Lead + Infra |
| R-07 | Bulk snapshot sai làm xóa/chạy request ngoài cam kết modal | Cao | Toast > số confirm; request vừa đổi trạng thái bị thêm vào tập | Race test hai chiều BR-49; DB before/after; API + QA |
| R-08 | `file_sequence` tăng không atomic tạo tên file trùng | Trung bình | Hai file cùng hậu tố trong concurrent/retry | Atomic DB update và test parallel/retry; Worker |
| R-09 | Option người tạo/cập nhật suy từ trang hiện tại làm lọc thiếu account | Trung bình | Dropdown chỉ có account đang hiển thị | Chốt endpoint NC-05; test ≥11 account qua nhiều trang; FE + API |
| R-10 | Load test tạo nhiều file/email hoặc dữ liệu rác | Trung bình | Drive/quota/inbox bị đầy | Namespace riêng, quota monitor, kế hoạch cleanup và giới hạn recipient test; QA + Infra |

---

## 7. TÀI LIỆU BÀN GIAO (Deliverables)

| Artifact | Nội dung |
|---|---|
| Test Plan | File hiện tại |
| Test Cases | Bộ test case chi tiết theo suite TP-RBAC → TP-REG, trace BR/EC/AC |
| Test Data Pack | Script/query hoặc hướng dẫn dựng dữ liệu; danh sách request/account/prefix/PI dùng test |
| API Collection | 9 endpoint, positive/negative/permission/race scenarios; không chứa secret |
| Performance Report | P50/P95, throughput, error rate, queue/Solr metric và cấu hình `prefetchCount` |
| Migration Evidence | Output migrate, 6 verification SQL, rollback rehearsal/decision |
| Bug Reports | Jira bug có severity, environment/build, steps, evidence, request/tracker ID và log correlation |
| Test Evidence | Screenshot/video, response, DB/queue/job log, Google Sheet và mail log đã che dữ liệu nhạy cảm |
| Test Summary / Sign-off | Scope đã chạy, pass/fail/blocked, defect còn mở, NFR result, residual risk và quyết định release |

---

## Phụ lục A — Checklist release nhanh

- [ ] Permission catalogue đủ 8 dòng và không tự gán role.
- [ ] Không có trạng thái nghiệp vụ hoặc tracker ngoài enum đã chốt.
- [ ] Không còn giới hạn 20 request ở thao tác bulk theo FRD v3.0.
- [ ] Guard đủ bốn điều kiện và chạy ở mọi điểm xếp lượt.
- [ ] Bulk confirm đóng băng tập và toast không vượt số đã hứa.
- [ ] Output 0 PI khác output dữ liệu sạch.
- [ ] File trên 50.000 dòng được tách; `file_sequence` liên tục và atomic.
- [ ] Người nhận file/email là người khởi chạy, không mặc định là người tạo.
- [ ] Cancel/Delete lượt `Active` không gửi email.
- [ ] Mail lỗi không đổi trạng thái; file dở dang không được share.
- [ ] Hai đồng hồ 900 giây và 15 phút chạy độc lập.
- [ ] Product Item và các luồng hiện hữu không bị ghi thay đổi.

## Phụ lục B — Quality gate của test plan

| Hạng mục | Kết quả |
|---|---|
| Đủ đúng 7 phần bắt buộc | PASS |
| Scope/strategy/environment/criteria/risk/deliverable liên kết | PASS |
| Rule, boundary, failure path và concurrency chính có approach | PASS |
| Exact value có nguồn hoặc Need Confirm | PASS |
| Release boundary và upstream/downstream rõ | PASS |
| Không tuyên bố bao phủ 100% khi chưa có traceability test case | PASS |
| Markdown render được, không còn placeholder từ template mẫu | PASS |
