# Cấu hình và tạo issue Jira Cloud

## Chọn bề mặt tạo issue

Ưu tiên bundled REST script khi cần labels, custom fields hoặc payload Jira Cloud đầy đủ. Có thể dùng Jira connector nếu schema của tool hỗ trợ toàn bộ field cần thiết.

Nếu connector không có `labels` hoặc custom fields:

- Không tuyên bố các field đó đã được tạo.
- Dùng REST script nếu credentials hợp lệ.
- Nếu không thể dùng REST, báo rõ giới hạn và xin người dùng quyết định trước khi tạo.

## Credentials cho REST script

Chỉ đọc từ environment:

```bash
export JIRA_BASE_URL="https://your-company.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
read -s JIRA_API_TOKEN
export JIRA_API_TOKEN
export JIRA_PROJECT_KEY="QA"
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
  --project QA
```

Sheet dùng ready flag:

```bash
python3 scripts/jira_bug_generator.py \
  --input testcases.xlsx \
  --selection-mode ready \
  --source-kind sheet \
  --project QA \
  --source-url "https://docs.google.com/spreadsheets/d/.../edit?gid=..."
```

## Chống trùng trước khi tạo

- Tìm Jira trong đúng project theo exact/near-exact summary.
- So sánh module, actual, steps và test-case ID nếu có.
- Issue có khả năng trùng phải được đưa vào preview; không tự gộp hoặc tự bỏ qua nếu chưa chắc chắn.
- Đọc lại Jira key trong nguồn ngay trước lúc tạo.

## Tạo thật

Chỉ sau xác nhận có project và số lượng:

```bash
python3 scripts/jira_bug_generator.py \
  --input selected-bugs.json \
  --selection-mode all \
  --project QA \
  --found-in-environment-field customfield_12345 \
  --create --yes
```

- Tối đa 10 issue `READY` mỗi batch; draft `NEEDS_CLARIFICATION` bị bỏ qua mặc định.
- `PREVIEW` và `TBD` chỉ là placeholder xem trước; script từ chối tạo issue với các project này.
- Chỉ tạo draft `READY`; không tự dùng `--allow-quality-warnings`.
- Tạo tuần tự và giữ kết quả từng issue.
- Không retry toàn batch sau thành công một phần.

## Labels và custom fields

- Script tự thêm `linked-testcase` hoặc `no-testcase`.
- Script tự phân loại `sys-*`, `test-*`, `flow-*` và chỉ nhận `rc-*` đã được xác nhận theo [bug-label-rules.md](bug-label-rules.md).
- `--labels qa,release-x`: thêm labels cấu hình; không cần lặp label theo testcase.
- `--found-in-environment-field customfield_12345`: ghi `Testing`, `Staging` hoặc `Production` vào custom field tương ứng. Bắt buộc khi dùng REST script để tạo thật.
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
- Thành công một phần: chỉ xem xét retry issue thất bại sau khi đối chiếu Jira.
