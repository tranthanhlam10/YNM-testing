# TEST PLAN
## YNMPDP-6024 - Refactor Token Management: Migrate `monitor_fb_token` to Unified `tokens` Table

| Field | Value |
|---|---|
| Mã tài liệu | TP-YNMPDP-6024-v1.0 |
| Dự án | YNMP - Data Platform |
| Feature | Refactor Token Management |
| Priority | Major(P3) |
| Jira | https://jira.younetco.com/browse/YNMPDP-6024 |
| Ngày tạo | 23/06/2026 |
| Người tạo | QA Team (AI-assisted) |
| Phiên bản | 1.0 |
| Trạng thái | Draft - Pending Review |
| Tài liệu tham chiếu | Jira YNMPDP-6024 |

---

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1 Bối cảnh

Service `fbapi-sample` hiện đang quản lý và lấy token dựa trên table `monitor_fb_token`. Cách này gây ra vấn đề không đồng bộ với cơ chế quản lý token chung và chưa tận dụng được service phân phối token.

Task `YNMPDP-6024` yêu cầu refactor để service chuyển sang sử dụng table `tokens` thống nhất.

### 1.2 Giải pháp

| Nhóm thay đổi | Mô tả |
|---|---|
| Migrate token data | Migrate dữ liệu từ table `monitor_fb_token` sang table `tokens`. |
| Loại bỏ field không dùng | Không còn sử dụng các field `token_type`, `user_type`, `app_id`, `user_id`, `user_fullname`, `user_email`, `user_password`, `birthday`, `proxy_location`, `service_start`, `note`. |
| Mapping field tương đương | `access_token -> token`, `status -> status`, `error_code -> error_code`, `error_message -> error_message`, `cookie -> cookie`, `blocked_date -> blockedAt`. |
| Đổi logic query token | Logic cũ query theo `token_type`, `user_type`, `status`, `blocked_date`. Logic mới query theo `crawler_type`, `country`, `status`, `blockedAt`. |
| Proxy location | Luôn lấy proxy với location là `VN`. |
| Deployment testing | Deployment testing dùng `CRAWLER_TYPE=FB_GRAPHQL_API` và `COUNTRY=VN`. |

### 1.3 Mục tiêu kiểm thử

- Kiểm tra dữ liệu token được migrate đúng từ `monitor_fb_token` sang `tokens`.
- Kiểm tra service `fbapi-sample` lấy token từ table `tokens`, không còn phụ thuộc logic query cũ từ `monitor_fb_token`.
- Kiểm tra logic query mới lấy đúng token theo `crawler_type`, `country`, `status`, `blockedAt`.
- Kiểm tra token bị block hoặc không hợp lệ không được cấp phát sai.
- Kiểm tra proxy luôn được lấy theo location `VN`.
- Kiểm tra flow dùng token vẫn hoạt động bình thường sau refactor, đặc biệt với `CRAWLER_TYPE=FB_GRAPHQL_API` và `COUNTRY=VN`.
- Kiểm tra backward compatibility ở mức behavior: kết quả crawl/API chính không bị regression do đổi nguồn token.

### 1.4 Assumptions & Need Confirm

| ID | Giả định / Điểm cần xác nhận | Trạng thái | Ảnh hưởng QA |
|---|---|---|---|
| AS-01 | Table `tokens` đã có schema đầy đủ để thay thế `monitor_fb_token`, bao gồm `token`, `status`, `error_code`, `error_message`, `cookie`, `blockedAt`, `crawler_type`, `country`. | Need Confirm | Ảnh hưởng khả năng verify data migration và query token mới. |
| AS-02 | Giá trị `crawler_type` cần dùng cho task này là `FB_GRAPHQL_API`. | Từ Jira comment | Ảnh hưởng test data token và env deployment. |
| AS-03 | Giá trị `country` cần dùng là `VN`. | Từ Jira comment | Ảnh hưởng expected result khi query token và proxy. |
| AS-04 | `token_type` và `user_type` không còn dùng vì khi add token sẽ luôn để default. | Từ Jira description | QA không dùng 2 field này làm điều kiện expected trong logic mới. |
| AS-05 | `blocked_date` cũ tương đương với `blockedAt` mới. Rule token bị block dựa trên `blockedAt` cần Dev confirm chi tiết: null/expired/future date được hiểu như thế nào. | Need Confirm | Ảnh hưởng case token blocked/unblocked. |
| AS-06 | Proxy location cũ `proxy_location` không còn dùng trong token; service sẽ luôn lấy proxy VN. | Từ Jira description | Ảnh hưởng case token có/không có thông tin proxy. |
| AS-07 | Các field bị loại bỏ đã được confirm không dùng trong code. | Từ Jira description | QA cần regression để chắc không còn module nào fail vì thiếu field. |

