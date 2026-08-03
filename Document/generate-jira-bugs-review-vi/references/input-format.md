# Định dạng dữ liệu test case

## Nguồn được hỗ trợ

- Google Sheets: dùng connector Google Sheets, đọc metadata để xác định đúng tab rồi đọc một vùng bảng có giới hạn. Chuyển các dòng thành JSON có key là header. Nếu không có connector, yêu cầu tải XLSX hoặc CSV.
- CSV/TSV: dùng UTF-8 hoặc UTF-8 BOM; tự nhận diện dấu phân cách.
- JSON: dùng mảng ở top level hoặc object chứa `testCases`, `test_cases`, `cases`, `rows` hay `data`. Có thể truyền JSON qua stdin bằng `--input -`.
- XLSX: đọc một worksheet bằng package tùy chọn `openpyxl`. Dòng không trống đầu tiên là header.

Chuẩn hóa khoảng trắng, tab, dấu câu, dấu tiếng Việt và chữ hoa/thường trước khi map header. Bỏ qua cột trống hoàn toàn, ví dụ cột A đứng trước bảng.

## Mapping của Google Sheet mẫu

Bảng mẫu thường bắt đầu từ cột B trong khi cột A để trống.

| Cột | Header | Trường chuẩn | Cách dùng trong Jira |
| --- | --- | --- | --- |
| B | `TEST CASE ID` | `test_case_id` | Truy vết và prefix summary |
| C | `MODULE/FEATURE` | `component` | Ngữ cảnh trong description |
| D | `TEST NAME` | `title` | Tên kịch bản nguồn; giữ trong phần truy vết, không mặc định dùng làm summary Jira |
| E | `PRE-CONDITION` | `preconditions` | Điều kiện tiên quyết |
| F | `TEST STEPS` | `steps` | Các bước tái hiện |
| G | `TEST DATA` | `test_data` | Dữ liệu kiểm thử |
| H | `EXPECTED RESULT` | `expected` | Bằng chứng bắt buộc |
| I | `ACTUAL RESULT` | `actual` | Bằng chứng bắt buộc |
| J | `REMARKS` | `remarks` | Ghi chú nguồn |
| K | `STATUS` | `status` | Lọc ứng viên; nhận `BUG` |
| L | `PRIORITY` | `severity` | Map priority Jira khi nhận diện được |
| M | `TEST TYPE` | `test_type` | Ngữ cảnh loại kiểm thử |
| N | `ASSIGNED TO` | `assigned_to` | Chỉ giữ người test nguồn |
| O | `BUG ID` | `bug_id` | Có dữ liệu thì bỏ qua để chống trùng |
| P | `BUG STATUS` | `bug_status` | Ngữ cảnh bug hiện hữu, không dùng để lọc test |

Mặc định chọn `STATUS=BUG`, `failed`, `fail`, `error`, `errored`, `thất bại` và `lỗi`. Không coi `OPEN`, `PASSED`, `IGNORE`, `BLOCKED`, `PENDING` hoặc ô trống là bug nếu người dùng không yêu cầu rõ.

Summary Jira mặc định có dạng `[MODULE/FEATURE] TRIỆU CHỨNG LỖI`. Nếu nguồn có cột `BUG SUMMARY`, dùng nội dung đó sau khi kiểm tra chất lượng. Nếu không có, rút gọn `ACTUAL RESULT` thành một câu mô tả hành vi quan sát được. Không đưa `[BUG]`, test-case ID, priority hoặc loại test vào summary nếu người dùng không yêu cầu riêng.

Khi đọc dữ liệu bằng connector, agent có thể thêm `BUG SUMMARY` như một trường dẫn xuất chỉ dùng cho preview. Trường này được phép ghép triệu chứng từ `ACTUAL RESULT` với trigger hoặc đối tượng đã nêu rõ trong steps, ví dụ `Redis key không bị xóa sau callback hoàn tất`. Không ghi trường dẫn xuất trở lại file nguồn nếu chưa được yêu cầu.

Description dùng template trong [bug-template.md](bug-template.md). `TEST NAME`, test-case ID, module/feature, priority nguồn, test type, người thực hiện, URL và số dòng nguồn được giữ trong phần `Thông tin nguồn` để truy vết.

## Các trường chuẩn khác

| Trường chuẩn | Header khác được chấp nhận | Bắt buộc |
| --- | --- | --- |
| `test_case_id` | `case id`, `tc id`, `test id`, `id`, `mã testcase` | ID hoặc title |
| `title` | `test case name`, `name`, `title`, `scenario`, `tên testcase` | ID hoặc title |
| `bug_summary` | `bug title`, `jira summary`, `defect title`, `tiêu đề bug` | Không |
| `status` | `result`, `execution status`, `test result`, `kết quả chạy` | Có |
| `steps` | `steps`, `reproduction steps`, `steps to reproduce`, `các bước thực hiện` | Khuyến nghị |
| `expected` | `expected`, `expected outcome`, `kết quả mong đợi` | Có |
| `actual` | `actual`, `observed result`, `kết quả thực tế` | Có |
| `environment` | `environment`, `env`, `test environment`, `platform` | Khuyến nghị |
| `severity` | `severity`, `impact`, `mức độ`, `độ ưu tiên` | Không |
| `evidence` | `evidence`, `attachment`, `screenshot`, `log`, `video` | Không |

## Map header tùy chỉnh

Tạo một JSON object với key là trường chuẩn và value là header nguồn chính xác. Mapping tường minh được ưu tiên hơn alias tự động.

```json
{
  "test_case_id": "Mã testcase",
  "title": "Tên chức năng",
  "status": "Kết quả chạy",
  "steps": "Các bước thực hiện",
  "expected": "Kết quả mong đợi",
  "actual": "Kết quả thực tế",
  "bug_id": "Mã Jira"
}
```

Chỉ dùng các trường chuẩn được mô tả trong file này.
