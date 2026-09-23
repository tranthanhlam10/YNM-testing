# TEST PLAN
## 04-F03 Crisis Content Monitoring — Filter & Phân quyền

| Field | Value |
|---|---|
| Mã tài liệu | TP-04-F03-FP-v1.1 |
| Dự án | YouNet Media - SocialHeat |
| Feature | 04-F03 Crisis Content Monitoring — Filter & Phân quyền |
| Priority | P0 |
| Release | Phase 1 |
| Ngày tạo | 04/08/2026 |
| Người tạo | QA Team (AI-assisted) |
| Phiên bản | 1.1 |
| Trạng thái | Draft - Pending Review |
| Tài liệu tham chiếu | PRD: [PRD-04](file:///Users/tranthanhlam/product-ai-docs/SocialHeat/specs/04-crisis-realtime-monitoring/PRD-04-crisis-realtime-monitoring.md) · FRD chính: [04-F03](file:///Users/tranthanhlam/product-ai-docs/SocialHeat/specs/04-crisis-realtime-monitoring/04-F03-crisis-content-monitoring.md) · FRD liên quan: [04-F02](file:///Users/tranthanhlam/product-ai-docs/SocialHeat/specs/04-crisis-realtime-monitoring/04-F02-crisis-alert-rule.md) |

---

## 1. MỤC TIÊU & TỔNG QUAN (Introduction & Objective)

### 1.1 Bối cảnh

Màn hình **Crisis Content Monitoring** (04-F03) là nơi Crisis Moderator/Leader giám sát tập trung mentions khủng hoảng, lấy **Alert Rule (khách hàng)** làm trục chính. Hai thành phần then chốt cần kiểm thử:

- **Filter**: Giúp Moderator thu hẹp nhanh tập mentions theo Alert Rule, Negative Level, Mention Type, Platform, thời gian, nội dung. Filter sai → bỏ lỡ tin crisis hoặc mất thời gian xem tin không liên quan.
- **Phân quyền**: Kiểm soát ai truy cập màn hình, ai thấy rule nào (`view_all` vs `view_own` theo PIC). Phân quyền sai → leak data hoặc chặn nhầm → delay xử lý crisis.

### 1.2 Mục tiêu kiểm thử

Test Plan này **CHỈ** cover **Filter** và **Phân quyền truy cập** trên màn 04-F03. Cụ thể:

- **Phân quyền**: 3 case chính (`view_all_crisis_topics` / `view_own_crisis_topics` / không có permission) + phạm vi Alert Rule hiển thị theo quyền.
- **Filter**: 6 filter fields (Search, Thời gian, Alert Rule, Negative Level, Mention Type, Platform) + logic AND + count badge + sort rule list + empty/error state.

### 1.3 Assumptions & Need Confirm

| ID | Nội dung | Trạng thái | Ảnh hưởng |
|---|---|---|---|
| AS-01 | Khi user có **cả** `view_all` VÀ `view_own`, hệ thống ưu tiên `view_all` (phạm vi rộng hơn). | Need Confirm | Expected result case user có đồng thời 2 permission. |
| AS-02 | Tên code permission cuối cùng do Dev đặt, có thể khác tên nghiệp vụ trong spec. QA cần lấy tên thực tế. | Need Confirm | Test API permission check và setup account. |
| AS-03 | Timezone cho filter Thời gian (`created_date`) chưa rõ UTC hay timezone business (VN/TH). | Need Confirm | Test case ranh giới ngày. |
| AS-04 | Count badge đọc từ pool materialize (có thể trễ vài phút). QA chấp nhận drift nhỏ, chỉ fail nếu lệch quá 5 phút hoặc badge = 0 khi thực tế có tin. | Assumption (BR-36) | Cách đánh giá pass/fail count badge. |

---

## 2. PHẠM VI KIỂM THỬ (Scope of Testing)

### 2.1 In-Scope

#### Module 1 — Phân quyền truy cập màn hình 04-F03

| STT | Hạng mục | BR/AC | Nội dung kiểm thử |
|---|---|---|---|
| 1 | `view_all` → phạm vi toàn bộ | BR-01, US-01-AC-02 | Menu hiển thị → vào màn hình → Alert Rule list chứa **tất cả** rule → feed gộp mọi rule. |
| 2 | `view_own` → phạm vi theo PIC | BR-02, US-01-AC-03 | Menu hiển thị → vào màn hình → Alert Rule list chỉ chứa rule user là PIC → feed gộp rule đó. |
| 3 | `view_own` không là PIC rule nào | BR-02, EC-01, US-01-AC-04 | Vào màn hình → feed rỗng + message `feed.empty.no_pic` → **không phải lỗi**. |
| 4 | Không có permission | BR-03, US-01-AC-01 | Menu "Crisis Content Monitoring" ẩn; truy cập URL trực tiếp → bị chặn. |
| 5 | Thay đổi PIC real-time | BR-02 | Remove user khỏi PIC → lần refresh tiếp, rule mất khỏi list (nếu `view_own`). |

#### Module 2 — Filter Panel trên màn hình 04-F03

| STT | Hạng mục | BR/AC | Nội dung kiểm thử |
|---|---|---|---|
| 1 | Filter Alert Rule (trục chính) | BR-04, BR-31, BR-32, US-02-AC-02 | Chip "Tất cả" mặc định; chọn rule → feed lọc; click lại → về "Tất cả"; đổi → selection reset (BR-30). |
| 2 | Filter Thời gian | BR-31, BR-33, US-02-AC-01 | Default = Last 3 days; preset Today/3d/7d; custom range; tính theo `created_date`. |
| 3 | Filter Negative Level | BR-31, US-02-AC-03 | Toggle: Unclassified/Low/High/Very High. Collapse mặc định. Lưu ý tin non-Negative vào qua keyword hiển thị "Unclassified" (BR-06). |
| 4 | Filter Mention Type | BR-31, US-02-AC-07 | Toggle: Post/Share/Comment. Collapse mặc định. Card có badge Mention Type. |
| 5 | Filter Platform | BR-31 | List toggle CC-Platform. Collapse mặc định. |
| 6 | Search Nội dung/tác giả | BR-31 | Text input tìm nội dung + tên tác giả. |
| 7 | AND logic kết hợp | BR-31, US-02-AC-03 | Mọi filter kết hợp AND. Kiểm tra tổ hợp thường dùng. |
| 8 | Count badge | BR-36, US-02-AC-05 | Badge = pending trong time range; có filter view → `đang xem / tổng`; màu theo level cao nhất tập tổng; hover tooltip breakdown. |
| 9 | Sort rule list + Tab badge | BR-13, BR-32, US-02-AC-04, AC-06 | Rule sort DESC theo tổng (không nhảy khi áp filter view). Chỉ "Cần xét duyệt" có badge đỏ. |
| 10 | "Đang lọc" + "Xóa tất cả" | BR-34 | Có ≥1 filter active → header "Đang lọc" + nút reset. |
| 11 | Empty / Error state | EC-02, EC-03, EC-05 | Filter không khớp → empty; phạm vi rỗng → empty; load fail → error + retry. |
| 12 | Selection reset | BR-30 | Đổi rule/platform/level/search/ngày/tab → selection bị reset. |

### 2.2 Out-of-Scope

| Hạng mục | Lý do |
|---|---|
| CRUD permission màn Alert Rule Setting (04-F02) | Thuộc màn hình riêng, có test plan riêng. Chỉ smoke-test nếu cần regression. |
| Permission `manage_crisis_classification_prompt` (04-F05) | Thuộc Prompt Library, ngoài scope màn 04-F03. |
| Permission `receive_escalated_notification` | Phase 2, chưa triển khai. |
| Luồng Cảnh báo / Bỏ qua / Bulk action | Thuộc phần review & action, ngoài scope filter & permission. |
| Popup Recipient Group / đồng thời nhiều PIC | Thuộc phần alert workflow / concurrency. |
| Sửa Sentiment / Negative Level trên card | Thuộc phần mention card action. |
| Pool materialize / pipeline AI / data sync | Thuộc phần data pipeline. QA chỉ kiểm tra kết quả filter trên feed. |
| Mobile responsive chi tiết | Chỉ smoke-test layout filter trên mobile; test responsive đầy đủ nằm ở test plan UI/UX riêng. |

---

## 3. CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)

### 3.1 Functional Testing — Trọng tâm chính

| Nhóm test | Kỹ thuật | Nội dung |
|---|---|---|
| Permission truy cập | Decision Table | Bảng 4 case: `view_all` / `view_own` có PIC / `view_own` không PIC / không permission. Test cả menu visibility + URL trực tiếp + phạm vi rule list. |
| Filter trục Alert Rule | State Transition | "Tất cả" → chọn rule → click lại → về "Tất cả"; feed reload + selection reset. |
| Filter fields đơn lẻ | Equivalence Partitioning | Mỗi field test đại diện: thời gian (default + preset + custom), level (4 giá trị), type (3 giá trị), platform, search. |
| AND logic kết hợp | Pairwise | 2-3 tổ hợp thường dùng: Rule + Level, Time + Platform, Search + Level. Đảm bảo AND đúng + "Xóa tất cả" reset đúng. |
| Count badge + Sort | Data-driven | Seed data biết trước → verify badge số, format `đang xem / tổng`, màu, tooltip, sort DESC. |
| Empty / Error | Negative Testing | Filter không khớp → empty; load fail → error + retry; phạm vi rỗng (EC-03). |

#### Mapping test — Ước tính test cases

| Nhóm | BR/AC chính | Cases | Priority |
|---|---|---|---|
| Permission (truy cập + phạm vi) | BR-01→03, US-01-AC-01→04, EC-01 | 6 | P0 |
| Filter — Alert Rule (trục) | BR-04, BR-30, BR-32, US-02-AC-02 | 5 | P0 |
| Filter — Thời gian | BR-33, US-02-AC-01 | 4 | P0 |
| Filter — Level + Type + Platform + Search | BR-31, US-02-AC-03, AC-07 | 6 | P0 |
| AND logic kết hợp + Reset | BR-31, BR-30, BR-34 | 5 | P0 |
| Count badge + Sort + Tab badge | BR-13, BR-32, BR-36, US-02-AC-04→06 | 6 | P0 |
| Empty / Error state | EC-02, EC-03, EC-05 | 4 | P0/P1 |
| Thay đổi PIC / edge case permission | BR-02, AS-01 | 3 | P1 |
| **Tổng** | | **~39 cases** | |

### 3.2 UI/UX Testing (gộp trong Functional)

Các điểm UI cần check khi test functional, **không tách test case riêng**:

- Filter panel: collapse/expand đúng mặc định (Content, Time, Alert Rule mở; Level, Type, Platform collapse).
- Count badge: dấu phân tách nghìn (VD: `278,659`); màu đỏ/cam/vàng/xám đúng level.
- Alert Rule item: tên đậm + badge ⚡ (Mode auto) + meta + count badge + divider.
- Tab badge: chỉ "Cần xét duyệt" có badge đỏ.
- Localization: message key EN/VN (`feed.empty.no_pic`, `feed.empty.filtered`, `feed.empty.no_rule`, `feed.error.load`).

### 3.3 API Testing (gộp trong Functional)

Test API song song khi test functional, **không tách module riêng**:

- **Permission check ở BE**: Gọi API feed bằng user không permission → phải 403 (không chỉ ẩn UI ở FE).
- **Filter params**: Gọi API feed với filter params → response đúng logic AND.
- **Phạm vi**: API trả đúng rule list theo permission (`view_all` vs `view_own`).

### 3.4 Non-functional Testing (chỉ NFR liên quan)

| NFR | Tiêu chí | Cách test |
|---|---|---|
| Filter response | Đổi filter → feed reload ≤ 1.5s (NFR-07) | Đo từ click filter → feed render xong. |
| Feed load | 20 mention đầu ≤ 2s (NFR-01) | Đo từ DOMContentLoaded → 20 card visible. |

### 3.5 Compatibility (smoke-test)

- Browser: Chrome latest (chính) + Edge/Firefox (regression).
- Mobile: Smoke-test filter thu thành nút "Filters" ≤ 768px, touch target ≥ 44px.

---

## 4. MÔI TRƯỜNG KIỂM THỬ (Test Environment)

### 4.1 Môi trường

| Môi trường | Mục đích |
|---|---|
| Staging | Test chính: functional, API, regression. |
| UAT | BA/Crisis Team review behavior trước release. |
| Production | Post-release monitoring, không test phá dữ liệu. |

### 4.2 Dependency cần sẵn sàng

| Component | Yêu cầu |
|---|---|
| FE + BE 04-F03 | Filter panel + permission check + feed API + count badge API đã deploy Staging. |
| Pool `crisis-alert` | Có data test đủ level/type/platform/time range. |
| ≥3 Alert Rules | Config khác nhau (Mode, routing mode, PIC assignment). |
| Permission Admin | QA có quyền grant/revoke permission trên Staging. |

### 4.3 Test Accounts cần chuẩn bị

| Account | Permission | PIC | Mục đích |
|---|---|---|---|
| QA-Leader | `view_all_crisis_topics` | N/A (thấy tất cả) | Phạm vi full |
| QA-Member1 | `view_own_crisis_topics` | PIC của Rule-A, Rule-B | Phạm vi theo PIC |
| QA-MemberNoPIC | `view_own_crisis_topics` | Không là PIC rule nào | Empty state EC-01 |
| QA-NoPermission | Không có cả 2 | N/A | Ẩn menu, chặn truy cập |

### 4.4 Test Data cần seed

| Nhóm | Mục đích |
|---|---|
| Mentions đủ 4 Negative Level (null/1/2/3) | Test filter Level + count badge màu. |
| Mentions đủ 3 Mention Type (Post/Share/Comment) | Test filter Type. |
| Mentions từ ≥2 Platform | Test filter Platform. |
| Mentions trong nhiều khoảng thời gian | Test filter Time + preset. |
| ≥3 Alert Rules với lượng pending khác nhau | Test filter Rule + sort + count badge. |

---

## 5. TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)

### 5.1 Entry Criteria

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | FRD 04-F03 đã Approved; các BR filter + permission đã chốt. | Bắt buộc |
| 2 | Code FE/BE (filter panel, permission check, feed API, count badge) đã deploy Staging, pass smoke test Dev. | Bắt buộc |
| 3 | 4 test accounts + test data đã setup theo mục 4.3–4.4. | Bắt buộc |
| 4 | BA/Dev đã confirm AS-01→AS-03. | Bắt buộc cho case liên quan |

### 5.2 Exit Criteria

| # | Tiêu chí | Bắt buộc |
|---|---|---|
| 1 | 100% test cases đã executed (Passed/Failed/Blocked có lý do). | Bắt buộc |
| 2 | 0 bug Critical/High còn mở. | Bắt buộc |
| 3 | Core permission pass: `view_all` thấy mọi rule; `view_own` chỉ thấy rule PIC; không permission bị chặn; API trả 403 đúng. | Bắt buộc |
| 4 | Core filter pass: mỗi field đúng; AND logic đúng; count badge đúng; sort đúng; empty/error state đúng. | Bắt buộc |
| 5 | Filter response ≤ 1.5s; feed load ≤ 2s trên Staging. | Bắt buộc |
| 6 | Test Summary Report đã gửi PM/BA/Dev Lead. | Bắt buộc |

---

## 6. RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)

| ID | Risk | Mức độ | Mitigation |
|---|---|---|---|
| R1 | **Tên permission code khác spec** — Dev đặt tên theo convention riêng, QA test API/grant sai tên → test vô nghĩa. | Cao | Yêu cầu Dev cung cấp danh sách tên permission code chính thức trước khi QA viết test case. |
| R2 | **Permission check chỉ FE, không BE** — UI ẩn nút nhưng API vẫn cho gọi → user biết URL/API bypass được → rủi ro bảo mật. | Cao | Test permission ở cả 2 tầng: UI (menu/nút ẩn đúng) + API (Postman gọi trực tiếp phải trả 403). |
| R3 | **Count badge lệch nhiều** — Badge đọc từ pool materialize, drift quá lớn → Moderator mất tin tưởng số liệu. | Trung bình | Seed data biết trước số lượng → so sánh badge; chấp nhận drift nhỏ (vài phút), fail nếu badge = 0 khi thực tế có tin. |
| R4 | **Filter Thời gian sai timezone** — Mention nằm sai khoảng ngày, đặc biệt sát 00:00. | Trung bình | Confirm timezone (AS-03). Tạo test data sát ranh giới ngày. |
| R5 | **Thiếu test account / không thể grant permission trên Staging** — Không test được phân quyền. | Trung bình | Confirm quyền Admin tool trước Entry Criteria; nếu không tự tạo được, yêu cầu Dev cung cấp account theo mục 4.3. |

---

## 7. TÀI LIỆU BÀN GIAO (Deliverables)

| # | Tài liệu | Thời điểm | Người nhận |
|---|---|---|---|
| 1 | Test Plan (tài liệu này) | Trước khi test | PM, BA, Dev Lead, QA |
| 2 | Test Cases (~39 cases, chi tiết steps/data/expected) | Sau confirm assumptions | PM, BA, Dev, QA |
| 3 | Permission Matrix (test oracle nhanh — xem Appendix A) | Cùng Test Cases | PM, BA, Dev, QA |
| 4 | Bug Reports (Jira) | Trong quá trình test | Dev, PM |
| 5 | Test Summary Report | Sau hoàn thành test | PM, BA, Dev Lead |

---

## Appendix A — Permission Matrix (Test Oracle)

| Permission | Menu hiển thị | Vào màn hình | Phạm vi Alert Rule | Feed |
|---|---|---|---|---|
| `view_all_crisis_topics` | ✅ | ✅ | Tất cả rule (flow mới) | Gộp mọi rule |
| `view_own_crisis_topics` (có PIC) | ✅ | ✅ | Chỉ rule mình là PIC | Gộp rule mình là PIC |
| `view_own_crisis_topics` (không PIC) | ✅ | ✅ | Rỗng | Empty: `feed.empty.no_pic` |
| Không có cả 2 | ❌ | ❌ (redirect) | N/A | N/A |

---

## Appendix B — Checklist QA trọng tâm

| Nhóm | Checklist |
|---|---|
| Permission | `view_all` thấy tất cả rule · `view_own` chỉ thấy rule PIC · không permission → menu ẩn + URL chặn + API 403 · remove PIC → rule mất khỏi list |
| Filter trục | "Tất cả" mặc định · chọn rule → feed reload · click lại → về "Tất cả" · đổi → selection reset |
| Filter fields | Time default 3 ngày + preset đúng · Level 4 giá trị · Type 3 giá trị · Platform toggle · Search nội dung + tác giả |
| AND + Reset | Kết hợp bất kỳ → AND đúng · "Xóa tất cả" reset đúng · đổi rule/filter/tab → selection reset |
| Count + Sort | Badge = pending đúng · `đang xem / tổng` khi có filter view · màu theo level cao nhất · sort DESC không nhảy |
| Empty/Error | Filter không khớp → empty · phạm vi rỗng → empty · load fail → error + retry |
