# Định dạng dữ liệu đầu vào

## Nguồn được hỗ trợ

- Google Sheets: đọc metadata để xác định đúng tab, sau đó đọc vùng bảng có giới hạn.
- CSV/TSV: dùng UTF-8 hoặc UTF-8 BOM.
- JSON: dùng mảng top-level hoặc object chứa `testCases`, `test_cases`, `cases`, `rows` hay `data`.
- XLSX: dòng không trống đầu tiên là header.
- Chat: chuyển một bug thành một JSON object theo schema chuẩn rồi dùng `--input - --selection-mode all --source-kind chat`.

Chuẩn hóa khoảng trắng, dấu câu, dấu tiếng Việt và chữ hoa/thường trước khi map header. Cột trống hoàn toàn được bỏ qua.

## Schema chuẩn

| Trường | Header thường gặp | Bắt buộc |
| --- | --- | --- |
| `bug_summary` | `BUG SUMMARY`, `Bug Title`, `Jira Summary`, `Tiêu đề bug` | Summary hoặc title |
| `title` | `TEST NAME`, `Test Case Name`, `Scenario`, `Name` | Summary hoặc title |
| `component` | `MODULE/FEATURE`, `Module`, `Component`, `Area` | Không |
| `preconditions` | `PRE-CONDITION`, `Preconditions`, `Prerequisites` | Không |
| `steps` | `TEST STEPS`, `Steps to Reproduce`, `Reproduction Steps` | Có để tạo thật |
| `test_data` | `TEST DATA`, `Data`, `Dữ liệu kiểm thử` | Không |
| `expected` | `EXPECTED RESULT`, `Expected Outcome` | Có |
| `actual` | `ACTUAL RESULT`, `Observed Result` | Có |
| `environment` | `ENVIRONMENT`, `Test Environment`, `Platform` | Có để tạo thật |
| `severity` | `PRIORITY`, `Severity`, `Impact`, `Mức độ` | Có để tạo thật |
| `evidence` | `EVIDENCE`, `Screenshot`, `Log`, `Video`, `Attachment` | Không |
| `test_case_id` | `TEST CASE ID`, `TC ID`, `Test ID` | Không |
| `test_type` | `TEST TYPE`, `Loại kiểm thử` | Không |
| `root_cause_label` | `ROOT CAUSE`, `Root Cause Label`, `Nguyên nhân gốc` | Không; chỉ điền khi đã xác nhận |
| `system_labels` | `SYSTEM LABEL`, `SYSTEM LABELS`, `Technical System` | Không; skill có thể phân loại từ hành vi bug |
| `flow_labels` | `FLOW LABEL`, `FLOW LABELS` | Không |
| `jira_labels` | `JIRA LABELS`, `LABELS` | Không |
| `assigned_to` | `ASSIGNED TO`, `Tester`, `Owner` | Không |
| `remarks` | `REMARKS`, `Notes`, `Ghi chú` | Không |
| `status` | `STATUS`, `Result`, `Execution Status` | Chỉ với selection mode `status` |
| `ready_to_jira` | `READY TO JIRA`, `Ready to Push`, `Push Jira`, `Log Jira` | Chỉ với selection mode `ready` |
| `bug_id` | `BUG ID`, `Jira Key`, `Jira ID`, `Issue Key`, `Link Jira` | Không; có giá trị thì skip |
| `bug_status` | `BUG STATUS`, `Jira Status`, `Issue Status` | Không |
| `source_type` | `SOURCE TYPE`, `Nguồn bug` | Không |
| `selection_reason` | `SELECTION REASON`, `Lý do chọn` | Không |

Test-case ID được phép trống. Khi trống, description ghi `Không gắn với test case nào` và payload nhận label `no-testcase`.

## Chính sách chọn candidate

Mặc định script dùng `--selection-mode ready`. Luồng cũ theo `STATUS` cần truyền `--selection-mode status` rõ ràng.

| Mode | Khi dùng | Điều kiện |
| --- | --- | --- |
| `all` | Một bug chat hoặc tập dòng đã được người dùng chọn trước | Chọn mọi object đầu vào chưa có Jira key |
| `ready` | Sheet có cột điều khiển riêng | Giá trị mặc định: `Yes`, `Ready`, `True`, `1` |
| `status` | Luồng cũ và người dùng yêu cầu lọc theo kết quả test | Giá trị mặc định: `BUG`, `failed`, `error` và alias |
| `candidates` | Chưa có tín hiệu chọn dòng | Preview mọi object hợp lệ nhưng cấm tạo Jira |

Không dùng Jira key trống làm tín hiệu chọn candidate. Đây chỉ là điều kiện chống tạo trùng.

## Ví dụ bug từ chat

```json
[
  {
    "BUG SUMMARY": "[Price Monitoring - Export] File XLSX vẫn chứa cột Total Sold",
    "TEST STEPS": "1. Mở Price Monitoring\n2. Export XLSX\n3. Mở file",
    "EXPECTED RESULT": "File không có cột Total Sold",
    "ACTUAL RESULT": "File vẫn hiển thị cột Total Sold và dữ liệu Sold",
    "ENVIRONMENT": "Staging - Chrome",
    "PRIORITY": "High",
    "TEST CASE ID": "",
    "SOURCE TYPE": "chat"
  }
]
```

## Summary và priority

- Summary mặc định: `[MODULE/FEATURE] TRIỆU CHỨNG LỖI`.
- Ưu tiên `BUG SUMMARY`; nếu không có, rút gọn `ACTUAL RESULT` mà không suy đoán root cause.
- Không đưa `[BUG]`, test-case ID, priority hoặc test type vào summary.
- Map priority: Critical/Blocker → Highest, High → High, Medium → Medium, Low → Low, Lowest/Trivial → Lowest.

## Map môi trường và label

- `ENVIRONMENT` phải chứa stage để map sang custom field `Found In Environment`: Testing, Staging hoặc Production.
- `TEST TYPE` được map sang đúng một label `test-*` theo [bug-label-rules.md](bug-label-rules.md).
- Nếu nguồn có `ROOT CAUSE`, chỉ nhận label `rc-*` thuộc taxonomy; không nhận câu phỏng đoán nguyên nhân.
- Có thể cung cấp rõ `SYSTEM LABELS` và `FLOW LABELS`; nếu trống, skill chỉ suy system/flow khi có dấu hiệu rõ trong bug.

## Map header tùy chỉnh

File JSON map field chuẩn sang header nguồn chính xác. Ví dụ:

```json
{
  "bug_summary": "Tiêu đề bug",
  "steps": "Các bước thực hiện",
  "expected": "Kết quả mong đợi",
  "actual": "Kết quả thực tế",
  "environment": "Môi trường",
  "severity": "Mức độ",
  "bug_id": "Jira Key"
}
```
