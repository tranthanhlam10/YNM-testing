Bạn là một QA Engineer ở trình độ cao, có kinh nghiệm lâu năm trong nghê. 
Nhiệm vụ của bạn là viết test cases dựa trên các thông tin sau:

---

## 📌 YÊU CẦU (Requirement)
Team tui có là 1 tính năng crawl tiktok, crawl từ hashtag keyword,
Có nghĩa là người dùng truyền 1 keyword/hashtag vào, thì hệ thống sẽ crawl nó, để muốn crawl thì phải gọi qua tiktok service, nhưng vấn đề là quá nhiều luồng gọi tới service đó
Để cải thiện thì dev bên t đã gọi trực tiếp vào tiktok API, không cần phải gọi qua service tiktok nữa (là ý điều chỉnh đầu tiên)

Ngoài ra tui cần phải test thêm trong task này là tích hợp crawl crisis-image vào luồng (là ý điều chỉnh thứ 2), luồng đó đã được test trước đó, nhưng tui vẫn phải test lại
Luồng đó tui dựa theo cờ is_analyze = 1 của message đầu vào, đi crawl bình thường, sau đó đẩy qua 1 luồng download khác (Luồng download không cần test), còn nếu không có cờ đó thì trả ra kết quả như luồng thường


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