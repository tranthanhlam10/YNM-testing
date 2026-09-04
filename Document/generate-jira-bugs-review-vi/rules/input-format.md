# Định dạng dữ liệu đầu vào

## Nguồn được hỗ trợ

- Google Sheets: đọc metadata để xác định đúng tab, sau đó đọc vùng bảng có giới hạn.
- CSV/TSV: dùng UTF-8 hoặc UTF-8 BOM.
- JSON: dùng mảng top-level hoặc object chứa `testCases`, `test_cases`, `cases`, `rows` hay `data`.
- XLSX: dòng không trống đầu tiên là header.
- Chat: chuyển một bug thành một JSON object theo schema tối giản rồi dùng `--input - --selection-mode all --source-kind chat`.

Chuẩn hóa khoảng trắng, dấu câu, dấu tiếng Việt và chữ hoa/thường trước khi map header. Cột trống hoàn toàn được bỏ qua.

## Task Jira bắt buộc ở cấp yêu cầu

- Cả nguồn Sheet/file và nguồn chat đều phải kèm đúng một Jira task key hoặc URL, truyền vào script bằng `--related-task`.
- Ví dụ hợp lệ: `YNMPECA-9361`, `https://jira.younetco.com/browse/YNMPECA-9361`.
- Không có task thì không chuẩn hóa thành preview và không tạo bug. Không lấy task từ lịch sử/batch trước nếu yêu cầu hiện tại không gửi lại hoặc xác nhận rõ.
- Project của bug lấy từ prefix issue key (`YNMPECA-9361` → `YNMPECA`). `--project` chỉ là đối chiếu tùy chọn và phải khớp.
- Related task là metadata chung của batch, không bắt tester lặp lại thành một cột trong từng dòng test case.

## Schema chuẩn

Nguồn máy chuẩn là [../config/bug-candidate.schema.json](../config/bug-candidate.schema.json). Header alias và field được phép override phải lấy từ file này; bảng dưới đây chỉ giải thích cho người review.

| Trường | Header thường gặp | Bắt buộc |
| --- | --- | --- |
| `bug_summary` | `BUG SUMMARY`, `Bug Title`, `Jira Summary`, `Tiêu đề bug` | Summary hoặc title |
| `title` | `TEST NAME`, `Testname`, `Test Case Name`, `Scenario`, `Name` | Summary hoặc title |
| `component` | `MODULE/FEATURE`, `Module`, `Component`, `Area` | Không |
| `preconditions` | `PRE-CONDITION`, `Preconditions`, `Prerequisites` | Không |
| `steps` | `TEST STEPS`, `Steps to Reproduce`, `Reproduction Steps` | Có để tạo thật |
| `test_data` | `TEST DATA`, `Data`, `Dữ liệu kiểm thử` | Không |
| `expected` | `EXPECTED RESULT`, `Expected Outcome` | Có |
| `actual` | `ACTUAL RESULT`, `Observed Result` | Có |
| `environment` | `ENVIRONMENT`, `Test Environment`, `Platform` | Không; trống dùng `Testing` |
| `branch` | `BRANCH`, `Git Branch`, `Source Branch` | Không |
| `domain` | `DOMAIN`, `Market`, `Country` | Không; có thể nhập nhiều giá trị |
| `target_url` | `TARGET URL`, `Environment URL`, `Base URL` | Không |
| `severity` | `PRIORITY`, `Severity`, `Impact`, `Mức độ` | Không; trống dùng prefix hợp lệ rồi default `Major` |
| `evidence` | `EVIDENCE`, `Screenshot`, `Log`, `Video`, `Attachment` | Không; hỗ trợ nhiều dòng/link |
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

Test-case ID được phép trống. Khi trống, description ghi `Không gắn với test case nào`; skill không tự sinh label từ test-case ID.

## Chính sách chọn candidate

Mặc định script dùng `--selection-mode ready`. Luồng cũ theo `STATUS` cần truyền `--selection-mode status` rõ ràng.

| Mode | Khi dùng | Điều kiện |
| --- | --- | --- |
| `all` | Một bug chat hoặc tập dòng đã được người dùng chọn trước | Chọn mọi object đầu vào chưa có Jira key |
| `ready` | Sheet có cột điều khiển riêng | Giá trị mặc định: `Yes`, `Ready`, `True`, `1` |
| `status` | Luồng cũ và người dùng yêu cầu lọc theo kết quả test | Giá trị mặc định: `BUG`, `failed`, `error` và alias |
| `candidates` | Chưa có tín hiệu chọn dòng | Preview mọi object hợp lệ nhưng cấm tạo Jira |

Không dùng Jira key trống làm tín hiệu chọn candidate. Đây chỉ là điều kiện chống tạo trùng.

Khi người dùng gửi link test case/Sheet và yêu cầu log bug, yêu cầu đó là tín hiệu rõ để dùng mode `status` cho các dòng tester đã đánh `BUG/failed/error`, nếu không có `READY TO JIRA` hoặc row/ID cụ thể được ưu tiên hơn.

## Ví dụ bug từ chat

```json
[
  {
    "Testname": "File XLSX vẫn chứa cột Total Sold",
    "Step": "1. Mở Price Monitoring\n2. Export XLSX\n3. Mở file",
    "Actual Result": "File vẫn hiển thị cột Total Sold và dữ liệu Sold",
    "Expected Result": "File không có cột Total Sold"
  }
]
```