---

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1 In-Scope

#### Module 1 - Data Migration từ `monitor_fb_token` sang `tokens`

| STT | Hạng mục | Nội dung kiểm thử |
|---|---|---|
| 1 | Mapping access token | `monitor_fb_token.access_token` được migrate sang `tokens.token` đúng giá trị. |
| 2 | Mapping status | `status` được migrate đúng, không bị đổi ý nghĩa trạng thái. |
| 3 | Mapping error fields | `error_code`, `error_message` được migrate đúng để giữ thông tin lỗi token. |
| 4 | Mapping cookie | `cookie` được migrate đúng, không bị mất hoặc sai format. |
| 5 | Mapping blocked date | `blocked_date` được migrate sang `blockedAt` đúng giá trị. |
| 6 | Field bị loại bỏ | Các field không còn dùng không được service mới phụ thuộc trong runtime. |
| 7 | Data count/checksum | Số lượng token hợp lệ sau migrate khớp với nguồn dữ liệu kỳ vọng. |

#### Module 2 - Logic Query Token mới

| STT | Hạng mục | Nội dung kiểm thử |
|---|---|---|
| 1 | Query theo `crawler_type` | Service chỉ lấy token đúng `crawler_type=FB_GRAPHQL_API`. |
| 2 | Query theo `country` | Service chỉ lấy token đúng `country=VN`. |
| 3 | Query theo `status` | Chỉ token có status hợp lệ mới được cấp phát. |
| 4 | Query theo `blockedAt` | Token đang bị block không được lấy; token không bị block được lấy đúng. |
| 5 | Không dùng logic cũ | Service không còn filter theo `token_type` và `user_type`. |
| 6 | Không có token phù hợp | Service trả lỗi/empty/fallback đúng thiết kế, không lấy nhầm token khác crawler/country. |
| 7 | Nhiều token phù hợp | Service phân phối/lấy token ổn định, không trả token bị block hoặc sai country. |

#### Module 3 - Proxy VN

| STT | Hạng mục | Nội dung kiểm thử |
|---|---|---|
| 1 | Proxy location VN | Khi service lấy proxy, proxy được chọn theo location `VN`. |
| 2 | Không phụ thuộc `proxy_location` cũ | Token không cần field `proxy_location` vẫn chạy đúng. |
| 3 | Proxy VN unavailable | Khi không có proxy VN khả dụng, service xử lý lỗi/retry đúng thiết kế. |
| 4 | Token + proxy pairing | Token hợp lệ kết hợp proxy VN và gọi API thành công. |

#### Module 4 - Runtime/Regression cho `fbapi-sample`

| STT | Hạng mục | Nội dung kiểm thử |
|---|---|---|
| 1 | Service startup | Deployment với `CRAWLER_TYPE=FB_GRAPHQL_API`, `COUNTRY=VN` start thành công. |
| 2 | Lấy token runtime | Log/runtime chứng minh service lấy token từ `tokens`. |
| 3 | API/crawl happy path | Flow chính dùng token gọi API thành công như trước refactor. |
| 4 | Token invalid/expired | Khi API trả lỗi token, service cập nhật trạng thái/error/blockedAt đúng thiết kế. |
| 5 | Retry/failover token | Nếu một token lỗi, service không kẹt vô hạn và có behavior retry/fallback đúng. |
| 6 | Không regression output | Response/output chính của service không đổi ngoài phần quản lý token. |

### 2.2 Out-of-Scope

