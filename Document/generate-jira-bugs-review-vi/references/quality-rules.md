# Quy tắc chất lượng và an toàn

## 1. Trạng thái review

- `READY`: đủ dữ liệu và được chọn bằng tín hiệu rõ ràng.
- `NEEDS_CLARIFICATION`: có bug tiềm năng nhưng summary, steps, expected, actual hoặc giá trị Environment/Priority đã nhập còn mơ hồ, không hợp lệ.
- `SKIP_EXISTING`: đã có Jira key hoặc đã xác nhận có issue tương đương.
- `INVALID`: thiếu summary/title, expected hoặc actual; riêng nguồn chat còn thiếu steps. Không thể dựng draft có nghĩa.

Không yêu cầu test-case ID hoặc status để một bug đạt `READY`.

Related task là gate ở cấp yêu cầu, không phải chất lượng của riêng một dòng: thiếu task thì dừng toàn bộ trước preview/tạo; không gắn trạng thái `READY` cho candidate nào. Project nhập riêng không khớp task cũng là lỗi input chặn toàn batch.

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
- Environment hoặc Priority có giá trị nhưng không map được sang giá trị Jira hợp lệ.

Không chặn khi nguồn bỏ trống các trường có default:

- Environment trống → `Found In Environment = Testing` và cảnh báo không chặn `default_environment_applied`.
- Priority trống → Jira priority `Major` và cảnh báo không chặn `default_priority_applied`.
- Không có label rõ ràng → label `found-in-qc` và cảnh báo không chặn `default_label_applied`.

Đánh dấu `INVALID` khi thiếu summary/title, expected hoặc actual. Không bịa browser, environment, account, timestamp, response code, log, screenshot, tần suất hoặc root cause.

### Ngoại lệ nhẹ cho nguồn chat

- Chỉ bắt buộc `Testname/Summary`, `Step`, `Actual Result`, `Expected Result`.
- Giữ nguyên câu chữ tester nhập; không viết lại Summary theo Actual và không ép Summary phải theo pattern module.
- Actual ngắn, chứa câu cần confirm hoặc Expected giống Actual chỉ tạo cảnh báo không chặn để tester review.
- Vẫn chặn khi Actual nói rõ hệ thống đang đúng, khi Environment/Priority/label đã nhập không hợp lệ hoặc khi thiếu một trường cốt lõi.
- Không yêu cầu Evidence, Test Case ID, Module, Test Type, Root Cause, System hoặc Flow để đạt `READY`.

## 4. Rule summary và description

- Summary mô tả triệu chứng, không mô tả mục tiêu kiểm thử.
- Ưu tiên `BUG SUMMARY`; nếu không có, rút gọn Actual và thêm module đã biết.
- Được thêm trigger/đối tượng từ steps khi đã xuất hiện rõ trong nguồn.
- Không thêm root cause, tác động, phạm vi hoặc tần suất nếu chưa có bằng chứng.
- Đặt Actual trước Expected.
- Dùng tiếng Anh cho mọi section heading và nhãn metadata do template sinh ra; giữ nguyên ngôn ngữ và câu chữ của dữ liệu tester nhập.
- Giữ source type, row, URL, test data, test-case ID, module, test type và tester trong `Source information`.
- Nếu không có testcase, ghi `No linked test case`; không hỏi lại chỉ để điền ID.
- Evidence thiếu là cảnh báo không chặn và phải ghi `No evidence was provided.`
- Riêng nguồn chat, dùng nguyên `Testname` làm Summary. Description tối thiểu chỉ gồm `Steps to reproduce`, `Actual result`, `Expected result`; không thêm placeholder `Evidence` hoặc `Source information` khi tester không nhập.

## 5. Chống trùng

- Có `BUG ID`, `Jira Key`, Jira URL hoặc issue tương đương thì `SKIP_EXISTING`.
- Trong cùng input, phát hiện trùng test-case ID; với bug không có testcase, so sánh fingerprint từ module + summary + actual.
- Trước khi tạo thật, tìm Jira theo project, summary, module và test-case ID nếu có.
- Chỉ đề xuất issue có khả năng trùng; không tự gộp.
- Không retry toàn batch sau thành công một phần.

## 6. Priority, label và assignee

