




https://k8s.ynm.local/#/deployment/rnd-testing/llms-flow-testing-api?namespace=rnd-testing - QUICK TEST

https://k8s.ynm.local/#/deployment/rnd-testing/llms-flow-testing-prompt-testing?namespace=rnd-testing - BATCH TEST

bấm chạy xong vô đây coi





No Crisis Classification role


Crisis Classification role



Group shop monitoring 2


lamtt_test_restrict_brand@younetgroup.com
Lam@12345


- Không có restrict


ConfirmBug_LamTT_SearchRanking 1

lamtt_test_UNrestrict_brand@younetgroup.com



### CHỦ THỂ & PHẠM VI:

- Tổng quan: [Mô tả ngắn về chủ thể — tên công ty, lĩnh vực hoạt động, quy mô]
- Lãnh đạo: [Họ tên các lãnh đạo cần theo dõi]
- Sản phẩm / Thương hiệu: [Liệt kê sản phẩm, dòng sản phẩm, thương hiệu cần theo dõi]

### TRƯỜNG HỢP LOẠI TRỪ (BẮT BUỘC KIỂM TRA TRƯỚC — luôn crisis_level = 0)

Đây là CỔNG LỌC chạy TRƯỚC khi phân loại, KHÔNG phải một bậc trong thang nguy cơ.
Dù bài viết nhắc đúng chủ thể, nếu khớp BẤT KỲ trường hợp nào dưới đây thì gán crisis_level = 0 và DỪNG ngay, KHÔNG xét tiếp QUY TẮC PHÂN LOẠI:

- Nội dung không phải tiếng Việt (ví dụ: tiếng Anh, tiếng Hàn...), vì chỉ phục vụ thị trường Việt Nam.
- [Bổ sung các trường hợp loại trừ đặc thù của chủ thể khi phát sinh...]

### QUY TẮC PHÂN LOẠI

Chỉ áp dụng khi bài viết KHÔNG rơi vào mục TRƯỜNG HỢP LOẠI TRỪ ở trên.
Nếu bài viết có yếu tố tiêu cực, gán crisis_level = 1 dựa trên các **Dấu hiệu nhận biết** sau:

[Liệt kê các dấu hiệu / nhóm nội dung tiêu cực liên quan đến chủ thể]
