---
name: generate-jira-bugs
description: Tạo bản nháp hoặc issue Jira Cloud từ Google Sheets, CSV, JSON, XLSX hay bug nhập trực tiếp trong chat. Cả luồng test case và chat đều bắt buộc có task Jira liên quan; project của bug lấy từ task và bug tạo thật phải được link Relates với task. Hỗ trợ default Testing, Major, found-in-qc, giữ nguyên nội dung tester nhập, chỉ dùng label trong allowlist YouNet; luôn preview và chỉ tạo hoặc ghi ngược Sheet sau xác nhận rõ ràng.
---

# Log bug lên Jira

Chuẩn hóa mọi bug về một quy trình chung, bất kể bug đến từ test case, exploratory testing, edge case hay mô tả trực tiếp trong chat. Không dùng sự tồn tại của test-case ID hoặc trạng thái Sheet làm điều kiện bắt buộc.

## Task Jira liên quan là bắt buộc

- Mỗi yêu cầu hoặc batch phải có đúng một Jira task key hoặc URL, ví dụ `YNMPECA-9361` hay `https://jira.younetco.com/browse/YNMPECA-9361`.
- Không có task: dừng, yêu cầu tester bổ sung task; không dựng preview và không tạo bug.
- Không tái dùng task từ yêu cầu/batch trước nếu tester không gửi lại hoặc xác nhận rõ trong yêu cầu hiện tại.
- Project của bug được lấy từ project của task. Ví dụ `YNMPECA-9361` thuộc project `YNMPECA`; không đoán, không dùng project khác và không dùng placeholder.
- Nếu tester nhập thêm project nhưng không khớp task, dừng và báo xung đột.
- Khi tạo thật, đọc task để xác minh task tồn tại và project khớp trước issue đầu tiên, sau đó tạo issue link loại `Relates` giữa từng bug và task.
- URL trên chỉ là ví dụ cho yêu cầu hiện tại, không được hardcode thành task mặc định của skill.

## Hai luồng input

### 1. Bug từ test case/Sheet

| Mức | Trường | Ghi chú |
| --- | --- | --- |
| Bắt buộc | Module/Feature, Steps, Expected, Actual | Không tự bịa hành vi bug còn thiếu |
| Khuyến khích | BUG SUMMARY, TEST TYPE, Evidence URL | `TEST TYPE: Exploratory` cho bug không có test case |
| Không bắt buộc | Environment, Priority, Jira Labels, TEST CASE ID | Trống lần lượt dùng `Testing`, `Major`, `found-in-qc`; test-case ID không sinh thêm label |

Khi tester gửi link test case và yêu cầu log bug, xem đây là yêu cầu rõ để lấy các dòng đã được tester đánh `STATUS=BUG/failed/error`, trừ khi tester chỉ định row/ID hoặc Sheet có cột `READY TO JIRA`.

### 2. Bug nhập trực tiếp trong chat

Ngoài task Jira bắt buộc ở cấp yêu cầu, mỗi bug chỉ cần đúng bốn giá trị:

```text
Testname: <Jira Summary>
Step: <các bước tái hiện>
Actual Result: <kết quả thực tế>
Expected Result: <kết quả mong đợi>
```

- Giữ nguyên `Testname` làm Jira Summary; chỉ trim khoảng trắng và giới hạn độ dài Jira, không viết lại theo Actual hoặc thêm Module.
- Description tối thiểu gồm các đầu mục tiếng Anh `Steps to reproduce`, `Actual result`, `Expected result`; nội dung bên dưới giữ đúng nội dung tester nhập.
- Nếu tester nhập thêm Preconditions, Test Data, Environment, Evidence hoặc Remarks thì giữ lại; không bắt buộc các trường này.
- Mặc định `Found In Environment=Testing`, `Priority=Major`, label `found-in-qc`.
- Không yêu cầu Test Case ID, Module, Test Type, Evidence, Root Cause, System hoặc Flow để draft chat đạt `READY`.
- Không chặn chỉ vì câu chữ ngắn hoặc chưa theo văn phong chuẩn; cảnh báo nhẹ và giữ nguyên nội dung. Chỉ yêu cầu làm rõ khi thiếu một trong bốn trường cốt lõi, giá trị Jira đã nhập không hợp lệ hoặc Actual thể hiện rõ hệ thống đang hoạt động đúng.

Ví dụ:

```text
Testname: File XLSX vẫn chứa cột Total Sold
Step: 1. Mở Price Monitoring → 2. Export XLSX → 3. Mở file
Actual Result: File vẫn hiển thị cột Total Sold và dữ liệu Sold
Expected Result: File không có cột Total Sold
```

Nếu skill không suy ra được System label, tester có thể thêm `SYSTEM LABELS: sys-frontend` (hoặc label `sys-*` có trong [references/bug-label-rules.md](references/bug-label-rules.md)) vào nguồn. Không chấp nhận label ngoài danh sách này.

## Quy trình bắt buộc

