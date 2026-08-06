# Template nội dung bug Jira

Dùng cùng một template cho bug từ test case, exploratory/edge case và bug nhập trực tiếp trong chat. Chỉ hiển thị section có dữ liệu, ngoại trừ `Bằng chứng` và `Thông tin nguồn`.

## Summary

```text
[MODULE/FEATURE] Hành vi lỗi quan sát được
```

Ví dụ:

```text
[Price Monitoring - Export] File XLSX vẫn chứa cột Total Sold
```

Không dùng `[BUG][TC_ID]`, priority, test type hoặc câu mục tiêu kiểm thử như “Kiểm tra...”.

## Description

```markdown
### Điều kiện tiên quyết

<PRE-CONDITION nếu có>

### Các bước tái hiện

1. <Bước 1>
2. <Bước 2>
3. <Bước 3>

### Kết quả thực tế

<ACTUAL RESULT, chỉ mô tả điều đã quan sát>

### Kết quả mong đợi

<EXPECTED RESULT>

### Dữ liệu kiểm thử

<TEST DATA nếu có>

### Môi trường

<staging/production/local, build/version, browser/OS nếu liên quan>

### Phân loại label

- Found In Environment: <Testing/Staging/Production; đây là custom field, không phải label>
- Root Cause: <đúng một rc-* hoặc “Chưa xác định — cập nhật trước khi đóng bug”>
- System: <tối thiểu một sys-*>
- Test Type: <đúng một test-* nếu xác định được>
- Flow: <flow-* nếu có bằng chứng rõ>

### Bằng chứng

<URL log/ảnh/video hoặc “Chưa có bằng chứng được cung cấp.”>

### Ghi chú

<REMARKS nếu có>

### Thông tin nguồn

- Nguồn nhập: <sheet/file/chat>
- Test case: <TEST CASE ID hoặc “Không gắn với test case nào”>
- Kịch bản kiểm thử: <TEST NAME nếu có>
- Module/Feature: <MODULE/FEATURE nếu có>
- Priority nguồn: <PRIORITY>
- Loại kiểm thử: <TEST TYPE nếu có>
- Người thực hiện nguồn: <ASSIGNED TO nếu có>
- Lý do chọn candidate: <explicit rows/ready flag/status/chat>
- Dòng nguồn: <SOURCE ROW nếu không phải chat>
- URL nguồn: <SOURCE URL nếu có>
- Trạng thái test nguồn: <STATUS nếu có>
- Trạng thái bug nguồn: <BUG STATUS nếu có>
```

## Jira fields

- `issuetype`: mặc định `Bug`.
- `priority`: chỉ map từ giá trị nguồn đã nhận diện.
- `labels`: thêm taxonomy theo [bug-label-rules.md](bug-label-rules.md), cộng `linked-testcase` nếu có test-case ID hoặc `no-testcase` nếu không có.
- `Found In Environment`: dùng custom field Jira với một trong `Testing`, `Staging`, `Production`; không gửi `found-in-*` trong labels.
- `assignee`: không map từ `ASSIGNED TO` nếu chưa có Jira account ID.
- Nếu tool Jira không hỗ trợ label/custom field, không được tuyên bố đã set; dùng REST script hoặc báo rõ giới hạn.
