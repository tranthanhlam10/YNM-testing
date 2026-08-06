# Quy tắc chất lượng và an toàn

## 1. Trạng thái review

- `READY`: đủ dữ liệu và được chọn bằng tín hiệu rõ ràng.
- `NEEDS_CLARIFICATION`: có bug tiềm năng nhưng summary, steps, expected, actual, environment hoặc priority còn mơ hồ/thiếu.
- `SKIP_EXISTING`: đã có Jira key hoặc đã xác nhận có issue tương đương.
- `INVALID`: thiếu summary/title, expected hoặc actual; không thể dựng draft có nghĩa.

Không yêu cầu test-case ID hoặc status để một bug đạt `READY`.

## 2. Chọn candidate an toàn

- Jira key trống chỉ là điều kiện chống trùng, không phải tín hiệu tạo bug.
- Chấp nhận candidate khi người dùng chỉ định row/ID, có ready flag hợp lệ, yêu cầu rõ lọc status, hoặc mô tả trực tiếp bug trong chat.
- Không có tín hiệu chọn: chỉ preview và yêu cầu chọn; không tạo issue.
- Dùng `--selection-mode candidates` cho trường hợp này; mode bị chặn khi kết hợp với `--create`.
- `--selection-mode all` chỉ dùng cho bug chat hoặc tập dòng đã được chọn trước.
- Status trống hoặc không đổi không làm bug invalid.

## 3. Rule chặn chất lượng

Đánh dấu `NEEDS_CLARIFICATION` khi:

- Actual chứa “cần confirm”, “chưa check”, “chờ kiểm tra”, “đợi dev fix”, “TBC”, “không rõ”, “có vẻ” hoặc tương đương.
- Actual chỉ nói “lỗi”, “bị lỗi”, “đang lỗi”, “hiện tại đang lỗi”, “không đúng”, “sai” hoặc không đủ để dev hiểu hành vi quan sát được.
- Expected và Actual giống nhau hoặc mâu thuẫn với việc đây là bug.
- Steps không đủ để tái hiện và không có ngữ cảnh thay thế rõ ràng.
- Thiếu environment hoặc priority cần dùng cho ticket.

Đánh dấu `INVALID` khi thiếu summary/title, expected hoặc actual. Không bịa browser, environment, account, timestamp, response code, log, screenshot, tần suất hoặc root cause.

## 4. Rule summary và description

- Summary mô tả triệu chứng, không mô tả mục tiêu kiểm thử.
- Ưu tiên `BUG SUMMARY`; nếu không có, rút gọn Actual và thêm module đã biết.
- Được thêm trigger/đối tượng từ steps khi đã xuất hiện rõ trong nguồn.
- Không thêm root cause, tác động, phạm vi hoặc tần suất nếu chưa có bằng chứng.
- Đặt Actual trước Expected.
- Giữ source type, row, URL, test data, test-case ID, module, test type và tester trong `Thông tin nguồn`.
- Nếu không có testcase, ghi `Không gắn với test case nào`; không hỏi lại chỉ để điền ID.
- Evidence thiếu là cảnh báo không chặn và phải ghi `Chưa có bằng chứng được cung cấp.`

## 5. Chống trùng

- Có `BUG ID`, `Jira Key`, Jira URL hoặc issue tương đương thì `SKIP_EXISTING`.
- Trong cùng input, phát hiện trùng test-case ID; với bug không có testcase, so sánh fingerprint từ module + summary + actual.
- Trước khi tạo thật, tìm Jira theo project, summary, module và test-case ID nếu có.
- Chỉ đề xuất issue có khả năng trùng; không tự gộp.
- Không retry toàn batch sau thành công một phần.

## 6. Priority, label và assignee

- Map priority đúng giá trị nguồn; không tự nâng/hạ.
- Có test-case ID → `linked-testcase`; không có → `no-testcase`.
- Đọc và áp dụng [bug-label-rules.md](bug-label-rules.md) trước khi dựng payload.
- Bắt buộc có tối thiểu một `sys-*`; chỉ gắn System từ hành vi bug cụ thể, không dựa duy nhất vào tên module rộng.
- Gắn đúng một `test-*` khi xác định được hoạt động test. Không gắn nhiều test type để “cover cho chắc”.
- Không suy đoán `rc-*`. Root Cause chưa xác định được phép để trống lúc tạo nhưng phải có cảnh báo `root_cause_pending` và cập nhật trước khi đóng.
- Chỉ gắn `flow-*` khi có bằng chứng rõ; không dùng Flow thay cho System.
- Map stage sang `Found In Environment`; không dùng `found-in-*`.
- Nếu connector không hỗ trợ labels, dùng REST script hoặc báo rõ; không giả vờ đã set.
- `ASSIGNED TO` chỉ là tester/owner nguồn, không phải Jira assignee nếu chưa có account ID.

## 7. Dữ liệu nhạy cảm

- Không đưa password, API token, cookie, access token, private key hoặc session ID vào Jira.
- Che email, số điện thoại, user ID và dữ liệu khách hàng không cần thiết.
- Không tự upload attachment.

## 8. Preview và xác nhận

- “Log thử”, “preview”, “xem thử”, “draft”, “đừng đẩy Jira” không bao giờ là quyền tạo issue.
- Preview phải hiển thị selection mode/reason, project, issue type, số `READY`, `NEEDS_CLARIFICATION`, `INVALID`, `SKIP_EXISTING`, source row, test-case ID nếu có, summary, priority, `Found In Environment` và labels tách theo Root Cause/System/Test Type/Flow.
- Xác nhận hợp lệ phải nêu project và số lượng.
- Nếu nguồn thay đổi, preview lại và xin xác nhận mới.
- Tối đa 10 issue mỗi batch.

## 9. Tạo issue và lỗi một phần

- Có auth/connector không đồng nghĩa được phép tạo.
- Chỉ tạo candidate `READY`, tuần tự từng issue. Candidate `NEEDS_CLARIFICATION` bị bỏ qua mặc định và liệt kê trong `creation_skipped`.
- Ghi nhận riêng created, failed và skipped; không tự retry.
- Chỉ retry issue thất bại sau khi kiểm tra chưa có key tương ứng và người dùng đồng ý.

## 10. Ghi ngược Google Sheets

- Cần xác nhận riêng với việc tạo Jira.
- Đọc lại ô Jira key ngay trước khi ghi; có dữ liệu thì dừng.
- Chỉ ghi key/URL từ issue tạo thành công.
- Không tự cập nhật `BUG STATUS`.

## 11. Ví dụ phải chặn

- `Actual: Hiện tại đang lỗi` → `NEEDS_CLARIFICATION`.
- `Actual: Đang đợi dev fix ẩn field khỏi API` → `NEEDS_CLARIFICATION` nếu chưa mô tả hành vi quan sát được.
- `STATUS=BUG` nhưng Actual trống → `INVALID`.
- Không có test-case ID nhưng đủ summary, steps, expected, actual, environment và priority → có thể `READY`.