1. Đọc nguồn ở chế độ chỉ đọc.
   - Với Google Sheets, đọc metadata, ánh xạ đúng `gid` sang tab hiển thị rồi chỉ đọc vùng cần thiết.
   - Với file, hỗ trợ CSV, TSV, JSON và XLSX.
   - Với chat, trích xuất một bug candidate từ nội dung người dùng.
   - Đọc [references/input-format.md](references/input-format.md) để map dữ liệu về schema chuẩn.
2. Xác định candidate bằng một tín hiệu tạo bug rõ ràng.
   - Ưu tiên danh sách row, test-case ID hoặc bug ID nguồn mà người dùng chỉ định.
   - Nếu Sheet có `READY TO JIRA`, chỉ lấy giá trị `Yes`, `Ready`, `True` hoặc `1`.
   - Với link test case/Sheet kèm yêu cầu log bug, lọc `STATUS=BUG/failed/error` vì tester đã đánh kết quả bug; không chọn `PASSED` hoặc `IGNORE`.
   - Nếu không có tín hiệu chọn dòng, dùng `--selection-mode candidates` để preview rồi yêu cầu người dùng chọn chính xác; mode này bị chặn tạo Jira.
   - `Jira Key` hoặc `BUG ID` trống chỉ là điều kiện chống trùng, không phải tín hiệu chọn candidate.
   - Với bug nhập từ chat, candidate là bug đang được mô tả; dùng `--selection-mode all --source-kind chat` và không yêu cầu test-case ID.
3. Đọc Jira task bắt buộc, lấy issue key rồi suy ra project từ prefix của key. Nếu người dùng nhập project riêng, chỉ chấp nhận khi khớp project của task. Mặc định issue type là `Bug`.
4. Đọc [references/quality-rules.md](references/quality-rules.md), [references/bug-label-rules.md](references/bug-label-rules.md) và [references/bug-template.md](references/bug-template.md). Gán `READY`, `NEEDS_CLARIFICATION`, `INVALID` hoặc `SKIP_EXISTING` cho từng candidate.
5. Tạo preview bằng `scripts/jira_bug_generator.py`; tuyệt đối không dùng `--create` ở bước này.
6. Nếu chuẩn bị tạo thật, tìm issue có khả năng trùng trong Jira theo project, summary, module và test-case ID nếu có. Chỉ đề xuất trùng; không tự gộp.
7. Đọc lại nguồn và tạo preview cuối nếu nguồn là Sheet hoặc file có thể đã thay đổi.
8. Yêu cầu xác nhận chứa số lượng, project và related task, ví dụ: `Tôi xác nhận tạo 3 bug trong project YNMPECA và relate vào YNMPECA-9361`.
9. Trước khi tạo, xác minh task tồn tại/đọc được và project thực tế khớp. Tạo tuần tự tối đa 10 issue `READY` mỗi batch rồi link từng bug với task bằng issue link `Relates`. Draft `NEEDS_CLARIFICATION` được bỏ qua và báo riêng; không tự retry batch thành công một phần.
10. Nếu nguồn là Sheet, chỉ ghi Jira key sau một xác nhận riêng và sau khi đọc lại ô đích.

## Chọn candidate bằng script

Bug nhập từ chat hoặc các dòng đã được người dùng chọn rõ:

```bash
python3 scripts/jira_bug_generator.py \
  --input - \
  --selection-mode all \
  --source-kind chat \
  --related-task YNMPECA-9361
```

Sheet có cột `READY TO JIRA`:

```bash
python3 scripts/jira_bug_generator.py \
  --input /duong-dan/testcases.xlsx \
  --selection-mode ready \
  --related-task YNMPECA-9361 \
  --source-url "https://docs.google.com/spreadsheets/d/.../edit?gid=..."
```

Luồng cũ dùng trạng thái:

```bash
python3 scripts/jira_bug_generator.py \
  --input /duong-dan/testcases.xlsx \
  --selection-mode status \
  --include-status bug,failed,error \
  --related-task YNMPECA-9361
```

Chỉ dùng `--selection-mode all` cho một bug chat hoặc tập dòng đã được chọn trước. Không dùng nó để quét toàn bộ Sheet chưa được review.

Nếu chưa có tín hiệu chọn dòng, dùng `--selection-mode candidates`. Script cho phép preview nhưng từ chối `--create` với mode này.

Mặc định script dùng `--selection-mode ready`. Luồng cũ theo `STATUS` phải truyền `--selection-mode status` rõ ràng.

### Tùy chọn CLI thường dùng

- `--input -`: đọc mảng JSON từ stdin (chat).
- `--related-task YNMPECA-9361`: bắt buộc; nhận issue key hoặc URL Jira và là nguồn xác định project.
- `--project YNMPECA`: tùy chọn để đối chiếu; nếu truyền phải khớp task, không dùng để thay thế task.
- `--field-map mapping.json`: map header sheet không chuẩn.
- `--extra-fields jira-fields.json`: thêm custom field project.
- `--labels found-in-qc,sys-db`: thêm label Jira thuộc allowlist của team. Không truyền label ngoài [references/bug-label-rules.md](references/bug-label-rules.md).
- `--found-in-environment-field customfield_12345`: bắt buộc khi `--create`.
- `--allow-quality-warnings`: chỉ dùng khi user xác nhận rõ sau khi đã thấy cảnh báo chặn; cho phép tạo cả draft `NEEDS_CLARIFICATION`.