- Map priority đúng giá trị nguồn; không tự nâng/hạ.
- Đọc và áp dụng [bug-label-rules.md](bug-label-rules.md) trước khi dựng payload.
- Chỉ đưa label thuộc allowlist của tài liệu label vào payload; label ngoài allowlist phải bị loại và tạo cảnh báo chặn `invalid_jira_label`.
- Không tự thêm label truy vết `generated-by-qc`, `linked-testcase`, `no-testcase` hoặc label tùy ý khác.
- Bắt buộc có tối thiểu một `sys-*` với nguồn Sheet/file; riêng nguồn chat, thiếu System chỉ là cảnh báo không chặn.
- Gắn đúng một `test-*` khi xác định được hoạt động test. Không gắn nhiều test type để “cover cho chắc”.
- Không suy đoán `rc-*`. Root Cause chưa xác định được phép để trống lúc tạo nhưng phải có cảnh báo `root_cause_pending` và cập nhật trước khi đóng.
- Chỉ gắn `flow-*` khi có bằng chứng rõ; không dùng Flow thay cho System.
- Map stage sang `Found In Environment`; nếu nguồn không có stage thì dùng `Testing`.
- `found-in-qc` là label mặc định khi nguồn không cung cấp label; đây không thay thế custom field `Found In Environment`.
- Nếu connector không hỗ trợ labels, dùng REST script hoặc báo rõ; không giả vờ đã set.
- `ASSIGNED TO` chỉ là tester/owner nguồn, không phải Jira assignee nếu chưa có account ID.

## 7. Dữ liệu nhạy cảm

- Không đưa password, API token, cookie, access token, private key hoặc session ID vào Jira.
- Che email, số điện thoại, user ID và dữ liệu khách hàng không cần thiết.
- Không tự upload attachment.

## 8. Preview và xác nhận

- “Log thử”, “preview”, “xem thử”, “draft”, “đừng đẩy Jira” không bao giờ là quyền tạo issue.
- Thiếu related task thì không tạo preview; yêu cầu tester gửi issue key hoặc URL của task.
- Preview phải hiển thị related task, link type `Relates`, project lấy từ task, selection mode/reason, issue type, số `READY`, `NEEDS_CLARIFICATION`, `INVALID`, `SKIP_EXISTING`, source row, test-case ID nếu có, summary, priority, `Found In Environment` và labels tách theo Root Cause/System/Test Type/Flow.
- Xác nhận hợp lệ phải nêu số lượng, project và related task.
- Nếu nguồn thay đổi, preview lại và xin xác nhận mới.
- Tối đa 10 issue mỗi batch.

## 9. Tạo issue và lỗi một phần

- Có auth/connector không đồng nghĩa được phép tạo.
- Trước issue đầu tiên, đọc related task để xác minh task tồn tại/đọc được và project thực tế khớp project của bug.
- Sau mỗi bug được tạo, tạo issue link `Relates` với task bắt buộc.
- Nếu bề mặt Jira không hỗ trợ tạo issue link, không tạo bug bằng bề mặt đó; chuyển sang REST script hoặc dừng và báo giới hạn.
- Chỉ tạo candidate `READY`, tuần tự từng issue. Candidate `NEEDS_CLARIFICATION` bị bỏ qua mặc định và liệt kê trong `creation_skipped`.
- Ghi nhận riêng created, linked, create_failed, link_failed và skipped; không tự retry.
- Nếu bug đã tạo nhưng link thất bại, báo thành công một phần cùng bug key để xử lý link thủ công; tuyệt đối không retry lệnh tạo bug.
- Chỉ retry issue thất bại sau khi kiểm tra chưa có key tương ứng và người dùng đồng ý.

## 10. Ghi ngược Google Sheets

- Cần xác nhận riêng với việc tạo Jira.
- Đọc lại ô Jira key ngay trước khi ghi; có dữ liệu thì dừng.
- Chỉ ghi key/URL từ issue tạo thành công.
- Không tự cập nhật `BUG STATUS`.

## 11. Ví dụ phải chặn

- Với nguồn Sheet/file, `Actual: Hiện tại đang lỗi` → `NEEDS_CLARIFICATION`.
- Với nguồn Sheet/file, `Actual: Đang đợi dev fix ẩn field khỏi API` → `NEEDS_CLARIFICATION` nếu chưa mô tả hành vi quan sát được.
- `STATUS=BUG` nhưng Actual trống → `INVALID`.
- Không có test-case ID, Environment và Priority nhưng đủ summary, steps, expected, actual → có thể `READY` với default `Testing`, `Major`, `found-in-qc`.
- Với nguồn chat, `Testname`, `Step`, `Actual Result`, `Expected Result` đầy đủ → `READY` kể cả khi thiếu Module, Test Type, Evidence và System; giữ nguyên câu chữ tester nhập.
