---
name: generate-jira-bugs
description: Chuyển các test case được đánh dấu lỗi từ Google Sheets, CSV, JSON hoặc XLSX thành bản nháp bug Jira Cloud nhất quán và chỉ tạo issue sau khi người dùng xác nhận rõ ràng. Dùng skill này khi cần đọc bảng kết quả kiểm thử, lọc STATUS=BUG hoặc failed/error, kiểm tra chất lượng dữ liệu, tránh dòng đã có BUG ID, xem trước payload Jira, log bug thử trong chat hoặc tạo các ticket Jira đã được duyệt.
---

# Tạo bug Jira từ test case

Chuyển kết quả kiểm thử thành bug Jira có thể truy vết. Luôn xem trước, giữ nguyên sự thật từ nguồn và không tự bịa dữ liệu còn thiếu.

## Quy trình bắt buộc

1. Kiểm tra nguồn mà không chỉnh sửa.
   - Với URL Google Sheets, dùng skill Google Sheets để đọc metadata, ánh xạ `gid` sang đúng tab hiển thị rồi chỉ đọc vùng tiêu đề và dữ liệu cần thiết.
   - Với file cục bộ, hỗ trợ CSV, JSON và XLSX. Chọn đúng worksheet được yêu cầu hoặc worksheet đang active.
   - Đọc [references/input-format.md](references/input-format.md) để hiểu mapping từ `TEST CASE ID` đến `BUG STATUS`.
2. Xác định Jira project key. Dùng `JIRA_PROJECT_KEY` nếu có; nếu chưa có thì hỏi người dùng. Mặc định issue type là `Bug`.
3. Lọc ứng viên. Mặc định chỉ lấy `STATUS=BUG`, failed hoặc error; loại passed, open, ignored, blocked, skipped, pending và dòng trống. Bỏ qua dòng đã có `BUG ID`.
4. Đọc [references/quality-rules.md](references/quality-rules.md) và [references/bug-template.md](references/bug-template.md), chấm trạng thái từng dòng rồi chuyển test case thành bug report theo đúng template. Không bỏ qua cảnh báo chặn.
5. Tạo preview bằng `scripts/jira_bug_generator.py`. Với dữ liệu đọc từ connector, chuyển thành mảng JSON theo header rồi truyền qua `--input -`; truyền deep link nguồn bằng `--source-url`. Không dùng `--create` ở bước này.
   - Có thể thêm trường dẫn xuất `BUG SUMMARY` vào JSON preview mà không sửa nguồn. Chỉ tổng hợp triệu chứng từ `ACTUAL RESULT` và trigger/đối tượng đã xuất hiện rõ trong steps; không thêm root cause hoặc tác động suy đoán.
6. Hiển thị đầy đủ số draft, dòng bị bỏ qua, lỗi validation, cảnh báo chất lượng, source row, test-case ID, summary, priority và trạng thái review. Không đoán dữ liệu cho dòng mơ hồ.
7. Chỉ khi người dùng yêu cầu tạo thật, đọc [references/jira-cloud.md](references/jira-cloud.md), kiểm tra xác thực bằng `--check-auth`, đọc lại nguồn để tránh dữ liệu cũ và tạo preview lần cuối.
8. Yêu cầu xác nhận có project key và đúng số lượng ticket. Sau đó mới chạy cùng input bằng `--create --yes`. Không tạo quá 10 issue trong một lần.
9. Báo riêng issue thành công và thất bại. Không retry mù quáng một batch đã thành công một phần.
10. Với Google Sheets, chỉ ghi Jira key vào `BUG ID` sau một xác nhận riêng. Chỉ cập nhật `BUG STATUS` từ trạng thái Jira đã đọc hoặc giá trị người dùng chỉ định.

## Câu lệnh

Xem trước một workbook tải từ Google Sheets:

```bash
python3 scripts/jira_bug_generator.py \
  --input /duong-dan-tuyet-doi/testcases.xlsx \
  --sheet "[Crisis] AI Negative Level Classification" \
  --project QA \
  --source-url "https://docs.google.com/spreadsheets/d/.../edit?gid=..." \
  --output /duong-dan-tuyet-doi/jira-bug-preview.json
```

Các tùy chọn thường dùng:

