# Chiến lược kiểm thử skill

Tài liệu này mô tả Phase 6: kiểm thử hồi quy trước khi đồng bộ skill. Test chỉ chạy local, không gọi Jira thật, không tạo issue và không ghi Google Sheet.

## Phạm vi bắt buộc

| Nhóm | Điều cần bảo vệ |
| --- | --- |
| Jira integration | Jira Server, REST API v2, wiki markup và endpoint create/search/link |
| Chat parser | Chat có heading, chat thiếu Expected, JSON và code block |
| Diagnostic data | Tách khỏi Evidence, che token/Authorization và render `{code}` |
| Label | Allowlist, provenance, marker hỗ trợ và không suy Root Cause |
| Safety | Related task vẫn bắt buộc; project phải lấy từ task |
| Compatibility | JSON stdin, file/Sheet, compact preview và manifest cũ vẫn hoạt động |

Fixture hồi quy của Phase 6 nằm tại `tests/fixtures/phase6-chat-regression.json`. Fixture chỉ phục vụ test/eval, không được nạp vào prompt runtime nên không làm tăng token khi tester gọi skill.

## Phần tạm bỏ qua

Phase 2 chưa được triển khai, vì vậy Phase 6 không test và không kích hoạt:

- Suy Environment từ prefix `[Testing]`, `[Staging]` hoặc `[Production]` trong Summary.
- Cảnh báo conflict giữa Environment field và Environment prefix.

Environment hiện chỉ lấy từ field/heading/câu chat tường minh; nếu không có thì dùng `Testing`.

## Cách chạy

```bash
python3 -m unittest discover -s tests -p 'test_*.py'
```

Chỉ đồng bộ sang Codex và Document khi toàn bộ test pass, `git diff --check` không báo lỗi và skill validator xác nhận cấu trúc hợp lệ.
