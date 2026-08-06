---
name: generate-jira-bugs
description: Tạo bản nháp hoặc issue Jira Cloud từ Google Sheets, CSV, JSON, XLSX hay mô tả bug trực tiếp trong chat. Hỗ trợ bug có hoặc không có test case, exploratory/edge case và các dòng Sheet không đổi STATUS; tự phân loại label Root Cause, System, Test Type và Flow theo quy ước YouNet; luôn kiểm tra chất lượng, chống trùng, preview và chỉ tạo hoặc ghi ngược Sheet sau xác nhận rõ ràng.
---

# Log bug lên Jira

Chuẩn hóa mọi bug về một quy trình chung, bất kể bug đến từ test case, exploratory testing, edge case hay mô tả trực tiếp trong chat. Không dùng sự tồn tại của test-case ID hoặc trạng thái Sheet làm điều kiện bắt buộc.

## Input tối thiểu (tester)

Dùng checklist này khi paste bug trong chat hoặc điền Sheet trước khi gọi skill.

| Mức | Trường | Ghi chú |
| --- | --- | --- |
| Bắt buộc | Module/Feature, Steps, Expected, Actual, Environment, Priority | Environment phải có stage: `Testing`, `Staging` hoặc `Production` (vd. `Staging - Chrome`) |
| Khuyến khích | BUG SUMMARY, TEST TYPE, Evidence URL | `TEST TYPE: Exploratory` cho bug không có test case |
| Không bắt buộc | TEST CASE ID | Trống → label `no-testcase` |

Ví dụ paste nhanh trong chat:

```text
Module: Price Monitoring - Export
Steps: 1. Mở Price Monitoring → 2. Export XLSX → 3. Mở file
Expected: File không có cột Total Sold
Actual: File vẫn hiển thị cột Total Sold và dữ liệu Sold
Environment: Staging - Chrome
Priority: High
Test type: Exploratory
```

Nếu skill không suy ra được System label, tester có thể thêm `SYSTEM LABELS: sys-frontend` (hoặc label `sys-*` phù hợp) vào nguồn.

## Quy trình bắt buộc

1. Đọc nguồn ở chế độ chỉ đọc.
   - Với Google Sheets, đọc metadata, ánh xạ đúng `gid` sang tab hiển thị rồi chỉ đọc vùng cần thiết.
   - Với file, hỗ trợ CSV, TSV, JSON và XLSX.
   - Với chat, trích xuất một bug candidate từ nội dung người dùng.
   - Đọc [references/input-format.md](references/input-format.md) để map dữ liệu về schema chuẩn.
2. Xác định candidate bằng một tín hiệu tạo bug rõ ràng.
   - Ưu tiên danh sách row, test-case ID hoặc bug ID nguồn mà người dùng chỉ định.
   - Nếu Sheet có `READY TO JIRA`, chỉ lấy giá trị `Yes`, `Ready`, `True` hoặc `1`.
   - Chỉ lọc theo `STATUS=BUG/failed/error` khi người dùng yêu cầu dùng status.
   - Nếu không có tín hiệu chọn dòng, dùng `--selection-mode candidates` để preview rồi yêu cầu người dùng chọn chính xác; mode này bị chặn tạo Jira.
   - `Jira Key` hoặc `BUG ID` trống chỉ là điều kiện chống trùng, không phải tín hiệu chọn candidate.
   - Với bug nhập từ chat, candidate là bug đang được mô tả; test-case ID được phép trống.
3. Xác định Jira project key. Mặc định issue type là `Bug`; không đoán project key. Preview có thể dùng placeholder `PREVIEW`, nhưng placeholder này tuyệt đối không hợp lệ khi tạo thật.
4. Đọc [references/quality-rules.md](references/quality-rules.md), [references/bug-label-rules.md](references/bug-label-rules.md) và [references/bug-template.md](references/bug-template.md). Gán `READY`, `NEEDS_CLARIFICATION`, `INVALID` hoặc `SKIP_EXISTING` cho từng candidate.
5. Tạo preview bằng `scripts/jira_bug_generator.py`; tuyệt đối không dùng `--create` ở bước này.
6. Nếu chuẩn bị tạo thật, tìm issue có khả năng trùng trong Jira theo project, summary, module và test-case ID nếu có. Chỉ đề xuất trùng; không tự gộp.
7. Đọc lại nguồn và tạo preview cuối nếu nguồn là Sheet hoặc file có thể đã thay đổi.
8. Yêu cầu xác nhận chứa project và số lượng draft `READY`, ví dụ: `Tôi xác nhận tạo 3 bug vào project QA`.
9. Tạo tuần tự tối đa 10 issue `READY` mỗi batch. Draft `NEEDS_CLARIFICATION` được bỏ qua và báo riêng; không tự retry batch thành công một phần.
10. Nếu nguồn là Sheet, chỉ ghi Jira key sau một xác nhận riêng và sau khi đọc lại ô đích.

