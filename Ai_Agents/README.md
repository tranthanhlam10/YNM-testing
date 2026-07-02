# Ai_Agents

Thư mục này chứa prompt/template và tài liệu QA được tạo hoặc phân tích bằng AI agent.

## Cấu trúc

- `templates/`: prompt mẫu theo từng agent hoặc mục đích sử dụng.
  - `codex/`: template dùng với Codex/Codev.
  - `gemini/`: template dùng với Gemini.
  - `mapping/`: template phục vụ audit/mapping data.
- `test_plans/`: test plan theo môi trường và feature/ticket.
  - `local/`: tài liệu lập/chuẩn bị ở local.
  - `testing/`: scope/retest hoặc ghi chú dùng cho môi trường testing.
- `test_cases/`: test case, mapping report, test data note theo feature/ticket.
- `analysis/`: review, re-audit, phân tích issue theo ticket hoặc chủ đề.
- `config/`: script/config phụ trợ cho AI agent.
- `skills/`: nơi để bổ sung skill/wiki workflow nếu cần sau này.

## Quy ước

- Ưu tiên đặt tài liệu theo feature/ticket thay vì để chung một thư mục lớn.
- Giữ tên file gốc nếu file đã được dùng trong prompt, ticket, hoặc report.
- Khi thêm tài liệu mới, chọn nhóm gần nhất trước: `test_plans`, `test_cases`, `analysis`, hoặc `templates`.
