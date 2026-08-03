# Cấu hình và tạo issue Jira Cloud

## Credentials

Dùng Atlassian API token riêng với quyền tối thiểu cần thiết. Không lưu token trong skill hoặc file test case. Thiết lập trong shell chạy script:

```bash
export JIRA_BASE_URL="https://your-company.atlassian.net"
export JIRA_EMAIL="your-email@example.com"
read -s JIRA_API_TOKEN
export JIRA_API_TOKEN
export JIRA_PROJECT_KEY="QA"
```

Token được nhập ẩn. Không dán token vào chat. Với integration phân phối rộng, ưu tiên OAuth 2.0; email và API token chỉ phù hợp cho automation cá nhân nhỏ.

Kiểm tra quyền truy cập mà không tạo issue:

```bash
python3 scripts/jira_bug_generator.py --check-auth
```

## Xem trước rồi mới tạo

Tạo và review preview trước:

```bash
python3 scripts/jira_bug_generator.py \
  --input /duong-dan-tuyet-doi/testcases.xlsx \
  --project QA \
  --source-url "https://docs.google.com/spreadsheets/d/.../edit?gid=..." \
  --output /duong-dan-tuyet-doi/jira-bug-preview.json
```

Chỉ sau khi người dùng duyệt đúng project, số lượng và các cảnh báo, mới chạy:

```bash
python3 scripts/jira_bug_generator.py \
  --input /duong-dan-tuyet-doi/testcases.xlsx \
  --project QA \
  --create --yes \
  --output /duong-dan-tuyet-doi/jira-bug-results.json
```

Script gọi Jira Cloud REST API v3 `POST /rest/api/3/issue`. Trường description dùng Atlassian Document Format.

Dòng đã có `BUG ID` bị loại trước khi tạo. Sau khi tạo thành công, chỉ ghi issue key trở lại Google Sheet khi người dùng xác nhận riêng và đã đọc lại ô `BUG ID` mục tiêu.

## Custom field theo project

Jira có thể từ chối ticket khi màn hình Create yêu cầu custom field. Lấy field ID và allowed value chính xác từ Jira admin hoặc create-field metadata. Chỉ đặt các field bổ sung vào JSON cục bộ:

```json
{
  "customfield_10042": {"value": "Web"},
  "fixVersions": [{"name": "Next release"}]
}
```

Truyền file bằng `--extra-fields`. Không cho phép file này ghi đè `project`, `summary`, `issuetype` hoặc `description`.

## Xử lý lỗi

- HTTP 400: giữ nguyên error response, kiểm tra field bắt buộc hoặc allowed value; không đoán.
- HTTP 401: dừng và kiểm tra email/token; không in token.
- HTTP 403: dừng và báo thiếu quyền Browse Projects hoặc Create Issues.
- HTTP 404: kiểm tra base URL, project hoặc endpoint; không tự đổi project.
- HTTP 429: dừng batch, báo rate limit và chỉ retry sau khi người dùng đồng ý.
- Thành công một phần: không chạy lại toàn batch; chỉ lập danh sách issue thất bại sau khi đối chiếu key đã tạo.

## Tài liệu chính thức

- Create issue và create-field metadata: https://developer.atlassian.com/cloud/jira/platform/rest/v3/api-group-issues/
- Jira Cloud REST API v3: https://developer.atlassian.com/cloud/jira/platform/rest/v3/intro/
- Xác thực bằng API token: https://developer.atlassian.com/cloud/jira/service-desk/basic-auth-for-rest-apis/
- Atlassian Document Format: https://developer.atlassian.com/cloud/jira/platform/apis/document/structure/