## Quy tắc cốt lõi

- Test-case ID là optional và chỉ được giữ trong phần truy vết; không tự sinh label từ việc có hoặc thiếu test-case ID.
- Task Jira liên quan là bắt buộc cho cả Sheet/test case và chat. Thiếu task thì không preview, không tạo và không tái dùng task cũ.
- Project luôn lấy từ related task; project do tester nhập chỉ dùng để kiểm tra khớp.
- `STATUS` là optional và không được dùng làm điều kiện duy nhất nếu người dùng không yêu cầu.
- Luôn bỏ qua candidate đã có `Jira Key` hoặc `BUG ID`.
- Summary mô tả hành vi lỗi quan sát được; không dùng nguyên câu “Kiểm tra...” hoặc các tag priority/test type.
- Riêng nguồn chat, dùng nguyên `Testname` làm Summary và không viết lại câu chữ tester đã nhập.
- Dùng tiếng Anh cho toàn bộ đầu mục và nhãn metadata do bug template sinh ra; không dịch hoặc viết lại nội dung tester đã nhập.
- Yêu cầu summary/title, steps tái hiện, expected và actual có ý nghĩa. Không bịa dữ liệu hành vi còn thiếu.
- Nếu nguồn không cung cấp Environment, dùng `Testing` cho custom field `Found In Environment`.
- Nếu nguồn không cung cấp Priority, dùng Jira priority `Major`.
- Nếu nguồn không cung cấp bất kỳ label rõ ràng nào, dùng label `found-in-qc`.
- Evidence là optional nhưng phải cảnh báo khi thiếu.
- Riêng nguồn chat, Evidence thiếu không tạo cảnh báo; System và Test Type thiếu cũng không chặn.
- Tự gắn tối thiểu một `sys-*` label từ hành vi quan sát được; gắn đúng một `test-*` label khi xác định được hoạt động test; chỉ gắn `flow-*` khi có bằng chứng rõ.
- Không suy đoán Root Cause từ triệu chứng. Chỉ gắn đúng một `rc-*` khi nguồn hoặc người có trách nhiệm đã xác nhận; nếu chưa có thì cảnh báo và bắt buộc cập nhật trước khi đóng bug.
- Map môi trường sang custom field `Found In Environment` với một trong `Testing`, `Staging`, `Production`; thiếu môi trường thì mặc định `Testing`.
- Chỉ dùng label nằm trong allowlist của [references/bug-label-rules.md](references/bug-label-rules.md). Không tự tạo label mới, không cho label tùy ý đi qua payload và không tự thêm `generated-by-qc`, `linked-testcase` hoặc `no-testcase`.
- Giữ source type, source row, URL, module, test data, tester và test-case ID trong phần truy vết.
- Không map `ASSIGNED TO` thành Jira assignee nếu chưa có Jira account ID.
- Không tự upload attachment hoặc đưa secret, token, cookie, session ID hay dữ liệu khách hàng không cần thiết vào Jira.
- “Log thử”, “preview”, “xem thử”, “draft” và “đừng đẩy Jira” không bao giờ là quyền tạo issue.
- Có credentials hoặc connector Jira không đồng nghĩa với được phép tạo issue.

## Tạo thật và ghi ngược Sheet

- Với REST script, bắt buộc dùng đồng thời `--create --yes` sau xác nhận hợp lệ.
- Nếu dùng Jira connector, kiểm tra schema trước. Tool phải tạo được cả bug lẫn issue link `Relates`; nếu không hỗ trợ link hoặc label/custom field, dùng REST script hoặc dừng và báo rõ giới hạn.
- Trước khi tạo issue đầu tiên, đọc related task để xác minh task tồn tại và project khớp.
- Mỗi issue tạo thành công phải được link `Relates` với task. Nếu tạo bug thành công nhưng link thất bại, báo trạng thái một phần, nêu key bug và không retry thao tác tạo bug.
- Chỉ tạo draft `READY`; `NEEDS_CLARIFICATION` bị bỏ qua mặc định và báo trong preview kết quả tạo.
- Ghi Jira key về Sheet là một quyền riêng với quyền tạo issue.
- Không ghi đè ô Jira key đã có dữ liệu và không tự cập nhật `BUG STATUS`.

## Kết quả đầu ra

Preview phải nêu related task, loại link `Relates`, project lấy từ task, issue type, selection mode, tổng `READY`, `NEEDS_CLARIFICATION`, `INVALID`, `SKIP_EXISTING`, source row nếu có, test-case ID nếu có, summary, priority, `Found In Environment`, label theo từng nhóm và cảnh báo. Khi tạo thật, báo URL/key của từng issue, trạng thái tạo và trạng thái link với task, lỗi riêng của từng issue thất bại và danh sách draft bị bỏ qua (`creation_skipped`).
