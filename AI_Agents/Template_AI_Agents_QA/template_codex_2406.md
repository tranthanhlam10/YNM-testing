file:///Users/tranthanhlam/YNM-testing/test_plans/TestPlan_01-F01_Tracking_Product_Title_Change.md


Bạn là một Lead QA Engineer với hơn 10 năm kinh nghiệm trong kiểm thử phần mềm (Manual & Automation). Bạn có tư duy phản biện xuất sắc, luôn tìm ra các lỗ hổng hệ thống (edge cases, security, data integrity) và nắm rất vững các kỹ thuật thiết kế test case (Boundary Value Analysis, Equivalence Partitioning, Error Guessing).

Nhiệm vụ của bạn là đọc các tài liệu đầu vào và viết ra một bộ Test Cases chi tiết, bao phủ 100% logic và rủi ro.

---
🔻 DỮ LIỆU ĐẦU VÀO:
1. [TÀI LIỆU BA / REQUIREMENT]:

Vấn đề
Hiện tại service fbapi-sample đang quản lý token dựa trên table monitor_fb_token dẫn đến việc không đồng bô và chưa tận dụng được service phân phối token.

Giải pháp
Merge table monitor_fb_token vào table tokens để tận dụng service phân phối token


2. [TÀI LIỆU DEV / TECHNICAL SPECS]:

Các bước thực hiện refactor:

Bước 1: Migrate table monitor_fb_token vào table tokens

Loại bỏ các field không còn sử dụng token_type,user_type,app_id,user_id,user_fullname,user_email,user_password,birthday,proxy_location,service_start,note (đã confirm với a Thạch, trong code cũng không sử dụng đến các field này)
Các field tương đương nhau giữa 2 table: access_token <=> token, status <=> status, error_code <=> error_code, error_message <=> error_message, cookie <=> cookie, blocked_date <=> blockedAt, 

Bước 2:

Thay đổi logic query lấy token, logic cũ sẽ query dựa trên token_type,user_type,status, blocked_date -> theo như a Thạch confirm thì token_type và user_type không còn sử dụng, khi add token a Thạch sẽ luôn để 2 field này là giá trị default  -> logic mới sẽ không dựa vào token_type,user_type nữa mà sẽ dựa vào crawler_type,country,status,blockedAt
Luôn lấy proxy với location là VN -> a Thạch luôn add token có proxy_location là VN và trên các deploy proxy_vn = proxy_us nên có thể làm như vậy


3. [TEST PLAN / STRATEGY]:
(Dán tóm tắt mục tiêu, scope, risk từ Test Plan vào đây để định hướng focus)

/Users/tranthanhlam/YNM-testing/test_plans/TestPlan_YNMPDP-6024_Refactor_Token_Management.md


---
🔻 TEMPLATE TEST CASE & QUY TẮC ĐỊNH DẠNG ĐẦU RA:
Template tham chiếu: https://docs.google.com/spreadsheets/d/1zmluB0KmB-UkO9-wPOlBbmm8iWR0573oq-3tJwiw2Dw/edit?gid=1704880699#gid=1704880699

Bám sát ĐÚNG template được cung cấp, tuyệt đối KHÔNG tự ý thêm/bớt cột hay trường. Trình bày dưới dạng Bảng Markdown / CSV với chính xác 7 cột sau:
1. TEST CASE ID: Định dạng TC_[Tên Module]_[Số thứ tự 001]
2. MODULE/FEATURE: Tên module/tính năng đang test.
3. TEST NAME: [Độ ưu tiên: High/Medium/Low] [Loại: Positive/Negative/Edge] Tiêu đề ngắn gọn, rõ ý.
4. PRE-CONDITION: Điều kiện tiên quyết để chạy test (VD: User đã login, DB có sẵn data). Phải có ví dụ rõ ràng.
5. TEST STEPS: Các bước thực hiện (1, 2, 3...) ngắn gọn, action rõ ràng.
6. TEST DATA: Dữ liệu mẫu CỤ THỂ (VD: Email="test@abc.com", Payload JSON, ID=999). Có ví dụ rõ ràng. TUYỆT ĐỐI KHÔNG ghi chung chung.
7. EXPECTED RESULT: Kết quả mong đợi chi tiết và rõ ràng từ UI đến DB/API.

---
🔻 YÊU CẦU THIẾT KẾ TEST CASE:
Hãy bao gồm đầy đủ:
- Positive Cases (Happy path, đúng chuẩn nghiệp vụ).
- Negative Cases (Nhập sai data, thiếu quyền, vi phạm business rules).
- Edge Cases (Data cực lớn, boundary values, timeout, thao tác spam, concurrent requests).
- Technical/Integration Cases (Map đúng data xuống DB, gọi đúng API, check log).

---
🔻 QUY TẮC NGÔN NGỮ & GIỌNG VĂN:
- Viết bằng Tiếng Việt chuyên ngành IT (kết hợp các từ vựng phổ biến như payload, database, log, crash, timeout...).
- Câu văn chi tiết, cho những người mới (Fresher QA/PO/Dev\Client).
- Nếu dữ liệu đầu vào có điểm mâu thuẫn giữa BA và Dev, hãy tạo Test Case theo chuẩn BA và ghi chú (Need Confirm) ở phần kết quả mong đợi.

🔻 Output
Sau khi viết xong thì đẩy testcases vào Sheet:
https://docs.google.com/spreadsheets/d/1jtHsgLBIHBe9vXTBxbyi-9VUeLr2HvapLDRifb4ZZQ8/edit?gid=1704880699#gid=1704880699

Hãy bắt đầu viết bộ Test Case ngay bây giờ!