---
name: logging-bugs-to-jira
description: Creates Jira bug issues from a Google Sheet (batch) or directly from a chat message (single bug), regardless of whether the bug is linked to a planned test case or found outside any test case (exploratory testing, incidental findings). Use this whenever the user asks to sync/push/import bugs from a Google Sheet into Jira, or asks to log/report/create a single bug on the spot ("log bug:", "báo bug này giúp mình"). Always confirm details with the user before actually creating a ticket.
---

# Logging bugs to Jira

## Outcome skill này nhắm tới

| Outcome | Cơ chế đạt được |
|---|---|
| Giảm thời gian log bug | Xử lý hàng loạt khi có sheet; tạo ngay từ chat khi chỉ có 1 bug; project key/issue type chỉ hỏi 1 lần/phiên |
| Mọi tester dùng chung 1 template | Toàn bộ bug — dù đọc từ sheet hay gõ qua chat, dù có testcase hay không — đều dựng theo đúng 1 khuôn description duy nhất (xem bên dưới) |
| Ít bước rườm rà nhưng vẫn đúng yêu cầu | Chỉ có 1 quy trình lõi duy nhất; input đến từ đâu chỉ quyết định **1 bước đầu tiên**, không nhân đôi toàn bộ logic |

**Nguyên tắc quan trọng nhất:** "có testcase hay không" **không phải điều kiện rẽ nhánh quy trình** — nó chỉ là 1 field dữ liệu (Test Case ID có giá trị hay trống), ảnh hưởng đến 1 dòng trong description và 1 label khi tạo issue, không hơn. Một sheet hoàn toàn có thể có dòng vừa có testcase, vừa có dòng không — skill xử lý cả hai như nhau trong cùng 1 lượt, không cần hỏi lại "đây là case nào".

Cái thật sự khác nhau chỉ là **input đến từ đâu**: đọc hàng loạt từ sheet, hay 1 bug gõ tay qua chat. Đó là lý do duy nhất có Bước 0 phân nhánh dưới đây — không liên quan gì đến việc có testcase hay không.

## Chuẩn định dạng mô tả issue (áp dụng cho MỌI bug, không phân biệt nguồn)

```
**Mô tả:** <tóm tắt ngắn hiện tượng>

**Các bước tái hiện:**
1. ...
2. ...

**Kết quả mong đợi:** ...
**Kết quả thực tế:** ...

**Môi trường:** <staging/production/local, browser/OS nếu liên quan>

**Test case liên quan:** <ID nếu có, hoặc "Không gắn với test case nào">
```

Field bắt buộc: Summary (tiêu đề issue), Các bước tái hiện, Kết quả mong đợi/thực tế, Môi trường, Severity. Thiếu field nào thì hỏi lại đúng field đó — không tự bịa, không bỏ trống khuôn, bất kể bug đến từ sheet hay chat.

**Gắn label theo Test Case ID:** có giá trị → `linked-testcase`; trống → `no-testcase` (vẫn hợp lệ, chỉ để lead lọc ra sau này khi review bổ sung test suite).

## Bước 0 — Thu thập dữ liệu đầu vào (điểm khác biệt duy nhất theo nguồn)

**Nếu người dùng đưa link/tên Google Sheet** ("đẩy bug trong sheet lên Jira"):
Hỏi gộp (nếu chưa rõ): tên tab chứa danh sách bug, Jira project key, issue type mặc định. Đọc toàn bộ dòng trong tab, **chỉ lấy dòng có cột "Jira Key" đang trống** (chống tạo trùng). Map cột sheet sang khuôn description theo `references/field-mapping.md`.

**Nếu người dùng mô tả trực tiếp 1 bug trong chat** ("log bug:", "bug này không nằm trong testcase nào"):
Trích xuất field có sẵn trong câu, hỏi gộp 1 lượt cho field còn thiếu (kèm project key/issue type nếu chưa xác định trong phiên).

Nếu không rõ nguồn nào, hỏi 1 câu để xác định thay vì đoán.

## Bước 1 — Xác nhận trước khi tạo issue (bắt buộc, dùng chung cho mọi trường hợp)

Hiện lại nội dung issue theo đúng khuôn description để người dùng xác nhận. Với batch từ sheet: liệt kê danh sách title + priority + số lượng dòng. Không tự ý tạo hàng loạt mà không hỏi trước.

## Bước 2 — Tạo issue trên Jira

Với mỗi bug đã xác nhận: dựng description theo khuôn chung, gọi Jira MCP tool tạo issue (project key, issue type, summary, description, priority, label theo Test Case ID). Nếu 1 dòng lỗi trong batch, **không dừng cả batch** — bỏ qua, ghi chú lỗi, tiếp tục các dòng còn lại.

## Bước 3 — Ghi lại kết quả (chỉ áp dụng nếu nguồn là sheet)

Ghi Jira key vào cột "Jira Key" của đúng dòng tương ứng trong sheet, ngăn dòng đó bị đẩy lại lần sau. Nếu nguồn là chat, bỏ qua bước này — chỉ trả link issue cho người dùng.

## Bước 4 — Báo cáo kết quả

Tóm tắt: số bug tạo thành công (kèm link), số lỗi/skip và lý do, số dòng bỏ qua vì đã có Jira Key từ trước (nếu là batch).

## Gợi ý chủ động (không tự động chạy)

Nếu người dùng hỏi kiểu "gần đây có nhiều bug không nằm trong testcase không" hoặc yêu cầu review, lọc Jira theo label `no-testcase` để gợi ý khu vực có thể đang thiếu test case. Chỉ làm khi được hỏi, không tự động sau mỗi lần tạo issue.

## Lưu ý quan trọng

- Không tạo issue cho bug thiếu field bắt buộc trong khuôn description — báo thiếu gì thay vì tự bịa.
- Nếu sheet có cột "Status"/"Ready to push", chỉ xử lý dòng có giá trị "Yes"/"Ready" (nếu người dùng xác nhận sheet có cơ chế này).
- Không đoán project key/issue type nếu chưa được nói — hỏi 1 lần, dùng lại cho cả phiên.
- Có Google Sheets MCP tool kết nối (chỉ cần khi nguồn là sheet) và Jira MCP tool kết nối (luôn cần). Nếu tool báo lỗi auth, đề xuất kết nối lại qua `suggest_connectors`.
