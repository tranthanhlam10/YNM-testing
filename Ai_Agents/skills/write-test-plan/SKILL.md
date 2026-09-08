---
name: write-test-plan
description: Viết test plan QA bằng tiếng Việt từ Jira, Wiki, tài liệu BA/Dev, source code hoặc nội dung chat; dùng khi cần lập mới hay hoàn thiện kế hoạch kiểm thử, không dùng cho review-only hoặc viết test cases chi tiết.
---

# Viết test plan

Tạo test plan đủ căn cứ để QA execute và stakeholders review. Đọc [references/test-plan-standard.md](references/test-plan-standard.md) trước khi soạn vì đây là contract về cấu trúc và quality gate.

## Nguồn và công cụ

- Đọc toàn bộ nguồn người dùng chỉ định trước khi chốt scope. Với file local, tìm bằng task key hoặc tên feature nếu đường dẫn chưa rõ.
- Với Jira, Confluence/Wiki, Google Drive hoặc nguồn nội bộ, dùng connector/MCP đã cấu hình; không mở browser chỉ để đọc các link này. Nếu không truy cập được nguồn bắt buộc, nói rõ nguồn nào thiếu và chỉ tạo bản draft khi người dùng chấp nhận hoặc nội dung còn lại đủ căn cứ.
- Khi làm trong repo có `Ai_Agents/templates/codex`, kiểm tra prompt authoring test plan mới nhất. Bản baseline của skill là `testplan_template_codex_2508.md`; nếu có bản mới hơn, áp dụng các quy tắc dùng chung mới nhưng bỏ task key, URL, đường dẫn và giá trị ví dụ gắn với feature cũ. Bỏ qua prompt review/rewrite khi yêu cầu là viết mới.
- Dùng các test plan trong `Ai_Agents/test_plans` để học mức chi tiết và convention, không sao chép facts của feature khác.

## Phân tích requirement

1. Lập inventory nguồn và tách rõ: business requirement/AC của BA, technical design của Dev, comment/decision mới, code/config quan sát được và test artifact cũ.
2. Xác định release boundary và test oracle. BA/AC quyết định hành vi nghiệp vụ; technical design quyết định điểm tích hợp và cách quan sát. Không biến implementation detail thành requirement nếu nguồn không nói vậy.
3. Trích rule, boundary, state transition, role/permission, data mapping, dependency, failure mode và non-functional constraint có thật. Dùng decision table hoặc flow khi logic có nhiều nhánh.
4. Khi nguồn mâu thuẫn hoặc thiếu dữ liệu ảnh hưởng expected/scope, không tự chọn một cách hiểu. Ghi `[Giả định - Assumption] (Need Confirm)` kèm tác động và người/nhóm cần xác nhận.
5. Chỉ chọn loại test phù hợp. Không thêm UI, security, performance, compatibility hoặc migration chỉ để đủ danh mục.

## Viết và lưu

- Viết tiếng Việt có dấu, chuyên nghiệp, rõ với QA fresher, BA, Dev và stakeholder ít nền tảng kỹ thuật; giữ thuật ngữ IT phổ biến khi chúng chính xác hơn.
- Giữ đúng 7 phần bắt buộc trong standard. Có thể thêm metadata, glossary, rule/decision table, traceability và phụ lục nếu chúng làm test plan executable hơn.
- Mọi con số, config, queue/table/API, lịch, threshold và tiêu chí pass phải có nguồn hoặc được đánh dấu Need Confirm.
- Mặc định lưu Markdown trực tiếp vào `/Users/tranthanhlam/YNM-testing/Ai_Agents/test_plans` với tên `TestPlan_<TASK>_<Feature>.md`. Chỉ dùng thư mục khác khi người dùng chỉ định rõ; không ghi đè file hiện có ngoài yêu cầu.
- Trước khi bàn giao, chạy quality gate trong reference và báo file đã tạo cùng các blocker/Need Confirm quan trọng nhất.
