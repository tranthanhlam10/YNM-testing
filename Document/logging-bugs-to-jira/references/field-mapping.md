# Tuỳ chỉnh mapping cột Sheet ↔ field Jira

File này dùng để ghi đè mapping mặc định trong SKILL.md nếu sheet của bạn có cấu trúc cột khác. Đọc file này khi tên cột trong sheet thực tế không khớp với bảng mặc định trong SKILL.md.

## Cách chỉnh

Sửa bảng dưới đây cho đúng với sheet thực tế của bạn, rồi lưu lại. Lần chạy sau skill sẽ dùng bảng này thay vì mặc định.

| Tên cột trong Google Sheet | Field Jira tương ứng | Ghi chú |
|---|---|---|
| (ví dụ: "Tiêu đề bug") | summary | |
| (ví dụ: "Mô tả chi tiết") | description | |
| (ví dụ: "Mức độ") | priority | Map giá trị text sang priority Jira hợp lệ, xem bảng bên dưới |
| (ví dụ: "Link Jira") | — (cột kết quả) | Cột để skill ghi Jira key/URL vào sau khi tạo |
| (ví dụ: "Test Case ID") | — (quyết định label) | Có giá trị → label `linked-testcase`; trống → label `no-testcase`. Xem SKILL.md phần "Chuẩn định dạng mô tả issue". |

## Map giá trị Priority (nếu cột severity trong sheet dùng chữ khác Jira)

| Giá trị trong sheet | Priority Jira |
|---|---|
| Critical / Nghiêm trọng | Highest |
| High / Cao | High |
| Medium / Trung bình | Medium |
| Low / Thấp | Low |

## Custom field Jira (nếu project dùng field bắt buộc riêng)

Nếu project Jira yêu cầu custom field bắt buộc (ví dụ "Component", "Affects Version", "Epic Link"), thêm vào bảng dưới và nêu rõ nguồn lấy giá trị từ cột nào trong sheet, hoặc giá trị cố định luôn dùng:

| Custom field | Nguồn giá trị |
|---|---|
| (ví dụ: Component) | (ví dụ: luôn set "Backend") |