| Hạng mục | Lý do |
|---|---|
| Thay đổi nghiệp vụ crawler ngoài token/proxy | Jira chỉ yêu cầu refactor token management. |
| Thay đổi schema business data ngoài table token | Không thuộc phạm vi task. |
| Kiểm thử toàn bộ các crawler_type khác `FB_GRAPHQL_API` | Task/comment testing chỉ nêu `FB_GRAPHQL_API`. Có thể smoke nếu Dev yêu cầu thêm. |
| Kiểm thử country khác `VN` | Jira yêu cầu luôn lấy proxy VN và deployment testing dùng `COUNTRY=VN`. |
| Security audit toàn diện cho token/cookie | QA chỉ kiểm tra masking/logging cơ bản nếu có log token. Security audit cần plan riêng. |

---

## 3. CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)

### 3.1 Functional Testing

| Nhóm test | Kỹ thuật áp dụng | Nội dung |
|---|---|---|
| Data migration | Source-target mapping | So sánh từng field mapping giữa `monitor_fb_token` và `tokens`. |
| Token query | Decision table | Test tổ hợp `crawler_type`, `country`, `status`, `blockedAt` để xác định token nào được/không được lấy. |
| Removed fields | Regression testing | Tạo token không có/không dùng các field cũ và kiểm tra service vẫn chạy. |
| Blocked token | Boundary/negative testing | Test `blockedAt` null, có giá trị, future/past theo rule Dev confirm. |
| Proxy VN | Integration testing | Kiểm tra proxy được lấy theo VN trong runtime. |
| Runtime behavior | End-to-end testing | Start deployment, lấy token, lấy proxy, gọi API/crawl và verify output chính. |

### 3.2 Decision Table - Logic Query Token

| Case | `crawler_type` | `country` | `status` | `blockedAt` | Expected |
|---|---|---|---|---|---|
| DT-01 | `FB_GRAPHQL_API` | `VN` | Hợp lệ | Không bị block | Token được lấy. |
| DT-02 | Sai crawler_type | `VN` | Hợp lệ | Không bị block | Token không được lấy. |
| DT-03 | `FB_GRAPHQL_API` | Sai country | Hợp lệ | Không bị block | Token không được lấy. |
| DT-04 | `FB_GRAPHQL_API` | `VN` | Không hợp lệ | Không bị block | Token không được lấy. |
| DT-05 | `FB_GRAPHQL_API` | `VN` | Hợp lệ | Đang bị block | Token không được lấy. |
| DT-06 | `FB_GRAPHQL_API` | `VN` | Hợp lệ | Block đã hết hạn nếu system support expiry | Expected cần Dev confirm. |
| DT-07 | Có `token_type/user_type` khác default nhưng crawler/country/status/block hợp lệ | `VN` | Hợp lệ | Không bị block | Token vẫn được lấy nếu logic mới không dùng `token_type/user_type`. |

### 3.3 API/Integration Testing

| Điểm tích hợp | Cách kiểm thử | Bằng chứng cần thu thập |
|---|---|---|
| Table `tokens` | Query DB để kiểm tra token migrated và field mapping đúng. | SQL result trước/sau migrate hoặc sample data đối chiếu. |
| Service token query | Bật service và kiểm tra log/query runtime. | Log có `crawler_type`, `country`; không log raw token/cookie. |
| Proxy manager/service | Kiểm tra proxy được lấy location VN. | Log proxy location hoặc response metadata. |
| API downstream | Gọi/crawl bằng token mới. | Response thành công, log request, không lỗi auth/token. |
| Token error update | Dùng token lỗi/expired nếu có data an toàn. | Token status/error/blockedAt update đúng. |

### 3.4 Data Migration/Data Sync

| Hạng mục | Cách kiểm tra |
|---|---|
| Pre-migration backup | Confirm có backup/snapshot hoặc rollback plan trước migrate. |
| Field mapping | Lấy sample token từ `monitor_fb_token`, đối chiếu bản ghi tương ứng ở `tokens`. |
| Count reconciliation | So sánh tổng số token migrate thành công, số token skipped nếu có. |
| Duplicate token | Kiểm tra không tạo duplicate token gây cấp phát trùng bất thường. |
| Null/empty data | Token/cookie/error/blocked date null được migrate đúng rule. |
| Post-migration runtime | Service chỉ đọc table mới sau migrate. |

### 3.5 Non-functional Testing