- `--input -`: đọc mảng JSON từ standard input.
- `--include-status bug,failed,error`: thay đổi trạng thái được chọn.
- `--labels qa,generated-from-testcases`: thêm label Jira.
- `--field-map mapping.json`: map header không chuẩn.
- `--extra-fields jira-fields.json`: thêm custom field của project.
- `--issue-type Bug`: đổi issue type.
- `--allow-quality-warnings`: chỉ dùng khi người dùng đã duyệt cụ thể các cảnh báo chặn.

Nếu thiếu hỗ trợ XLSX, cài `openpyxl` trong môi trường cô lập.

## Quy tắc cốt lõi

- Viết summary theo hành vi lỗi quan sát được, không dùng nguyên `TEST NAME` làm tiêu đề bug. Ưu tiên `BUG SUMMARY` nếu nguồn có; nếu không thì rút gọn `ACTUAL RESULT` và thêm `[MODULE/FEATURE]` ở đầu khi có.
- Không thêm `[BUG]`, `TEST CASE ID`, priority hoặc loại test vào summary mặc định. Jira issue type và phần truy vết đã chứa các thông tin này.
- Giữ nguyên `TEST NAME` trong phần `Thông tin nguồn` để truy vết kịch bản kiểm thử.
- Không biến mục tiêu kiểm thử dạng “Kiểm tra...” thành triệu chứng lỗi. Không khẳng định root cause, tác động, tần suất hoặc phạm vi nếu nguồn chưa chứng minh.
- Yêu cầu `TEST CASE ID` hoặc title, `EXPECTED RESULT` và `ACTUAL RESULT` có ý nghĩa.
- Giữ nguyên pre-condition, steps, test data, expected, actual, remarks, test type, priority, người test, URL nguồn và source row.
- Sắp xếp description theo thứ tự: điều kiện tiên quyết, bước tái hiện, kết quả thực tế, kết quả mong đợi, dữ liệu kiểm thử, môi trường, bằng chứng, ghi chú và thông tin nguồn.
- Không map `ASSIGNED TO` thành Jira assignee vì Jira Cloud cần account ID hợp lệ.
- Không tạo nhiều draft cho cùng test-case ID. Giữ ứng viên hợp lệ đầu tiên và báo các dòng trùng.
- Có `BUG ID` thì đánh dấu `SKIP_EXISTING`, không tạo lại.
- Chỉ dùng `STATUS` để chọn test case; không dùng `BUG STATUS` làm kết quả test.
- Không tự nâng hoặc hạ priority. Chỉ map giá trị nguồn đã nhận diện được.
- Không tự upload attachment. Chỉ giữ đường dẫn hoặc URL bằng chứng dưới dạng text.
- Giữ summary dưới 255 ký tự; nếu cắt thì giữ title đầy đủ trong description.
- Khi người dùng nói “log thử”, “preview”, “xem thử”, “đừng đẩy Jira” hoặc ý tương đương, tuyệt đối không gọi API tạo issue.

## An toàn khi tạo thật

- Không đưa API token vào prompt, file test case, câu lệnh, preview, log hoặc repository. Chỉ đọc `JIRA_BASE_URL`, `JIRA_EMAIL`, `JIRA_API_TOKEN` từ environment.
- Có credentials không đồng nghĩa với được phép tạo issue.
- Bắt buộc có xác nhận người dùng và đồng thời có hai cờ `--create --yes`.
- Kiểm tra lại project, issue type, số lượng, source row, summary và cảnh báo ngay trước khi gửi.
- Không tự dùng `--allow-quality-warnings`; chỉ dùng khi người dùng xác nhận các dòng cụ thể sau khi đã thấy cảnh báo.
- Dừng và báo nguyên nhân khi thiếu custom field, thiếu quyền hoặc Jira từ chối payload.
- Chỉ dùng implementation này cho Jira Cloud; không giả định Jira Data Center giống hệt.

## Kết quả đầu ra

Preview JSON chứa `drafts`, `errors`, `skipped`, `stats`, `quality_warnings`, `review_state` và payload Jira chính xác. `skipped_existing_bug_id` đếm dòng đã có Jira key. Khi tạo thật, `creation_results` chứa issue key, ID, URL và lỗi riêng của từng ticket.
