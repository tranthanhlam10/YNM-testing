---
name: write-test-cases
description: Viết test cases QA ngắn gọn, dễ hiểu bằng tiếng Việt và đồng bộ task/module vào Google Sheet Overview; dùng khi cần tạo test cases mới theo template 7 cột, không dùng cho review-only hay chỉ lập test plan.
---

# Viết test cases

Mục tiêu: người chưa biết tính năng vẫn hiểu **test gì, làm thế nào và pass khi nào**, nhưng không phải đọc nội dung lặp hoặc kỹ thuật không cần thiết.

Đọc [references/test-case-standard.md](references/test-case-standard.md) trước khi viết.

## Workflow tiết kiệm token

1. Đọc test plan trước để lấy scope, flow, rule, boundary và risk.
2. Nếu test plan đã rõ, không đọc toàn bộ BA/Dev document. Tìm theo BR/AC, field hoặc thông báo và chỉ đọc đoạn cần xác nhận; chỉ đọc technical spec cho case integration hoặc expected còn thiếu.
3. Trong `Ai_Agents/templates/codex`, chỉ liệt kê để phát hiện prompt authoring mới hơn `testcase_template_codex_2508.md`; chỉ đọc khi thật sự có bản mới. Không đọc prompt review/rewrite khi viết mới.
4. Chỉ mở 1–3 testcase tham khảo gần nhất khi cần học convention; không đọc cả thư mục.
5. Không chép requirement dài ra output. Giữ traceability nội bộ; chỉ xuất mã BR/AC khi người dùng yêu cầu.

Với Jira, Wiki, Google Drive và Google Sheets, **chỉ dùng MCP/connector đã cấu hình**. Không dùng browser, CUA/computer-use, WebMCP hay web search để đọc, ghi hoặc verify. Nếu MCP thiếu thao tác bắt buộc, báo đúng blocker; không fallback sang trình duyệt.

## Thiết kế

- Tạo bộ case **tối thiểu nhưng đủ coverage**; không mặc định một AC thành một case.
- Một case kiểm tra một hành vi có thể pass/fail độc lập. Gộp boundary/biến thể khi chúng dùng cùng setup và steps; tách khi cần chẩn đoán lỗi riêng.
- Ưu tiên user flow, validation, business rule và lỗi thực tế. Chỉ thêm API/DB/queue/log, performance, security hoặc concurrency khi nguồn/risk yêu cầu.
- Viết tự đủ nghĩa theo standard, dùng từ trên UI và giải thích ngắn thuật ngữ lạ.
- Nếu BA và Dev mâu thuẫn, expected theo BA/AC và thêm một câu ngắn `(Need Confirm: ...)`.

## Ghi kết quả

- Nếu có Google Sheet, xác định tab từ `gid`; đọc metadata, tab `OverView`, header testcase và validation liên quan trước khi ghi.
- Điền thông tin task vào `OverView` theo nhãn có sẵn: project, feature/task name, description, scope, Jira ID/status và testcase sheet. Chỉ dùng dữ liệu từ Jira/test plan/tài liệu hoặc giá trị template đã có; không đoán tester/reviewer/status.
- Tạo một danh sách `MODULE/FEATURE` chuẩn. Ghi danh sách này vào bảng `FEATURE DETAILS` của `OverView` **trước**, rồi dùng đúng từng chuỗi đó trong cột `MODULE/FEATURE` của testcase; không giữ module cũ từ task/template khác.
- Nếu cột module là dropdown/from-range, MCP phải kiểm tra source range chứa đủ module và rule không có `#REF!`. Chỉ sửa rule bằng MCP hỗ trợ validation/table; nếu MCP hiện tại không hỗ trợ thì dừng và báo blocker, không mở browser.
- Chỉ ghi 7 cột testcase chuẩn; giữ nguyên các cột execution phía sau.
- Append vào vùng trống, không ghi đè và không tạo ID trùng; đọc lại vùng vừa ghi để xác minh.
- Trước bàn giao, đối chiếu tập module khác rỗng trong `OverView` và testcase phải bằng nhau tuyệt đối, đồng thời đọc lại metadata task đã điền.
- Nếu phân tích xong nhưng chưa có link Sheet, hỏi: `Bạn gửi link Google Sheet đã cấp quyền để mình ghi test cases nhé.`
- Nếu local-only, lưu theo convention gần nhất trong `Ai_Agents/test_cases`.
- Khi bàn giao, chỉ báo số case, nơi đã ghi và `Need Confirm`/coverage gap; không kể lại quá trình phân tích.
