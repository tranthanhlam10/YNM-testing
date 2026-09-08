---
name: write-test-cases
description: Thiết kế test cases QA chi tiết bằng tiếng Việt từ Jira, Wiki, tài liệu BA/Dev và test plan, theo template 7 cột; dùng khi cần viết mới bộ test cases, không dùng cho review-only hoặc chỉ lập test plan.
---

# Viết test cases

Tạo bộ test cases thực thi được, có dữ liệu cụ thể và truy vết về requirement/risk. Đọc [references/test-case-standard.md](references/test-case-standard.md) trước khi viết vì đây là contract định dạng và quality gate.

## Nguồn và công cụ

- Đọc requirement BA, technical specs Dev và test plan người dùng cung cấp. Nếu thiếu đường dẫn test plan nhưng có task key, tìm trong `Ai_Agents/test_plans` trước; test plan là nguồn chính để định hướng scope và risk, còn BA/AC là oracle cho hành vi nghiệp vụ.
- Với Jira, Confluence/Wiki và Google Sheets, dùng connector/MCP đã cấu hình; không mở browser chỉ để đọc hoặc ghi các nguồn này. Nếu nguồn bắt buộc không truy cập được, nêu rõ giới hạn thay vì bịa nội dung.
- Khi làm trong repo có `Ai_Agents/templates/codex`, kiểm tra prompt authoring test case mới nhất. Bản baseline của skill là `testcase_template_codex_2508.md`; nếu có bản mới hơn, áp dụng quy tắc dùng chung mới nhưng bỏ task key, URL, path và Sheet ví dụ của feature cũ. Bỏ qua prompt review/rewrite khi yêu cầu là viết mới.
- Tham khảo `Ai_Agents/test_cases` để học convention và độ chi tiết; không tái dùng dữ liệu hoặc expected result của feature khác.

## Thiết kế coverage

1. Trích requirement/rule/risk thành checklist coverage trước khi sinh case. Tách các tổ hợp bằng equivalence partitioning, boundary value analysis, decision table, state transition và error guessing khi phù hợp.
2. Bao phủ positive, negative, edge và technical/integration theo feature thực tế. Chỉ thêm security, performance, concurrency, timeout, retry, data integrity, UI/API/DB/log khi requirement, architecture hoặc risk làm chúng liên quan.
3. Mỗi case kiểm chứng một hành vi chính, có pre-condition khả thi, steps theo thứ tự và test oracle quan sát được. Gộp case chỉ khi setup/action giống nhau và failure vẫn chẩn đoán được.
4. Dùng dữ liệu cụ thể và boundary có chủ đích; nhiều field thì biểu diễn bằng một JSON object hợp lệ. Không ghi “data hợp lệ”, “user bất kỳ” hoặc “kiểm tra DB” mà không nêu ví dụ/đối tượng cần kiểm tra.
5. Expected result phải chi tiết ở đúng các layer có căn cứ. Không bịa API field, table, status, threshold hoặc log format chưa được nguồn xác nhận.
6. Nếu BA và Dev mâu thuẫn, ưu tiên BA/AC cho expected nghiệp vụ và thêm `(Need Confirm)` ngay trong `EXPECTED RESULT`; giải thích rõ điểm Dev cần xác nhận. Nếu chưa có BA oracle, không tự suy một giá trị pass.

## Xuất và ghi dữ liệu

- Giữ chính xác 7 cột và quy tắc trong standard; không thêm Priority, Status, Automation, Note hoặc cột phụ.
- Viết tiếng Việt có dấu, dễ thực thi với QA fresher nhưng giữ thuật ngữ kỹ thuật cần thiết.
- Nếu repo có `Ai_Agents/test_cases`, mặc định lưu file theo convention gần nhất, ưu tiên `Ai_Agents/test_cases/<feature-slug>/TestCases_<TASK>_<Feature>.md`; chỉ tạo CSV/JSON khi người dùng yêu cầu hoặc đích đến cần định dạng đó.
- Luồng mặc định có hai pha: hoàn tất phân tích requirement/coverage trước, sau đó mới ghi test cases. Nếu đến pha ghi mà yêu cầu hiện tại chưa có link Google Sheet đã cấp quyền, dừng tại gate và hỏi đúng một câu ngắn: `Bạn gửi link Google Sheet đã cấp quyền để mình ghi test cases nhé.` Không hỏi link ở đầu khi vẫn còn việc phân tích có thể làm.
- Khi người dùng gửi link trong cùng yêu cầu hoặc lượt tiếp theo, coi đó là quyền ghi chỉ cho spreadsheet đó. Không hỏi lại, không tái dùng Sheet từ task cũ và không tự tạo/move file trên Google Drive. Nếu người dùng yêu cầu local-only hoặc preview-only thì bỏ qua gate Sheet.
- Resolve `spreadsheet_id` và tab từ link/`gid`, đọc metadata cùng header trước khi ghi. Nếu link không xác định được tab và có nhiều tab phù hợp, lúc đó mới hỏi tên tab; không đoán `Sheet1`.
- Chỉ ghi khi header đúng 7 cột. Ghi vào vùng trống kế tiếp mà không đụng dữ liệu hiện có; nếu phát hiện Test Case ID trùng, dừng và hỏi cách xử lý thay vì tự replace hoặc append duplicate.
- Khi ghi Sheet, dùng update theo range chính xác, không xóa hay ghi đè dữ liệu ngoài vùng được chỉ định. Sau write, đọc lại header và các dòng đầu/cuối vừa ghi để xác minh.
- Trước khi bàn giao, chạy quality gate trong reference và báo file/Sheet đã cập nhật cùng các Need Confirm hoặc coverage gap còn lại.
