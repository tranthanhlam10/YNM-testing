Bạn là một QA Engineer ở trình độ cao, có kinh nghiệm lâu năm trong nghê. 
Nhiệm vụ của bạn là viết test cases dựa trên các thông tin sau:

---

## 📌 YÊU CẦU (Requirement)
Tui đang làm 1 màn hình UI về các thông tin cho AI, đặc biệt tui muốn bạn viết testcases cho component filter

Trong filter thì các các fields:

Date Range
Company
Department
Topic
User
Task Type
Model


Trong các field đó thì:

- Date range: date-time-packer
- Company: Dropdown button (multiple select) với các Option: Buzzmetrics, Younet Media, Younet Group, giá trị default là All companys
- Department: Dropdown button (multiple select) với các option: I&I, Younet Media, PMO, CI, giá trị default là all departments
- Topic: Dropdown button (multiple select) với các topic có ID là number, giá trị default là all topics
- User: Dropdown button (multiple select) với username là string, giá trị default là all users
- Task Type: Dropdown button (multiple select) với các option: Post Spam Classification,Attribute Classification,Sentiment Classification,Crisis Classification,Crisis Image/Video Analyze, giá trị default là all task types
- Model: Dropdown button (multiple select) với các option: GPT-4o, GPT-4 Turbo, GPT-3.5, Gemini 1.5 Pro, Claude 3.5 Sonnet, giá trị default là all models


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