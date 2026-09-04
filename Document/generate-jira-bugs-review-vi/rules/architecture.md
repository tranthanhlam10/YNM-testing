# Kiến trúc engine

Đọc file này khi thay đổi schema, policy hoặc script. Luồng runtime:

```text
Source → Canonical record → Row override → Policy/quality
       → Summary proposal → Actual/Expected check → Targets/Evidence
       → Candidate ID/Duplicate fingerprint → Duplicate search
       → READY_FOR_REVIEW → CREATE_READY → Manifest → Jira create/link
       → Writeback plan → Google Sheets connector
```

## Nguồn chuẩn

- `config/bug-candidate.schema.json`: canonical fields, header aliases và field được phép override.
- `config/policies.json`: default, selection, environment, priority, prefix, Summary policy, label allowlist, inference marker và batch limit.
- `rules/*.md`: giải thích nghiệp vụ cho người và agent; không phải dữ liệu runtime.

Không khai báo lại schema, allowlist hay default trong Python. Khi đổi config, cập nhật fixture/test tương ứng.

## Module

- `config.py`: nạp và kiểm tra nguồn cấu hình.
- `common.py`: chuẩn hóa chuỗi, issue key và lỗi dùng chung.
- `sources.py`: đọc file, map header, canonicalize và row override.
- `content.py`: parse prefix, resolve Priority và dựng Jira description.
- `summary.py`: đề xuất Summary xác định, ghi nguồn/phép biến đổi và giới hạn độ dài theo policy.
- `comparison.py`: kiểm tra Actual–Expected xác định; exact conflict bị chặn, độ tương đồng cao được đề nghị review.
- `policy.py`: quality gate, environment và label classification.
- `workflow.py`: selection, chống trùng trong batch, preview và payload.
- `jira_client.py`: REST auth, đọc task, tạo bug và link `Relates`.
- `identity.py`: tạo candidate ID, duplicate fingerprint và payload hash ổn định.
- `duplicates.py`: JQL, chấm điểm và gate duplicate review.
- `manifest.py`: lưu trạng thái create/link/writeback để resume an toàn.
- `sheet_adapter.py`: source locator, row fingerprint và writeback plan; không gọi MCP trực tiếp.
- `targets.py`: chuẩn hóa Environment, Branch, Domain và Target URL.
- `evidence.py`: chuẩn hóa nhiều Evidence URL và chặn link chứa token/session.
- `presentation.py`: rút gọn preview cho model; không thay đổi Jira payload nguồn.
- `cli.py`: tham số CLI, giới hạn batch và quyền tạo thật.
- `jira_bug_generator.py`: entrypoint tương thích; không đặt business logic ở đây.

## Tương thích và test

Giữ entrypoint `python3 scripts/jira_bug_generator.py`. Chạy test không cần dependency ngoài:

```bash
python3 -m unittest discover -s tests -v
```

Test tối thiểu phải bao phủ default, allowlist, prefix, priority, Summary, Actual–Expected check, duplicate fingerprint, quality warnings, row override, hai tầng trạng thái, duplicate gate, manifest resume, Sheet writeback conflict, targets/evidence và input thiếu field cốt lõi.
