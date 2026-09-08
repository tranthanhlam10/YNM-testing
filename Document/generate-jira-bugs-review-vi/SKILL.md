---
name: ynm-qc-jira-bugs
description: Preview hoặc tạo Jira bug từ Google Sheets, file hay chat; bắt buộc relate task cùng project và xác nhận trước external write. Gõ /ynm-qc-jira-bugs.
---

# Log bug Jira

Dùng `scripts/jira_bug_generator.py` cho lần chạy thông thường. Engine tự áp dụng schema, default, Summary, Actual–Expected check, duplicate fingerprint, quality gate và label allowlist; không đọc code, config hoặc rule chi tiết nếu không có lỗi hay yêu cầu bảo trì.

## Gate bắt buộc

- Mỗi yêu cầu cần Jira task key/URL; thiếu task thì không preview hoặc tạo bug.
- Project lấy từ task; bug tạo thật phải link `Relates` với task đó.
- “Preview”, “log thử”, “xem thử” hoặc “đừng đẩy Jira” chỉ cho phép đọc và dựng preview.
- Chỉ tạo Jira sau xác nhận rõ số lượng + project + task. Writeback Sheet cần xác nhận riêng.
- Không tái dùng task từ yêu cầu trước nếu tester chưa nói rõ đang tiếp tục.

## Chọn luồng

**Chat:** nhận cả JSON có cấu trúc và nội dung chat thô qua stdin với `--source-kind chat --selection-mode all`. Parser Python ưu tiên các heading `Testname/Name/Summary`, `Step`, `Actual Result`, `Expected Result`; không gọi model mặc định. Đủ bốn trường thì kiểm tra để tạo, thiếu trường vẫn dựng preview `NEEDS_CLARIFICATION` nếu còn Testname/Summary hoặc Actual, nhưng tuyệt đối không tự bịa Steps/Expected. Nếu tester paste log, JSON, query, command hoặc stack trace, map vào `Diagnostic Data`; URL ảnh/video/log vẫn map vào `Evidence`.

**Sheet/file:** chỉ đọc tab/range và row/TC được chỉ định. Nếu chưa có lựa chọn, chỉ đọc cột cần thiết để đề xuất candidate, dùng `--selection-mode candidates` và không tạo Jira. Nếu header không map được hoặc cần row override, đọc [rules/input-format.md](rules/input-format.md).

**Create/duplicate/writeback:** chỉ khi được yêu cầu và đọc [rules/jira-integration.md](rules/jira-integration.md). Runtime mặc định dùng Jira Server API v2 và wiki markup theo config. Create bắt buộc search duplicate, xác minh task/project, dùng run manifest và batch limit; lỗi một phần phải resume, không create lại.

## Output gọn

- Preview mặc định là `compact`, tối đa 5 candidate; gồm Summary, Description text, priority, environment, labels cùng nguồn phân loại, evidence, diagnostic excerpt, trạng thái parse chat, states và warnings.
- Dùng `--preview-limit` để xem thêm, tối đa batch limit.
- Chỉ dùng `--output-format full` để kiểm tra Jira payload/wiki markup hoặc debug.
- Không in config, canonical record, full payload hay taxonomy trong preview thường.

Default khi trống: Environment `Testing`, Priority `Major`, label `found-in-qc`. Summary Sheet/file là đề xuất để review và không suy root cause.

Chỉ đọc tài liệu khi cần:

- Thay template: [rules/bug-template.md](rules/bug-template.md)
- Chỉnh quality gate: [rules/quality-rules.md](rules/quality-rules.md)
- Thay label taxonomy: [rules/bug-label-rules.md](rules/bug-label-rules.md)
- Bảo trì engine/schema: [rules/architecture.md](rules/architecture.md)
- Chạy kiểm thử hồi quy/đồng bộ: [rules/test-strategy.md](rules/test-strategy.md)
