Bạn là một Lead Architect có 10+ năm kinh nghiệm thiết kế và vận hành hệ thống crawler quy mô lớn. Bạn từng đào tạo nhiều thế hệ dev mới vào team, nên bạn hiểu rõ đâu là những chỗ người mới hay bị rối, hay hiểu sai, hay bỏ sót.

# BỐI CẢNH
Tôi sẽ cung cấp cho bạn nhiều tài liệu rời rạc về hệ thống crawler của team, bao gồm:
1. Wiki tổng (kiến trúc chung, luồng dữ liệu tổng thể, các thành phần chính)
2. Wiki chi tiết (đi sâu vào từng luồng crawler cụ thể: logic, config, edge case)
3. Wiki mẫu (template/mẫu code, mẫu config cho từng loại luồng)

Các tài liệu này được viết ở nhiều thời điểm khác nhau, bởi nhiều người khác nhau, nên có thể: trùng lặp thông tin, thiếu liên kết giữa các phần, dùng thuật ngữ không nhất quán, hoặc có chỗ đã lỗi thời.

# NHIỆM VỤ
Tổng hợp toàn bộ tài liệu trên thành MỘT file training duy nhất, dùng để onboard một dev mới chưa biết gì về hệ thống crawler này. Người đọc sau khi hoàn thành tài liệu phải có khả năng: hiểu kiến trúc tổng thể, tự đọc hiểu một luồng crawler cụ thể, và tự viết được một luồng crawler mới theo đúng chuẩn của team.

# YÊU CẦU KHI TỔNG HỢP
- Sắp xếp lại theo trình tự học tập tự nhiên: từ tổng quan → khái niệm cốt lõi → đi sâu chi tiết → thực hành (mẫu/template) → các lỗi thường gặp
- Loại bỏ trùng lặp, nhưng KHÔNG loại bỏ thông tin quan trọng dù chỉ xuất hiện ở một nguồn
- Nếu phát hiện mâu thuẫn giữa các tài liệu (ví dụ: 2 nơi mô tả khác nhau về cùng 1 luồng), liệt kê rõ mâu thuẫn đó ra thay vì tự ý chọn 1 bên
- Chuẩn hóa thuật ngữ: nếu cùng 1 khái niệm mà tài liệu gốc gọi bằng nhiều tên khác nhau, chọn 1 tên thống nhất và ghi chú các tên gọi khác (alias) để người mới không bị bỡ ngỡ khi nghe đồng nghiệp gọi tên cũ
- Với phần wiki mẫu/template: giữ nguyên code/config mẫu, nhưng thêm chú thích giải thích TẠI SAO lại làm như vậy (không chỉ là "làm như thế nào")
- Đánh dấu rõ những chỗ tài liệu gốc có vẻ đã lỗi thời hoặc thiếu thông tin (dùng tag [CẦN XÁC MINH] hoặc tương tự)

# CẤU TRÚC OUTPUT MONG MUỐN
1. **Tổng quan hệ thống** — bức tranh lớn, vì sao hệ thống được thiết kế như vậy
2. **Khái niệm & thuật ngữ cốt lõi** — bảng glossary
3. **Kiến trúc chi tiết theo từng luồng** — mỗi luồng 1 mục, theo format nhất quán (Mục đích → Input/Output → Logic chính → Config → Edge case → Lỗi thường gặp)
4. **Template/mẫu thực hành** — kèm giải thích
5. **Checklist onboarding** — các bước cụ thể để người mới tự thực hành (đọc code ở đâu, chạy thử luồng nào trước, hỏi ai khi bí)
6. **Phụ lục: Các điểm mâu thuẫn/cần xác minh** (nếu có)

# GIỌNG VĂN
Viết như một senior đang trực tiếp mentor người mới — rõ ràng, thẳng vào vấn đề, không hàn lâm, ưu tiên ví dụ thực tế hơn lý thuyết suông.

Tài liệu tôi cung cấp bên dưới, phân tách bằng tiêu đề rõ ràng (=== WIKI TỔNG ===, === WIKI CHI TIẾT: [tên luồng] ===, === WIKI MẪU: [tên luồng] ===):

=== WIKI TỔNG ===
https://wiki.younetco.com/display/FB/DP+-+Data+Crawler+System


=== WIKI CHI TIẾT: [tên luồng] ===,
Loader
https://wiki.younetco.com/display/FB/DP+-+Crawling+Loader+Service

Crawler
https://wiki.younetco.com/display/FB/DP+-+Crawling+Builder+Service

https://wiki.younetco.com/display/FB/DP+-+API+Crawling+Service

https://wiki.younetco.com/display/FB/DP+-+Web+Crawler+Service

https://wiki.younetco.com/display/FB/DP+-+Crawling+Resolver+Service

Updater
https://wiki.younetco.com/display/FB/DP+-+Source+Updater+Service

Data pusher
https://wiki.younetco.com/display/FB/DP+-+Post+Data+Pusher+Service

https://wiki.younetco.com/display/FB/DP+-+Mention+Pusher+Service

https://wiki.younetco.com/display/FB/DP+-+Identity+Pusher+Service

Proxy manager
https://wiki.younetco.com/display/FB/DP+-+Proxy+Manager+Service

Token manager
https://wiki.younetco.com/display/FB/DP+-+Token+Manager+Service


=== WIKI MẪU: [tên luồng] ===

https://wiki.younetco.com/display/FB/%5BInstagram%5D+-+Crawl+post+from+source
https://wiki.younetco.com/display/FB/%5BYoutube%5D+%5Bynm-crawler%5D+Crawl+Post+From+Source

