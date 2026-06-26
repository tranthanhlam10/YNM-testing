# TEST PLAN
## Auto Token Distribution & Proxy Monthly Renew
### Feature: 08-F01 Token Auto-Distribution | 08-F02 Proxy Monthly Renew

| Field | Value |
|---|---|
| **Mã tài liệu** | TP-08-F01F02-v1.0 |
| **Dự án** | YouNet Media · SocialHeat · YouNet AI Studio |
| **Ngày tạo** | 21/05/2026 |
| **Người tạo** | QA Team (AI-assisted) |
| **Phiên bản** | 1.0 |
| **Trạng thái** | Draft — Pending Review |
| **Tài liệu tham chiếu** | [08-F01 BA Spec](file:///Users/tranthanhlam/product-ai-docs/SocialHeat/specs/08-proxy-token-auto-distribution/08-F01-token-auto-distribution.md) · [08-F02 BA Spec](file:///Users/tranthanhlam/product-ai-docs/SocialHeat/specs/08-proxy-token-auto-distribution/08-F02-proxy-monthly-renew.md) · [Dev Technical Wiki](https://wiki.younetco.com/pages/viewpage.action?pageId=296354795) |

---

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1 Bối cảnh

Hiện tại, team Product Support đang phải thực hiện **thủ công** hai tác vụ vận hành quan trọng:
- **Bơm token** hằng ngày vào từng luồng crawl (chia theo `platform`, `country`, `crawler_type`), tốn thời gian và dễ bỏ sót khi nhu cầu crawl tăng đột biến.
- **Làm mới proxy** hằng tháng (ngày 20) bằng cách đăng nhập BuyProxies, lấy IP mới, cập nhật thủ công vào DB.

Cả hai quy trình đều **phụ thuộc con người**, không có cơ chế cảnh báo real-time, dẫn đến nguy cơ gián đoạn crawler và ảnh hưởng trực tiếp đến **data freshness** và **SLA thu thập**.

### 1.2 Giải pháp (2 Feature)

| Feature | Mô tả | Priority |
|---------|--------|----------|
| **08-F01: Token Auto-Distribution** | Gom tất cả token vào **Pool Tổng** duy nhất. Hệ thống tự động phân phối token cho từng crawler thông qua 3 cơ chế: **Token Count Watcher** (1 phút/lần), **Queue + Token Checker** (5 phút/lần), và **Scarcity Mode** (ưu tiên P0 > P1 > P2 khi token khan hiếm). | P0 |
| **08-F02: Proxy Monthly Renew** | Background Job tự động gọi **API BuyProxies** vào ngày 20 hằng tháng, lấy danh sách proxy mới → import vào DB → vô hiệu hóa proxy cũ. Có cơ chế retry 3 lần và Slack alert. | P1 |

### 1.3 Mục tiêu kiểm thử

- Đảm bảo **Token Count Watcher** bơm token đúng logic (đúng lượng, đúng `platform`/`country`, đúng `crawler_type`).
- Đảm bảo **3 mode phân phối** hoạt động chính xác: Normal, Warning, Scarcity.
- Đảm bảo **Queue + Token Checker** phát hiện và alert đúng khi queue tồn đọng.
- Đảm bảo **Proxy Monthly Renew** sync thành công, retry đúng logic, không gây downtime crawler.
- Đảm bảo tất cả **Slack alerts** gửi đúng nội dung, đúng thời điểm, đúng channel.
- Đảm bảo hệ thống **không gây regression** cho luồng crawl hiện tại.

---

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1 In-Scope ✅

#### Module 1: Token Auto-Distribution (08-F01)

| STT | Hạng mục | BR/EC tham chiếu | Mô tả |
|-----|----------|-------------------|--------|
| 1 | Cấu hình luồng (`crawler_config`) | BR-01, BR-02 | Tạo mới, cập nhật `quota`/`priority`, áp dụng không cần restart |
| 2 | Pool Tổng & Vòng đời Token | BR-03, BR-04, BR-05 | Import token mới → Pool Tổng, token bị block/broken, crawler query token |
| 3 | Token Count Watcher (Cron 1 phút) | BR-06, BR-07, BR-08, BR-09 | Bơm token khi count < quota, xử lý khi Pool không đủ, xử lý mất kết nối DB |
| 4 | Queue + Token Checker (Cron 5 phút) | BR-10, BR-10b | Alert khi queue tồn đọng + token đủ, xử lý mất kết nối RabbitMQ |
| 5 | Pool Alert & Scarcity Mode | BR-11 → BR-15 | Warning mode (Pool < 1.5×), Scarcity mode (Pool < 1.0×), priority distribution (P0/P1/P2), tắt Scarcity khi Pool phục hồi |
| 6 | Hệ thống Slack Alerts | EC-01 → EC-07 | 5 loại alert: `pool_alert`, `scarcity_alert`, `queue_alert`, `watcher_error`, `checker_error` |

#### Module 2: Proxy Monthly Renew (08-F02)

| STT | Hạng mục | BR/EC tham chiếu | Mô tả |
|-----|----------|-------------------|--------|
| 7 | Auto-Sync Proxy (BuyProxies API) | BR-01, BR-02 | Cron trigger ngày 20, gọi API, import proxy mới |
| 8 | Retry mechanism | BR-03, BR-04 | Retry tối đa 3 lần, mỗi lần cách 5 phút |
| 9 | Error handling & Alert | EC-01 | Giữ proxy cũ khi thất bại, Slack alert |
| 10 | DB Operations | BR-02 | Import trước → vô hiệu hóa sau (tránh downtime) |

#### Kiểm thử chung (Cross-cutting)

| STT | Hạng mục | Mô tả |
|-----|----------|--------|
| 11 | Data Integrity | Dữ liệu DB nhất quán sau mỗi lần bơm token / sync proxy |
| 12 | Logging | Tất cả các bước quan trọng được ghi log đầy đủ |
| 13 | Regression | Luồng crawl hiện tại không bị ảnh hưởng sau khi deploy |

### 2.2 Out-of-Scope ❌

| Hạng mục | Lý do |
|----------|-------|
| **UI/Frontend Testing** | Cả 2 feature đều là Background Jobs, không có UI trong Phase 1 (theo BA spec S5.1) |
| **Mua token mới tự động** | Nằm ngoài scope 08-F01 (theo BA spec S1) |
| **Reclaim Job ngoài Scarcity Mode** | Đã loại khỏi scope Phase 1 (Open Question 1, 2 — Resolved) |
| **Hỗ trợ đa nhà cung cấp proxy** | Chỉ hỗ trợ BuyProxies trong Phase 1 (theo 08-F02 S1) |
| **Xử lý proxy bị block giữa tháng** | Resolved — Không cần trong Phase 1 (08-F02 Open Question 2) |
| **Queue + Token Checker alert khi queue tồn đọng không do thiếu token** | Đang pending solution phù hợp hơn theo Dev wiki (Section 2.4) [Giả định - Assumption] *(Need Confirm)* — Cần xác nhận với Dev: phần này có nằm trong scope test hay không, vì BA spec (US-02) có mô tả rõ ràng nhưng Dev wiki ghi là pending |
| **Performance Testing chi tiết** | Không có yêu cầu cụ thể về throughput/load, chỉ kiểm tra NFR cơ bản (tần suất chạy, alert latency) |
| **Security Testing** | Token/proxy không expose ra public API, toàn bộ xử lý nội bộ |

---

## 3. CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)

### 3.1 Functional Testing (Kiểm thử chức năng) — **Trọng tâm chính**

Đây là loại hình test **quan trọng nhất** vì toàn bộ feature là các Background Jobs xử lý logic nghiệp vụ phức tạp.

| Nhóm test | Kỹ thuật áp dụng | Mô tả |
|-----------|-------------------|--------|
| **Token Count Watcher** | Decision Table Testing, Boundary Value Analysis | Verify logic bơm token cho từng `crawler_type` theo `quota`, `platform`, `country`. Kiểm tra các ngưỡng ranh giới (count = quota, count = quota - 1, Pool Tổng = 0) |
| **Mode Switching Logic** | State Transition Testing | Verify chuyển đổi giữa 3 mode: Normal → Warning → Scarcity → Normal. Đặc biệt kiểm tra ngưỡng kích hoạt (1.5× và 1.0×) và ngưỡng tắt (1.5×) |
| **Priority Distribution (Scarcity)** | Equivalence Partitioning | Verify P0 full quota → P1 max 50% → P2 không bơm + thu hồi. Kiểm tra edge case P1 đã ≥ 50% quota |
| **Queue + Token Checker** | Condition Coverage | Verify logic AND: queue tồn đọng AND count ≥ quota → alert. Verify KHÔNG alert khi count < quota |
| **Proxy Monthly Renew** | Error Guessing, Retry Testing | Verify sync thành công, retry 1-3 lần, thất bại hoàn toàn. Verify thứ tự: import trước → vô hiệu hóa sau |
| **crawler_config Management** | CRUD Testing | Tạo mới, cập nhật quota/priority, verify áp dụng từ lần chạy tiếp theo |

#### Mapping User Stories → Test Scenarios

| User Story | Số AC | Estimated Test Cases | Priority |
|------------|-------|---------------------|----------|
| **US-01** Token Count Watcher tự động bơm | 3 AC | 8-10 cases | P0 |
| **US-02** Queue + Token Checker alert | 4 AC | 6-8 cases | P1 |
| **US-03** Cảnh báo Pool Tổng | 1 AC | 3-4 cases | P0 |
| **US-04** Scarcity Mode priority distribution | 5 AC | 10-12 cases | P0 |
| **US-05** Quản lý crawler_config | 2 AC | 4-5 cases | P1 |
| **F02-US-01** Proxy Monthly Renew | 3 AC | 6-8 cases | P1 |
| **Edge Cases** (EC-01 → EC-07) | 7 EC | 7-9 cases | P0-P1 |
| **Tổng ước tính** | | **~44-56 test cases** | |

### 3.2 API/Integration Testing (Kiểm thử tích hợp)

| Điểm tích hợp | Phương pháp kiểm thử | Công cụ/Cách thức |
|----------------|----------------------|-------------------|
| **Background Job → MySQL DB** (`ynm_tokens.tokens`, `crawler_config`, `proxies`) | Verify query đọc/ghi dữ liệu đúng | Query DB trực tiếp sau mỗi lần job chạy |
| **Queue + Token Checker → RabbitMQ** | Verify đọc queue depth đúng, xử lý mất kết nối | Monitor RabbitMQ Management UI |
| **Proxy Renew Job → BuyProxies API** | Verify gọi API đúng endpoint, xử lý response/error | Check logs + DB sau khi job chạy |
| **Cả 2 Job → Slack Webhook** | Verify gửi alert đúng channel, đúng nội dung, đúng format | Kiểm tra Slack channel trực tiếp |
| **Token Count Watcher → Prometheus Metrics** | Verify metrics expose đúng (theo Dev wiki) | [Giả định] *(Need Confirm)* — Check với Dev xem Prometheus metrics có trong scope Phase 1 không |

### 3.3 Non-functional Testing

> [!NOTE]
> Chỉ kiểm tra các NFR đã được BA spec định nghĩa rõ ràng, không thực hiện load/stress testing toàn diện.

| NFR | Tiêu chí đánh giá | Cách kiểm tra |
|-----|-------------------|---------------|
| **Token Count Watcher Frequency** | Chạy mỗi 1 phút, không trễ > 10s | Theo dõi Cron logs trong 30 phút liên tục |
| **Queue + Token Checker Frequency** | Chạy mỗi 5 phút, không trễ > 30s | Theo dõi Cron logs trong 30 phút liên tục |
| **Alert Latency** | Slack alert gửi trong vòng 1 phút kể từ khi detect event | Đo thời gian từ khi trigger đến khi nhận Slack |
| **API Timeout (Proxy)** | Gọi API BuyProxies timeout sau 10s | Verify config timeout trong code/env |
| **Retry Interval (Proxy)** | Mỗi lần retry cách nhau 5 phút, tối đa 3 lần | Theo dõi logs khi simulate API failure |

### 3.4 UI/UX Testing

**Không áp dụng.** Cả 2 feature đều là Background Jobs, không có giao diện người dùng trong Phase 1 (BA spec S5.1).

### 3.5 Data Migration/Data Sync

| Hạng mục | Mô tả |
|----------|--------|
| **Token Pool Migration** | Verify toàn bộ token đã được migrate sang Pool Tổng đúng cấu trúc: `status` = 'Active', `crawler_type` = NULL cho token chưa gán |
| **Proxy DB Sync** | Verify sau khi sync: proxy mới có `status` = 'Active', proxy cũ có `status` = 'Expired'. Không mất dữ liệu |
| **crawler_config Seeding** | Verify bảng `crawler_config` đã có đầy đủ `quota`, `platform`, `country`, `priority` cho tất cả crawler hiện tại |

---

## 4. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

### 4.1 Môi trường

| Môi trường | Mục đích | Giai đoạn sử dụng |
|------------|----------|-------------------|
| **Staging** | Test chức năng chính, integration test, regression | Phase test chính (Ngày 2-4) |
| **UAT** | Product Support verify trước khi lên Production | Sau khi QA sign-off trên Staging |
| **Production** | Monitor sau release (không test trực tiếp) | Post-release monitoring |

### 4.2 Hạ tầng & Dependency

| Component | Yêu cầu | Ghi chú |
|-----------|---------|---------|
| **MySQL Database** | DB `ynm_tokens` với bảng `tokens`, `crawler_config`, `proxies` | Cần quyền đọc/ghi để verify và setup test data |
| **RabbitMQ** | Queue cho từng `crawler_type` đang hoạt động | Cần quyền xem queue depth qua Management UI |
| **Slack Webhook** | Channel nhận alert đã cấu hình | Cần access channel để verify message |
| **BuyProxies API** | API Key hợp lệ trên môi trường staging | *(Need Confirm)* — Cần xác nhận với Dev: staging dùng API Key production hay test key? |
| **Airflow** (Proxy Renew) | DAG đã deploy trên staging | Theo Dev wiki, Proxy Renew sử dụng Airflow |
| **Prometheus** (optional) | Metrics endpoint nếu có | [Giả định] *(Need Confirm)* — Dev wiki nhắc đến nhưng chưa rõ scope |

### 4.3 Nền tảng & Thiết bị

| Nền tảng | Chi tiết |
|----------|----------|
| **Backend Jobs** | Không có UI → Không cần test browser/mobile |
| **Slack** | Desktop App hoặc Web (bất kỳ browser) để verify alert |
| **DB Client** | MySQL Workbench / DBeaver để query verify data |
| **RabbitMQ** | Management UI (Web) |
| **Airflow** | Web UI |

---

## 5. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 5.1 Entry Criteria — Điều kiện để QA bắt đầu test

| # | Tiêu chí | Bắt buộc |
|---|----------|----------|
| 1 | Dev đã hoàn thành code và pass Unit Test cho cả 2 feature | ✅ Bắt buộc |
| 2 | Code đã được deploy thành công lên môi trường **Staging** | ✅ Bắt buộc |
| 3 | Database đã migrate: bảng `tokens`, `crawler_config`, `proxies` có đầy đủ schema | ✅ Bắt buộc |
| 4 | Cron Jobs (Token Count Watcher, Queue + Token Checker) đã setup và chạy được trên Staging | ✅ Bắt buộc |
| 5 | Airflow DAG cho Proxy Renew đã deploy trên Staging | ✅ Bắt buộc |
| 6 | Slack Webhook đã cấu hình và gửi test message thành công | ✅ Bắt buộc |
| 7 | Kết nối RabbitMQ từ Staging hoạt động bình thường | ✅ Bắt buộc |
| 8 | BA đã review và approve Test Cases | ⚠️ Khuyến khích |
| 9 | Test data đã được seed (token pool, crawler_config, proxy data) | ✅ Bắt buộc |
| 10 | Open Question 3 (ngưỡng queue tồn đọng BR-10) đã được resolved | ⚠️ Blocking US-02 |

### 5.2 Exit Criteria — Điều kiện để QA cho phép release

| # | Tiêu chí | Bắt buộc |
|---|----------|----------|
| 1 | **100% test cases đã được executed** (PASSED, FAILED, hoặc BLOCKED với lý do hợp lệ) | ✅ Bắt buộc |
| 2 | **0 bug Critical** — Không có lỗi nào gây sập hệ thống, mất dữ liệu, hoặc dừng crawler | ✅ Bắt buộc |
| 3 | **0 bug High chưa fix** — Tất cả bug High đã được fix và re-test PASSED | ✅ Bắt buộc |
| 4 | **Các tính năng chính hoạt động ổn định:** | ✅ Bắt buộc |
| | — Token Count Watcher bơm đúng logic trong ≥ 10 lần chạy liên tiếp | |
| | — Scarcity Mode chuyển đổi đúng giữa 3 mode | |
| | — Proxy Renew sync thành công ít nhất 1 lần | |
| 5 | **Slack alerts** gửi đúng nội dung cho ≥ 3 loại alert đã test | ✅ Bắt buộc |
| 6 | **Regression test PASSED** — Luồng crawl hiện tại không bị ảnh hưởng | ✅ Bắt buộc |
| 7 | Bug Medium/Low còn mở đã được PM/PO đánh giá và chấp nhận release | ⚠️ Khuyến khích |
| 8 | Test Summary Report đã được gửi và review | ⚠️ Khuyến khích |

---

## 6. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

### 6.1 Rủi ro kỹ thuật

| # | Rủi ro (Risk) | Mức độ | Xác suất | Hướng giải quyết (Mitigation) |
|---|---------------|--------|----------|-------------------------------|
| R1 | **Môi trường Staging không ổn định** — DB, RabbitMQ, hoặc Airflow trên Staging thường xuyên bị down/restart, gây gián đoạn test | 🔴 Cao | Trung bình | — Confirm với DevOps tình trạng env trước khi bắt đầu test. — Chuẩn bị script seed data để nhanh chóng restore khi env bị reset. — Ghi lại evidence (screenshot/video) ngay khi test PASSED để tránh phải re-test |
| R2 | **Open Question chưa resolved** — Ngưỡng queue tồn đọng cho BR-10 (Queue + Token Checker) chưa được chốt → **Blocking** toàn bộ test cho US-02 | 🔴 Cao | Cao | — Escalate lên PM/BA ngay đầu sprint để chốt giá trị ngưỡng. — Nếu chưa chốt: test các module khác trước, để US-02 test sau cùng. — [Giả định] Tạm sử dụng ngưỡng mặc định (VD: 1000 messages) để viết TC, đánh dấu *(Need Confirm)* |
| R3 | **Logic tính mode phức tạp, dễ hiểu sai** — Công thức `active_pool` vs `sum(quota)` tính theo `platform`/`country`, dễ confuse giữa pool tổng và pool theo nhóm | 🟡 Trung bình | Trung bình | — Họp 30 phút với Dev trước khi test để walkthrough logic tính mode. — Chuẩn bị bảng tính Excel/Sheet với data mẫu để verify kết quả DB thủ công |
| R4 | **Khác biệt giữa BA spec và Dev implementation** — BA spec mô tả Queue + Token Checker là feature chính (US-02), nhưng Dev wiki ghi là "pending solution phù hợp hơn" | 🟡 Trung bình | Cao | — Confirm ngay với Dev và BA: phần Queue + Token Checker có trong scope Phase 1 release hay không. — Nếu không: loại khỏi scope test, ghi nhận rõ trong Out-of-Scope |

### 6.2 Rủi ro quy trình

| # | Rủi ro (Risk) | Mức độ | Xác suất | Hướng giải quyết (Mitigation) |
|---|---------------|--------|----------|-------------------------------|
| R5 | **Dev fix bug chậm** — Feature phức tạp, dev cần thời gian debug logic mode switching, gây delay re-test | 🟡 Trung bình | Trung bình | — Log bug sớm nhất có thể (ngày 2-3), không dồn cuối sprint. — Ưu tiên test P0 trước (Scarcity Mode, Token Watcher) để bug critical được phát hiện sớm |
| R6 | **Test data không chính xác** — Cần setup data phức tạp (nhiều `crawler_type`, nhiều `platform`/`country`, các mức priority khác nhau) để test Scarcity Mode | 🟡 Trung bình | Trung bình | — Chuẩn bị bộ SQL scripts seed data cho từng scenario trước khi bắt đầu test. — Document rõ data setup cho mỗi test case |
| R7 | **BuyProxies API trên Staging** — Không rõ staging dùng API key production hay test key. Nếu dùng key production, có thể ảnh hưởng dữ liệu thật | 🟡 Trung bình | Trung bình | — Confirm với Dev trước khi test Proxy Renew. — Nếu không có test key: mock API response hoặc test trên env riêng biệt |

### 6.3 Rủi ro nghiệp vụ

| # | Rủi ro (Risk) | Mức độ | Xác suất | Hướng giải quyết (Mitigation) |
|---|---------------|--------|----------|-------------------------------|
| R8 | **Scarcity Mode flapping** — Pool Tổng dao động quanh ngưỡng 1.0× → liên tục bật/tắt Scarcity Mode, gây rối loạn phân bổ token | 🟡 Trung bình | Thấp | — BA spec đã thiết kế: tắt Scarcity ở ngưỡng 1.5× (cao hơn ngưỡng kích hoạt 1.0×) để tránh flapping (BR-15). — QA cần verify kỹ logic hysteresis này |

---

## 7. TÀI LIỆU BÀN GIAO (Deliverables)

| # | Tài liệu | Mô tả | Thời điểm bàn giao | Người nhận |
|---|----------|--------|---------------------|------------|
| 1 | **Test Plan** (tài liệu này) | Kế hoạch kiểm thử tổng thể, scope, strategy, risk | Trước khi bắt đầu test | PM, Dev Lead, BA |
| 2 | **Test Cases** (Google Sheets) | Chi tiết ~44-56 test cases với test steps, test data, expected result | Sau Phase 1 (Phân tích & Viết TC) | PM, BA, Dev |
| 3 | **Bug Reports** (Jira tickets) | Mỗi bug 1 ticket: steps to reproduce, actual vs expected, severity, evidence | Trong quá trình test | Dev Team |
| 4 | **Test Execution Report** (Google Sheets) | Cập nhật kết quả test: PASSED/FAILED/BLOCKED cho từng test case | Cập nhật hằng ngày | PM |
| 5 | **Test Summary Report** | Tổng kết: tổng TC, tỷ lệ pass/fail, bugs summary, recommendation release | Sau khi hoàn thành test | PM, Dev Lead, Stakeholders |

---

## PHỤ LỤC

### A. Tổng hợp các điểm cần xác nhận *(Need Confirm)*

> [!IMPORTANT]
> Các điểm dưới đây là **giả định** của QA do thiếu thông tin. Cần confirm với BA/Dev **trước khi bắt đầu test** để tránh viết TC sai.

| # | Câu hỏi | Người cần hỏi | Ảnh hưởng nếu chưa confirm |
|---|---------|----------------|----------------------------|
| NC-1 | **Queue + Token Checker (US-02)** có trong scope Phase 1 không? BA spec mô tả đầy đủ (US-02, BR-10), nhưng Dev wiki section 2.4 ghi "tạm thời pending để tìm solution phù hợp hơn". | Dev Lead + BA | Nếu không → loại ~6-8 test cases khỏi scope |
| NC-2 | **Ngưỡng queue tồn đọng** (BR-10) cụ thể là bao nhiêu messages hoặc bao nhiêu phút? (Open Question 3 — Status: Open) | BA + PM | Blocking toàn bộ test cho US-02 |
| NC-3 | **BuyProxies API Key** trên Staging dùng key nào? Production key hay test key? Có risk ảnh hưởng dữ liệu production không? | Dev | Ảnh hưởng cách test Proxy Renew |
| NC-4 | **Prometheus Metrics** (nhắc đến trong Dev wiki) có trong scope test Phase 1 không? | Dev | Nếu có → thêm 2-3 test cases verify metrics |
| NC-5 | **Thứ tự import proxy** (BR-02 F02): Dev đã implement import trước → vô hiệu hóa sau trong 1 transaction chưa? (08-F02 Open Question 1 — Status: Open) | Dev (BE) | Ảnh hưởng test case verify downtime |
| NC-6 | **DB Schema (S7)** của cả 2 feature đều ghi "Dev-owned — Gate 3" và chưa hoàn thiện. Các field cụ thể trong bảng `tokens`, `crawler_config`, `proxies` đã chốt chưa? | Dev | Ảnh hưởng test data setup + query verify |

### B. Mapping Business Rules → Test Coverage

```
08-F01 Token Auto-Distribution:
├── Nhóm 1: crawler_config (BR-01, BR-02) → US-05
├── Nhóm 2: Pool Tổng & Token Lifecycle (BR-03, BR-04, BR-05) → Pre-condition checks
├── Nhóm 3: Token Count Watcher (BR-06, BR-07, BR-08, BR-09) → US-01
├── Nhóm 4: Queue + Token Checker (BR-10, BR-10b) → US-02 [Need Confirm]
├── Nhóm 5: Pool Alert & Scarcity Mode (BR-11, BR-12) → US-03
└── Nhóm 6: Priority Distribution (BR-13, BR-14, BR-15) → US-04

08-F02 Proxy Monthly Renew:
└── Nhóm 1: Auto-Sync Proxy (BR-01, BR-02, BR-03, BR-04) → F02-US-01

Edge Cases: EC-01 → EC-07 → Distributed across test cases
```

---

*— Hết tài liệu Test Plan —*

*Tài liệu này được tạo bởi QA Team với sự hỗ trợ của AI, dựa trên phân tích 3 nguồn requirement: BA Spec 08-F01, BA Spec 08-F02, và Technical Wiki của Dev. Mọi giả định đã được đánh dấu rõ ràng [Need Confirm] để QA follow-up.*
