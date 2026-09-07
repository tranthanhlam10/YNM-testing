# Cấu hình và tạo issue Jira

## Runtime của team

Jira tại `jira.younetco.com` là Jira Server 9.12.2. Runtime mặc định được khai báo trong `config/policies.json`:

```json
"jira": {
  "deployment": "server",
  "api_version": "2",
  "description_format": "wiki"
}
```

Không đổi riêng API version hoặc Description format thành tổ hợp không tương thích. Engine chỉ chấp nhận:

- Jira Server: API v2 + wiki markup.
- Jira Cloud dự phòng: API v3 + ADF.

## Chọn bề mặt tạo issue

Ưu tiên REST script đi kèm skill khi cần labels, custom fields hoặc issue link. Chỉ dùng Jira connector nếu tool hỗ trợ đầy đủ các field và tạo được link `Relates`; nếu không, dừng trước bước tạo thay vì tạo issue thiếu dữ liệu.

## Credentials

Chỉ đọc credentials từ environment:

```bash
export JIRA_BASE_URL="https://jira.younetco.com"
export JIRA_EMAIL="jira-username-or-email"
read -s JIRA_API_TOKEN
export JIRA_API_TOKEN
export JIRA_FOUND_IN_ENVIRONMENT_FIELD="customfield_12345"
```

Tên biến được giữ để tương thích runtime hiện tại. Với Jira Server, `JIRA_EMAIL` là username/email đăng nhập và `JIRA_API_TOKEN` là secret được Jira administrator cấp. Không dán secret vào chat, input, log hoặc repository.

Kiểm tra kết nối, deployment, version và tài khoản mà không tạo issue:

```bash
python3 scripts/jira_bug_generator.py --check-auth
```

## Preview

Preview mặc định trả schema compact và tối đa `max_preview_candidates`. Dùng `--output-format full` khi cần kiểm tra payload/wiki markup; việc xem full payload không cấp quyền tạo issue.

```bash
python3 scripts/jira_bug_generator.py \
  --input - \
  --selection-mode all \
  --source-kind chat \
  --related-task YNMPECA-9361
```

## Xác minh task và chống trùng

- Bắt buộc một task key/URL cho batch; project lấy từ task.
- Đọc task qua `GET /rest/api/2/issue/{key}`.
- Tìm duplicate qua `GET /rest/api/2/search` với JQL trong đúng project.
- Đưa kết quả `possible/strong` vào preview; không tự gộp hoặc bỏ qua.
- Đọc lại Jira key trong nguồn ngay trước lúc tạo.

## Tạo thật

Chỉ sau xác nhận rõ số lượng, project và related task:

```bash
python3 scripts/jira_bug_generator.py \
  --input selected-bugs.json \
  --selection-mode all \
  --related-task YNMPECA-9361 \
  --found-in-environment-field customfield_12345 \
  --manifest .ynm-qc-runs/YNMPECA-9361.json \
  --create --yes
```

- Tạo bug qua `POST /rest/api/2/issue` với Description wiki markup; Diagnostic data được render trong `{code:<language>}` sau khi che secret.
- Link task qua `POST /rest/api/2/issueLink`, type `Relates`.
- Create luôn chạy duplicate search và xác minh task/project trước issue đầu tiên.
- Run manifest là bắt buộc. Nếu tạo thành công nhưng link lỗi, lần chạy sau chỉ retry link.
- Chỉ tạo draft `CREATE_READY`; không tự bỏ qua quality hoặc duplicate gate.
- Giới hạn batch lấy từ `max_create_batch` trong policy.
- Không retry toàn batch sau thành công một phần.

## Labels và custom fields

- Chỉ gửi label thuộc allowlist trong [bug-label-rules.md](bug-label-rules.md).
- Thiếu label dùng `found-in-qc`; không tự suy Root Cause.
- `--found-in-environment-field customfield_12345` ghi `Testing`, `Staging` hoặc `Production`.
- Priority lấy từ field, metadata prefix, rồi mới dùng mặc định `Major`.
- `--extra-fields` không được ghi đè `project`, `summary`, `issuetype`, `description` hoặc `labels`.

## Ghi ngược Sheet

Việc tạo Jira không tự cấp quyền ghi Sheet. Sau xác nhận riêng:

1. Dùng `writeback_plan` sau create/link.
2. Đọc lại dòng và ô Jira key, so với fingerprint/expected value.
3. Có thay đổi thì báo `WRITEBACK_CONFLICT` và không ghi.
4. Chỉ ghi issue đã create và link thành công.
5. Không tự cập nhật test status hoặc bug status.

## Xử lý lỗi

- HTTP 400: báo field/payload bị từ chối; không đoán field thay thế.
- HTTP 401/403: dừng và báo lỗi xác thực/quyền.
- HTTP 404: kiểm tra base URL, project và API v2 endpoint.
- HTTP 429: dừng batch; chỉ retry sau khi người dùng đồng ý.
- Bug tạo thành công nhưng link thất bại: báo bug key và `link_failed`; không tạo bug lần hai.
- Thành công một phần: chỉ xử lý candidate chưa tạo sau khi đối chiếu Jira và manifest.
