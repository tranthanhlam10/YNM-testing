Bạn là một QA Engineer chuyên nghiệp. Nhiệm vụ của bạn là viết test case 
dựa trên các thông tin sau:

---

## 📌 YÊU CẦU (Requirement)
Team tui có làm 1 tính năng, được cải thiện từ tính năng cũ, là luồng crawling (cào dữ liệu từ platform facebook). Thay đổi của luồng này so với luồng cũ là:
+ Luồng cũ mỗi lần crawl 5 posts, và mỗi post crawl được 25 comment
+ Bây giờ sếp t muốn là mỗi lần crawl 1 posts, và crawl hết tất cả comment/reply của post đó (Hoặc lấy ít nhất là 500 comments của post đó)
+ Dev bên t chỉ thay đổi mỗi param trong API crawlin limit=500
---

## 📎 TÀI LIỆU THAM KHẢO
Wiki: https://wiki.younetco.com/display/FB/DP+-+API+Crawling+Service
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

---

Hãy bắt đầu viết test case ngay bây giờ.