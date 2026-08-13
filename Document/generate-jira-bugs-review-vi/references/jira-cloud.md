# Cấu hình và tạo issue Jira Cloud

## Chọn bề mặt tạo issue

Ưu tiên bundled REST script khi cần labels, custom fields hoặc payload Jira Cloud đầy đủ. Có thể dùng Jira connector nếu schema của tool hỗ trợ toàn bộ field cần thiết.

Nếu connector không có `labels` hoặc custom fields:

- Không tuyên bố các field đó đã được tạo.
- Dùng REST script nếu credentials hợp lệ.
- Nếu không thể dùng REST, báo rõ giới hạn và xin người dùng quyết định trước khi tạo.

Nếu connector không tạo được issue link `Relates`, không dùng connector đó để tạo bug. Chuyển sang REST script hoặc dừng trước khi tạo để tránh issue không relate task.

## Credentials cho REST script

Chỉ đọc từ environment:

```bash
export JIRA_BASE_URL="https://your-company.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
read -s JIRA_API_TOKEN
export JIRA_API_TOKEN
export JIRA_FOUND_IN_ENVIRONMENT_FIELD="customfield_12345"
```

Không dán token vào chat, file input, log hoặc repository. Kiểm tra auth không tạo issue:

```bash
python3 scripts/jira_bug_generator.py --check-auth
```

## Preview

Bug chat hoặc dòng đã chọn trước:

```bash
python3 scripts/jira_bug_generator.py \
  --input - \
  --selection-mode all \
  --source-kind chat \
  --related-task YNMPECA-9361
```

Sheet dùng ready flag:

```bash
python3 scripts/jira_bug_generator.py \
  --input testcases.xlsx \
  --selection-mode ready \
  --source-kind sheet \
  --related-task YNMPECA-9361 \
  --source-url "https://docs.google.com/spreadsheets/d/.../edit?gid=..."
```

## Xác minh task và chống trùng trước khi tạo

- Bắt buộc có đúng một task key/URL cho batch; không có task thì không preview hoặc tạo bug.
- Suy project từ issue key, sau đó đọc task qua `GET /rest/api/3/issue/{key}` để xác minh task tồn tại/đọc được và project thực tế khớp.
- Tìm Jira trong đúng project theo exact/near-exact summary.
- So sánh module, actual, steps và test-case ID nếu có.
- Issue có khả năng trùng phải được đưa vào preview; không tự gộp hoặc tự bỏ qua nếu chưa chắc chắn.
- Đọc lại Jira key trong nguồn ngay trước lúc tạo.

## Tạo thật

Chỉ sau xác nhận có số lượng, project và related task:

```bash
python3 scripts/jira_bug_generator.py \
  --input selected-bugs.json \
  --selection-mode all \
  --related-task YNMPECA-9361 \
  --found-in-environment-field customfield_12345 \
  --create --yes
```

- Script xác minh task trước khi tạo issue đầu tiên.
- Mỗi bug được tạo qua `POST /rest/api/3/issue`, sau đó được link với task qua `POST /rest/api/3/issueLink` và link type `Relates`.
- `Relates` là issue link cố định theo quy trình hiện tại, không phải parent/sub-task; không tự đổi sang link type khác.
- Tối đa 10 issue `READY` mỗi batch; draft `NEEDS_CLARIFICATION` bị bỏ qua mặc định.
- Project tự lấy từ related task; `--project` chỉ là đối chiếu tùy chọn và nếu có phải khớp.
- Chỉ tạo draft `READY`; không tự dùng `--allow-quality-warnings`.
- Tạo tuần tự và giữ kết quả từng issue.
- Không retry toàn batch sau thành công một phần.

## Labels và custom fields

- Script không tự thêm `generated-by-qc`, `linked-testcase` hoặc `no-testcase`.
- Script tự phân loại `sys-*`, `test-*`, `flow-*` và chỉ nhận `rc-*` đã được xác nhận theo [bug-label-rules.md](bug-label-rules.md). Mọi label phải thuộc allowlist của tài liệu này.
- `--labels found-in-qc,sys-db`: thêm label cấu hình thuộc allowlist; label ngoài allowlist bị loại và tạo cảnh báo chặn. Nếu không cung cấp label nào, script dùng `found-in-qc`.
- `--found-in-environment-field customfield_12345`: ghi `Testing`, `Staging` hoặc `Production` vào custom field tương ứng; thiếu môi trường nguồn dùng `Testing`. Bắt buộc khi dùng REST script để tạo thật.
- Priority nguồn trống được gửi lên Jira với giá trị mặc định `Major`.
- `--extra-fields jira-fields.json`: thêm custom fields nhưng không được ghi đè `project`, `summary`, `issuetype`, `description` hoặc `labels`.

## Ghi ngược Sheet

Việc tạo Jira không tự cấp quyền ghi Sheet. Sau xác nhận riêng:

1. Đọc lại ô Jira key của từng dòng.
2. Bỏ qua ô đã có giá trị.
3. Chỉ ghi key/URL của issue tạo thành công.
4. Không tự cập nhật status hoặc bug status.

## Xử lý lỗi

- HTTP 400: báo field/payload bị từ chối; không đoán.
- HTTP 401/403: dừng và báo lỗi xác thực/quyền.
- HTTP 404: kiểm tra base URL, project và endpoint.
- HTTP 429: dừng batch; chỉ retry sau khi người dùng đồng ý.
- Bug tạo thành công nhưng link task thất bại: báo rõ bug key và `link_failed`; không retry tạo bug, chỉ xử lý lại liên kết sau khi đối chiếu Jira.
- Thành công một phần: chỉ xem xét retry issue chưa được tạo sau khi đối chiếu Jira.
