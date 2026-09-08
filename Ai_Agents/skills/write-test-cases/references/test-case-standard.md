# Chuẩn test cases cá nhân

Chuẩn này được tổng hợp từ `Ai_Agents/templates/codex/testcase_template_codex_2508.md` và các bộ test cases trong `Ai_Agents/test_cases` tại ngày 25/08/2026.

## Schema bắt buộc

Output phải có chính xác 7 cột, đúng thứ tự:

1. `TEST CASE ID`
2. `MODULE/FEATURE`
3. `TEST NAME`
4. `PRE-CONDITION`
5. `TEST STEPS`
6. `TEST DATA`
7. `EXPECTED RESULT`

Không tự thêm cột. Với Markdown dùng bảng; với CSV quote đúng các cell có dấu phẩy, JSON hoặc xuống dòng.

## Contract từng cột

- **TEST CASE ID:** `TC_<MODULE>_<NNN>`, module viết ASCII uppercase có ý nghĩa, số tăng liên tục trong module và không trùng.
- **MODULE/FEATURE:** tên phạm vi đủ cụ thể để filter/group, không chỉ ghi tên project.
- **TEST NAME:** `[High|Medium|Low] [Positive|Negative|Edge] <hành vi cần kiểm chứng>`. Priority phản ánh business/release risk, không phản ánh độ khó execute.
- **PRE-CONDITION:** trạng thái hệ thống, quyền, config và seed data cần có; chứa ít nhất một ví dụ cụ thể khi setup phụ thuộc dữ liệu.
- **TEST STEPS:** danh sách `1.`, `2.`, `3.` ngắn, action rõ, có bước capture/đối soát evidence khi cần. Không nhét expected result vào steps.
- **TEST DATA:** giá trị thực thi cụ thể. Nếu có nhiều field, dùng một JSON object hợp lệ; nêu boundary pair/set và control record khi cần chứng minh include/exclude.
- **EXPECTED RESULT:** các assertion quan sát được, mỗi ý một dòng/gạch đầu dòng. Kiểm tra UI/API/queue/cache/DB/log chỉ ở layer thuộc scope và có contract; nêu rõ dữ liệu không được thay đổi khi đó là invariant.

Ví dụ hình thức một dòng (chỉ minh họa schema, không phải facts để tái dùng):

| TEST CASE ID | MODULE/FEATURE | TEST NAME | PRE-CONDITION | TEST STEPS | TEST DATA | EXPECTED RESULT |
| --- | --- | --- | --- | --- | --- | --- |
| TC_RULE_001 | Rule lựa chọn dữ liệu | [High] [Edge] Áp dụng đúng giá trị tại boundary | Feature flag test đã bật; có control record hai phía boundary | 1. Seed data.<br>2. Trigger flow.<br>3. Đối soát output và persistence. | `{\"below\":999,\"at\":1000,\"above\":1001}` | - Record tại/qua boundary được xử lý theo AC.<br>- Record dưới boundary bị loại.<br>- Không phát sinh duplicate hoặc side effect ngoài scope. |

## Coverage model

Tạo checklist/traceability nội bộ từ requirement và risk trước khi viết. Bộ case nên xét các nhóm sau khi liên quan:

- Happy path và alternative positive flow.
- Mỗi validation/business rule có negative/control case độc lập.
- Boundary inclusive/exclusive, null/missing/invalid type, empty/single/many/maximum.
- Permission/role/tenant/domain/country isolation.
- State transition, retry, idempotency, timeout, partial failure, restart/recovery.
- Concurrency, ordering, pagination/batch/chunk, date/timezone/month boundary.
- API/payload/data mapping, persistence, cache/queue và observability.
- Regression của luồng cũ, feature flag và backward compatibility.

Không ép tất cả nhóm vào mọi feature. Một case chỉ nên có một failure diagnosis chính.

## Mâu thuẫn và dữ liệu thiếu

- BA/AC là oracle cho expected nghiệp vụ. Nếu technical spec khác BA, viết expected theo BA và thêm `(Need Confirm: <mâu thuẫn>)` trong chính `EXPECTED RESULT`.
- Nếu cả hai nguồn không chốt expected, ghi rõ Need Confirm và tránh bịa giá trị. Có thể tạo case để giữ coverage nhưng phải chỉ ra điều kiện chốt pass/fail.
- Không dùng dữ liệu production nhạy cảm làm test data; dùng fixture/ID giả nhưng hợp lệ theo format.

## Gate ghi Google Sheet

- Phân tích requirement và thiết kế coverage trước. Chỉ yêu cầu link khi đã sẵn sàng ghi và yêu cầu hiện tại chưa có link Sheet đã cấp quyền.
- Link người dùng vừa gửi chỉ cho phép ghi spreadsheet đó trong task hiện tại; không suy ra quyền cho Sheet hoặc task khác.
- Xác định tab từ `gid` khi có. Trước write phải đọc metadata, header và vùng dữ liệu hiện hữu.
- Header phải khớp chính xác 7 cột của schema. Append vào vùng trống kế tiếp; không ghi đè và không tạo Test Case ID trùng.
- Sau write, đọc lại đúng vùng vừa cập nhật để kiểm tra số dòng, 7 cột, ID đầu/cuối và nội dung không bị lệch cột.

## Quality gate trước bàn giao

- Header và mọi row có đúng 7 cột; ID unique và đúng format.
- Mỗi rule/risk trong scope có ít nhất một case hoặc một lý do loại trừ có căn cứ.
- Pre-condition + steps + data đủ để một QA khác execute mà không đoán.
- Test data cụ thể; JSON hợp lệ; boundary có expected rõ.
- Expected result có test oracle, không chỉ ghi “thành công”, “đúng” hoặc “hiển thị đúng”.
- Không assert layer ngoài release scope và không bịa schema/config.
- Các Need Confirm dễ tìm và nêu đúng tác động.
- Markdown render đúng hoặc CSV parse đúng; không còn URL/path/task data của prompt mẫu cũ.