| NFR | Tiêu chí đánh giá | Cách kiểm tra |
|---|---|---|
| Stability | Service chạy ổn định sau refactor, không crash khi lấy token/proxy. | Monitor pod restart, error log trong test window. |
| Performance | Thời gian lấy token không tăng bất thường so với trước refactor. | So sánh log timing/query timing nếu có. |
| Reliability | Không lấy token sai khi có nhiều token khác crawler/country/status. | Test data nhiều token lẫn nhau. |
| Security/Logging | Không log raw token/cookie/password-like data. | Review log runtime khi service lấy token/call API. |
| Observability | Có log đủ để trace token selection theo metadata mà không lộ secret. | Kiểm tra structured logs/APM. |

### 3.6 Regression Testing

| Nhóm | Nội dung |
|---|---|
| Existing `fbapi-sample` flow | Flow chính vẫn gọi API/crawl thành công. |
| Token status handling | Token lỗi vẫn được cập nhật trạng thái/error như trước hoặc theo design mới. |
| Error handling | Không có token/proxy không làm service crash im lặng. |
| Deployment env | Env `CRAWLER_TYPE` và `COUNTRY` được đọc đúng. |
| Data compatibility | Các field cũ bị loại bỏ không làm code runtime lỗi undefined/null. |

---

## 4. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

### 4.1 Môi trường

| Môi trường | Mục đích | Ghi chú |
|---|---|---|
| Testing | Test migration/query/runtime chính theo deployment Jira. | Deployment: `fbgraph-auto-deploy-ynmpdp-6024-testing`. |
| Staging | Regression và smoke trước release nếu có deploy staging. | Cần xác nhận deployment thực tế từ Dev. |
| Production | Post-release monitoring. | Không test phá dữ liệu trực tiếp. |

### 4.2 Hạ tầng & Dependency

| Component | Yêu cầu |
|---|---|
| `fbapi-sample` service | Build đã refactor sang table `tokens`. |
| Database | Có quyền kiểm tra `monitor_fb_token` và `tokens` hoặc có bằng chứng migration từ Dev. |
| Token distribution service | Có thể phân phối token theo `crawler_type`, `country`, `status`, `blockedAt`. |
| Proxy service | Có proxy location `VN` khả dụng. |
| Deployment config | `CRAWLER_TYPE=FB_GRAPHQL_API`, `COUNTRY=VN`. |
| Logs/APM | QA có quyền xem log service, token query metadata, proxy selection, API error. |

### 4.3 Test Data tối thiểu cần chuẩn bị

| Nhóm data | Mục đích |
|---|---|
| Token hợp lệ `FB_GRAPHQL_API/VN` | Happy path: token được lấy và gọi API thành công. |
| Token sai crawler_type | Đảm bảo không bị lấy nhầm. |
| Token sai country | Đảm bảo không bị lấy nhầm country khác VN. |
| Token status không hợp lệ | Đảm bảo không cấp phát token lỗi/inactive. |
| Token có `blockedAt` | Kiểm tra không lấy token đang bị block. |
| Token có cookie | Kiểm tra cookie migrate và runtime dùng được nếu service cần. |
| Token có error_code/error_message | Kiểm tra migration giữ thông tin lỗi. |
| Token thiếu field cũ | Kiểm tra service không phụ thuộc `token_type/user_type/proxy_location`. |
| Proxy VN available/unavailable | Kiểm tra happy path và error handling proxy. |

---

## 5. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 5.1 Entry Criteria - Điều kiện để QA bắt đầu test

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | Dev đã deploy build refactor lên môi trường testing/staging. | Bắt buộc |
| 2 | Migration script hoặc migration result đã sẵn sàng để QA verify. | Bắt buộc |
| 3 | QA có quyền xem DB/log/deployment hoặc có bằng chứng thay thế từ Dev. | Bắt buộc |
| 4 | Có token test cho `crawler_type=FB_GRAPHQL_API`, `country=VN`. | Bắt buộc |
| 5 | Có proxy VN khả dụng cho happy path. | Bắt buộc |
| 6 | Dev confirm rule `status` và `blockedAt` thế nào là token hợp lệ. | Bắt buộc cho case block/status |
| 7 | Có rollback plan nếu migration hoặc runtime lỗi. | Khuyến khích |

