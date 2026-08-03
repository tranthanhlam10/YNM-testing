# Quy tắc chất lượng và an toàn

## 1. Trạng thái review

Gán đúng một trạng thái cho mỗi dòng ứng viên:

- `READY`: đủ dữ liệu, không có cảnh báo chặn và có thể đưa vào danh sách xin duyệt.
- `NEEDS_CLARIFICATION`: có bug tiềm năng nhưng Actual Result, Expected Result hoặc bước tái hiện còn mơ hồ. Cho phép preview nhưng chặn tạo thật mặc định.
- `SKIP_EXISTING`: đã có `BUG ID` hoặc đã xác nhận có issue tương đương.
- `INVALID`: thiếu ID/title, expected hoặc actual; không tạo draft Jira.

Không chuyển `NEEDS_CLARIFICATION` thành `READY` chỉ vì người dùng muốn tạo nhanh. Yêu cầu bổ sung sự thật còn thiếu hoặc xác nhận rõ việc chấp nhận rủi ro.

## 2. Rule chặn chất lượng

Đánh dấu `NEEDS_CLARIFICATION` khi gặp một trong các trường hợp:

- Actual Result chứa nội dung chưa xác nhận như “cần confirm”, “chưa check”, “chờ kiểm tra”, “TBC”, “không rõ” hoặc “có vẻ”.
- Actual Result chỉ nói “không đúng”, “bị lỗi” hoặc quá ngắn để dev hiểu hành vi quan sát được.
- Expected Result và Actual Result giống nhau hoặc không thể phân biệt pass/fail.
- `STATUS=BUG` nhưng Actual Result nói “đã đúng yêu cầu”, “hoạt động bình thường” hoặc ý tương đương.
- Steps không đủ để tái hiện và không có ngữ cảnh thay thế rõ ràng.

Không bịa browser, environment, tài khoản, timestamp, response code, log, screenshot hoặc tần suất tái hiện.

## 3. Rule viết summary

- Summary phải mô tả hành vi lỗi mà người kiểm thử đã quan sát, không mô tả mục tiêu kiểm thử.
- Ưu tiên `BUG SUMMARY` đã được cung cấp. Nếu không có, rút gọn `ACTUAL RESULT` và thêm `[MODULE/FEATURE]` làm ngữ cảnh khi có.
- Được thêm trigger hoặc đối tượng từ steps vào summary khi chúng đã được nêu rõ, ví dụ “sau callback hoàn tất”; đây là rút gọn ngữ cảnh tái hiện, không phải suy đoán root cause.
- Loại bỏ các tiền tố dư như “Hiện tại đang bị bug”, “Bug:” hoặc “Lỗi:”. Giữ nguyên ý nghĩa thực tế.
- Không dùng nguyên title bắt đầu bằng “Kiểm tra”, “Verify”, “Validate” hoặc các tag `[High]`, `[Positive]`, `[Edge]` làm summary Jira.
- Không thêm test-case ID, priority, test type hoặc `[BUG]` vào summary mặc định.
- Không thêm nguyên nhân, tác động, phạm vi, tần suất hoặc kết luận kỹ thuật nếu dữ liệu nguồn chưa chứng minh.
- Nếu `ACTUAL RESULT` quá mơ hồ để viết một summary có nghĩa, giữ trạng thái `NEEDS_CLARIFICATION`; không tự sáng tác tiêu đề cho đủ đẹp.

## 4. Rule nội dung bug

- Giữ `ACTUAL RESULT` là sự thật quan sát được. Chỉ làm sạch câu chữ; không thêm hệ quả kiểu “vì vậy...” nếu nguồn không nêu.
- Bước tái hiện phải là thao tác thực hiện được. Giữ thứ tự và dữ liệu cần thiết; không trộn expected vào steps.
- Đặt `Kết quả thực tế` trước `Kết quả mong đợi` để người đọc thấy lỗi nhanh.
- Giữ test-case ID, test name, module, priority nguồn, test type, người thực hiện, source row và URL trong `Thông tin nguồn`; không đặt toàn bộ metadata ở đầu ticket.
- `ASSIGNED TO` chỉ là người thực hiện/owner từ nguồn, không phải Jira assignee.
- Nếu không có evidence, ghi rõ “Chưa có bằng chứng được cung cấp” và phát cảnh báo không chặn.
- Bỏ hẳn các section không có dữ liệu, ngoại trừ `Bằng chứng` và `Thông tin nguồn`.
- Dùng đúng thứ tự và heading trong [bug-template.md](bug-template.md).

