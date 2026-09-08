# Chuẩn test plan cá nhân

Chuẩn này được tổng hợp từ `Ai_Agents/templates/codex/testplan_template_codex_2508.md` và các test plan mẫu trong `Ai_Agents/test_plans` tại ngày 25/08/2026.

## Vị trí lưu mặc định

- Thư mục: `/Users/tranthanhlam/YNM-testing/Ai_Agents/test_plans`
- Tên file: `TestPlan_<TASK>_<Feature>.md`
- Không tự tạo subfolder hoặc ghi đè file trùng tên nếu người dùng chưa yêu cầu.

## Cấu trúc bắt buộc

Trình bày bằng Markdown, có title và metadata/source links khi biết, sau đó giữ đủ 7 phần theo thứ tự:

1. **MỤC TIÊU & TỔNG QUAN (Introduction & Objective)**
   - Tính năng làm gì, vấn đề cần giải quyết, đối tượng/luồng chịu tác động.
   - Với backend/data flow phức tạp, giải thích ngắn bằng ngôn ngữ dễ hiểu và tóm tắt luồng kỹ thuật.
2. **PHẠM VI KIỂM THỬ (Scope of Testing)**
   - In-Scope: component, platform, country/domain, data flow và ranh giới sẽ test.
   - Out-of-Scope: phần không test và lý do; không đưa phần chưa rõ vào out-of-scope để né xác nhận.
3. **CHIẾN LƯỢC KIỂM THỬ (Test Strategy & Approach)**
   - Chỉ chọn các loại cần thiết: Functional, UI/UX, API/Integration, Data Migration/Sync, Performance, Security, Compatibility, Reliability/Recovery.
   - Với logic nhiều nhánh, thêm rule table/decision table, boundary, test oracle, cách tạo data và evidence tối thiểu.
4. **MÔI TRƯỜNG KIỂM THỬ (Test Environment)**
   - Environment, service/component, platform/device/browser cần thiết.
   - Quyền truy cập, dependency, config/feature flag, observability và test data tối thiểu nếu đã có căn cứ.
5. **TIÊU CHÍ ĐÁNH GIÁ (Entry & Exit Criteria)**
   - Entry phải đo được: build/deploy, unit/integration status, config, data, access và requirement blocking đã chốt.
   - Exit phải đo được: execution scope hoàn tất, defect threshold, regression/data integrity và evidence/sign-off. Không dùng tiêu chí tuyệt đối không khả thi nếu nguồn không yêu cầu.
6. **RỦI RO & HƯỚNG GIẢI QUYẾT (Risks & Mitigations)**
   - Ít nhất 2–3 risk cụ thể. Mỗi risk nêu impact/likelihood hoặc priority khi hữu ích, dấu hiệu phát hiện và mitigation/owner phù hợp.
7. **TÀI LIỆU BÀN GIAO (Deliverables)**
   - Chỉ liệt kê artifact thực tế: Test Plan, Test Cases/data, Bug Report, evidence, Test Summary/Sign-off.

Có thể thêm phụ lục cho checklist release, open questions hoặc traceability. Không đổi nghĩa/rút mất 7 phần trên.

## Quy tắc nguồn và Need Confirm

- Dẫn link/path tới nguồn đã dùng. Phân biệt facts đã xác nhận, quan sát từ implementation và assumption.
- Format khuyến nghị: `**[Giả định - Assumption] (Need Confirm):** <điểm chưa rõ>.` Sau đó nêu tác động và owner xác nhận.
- Mâu thuẫn BA–Dev phải hiển thị cả hai cách hiểu và phần test/release bị block; không hòa giải bằng suy đoán.
- Không bê task ID, ngày, config, metric hoặc architecture từ test plan mẫu.

## Quality gate trước bàn giao

- 7 phần bắt buộc đều có nội dung phù hợp feature; numbering không lặp sai.
- Scope, strategy, environment, entry/exit, risk và deliverable liên kết logic với nhau.
- Rule quan trọng có test approach/oracle; boundary và failure path chính không bị bỏ sót.
- Mọi exact value có nguồn hoặc Need Confirm.
- Out-of-scope và release boundary rõ, đặc biệt với downstream/upstream integration.
- Không tuyên bố “bao phủ 100%” nếu chưa có traceability chứng minh.
- File Markdown render được, link/path đúng, tiếng Việt có dấu và không còn placeholder của prompt mẫu.
