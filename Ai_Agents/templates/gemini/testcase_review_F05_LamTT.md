# 🔍 Review Bộ Testcase — 04-F05 Crisis Negative Level Classification

> **Reviewer:** Senior QA/Test Analyst (AI)
> **Ngày review:** 2026-07-28
> **Spec tham chiếu:** [04-F05-crisis-negative-level-classification.md](file:///Users/tranthanhlam/product-ai-docs/SocialHeat/specs/04-crisis-realtime-monitoring/04-F05-crisis-negative-level-classification.md)
> **Testcase source:** [Google Sheets — Crisis AI Negative Level Classification](https://docs.google.com/spreadsheets/d/1umRSp9LEfMlrqbWc5SVN4pivAG0cHaINC0Fumz6YqBU/edit?gid=1704880699#gid=1704880699)
> **Review trước đó:** File Jira attachment không truy cập được (yêu cầu login) — sẽ đánh giá dựa hoàn toàn trên spec + testcase hiện tại.

---

## 1. Nhận xét tổng quan

### ✅ Điểm mạnh
| # | Nhận xét |
|---|---------|
| 1 | **Phủ rộng business rules:** Bộ testcase 64 cases đã bao quát phần lớn BR-01 đến BR-19 và EC-01 đến EC-08. |
| 2 | **Phân tách Create/Edit hợp lý:** Có tách riêng test case cho form Create và Edit (ví dụ: TC-021 vs TC-022, TC-023 vs TC-024). |
| 3 | **Runtime/DLQ coverage tốt:** Phủ đủ DLQ retry chain 4 bước, stop-on-success, batch gom 30s, cost logging. |
| 4 | **QC Regression được cover:** Các QC-01 đến QC-04 đều có testcase tương ứng (TC-056, TC-044, TC-057, TC-055). |
| 5 | **Test data format nhất quán:** Sử dụng placeholder `<variable_name>` đồng nhất toàn bộ bộ testcase. |

### ⚠️ Điểm cần cải thiện
| # | Nhận xét |
|---|---------|
| 1 | **Trùng lặp cao ở nhóm toggle/template:** TC-005 vs TC-007 (hiện/ẩn toggle), TC-009 vs TC-010 (template Level), TC-016 vs TC-017 (cursor position). |
| 2 | **Thiếu negative cases quan trọng** cho runtime: LLM trả JSON malformed, response timeout riêng biệt, concurrent mentions. |
| 3 | **Pre-condition viết tắt, không đủ chi tiết:** Nhiều TC chỉ ghi "User có quyền" — không rõ user nào, môi trường nào, prompt ban đầu trạng thái gì. |
| 4 | **Test Name đôi chỗ khó hiểu** cho người chưa biết nghiệp vụ (ví dụ: "Map crisis_level một hai ba", "Populate toggle dưới ba trăm ms"). |
| 5 | **Thiếu Test Type chính xác:** Nhiều TC thuộc Performance/NFR/Regression nhưng vẫn ghi Test Type = "Functional". |
| 6 | **Thiếu hoàn toàn UI message EN:** Spec định nghĩa cả VN và EN, nhưng testcase chỉ verify VN. |
| 7 | **Priority không nhất quán:** Một số TC coverage Business Rule P1 nhưng lại set Priority = "Medium" hoặc "Low". |

---

## 2. Các lỗi/vấn đề trong testcase hiện tại

### 2.1 Testcases bị trùng lặp

| TC trùng | TC gốc | Vấn đề |
|----------|--------|--------|
| **TC-007** | **TC-005** | Cả hai đều verify toggle hiện/ẩn tức thì không animation khi chuyển task type. TC-007 không thêm giá trị mới so với TC-005. |
| **TC-010** | **TC-009** | TC-009 đã verify chuyển sang Template Level khi bật toggle. TC-010 chỉ verify lại cấu trúc textarea sau khi bật — hoàn toàn trùng expected result. |
| **TC-017** | **TC-016** | TC-016 đã verify "con trỏ đặt ở đầu section Level 1". TC-017 chỉ tách riêng verify cursor — nên gộp vào TC-016. |
| **TC-038** | — | TC-038 test `crisis_level = 0` với toggle OFF nhưng spec BR-12 chỉ định nghĩa `crisis_level = 1` khi toggle OFF. Khi toggle OFF, LLM trả 0 hoặc 1; spec không có BR nào map crisis_level=0 riêng cho toggle OFF. **Cần xác nhận** BR-11 có áp dụng cho toggle OFF không — nếu có, TC hợp lệ nhưng cần ghi rõ mapping logic. |

### 2.2 Testcases có lỗi logic hoặc sai spec

| TC ID | Vấn đề | Spec ref |
|-------|--------|----------|
| **TC-008** | Expected result liệt kê Template A gồm 3 phần (CHỦ THỂ & PHẠM VI, TRƯỜNG HỢP LOẠI TRỪ, QUY TẮC PHÂN LOẠI), nhưng AC US-01-AC-02 chỉ nhắc đến "2 phần: section CHỦ THỂ & PHẠM VI và section QUY TẮC PHÂN LOẠI". **Template A thực tế có 3 section** (CHỦ THỂ & PHẠM VI + TRƯỜNG HỢP LOẠI TRỪ + QUY TẮC PHÂN LOẠI) theo BR-03 → **TC đúng nhưng AC trong spec có thể gây nhầm lẫn.** Cần ghi rõ trong Remarks. | BR-03, US-01-AC-02 |
| **TC-013** | Test name "Tắt toggle mặc định Level không confirm" — spec BR-06 chỉ nói confirmation khi "user **đã chỉnh sửa** nội dung". TC-013 test trường hợp chưa chỉnh sửa → chuyển tức thì là đúng. **Tuy nhiên spec BR-05/BR-06 chỉ explicit nêu chiều OFF→ON cho phần "chưa chỉnh sửa" (BR-05). Chiều ON→OFF chưa chỉnh sửa không được spec nêu riêng.** Cần confirm với BA. | BR-06 |
| **TC-025** | Test name "Lưu Binary chỉ có exclusion mặc định" — expected result ghi "Dòng exclusion mặc định không tính là user đã nhập" nhưng không verify **validation pass** rõ ràng. Cần bổ sung expected: CHỦ THỂ & PHẠM VI và QUY TẮC PHÂN LOẠI đã có nội dung → validation pass. | BR-09 |
| **TC-031, TC-032, TC-033** | Test Type ghi "Functional" nhưng đây rõ ràng là Performance tests. Status ghi "OPEN" nhưng Remarks ghi "Blocked" — mâu thuẫn. | NFR S4 |
| **TC-053** | Tương tự — NFR test nhưng ghi Functional. | NFR S4 |
| **TC-041** | Chỉ test tag trên **testing** env. Expected result nên verify **chỉ tag đúng env hiện tại** (không gán tag của env khác). | BR-14 |

### 2.3 Pre-condition / Test Steps không đủ rõ ràng

| TC ID | Vấn đề cụ thể |
|-------|---------------|
| **TC-001** | Pre-condition ghi "User chưa được cấp manage_crisis_classification_prompt" — nên bổ sung "nhưng có quyền tạo prompt với task type khác" (theo EC-01). |
| **TC-014** | Pre-condition ghi "Đang Edit prompt Binary đã lưu nội dung" — không rõ user đã chỉnh sửa nội dung **so với template mặc định** hay chưa. Theo BR-05, confirmation chỉ hiện khi "đã chỉnh sửa so với template mặc định". Cần ghi rõ. |
| **TC-030** | Test steps ghi "Bấm Save Prompt khi server trả lỗi" — không mô tả cách simulate lỗi server. Cần ghi rõ test data mock. |
| **TC-034** | Pre-condition "Client A/B có prompt crisis khác nhau" — thiếu thông tin cụ thể: khác toggle state hay khác definition? |
| **TC-047** | Test steps chỉ ghi "Chờ và quan sát chuỗi retry" — thiếu chi tiết cách verify từng bước retry (check log, DB, monitoring). |

### 2.4 Từ ngữ / Cách diễn đạt khó hiểu

| TC ID | Test Name hiện tại | Đề xuất cải thiện |
|-------|--------------------|--------------------|
| TC-005 | "Chọn task khác rồi Crisis hiện toggle" | "Toggle hiện khi chuyển sang Crisis Classification và ẩn khi chọn task type khác" |
| TC-006 | "Đổi task type ẩn toggle reset textarea" | "Textarea reset về template mặc định khi đổi Task Type khỏi Crisis Classification" |
| TC-036 | "Map crisis_level một hai ba" | "LLM trả crisis_level 1/2/3 → hệ thống gán negative_level tương ứng" |
| TC-037 | "Map crisis_level bằng không sang null ON" | "Toggle ON: LLM trả crisis_level = 0 → negative_level = null" |
| TC-038 | "Map crisis_level bằng không sang null OFF" | "Toggle OFF: LLM trả crisis_level = 0 → negative_level = null" |
| TC-039 | "Map toggle OFF crisis sang level một" | "Toggle OFF: LLM trả crisis_level = 1 → negative_level = 1, không gọi thêm LLM" |
| TC-033 | "Populate toggle dưới ba trăm ms" | "Response time toggle populate textarea ≤ 300ms (P95)" |
| TC-048 | "DLQ gom batch fail trong ba mươi giây" | "DLQ gom batch: các mention fail trong 30s được retry cùng lượt" |

---

## 3. Testcase cần chỉnh sửa

### 3.1 TC-005 + TC-007 → Gộp thành 1 TC

**Lý do:** Cả hai đều verify toggle hiện/ẩn tức thì khi chuyển task type. Chỉ cần 1 TC với steps đầy đủ hơn.

**TC-005 (cải thiện):**

| Field | Nội dung mới |
|-------|-------------|
| Test Name | Toggle hiện tức thì khi chọn Crisis Classification và ẩn khi chọn task type khác |
| Pre-condition | User đã đăng nhập AI Studio; User có quyền `manage_crisis_classification_prompt`; Đang ở form Create Prompt |
| Test Steps | 1. Chọn `<other_task_type>` trong dropdown Task Type → Quan sát vùng toggle<br>2. Chọn "Crisis Classification" → Quan sát toggle<br>3. Chọn lại `<other_task_type>` → Quan sát toggle |
| Expected Result | - Bước 1: Toggle "Phân loại Negative Level" không hiển thị<br>- Bước 2: Toggle hiện tức thì, mặc định OFF, **không có animation**<br>- Bước 3: Toggle ẩn tức thì, **không có animation** |

→ **Xóa TC-007.**

### 3.2 TC-009 + TC-010 → Gộp

**Lý do:** TC-010 kiểm tra lại cấu trúc textarea đã được verify trong TC-009.

**TC-009 (cải thiện):**

| Field | Nội dung mới |
|-------|-------------|
| Test Name | Bật toggle khi textarea còn template mặc định → chuyển sang Template Level không cần confirm |
| Expected Result | - Không hiển thị confirmation dialog<br>- Toggle chuyển ON<br>- Textarea chuyển sang Template B (Level) gồm:<br>&nbsp;&nbsp;+ CHỦ THỂ & PHẠM VI<br>&nbsp;&nbsp;+ TRƯỜNG HỢP LOẠI TRỪ (với dòng default "Nội dung không phải tiếng Việt")<br>&nbsp;&nbsp;+ QUY TẮC PHÂN LOẠI với 3 cấp: Level 1, Level 2, Level 3<br>- Header Level 1/2/3 hiển thị in đậm, phân biệt rõ<br>- Mỗi section có placeholder mô tả mục đích |

→ **Xóa TC-010.**

### 3.3 TC-016 + TC-017 → Gộp

**Lý do:** TC-017 chỉ verify cursor position đã được ghi trong TC-016.

→ **Xóa TC-017.** TC-016 đã đủ.

### 3.4 TC-031, TC-032, TC-033, TC-053 → Sửa Test Type

| TC ID | Test Type hiện tại | Test Type đúng |
|-------|-------------------|---------------|
| TC-031 | Functional | **Performance** |
| TC-032 | Functional | **Performance** |
| TC-033 | Functional | **Performance** |
| TC-053 | Functional | **NFR / Performance** |

### 3.5 TC-025 → Bổ sung expected result

**Expected Result bổ sung:**
```
- CHỦ THỂ & PHẠM VI đã có nội dung → validation pass
- QUY TẮC PHÂN LOẠI đã có nội dung → validation pass
- TRƯỜNG HỢP LOẠI TRỪ chỉ có dòng mặc định → không ảnh hưởng validation (spec BR-09: mục này "đã có sẵn dòng loại tiếng nước ngoài mặc định — KHÔNG tính là user đã nhập")
- Save thành công, hiển thị toast save.success
```

### 3.6 TC-041 → Bổ sung verify không gán tag env khác

**Expected Result bổ sung:**
```
- Gán system tag 597426 khi crisis_level ≥ 1 trên env testing
- KHÔNG gán tag 593346 (staging) hoặc 602334 (production)
```

---

## 4. Testcase nên bổ sung

### 4.1 Thiếu: UI Messages EN (Spec S5.2)

> [!IMPORTANT]
> Spec S5.2 định nghĩa cả EN và VN cho mọi message key. Testcase hiện tại **chỉ verify VN**. Cần bổ sung ít nhất 1 TC verify EN messages hoặc verify multi-language switch.

| TC ID đề xuất | Test Name | BR/Spec ref |
|---------------|-----------|-------------|
| TC-F05-065 | Verify UI messages hiển thị đúng bản EN khi hệ thống ở ngôn ngữ English | S5.2 |

### 4.2 Thiếu: Validation khi toggle ON — tất cả 3 level đều trống

| TC ID đề xuất | Test Name | Pre-condition | Test Steps | Expected Result | BR ref |
|---------------|-----------|---------------|------------|-----------------|--------|
| TC-F05-066 | Chặn Save khi tất cả 3 level đều trống (toggle ON) | User có quyền; Toggle ON; Cả 3 level chưa nhập definition | 1. Giữ nguyên Template B mặc định<br>2. Bấm "Save Prompt" | - Save bị block<br>- Highlight cả 3 section rỗng<br>- Hiển thị "validation.level_required" | BR-08, EC-04 |

**Tại sao cần:** TC-023 chỉ test "ít nhất 1 level trống", TC-024 chỉ test "xóa 1 level". Trường hợp cả 3 level đều trống (boundary case) chưa được cover.

### 4.3 Thiếu: LLM trả JSON malformed / thiếu key crisis_level

| TC ID đề xuất | Test Name | Expected Result | BR ref |
|---------------|-----------|-----------------|--------|
| TC-F05-067 | LLM trả JSON malformed → DLQ retry | - Response không parse được → DLQ<br>- Retry theo 4 bước | BR-13 |
| TC-F05-068 | LLM trả JSON hợp lệ nhưng thiếu key crisis_level → DLQ retry | - Missing key → treat as invalid → DLQ | BR-13 |

**Tại sao cần:** TC-045 test crisis_level invalid value (-1, 5, "abc"), nhưng chưa test trường hợp **response không phải JSON** hoặc **JSON thiếu key**. Đây là negative case quan trọng trong thực tế vì LLM có thể trả hallucinated response.

### 4.4 Thiếu: Confirmation dialog khi bật toggle trên form Create (user đã chỉnh sửa)

| TC ID đề xuất | Test Name | Pre-condition | Expected Result | BR ref |
|---------------|-----------|---------------|-----------------|--------|
| TC-F05-069 | Hiển thị confirmation khi bật toggle trên form Create với nội dung đã chỉnh sửa | User ở form Create; Task Type = Crisis Classification; User đã chỉnh sửa nội dung template Binary (không phải mặc định); Toggle OFF | - Hiển thị confirmation dialog "confirm.toggle_on"<br>- User confirm → reset sang Template Level<br>- User cancel → giữ nguyên | BR-05, EC-02 |

**Tại sao cần:** TC-014 đến TC-017 chỉ test confirmation trên form **Edit**. BR-05 áp dụng cả Create lẫn Edit ("user đã chỉnh sửa nội dung definition so với template mặc định").

### 4.5 Thiếu: Skip quota/limit với toggle OFF

| TC ID đề xuất | Test Name | Expected Result | BR ref |
|---------------|-----------|-----------------|--------|
| TC-F05-070 | Skip classification khi provider hết quota — toggle OFF | - crisis_level = null, negative_level = null<br>- Mention vào topic queue<br>- Không DLQ retry | BR-19 |

**Tại sao cần:** TC-051 và TC-052 chỉ test skip quota/budget khi toggle ON (hoặc không nêu rõ toggle state). BR-19 áp dụng bất kể toggle state.

### 4.6 Thiếu: Edit prompt — verify giữ đúng toggle state sau reload

| TC ID đề xuất | Test Name | Expected Result | BR ref |
|---------------|-----------|-----------------|--------|
| TC-F05-071 | Mở Edit prompt Binary đã lưu → toggle OFF và textarea đúng | - Toggle hiển thị OFF<br>- Textarea hiển thị nội dung đã lưu (Binary template + user definition) | — |

**Tại sao cần:** TC-029 verify cho prompt Level (toggle ON) sau reload, nhưng **không có TC verify reload prompt Binary (toggle OFF)**.

### 4.7 Thiếu: Concurrent mentions trong DLQ

| TC ID đề xuất | Test Name | Expected Result | BR ref |
|---------------|-----------|-----------------|--------|
| TC-F05-072 | Nhiều mention fail đồng thời từ nhiều client → DLQ xử lý độc lập | - Mỗi mention retry theo prompt riêng của client<br>- Không cross-contaminate giữa client A và B | BR-15 |

### 4.8 Thiếu: Template Tổng (Base) — NGUYÊN TẮC PHÂN TÍCH CHUNG không hiển thị trong textarea

| TC ID đề xuất | Test Name | Expected Result | BR ref |
|---------------|-----------|-----------------|--------|
| TC-F05-073 | Verify phần "NGUYÊN TẮC PHÂN TÍCH CHUNG" (4 bước system-managed) không hiển thị trong textarea | - User **không thấy** NGUYÊN TẮC PHÂN TÍCH CHUNG trong textarea<br>- Section này chỉ được ghép lúc runtime | BR-03, BR-04, US-01-AC-02 |

**Tại sao cần:** TC-008 có nhắc "NGUYÊN TẮC PHÂN TÍCH CHUNG không hiển thị trong textarea" nhưng chỉ ở expected result phụ. Cần TC riêng vì đây là behavior quan trọng — user dễ thắc mắc tại sao không thấy phần này.

### 4.9 Thiếu: Discount = 0% verification

| TC ID đề xuất | Test Name | Expected Result | BR ref |
|---------------|-----------|-----------------|--------|
| TC-F05-074 | Verify discount rate = 0% cho task type CRISIS_SEVERITY_CLASSIFICATION | - Không apply discount khi tính cost<br>- AI Usage Dashboard hiển thị đúng cost | LLM Request table |

### 4.10 Thiếu: Edge case — Toggle OFF rồi ON nhiều lần liên tục

| TC ID đề xuất | Test Name | Expected Result | BR ref |
|---------------|-----------|-----------------|--------|
| TC-F05-075 | Toggle OFF → ON → OFF → ON liên tục trên form Create | - Mỗi lần chuyển template đúng (Binary ↔ Level)<br>- Không bị bug UI/state stale<br>- Nội dung mặc định đúng sau mỗi lần toggle | BR-05, BR-06 |

---

## 5. Bộ testcase phiên bản cải thiện — Tóm tắt thay đổi

### Thay đổi trên TC hiện tại

| Hành động | TC IDs | Chi tiết |
|-----------|--------|----------|
| **Gộp** | TC-005 + TC-007 | Giữ TC-005, xóa TC-007 |
| **Gộp** | TC-009 + TC-010 | Giữ TC-009, xóa TC-010 |
| **Gộp** | TC-016 + TC-017 | Giữ TC-016, xóa TC-017 |
| **Sửa Test Type** | TC-031, TC-032, TC-033, TC-053 | Functional → Performance/NFR |
| **Sửa Priority** | TC-006 | Low → Medium (cover BR-07) |
| **Bổ sung Expected Result** | TC-025 | Thêm rõ validation pass logic |
| **Bổ sung Expected Result** | TC-041 | Thêm verify không gán tag env khác |
| **Cải thiện Test Name** | TC-005, TC-006, TC-036, TC-037, TC-038, TC-039, TC-033, TC-048 | Sửa cho dễ hiểu |
| **Cải thiện Pre-condition** | TC-001, TC-014, TC-030, TC-034, TC-047 | Bổ sung chi tiết |
| **Confirm logic** | TC-013, TC-038 | Cần confirm với BA |

### Testcase bổ sung mới

| TC ID | Tên | Loại | BR/Spec ref |
|-------|-----|------|-------------|
| TC-F05-065 | UI messages EN | Functional | S5.2 |
| TC-F05-066 | Block Save — tất cả 3 level trống | Negative / Boundary | BR-08 |
| TC-F05-067 | LLM trả JSON malformed → DLQ | Negative | BR-13 |
| TC-F05-068 | LLM trả JSON thiếu key crisis_level → DLQ | Negative | BR-13 |
| TC-F05-069 | Confirmation toggle trên form Create (đã chỉnh sửa) | Functional | BR-05 |
| TC-F05-070 | Skip quota/limit — toggle OFF | Functional | BR-19 |
| TC-F05-071 | Reload prompt Binary — verify toggle OFF | Functional | — |
| TC-F05-072 | Concurrent mentions DLQ cross-client | Functional / Edge | BR-15 |
| TC-F05-073 | NGUYÊN TẮC PHÂN TÍCH CHUNG ẩn trong textarea | UI/UX | BR-03, BR-04 |
| TC-F05-074 | Discount rate = 0% | Functional | LLM Request |
| TC-F05-075 | Toggle liên tục OFF→ON→OFF→ON | Edge / UI | BR-05, BR-06 |

---

## 6. Phân tích lý do từng nhóm testcase phải có trong bộ test

### 6.1 Permission / Quyền truy cập (TC-001 → TC-003)

**Tại sao phải có:**
- **BR-01** là **điều kiện tiên quyết** cho toàn bộ feature. Nếu permission bị bypass, user không có quyền có thể tạo/sửa prompt Crisis Classification → **rủi ro bảo mật nghiêm trọng**.
- TC-001 (Create) và TC-003 (Edit) tách riêng vì logic ẩn option có thể implement khác nhau trên 2 form.
- TC-002 (có quyền → thấy option) là **happy case** đối lập, xác nhận option thực sự hiển thị khi đủ quyền.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-001 | Negative permission — Create | Xác nhận option Crisis Classification **ẩn** khi user không có quyền. Nếu fail → user trái phép tạo prompt crisis. |
| TC-002 | Happy permission — Create | Xác nhận option **hiện** khi user có quyền. Nếu fail → Crisis Team không thể làm việc. |
| TC-003 | Negative permission — Edit | Xác nhận trên form Edit (khác form Create). Cần test riêng vì Edit load prompt có sẵn → logic dropdown có thể khác. |

### 6.2 Toggle hiển thị / ẩn theo Task Type (TC-004 → TC-007)

**Tại sao phải có:**
- **BR-02** quy định toggle **chỉ hiện khi Task Type = Crisis Classification**. Nếu toggle hiện sai task type → user có thể bật Negative Level cho task type không hỗ trợ → LLM nhận prompt sai format.
- **BR-07** quy định khi đổi task type → toggle ẩn, textarea reset. Nếu fail → textarea giữ template crisis khi user đã chọn task type khác → save prompt sai logic.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-004 | Negative — task type khác | Toggle **không hiển thị** khi chọn task type ≠ Crisis Classification. Verify BR-02. |
| TC-005 | Transition — chuyển qua lại | Verify toggle **hiện/ẩn tức thì** khi user thay đổi task type qua lại. Verify transition behavior + không animation (UX spec). |
| TC-006 | Transition + reset | Khi đổi khỏi Crisis Classification → textarea **reset** về template task type mới. Verify BR-07. Nếu fail → data cũ leak sang task type mới. |

### 6.3 Template Binary (Toggle OFF) (TC-008)

**Tại sao phải có:**
- **BR-03** định nghĩa template mặc định khi toggle OFF. Đây là **trạng thái khởi tạo** — mọi interaction tiếp theo (toggle, save, edit) đều dựa trên trạng thái này.
- Nếu template Binary sai cấu trúc → user điền definition vào sai section → LLM nhận prompt sai → phân loại sai crisis.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-008 | Happy case — initial state | Verify template A hiển thị đúng cấu trúc 3 section: CHỦ THỂ & PHẠM VI, TRƯỜNG HỢP LOẠI TRỪ (có default tiếng Việt), QUY TẮC PHÂN LOẠI. Verify NGUYÊN TẮC PHÂN TÍCH CHUNG ẩn. |

### 6.4 Chuyển đổi template khi toggle (TC-009, TC-011 → TC-020)

**Tại sao phải có:**
- **BR-04, BR-05, BR-06** là **core logic** của feature: toggle ON/OFF chuyển template Level ↔ Binary. Nếu template không đổi hoặc đổi sai → LLM nhận prompt sai format → phân loại crisis sai cấp độ.
- **Confirmation dialog** bảo vệ user khỏi mất data khi có nội dung đã chỉnh sửa. Nếu dialog không hiện → user mất definition đã nhập mà không được cảnh báo.
- **Cancel** phải giữ nguyên trạng thái — nếu fail → user bấm Cancel nhưng nội dung bị xóa.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-009 | Happy — toggle ON khi chưa sửa | Chuyển template tức thì, không confirm. Verify BR-04 + BR-05. |
| TC-011 | UI/UX — header in đậm | Verify header Level 1/2/3 rõ ràng + placeholder. Nếu fail → user không biết nhập gì vào đâu. |
| TC-012 | UI/UX — header read-only | Verify user không xóa header. Nếu fail → user xóa nhầm → template bị phá cấu trúc → LLM parse sai. |
| TC-013 | Toggle OFF khi chưa sửa | Chiều ngược TC-009. Verify chuyển tức thì không confirm. |
| TC-014 | Confirm dialog — bật toggle (Edit) | **Critical:** Verify dialog hiện khi có nội dung đã sửa. Protect against data loss. |
| TC-015 | Cancel — giữ nguyên | Verify Cancel → trạng thái không đổi. |
| TC-016 | Confirm — reset template + cursor | Verify confirm → reset đúng template + cursor position. |
| TC-018 | Confirm dialog — tắt toggle | Chiều ngược TC-014. Protect against data loss. |
| TC-019 | Cancel — giữ nguyên (tắt) | Verify Cancel → trạng thái không đổi (chiều ngược TC-015). |
| TC-020 | Confirm — reset về Binary | Verify confirm tắt → reset đúng Binary template. |

### 6.5 Validation Save (TC-021 → TC-027)

**Tại sao phải có:**
- **BR-08, BR-09** là **gate keeper** ngăn user lưu prompt không hợp lệ. Prompt không đủ definition → LLM không có đủ rule → phân loại crisis sai → **ảnh hưởng trực tiếp đến client**.
- Cần test cả **Create** và **Edit** vì logic validation có thể implement khác nhau.
- Cần test **boundary**: chỉ thiếu 1 level, tất cả level trống, chỉ có exclusion mặc định.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-021 | Negative — Binary mặc định (Create) | Block save khi textarea chỉ có template mặc định. Verify BR-09. |
| TC-022 | Negative — Binary mặc định (Edit) | Tương tự TC-021 trên form Edit. |
| TC-023 | Negative — thiếu 1 level (ON) | Block save khi 1/3 level trống. Verify BR-08. |
| TC-024 | Negative — thiếu level (Edit) | Tương tự TC-023 trên form Edit. |
| TC-025 | Edge — chỉ có exclusion mặc định | Verify exclusion mặc định **không** tính là user nhập → save vẫn pass nếu CHỦ THỂ + QUY TẮC đã có. |
| TC-026 | Happy — save Binary hợp lệ | Save thành công với definition đầy đủ. |
| TC-027 | Happy — save Level đầy đủ | Save thành công với đủ 3 level definition. |
| TC-058 | Boundary — thiếu CHỦ THỂ | Tách riêng từng section rỗng để verify validation chỉ xét 2 section (BR-09). |
| TC-059 | Boundary — thiếu QUY TẮC | Tương tự TC-058 cho section QUY TẮC. |

### 6.6 Save Success / Error (TC-028 → TC-030, TC-064)

**Tại sao phải có:**
- **Happy case save** (TC-027, TC-028) xác nhận luồng chính hoạt động.
- **Error handling** (TC-030) xác nhận user không mất data khi server lỗi → **critical UX requirement** (EC-06).
- **Reload verify** (TC-029) xác nhận data persistence.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-028 | Happy — Edit save Level | Save thành công sau edit. |
| TC-029 | Data persistence — reload | Mở lại prompt đã lưu → toggle + nội dung đúng. Verify DB lưu đúng. |
| TC-030 | Error handling — server fail | Giữ form + nội dung khi save fail. Verify EC-06. |
| TC-064 | Happy — Edit save Binary | Save thành công + verify data sau reload cho Binary. |

### 6.7 Performance / NFR (TC-031 → TC-033, TC-053)

**Tại sao phải có:**
- **S4 Non-functional Requirements** định nghĩa ngưỡng P95 cụ thể. Nếu Save > 2s hoặc toggle populate > 300ms → UX kém → user bỏ cuộc hoặc bấm nút nhiều lần gây duplicate.
- **LLM output stability ≥ 95%** → nếu dưới ngưỡng → DLQ quá tải → mention bị skip nhiều → client mất data crisis.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-031 | NFR — Save response time | P95 < 2s. |
| TC-032 | NFR — Save boundary 5000 chars | Boundary case tại chính ngưỡng NFR. |
| TC-033 | NFR — Toggle populate time | P95 < 300ms. |
| TC-053 | NFR — LLM output stability | ≥ 95% output hợp lệ. |

### 6.8 Runtime — Prompt assembly (TC-034, TC-035)

**Tại sao phải có:**
- **Template Tổng (Base)** ghép 4 phần theo thứ tự cụ thể. Nếu sai thứ tự → LLM nhận prompt lộn xộn → phân loại sai.
- **Per-client prompt** — nếu dùng prompt chung → client A nhận definition của client B → phân loại crisis theo rule sai.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-034 | Isolation — per client | Verify mỗi client dùng prompt riêng. |
| TC-035 | Order — prompt assembly | Verify thứ tự 4 section trong full prompt gửi LLM. |

### 6.9 Runtime — crisis_level mapping (TC-036 → TC-040)

**Tại sao phải có:**
- **BR-10, BR-11, BR-12** là **core mapping logic** từ LLM output → database field. Nếu mapping sai → mention gán sai level → Moderator thấy sai mức độ nghiêm trọng → escalate sai nhóm → **ảnh hưởng trực tiếp client**.
- Cần test cả 2 toggle state (ON/OFF) vì mapping logic khác nhau.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-036 | Happy — level 1/2/3 → negative_level | Verify BR-10. Core mapping. |
| TC-037 | Happy — level 0 (ON) → null | Verify BR-11. Non-crisis mention. |
| TC-038 | Happy — level 0 (OFF) → null | Verify behavior khi toggle OFF + LLM trả 0. |
| TC-039 | Happy — toggle OFF, level 1 → 1 | Verify BR-12. Toggle OFF chỉ có crisis/non-crisis, level luôn = 1. |
| TC-040 | Schema — no `reason` key | Verify cost optimization: output chỉ có crisis_level. |

### 6.10 System tag (TC-041 → TC-044, TC-062, TC-063)

**Tại sao phải có:**
- **BR-14** gán tag theo environment. Tag sai → downstream features (04-F02 alert, 04-F03 monitoring) không hoạt động → hệ thống bị "mù" trước crisis.
- **QC-02** cần verify tag chỉ gán bởi pipeline, không bởi topic creation.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-041 | Happy — tag testing env | Verify tag ID 597426 trên testing. |
| TC-042 | Negative — no tag when level=0 | Verify không gán tag cho non-crisis. |
| TC-043 | Negative — no tag after DLQ skip | Verify không gán tag khi pipeline fail hoàn toàn. |
| TC-044 | QC-02 — no tag on topic creation | Verify tag chỉ từ pipeline, không từ topic creation event. |
| TC-062 | Happy — tag staging env | Verify tag ID 593346 trên staging. |
| TC-063 | Happy — tag production env | Verify tag ID 602334 trên production. |

### 6.11 DLQ Retry Chain (TC-045 → TC-050, TC-060, TC-061)

**Tại sao phải có:**
- **BR-13, BR-15 → BR-18** định nghĩa **chuỗi fallback 4 bước** — đây là safety net để đảm bảo mention crisis không bị bỏ sót. Nếu retry chain sai → mention bị skip quá sớm hoặc retry vô hạn.
- **Batch gom 30s** (TC-048) — nếu không gom → mỗi fail retry riêng → tốn resource.
- **Stop-on-success** (TC-049, TC-060, TC-061) — nếu không dừng → gọi thêm model đắt tiền khi không cần thiết.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-045 | Trigger DLQ — invalid value | Verify DLQ kích hoạt đúng khi value ngoài {0,1,2,3}. |
| TC-046 | Trigger DLQ — transient error | Verify DLQ kích hoạt đúng khi provider lỗi tạm thời (≠ quota). |
| TC-047 | Full chain — 4 bước | Verify đúng thứ tự: gpt-5-mini → gpt-5-mini → gpt-4.1 → gemini-3. |
| TC-048 | Batch — gom 30s | Verify mentions fail trong 30s được gom batch. |
| TC-049 | Stop-on-success — retry 2 | Verify dừng sau retry 2 thành công. |
| TC-050 | Full fail — skip mention | Verify skip + null assignment + log sau 4 fail. |
| TC-060 | Stop-on-success — retry 3 (gpt-4.1) | Verify dừng sau retry 3 (gpt-4.1) thành công. |
| TC-061 | Stop-on-success — retry 4 (Gemini) | Verify dừng sau retry 4 (Gemini) thành công. |

### 6.12 Skip Quota / Budget (TC-051, TC-052)

**Tại sao phải có:**
- **BR-19** phân biệt rõ: lỗi quota/limit → **skip ngay** (không DLQ). Nếu implementation vẫn DLQ → retry vô ích cùng account → lãng phí resource + delay.
- **EC-08** yêu cầu alert khác nhau: limit nội bộ → notify Head; limit provider → không alert.

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-051 | Skip — provider quota | Verify skip ngay, không DLQ, không alert nội bộ. |
| TC-052 | Skip — budget cap nội bộ | Verify skip ngay, không DLQ, **có** notify department Head. |

### 6.13 Regression / QC Notes (TC-054 → TC-057)

**Tại sao phải có:**
- Feature F05 **mở rộng** hệ thống có sẵn. Cần đảm bảo các behavior cũ **không bị break**:
  - QC-01: `is_noisy` reset
  - QC-02: Tag trigger source
  - QC-03: DLQ scope
  - QC-04: Cost logging

**Chi tiết:**
| TC | Vai trò | Lý do chi tiết |
|----|---------|---------------|
| TC-054 | Registry — task type + run type | Verify F05 đăng ký đúng registry. |
| TC-055 | QC-04 — cost logging 5 records | Verify 5 bản ghi riêng (1 gọi + 4 retry). |
| TC-056 | QC-01 — is_noisy reset | Verify flag reset khi crisis confirmed. |
| TC-057 | QC-03 — DLQ scope | Verify DLQ chỉ áp dụng luồng copy-data, không ảnh hưởng re-run sentiment / gỡ spam tay. |

---

## 7. Đánh giá file review trước (Jira attachment)

> **File:** [test_case_review_nhipt.md](file:///Users/tranthanhlam/YNM-testing/Document/test_case_review_nhipt.md)
> **Reviewer trước:** AI `/ynm-qc-review-testcase` — ngày 24/07/2026
> **Score trước:** 6.0/10 — NEED_FIX
> **Số TC lúc review:** 57 cases (TC-F05-001 → TC-F05-057)

### 7.1 Tổng quan: Review trước **đúng phần lớn** nhưng có thiếu sót

| Khía cạnh | Đánh giá |
|-----------|----------|
| **Cấu trúc review** | ✅ **Tốt** — Chia rõ Fix / Add / Dup / Appendix, có Action Board, Checklist, Coverage matrix |
| **Phát hiện lỗi** | ✅ **Chính xác 12/17 findings** |
| **GAP analysis** | ⚠️ **5 GAP đúng nhưng thiếu 12 GAP khác** |
| **Coverage matrix** | ✅ **Đúng** — khớp phân tích của tôi |

### 7.2 Từng Finding — Đánh giá chi tiết

| Finding | TC | Nội dung | Đúng? | Ghi chú |
|---------|-----|---------|:-----:|---------|
| F-01 Critical | TC-041 | Tag `597462` → `597426` | ✅ | Typo data. **Đã fix** trong bản 64 TC hiện tại |
| F-02 Major | TC-009 | Thiếu TRƯỜNG HỢP LOẠI TRỪ | ✅ | **Đã fix** — TC-009 hiện tại đã bổ sung |
| F-03 Major | TC-020 | "2 section" sai → BR-03 = 3 mục | ✅ | **Đã fix** — TC-020 hiện tại ghi 3 section |
| F-04 Major | TC-043 | Thiếu assert null levels | ✅ | **Đã fix** — TC-043 hiện tại đã có |
| F-05 Major | TC-038 | OFF + level=0 không có BR | ✅ | Vẫn valid — cần BA confirm |
| F-06 Major | 016/017 | Trùng Confirm + cursor | ✅ | Tôi cũng phát hiện (mục 3.3) |
| F-07 Major | 025/026 | Trùng Save Binary | ⚠️ | **Cần cân nhắc** — TC-025 test edge case exclusion mặc định (BR-09). Nên **giữ + cải thiện**, không xóa |
| F-08 Major | 031-033,053 | NFR = Functional | ✅ | Tôi cũng phát hiện (mục 3.4) |
| F-09 Minor | TC-002 | "bình thường" mơ hồ | ✅ | |
| F-10 Minor | TC-033 | "không lag rõ rệt" | ✅ | |
| F-11 Minor | TC-008 | Thiếu dòng exclusion default | ✅ | |
| F-12→16 Minor | Nhiều | Module/Priority/Trace/Name | ✅ | |

### 7.3 GAP Analysis — 5 GAP đều đúng

| GAP | Nội dung | Đúng? | Đã fix? |
|-----|---------|:-----:|:-------:|
| GAP-01 P0 | BR-09 tách từng field | ✅ | ✅ TC-058, TC-059 |
| GAP-02 P1 | Mid-success retry 3/4 | ✅ | ✅ TC-060, TC-061 |
| GAP-03 P1 | Tag staging/production | ✅ | ✅ TC-062, TC-063 |
| GAP-04 P1 | OFF + level lạ | ✅ | ❌ Chưa fix |
| GAP-05 P1 | Edit Binary Save OK | ✅ | ✅ TC-064 |

### 7.4 Review trước **BỊ THIẾU** — 12 GAP tôi phát hiện thêm

| # | GAP thiếu | TC đề xuất | Tại sao quan trọng |
|---|----------|------------|-------------------|
| 1 | UI Messages EN (S5.2) | TC-065 | Spec có cả EN/VN, TC chỉ verify VN |
| 2 | Tất cả 3 level trống (ON) | TC-066 | Boundary case BR-08 |
| 3 | LLM trả JSON malformed | TC-067 | Negative case thực tế |
| 4 | LLM thiếu key crisis_level | TC-068 | Negative case thực tế |
| 5 | Confirm toggle trên form Create | TC-069 | BR-05 áp dụng cả Create |
| 6 | Skip quota toggle OFF | TC-070 | BR-19 bất kể toggle state |
| 7 | Reload prompt Binary | TC-071 | TC-029 chỉ verify Level |
| 8 | Concurrent DLQ cross-client | TC-072 | Edge case isolation |
| 9 | NGUYÊN TẮC ẩn trong textarea | TC-073 | UI behavior quan trọng |
| 10 | Discount rate = 0% | TC-074 | LLM Request spec |
| 11 | Toggle liên tục OFF→ON→OFF→ON | TC-075 | Edge case UI state |
| 12 | TC-010 trùng TC-009 | — | Cặp trùng không flagged |

### 7.5 Điểm nên điều chỉnh

| # | Điểm | Lý do |
|---|------|-------|
| 1 | **F-07: Nên giữ TC-025** | Edge case exclusion mặc định ≠ duplicate |
| 2 | **GAP-04 nên P0** | Toggle OFF + invalid level là scenario thực tế |
| 3 | **Score 6.0 hơi khắt khe** | Hợp lý hơn: **6.5-7.0/10** |

### 7.6 Kết luận

> [!NOTE]
> Review trước **đúng hướng và chuyên nghiệp** — 12/17 findings chính xác, 5/5 GAP hợp lệ, **8/17 issues đã được fix** trong bản 64 TC hiện tại. Tuy nhiên còn **thiếu 12 GAP** về negative cases (JSON malformed), multi-language, edge cases toggle, và concurrent DLQ.

---

## 8. Ma trận traceability: Business Rule → Testcase

| BR ID | Nội dung tóm tắt | TC hiện tại | TC thiếu (đề xuất) | Đánh giá |
|-------|-------------------|-------------|---------------------|----------|
| BR-01 | Ẩn Crisis Classification khi thiếu quyền | TC-001, TC-002, TC-003 | — | ✅ Đủ |
| BR-02 | Toggle ẩn khi task type ≠ Crisis Classification | TC-004, TC-005 | — | ✅ Đủ |
| BR-03 | Toggle OFF → Template Binary | TC-008 | TC-073 (NGUYÊN TẮC ẩn) | ⚠️ Cần bổ sung |
| BR-04 | Toggle ON → Template Level | TC-009, TC-011, TC-012 | — | ✅ Đủ |
| BR-05 | Confirm khi bật toggle (đã sửa) | TC-014, TC-015, TC-016 | TC-069 (Create) | ⚠️ Cần bổ sung |
| BR-06 | Confirm khi tắt toggle (đã sửa) | TC-018, TC-019, TC-020 | — | ✅ Đủ |
| BR-07 | Đổi task type → reset | TC-006 | — | ✅ Đủ |
| BR-08 | Block save thiếu level (ON) | TC-023, TC-024 | TC-066 (tất cả trống) | ⚠️ Cần bổ sung |
| BR-09 | Block save thiếu definition (OFF) | TC-021, TC-022, TC-025, TC-058, TC-059 | — | ✅ Đủ |
| BR-10 | crisis_level 1/2/3 → negative_level | TC-036 | — | ✅ Đủ |
| BR-11 | crisis_level 0 → null | TC-037 | — | ✅ Đủ |
| BR-12 | Toggle OFF → level 1 | TC-039 | — | ✅ Đủ |
| BR-13 | Invalid/error → DLQ | TC-045, TC-046 | TC-067, TC-068 (malformed JSON) | ⚠️ Cần bổ sung |
| BR-14 | System tag per env | TC-041, TC-042, TC-043, TC-044, TC-062, TC-063 | — | ✅ Đủ |
| BR-15 | DLQ retry 2 — same model | TC-047, TC-048, TC-049 | — | ✅ Đủ |
| BR-16 | DLQ retry 3 — gpt-4.1 | TC-047, TC-060 | — | ✅ Đủ |
| BR-17 | DLQ retry 4 — Gemini | TC-047, TC-061 | — | ✅ Đủ |
| BR-18 | All fail → skip | TC-050 | — | ✅ Đủ |
| BR-19 | Quota/budget → skip (no DLQ) | TC-051, TC-052 | TC-070 (toggle OFF) | ⚠️ Cần bổ sung |

---

## 9. Tổng kết

| Chỉ số | Giá trị |
|--------|---------|
| Tổng TC hiện tại | 64 |
| TC nên xóa/gộp | 3 (TC-007, TC-010, TC-017) |
| TC cần sửa | 12 |
| TC nên bổ sung | 11 |
| Tổng TC sau cải thiện | **72** |
| % BR được cover | 100% (19/19 BR) |
| % EC được cover | 100% (8/8 EC) sau bổ sung |
| % QC Regression | 100% (4/4 QC notes) |

> [!TIP]
> **Ưu tiên hành động:**
> 1. Gộp 3 TC trùng lặp → giảm noise
> 2. Bổ sung TC-066 đến TC-069 (boundary + negative cases) → tăng độ phủ critical
> 3. Sửa Test Type cho NFR tests
> 4. Cải thiện Test Name cho dễ hiểu
> 5. Bổ sung các TC còn lại (070-075)
