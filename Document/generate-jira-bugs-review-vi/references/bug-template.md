# Template nội dung bug Jira

Dùng template này cho cả preview trong chat và payload Jira. Chỉ hiển thị section có dữ liệu, ngoại trừ `Bằng chứng` và `Thông tin nguồn`.

## Summary

```text
[MODULE/FEATURE] Hành vi lỗi quan sát được
```

Ví dụ:

```text
[Callback API] Redis key không bị xóa sau callback hoàn tất
```

Không dùng dạng `[BUG][TC_ID] [High] [Positive] Kiểm tra...` vì đó là metadata và mục tiêu kiểm thử, không phải triệu chứng bug.

## Description

```markdown
### Điều kiện tiên quyết

<PRE-CONDITION>

### Các bước tái hiện

1. <Bước 1>
2. <Bước 2>
3. <Bước 3>

### Kết quả thực tế

<ACTUAL RESULT, chỉ mô tả điều đã quan sát>

### Kết quả mong đợi

<EXPECTED RESULT>

### Dữ liệu kiểm thử

<TEST DATA>

### Môi trường

<ENVIRONMENT nếu có>

### Bằng chứng

<URL log/ảnh/video, hoặc “Chưa có bằng chứng được cung cấp.”>

### Ghi chú

<REMARKS nếu có>

### Thông tin nguồn

- Test case: <TEST CASE ID>
- Kịch bản kiểm thử: <TEST NAME>
- Module/Feature: <MODULE/FEATURE>
- Priority nguồn: <PRIORITY>
- Loại kiểm thử: <TEST TYPE>
- Người thực hiện nguồn: <ASSIGNED TO>
- Dòng nguồn: <SOURCE ROW>
- URL nguồn: <SOURCE URL>
- Trạng thái bug nguồn: <BUG STATUS nếu có>
```

## Jira fields

- `issuetype`: `Bug` nếu người dùng không chỉ định loại khác.
- `priority`: chỉ map từ priority nguồn theo quality rules.
- `assignee`: không map từ `ASSIGNED TO` nếu chưa có Jira account ID.
- `labels`: giữ cấu hình của lệnh hoặc project.
- `description`: dùng Atlassian Document Format khi gọi Jira Cloud API v3.
