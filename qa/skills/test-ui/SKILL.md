---
name: test-ui
description: Chạy test cases UI trên website, đối chiếu expected result và cập nhật kết quả vào Google Sheet; dùng khi cần thực thi UI test có sẵn, không dùng để viết testcase, test API hay performance.
---

# Test UI từ test cases

## Mục tiêu

Chạy đầy đủ mọi UI case áp dụng được, xác nhận đúng từng expected result và báo cáo ngắn gọn. Không tự mở rộng sang API, DB, load test hay exploratory test ngoài phạm vi.

## Đầu vào

- Bắt buộc: URL website, tài khoản và mật khẩu test.
- Nguồn testcase được chọn theo thứ tự: link/file người dùng chỉ định; nguồn testcase gần nhất trong hội thoại; file khớp chính xác task/module trong `/Users/tranthanhlam/YNM-testing/qa/test_cases`.
- Nếu không xác định được duy nhất một nguồn testcase, chỉ hỏi một câu ngắn xin link/file testcase.
- Không nhắc lại, ghi vào file/Sheet, chụp màn hình hoặc đưa credential vào báo cáo.

## Ranh giới công cụ

- Chỉ thao tác website cần test bằng browser automation/CUA đã cấu hình; không dùng web search.
- Chỉ đọc/ghi Google Sheets, Drive, Jira và Wiki bằng MCP đã cấu hình. Không mở các hệ thống này bằng browser/CUA để thay thế MCP.
- Chỉ dùng credential cho đúng domain người dùng cung cấp. Khi chuyển sang domain đăng nhập ngoài dự kiến, gặp MFA, CAPTCHA hoặc SSO cần người dùng duyệt, dừng và xin handoff.

## Quy trình tối ưu

1. Đọc tối thiểu header và các dòng testcase thuộc phạm vi; không tải hay diễn giải lại toàn bộ workbook.
2. Mặc định chạy toàn bộ case UI trong phạm vi; trạng thái cũ không được dùng làm bằng chứng cho lần chạy mới. Chỉ bỏ qua case ghi rõ ngoài phạm vi/disabled hoặc không thể thực thi bằng UI.
3. Nhóm case có cùng màn hình, precondition và dữ liệu; chạy ưu tiên cao trước, thao tác chỉ đọc trước, thao tác thay đổi dữ liệu sau, thao tác rủi ro cuối cùng.
4. Đăng nhập một lần, kiểm tra đúng môi trường và role, rồi tái sử dụng session. Nếu session hết hạn, chỉ đăng nhập lại một lần.
5. Với từng case:
   - Bảo đảm precondition và dùng dữ liệu test riêng, dễ nhận biết.
   - Ưu tiên tìm phần tử theo role, label, text hoặc test-id; chỉ dùng tọa độ khi không có cách ổn định hơn.
   - Thực hiện đúng steps; sau thao tác làm đổi UI, chờ trạng thái/URL/phần tử mong đợi thay vì sleep cố định.
   - Kiểm tra mọi ý trong expected result. Chỉ PASS khi đã trực tiếp quan sát đủ tất cả assertion.
   - Thất bại tạm thời được thử lại một lần sau khi làm mới trạng thái; không lặp vô hạn.
   - Giữ kết quả độc lập giữa các case; cleanup chỉ khi an toàn và thuộc phạm vi được phép.
6. Ghi kết quả bằng MCP vào đúng dòng nếu Sheet có cột execution; không sửa nội dung testcase hoặc cấu trúc Sheet. Đọc lại đúng các dòng vừa ghi để xác minh.

## Phân loại kết quả

- `PASS`: tất cả expected result đã được quan sát.
- `BUG`: kết quả thực tế khác expected result; ghi ngắn gọn `Expected / Actual` và lưu screenshot lỗi nếu an toàn.
- `BLOCKED`: không thể chạy vì môi trường, quyền, dữ liệu, MFA/CAPTCHA hoặc precondition.
- `NOT RUN`: case không phải UI, ngoài phạm vi hoặc chưa được thực thi.
- Nếu Sheet dùng dropdown/tên trạng thái khác, map theo cùng ý nghĩa và chỉ dùng giá trị hợp lệ; không sửa data validation.
- Không suy luận trạng thái backend chỉ từ UI. Không biến blocker hay testcase mơ hồ thành BUG/PASS.

## An toàn và bằng chứng

- Không chụp password, token, cookie, thông tin cá nhân hoặc dữ liệu khách hàng.
- Với thanh toán, gửi nội dung ra ngoài, đổi quyền, xóa hoặc thao tác khó hoàn tác, tuân thủ bước xác nhận bắt buộc trước khi thao tác.
- Không tự tạo Jira bug. Nếu người dùng yêu cầu, chuyển sang skill log bug và xác nhận trước external write.
- Case lỗi: giữ một screenshot đúng thời điểm, URL hiện tại và mô tả Actual ngắn. Case PASS không cần ảnh trừ khi testcase yêu cầu.

## Báo cáo tiết kiệm token

Chỉ trả: tổng số case UI, PASS, BUG, BLOCKED, NOT RUN; danh sách ID bị BUG/BLOCKED cùng một dòng lý do; link Sheet nếu có. Không kể lại các bước đã PASS, không in DOM/log dài và không lặp nội dung testcase.