### 5.2 Exit Criteria - Điều kiện để QA cho phép release

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | 100% P0/P1 test cases đã executed với trạng thái rõ ràng. | Bắt buộc |
| 2 | 0 bug Critical/High còn mở. | Bắt buộc |
| 3 | Data migration pass: các field mapping chính đúng và không mất token hợp lệ. | Bắt buộc |
| 4 | Service lấy token từ `tokens` theo `crawler_type/country/status/blockedAt` đúng. | Bắt buộc |
| 5 | Service không còn phụ thuộc `token_type/user_type/proxy_location` trong runtime. | Bắt buộc |
| 6 | Proxy VN được sử dụng đúng trong happy path. | Bắt buộc |
| 7 | Flow chính `fbapi-sample` chạy thành công với `FB_GRAPHQL_API/VN`. | Bắt buộc |
| 8 | Không phát hiện log lộ raw token/cookie trong quá trình test. | Bắt buộc |
| 9 | Bug Medium/Low còn mở đã được PM/Tech Lead chấp nhận. | Khuyến khích |

---

## 6. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

| ID | Risk | Mức độ | Xác suất | Mitigation |
|---|---|---|---|---|
| R1 | Mapping migration sai làm mất token/cookie hoặc sai `blockedAt`. | Cao | Trung bình | So sánh source-target theo sample và count reconciliation; yêu cầu backup/rollback. |
| R2 | Logic mới query thiếu điều kiện `country` hoặc `crawler_type`, dẫn đến lấy nhầm token. | Cao | Trung bình | Test decision table với token lẫn nhiều crawler/country. |
| R3 | Rule `blockedAt` không rõ, token bị block vẫn được lấy hoặc token hợp lệ bị loại. | Cao | Trung bình | Dev confirm rule trước execution; tạo case boundary cho `blockedAt`. |
| R4 | Code vẫn phụ thuộc field cũ `token_type/user_type/proxy_location`, gây lỗi runtime khi field bị bỏ. | Cao | Trung bình | Regression với token thiếu field cũ; kiểm tra log/error startup và runtime. |
| R5 | Proxy VN không khả dụng làm QA tưởng lỗi token. | Trung bình | Trung bình | Check proxy service riêng trước khi test token happy path; log rõ token vs proxy failure. |
| R6 | Service log raw token/cookie khi refactor debug. | Cao | Thấp | Review log trong quá trình test; log bug security nếu thấy secret. |
| R7 | Không có quyền DB/log khiến QA chỉ verify black-box. | Trung bình | Trung bình | Yêu cầu Dev cung cấp query result/log hoặc cấp quyền tạm thời trước entry. |
| R8 | Migration tạo duplicate token làm phân phối token bất thường. | Trung bình | Thấp | Kiểm tra duplicate theo token/crawler/country/status và runtime selection. |

---

## 7. TÀI LIỆU BÀN GIAO (Deliverables)

| # | Tài liệu | Mô tả | Thời điểm bàn giao | Người nhận |
|---|---|---|---|---|
| 1 | Test Plan | Scope, strategy, environment, criteria, risks cho YNMPDP-6024. | Trước khi test chính | PM, Dev Lead, QA |
| 2 | Test Cases | Chi tiết test cases migration, token query, proxy VN, runtime regression. | Sau khi Dev confirm assumptions | PM, Dev, QA |
| 3 | Test Data Checklist | Danh sách token/proxy cần chuẩn bị. | Trước execution | QA, Dev |
| 4 | Bug Reports | Jira bug có steps, expected/actual, bằng chứng DB/log/API. | Trong quá trình test | Dev Team, PM |
| 5 | Test Summary Report | Kết quả execution, bug summary, residual risks, recommendation release/no-release. | Sau execution | PM, Dev Lead, Stakeholders |

---

## Appendix A - Checklist QA trọng tâm

| Nhóm | Checklist |
|---|---|
| Migration | `access_token -> token`, `blocked_date -> blockedAt`, `cookie/error/status` đúng, không mất token hợp lệ. |
| Query token | Chỉ lấy token đúng `FB_GRAPHQL_API/VN`, status hợp lệ, không bị block. |
| Removed fields | Không còn phụ thuộc `token_type`, `user_type`, `proxy_location` và các field đã loại bỏ. |
| Proxy | Luôn lấy proxy VN; lỗi proxy được xử lý rõ ràng. |
| Runtime | Service start được, gọi API/crawl happy path thành công, không regression output chính. |
| Security | Không log raw token/cookie. |
| Observability | Có log trace theo metadata token/proxy mà không lộ secret. |
