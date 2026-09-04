# Template nội dung bug Jira

Dùng template đầy đủ cho bug từ test case/Sheet và template tối giản cho bug nhập trực tiếp trong chat. Giữ nguyên nội dung tester trong Description; riêng Summary có thể được rút gọn theo rule bên dưới và phải hiện ở preview để review.

Tất cả section heading và nhãn metadata do template sinh ra phải dùng tiếng Anh. Nội dung tester nhập có thể là tiếng Việt hoặc tiếng Anh và phải được giữ nguyên.

## Summary

```text
[MODULE/FEATURE] Hành vi lỗi quan sát được
```

Ví dụ:

```text
[Price Monitoring - Export] File XLSX vẫn chứa cột Total Sold
```

Không dùng `[BUG][TC_ID]`, priority, test type hoặc câu mục tiêu kiểm thử như “Kiểm tra...”.

Với Sheet/file:

- Ưu tiên `BUG SUMMARY` nếu nội dung mô tả lỗi; nếu đây là câu mục tiêu test như “Kiểm tra...”, dùng `Actual result`.
- Khi tạo từ Actual, được bỏ từ mở đầu chung chung, chuẩn hóa khoảng trắng/cách viết thuật ngữ và đổi câu `Khi A thì B` thành `B khi A`.
- Có thể rút gọn cấu trúc ví dụ thành triệu chứng + ngữ cảnh, nhưng không thêm nguyên nhân, tác động hay dữ kiện không có trong nguồn.
- Thêm `[MODULE/FEATURE]` khi có và giới hạn tối đa lấy từ `summary.max_length` trong policy.
- Draft phải lưu `summary_proposal.source`, `summary_proposal.transformations` và `summary_proposal.review_required=true` để tester review được thay đổi.

Riêng nguồn chat, dùng `Testname` làm Summary. Chỉ loại metadata prefix priority/test type có trong policy, trim khoảng trắng và cắt theo giới hạn cấu hình; giữ nguyên prefix không nhận diện và không thay nội dung bằng Actual.

## Description

### Nguồn chat — template tối giản

```markdown
### Steps to reproduce

<Step>

### Actual result

<Actual Result>

### Expected result

<Expected Result>
```

Đây là ba section bắt buộc. Chỉ thêm Preconditions, Test data, Affected targets, Evidence hoặc Notes khi tester thực sự nhập; không thêm placeholder `Evidence` hay `Source information` cho chat.

### Nguồn test case/Sheet — template đầy đủ

```markdown
### Preconditions

<PRE-CONDITION if provided>

### Steps to reproduce

1. <Step 1>
2. <Step 2>
3. <Step 3>

### Actual result

<ACTUAL RESULT provided by the tester>

### Expected result

<EXPECTED RESULT>

### Test data

<TEST DATA if provided>

### Affected targets

- Environment: <Testing/Staging/Production>
- Branch: <one or more branches if provided>
- Domain: <one or more domains if provided>
- URL: <target URL if provided>

### Label classification

- Found In Environment: <Testing/Staging/Production; default to Testing when missing; this is a custom field>
- Root Cause: <exactly one confirmed rc-* or “Not determined — update before closing the bug”>
- System: <at least one sys-* when supported by evidence>
- Test Type: <exactly one test-* when identified>
- Flow: <flow-* only when supported by evidence>
- Detection Source: <found-in-qc when no label is provided>

### Evidence

- <Screenshot URL>
- <Log URL>
- <Video URL>

Nếu không có Evidence, ghi `No evidence was provided.` cho nguồn Sheet/file. Nguồn chat không thêm placeholder khi tester không nhập.

### Notes

<REMARKS if provided>

### Source information

- Input source: <sheet/file/chat>
- Test case: <TEST CASE ID or “No linked test case”>
- Test scenario: <TEST NAME if provided>
- Module/Feature: <MODULE/FEATURE if provided>
- Source priority: <PRIORITY>
- Test type: <TEST TYPE if provided>
- Source assignee: <ASSIGNED TO if provided>
- Selection reason: <explicit rows/ready flag/status/chat>
- Source row: <SOURCE ROW for non-chat sources>
- Source URL: <SOURCE URL if provided>
- Source test status: <STATUS if provided>
- Source bug status: <BUG STATUS if provided>
```

## Jira fields

- `project`: bắt buộc lấy từ related task (`YNMPECA-9361` → `YNMPECA`); không lấy project độc lập từ tester nếu không khớp task.
- `related task`: metadata bắt buộc của batch; không có task thì không dựng preview hoặc tạo bug.
- `issue link`: mỗi bug tạo thật phải có link loại `Relates` với related task. Quan hệ này là issue link, không phải parent/sub-task và không cần chèn vào Description.
- `issuetype`: mặc định `Bug`.
- `priority`: ưu tiên field nguồn, sau đó metadata prefix Testname, cuối cùng dùng default `Major` trong policy.
- `labels`: chỉ thêm label thuộc allowlist trong [bug-label-rules.md](bug-label-rules.md). Nếu nguồn không cung cấp label thì dùng `found-in-qc`.
- Không tự thêm `generated-by-qc`, `linked-testcase`, `no-testcase` hoặc label ngoài allowlist.
- `Found In Environment`: dùng custom field Jira với một trong `Testing`, `Staging`, `Production`; nếu nguồn bỏ trống thì dùng `Testing`.
- `assignee`: không map từ `ASSIGNED TO` nếu chưa có Jira account ID.
- Nếu tool Jira không hỗ trợ label/custom field, không được tuyên bố đã set; dùng REST script hoặc báo rõ giới hạn.
