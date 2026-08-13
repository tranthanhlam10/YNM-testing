# Quy tắc gắn label bug YouNet

Nguồn chuẩn: [QUY ƯỚC ĐÁNH LABEL BUG](https://wiki.younetco.com/pages/viewpage.action?pageId=274915579), page ID `274915579`, version `29`, cập nhật `2026-07-15`; bổ sung vận hành được người dùng xác nhận ngày `2026-08-11`: thiếu label dùng `found-in-qc`.

## Thứ tự ưu tiên khi tài liệu có nội dung cũ

1. Môi trường phát hiện bug nằm trong custom field `Found In Environment`; thiếu môi trường dùng `Testing`.
2. Khi nguồn không cung cấp bất kỳ label rõ ràng nào, thêm đúng label mặc định `found-in-qc`. Label này không thay thế custom field `Found In Environment`.
3. Cho phép để trống Root Cause lúc tạo bug khi chưa đủ phân tích theo mục 7.3, nhưng phải cảnh báo và cập nhật trước khi đóng bug.
4. Chỉ dùng label có trong các bảng allowlist của tài liệu này. Mọi label khác phải bị loại khỏi payload và tạo cảnh báo chặn.

## Quy trình phân loại

1. Map môi trường nguồn sang đúng một giá trị `Found In Environment`: `Testing`, `Staging` hoặc `Production`. Nếu nguồn để trống, dùng `Testing`; nếu nguồn có giá trị nhưng không map được thì yêu cầu làm rõ.
2. Chọn tối thiểu một System label từ hành vi quan sát được cho nguồn Sheet/file. Với nguồn chat, chỉ thêm khi có dấu hiệu rõ; thiếu System không chặn.
3. Chọn đúng một Test Type label theo hoạt động test đã bắt được bug. Ưu tiên `TEST TYPE` nguồn; không suy ra từ những loại test có thể bắt được bug.
4. Chỉ thêm Flow label khi source/steps/actual chỉ rõ flow tương ứng. Flow là optional.
5. Chỉ thêm đúng một Root Cause label khi nguồn có field `ROOT CAUSE`, người dùng xác nhận hoặc Dev/Tech Lead đã phân tích. Không suy Root Cause từ System label, summary hay Actual.
6. Chỉ thêm `lc-reopen` khi bug thật sự được mở lại sau khi đã fix/closed.
7. Nếu người dùng không nhập label ở `JIRA LABELS`, `ROOT CAUSE`, `SYSTEM LABELS` hoặc `FLOW LABELS`, thêm `found-in-qc`.
8. Không tự thêm label truy vết `generated-by-qc`, `linked-testcase`, `no-testcase` hoặc label ngoài allowlist.

## Detection Source — label mặc định

| Label | Dùng khi |
| --- | --- |
| `found-in-qc` | Nguồn không cung cấp label rõ ràng; dùng làm label mặc định của bug do QC phát hiện |

## Lifecycle — optional

| Label | Dùng khi |
| --- | --- |
| `lc-reopen` | Bug thật sự được mở lại sau khi đã fix hoặc đóng |

## Root Cause — đúng một label khi đã xác nhận

| Label | Dùng khi |
| --- | --- |
| `rc-requirement` | Requirement thiếu, mơ hồ, mâu thuẫn hoặc thay đổi chưa cập nhật đủ |
| `rc-design-db` | Thiết kế DB chưa phù hợp: schema, index, constraint, migration |
| `rc-design-system` | Thiết kế hệ thống, kiến trúc hoặc luồng tổng thể chưa phù hợp |
| `rc-design-nonfunctional` | Thiếu/sai yêu cầu performance, security hoặc scalability |
| `rc-logic` | Logic xử lý trong code sai |
| `rc-validation` | Thiếu/sai validation đầu vào hoặc đầu ra |
| `rc-data` | Dữ liệu test hoặc dữ liệu thực tế sai/thiếu |
| `rc-config` | Sai cấu hình môi trường, permission hoặc cron |
| `rc-integration` | Lỗi tích hợp service/API hoặc contract |
| `rc-release` | Lỗi build, deploy hoặc release |
| `rc-process` | Thiếu/bỏ qua bước bắt buộc, thay đổi không sync hoặc thiếu điều kiện để test |
| `rc-external-api` | Thay đổi/issue từ nền tảng hoặc external API |
| `rc-infra` | Sự cố hạ tầng |
| `rc-assumption` | Có thể confirm/align nhưng đã tự giả định |
| `rc-document` | Rule có thật nhưng document thiếu, mơ hồ hoặc không truy cập được |

## System — tối thiểu một label

| Label | Dấu hiệu rõ để gắn |
| --- | --- |
| `sys-crawling-auto` | Crawl/scrape tự động hoặc lấy dữ liệu từ nguồn ngoài qua flow chuẩn |
| `sys-crawling-manual` | Crawl được trigger thủ công từ tool/admin UI |
| `sys-crawling-adhoc` | Script/tool tạm thời, debug hoặc one-time crawl |
| `sys-transform` | Transform, mapping hoặc chuẩn hóa dữ liệu |
| `sys-ai` | Model, prompt, inference hoặc scoring AI/ML |
| `sys-frontend` | UI/UX, hiển thị hoặc hành vi phía client |
| `sys-api` | Request/response, API contract, endpoint hoặc timeout |
| `sys-db` | Schema, index, constraint, migration hoặc query DB |
| `sys-security` | Auth, permission, role, security hoặc data exposure |
| `sys-performance` | Slow response, high load, memory hoặc hiệu năng |
| `sys-infra` | Server, network, CI/CD hoặc cloud resource |

Không tự gắn một System label chỉ vì tên module chứa từ khóa rộng; ưu tiên title, steps, expected và actual của bug cụ thể.

## Test Type — đúng một label khi xác định được

| Label | Hoạt động test thực tế |
| --- | --- |
| `test-functional` | Test chức năng theo requirement hoặc user flow |
| `test-regression` | Chạy regression sau thay đổi/release |
| `test-boundary` | Giá trị biên, limit, min/max hoặc edge case |
| `test-negative` | Dữ liệu sai, thiếu hoặc không hợp lệ |
| `test-integration` | Luồng tích hợp giữa hệ thống/service |
| `test-exploratory` | Test tự do dựa trên kinh nghiệm/quan sát |

Nếu nguồn chứa nhiều Test Type trái nhau, không chọn hộ; đánh dấu `NEEDS_CLARIFICATION`.

## Flow — optional

| Label | Dùng khi |
| --- | --- |
| `flow-source-load` | Load source config lỗi hoặc config URL/param/platform sai |
| `flow-source-build` | Build URL/request hoặc mapping param đầu vào sai |
| `flow-auth` | Token/proxy/cookie/credential thiếu, sai hoặc hết hạn |
| `flow-fetch` | Call API fail/timeout hoặc raw response sai format |
| `flow-transform` | Mapping field hoặc xử lý dữ liệu sai |
| `flow-pagination` | Sai `next_page`/`has_more`, miss hoặc duplicate data |
| `flow-pusher` | Insert fail, duplicate hoặc missing data trong DB |
| `flow-updater` | Update fail/sai/thiếu sau crawling |
| `flow-token-proxy-manager` | Service token/proxy không ổn định |

## Rule chất lượng label

- System không xác định được → cảnh báo chặn `missing_system_label` với Sheet/file; cảnh báo không chặn với chat.
- Root Cause chưa có → cảnh báo không chặn `root_cause_pending`; tuyệt đối không thêm `rc-logic` như một default.
- Root Cause có nhiều hơn một hoặc label không thuộc taxonomy → cảnh báo chặn.
- Test Type thiếu → cảnh báo không chặn; có nhiều hơn một → cảnh báo chặn.
- Flow label không thuộc taxonomy → cảnh báo chặn.
- Bất kỳ Jira label nào không thuộc Root Cause, System, Test Type, Flow, Lifecycle hoặc `found-in-qc` → cảnh báo chặn `invalid_jira_label` và không đưa vào payload.
- Environment có nội dung nhưng không map được sang ba giá trị Jira → cảnh báo chặn.
- Environment trống → mặc định `Testing`, không chặn.
- Label trống → mặc định `found-in-qc`, không chặn.
- Preview phải hiển thị label theo nhóm để QC review trước khi tạo Jira.