## Chọn candidate bằng script

Bug nhập từ chat hoặc các dòng đã được người dùng chọn rõ:

```bash
python3 scripts/jira_bug_generator.py \
  --input - \
  --selection-mode all \
  --source-kind chat \
  --project QA
```

Sheet có cột `READY TO JIRA`:

```bash
python3 scripts/jira_bug_generator.py \
  --input /duong-dan/testcases.xlsx \
  --selection-mode ready \
  --project QA \
  --source-url "https://docs.google.com/spreadsheets/d/.../edit?gid=..."
```

Luồng cũ dùng trạng thái:

```bash
python3 scripts/jira_bug_generator.py \
  --input /duong-dan/testcases.xlsx \
  --selection-mode status \
  --include-status bug,failed,error \
  --project QA
```

Chỉ dùng `--selection-mode all` cho một bug chat hoặc tập dòng đã được chọn trước. Không dùng nó để quét toàn bộ Sheet chưa được review.

Nếu chưa có tín hiệu chọn dòng, dùng `--selection-mode candidates`. Script cho phép preview nhưng từ chối `--create` với mode này.

Mặc định script dùng `--selection-mode ready`. Luồng cũ theo `STATUS` phải truyền `--selection-mode status` rõ ràng.

### Tùy chọn CLI thường dùng

- `--input -`: đọc mảng JSON từ stdin (chat).
- `--field-map mapping.json`: map header sheet không chuẩn.
- `--extra-fields jira-fields.json`: thêm custom field project.
- `--labels qa,release-x`: thêm label Jira.
- `--found-in-environment-field customfield_12345`: bắt buộc khi `--create`.
- `--allow-quality-warnings`: chỉ dùng khi user xác nhận rõ sau khi đã thấy cảnh báo chặn; cho phép tạo cả draft `NEEDS_CLARIFICATION`.

## Quy tắc cốt lõi

- Test-case ID là optional. Gắn label `linked-testcase` khi có ID và `no-testcase` khi không có.
- `STATUS` là optional và không được dùng làm điều kiện duy nhất nếu người dùng không yêu cầu.
- Luôn bỏ qua candidate đã có `Jira Key` hoặc `BUG ID`.
- Summary mô tả hành vi lỗi quan sát được; không dùng nguyên câu “Kiểm tra...” hoặc các tag priority/test type.
- Yêu cầu summary/title, steps tái hiện, expected, actual, environment và priority có ý nghĩa. Không bịa dữ liệu còn thiếu.
- Evidence là optional nhưng phải cảnh báo khi thiếu.
- Tự gắn tối thiểu một `sys-*` label từ hành vi quan sát được; gắn đúng một `test-*` label khi xác định được hoạt động test; chỉ gắn `flow-*` khi có bằng chứng rõ.
- Không suy đoán Root Cause từ triệu chứng. Chỉ gắn đúng một `rc-*` khi nguồn hoặc người có trách nhiệm đã xác nhận; nếu chưa có thì cảnh báo và bắt buộc cập nhật trước khi đóng bug.
- Map môi trường sang custom field `Found In Environment` với một trong `Testing`, `Staging`, `Production`; không tạo lại label `found-in-*` đã bị bỏ.
- Giữ source type, source row, URL, module, test data, tester và test-case ID trong phần truy vết.
- Không map `ASSIGNED TO` thành Jira assignee nếu chưa có Jira account ID.
- Không tự upload attachment hoặc đưa secret, token, cookie, session ID hay dữ liệu khách hàng không cần thiết vào Jira.
- “Log thử”, “preview”, “xem thử”, “draft” và “đừng đẩy Jira” không bao giờ là quyền tạo issue.
- Có credentials hoặc connector Jira không đồng nghĩa với được phép tạo issue.

## Tạo thật và ghi ngược Sheet

- Với REST script, bắt buộc dùng đồng thời `--create --yes` sau xác nhận hợp lệ.
- Nếu dùng Jira connector, kiểm tra schema trước. Không tuyên bố đã gắn label/custom field khi tool không hỗ trợ; dùng REST script hoặc báo rõ giới hạn.
- Chỉ tạo draft `READY`; `NEEDS_CLARIFICATION` bị bỏ qua mặc định và báo trong preview kết quả tạo.
- Ghi Jira key về Sheet là một quyền riêng với quyền tạo issue.
- Không ghi đè ô Jira key đã có dữ liệu và không tự cập nhật `BUG STATUS`.

## Kết quả đầu ra

Preview phải nêu project, issue type, selection mode, tổng `READY`, `NEEDS_CLARIFICATION`, `INVALID`, `SKIP_EXISTING`, source row nếu có, test-case ID nếu có, summary, priority, `Found In Environment`, label theo từng nhóm và cảnh báo. Khi tạo thật, báo URL/key của từng issue thành công, lỗi riêng của từng issue thất bại và danh sách draft bị bỏ qua (`creation_skipped`).
