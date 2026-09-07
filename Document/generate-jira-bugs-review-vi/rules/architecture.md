# Kiến trúc engine

Đọc file này khi thay đổi schema, policy hoặc script. Luồng runtime:

```text
Source → Chat parser/File reader → Canonical record → Row override → Policy/quality
       → Summary proposal → Actual/Expected check → Targets/Evidence/Diagnostics
       → Candidate ID/Duplicate fingerprint → Duplicate search
       → READY_FOR_REVIEW → CREATE_READY → Manifest → Jira create/link
       → Writeback plan → Google Sheets connector
```

## Nguồn chuẩn

- `config/bug-candidate.schema.json`: canonical fields, header aliases và field được phép override.
- `config/policies.json`: Jira deployment/API/description format, diagnostic limits/sensitive keys, default, selection, environment, priority, prefix, Summary policy, label allowlist, inference marker và batch limit.
- `rules/*.md`: giải thích nghiệp vụ cho người và agent; không phải dữ liệu runtime.

Không khai báo lại schema, allowlist hay default trong Python. Khi đổi config, cập nhật fixture/test tương ứng.

## Module

- `config.py`: nạp và kiểm tra nguồn cấu hình.
- `common.py`: chuẩn hóa chuỗi, issue key và lỗi dùng chung.
- `sources.py`: đọc file/stdin, map header, canonicalize và row override.
- `chat_parser.py`: parse chat thô bằng rule xác định, ghi extraction metadata và không gọi model.
- `content.py`: parse prefix, resolve Priority và dựng các section Jira description.
- `description_renderer.py`: render Description thành Jira Server wiki markup hoặc Jira Cloud ADF.
- `summary.py`: đề xuất Summary xác định, ghi nguồn/phép biến đổi và giới hạn độ dài theo policy.
- `comparison.py`: kiểm tra Actual–Expected xác định; exact conflict bị chặn, độ tương đồng cao được đề nghị review.
- `policy.py`: quality gate, environment, label classification và provenance cho từng label.
- `workflow.py`: selection, chống trùng trong batch, preview và payload.
- `jira_adapter.py`: resolve endpoint REST theo Jira deployment/API version.
- `jira_client.py`: REST auth, đọc task, duplicate search, tạo bug và link `Relates` qua adapter.
- `identity.py`: tạo candidate ID, duplicate fingerprint và payload hash ổn định.
- `duplicates.py`: JQL, chấm điểm và gate duplicate review.
- `manifest.py`: lưu trạng thái create/link/writeback để resume an toàn.
- `sheet_adapter.py`: source locator, row fingerprint và writeback plan; không gọi MCP trực tiếp.
- `targets.py`: chuẩn hóa Environment, Branch, Domain và Target URL.
- `evidence.py`: chuẩn hóa nhiều Evidence URL và chặn link chứa token/session.
- `diagnostics.py`: chuẩn hóa code/log/query, che secret, giới hạn kích thước và dựng excerpt cho compact preview.
- `presentation.py`: rút gọn preview cho model; không thay đổi Jira payload nguồn.
- `cli.py`: tham số CLI, giới hạn batch và quyền tạo thật.
- `jira_bug_generator.py`: entrypoint tương thích; không đặt business logic ở đây.

## Tương thích và test

Giữ entrypoint `python3 scripts/jira_bug_generator.py`. Chạy test không cần dependency ngoài:

```bash
python3 -m unittest discover -s tests -v
```

Test tối thiểu phải bao phủ default, Jira Server API v2/wiki markup, adapter Cloud dự phòng, raw chat/JSON stdin, chat thiếu field, diagnostic parsing/redaction/rendering/limits, allowlist, label provenance, prefix, priority, Summary, Actual–Expected check, duplicate fingerprint, quality warnings, row override, hai tầng trạng thái, duplicate gate, manifest resume, Sheet writeback conflict, targets/evidence và input thiếu field cốt lõi.

Phase 6 dùng fixture hồi quy thay vì nhét few-shot example vào prompt runtime. Xem [test-strategy.md](test-strategy.md). Các test Environment prefix/conflict thuộc Phase 2 được tạm bỏ qua cho tới khi Phase 2 được phê duyệt.
