# Template nội dung bug Jira

Dùng template đầy đủ cho bug từ test case/Sheet và template tối giản cho bug nhập trực tiếp trong chat. Không tự viết lại nội dung tester đã cung cấp.

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

Riêng nguồn chat, dùng nguyên `Testname` làm Summary, kể cả khi câu chữ chưa theo format trên. Chỉ trim khoảng trắng và cắt theo giới hạn 255 ký tự của Jira.

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

Đây là ba section bắt buộc. Chỉ thêm Preconditions, Test data, Environment, Evidence hoặc Notes khi tester thực sự nhập; không thêm placeholder `Evidence` hay `Source information` cho chat.

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

### Environment

<staging/production/local, build/version, browser/OS when relevant>

### Label classification

- Found In Environment: <Testing/Staging/Production; default to Testing when missing; this is a custom field>
- Root Cause: <exactly one confirmed rc-* or “Not determined — update before closing the bug”>
- System: <at least one sys-* when supported by evidence>
- Test Type: <exactly one test-* when identified>
- Flow: <flow-* only when supported by evidence>
- Detection Source: <found-in-qc when no label is provided>

### Evidence

<log/image/video URL or “No evidence was provided.”>

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
- `priority`: map từ giá trị nguồn đã nhận diện; nếu nguồn bỏ trống thì dùng `Major`.
- `labels`: chỉ thêm label thuộc allowlist trong [bug-label-rules.md](bug-label-rules.md). Nếu nguồn không cung cấp label thì dùng `found-in-qc`.
- Không tự thêm `generated-by-qc`, `linked-testcase`, `no-testcase` hoặc label ngoài allowlist.
- `Found In Environment`: dùng custom field Jira với một trong `Testing`, `Staging`, `Production`; nếu nguồn bỏ trống thì dùng `Testing`.
- `assignee`: không map từ `ASSIGNED TO` nếu chưa có Jira account ID.
- Nếu tool Jira không hỗ trợ label/custom field, không được tuyên bố đã set; dùng REST script hoặc báo rõ giới hạn.
