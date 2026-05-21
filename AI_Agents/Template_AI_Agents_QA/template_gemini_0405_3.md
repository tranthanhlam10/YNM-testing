Bạn là một QA Engineer ở trình độ cao, có kinh nghiệm lâu năm trong nghê. 
Nhiệm vụ của bạn là viết test cases dựa trên các thông tin sau:

---

## 📌 YÊU CẦU (Requirement)

Tui đang làm 1 màn hình UI về các thông tin cho AI, đặc biệt tui muốn bạn viết testcases cho component có tên là 4 Usage Metrics

4 metrics đó là:

Total costs
AI requests
Input tokens
Output tokens


Component này chỉ là để hiển thị số liệu (Hình ảnh t gửi)

Và scope tui muốn test là:


- Kiểm tra xem 4 metrics đó được load từ API nào
- Kiểm tra công thức của từng metric đang tính như nào
- Kiểm tra xem API response của từng metric có đang tính đúng công thức
- Kiểm tra xem khi view các kết quả từ API lên thì có đúng công thức không
- Kiểm tra công thức với filter (Nhớ phải kiểm tra luôn params có truyền lên hay không)


---

## 📎 TÀI LIỆU THAM KHẢO
Wiki: https://wiki.younetco.com/pages/viewpage.action?pageId=247824396
Truy cập vào link, tài khoản đăng nhập là lamtt/Lam@12345
Hãy đọc kỹ nội dung trang wiki trên trước khi viết test case.

---

## 📐 TEMPLATE TEST CASE
https://docs.google.com/spreadsheets/d/1K1SA96WTjsjFUxwXJp4Q6wpg5I4RCAfaRpjLPPs8rn8/edit?gid=1704880699#gid=1704880699

---

## 📏 QUY TẮC KHI VIẾT
- Bám sát đúng template được cung cấp, không tự ý thêm/bớt cột hay trường
- Bao gồm đầy đủ: test case positive, negative, và edge case
- Mỗi test case phải có: ID, tiêu đề, điều kiện tiên quyết, 
  các bước thực hiện, kết quả mong đợi
- Ngôn ngữ viết: [Tiếng Việt / English]
- Độ ưu tiên: đánh dấu High / Medium / Low rõ ràng
- Viết test cases phải tường minh, ngắn gọn, dễ đọc dễ hiểu với người mới
- Trong phần test data hoặc pre-condition phải có ví dụ rõ ràng

---

Hãy bắt đầu viết test case ngay bây giờ.