## 5. Rule cảnh báo không chặn

Cảnh báo nhưng vẫn cho `READY` khi:

- Không có evidence nhưng Actual Result và steps đã rõ.
- Không có priority; giữ trống thay vì tự suy đoán.
- Không có environment và bug không phụ thuộc môi trường theo dữ liệu hiện có.
- Remarks rỗng.

## 6. Chống trùng và gộp bug

- Có `BUG ID` thì luôn `SKIP_EXISTING`.
- Trùng `TEST CASE ID` trong cùng input thì giữ dòng hợp lệ đầu tiên và báo các dòng sau.
- Summary giống nhau chưa đủ để kết luận trùng. So sánh component, steps, expected và actual.
- Chỉ đề xuất gộp khi hành vi lỗi và nguyên nhân quan sát được thực sự giống nhau. Không tự gộp nếu chưa được người dùng duyệt.
- Không retry toàn batch sau thành công một phần vì sẽ tạo trùng các issue đã thành công.

## 7. Priority và assignee

- Chỉ map priority từ giá trị nguồn đã nhận diện: Critical/Blocker → Highest, High → High, Medium → Medium, Low → Low, Lowest/Trivial → Lowest.
- Không tự nâng priority dựa trên cách viết title hoặc cảm nhận mức độ nghiêm trọng.
- `ASSIGNED TO` trong test case chỉ là người thực hiện/owner nguồn. Không map thành Jira assignee nếu chưa có Jira account ID hợp lệ.

## 8. Dữ liệu nhạy cảm

- Không đưa password, API token, cookie, access token, private key hoặc session ID vào Jira.
- Che bớt email, số điện thoại, user ID hoặc dữ liệu khách hàng nếu không cần để tái hiện.
- Nếu test data có secret thật, thay bằng placeholder và báo người dùng; không sao chép secret vào preview.
- Không tải attachment lên Jira khi chưa được yêu cầu và xác nhận file mục tiêu.

## 9. Preview và xác nhận

- Các câu “log thử”, “preview”, “xem thử”, “draft”, “đừng đẩy Jira” không bao giờ là quyền tạo issue.
- Trước khi xin duyệt, hiển thị project, issue type, tổng số `READY`, tổng `NEEDS_CLARIFICATION`, source row, test-case ID, summary và priority.
- Câu xác nhận hợp lệ phải thể hiện project và số lượng, ví dụ: “Tôi xác nhận tạo 4 bug vào project QA”.
- Nếu dữ liệu nguồn thay đổi sau preview, tạo lại preview và xin xác nhận mới.
- Nếu có hơn 10 ticket, chia batch tối đa 10 và xin duyệt từng batch.

## 10. Tạo issue và lỗi một phần

- Kiểm tra auth trước nhưng không coi auth thành công là quyền tạo issue.
- Tạo tuần tự để giữ kết quả riêng từng test case.
- Khi một issue thất bại, tiếp tục ghi nhận kết quả các issue còn lại trong batch nhưng không tự retry.
- Sau batch, báo rõ created, failed, skipped và link issue thành công.
- Chỉ retry issue thất bại sau khi kiểm tra chưa có key tương ứng trên Jira và người dùng đồng ý.

## 11. Ghi ngược Google Sheets

- Ghi `BUG ID` cần một xác nhận riêng với việc tạo Jira.
- Đọc lại ô mục tiêu ngay trước khi ghi. Nếu ô đã có giá trị, dừng để tránh ghi đè.
- Chỉ ghi Jira key hoặc URL trả về từ API thành công.
- Chỉ cập nhật `BUG STATUS` từ Jira status đã fetch hoặc giá trị người dùng chỉ định; không tự đặt `OPEN`, `DONE` hay `CREATED`.

## 12. Ví dụ cần giữ lại để hỏi

Actual Result “Chỗ này cần confirm lại UI với quyền Edit” phải được đánh dấu `NEEDS_CLARIFICATION`. Không biến câu này thành mô tả lỗi cụ thể vì chưa có bằng chứng hành vi thực tế.
