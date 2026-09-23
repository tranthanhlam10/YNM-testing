# Chuẩn test cases — dễ hiểu, ít token

## Bắt buộc

- Người chưa biết tính năng đọc riêng testcase vẫn hiểu mục đích, dữ liệu, thao tác và điều kiện pass.
- Mỗi cell chỉ chứa thông tin cần để execute hoặc đánh giá; không lặp requirement và không thêm kỹ thuật ngoài scope.
- Đúng 7 cột: `TEST CASE ID` · `MODULE/FEATURE` · `TEST NAME` · `PRE-CONDITION` · `TEST STEPS` · `TEST DATA` · `EXPECTED RESULT`.
- Nếu Sheet có cột execution phía sau, giữ nguyên và chỉ ghi 7 cột trên.

## Cách viết từng cột

- **TEST CASE ID:** `TC_<MODULE>_<NNN>`, duy nhất, tăng liên tục.
- **MODULE/FEATURE:** khu vực người dùng nhận ra, ví dụ `Label Validation - Preview`.
- **TEST NAME:** `[High|Medium|Low] [Positive|Negative|Edge] <hành vi cụ thể>`; đọc tên phải biết case test gì.
- **PRE-CONDITION:** 1–3 câu về màn hình, quyền/trạng thái và dữ liệu cần có. Không lặp môi trường chung.
- **TEST STEPS:** thường 3–5 bước đánh số, mỗi bước một hành động có tên nút/field rõ ràng; không chứa expected.
- **TEST DATA:** ưu tiên `Field = Value; Field = Value`. Chỉ dùng bảng/JSON khi nhiều biến thể hoặc chính payload là đối tượng test.
- **EXPECTED RESULT:** thường 2–4 assertion quan sát được; không kể lại steps và không dùng câu mơ hồ như “thành công”.

## Giữ bộ case gọn

- Một case cho một hành vi chính; gộp các boundary dùng chung flow.
- Không tách UI/API/DB thành nhiều case nếu các layer không có contract/risk riêng.
- Không đưa BR/AC vào Test Data trừ khi người dùng yêu cầu traceability trên output.
- Không lặp cùng thông tin ở Pre-condition, Test Data và Expected Result.
- Chỉ nhắc API/DB/queue/log trong case kỹ thuật tương ứng.

## Đồng bộ Google Sheet

- Đọc `OverView` theo nhãn, không hard-code địa chỉ ô nếu template đã đổi layout.
- Điền metadata task: `PROJECT TITLE`, `FEATURE NAME`, `DESCRIPTION`, `SCOPE`; giữ `TESTER`, `TESTER AUTHOR`, `REVIEWER` theo template/user. Trong `FEATURE DETAILS`, điền `FEATURE`, mô tả ngắn, status/Jira ID nếu có nguồn và tên/link tab testcase.
- `FEATURE` trong `OverView` là danh sách module chuẩn. Mọi giá trị `MODULE/FEATURE` trong testcase phải khớp chính xác về ký tự, khoảng trắng và hoa/thường; hai tập giá trị khác rỗng phải bằng nhau.
- Ghi `OverView` và nguồn dropdown trước khi ghi testcase. Không paste module ngoài danh sách cho phép.
- Verify bằng MCP: không còn module task cũ, không có `#REF!`, source range dropdown phủ đủ module và read-back không có giá trị invalid.
- Chỉ dùng MCP đã cấu hình; không dùng browser/CUA để sửa validation hoặc kiểm tra trực quan.

## Mâu thuẫn

- BA/AC là oracle nghiệp vụ.
- Nếu technical spec khác BA: `(Need Confirm: technical spec ...; expected theo BA là ...)`.
- Nếu chưa có oracle, không tự chọn kết quả pass.

## Quality gate

- Đúng 7 cột; ID không trùng; không lệch cột.
- Tên case cho biết mục tiêu; pre-condition + steps + data đủ để người mới thực hiện.
- Expected cụ thể và ngắn; không lặp steps.
- Boundary chung flow đã được gộp; không có case kỹ thuật vô căn cứ.
- `Need Confirm` ngắn, cụ thể và dễ tìm.
- Metadata task đã điền; module ở `OverView` và testcase khớp tuyệt đối; dropdown không có `#REF!`.