Với `source-kind=chat`, bốn trường `Testname`, `Step`, `Actual Result`, `Expected Result` là đủ cho nội dung bug; yêu cầu vẫn phải có related task ở cấp batch. Các trường bug còn lại không bắt buộc và dùng default `Testing`, `Major`, `found-in-qc`.

Các target/evidence tùy chọn trong chat:

```text
Environment: Testing
Branch: feat/priority-loader
Domain: VN, TH
Target URL: https://testing.example.com
Evidence:
- Screenshot: https://drive.google.com/...
- Log: https://drive.google.com/...
```

Branch và Domain có thể chứa nhiều giá trị, nhưng MVP không tự tạo mọi tổ hợp. `Environment` phải map về đúng một stage để đạt `CREATE_READY`; nếu nhập nhiều stage, preview vẫn hiển thị nhưng yêu cầu tester chọn một stage hoặc yêu cầu tách bug rõ ràng.

## Summary và priority

- Summary mặc định: `[MODULE/FEATURE] TRIỆU CHỨNG LỖI`.
- Ưu tiên `BUG SUMMARY` mô tả lỗi; nếu trống hoặc chỉ là mục tiêu test, đề xuất từ `ACTUAL RESULT`; cuối cùng mới fallback về `TEST NAME`.
- Summary đề xuất từ Actual chỉ được bỏ từ đệm, chuẩn hóa thuật ngữ trong policy và sắp xếp lại trigger/triệu chứng đã có trong nguồn; không suy đoán root cause.
- Không đưa `[BUG]`, test-case ID, priority hoặc test type vào summary.
- Riêng nguồn chat, dùng `Testname` làm Summary; chỉ loại metadata prefix được khai báo trong policy, không thêm Module và không thay phần nội dung còn lại bằng Actual.
- Priority lấy theo thứ tự: field `PRIORITY/Severity` hợp lệ → priority prefix trong Testname → default `Major`.
- Prefix test metadata như `[Positive]`, `[Negative]`, `[Boundary]` được bỏ khỏi Summary và chỉ map sang test type nếu có trong policy. Prefix không nhận diện được phải được giữ nguyên.
- Giới hạn độ dài, từ mở đầu chung chung và cách viết thuật ngữ đọc từ `summary` trong [../config/policies.json](../config/policies.json), không hardcode lại trong script.

## Map môi trường và label

- `ENVIRONMENT` có giá trị phải chứa stage để map sang custom field `Found In Environment`: Testing, Staging hoặc Production; trống → Testing.
- `TEST TYPE` được map sang đúng một label `test-*` theo [bug-label-rules.md](bug-label-rules.md).
- Nếu nguồn có `ROOT CAUSE`, chỉ nhận label `rc-*` thuộc taxonomy; không nhận câu phỏng đoán nguyên nhân.
- Có thể cung cấp rõ `SYSTEM LABELS` và `FLOW LABELS`; nếu trống, skill chỉ suy system/flow khi có dấu hiệu rõ trong bug.
- Với nguồn chat, thiếu System hoặc Test Type không chặn draft; chỉ thêm label thuộc allowlist khi có bằng chứng rõ.
- Nếu không có bất kỳ label rõ ràng nào, thêm `found-in-qc`.
- Chỉ chấp nhận label thuộc allowlist trong [bug-label-rules.md](bug-label-rules.md); label khác bị loại và tạo cảnh báo chặn.

## Map header tùy chỉnh

File JSON map field chuẩn sang header nguồn chính xác. Ví dụ:

```json
{
  "bug_summary": "Tiêu đề bug",
  "steps": "Các bước thực hiện",
  "expected": "Kết quả mong đợi",
  "actual": "Kết quả thực tế",
    "environment": "Môi trường",
    "branch": "Nhánh test",
    "domain": "Thị trường",
    "target_url": "Link môi trường",
  "severity": "Mức độ",
  "bug_id": "Jira Key"
}
```

## Override từng dòng

`--overrides` nhận JSON object có tối đa ba section. Override chỉ tác động bản preview/payload, không sửa file nguồn:

```json
{
  "defaults": {
    "environment": "testing"
  },
  "test_case_ids": {
    "TC-001": {
      "actual": "Thông báo Save successful nhưng dữ liệu không được lưu"
    }
  },
  "rows": {
    "12": {
      "severity": "High",
      "evidence": "https://drive.google.com/..."
    }
  }
}
```

Thứ tự ưu tiên là `defaults` → `test_case_ids` → `rows`; cấu hình cụ thể hơn ghi đè cấu hình trước. Source row tính theo bảng có header ở dòng 1, nên data đầu tiên là row `2`. Chỉ field nằm trong `x-row-override-fields` của canonical schema được sửa; không cho override `bug_id`, status chọn dòng, related task hoặc project.

## Google Sheet adapter và writeback

- Agent đọc metadata và map đúng `gid` sang tên tab trước khi đọc dữ liệu.
- Script nhận dữ liệu đã đọc, tạo `source_locator` gồm spreadsheet ID, gid, tab, source row, ô BUG ID và row fingerprint.
- Sau khi Jira bug đã được tạo và link task, script sinh `writeback_plan`; script không tự gọi MCP.
- Agent chỉ thực hiện plan sau xác nhận riêng, phải đọc lại toàn bộ dòng và ô BUG ID. Nếu fingerprint hoặc giá trị ô thay đổi, dừng với `WRITEBACK_CONFLICT`.
- Chỉ ghi Jira key/URL vào `BUG ID`; không tự đổi STATUS hoặc BUG STATUS.
